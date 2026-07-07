-- ============================================================================
-- Cantina Tenente Breno — Seed de PRODUTOS
-- Execute DEPOIS das migrations. Os usuários de teste (admin/militar) e os
-- pedidos de exemplo são criados pelo script  npm run seed:users  (precisa da
-- service_role key, ver README), porque dependem do Supabase Auth.
--
-- UUIDs fixos abaixo para que o script de seed possa referenciá-los nos pedidos.
-- ============================================================================

insert into public.produtos (id, nome, preco, icone, ativo) values
  ('11111111-1111-1111-1111-111111111101', 'Refrigerante Lata', 5.00,  '🥤', true),
  ('11111111-1111-1111-1111-111111111102', 'Água Mineral',      3.00,  '💧', true),
  ('11111111-1111-1111-1111-111111111103', 'Salgado',           7.50,  '🥟', true),
  ('11111111-1111-1111-1111-111111111104', 'Café',              2.50,  '☕', true),
  ('11111111-1111-1111-1111-111111111105', 'Barra de Cereal',   4.00,  '🍫', true),
  ('11111111-1111-1111-1111-111111111106', 'Energético (esgotado)', 9.00, '⚡', false) -- inativo
on conflict (id) do nothing;
