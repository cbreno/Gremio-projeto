import type { StatusPedido } from "../types/db";

// Badges de status coloridas (aguardando PIX, pendente, pago, ativo, inativo).
const ESTILOS: Record<string, { texto: string; classe: string }> = {
  aguardando: {
    texto: "Aguardando PIX",
    classe: "bg-latao/15 text-latao-escuro border-latao/50",
  },
  pendente: { texto: "Pendente", classe: "bg-brasa/12 text-brasa border-brasa/40" },
  pago: { texto: "Pago", classe: "bg-oliva/15 text-oliva-escuro border-oliva/45" },
  ativo: { texto: "Ativo", classe: "bg-oliva/15 text-oliva-escuro border-oliva/45" },
  inativo: { texto: "Inativo", classe: "bg-tinta/10 text-tinta/60 border-tinta/20" },
};

export function StatusBadge({ status }: { status: StatusPedido | "ativo" | "inativo" }) {
  const e = ESTILOS[status] ?? ESTILOS.pendente;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${e.classe}`}
    >
      {e.texto}
    </span>
  );
}
