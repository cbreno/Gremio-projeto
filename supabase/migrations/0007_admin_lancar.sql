-- ============================================================================
-- Grêmio Tenente Breno — Lançamento de pedido pelo admin
-- Execute DEPOIS das migrations anteriores.
--
-- Permite que o ADMIN crie um pedido (e seus itens) atribuído a OUTRO militar
-- (venda no balcão). O militar comum continua só podendo criar para si mesmo.
-- ============================================================================

-- Pedidos: militar cria para si; admin cria para qualquer um.
drop policy if exists pedidos_insert on public.pedidos;
create policy pedidos_insert on public.pedidos
  for insert to authenticated
  with check (militar_id = auth.uid() or public.is_admin());

-- Itens: permitido se o pedido pai é do próprio militar OU se quem insere é admin.
drop policy if exists itens_insert on public.itens_pedido;
create policy itens_insert on public.itens_pedido
  for insert to authenticated
  with check (
    exists (
      select 1 from public.pedidos p
      where p.id = itens_pedido.pedido_id
        and (p.militar_id = auth.uid() or public.is_admin())
    )
  );
