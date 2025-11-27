// =============================================
// FILE: src/features/players/components/CertificateExpiryAlert.jsx
// Alert certificato medico in scadenza/scaduto per utenti
// =============================================

import React, { useState, useEffect } from 'react';
// Fix: Use relative import to avoid potential alias resolution issues causing duplicate contexts
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useClub } from '../../../contexts/ClubContext.jsx';
import { calculateCertificateStatus } from '@services/medicalCertificates.js';
import { themeTokens } from '@lib/theme.js';

export default function CertificateExpiryAlert() {
  // Fix: AuthContext provides 'user', not 'currentUser'
  const { user } = useAuth();
  const { clubId, players } = useClub();
  const [certStatus, setCertStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPlayerCertificate = React.useCallback(async () => {
    if (!user?.uid || !clubId || !players || players.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Trova il giocatore corrente nel contesto del club
      const currentPlayer = players.find((player) => player.id === user.uid);

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
  }, [user, clubId, players]);

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
    if (certStatus.status === 'missing' || certStatus.daysUntilExpiry === null) {
      return {
        type: 'info',
        icon: '📄',
        title: 'Certificato Medico Mancante',
        message:
          'Non hai ancora caricato il certificato medico. Contatta il circolo per maggiori informazioni.',
        bgClass: 'bg-gray-800',
        borderClass: 'border-gray-400',
        textClass: 'text-gray-800 text-gray-200',
        dismissable: true,
      };
    }

    // Avvisi di scadenza disabilitati
    return null;

    return null;
  };

  const config = getAlertConfig();
  if (!config) return null;

  // Trova il giocatore corrente per ottenere la data di scadenza
  const currentPlayer = players?.find((player) => player.id === user?.uid);
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
