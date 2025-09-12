import { t as r, j as e } from './index-mfgpn7fg-C0gX905a.js';
import { b as d } from './router-mfgpn7fg-7pyUyyy2.js';
import { c as l } from './design-system-mfgpn7fg-B5fzZ68S.js';
import './vendor-mfgpn7fg-D3F3s8fL.js';
import './firebase-mfgpn7fg-X_I_guKF.js';
function c() {
  const a = d.useMemo(() => r(), []),
    s = d.useMemo(() => l(a), [a]);
  return e.jsx('div', {
    className: `${a.pageBg} ${a.text} p-8 min-h-screen`,
    children: e.jsxs('div', {
      className: 'max-w-4xl mx-auto space-y-8',
      children: [
        e.jsx('div', {
          className: a.headerBg,
          children: e.jsxs('div', {
            className: 'p-6 rounded-lg',
            children: [
              e.jsx('h1', { className: s.h1, children: 'Test Dark Mode' }),
              e.jsx('p', {
                className: s.bodySm,
                children:
                  "Questo componente testa l'aspetto del sito in modalità chiara e scura. Cambia le impostazioni del browser per vedere la differenza.",
              }),
            ],
          }),
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
          children: [
            e.jsxs('div', {
              className: a.card,
              children: [
                e.jsx('h2', { className: s.h2, children: 'Card Standard' }),
                e.jsx('p', {
                  className: s.body,
                  children: 'Questo è il contenuto di una card normale.',
                }),
                e.jsxs('div', {
                  className: 'mt-4 space-y-2',
                  children: [
                    e.jsx('div', {
                      className: `${s.bgSecondary} p-3 rounded`,
                      children: e.jsx('span', {
                        className: s.textSecondary,
                        children: 'Sfondo secondario',
                      }),
                    }),
                    e.jsx('div', {
                      className: `${s.bgMuted} p-3 rounded`,
                      children: e.jsx('span', { className: s.textMuted, children: 'Sfondo muted' }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: a.cardHover,
              children: [
                e.jsx('h2', { className: s.h2, children: 'Card Hover' }),
                e.jsx('p', { className: s.body, children: 'Questa card ha effetti hover.' }),
                e.jsxs('div', {
                  className: 'mt-4 flex gap-2',
                  children: [
                    e.jsx('span', {
                      className: `px-3 py-1 rounded-full ${s.success}`,
                      children: 'Success',
                    }),
                    e.jsx('span', {
                      className: `px-3 py-1 rounded-full ${s.error}`,
                      children: 'Error',
                    }),
                    e.jsx('span', {
                      className: `px-3 py-1 rounded-full ${s.warning}`,
                      children: 'Warning',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: a.card,
          children: [
            e.jsx('h2', { className: s.h2, children: 'Bottoni' }),
            e.jsx('div', {
              className: 'space-y-4',
              children: e.jsxs('div', {
                className: 'flex flex-wrap gap-3',
                children: [
                  e.jsx('button', { className: a.btnPrimary, children: 'Bottone Primario' }),
                  e.jsx('button', { className: a.btnGhost, children: 'Bottone Ghost' }),
                  e.jsx('button', { className: a.btnGhostSm, children: 'Bottone Small' }),
                ],
              }),
            }),
          ],
        }),
        e.jsxs('div', {
          className: a.card,
          children: [
            e.jsx('h2', { className: s.h2, children: 'Elementi Form' }),
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('label', { className: s.label, children: 'Nome' }),
                    e.jsx('input', {
                      type: 'text',
                      placeholder: 'Inserisci il nome',
                      className: a.input,
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx('label', { className: s.label, children: 'Email' }),
                    e.jsx('input', {
                      type: 'email',
                      placeholder: "Inserisci l'email",
                      className: a.input,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsx('div', {
          className: a.card,
          children: e.jsxs('div', {
            className: 'space-y-3',
            children: [
              e.jsx('h1', { className: s.h1, children: 'Heading 1' }),
              e.jsx('h2', { className: s.h2, children: 'Heading 2' }),
              e.jsx('h3', { className: s.h3, children: 'Heading 3' }),
              e.jsx('p', {
                className: s.body,
                children:
                  'Questo è un paragrafo normale con testo body. Il colore dovrebbe adattarsi automaticamente al tema del browser.',
              }),
              e.jsx('p', {
                className: s.bodySm,
                children: 'Questo è testo più piccolo (bodySm) per informazioni secondarie.',
              }),
              e.jsx('div', { className: s.label, children: 'ETICHETTA MAIUSCOLA' }),
            ],
          }),
        }),
        e.jsxs('div', {
          className: a.card,
          children: [
            e.jsx('h2', { className: s.h2, children: 'Test Colori' }),
            e.jsxs('div', {
              className: 'grid grid-cols-2 md:grid-cols-4 gap-4 mt-4',
              children: [
                e.jsx('div', {
                  className: `${s.textPrimary} p-3 border rounded`,
                  children: 'Testo Primario',
                }),
                e.jsx('div', {
                  className: `${s.textSecondary} p-3 border rounded`,
                  children: 'Testo Secondario',
                }),
                e.jsx('div', {
                  className: `${s.textMuted} p-3 border rounded`,
                  children: 'Testo Muted',
                }),
                e.jsx('div', {
                  className: `${s.textAccent} p-3 border rounded`,
                  children: 'Testo Accent',
                }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: `${a.card} text-center`,
          children: [
            e.jsx('h3', { className: s.h3, children: 'Info Browser' }),
            e.jsxs('p', {
              className: s.bodySm,
              children: [
                'Modalità Preferita:',
                ' ',
                e.jsx('span', {
                  className: 'font-mono dark:text-yellow-400',
                  children:
                    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                      ? 'DARK'
                      : 'LIGHT',
                }),
              ],
            }),
            e.jsx('p', {
              className: s.bodySm,
              children: 'Per testare: vai nelle impostazioni del browser/sistema e cambia il tema.',
            }),
          ],
        }),
      ],
    }),
  });
}
function h() {
  return e.jsx(c, {});
}
export { h as default };
