/**
 * ExperimentDashboard Component - CHK-304
 *
 * Admin dashboard per gestire feature flags e A/B experiments.
 * Features:
 * - Lista feature flags con toggle on/off
 * - Lista esperimenti con stats
 * - Create/Edit/Delete experiments
 * - Start/Pause/Complete experiments
 * - View experiment results
 * - Export data
 */

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@contexts/NotificationContext';
import {
  X,
  Flag,
  FlaskConical,
  Play,
  Pause,
  CheckCircle,
  Trash2,
  Download,
  Plus,
  Edit,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';
import { featureFlagManager, VariantType, ExperimentStatus } from '@lib/featureFlags';

const ExperimentDashboard = ({ isOpen, onClose, T }) => {
  const { showWarning, confirm } = useNotifications();
  const [activeTab, setActiveTab] = useState('flags'); // 'flags' or 'experiments'
  const [flags, setFlags] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load data
  const loadData = () => {
    setFlags(featureFlagManager.getAllFlags());
    setExperiments(featureFlagManager.getAllExperiments());
  };

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen]);

  // Toggle flag
  const handleToggleFlag = (flagKey, enabled) => {
    featureFlagManager.setFlag(flagKey, enabled);
    loadData();
  };

  // Start experiment
  const handleStartExperiment = async (key) => {
    const confirmed = await confirm({
      title: 'Avvia esperimento',
      message: `Avviare l'esperimento "${key}"?`,
      variant: 'info',
      confirmText: 'Avvia',
      cancelText: 'Annulla',
    });
    if (confirmed) {
      featureFlagManager.startExperiment(key);
      loadData();
    }
  };

  // Pause experiment
  const handlePauseExperiment = async (key) => {
    const confirmed = await confirm({
      title: 'Pausa esperimento',
      message: `Mettere in pausa l'esperimento "${key}"?`,
      variant: 'warning',
      confirmText: 'Metti in pausa',
      cancelText: 'Annulla',
    });
    if (confirmed) {
      featureFlagManager.pauseExperiment(key);
      loadData();
    }
  };

  // Complete experiment
  const handleCompleteExperiment = (key) => {
    const winner = prompt('Variante vincente (control/variantA/variantB):');
    if (winner) {
      featureFlagManager.completeExperiment(key, winner);
      loadData();
    }
  };

  // Delete experiment
  const handleDeleteExperiment = async (key) => {
    const confirmed = await confirm({
      title: 'Elimina esperimento',
      message: `Eliminare l'esperimento "${key}"? Questa azione è irreversibile.`,
      variant: 'danger',
      confirmText: 'Elimina',
      cancelText: 'Annulla',
    });
    if (confirmed) {
      const experiment = featureFlagManager.experiments.get(key);
      if (experiment.status === ExperimentStatus.RUNNING) {
        showWarning('Non puoi eliminare un esperimento in esecuzione. Mettilo prima in pausa.');
        return;
      }
      featureFlagManager.experiments.delete(key);
      featureFlagManager.persistData();
      loadData();
    }
  };

  // View experiment stats
  const handleViewStats = (key) => {
    const stats = featureFlagManager.getExperimentStats(key);
    setSelectedExperiment(stats);
  };

  // Export data
  const handleExport = () => {
    featureFlagManager.exportJSON();
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case ExperimentStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 bg-gray-700 text-gray-300';
      case ExperimentStatus.RUNNING:
        return 'bg-green-100 text-green-800 bg-green-900/30 text-green-300';
      case ExperimentStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800 bg-yellow-900/30 text-yellow-300';
      case ExperimentStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800 bg-blue-900/30 text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 bg-gray-700 text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-purple-600 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-white">
                A/B Testing & Feature Flags
              </h2>
              <p className="text-sm text-gray-600 text-gray-400">
                Gestisci esperimenti e feature flags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('flags')}
            className={`px-6 py-4 font-medium transition-colors border-b-2 ${
              activeTab === 'flags'
                ? 'border-purple-600 text-purple-600 text-purple-400'
                : 'border-transparent text-gray-600 text-gray-400 hover:text-gray-900 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Feature Flags ({flags.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-6 py-4 font-medium transition-colors border-b-2 ${
              activeTab === 'experiments'
                ? 'border-purple-600 text-purple-600 text-purple-400'
                : 'border-transparent text-gray-600 text-gray-400 hover:text-gray-900 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Experiments ({experiments.length})
            </div>
          </button>
        </div>

        {/* Actions Bar */}
        <div className="p-6 border-b border-gray-200 border-gray-700">
          <div className="flex flex-wrap gap-2">
            {activeTab === 'experiments' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Experiment
              </button>
            )}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'flags' && (
            <div className="space-y-3">
              {flags.length === 0 ? (
                <div className="text-center py-12">
                  <Flag className="w-16 h-16 text-gray-400 text-gray-600 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 text-gray-400">
                    Nessuna feature flag configurata
                  </p>
                </div>
              ) : (
                flags.map((flag) => (
                  <div
                    key={flag.key}
                    className="bg-gray-50 bg-gray-700/50 rounded-lg p-4 border border-gray-200 border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-white mb-1">
                          {flag.key}
                        </h4>
                        {flag.description && (
                          <p className="text-sm text-gray-600 text-gray-400">
                            {flag.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 text-gray-500 mt-2">
                          Created: {new Date(flag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={flag.enabled}
                            onChange={(e) => handleToggleFlag(flag.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 peer-focus:ring-purple-800 rounded-full peer bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all border-gray-600 peer-checked:bg-purple-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900 text-gray-300">
                            {flag.enabled ? 'ON' : 'OFF'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'experiments' && (
            <div className="space-y-3">
              {experiments.length === 0 ? (
                <div className="text-center py-12">
                  <FlaskConical className="w-16 h-16 text-gray-400 text-gray-600 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 text-gray-400 mb-4">
                    Nessun esperimento creato
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Crea il tuo primo esperimento
                  </button>
                </div>
              ) : (
                experiments.map((exp) => {
                  const stats = featureFlagManager.getExperimentStats(exp.key);
                  return (
                    <div
                      key={exp.key}
                      className="bg-gray-50 bg-gray-700/50 rounded-lg p-4 border border-gray-200 border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-white">
                              {exp.name}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                exp.status
                              )}`}
                            >
                              {exp.status}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-600 text-gray-400 mb-2">
                              {exp.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{stats.participants} participants</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-gray-400">
                              <Activity className="w-4 h-4" />
                              <span>{exp.variants.length} variants</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {exp.status === ExperimentStatus.DRAFT && (
                            <button
                              onClick={() => handleStartExperiment(exp.key)}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              title="Start"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {exp.status === ExperimentStatus.RUNNING && (
                            <>
                              <button
                                onClick={() => handlePauseExperiment(exp.key)}
                                className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                title="Pause"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCompleteExperiment(exp.key)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Complete"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewStats(exp.key)}
                            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            title="View Stats"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExperiment(exp.key)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Variants */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                        {exp.variants.map((variant) => (
                          <div
                            key={variant.key}
                            className="bg-white bg-gray-800 rounded p-3 border border-gray-200 border-gray-600"
                          >
                            <p className="text-xs text-gray-600 text-gray-400 mb-1">
                              {variant.name}
                            </p>
                            <p className="text-lg font-bold text-gray-900 text-white">
                              {variant.percentage}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Stats Modal */}
        {selectedExperiment && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 text-white">
                  {selectedExperiment.name} - Statistics
                </h3>
                <button
                  onClick={() => setSelectedExperiment(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 text-gray-400 mb-1">Status</p>
                  <p className="text-xl font-bold text-gray-900 text-white">
                    {selectedExperiment.status}
                  </p>
                </div>
                <div className="bg-gray-50 bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 text-gray-400 mb-1">Participants</p>
                  <p className="text-xl font-bold text-gray-900 text-white">
                    {selectedExperiment.participants}
                  </p>
                </div>
                <div className="bg-gray-50 bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 text-gray-400 mb-1">Variants</p>
                  <p className="text-xl font-bold text-gray-900 text-white">
                    {selectedExperiment.variants.length}
                  </p>
                </div>
                <div className="bg-gray-50 bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 text-gray-400 mb-1">Duration</p>
                  <p className="text-xl font-bold text-gray-900 text-white">
                    {selectedExperiment.startDate
                      ? `${Math.floor(
                          (Date.now() - selectedExperiment.startDate) / (1000 * 60 * 60 * 24)
                        )}d`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Metrics per Variant */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 text-white">
                  Metrics per Variant
                </h4>
                {Object.entries(selectedExperiment.metrics).map(([variantKey, metrics]) => {
                  const variant = selectedExperiment.variants.find((v) => v.key === variantKey);
                  return (
                    <div key={variantKey} className="bg-gray-50 bg-gray-700/50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 text-white mb-3">
                        {variant?.name || variantKey}
                      </h5>
                      {Object.keys(metrics).length === 0 ? (
                        <p className="text-sm text-gray-600 text-gray-400">No events yet</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(metrics).map(([eventName, count]) => (
                            <div key={eventName} className="bg-white bg-gray-800 rounded p-3">
                              <p className="text-xs text-gray-600 text-gray-400 mb-1">
                                {eventName}
                              </p>
                              <p className="text-lg font-bold text-gray-900 text-white">
                                {count}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentDashboard;


