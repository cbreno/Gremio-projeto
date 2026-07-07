/**
 * Chapa de identificação militar (dog tag): exibe posto + nome de guerra.
 * Elemento de assinatura visual — borda em latão e leve textura diagonal.
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
    <div className="superficie relative overflow-hidden bg-diagonal-latao p-4">
      {/* "Furo" da chapa, à esquerda */}
      <span className="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-latao/60 bg-lona/70" />
      <div className="pl-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-latao">
          {legenda}
        </p>
        <p className="font-titulo text-xl font-extrabold leading-tight text-oliva-escuro">
          <span className="text-latao">{posto}</span> {nomeGuerra}
        </p>
      </div>
    </div>
  );
}
