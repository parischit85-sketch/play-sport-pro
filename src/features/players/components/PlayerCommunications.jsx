// =============================================
// FILE: src/features/players/components/PlayerCommunications.jsx
// Sistema di comunicazioni per email/SMS/notifiche
// =============================================

import React, { useState } from 'react';

export default function PlayerCommunications({ player, T }) {
  const [newMessage, setNewMessage] = useState({
    type: 'email',
    subject: '',
    message: '',
    priority: 'normal',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Templates predefiniti
  const messageTemplates = [
    {
      id: 'welcome',
      name: 'Messaggio di Benvenuto',
      subject: 'Benvenuto in Play Sport Pro!',
      content: `Ciao ${player.firstName},\n\nBenvenuto nella famiglia di Play Sport Pro! Siamo felici di averti con noi.\n\nPuoi prenotare i campi direttamente dall'app e tenere traccia del tuo saldo wallet.\n\nBuon gioco!\nIl Team Play Sport Pro`,
      type: 'email',
    },
    {
      id: 'booking_reminder',
      name: 'Promemoria Prenotazione',
      subject: 'Promemoria: Prenotazione di domani',
      content: `Ciao ${player.firstName},\n\nTi ricordiamo la tua prenotazione per domani:\n\n📅 Data: [DATA]\n⏰ Orario: [ORARIO]\n🏟️ Campo: [CAMPO]\n👥 Giocatori: [GIOCATORI]\n\nCi vediamo in campo!\nIl Team Play Sport Pro`,
      type: 'email',
    },
    {
      id: 'payment_reminder',
      name: 'Promemoria Pagamento',
      subject: 'Promemoria: Pagamento prenotazione',
      content: `Ciao ${player.firstName},\n\nTi ricordiamo che hai una prenotazione non ancora pagata:\n\n📅 Data: [DATA]\n⏰ Orario: [ORARIO]\n💰 Importo: €[IMPORTO]\n\nPuoi pagare in reception o tramite l'app.\n\nGrazie!\nIl Team Play Sport Pro`,
      type: 'email',
    },
    {
      id: 'tournament_invite',
      name: 'Invito Torneo',
      subject: 'Nuovo Torneo: Partecipa ora!',
      content: `Ciao ${player.firstName},\n\nÈ appena iniziato un nuovo torneo di [SPORT]!\n\n🏆 Nome: [NOME_TORNEO]\n📅 Inizio: [DATA_INIZIO]\n💰 Premio: [PREMIO]\n\nIscriviti dall'app per partecipare!\n\nBuona fortuna!\nIl Team Play Sport Pro`,
      type: 'email',
    },
    {
      id: 'sms_booking',
      name: 'SMS Prenotazione Confermata',
      content: `🏟️ Prenotazione confermata!\n📅 ${new Date().toLocaleDateString()}\n⏰ [ORARIO]\nCampo: [CAMPO]\nPlay Sport Pro`,
      type: 'sms',
    },
    {
      id: 'sms_reminder',
      name: 'SMS Promemoria',
      content: `⚡ Promemoria: prenotazione domani alle [ORARIO] - Campo [CAMPO]. Ci vediamo! 🎾`,
      type: 'sms',
    },
  ];

  // Storico comunicazioni (mock data)
  const communicationHistory = [
    {
      id: 'comm1',
      type: 'email',
      subject: 'Benvenuto in Play Sport Pro!',
      sentDate: '2025-09-01T10:00:00',
      status: 'delivered',
      openDate: '2025-09-01T10:30:00',
      template: 'welcome',
    },
    {
      id: 'comm2',
      type: 'sms',
      subject: 'Prenotazione confermata',
      sentDate: '2025-09-05T15:30:00',
      status: 'delivered',
      template: 'sms_booking',
    },
    {
      id: 'comm3',
      type: 'push',
      subject: 'Nuovo torneo disponibile',
      sentDate: '2025-09-07T09:00:00',
      status: 'delivered',
      clickDate: '2025-09-07T09:15:00',
    },
  ];

  const handleSendMessage = () => {
    // Qui implementeremo l'invio del messaggio
    console.log('Invio messaggio:', newMessage);

    // Reset form
    setNewMessage({
      type: 'email',
      subject: '',
      message: '',
      priority: 'normal',
    });

    alert(`Messaggio ${newMessage.type} inviato a ${player.firstName}!`);
  };

  const applyTemplate = (template) => {
    setNewMessage((prev) => ({
      ...prev,
      type: template.type,
      subject: template.subject || '',
      message: template.content,
    }));
    setShowTemplateModal(false);
  };

  const getStatusIcon = (type, status) => {
    if (status === 'failed') return '❌';
    if (status === 'pending') return '⏳';

    switch (type) {
      case 'email':
        return '📧';
      case 'sms':
        return '💬';
      case 'push':
        return '🔔';
      default:
        return '📨';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-orange-600 dark:text-orange-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const stats = {
    totalSent: communicationHistory.length,
    emails: communicationHistory.filter((c) => c.type === 'email').length,
    sms: communicationHistory.filter((c) => c.type === 'sms').length,
    push: communicationHistory.filter((c) => c.type === 'push').length,
    opened: communicationHistory.filter((c) => c.openDate || c.clickDate).length,
  };

  return (
    <div className="space-y-6">
      {/* Statistiche comunicazioni */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalSent}
          </div>
          <div className={`text-xs ${T.subtext}`}>Totali</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.emails}
          </div>
          <div className={`text-xs ${T.subtext}`}>📧 Email</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.sms}</div>
          <div className={`text-xs ${T.subtext}`}>💬 SMS</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.push}
          </div>
          <div className={`text-xs ${T.subtext}`}>🔔 Push</div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 text-center`}>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.opened}</div>
          <div className={`text-xs ${T.subtext}`}>👁️ Aperti</div>
        </div>
      </div>

      {/* Form nuovo messaggio */}
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <h4 className={`font-semibold ${T.text} mb-4 flex items-center gap-2`}>
          ✉️ Nuova Comunicazione
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium ${T.text} mb-2`}>Tipo di messaggio</label>
            <select
              value={newMessage.type}
              onChange={(e) => setNewMessage((prev) => ({ ...prev, type: e.target.value }))}
              className={`${T.input} w-full`}
            >
              <option value="email">📧 Email</option>
              <option value="sms">💬 SMS</option>
              <option value="push">🔔 Push Notification</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${T.text} mb-2`}>Priorità</label>
            <select
              value={newMessage.priority}
              onChange={(e) => setNewMessage((prev) => ({ ...prev, priority: e.target.value }))}
              className={`${T.input} w-full`}
            >
              <option value="low">🟢 Bassa</option>
              <option value="normal">🟡 Normale</option>
              <option value="high">🟠 Alta</option>
              <option value="urgent">🔴 Urgente</option>
            </select>
          </div>
        </div>

        {/* Soggetto per email */}
        {newMessage.type === 'email' && (
          <div className="mb-4">
            <label className={`block text-sm font-medium ${T.text} mb-2`}>Oggetto</label>
            <input
              type="text"
              value={newMessage.subject}
              onChange={(e) => setNewMessage((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Inserisci l'oggetto dell'email"
              className={`${T.input} w-full`}
            />
          </div>
        )}

        {/* Messaggio */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className={`block text-sm font-medium ${T.text}`}>Messaggio</label>
            <button
              onClick={() => setShowTemplateModal(true)}
              className={`${T.btnSecondary} text-xs px-3 py-1`}
            >
              📋 Template
            </button>
          </div>
          <textarea
            value={newMessage.message}
            onChange={(e) => setNewMessage((prev) => ({ ...prev, message: e.target.value }))}
            placeholder={`Scrivi il tuo messaggio ${newMessage.type}...`}
            rows={newMessage.type === 'sms' ? 3 : 6}
            maxLength={newMessage.type === 'sms' ? 160 : undefined}
            className={`${T.input} w-full resize-none`}
          />
          {newMessage.type === 'sms' && (
            <div className={`text-right text-xs ${T.subtext} mt-1`}>
              {newMessage.message.length}/160 caratteri
            </div>
          )}
        </div>

        {/* Destinatario */}
        <div className={`mb-4 p-3 ${T.border} rounded-lg`}>
          <div className={`text-sm font-medium ${T.text} mb-1`}>Destinatario:</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {player.firstName?.[0]}
              {player.lastName?.[0]}
            </div>
            <div>
              <div className={`font-medium ${T.text}`}>
                {player.firstName} {player.lastName}
              </div>
              <div className={`text-xs ${T.subtext}`}>
                {newMessage.type === 'email' && player.email}
                {newMessage.type === 'sms' && player.phone}
                {newMessage.type === 'push' && 'App mobile'}
              </div>
            </div>
          </div>
        </div>

        {/* Pulsanti azione */}
        <div className="flex gap-3">
          <button
            onClick={handleSendMessage}
            disabled={
              !newMessage.message.trim() ||
              (newMessage.type === 'email' && !newMessage.subject.trim())
            }
            className={`${T.btnPrimary} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            🚀 Invia {newMessage.type.toUpperCase()}
          </button>

          <button
            onClick={() =>
              setNewMessage({
                type: 'email',
                subject: '',
                message: '',
                priority: 'normal',
              })
            }
            className={`${T.btnSecondary} px-6`}
          >
            🗑️ Cancella
          </button>
        </div>
      </div>

      {/* Storico comunicazioni */}
      <div>
        <h4 className={`font-semibold ${T.text} mb-4`}>
          📋 Storico Comunicazioni ({communicationHistory.length})
        </h4>

        {communicationHistory.length === 0 ? (
          <div className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}>
            <div className="text-4xl mb-2">📭</div>
            <div className={`${T.subtext} mb-4`}>Nessuna comunicazione inviata</div>
          </div>
        ) : (
          <div className="space-y-3">
            {communicationHistory
              .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
              .map((comm) => (
                <div key={comm.id} className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getStatusIcon(comm.type, comm.status)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${T.text}`}>{comm.subject}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(comm.status)} bg-gray-100 dark:bg-gray-800`}
                        >
                          {comm.status}
                        </span>
                      </div>

                      <div className={`text-sm ${T.subtext}`}>
                        📅 Inviato: {new Date(comm.sentDate).toLocaleDateString('it-IT')} alle{' '}
                        {new Date(comm.sentDate).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      {comm.openDate && (
                        <div className={`text-sm ${T.subtext}`}>
                          👁️ Aperto: {new Date(comm.openDate).toLocaleDateString('it-IT')} alle{' '}
                          {new Date(comm.openDate).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}

                      {comm.clickDate && (
                        <div className={`text-sm ${T.subtext}`}>
                          👆 Cliccato: {new Date(comm.clickDate).toLocaleDateString('it-IT')} alle{' '}
                          {new Date(comm.clickDate).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className={`text-xs ${T.subtext} uppercase tracking-wide`}>
                        {comm.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${T.modalBg} rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${T.text}`}>📋 Template Messaggi</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className={`${T.btnSecondary} px-4 py-2`}
                >
                  ✖️
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {messageTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`${T.border} rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors`}
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{template.type === 'email' ? '📧' : '💬'}</span>
                      <div>
                        <div className={`font-medium ${T.text}`}>{template.name}</div>
                        <div className={`text-xs ${T.subtext} uppercase`}>{template.type}</div>
                      </div>
                    </div>

                    {template.subject && (
                      <div className={`text-sm font-medium ${T.text} mb-2`}>{template.subject}</div>
                    )}

                    <div className={`text-sm ${T.subtext} line-clamp-3`}>{template.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
