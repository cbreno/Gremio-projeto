import type { Produto } from "../types/db";
import { moeda } from "../lib/format";
import { QtyStepper } from "./QtyStepper";
import { ProdutoThumb } from "./ProdutoThumb";

// Item do catálogo: ícone (emoji), nome, preço e stepper de quantidade.
export function ProductCard({
  produto,
  quantidade,
  onIncrementar,
  onDecrementar,
}: {
  produto: Produto;
  quantidade: number;
  onIncrementar: () => void;
  onDecrementar: () => void;
}) {
  return (
    <div className="superficie flex items-center gap-3 p-3">
      <ProdutoThumb
        imagemUrl={produto.imagem_url}
        icone={produto.icone}
        nome={produto.nome}
        className="h-14 w-14 text-2xl"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-titulo font-bold text-oliva-escuro">{produto.nome}</p>
        <p className="font-mono text-sm text-latao">{moeda(produto.preco)}</p>
      </div>
      <QtyStepper
        quantidade={quantidade}
        onIncrementar={onIncrementar}
        onDecrementar={onDecrementar}
      />
    </div>
  );
}
