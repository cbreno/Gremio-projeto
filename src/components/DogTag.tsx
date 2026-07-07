/**
 * Chapa de identificação militar (dog tag): exibe posto + nome de guerra.
 * Elemento de assinatura visual — moldura em latão (gradiente) e textura diagonal.
 */
export function DogTag({
  posto,
  nomeGuerra,
  legenda = "Identificação",
}: {
  posto: string;
  nomeGuerra: string;
  legenda?: string;
}) {
  return (
    // Moldura dourada com gradiente (padding cria a "borda")
    <div className="rounded-2xl bg-latao-grad p-[2px] shadow-latao">
      <div className="relative overflow-hidden rounded-[14px] bg-papel-grad bg-diagonal-latao p-4">
        {/* "Furo" da chapa, à esquerda */}
        <span className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-latao/70 bg-lona shadow-inner" />
        <div className="pl-7">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-latao-escuro">
            {legenda}
          </p>
          <p className="font-titulo text-xl font-extrabold leading-tight tracking-tight text-oliva-escuro">
            <span className="text-latao-escuro">{posto}</span> {nomeGuerra}
          </p>
        </div>
      </div>
    </div>
  );
}
