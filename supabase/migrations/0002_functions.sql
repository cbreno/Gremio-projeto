-- ============================================================================
-- Cantina Tenente Breno — Funções e gatilhos auxiliares
-- Execute DEPOIS de 0001_schema.sql e ANTES de 0003_rls.sql.
-- ============================================================================

-- is_admin(): retorna true se o usuário autenticado tem role = 'admin'.
-- Usada nas políticas RLS. SECURITY DEFINER para poder ler a tabela militares
-- sem cair na própria RLS (evita recursão infinita de política).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.militares
    where id = auth.uid() and role = 'admin'
  );
$$;

-- posto_nome_disponivel(): verificação de unicidade (posto + nome de guerra)
-- ANTES de criar a conta, para dar uma mensagem clara no cadastro e evitar
-- criar um usuário no Auth que depois não conseguiria inserir em militares.
-- Callable por 'anon' (usuário ainda não autenticado durante o cadastro).
create or replace function public.posto_nome_disponivel(p_posto text, p_nome text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.militares
    where posto = p_posto and nome_guerra = p_nome
  );
$$;

grant execute on function public.posto_nome_disponivel(text, text) to anon, authenticated;

-- anexar_comprovante(): permite ao MILITAR registrar a URL do comprovante no
-- próprio pedido PIX SEM poder alterar o status (a RLS de UPDATE em pedidos é
-- exclusiva do admin, para impedir que alguém marque a própria dívida como paga).
-- SECURITY DEFINER, mas valida a posse dentro da função.
create or replace function public.anexar_comprovante(p_pedido uuid, p_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pedidos
     set comprovante_url = p_url
   where id = p_pedido
     and militar_id = auth.uid()      -- só o dono
     and forma_pagamento = 'pix';     -- só pedidos PIX
  if not found then
    raise exception 'Pedido não encontrado ou não pertence ao usuário.';
  end if;
end;
$$;

grant execute on function public.anexar_comprovante(uuid, text) to authenticated;

-- Ao criar/atualizar um pedido, garante a coerência status x forma_pagamento.
-- REGRA: pix -> começa 'aguardando'; prazo -> começa 'pendente'.
-- (A transição para 'pago' é feita depois pelo admin.)
create or replace function public.valida_status_pedido()
returns trigger
language plpgsql
as $$
begin
  if new.forma_pagamento = 'pix' and new.status not in ('aguardando', 'pago') then
    raise exception 'Pedido PIX só pode ter status aguardando ou pago';
  end if;
  if new.forma_pagamento = 'prazo' and new.status not in ('pendente', 'pago') then
    raise exception 'Pedido a prazo só pode ter status pendente ou pago';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_valida_status_pedido on public.pedidos;
create trigger trg_valida_status_pedido
  before insert or update on public.pedidos
  for each row execute function public.valida_status_pedido();
