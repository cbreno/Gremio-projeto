// Seletor de quantidade (+/−). Não desce abaixo de 0.
export function QtyStepper({
  quantidade,
  onIncrementar,
  onDecrementar,
}: {
  quantidade: number;
  onIncrementar: () => void;
  onDecrementar: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrementar}
        disabled={quantidade === 0}
        aria-label="Diminuir"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-oliva/40 bg-papel font-titulo text-lg font-bold text-oliva-escuro active:scale-95 disabled:opacity-30"
      >
        −
      </button>
      <span className="w-6 text-center font-mono text-base font-medium tabular-nums">
        {quantidade}
      </span>
      <button
        type="button"
        onClick={onIncrementar}
        aria-label="Aumentar"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-oliva font-titulo text-lg font-bold text-papel active:scale-95"
      >
        +
      </button>
    </div>
  );
}
