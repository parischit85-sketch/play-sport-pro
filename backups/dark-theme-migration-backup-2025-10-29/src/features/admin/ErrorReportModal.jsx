/**
 * ErrorReportModal Component - CHK-303
 *
 * Modal per visualizzare e gestire error reports.
 * Features:
 * - Lista errori recenti
 * - Filtri per categoria e severity
 * - Error stats dashboard
 * - Export JSON/CSV
 * - Clear errors
 * - Real-time updates
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { errorTracker, ErrorCategory, ErrorSeverity } from '@lib/errorTracker';

const ErrorReportModal = ({ isOpen, onClose, T }) => {
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load errors
  const loadErrors = () => {
    setErrors(errorTracker.getRecentErrors(100));
    setStats(errorTracker.getStats());
  };

  useEffect(() => {
    if (!isOpen) return;
    loadErrors();
  }, [isOpen]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !isOpen) return;

    const interval = setInterval(() => {
      loadErrors();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isOpen]);

  // Filtered errors
  const filteredErrors = useMemo(() => {
    return errors.filter((error) => {
      // Category filter
      if (selectedCategory !== 'all' && error.category !== selectedCategory) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'all' && error.severity !== selectedSeverity) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          error.message.toLowerCase().includes(search) ||
          error.code?.toLowerCase().includes(search) ||
          error.id.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [errors, selectedCategory, selectedSeverity, searchTerm]);

  // Severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case ErrorSeverity.MEDIUM:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case ErrorSeverity.LOW:
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  // Severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case ErrorSeverity.HIGH:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case ErrorSeverity.LOW:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Category color
  const getCategoryColor = (category) => {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case ErrorCategory.AUTH:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case ErrorCategory.VALIDATION:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case ErrorCategory.FIRESTORE:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case ErrorCategory.PERMISSION:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case ErrorCategory.PAYMENT:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Appena ora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min fa`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ore fa`;
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle export JSON
  const handleExportJSON = () => {
    errorTracker.exportJSON();
  };

  // Handle export CSV
  const handleExportCSV = () => {
    errorTracker.exportCSV();
  };

  // Handle clear all
  const handleClearAll = () => {
    if (confirm('Sei sicuro di voler eliminare tutti gli errori?')) {
      errorTracker.clear();
      loadErrors();
    }
  };

  // Handle clear by category
  const handleClearCategory = (category) => {
    if (confirm(`Eliminare tutti gli errori di tipo "${category}"?`)) {
      errorTracker.clearByCategory(category);
      loadErrors();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error Reports</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tracciamento errori applicazione
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Totale</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Critici</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                  {stats.bySeverity[ErrorSeverity.CRITICAL] || 0}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Alta Priorità</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                  {stats.bySeverity[ErrorSeverity.HIGH] || 0}
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Ultima Ora</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                  {stats.last1h}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Ultime 24h</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {stats.last24h}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tutte le Categorie</option>
                {Object.values(ErrorCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gravità
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tutte le Gravità</option>
                {Object.values(ErrorSeverity).map((sev) => (
                  <option key={sev} value={sev}>
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cerca
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca messaggio, codice, ID..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setAutoRefresh(!autoRefresh);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={loadErrors}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Error List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredErrors.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {errors.length === 0
                  ? 'Nessun errore registrato'
                  : 'Nessun errore corrisponde ai filtri'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredErrors.map((error) => (
                <div
                  key={error.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start gap-4">
                    {/* Severity Icon */}
                    <div className="flex-shrink-0 pt-1">{getSeverityIcon(error.severity)}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 break-words">
                            {error.message}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(error.severity)}`}
                            >
                              {error.severity}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(error.category)}`}
                            >
                              {error.category}
                            </span>
                            {error.code && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                                {error.code}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>

                      {/* Details */}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          Mostra Dettagli
                        </summary>
                        <div className="mt-2 space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              ID:
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                              {error.id}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              URL:
                            </span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400 break-all">
                              {error.context.url}
                            </span>
                          </div>
                          {error.stack && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                Stack:
                              </span>
                              <pre className="mt-1 p-2 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                                {error.stack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Showing {filteredErrors.length} of {errors.length} errors
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorReportModal;
