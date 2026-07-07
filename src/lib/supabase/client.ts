import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Indica se as variáveis do Supabase foram configuradas no build.
 * Usado em main.tsx para mostrar uma tela de ajuda em vez de página em branco.
 */
export const supabaseConfigurado = Boolean(url && anonKey);

// Cria o cliente. Se faltar configuração, usa valores neutros só para não quebrar
// o carregamento — o app exibirá a tela de "configuração pendente".
export const supabase = createClient(url ?? "http://localhost", anonKey ?? "anon", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
