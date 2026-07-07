-- ============================================================================
-- Cantina Tenente Breno — Storage: bucket de comprovantes PIX
-- Execute DEPOIS das migrations anteriores.
--
-- Convenção de caminho dos arquivos: <auth.uid()>/<pedido_id>.<ext>
-- Assim a primeira "pasta" do objeto é o dono, o que as políticas usam abaixo.
-- ============================================================================

-- Cria o bucket privado 'comprovantes' (idempotente).
insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', false)
on conflict (id) do nothing;

-- Militar envia comprovante apenas na própria "pasta".
create policy comprovantes_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'comprovantes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Militar lê os próprios comprovantes; admin lê todos.
create policy comprovantes_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'comprovantes'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
