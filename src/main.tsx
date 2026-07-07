import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { supabaseConfigurado } from "./lib/supabase/client";
import "./index.css";

// Tela de ajuda quando o app é publicado sem as variáveis do Supabase.
// Evita a "página em branco" e explica exatamente o que configurar.
function ConfiguracaoPendente() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl">Configuração pendente</h1>
      <p className="text-tinta/80">
        O aplicativo subiu, mas não encontrou as chaves do Supabase. Defina as
        variáveis de ambiente e <strong>publique novamente</strong> (redeploy):
      </p>
      <ul className="superficie space-y-1 p-4 font-mono text-sm">
        <li>VITE_SUPABASE_URL</li>
        <li>VITE_SUPABASE_ANON_KEY</li>
      </ul>
      <p className="text-sm text-tinta/70">
        Na Vercel: <strong>Settings → Environment Variables</strong>. Depois vá em{" "}
        <strong>Deployments → ⋯ → Redeploy</strong>. As variáveis precisam existir no
        momento do build.
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {supabaseConfigurado ? (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    ) : (
      <ConfiguracaoPendente />
    )}
  </React.StrictMode>,
);
