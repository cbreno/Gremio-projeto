import { Link, useNavigate } from "react-router-dom";
import { GlassLayout } from "../components/GlassLayout";
import { Cabecalho } from "../components/Cabecalho";
import { QtyStepper } from "../components/QtyStepper";
import { useCart } from "../hooks/useCart";
import { moeda } from "../lib/format";

export default function Carrinho() {
  const { itens, total, incrementar, decrementar } = useCart();
  const navigate = useNavigate();

  return (
    <GlassLayout>
      <Cabecalho />

      <h2 className="titulo-marca mt-4 text-2xl">Carrinho</h2>

      {itens.length === 0 ? (
        <div className="superficie mt-4 p-6 text-center text-tinta/70">
          <p>Seu carrinho está vazio.</p>
          <Link to="/" className="btn-secundario mt-4 inline-flex">
            Ir ao catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {itens.map(({ produto, quantidade }) => (
              <div key={produto.id} className="superficie flex items-center gap-3 p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lona/70 text-2xl">
                  {produto.icone}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-titulo font-bold text-oliva-escuro">
                    {produto.nome}
                  </p>
                  {/* Subtotal do item (preço x quantidade) */}
                  <p className="font-mono text-sm text-latao">
                    {moeda(produto.preco * quantidade)}
                  </p>
                </div>
                <QtyStepper
                  quantidade={quantidade}
                  onIncrementar={() => incrementar(produto)}
                  onDecrementar={() => decrementar(produto)}
                />
              </div>
            ))}
          </div>

          <div className="superficie mt-4 flex items-center justify-between p-4">
            <span className="font-titulo font-bold text-oliva-escuro">Total</span>
            <span className="font-mono text-xl font-bold text-oliva-escuro">
              {moeda(total)}
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <Link to="/" className="btn-secundario flex-1">
              Continuar
            </Link>
            <button className="btn-primario flex-1" onClick={() => navigate("/checkout")}>
              Finalizar
            </button>
          </div>
        </>
      )}
    </GlassLayout>
  );
}
