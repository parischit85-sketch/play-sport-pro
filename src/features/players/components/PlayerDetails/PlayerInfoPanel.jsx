import React from 'react';
import PropTypes from 'prop-types';

/**
 * PlayerInfoPanel - Right side info panel (desktop only)
 * Displays quick stats, alerts, and recent activity
 */
const PlayerInfoPanel = ({ player, T }) => {
  // Calculate quick stats
  const stats = {
    rankingTrend: player.rankingDelta || 0,
    bookingsThisMonth: player.bookingHistory?.filter(b => {
      const bookingDate = new Date(b.date);
      const now = new Date();
      return bookingDate.getMonth() === now.getMonth() && 
             bookingDate.getFullYear() === now.getFullYear();
    }).length || 0,
    walletBalance: player.wallet?.balance || 0,
    certificateStatus: player.medicalCertificate?.status || 'missing',
    certificateExpiry: player.medicalCertificate?.expiryDate || null,
    lastActivity: player.lastActivity || null,
    tournamentActive: player.tournamentData?.isParticipant || false,
    winRate: player.stats?.winRate || 0,
    totalMatches: player.stats?.totalMatches || 0,
  };

  // Check for alerts
  const alerts = [];
  
  // Certificate expiring soon (30 days)
  if (stats.certificateExpiry) {
    const daysUntilExpiry = Math.floor((new Date(stats.certificateExpiry) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 30 && daysUntilExpiry > 0) {
      alerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Certificato in scadenza',
        description: `Scade tra ${daysUntilExpiry} giorni`,
      });
    } else if (daysUntilExpiry <= 0) {
      alerts.push({
        type: 'error',
        icon: '❌',
        title: 'Certificato scaduto',
        description: 'Rinnova subito',
      });
    }
  } else {
    alerts.push({
      type: 'error',
      icon: '📄',
      title: 'Certificato mancante',
      description: 'Carica il certificato medico',
    });
  }

  // Low wallet balance
  if (stats.walletBalance < 10) {
    alerts.push({
      type: 'info',
      icon: '💰',
      title: 'Saldo basso',
      description: `Solo €${stats.walletBalance.toFixed(2)} disponibili`,
    });
  }

  // No recent activity (30 days)
  if (stats.lastActivity) {
    const daysSinceActivity = Math.floor((new Date() - new Date(stats.lastActivity)) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity > 30) {
      alerts.push({
        type: 'info',
        icon: '🔕',
        title: 'Inattivo',
        description: `Ultima attività ${daysSinceActivity} giorni fa`,
      });
    }
  }

  // Format date helper
  const formatDate = (date) => {
    if (!date) return 'N/D';
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Recent activity (last 5 items)
  const recentActivity = [
    ...(player.bookingHistory || []).slice(0, 3).map(b => ({
      type: 'booking',
      icon: '📅',
      title: 'Prenotazione',
      description: `Campo ${b.fieldName || 'N/D'}`,
      date: b.date,
    })),
    ...(player.wallet?.transactions || []).slice(0, 2).map(t => ({
      type: 'transaction',
      icon: t.type === 'credit' ? '💵' : '💸',
      title: t.type === 'credit' ? 'Ricarica' : 'Pagamento',
      description: `€${Math.abs(t.amount).toFixed(2)}`,
      date: t.date,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <aside className="hidden xl:block w-80 flex-shrink-0 border-l border-gray-700 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
      <div className="sticky top-0 p-6 space-y-6 max-h-screen overflow-y-auto">
        
        {/* Quick Stats Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <span className="text-lg">📊</span>
            Statistiche Rapide
          </h3>
          
          {/* Ranking Trend */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                <div>
                  <div className="text-xs text-gray-400">Ranking</div>
                  <div className="text-lg font-bold text-white">
                    {player.rating || 1500}
                  </div>
                </div>
              </div>
              <div className={`text-sm font-bold px-2 py-1 rounded-lg ${
                stats.rankingTrend > 0 
                  ? `bg-green-900/30 ${T.accentSuccess}`
                  : stats.rankingTrend < 0
                  ? `bg-red-900/30 text-red-400`
                  : `bg-gray-700 ${T.subtext}`
              }`}>
                {stats.rankingTrend > 0 ? '↗' : stats.rankingTrend < 0 ? '↘' : '→'} 
                {Math.abs(stats.rankingTrend)}
              </div>
            </div>
            
            {/* Mini trend line (visual) */}
            <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  stats.rankingTrend > 0 
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${Math.min(Math.abs(stats.rankingTrend) * 2, 100)}%` }}
              />
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                  <div className="text-lg font-bold text-white">
                    {stats.winRate.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {stats.totalMatches} match
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.winRate}%` }}
              />
            </div>
          </div>

          {/* Bookings This Month */}
          <div className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-xs text-gray-400">Prenotazioni mese</div>
                  <div className="text-lg font-bold text-white">
                    {stats.bookingsThisMonth}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span className="text-lg">🔔</span>
              Avvisi
            </h3>
            
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`rounded-xl p-3 border-l-4 ${
                    alert.type === 'error' 
                      ? 'bg-red-50 bg-red-900/20 border-red-500'
                      : alert.type === 'warning'
                      ? 'bg-yellow-50 bg-yellow-900/20 border-yellow-500'
                      : 'bg-blue-50 bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{alert.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white">
                        {alert.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {alert.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Timeline */}
        {recentActivity.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span className="text-lg">🕐</span>
              Attività Recenti
            </h3>
            
            <div className="space-y-2">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-white truncate">
                          {activity.title}
                        </div>
                        <div className="text-xs text-gray-400 flex-shrink-0">
                          {formatDate(activity.date)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        {activity.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tournament Status (if participating) */}
        {stats.tournamentActive && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span className="text-lg">🏆</span>
              Torneo
            </h3>
            
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl p-4 border border-purple-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-purple-900 text-purple-200">
                  Partecipante Attivo
                </span>
              </div>
              <div className={`text-xs ${T.subtext}`}>
                {player.tournamentData?.tournamentName || 'Torneo in corso'}
              </div>
              {player.tournamentData?.ranking && (
                <div className={`mt-2 text-xs ${T.accentInfo}`}>
                  Posizione: <span className="font-bold">#{player.tournamentData.ranking}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-700">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-shadow">
            📊 Vedi Statistiche Complete
          </button>
          <button className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-xs font-semibold hover:shadow-md transition-shadow">
            📧 Invia Comunicazione
          </button>
        </div>

        {/* Footer Info */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Membro dal:</span>
              <span className="font-medium">{formatDate(player.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ultima modifica:</span>
              <span className="font-medium">{formatDate(player.updatedAt)}</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

PlayerInfoPanel.propTypes = {
  player: PropTypes.object.isRequired,
  T: PropTypes.object.isRequired,
};

export default PlayerInfoPanel;




