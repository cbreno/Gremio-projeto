import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassLayout } from "../components/GlassLayout";
import { useAuth } from "../hooks/useAuth";
import { POSTOS } from "../lib/postos";

// Cadastro do militar. Todos os campos são obrigatórios.
export default function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const [posto, setPosto] = useState("");
  const [nomeGuerra, setNomeGuerra] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      await cadastrar({
        posto,
        nome_guerra: nomeGuerra.trim(),
        telefone: telefone.trim(),
        senha,
      });
      // Cadastro já autentica -> redireciona pela rota "/".
      navigate("/", { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha no cadastro.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <GlassLayout>
      <div className="mt-6 text-center">
        <h1 className="titulo-marca text-3xl">Novo cadastro</h1>
      </div>

      <form onSubmit={onSubmit} className="superficie mt-4 space-y-4 p-6">
        <div>
          <label className="rotulo" htmlFor="posto">
            Posto / Graduação
          </label>
          <select
            id="posto"
            className="campo"
            value={posto}
            onChange={(e) => setPosto(e.target.value)}
            required
          >
            <option value="" disabled>
              Selecione…
            </option>
            {POSTOS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="rotulo" htmlFor="nome">
            Nome de guerra
          </label>
          <input
            id="nome"
            className="campo"
            placeholder="Ex.: Silva"
            value={nomeGuerra}
            onChange={(e) => setNomeGuerra(e.target.value)}
            required
          />
        </div>

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
          <p className="mt-1 text-xs text-tinta/60">Usado para entrar e para cobranças.</p>
        </div>

        <div>
          <label className="rotulo" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            className="campo"
            autoComplete="new-password"
            placeholder="mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}

        <button className="btn-primario w-full" disabled={enviando}>
          {enviando ? "Cadastrando…" : "Cadastrar"}
        </button>

        <p className="text-center text-sm text-tinta/70">
          Já tem cadastro?{" "}
          <Link to="/login" className="font-semibold text-oliva underline">
            Entrar
          </Link>
        </p>
      </form>
    </GlassLayout>
  );
}
