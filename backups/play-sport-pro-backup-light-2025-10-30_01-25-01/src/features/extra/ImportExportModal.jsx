// =============================================
// FILE: src/features/extra/ImportExportModal.jsx
// Import/Export Courts Configuration Modal
// =============================================
import React, { useState } from 'react';
import { useNotifications } from '@contexts/NotificationContext';
import { sanitizeCourt, validateCourt } from '@utils/court-validation.js';

// ============================================
// COMPONENTE: Export Courts Modal
// ============================================
export function ExportCourtsModal({ isOpen, onClose, courts = [], selectedCourts = [], T }) {
  const { showError } = useNotifications();
  const [exportFormat, setExportFormat] = useState('pretty'); // 'pretty' | 'compact'
  const [includeMetadata, setIncludeMetadata] = useState(true);

  if (!isOpen) return null;

  const courtsToExport = selectedCourts.length > 0
    ? courts.filter((_, index) => selectedCourts.includes(index))
    : courts;

  const handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        courtCount: courtsToExport.length,
        courts: courtsToExport.map(court => ({
          name: court.name,
          courtType: court.courtType,
          maxPlayers: court.maxPlayers,
          hasHeating: court.hasHeating,
          order: court.order,
          timeSlots: court.timeSlots || []
        }))
      };

      if (!includeMetadata) {
        delete exportData.version;
        delete exportData.exportDate;
        delete exportData.courtCount;
      }

      const jsonString = exportFormat === 'pretty'
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `courts-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      showError(`Errore durante l'esportazione: ${error.message}`);
    }
  };

  const previewData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    courtCount: courtsToExport.length,
    courts: courtsToExport.slice(0, 2).map(court => ({
      name: court.name,
      courtType: court.courtType,
      timeSlots: `${(court.timeSlots || []).length} fasce`
    }))
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-green-900/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                📤 Esporta Configurazioni
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Esporta {courtsToExport.length} {courtsToExport.length === 1 ? 'campo' : 'campi'} in formato JSON
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Options */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Formato Output
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExportFormat('pretty')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    exportFormat === 'pretty'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📋 Leggibile (Pretty)
                </button>
                <button
                  onClick={() => setExportFormat('compact')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    exportFormat === 'compact'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🗜️ Compatto
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
              <input
                type="checkbox"
                id="includeMetadata"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="includeMetadata" className="text-sm text-gray-300 cursor-pointer">
                Includi metadata (versione, data export, statistiche)
              </label>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Anteprima (primi 2 campi)
            </label>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-60 overflow-y-auto font-mono">
{JSON.stringify(previewData, null, 2)}
{courtsToExport.length > 2 && '\n... altri ' + (courtsToExport.length - 2) + ' campi'}
            </pre>
          </div>

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">
              ℹ️ Informazioni Export
            </h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Totale campi: {courtsToExport.length}</li>
              <li>• Totale fasce orarie: {courtsToExport.reduce((sum, c) => sum + (c.timeSlots || []).length, 0)}</li>
              <li>• Gli ID verranno rigenerati durante l'import</li>
              <li>• File compatibile con Import Configurazioni</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-700 font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              📥 Scarica JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: Import Courts Modal
// ============================================
export function ImportCourtsModal({ isOpen, onClose, onImport, existingCourts = [], T }) {
  const { showError } = useNotifications();
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState(null);
  const [importStrategy, setImportStrategy] = useState('merge'); // 'merge' | 'replace'
  const [validationErrors, setValidationErrors] = useState([]);
  const [parseError, setParseError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setParseError(null);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        // Validate structure
        if (!jsonData.courts || !Array.isArray(jsonData.courts)) {
          setParseError('Il file JSON non contiene un array "courts" valido');
          setImportData(null);
          return;
        }

        // Validate each court
        const errors = [];
        jsonData.courts.forEach((court, index) => {
          const validation = validateCourt(court);
          if (!validation.isValid) {
            errors.push(`Campo ${index + 1} (${court.name || 'senza nome'}): ${validation.errors.join(', ')}`);
          }
        });

        setValidationErrors(errors);
        setImportData(jsonData);
      } catch (error) {
        setParseError(`Errore parsing JSON: ${error.message}`);
        setImportData(null);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importData || validationErrors.length > 0) return;

    try {
      // Sanitize imported courts
      const sanitizedCourts = importData.courts.map(court => sanitizeCourt(court));

      // Generate new IDs and orders
      const maxOrder = existingCourts.length > 0
        ? Math.max(...existingCourts.map(c => c.order || 0))
        : 0;

      const processedCourts = sanitizedCourts.map((court, index) => ({
        ...court,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order: maxOrder + index + 1,
        timeSlots: (court.timeSlots || []).map(slot => ({
          ...slot,
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      }));

      onImport(processedCourts, importStrategy);
      
      // Reset and close
      setImportFile(null);
      setImportData(null);
      setValidationErrors([]);
      setParseError(null);
      onClose();
    } catch (error) {
      showError(`Errore durante l'import: ${error.message}`);
    }
  };

  const canImport = importData && validationErrors.length === 0 && !parseError;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-green-900/20 to-blue-900/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                📥 Importa Configurazioni
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Carica un file JSON per importare campi e configurazioni
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seleziona File JSON
            </label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className={`${T.input} w-full`}
            />
            {importFile && (
              <div className="mt-2 text-sm text-gray-400">
                📄 {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {/* Parse Error */}
          {parseError && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-300 mb-2">
                ❌ Errore Parsing
              </h4>
              <p className="text-sm text-red-300">{parseError}</p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">
                ⚠️ Errori di Validazione ({validationErrors.length})
              </h4>
              <ul className="text-sm text-yellow-300 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {importData && !parseError && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Strategia Import
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setImportStrategy('merge')}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      importStrategy === 'merge'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ➕ Aggiungi (Merge)
                  </button>
                  <button
                    onClick={() => setImportStrategy('replace')}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      importStrategy === 'replace'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🔄 Sostituisci (Replace)
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {importStrategy === 'merge'
                    ? '✓ I campi importati saranno aggiunti a quelli esistenti'
                    : '⚠️ I campi esistenti saranno completamente sostituiti'}
                </p>
              </div>

              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">
                  📊 Anteprima Import
                </h4>
                <div className="text-sm text-blue-300 space-y-1">
                  <div>• Campi da importare: {importData.courts.length}</div>
                  <div>• Campi esistenti: {existingCourts.length}</div>
                  <div>• Totale dopo import: {importStrategy === 'merge' ? existingCourts.length + importData.courts.length : importData.courts.length}</div>
                  <div>• Fasce orarie totali: {importData.courts.reduce((sum, c) => sum + (c.timeSlots || []).length, 0)}</div>
                </div>
              </div>

              {/* Courts List Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campi nel file ({importData.courts.length})
                </label>
                <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {importData.courts.map((court, index) => (
                      <div
                        key={index}
                        className="text-sm bg-gray-800 p-3 rounded border border-gray-700"
                      >
                        <div className="font-semibold text-white">
                          {index + 1}. {court.name}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          {court.courtType} | {court.maxPlayers} giocatori | {(court.timeSlots || []).length} fasce
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-700 font-medium transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleImport}
              disabled={!canImport}
              className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                canImport
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              📤 Importa Campi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default { ExportCourtsModal, ImportCourtsModal };

