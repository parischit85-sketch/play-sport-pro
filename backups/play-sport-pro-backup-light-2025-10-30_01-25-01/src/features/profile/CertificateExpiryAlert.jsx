// =============================================
// FILE: src/features/profile/CertificateExpiryAlert.jsx
// =============================================
import React, { useEffect, useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { sendCertificateExpiryPush } from '@/services/push-notifications-integration';
import { logger } from '@/utils/logger';
import { themeTokens } from '@lib/theme.js';

export default function CertificateExpiryAlert() {
  const { user, userProfile } = useAuth();
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const T = themeTokens();

  useEffect(() => {
    if (!userProfile?.certificateExpiry) return;

    try {
      const expiry = new Date(userProfile.certificateExpiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);

      const diff = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
      setDaysRemaining(diff);

      // Send push notification if expiring soon (only on critical days)
      if ([7, 3, 1].includes(diff) && user?.uid) {
        logger.debug(`Certificate expiring in ${diff} days, sending push notification`);
        sendCertificateExpiryPush(user.uid, diff).catch((err) => {
          logger.warn('Failed to send certificate expiry push:', err);
        });
      }
    } catch (error) {
      logger.error('Error calculating certificate expiry:', error);
    }
  }, [userProfile, user]);

  // Don't show if no expiry date, expiring in more than 7 days, or dismissed
  if (!daysRemaining || daysRemaining > 7 || daysRemaining < 0 || dismissed) {
    return null;
  }

  const urgencyConfig = {
    1: {
      bgColor: 'bg-red-50 bg-red-900/20',
      borderColor: 'border-red-500',
      textColor: 'text-red-800 text-red-200',
      icon: '🔴',
      title: 'Certificato in Scadenza URGENTE',
      btnColor: 'bg-red-600 hover:bg-red-700 text-white',
    },
    2: {
      bgColor: 'bg-red-50 bg-red-900/20',
      borderColor: 'border-red-500',
      textColor: 'text-red-800 text-red-200',
      icon: '🔴',
      title: 'Certificato in Scadenza URGENTE',
      btnColor: 'bg-red-600 hover:bg-red-700 text-white',
    },
    3: {
      bgColor: 'bg-orange-50 bg-orange-900/20',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-800 text-orange-200',
      icon: '🟠',
      title: 'Certificato in Scadenza',
      btnColor: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
  };

  const config = urgencyConfig[daysRemaining] || {
    bgColor: 'bg-yellow-50 bg-yellow-900/20',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-800 text-yellow-200',
    icon: '⚠️',
    title: 'Certificato in Scadenza',
    btnColor: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  };

  const handleUploadClick = () => {
    // Navigate to profile/certificates page
    window.location.href = '/profile#certificates';
  };

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} ${config.textColor} p-4 border-l-4 rounded-lg mb-4 shadow-md transition-all duration-300`}
      role="alert"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            {config.title}
          </h3>
          <p className="mb-3">
            Il tuo certificato medico scade tra{' '}
            <strong className="font-bold text-xl">
              {daysRemaining} {daysRemaining === 1 ? 'giorno' : 'giorni'}
            </strong>
          </p>
          <p className="text-sm opacity-90 mb-3">
            {daysRemaining <= 1
              ? '⚡ Carica immediatamente un nuovo certificato per continuare a prenotare.'
              : daysRemaining <= 3
                ? '📅 Ti consigliamo di caricare un nuovo certificato al più presto.'
                : '📝 Ricordati di rinnovare il certificato per evitare interruzioni.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUploadClick}
              className={`${config.btnColor} px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm`}
            >
              📄 Carica Nuovo Certificato
            </button>
            <button
              onClick={() => setDismissed(true)}
              className={`${T.btnSecondary} px-4 py-2 rounded-lg font-medium transition-colors duration-200`}
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

