/**
 * Geração do payload "PIX Copia e Cola" (BR Code) no padrão EMV do Banco Central,
 * a partir de uma chave PIX estática. Sem dependências externas nem gateway.
 *
 * Referência: Manual do BR Code / EMV QRCPS-MPM (Bacen).
 */

/** Monta um campo EMV: ID (2) + tamanho (2, com zero à esquerda) + valor. */
function campo(id: string, valor: string): string {
  const tamanho = valor.length.toString().padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

/**
 * CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) exigido pelo BR Code.
 * Retorna 4 dígitos hexadecimais em maiúsculas.
 */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Remove acentos e caracteres não permitidos em nome/cidade do BR Code. */
function sanitiza(texto: string, max: number): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (marcas combinantes)
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .trim()
    .slice(0, max);
}

export interface DadosPix {
  chave: string;
  nome: string;
  cidade: string;
  /** Valor em reais. Se omitido, gera BR Code sem valor definido. */
  valor?: number;
  /** Identificador do pagamento (txid). Padrão "***". */
  txid?: string;
}

/**
 * Gera a string do "PIX Copia e Cola" (também usada para renderizar o QR Code).
 */
export function gerarPixCopiaECola({
  chave,
  nome,
  cidade,
  valor,
  txid = "***",
}: DadosPix): string {
  // Merchant Account Information (ID 26): GUI fixo do PIX + chave.
  const mai =
    campo("00", "br.gov.bcb.pix") + campo("01", chave.trim());

  // Additional Data Field (ID 62): reference label (txid).
  const adf = campo("05", txid.slice(0, 25) || "***");

  let payload =
    campo("00", "01") + // Payload Format Indicator
    campo("26", mai) + // Merchant Account Information (PIX)
    campo("52", "0000") + // Merchant Category Code
    campo("53", "986") + // Moeda: BRL
    (valor !== undefined ? campo("54", valor.toFixed(2)) : "") +
    campo("58", "BR") + // País
    campo("59", sanitiza(nome, 25)) + // Nome do recebedor
    campo("60", sanitiza(cidade, 15)) + // Cidade do recebedor
    campo("62", adf); // Dados adicionais

  // CRC16 (ID 63) sempre por último; calcula-se sobre o payload + "6304".
  payload += "6304";
  return payload + crc16(payload);
}

/**
 * Lê os dados PIX do quartel do ambiente (.env) e gera o Copia e Cola.
 */
export function pixDoQuartel(valor: number, txid?: string): string {
  return gerarPixCopiaECola({
    chave: import.meta.env.VITE_PIX_CHAVE,
    nome: import.meta.env.VITE_PIX_NOME,
    cidade: import.meta.env.VITE_PIX_CIDADE,
    valor,
    txid,
  });
}
