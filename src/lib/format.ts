/** Formata um número como moeda brasileira (R$ 5,00). */
export function moeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Formata uma data ISO (yyyy-mm-dd ou timestamptz) como dd/mm/aaaa. */
export function dataBR(iso: string | null): string {
  if (!iso) return "—";
  // Datas puras (yyyy-mm-dd) são tratadas como locais para não "voltar um dia".
  const d = iso.length === 10 ? new Date(iso + "T00:00:00") : new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

/** Mantém apenas dígitos de um telefone. Usado no login e no link wa.me. */
export function apenasDigitos(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

/**
 * Deriva um e-mail sintético a partir do telefone para o Supabase Auth.
 * O usuário nunca vê nem digita e-mail — o login é por telefone + senha.
 */
export function telefoneParaEmail(telefone: string): string {
  return `${apenasDigitos(telefone)}@cantina.local`;
}
