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
                Play-Sport.pro ("noi", "nostro" o "ci") gestisce la piattaforma play-sport.pro e l'applicazione mobile Play Sport Pro. 
                Questa pagina ti informa delle nostre politiche riguardanti la raccolta, l'uso e la divulgazione dei dati personali quando utilizzi il nostro Servizio.
                Utilizzando il Servizio, accetti la raccolta e l'utilizzo delle informazioni in conformità con questa politica.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>2. Raccolta e Utilizzo dei Dati</h2>
              <p className={`${T.subtext} mb-3`}>Raccogliamo diversi tipi di informazioni per fornire e migliorare il nostro Servizio:</p>
              
              <h3 className={`text-xl font-semibold mb-2 ${T.text}`}>Dati Personali</h3>
              <ul className={`list-disc pl-6 space-y-2 ${T.subtext} mb-4`}>
                <li><strong>Informazioni di Account:</strong> Nome, cognome, indirizzo email, numero di telefono, data di nascita (per categorie di età), sesso (per categorie di tornei).</li>
                <li><strong>Dati Sportivi:</strong> Livello di gioco, risultati delle partite, affiliazioni ai club.</li>
              </ul>

              <h3 className={`text-xl font-semibold mb-2 ${T.text}`}>Permessi del Dispositivo Mobile</h3>
              <p className={`${T.subtext} mb-2`}>L'applicazione potrebbe richiedere l'accesso a specifiche funzionalità del dispositivo:</p>
              <ul className={`list-disc pl-6 space-y-2 ${T.subtext}`}>
                <li><strong>Fotocamera:</strong> Utilizzata esclusivamente per scansionare codici QR (es. per l'accesso ai tornei o check-in) o per caricare la foto profilo.</li>
                <li><strong>Posizione (Opzionale):</strong> Potrebbe essere richiesta per aiutarti a trovare club sportivi nelle vicinanze.</li>
                <li><strong>Archiviazione/Galleria:</strong> Per permetterti di caricare immagini del profilo o certificati medici.</li>
                <li><strong>Contatti (Opzionale):</strong> Utilizzato per facilitare l'invito di amici alle partite o ai tornei direttamente dalla tua rubrica. I dati dei contatti non vengono salvati sui nostri server se non esplicitamente invitati.</li>
                <li><strong>Notifiche Push:</strong> Per inviarti aggiornamenti su prenotazioni, partite e comunicazioni dal club.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>3. Utilizzo dei Dati</h2>
              <p className={`${T.subtext} mb-3`}>Utilizziamo i dati raccolti per:</p>
              <ul className={`list-disc pl-6 space-y-2 ${T.subtext}`}>
                <li>Fornire e mantenere il Servizio (gestione prenotazioni, tornei, classifiche).</li>
                <li>Notificarti di modifiche al Servizio o aggiornamenti sulle tue attività.</li>
                <li>Fornire assistenza ai clienti.</li>
                <li>Monitorare l'utilizzo del Servizio per rilevare, prevenire e risolvere problemi tecnici.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>4. Conservazione e Sicurezza dei Dati</h2>
              <p className={`${T.subtext}`}>
                I tuoi dati sono conservati su server sicuri (Google Firebase) e adottiamo misure di sicurezza commercialmente accettabili per proteggerli.
                Conserveremo i tuoi dati personali solo per il tempo necessario agli scopi indicati in questa Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>5. Condivisione dei Dati</h2>
              <p className={`${T.subtext}`}>
                I tuoi dati (nome, livello, risultati) sono visibili agli amministratori dei club a cui ti affili.
                Non vendiamo i tuoi dati personali a terze parti. Possiamo divulgare i tuoi dati se richiesto dalla legge.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>6. Eliminazione dei Dati (GDPR)</h2>
              <p className={`${T.subtext}`}>
                Hai il diritto di richiedere la cancellazione del tuo account e di tutti i dati associati.
                Puoi farlo direttamente dalle impostazioni del tuo profilo nell'app ("Elimina Account") o inviando una richiesta a info@play-sport.pro.
                Alla ricezione della richiesta, provvederemo a eliminare i tuoi dati personali dai nostri sistemi entro 30 giorni, salvo obblighi legali di conservazione.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${T.text}`}>7. Contatti</h2>
              <div className={`${T.inputBg} rounded-lg p-4 border ${T.border}`}>
                <p className={`${T.text} font-medium`}>Play-Sport.pro - Privacy Team</p>
                <p className={`${T.subtext}`}>Per domande su questa Privacy Policy, contattaci:</p>
                <p className={`${T.subtext}`}>Email: info@play-sport.pro</p>
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
