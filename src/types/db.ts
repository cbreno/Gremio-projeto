// Tipos do domínio + tipagem mínima do banco para o supabase-js.

export type Role = "militar" | "admin";
export type FormaPagamento = "pix" | "prazo";
export type StatusPedido = "aguardando" | "pendente" | "pago";

export interface Militar {
  id: string;
  posto: string;
  nome_guerra: string;
  telefone: string;
  role: Role;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  icone: string;
  /** URL pública da foto do produto (opcional; emoji `icone` é a reserva). */
  imagem_url: string | null;
  ativo: boolean;
  created_at: string;
}

export interface Pedido {
  id: string;
  militar_id: string;
  total: number;
  forma_pagamento: FormaPagamento;
  status: StatusPedido;
  vencimento: string | null;
  comprovante_url: string | null;
  /** Momento em que o admin marcou como pago (para relatórios). */
  pago_em: string | null;
  created_at: string;
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  produto_id: string | null;
  nome_produto: string;
  preco_unitario: number;
  quantidade: number;
}

// Pedido com dados relacionados (usado no painel do admin e em "Meus Pedidos").
export interface PedidoComRelacionados extends Pedido {
  itens_pedido: ItemPedido[];
  militares?: Pick<Militar, "posto" | "nome_guerra" | "telefone"> | null;
}

// ─── Tipagem para o createClient<Database> ──────────────────────────────────
type Row<T> = T;
type Insert<T> = Partial<T>;

export interface Database {
  public: {
    Tables: {
      militares: { Row: Row<Militar>; Insert: Insert<Militar>; Update: Insert<Militar> };
      produtos: { Row: Row<Produto>; Insert: Insert<Produto>; Update: Insert<Produto> };
      pedidos: { Row: Row<Pedido>; Insert: Insert<Pedido>; Update: Insert<Pedido> };
      itens_pedido: {
        Row: Row<ItemPedido>;
        Insert: Insert<ItemPedido>;
        Update: Insert<ItemPedido>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
  };
}
