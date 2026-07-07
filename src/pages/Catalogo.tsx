import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlassLayout } from "../components/GlassLayout";
import { Cabecalho } from "../components/Cabecalho";
import { ProductCard } from "../components/ProductCard";
import { CartBar } from "../components/CartBar";
import { useCart } from "../hooks/useCart";
import { supabase } from "../lib/supabase/client";
import type { Produto } from "../types/db";

export default function Catalogo() {
  const { quantidadeDe, incrementar, decrementar } = useCart();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    // REGRA: o catálogo do militar lista APENAS produtos ativos.
    supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("nome")
      .then(({ data, error }) => {
        if (error) setErro("Não foi possível carregar os produtos.");
        else setProdutos((data ?? []) as Produto[]);
        setCarregando(false);
      });
  }, []);

  return (
    <GlassLayout>
      <Cabecalho legenda="Comprador" />

      <div className="mt-4 flex items-center justify-between">
        <h2 className="titulo-marca text-2xl">Cantina</h2>
        <Link
          to="/meus-pedidos"
          className="rounded-lg border border-latao/40 bg-papel/80 px-3 py-1.5 font-titulo text-sm font-semibold text-oliva-escuro backdrop-blur-md"
        >
          Meus pedidos
        </Link>
      </div>

      {carregando && (
        <p className="mt-6 text-center font-mono text-sm text-papel/80">Carregando…</p>
      )}
      {erro && <p className="mt-6 text-center text-sm text-red-200">{erro}</p>}
      {!carregando && !erro && produtos.length === 0 && (
        <div className="superficie mt-4 p-6 text-center text-tinta/70">
          Nenhum produto disponível no momento.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {produtos.map((p) => (
          <ProductCard
            key={p.id}
            produto={p}
            quantidade={quantidadeDe(p.id)}
            onIncrementar={() => incrementar(p)}
            onDecrementar={() => decrementar(p)}
          />
        ))}
      </div>

      <CartBar />
    </GlassLayout>
  );
}
