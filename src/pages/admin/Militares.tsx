import { useCallback, useEffect, useState } from "react";
import { GlassLayout } from "../../components/GlassLayout";
import { Cabecalho } from "../../components/Cabecalho";
import { AdminNav } from "../../components/AdminNav";
import { useAuth } from "../../hooks/useAuth";
import { useConfirm } from "../../hooks/useConfirm";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase/client";
import { dataBR } from "../../lib/format";
import type { Militar } from "../../types/db";

export default function AdminMilitares() {
  const { militar: eu } = useAuth();
  const confirmar = useConfirm();
  const toast = useToast();

  const [lista, setLista] = useState<Militar[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [resetId, setResetId] = useState<string | null>(null);
  const [senhaReset, setSenhaReset] = useState("");
  const [salvandoReset, setSalvandoReset] = useState(false);

  const carregar = useCallback(async () => {
    // Admin vê todos os militares (RLS via is_admin).
    const { data } = await supabase
      .from("militares")
      .select("*")
      .order("role", { ascending: true })
      .order("nome_guerra");
    setLista((data ?? []) as Militar[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Promover a admin / rebaixar a militar (RLS permite o admin atualizar qualquer linha).
  async function alternarPapel(m: Militar) {
    const novo = m.role === "admin" ? "militar" : "admin";
    const ok = await confirmar({
      titulo: novo === "admin" ? "Promover a administrador?" : "Rebaixar para militar?",
      mensagem:
        novo === "admin"
          ? `${m.posto} ${m.nome_guerra} passará a ter acesso total ao painel.`
          : `${m.posto} ${m.nome_guerra} deixará de ser administrador.`,
      textoConfirmar: novo === "admin" ? "Promover" : "Rebaixar",
      perigoso: novo === "militar",
    });
    if (!ok) return;

    const { error } = await supabase.from("militares").update({ role: novo }).eq("id", m.id);
    if (error) toast.erro("Não foi possível alterar o papel.");
    else {
      toast.sucesso(novo === "admin" ? "Promovido a admin ✓" : "Rebaixado a militar ✓");
      carregar();
    }
  }

  // Redefinir senha (o app não tem e-mail; o admin define uma senha temporária).
  async function salvarReset(m: Militar) {
    if (senhaReset.length < 6) {
      toast.erro("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setSalvandoReset(true);
    const { error } = await supabase.rpc("admin_redefinir_senha", {
      p_militar: m.id,
      p_nova_senha: senhaReset,
    });
    setSalvandoReset(false);
    if (error) {
      toast.erro("Não foi possível redefinir a senha.");
    } else {
      toast.sucesso(`Senha de ${m.nome_guerra} redefinida ✓`);
      setResetId(null);
      setSenhaReset("");
    }
  }

  return (
    <GlassLayout>
      <Cabecalho voltar legenda="Administrador" />
      <AdminNav />

      <h2 className="titulo-marca mt-4 text-2xl">Militares</h2>

      {carregando && (
        <p className="mt-6 text-center font-mono text-sm text-papel/80">Carregando…</p>
      )}

      <div className="mt-4 space-y-2">
        {lista.map((m) => (
          <div key={m.id} className="superficie p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-titulo font-bold text-oliva-escuro">
                  <span className="text-latao-escuro">{m.posto}</span> {m.nome_guerra}
                  {eu?.id === m.id && (
                    <span className="ml-2 font-mono text-xs text-tinta/50">(você)</span>
                  )}
                </p>
                <p className="font-mono text-xs text-tinta/60">{m.telefone}</p>
                <p className="font-mono text-[11px] text-tinta/50">
                  desde {dataBR(m.created_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${
                  m.role === "admin"
                    ? "border-latao/50 bg-latao/15 text-latao-escuro"
                    : "border-oliva/40 bg-oliva/10 text-oliva-escuro"
                }`}
              >
                {m.role === "admin" ? "Admin" : "Militar"}
              </span>
            </div>

            {/* Ações — não permite alterar o próprio papel (evita se auto-rebaixar) */}
            <div className="mt-3 flex flex-wrap gap-2">
              {eu?.id !== m.id && (
                <button
                  onClick={() => alternarPapel(m)}
                  className="rounded-lg border border-oliva/40 px-3 py-1.5 font-titulo text-xs font-semibold text-oliva-escuro"
                >
                  {m.role === "admin" ? "Rebaixar a militar" : "Tornar admin"}
                </button>
              )}
              <button
                onClick={() => {
                  setResetId(resetId === m.id ? null : m.id);
                  setSenhaReset("");
                }}
                className="rounded-lg border border-latao/40 px-3 py-1.5 font-titulo text-xs font-semibold text-oliva-escuro"
              >
                Redefinir senha
              </button>
            </div>

            {/* Formulário inline de redefinição de senha */}
            {resetId === m.id && (
              <div className="mt-3 rounded-xl bg-lona/50 p-3">
                <p className="mb-2 text-xs text-tinta/70">
                  Defina uma senha temporária e informe ao militar. Ele pode trocá-la
                  depois no Perfil.
                </p>
                <input
                  type="text"
                  className="campo font-mono"
                  placeholder="Nova senha (mín. 6)"
                  value={senhaReset}
                  onChange={(e) => setSenhaReset(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setResetId(null)}
                    className="btn-secundario flex-1 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => salvarReset(m)}
                    disabled={salvandoReset}
                    className="btn-primario flex-1 py-2"
                  >
                    {salvandoReset ? "Salvando…" : "Salvar senha"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassLayout>
  );
}
