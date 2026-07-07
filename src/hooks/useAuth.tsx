import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase/client";
import { telefoneParaEmail } from "../lib/format";
import type { Militar } from "../types/db";

interface DadosCadastro {
  posto: string;
  nome_guerra: string;
  telefone: string;
  senha: string;
}

interface AuthContexto {
  carregando: boolean;
  militar: Militar | null;
  ehAdmin: boolean;
  entrar: (telefone: string, senha: string) => Promise<void>;
  cadastrar: (dados: DadosCadastro) => Promise<void>;
  sair: () => Promise<void>;
  /**
   * REGRA DE NEGÓCIO: confirmação por senha na finalização da compra.
   * Revalida a senha do militar logado sem derrubar a sessão.
   */
  confirmarSenha: (senha: string) => Promise<boolean>;
}

const Ctx = createContext<AuthContexto | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [militar, setMilitar] = useState<Militar | null>(null);

  // Carrega o perfil (militares) do usuário autenticado atual.
  async function carregarPerfil(userId: string | undefined) {
    if (!userId) {
      setMilitar(null);
      return;
    }
    const { data } = await supabase
      .from("militares")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    setMilitar(data ?? null);
  }

  useEffect(() => {
    // Sessão inicial + escuta de mudanças de auth.
    supabase.auth.getSession().then(async ({ data }) => {
      await carregarPerfil(data.session?.user.id);
      setCarregando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      carregarPerfil(session?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function entrar(telefone: string, senha: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: telefoneParaEmail(telefone),
      password: senha,
    });
    if (error) throw new Error("Telefone ou senha inválidos.");
    await carregarPerfil(data.user.id);
  }

  async function cadastrar({ posto, nome_guerra, telefone, senha }: DadosCadastro) {
    // 1) REGRA: (posto + nome de guerra) é único — checa ANTES de criar a conta.
    const { data: disponivel, error: rpcErr } = await supabase.rpc(
      "posto_nome_disponivel",
      { p_posto: posto, p_nome: nome_guerra },
    );
    if (rpcErr) throw new Error("Não foi possível validar o cadastro. Tente novamente.");
    if (disponivel === false) {
      throw new Error(
        `Já existe um militar cadastrado como "${posto} ${nome_guerra}".`,
      );
    }

    // 2) Cria a conta no Supabase Auth (senha com hash gerenciado pelo Supabase).
    //    O e-mail é sintético, derivado do telefone (login é por telefone).
    const { data: signUp, error: signErr } = await supabase.auth.signUp({
      email: telefoneParaEmail(telefone),
      password: senha,
    });
    if (signErr) {
      // Telefone duplicado => e-mail duplicado no Auth.
      if (/already|registered|exists/i.test(signErr.message)) {
        throw new Error("Este telefone já está cadastrado.");
      }
      throw new Error(signErr.message);
    }

    const userId = signUp.user?.id;
    if (!userId) {
      throw new Error(
        "Cadastro criado, mas é necessário confirmar o e-mail. Desative a confirmação de e-mail no Supabase (veja o README).",
      );
    }

    // 3) Cria a linha em militares (id = uuid do Auth).
    const { error: insErr } = await supabase.from("militares").insert({
      id: userId,
      posto,
      nome_guerra,
      telefone,
      role: "militar",
    });
    if (insErr) {
      // Reverte a sessão para não deixar o app num estado inconsistente.
      await supabase.auth.signOut();
      if (insErr.code === "23505") {
        throw new Error("Posto + nome de guerra ou telefone já cadastrados.");
      }
      throw new Error("Não foi possível concluir o cadastro. Tente novamente.");
    }

    await carregarPerfil(userId);
  }

  async function sair() {
    await supabase.auth.signOut();
    setMilitar(null);
  }

  async function confirmarSenha(senha: string) {
    if (!militar) return false;
    // Revalida credenciais. Como é o mesmo usuário, a sessão é apenas renovada.
    const { error } = await supabase.auth.signInWithPassword({
      email: telefoneParaEmail(militar.telefone),
      password: senha,
    });
    return !error;
  }

  const valor: AuthContexto = {
    carregando,
    militar,
    ehAdmin: militar?.role === "admin",
    entrar,
    cadastrar,
    sair,
    confirmarSenha,
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return ctx;
}
