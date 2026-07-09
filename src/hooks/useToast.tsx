import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Tipo = "sucesso" | "erro" | "info";

interface Aviso {
  id: number;
  tipo: Tipo;
  texto: string;
}

interface ToastContexto {
  sucesso: (texto: string) => void;
  erro: (texto: string) => void;
  info: (texto: string) => void;
}

const Ctx = createContext<ToastContexto | undefined>(undefined);

const ESTILO: Record<Tipo, string> = {
  sucesso: "bg-oliva text-papel",
  erro: "bg-brasa text-papel",
  info: "bg-latao-grad text-oliva-escuro",
};
const ICONE: Record<Tipo, string> = { sucesso: "✓", erro: "!", info: "i" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const remover = useCallback((id: number) => {
    setAvisos((a) => a.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: Tipo, texto: string) => {
      const id = Date.now() + Math.random();
      setAvisos((a) => [...a, { id, tipo, texto }]);
      // Some sozinho após 3,5s.
      setTimeout(() => remover(id), 3500);
    },
    [remover],
  );

  const valor: ToastContexto = {
    sucesso: (t) => mostrar("sucesso", t),
    erro: (t) => mostrar("erro", t),
    info: (t) => mostrar("info", t),
  };

  return (
    <Ctx.Provider value={valor}>
      {children}
      {/* Pilha de avisos fixa no topo */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+10px)]">
        {avisos.map((a) => (
          <button
            key={a.id}
            onClick={() => remover(a.id)}
            className={`pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-xl px-4 py-3 text-left font-titulo text-sm font-bold shadow-botao ${ESTILO[a.tipo]}`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25 font-mono text-xs">
              {ICONE[a.tipo]}
            </span>
            {a.texto}
          </button>
        ))}
      </div>
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>.");
  return ctx;
}
