import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Produto } from "../types/db";

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

interface CartContexto {
  itens: ItemCarrinho[];
  totalItens: number;
  total: number;
  quantidadeDe: (produtoId: string) => number;
  definirQuantidade: (produto: Produto, quantidade: number) => void;
  incrementar: (produto: Produto) => void;
  decrementar: (produto: Produto) => void;
  limpar: () => void;
}

const Ctx = createContext<CartContexto | undefined>(undefined);
const CHAVE = "cantina-carrinho";

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>(() => {
    // Persiste o carrinho no dispositivo (útil no celular entre navegações).
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? (JSON.parse(bruto) as ItemCarrinho[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
  }, [itens]);

  function definirQuantidade(produto: Produto, quantidade: number) {
    setItens((atual) => {
      const outros = atual.filter((i) => i.produto.id !== produto.id);
      if (quantidade <= 0) return outros;
      return [...outros, { produto, quantidade }];
    });
  }

  function quantidadeDe(produtoId: string) {
    return itens.find((i) => i.produto.id === produtoId)?.quantidade ?? 0;
  }

  const incrementar = (produto: Produto) =>
    definirQuantidade(produto, quantidadeDe(produto.id) + 1);
  const decrementar = (produto: Produto) =>
    definirQuantidade(produto, quantidadeDe(produto.id) - 1);

  const { totalItens, total } = useMemo(() => {
    return itens.reduce(
      (acc, i) => ({
        totalItens: acc.totalItens + i.quantidade,
        total: acc.total + i.quantidade * i.produto.preco,
      }),
      { totalItens: 0, total: 0 },
    );
  }, [itens]);

  const valor: CartContexto = {
    itens,
    totalItens,
    total,
    quantidadeDe,
    definirQuantidade,
    incrementar,
    decrementar,
    limpar: () => setItens([]),
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>.");
  return ctx;
}
