// =============================================
// FILE: src/components/debug/DatabaseDashboard.jsx
// DATABASE PERFORMANCE MONITORING DASHBOARD
// =============================================

import React, { useState, useEffect } from 'react';
import { DatabaseOptimizer, performanceMonitor } from '../../lib/databaseOptimization.js';
import { optimizedBookingService } from '../../services/optimizedBookingService.js';

const DatabaseDashboard = () => {
  const [metrics, setMetrics] = useState({
    cache: { hitRate: '0%', size: 0 },
    queries: [],
    batch: { batchesExecuted: 0, operationsExecuted: 0 },
    subscriptions: { activeSubscriptions: 0, totalMessages: 0 },
  });
  const [performanceReport, setPerformanceReport] = useState(null);
  const [indexSuggestions, setIndexSuggestions] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        cache: DatabaseOptimizer.getCacheStats(),
        queries: DatabaseOptimizer.getQueryStats(),
        batch: DatabaseOptimizer.getBatchStats(),
        subscriptions: DatabaseOptimizer.getSubscriptionStats(),
      });
      
      setPerformanceReport(performanceMonitor.getPerformanceReport());
      setIndexSuggestions(DatabaseOptimizer.getIndexSuggestions());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const clearCaches = () => {
    DatabaseOptimizer.clearCache();
    optimizedBookingService.clearAllCaches();
  };

  const toggleOfflineMode = async () => {
    try {
      if (metrics.subscriptions.connectionState === 'connected') {
        await DatabaseOptimizer.goOffline();
      } else {
        await DatabaseOptimizer.goOnline();
      }
    } catch (error) {
      console.error('Failed to toggle offline mode:', error);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors"
          title="Database Performance Dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Database Performance Dashboard</h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 px-4">
          <nav className="flex space-x-8">
            {['overview', 'cache', 'queries', 'subscriptions', 'recommendations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 text-sm font-medium">Cache Hit Rate</div>
                  <div className={`text-2xl font-bold ${getStatusColor(parseFloat(metrics.cache.hitRate), { good: 80, warning: 60 })}`}>
                    {metrics.cache.hitRate}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 text-sm font-medium">Active Subscriptions</div>
                  <div className="text-2xl font-bold text-green-700">
                    {metrics.subscriptions.activeSubscriptions}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-purple-600 text-sm font-medium">Network Requests</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {metrics.cache.metrics?.networkRequests || 0}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-orange-600 text-sm font-medium">Batch Operations</div>
                  <div className="text-2xl font-bold text-orange-700">
                    {metrics.batch.operationsExecuted}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={clearCaches}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Caches
                </button>
                <button
                  onClick={toggleOfflineMode}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    metrics.subscriptions.connectionState === 'connected'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {metrics.subscriptions.connectionState === 'connected' ? 'Go Offline' : 'Go Online'}
                </button>
              </div>

              {/* Performance Summary */}
              {performanceReport && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Performance Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Uptime</div>
                      <div className="font-medium">{formatTime(performanceReport.summary.uptime)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Queries</div>
                      <div className="font-medium">{performanceReport.summary.totalQueries}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cache' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cache Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 text-sm font-medium">Hit Rate</div>
                  <div className="text-xl font-bold text-blue-700">{metrics.cache.hitRate}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 text-sm font-medium">Total Hits</div>
                  <div className="text-xl font-bold text-green-700">{metrics.cache.totalHits}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-600 text-sm font-medium">Total Misses</div>
                  <div className="text-xl font-bold text-red-700">{metrics.cache.totalMisses}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Cache Details</h4>
                <div className="space-y-2 text-sm">
                  <div>Size: {metrics.cache.size} entries</div>
                  <div>Reads: {metrics.cache.metrics?.reads || 0}</div>
                  <div>Writes: {metrics.cache.metrics?.writes || 0}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Query Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Query</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slow Queries</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {metrics.queries.slice(0, 10).map((query, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">{query.query}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={query.avgTime > 1000 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {formatTime(query.avgTime)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">{query.count}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={query.slowQueries > 0 ? 'text-red-600' : 'text-green-600'}>
                            {query.slowQueries}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Real-time Subscriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 text-sm font-medium">Active Subscriptions</div>
                  <div className="text-xl font-bold text-blue-700">{metrics.subscriptions.activeSubscriptions}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 text-sm font-medium">Total Messages</div>
                  <div className="text-xl font-bold text-green-700">{metrics.subscriptions.totalMessages}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-purple-600 text-sm font-medium">Connection State</div>
                  <div className={`text-xl font-bold ${
                    metrics.subscriptions.connectionState === 'connected' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {metrics.subscriptions.connectionState}
                  </div>
                </div>
              </div>

              {metrics.subscriptions.subscriptionDetails && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Subscription Details</h4>
                  <div className="space-y-2">
                    {metrics.subscriptions.subscriptionDetails.map((sub, index) => (
                      <div key={index} className="text-sm border-b border-gray-200 pb-2">
                        <div className="font-medium">{sub.collection}</div>
                        <div className="text-gray-600">Age: {formatTime(sub.age)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Recommendations</h3>
              
              {performanceReport?.recommendations && performanceReport.recommendations.length > 0 && (
                <div className="space-y-3">
                  {performanceReport.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'high'
                          ? 'bg-red-50 border-red-400'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-50 border-yellow-400'
                          : 'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`text-sm font-medium ${
                          rec.priority === 'high'
                            ? 'text-red-800'
                            : rec.priority === 'medium'
                            ? 'text-yellow-800'
                            : 'text-blue-800'
                        }`}>
                          {rec.type.toUpperCase()} - {rec.priority.toUpperCase()}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-gray-700">{rec.message}</div>
                    </div>
                  ))}
                </div>
              )}

              {indexSuggestions.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Index Suggestions</h4>
                  <div className="space-y-3">
                    {indexSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-sm">Collection: {suggestion.collection}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Execution Time: {formatTime(suggestion.executionTime)}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-700">Suggestions:</div>
                          <ul className="text-xs text-gray-600 mt-1 ml-4">
                            {suggestion.suggestions.map((sug, i) => (
                              <li key={i} className="list-disc">{sug}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!performanceReport?.recommendations || performanceReport.recommendations.length === 0) && 
               indexSuggestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No performance issues detected. Great job!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseDashboard;