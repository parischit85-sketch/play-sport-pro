/**
 * RestoreModal Component
 * Confirmation modal for restore operations with options
 *
 * Features:
 * - Backup preview (metadata, collections)
 * - Collection selection for restore
 * - Overwrite vs merge mode
 * - Data validation warnings
 * - Confirmation step
 */

import { useState } from 'react';
import { AlertTriangle, X, RefreshCw, CheckCircle } from 'lucide-react';

const RestoreModal = ({ backup, onConfirm, onCancel }) => {
  const [selectedCollections, setSelectedCollections] = useState(Object.keys(backup.data || {}));
  const [overwriteMode, setOverwriteMode] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleRestore = () => {
    onConfirm({
      collections: selectedCollections,
      overwrite: overwriteMode,
    });
  };

  const toggleCollection = (collectionName) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionName)
        ? prev.filter((c) => c !== collectionName)
        : [...prev, collectionName]
    );
  };

  const totalDocuments = selectedCollections.reduce((sum, collName) => {
    return sum + (backup.data[collName]?.count || 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw size={24} className="text-orange-600 text-orange-400" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 text-white">
                  Ripristina Backup
                </h3>
                <p className="text-sm text-gray-500 text-gray-400">
                  {new Date(backup.metadata.timestamp).toLocaleString('it-IT')}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:text-gray-300 rounded-lg hover:bg-gray-100 hover:bg-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Warning */}
            <div className="p-4 bg-orange-50 bg-orange-900/20 border border-orange-200 border-orange-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="text-orange-600 text-orange-400 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 text-orange-200 mb-1">
                    Attenzione
                  </h4>
                  <p className="text-sm text-orange-700 text-orange-300">
                    Il ripristino del backup modificherà i dati nel database. Assicurati di aver
                    creato un backup recente prima di procedere.
                  </p>
                </div>
              </div>
            </div>

            {/* Backup Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 bg-gray-700 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 text-gray-400">Dimensione</p>
                <p className="font-semibold text-gray-900 text-white">
                  {backup.metadata.size} MB
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 text-gray-400">Versione</p>
                <p className="font-semibold text-gray-900 text-white">
                  {backup.metadata.version}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 text-gray-400">Origine</p>
                <p className="font-semibold text-gray-900 text-white capitalize">
                  {backup.metadata.source}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 text-gray-400">Documenti totali</p>
                <p className="font-semibold text-gray-900 text-white">{totalDocuments}</p>
              </div>
            </div>

            {/* Collection Selection */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 text-white mb-3">
                Collezioni da ripristinare ({selectedCollections.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(backup.data).map(([collName, collData]) => (
                  <label
                    key={collName}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border cursor-pointer
                      transition-all
                      ${
                        selectedCollections.includes(collName)
                          ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                          : 'border-gray-200 border-gray-700 hover:border-blue-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(collName)}
                        onChange={() => toggleCollection(collName)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 text-gray-300">
                        {collName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 text-gray-400">
                      {collData.count || 0} docs
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Restore Mode */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 text-white mb-3">
                Modalità di ripristino
              </h4>
              <div className="space-y-2">
                <label
                  className={`
                  flex items-start p-3 rounded-lg border-2 cursor-pointer
                  ${
                    !overwriteMode
                      ? 'border-blue-500 bg-blue-50 bg-blue-900/20'
                      : 'border-gray-200 border-gray-700'
                  }
                `}
                >
                  <input
                    type="radio"
                    name="restoreMode"
                    checked={!overwriteMode}
                    onChange={() => setOverwriteMode(false)}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 text-white">
                      Merge (Consigliato)
                    </p>
                    <p className="text-xs text-gray-500 text-gray-400 mt-1">
                      I dati del backup verranno uniti con quelli esistenti. I documenti esistenti
                      non verranno sovrascritti.
                    </p>
                  </div>
                </label>

                <label
                  className={`
                  flex items-start p-3 rounded-lg border-2 cursor-pointer
                  ${
                    overwriteMode
                      ? 'border-orange-500 bg-orange-50 bg-orange-900/20'
                      : 'border-gray-200 border-gray-700'
                  }
                `}
                >
                  <input
                    type="radio"
                    name="restoreMode"
                    checked={overwriteMode}
                    onChange={() => setOverwriteMode(true)}
                    className="mt-1 w-4 h-4 text-orange-600"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 text-white">
                      Overwrite (Attenzione!)
                    </p>
                    <p className="text-xs text-gray-500 text-gray-400 mt-1">
                      I documenti esistenti verranno completamente sovrascritti con quelli del
                      backup. Usare con cautela.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Final Confirmation */}
            <label className="flex items-start gap-3 p-4 bg-gray-50 bg-gray-700 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 text-white">
                  Confermo di voler procedere con il ripristino
                </p>
                <p className="text-xs text-gray-500 text-gray-400 mt-1">
                  Ho creato un backup recente e comprendo che questa operazione modificherà il
                  database.
                </p>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 border-gray-700 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 text-gray-300 hover:bg-gray-100 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleRestore}
              disabled={!confirmed || selectedCollections.length === 0}
              className="
                flex items-center gap-2 px-6 py-2
                bg-orange-600 text-white rounded-lg
                hover:bg-orange-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                font-medium
              "
            >
              <RefreshCw size={18} />
              <span>Ripristina Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestoreModal;

