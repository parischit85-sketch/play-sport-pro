// =============================================
// FILE: src/components/ui/DarkModeTest.jsx
// Componente per testare il dark mode
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';
import { createDSClasses } from '@lib/design-system.js';

export default function DarkModeTest() {
  const T = React.useMemo(() => themeTokens(), []);
  const ds = React.useMemo(() => createDSClasses(T), [T]);

  return (
    <div className={`${T.pageBg} ${T.text} p-8 min-h-screen`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className={T.headerBg}>
          <div className="p-6 rounded-lg">
            <h1 className={ds.h1}>Test Dark Mode</h1>
            <p className={ds.bodySm}>
              Questo componente testa l'aspetto del sito in modalità chiara e scura. Cambia le
              impostazioni del browser per vedere la differenza.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={T.card}>
            <h2 className={ds.h2}>Card Standard</h2>
            <p className={ds.body}>Questo è il contenuto di una card normale.</p>
            <div className="mt-4 space-y-2">
              <div className={`${ds.bgSecondary} p-3 rounded`}>
                <span className={ds.textSecondary}>Sfondo secondario</span>
              </div>
              <div className={`${ds.bgMuted} p-3 rounded`}>
                <span className={ds.textMuted}>Sfondo muted</span>
              </div>
            </div>
          </div>

          <div className={T.cardHover}>
            <h2 className={ds.h2}>Card Hover</h2>
            <p className={ds.body}>Questa card ha effetti hover.</p>
            <div className="mt-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full ${ds.success}`}>Success</span>
              <span className={`px-3 py-1 rounded-full ${ds.error}`}>Error</span>
              <span className={`px-3 py-1 rounded-full ${ds.warning}`}>Warning</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className={T.card}>
          <h2 className={ds.h2}>Bottoni</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className={T.btnPrimary}>Bottone Primario</button>
              <button className={T.btnGhost}>Bottone Ghost</button>
              <button className={T.btnGhostSm}>Bottone Small</button>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className={T.card}>
          <h2 className={ds.h2}>Elementi Form</h2>
          <div className="space-y-4">
            <div>
              <label className={ds.label}>Nome</label>
              <input type="text" placeholder="Inserisci il nome" className={T.input} />
            </div>
            <div>
              <label className={ds.label}>Email</label>
              <input type="email" placeholder="Inserisci l'email" className={T.input} />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className={T.card}>
          <div className="space-y-3">
            <h1 className={ds.h1}>Heading 1</h1>
            <h2 className={ds.h2}>Heading 2</h2>
            <h3 className={ds.h3}>Heading 3</h3>
            <p className={ds.body}>
              Questo è un paragrafo normale con testo body. Il colore dovrebbe adattarsi
              automaticamente al tema del browser.
            </p>
            <p className={ds.bodySm}>
              Questo è testo più piccolo (bodySm) per informazioni secondarie.
            </p>
            <div className={ds.label}>ETICHETTA MAIUSCOLA</div>
          </div>
        </div>

        {/* Colors Test */}
        <div className={T.card}>
          <h2 className={ds.h2}>Test Colori</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className={`${ds.textPrimary} p-3 border rounded`}>Testo Primario</div>
            <div className={`${ds.textSecondary} p-3 border rounded`}>Testo Secondario</div>
            <div className={`${ds.textMuted} p-3 border rounded`}>Testo Muted</div>
            <div className={`${ds.textAccent} p-3 border rounded`}>Testo Accent</div>
          </div>
        </div>

        {/* Browser Info */}
        <div className={`${T.card} text-center`}>
          <h3 className={ds.h3}>Info Browser</h3>
          <p className={ds.bodySm}>
            Modalità Preferita:{' '}
            <span className="font-mono dark:text-yellow-400">
              {window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'DARK'
                : 'LIGHT'}
            </span>
          </p>
          <p className={ds.bodySm}>
            Per testare: vai nelle impostazioni del browser/sistema e cambia il tema.
          </p>
        </div>
      </div>
    </div>
  );
}
