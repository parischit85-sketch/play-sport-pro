/**
 * BackupPanel Component
 * Admin UI for backup and restore operations
 *
 * Features:
 * - Create manual backup
 * - Download backup as JSON
 * - Upload and restore backup
 * - View backup history
 * - Collection selection
 * - Progress tracking
 * - Validation warnings
 */

import { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  History,
  AlertTriangle,
  CheckCircle,
  Loader,
  FileJson,
} from 'lucide-react';
import backupService, { BACKUP_CONFIG } from '@services/backupService';
import BackupHistoryList from './BackupHistoryList';
import RestoreModal from './RestoreModal';

const BackupPanel = () => {
  const [selectedCollections, setSelectedCollections] = useState(BACKUP_CONFIG.COLLECTIONS);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(null);
  const [lastBackup, setLastBackup] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [uploadedBackup, setUploadedBackup] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleCreateBackup = async () => {
    if (selectedCollections.length === 0) {
      setError('Seleziona almeno una collezione');
      return;
    }

    setIsCreatingBackup(true);
    setError(null);
    setSuccess(null);

    try {
      const backup = await backupService.createBackup(selectedCollections, (progress) => {
        setBackupProgress(progress);
      });

      setLastBackup(backup);
      setSuccess(`Backup creato: ${backup.metadata.size}MB`);

      // Auto-download backup
      backupService.downloadBackup(backup);
    } catch (err) {
      setError(`Errore durante il backup: ${err.message}`);
      console.error('Backup error:', err);
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(null);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    try {
      const backup = await backupService.parseBackupFile(file);
      setUploadedBackup(backup);
      setShowRestoreModal(true);
    } catch (err) {
      setError(`File backup non valido: ${err.message}`);
      console.error('Parse error:', err);
    }
  };

  const handleRestore = async (options) => {
    setShowRestoreModal(false);

    try {
      const results = await backupService.restoreFromBackup(uploadedBackup, options);

      setSuccess(`Restore completato: ${results.success.length} collezioni ripristinate`);

      if (results.failed.length > 0) {
        setError(
          `${results.failed.length} collezioni fallite: ${results.failed.map((f) => f.collection).join(', ')}`
        );
      }
    } catch (err) {
      setError(`Errore durante il restore: ${err.message}`);
      console.error('Restore error:', err);
    } finally {
      setUploadedBackup(null);
    }
  };

  const toggleCollection = (collectionName) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionName)
        ? prev.filter((c) => c !== collectionName)
        : [...prev, collectionName]
    );
  };

  const selectAll = () => {
    setSelectedCollections(BACKUP_CONFIG.COLLECTIONS);
  };

  const deselectAll = () => {
    setSelectedCollections([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Database size={28} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Backup & Recovery
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestisci backup e ripristino dei dati Firestore
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle
              size={20}
              className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Collection Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Collezioni da Backuppare
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Seleziona tutte
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Deseleziona tutte
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BACKUP_CONFIG.COLLECTIONS.map((collectionName) => (
                <label
                  key={collectionName}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer
                    transition-all
                    ${
                      selectedCollections.includes(collectionName)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(collectionName)}
                    onChange={() => toggleCollection(collectionName)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {collectionName}
                  </span>
                </label>
              ))}
            </div>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {selectedCollections.length} / {BACKUP_CONFIG.COLLECTIONS.length} collezioni
              selezionate
            </p>
          </div>

          {/* Progress Bar */}
          {backupProgress && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Loader size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {backupProgress.collection}
                </span>
                <span className="ml-auto text-sm text-blue-600 dark:text-blue-400">
                  {backupProgress.progress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                  style={{ width: `${backupProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Create Backup */}
            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup || selectedCollections.length === 0}
              className="
                flex items-center justify-center gap-2 px-6 py-4
                bg-blue-600 text-white rounded-lg
                hover:bg-blue-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                font-medium
              "
            >
              {isCreatingBackup ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Creazione in corso...</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span>Crea Backup</span>
                </>
              )}
            </button>

            {/* Upload Backup */}
            <label
              className="
              flex items-center justify-center gap-2 px-6 py-4
              bg-green-600 text-white rounded-lg
              hover:bg-green-700
              cursor-pointer
              transition-colors
              font-medium
            "
            >
              <Upload size={20} />
              <span>Carica Backup</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* View History */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="
                flex items-center justify-center gap-2 px-6 py-4
                bg-gray-600 text-white rounded-lg
                hover:bg-gray-700
                transition-colors
                font-medium
              "
            >
              <History size={20} />
              <span>Cronologia</span>
            </button>
          </div>

          {/* Last Backup Info */}
          {lastBackup && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start gap-3">
                <FileJson size={24} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Ultimo Backup Creato
                  </h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Dimensione:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {lastBackup.metadata.size} MB
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Collezioni:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {lastBackup.metadata.collections.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Timestamp:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {new Date(lastBackup.metadata.timestamp).toLocaleString('it-IT')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Durata:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {(lastBackup.metadata.duration / 1000).toFixed(2)}s
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {/* Backup History */}
          {showHistory && <BackupHistoryList />}
        </div>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && uploadedBackup && (
        <RestoreModal
          backup={uploadedBackup}
          onConfirm={handleRestore}
          onCancel={() => {
            setShowRestoreModal(false);
            setUploadedBackup(null);
          }}
        />
      )}
    </div>
  );
};

export default BackupPanel;
