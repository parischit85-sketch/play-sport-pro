/**
 * GDPR User Panel - Export & Delete Request
 * 
 * Componente per permettere agli utenti di:
 * 1. Esportare i propri dati (GDPR Art. 15 - Right to Access)
 * 2. Richiedere la cancellazione dei dati (GDPR Art. 17 - Right to be Forgotten)
 * 
 * L'utente può richiedere la cancellazione, ma solo il club admin può approvarla
 */

import React, { useState } from 'react';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import { Download, Trash2, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import LoadingButton from '@components/common/LoadingButton';
import { useToast } from '@components/common/Toast';

export default function UserGDPRPanel({ user, userProfile, clubId }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [showDeleteRequest, setShowDeleteRequest] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  /**
   * Esporta i dati dell'utente in formato JSON, CSV o TXT
   */
  const handleExportData = async (format) => {
    setIsExporting(true);
    setExportFormat(format);

    try {
      // Prepara i dati da esportare
      const exportData = {
        personalInfo: {
          uid: user.uid,
          email: user.email,
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          phone: userProfile.phone || '',
          fiscalCode: userProfile.fiscalCode || '',
          birthDate: userProfile.birthDate || '',
          address: userProfile.address || '',
        },
        accountInfo: {
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime,
          lastLoginAt: user.metadata.lastSignInTime,
        },
        clubInfo: {
          clubId: clubId || 'N/A',
          affiliations: userProfile.affiliations || [],
        },
        metadata: {
          exportDate: new Date().toISOString(),
          exportFormat: format,
          gdprCompliance: 'GDPR Art. 15 - Right to Access',
        },
      };

      // Esporta in base al formato
      if (format === 'json') {
        downloadJSON(exportData);
      } else if (format === 'csv') {
        downloadCSV(exportData);
      } else if (format === 'txt') {
        downloadTXT(exportData);
      }

      showSuccess(`Dati esportati correttamente in formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Errore export dati:', error);
      showError('Errore durante l\'esportazione dei dati');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Download JSON
   */
  const downloadJSON = (data) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `miei-dati-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Download CSV
   */
  const downloadCSV = (data) => {
    const rows = [
      ['Campo', 'Valore'],
      ['Nome', data.personalInfo.firstName],
      ['Cognome', data.personalInfo.lastName],
      ['Email', data.personalInfo.email],
      ['Telefono', data.personalInfo.phone],
      ['Codice Fiscale', data.personalInfo.fiscalCode],
      ['Data Nascita', data.personalInfo.birthDate],
      ['Indirizzo', data.personalInfo.address],
      ['Email Verificata', data.accountInfo.emailVerified ? 'Sì' : 'No'],
      ['Data Registrazione', data.accountInfo.createdAt],
      ['Ultimo Accesso', data.accountInfo.lastLoginAt],
      ['Club ID', data.clubInfo.clubId],
    ];

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `miei-dati-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Download TXT (report leggibile)
   */
  const downloadTXT = (data) => {
    const txt = `
╔═══════════════════════════════════════════════════════════════╗
║           ESPORTAZIONE DATI PERSONALI (GDPR Art. 15)          ║
╚═══════════════════════════════════════════════════════════════╝

📅 Data Esportazione: ${new Date().toLocaleDateString('it-IT')}
🔒 GDPR Compliance: Art. 15 - Right to Access

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INFORMAZIONI PERSONALI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nome:              ${data.personalInfo.firstName}
Cognome:           ${data.personalInfo.lastName}
Email:             ${data.personalInfo.email}
Telefono:          ${data.personalInfo.phone || 'Non specificato'}
Codice Fiscale:    ${data.personalInfo.fiscalCode || 'Non specificato'}
Data di Nascita:   ${data.personalInfo.birthDate || 'Non specificata'}
Indirizzo:         ${data.personalInfo.address || 'Non specificato'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 INFORMAZIONI ACCOUNT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email Verificata:  ${data.accountInfo.emailVerified ? 'Sì' : 'No'}
Data Registrazione: ${new Date(data.accountInfo.createdAt).toLocaleDateString('it-IT')}
Ultimo Accesso:    ${new Date(data.accountInfo.lastLoginAt).toLocaleDateString('it-IT')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 AFFILIAZIONE CLUB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Club ID:           ${data.clubInfo.clubId}
Numero Affiliazioni: ${data.clubInfo.affiliations.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  INFORMAZIONI LEGALI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I tuoi dati sono trattati in conformità con il Regolamento Generale
sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679).

Hai il diritto di:
✓ Accedere ai tuoi dati personali (Art. 15)
✓ Rettificare dati inesatti (Art. 16)
✓ Cancellare i tuoi dati (Art. 17 - Right to be Forgotten)
✓ Limitare il trattamento (Art. 18)
✓ Portabilità dei dati (Art. 20)

Per esercitare i tuoi diritti, contatta il tuo club di appartenenza.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `miei-dati-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Richiesta di cancellazione dati
   * Crea una richiesta che il club admin dovrà approvare
   */
  const handleDeleteRequest = async () => {
    if (!deleteReason.trim()) {
      showError('Inserisci una motivazione per la richiesta di cancellazione');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      // Crea la richiesta di cancellazione nella collection del club
      const requestData = {
        userId: user.uid,
        userEmail: user.email,
        userName: `${userProfile.firstName} ${userProfile.lastName}`,
        requestType: 'delete_account',
        reason: deleteReason,
        status: 'pending',
        createdAt: serverTimestamp(),
        gdprArticle: 'Art. 17 - Right to be Forgotten',
      };

      // Salva nella collection gdpr_requests del club
      await addDoc(
        collection(db, 'clubs', clubId, 'gdpr_requests'),
        requestData
      );

      // Segna l'utente come "in attesa di cancellazione"
      await setDoc(
        doc(db, 'users', user.uid),
        {
          deletionRequested: true,
          deletionRequestedAt: serverTimestamp(),
          deletionReason: deleteReason,
        },
        { merge: true }
      );

      showSuccess('Richiesta di cancellazione inviata al club');
      showInfo('Il club ti contatterà per confermare la cancellazione dei dati');
      
      setShowDeleteRequest(false);
      setDeleteReason('');
    } catch (error) {
      console.error('Errore richiesta cancellazione:', error);
      showError('Errore durante l\'invio della richiesta');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Se l'utente ha già richiesto la cancellazione
  if (userProfile.deletionRequested) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
              Richiesta di Cancellazione in Corso
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
              Hai richiesto la cancellazione dei tuoi dati il{' '}
              {userProfile.deletionRequestedAt?.toDate().toLocaleDateString('it-IT')}.
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Il club ti contatterà a breve per confermare la cancellazione.
              Nel frattempo puoi ancora utilizzare l'applicazione normalmente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
              🔒 Protezione dei tuoi dati (GDPR)
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              In conformità con il GDPR, hai il diritto di accedere ai tuoi dati personali
              e richiederne la cancellazione.
            </p>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Esporta i Tuoi Dati
        </h4>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Scarica una copia completa dei tuoi dati personali in formato JSON, CSV o TXT.
          <br />
          <span className="text-xs italic">GDPR Art. 15 - Right to Access</span>
        </p>

        <div className="flex flex-wrap gap-3">
          <LoadingButton
            onClick={() => handleExportData('json')}
            loading={isExporting && exportFormat === 'json'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Esporta JSON
          </LoadingButton>

          <LoadingButton
            onClick={() => handleExportData('csv')}
            loading={isExporting && exportFormat === 'csv'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Esporta CSV
          </LoadingButton>

          <LoadingButton
            onClick={() => handleExportData('txt')}
            loading={isExporting && exportFormat === 'txt'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Esporta TXT
          </LoadingButton>
        </div>
      </div>

      {/* Delete Request Section */}
      <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          Richiedi la Cancellazione dei Dati
        </h4>

        {!showDeleteRequest ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Puoi richiedere la cancellazione permanente dei tuoi dati personali.
              Il club ti contatterà per confermare la richiesta.
              <br />
              <span className="text-xs italic text-red-600 dark:text-red-400">
                GDPR Art. 17 - Right to be Forgotten
              </span>
            </p>

            <button
              onClick={() => setShowDeleteRequest(true)}
              className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 
                         text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 
                         px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Richiedi Cancellazione
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-300">
                  <p className="font-semibold mb-2">Attenzione!</p>
                  <p className="mb-2">
                    Stai per richiedere la cancellazione permanente dei tuoi dati.
                    Questa azione non può essere annullata.
                  </p>
                  <p>
                    Il club ti contatterà per confermare la richiesta e procedere
                    con la cancellazione.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivazione (obbligatoria)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={4}
                placeholder="Spiega brevemente il motivo della richiesta..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 
                           dark:text-white resize-none"
              />
            </div>

            <div className="flex gap-3">
              <LoadingButton
                onClick={handleDeleteRequest}
                loading={isSubmittingRequest}
                disabled={!deleteReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg 
                           text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 inline-block mr-2" />
                Invia Richiesta
              </LoadingButton>

              <button
                onClick={() => {
                  setShowDeleteRequest(false);
                  setDeleteReason('');
                }}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                           text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
