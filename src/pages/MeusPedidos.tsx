import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassLayout } from "../components/GlassLayout";
import { Cabecalho } from "../components/Cabecalho";
import { StatusBadge } from "../components/StatusBadge";
import { supabase } from "../lib/supabase/client";
import { moeda, dataBR } from "../lib/format";
import type { PedidoComRelacionados } from "../types/db";

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState<PedidoComRelacionados[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // RLS limita automaticamente aos pedidos do próprio militar.
    supabase
      .from("pedidos")
      .select("*, itens_pedido(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPedidos((data ?? []) as PedidoComRelacionados[]);
        setCarregando(false);
      });
  }, []);

  // Total a pagar = tudo que ainda não foi pago (a prazo pendente + PIX aguardando).
  const totalAPagar = pedidos
    .filter((p) => p.status !== "pago")
    .reduce((s, p) => s + Number(p.total), 0);

  return (
    <GlassLayout>
      <Cabecalho voltar />

      <div className="mt-4 flex items-center justify-between">
        <h2 className="titulo-marca text-2xl">Meus pedidos</h2>
        <Link
          to="/"
          className="rounded-lg border border-latao/40 bg-papel/80 px-3 py-1.5 font-titulo text-sm font-semibold text-oliva-escuro backdrop-blur-md"
        >
          Catálogo
        </Link>
      </div>

      {/* Resumo do que falta pagar */}
      {totalAPagar > 0 && (
        <div className="superficie mt-4 flex items-center justify-between p-4">
          <span className="font-titulo font-bold text-oliva-escuro">Total a pagar</span>
          <span className="font-mono text-xl font-bold text-brasa">
            {moeda(totalAPagar)}
          </span>
        </div>
      )}

      {carregando && (
        <p className="mt-6 text-center font-mono text-sm text-papel/80">Carregando…</p>
      )}
      {!carregando && pedidos.length === 0 && (
        <div className="superficie mt-4 p-6 text-center text-tinta/70">
          Você ainda não fez pedidos.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {pedidos.map((p) => (
          <div key={p.id} className="superficie p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-tinta/60">
                {dataBR(p.created_at)}
              </span>
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
              <span className="font-titulo text-sm font-bold text-oliva-escuro">
                {p.forma_pagamento === "prazo"
                  ? `Vence ${dataBR(p.vencimento)}`
                  : "PIX"}
              </span>
              <span className="font-mono font-bold">{moeda(p.total)}</span>
            </div>

            {/* PIX ainda aguardando: atalho para reabrir o QR/copia-e-cola */}
            {p.forma_pagamento === "pix" && p.status === "aguardando" && (
              <Link to={`/pedido/${p.id}/pix`} className="btn-secundario mt-3 w-full">
                Ver dados do PIX
              </Link>
            )}
          </div>
        ))}
      </div>
    </GlassLayout>
  );
}
