import { j as e } from './index-mfibl1yk-D2ihnd7m.js';
import './router-mfibl1yk-BvCXkbo6.js';
const s = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    primary: 'bg-emerald-500 text-white font-medium',
  },
  n = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };
function p({
  children: d,
  variant: l = 'default',
  size: x = 'sm',
  icon: t,
  removable: m = !1,
  onRemove: r,
  T: a,
}) {
  const i = s[l] || s.default,
    o = n[x] || n.sm,
    b = a?.borderMd || 'rounded-md',
    g = a?.transitionFast || 'transition-all duration-200';
  return e.jsxs('span', {
    className: `
      inline-flex items-center gap-1 
      ${b} 
      ${i} 
      ${o}
      font-medium
      ${g}
    `,
    children: [
      t && e.jsx('span', { className: 'w-3 h-3', children: t }),
      d,
      m &&
        r &&
        e.jsx('button', {
          onClick: r,
          className:
            'ml-1 hover:bg-black/10 rounded-full w-3 h-3 flex items-center justify-center text-xs',
          children: '×',
        }),
    ],
  });
}
export { p as B };
