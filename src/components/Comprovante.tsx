import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

/**
 * Exibe o comprovante PIX anexado pelo militar (visível só para o admin).
 * O bucket 'comprovantes' é PRIVADO, então geramos uma "signed URL" temporária
 * a partir do caminho salvo em pedidos.comprovante_url.
 */
export function Comprovante({ caminho }: { caminho: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  const ehImagem = /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(caminho);

  useEffect(() => {
    let ativo = true;
    // Link válido por 1 hora — suficiente para conferir na hora.
    supabase.storage
      .from("comprovantes")
      .createSignedUrl(caminho, 3600)
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error || !data) setErro(true);
        else setUrl(data.signedUrl);
      });
    return () => {
      ativo = false;
    };
  }, [caminho]);

  if (erro) {
    return (
      <p className="mt-2 font-mono text-xs text-brasa">
        Não foi possível carregar o comprovante.
      </p>
    );
  }

  if (!url) {
    return (
      <p className="mt-2 font-mono text-xs text-tinta/60">Carregando comprovante…</p>
    );
  }

  return (
    <div className="mt-3">
      <p className="rotulo">Comprovante anexado</p>
      {ehImagem ? (
        // Miniatura clicável — abre a imagem em tamanho real em nova aba.
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt="Comprovante PIX"
            className="max-h-56 w-full rounded-xl border border-latao/40 object-contain bg-lona/40"
          />
        </a>
      ) : (
        // PDF ou outro formato — abre em nova aba.
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secundario w-full"
        >
          Abrir comprovante (arquivo)
        </a>
      )}
    </div>
  );
}
