// =============================================
// FILE: src/features/admin/PerformanceMonitor.jsx
// Performance Monitoring Dashboard - CHK-301
// =============================================
import React, { useState, useEffect, useMemo } from 'react';

// ============================================
// PERFORMANCE METRICS COLLECTOR
// ============================================

class PerformanceCollector {
  constructor() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      errors: [],
      firestoreReads: [],
      firestoreWrites: [],
    };
    
    this.budgets = {
      pageLoadTime: 3000, // 3s max
      apiCallTime: 1000, // 1s max
      firestoreReadsPerDay: 50000, // Firestore free tier
      firestoreWritesPerDay: 20000,
      bundleSize: 512000, // 500KB gzipped
    };
    
    this.startTime = Date.now();
    this.initPerformanceObserver();
  }

  initPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordPageLoad({
              url: entry.name,
              loadTime: entry.loadEventEnd - entry.fetchStart,
              domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
              firstPaint: entry.responseEnd - entry.fetchStart,
              timestamp: Date.now(),
            });
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing (API calls, assets)
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            this.recordApiCall({
              url: entry.name,
              duration: entry.duration,
              size: entry.transferSize || 0,
              timestamp: Date.now(),
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  recordPageLoad(data) {
    this.metrics.pageLoads.push(data);
    this.trimMetrics('pageLoads');
    this.persist();
  }

  recordApiCall(data) {
    this.metrics.apiCalls.push(data);
    this.trimMetrics('apiCalls');
    this.persist();
  }

  recordError(error, context = {}) {
    this.metrics.errors.push({
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: Date.now(),
    });
    this.trimMetrics('errors');
    this.persist();
  }

  recordFirestoreRead(count = 1, collection = 'unknown') {
    this.metrics.firestoreReads.push({
      count,
      collection,
      timestamp: Date.now(),
    });
    this.trimMetrics('firestoreReads');
    this.persist();
  }

  recordFirestoreWrite(count = 1, collection = 'unknown') {
    this.metrics.firestoreWrites.push({
      count,
      collection,
      timestamp: Date.now(),
    });
    this.trimMetrics('firestoreWrites');
    this.persist();
  }

  trimMetrics(type, maxItems = 1000) {
    // Keep only recent metrics to prevent memory bloat
    if (this.metrics[type].length > maxItems) {
      this.metrics[type] = this.metrics[type].slice(-maxItems);
    }
  }

  persist() {
    try {
      // Store metrics in localStorage (last 24h only)
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recentMetrics = {
        pageLoads: this.metrics.pageLoads.filter(m => m.timestamp > oneDayAgo),
        apiCalls: this.metrics.apiCalls.filter(m => m.timestamp > oneDayAgo),
        errors: this.metrics.errors.filter(m => m.timestamp > oneDayAgo),
        firestoreReads: this.metrics.firestoreReads.filter(m => m.timestamp > oneDayAgo),
        firestoreWrites: this.metrics.firestoreWrites.filter(m => m.timestamp > oneDayAgo),
      };
      
      localStorage.setItem('performance_metrics_v1', JSON.stringify(recentMetrics));
    } catch (error) {
      console.warn('Failed to persist metrics:', error);
    }
  }

  load() {
    try {
      const stored = localStorage.getItem('performance_metrics_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.metrics = {
          pageLoads: parsed.pageLoads || [],
          apiCalls: parsed.apiCalls || [],
          errors: parsed.errors || [],
          firestoreReads: parsed.firestoreReads || [],
          firestoreWrites: parsed.firestoreWrites || [],
        };
      }
    } catch (error) {
      console.warn('Failed to load metrics:', error);
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getBudgets() {
    return { ...this.budgets };
  }

  setBudget(key, value) {
    this.budgets[key] = value;
    this.persist();
  }

  calculateStats(timeRange = '24h') {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    const cutoff = now - (ranges[timeRange] || ranges['24h']);

    const recentPageLoads = this.metrics.pageLoads.filter(m => m.timestamp > cutoff);
    const recentApiCalls = this.metrics.apiCalls.filter(m => m.timestamp > cutoff);
    const recentErrors = this.metrics.errors.filter(m => m.timestamp > cutoff);
    const recentReads = this.metrics.firestoreReads.filter(m => m.timestamp > cutoff);
    const recentWrites = this.metrics.firestoreWrites.filter(m => m.timestamp > cutoff);

    return {
      pageLoads: {
        count: recentPageLoads.length,
        avgLoadTime: this.avg(recentPageLoads.map(m => m.loadTime)),
        p95LoadTime: this.percentile(recentPageLoads.map(m => m.loadTime), 95),
        budgetViolations: recentPageLoads.filter(m => m.loadTime > this.budgets.pageLoadTime).length,
      },
      apiCalls: {
        count: recentApiCalls.length,
        avgDuration: this.avg(recentApiCalls.map(m => m.duration)),
        p95Duration: this.percentile(recentApiCalls.map(m => m.duration), 95),
        totalSize: recentApiCalls.reduce((sum, m) => sum + m.size, 0),
      },
      errors: {
        count: recentErrors.length,
        errorRate: recentPageLoads.length > 0 ? (recentErrors.length / recentPageLoads.length) * 100 : 0,
        uniqueErrors: new Set(recentErrors.map(e => e.message)).size,
      },
      firestore: {
        reads: recentReads.reduce((sum, m) => sum + m.count, 0),
        writes: recentWrites.reduce((sum, m) => sum + m.count, 0),
        estimatedCost: this.calculateFirestoreCost(
          recentReads.reduce((sum, m) => sum + m.count, 0),
          recentWrites.reduce((sum, m) => sum + m.count, 0)
        ),
      },
    };
  }

  avg(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  calculateFirestoreCost(reads, writes) {
    // Firestore pricing (as of 2025):
    // Free tier: 50K reads, 20K writes, 1GB storage per day
    // Paid: $0.06 per 100K reads, $0.18 per 100K writes
    const freeReads = 50000;
    const freeWrites = 20000;
    
    const billableReads = Math.max(0, reads - freeReads);
    const billableWrites = Math.max(0, writes - freeWrites);
    
    const readCost = (billableReads / 100000) * 0.06;
    const writeCost = (billableWrites / 100000) * 0.18;
    
    return {
      total: readCost + writeCost,
      reads: readCost,
      writes: writeCost,
      withinFreeTier: reads <= freeReads && writes <= freeWrites,
    };
  }

  exportMetrics(format = 'json') {
    const data = {
      exportDate: new Date().toISOString(),
      budgets: this.budgets,
      metrics: this.metrics,
      stats: this.calculateStats('30d'),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      // Simple CSV export for page loads
      let csv = 'Timestamp,URL,Load Time (ms),DOM Content Loaded (ms)\n';
      this.metrics.pageLoads.forEach(m => {
        csv += `${new Date(m.timestamp).toISOString()},${m.url},${m.loadTime},${m.domContentLoaded}\n`;
      });
      return csv;
    }
    
    return '';
  }

  clear() {
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      errors: [],
      firestoreReads: [],
      firestoreWrites: [],
    };
    this.persist();
  }
}

// Global instance
export const performanceCollector = new PerformanceCollector();
performanceCollector.load();

// ============================================
// PERFORMANCE MONITOR COMPONENT
// ============================================

export function PerformanceMonitor({ isOpen, onClose, T }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh || !isOpen) return;
    
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, isOpen]);

  const stats = useMemo(() => {
    return performanceCollector.calculateStats(timeRange);
  }, [timeRange, refreshKey]);

  const budgets = performanceCollector.getBudgets();

  const handleExport = (format) => {
    const data = performanceCollector.exportMetrics(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('Sei sicuro di voler cancellare tutti i dati di performance?')) {
      performanceCollector.clear();
      setRefreshKey(k => k + 1);
    }
  };

  if (!isOpen) return null;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatMs = (ms) => {
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📊 Performance Monitor
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Real-time application performance metrics & budget tracking
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Auto-refresh (5s)</span>
            </label>

            <button
              onClick={() => handleExport('json')}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              📥 Export JSON
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              📄 Export CSV
            </button>

            <button
              onClick={handleClear}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              🗑️ Clear Data
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Page Load Performance */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">Page Loads</h3>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats.pageLoads.count}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Avg: {formatMs(stats.pageLoads.avgLoadTime)}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                P95: {formatMs(stats.pageLoads.p95LoadTime)}
              </div>
              {stats.pageLoads.budgetViolations > 0 && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">
                  ⚠️ {stats.pageLoads.budgetViolations} budget violations
                </div>
              )}
            </div>

            {/* API Calls */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-900 dark:text-green-300">API Calls</h3>
                <span className="text-2xl">🌐</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {stats.apiCalls.count}
              </div>
              <div className="text-sm text-green-700 dark:text-green-400 mt-1">
                Avg: {formatMs(stats.apiCalls.avgDuration)}
              </div>
              <div className="text-xs text-green-600 dark:text-green-500 mt-1">
                Data: {formatBytes(stats.apiCalls.totalSize)}
              </div>
            </div>

            {/* Errors */}
            <div className={`bg-gradient-to-br rounded-lg p-4 border ${
              stats.errors.count > 0 
                ? 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700' 
                : 'from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${stats.errors.count > 0 ? 'text-red-900 dark:text-red-300' : 'text-gray-900 dark:text-gray-300'}`}>
                  Errors
                </h3>
                <span className="text-2xl">{stats.errors.count > 0 ? '❌' : '✅'}</span>
              </div>
              <div className={`text-3xl font-bold ${stats.errors.count > 0 ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'}`}>
                {stats.errors.count}
              </div>
              <div className={`text-sm mt-1 ${stats.errors.count > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-400'}`}>
                Error Rate: {stats.errors.errorRate.toFixed(2)}%
              </div>
              <div className={`text-xs mt-1 ${stats.errors.count > 0 ? 'text-red-600 dark:text-red-500' : 'text-gray-600 dark:text-gray-500'}`}>
                Unique: {stats.errors.uniqueErrors}
              </div>
            </div>

            {/* Firestore Usage */}
            <div className={`bg-gradient-to-br rounded-lg p-4 border ${
              stats.firestore.estimatedCost.withinFreeTier
                ? 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700'
                : 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${stats.firestore.estimatedCost.withinFreeTier ? 'text-purple-900 dark:text-purple-300' : 'text-orange-900 dark:text-orange-300'}`}>
                  Firestore
                </h3>
                <span className="text-2xl">🔥</span>
              </div>
              <div className={`text-3xl font-bold ${stats.firestore.estimatedCost.withinFreeTier ? 'text-purple-900 dark:text-purple-100' : 'text-orange-900 dark:text-orange-100'}`}>
                ${stats.firestore.estimatedCost.total.toFixed(4)}
              </div>
              <div className={`text-sm mt-1 ${stats.firestore.estimatedCost.withinFreeTier ? 'text-purple-700 dark:text-purple-400' : 'text-orange-700 dark:text-orange-400'}`}>
                Reads: {stats.firestore.reads.toLocaleString()}
              </div>
              <div className={`text-xs mt-1 ${stats.firestore.estimatedCost.withinFreeTier ? 'text-purple-600 dark:text-purple-500' : 'text-orange-600 dark:text-orange-500'}`}>
                Writes: {stats.firestore.writes.toLocaleString()}
              </div>
              {!stats.firestore.estimatedCost.withinFreeTier && (
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-semibold">
                  ⚠️ Over free tier!
                </div>
              )}
            </div>
          </div>

          {/* Performance Budgets */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">📏 Performance Budgets</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={T.text}>Page Load Time</span>
                  <span className={stats.pageLoads.avgLoadTime > budgets.pageLoadTime ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {formatMs(stats.pageLoads.avgLoadTime)} / {formatMs(budgets.pageLoadTime)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${stats.pageLoads.avgLoadTime > budgets.pageLoadTime ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (stats.pageLoads.avgLoadTime / budgets.pageLoadTime) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={T.text}>Firestore Reads (Daily)</span>
                  <span className={stats.firestore.reads > budgets.firestoreReadsPerDay ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {stats.firestore.reads.toLocaleString()} / {budgets.firestoreReadsPerDay.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${stats.firestore.reads > budgets.firestoreReadsPerDay ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (stats.firestore.reads / budgets.firestoreReadsPerDay) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={T.text}>Firestore Writes (Daily)</span>
                  <span className={stats.firestore.writes > budgets.firestoreWritesPerDay ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {stats.firestore.writes.toLocaleString()} / {budgets.firestoreWritesPerDay.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${stats.firestore.writes > budgets.firestoreWritesPerDay ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (stats.firestore.writes / budgets.firestoreWritesPerDay) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()} {autoRefresh && '(Auto-refreshing every 5s)'}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              💡 Tip: Monitor these metrics to optimize performance and reduce Firestore costs
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceMonitor;
