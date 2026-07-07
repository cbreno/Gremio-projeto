# Cantina Tenente Breno 🪖

Sistema web (PWA) de vendas da cantina de um quartel. Militares compram produtos
pelo celular; o administrador gerencia produtos, pedidos e cobranças. Mobile-first
e instalável na tela de início (iOS/Android).

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + React Router
- **Backend:** Supabase (PostgreSQL + Auth + Storage) com Row Level Security
- **PWA:** `vite-plugin-pwa` (manifest + service worker)
- **PIX:** geração do "Copia e Cola" (BR Code EMV do Bacen) a partir de uma chave estática
- **Deploy:** Vercel (frontend) + Supabase (dados)

> Não usa nenhum gateway de pagamento pago nem a API oficial do WhatsApp
> (a cobrança é apenas um link `wa.me`).

---

## 1. Pré-requisitos

- Node.js 18+ e npm
- Uma conta no [Supabase](https://supabase.com) (plano gratuito serve)
- (Deploy) Uma conta na [Vercel](https://vercel.com)

## 2. Instalar dependências

```bash
npm install
```

## 3. Configurar o Supabase

1. Crie um projeto novo em https://supabase.com/dashboard.
2. **SQL Editor** → rode os arquivos da pasta [`supabase/migrations`](supabase/migrations)
   **nesta ordem**:
   1. `0001_schema.sql` — tabelas
   2. `0002_functions.sql` — funções/gatilhos (unicidade, comprovante, coerência de status)
   3. `0003_rls.sql` — políticas de segurança (Row Level Security)
   4. `0004_storage.sql` — bucket `comprovantes` e suas políticas
   5. `0005_produto_imagem.sql` — coluna de foto do produto + bucket `produtos`
3. Rode também o seed de produtos: [`supabase/seed.sql`](supabase/seed.sql).
4. **Authentication → Providers → Email:** mantenha o provedor **Email** habilitado e
   **DESABILITE "Confirm email"** (Authentication → Sign In / Providers). Isso é necessário
   porque o login é por **telefone**, e o app cria um e-mail sintético interno
   (`<telefone>@cantina.local`) que não recebe mensagens de confirmação.

> **Nota sobre o SQL Editor da sua IDE:** se você abrir os `.sql` no VS Code e ele
> acusar erros de sintaxe em `create or replace function ... $$`, é apenas o
> validador de **SQL Server** (T-SQL). O código é **PostgreSQL** e roda no Supabase.

## 4. Variáveis de ambiente

Copie o exemplo e preencha com os seus valores (nunca comite o `.env` real):

```bash
cp .env.example .env
```

| Variável | Onde encontrar |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` |
| `VITE_PIX_CHAVE` | Chave PIX estática do quartel que receberá os pagamentos |
| `VITE_PIX_NOME` | Nome do recebedor no BR Code (máx. 25, sem acento) |
| `VITE_PIX_CIDADE` | Cidade do recebedor no BR Code (máx. 15, sem acento) |
| `VITE_FUNDO_IMAGEM` | (opcional) caminho da imagem de fundo em `/public` |

As duas variáveis abaixo são usadas **apenas localmente** pelo script de seed de
usuários e **nunca** vão para o frontend nem para o repositório:

| Variável | Onde encontrar |
| --- | --- |
| `SUPABASE_URL` | mesmo Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` (**secreta**) |

## 5. Criar usuários de teste + pedidos de exemplo

Com o `.env` preenchido (incluindo a `service_role`), rode:

```bash
npm run seed:users
```

Isso cria os acessos de teste e alguns pedidos de exemplo (1 PIX aguardando e
1 a prazo pendente), para que as telas do admin não nasçam vazias.

### 🔑 Acessos de teste

| Papel | Login (telefone) | Senha |
| --- | --- | --- |
| **Administrador** | `61999990001` | `admin123` |
| **Militar** | `61999990002` | `militar123` |

> O login é por **telefone + senha**. Troque essas senhas depois em produção.

## 6. Rodar localmente

```bash
npm run dev
```

Abra o endereço exibido (ex.: http://localhost:5173).

### Como testar o fluxo completo

**Militar** (login `61999990002`):
1. No catálogo, ajuste quantidades (aparecem só produtos **ativos**).
2. Toque na barra flutuante → **Carrinho** → **Finalizar**.
3. Escolha **PIX** ou **A prazo** e **confirme com a senha**.
   - PIX → mostra QR + "Copia e Cola"; anexe um comprovante (opcional).
   - A prazo → registra a dívida com vencimento no **1º dia útil do mês seguinte**.
4. Veja tudo em **Meus pedidos** (com o total a pagar).

**Admin** (login `61999990001`):
1. **Produtos:** crie/edite e **ative/inative** (inativo some do catálogo do militar).
2. **Pedidos:** filtre por status e **confirme o PIX** / **marque a prazo como pago**.
3. **Devedores:** clique em **Cobrar no WhatsApp** (abre o `wa.me` com o texto pronto)
   e em **Marcar pago** quando quitado.

## 7. Instalar como app (PWA)

- **Android/Chrome:** menu → "Instalar app" / "Adicionar à tela inicial".
- **iOS/Safari:** botão Compartilhar → "Adicionar à Tela de Início".

## 8. Imagem de fundo (helicóptero)

Substitua o placeholder [`public/helicoptero.jpg`](public/helicoptero.jpg) pela foto
real do helicóptero (Pantera/HM-1). O caminho é configurável em `VITE_FUNDO_IMAGEM`.
Os ícones do PWA estão em [`public/icons`](public/icons) — troque-os pelo brasão oficial
quando tiver os arquivos definitivos.

## 9. Deploy na Vercel

1. Suba o repositório para o GitHub (o `.gitignore` já protege o `.env`).
2. Na Vercel: **New Project** → importe o repositório.
   - Framework: **Vite** (build `npm run build`, output `dist`).
   - O [`vercel.json`](vercel.json) já faz o *rewrite* de SPA (rotas funcionam ao recarregar).
3. **Settings → Environment Variables:** adicione `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, `VITE_PIX_CHAVE`, `VITE_PIX_NOME`, `VITE_PIX_CIDADE`
   (e, se quiser, `VITE_FUNDO_IMAGEM`). **Não** adicione a `service_role` aqui.
4. Deploy. Em produção o Supabase serve os dados sobre HTTPS.

---

## Estrutura do projeto

```
supabase/migrations/  Migrations SQL versionadas (schema, funções, RLS, storage)
supabase/seed.sql     Seed de produtos
scripts/seed-users.mjs  Cria usuários de teste + pedidos de exemplo (uso local)
src/lib/              supabase (client), pix (BR Code), vencimento, format, pedidos
src/hooks/            useAuth (papéis) e useCart (carrinho)
src/components/       DogTag, GlassLayout, ProductCard, CartBar, StatusBadge, ...
src/pages/            Login, Cadastro, Catalogo, Carrinho, Checkout, PagamentoPix,
                      MeusPedidos e pages/admin (Pedidos, Produtos, Devedores)
```

## Regras de negócio (onde estão no código)

- **Unicidade** `posto + nome de guerra` (e telefone): constraint em
  `0001_schema.sql` + verificação prévia via `posto_nome_disponivel()`
  (`0002_functions.sql`) tratada em `src/hooks/useAuth.tsx`.
- **Confirmação por senha** na finalização: `confirmarSenha()` em
  `src/hooks/useAuth.tsx`, usada em `src/pages/Checkout.tsx`.
- **Vencimento a prazo** = 1º dia útil do mês seguinte: `src/lib/vencimento.ts`.
- **PIX** só vira `pago` por ação do admin: RLS de UPDATE restrita em
  `0003_rls.sql`; o militar só anexa comprovante via `anexar_comprovante()`.
- **Produto inativo** não aparece no catálogo: filtro `ativo = true` em
  `src/pages/Catalogo.tsx`.
