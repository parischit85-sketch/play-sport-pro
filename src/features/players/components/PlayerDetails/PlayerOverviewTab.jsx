import React from 'react';

const DEFAULT_RATING = 1500;

/**
 * PlayerOverviewTab - Vista overview giocatore (READ MODE)
 */
const PlayerOverviewTab = ({ player, playerWithRealRating, T }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className={`${T.cardBg} ${T.border} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">
              {player.isActive ? '✅' : '⏸️'}
            </span>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              player.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {player.isActive ? 'ATTIVO' : 'INATTIVO'}
            </div>
          </div>
          <div className={`text-sm ${T.subtext} mb-1`}>Stato Account</div>
          <div className={`text-xs ${T.subtext}`}>
            Membro dal {formatDate(player.createdAt)}
          </div>
        </div>

        {/* Activity Card */}
        <div className={`${T.cardBg} ${T.border} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🕐</span>
            <div className="text-right">
              <div className={`text-xs ${T.subtext}`}>Ultima attività</div>
            </div>
          </div>
          <div className={`text-lg font-bold ${T.text}`}>
            {formatDate(player.lastActivity)}
          </div>
          <div className={`text-xs ${T.subtext} mt-1`}>
            {Math.floor((new Date() - new Date(player.lastActivity || Date.now())) / (1000 * 60 * 60 * 24))} giorni fa
          </div>
        </div>

        {/* Matches Card */}
        <div className={`${T.cardBg} ${T.border} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🎾</span>
            <div className={`px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`}>
              {player.matchHistory?.length || 0}
            </div>
          </div>
          <div className={`text-sm ${T.subtext} mb-1`}>Partite Totali</div>
          <div className={`text-xs ${T.subtext}`}>
            {player.stats?.winRate ? `${player.stats.winRate.toFixed(1)}% vittorie` : 'Nessun dato'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 shadow-lg`}>
          <h3 className={`text-lg font-bold ${T.text} mb-5 flex items-center gap-3`}>
            <span className="text-2xl">📧</span>
            Informazioni di Contatto
          </h3>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-xl flex-shrink-0">✉️</span>
              <div className="flex-1 min-w-0">
                <label className={`block text-xs font-semibold ${T.subtext} mb-1`}>Email</label>
                <div className={`${T.text} text-sm font-medium truncate`}>
                  {player.email || 'Non specificata'}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-xl flex-shrink-0">📱</span>
              <div className="flex-1 min-w-0">
                <label className={`block text-xs font-semibold ${T.subtext} mb-1`}>Telefono</label>
                <div className={`${T.text} text-sm font-medium`}>
                  {player.phone || 'Non specificato'}
                </div>
              </div>
            </div>

            {/* Birth Date */}
            {player.dateOfBirth && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="text-xl flex-shrink-0">🎂</span>
                <div className="flex-1 min-w-0">
                  <label className={`block text-xs font-semibold ${T.subtext} mb-1`}>Data di Nascita</label>
                  <div className={`${T.text} text-sm font-medium`}>
                    {formatDate(player.dateOfBirth)}
                    <span className={`ml-2 text-xs ${T.subtext}`}>
                      ({Math.floor((new Date() - new Date(player.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365))} anni)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            {player.address && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="text-xl flex-shrink-0">📍</span>
                <div className="flex-1 min-w-0">
                  <label className={`block text-xs font-semibold ${T.subtext} mb-1`}>Indirizzo</label>
                  <div className={`${T.text} text-sm font-medium`}>
                    {[
                      player.address.street,
                      player.address.city,
                      player.address.province,
                      player.address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Non specificato'}
                  </div>
                </div>
              </div>
            )}

            {/* Fiscal Code */}
            {player.fiscalCode && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="text-xl flex-shrink-0">🆔</span>
                <div className="flex-1 min-w-0">
                  <label className={`block text-xs font-semibold ${T.subtext} mb-1`}>Codice Fiscale</label>
                  <div className={`${T.text} text-sm font-medium font-mono`}>
                    {player.fiscalCode}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Dati sportivi */}
      <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 shadow-lg`}>
        <h3 className={`text-lg font-bold ${T.text} mb-5 flex items-center gap-3`}>
          <span className="text-2xl">🏃</span>
          Performance Sportiva
        </h3>

        {player.tournamentData?.isParticipant && player.tournamentData?.isActive ? (
          <div className="space-y-4">
            {/* Ranking Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Initial Ranking */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                <div className="text-xs font-semibold text-orange-900 dark:text-orange-200 mb-2">
                  🎯 Ranking Iniziale
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {player.tournamentData.initialRanking || DEFAULT_RATING}
                </div>
              </div>

              {/* Current Ranking */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                <div className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-2">
                  🏆 Ranking Attuale
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Number(playerWithRealRating.rating || DEFAULT_RATING).toFixed(0)}
                </div>
              </div>
            </div>

            {/* Progression */}
            <div className={`p-4 rounded-xl ${
              (playerWithRealRating.rating || 0) > (player.tournamentData.initialRanking || 0)
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700'
                : (playerWithRealRating.rating || 0) < (player.tournamentData.initialRanking || 0)
                ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-300 dark:border-red-700'
                : 'bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {(playerWithRealRating.rating || 0) > (player.tournamentData.initialRanking || 0) 
                      ? '📈' 
                      : (playerWithRealRating.rating || 0) < (player.tournamentData.initialRanking || 0)
                      ? '📉' 
                      : '➡️'}
                  </span>
                  <div>
                    <div className={`text-xs font-semibold ${T.subtext}`}>Progressione</div>
                    <div className={`text-2xl font-bold ${
                      (playerWithRealRating.rating || 0) > (player.tournamentData.initialRanking || 0)
                        ? 'text-green-600 dark:text-green-400'
                        : (playerWithRealRating.rating || 0) < (player.tournamentData.initialRanking || 0)
                        ? 'text-red-600 dark:text-red-400'
                        : T.text
                    }`}>
                      {(playerWithRealRating.rating || 0) - (player.tournamentData.initialRanking || 0) > 0 ? '+' : ''}
                      {(playerWithRealRating.rating || 0) - (player.tournamentData.initialRanking || 0)}
                    </div>
                  </div>
                </div>
                
                {/* Trend Arrow */}
                <div className={`text-4xl ${
                  (playerWithRealRating.rating || 0) > (player.tournamentData.initialRanking || 0)
                    ? 'text-green-600 dark:text-green-400'
                    : (playerWithRealRating.rating || 0) < (player.tournamentData.initialRanking || 0)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-400'
                }`}>
                  {(playerWithRealRating.rating || 0) > (player.tournamentData.initialRanking || 0) 
                    ? '↗' 
                    : (playerWithRealRating.rating || 0) < (player.tournamentData.initialRanking || 0)
                    ? '↘' 
                    : '→'}
                </div>
              </div>
            </div>

            {/* Tournament Badge */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                  Partecipante Attivo al Torneo
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <span className="text-4xl block mb-3">🏆</span>
            <span className={`text-sm font-semibold ${T.text}`}>
              Non partecipa al campionato
            </span>
            <p className={`text-xs ${T.subtext} mt-1`}>
              Il giocatore non è iscritto al torneo in corso
            </p>
          </div>
        )}
      </div>
    </div>

      {/* Tag e preferenze */}
      <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 shadow-lg lg:col-span-2`}>
        <h3 className={`text-lg font-bold ${T.text} mb-5 flex items-center gap-3`}>
          <span className="text-2xl">🏷️</span>
          Tag e Preferenze di Gioco
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags */}
          <div>
            <label className={`block text-sm font-bold ${T.text} mb-3 flex items-center gap-2`}>
              <span className="text-lg">🏷️</span>
              Tag
            </label>
            {player.tags && player.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {player.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="group px-4 py-2.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md border border-blue-200 dark:border-blue-700 transition-all hover:scale-105"
                  >
                    <span className="mr-1.5">•</span>
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <span className="text-3xl block mb-2">🏷️</span>
                <div className={`text-sm ${T.subtext} italic`}>
                  Nessun tag assegnato
                </div>
              </div>
            )}
          </div>

          {/* Preferenze */}
          <div>
            <label className={`block text-sm font-bold ${T.text} mb-3 flex items-center gap-2`}>
              <span className="text-lg">🎯</span>
              Preferenze
            </label>
            {player.playingPreferences && player.playingPreferences.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {player.playingPreferences.map((pref, index) => (
                  <span
                    key={index}
                    className="group px-4 py-2.5 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-green-700 dark:text-green-300 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md border border-green-200 dark:border-green-700 transition-all hover:scale-105"
                  >
                    <span className="mr-1.5">✓</span>
                    {pref}
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <span className="text-3xl block mb-2">🎯</span>
                <div className={`text-sm ${T.subtext} italic`}>
                  Nessuna preferenza impostata
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlayerOverviewTab);
