import { j as s } from './index-mfi3xrqx-VPQ73D1g.js';
import './router-mfi3xrqx-CHJqmtwD.js';
function o({ title: a, right: t, children: c, T: e, variant: d = 'default' }) {
  const r = {
    default: e.card,
    elevated: e.cardHover,
    minimal: `${e.borderLg} ${e.cardBg} ${e.border} ${e.spacingMd}`,
    compact: `${e.borderMd} ${e.cardBg} ${e.border} ${e.spacingSm}`,
  };
  return s.jsxs('section', {
    className: 'mb-6',
    children: [
      s.jsxs('div', {
        className: 'flex items-center justify-between mb-3',
        children: [
          s.jsx('h2', { className: `text-xl font-semibold ${e.neonText}`, children: a }),
          t,
        ],
      }),
      s.jsx('div', { className: r[d] || r.default, children: c }),
    ],
  });
}
export { o as S };
