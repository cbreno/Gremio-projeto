-- ============================================================================
-- Cantina Tenente Breno — Esquema do banco (Etapa 2)
-- ============================================================================
-- Execute este arquivo no SQL Editor do Supabase (ou via CLI) ANTES dos demais.
-- ============================================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ─── militares ──────────────────────────────────────────────────────────────
-- O id é o MESMO uuid do usuário no Supabase Auth (auth.users.id).
-- A senha NÃO fica aqui: fica no Supabase Auth com hash gerenciado.
create table if not exists public.militares (
  id          uuid primary key references auth.users (id) on delete cascade,
  posto       text not null,
  nome_guerra text not null,
  telefone    text not null,
  role        text not null default 'militar' check (role in ('militar', 'admin')),
  created_at  timestamptz not null default now(),

  -- REGRA DE NEGÓCIO: a combinação (posto + nome de guerra) é única.
  -- Nomes parecidos porém não idênticos são permitidos (ex.: "Silva" x "Silva Jr").
  constraint militares_posto_nome_unico unique (posto, nome_guerra),

  -- Login é por telefone -> telefone também é único.
  constraint militares_telefone_unico unique (telefone)
);

-- ─── produtos ───────────────────────────────────────────────────────────────
create table if not exists public.produtos (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  preco      numeric(10, 2) not null check (preco >= 0),
  icone      text not null default '📦',           -- emoji por enquanto
  ativo      boolean not null default true,        -- inativo não aparece no catálogo
  created_at timestamptz not null default now()
);

-- ─── pedidos ────────────────────────────────────────────────────────────────
create table if not exists public.pedidos (
  id              uuid primary key default gen_random_uuid(),
  militar_id      uuid not null references public.militares (id) on delete cascade,
  total           numeric(10, 2) not null check (total >= 0),
  forma_pagamento text not null check (forma_pagamento in ('pix', 'prazo')),
  -- PIX começa 'aguardando' (confirmação manual do admin); a prazo começa 'pendente'.
  status          text not null check (status in ('aguardando', 'pendente', 'pago')),
  vencimento      date,                             -- nulo quando for PIX
  comprovante_url text,                             -- anexo opcional do comprovante PIX
  created_at      timestamptz not null default now()
);

create index if not exists pedidos_militar_idx on public.pedidos (militar_id);
create index if not exists pedidos_status_idx  on public.pedidos (status);

-- ─── itens_pedido ───────────────────────────────────────────────────────────
-- Guarda SNAPSHOT do nome e do preço no momento da compra (não muda se o produto mudar).
create table if not exists public.itens_pedido (
  id             uuid primary key default gen_random_uuid(),
  pedido_id      uuid not null references public.pedidos (id) on delete cascade,
  produto_id     uuid references public.produtos (id) on delete set null,
  nome_produto   text not null,                     -- snapshot do nome
  preco_unitario numeric(10, 2) not null,           -- snapshot do preço
  quantidade     integer not null check (quantidade > 0)
);

create index if not exists itens_pedido_pedido_idx on public.itens_pedido (pedido_id);
