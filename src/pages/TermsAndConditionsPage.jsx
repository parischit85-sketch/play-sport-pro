import React from 'react';
import { Link } from 'react-router-dom';
import { themeTokens, LOGO_URL } from '@lib/theme.js';

export default function TermsAndConditionsPage() {
  const T = React.useMemo(() => themeTokens(), []);

  return (
    <div className={`min-h-screen ${T.pageBg} ${T.text}`}>
      <header className={`sticky top-0 z-20 ${T.headerBg} border-b ${T.border}`}>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80">
            <div className="h-10 w-auto rounded-md shadow shrink-0 flex items-center">
              <img
                src={LOGO_URL}
                alt="Play-Sport.pro"
                className="h-10 w-auto select-none"
                draggable={false}
              />
            </div>
          </Link>
          <div />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className={`${T.cardBg} rounded-xl p-6 sm:p-8 border ${T.border}`}>
          <h1 className={`text-4xl font-bold mb-2 ${T.text}`}>Termini e Condizioni</h1>
          <p className={`text-sm ${T.subtext} mb-8`}>
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>1. Introduzione</h2>
              <p className={`${T.subtext}`}>
                Benvenuto su Play-Sport.pro. Questi Termini e Condizioni disciplinano l'uso della nostra
                piattaforma. Accedendo e utilizzando il servizio, accetti di essere vincolato da questi Termini.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>2. Definizioni</h2>
              <ul className={`list-disc pl-6 space-y-2 ${T.subtext}`}>
                <li>
                  <strong>Servizio:</strong> La piattaforma Play-Sport.pro e tutti i contenuti forniti.
                </li>
                <li>
                  <strong>Utente:</strong> Qualsiasi persona che accede e utilizza il Servizio.
                </li>
                <li>
                  <strong>Account:</strong> L'account personale creato dall'Utente per accedere al Servizio.
                </li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>3. Registrazione e Account</h2>
              <p className={`${T.subtext}`}>
                Per utilizzare il Servizio, devi registrarti e creare un Account. Ti impegni a fornire
                informazioni accurate e complete durante la registrazione. Sei responsabile della segretezza
                della tua password.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>4. Utilizzo Accettabile</h2>
              <p className={`${T.subtext} mb-3`}>Ti impegni a non utilizzare il Servizio per:</p>
              <ul className={`list-disc pl-6 space-y-2 ${T.subtext}`}>
                <li>Attività illegali o fraudolente</li>
                <li>Violazione dei diritti di terzi</li>
                <li>Molestie o abusi</li>
                <li>Violazione della privacy altrui</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>5. Proprietà Intellettuale</h2>
              <p className={`${T.subtext}`}>
                Tutti i contenuti del Servizio sono proprietà di Play-Sport.pro e protetti dalle leggi sulla
                proprietà intellettuale.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>6. Limitazione di Responsabilità</h2>
              <p className={`${T.subtext}`}>
                IL SERVIZIO È FORNITO "COSÌ COM'È" SENZA GARANZIE. PLAY-SPORT.PRO NON GARANTISCE CHE IL
                SERVIZIO SARÀ ININTERROTTO O SICURO.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>7. Modifiche ai Termini</h2>
              <p className={`${T.subtext}`}>
                Play-Sport.pro si riserva il diritto di modificare questi Termini in qualsiasi momento.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>8. Contatti</h2>
              <div className={`${T.inputBg} rounded-lg p-4 border ${T.border}`}>
                <p className={`${T.text} font-medium`}>Play-Sport.pro</p>
                <p className={`${T.subtext}`}>Email: support@play-sport.pro</p>
              </div>
            </section>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              to="/"
              className={`${T.btnPrimary} px-6 py-2 rounded-md hover:opacity-90 transition-opacity`}
            >
              Torna alla Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
