# 📋 Checklist Sistema Certificati Medici - Dashboard Admin Club

## 📊 Analisi Situazione Attuale

### ✅ Cosa Funziona Attualmente:

1. **PlayersCRM** (`src/features/players/PlayersCRM.jsx`)
   - ✅ Visualizzazione lista giocatori
   - ✅ Ricerca e filtri per categoria
   - ✅ Statistiche generali (totale, membri, attivi, con account)
   - ✅ Creazione nuovi giocatori
   - ✅ Link account esistenti

2. **PlayerDetails** (`src/features/players/components/PlayerDetails.jsx`)
   - ✅ Tab "Panoramica" con info base
   - ✅ Tab "Campionato" con statistiche torneo
   - ✅ Tab "Note" per annotazioni
   - ✅ Tab "Wallet" con gestione crediti
   - ✅ Tab "Prenotazioni" con storico
   - ✅ Tab "Comunicazioni" per messaggi
   - ✅ Visualizzazione dati: nome, email, telefono, data di nascita, età
   - ✅ Stats: ranking, credito, prenotazioni
   - ✅ Gestione attivo/inattivo
   - ✅ Link/unlink account

3. **PlayerForm** (`src/features/players/components/PlayerForm.jsx`)
   - ✅ Tab "Dati Base": nome, cognome, categoria
   - ✅ Tab "Contatti": email, telefono, indirizzo
   - ✅ Tab "Sport": rating, dati sportivi
   - ✅ Tab "Istruttore": prezzi lezioni, certificazioni, bio
   - ✅ Tab "Wallet": gestione crediti
   - ✅ Tab "Preferenze": comunicazioni

4. **PlayerTypes** (`src/features/players/types/playerTypes.js`)
   - ✅ Schema completo giocatore
   - ✅ Dati anagrafici (fiscalCode, address, dateOfBirth)
   - ✅ customFields per estensioni future

---

## ❌ Cosa Manca (da implementare):

### 🏥 **1. Sistema Certificati Medici**

**Campi Mancanti nello Schema:**

- ❌ Certificato medico caricato
- ❌ Data rilascio certificato
- ❌ Data scadenza certificato
- ❌ Tipo di certificato (agonistico/non agonistico)
- ❌ Numero documento
- ❌ Medico/ente rilasciante
- ❌ URL file PDF caricato
- ❌ Status (valido/scaduto/in scadenza)

**Visualizzazione Mancante:**

- ❌ Badge visivo stato certificato su PlayerCard
- ❌ Indicatore scadenza in PlayerDetails
- ❌ Tab dedicata ai documenti medici
- ❌ Alert automatici per certificati in scadenza

**Funzionalità Mancanti:**

- ❌ Upload file PDF certificato
- ❌ Sistema notifiche scadenza (admin + utente)
- ❌ Blocco prenotazioni se certificato scaduto
- ❌ Report certificati scaduti/in scadenza
- ❌ Reminder automatici via email/notifica

---

## 🛠️ Piano Implementazione

### **FASE 1: Modifiche allo Schema Dati** ⚙️

#### 1.1 Aggiornare `playerTypes.js`

**File:** `src/features/players/types/playerTypes.js`

**Aggiungere al createPlayerSchema():**

```javascript
// Certificati medici
medicalCertificates: {
  current: {
    id: '',
    type: 'agonistic', // 'agonistic' | 'non-agonistic'
    number: '', // Numero documento
    issueDate: null, // Data rilascio
    expiryDate: null, // Data scadenza
    doctor: '', // Nome medico/ente
    facility: '', // Struttura rilasciante
    fileUrl: '', // URL file caricato su Firebase Storage
    fileName: '', // Nome file originale
    uploadedAt: null, // Data caricamento
    uploadedBy: '', // Admin che ha caricato
    notes: '', // Note aggiuntive
  },
  history: [], // Array di certificati precedenti
  lastReminderSent: null, // Ultima notifica inviata
  remindersSent: 0, // Contatore reminder
},

// Stato certificato (calcolato)
certificateStatus: {
  isValid: false, // Certificato valido
  isExpiring: false, // In scadenza (< 30 giorni)
  isExpired: false, // Scaduto
  daysUntilExpiry: null, // Giorni rimanenti
  canBook: true, // Può prenotare
},
```

**Aggiungere nuove costanti:**

```javascript
export const CERTIFICATE_TYPES = {
  AGONISTIC: 'agonistic',
  NON_AGONISTIC: 'non-agonistic',
};

export const CERTIFICATE_STATUS = {
  VALID: 'valid',
  EXPIRING: 'expiring', // < 30 giorni
  EXPIRED: 'expired',
  MISSING: 'missing',
};

export const EXPIRY_WARNING_DAYS = 30; // Alert quando mancano 30 giorni
export const EXPIRY_CRITICAL_DAYS = 15; // Alert critico < 15 giorni
```

---

### **FASE 2: UI - Visualizzazione** 🎨

#### 2.1 Badge su PlayerCard

**File:** `src/features/players/components/PlayerCard.jsx`

**Aggiungere badge stato certificato:**

```jsx
{
  /* Badge certificato medico */
}
<div className="absolute top-2 right-2 flex flex-col gap-1">
  {player.certificateStatus?.isExpired && (
    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
      ⚠️ Cert. Scaduto
    </span>
  )}
  {player.certificateStatus?.isExpiring && !player.certificateStatus?.isExpired && (
    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
      ⏰ Cert. Scade
    </span>
  )}
  {player.certificateStatus?.isValid && !player.certificateStatus?.isExpiring && (
    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
      ✅ Cert. OK
    </span>
  )}
  {!player.medicalCertificates?.current?.expiryDate && (
    <span className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
      📄 Nessun Cert.
    </span>
  )}
</div>;
```

#### 2.2 Tab Certificato Medico in PlayerDetails

**File:** `src/features/players/components/PlayerDetails.jsx`

**Aggiungere nuovo tab:**

```javascript
const tabs = [
  { id: 'overview', label: '👤 Panoramica', icon: '👤' },
  { id: 'tournament', label: '🏆 Campionato', icon: '🏆' },
  { id: 'medical', label: '🏥 Certificato Medico', icon: '🏥' }, // NUOVO
  { id: 'notes', label: '📝 Note', icon: '📝' },
  { id: 'wallet', label: '💰 Wallet', icon: '💰' },
  { id: 'bookings', label: '📅 Prenotazioni', icon: '📅' },
  { id: 'communications', label: '✉️ Comunicazioni', icon: '✉️' },
];
```

**Creare componente tab:**

```jsx
{
  activeTab === 'medical' && <PlayerMedicalTab player={player} onUpdate={onUpdate} T={T} />;
}
```

#### 2.3 Nuovo Componente PlayerMedicalTab

**File:** `src/features/players/components/PlayerMedicalTab.jsx` _(NUOVO)_

**Struttura completa:**

```jsx
import React, { useState } from 'react';
import {
  uploadMedicalCertificate,
  deleteMedicalCertificate,
} from '@services/medicalCertificates.js';

export default function PlayerMedicalTab({ player, onUpdate, T }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const cert = player.medicalCertificates?.current;
  const history = player.medicalCertificates?.history || [];

  const calculateDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

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
          ⏰ URGENTE - Scade tra {days} giorni
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione
    if (!file.type.includes('pdf')) {
      alert('Solo file PDF sono accettati');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File troppo grande. Max 5MB');
      return;
    }

    try {
      setUploading(true);
      const downloadURL = await uploadMedicalCertificate(player.id, file, (progress) =>
        setUploadProgress(progress)
      );

      // Aggiorna il giocatore con il nuovo certificato
      onUpdate({
        medicalCertificates: {
          ...player.medicalCertificates,
          current: {
            ...cert,
            fileUrl: downloadURL,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Errore durante il caricamento: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo certificato?')) return;

    try {
      await deleteMedicalCertificate(player.id, cert.fileUrl);

      // Sposta il certificato corrente nello storico
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
          history: [...history, { ...cert, deletedAt: new Date().toISOString() }],
        },
      });
    } catch (error) {
      console.error('Delete error:', error);
      alert("Errore durante l'eliminazione: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${T.text}`}>Certificato Medico Sportivo</h3>
        {getStatusBadge()}
      </div>

      {/* Certificato Corrente */}
      {cert?.expiryDate ? (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Info */}
            <div className="space-y-3">
              <div>
                <label className={`text-xs ${T.subtext}`}>Tipo</label>
                <p className={`${T.text} font-medium`}>
                  {cert.type === 'agonistic' ? '🏅 Agonistico' : '🏃 Non Agonistico'}
                </p>
              </div>

              <div>
                <label className={`text-xs ${T.subtext}`}>Numero Documento</label>
                <p className={`${T.text} font-medium`}>{cert.number || 'N/A'}</p>
              </div>

              <div>
                <label className={`text-xs ${T.subtext}`}>Data Rilascio</label>
                <p className={`${T.text} font-medium`}>
                  {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('it-IT') : 'N/A'}
                </p>
              </div>

              <div>
                <label className={`text-xs ${T.subtext}`}>Data Scadenza</label>
                <p className={`${T.text} font-medium text-lg`}>
                  {new Date(cert.expiryDate).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>

            {/* Medico/File */}
            <div className="space-y-3">
              <div>
                <label className={`text-xs ${T.subtext}`}>Medico</label>
                <p className={`${T.text} font-medium`}>{cert.doctor || 'N/A'}</p>
              </div>

              <div>
                <label className={`text-xs ${T.subtext}`}>Struttura</label>
                <p className={`${T.text} font-medium`}>{cert.facility || 'N/A'}</p>
              </div>

              {cert.fileUrl && (
                <div>
                  <label className={`text-xs ${T.subtext}`}>File</label>
                  <div className="flex gap-2">
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
                    >
                      📄 {cert.fileName || 'Visualizza PDF'}
                    </a>
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              )}

              {cert.notes && (
                <div>
                  <label className={`text-xs ${T.subtext}`}>Note</label>
                  <p className={`${T.text} text-sm`}>{cert.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Azioni */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                /* Apri form modifica */
              }}
              className={`${T.btnSecondary} mr-2`}
            >
              ✏️ Modifica Dati
            </button>
          </div>
        </div>
      ) : (
        /* Nessun certificato */
        <div className={`${T.cardBg} ${T.border} rounded-xl p-8 text-center`}>
          <div className="text-6xl mb-4">📄</div>
          <h4 className={`text-lg font-semibold ${T.text} mb-2`}>
            Nessun certificato medico caricato
          </h4>
          <p className={`${T.subtext} mb-6`}>Carica il certificato medico sportivo del giocatore</p>
        </div>
      )}

      {/* Form Caricamento */}
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <h4 className={`text-lg font-semibold ${T.text} mb-4`}>
          {cert?.expiryDate ? 'Carica Nuovo Certificato' : 'Carica Certificato'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${T.text} mb-1`}>Tipo Certificato *</label>
            <select
              value={cert?.type || 'agonistic'}
              onChange={(e) =>
                onUpdate({
                  medicalCertificates: {
                    ...player.medicalCertificates,
                    current: { ...cert, type: e.target.value },
                  },
                })
              }
              className={`${T.input} w-full`}
            >
              <option value="agonistic">🏅 Agonistico</option>
              <option value="non-agonistic">🏃 Non Agonistico</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${T.text} mb-1`}>Numero Documento</label>
            <input
              type="text"
              value={cert?.number || ''}
              onChange={(e) =>
                onUpdate({
                  medicalCertificates: {
                    ...player.medicalCertificates,
                    current: { ...cert, number: e.target.value },
                  },
                })
              }
              className={`${T.input} w-full`}
              placeholder="es. 12345/2025"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${T.text} mb-1`}>Data Rilascio *</label>
            <input
              type="date"
              value={cert?.issueDate || ''}
              onChange={(e) =>
                onUpdate({
                  medicalCertificates: {
                    ...player.medicalCertificates,
                    current: { ...cert, issueDate: e.target.value },
                  },
                })
              }
              className={`${T.input} w-full`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${T.text} mb-1`}>Data Scadenza *</label>
            <input
              type="date"
              value={cert?.expiryDate || ''}
              onChange={(e) =>
                onUpdate({
                  medicalCertificates: {
                    ...player.medicalCertificates,
                    current: { ...cert, expiryDate: e.target.value },
                  },
                })
              }
              className={`${T.input} w-full`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${T.text} mb-1`}>Medico/Specialista</label>
            <input
              type="text"
              value={cert?.doctor || ''}
              onChange={(e) =>
                onUpdate({
                  medicalCertificates: {
                    ...player.medicalCertificates,
                    current: { ...cert, doctor: e.target.value },
                  },
                })
              }
              className={`${T.input} w-full`}
              placeholder="Dr. Mario Rossi"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${T.text} mb-1`}>Struttura/Centro</label>
            <input
              type="text"
              value={cert?.facility || ''}
              onChange={(e) =>
                onUpdate({
                  medicalCertificates: {
                    ...player.medicalCertificates,
                    current: { ...cert, facility: e.target.value },
                  },
                })
              }
              className={`${T.input} w-full`}
              placeholder="Centro Medico Sportivo"
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${T.text} mb-1`}>
              Carica PDF Certificato
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className={`${T.input} w-full`}
            />
            {uploading && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Caricamento: {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${T.text} mb-1`}>Note</label>
            <textarea
              value={cert?.notes || ''}
              onChange={(e) =>
                onUpdate({
                  medicalCertificates: {
                    ...player.medicalCertificates,
                    current: { ...cert, notes: e.target.value },
                  },
                })
              }
              className={`${T.input} w-full`}
              rows={3}
              placeholder="Note aggiuntive..."
            />
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
                    {oldCert.type === 'agonistic' ? '🏅 Agonistico' : '🏃 Non Agonistico'}
                  </p>
                  <p className={`text-xs ${T.subtext}`}>
                    Rilascio: {new Date(oldCert.issueDate).toLocaleDateString('it-IT')} - Scadenza:{' '}
                    {new Date(oldCert.expiryDate).toLocaleDateString('it-IT')}
                  </p>
                </div>
                {oldCert.fileUrl && (
                  <a
                    href={oldCert.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
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
```

---

### **FASE 3: Servizi Firebase** 🔥

#### 3.1 Nuovo Servizio medicalCertificates.js

**File:** `src/services/medicalCertificates.js` _(NUOVO)_

```javascript
import { storage, db } from './firebase.js';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

/**
 * Carica un certificato medico su Firebase Storage
 */
export async function uploadMedicalCertificate(playerId, file, onProgress) {
  const fileName = `certificate_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `medical-certificates/${playerId}/${fileName}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Elimina un certificato da Firebase Storage
 */
export async function deleteMedicalCertificate(playerId, fileUrl) {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
}

/**
 * Calcola lo status del certificato
 */
export function calculateCertificateStatus(expiryDate) {
  if (!expiryDate) {
    return {
      isValid: false,
      isExpiring: false,
      isExpired: false,
      daysUntilExpiry: null,
      canBook: false,
      status: 'missing',
    };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = daysUntilExpiry < 0;
  const isExpiring = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  const isValid = daysUntilExpiry > 0;

  return {
    isValid,
    isExpiring,
    isExpired,
    daysUntilExpiry,
    canBook: !isExpired, // Può prenotare solo se non scaduto
    status: isExpired ? 'expired' : isExpiring ? 'expiring' : 'valid',
  };
}

/**
 * Aggiorna lo status del certificato per un giocatore
 */
export async function updatePlayerCertificateStatus(clubId, playerId) {
  try {
    const playerRef = doc(db, 'clubs', clubId, 'players', playerId);
    const playerDoc = await getDoc(playerRef);

    if (!playerDoc.exists()) return;

    const player = playerDoc.data();
    const expiryDate = player.medicalCertificates?.current?.expiryDate;

    const status = calculateCertificateStatus(expiryDate);

    await updateDoc(playerRef, {
      certificateStatus: status,
      updatedAt: new Date().toISOString(),
    });

    return status;
  } catch (error) {
    console.error('Error updating certificate status:', error);
    throw error;
  }
}

/**
 * Trova tutti i giocatori con certificati in scadenza/scaduti
 */
export async function getPlayersWithExpiringCertificates(clubId, daysThreshold = 30) {
  try {
    const { collection, getDocs, query, where } = await import('firebase/firestore');

    const playersRef = collection(db, 'clubs', clubId, 'players');
    const snapshot = await getDocs(playersRef);

    const players = [];

    snapshot.forEach((doc) => {
      const player = { id: doc.id, ...doc.data() };
      const expiryDate = player.medicalCertificates?.current?.expiryDate;

      if (expiryDate) {
        const status = calculateCertificateStatus(expiryDate);

        if (status.isExpired || (status.isExpiring && status.daysUntilExpiry <= daysThreshold)) {
          players.push({
            ...player,
            certificateStatus: status,
          });
        }
      } else {
        // Nessun certificato
        players.push({
          ...player,
          certificateStatus: calculateCertificateStatus(null),
        });
      }
    });

    // Ordina per scadenza (più urgenti prima)
    return players.sort((a, b) => {
      const daysA = a.certificateStatus.daysUntilExpiry ?? -999;
      const daysB = b.certificateStatus.daysUntilExpiry ?? -999;
      return daysA - daysB;
    });
  } catch (error) {
    console.error('Error getting expiring certificates:', error);
    throw error;
  }
}
```

---

### **FASE 4: Sistema di Notifiche** 🔔

#### 4.1 Cron Job Giornaliero (Cloud Function)

**File:** `functions/scheduledCertificateReminders.js` _(NUOVO)_

```javascript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db } from './firebase-admin.js';
import { sendEmail } from './email-service.js';
import { sendPushNotification } from './push-service.js';

export const dailyCertificateCheck = onSchedule(
  {
    schedule: 'every day 09:00',
    timeZone: 'Europe/Rome',
  },
  async (event) => {
    console.log('🏥 Running daily certificate expiry check...');

    try {
      const clubsSnapshot = await db.collection('clubs').get();

      for (const clubDoc of clubsSnapshot.docs) {
        const clubId = clubDoc.id;
        const club = clubDoc.data();

        const playersSnapshot = await db
          .collection('clubs')
          .doc(clubId)
          .collection('players')
          .get();

        for (const playerDoc of playersSnapshot.docs) {
          const player = { id: playerDoc.id, ...playerDoc.data() };
          const cert = player.medicalCertificates?.current;

          if (!cert?.expiryDate) continue;

          const today = new Date();
          const expiry = new Date(cert.expiryDate);
          const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

          // Alert a 30, 15, 7, 3 giorni e il giorno stesso
          const alertDays = [30, 15, 7, 3, 0];

          if (alertDays.includes(daysUntil)) {
            console.log(`⚠️ Certificate expiring in ${daysUntil} days for player ${player.name}`);

            // Invia email all'utente
            if (player.email) {
              await sendEmail({
                to: player.email,
                subject: `⚠️ Certificato Medico in Scadenza - ${club.name}`,
                template: 'certificate-expiry',
                data: {
                  playerName: player.name,
                  clubName: club.name,
                  expiryDate: expiry.toLocaleDateString('it-IT'),
                  daysRemaining: daysUntil,
                  isUrgent: daysUntil <= 7,
                },
              });
            }

            // Invia notifica push
            if (player.linkedAccountId) {
              await sendPushNotification({
                userId: player.linkedAccountId,
                title: '⚠️ Certificato Medico in Scadenza',
                body: `Il tuo certificato scade ${daysUntil === 0 ? 'oggi' : `tra ${daysUntil} giorni`}. Rinnovalo al più presto!`,
                data: {
                  type: 'certificate-expiry',
                  playerId: player.id,
                  clubId,
                },
              });
            }

            // Invia notifica all'admin del club
            const adminEmails = club.adminEmails || [];
            for (const adminEmail of adminEmails) {
              await sendEmail({
                to: adminEmail,
                subject: `⚠️ Certificato Giocatore in Scadenza - ${player.name}`,
                template: 'admin-certificate-alert',
                data: {
                  playerName: player.name,
                  clubName: club.name,
                  expiryDate: expiry.toLocaleDateString('it-IT'),
                  daysRemaining: daysUntil,
                  playerEmail: player.email,
                  playerPhone: player.phone,
                },
              });
            }

            // Aggiorna contatore reminder
            await playerDoc.ref.update({
              'medicalCertificates.lastReminderSent': new Date().toISOString(),
              'medicalCertificates.remindersSent':
                (player.medicalCertificates?.remindersSent || 0) + 1,
            });
          }

          // Certificato scaduto - blocca prenotazioni
          if (daysUntil < 0) {
            await playerDoc.ref.update({
              'certificateStatus.canBook': false,
              isActive: false, // Disattiva il giocatore
            });

            console.log(`🚫 Blocked bookings for ${player.name} - certificate expired`);
          }
        }
      }

      console.log('✅ Daily certificate check completed');
    } catch (error) {
      console.error('❌ Error in daily certificate check:', error);
    }
  }
);
```

#### 4.2 Blocco Prenotazioni

**File:** `src/services/unified-booking-service.js`

**Aggiungere check prima di creare prenotazione:**

```javascript
export async function createBooking(bookingData, userId) {
  // ... existing code

  // 🏥 CHECK CERTIFICATO MEDICO
  const player = await getPlayerByUserId(clubId, userId);

  if (player && player.medicalCertificates?.current?.expiryDate) {
    const status = calculateCertificateStatus(player.medicalCertificates.current.expiryDate);

    if (status.isExpired) {
      throw new Error(
        '❌ Non puoi prenotare: il tuo certificato medico è scaduto. ' +
          'Rinnova il certificato per continuare a prenotare.'
      );
    }

    if (status.isExpiring && status.daysUntilExpiry <= 7) {
      // Warning ma permetti prenotazione
      console.warn(
        `⚠️ Certificate expiring soon for user ${userId} - ${status.daysUntilExpiry} days remaining`
      );
    }
  }

  // ... continue with booking creation
}
```

---

### **FASE 5: Dashboard Widget** 📊

#### 5.1 Widget Certificati in Scadenza

**File:** `src/features/admin/components/ExpiringCertificatesWidget.jsx` _(NUOVO)_

```jsx
import React, { useState, useEffect } from 'react';
import { getPlayersWithExpiringCertificates } from '@services/medicalCertificates.js';

export default function ExpiringCertificatesWidget({ clubId, T, onPlayerClick }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpiringCertificates();
  }, [clubId]);

  const loadExpiringCertificates = async () => {
    try {
      setLoading(true);
      const data = await getPlayersWithExpiringCertificates(clubId, 30);
      setPlayers(data);
    } catch (error) {
      console.error('Error loading expiring certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold ${T.text} mb-4 flex items-center gap-2`}>
          🏥 Certificati Medici
        </h3>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">✅</div>
          <p className={`${T.subtext}`}>Tutti i certificati sono in regola</p>
        </div>
      </div>
    );
  }

  const expired = players.filter((p) => p.certificateStatus.isExpired);
  const expiringSoon = players.filter(
    (p) => p.certificateStatus.isExpiring && p.certificateStatus.daysUntilExpiry <= 15
  );
  const expiring = players.filter(
    (p) => p.certificateStatus.isExpiring && p.certificateStatus.daysUntilExpiry > 15
  );

  return (
    <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${T.text} flex items-center gap-2`}>
          🏥 Certificati Medici
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            expired.length > 0
              ? 'bg-red-500 text-white'
              : expiringSoon.length > 0
                ? 'bg-orange-500 text-white'
                : 'bg-yellow-500 text-white'
          }`}
        >
          {players.length} da controllare
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{expired.length}</div>
          <div className="text-xs text-red-600 dark:text-red-400">Scaduti</div>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {expiringSoon.length}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400">Urgenti</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {expiring.length}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">In scadenza</div>
        </div>
      </div>

      {/* Lista giocatori */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {players.slice(0, 10).map((player) => {
          const { daysUntilExpiry, isExpired } = player.certificateStatus;

          return (
            <div
              key={player.id}
              onClick={() => onPlayerClick(player.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                isExpired
                  ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                  : daysUntilExpiry <= 15
                    ? 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${T.text} truncate`}>{player.name}</p>
                  <p className={`text-xs ${T.subtext}`}>
                    {player.email || player.phone || 'Nessun contatto'}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p
                    className={`text-sm font-bold ${
                      isExpired
                        ? 'text-red-600 dark:text-red-400'
                        : daysUntilExpiry <= 15
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                    }`}
                  >
                    {isExpired
                      ? `Scaduto ${Math.abs(daysUntilExpiry)} giorni fa`
                      : daysUntilExpiry === 0
                        ? 'Scade oggi!'
                        : `${daysUntilExpiry} giorni`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(player.medicalCertificates.current.expiryDate).toLocaleDateString(
                      'it-IT'
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {players.length > 10 && (
        <button
          onClick={() => onPlayerClick(null)}
          className={`w-full mt-3 ${T.btnSecondary} text-sm`}
        >
          Vedi tutti ({players.length})
        </button>
      )}
    </div>
  );
}
```

#### 5.2 Integrazione in AdminClubDashboard

**File:** `src/features/admin/AdminClubDashboard.jsx`

```jsx
import ExpiringCertificatesWidget from './components/ExpiringCertificatesWidget.jsx';

// ... existing code

// Nel render, aggiungere il widget
<ExpiringCertificatesWidget
  clubId={clubId}
  T={T}
  onPlayerClick={(playerId) => {
    if (playerId) {
      navigate(`/club/${clubId}/players?selected=${playerId}`);
    } else {
      navigate(`/club/${clubId}/players?filter=expiring-certificates`);
    }
  }}
/>;
```

---

## 📝 Checklist Completa Implementazione

### **Database & Schema** ✅

- [ ] Aggiornare `playerTypes.js` con campi certificato medico
- [ ] Aggiungere costanti `CERTIFICATE_TYPES`, `CERTIFICATE_STATUS`
- [ ] Aggiornare tutti i giocatori esistenti con il nuovo schema (migration)

### **Componenti UI** 🎨

- [ ] Creare `PlayerMedicalTab.jsx`
- [ ] Aggiungere badge certificato a `PlayerCard.jsx`
- [ ] Aggiungere tab "Certificato Medico" in `PlayerDetails.jsx`
- [ ] Aggiornare `PlayerForm.jsx` con sezione certificato
- [ ] Creare `ExpiringCertificatesWidget.jsx` per dashboard admin

### **Servizi** 🔥

- [ ] Creare `medicalCertificates.js` con funzioni upload/delete/status
- [ ] Aggiungere check certificato in `unified-booking-service.js`
- [ ] Implementare `calculateCertificateStatus()` utility
- [ ] Implementare `getPlayersWithExpiringCertificates()`

### **Cloud Functions** ☁️

- [ ] Creare `scheduledCertificateReminders.js` con cron job giornaliero
- [ ] Configurare Firebase Cloud Scheduler
- [ ] Implementare template email notifiche
- [ ] Implementare notifiche push

### **Notifiche** 🔔

- [ ] Email a utente (30, 15, 7, 3, 0 giorni)
- [ ] Email ad admin club
- [ ] Notifica push a utente
- [ ] Alert in app

### **Sicurezza** 🔒

- [ ] Aggiornare Firestore Rules per certificati
- [ ] Aggiornare Storage Rules per upload PDF
- [ ] Validazione file (solo PDF, max 5MB)
- [ ] Blocco prenotazioni per certificati scaduti

### **Testing** 🧪

- [ ] Test upload certificato
- [ ] Test calcolo scadenza
- [ ] Test notifiche
- [ ] Test blocco prenotazioni
- [ ] Test UI responsive
- [ ] Test dark mode

### **Documentazione** 📚

- [ ] Aggiornare README con nuova funzionalità
- [ ] Creare guida utente
- [ ] Creare guida admin
- [ ] Documentare API servizi

---

## 🎯 Priorità Implementazione

### **SPRINT 1 - Foundation** (2-3 giorni)

1. ✅ Aggiornare schema dati (`playerTypes.js`)
2. ✅ Creare servizio base (`medicalCertificates.js`)
3. ✅ Implementare UI tab certificato (`PlayerMedicalTab.jsx`)

### **SPRINT 2 - Visual Feedback** (1-2 giorni)

4. ✅ Aggiungere badge su `PlayerCard`
5. ✅ Integrare tab in `PlayerDetails`
6. ✅ Widget dashboard admin

### **SPRINT 3 - Automazione** (2-3 giorni)

7. ✅ Cloud Function notifiche
8. ✅ Sistema email/push
9. ✅ Blocco prenotazioni

### **SPRINT 4 - Testing & Polish** (1-2 giorni)

10. ✅ Testing completo
11. ✅ Fix bug
12. ✅ Documentazione

**Tempo totale stimato:** 6-10 giorni lavorativi

---

## 💡 Note Tecniche

### **Firebase Storage Structure:**

```
medical-certificates/
  ├── {playerId}/
  │   ├── certificate_1234567890_cert.pdf
  │   ├── certificate_0987654321_cert2.pdf
  │   └── ...
```

### **Firestore Rules da aggiungere:**

```javascript
match /clubs/{clubId}/players/{playerId} {
  // Allow read for club admins and player themselves
  allow read: if isClubAdmin(clubId) || isPlayerAccount(playerId);

  // Allow write only for club admins
  allow write: if isClubAdmin(clubId);

  // Certificati medici - solo admin può modificare
  allow update: if isClubAdmin(clubId) &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['medicalCertificates', 'certificateStatus', 'updatedAt']);
}
```

### **Storage Rules:**

```javascript
match /medical-certificates/{playerId}/{fileName} {
  // Solo admin può caricare
  allow create: if isAuthenticated() && isClubAdmin();

  // Admin e player possono leggere
  allow read: if isAuthenticated() &&
    (isClubAdmin() || request.auth.uid == playerId);

  // Solo admin può eliminare
  allow delete: if isAuthenticated() && isClubAdmin();
}
```

---

## 🚀 Quick Start

Per iniziare subito:

1. **Aggiorna schema:**

   ```bash
   # Modifica src/features/players/types/playerTypes.js
   ```

2. **Crea servizio:**

   ```bash
   # Crea src/services/medicalCertificates.js
   ```

3. **Crea componente tab:**

   ```bash
   # Crea src/features/players/components/PlayerMedicalTab.jsx
   ```

4. **Testa in locale:**
   ```bash
   npm run dev
   ```

---

**Fine Checklist** ✅
