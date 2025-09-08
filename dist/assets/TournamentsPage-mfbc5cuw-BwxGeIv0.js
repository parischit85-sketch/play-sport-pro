import { j as e, k as s, t as i } from './index-mfbc5cuw-B5KdbvAg.js';
import { c as n, b as o } from './router-mfbc5cuw-tw9hraEf.js';
import { S as c } from './Section-mfbc5cuw-CH6um2i6.js';
import './vendor-mfbc5cuw-D3F3s8fL.js';
import './firebase-mfbc5cuw-jcIpuiEY.js';
function l({ T: a }) {
  return e.jsx(c, {
    title: 'Crea Tornei',
    T: a,
    children: e.jsx('div', {
      className: `text-sm ${a.subtext}`,
      children: 'Qui potrai creare e gestire i tornei (funzionalità in sviluppo).',
    }),
  });
}
function b() {
  const a = n(),
    { clubMode: r } = s(),
    t = o.useMemo(() => i(), []);
  return r
    ? e.jsx(l, { T: t })
    : e.jsxs('div', {
        className: `text-center py-12 ${t.cardBg} ${t.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
          e.jsx('h3', {
            className: `text-xl font-bold mb-2 ${t.text}`,
            children: 'Modalità Club Richiesta',
          }),
          e.jsx('p', {
            className: `${t.subtext} mb-4`,
            children:
              'Per accedere alla creazione tornei, devi prima sbloccare la modalità club nella sezione Extra.',
          }),
          e.jsx('button', {
            onClick: () => a('/extra'),
            className: `${t.btnPrimary} px-6 py-3`,
            children: 'Vai a Extra per sbloccare',
          }),
        ],
      });
}
export { b as default };
