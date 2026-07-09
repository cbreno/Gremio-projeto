import { moeda } from "../lib/format";
import type { PedidoComRelacionados } from "../types/db";

/**
 * Cards de resumo do admin, calculados a partir dos pedidos já carregados
 * (sem consultas extras): recebido hoje/mês, nº aguardando e total a receber.
 */
export function ResumoCards({ pedidos }: { pedidos: PedidoComRelacionados[] }) {
  const agora = new Date();
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const pagos = pedidos.filter((p) => p.status === "pago" && p.pago_em);
  const somaDesde = (limite: Date) =>
    pagos
      .filter((p) => new Date(p.pago_em as string) >= limite)
      .reduce((s, p) => s + Number(p.total), 0);

  const recebidoHoje = somaDesde(inicioDia);
  const recebidoMes = somaDesde(inicioMes);
  const nAguardando = pedidos.filter((p) => p.status === "aguardando").length;
  const aReceber = pedidos
    .filter((p) => p.status === "pendente")
    .reduce((s, p) => s + Number(p.total), 0);

  const cards = [
    { rotulo: "Recebido hoje", valor: moeda(recebidoHoje), destaque: "text-oliva-escuro" },
    { rotulo: "Recebido no mês", valor: moeda(recebidoMes), destaque: "text-oliva-escuro" },
    { rotulo: "Aguardando PIX", valor: String(nAguardando), destaque: "text-latao-escuro" },
    { rotulo: "A receber (fiado)", valor: moeda(aReceber), destaque: "text-brasa" },
  ];

  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {cards.map((c) => (
        <div key={c.rotulo} className="superficie p-3">
          <p className="font-titulo text-xs font-bold uppercase tracking-wide text-tinta/60">
            {c.rotulo}
          </p>
          <p className={`mt-1 font-mono text-xl font-bold ${c.destaque}`}>{c.valor}</p>
        </div>
      ))}
    </div>
  );
}
