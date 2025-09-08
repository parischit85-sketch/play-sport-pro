import { j as a, _ as y } from './index-DPfO8u6W.js';
import './router-CwEi7VLz.js';
function N({ title: o, url: u, captureRef: g, captionBuilder: l, size: f = 'sm', T: s }) {
  const n = u || (typeof window < 'u' ? window.location.href : ''),
    i = (typeof l == 'function' ? l() : '') || o || 'Sporting Cat',
    r = f === 'sm' ? s.btnGhostSm : s.btnGhost,
    d = (e) => window.open(e, '_blank', 'noopener,noreferrer');
  async function p() {
    try {
      navigator.share
        ? await navigator.share({ title: o || 'Sporting Cat', text: i, url: n })
        : (await navigator.clipboard.writeText(n), alert('Link copiato negli appunti!'));
    } catch {}
  }
  function w() {
    if (!n) return p();
    d('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(n));
  }
  function b(e, c) {
    const t = document.createElement('a');
    ((t.href = c),
      (t.download = e),
      (t.rel = 'noopener'),
      (t.style.display = 'none'),
      document.body.appendChild(t),
      t.click(),
      setTimeout(() => document.body.removeChild(t), 100));
  }
  async function x() {
    const e = g?.current || null;
    if (e)
      try {
        const c = await y(() => import('./index-Cs9OzAhw.js'), []),
          t = s?.name === 'dark' ? '#0a0a0a' : '#fafafa',
          m = await c.toPng(e, { pixelRatio: 2, backgroundColor: t });
        try {
          const v = await (await fetch(m)).blob(),
            h = new File([v], 'padel-league.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [h] })) {
            await navigator.share({ files: [h], title: o || 'Sporting Cat', text: i });
            return;
          }
        } catch {}
        b('padel-league.png', m);
        try {
          await navigator.clipboard.writeText(i);
        } catch {}
        alert('Immagine scaricata e didascalia copiata! Apri Instagram e caricala.');
        return;
      } catch {}
    try {
      await navigator.clipboard.writeText(
        i +
          (n
            ? `
${n}`
            : '')
      );
    } catch {}
    d('https://www.instagram.com/');
  }
  return a.jsxs('div', {
    className: 'flex items-center gap-1 sm:gap-2 flex-wrap',
    children: [
      a.jsxs('button', {
        type: 'button',
        onClick: p,
        className: r,
        title: 'Condividi',
        children: [
          a.jsx('span', { className: 'sm:hidden', children: '📤' }),
          a.jsx('span', { className: 'hidden sm:inline', children: 'Condividi' }),
        ],
      }),
      a.jsxs('button', {
        type: 'button',
        onClick: w,
        className: r,
        title: 'Condividi su Facebook',
        children: [
          a.jsx('span', { className: 'sm:hidden', children: 'f' }),
          a.jsx('span', { className: 'hidden sm:inline', children: 'Facebook' }),
        ],
      }),
      a.jsxs('button', {
        type: 'button',
        onClick: x,
        className: r,
        title: 'Condividi su Instagram',
        children: [
          a.jsx('span', { className: 'sm:hidden', children: '📸' }),
          a.jsx('span', { className: 'hidden sm:inline', children: 'Instagram' }),
        ],
      }),
    ],
  });
}
export { N as S };
