import React from 'react';
import { Link } from 'react-router-dom';
import { themeTokens, LOGO_URL } from '@lib/theme.js';

export default function PrivacyPolicyPage() {
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
          <h1 className={`text-4xl font-bold mb-2 ${T.text}`}>Privacy Policy</h1>
          <p className={`text-sm ${T.subtext} mb-8`}>
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>1. Introduzione</h2>
              <p className={`${T.subtext}`}>
                Play-Sport.pro gestisce la piattaforma play-sport.pro. Questa pagina ti informa delle nostre
                politiche riguardanti la raccolta, l'uso e la divulgazione dei dati personali quando utilizzi
                il Servizio.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>2. Raccolta e Utilizzo dei Dati</h2>
              <p className={`${T.subtext} mb-3`}>Raccogliamo diversi tipi di informazioni per vari scopi:</p>
              <ul className={`list-disc pl-6 space-y-2 ${T.subtext}`}>
                <li>
                  <strong>Informazioni di Account:</strong> Nome, email, numero di telefono, data di nascita,
                  indirizzo
                </li>
                <li>
                  <strong>Informazioni sulla Navigazione:</strong> Pagine visitate, tempo trascorso, azioni
                  intraprese
                </li>
                <li>
                  <strong>Informazioni di Dispositivo:</strong> Tipo di dispositivo, sistema operativo, browser
                </li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>3. Utilizzo dei Dati</h2>
              <p className={`${T.subtext} mb-3`}>Utilizziamo i dati raccolti per:</p>
              <ul className={`list-disc pl-6 space-y-2 ${T.subtext}`}>
                <li>Fornire e mantenere il Servizio</li>
                <li>Notificarti di modifiche al Servizio</li>
                <li>Fornire assistenza ai clienti</li>
                <li>Migliorare il Servizio</li>
                <li>Rilevare e prevenire frodi</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>4. Sicurezza dei Dati</h2>
              <p className={`${T.subtext}`}>
                Cerchiamo di utilizzare mezzi commercialmente accettabili per proteggere i tuoi dati personali,
                non possiamo garantire la sua assoluta sicurezza.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>5. Condivisione dei Dati</h2>
              <p className={`${T.subtext}`}>
                Non vendiamo o trasferimmo i tuoi dati personali a terze parti. Possiamo divulgare i tuoi dati
                se richiesto dalla legge.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>6. Cookie e Tecnologie Simili</h2>
              <p className={`${T.subtext}`}>
                Utilizziamo cookie e tecnologie di tracciamento simili per monitorare l'attività sul nostro
                Servizio. Puoi istruire il tuo browser a rifiutare tutti i cookie.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>7. I Tuoi Diritti</h2>
              <p className={`${T.subtext} mb-3`}>Hai il diritto di:</p>
              <ul className={`list-disc pl-6 space-y-2 ${T.subtext}`}>
                <li>Accedere ai dati personali che conserviamo su di te</li>
                <li>Correggere dati inesatti</li>
                <li>Richiedere l'eliminazione dei tuoi dati</li>
                <li>Richiedere la portabilità dei dati</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>8. Conformità GDPR</h2>
              <p className={`${T.subtext}`}>
                Se sei un residente dell'UE, hai diritto alle protezioni del GDPR. Elaboriamo i tuoi dati
                personali solo quando abbiamo una base legale.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>9. Contatti</h2>
              <div className={`${T.inputBg} rounded-lg p-4 border ${T.border}`}>
                <p className={`${T.text} font-medium`}>Play-Sport.pro - Privacy Team</p>
                <p className={`${T.subtext}`}>Email: privacy@play-sport.pro</p>
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
