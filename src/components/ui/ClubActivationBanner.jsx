import React from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * Banner che mostra lo stato di attivazione del circolo
 * Visibile solo agli admin del circolo
 */
const ClubActivationBanner = ({ club }) => {
  if (!club) return null;

  const isPending = !club.isActive || club.status === 'pending';
  const isActive = club.isActive === true;
  const isInactive = club.isActive === false && club.status !== 'pending';

  // Non mostrare nulla se il circolo è attivo
  if (isActive) return null;

  return (
    <div className="mb-6">
      {isPending && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-yellow-800">
                Circolo in Attesa di Approvazione
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p className="mb-2">
                  Il tuo circolo è stato registrato con successo ed è attualmente in fase di
                  revisione.
                </p>
                <p className="mb-2">
                  <strong>Cosa puoi fare ora:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Completa la configurazione del circolo (campi, orari, tariffe)</li>
                  <li>Personalizza il profilo e aggiungi le informazioni di contatto</li>
                  <li>Carica il logo e le foto del circolo</li>
                  <li>Configura i servizi offerti</li>
                </ul>
                <p className="mt-3 font-medium">
                  ⏳ Il circolo sarà visibile agli utenti solo dopo l'approvazione da parte
                  dell'amministratore.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isInactive && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-red-800">Circolo Disattivato</h3>
              <div className="mt-2 text-sm text-red-700">
                <p className="mb-2">
                  Il tuo circolo è stato temporaneamente disattivato e non è visibile agli utenti.
                </p>
                <p className="mb-2">
                  Puoi continuare a gestire il circolo e le sue configurazioni, ma:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Il circolo non appare nelle ricerche pubbliche</li>
                  <li>Gli utenti non possono effettuare nuove prenotazioni</li>
                  <li>Le partite e i tornei non sono visibili pubblicamente</li>
                </ul>
                <p className="mt-3 font-medium">
                  📧 Per maggiori informazioni, contatta l'amministratore della piattaforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Versione compatta per header/dashboard
export const ClubActivationStatusBadge = ({ club }) => {
  if (!club) return null;

  const isPending = !club.isActive || club.status === 'pending';
  const isActive = club.isActive === true;
  const isInactive = club.isActive === false && club.status !== 'pending';

  if (isActive) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Attivo
      </span>
    );
  }

  if (isPending) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        In Attesa di Approvazione
      </span>
    );
  }

  if (isInactive) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Disattivato
      </span>
    );
  }

  return null;
};

export default ClubActivationBanner;
