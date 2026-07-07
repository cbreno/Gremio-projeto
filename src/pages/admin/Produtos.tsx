import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { GlassLayout } from "../../components/GlassLayout";
import { Cabecalho } from "../../components/Cabecalho";
import { AdminNav } from "../../components/AdminNav";
import { StatusBadge } from "../../components/StatusBadge";
import { ProdutoThumb } from "../../components/ProdutoThumb";
import { supabase } from "../../lib/supabase/client";
import { moeda } from "../../lib/format";
import type { Produto } from "../../types/db";

const VAZIO = { nome: "", preco: "", icone: "📦", imagem_url: null as string | null };

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(VAZIO);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // URL local p/ prévia
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
    setForm({ nome: p.nome, preco: String(p.preco), icone: p.icone, imagem_url: p.imagem_url });
    setArquivo(null);
    setPreview(null);
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelar() {
    setEditandoId(null);
    setForm(VAZIO);
    setArquivo(null);
    setPreview(null);
    setErro("");
    if (fileRef.current) fileRef.current.value = "";
  }

  // Guarda o arquivo escolhido e gera uma prévia local imediata.
  function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setArquivo(f);
    setPreview(URL.createObjectURL(f));
  }

  // Sobe a foto para o bucket público 'produtos' e devolve a URL pública.
  async function enviarFoto(f: File): Promise<string> {
    const ext = f.name.split(".").pop() || "jpg";
    const caminho = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("produtos").upload(caminho, f, {
      upsert: true,
      contentType: f.type,
    });
    if (error) throw error;
    return supabase.storage.from("produtos").getPublicUrl(caminho).data.publicUrl;
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    const preco = Number(form.preco.replace(",", "."));
    if (!form.nome.trim() || isNaN(preco) || preco < 0) {
      setErro("Informe nome e preço válidos.");
      return;
    }

    setSalvando(true);
    try {
      // Se o admin escolheu uma foto nova, faz o upload antes de salvar.
      let imagem_url = form.imagem_url;
      if (arquivo) imagem_url = await enviarFoto(arquivo);

      const dados = { nome: form.nome.trim(), preco, icone: form.icone || "📦", imagem_url };

      // Escrita restrita a admin pela RLS (produtos_admin_write).
      const resp = editandoId
        ? await supabase.from("produtos").update(dados).eq("id", editandoId)
        : await supabase.from("produtos").insert({ ...dados, ativo: true });

      if (resp.error) setErro("Não foi possível salvar o produto.");
      else {
        cancelar();
        carregar();
      }
    } catch {
      setErro("Falha ao enviar a foto. Tente uma imagem menor.");
    } finally {
      setSalvando(false);
    }
  }

  // Ativar/inativar: produto inativo não aparece no catálogo do militar.
  async function alternarAtivo(p: Produto) {
    await supabase.from("produtos").update({ ativo: !p.ativo }).eq("id", p.id);
    carregar();
  }

  // O que mostrar na prévia: foto nova escolhida > foto já salva > emoji.
  const previewUrl = preview ?? form.imagem_url;

  return (
    <GlassLayout>
      <Cabecalho legenda="Administrador" />
      <AdminNav />

      {/* Formulário de criar/editar */}
      <form onSubmit={salvar} className="superficie mt-4 space-y-3 p-4">
        <h2 className="text-lg">{editandoId ? "Editar produto" : "Novo produto"}</h2>

        {/* Foto do produto */}
        <div className="flex items-center gap-3">
          <ProdutoThumb
            imagemUrl={previewUrl}
            icone={form.icone}
            nome={form.nome}
            className="h-20 w-20 text-3xl"
          />
          <div className="flex-1 space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={escolherFoto}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-secundario w-full"
            >
              {previewUrl ? "Trocar foto" : "Adicionar foto"}
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setArquivo(null);
                  setPreview(null);
                  setForm({ ...form, imagem_url: null });
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="w-full text-center font-titulo text-xs font-semibold text-brasa"
              >
                Remover foto
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            aria-label="Emoji (usado quando não há foto)"
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
        <p className="-mt-1 text-xs text-tinta/60">
          O emoji ao lado é usado como reserva quando o produto não tem foto.
        </p>

        <input
          aria-label="Preço"
          className="campo font-mono"
          inputMode="decimal"
          placeholder="Preço (ex.: 5.00)"
          value={form.preco}
          onChange={(e) => setForm({ ...form, preco: e.target.value })}
        />
        {erro && <p className="text-sm font-medium text-brasa">{erro}</p>}
        <div className="flex gap-2">
          {editandoId && (
            <button type="button" onClick={cancelar} className="btn-secundario flex-1">
              Cancelar
            </button>
          )}
          <button className="btn-primario flex-1" disabled={salvando}>
            {salvando ? "Salvando…" : editandoId ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </form>

      {carregando && (
        <p className="mt-6 text-center font-mono text-sm text-papel/80">Carregando…</p>
      )}

      <div className="mt-4 space-y-2">
        {produtos.map((p) => (
          <div key={p.id} className="superficie flex items-center gap-3 p-3">
            <ProdutoThumb
              imagemUrl={p.imagem_url}
              icone={p.icone}
              nome={p.nome}
              className="h-14 w-14 text-2xl"
            />
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
