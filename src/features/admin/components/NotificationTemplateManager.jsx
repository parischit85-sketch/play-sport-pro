// =============================================
// FILE: src/features/admin/components/NotificationTemplateManager.jsx
// Gestione template multicanale (Email, WhatsApp, Push) per certificati medici
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@config/firebase';
import { Mail, MessageCircle, Bell } from 'lucide-react';

const DEFAULT_TEMPLATES = {
  email: {
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
  },
  whatsapp: {
    expired: {
      message: `🚨 *Certificato Medico Scaduto*

Ciao {{nome}},

Il tuo certificato medico è *SCADUTO* in data {{dataScadenza}}.

⚠️ Non puoi partecipare alle attività fino al rinnovo.

*Cosa fare:*
✅ Prenota visita medica
✅ Carica nuovo certificato nell'app
✅ Comunicaci nuova scadenza

Per info contattaci! 💬

_{{nomeClub}}_`,
    },
    expiring: {
      message: `⏰ *Certificato in Scadenza*

Ciao {{nome}},

Il tuo certificato scadrà il *{{dataScadenza}}* (tra {{giorniRimanenti}} giorni).

*Rinnova subito per evitare interruzioni!*

*Cosa fare:*
✅ Prenota visita medica
✅ Carica nuovo certificato nell'app
✅ Comunicaci nuova scadenza

Per info contattaci! 💬

_{{nomeClub}}_`,
    },
    missing: {
      message: `📋 *Certificato Medico Mancante*

Ciao {{nome}},

Non risulta ancora caricato il tuo certificato medico.

⚠️ *OBBLIGATORIO per partecipare alle attività!*

*Cosa fare:*
✅ Effettua visita medica
✅ Carica certificato nell'app
✅ Comunicaci data scadenza

Per info contattaci! 💬

_{{nomeClub}}_`,
    },
  },
  push: {
    expired: {
      title: '⚠️ Certificato Scaduto',
      body: 'Il tuo certificato medico è scaduto il {{dataScadenza}}. Rinnovalo subito per continuare le attività.',
    },
    expiring: {
      title: '🔔 Certificato in Scadenza',
      body: 'Il tuo certificato scadrà tra {{giorniRimanenti}} giorni ({{dataScadenza}}). Rinnovalo ora!',
    },
    missing: {
      title: '❌ Certificato Mancante',
      body: 'Carica il tuo certificato medico per partecipare alle attività del club.',
    },
  },
};

export default function NotificationTemplateManager({ clubId, onClose }) {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [selectedType, setSelectedType] = useState('expired');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      const docRef = doc(db, 'clubs', clubId, 'settings', 'notificationTemplates');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Merge con template predefiniti per retrocompatibilità
        const loadedData = docSnap.data();
        setTemplates({
          email: { ...DEFAULT_TEMPLATES.email, ...loadedData.email },
          whatsapp: { ...DEFAULT_TEMPLATES.whatsapp, ...loadedData.whatsapp },
          push: { ...DEFAULT_TEMPLATES.push, ...loadedData.push },
        });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }, [clubId]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const docRef = doc(db, 'clubs', clubId, 'settings', 'notificationTemplates');
      await setDoc(docRef, templates);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving templates:', error);
      alert('Errore durante il salvataggio dei template');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (confirm('Vuoi ripristinare i template predefiniti? Le modifiche andranno perse.')) {
      setTemplates(DEFAULT_TEMPLATES);
    }
  }

  function updateTemplate(channel, type, field, value) {
    setTemplates((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: {
          ...prev[channel][type],
          [field]: value,
        },
      },
    }));
  }

  const channels = [
    { key: 'email', label: 'Email', icon: Mail, color: 'blue' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'green' },
    { key: 'push', label: 'Push', icon: Bell, color: 'purple' },
  ];

  const templateTypes = [
    { key: 'expired', label: '⚠️ Scaduto', color: 'red' },
    { key: 'expiring', label: '🔔 In Scadenza', color: 'yellow' },
    { key: 'missing', label: '❌ Mancante', color: 'gray' },
  ];

  const currentTemplate = templates[selectedChannel][selectedType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📝 Gestione Template Notifiche Certificati
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <button
                key={channel.key}
                onClick={() => setSelectedChannel(channel.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all ${
                  selectedChannel === channel.key
                    ? `bg-${channel.color}-600 text-white shadow-lg`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {channel.label}
              </button>
            );
          })}
        </div>

        {/* Info Variabili */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4 mb-6">
          <div className="text-blue-300 text-sm">
            <strong className="block mb-2">📝 Variabili disponibili:</strong>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                • <code className="bg-gray-900 px-2 py-1 rounded">{'{{nome}}'}</code> - Nome
                giocatore
              </div>
              <div>
                • <code className="bg-gray-900 px-2 py-1 rounded">{'{{dataScadenza}}'}</code> -
                Data scadenza
              </div>
              <div>
                • <code className="bg-gray-900 px-2 py-1 rounded">{'{{giorniRimanenti}}'}</code> -
                Giorni alla scadenza
              </div>
              <div>
                • <code className="bg-gray-900 px-2 py-1 rounded">{'{{nomeClub}}'}</code> - Nome
                del club
              </div>
            </div>
            {selectedChannel === 'whatsapp' && (
              <div className="mt-3 text-xs text-green-300">
                💡 <strong>WhatsApp:</strong> Usa *testo* per grassetto, _testo_ per corsivo
              </div>
            )}
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-600">
          {templateTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedType === type.key
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Template Editor */}
        <div className="space-y-4 mb-6">
          {/* Email Template */}
          {selectedChannel === 'email' && (
            <>
              <div>
                <label htmlFor="email-subject" className="block text-white font-semibold mb-2">Oggetto</label>
                <input
                  id="email-subject"
                  type="text"
                  value={currentTemplate.subject}
                  onChange={(e) =>
                    updateTemplate(selectedChannel, selectedType, 'subject', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email-body" className="block text-white font-semibold mb-2">Corpo del messaggio</label>
                <textarea
                  id="email-body"
                  value={currentTemplate.body}
                  onChange={(e) =>
                    updateTemplate(selectedChannel, selectedType, 'body', e.target.value)
                  }
                  rows={12}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                />
              </div>
            </>
          )}

          {/* WhatsApp Template */}
          {selectedChannel === 'whatsapp' && (
            <div>
              <label htmlFor="whatsapp-message" className="block text-white font-semibold mb-2">Messaggio WhatsApp</label>
              <textarea
                id="whatsapp-message"
                value={currentTemplate.message}
                onChange={(e) =>
                  updateTemplate(selectedChannel, selectedType, 'message', e.target.value)
                }
                rows={14}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm resize-none"
                placeholder="Scrivi il messaggio WhatsApp..."
              />
              <p className="text-xs text-gray-400 mt-2">
                💡 Suggerimento: Mantieni il messaggio breve e diretto. WhatsApp supporta emoji e
                formattazione markdown.
              </p>
            </div>
          )}

          {/* Push Template */}
          {selectedChannel === 'push' && (
            <>
              <div>
                <label htmlFor="push-title" className="block text-white font-semibold mb-2">
                  Titolo Notifica Push
                </label>
                <input
                  id="push-title"
                  type="text"
                  value={currentTemplate.title}
                  onChange={(e) =>
                    updateTemplate(selectedChannel, selectedType, 'title', e.target.value)
                  }
                  maxLength={50}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {currentTemplate.title?.length || 0}/50 caratteri
                </p>
              </div>
              <div>
                <label htmlFor="push-body" className="block text-white font-semibold mb-2">Testo Notifica</label>
                <textarea
                  id="push-body"
                  value={currentTemplate.body}
                  onChange={(e) =>
                    updateTemplate(selectedChannel, selectedType, 'body', e.target.value)
                  }
                  rows={4}
                  maxLength={200}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {currentTemplate.body?.length || 0}/200 caratteri (consigliato: max 120)
                </p>
              </div>
            </>
          )}

          {/* Preview */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-3 flex items-center gap-2">
              <span>👁️ ANTEPRIMA</span>
              {selectedChannel === 'push' && (
                <span className="text-yellow-500 text-xs">(simula notifica mobile)</span>
              )}
            </div>

            {selectedChannel === 'email' && (
              <div className="text-white">
                <div className="font-bold mb-2 text-lg">{currentTemplate.subject}</div>
                <div className="text-sm whitespace-pre-wrap text-gray-300">
                  {currentTemplate.body
                    ?.replace(/\{\{nome\}\}/g, 'Mario Rossi')
                    .replace(/\{\{dataScadenza\}\}/g, '15/12/2025')
                    .replace(/\{\{giorniRimanenti\}\}/g, '10')
                    .replace(/\{\{nomeClub\}\}/g, 'Il tuo Club')}
                </div>
              </div>
            )}

            {selectedChannel === 'whatsapp' && (
              <div className="bg-green-100 rounded-lg p-4 max-w-md">
                <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {currentTemplate.message
                    ?.replace(/\{\{nome\}\}/g, 'Mario Rossi')
                    .replace(/\{\{dataScadenza\}\}/g, '15/12/2025')
                    .replace(/\{\{giorniRimanenti\}\}/g, '10')
                    .replace(/\{\{nomeClub\}\}/g, 'Il tuo Club')
                    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                    .replace(/_([^_]+)_/g, '<em>$1</em>')
                    .split('\n')
                    .map((line, i) => (
                      <div
                        key={i}
                        dangerouslySetInnerHTML={{ __html: line || '<br />' }}
                        className="leading-relaxed"
                      />
                    ))}
                </div>
                <div className="text-xs text-gray-500 mt-2 text-right">10:30</div>
              </div>
            )}

            {selectedChannel === 'push' && (
              <div className="bg-white rounded-xl shadow-lg p-4 max-w-sm border-l-4 border-purple-600">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-600 rounded-full p-2 flex-shrink-0">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm mb-1">
                      {currentTemplate.title
                        ?.replace(/\{\{nome\}\}/g, 'Mario Rossi')
                        .replace(/\{\{dataScadenza\}\}/g, '15/12/2025')
                        .replace(/\{\{giorniRimanenti\}\}/g, '10')
                        .replace(/\{\{nomeClub\}\}/g, 'Il tuo Club')}
                    </div>
                    <div className="text-gray-600 text-xs leading-relaxed">
                      {currentTemplate.body
                        ?.replace(/\{\{nome\}\}/g, 'Mario Rossi')
                        .replace(/\{\{dataScadenza\}\}/g, '15/12/2025')
                        .replace(/\{\{giorniRimanenti\}\}/g, '10')
                        .replace(/\{\{nomeClub\}\}/g, 'Il tuo Club')}
                    </div>
                    <div className="text-gray-400 text-xs mt-2">Il tuo Club · Adesso</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-3 mb-4 text-green-300 text-sm">
            ✅ Template salvati con successo!
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium"
          >
            ↺ Ripristina Predefiniti
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-600 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors font-medium"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {saving ? 'Salvataggio...' : '💾 Salva Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
