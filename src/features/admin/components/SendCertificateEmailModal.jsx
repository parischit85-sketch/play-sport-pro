// =============================================
// FILE: src/features/admin/components/SendCertificateEmailModal.jsx
// Modal riepilogativo invio email certificati
// =============================================

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@config/firebase';
import { calculateCertificateStatus } from '@services/medicalCertificates.js';
import { trackCertificateEmail } from '@services/emailTracking.js';

const DEFAULT_TEMPLATES = {
  expired: {
    subject: '⚠️ Certificato Medico Scaduto',
    body: `Ciao {{nome}},

Ti informiamo che il tuo certificato medico è SCADUTO in data {{dataScadenza}}.

Per poter continuare a partecipare alle attività sportive, è necessario rinnovare il certificato medico al più presto.

Ti preghiamo di:
1. Prenotare una visita medica
2. Caricare il nuovo certificato nell'app
3. Comunicarci la nuova data di scadenza

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}`,
  },
  expiring: {
    subject: '🔔 Certificato Medico in Scadenza',
    body: `Ciao {{nome}},

Ti informiamo che il tuo certificato medico scadrà il {{dataScadenza}} (tra {{giorniRimanenti}} giorni).

Per evitare interruzioni nelle tue attività sportive, ti consigliamo di rinnovarlo al più presto.

Ti preghiamo di:
1. Prenotare una visita medica
2. Caricare il nuovo certificato nell'app
3. Comunicarci la nuova data di scadenza

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}`,
  },
  missing: {
    subject: '❌ Certificato Medico Mancante',
    body: `Ciao {{nome}},

Risulta che non hai ancora caricato il certificato medico.

Per poter partecipare alle attività sportive del nostro club, è OBBLIGATORIO essere in possesso di un certificato medico valido.

Ti preghiamo di:
1. Effettuare la visita medica
2. Caricare il certificato nell'app
3. Comunicarci la data di scadenza

Per qualsiasi informazione, siamo a tua disposizione.

Cordiali saluti,
{{nomeClub}}`,
  },
};

export default function SendCertificateEmailModal({ 
  clubId,
  clubName,
  selectedPlayers = [], 
  onClose, 
  onSuccess 
}) {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, [clubId]);

  async function loadTemplates() {
    try {
      const docRef = doc(db, 'clubs', clubId, 'settings', 'emailTemplates');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTemplates({ ...DEFAULT_TEMPLATES, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }

  function getTemplateForPlayer(player) {
    // Il player arriva già con certificateStatus calcolato da MedicalCertificatesManager
    // Se non c'è, calcoliamo qui passando la data di scadenza
    const status = player.certificateStatus || 
                   calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
    
    console.log(`📧 Template selection for ${player.name}:`, {
      status: status.status,
      isExpired: status.isExpired,
      isExpiring: status.isExpiring,
      daysUntilExpiry: status.daysUntilExpiry,
      expiryDate: player.medicalCertificates?.current?.expiryDate
    });
    
    if (status.status === 'missing') {
      return 'missing';
    } else if (status.status === 'expired') {
      return 'expired';
    } else if (status.status === 'expiring' || status.status === 'urgent') {
      return 'expiring';
    }
    
    return 'expiring'; // Default per casi edge
  }

  function personalizeMessage(template, player, status) {
    const expiryDate = player.medicalCertificates?.current?.expiryDate;
    const formattedDate = expiryDate 
      ? new Date(expiryDate).toLocaleDateString('it-IT')
      : 'N/A';
    
    // daysUntilExpiry è il campo corretto da calculateCertificateStatus
    const daysRemaining = status.daysUntilExpiry !== null ? status.daysUntilExpiry : 0;

    return {
      subject: template.subject
        .replace(/\{\{nome\}\}/g, player.name || player.displayName || 'Giocatore')
        .replace(/\{\{dataScadenza\}\}/g, formattedDate)
        .replace(/\{\{giorniRimanenti\}\}/g, Math.abs(daysRemaining).toString())
        .replace(/\{\{nomeClub\}\}/g, clubName || 'Il tuo Club'),
      body: template.body
        .replace(/\{\{nome\}\}/g, player.name || player.displayName || 'Giocatore')
        .replace(/\{\{dataScadenza\}\}/g, formattedDate)
        .replace(/\{\{giorniRimanenti\}\}/g, Math.abs(daysRemaining).toString())
        .replace(/\{\{nomeClub\}\}/g, clubName || 'Il tuo Club'),
    };
  }

  async function handleSend() {
    setSending(true);
    setResult(null);

    try {
      const functions = getFunctions();
      const sendEmail = httpsCallable(functions, 'sendClubEmail');

      // Prepara le email personalizzate per ogni giocatore
      const emailPromises = selectedPlayers.map(async (player) => {
        // Usa certificateStatus già calcolato o calcolalo al volo
        const status = player.certificateStatus || 
                       calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
        const templateType = getTemplateForPlayer(player);
        const template = templates[templateType];
        const personalized = personalizeMessage(template, player, status);

        return sendEmail({
          clubId,
          recipients: [{
            email: player.email,
            name: player.name || player.displayName || 'Giocatore',
          }],
          subject: personalized.subject,
          body: personalized.body,
          isHTML: false,
        });
      });

      const results = await Promise.allSettled(emailPromises);
      
      let sent = 0;
      let failed = 0;
      const details = [];

      // Processa risultati e salva tracking per email riuscite
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const player = selectedPlayers[i];
        
        if (result.status === 'fulfilled' && result.value?.data?.success) {
          sent++;
          details.push({
            success: true,
            email: player.email,
            name: player.name,
          });
          
          // Salva tracking dell'email inviata
          const status = player.certificateStatus || 
                         calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
          const templateType = getTemplateForPlayer(player);
          const template = templates[templateType];
          const personalized = personalizeMessage(template, player, status);
          
          try {
            await trackCertificateEmail(clubId, player.id, {
              type: 'certificate',
              templateType: templateType,
              subject: personalized.subject,
              success: true,
            });
          } catch (trackError) {
            console.warn('Failed to track email for player:', player.id, trackError);
          }
        } else {
          failed++;
          details.push({
            success: false,
            email: player.email,
            name: player.name,
            error: result.reason?.message || 'Errore sconosciuto',
          });
        }
      }

      setResult({
        success: failed === 0,
        total: selectedPlayers.length,
        sent,
        failed,
        details,
      });

      if (failed === 0) {
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      setResult({
        success: false,
        sent: 0,
        failed: selectedPlayers.length,
        error: error.message,
      });
    } finally {
      setSending(false);
    }
  }

  // Raggruppa giocatori per tipo di template
  const playersByTemplate = selectedPlayers.reduce((acc, player) => {
    // Usa certificateStatus già calcolato o calcolalo al volo
    const status = player.certificateStatus || 
                   calculateCertificateStatus(player.medicalCertificates?.current?.expiryDate);
    const templateType = getTemplateForPlayer(player);
    
    if (!acc[templateType]) {
      acc[templateType] = [];
    }
    
    acc[templateType].push({
      ...player,
      status,
      templateType,
    });
    
    return acc;
  }, {});

  const templateLabels = {
    expired: '⚠️ Scaduto',
    expiring: '🔔 In Scadenza',
    missing: '❌ Mancante',
  };

  const templateColors = {
    expired: 'red',
    expiring: 'yellow',
    missing: 'gray',
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
        <div className="bg-gray-800 rounded-lg p-8 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <div className="mt-4">Caricamento template...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📧 Riepilogo Invio Email Certificati
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4 mb-6">
          <div className="text-blue-300 text-sm">
            ℹ️ Ogni giocatore riceverà un'email personalizzata in base allo stato del suo certificato medico.
          </div>
        </div>

        {/* Recipients by Template */}
        <div className="space-y-4 mb-6">
          {Object.entries(playersByTemplate).map(([templateType, players]) => {
            const template = templates[templateType];
            const samplePlayer = players[0];
            const sampleStatus = samplePlayer.status;
            const personalized = personalizeMessage(template, samplePlayer, sampleStatus);

            return (
              <div key={templateType} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                {/* Template Header */}
                <div className={`px-4 py-3 flex justify-between items-center ${
                  templateType === 'expired' ? 'bg-red-900 bg-opacity-30' :
                  templateType === 'expiring' ? 'bg-yellow-900 bg-opacity-30' :
                  'bg-gray-800'
                }`}>
                  <div className="text-white font-semibold">
                    {templateLabels[templateType]} ({players.length} {players.length === 1 ? 'giocatore' : 'giocatori'})
                  </div>
                  <button
                    className="text-xs text-gray-400 hover:text-white"
                    onClick={() => {
                      const el = document.getElementById(`template-${templateType}`);
                      el.classList.toggle('hidden');
                    }}
                  >
                    Mostra/Nascondi Anteprima
                  </button>
                </div>

                {/* Players List */}
                <div className="px-4 py-3 border-b border-gray-700">
                  <div className="text-sm text-gray-300 space-y-1">
                    {players.map((player, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span>•</span>
                        <span>{player.name}</span>
                        <span className="text-gray-500">({player.email})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Preview */}
                <div id={`template-${templateType}`} className="hidden px-4 py-3 bg-gray-800">
                  <div className="text-xs text-gray-400 mb-2">ANTEPRIMA MESSAGGIO:</div>
                  <div className="space-y-2">
                    <div className="text-white font-bold">
                      Oggetto: {personalized.subject}
                    </div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900 p-3 rounded border border-gray-700">
                      {personalized.body}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-lg mb-6 border ${
            result.success 
              ? 'bg-green-900 bg-opacity-30 border-green-600 text-green-300' 
              : 'bg-red-900 bg-opacity-30 border-red-600 text-red-300'
          }`}>
            {result.success ? (
              <>
                <div className="font-bold text-lg">✅ Email inviate con successo!</div>
                <div className="text-sm mt-2">
                  Inviate: {result.sent} | Fallite: {result.failed}
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-lg">❌ Alcune email non sono state inviate</div>
                <div className="text-sm mt-2">
                  Inviate: {result.sent} | Fallite: {result.failed}
                </div>
              </>
            )}

            {result.details && result.details.length > 0 && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-semibold hover:text-white">Dettagli invio</summary>
                <div className="mt-2 max-h-40 overflow-auto space-y-1">
                  {result.details.map((detail, i) => (
                    <div key={i} className="py-1">
                      {detail.success ? '✅' : '❌'} {detail.name} ({detail.email})
                      {!detail.success && <div className="text-xs ml-4 mt-1">• {detail.error}</div>}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={sending}
            className="px-6 py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Annulla
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Invio in corso...
              </span>
            ) : (
              `📧 Invia a ${selectedPlayers.length} ${selectedPlayers.length === 1 ? 'giocatore' : 'giocatori'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
