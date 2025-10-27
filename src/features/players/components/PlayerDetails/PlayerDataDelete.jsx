/**
 * FASE 2: 2025-10-16 - GDPR Data Delete Component
 * 
 * Componente per cancellare PERMANENTEMENTE i dati del giocatore
 * Compliance GDPR Art. 17 (Right to Erasure / Right to be Forgotten)
 * 
 * Features:
 * - Double confirm per evitare cancellazioni accidentali
 * - Cancellazione permanente (NO soft delete)
 * - Solo Admin può cancellare
 * - Warning chiaro sulle conseguenze
 * 
 * @component PlayerDataDelete
 */

import React, { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import LoadingButton from '../../../../components/common/LoadingButton';
import { useToast } from '../../../../components/common/Toast';

export const PlayerDataDelete = React.memo(function PlayerDataDelete({
  player,
  permissions,
  onDeleted,
  T,
}) {
  const [confirmStep, setConfirmStep] = useState(0); // 0 = chiuso, 1 = primo confirm, 2 = secondo confirm
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { showSuccess, showError, showWarning } = useToast();

  // Solo Admin può cancellare
  if (!permissions.canDelete) {
    return null;
  }

  /**
   * Reset dello stato
   */
  const resetState = () => {
    setConfirmStep(0);
    setConfirmText('');
  };

  /**
   * Cancella permanentemente il giocatore
   */
  const handleDelete = async () => {
    if (!player || !player.id) {
      showError('Impossibile cancellare: ID giocatore non trovato');
      return;
    }

    // Verifica double confirm
    if (confirmText.toUpperCase() !== 'ELIMINA DEFINITIVAMENTE') {
      showWarning('Testo di conferma non corretto. Scrivi esattamente: ELIMINA DEFINITIVAMENTE');
      return;
    }

    setIsDeleting(true);

    try {
      // 🔥 CANCELLAZIONE PERMANENTE dal database
      const playerRef = doc(db, 'players', player.id);
      await deleteDoc(playerRef);

      console.log(`✅ Player ${player.id} deleted permanently (GDPR Art. 17)`);

      showSuccess(`Giocatore "${player.firstName} ${player.lastName}" cancellato permanentemente dal sistema`);

      // Callback per chiudere il modale e aggiornare la lista
      if (onDeleted) {
        onDeleted(player.id);
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      showError(`Errore durante la cancellazione: ${error.message}`);
    } finally {
      setIsDeleting(false);
      resetState();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
      {/* Zona Pericolo */}
      <div className="border-2 border-red-300 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              Zona Pericolo - Cancellazione Permanente
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-1">
              GDPR Art. 17 - Diritto alla Cancellazione ("Right to be Forgotten")
            </p>
          </div>
        </div>

        {/* Step 0: Pulsante iniziale */}
        {confirmStep === 0 && (
          <div>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4">
              Questa azione eliminerà <strong>PERMANENTEMENTE</strong> tutti i dati del giocatore dal sistema.
            </p>
            <button
              onClick={() => setConfirmStep(1)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              🗑️ Cancella Giocatore Permanentemente
            </button>
          </div>
        )}

        {/* Step 1: Primo warning */}
        {confirmStep === 1 && (
          <div>
            <div className="mb-4 p-4 bg-white dark:bg-gray-900 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-semibold mb-3">
                ⚠️ ATTENZIONE: Questa azione è IRREVERSIBILE!
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-2 list-disc list-inside">
                <li>Tutti i dati personali saranno cancellati</li>
                <li>Storico prenotazioni: PERSO</li>
                <li>Wallet e transazioni: PERSI</li>
                <li>Certificati medici: PERSI</li>
                <li>Note e comunicazioni: PERSE</li>
                <li>Statistiche tornei: PERSE</li>
              </ul>
              <p className="text-sm text-red-700 dark:text-red-400 font-bold mt-3">
                NON SARÀ POSSIBILE RECUPERARE QUESTI DATI!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmStep(2)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Continua →
              </button>
              <button
                onClick={resetState}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                ❌ Annulla
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Doppia conferma con input */}
        {confirmStep === 2 && (
          <div>
            <div className="mb-4 p-4 bg-white dark:bg-gray-900 border-2 border-red-500 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-bold mb-3">
                🚨 ULTIMA CONFERMA RICHIESTA
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                Stai per eliminare <strong>{player.firstName} {player.lastName}</strong> (ID: {player.id})
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                Per procedere, scrivi esattamente:
              </p>
              <p className="text-base font-mono font-bold text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-3 rounded mb-4 text-center">
                ELIMINA DEFINITIVAMENTE
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Scrivi qui la conferma..."
                className={`w-full px-4 py-3 border-2 rounded-lg font-mono ${
                  confirmText.toUpperCase() === 'ELIMINA DEFINITIVAMENTE'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-300 dark:border-red-700 bg-white dark:bg-gray-800'
                } ${T.text} focus:outline-none focus:ring-2 focus:ring-red-500`}
                disabled={isDeleting}
              />
            </div>

            <div className="flex gap-3">
              <LoadingButton
                onClick={handleDelete}
                loading={isDeleting}
                disabled={confirmText.toUpperCase() !== 'ELIMINA DEFINITIVAMENTE'}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ CANCELLA PERMANENTEMENTE
              </LoadingButton>
              <button
                onClick={resetState}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                ❌ Annulla
              </button>
            </div>
          </div>
        )}

        {/* Footer - Info GDPR */}
        <div className="mt-6 pt-4 border-t border-red-300 dark:border-red-700">
          <p className="text-xs text-red-600 dark:text-red-400">
            <strong>Info GDPR:</strong> Il Regolamento Generale sulla Protezione dei Dati (GDPR) Art. 17 
            garantisce il "diritto all'oblio". L'utente può richiedere la cancellazione permanente dei 
            propri dati personali. Questa funzione è riservata agli amministratori di sistema.
          </p>
        </div>
      </div>
    </div>
  );
});

export default PlayerDataDelete;
