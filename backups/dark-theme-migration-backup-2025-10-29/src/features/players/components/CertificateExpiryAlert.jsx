// =============================================
// FILE: src/features/players/components/CertificateExpiryAlert.jsx
// Alert certificato medico in scadenza/scaduto per utenti
// =============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';
import { calculateCertificateStatus } from '@services/medicalCertificates.js';
import { themeTokens } from '@lib/theme.js';

export default function CertificateExpiryAlert() {
  const { currentUser } = useAuth();
  const { clubId, players } = useClub();
  const [certStatus, setCertStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPlayerCertificate = React.useCallback(async () => {
    if (!currentUser?.uid || !clubId || !players || players.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Trova il giocatore corrente nel contesto del club
      const currentPlayer = players.find((player) => player.id === currentUser.uid);

      if (currentPlayer) {
        const status = calculateCertificateStatus(
          currentPlayer.medicalCertificates?.current?.expiryDate
        );
        setCertStatus(status);

        // Auto-dismiss se tutto ok
        if (status.status === 'valid' && !status.isExpiring) {
          setDismissed(true);
        }
      }
    } catch (error) {
      console.error('[CertificateAlert] Error loading certificate:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, clubId, players]);

  useEffect(() => {
    loadPlayerCertificate();
  }, [loadPlayerCertificate]);

  // Don't render anything if players are not loaded yet
  if (!players || players.length === 0) {
    return null;
  }

  if (loading || !certStatus || dismissed) {
    return null;
  }

  // Non mostrare se certificato valido e non in scadenza
  if (certStatus.status === 'valid' && !certStatus.isExpiring) {
    return null;
  }

  // Determina il tipo di alert
  const getAlertConfig = () => {
    if (certStatus.isExpired) {
      return {
        type: 'error',
        icon: '🚫',
        title: 'Certificato Medico Scaduto',
        message: `Il tuo certificato medico è scaduto da ${Math.abs(certStatus.daysUntilExpiry)} ${Math.abs(certStatus.daysUntilExpiry) === 1 ? 'giorno' : 'giorni'}. Non puoi effettuare prenotazioni fino al rinnovo.`,
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        borderClass: 'border-red-500',
        textClass: 'text-red-800 dark:text-red-200',
        dismissable: false,
      };
    }

    if (certStatus.daysUntilExpiry <= 7) {
      return {
        type: 'critical',
        icon: '🚨',
        title: 'Certificato in Scadenza Urgente',
        message: `Il tuo certificato medico scade ${certStatus.daysUntilExpiry === 0 ? 'OGGI' : certStatus.daysUntilExpiry === 1 ? 'DOMANI' : `tra ${certStatus.daysUntilExpiry} giorni`}. Rinnovalo subito!`,
        bgClass: 'bg-orange-50 dark:bg-orange-900/20',
        borderClass: 'border-orange-500',
        textClass: 'text-orange-800 dark:text-orange-200',
        dismissable: false,
      };
    }

    if (certStatus.daysUntilExpiry <= 30) {
      return {
        type: 'warning',
        icon: '⏰',
        title: 'Certificato in Scadenza',
        message: `Il tuo certificato medico scade tra ${certStatus.daysUntilExpiry} giorni. Ricordati di rinnovarlo.`,
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderClass: 'border-yellow-500',
        textClass: 'text-yellow-800 dark:text-yellow-200',
        dismissable: true,
      };
    }

    if (certStatus.status === 'missing') {
      return {
        type: 'info',
        icon: '📄',
        title: 'Certificato Medico Mancante',
        message:
          'Non hai ancora caricato il certificato medico. Contatta il circolo per maggiori informazioni.',
        bgClass: 'bg-gray-50 dark:bg-gray-800',
        borderClass: 'border-gray-400',
        textClass: 'text-gray-800 dark:text-gray-200',
        dismissable: true,
      };
    }

    return null;
  };

  const config = getAlertConfig();
  if (!config) return null;

  // Trova il giocatore corrente per ottenere la data di scadenza
  const currentPlayer = players?.find((player) => player.id === currentUser?.uid);
  const expiryDate = currentPlayer?.medicalCertificates?.current?.expiryDate;

  return (
    <div
      className={`${config.bgClass} border-l-4 ${config.borderClass} p-4 mb-4 rounded-r-lg shadow-md`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{config.icon}</span>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${config.textClass} mb-1`}>{config.title}</h3>
          <p className={`text-sm ${config.textClass} mb-2`}>{config.message}</p>

          {expiryDate && (
            <p className={`text-xs ${config.textClass} opacity-75`}>
              Scadenza:{' '}
              {new Date(expiryDate).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}

          {/* Azioni */}
          <div className="mt-3 flex gap-2">
            <a
              href={`/club/${clubId}/profile`}
              className={`text-sm font-medium underline ${config.textClass} hover:opacity-80`}
            >
              Visualizza Dettagli
            </a>

            {config.dismissable && (
              <>
                <span className={`text-sm ${config.textClass} opacity-50`}>•</span>
                <button
                  onClick={() => setDismissed(true)}
                  className={`text-sm font-medium ${config.textClass} hover:opacity-80`}
                >
                  Nascondi
                </button>
              </>
            )}
          </div>
        </div>

        {/* Close button per alert dismissable */}
        {config.dismissable && (
          <button
            onClick={() => setDismissed(true)}
            className={`${config.textClass} hover:opacity-80 text-xl leading-none shrink-0`}
            aria-label="Chiudi"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
