/**
 * BackupHistoryList Component
 * Displays timeline of backup and restore operations
 *
 * Features:
 * - Backup history with metadata
 * - Restore history
 * - Download previous backups (if stored)
 * - Relative timestamps
 * - Size and duration info
 */

import { useState, useEffect } from 'react';
import { Clock, Download, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import backupService from '@services/backupService';

const BackupHistoryList = () => {
  const [backupHistory, setBackupHistory] = useState([]);
  const [restoreHistory, setRestoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('backups');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [backups, restores] = await Promise.all([
        backupService.getBackupHistory(20),
        backupService.getRestoreHistory(20),
      ]);

      setBackupHistory(backups);
      setRestoreHistory(restores);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return '';

    try {
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: it,
      });
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 border-gray-700">
        <button
          onClick={() => setActiveTab('backups')}
          className={`
            px-4 py-2 text-sm font-medium border-b-2 transition-colors
            ${
              activeTab === 'backups'
                ? 'border-blue-600 text-blue-600 text-blue-400'
                : 'border-transparent text-gray-600 text-gray-400 hover:text-gray-900 hover:text-gray-300'
            }
          `}
        >
          Backup ({backupHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('restores')}
          className={`
            px-4 py-2 text-sm font-medium border-b-2 transition-colors
            ${
              activeTab === 'restores'
                ? 'border-blue-600 text-blue-600 text-blue-400'
                : 'border-transparent text-gray-600 text-gray-400 hover:text-gray-900 hover:text-gray-300'
            }
          `}
        >
          Restore ({restoreHistory.length})
        </button>
      </div>

      {/* Backup History */}
      {activeTab === 'backups' && (
        <div className="space-y-3">
          {backupHistory.length === 0 ? (
            <div className="text-center py-8">
              <Database size={48} className="mx-auto text-gray-300 text-gray-600 mb-3" />
              <p className="text-gray-500 text-gray-400">Nessun backup trovato</p>
            </div>
          ) : (
            backupHistory.map((backup) => (
              <div key={backup.id} className="p-4 bg-gray-50 bg-gray-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 bg-blue-900 rounded-full flex items-center justify-center">
                    <Database size={20} className="text-blue-600 text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 text-white">
                          Backup {backup.source === 'auto' ? 'Automatico' : 'Manuale'}
                        </h4>
                        <p className="text-xs text-gray-500 text-gray-400">
                          {getTimeAgo(backup.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 text-blue-400">
                          {backup.size} MB
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {backup.collections?.map((coll) => (
                        <span
                          key={coll}
                          className="px-2 py-0.5 text-xs bg-white bg-gray-800 text-gray-700 text-gray-300 rounded border border-gray-200 border-gray-600"
                        >
                          {coll}
                        </span>
                      ))}
                    </div>

                    {backup.duration && (
                      <p className="text-xs text-gray-500 text-gray-400">
                        Durata: {(backup.duration / 1000).toFixed(2)}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Restore History */}
      {activeTab === 'restores' && (
        <div className="space-y-3">
          {restoreHistory.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto text-gray-300 text-gray-600 mb-3" />
              <p className="text-gray-500 text-gray-400">Nessun restore eseguito</p>
            </div>
          ) : (
            restoreHistory.map((restore) => (
              <div key={restore.id} className="p-4 bg-gray-50 bg-gray-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600 text-green-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 text-white">
                          Restore Completato
                        </h4>
                        <p className="text-xs text-gray-500 text-gray-400">
                          {getTimeAgo(restore.createdAt)}
                        </p>
                      </div>
                    </div>

                    {restore.backupTimestamp && (
                      <p className="text-xs text-gray-500 text-gray-400 mb-2">
                        Backup del: {new Date(restore.backupTimestamp).toLocaleString('it-IT')}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {restore.collections?.map((coll) => (
                        <span
                          key={coll}
                          className="px-2 py-0.5 text-xs bg-white bg-gray-800 text-gray-700 text-gray-300 rounded border border-gray-200 border-gray-600"
                        >
                          {coll}
                        </span>
                      ))}
                    </div>

                    {restore.duration && (
                      <p className="text-xs text-gray-500 text-gray-400">
                        Durata: {(restore.duration / 1000).toFixed(2)}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BackupHistoryList;
