import { createClient } from "@supabase/supabase-js";

// Remove aspas e espaços que às vezes vêm colados no valor da variável
// (erro comum ao configurar na Vercel: colar a URL entre aspas).
function limpar(valor?: string): string {
  return (valor ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
}

// Confere se a string é mesmo uma URL http(s) válida.
function urlValida(u: string): boolean {
  try {
    const protocolo = new URL(u).protocol;
    return protocolo === "http:" || protocolo === "https:";
  } catch {
    return false;
  }
}

const url = limpar(import.meta.env.VITE_SUPABASE_URL);
const anonKey = limpar(import.meta.env.VITE_SUPABASE_ANON_KEY);

/**
 * Só consideramos configurado se a URL for válida E houver chave anon.
 * Assim, um valor mal digitado mostra a tela de ajuda em vez de derrubar o app.
 */
export const supabaseConfigurado = urlValida(url) && anonKey.length > 0;

// Se a configuração estiver inválida, usa valores neutros só para não quebrar o
// carregamento — main.tsx exibirá "Configuração pendente".
export const supabase = createClient(
  supabaseConfigurado ? url : "http://localhost",
  supabaseConfigurado ? anonKey : "anon-placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  },
);
