// =============================================
// FILE: src/features/players/components/CRMTools.jsx
// Strumenti CRM: esportazione CSV, operazioni bulk, analytics
// =============================================

import React, { useState } from 'react';

export default function CRMTools({ players, T, onBulkOperation, onRefreshData }) {
  const [exportSettings, setExportSettings] = useState({
    format: 'csv',
    includePersonalData: true,
    includeSportsData: true,
    includeWalletData: true,
    includeBookingHistory: false,
    includeNotes: false,
    dateRange: 'all',
  });

  const [bulkAction, setBulkAction] = useState({
    type: '',
    category: '',
    discount: 0,
    message: '',
    selectedPlayers: [],
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Calcola le statistiche CRM
  const calculateCRMStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const activeMembers = players.filter((p) => p.category === 'member').length;
    const totalWalletBalance = players.reduce((sum, p) => sum + (p.wallet?.balance || 0), 0);
    const newPlayersThisMonth = players.filter((p) => {
      const createdDate = new Date(p.createdAt || now);
      return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
    }).length;

    const avgWalletBalance = players.length > 0 ? totalWalletBalance / players.length : 0;

    // Calcola distribuzione per categoria
    const categoryDistribution = players.reduce((acc, player) => {
      acc[player.category] = (acc[player.category] || 0) + 1;
      return acc;
    }, {});

    // Calcola sport più popolari
    const sportsDistribution = players.reduce((acc, player) => {
      (player.sports || []).forEach((sport) => {
        acc[sport] = (acc[sport] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      totalPlayers: players.length,
      activeMembers,
      newPlayersThisMonth,
      totalWalletBalance,
      avgWalletBalance,
      categoryDistribution,
      sportsDistribution,
    };
  };

  const stats = calculateCRMStats();

  // Genera il CSV
  const generateCSV = () => {
    const headers = [];

    // Headers base
    if (exportSettings.includePersonalData) {
      headers.push('Nome', 'Cognome', 'Email', 'Telefono', 'Data Nascita', 'Categoria');
    }

    if (exportSettings.includeSportsData) {
      headers.push('Sport', 'Livello Padel', 'Livello Tennis', 'Posizione Preferita');
    }

    if (exportSettings.includeWalletData) {
      headers.push('Saldo Wallet', 'Totale Ricariche', 'Ultima Ricarica');
    }

    let csvContent = headers.join(',') + '\n';

    players.forEach((player) => {
      const row = [];

      if (exportSettings.includePersonalData) {
        row.push(
          `"${player.firstName || ''}"`,
          `"${player.lastName || ''}"`,
          `"${player.email || ''}"`,
          `"${player.phone || ''}"`,
          `"${player.dateOfBirth || ''}"`,
          `"${player.category || ''}"`
        );
      }

      if (exportSettings.includeSportsData) {
        row.push(
          `"${(player.sports || []).join(', ')}"`,
          `"${player.ratings?.padel || ''}"`,
          `"${player.ratings?.tennis || ''}"`,
          `"${player.preferredPosition || ''}"`
        );
      }

      if (exportSettings.includeWalletData) {
        row.push(
          `"${player.wallet?.balance || 0}"`,
          `"${player.wallet?.totalTopups || 0}"`,
          `"${player.wallet?.lastTopupDate || ''}"`
        );
      }

      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  };

  const downloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `giocatori_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
  };

  const executeBulkAction = () => {
    // Qui implementeremo le operazioni bulk
    console.log('Esecuzione bulk action:', bulkAction);

    if (onBulkOperation) {
      onBulkOperation(bulkAction);
    }

    setBulkAction({
      type: '',
      category: '',
      discount: 0,
      message: '',
      selectedPlayers: [],
    });
    setShowBulkModal(false);

    alert(
      `Operazione bulk "${bulkAction.type}" eseguita su ${bulkAction.selectedPlayers.length} giocatori!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Tools */}
      <div className="flex flex-col lg:flex-row gap-4">
        <button
          onClick={() => setShowExportModal(true)}
          className={`${T.btnPrimary} flex items-center gap-2 px-6 py-3`}
        >
          📊 Esporta Dati
        </button>

        <button
          onClick={() => setShowBulkModal(true)}
          className={`${T.btnSecondary} flex items-center gap-2 px-6 py-3`}
        >
          🔄 Operazioni Bulk
        </button>

        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className={`${T.btnSecondary} flex items-center gap-2 px-6 py-3`}
        >
          📈 Analytics
          {showAnalytics ? ' (Nascondi)' : ' (Mostra)'}
        </button>

        <button
          onClick={onRefreshData}
          className={`${T.btnSecondary} flex items-center gap-2 px-6 py-3`}
        >
          🔄 Aggiorna Dati
        </button>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-6`}>
          <h3 className={`text-lg font-bold ${T.text} mb-6 flex items-center gap-2`}>
            📈 Analytics CRM
          </h3>

          {/* Statistiche principali */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 bg-blue-900/20 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 text-blue-400">
                {stats.totalPlayers}
              </div>
              <div className="text-sm text-blue-700 text-blue-300">Giocatori Totali</div>
            </div>

            <div className="text-center p-4 bg-green-50 bg-green-900/20 rounded-xl">
              <div className="text-3xl font-bold text-green-600 text-green-400">
                {stats.activeMembers}
              </div>
              <div className="text-sm text-green-700 text-green-300">Membri Attivi</div>
            </div>

            <div className="text-center p-4 bg-purple-50 bg-purple-900/20 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 text-purple-400">
                {stats.newPlayersThisMonth}
              </div>
              <div className="text-sm text-purple-700 text-purple-300">Nuovi questo Mese</div>
            </div>

            <div className="text-center p-4 bg-orange-50 bg-orange-900/20 rounded-xl">
              <div className="text-3xl font-bold text-orange-600 text-orange-400">
                €{stats.totalWalletBalance.toFixed(0)}
              </div>
              <div className="text-sm text-orange-700 text-orange-300">Totale Wallet</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuzione per categoria */}
            <div>
              <h4 className={`font-semibold ${T.text} mb-3`}>Distribuzione per Categoria</h4>
              <div className="space-y-2">
                {Object.entries(stats.categoryDistribution).map(([category, count]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center p-2 rounded-lg bg-gray-800"
                  >
                    <span className={`capitalize ${T.text}`}>
                      {category === 'member' && '👑 Membri'}
                      {category === 'non_member' && '👤 Non Membri'}
                      {category === 'guest' && '🏃 Ospiti'}
                      {category === 'vip' && '⭐ VIP'}
                    </span>
                    <span className={`font-medium ${T.text}`}>
                      {count} ({((count / stats.totalPlayers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sport più popolari */}
            <div>
              <h4 className={`font-semibold ${T.text} mb-3`}>Sport più Popolari</h4>
              <div className="space-y-2">
                {Object.entries(stats.sportsDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([sport, count]) => (
                    <div
                      key={sport}
                      className="flex justify-between items-center p-2 rounded-lg bg-gray-800"
                    >
                      <span className={`capitalize ${T.text}`}>
                        {sport === 'padel' && '🎾 Padel'}
                        {sport === 'tennis' && '🎾 Tennis'}
                        {sport === 'calcetto' && '⚽ Calcetto'}
                        {sport === 'beach_volley' && '🏐 Beach Volley'}
                        {sport || '❓ Altro'}
                      </span>
                      <span className={`font-medium ${T.text}`}>{count} giocatori</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Saldo wallet medio */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 from-blue-900/20 to-purple-900/20 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 text-purple-400">
                €{stats.avgWalletBalance.toFixed(2)}
              </div>
              <div className="text-sm text-purple-700 text-purple-300">
                Saldo Wallet Medio per Giocatore
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <h4 className={`font-semibold ${T.text} mb-2`}>Esporta Lista</h4>
            <p className={`text-sm ${T.subtext} mb-4`}>
              Scarica i dati dei giocatori in formato CSV o Excel
            </p>
            <button onClick={() => setShowExportModal(true)} className={`${T.btnPrimary} w-full`}>
              Esporta Ora
            </button>
          </div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
          <div className="text-center">
            <div className="text-4xl mb-2">✉️</div>
            <h4 className={`font-semibold ${T.text} mb-2`}>Messaggio di Massa</h4>
            <p className={`text-sm ${T.subtext} mb-4`}>
              Invia comunicazioni a più giocatori contemporaneamente
            </p>
            <button
              onClick={() => {
                setBulkAction((prev) => ({ ...prev, type: 'message' }));
                setShowBulkModal(true);
              }}
              className={`${T.btnSecondary} w-full`}
            >
              Invia Messaggio
            </button>
          </div>
        </div>

        <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
          <div className="text-center">
            <div className="text-4xl mb-2">🏷️</div>
            <h4 className={`font-semibold ${T.text} mb-2`}>Gestione Categorie</h4>
            <p className={`text-sm ${T.subtext} mb-4`}>
              Modifica le categorie di più giocatori insieme
            </p>
            <button
              onClick={() => {
                setBulkAction((prev) => ({ ...prev, type: 'category' }));
                setShowBulkModal(true);
              }}
              className={`${T.btnSecondary} w-full`}
            >
              Modifica Categorie
            </button>
          </div>
        </div>
      </div>

      {/* Modal Esportazione */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${T.modalBg} rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden`}>
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${T.text}`}>📊 Esporta Dati Giocatori</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`${T.btnSecondary} px-4 py-2`}
                >
                  ✖️
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${T.text} mb-3`}>
                    Formato Esportazione
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={exportSettings.format === 'csv'}
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            format: e.target.value,
                          }))
                        }
                        className="text-blue-600"
                      />
                      <span className={T.text}>📋 CSV</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="format"
                        value="excel"
                        checked={exportSettings.format === 'excel'}
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            format: e.target.value,
                          }))
                        }
                        className="text-blue-600"
                      />
                      <span className={T.text}>📊 Excel</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${T.text} mb-3`}>
                    Dati da Includere
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={exportSettings.includePersonalData}
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            includePersonalData: e.target.checked,
                          }))
                        }
                        className="text-blue-600"
                      />
                      <span className={T.text}>👤 Dati Personali (Nome, Email, Telefono)</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={exportSettings.includeSportsData}
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            includeSportsData: e.target.checked,
                          }))
                        }
                        className="text-blue-600"
                      />
                      <span className={T.text}>🎾 Dati Sportivi (Sport, Livelli, Posizioni)</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={exportSettings.includeWalletData}
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            includeWalletData: e.target.checked,
                          }))
                        }
                        className="text-blue-600"
                      />
                      <span className={T.text}>💰 Dati Wallet (Saldo, Ricariche)</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={exportSettings.includeBookingHistory}
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            includeBookingHistory: e.target.checked,
                          }))
                        }
                        className="text-blue-600"
                      />
                      <span className={T.text}>📅 Storico Prenotazioni</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={exportSettings.includeNotes}
                        onChange={(e) =>
                          setExportSettings((prev) => ({
                            ...prev,
                            includeNotes: e.target.checked,
                          }))
                        }
                        className="text-blue-600"
                      />
                      <span className={T.text}>📝 Note e Commenti</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={downloadCSV} className={`${T.btnPrimary} flex-1`}>
                    📊 Scarica ({exportSettings.format.toUpperCase()})
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className={`${T.btnSecondary} px-6`}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Operazioni Bulk */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${T.modalBg} rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden`}>
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${T.text}`}>🔄 Operazioni Bulk</h3>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className={`${T.btnSecondary} px-4 py-2`}
                >
                  ✖️
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${T.text} mb-3`}>
                    Tipo Operazione
                  </label>
                  <select
                    value={bulkAction.type}
                    onChange={(e) =>
                      setBulkAction((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className={`${T.input} w-full`}
                  >
                    <option value="">Seleziona operazione</option>
                    <option value="category">🏷️ Modifica Categoria</option>
                    <option value="message">✉️ Messaggio di Massa</option>
                    <option value="discount">💰 Applica Sconto</option>
                    <option value="wallet_credit">💳 Ricarica Wallet</option>
                  </select>
                </div>

                {bulkAction.type === 'category' && (
                  <div>
                    <label className={`block text-sm font-medium ${T.text} mb-2`}>
                      Nuova Categoria
                    </label>
                    <select
                      value={bulkAction.category}
                      onChange={(e) =>
                        setBulkAction((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className={`${T.input} w-full`}
                    >
                      <option value="">Seleziona categoria</option>
                      <option value="member">👑 Membro</option>
                      <option value="non_member">👤 Non Membro</option>
                      <option value="guest">🏃 Ospite</option>
                      <option value="vip">⭐ VIP</option>
                    </select>
                  </div>
                )}

                {bulkAction.type === 'message' && (
                  <div>
                    <label className={`block text-sm font-medium ${T.text} mb-2`}>Messaggio</label>
                    <textarea
                      value={bulkAction.message}
                      onChange={(e) =>
                        setBulkAction((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Scrivi il messaggio da inviare a tutti i giocatori selezionati..."
                      rows={4}
                      className={`${T.input} w-full`}
                    />
                  </div>
                )}

                {(bulkAction.type === 'discount' || bulkAction.type === 'wallet_credit') && (
                  <div>
                    <label className={`block text-sm font-medium ${T.text} mb-2`}>
                      {bulkAction.type === 'discount' ? 'Percentuale Sconto' : 'Importo Ricarica'}{' '}
                      (€)
                    </label>
                    <input
                      type="number"
                      value={bulkAction.discount}
                      onChange={(e) =>
                        setBulkAction((prev) => ({
                          ...prev,
                          discount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder={bulkAction.type === 'discount' ? '10' : '20.00'}
                      className={`${T.input} w-full`}
                    />
                  </div>
                )}

                <div className={`p-4 ${T.border} rounded-xl`}>
                  <div className={`text-sm font-medium ${T.text} mb-2`}>
                    Giocatori Selezionati: {stats.totalPlayers}
                  </div>
                  <div className={`text-xs ${T.subtext}`}>
                    Tutti i giocatori verranno inclusi nell'operazione bulk. In futuro aggiungeremo
                    la selezione manuale.
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={executeBulkAction}
                    disabled={
                      !bulkAction.type ||
                      (bulkAction.type === 'category' && !bulkAction.category) ||
                      (bulkAction.type === 'message' && !bulkAction.message.trim())
                    }
                    className={`${T.btnPrimary} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    🚀 Esegui Operazione
                  </button>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className={`${T.btnSecondary} px-6`}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
