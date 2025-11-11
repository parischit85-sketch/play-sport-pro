// =============================================
// FILE: src/features/admin/components/EmailTemplateManager.jsx
// Gestione template email certificati medici
// =============================================

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@config/firebase';

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

export default function EmailTemplateManager({ clubId, onClose }) {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selectedType, setSelectedType] = useState('expired');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const docRef = doc(db, 'clubs', clubId, 'settings', 'emailTemplates');
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

  function updateTemplate(type, field, value) {
    setTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  }

  const templateTypes = [
    { key: 'expired', label: '⚠️ Scaduto', color: 'red' },
    { key: 'expiring', label: '🔔 In Scadenza', color: 'yellow' },
    { key: 'missing', label: '❌ Mancante', color: 'gray' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            ✉️ Gestione Template Email Certificati
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
            <strong className="block mb-2">📝 Variabili disponibili:</strong>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div>• <code className="bg-gray-900 px-2 py-1 rounded">{'{{nome}}'}</code> - Nome giocatore</div>
              <div>• <code className="bg-gray-900 px-2 py-1 rounded">{'{{dataScadenza}}'}</code> - Data scadenza</div>
              <div>• <code className="bg-gray-900 px-2 py-1 rounded">{'{{giorniRimanenti}}'}</code> - Giorni alla scadenza</div>
              <div>• <code className="bg-gray-900 px-2 py-1 rounded">{'{{nomeClub}}'}</code> - Nome del club</div>
            </div>
          </div>
        </div>

        {/* Template Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          {templateTypes.map(type => (
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
          {/* Subject */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Oggetto
            </label>
            <input
              type="text"
              value={templates[selectedType].subject}
              onChange={e => updateTemplate(selectedType, 'subject', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Corpo del messaggio
            </label>
            <textarea
              value={templates[selectedType].body}
              onChange={e => updateTemplate(selectedType, 'body', e.target.value)}
              rows={12}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-2">ANTEPRIMA:</div>
            <div className="text-white">
              <div className="font-bold mb-2">{templates[selectedType].subject}</div>
              <div className="text-sm whitespace-pre-wrap text-gray-300">
                {templates[selectedType].body
                  .replace('{{nome}}', 'Mario Rossi')
                  .replace('{{dataScadenza}}', '15/12/2025')
                  .replace('{{giorniRimanenti}}', '10')
                  .replace('{{nomeClub}}', 'Il tuo Club')}
              </div>
            </div>
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
