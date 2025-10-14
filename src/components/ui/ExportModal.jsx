// =============================================
// FILE: src/ui/ExportModal.jsx
// Modal per esportazione dati giocatori
// =============================================

import React, { useState } from 'react';
import Modal from './Modal.jsx';
import { exportToCSV, formatDateForExport, formatBooleanForExport, formatNumberForExport } from '@lib/exportUtils.js';

export default function ExportModal({
  isOpen,
  onClose,
  players,
  filteredPlayers,
  T
}) {
  const [exportType, setExportType] = useState('filtered'); // 'filtered' o 'all'
  const [isExporting, setIsExporting] = useState(false);

  // Definizione delle colonne per l'esportazione
  const exportColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'firstName', label: 'Nome' },
    { key: 'lastName', label: 'Cognome' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telefono' },
    { key: 'category', label: 'Categoria' },
    { key: 'isActive', label: 'Attivo', formatter: formatBooleanForExport },
    { key: 'isAccountLinked', label: 'Account Collegato', formatter: formatBooleanForExport },
    { key: 'calculatedRating', label: 'Rating', formatter: (val) => formatNumberForExport(val, 1) },
    { key: 'createdAt', label: 'Data Registrazione', formatter: formatDateForExport },
    { key: 'lastActivity', label: 'Ultimo Accesso', formatter: formatDateForExport },
    { key: 'dateOfBirth', label: 'Data Nascita', formatter: formatDateForExport },
    { key: 'tournamentData.isParticipant', label: 'Partecipa Torneo', formatter: formatBooleanForExport },
  ];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const dataToExport = exportType === 'filtered' ? filteredPlayers : players;
      const filename = `giocatori_${exportType === 'filtered' ? 'filtrati' : 'tutti'}`;

      // Prepara i dati per l'esportazione
      const exportData = dataToExport.map(player => ({
        ...player,
        // Assicura che tutti i campi siano stringhe o valori primitivi
        name: player.name || `${player.firstName || ''} ${player.lastName || ''}`.trim() || '',
        category: getCategoryLabel(player.category),
        calculatedRating: player.calculatedRating || player.rating || 0,
      }));

      await exportToCSV(exportData, exportColumns, filename);

      // Chiudi il modal dopo l'esportazione
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Errore durante l\'esportazione. Riprova.');
    } finally {
      setIsExporting(false);
    }
  };

  // Funzione helper per ottenere l'etichetta della categoria
  const getCategoryLabel = (category) => {
    const labels = {
      'member': 'Membro',
      'non-member': 'Non Membro',
      'guest': 'Ospite',
      'vip': 'VIP'
    };
    return labels[category] || category || '';
  };

  const dataToExport = exportType === 'filtered' ? filteredPlayers : players;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Esporta Giocatori"
      size="medium"
    >
      <div className="space-y-6">
        {/* Opzioni di esportazione */}
        <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
          <h3 className={`text-lg font-medium mb-4 ${T.text}`}>
            Scegli cosa esportare
          </h3>

          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="exportType"
                value="filtered"
                checked={exportType === 'filtered'}
                onChange={(e) => setExportType(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className={`font-medium ${T.text}`}>
                  Giocatori filtrati ({filteredPlayers.length})
                </div>
                <div className={`text-sm ${T.subtext}`}>
                  Esporta solo i giocatori attualmente visibili con i filtri applicati
                </div>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="exportType"
                value="all"
                checked={exportType === 'all'}
                onChange={(e) => setExportType(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className={`font-medium ${T.text}`}>
                  Tutti i giocatori ({players.length})
                </div>
                <div className={`text-sm ${T.subtext}`}>
                  Esporta tutti i giocatori senza filtri
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Anteprima colonne */}
        <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
          <h3 className={`text-lg font-medium mb-4 ${T.text}`}>
            Colonne incluse ({exportColumns.length})
          </h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {exportColumns.map((col, index) => (
              <div key={index} className={`${T.subtext} flex items-center`}>
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                {col.label}
              </div>
            ))}
          </div>
        </div>

        {/* Informazioni */}
        <div className={`text-sm ${T.subtext} bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg`}>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">ℹ️</span>
            <div>
              Verrà scaricato un file CSV contenente {dataToExport.length} giocatori.
              Il file includerà tutte le informazioni principali di ogni giocatore.
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`${T.btnSecondary} px-4 py-2`}
            disabled={isExporting}
          >
            Annulla
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || dataToExport.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isExporting || dataToExport.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isExporting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Esportazione...
              </>
            ) : (
              <>📥 Esporta CSV</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}