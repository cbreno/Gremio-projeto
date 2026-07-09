import { supabase } from "./supabase/client";
import { primeiroDiaUtilMesSeguinte } from "./vencimento";
import type { FormaPagamento, ItemPedido } from "../types/db";
import type { ItemCarrinho } from "../hooks/useCart";

/**
 * Cria um pedido + seus itens (com snapshot de nome e preço).
 *
 * REGRAS DE NEGÓCIO aplicadas aqui:
 *   • PIX   -> status 'aguardando' (aguarda confirmação manual do admin), sem vencimento.
 *   • prazo -> status 'pendente', vencimento = 1º dia útil do mês seguinte.
 *
 * @returns o id do pedido criado.
 */
export async function criarPedido(
  militarId: string,
  itens: ItemCarrinho[],
  forma: FormaPagamento,
  opts: { pago?: boolean } = {},
): Promise<string> {
  if (itens.length === 0) throw new Error("Carrinho vazio.");

  const total = itens.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);

  // `pago` é usado no lançamento pelo admin (venda à vista já quitada).
  let status: "aguardando" | "pendente" | "pago";
  let vencimento: string | null = null;
  let pago_em: string | null = null;

  if (opts.pago) {
    status = "pago";
    pago_em = new Date().toISOString();
  } else if (forma === "pix") {
    status = "aguardando";
  } else {
    status = "pendente";
    vencimento = primeiroDiaUtilMesSeguinte();
  }

  // 1) Cria o pedido.
  const { data: pedido, error: pedErr } = await supabase
    .from("pedidos")
    .insert({
      militar_id: militarId,
      total,
      forma_pagamento: forma,
      status,
      vencimento,
      pago_em,
    })
    .select("id")
    .single();
  if (pedErr || !pedido) throw new Error("Não foi possível registrar o pedido.");

  // 2) Cria os itens com SNAPSHOT do nome e do preço no momento da compra.
  const itensParaInserir: Partial<ItemPedido>[] = itens.map((i) => ({
    pedido_id: pedido.id as string,
    produto_id: i.produto.id,
    nome_produto: i.produto.nome,
    preco_unitario: i.produto.preco,
    quantidade: i.quantidade,
  }));

  const { error: itErr } = await supabase.from("itens_pedido").insert(itensParaInserir);
  if (itErr) {
    // Desfaz o pedido para não deixar um pedido sem itens.
    await supabase.from("pedidos").delete().eq("id", pedido.id);
    throw new Error("Não foi possível registrar os itens do pedido.");
  }

  return pedido.id as string;
}
