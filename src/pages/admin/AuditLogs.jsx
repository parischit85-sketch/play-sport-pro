/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase.js';
import { collection, query, orderBy, limit, getDocs, where, startAfter } from 'firebase/firestore';
import {
  Shield,
  Filter,
  Download,
  Search,
  User,
  Building2,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    userId: '',
    clubId: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize] = useState(50);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async (isLoadMore = false) => {
    try {
      setLoading(true);

      // Build query
      let q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(pageSize));

      // Apply filters
      if (filters.eventType) {
        q = query(q, where('eventType', '==', filters.eventType));
      }
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters.clubId) {
        q = query(q, where('metadata.clubId', '==', filters.clubId));
      }
      if (filters.startDate) {
        const startTimestamp = new Date(filters.startDate).getTime();
        q = query(q, where('timestamp', '>=', startTimestamp));
      }
      if (filters.endDate) {
        const endTimestamp = new Date(filters.endDate).getTime();
        q = query(q, where('timestamp', '<=', endTimestamp));
      }

      // Pagination
      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const logsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (isLoadMore) {
        setLogs((prev) => [...prev, ...logsData]);
      } else {
        setLogs(logsData);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (error) {
      console.error('Errore caricamento audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setLastDoc(null);
    setHasMore(true);
    loadAuditLogs();
  };

  const clearFilters = () => {
    setFilters({
      eventType: '',
      userId: '',
      clubId: '',
      startDate: '',
      endDate: '',
    });
    setLastDoc(null);
    setHasMore(true);
    loadAuditLogs();
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Event Type', 'User ID', 'User Email', 'Club ID', 'IP', 'Metadata'];
    const rows = logs.map((log) => [
      new Date(log.timestamp).toLocaleString('it-IT'),
      log.eventType,
      log.userId || '',
      log.userEmail || '',
      log.metadata?.clubId || '',
      log.ipAddress || '',
      JSON.stringify(log.metadata || {}),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEventIcon = (eventType) => {
    if (eventType?.includes('CLUB')) return <Building2 className="w-4 h-4" />;
    if (eventType?.includes('USER')) return <User className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getEventColor = (eventType) => {
    if (eventType?.includes('CREATE')) return 'text-green-600 bg-green-50';
    if (eventType?.includes('DELETE')) return 'text-red-600 bg-red-50';
    if (eventType?.includes('UPDATE') || eventType?.includes('ACTIVATE')) return 'text-blue-600 bg-blue-50';
    if (eventType?.includes('DEACTIVATE')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtri</span>
              </button>
              <button
                onClick={exportToCSV}
                disabled={logs.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Esporta CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Evento</label>
                <select
                  value={filters.eventType}
                  onChange={(e) => handleFilterChange('eventType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tutti</option>
                  <option value="CLUB_CREATE">Club Create</option>
                  <option value="CLUB_UPDATE">Club Update</option>
                  <option value="CLUB_DELETE">Club Delete</option>
                  <option value="CLUB_ACTIVATE">Club Activate</option>
                  <option value="CLUB_DEACTIVATE">Club Deactivate</option>
                  <option value="USER_ROLE_CHANGE">User Role Change</option>
                  <option value="USER_DELETE">User Delete</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club ID</label>
                <input
                  type="text"
                  value={filters.clubId}
                  onChange={(e) => handleFilterChange('clubId', e.target.value)}
                  placeholder="club-id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancella</span>
              </button>
              <button
                onClick={applyFilters}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Applica Filtri</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Caricamento logs...</span>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun log trovato</h3>
            <p className="text-gray-600">
              Non ci sono audit logs che corrispondono ai criteri di ricerca
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Club
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dettagli
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleString('it-IT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getEventColor(log.eventType)}`}>
                            {getEventIcon(log.eventType)}
                            <span className="text-xs font-medium">{log.eventType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-medium">{log.userEmail || 'N/A'}</span>
                            <span className="text-xs text-gray-500">{log.userId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.metadata?.clubId || log.metadata?.clubName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-800">Mostra</summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => loadAuditLogs(true)}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <span>Carica Altri</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AuditLogs;
