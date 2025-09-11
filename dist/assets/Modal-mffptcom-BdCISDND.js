import { j as e } from './index-mffptcom-DDEOMtjD.js';
import './router-mffptcom-C1Xlp-63.js';
function c({ open: o, isOpen: t, onClose: a, title: d, children: s, T: n, size: l = 'md' }) {
  if (!(typeof t == 'boolean' ? t : o)) return null;
  const i = {
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
        className: 'absolute inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm',
        role: 'button',
        tabIndex: 0,
        'aria-label': 'Chiudi modale',
        onClick: a,
        onKeyDown: (r) => {
          (r.key === 'Escape' || r.key === 'Enter' || r.key === ' ') && (r.preventDefault(), a());
        },
      }),
      e.jsxs('div', {
        className: `relative z-10 rounded-3xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl 
          border border-white/30 dark:border-gray-700/30 p-6 lg:p-8 ${i[l]} 
          shadow-2xl shadow-gray-900/20 dark:shadow-black/40 max-h-[85vh] md:max-h-[90vh] 
          overflow-y-auto mb-16 md:mb-0`,
        style: { paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' },
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between mb-6',
            children: [
              e.jsx('h3', {
                className: 'text-xl font-bold text-gray-900 dark:text-white',
                children: d,
              }),
              e.jsx('button', {
                type: 'button',
                onClick: a,
                className: `w-10 h-10 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm 
              border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 
              transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white
              flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105`,
                children: '✕',
              }),
            ],
          }),
          e.jsx('div', { className: 'text-sm pb-4 md:pb-0', children: s }),
        ],
      }),
    ],
  });
}
export { c as M };
