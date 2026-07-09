import { useEffect, useMemo, useState } from "react";
import { GlassLayout } from "../../components/GlassLayout";
import { Cabecalho } from "../../components/Cabecalho";
import { AdminNav } from "../../components/AdminNav";
import { QtyStepper } from "../../components/QtyStepper";
import { ProdutoThumb } from "../../components/ProdutoThumb";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase/client";
import { criarPedido } from "../../lib/pedidos";
import { moeda } from "../../lib/format";
import type { Militar, Produto } from "../../types/db";

type Modo = "fiado" | "pix" | "pago";
const MODOS: { valor: Modo; rotulo: string }[] = [
  { valor: "fiado", rotulo: "A prazo (fiado)" },
  { valor: "pago", rotulo: "Pago (à vista)" },
  { valor: "pix", rotulo: "PIX (aguardar)" },
];

export default function AdminLancar() {
  const toast = useToast();

  const [militares, setMilitares] = useState<Militar[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [militarId, setMilitarId] = useState<string | null>(null);
  const [qtd, setQtd] = useState<Record<string, number>>({});
  const [modo, setModo] = useState<Modo>("fiado");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // Militares para escolher (posto + nome de guerra) e produtos ativos para vender.
    supabase
      .from("militares")
      .select("*")
      .order("nome_guerra")
      .then(({ data }) => setMilitares((data ?? []) as Militar[]));
    supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("nome")
      .then(({ data }) => setProdutos((data ?? []) as Produto[]));
  }, []);

  const militaresFiltrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return militares;
    return militares.filter((m) =>
      `${m.posto} ${m.nome_guerra}`.toLowerCase().includes(t),
    );
  }, [busca, militares]);

  const militarSel = militares.find((m) => m.id === militarId) ?? null;

  const itens = useMemo(
    () =>
      produtos
        .filter((p) => (qtd[p.id] ?? 0) > 0)
        .map((p) => ({ produto: p, quantidade: qtd[p.id] })),
    [produtos, qtd],
  );
  const total = itens.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);

  const inc = (id: string) => setQtd((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 }));
  const dec = (id: string) =>
    setQtd((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) - 1) }));

  async function lancar() {
    if (!militarId) {
      toast.erro("Escolha o militar.");
      return;
    }
    if (itens.length === 0) {
      toast.erro("Adicione ao menos um item.");
      return;
    }
    setEnviando(true);
    try {
      // fiado -> prazo/pendente ; pago -> à vista (pago) ; pix -> pix/aguardando
      const forma = modo === "fiado" ? "prazo" : "pix";
      const pago = modo === "pago";
      await criarPedido(militarId, itens, forma, { pago });

      toast.sucesso(`Pedido lançado para ${militarSel?.nome_guerra} ✓`);
      setQtd({});
      setMilitarId(null);
      setBusca("");
      setModo("fiado");
    } catch (e) {
      toast.erro(e instanceof Error ? e.message : "Falha ao lançar o pedido.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <GlassLayout>
      <Cabecalho voltar legenda="Administrador" />
      <AdminNav />

      <h2 className="titulo-marca mt-4 text-2xl">Lançar pedido</h2>

      {/* 1) Militar */}
      <div className="superficie mt-4 p-4">
        <p className="rotulo">Militar (posto + nome de guerra)</p>
        {militarSel ? (
          <div className="flex items-center justify-between rounded-xl bg-lona/50 p-3">
            <span className="font-titulo font-bold text-oliva-escuro">
              <span className="text-latao-escuro">{militarSel.posto}</span>{" "}
              {militarSel.nome_guerra}
            </span>
            <button
              onClick={() => setMilitarId(null)}
              className="font-titulo text-xs font-semibold text-brasa"
            >
              Trocar
            </button>
          </div>
        ) : (
          <>
            <input
              className="campo"
              placeholder="Buscar por posto ou nome…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
              {militaresFiltrados.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMilitarId(m.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-latao/25 bg-papel px-3 py-2 text-left active:scale-[0.99]"
                >
                  <span className="font-titulo font-semibold text-oliva-escuro">
                    <span className="text-latao-escuro">{m.posto}</span> {m.nome_guerra}
                  </span>
                  <span className="font-mono text-xs text-tinta/50">{m.telefone}</span>
                </button>
              ))}
              {militaresFiltrados.length === 0 && (
                <p className="py-3 text-center text-sm text-tinta/60">
                  Nenhum militar encontrado.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* 2) Itens */}
      <div className="mt-4 space-y-2">
        {produtos.map((p) => (
          <div key={p.id} className="superficie flex items-center gap-3 p-3">
            <ProdutoThumb
              imagemUrl={p.imagem_url}
              icone={p.icone}
              nome={p.nome}
              className="h-12 w-12 text-2xl"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-titulo font-bold text-oliva-escuro">{p.nome}</p>
              <p className="font-mono text-sm text-latao">{moeda(p.preco)}</p>
            </div>
            <QtyStepper
              quantidade={qtd[p.id] ?? 0}
              onIncrementar={() => inc(p.id)}
              onDecrementar={() => dec(p.id)}
            />
          </div>
        ))}
      </div>

      {/* 3) Pagamento + total */}
      <div className="superficie mt-4 space-y-3 p-4">
        <div>
          <p className="rotulo">Forma de pagamento</p>
          <div className="grid grid-cols-3 gap-2">
            {MODOS.map((m) => (
              <button
                key={m.valor}
                onClick={() => setModo(m.valor)}
                className={`rounded-xl border px-2 py-2 font-titulo text-xs font-semibold transition ${
                  modo === m.valor
                    ? "border-oliva bg-oliva text-papel"
                    : "border-oliva/30 bg-papel text-oliva-escuro"
                }`}
              >
                {m.rotulo}
              </button>
            ))}
          </div>
          {modo === "fiado" && (
            <p className="mt-2 text-xs text-tinta/60">
              Registra a dívida no perfil do militar (vence no 1º dia útil do mês seguinte).
            </p>
          )}
          {modo === "pago" && (
            <p className="mt-2 text-xs text-tinta/60">
              Marca como pago na hora (entra no “recebido hoje”).
            </p>
          )}
          {modo === "pix" && (
            <p className="mt-2 text-xs text-tinta/60">
              Fica aguardando você confirmar o recebimento na aba Pedidos.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-latao/20 pt-3">
          <span className="font-titulo font-bold text-oliva-escuro">Total</span>
          <span className="font-mono text-xl font-bold text-oliva-escuro">
            {moeda(total)}
          </span>
        </div>

        <button className="btn-primario w-full" onClick={lancar} disabled={enviando}>
          {enviando ? "Lançando…" : "Lançar pedido"}
        </button>
      </div>
    </GlassLayout>
  );
}
