import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface OpcoesConfirm {
  titulo: string;
  mensagem?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Se true, o botão de confirmar fica vermelho (ação destrutiva). */
  perigoso?: boolean;
}

type Confirmar = (opcoes: OpcoesConfirm) => Promise<boolean>;

const Ctx = createContext<Confirmar | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opcoes, setOpcoes] = useState<OpcoesConfirm | null>(null);
  const resolverRef = useRef<(v: boolean) => void>();

  const confirmar = useCallback<Confirmar>((op) => {
    setOpcoes(op);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  function responder(valor: boolean) {
    resolverRef.current?.(valor);
    resolverRef.current = undefined;
    setOpcoes(null);
  }

  return (
    <Ctx.Provider value={confirmar}>
      {children}
      {opcoes && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-oliva-escuro/60 p-4 backdrop-blur-sm"
          onClick={() => responder(false)}
        >
          <div
            className="superficie w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg">{opcoes.titulo}</h3>
            {opcoes.mensagem && (
              <p className="mt-2 text-sm text-tinta/75">{opcoes.mensagem}</p>
            )}
            <div className="mt-5 flex gap-2">
              <button onClick={() => responder(false)} className="btn-secundario flex-1">
                {opcoes.textoCancelar ?? "Cancelar"}
              </button>
              <button
                onClick={() => responder(true)}
                className={`flex-1 rounded-xl px-4 py-3 font-titulo font-bold text-papel shadow-botao transition active:scale-[0.98] ${
                  opcoes.perigoso ? "bg-brasa" : "bg-oliva-grad"
                }`}
              >
                {opcoes.textoConfirmar ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConfirm deve ser usado dentro de <ConfirmProvider>.");
  return ctx;
}
