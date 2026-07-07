import type { ReactNode } from "react";

/**
 * Plano de fundo institucional: imagem do helicóptero (fixed, cover) coberta por um
 * leve filtro verde-oliva, com o conteúdo apoiado sobre superfícies de vidro fosco.
 * O caminho da imagem é configurável via VITE_FUNDO_IMAGEM (padrão /helicoptero.jpg).
 */
export function GlassLayout({ children }: { children: ReactNode }) {
  const fundo = import.meta.env.VITE_FUNDO_IMAGEM ?? "/helicoptero.jpg";

  return (
    <div className="relative min-h-[100dvh]">
      {/* Camada da foto — fixa e cobrindo a tela */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${fundo})` }}
      />
      {/* Filtro verde-oliva em gradiente + vinheta para dar profundidade e
          garantir a leitura sobre a foto */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 backdrop-blur-[3px]"
        style={{
          background:
            "linear-gradient(160deg, rgba(51,59,31,0.72) 0%, rgba(51,59,31,0.55) 40%, rgba(32,36,26,0.78) 100%)",
        }}
      />
      {/* Vinheta sutil nas bordas */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, transparent 55%, rgba(32,36,26,0.45) 100%)",
        }}
      />
      {/* Conteúdo */}
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-4">{children}</div>
    </div>
  );
}
