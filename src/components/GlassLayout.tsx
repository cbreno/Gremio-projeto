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
      {/* Filtro verde-oliva para a foto não atrapalhar a leitura */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-oliva-escuro/55 backdrop-blur-[2px]"
      />
      {/* Conteúdo */}
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-4">{children}</div>
    </div>
  );
}
