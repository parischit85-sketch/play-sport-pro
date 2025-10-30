/**
 * FASE 2: 2025-10-16 - GDPR Data Export Component
 *
 * Componente per esportare i dati del giocatore (JSON/CSV/TXT)
 * Compliance GDPR Art. 15 (Right to Access)
 *
 * Features:
 * - Export in JSON (completo)
 * - Export in CSV (tabellare)
 * - Export in TXT (report leggibile)
 * - Include dati aggiuntivi opzionali (wallet, bookings, etc.)
 *
 * @component PlayerDataExport
 */

import React, { useState } from 'react';
import LoadingButton from '../../../../components/common/LoadingButton';
import { useToast } from '../../../../components/common/Toast';
import {
  downloadPlayerJSON,
  downloadPlayerCSV,
  downloadPlayerReport,
} from '../../utils/playerDataExporter';

export const PlayerDataExport = React.memo(function PlayerDataExport({
  player,
  permissions,
  additionalData = {},
  T,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const { showSuccess, showError } = useToast();

  // Se l'utente non ha permessi di export, non mostrare nulla
  if (!permissions.canExportData) {
    return null;
  }

  /**
   * Gestisce l'export nei vari formati
   */
  const handleExport = async (format) => {
    if (!player) {
      showError("Dati giocatore non disponibili per l'export");
      return;
    }

    setIsExporting(true);
    setSelectedFormat(format);

    try {
      // Delay artificiale per UX (mostrare loading)
      await new Promise((resolve) => setTimeout(resolve, 500));

      switch (format) {
        case 'json':
          downloadPlayerJSON(player, additionalData);
          break;
        case 'csv':
          downloadPlayerCSV(player, additionalData);
          break;
        case 'txt':
          downloadPlayerReport(player, additionalData);
          break;
        default:
          throw new Error(`Formato non supportato: ${format}`);
      }

      // Success feedback con Toast
      showSuccess(`Dati esportati con successo in formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting player data:', error);
      showError(`Errore durante l'export: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`${T.cardBg} border ${T.border} rounded-lg overflow-hidden`}>
      {/* Header - Collapse/Expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-6 py-4 flex items-center justify-between ${T.text} hover:bg-gray-50 hover:bg-gray-800 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📥</span>
          <div className="text-left">
            <h3 className={`font-semibold ${T.text}`}>Esporta i Tuoi Dati (GDPR)</h3>
            <p className={`text-sm ${T.muted}`}>Art. 15 - Diritto di Accesso ai Dati Personali</p>
          </div>
        </div>
        <span className={`text-xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Content - Export Options */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 border-gray-700">
          {/* Descrizione GDPR */}
          <div className="mb-6 p-4 bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-blue-400 text-xl">ℹ️</span>
              <div>
                <p className={`text-sm ${T.text} mb-2`}>
                  <strong>Diritto di Accesso (GDPR Art. 15):</strong>
                </p>
                <p className={`text-sm ${T.muted}`}>
                  Puoi richiedere una copia di tutti i tuoi dati personali che trattiamo. I dati
                  verranno scaricati sul tuo dispositivo in formato leggibile.
                </p>
              </div>
            </div>
          </div>

          {/* Export Formats */}
          <div className="space-y-4">
            <h4 className={`font-medium ${T.text} mb-3`}>Seleziona il formato di export:</h4>

            {/* JSON Format */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 border-gray-700 rounded-lg hover:border-blue-400 hover:border-blue-600 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📄</span>
                  <h5 className={`font-medium ${T.text}`}>JSON (Completo)</h5>
                </div>
                <p className={`text-sm ${T.muted} mb-3`}>
                  Formato strutturato con tutti i dati. Ideale per import in altri sistemi.
                </p>
                <LoadingButton
                  onClick={() => handleExport('json')}
                  loading={isExporting && selectedFormat === 'json'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📥 Scarica JSON
                </LoadingButton>
              </div>
            </div>

            {/* CSV Format */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 border-gray-700 rounded-lg hover:border-green-400 hover:border-green-600 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📊</span>
                  <h5 className={`font-medium ${T.text}`}>CSV (Tabella)</h5>
                </div>
                <p className={`text-sm ${T.muted} mb-3`}>
                  Formato tabellare. Apribile con Excel, Google Sheets, etc.
                </p>
                <LoadingButton
                  onClick={() => handleExport('csv')}
                  loading={isExporting && selectedFormat === 'csv'}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📥 Scarica CSV
                </LoadingButton>
              </div>
            </div>

            {/* TXT Format */}
            <div className="flex items-start gap-4 p-4 border border-gray-200 border-gray-700 rounded-lg hover:border-purple-400 hover:border-purple-600 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📝</span>
                  <h5 className={`font-medium ${T.text}`}>TXT (Report Leggibile)</h5>
                </div>
                <p className={`text-sm ${T.muted} mb-3`}>
                  Report formattato in italiano. Facile da leggere e stampare.
                </p>
                <LoadingButton
                  onClick={() => handleExport('txt')}
                  loading={isExporting && selectedFormat === 'txt'}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📥 Scarica Report
                </LoadingButton>
              </div>
            </div>
          </div>

          {/* Footer - Data Included */}
          <div className="mt-6 pt-4 border-t border-gray-200 border-gray-700">
            <p className={`text-xs ${T.muted}`}>
              <strong>Dati inclusi:</strong> Informazioni personali, indirizzo, dati club,
              certificato medico
              {additionalData.wallet && ', wallet'}
              {additionalData.bookings && ', prenotazioni'}
              {additionalData.tournaments && ', tornei'}
              {additionalData.communications && ', comunicazioni'}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default PlayerDataExport;

