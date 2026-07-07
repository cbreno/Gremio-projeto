import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlassLayout } from "../components/GlassLayout";
import { Cabecalho } from "../components/Cabecalho";
import { QRCodePix } from "../components/QRCodePix";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase/client";
import { pixDoQuartel } from "../lib/pix";
import { moeda } from "../lib/format";
import type { Pedido } from "../types/db";

export default function PagamentoPix() {
  const { id } = useParams<{ id: string }>();
  const { militar } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [enviandoComp, setEnviandoComp] = useState(false);
  const [msgComp, setMsgComp] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const chave = import.meta.env.VITE_PIX_CHAVE;

  useEffect(() => {
    if (!id) return;
    // RLS garante que só o dono (ou admin) leia este pedido.
    supabase
      .from("pedidos")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setPedido((data as Pedido) ?? null);
        setCarregando(false);
      });
  }, [id]);

  if (carregando) {
    return (
      <GlassLayout>
        <Cabecalho />
        <p className="mt-6 text-center font-mono text-sm text-papel/80">Carregando…</p>
      </GlassLayout>
    );
  }

  if (!pedido) {
    return (
      <GlassLayout>
        <Cabecalho />
        <div className="superficie mt-4 p-6 text-center text-tinta/70">
          Pedido não encontrado.
          <Link to="/" className="btn-secundario mt-4 inline-flex">
            Voltar
          </Link>
        </div>
      </GlassLayout>
    );
  }

  const copiaECola = pixDoQuartel(pedido.total, pedido.id.slice(0, 8));

  async function copiar() {
    await navigator.clipboard.writeText(copiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function enviarComprovante(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !militar || !pedido) return;
    setEnviandoComp(true);
    setMsgComp("");
    try {
      const ext = arquivo.name.split(".").pop() || "jpg";
      // Caminho: <uid>/<pedidoId>.<ext> — a 1ª pasta (uid) é usada pela política do Storage.
      const caminho = `${militar.id}/${pedido.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("comprovantes")
        .upload(caminho, arquivo, { upsert: true });
      if (upErr) throw upErr;

      // RPC que grava a URL sem permitir alterar o status (ver 0002_functions.sql).
      const { error: rpcErr } = await supabase.rpc("anexar_comprovante", {
        p_pedido: pedido.id,
        p_url: caminho,
      });
      if (rpcErr) throw rpcErr;

      setMsgComp("Comprovante enviado! Aguarde a confirmação do administrador.");
    } catch {
      setMsgComp("Não foi possível enviar o comprovante. Tente novamente.");
    } finally {
      setEnviandoComp(false);
    }
  }

  return (
    <GlassLayout>
      <Cabecalho />
      <h2 className="mt-4 text-xl text-papel drop-shadow">Pagamento PIX</h2>

      <div className="superficie mt-4 space-y-4 p-5 text-center">
        <p className="font-mono text-sm text-tinta/70">Valor</p>
        <p className="-mt-2 font-mono text-3xl font-bold text-oliva-escuro">
          {moeda(pedido.total)}
        </p>

        <QRCodePix payload={copiaECola} />

        <div className="text-left">
          <p className="rotulo">Chave PIX do quartel</p>
          <p className="break-all rounded-lg bg-lona/60 p-2 font-mono text-sm">{chave}</p>
        </div>

        <div className="text-left">
          <p className="rotulo">PIX Copia e Cola</p>
          <p className="max-h-24 overflow-y-auto break-all rounded-lg bg-lona/60 p-2 font-mono text-xs">
            {copiaECola}
          </p>
          <button onClick={copiar} className="btn-primario mt-2 w-full">
            {copiado ? "Copiado!" : "Copiar código PIX"}
          </button>
        </div>

        {/* Upload opcional do comprovante */}
        <div className="text-left">
          <p className="rotulo">Comprovante (opcional)</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={enviarComprovante}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-secundario w-full"
            disabled={enviandoComp}
          >
            {enviandoComp ? "Enviando…" : "Anexar comprovante"}
          </button>
          {msgComp && <p className="mt-2 text-sm text-oliva-escuro">{msgComp}</p>}
        </div>

        <div className="rounded-lg bg-latao/15 p-3 text-sm text-tinta/80">
          Seu pedido está <strong>aguardando</strong> a confirmação do administrador.
        </div>

        <Link to="/meus-pedidos" className="btn-secundario w-full">
          Ver meus pedidos
        </Link>
      </div>
    </GlassLayout>
  );
}
