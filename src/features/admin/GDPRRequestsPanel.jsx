/**
 * GDPR Requests Panel - Club Admin
 * 
 * Pannello per visualizzare e gestire le richieste di cancellazione dati GDPR
 * degli utenti del club.
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@services/firebase.js';
import { Trash2, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import LoadingButton from '@components/common/LoadingButton';
import { useToast } from '@components/common/Toast';

export default function GDPRRequestsPanel({ clubId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { showSuccess, showError, showInfo } = useToast();

  // Carica le richieste GDPR in real-time
  useEffect(() => {
    if (!clubId) return;

    const q = query(
      collection(db, 'clubs', clubId, 'gdpr_requests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clubId]);

  /**
   * Approva e cancella i dati dell'utente
   */
  const handleApproveDelete = async (request) => {
    if (!confirm(`Sei sicuro di voler CANCELLARE PERMANENTEMENTE i dati di ${request.userName}?\n\nQuesta azione NON può essere annullata.`)) {
      return;
    }

    setProcessingId(request.id);

    try {
      // 1. Cancella l'utente dalla collection users
      await deleteDoc(doc(db, 'users', request.userId));

      // 2. Cancella eventuali player records del club
      const playerQuery = query(
        collection(db, 'clubs', clubId, 'players'),
        where('userId', '==', request.userId)
      );
      const playerSnapshot = await getDocs(playerQuery);
      for (const playerDoc of playerSnapshot.docs) {
        await deleteDoc(playerDoc.ref);
      }

      // 3. Aggiorna la richiesta come completata
      await updateDoc(doc(db, 'clubs', clubId, 'gdpr_requests', request.id), {
        status: 'approved',
        processedAt: serverTimestamp(),
        processedBy: auth.currentUser.uid,
      });

      showSuccess(`Dati di ${request.userName} cancellati con successo`);
      showInfo('L\'utente non potrà più accedere all\'app');
    } catch (error) {
      console.error('Errore cancellazione dati:', error);
      showError('Errore durante la cancellazione dei dati');
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rifiuta la richiesta di cancellazione
   */
  const handleRejectDelete = async (request) => {
    const reason = prompt('Motivo del rifiuto (sarà comunicato all\'utente):');
    if (!reason) return;

    setProcessingId(request.id);

    try {
      // Aggiorna la richiesta come rifiutata
      await updateDoc(doc(db, 'clubs', clubId, 'gdpr_requests', request.id), {
        status: 'rejected',
        rejectionReason: reason,
        processedAt: serverTimestamp(),
        processedBy: auth.currentUser.uid,
      });

      // Rimuovi il flag deletionRequested dall'utente
      await updateDoc(doc(db, 'users', request.userId), {
        deletionRequested: false,
        deletionRejectedReason: reason,
      });

      showSuccess('Richiesta rifiutata');
      showInfo('L\'utente è stato notificato del rifiuto');
    } catch (error) {
      console.error('Errore rifiuto richiesta:', error);
      showError('Errore durante il rifiuto della richiesta');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Caricamento richieste GDPR...
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          Nessuna richiesta di cancellazione dati in sospeso
        </p>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Richieste in sospeso */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Richieste in Attesa ({pendingRequests.length})
          </h3>

          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {request.userName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.userEmail}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                    In Attesa
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Motivazione:</strong>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    "{request.reason}"
                  </p>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Richiesta inviata il {request.createdAt?.toDate().toLocaleDateString('it-IT')} alle{' '}
                  {request.createdAt?.toDate().toLocaleTimeString('it-IT')}
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800 dark:text-red-300">
                      <p className="font-semibold mb-1">Attenzione!</p>
                      <p>
                        Approvando questa richiesta, tutti i dati dell'utente verranno
                        cancellati PERMANENTEMENTE:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Account utente</li>
                        <li>Profilo giocatore</li>
                        <li>Prenotazioni</li>
                        <li>Statistiche</li>
                        <li>Wallet</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <LoadingButton
                    onClick={() => handleApproveDelete(request)}
                    loading={processingId === request.id}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Approva e Cancella
                  </LoadingButton>

                  <LoadingButton
                    onClick={() => handleRejectDelete(request)}
                    loading={processingId === request.id}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rifiuta Richiesta
                  </LoadingButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Richieste processate */}
      {processedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Storico Richieste ({processedRequests.length})
          </h3>

          <div className="space-y-3">
            {processedRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {request.userName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {request.userEmail}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {request.status === 'approved' ? 'Approvata' : 'Rifiutata'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {request.processedAt?.toDate().toLocaleDateString('it-IT')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
