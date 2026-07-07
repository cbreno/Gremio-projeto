import { useState, type FormEvent } from "react";
import { GlassLayout } from "../components/GlassLayout";
import { Cabecalho } from "../components/Cabecalho";
import { useAuth } from "../hooks/useAuth";
import { apenasDigitos } from "../lib/format";

export default function Perfil() {
  const { militar, alterarSenha, confirmarSenha } = useAuth();

  const [telefone, setTelefone] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!militar) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setOk(false);

    // CONFIRMAÇÃO PELO CELULAR: exige que o telefone digitado seja o mesmo do cadastro.
    if (apenasDigitos(telefone) !== apenasDigitos(militar!.telefone)) {
      setErro("O telefone informado não confere com o do seu cadastro.");
      return;
    }
    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    try {
      // CONFIRMAÇÃO EXTRA: revalida a senha ATUAL antes de permitir a troca.
      const senhaConfere = await confirmarSenha(senhaAtual);
      if (!senhaConfere) {
        setErro("A senha atual está incorreta.");
        return;
      }

      await alterarSenha(novaSenha);
      setOk(true);
      setTelefone("");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmar("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao alterar a senha.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <GlassLayout>
      <Cabecalho voltar legenda={militar.role === "admin" ? "Administrador" : "Comprador"} />
      <h2 className="titulo-marca mt-4 text-2xl">Meu perfil</h2>

      {/* Dados do cadastro (somente leitura) */}
      <div className="superficie mt-4 space-y-2 p-4">
        <div className="flex justify-between">
          <span className="rotulo mb-0">Posto</span>
          <span className="font-mono text-tinta">{militar.posto}</span>
        </div>
        <div className="flex justify-between">
          <span className="rotulo mb-0">Nome de guerra</span>
          <span className="font-mono text-tinta">{militar.nome_guerra}</span>
        </div>
        <div className="flex justify-between">
          <span className="rotulo mb-0">Telefone</span>
          <span className="font-mono text-tinta">{militar.telefone}</span>
        </div>
      </div>

      {/* Alterar senha com confirmação pelo celular */}
      <form onSubmit={onSubmit} className="superficie mt-4 space-y-4 p-4">
        <h3 className="text-lg">Alterar senha</h3>
        <p className="-mt-2 text-sm text-tinta/70">
          Para confirmar que é você, digite o <strong>telefone do seu cadastro</strong> e a
          sua <strong>senha atual</strong>, depois defina a nova senha.
        </p>

        <div>
          <label className="rotulo" htmlFor="tel">
            Confirme seu telefone
          </label>
          <input
            id="tel"
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
          <label className="rotulo" htmlFor="atual">
            Senha atual
          </label>
          <input
            id="atual"
            type="password"
            className="campo"
            autoComplete="current-password"
            placeholder="Sua senha de hoje"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="rotulo" htmlFor="nova">
            Nova senha
          </label>
          <input
            id="nova"
            type="password"
            className="campo"
            autoComplete="new-password"
            placeholder="mínimo 6 caracteres"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="rotulo" htmlFor="conf">
            Repita a nova senha
          </label>
          <input
            id="conf"
            type="password"
            className="campo"
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
        </div>

        {erro && <p className="text-sm font-medium text-brasa">{erro}</p>}
        {ok && (
          <p className="rounded-lg bg-oliva/15 p-3 text-sm font-medium text-oliva-escuro">
            ✓ Senha alterada com sucesso!
          </p>
        )}

        <button className="btn-primario w-full" disabled={enviando}>
          {enviando ? "Salvando…" : "Alterar senha"}
        </button>
      </form>
    </GlassLayout>
  );
}
