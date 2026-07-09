import { useCallback, useEffect, useState } from "react";
import { GlassLayout } from "../../components/GlassLayout";
import { Cabecalho } from "../../components/Cabecalho";
import { AdminNav } from "../../components/AdminNav";
import { ResumoCards } from "../../components/ResumoCards";
import { StatusBadge } from "../../components/StatusBadge";
import { Comprovante } from "../../components/Comprovante";
import { useConfirm } from "../../hooks/useConfirm";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase/client";
import { moeda, dataBR } from "../../lib/format";
import type { PedidoComRelacionados, StatusPedido } from "../../types/db";

type Filtro = "todos" | StatusPedido;
const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "aguardando", rotulo: "Aguardando" },
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "pago", rotulo: "Pago" },
];

export default function AdminPedidos() {
  const confirmar = useConfirm();
  const toast = useToast();
  const [pedidos, setPedidos] = useState<PedidoComRelacionados[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    // Admin enxerga todos os pedidos (RLS via is_admin) + dados do militar e itens.
    const { data } = await supabase
      .from("pedidos")
      .select("*, itens_pedido(*), militares(posto, nome_guerra, telefone)")
      .order("created_at", { ascending: false });
    setPedidos((data ?? []) as PedidoComRelacionados[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();

    // REALTIME: recarrega a lista quando qualquer pedido é criado/alterado.
    // Ótimo em dias movimentados — o admin vê o pedido novo aparecer sozinho.
    const canal = supabase
      .channel("pedidos-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => carregar(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [carregar]);

  // Confirmar recebimento: PIX 'aguardando' -> 'pago'; a prazo 'pendente' -> 'pago'.
  async function marcarPago(p: PedidoComRelacionados) {
    const ok = await confirmar({
      titulo: p.forma_pagamento === "pix" ? "Confirmar recebimento?" : "Marcar como pago?",
      mensagem: `${p.militares?.posto ?? ""} ${p.militares?.nome_guerra ?? ""} — este pedido será marcado como PAGO. Esta ação não pode ser desfeita.`,
      textoConfirmar: "Sim, marcar pago",
    });
    if (!ok) return;

    const { error } = await supabase
      .from("pedidos")
      .update({ status: "pago", pago_em: new Date().toISOString() })
      .eq("id", p.id);
    if (error) toast.erro("Não foi possível atualizar o pedido.");
    else {
      toast.sucesso("Pedido marcado como pago ✓");
      carregar();
    }
  }

  const filtrados =
    filtro === "todos" ? pedidos : pedidos.filter((p) => p.status === filtro);

  return (
    <GlassLayout>
      <Cabecalho legenda="Administrador" />
      <AdminNav />

      {/* Dashboard de resumo */}
      <ResumoCards pedidos={pedidos} />

      {/* Filtro por status */}
      <div className="mt-4 flex gap-1 overflow-x-auto">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`shrink-0 rounded-full border px-3 py-1 font-titulo text-sm font-semibold ${
              filtro === f.valor
                ? "border-oliva bg-oliva text-papel"
                : "border-papel/40 bg-papel/70 text-oliva-escuro"
            }`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {carregando && (
        <p className="mt-6 text-center font-mono text-sm text-papel/80">Carregando…</p>
      )}
      {!carregando && filtrados.length === 0 && (
        <div className="superficie mt-4 p-6 text-center text-tinta/70">
          Nenhum pedido neste filtro.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {filtrados.map((p) => (
          <div key={p.id} className="superficie p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-titulo font-bold text-oliva-escuro">
                  <span className="text-latao">{p.militares?.posto}</span>{" "}
                  {p.militares?.nome_guerra ?? "—"}
                </p>
                <p className="font-mono text-xs text-tinta/60">{dataBR(p.created_at)}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <ul className="mt-2 space-y-0.5 text-sm">
              {p.itens_pedido.map((it) => (
                <li key={it.id} className="flex justify-between">
                  <span>
                    <span className="font-mono text-latao">{it.quantidade}×</span>{" "}
                    {it.nome_produto}
                  </span>
                  <span className="font-mono">
                    {moeda(it.preco_unitario * it.quantidade)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-latao/20 pt-2">
              <span className="font-mono text-xs uppercase text-tinta/60">
                {p.forma_pagamento === "prazo"
                  ? `Prazo · vence ${dataBR(p.vencimento)}`
                  : "PIX"}
              </span>
              <span className="font-mono font-bold">{moeda(p.total)}</span>
            </div>

            {/* Comprovante anexado pelo militar (imagem/PDF via signed URL) */}
            {p.comprovante_url && <Comprovante caminho={p.comprovante_url} />}

            {p.status !== "pago" && (
              <button
                onClick={() => marcarPago(p)}
                className="btn-primario mt-3 w-full"
              >
                {p.forma_pagamento === "pix"
                  ? "Confirmar recebimento (PIX)"
                  : "Marcar como pago"}
              </button>
            )}
          </div>
        ))}
      </div>
    </GlassLayout>
  );
}
