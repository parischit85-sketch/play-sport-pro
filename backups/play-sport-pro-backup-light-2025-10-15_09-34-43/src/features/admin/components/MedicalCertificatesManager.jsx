// =============================================
// FILE: src/features/admin/components/MedicalCertificatesManager.jsx
// Gestione completa certificati medici con filtri e notifiche
// =============================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateCertificateStatus } from '@services/medicalCertificates.js';

const FILTER_OPTIONS = {
  ALL: 'all',
  EXPIRED: 'expired',
  URGENT: 'urgent',
  EXPIRING: 'expiring',
  MISSING: 'missing',
  VALID: 'valid',
};

const FILTER_LABELS = {
  [FILTER_OPTIONS.ALL]: 'Tutti',
  [FILTER_OPTIONS.EXPIRED]: 'Scaduti',
  [FILTER_OPTIONS.URGENT]: 'Urgenti (<15gg)',
  [FILTER_OPTIONS.EXPIRING]: 'In Scadenza',
  [FILTER_OPTIONS.MISSING]: 'Mancanti',
  [FILTER_OPTIONS.VALID]: 'Validi',
};

export default function MedicalCertificatesManager({ clubId, players, onClose, T }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(FILTER_OPTIONS.ALL);
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const DEFAULT_COUNTRY_CODE = '+39'; // Assunzione: Italia; valuta di leggere da impostazioni club in futuro

  // Calcola lo status del certificato per ogni giocatore
  const playersWithStatus = useMemo(() => {
    const result = players.map((player) => {
      const certificateStatus = calculateCertificateStatus(
        player.medicalCertificates?.current?.expiryDate
      );
      return {
        ...player,
        certificateStatus,
      };
    });
    
    // Debug: mostra i primi 3 giocatori con i loro status
    console.log('📊 Players with status (sample):', result.slice(0, 3).map(p => ({
      name: p.name,
      expiryDate: p.medicalCertificates?.current?.expiryDate,
      status: p.certificateStatus.status,
      isExpired: p.certificateStatus.isExpired,
      isExpiring: p.certificateStatus.isExpiring,
      daysUntilExpiry: p.certificateStatus.daysUntilExpiry,
    })));
    
    return result;
  }, [players]);

  // Filtra giocatori in base al filtro attivo e ricerca
  const filteredPlayers = useMemo(() => {
    let filtered = playersWithStatus;

    // Filtro per stato certificato
    if (activeFilter !== FILTER_OPTIONS.ALL) {
      filtered = filtered.filter((player) => {
        const { status, isExpired, isExpiring, daysUntilExpiry } = player.certificateStatus;

        switch (activeFilter) {
          case FILTER_OPTIONS.EXPIRED:
            return isExpired;
          case FILTER_OPTIONS.URGENT:
            // Urgenti: in scadenza E meno di 15 giorni
            return !isExpired && isExpiring && daysUntilExpiry !== null && daysUntilExpiry <= 15;
          case FILTER_OPTIONS.EXPIRING:
            // In scadenza: in scadenza E più di 15 giorni
            return !isExpired && isExpiring && daysUntilExpiry !== null && daysUntilExpiry > 15;
          case FILTER_OPTIONS.MISSING:
            return status === 'missing';
          case FILTER_OPTIONS.VALID:
            // Validi: non scaduti, non in scadenza, e con certificato
            return !isExpired && !isExpiring && status === 'valid';
          default:
            return true;
        }
      });
    }

    // Ricerca per nome/email
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.phone?.includes(term)
      );
    }

    return filtered;
  }, [playersWithStatus, activeFilter, searchTerm]);

  // Statistiche per i badge dei filtri
  const stats = useMemo(() => {
    const all = playersWithStatus.length;
    const expired = playersWithStatus.filter((p) => p.certificateStatus.isExpired).length;
    const urgent = playersWithStatus.filter(
      (p) => !p.certificateStatus.isExpired && p.certificateStatus.isExpiring && p.certificateStatus.daysUntilExpiry !== null && p.certificateStatus.daysUntilExpiry <= 15
    ).length;
    const expiring = playersWithStatus.filter(
      (p) => !p.certificateStatus.isExpired && p.certificateStatus.isExpiring && p.certificateStatus.daysUntilExpiry !== null && p.certificateStatus.daysUntilExpiry > 15
    ).length;
    const missing = playersWithStatus.filter((p) => p.certificateStatus.status === 'missing').length;
    const valid = playersWithStatus.filter((p) => !p.certificateStatus.isExpired && !p.certificateStatus.isExpiring && p.certificateStatus.status === 'valid').length;

    return {
      [FILTER_OPTIONS.ALL]: all,
      [FILTER_OPTIONS.EXPIRED]: expired,
      [FILTER_OPTIONS.URGENT]: urgent,
      [FILTER_OPTIONS.EXPIRING]: expiring,
      [FILTER_OPTIONS.MISSING]: missing,
      [FILTER_OPTIONS.VALID]: valid,
    };
  }, [playersWithStatus]);

  // Toggle selezione giocatore
  const togglePlayerSelection = (playerId) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  // Seleziona tutti i giocatori filtrati
  const selectAll = () => {
    const allIds = new Set(filteredPlayers.map((p) => p.id));
    setSelectedPlayers(allIds);
  };

  // Deseleziona tutti
  const deselectAll = () => {
    setSelectedPlayers(new Set());
  };

  // Normalizza un numero in formato E.164 per WhatsApp
  const normalizePhoneE164 = (raw, defaultCountryCode = DEFAULT_COUNTRY_CODE) => {
    if (!raw) return null;
    let p = String(raw).trim();
    // Rimuovi spazi e simboli comuni
    p = p.replace(/[\s\-().]/g, '');
    if (!p) return null;
    // 00 -> +
    if (p.startsWith('00')) p = '+' + p.slice(2);
    // Se già internazionale
    if (p.startsWith('+')) {
      const cleaned = '+' + p.slice(1).replace(/[^0-9]/g, '');
      return cleaned.length > 1 ? cleaned : null;
    }
    // Se inizia con 0 (numero nazionale), rimuovi lo 0
    if (p.startsWith('0')) p = p.replace(/^0+/, '');
    // Tieni solo cifre
    p = p.replace(/[^0-9]/g, '');
    if (!p) return null;
    return (defaultCountryCode || '+39') + p;
  };

  const buildWhatsAppMessage = (player) => {
    const name = player.name || 'Ciao';
    const expiryDate = player.medicalCertificates?.current?.expiryDate
      ? new Date(player.medicalCertificates.current.expiryDate).toLocaleDateString('it-IT')
      : null;
    const { isExpired, isExpiring, daysUntilExpiry, status } = player.certificateStatus || {};

    if (!player.certificateStatus || status === 'missing') {
      return `Ciao ${name}, non risulta alcun certificato medico attivo. Per partecipare alle attività è necessario caricare un certificato valido. Grazie.`;
    }
    if (isExpired) {
      return `Ciao ${name}, il tuo certificato medico risulta SCADUTO (scadenza: ${expiryDate}). Ti chiediamo di procedere al rinnovo e al caricamento del nuovo certificato.`;
    }
    if (isExpiring && typeof daysUntilExpiry === 'number') {
      const when = daysUntilExpiry === 0 ? 'oggi' : daysUntilExpiry === 1 ? 'domani' : `tra ${daysUntilExpiry} giorni`;
      return `Ciao ${name}, il tuo certificato medico scade ${when} (scadenza: ${expiryDate}). Ti invitiamo a rinnovarlo per continuare le attività senza interruzioni.`;
    }
    return `Ciao ${name}, promemoria certificato medico (scadenza: ${expiryDate}).`;
  };

  // Invia tramite WhatsApp Web (apre schede con messaggio precompilato)
  const handleSendWhatsAppWeb = async () => {
    if (selectedPlayers.size === 0) {
      alert('Seleziona almeno un giocatore');
      return;
    }

    const list = Array.from(selectedPlayers)
      .map((id) => playersWithStatus.find((p) => p.id === id))
      .filter(Boolean);

    // Validazione numeri e preparazione link
    const links = [];
    const invalid = [];
    for (const p of list) {
      const normalized = normalizePhoneE164(p.phone);
      if (!normalized) {
        invalid.push(p.name || p.id);
        continue;
      }
      const msg = buildWhatsAppMessage(p);
      const encoded = encodeURIComponent(msg);
      // Preferiamo web.whatsapp.com su desktop (wa.me funziona anche su mobile)
      const url = `https://web.whatsapp.com/send?phone=${normalized}&text=${encoded}`;
      links.push({ name: p.name || p.id, url });
    }

    if (links.length === 0) {
      alert('Nessun numero valido tra i selezionati.');
      return;
    }

    const confirmMsg =
      `Stai per aprire WhatsApp Web per ${links.length} contatti.\n` +
      (invalid.length ? `\nSenza numero valido: ${invalid.join(', ')}\n` : '') +
      `\nNota: il browser potrebbe bloccare i popup; consenti le finestre per procedere.`;
    if (!confirm(confirmMsg)) return;

    // Apri le chat con piccoli ritardi per evitare blocchi popup
    let opened = 0;
    for (const { url } of links) {
      const win = window.open(url, '_blank');
      if (win) opened++;
      // piccolo delay
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 300));
    }

    alert(`Operazione completata: aperte ${opened}/${links.length} chat su WhatsApp Web.`);
  };

  // Invia tramite App Desktop (whatsapp:// schema) – richiede conferma del browser ad aprire l'app
  const handleSendWhatsAppApp = async () => {
    if (selectedPlayers.size === 0) {
      alert('Seleziona almeno un giocatore');
      return;
    }

    const list = Array.from(selectedPlayers)
      .map((id) => playersWithStatus.find((p) => p.id === id))
      .filter(Boolean);

    const links = [];
    const invalid = [];
    for (const p of list) {
      const normalized = normalizePhoneE164(p.phone);
      if (!normalized) {
        invalid.push(p.name || p.id);
        continue;
      }
      const msg = buildWhatsAppMessage(p);
      const encoded = encodeURIComponent(msg);
      const url = `whatsapp://send?phone=${normalized}&text=${encoded}`;
      links.push({ name: p.name || p.id, url });
    }

    if (links.length === 0) {
      alert('Nessun numero valido tra i selezionati.');
      return;
    }

    const confirmMsg =
      `Stai per aprire l'app WhatsApp Desktop per ${links.length} contatti.\n` +
      (invalid.length ? `\nSenza numero valido: ${invalid.join(', ')}\n` : '') +
      `\nNota: il browser potrebbe chiederti di confermare l'apertura dell'app per ogni contatto.`;
    if (!confirm(confirmMsg)) return;

    let opened = 0;
    for (const { url } of links) {
      const win = window.open(url, '_blank');
      if (win) opened++;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 300));
    }

    alert(`Operazione completata: avviate ${opened}/${links.length} chat nell'app WhatsApp.`);
  };

  // Invia notifiche ai giocatori selezionati
  const handleSendNotifications = async (type) => {
    if (selectedPlayers.size === 0) {
      alert('Seleziona almeno un giocatore');
      return;
    }

    const selectedPlayersList = Array.from(selectedPlayers)
      .map((id) => playersWithStatus.find((p) => p.id === id))
      .filter(Boolean);

    const message = `Stai per inviare ${type === 'email' ? 'email' : 'notifiche push'} a ${selectedPlayersList.length} giocatori:\n\n${selectedPlayersList.map((p) => `- ${p.name}`).join('\n')}\n\nConfermi?`;

    if (!confirm(message)) return;

    setSendingNotifications(true);

    try {
      console.log('📧 [Bulk Notifications] Starting send...', {
        type,
        count: selectedPlayersList.length,
        playerIds: Array.from(selectedPlayers),
      });

      // Importa Firebase Functions SDK v2
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      // Usa esplicitamente la regione della funzione callable
      const functions = getFunctions(undefined, 'us-central1');
      
      console.log('🔧 [Debug] Firebase Functions instance:', {
        app: functions.app.name,
        region: 'us-central1',
        customDomain: functions.customDomain
      });

      // IMPORTANTE: Usa la regione corretta e aumenta timeout per funzioni che potrebbero richiedere tempo
      const sendBulkNotifications = httpsCallable(functions, 'sendBulkCertificateNotifications', {
        timeout: 300000, // 5 minuti (300 secondi) - stesso timeout della funzione server
      });
      
      console.log('📞 [Debug] Calling function with params:', {
        clubId,
        playerIds: Array.from(selectedPlayers),
        notificationType: type,
      });
      
      const result = await sendBulkNotifications({
        clubId,
        playerIds: Array.from(selectedPlayers),
        notificationType: type,
      });

      console.log('✅ [Bulk Notifications] Result:', result.data);

      const { sent, failed, details, provider, from, replyTo } = result.data;

      // Mostra risultati dettagliati
      if (failed > 0) {
        const failedPlayers = details
          .filter(d => !d.success)
          .map(d => `- ${d.playerName || d.playerId}: ${d.error}${d.code ? ` [${d.code}]` : ''}`)
          .join('\n');

        // Caso specifico: nessun provider email configurato
        if (type === 'email' && sent === 0 && provider === 'none') {
          alert(
            `❌ Nessun servizio email configurato.\n\n` +
            `Provider: ${provider}.\n` +
            `Mittente: ${from || '-'}\n` +
            `Configura SENDGRID_API_KEY oppure EMAIL_USER/EMAIL_PASSWORD e FROM_EMAIL nei Secret della funzione.\n\n` +
            `Dettagli:\n${failedPlayers}`
          );
        } else {
          alert(
            `⚠️ Invio completato con errori:\n\n` +
            `✅ Inviate: ${sent}\n` +
            `❌ Fallite: ${failed}\n` +
            (provider ? `📨 Provider: ${provider}\n` : '') +
            (from ? `📤 Mittente: ${from}\n` : '') +
            (replyTo ? `↩️ Rispondi-a: ${replyTo}\n\n` : '\n') +
            `Errori:\n${failedPlayers}`
          );
        }
      } else {
        alert(
          `✅ ${type === 'email' ? 'Email inviate' : 'Notifiche push inviate'} con successo!\n\n` +
          `Inviate: ${sent} / ${selectedPlayersList.length}`
          (provider ? `\n📨 Provider: ${provider}` : '') +
          (from ? `\n📤 Mittente: ${from}` : '') +
          (replyTo ? `\n↩️ Rispondi-a: ${replyTo}` : '')
        );
      }

      deselectAll();
    } catch (error) {
      console.error('❌ [Bulk Notifications] Error:', error);
      
      let errorMessage = 'Errore durante l\'invio';
      
      if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Devi essere autenticato per inviare notifiche';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'Non hai i permessi per inviare notifiche';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('❌ ' + errorMessage);
    } finally {
      setSendingNotifications(false);
    }
  };

  // Apri dettaglio giocatore
  const openPlayerDetail = (playerId) => {
    navigate(`/club/${clubId}/players?selected=${playerId}&tab=medical`);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Info header */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <p className={`text-sm ${T.subtext}`}>
          {filteredPlayers.length} giocatori visualizzati
          {selectedPlayers.size > 0 && ` • ${selectedPlayers.size} selezionati`}
        </p>
      </div>

      {/* Filtri */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(FILTER_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === key
                    ? 'bg-white/20'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {stats[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Ricerca */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Cerca per nome, email o telefono..."
          className={`w-full px-4 py-2 rounded-lg border ${T.inputBg} ${T.text} ${T.border}`}
        />
      </div>

      {/* Azioni su selezionati */}
      {selectedPlayers.size > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${T.text}`}>
                {selectedPlayers.size} selezionati
              </span>
              <button
                onClick={deselectAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Deseleziona tutti
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSendNotifications('email')}
                disabled={sendingNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {sendingNotifications ? '⏳ Invio...' : '📧 Invia Email'}
              </button>
              <button
                onClick={() => handleSendNotifications('push')}
                disabled={sendingNotifications}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {sendingNotifications ? '⏳ Invio...' : '🔔 Notifica Push'}
              </button>
              <button
                onClick={handleSendWhatsAppApp}
                disabled={sendingNotifications}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                title="Apre l'app WhatsApp Desktop con messaggi precompilati"
              >
                {sendingNotifications ? '⏳ Invio...' : '🖥️ WhatsApp App'}
              </button>
              <button
                onClick={handleSendWhatsAppWeb}
                disabled={sendingNotifications}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                title="Apre WhatsApp Web con messaggi precompilati"
              >
                {sendingNotifications ? '⏳ Invio...' : '🟢 WhatsApp Web'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista giocatori */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">
              {searchTerm ? '🔍' : activeFilter === FILTER_OPTIONS.VALID ? '✅' : '📋'}
            </div>
            <p className={`text-lg font-medium ${T.text} mb-2`}>
              {searchTerm
                ? 'Nessun giocatore trovato'
                : activeFilter === FILTER_OPTIONS.VALID
                  ? 'Tutti i certificati sono in regola!'
                  : 'Nessun giocatore in questa categoria'}
            </p>
            <p className={`${T.subtext}`}>
              {searchTerm
                ? 'Prova a modificare la ricerca'
                : 'Cambia filtro per vedere altri giocatori'}
            </p>
          </div>
        ) : (
          <>
            {/* Selezione rapida */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Seleziona tutti ({filteredPlayers.length})
              </button>
            </div>

            {/* Lista */}
            <div className="space-y-2">
              {filteredPlayers.map((player) => {
                const { status, isExpired, daysUntilExpiry } = player.certificateStatus;
                const isSelected = selectedPlayers.has(player.id);

                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isExpired
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                          : daysUntilExpiry <= 15
                            ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
                            : status === 'missing'
                              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePlayerSelection(player.id)}
                        className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                      />

                      {/* Info giocatore */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${T.text}`}>{player.name}</h3>
                          {player.isInstructor && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                              Istruttore
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {player.email && (
                            <span className={T.subtext}>📧 {player.email}</span>
                          )}
                          {player.phone && (
                            <span className={T.subtext}>📱 {player.phone}</span>
                          )}
                        </div>
                      </div>

                      {/* Status certificato */}
                      <div className="text-right shrink-0">
                        {status === 'missing' ? (
                          <>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                              Mancante
                            </p>
                            <p className="text-xs text-gray-500">Nessun certificato</p>
                          </>
                        ) : isExpired ? (
                          <>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">
                              Scaduto {Math.abs(daysUntilExpiry)}gg fa
                            </p>
                            <p className="text-xs text-red-500">
                              {player.medicalCertificates?.current?.expiryDate
                                ? new Date(
                                    player.medicalCertificates.current.expiryDate
                                  ).toLocaleDateString('it-IT')
                                : ''}
                            </p>
                          </>
                        ) : daysUntilExpiry <= 15 ? (
                          <>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                              {daysUntilExpiry === 0
                                ? 'Scade oggi!'
                                : daysUntilExpiry === 1
                                  ? 'Scade domani'
                                  : `Urgente: ${daysUntilExpiry}gg`}
                            </p>
                            <p className="text-xs text-orange-500">
                              {player.medicalCertificates?.current?.expiryDate
                                ? new Date(
                                    player.medicalCertificates.current.expiryDate
                                  ).toLocaleDateString('it-IT')
                                : ''}
                            </p>
                          </>
                        ) : status === 'valid' ? (
                          <>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                              Valido
                            </p>
                            <p className="text-xs text-green-600">
                              {player.medicalCertificates?.current?.expiryDate
                                ? new Date(
                                    player.medicalCertificates.current.expiryDate
                                  ).toLocaleDateString('it-IT')
                                : ''}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                              {daysUntilExpiry} giorni
                            </p>
                            <p className="text-xs text-yellow-600">
                              {player.medicalCertificates?.current?.expiryDate
                                ? new Date(
                                    player.medicalCertificates.current.expiryDate
                                  ).toLocaleDateString('it-IT')
                                : ''}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Azioni */}
                      <button
                        onClick={() => openPlayerDetail(player.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shrink-0"
                      >
                        Apri Scheda
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer con statistiche */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
            <div className={`text-2xl font-bold ${T.text}`}>{stats[FILTER_OPTIONS.ALL]}</div>
            <div className="text-xs text-gray-500">Totale</div>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats[FILTER_OPTIONS.EXPIRED]}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">Scaduti</div>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats[FILTER_OPTIONS.URGENT]}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Urgenti</div>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats[FILTER_OPTIONS.EXPIRING]}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">In Scadenza</div>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats[FILTER_OPTIONS.MISSING]}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Mancanti</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats[FILTER_OPTIONS.VALID]}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Validi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
