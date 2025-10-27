/**
 * Performance Dashboard Component
 * Real-time performance monitoring and metrics display
 */

import React, { useState, useEffect } from 'react';
import {
  getPerformanceData,
  getPerformanceSummary,
  trackServiceWorkerMetrics,
} from '../../lib/web-vitals';
import { Activity, Zap, Globe, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react';

const PerformanceDashboard = ({ T }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [serviceWorkerMetrics, setServiceWorkerMetrics] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (isVisible) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isVisible]);

  const updateMetrics = async () => {
    try {
      const data = getPerformanceSummary();
      setPerformanceData(data);

      // Get Service Worker metrics
      await trackServiceWorkerMetrics();
      getServiceWorkerMetrics();
    } catch (error) {
      console.error('Error updating performance metrics:', error);
    }
  };

  const getServiceWorkerMetrics = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'PERFORMANCE_METRICS') {
          setServiceWorkerMetrics(event.data.data);
        }
      };

      navigator.serviceWorker.controller.postMessage({ type: 'GET_PERFORMANCE_METRICS' }, [
        messageChannel.port2,
      ]);
    }
  };

  const getVitalRating = (metric, value) => {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    if (value > threshold.poor) return 'poor';
    if (value > threshold.good) return 'needs-improvement';
    return 'good';
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'poor':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 ${T.btnSecondary} rounded-full p-3 shadow-lg z-50`}
        title="Apri Performance Dashboard"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`${T.cardBg} ${T.border} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold">Performance Dashboard</h2>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className={`${T.btnGhost} rounded-lg px-3 py-2`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Web Vitals */}
          {performanceData?.vitals && Object.keys(performanceData.vitals).length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Core Web Vitals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(performanceData.vitals).map(([metric, data]) => {
                  const rating = getVitalRating(metric, data.value);
                  const colorClass = getRatingColor(rating);

                  return (
                    <div key={metric} className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{metric}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
                        >
                          {rating.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {metric === 'CLS' ? data.value.toFixed(3) : formatDuration(data.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Service Worker Metrics */}
          {serviceWorkerMetrics && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" />
                Service Worker Cache
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Cache Hit Ratio</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {(serviceWorkerMetrics.cacheHitRatio * 100).toFixed(1)}%
                  </div>
                </div>

                <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Network Requests</span>
                  </div>
                  <div className="text-2xl font-bold">{serviceWorkerMetrics.networkRequests}</div>
                </div>

                <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Offline Requests</span>
                  </div>
                  <div className="text-2xl font-bold">{serviceWorkerMetrics.offlineRequests}</div>
                </div>

                <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Runtime</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(serviceWorkerMetrics.runtime / (1000 * 60))}m
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Metrics */}
          {performanceData?.custom && Object.keys(performanceData.custom).length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Custom Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(performanceData.custom).map(([metric, value]) => (
                  <div key={metric} className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                    <div className="font-medium mb-2 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xl font-bold">{formatDuration(value)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resource Performance */}
          {performanceData?.resources && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Resource Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                  <div className="font-medium mb-2">Total Resources</div>
                  <div className="text-2xl font-bold">{performanceData.resources.total}</div>
                </div>

                <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                  <div className="font-medium mb-2">Slow Resources</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {performanceData.resources.slow_count}
                  </div>
                </div>

                <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                  <div className="font-medium mb-2">Total Size</div>
                  <div className="text-2xl font-bold">
                    {formatSize(performanceData.resources.total_size)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Summary */}
          {performanceData?.errors && performanceData.errors.count > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Error Impact
              </h3>
              <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Total Errors</span>
                  <span className="text-2xl font-bold text-red-600">
                    {performanceData.errors.count}
                  </span>
                </div>

                {performanceData.errors.recent.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Recent Errors:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {performanceData.errors.recent.map((error, index) => (
                        <div
                          key={index}
                          className="text-xs text-gray-600 dark:text-gray-400 truncate"
                        >
                          {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connection Info */}
          {performanceData?.connection && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Connection Info
              </h3>
              <div className={`${T.cardBg} ${T.border} rounded-lg p-4`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="font-medium mb-1">Type</div>
                    <div className="text-lg">{performanceData.connection.effective_type}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Downlink</div>
                    <div className="text-lg">{performanceData.connection.downlink} Mbps</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">RTT</div>
                    <div className="text-lg">{performanceData.connection.rtt}ms</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={updateMetrics} className={`${T.btnSecondary} flex items-center gap-2`}>
              <Activity className="w-4 h-4" />
              Aggiorna Metriche
            </button>

            <button
              onClick={() => {
                const data = JSON.stringify(performanceData, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-report-${new Date().toISOString()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className={`${T.btnSecondary} flex items-center gap-2`}
            >
              📊 Esporta Report
            </button>

            <button
              onClick={() => {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  const messageChannel = new MessageChannel();
                  messageChannel.port1.onmessage = (event) => {
                    if (event.data.type === 'CACHE_CLEARED') {
                      alert('Cache pulita con successo!');
                      updateMetrics();
                    }
                  };
                  navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' }, [
                    messageChannel.port2,
                  ]);
                }
              }}
              className={`${T.btnSecondary} flex items-center gap-2 text-red-600`}
            >
              🗑️ Pulisci Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
