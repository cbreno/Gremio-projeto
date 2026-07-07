import type { StatusPedido } from "../types/db";

// Badges de status coloridas (aguardando PIX, pendente, pago, ativo, inativo).
const ESTILOS: Record<string, { texto: string; classe: string }> = {
  aguardando: { texto: "Aguardando PIX", classe: "bg-latao/20 text-latao border-latao/40" },
  pendente: { texto: "Pendente", classe: "bg-red-100 text-red-800 border-red-300" },
  pago: { texto: "Pago", classe: "bg-oliva/15 text-oliva-escuro border-oliva/40" },
  ativo: { texto: "Ativo", classe: "bg-oliva/15 text-oliva-escuro border-oliva/40" },
  inativo: { texto: "Inativo", classe: "bg-tinta/10 text-tinta/60 border-tinta/20" },
};

export function StatusBadge({ status }: { status: StatusPedido | "ativo" | "inativo" }) {
  const e = ESTILOS[status] ?? ESTILOS.pendente;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium ${e.classe}`}
    >
      {e.texto}
    </span>
  );
}
