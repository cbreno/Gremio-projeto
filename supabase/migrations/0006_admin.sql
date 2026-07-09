-- ============================================================================
-- Grêmio Tenente Breno — Painel admin: pago_em, Realtime e reset de senha
-- Execute DEPOIS das migrations anteriores.
-- ============================================================================

-- 1) Data em que o pedido foi marcado como pago (para relatórios dia/mês).
alter table public.pedidos
  add column if not exists pago_em timestamptz;

-- 2) Realtime: permite ao admin ver pedidos novos sem recarregar.
--    Adiciona a tabela à publicação usada pelo Supabase Realtime (idempotente).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pedidos'
  ) then
    alter publication supabase_realtime add table public.pedidos;
  end if;
end $$;

-- 3) Reset de senha pelo admin (o app não usa e-mail, então não há "esqueci senha"
--    por e-mail). Esta função deixa o ADMIN definir uma senha temporária para um
--    militar. SECURITY DEFINER + checagem is_admin() para segurança.
--    Usa o pgcrypto (schema extensions no Supabase) para gerar o hash bcrypt que
--    o Supabase Auth (GoTrue) sabe verificar.
create or replace function public.admin_redefinir_senha(p_militar uuid, p_nova_senha text)
returns void
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem redefinir senhas.';
  end if;
  if p_nova_senha is null or length(p_nova_senha) < 6 then
    raise exception 'A senha deve ter ao menos 6 caracteres.';
  end if;

  update auth.users
     set encrypted_password = crypt(p_nova_senha, gen_salt('bf')),
         updated_at = now()
   where id = p_militar;

  if not found then
    raise exception 'Militar não encontrado.';
  end if;
end;
$$;

grant execute on function public.admin_redefinir_senha(uuid, text) to authenticated;
