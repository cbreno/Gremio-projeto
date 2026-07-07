// Postos/graduações oferecidos no cadastro (select). Ajuste conforme o efetivo.
export const POSTOS = [
  "Sd",
  "Cb",
  "3º Sgt",
  "2º Sgt",
  "1º Sgt",
  "Subten",
  "Asp",
  "2º Ten",
  "1º Ten",
  "Cap",
  "Maj",
  "TC",
  "Cel",
] as const;

export type Posto = (typeof POSTOS)[number];
