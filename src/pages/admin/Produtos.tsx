import { useCallback, useEffect, useState, type FormEvent } from "react";
import { GlassLayout } from "../../components/GlassLayout";
import { Cabecalho } from "../../components/Cabecalho";
import { AdminNav } from "../../components/AdminNav";
import { StatusBadge } from "../../components/StatusBadge";
import { supabase } from "../../lib/supabase/client";
import { moeda } from "../../lib/format";
import type { Produto } from "../../types/db";

const VAZIO = { nome: "", preco: "", icone: "📦" };

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    // Admin vê TODOS os produtos (ativos e inativos).
    const { data } = await supabase.from("produtos").select("*").order("nome");
    setProdutos((data ?? []) as Produto[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function editar(p: Produto) {
    setEditandoId(p.id);
    setForm({ nome: p.nome, preco: String(p.preco), icone: p.icone });
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelar() {
    setEditandoId(null);
    setForm(VAZIO);
    setErro("");
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    const preco = Number(form.preco.replace(",", "."));
    if (!form.nome.trim() || isNaN(preco) || preco < 0) {
      setErro("Informe nome e preço válidos.");
      return;
    }
    const dados = { nome: form.nome.trim(), preco, icone: form.icone || "📦" };

    // Escrita restrita a admin pela RLS (produtos_admin_write).
    const resp = editandoId
      ? await supabase.from("produtos").update(dados).eq("id", editandoId)
      : await supabase.from("produtos").insert({ ...dados, ativo: true });

    if (resp.error) setErro("Não foi possível salvar o produto.");
    else {
      cancelar();
      carregar();
    }
  }

  // Ativar/inativar: produto inativo não aparece no catálogo do militar.
  async function alternarAtivo(p: Produto) {
    await supabase.from("produtos").update({ ativo: !p.ativo }).eq("id", p.id);
    carregar();
  }

  return (
    <GlassLayout>
      <Cabecalho legenda="Administrador" />
      <AdminNav />

      {/* Formulário de criar/editar */}
      <form onSubmit={salvar} className="superficie mt-4 space-y-3 p-4">
        <h2 className="text-lg">{editandoId ? "Editar produto" : "Novo produto"}</h2>
        <div className="flex gap-2">
          <input
            aria-label="Ícone"
            className="campo w-16 text-center text-2xl"
            value={form.icone}
            onChange={(e) => setForm({ ...form, icone: e.target.value })}
            maxLength={2}
          />
          <input
            aria-label="Nome"
            className="campo flex-1"
            placeholder="Nome do produto"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
        </div>
        <input
          aria-label="Preço"
          className="campo font-mono"
          inputMode="decimal"
          placeholder="Preço (ex.: 5.00)"
          value={form.preco}
          onChange={(e) => setForm({ ...form, preco: e.target.value })}
        />
        {erro && <p className="text-sm font-medium text-red-700">{erro}</p>}
        <div className="flex gap-2">
          {editandoId && (
            <button type="button" onClick={cancelar} className="btn-secundario flex-1">
              Cancelar
            </button>
          )}
          <button className="btn-primario flex-1">
            {editandoId ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </form>

      {carregando && (
        <p className="mt-6 text-center font-mono text-sm text-papel/80">Carregando…</p>
      )}

      <div className="mt-4 space-y-2">
        {produtos.map((p) => (
          <div key={p.id} className="superficie flex items-center gap-3 p-3">
            <span className="text-2xl">{p.icone}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-titulo font-bold text-oliva-escuro">{p.nome}</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-latao">{moeda(p.preco)}</span>
                <StatusBadge status={p.ativo ? "ativo" : "inativo"} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => editar(p)}
                className="rounded-lg border border-oliva/40 px-3 py-1 font-titulo text-xs font-semibold text-oliva-escuro"
              >
                Editar
              </button>
              <button
                onClick={() => alternarAtivo(p)}
                className="rounded-lg border border-latao/40 px-3 py-1 font-titulo text-xs font-semibold text-oliva-escuro"
              >
                {p.ativo ? "Inativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassLayout>
  );
}
