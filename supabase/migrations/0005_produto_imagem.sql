-- ============================================================================
-- Cantina Tenente Breno — Foto do produto
-- Execute DEPOIS das migrations anteriores.
-- ============================================================================

-- Coluna opcional com a URL pública da foto do produto (emoji continua como reserva).
alter table public.produtos
  add column if not exists imagem_url text;

-- Bucket PÚBLICO para as fotos dos produtos (não são dados sensíveis; leitura livre).
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

-- Escrita (upload/editar/excluir foto) apenas para admin.
create policy produtos_img_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'produtos' and public.is_admin())
  with check (bucket_id = 'produtos' and public.is_admin());

-- Leitura pública das fotos (bucket público). Mantém coerência nas políticas.
create policy produtos_img_public_read on storage.objects
  for select to public
  using (bucket_id = 'produtos');
