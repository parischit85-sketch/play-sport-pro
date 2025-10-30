// =============================================
// FILE: src/features/admin/CacheMonitor.jsx
// Cache Statistics Monitor - CHK-302
// =============================================
import React, { useState, useEffect } from 'react';
import { cacheManager } from '@lib/advancedCache';

export function CacheMonitor({ isOpen, onClose, T }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadStats = async () => {
      setLoading(true);
      const data = await cacheManager.getStats();
      setStats(data);
      setLoading(false);
    };

    loadStats();

    if (autoRefresh) {
      const interval = setInterval(loadStats, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh]);

  const handleClearCache = async (type) => {
    const confirmMessage =
      type === 'all' ? 'Vuoi cancellare tutta la cache?' : `Vuoi cancellare la cache di ${type}?`;

    if (!window.confirm(confirmMessage)) return;

    if (type === 'all') {
      await cacheManager.invalidate('all');
    } else {
      await cacheManager.invalidate(`collection:${type}`);
    }

    // Reload stats
    const data = await cacheManager.getStats();
    setStats(data);
  };

  const handleClearStats = () => {
    if (window.confirm('Vuoi resettare le statistiche?')) {
      cacheManager.clearStats();
      setStats({ ...stats, hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: '0.00' });
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 from-green-900/20 to-emerald-900/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-white flex items-center gap-2">
                💾 Cache Monitor
              </h2>
              <p className="text-sm text-gray-600 text-gray-400 mt-1">
                Multi-layer caching system statistics
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:text-gray-300 text-3xl"
            >
              ×
            </button>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <label className="flex items-center gap-2 px-3 py-2 bg-white bg-gray-700 border border-gray-300 border-gray-600 rounded-lg text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Auto-refresh (3s)</span>
            </label>

            <button
              onClick={() => handleClearCache('all')}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              🗑️ Clear All Cache
            </button>

            <button
              onClick={handleClearStats}
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              📊 Reset Stats
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className={T.text}>Loading cache statistics...</p>
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Hit Rate */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-200 border-green-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-900 text-green-300">Hit Rate</h3>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="text-3xl font-bold text-green-900 text-green-100">
                    {stats.hitRate}%
                  </div>
                  <div className="text-sm text-green-700 text-green-400 mt-1">
                    {stats.hits} hits / {stats.misses} misses
                  </div>
                </div>

                {/* Memory Cache */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-200 border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-900 text-blue-300">Memory</h3>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-900 text-blue-100">
                    {stats.memorySize}
                  </div>
                  <div className="text-sm text-blue-700 text-blue-400 mt-1">
                    {stats.memoryHits} hits
                  </div>
                </div>

                {/* IndexedDB Cache */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 from-purple-900/20 to-purple-800/20 rounded-lg p-4 border border-purple-200 border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-purple-900 text-purple-300">
                      IndexedDB
                    </h3>
                    <span className="text-2xl">💿</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-900 text-purple-100">
                    {stats.indexedDBSize}
                  </div>
                  <div className="text-sm text-purple-700 text-purple-400 mt-1">
                    {formatBytes(stats.indexedDBBytes)}
                  </div>
                </div>

                {/* Operations */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 from-orange-900/20 to-orange-800/20 rounded-lg p-4 border border-orange-200 border-orange-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-orange-900 text-orange-300">
                      Operations
                    </h3>
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div className="text-lg font-bold text-orange-900 text-orange-100">
                    {stats.sets} sets
                  </div>
                  <div className="text-sm text-orange-700 text-orange-400 mt-1">
                    {stats.deletes} deletes
                  </div>
                </div>
              </div>

              {/* Hit Rate Visualization */}
              <div className="bg-gray-50 bg-gray-900 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 text-white mb-3">
                  📊 Cache Performance
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={T.text}>Hit Rate</span>
                      <span
                        className={
                          parseFloat(stats.hitRate) > 70
                            ? 'text-green-600'
                            : parseFloat(stats.hitRate) > 40
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }
                      >
                        {stats.hitRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          parseFloat(stats.hitRate) > 70
                            ? 'bg-green-500'
                            : parseFloat(stats.hitRate) > 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${stats.hitRate}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-gray-400 mt-1">
                      Target: &gt;70% for optimal performance
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={T.text}>Memory Cache</span>
                      <span className="text-blue-600">
                        {stats.memoryHits} / {stats.hits} (
                        {stats.hits > 0 ? ((stats.memoryHits / stats.hits) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                          width: `${stats.hits > 0 ? (stats.memoryHits / stats.hits) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={T.text}>IndexedDB Cache</span>
                      <span className="text-purple-600">
                        {stats.indexedDBHits} / {stats.hits} (
                        {stats.hits > 0 ? ((stats.indexedDBHits / stats.hits) * 100).toFixed(1) : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all"
                        style={{
                          width: `${stats.hits > 0 ? (stats.indexedDBHits / stats.hits) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Collections Breakdown */}
              {stats.indexedDBCollections && Object.keys(stats.indexedDBCollections).length > 0 && (
                <div className="bg-gray-50 bg-gray-900 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 text-white mb-3">
                    📦 Cached Collections
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(stats.indexedDBCollections).map(([collection, data]) => (
                      <div
                        key={collection}
                        className="flex items-center justify-between p-3 bg-white bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-white capitalize">
                            {collection}
                          </div>
                          <div className="text-sm text-gray-600 text-gray-400">
                            {data.count} items • {formatBytes(data.size)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleClearCache(collection)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 bg-red-900/30 hover:bg-red-900/50 text-red-700 text-red-300 rounded text-sm font-medium transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 bg-blue-900/20 rounded-lg border border-blue-200 border-blue-700">
                <h4 className="font-semibold text-blue-900 text-blue-300 mb-2">
                  💡 Optimization Tips
                </h4>
                <ul className="text-sm text-blue-800 text-blue-400 space-y-1">
                  {parseFloat(stats.hitRate) < 70 && (
                    <li>
                      • Low hit rate ({stats.hitRate}%) - Consider increasing cache TTL or warming
                      critical data
                    </li>
                  )}
                  {stats.indexedDBSize > 1000 && (
                    <li>
                      • Large IndexedDB cache ({stats.indexedDBSize} items) - Consider periodic
                      cleanup
                    </li>
                  )}
                  {stats.memorySize < 20 && stats.hits > 100 && (
                    <li>
                      • Low memory cache usage - Consider increasing memoryMaxSize for better
                      performance
                    </li>
                  )}
                  {parseFloat(stats.hitRate) >= 70 && (
                    <li>✅ Excellent cache performance! Keep monitoring for consistency.</li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 border-gray-700 bg-gray-50 bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600 text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}{' '}
              {autoRefresh && '(Auto-refreshing every 3s)'}
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

export default CacheMonitor;

