// =============================================
// FILE: src/features/players/components/PlayerMedicalTab.jsx
// Tab certificato medico per PlayerDetails
// =============================================

import React, { useState } from 'react';
import {
  uploadMedicalCertificate,
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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    type: player.medicalCertificates?.current?.type || 'agonistic',
    number: player.medicalCertificates?.current?.number || '',
    issueDate: player.medicalCertificates?.current?.issueDate || '',
    expiryDate: player.medicalCertificates?.current?.expiryDate || '',
    doctor: player.medicalCertificates?.current?.doctor || '',
    facility: player.medicalCertificates?.current?.facility || '',
    notes: player.medicalCertificates?.current?.notes || '',
  });

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
          📄 Nessun certificato caricato
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
   * Upload file PDF
   */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      alert('Solo file PDF o immagini sono accettati');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File troppo grande. Dimensione massima: 5MB');
      return;
    }

    try {
      setUploading(true);
      const downloadURL = await uploadMedicalCertificate(clubId, player.id, file, (progress) =>
        setUploadProgress(progress)
      );

      // Aggiorna il certificato con il nuovo file
      const updatedCert = {
        ...cert,
        fileUrl: downloadURL,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.email || '',
      };

      await updateCertificateData(clubId, player.id, updatedCert);

      // Aggiorna UI
      onUpdate({
        medicalCertificates: {
          ...player.medicalCertificates,
          current: updatedCert,
        },
        certificateStatus: calculateCertificateStatus(updatedCert.expiryDate),
      });

      alert('✅ Certificato caricato con successo!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Errore durante il caricamento: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
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
          current: {
            id: '',
            type: 'agonistic',
            number: '',
            issueDate: null,
            expiryDate: null,
            doctor: '',
            facility: '',
            fileUrl: '',
            fileName: '',
            uploadedAt: null,
            uploadedBy: '',
            notes: '',
          },
          history: [...history, { ...cert, archivedAt: new Date().toISOString() }],
        },
        certificateStatus: calculateCertificateStatus(null),
      });

      alert('✅ Certificato archiviato con successo');
    } catch (error) {
      console.error('Delete error:', error);
      alert("❌ Errore durante l'eliminazione: " + error.message);
    }
  };

  /**
   * Salva modifiche dati certificato
   */
  const handleSaveData = async () => {
    try {
      const updatedCert = {
        ...cert,
        ...formData,
      };

      await updateCertificateData(clubId, player.id, updatedCert);

      onUpdate({
        medicalCertificates: {
          ...player.medicalCertificates,
          current: updatedCert,
        },
        certificateStatus: calculateCertificateStatus(updatedCert.expiryDate),
      });

      setEditing(false);
      alert('✅ Dati certificato aggiornati!');
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Errore durante il salvataggio: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con Status Badge */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className={`text-lg font-semibold ${T.text}`}>🏥 Certificato Medico Sportivo</h3>
        {getStatusBadge()}
      </div>

      {/* Alert se scaduto */}
      {status.isExpired && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200">Certificato Scaduto</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Il certificato è scaduto da {Math.abs(status.daysUntilExpiry)} giorni. Il giocatore
                non può effettuare prenotazioni fino al rinnovo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alert se in scadenza urgente */}
      {status.isExpiring && status.daysUntilExpiry <= 15 && !status.isExpired && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                Scadenza Imminente
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Il certificato scade tra {status.daysUntilExpiry} giorni. Rinnova al più presto!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Certificato Corrente */}
      {cert?.expiryDate ? (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
          <h4 className={`font-semibold ${T.text} mb-4`}>Certificato Attivo</h4>

          {editing ? (
            // Modalità editing
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cert-type" className={`block text-sm font-medium ${T.text} mb-1`}>
                  Tipo Certificato *
                </label>
                <select
                  id="cert-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`${T.input} w-full`}
                >
                  <option value={CERTIFICATE_TYPES.AGONISTIC}>🏅 Agonistico</option>
                  <option value={CERTIFICATE_TYPES.NON_AGONISTIC}>🏃 Non Agonistico</option>
                </select>
              </div>

              <div>
                <label htmlFor="cert-number" className={`block text-sm font-medium ${T.text} mb-1`}>
                  Numero Documento
                </label>
                <input
                  id="cert-number"
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className={`${T.input} w-full`}
                  placeholder="es. 12345/2025"
                />
              </div>

              <div>
                <label
                  htmlFor="cert-issue-date"
                  className={`block text-sm font-medium ${T.text} mb-1`}
                >
                  Data Rilascio *
                </label>
                <input
                  id="cert-issue-date"
                  type="date"
                  value={formData.issueDate || ''}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className={`${T.input} w-full`}
                />
              </div>

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
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className={`${T.input} w-full`}
                />
              </div>

              <div>
                <label htmlFor="cert-doctor" className={`block text-sm font-medium ${T.text} mb-1`}>
                  Medico/Specialista
                </label>
                <input
                  id="cert-doctor"
                  type="text"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className={`${T.input} w-full`}
                  placeholder="Dr. Mario Rossi"
                />
              </div>

              <div>
                <label
                  htmlFor="cert-facility"
                  className={`block text-sm font-medium ${T.text} mb-1`}
                >
                  Struttura/Centro
                </label>
                <input
                  id="cert-facility"
                  type="text"
                  value={formData.facility}
                  onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                  className={`${T.input} w-full`}
                  placeholder="Centro Medico Sportivo"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="cert-notes" className={`block text-sm font-medium ${T.text} mb-1`}>
                  Note
                </label>
                <textarea
                  id="cert-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`${T.input} w-full`}
                  rows={3}
                  placeholder="Note aggiuntive..."
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  onClick={handleSaveData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  💾 Salva Modifiche
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      type: cert.type,
                      number: cert.number,
                      issueDate: cert.issueDate,
                      expiryDate: cert.expiryDate,
                      doctor: cert.doctor,
                      facility: cert.facility,
                      notes: cert.notes,
                    });
                  }}
                  className={`px-4 py-2 ${T.btnSecondary}`}
                >
                  ❌ Annulla
                </button>
              </div>
            </div>
          ) : (
            // Modalità visualizzazione
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className={`text-xs ${T.subtext} block`}>Tipo</span>
                  <p className={`${T.text} font-medium`}>
                    {cert.type === CERTIFICATE_TYPES.AGONISTIC
                      ? '🏅 Agonistico'
                      : '🏃 Non Agonistico'}
                  </p>
                </div>

                <div>
                  <span className={`text-xs ${T.subtext} block`}>Numero Documento</span>
                  <p className={`${T.text} font-medium`}>{cert.number || 'N/A'}</p>
                </div>

                <div>
                  <span className={`text-xs ${T.subtext} block`}>Data Rilascio</span>
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
                  <span className={`text-xs ${T.subtext} block`}>Medico</span>
                  <p className={`${T.text} font-medium`}>{cert.doctor || 'N/A'}</p>
                </div>

                <div>
                  <span className={`text-xs ${T.subtext} block`}>Struttura</span>
                  <p className={`${T.text} font-medium`}>{cert.facility || 'N/A'}</p>
                </div>

                {cert.notes && (
                  <div className="md:col-span-2">
                    <span className={`text-xs ${T.subtext} block`}>Note</span>
                    <p className={`${T.text} text-sm`}>{cert.notes}</p>
                  </div>
                )}

                {cert.fileUrl && (
                  <div className="md:col-span-2">
                    <span className={`text-xs ${T.subtext} block`}>File</span>
                    <div className="flex gap-3 items-center">
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
                      >
                        📄 {cert.fileName || 'Visualizza Certificato'}
                      </a>
                      <span className={`text-xs ${T.subtext}`}>
                        Caricato il {new Date(cert.uploadedAt).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setEditing(true)} className={`px-4 py-2 ${T.btnSecondary}`}>
                  ✏️ Modifica Dati
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🗑️ Archivia Certificato
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Nessun certificato */
        <div className={`${T.cardBg} ${T.border} rounded-xl p-8 text-center`}>
          <div className="text-6xl mb-4">📄</div>
          <h4 className={`text-lg font-semibold ${T.text} mb-2`}>
            Nessun certificato medico caricato
          </h4>
          <p className={`${T.subtext} mb-6`}>
            Carica il certificato medico sportivo del giocatore per permettergli di prenotare
          </p>
        </div>
      )}

      {/* Form Caricamento/Aggiornamento */}
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <h4 className={`text-lg font-semibold ${T.text} mb-4`}>
          {cert?.expiryDate ? '📤 Carica Nuovo Certificato' : '📤 Carica Certificato'}
        </h4>

        <div className="space-y-4">
          <div>
            <label htmlFor="cert-upload" className={`block text-sm font-medium ${T.text} mb-2`}>
              Seleziona File PDF o Immagine (max 5MB)
            </label>
            <input
              id="cert-upload"
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className={`${T.input} w-full`}
            />
          </div>

          {uploading && (
            <div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className={`text-xs ${T.subtext} mt-2 text-center`}>
                Caricamento: {uploadProgress}%
              </p>
            </div>
          )}

          <div className={`text-xs ${T.subtext} space-y-1`}>
            <p>ℹ️ Formati accettati: PDF, JPG, PNG</p>
            <p>ℹ️ Dimensione massima: 5MB</p>
            <p>ℹ️ Dopo il caricamento, compila i dati del certificato</p>
          </div>
        </div>
      </div>

      {/* Storico Certificati */}
      {history.length > 0 && (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
          <h4 className={`text-lg font-semibold ${T.text} mb-4`}>
            📚 Storico Certificati ({history.length})
          </h4>

          <div className="space-y-3">
            {history.map((oldCert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className={`${T.text} font-medium`}>
                    {oldCert.type === CERTIFICATE_TYPES.AGONISTIC
                      ? '🏅 Agonistico'
                      : '🏃 Non Agonistico'}
                    {oldCert.number && ` - ${oldCert.number}`}
                  </p>
                  <p className={`text-xs ${T.subtext}`}>
                    Rilascio:{' '}
                    {oldCert.issueDate
                      ? new Date(oldCert.issueDate).toLocaleDateString('it-IT')
                      : 'N/A'}{' '}
                    - Scadenza:{' '}
                    {oldCert.expiryDate
                      ? new Date(oldCert.expiryDate).toLocaleDateString('it-IT')
                      : 'N/A'}
                  </p>
                  {oldCert.archivedAt && (
                    <p className={`text-xs ${T.subtext}`}>
                      Archiviato il {new Date(oldCert.archivedAt).toLocaleDateString('it-IT')}
                    </p>
                  )}
                </div>
                {oldCert.fileUrl && (
                  <a
                    href={oldCert.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm ml-3"
                  >
                    📄 Visualizza
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
