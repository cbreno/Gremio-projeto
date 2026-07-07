import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Renderiza o QR Code a partir do payload "PIX Copia e Cola".
export function QRCodePix({ payload }: { payload: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(payload, { margin: 1, width: 240 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [payload]);

  if (!dataUrl) {
    return (
      <div className="mx-auto flex h-[240px] w-[240px] items-center justify-center rounded-xl bg-lona/60 font-mono text-xs text-tinta/60">
        Gerando QR…
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code PIX"
      className="mx-auto rounded-xl border border-latao/30 bg-white p-2"
      width={240}
      height={240}
    />
  );
}
