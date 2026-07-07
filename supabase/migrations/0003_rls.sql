-- ============================================================================
-- Cantina Tenente Breno — Row Level Security (RLS)
-- Execute DEPOIS de 0001_schema.sql e 0002_functions.sql.
--
-- Princípios:
--   • militar enxerga/gerencia apenas os PRÓPRIOS dados;
--   • admin enxerga/gerencia TUDO (via public.is_admin());
--   • produtos: leitura por qualquer autenticado, escrita só admin;
--   • mudança de status de pedido (PIX->pago, prazo->pago) é EXCLUSIVA do admin.
-- ============================================================================

alter table public.militares    enable row level security;
alter table public.produtos     enable row level security;
alter table public.pedidos      enable row level security;
alter table public.itens_pedido enable row level security;

-- ─── militares ──────────────────────────────────────────────────────────────
-- Ler o próprio cadastro; admin lê todos.
create policy militares_select on public.militares
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- Inserir apenas o próprio cadastro (id = uuid do Auth) durante o registro.
create policy militares_insert on public.militares
  for insert to authenticated
  with check (id = auth.uid());

-- Atualizar o próprio cadastro; admin atualiza qualquer um (ex.: promover a admin).
create policy militares_update on public.militares
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ─── produtos ───────────────────────────────────────────────────────────────
-- Qualquer autenticado lê (o filtro de "ativo" no catálogo é feito na query do app).
create policy produtos_select on public.produtos
  for select to authenticated
  using (true);

-- Escrita (criar/editar/ativar/inativar/excluir) somente admin.
create policy produtos_admin_write on public.produtos
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── pedidos ────────────────────────────────────────────────────────────────
-- Militar vê os próprios pedidos; admin vê todos.
create policy pedidos_select on public.pedidos
  for select to authenticated
  using (militar_id = auth.uid() or public.is_admin());

-- Militar cria pedido para si mesmo.
create policy pedidos_insert on public.pedidos
  for insert to authenticated
  with check (militar_id = auth.uid());

-- ATENÇÃO: apenas o admin altera pedidos (confirmar PIX / marcar como pago).
-- Isso impede que um militar marque a própria dívida como 'pago'.
create policy pedidos_update_admin on public.pedidos
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── itens_pedido ───────────────────────────────────────────────────────────
-- Vê itens de pedidos que pode ver (próprios ou, se admin, todos).
create policy itens_select on public.itens_pedido
  for select to authenticated
  using (
    exists (
      select 1 from public.pedidos p
      where p.id = itens_pedido.pedido_id
        and (p.militar_id = auth.uid() or public.is_admin())
    )
  );

-- Insere itens somente em pedidos do próprio militar.
create policy itens_insert on public.itens_pedido
  for insert to authenticated
  with check (
    exists (
      select 1 from public.pedidos p
      where p.id = itens_pedido.pedido_id
        and p.militar_id = auth.uid()
    )
  );
