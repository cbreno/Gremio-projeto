import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { moeda } from "../lib/format";

/**
 * Barra flutuante do carrinho, fixa na base da tela. Mostra quantidade e total
 * e leva ao carrinho. Some quando o carrinho está vazio.
 */
export function CartBar() {
  const { totalItens, total } = useCart();
  const navigate = useNavigate();

  if (totalItens === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2">
      <button
        onClick={() => navigate("/carrinho")}
        className="mx-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-oliva-grad px-5 py-4 text-papel shadow-botao ring-1 ring-latao/40 active:scale-[0.99]"
      >
        <span className="flex items-center gap-2 font-titulo font-bold">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-latao-grad px-1.5 font-mono text-sm text-oliva-escuro">
            {totalItens}
          </span>
          Ver carrinho
        </span>
        <span className="font-mono text-lg font-bold">{moeda(total)}</span>
      </button>
    </div>
  );
}
