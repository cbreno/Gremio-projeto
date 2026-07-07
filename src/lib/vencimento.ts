/**
 * REGRA DE NEGÓCIO: compra a prazo vence no PRIMEIRO DIA ÚTIL do mês seguinte
 * ao da compra, pulando sábado e domingo.
 *
 * Ex.: compra em 06/07/2026 -> mês seguinte começa em 01/08/2026 (sábado) ->
 *      pula para 03/08/2026 (segunda-feira).
 *
 * @param base data da compra (padrão: agora)
 * @returns data no formato ISO 'yyyy-mm-dd' (sem componente de hora)
 */
export function primeiroDiaUtilMesSeguinte(base: Date = new Date()): string {
  // Dia 1 do mês seguinte (o construtor normaliza dezembro -> janeiro do ano seguinte).
  const d = new Date(base.getFullYear(), base.getMonth() + 1, 1);

  // getDay(): 0 = domingo, 6 = sábado. Avança até cair em dia útil.
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }

  // Formata como yyyy-mm-dd em horário local (evita deslocamento de fuso do toISOString).
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}
