/**
 * Miniatura do produto: mostra a foto (imagem_url) quando existe,
 * senão cai no emoji (icone). Reutilizada no catálogo, carrinho e admin.
 */
export function ProdutoThumb({
  imagemUrl,
  icone,
  nome,
  className = "h-12 w-12 text-2xl",
}: {
  imagemUrl: string | null;
  icone: string;
  nome?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-lona/70 ${className}`}
    >
      {imagemUrl ? (
        <img
          src={imagemUrl}
          alt={nome ?? "Produto"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span>{icone}</span>
      )}
    </div>
  );
}
