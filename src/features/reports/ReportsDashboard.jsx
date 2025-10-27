/**
 * Reports Dashboard Component
 * Interfaccia per generazione e visualizzazione report
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign,
  Filter
} from 'lucide-react';
import { useReports } from '../services/reportService';

export default function ReportsDashboard({ clubId, clubName }) {
  const [reportType, setReportType] = useState('bookings');
  const [format, setFormat] = useState('excel');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { generateReport, loading, error } = useReports(clubId);

  const reportTypes = [
    {
      id: 'bookings',
      name: 'Prenotazioni',
      icon: Calendar,
      description: 'Report dettagliato prenotazioni',
      color: 'bg-blue-500'
    },
    {
      id: 'revenue',
      name: 'Fatturato',
      icon: DollarSign,
      description: 'Analisi entrate e pagamenti',
      color: 'bg-green-500'
    },
    {
      id: 'matches',
      name: 'Partite',
      icon: TrendingUp,
      description: 'Statistiche match competitivi',
      color: 'bg-purple-500'
    },
    {
      id: 'users',
      name: 'Utenti',
      icon: Users,
      description: 'Attività e engagement utenti',
      color: 'bg-orange-500'
    }
  ];

  const handleGenerate = async () => {
    const success = await generateReport(reportType, startDate, endDate, format);
    if (success) {
      // Opzionale: mostra notifica successo
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Report & Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Genera report personalizzati per {clubName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Type Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Tipo di Report
            </h2>
            
            <div className="space-y-2">
              {reportTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      reportType === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${type.color} p-2 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Formato Export</h2>
            
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 font-medium">Excel (.xlsx)</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                  disabled={reportType !== 'bookings'}
                />
                <span className="ml-3 font-medium">PDF (.pdf)</span>
                {reportType !== 'bookings' && (
                  <span className="ml-auto text-xs text-gray-500">
                    Solo per prenotazioni
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Range */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Periodo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Fine
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
              >
                Ultimi 7 giorni
              </button>
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
              >
                Ultimi 30 giorni
              </button>
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date(end.getFullYear(), end.getMonth(), 1);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
              >
                Questo mese
              </button>
              <button
                onClick={() => {
                  const end = new Date();
                  const start = new Date(end.getFullYear(), 0, 1);
                  setStartDate(start.toISOString().split('T')[0]);
                  setEndDate(end.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
              >
                Quest'anno
              </button>
            </div>
          </div>

          {/* Preview & Generate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Anteprima Report</h2>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                  <span className="font-semibold">
                    {reportTypes.find(t => t.id === reportType)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Formato:</span>
                  <span className="font-semibold uppercase">{format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Periodo:</span>
                  <span className="font-semibold">
                    {new Date(startDate).toLocaleDateString('it-IT')} - {new Date(endDate).toLocaleDateString('it-IT')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Giorni:</span>
                  <span className="font-semibold">
                    {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Genera e Scarica Report
                </>
              )}
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              ℹ️ Informazioni
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• I report vengono generati in tempo reale dai dati attuali</li>
              <li>• Excel include fogli multipli con statistiche dettagliate</li>
              <li>• PDF ottimizzato per stampa professionale</li>
              <li>• Puoi filtrare periodi personalizzati fino a 1 anno</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
