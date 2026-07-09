// Compressão de imagem no próprio navegador (sem dependências).
// Redimensiona para um lado máximo e reduz a qualidade JPEG até caber no alvo.
// Arquivos que não são imagem (ex.: PDF de comprovante) passam sem alteração.

interface OpcoesCompressao {
  /** Maior lado da imagem (px) após redimensionar. */
  maxLado?: number;
  /** Tamanho alvo em KB. Reduz a qualidade até chegar perto disso. */
  alvoKB?: number;
  /** Qualidade JPEG inicial (0–1). */
  qualidadeInicial?: number;
}

function carregarImagem(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao ler a imagem."));
    };
    img.src = url;
  });
}

function canvasParaBlob(canvas: HTMLCanvasElement, qualidade: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem."))),
      "image/jpeg",
      qualidade,
    );
  });
}

export async function comprimirImagem(
  file: File,
  { maxLado = 1280, alvoKB = 300, qualidadeInicial = 0.8 }: OpcoesCompressao = {},
): Promise<File> {
  // Só comprime imagens rasterizadas; PDF/outros seguem intactos.
  if (!file.type.startsWith("image/")) return file;

  const img = await carregarImagem(file);

  // Calcula as novas dimensões mantendo a proporção.
  const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
  const largura = Math.round(img.width * escala);
  const altura = Math.round(img.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file; // navegador sem canvas: usa o original
  ctx.drawImage(img, 0, 0, largura, altura);

  // Vai baixando a qualidade até ficar abaixo do alvo (ou atingir o piso).
  let qualidade = qualidadeInicial;
  let blob = await canvasParaBlob(canvas, qualidade);
  while (blob.size / 1024 > alvoKB && qualidade > 0.4) {
    qualidade -= 0.1;
    blob = await canvasParaBlob(canvas, qualidade);
  }

  // Se por algum motivo ficou maior que o original, mantém o original.
  if (blob.size >= file.size) return file;

  const nome = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], nome, { type: "image/jpeg", lastModified: Date.now() });
}
