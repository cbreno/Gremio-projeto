import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassLayout } from "../components/GlassLayout";
import { useAuth } from "../hooks/useAuth";

// Tela de login única para os dois papéis. O redirecionamento por papel
// acontece na rota "/" (ver App.tsx) logo após autenticar.
export default function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await entrar(telefone, senha);
      navigate("/", { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <GlassLayout>
      <div className="mt-8 text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.35em] text-latao-claro">
          ★ Grêmio do Quartel ★
        </p>
        <h1 className="titulo-marca mt-2 text-4xl">Grêmio Tenente Breno</h1>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-latao-grad" />
      </div>

      <form onSubmit={onSubmit} className="superficie mt-6 space-y-4 p-6">
        <h2 className="text-xl">Entrar</h2>

        <div>
          <label className="rotulo" htmlFor="telefone">
            Telefone (WhatsApp)
          </label>
          <input
            id="telefone"
            className="campo font-mono"
            inputMode="tel"
            autoComplete="tel"
            placeholder="61 99999-0000"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="rotulo" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            className="campo"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}

        <button className="btn-primario w-full" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>

        <p className="text-center text-sm text-tinta/70">
          Ainda não tem cadastro?{" "}
          <Link to="/cadastro" className="font-semibold text-oliva underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </GlassLayout>
  );
}
