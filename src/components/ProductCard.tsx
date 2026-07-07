import type { Produto } from "../types/db";
import { moeda } from "../lib/format";
import { QtyStepper } from "./QtyStepper";

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
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lona/70 text-2xl">
        {produto.icone}
      </div>
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
