/**
 * Tournament Trash - View and manage deleted tournaments
 */

import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import {
  getDeletedTournaments,
  restoreTournamentFromTrash,
  deleteTournamentPermanently,
} from '../../services/tournamentService';
import { formatDate } from '../../utils/tournamentFormatters';

function TournamentTrash({ clubId, onClose }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDeletedTournaments();
  }, [clubId]);

  const loadDeletedTournaments = async () => {
    setLoading(true);
    try {
      const data = await getDeletedTournaments(clubId);
      setTournaments(data);
    } catch (error) {
      console.error('Error loading deleted tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (tournamentId, tournamentName) => {
    if (!window.confirm(`Ripristinare il torneo "${tournamentName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await restoreTournamentFromTrash(clubId, tournamentId);
      if (result.success) {
        alert('Torneo ripristinato con successo!');
        loadDeletedTournaments();
      } else {
        alert('Errore nel ripristino: ' + result.error);
      }
    } catch (error) {
      console.error('Error restoring tournament:', error);
      alert('Errore nel ripristino del torneo');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (tournamentId, tournamentName) => {
    if (
      !window.confirm(
        `ATTENZIONE: Eliminare DEFINITIVAMENTE il torneo "${tournamentName}"?\n\nQuesta operazione cancellerà tutte le partite, squadre e classifiche associate.\n\nQuesta azione NON PUÒ ESSERE ANNULLATA!`
      )
    ) {
      return;
    }

    // Double confirmation for permanent delete
    if (
      !window.confirm(
        `Sei assolutamente sicuro?\n\nDigita OK per confermare l'eliminazione permanente.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await deleteTournamentPermanently(clubId, tournamentId);
      if (result.success) {
        alert('Torneo eliminato definitivamente.');
        loadDeletedTournaments();
      } else {
        alert("Errore nell'eliminazione: " + result.error);
      }
    } catch (error) {
      console.error('Error deleting tournament permanently:', error);
      alert("Errore nell'eliminazione definitiva del torneo");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-red-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-100">Cestino Tornei</h2>
                <p className="text-sm text-gray-400">
                  Tornei eliminati - Puoi ripristinarli o eliminarli definitivamente
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Caricamento cestino...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="py-12 text-center">
              <Trash2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">Cestino vuoto</h3>
              <p className="text-gray-400">Non ci sono tornei eliminati</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Warning Banner */}
              <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-sm text-orange-200">
                  <p className="font-medium mb-1">Attenzione</p>
                  <p className="text-orange-300/90">
                    L&apos;eliminazione definitiva rimuoverà permanentemente tutti i dati associati
                    al torneo (partite, squadre, classifiche). Questa azione non può essere
                    annullata.
                  </p>
                </div>
              </div>

              {/* Tournament List */}
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-100 mb-1">{tournament.name}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        {tournament.startDate && (
                          <span>
                            📅 {formatDate(tournament.startDate)}
                            {tournament.endDate && ` - ${formatDate(tournament.endDate)}`}
                          </span>
                        )}
                        <span>🏆 {tournament.format || 'N/D'}</span>
                        {tournament.deletedAt && (
                          <span className="text-red-400">
                            🗑️ Eliminato: {formatDate(tournament.deletedAt)}
                          </span>
                        )}
                      </div>
                      {tournament.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {tournament.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleRestore(tournament.id, tournament.name)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Ripristina torneo"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Ripristina
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(tournament.id, tournament.name)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Elimina definitivamente"
                      >
                        <Trash2 className="w-4 h-4" />
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default TournamentTrash;
