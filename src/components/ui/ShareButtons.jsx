// =============================================
// FILE: src/components/ui/ShareButtons.jsx
// =============================================
import React from "react";
export default function ShareButtons({
  title,
  url,
  captureRef,
  captionBuilder,
  size = "sm",
  T,
}) {
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const caption =
    (typeof captionBuilder === "function" ? captionBuilder() : "") ||
    title ||
    "Sporting Cat";
  const Btn = size === "sm" ? T.btnGhostSm : T.btnGhost;
  const openWin = (u) => window.open(u, "_blank", "noopener,noreferrer");

  async function shareNative() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Sporting Cat",
          text: caption,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copiato negli appunti!");
      }
    } catch {}
  }
  function shareFacebook() {
    if (!shareUrl) return shareNative();
    openWin(
      "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(shareUrl),
    );
  }
  function downloadDataURL(name, dataUrl) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
  }
  async function shareInstagram() {
    const node = captureRef?.current || null;
    if (node) {
      try {
        const mod = await import("html-to-image");
        const bg = T?.name === "dark" ? "#0a0a0a" : "#fafafa";
        const dataUrl = await mod.toPng(node, {
          pixelRatio: 2,
          backgroundColor: bg,
        });
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], "padel-league.png", {
            type: "image/png",
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: title || "Sporting Cat",
              text: caption,
            });
            return;
          }
        } catch {}
        downloadDataURL("padel-league.png", dataUrl);
        try {
          await navigator.clipboard.writeText(caption);
        } catch {}
        alert(
          "Immagine scaricata e didascalia copiata! Apri Instagram e caricala.",
        );
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(
        caption + (shareUrl ? `\n${shareUrl}` : ""),
      );
    } catch {}
    openWin("https://www.instagram.com/");
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
      <button
        type="button"
        onClick={shareNative}
        className={Btn}
        title="Condividi"
      >
        <span className="sm:hidden">📤</span>
        <span className="hidden sm:inline">Condividi</span>
      </button>
      <button
        type="button"
        onClick={shareFacebook}
        className={Btn}
        title="Condividi su Facebook"
      >
        <span className="sm:hidden">f</span>
        <span className="hidden sm:inline">Facebook</span>
      </button>
      <button
        type="button"
        onClick={shareInstagram}
        className={Btn}
        title="Condividi su Instagram"
      >
        <span className="sm:hidden">📸</span>
        <span className="hidden sm:inline">Instagram</span>
      </button>
    </div>
  );
}
