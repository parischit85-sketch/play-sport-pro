import { j as t } from './index-mfh82qsn-DzXPqwq9.js';
import { r as x, a as b } from './router-mfh82qsn-Bc5I10Ra.js';
function w({ open: s, isOpen: o, onClose: a, title: n, children: d, T: u, size: l = 'md' }) {
  const r = typeof o == 'boolean' ? o : s;
  if (
    (x.useEffect(() => {
      if (r) {
        document.body.style.overflow = 'hidden';
        const e = (c) => {
          c.key === 'Escape' && a();
        };
        return (
          document.addEventListener('keydown', e),
          () => {
            ((document.body.style.overflow = ''), document.removeEventListener('keydown', e));
          }
        );
      }
    }, [r, a]),
    !r)
  )
    return null;
  const i = {
      sm: 'w-[min(480px,92vw)]',
      md: 'w-[min(820px,95vw)] max-w-2xl',
      lg: 'w-[min(1024px,95vw)] max-w-4xl',
      xl: 'w-[min(1200px,95vw)] max-w-6xl',
    },
    m = t.jsxs('div', {
      className: 'fixed inset-0 flex items-center justify-center p-2 sm:p-3 modal-overlay',
      'aria-modal': 'true',
      role: 'dialog',
      style: { animation: 'fadeIn 0.2s ease-out', zIndex: 2147483647 },
      children: [
        t.jsx('div', {
          className: 'absolute inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm',
          role: 'button',
          tabIndex: 0,
          'aria-label': 'Chiudi modale',
          onClick: a,
          onKeyDown: (e) => {
            (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), a());
          },
        }),
        t.jsxs('div', {
          className: `relative rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl 
          border border-white/30 dark:border-gray-700/30 p-3 sm:p-4 lg:p-5 ${i[l]} 
          shadow-2xl shadow-gray-900/20 dark:shadow-black/40 max-h-[92vh] sm:max-h-[88vh] 
          overflow-y-auto transform transition-all duration-300 mx-auto my-auto modal-content`,
          style: {
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)',
            animation: 'slideIn 0.3s ease-out',
            zIndex: 2147483647,
          },
          children: [
            t.jsxs('div', {
              className: 'flex items-center justify-between mb-4',
              children: [
                t.jsx('h3', {
                  className: 'text-lg font-bold text-gray-900 dark:text-white',
                  children: n,
                }),
                t.jsx('button', {
                  type: 'button',
                  onClick: a,
                  className: `w-8 h-8 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm 
              border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 
              transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white
              flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105`,
                  children: '✕',
                }),
              ],
            }),
            t.jsx('div', { className: 'text-sm pb-2 md:pb-0', children: d }),
          ],
        }),
      ],
    });
  return b.createPortal(m, document.body);
}
export { w as M };
