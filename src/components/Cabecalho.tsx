import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DogTag } from "./DogTag";

/**
 * Cabeçalho padrão: chapa de identificação (posto + nome de guerra) + botões.
 * `voltar` mostra um botão "‹ Voltar" no topo (telas internas).
 * Usado no topo das telas autenticadas.
 */
export function Cabecalho({
  legenda,
  voltar = false,
}: {
  legenda?: string;
  voltar?: boolean;
}) {
  const { militar, sair } = useAuth();
  const navigate = useNavigate();

  if (!militar) return null;

  async function onSair() {
    await sair();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {voltar && (
        <button
          onClick={() => navigate(-1)}
          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-latao/40 bg-papel/80 px-3 py-1.5 font-titulo text-sm font-semibold text-oliva-escuro backdrop-blur-md active:scale-95"
          aria-label="Voltar"
        >
          ‹ Voltar
        </button>
      )}
      <header className="mt-2 flex items-stretch gap-2">
      <div className="flex-1">
        <DogTag posto={militar.posto} nomeGuerra={militar.nome_guerra} legenda={legenda} />
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button
          onClick={() => navigate("/perfil")}
          className="rounded-xl border border-latao/40 bg-papel/80 px-3 py-1.5 font-titulo text-sm font-semibold text-oliva-escuro backdrop-blur-md active:scale-95"
          aria-label="Perfil"
        >
          Perfil
        </button>
        <button
          onClick={onSair}
          className="rounded-xl border border-latao/40 bg-papel/80 px-3 py-1.5 font-titulo text-sm font-semibold text-oliva-escuro backdrop-blur-md active:scale-95"
          aria-label="Sair"
        >
          Sair
        </button>
      </div>
      </header>
    </>
  );
}
