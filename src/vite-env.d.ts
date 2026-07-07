/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Chave PIX estática do quartel (BR Code). */
  readonly VITE_PIX_CHAVE: string;
  /** Nome do recebedor no BR Code PIX (máx. 25 caracteres). */
  readonly VITE_PIX_NOME: string;
  /** Cidade do recebedor no BR Code PIX (máx. 15 caracteres). */
  readonly VITE_PIX_CIDADE: string;
  /** Caminho da imagem de fundo (helicóptero) em /public. */
  readonly VITE_FUNDO_IMAGEM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
