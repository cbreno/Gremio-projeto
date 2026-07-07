import { useCallback, useEffect, useState } from "react";
import { GlassLayout } from "../../components/GlassLayout";
import { Cabecalho } from "../../components/Cabecalho";
import { AdminNav } from "../../components/AdminNav";
import { supabase } from "../../lib/supabase/client";
import { moeda, dataBR, apenasDigitos } from "../../lib/format";
import type { PedidoComRelacionados } from "../../types/db";

// Monta o link wa.me com a mensagem de cobrança pré-preenchida (só link, sem API oficial).
function linkCobranca(p: PedidoComRelacionados): string {
  let fone = apenasDigitos(p.militares?.telefone ?? "");
  if (fone.length <= 11) fone = "55" + fone; // prefixo Brasil se ausente
  const texto =
    `Bom dia, ${p.militares?.posto ?? ""} ${p.militares?.nome_guerra ?? ""}! ` +
    `Passando para lembrar da pendência na Cantina Tenente Breno no valor de ${moeda(
      Number(p.total),
    )}, com vencimento em ${dataBR(p.vencimento)}. ` +
    `Pode acertar via PIX quando puder. Obrigado!`;
  return `https://wa.me/${fone}?text=${encodeURIComponent(texto)}`;
}

export default function AdminDevedores() {
  const [devedores, setDevedores] = useState<PedidoComRelacionados[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    // Somente pedidos a prazo ainda pendentes.
    const { data } = await supabase
      .from("pedidos")
      .select("*, militares(posto, nome_guerra, telefone)")
      .eq("forma_pagamento", "prazo")
      .eq("status", "pendente")
      .order("vencimento", { ascending: true });
    setDevedores((data ?? []) as PedidoComRelacionados[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function marcarPago(id: string) {
    await supabase.from("pedidos").update({ status: "pago" }).eq("id", id);
    carregar();
  }

  const totalDevido = devedores.reduce((s, p) => s + Number(p.total), 0);

  return (
    <GlassLayout>
      <Cabecalho legenda="Administrador" />
      <AdminNav />

      <div className="superficie mt-4 flex items-center justify-between p-4">
        <span className="font-titulo font-bold text-oliva-escuro">Total a receber</span>
        <span className="font-mono text-xl font-bold text-brasa">
          {moeda(totalDevido)}
        </span>
      </div>

      {carregando && (
        <p className="mt-6 text-center font-mono text-sm text-papel/80">Carregando…</p>
      )}
      {!carregando && devedores.length === 0 && (
        <div className="superficie mt-4 p-6 text-center text-tinta/70">
          Nenhum devedor pendente. 🎉
        </div>
      )}

      <div className="mt-4 space-y-3">
        {devedores.map((p) => (
          <div key={p.id} className="superficie p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-titulo font-bold text-oliva-escuro">
                  <span className="text-latao">{p.militares?.posto}</span>{" "}
                  {p.militares?.nome_guerra}
                </p>
                <p className="font-mono text-xs text-tinta/60">
                  Vence {dataBR(p.vencimento)}
                </p>
              </div>
              <span className="font-mono text-lg font-bold text-brasa">
                {moeda(p.total)}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              {/* Abre o WhatsApp já com o texto de cobrança pronto */}
              <a
                href={linkCobranca(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secundario flex-1"
              >
                Cobrar no WhatsApp
              </a>
              <button onClick={() => marcarPago(p.id)} className="btn-primario flex-1">
                Marcar pago
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassLayout>
  );
}
