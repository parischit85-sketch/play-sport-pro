// =============================================
// FILE: src/features/players/components/PlayerMedicalTab.jsx
// Tab certificato medico per PlayerDetails (SEMPLIFICATO - solo dati)
// Updated: 2025-10-13 - Fixed React key warnings
// =============================================

import React, { useState, useEffect } from 'react';
import {
  archiveCurrentCertificate,
  updateCertificateData,
  calculateCertificateStatus,
} from '@services/medicalCertificates.js';
import { CERTIFICATE_TYPES } from '../types/playerTypes.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import { useClub } from '@contexts/ClubContext.jsx';

export default function PlayerMedicalTab({ player, onUpdate, T }) {
  const { currentUser } = useAuth();
  const { clubId } = useClub();
  
  // 🔍 DEBUG: Log what we receive for player 70xe0dha
  useEffect(() => {
    if (player.id === '70xe0dha') {
      console.log('🔍 [PlayerMedicalTab] Received player 70xe0dha:', {
        id: player.id,
        name: player.name,
        hasCertificate: !!player.medicalCertificates,
        certificateData: player.medicalCertificates,
        current: player.medicalCertificates?.current,
        hasCurrentCert: !!player.medicalCertificates?.current,
        hasExpiryDate: !!player.medicalCertificates?.current?.expiryDate,
        expiryDate: player.medicalCertificates?.current?.expiryDate,
        certificateStatus: player.certificateStatus,
        editing: !player.medicalCertificates?.current?.expiryDate,
        allKeys: Object.keys(player)
      });
    }
  }, [player]);

  const [editing, setEditing] = useState(!player.medicalCertificates?.current?.expiryDate);
  const [formData, setFormData] = useState({
    type: player.medicalCertificates?.current?.type || 'agonistic',
    otherType: player.medicalCertificates?.current?.otherType || '',
    issueDate: player.medicalCertificates?.current?.issueDate || '',
    expiryDate: player.medicalCertificates?.current?.expiryDate || '',
    notes: player.medicalCertificates?.current?.notes || '',
  });

  // 🔧 FIX: Aggiorna formData e editing quando cambia il certificato del player
  useEffect(() => {
    const currentCert = player.medicalCertificates?.current;
    if (currentCert?.expiryDate) {
      setFormData({
        type: currentCert.type || 'agonistic',
        otherType: currentCert.otherType || '',
        issueDate: currentCert.issueDate || '',
        expiryDate: currentCert.expiryDate || '',
        notes: currentCert.notes || '',
      });
      setEditing(false); // Mostra il certificato invece del form
    } else {
      setEditing(true); // Mostra il form se non c'è certificato
    }
  }, [player.medicalCertificates?.current]);

  // Auto-calcola data scadenza quando cambia data emissione
  useEffect(() => {
    if (formData.issueDate && !formData.expiryDate) {
      const issueDate = new Date(formData.issueDate);
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      setFormData((prev) => ({
        ...prev,
        expiryDate: expiryDate.toISOString().split('T')[0],
      }));
    }
  }, [formData.issueDate]);

  const cert = player.medicalCertificates?.current;
  const history = player.medicalCertificates?.history || [];
  const status = calculateCertificateStatus(cert?.expiryDate);

  /**
   * Calcola giorni fino alla scadenza
   */
  const calculateDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  /**
   * Badge status certificato
   */
  const getStatusBadge = () => {
    if (!cert?.expiryDate) {
      return (
        <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm font-medium">
          📄 Nessun certificato
        </span>
      );
    }

    const days = calculateDaysUntilExpiry(cert.expiryDate);

    if (days < 0) {
      return (
        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
          ⚠️ SCADUTO {Math.abs(days)} giorni fa
        </span>
      );
    }

    if (days <= 15) {
      return (
        <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-medium animate-pulse">
          ⏰ URGENTE - Scade tra {days} {days === 1 ? 'giorno' : 'giorni'}
        </span>
      );
    }

    if (days <= 30) {
      return (
        <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
          ⏰ In scadenza tra {days} giorni
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
        ✅ Valido - Scade tra {days} giorni
      </span>
    );
  };

  /**
   * Elimina certificato
   */
  const handleDelete = async () => {
    if (
      !confirm('Sei sicuro di voler eliminare questo certificato? Verrà spostato nello storico.')
    ) {
      return;
    }

    try {
      await archiveCurrentCertificate(clubId, player.id);

      // Aggiorna UI
      onUpdate({
        medicalCertificates: {
          current: null,
          history: [...history, { ...cert, archivedAt: new Date().toISOString() }],
        },
        certificateStatus: calculateCertificateStatus(null),
      });

      alert('✅ Certificato archiviato con successo');
      setEditing(true); // Apri form per nuovo certificato
    } catch (error) {
      console.error('Delete error:', error);
      alert("❌ Errore durante l'eliminazione: " + error.message);
    }
  };

  /**
   * Salva/Crea certificato
   */
  const handleSave = async () => {
    // Validazione
    if (!formData.issueDate || !formData.expiryDate) {
      alert('⚠️ Data emissione e scadenza sono obbligatorie');
      return;
    }

    if (formData.type === 'other' && !formData.otherType.trim()) {
      alert('⚠️ Specifica il tipo di certificato per "Altro"');
      return;
    }

    try {
      const newCert = {
        id: cert?.id || `cert_${Date.now()}`,
        type: formData.type,
        otherType: formData.type === 'other' ? formData.otherType : '',
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        notes: formData.notes,
        createdAt: cert?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || '',
      };

      await updateCertificateData(clubId, player.id, newCert);

      onUpdate({
        medicalCertificates: {
          ...player.medicalCertificates,
          current: newCert,
        },
        certificateStatus: calculateCertificateStatus(newCert.expiryDate),
      });

      setEditing(false);
      alert('✅ Certificato salvato con successo!');
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Errore durante il salvataggio: ' + error.message);
    }
  };

  /**
   * Renderizza tipo certificato
   */
  const getCertificateTypeLabel = (type, otherType) => {
    if (type === 'agonistic') return '🏅 Agonistico';
    if (type === 'non-agonistic') return '🏃 Non Agonistico';
    if (type === 'other') return `📋 ${otherType || 'Altro'}`;
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 shadow-lg relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏥</span>
              <h3 className={`text-2xl font-bold ${T.text}`}>Certificato Medico Sportivo</h3>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Alert se scaduto */}
      {status.isExpired && (
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-200">Certificato Scaduto</h4>
              <p className="text-sm text-red-300 mt-1">
                Il certificato è scaduto da {Math.abs(status.daysUntilExpiry)} giorni. Il giocatore
                non può effettuare prenotazioni fino al rinnovo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alert se in scadenza urgente */}
      {status.isExpiring && status.daysUntilExpiry <= 15 && !status.isExpired && (
        <div className="bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <h4 className="font-semibold text-orange-200">
                Scadenza Imminente
              </h4>
              <p className="text-sm text-orange-300 mt-1">
                Il certificato scade tra {status.daysUntilExpiry} giorni. Rinnova al più presto!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Certificato (Creazione o Modifica) */}
      {editing ? (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
          <h4 className={`font-semibold ${T.text} mb-4`}>
            {cert?.expiryDate ? '✏️ Modifica Certificato' : '📝 Nuovo Certificato'}
          </h4>

          <div className="space-y-4">
            {/* Tipo Certificato */}
            <div>
              <label htmlFor="cert-type" className={`block text-sm font-medium ${T.text} mb-1`}>
                Tipo Certificato *
              </label>
              <select
                id="cert-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={`${T.input} w-full`}
                required
              >
                <option value="agonistic">🏅 Agonistico</option>
                <option value="non-agonistic">🏃 Non Agonistico</option>
                <option value="other">📋 Altro (specifica sotto)</option>
              </select>
            </div>

            {/* Campo "Altro" - appare solo se type === 'other' */}
            {formData.type === 'other' && (
              <div>
                <label htmlFor="other-type" className={`block text-sm font-medium ${T.text} mb-1`}>
                  Specifica tipo *
                </label>
                <input
                  id="other-type"
                  type="text"
                  value={formData.otherType}
                  onChange={(e) => setFormData({ ...formData, otherType: e.target.value })}
                  className={`${T.input} w-full`}
                  placeholder="es. Idoneità fisica, Visita medica generica..."
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data Emissione */}
              <div>
                <label
                  htmlFor="cert-issue-date"
                  className={`block text-sm font-medium ${T.text} mb-1`}
                >
                  Data Emissione *
                </label>
                <input
                  id="cert-issue-date"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className={`${T.input} w-full`}
                  required
                />
                <p className={`text-xs ${T.subtext} mt-1`}>
                  La scadenza verrà calcolata automaticamente a +1 anno
                </p>
              </div>

              {/* Data Scadenza */}
              <div>
                <label
                  htmlFor="cert-expiry-date"
                  className={`block text-sm font-medium ${T.text} mb-1`}
                >
                  Data Scadenza *
                </label>
                <input
                  id="cert-expiry-date"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className={`${T.input} w-full`}
                  required
                />
                <p className={`text-xs ${T.subtext} mt-1`}>
                  Puoi modificare la scadenza se diversa da +1 anno
                </p>
              </div>
            </div>

            {/* Note */}
            <div>
              <label htmlFor="cert-notes" className={`block text-sm font-medium ${T.text} mb-1`}>
                Note (opzionale)
              </label>
              <textarea
                id="cert-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={`${T.input} w-full`}
                rows={3}
                placeholder="Note aggiuntive sul certificato..."
              />
            </div>

            {/* Azioni */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                💾 Salva Certificato
              </button>
              {cert?.expiryDate && (
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      type: cert.type,
                      otherType: cert.otherType || '',
                      issueDate: cert.issueDate,
                      expiryDate: cert.expiryDate,
                      notes: cert.notes || '',
                    });
                  }}
                  className={`px-4 py-2 ${T.btnSecondary}`}
                >
                  ❌ Annulla
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Visualizzazione Certificato */
        cert?.expiryDate && (
          <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
            <h4 className={`font-semibold ${T.text} mb-4`}>✅ Certificato Attivo</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className={`text-xs ${T.subtext} block`}>Tipologia</span>
                <p className={`${T.text} font-medium text-lg`}>
                  {getCertificateTypeLabel(cert.type, cert.otherType)}
                </p>
              </div>

              <div>
                <span className={`text-xs ${T.subtext} block`}>Data Emissione</span>
                <p className={`${T.text} font-medium`}>
                  {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('it-IT') : 'N/A'}
                </p>
              </div>

              <div>
                <span className={`text-xs ${T.subtext} block`}>Data Scadenza</span>
                <p className={`${T.text} font-medium text-lg`}>
                  {new Date(cert.expiryDate).toLocaleDateString('it-IT')}
                </p>
              </div>

              <div>
                <span className={`text-xs ${T.subtext} block`}>Giorni Rimanenti</span>
                <p
                  className={`font-medium text-lg ${
                    calculateDaysUntilExpiry(cert.expiryDate) < 0
                      ? 'text-red-400'
                      : calculateDaysUntilExpiry(cert.expiryDate) <= 30
                        ? 'text-orange-400'
                        : 'text-green-400'
                  }`}
                >
                  {calculateDaysUntilExpiry(cert.expiryDate) < 0
                    ? `Scaduto da ${Math.abs(calculateDaysUntilExpiry(cert.expiryDate))} giorni`
                    : `${calculateDaysUntilExpiry(cert.expiryDate)} giorni`}
                </p>
              </div>

              {cert.notes && (
                <div className="md:col-span-2">
                  <span className={`text-xs ${T.subtext} block`}>Note</span>
                  <p className={`${T.text} text-sm bg-gray-800 p-3 rounded-lg`}>
                    {cert.notes}
                  </p>
                </div>
              )}

              {cert.updatedAt && (
                <div className="md:col-span-2">
                  <span className={`text-xs ${T.subtext}`}>
                    Ultimo aggiornamento: {new Date(cert.updatedAt).toLocaleDateString('it-IT')}{' '}
                    {cert.updatedBy && `da ${cert.updatedBy}`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-700">
              <button onClick={() => setEditing(true)} className={`px-4 py-2 ${T.btnSecondary}`}>
                ✏️ Modifica
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Archivia
              </button>
            </div>
          </div>
        )
      )}

      {/* Messaggio se non c'è certificato e non è in editing */}
      {!cert?.expiryDate && !editing && (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-8 text-center`}>
          <div className="text-6xl mb-4">📄</div>
          <h4 className={`text-lg font-semibold ${T.text} mb-2`}>
            Nessun certificato medico caricato
          </h4>
          <p className={`${T.subtext} mb-6`}>
            Aggiungi i dati del certificato medico sportivo per permettere al giocatore di prenotare
          </p>
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Aggiungi Certificato
          </button>
        </div>
      )}

      {/* Storico Certificati */}
      {history.length > 0 && (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
          <h4 className={`text-lg font-semibold ${T.text} mb-4`}>
            📚 Storico Certificati ({history.length})
          </h4>

          <div className="space-y-3">
            {history.map((oldCert, index) => (
              <div
                key={oldCert.id || `cert-${oldCert.archivedAt || oldCert.uploadedAt || index}`}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className={`${T.text} font-medium`}>
                    {getCertificateTypeLabel(oldCert.type, oldCert.otherType)}
                  </p>
                  <p className={`text-sm ${T.subtext} mt-1`}>
                    Emissione:{' '}
                    {oldCert.issueDate
                      ? new Date(oldCert.issueDate).toLocaleDateString('it-IT')
                      : 'N/A'}{' '}
                    • Scadenza:{' '}
                    {oldCert.expiryDate
                      ? new Date(oldCert.expiryDate).toLocaleDateString('it-IT')
                      : 'N/A'}
                  </p>
                  {oldCert.archivedAt && (
                    <p className={`text-xs ${T.subtext} mt-1`}>
                      Archiviato il {new Date(oldCert.archivedAt).toLocaleDateString('it-IT')}
                    </p>
                  )}
                  {oldCert.notes && (
                    <p className={`text-xs ${T.subtext} mt-1 italic`}>Note: {oldCert.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <h5 className="font-semibold text-blue-200 flex items-center gap-2 mb-2">
          <span>ℹ️</span> Informazioni Certificato Medico
        </h5>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• La data di scadenza viene calcolata automaticamente a +1 anno dalla data di emissione</li>
          <li>• Puoi modificare manualmente la scadenza se necessario</li>
          <li>• I certificati scaduti impediscono al giocatore di effettuare prenotazioni</li>
          <li>• Riceverai notifiche automatiche 30, 15 e 7 giorni prima della scadenza</li>
        </ul>
      </div>
    </div>
  );
}

