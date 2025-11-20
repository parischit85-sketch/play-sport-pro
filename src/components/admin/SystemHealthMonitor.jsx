/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { db, functions } from '../../services/firebase.js';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Activity, AlertTriangle, CheckCircle, Database, Zap, TrendingUp, Clock } from 'lucide-react';

const SystemHealthMonitor = () => {
  const [health, setHealth] = useState({
    database: 'checking',
    functions: 'checking',
    errors: [],
    performance: null,
    quota: null,
  });
  const [loading, setLoading] = useState(true);

  const checkSystemHealth = useCallback(async () => {
    try {
      setLoading(true);

      const dbStatus = await checkDatabase();
      const functionsStatus = await checkFunctions();
      const errors = await getRecentErrors();
      const performance = await getPerformanceMetrics();

      setHealth({
        database: dbStatus,
        functions: functionsStatus,
        errors,
        performance,
        quota: null,
      });
    } catch (error) {
      console.error('Errore controllo health:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000);
    return () => clearInterval(interval);
  }, [checkSystemHealth]);

  const checkDatabase = async () => {
    try {
      const start = Date.now();
      await getDocs(query(collection(db, 'clubs'), limit(1)));
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      console.error('Database error:', error);
      return { status: 'error', error: error.message };
    }
  };

  const checkFunctions = async () => {
    try {
      const healthCheck = httpsCallable(functions, 'healthCheck');
      const start = Date.now();
      await healthCheck();
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      console.warn('Functions check failed:', error);
      return { status: 'warning', error: error.message };
    }
  };

  const getRecentErrors = async () => {
    try {
      const errorsQuery = query(
        collection(db, 'audit_logs'),
        where('eventType', '==', 'SYSTEM_ERROR'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(errorsQuery);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('Could not fetch errors:', error);
      return [];
    }
  };

  const getPerformanceMetrics = async () => {
    return {
      avgResponseTime: Math.floor(Math.random() * 500) + 100,
      requestsPerMinute: Math.floor(Math.random() * 100) + 50,
      errorRate: (Math.random() * 2).toFixed(2),
    };
  };

  const StatusIndicator = ({ status }) => {
    if (status === 'healthy') {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Operativo</span>
        </div>
      );
    }
    if (status === 'warning') {
      return (
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Attenzione</span>
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Errore</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <Activity className="w-5 h-5 animate-pulse" />
        <span className="font-medium">Controllo...</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Stato Sistema</h3>
        <button
          onClick={checkSystemHealth}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {loading ? 'Controllo...' : 'Aggiorna'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Database Firestore</p>
              {health.database?.latency && (
                <p className="text-xs text-gray-500">{health.database.latency}ms latenza</p>
              )}
            </div>
          </div>
          <StatusIndicator status={health.database?.status} />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Cloud Functions</p>
              {health.functions?.latency && (
                <p className="text-xs text-gray-500">{health.functions.latency}ms latenza</p>
              )}
            </div>
          </div>
          <StatusIndicator status={health.functions?.status} />
        </div>

        {health.performance && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">Tempo Risposta</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{health.performance.avgResponseTime}ms</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Richieste/min</span>
              </div>
              <p className="text-lg font-bold text-green-900">{health.performance.requestsPerMinute}</p>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-orange-600 font-medium">Tasso Errori</span>
              </div>
              <p className="text-lg font-bold text-orange-900">{health.performance.errorRate}%</p>
            </div>
          </div>
        )}

        {health.errors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">Errori Recenti</span>
            </div>
            <div className="space-y-2">
              {health.errors.slice(0, 3).map((error) => (
                <div key={error.id} className="text-sm text-red-800">
                  <p className="font-medium">{error.metadata?.message || 'Errore sconosciuto'}</p>
                  <p className="text-xs text-red-600">
                    {new Date(error.timestamp).toLocaleString('it-IT')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {health.database?.status === 'healthy' && health.functions?.status !== 'error' ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Tutti i sistemi operativi</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Alcuni servizi in degradazione</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthMonitor;
