import { j as e } from './index-DPfO8u6W.js';
import './router-CwEi7VLz.js';
function c({ open: i, onClose: s, title: a, children: l, T: m, size: n = 'md' }) {
  if (!i) return null;
  const r = {
    sm: 'w-[min(480px,92vw)]',
    md: 'w-[min(820px,92vw)]',
    lg: 'w-[min(1024px,92vw)]',
    xl: 'w-[min(1200px,92vw)]',
  };
  return e.jsxs('div', {
    className: 'fixed inset-0 z-[1000000] flex items-center justify-center',
    'aria-modal': 'true',
    role: 'dialog',
    children: [
      e.jsx('div', {
        className: 'absolute inset-0 bg-black/60',
        role: 'button',
        tabIndex: 0,
        'aria-label': 'Chiudi modale',
        onClick: s,
        onKeyDown: (t) => {
          (t.key === 'Escape' || t.key === 'Enter' || t.key === ' ') && (t.preventDefault(), s());
        },
      }),
      e.jsxs('div', {
        className: `relative z-10 rounded-2xl bg-white ring-1 ring-black/10 p-4 lg:p-6 ${r[n]} shadow-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto mb-16 md:mb-0`,
        style: { paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' },
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between mb-4',
            children: [
              e.jsx('h3', { className: 'text-lg font-semibold', children: a }),
              e.jsx('button', {
                type: 'button',
                onClick: s,
                className: 'px-3 py-1 rounded-lg ring-1 ring-black/10 hover:bg-black/5 transition',
                children: '✕',
              }),
            ],
          }),
          e.jsx('div', { className: 'text-sm pb-4 md:pb-0', children: l }),
        ],
      }),
    ],
  });
}
export { c as M };
