import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { GlassLayout } from "../components/GlassLayout";
import { Cabecalho } from "../components/Cabecalho";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { criarPedido } from "../lib/pedidos";
import { primeiroDiaUtilMesSeguinte } from "../lib/vencimento";
import { moeda, dataBR } from "../lib/format";
import type { FormaPagamento } from "../types/db";

export default function Checkout() {
  const { militar, confirmarSenha } = useAuth();
  const { itens, total, limpar } = useCart();
  const navigate = useNavigate();

  const [forma, setForma] = useState<FormaPagamento>("pix");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Carrinho vazio: não há o que finalizar.
  if (itens.length === 0) return <Navigate to="/" replace />;

  const vencimentoPrevisto = primeiroDiaUtilMesSeguinte();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!militar) return;
    setErro("");
    setEnviando(true);
    try {
      // REGRA: toda finalização exige confirmação por senha (assinatura do pedido).
      const ok = await confirmarSenha(senha);
      if (!ok) {
        setErro("Senha incorreta.");
        return;
      }

      const pedidoId = await criarPedido(militar.id, itens, forma);
      limpar();

      // PIX -> tela de pagamento; a prazo -> meus pedidos (dívida registrada).
      if (forma === "pix") navigate(`/pedido/${pedidoId}/pix`, { replace: true });
      else navigate("/meus-pedidos", { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao finalizar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <GlassLayout>
      <Cabecalho />
      <h2 className="titulo-marca mt-4 text-2xl">Finalizar compra</h2>

      {/* Conferência dos itens */}
      <div className="superficie mt-4 divide-y divide-latao/20 p-4">
        {itens.map(({ produto, quantidade }) => (
          <div key={produto.id} className="flex items-center justify-between py-2 text-sm">
            <span className="font-corpo">
              <span className="font-mono text-latao">{quantidade}×</span> {produto.nome}
            </span>
            <span className="font-mono">{moeda(produto.preco * quantidade)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-3 font-titulo font-bold text-oliva-escuro">
          <span>Total</span>
          <span className="font-mono text-lg">{moeda(total)}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="superficie mt-4 space-y-4 p-4">
        {/* Forma de pagamento */}
        <div>
          <span className="rotulo">Forma de pagamento</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForma("pix")}
              className={`rounded-xl border px-3 py-3 font-titulo font-semibold transition ${
                forma === "pix"
                  ? "border-oliva bg-oliva text-papel"
                  : "border-oliva/30 bg-papel text-oliva-escuro"
              }`}
            >
              PIX (à vista)
            </button>
            <button
              type="button"
              onClick={() => setForma("prazo")}
              className={`rounded-xl border px-3 py-3 font-titulo font-semibold transition ${
                forma === "prazo"
                  ? "border-oliva bg-oliva text-papel"
                  : "border-oliva/30 bg-papel text-oliva-escuro"
              }`}
            >
              A prazo (fiado)
            </button>
          </div>
          {forma === "prazo" && (
            <p className="mt-2 rounded-lg bg-lona/60 p-2 text-xs text-tinta/80">
              Vencimento em <strong>{dataBR(vencimentoPrevisto)}</strong> (1º dia útil do
              mês seguinte).
            </p>
          )}
        </div>

        {/* Confirmação por senha */}
        <div>
          <label className="rotulo" htmlFor="senha">
            Confirme com sua senha
          </label>
          <input
            id="senha"
            type="password"
            className="campo"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}

        <button className="btn-primario w-full" disabled={enviando}>
          {enviando
            ? "Processando…"
            : forma === "pix"
              ? `Pagar ${moeda(total)} no PIX`
              : `Confirmar dívida de ${moeda(total)}`}
        </button>
      </form>
    </GlassLayout>
  );
}
