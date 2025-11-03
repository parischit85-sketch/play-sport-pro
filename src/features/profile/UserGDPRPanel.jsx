/**
 * GDPR User Panel - Export & Delete Request (Multi-Club Compliant)
 *
 * Componente per permettere agli utenti di:
 * 1. Esportare i propri dati (GDPR Art. 15 - Right to Access)
 * 2. Richiedere la cancellazione dei dati (GDPR Art. 17 - Right to be Forgotten)
 *    - Cancellazione PARZIALE: da club specifici
 *    - Cancellazione COMPLETA: da tutti i club + account Play Sport
 *
 * L'utente può richiedere la cancellazione, ma solo il club admin può approvarla
 */

import React, { useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from '@services/firebase.js';
import {
  Download,
  Trash2,
  AlertCircle,
  FileText,
  Building2,
  UserX,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import LoadingButton from '@components/common/LoadingButton';
import { useToast } from '@components/common/Toast';
import { themeTokens } from '@lib/theme.js';
import { DS_LAYOUT, DS_SPACING } from '@lib/design-system.js';

export default function UserGDPRPanel({ user, userProfile, clubId }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [showDeleteRequest, setShowDeleteRequest] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [deletionType, setDeletionType] = useState('partial'); // 'partial' | 'complete'
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [userClubs, setUserClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [isGDPRExpanded, setIsGDPRExpanded] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();
  
  // Theme tokens
  const T = themeTokens();
  const { flexBetween } = DS_LAYOUT;

  // Carica i club a cui l'utente è affiliato
  useEffect(() => {
    const loadUserClubs = async () => {
      if (!user?.uid) return;

      try {
        setLoadingClubs(true);

        // Cerca nelle affiliations dell'utente
        const affiliationsRef = collection(db, 'users', user.uid, 'affiliations');
        const affiliationsSnap = await getDocs(affiliationsRef);

        const clubs = [];
        for (const docSnap of affiliationsSnap.docs) {
          const affiliation = docSnap.data();
          if (affiliation.clubId && affiliation.status === 'active') {
            // Carica info club
            const clubRef = doc(db, 'clubs', affiliation.clubId);
            const clubSnap = await getDoc(clubRef);

            if (clubSnap.exists()) {
              clubs.push({
                id: affiliation.clubId,
                name: clubSnap.data().name || affiliation.clubId,
                role: affiliation.role || 'player',
                joinedAt: affiliation.joinedAt,
              });
            }
          }
        }

        setUserClubs(clubs);
        // Preseleziona tutti i club se cancellazione completa
        if (deletionType === 'complete') {
          setSelectedClubs(clubs.map((c) => c.id));
        }
      } catch (error) {
        console.error('Error loading user clubs:', error);
        showError('Errore nel caricamento dei club affiliati');
      } finally {
        setLoadingClubs(false);
      }
    };

    if (showDeleteRequest) {
      loadUserClubs();
    }
  }, [user?.uid, showDeleteRequest, deletionType]);

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
   * Richiesta di cancellazione dati (Multi-Club)
   * Supporta:
   * - Cancellazione PARZIALE: da club selezionati
   * - Cancellazione COMPLETA: da tutti i club + account Play Sport
   */
  const handleDeleteRequest = async () => {
    if (!deleteReason.trim()) {
      showError('Inserisci una motivazione per la richiesta di cancellazione');
      return;
    }

    if (deletionType === 'partial' && selectedClubs.length === 0) {
      showError('Seleziona almeno un club da cui richiedere la cancellazione');
      return;
    }

    if (deletionType === 'complete' && userClubs.length === 0) {
      showError('Nessun club affiliato trovato');
      showInfo('Contatta il supporto per procedere: support@playsportpro.com');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const clubsToProcess =
        deletionType === 'complete' ? userClubs.map((c) => c.id) : selectedClubs;

      // Crea richieste GDPR per ogni club selezionato
      const requests = [];
      for (const clubId of clubsToProcess) {
        const requestData = {
          userId: user.uid,
          userEmail: user.email,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          requestType:
            deletionType === 'complete' ? 'delete_complete' : 'delete_partial',
          deletionScope: deletionType,
          partOfCompleteRequest: deletionType === 'complete',
          reason: deleteReason,
          status: 'pending',
          createdAt: serverTimestamp(),
          gdprArticle: 'Art. 17 - Right to be Forgotten',
        };

        // Salva richiesta nella collection gdpr_requests del club
        const requestRef = await addDoc(
          collection(db, 'clubs', clubId, 'gdpr_requests'),
          requestData
        );

        requests.push({ clubId, requestId: requestRef.id });
      }

      // Aggiorna stato utente
      const userUpdateData = {
        deletionRequested: true,
        deletionType: deletionType,
        deletionScope: clubsToProcess,
        deletionRequestedAt: serverTimestamp(),
        deletionReason: deleteReason,
        deletionApprovals: Object.fromEntries(
          requests.map(({ clubId, requestId }) => [
            clubId,
            { status: 'pending', requestId, requestedAt: new Date().toISOString() },
          ])
        ),
      };

      await setDoc(doc(db, 'users', user.uid), userUpdateData, { merge: true });

      showSuccess(
        deletionType === 'complete'
          ? `Richiesta di cancellazione completa inviata a ${clubsToProcess.length} club`
          : `Richiesta di cancellazione inviata a ${clubsToProcess.length} club`
      );
      showInfo(
        deletionType === 'complete'
          ? 'Il tuo account sarà cancellato quando tutti i club avranno approvato la richiesta'
          : 'I club ti contatteranno per confermare la cancellazione dei dati'
      );

      setShowDeleteRequest(false);
      setDeleteReason('');
      setSelectedClubs([]);
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      showError('Errore nell\'invio della richiesta di cancellazione');
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
    <div className="space-y-4">
      {/* Collapsible Header - Design System Style */}
      <button
        onClick={() => setIsGDPRExpanded(!isGDPRExpanded)}
        className={`w-full ${T.cardBg} ${T.border} rounded-xl p-4 
                   hover:shadow-md ${T.transitionNormal} group`}
      >
        <div className={flexBetween}>
          <div className="flex items-start gap-3 flex-1 text-left">
            <FileText className={`w-5 h-5 ${T.accentInfo} flex-shrink-0 mt-0.5 
                               group-hover:scale-110 ${T.transitionNormal}`} />
            <div>
              <h3 className={`${T.text} font-semibold mb-1 flex items-center gap-2 flex-wrap`}>
                🔒 Protezione dei tuoi dati (GDPR)
                {userProfile?.deletionRequested && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                 ${T.accentWarning} border border-amber-500/30`}>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Richiesta in sospeso
                  </span>
                )}
              </h3>
              <p className={`${T.subtext} text-sm`}>
                In conformità con il GDPR, hai il diritto di accedere ai tuoi dati personali
                e richiederne la cancellazione.
              </p>
              {!clubId && (
                <p className={`${T.accentWarning} text-xs mt-2 italic flex items-center gap-1`}>
                  <AlertCircle className="w-3 h-3" />
                  Per richiedere la cancellazione dei dati devi essere affiliato a un club
                </p>
              )}
            </div>
          </div>
          <div className="ml-4">
            {isGDPRExpanded ? (
              <ChevronUp className={`w-5 h-5 ${T.accentInfo} ${T.transitionNormal}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${T.accentInfo} ${T.transitionNormal}`} />
            )}
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      {isGDPRExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Export Section - Design System Style */}
          <div className={`${T.cardBg} ${T.border} rounded-xl p-6 hover:shadow-md ${T.transitionNormal}`}>
            <h4 className={`${T.text} font-semibold mb-4 flex items-center gap-2`}>
              <Download className={`w-5 h-5 ${T.accentInfo}`} />
              Esporta i Tuoi Dati
            </h4>
            
            <p className={`${T.subtext} text-sm mb-4`}>
              Scarica una copia completa dei tuoi dati personali in formato JSON, CSV o TXT.
              <br />
              <span className={`text-xs italic ${T.accentInfo}`}>
                GDPR Art. 15 - Right to Access
              </span>
            </p>

            <div className="flex flex-wrap gap-3">
              <LoadingButton
                onClick={() => handleExportData('json')}
                loading={isExporting && exportFormat === 'json'}
                variant="outline"
                className={`flex items-center gap-2 ${T.btnGhost} hover:bg-blue-500/10 
                           border-blue-500/30`}
              >
                <Download className="w-4 h-4" />
                Esporta JSON
              </LoadingButton>

              <LoadingButton
                onClick={() => handleExportData('csv')}
                loading={isExporting && exportFormat === 'csv'}
                variant="outline"
                className={`flex items-center gap-2 ${T.btnGhost} hover:bg-blue-500/10 
                           border-blue-500/30`}
              >
                <Download className="w-4 h-4" />
                Esporta CSV
              </LoadingButton>

              <LoadingButton
                onClick={() => handleExportData('txt')}
                loading={isExporting && exportFormat === 'txt'}
                variant="outline"
                className={`flex items-center gap-2 ${T.btnGhost} hover:bg-blue-500/10 
                           border-blue-500/30`}
              >
                <FileText className="w-4 h-4" />
                Esporta TXT
              </LoadingButton>
            </div>
          </div>

          {/* Delete Request Section - Design System Style */}
          <div className={`${T.cardBg} border border-rose-500/30 rounded-xl p-6 hover:shadow-md ${T.transitionNormal}`}>
            <h4 className={`${T.text} font-semibold mb-4 flex items-center gap-2`}>
              <Trash2 className={`w-5 h-5 ${T.accentBad}`} />
              Richiedi la Cancellazione dei Dati
            </h4>

            {!showDeleteRequest ? (
              <div>
                <p className={`${T.subtext} text-sm mb-4`}>
                  Puoi richiedere la cancellazione dei tuoi dati da club specifici o da tutta la
                  piattaforma Play Sport.
                  <br />
                  <span className={`text-xs italic ${T.accentBad}`}>
                    GDPR Art. 17 - Right to be Forgotten
                  </span>
                </p>

                <button
                  onClick={() => setShowDeleteRequest(true)}
                  className={`${T.btnGhost} border-rose-500/30 hover:bg-rose-500/10 
                             ${T.accentBad}`}
                >
                  Richiedi Cancellazione
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selezione Tipo di Cancellazione */}
                <div className="space-y-4">
                  <h5 className={`${T.text} font-medium`}>
                    Tipo di Cancellazione
                  </h5>

                  {/* Opzione: Cancellazione Parziale */}
                  <label className={`flex items-start gap-3 p-4 ${T.border} rounded-lg cursor-pointer 
                                   ${T.transitionNormal} hover:bg-gray-700/30`}>
                    <input
                      type="radio"
                      name="deletionType"
                      value="partial"
                      checked={deletionType === 'partial'}
                      onChange={(e) => setDeletionType(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className={`w-4 h-4 ${T.accentInfo}`} />
                        <span className={`font-medium ${T.text}`}>
                          Cancellazione Parziale
                        </span>
                      </div>
                      <p className={`text-sm ${T.subtext}`}>
                        Rimuovi i tuoi dati solo da club specifici. Mantieni il tuo account Play Sport e
                        le affiliazioni agli altri club.
                      </p>
                    </div>
                  </label>

                  {/* Opzione: Cancellazione Completa */}
                  <label className={`flex items-start gap-3 p-4 ${T.border} rounded-lg cursor-pointer 
                                   ${T.transitionNormal} hover:bg-gray-700/30`}>
                    <input
                      type="radio"
                      name="deletionType"
                      value="complete"
                      checked={deletionType === 'complete'}
                      onChange={(e) => setDeletionType(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <UserX className={`w-4 h-4 ${T.accentBad}`} />
                        <span className={`font-medium ${T.text}`}>
                          Cancellazione Completa
                        </span>
                      </div>
                      <p className={`text-sm ${T.subtext}`}>
                        Rimuovi il tuo account Play Sport e tutti i dati da tutti i club affiliati.
                        <strong className={T.accentBad}> Azione irreversibile!</strong>
                      </p>
                    </div>
                  </label>
                </div>

                {/* Selezione Club (solo per cancellazione parziale) */}
                {deletionType === 'partial' && (
                  <div>
                    <h5 className={`${T.text} font-medium mb-3`}>
                      Seleziona i Club da cui Richiedere la Cancellazione
                    </h5>

                    {loadingClubs ? (
                      <div className={`text-center py-4 ${T.subtext}`}>Caricamento club...</div>
                    ) : userClubs.length === 0 ? (
                      <div className={`text-center py-4 ${T.subtext}`}>
                        Nessun club affiliato trovato
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {userClubs.map((club) => (
                          <label
                            key={club.id}
                            className={`flex items-center gap-3 p-3 ${T.border} rounded-lg cursor-pointer 
                                     hover:bg-gray-700/30 ${T.transitionNormal}`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedClubs.includes(club.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClubs([...selectedClubs, club.id]);
                                } else {
                                  setSelectedClubs(selectedClubs.filter((id) => id !== club.id));
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <div className={`font-medium ${T.text}`}>
                                {club.name}
                              </div>
                              <div className={`text-xs ${T.subtext}`}>
                                Ruolo: {club.role} · Iscritto dal{' '}
                                {club.joinedAt?.toDate?.().toLocaleDateString('it-IT') || 'N/A'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Info Cancellazione Completa */}
                {deletionType === 'complete' && (
                  <div className={`${T.cardBg} border border-amber-500/30 rounded-lg p-4`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`w-5 h-5 ${T.accentWarning} flex-shrink-0 mt-0.5`} />
                      <div className={`text-sm ${T.subtext}`}>
                        <p className="font-semibold mb-2">Cancellazione Completa</p>
                        <p className="mb-2">
                          La tua richiesta verrà inviata a <strong>{userClubs.length} club</strong>.
                          Il tuo account Play Sport sarà cancellato solo quando TUTTI i club avranno
                          approvato la richiesta.
                        </p>
                        <p className="text-xs">
                          Alcuni dati saranno conservati per obblighi di legge (fatture: 10 anni,
                          contenziosi legali).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Generale */}
                <div className={`${T.cardBg} border border-rose-500/30 rounded-lg p-4`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-5 h-5 ${T.accentBad} flex-shrink-0 mt-0.5`} />
                    <div className={`text-sm ${T.subtext}`}>
                      <p className="font-semibold mb-2">Attenzione!</p>
                      <p className="mb-2">
                        {deletionType === 'complete'
                          ? 'Stai per richiedere la cancellazione TOTALE del tuo account e di tutti i dati.'
                          : 'Stai per richiedere la cancellazione dei tuoi dati dai club selezionati.'}
                      </p>
                      <p>I club ti contatteranno per confermare la richiesta e procedere.</p>
                    </div>
                  </div>
                </div>

                {/* Motivazione */}
                <div>
                  <label className={`block text-sm font-medium ${T.text} mb-2`}>
                    Motivazione (obbligatoria)
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    rows={4}
                    placeholder="Spiega brevemente il motivo della richiesta..."
                    className={`${T.input} resize-none`}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <LoadingButton
                    onClick={handleDeleteRequest}
                    loading={isSubmittingRequest}
                    disabled={
                      !deleteReason.trim() ||
                      (deletionType === 'partial' && selectedClubs.length === 0) ||
                      (deletionType === 'complete' && userClubs.length === 0)
                    }
                    className={`${T.btnPrimary} bg-rose-600 hover:bg-rose-700 border-rose-600 
                               disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Trash2 className="w-4 h-4 inline-block mr-2" />
                    Invia Richiesta
                  </LoadingButton>

                  <button
                    onClick={() => {
                      setShowDeleteRequest(false);
                      setDeleteReason('');
                      setSelectedClubs([]);
                      setDeletionType('partial');
                    }}
                    className={T.btnGhost}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
