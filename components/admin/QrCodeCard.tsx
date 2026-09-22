"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/context/LocaleContext";

// Generated from the page's own origin, so it always points at wherever the
// site is actually live (no domain hardcoded here to go stale later).
export default function QrCodeCard() {
  const { t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [siteUrl, setSiteUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    // window.location isn't available during SSR, so this one-time read has to
    // happen after mount -- not a loop, this effect has no dependency on siteUrl.
    const url = window.location.origin + "/";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSiteUrl(url);
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, url, { width: 512, margin: 2 }, (err) => {
      if (err) setError(true);
    });
  }, []);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "eves-sweets-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5">
      <h2 className="mb-1 text-sm font-semibold text-foreground">{t.admin_qr_title}</h2>
      <p className="mb-3.5 text-xs text-foreground-soft">{t.admin_qr_subtitle}</p>
      {error ? (
        <p className="text-xs text-brand-danger">{t.admin_qr_error}</p>
      ) : (
        <>
          <canvas ref={canvasRef} className="h-40 w-40 rounded-xl border border-border" />
          <p className="mt-2 break-all text-[11px] text-foreground-soft">{siteUrl}</p>
          <button
            type="button"
            onClick={handleDownload}
            className="mt-3 rounded-full bg-brand-pink px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-pink-dark"
          >
            {t.admin_qr_download}
          </button>
        </>
      )}
    </div>
  );
}
