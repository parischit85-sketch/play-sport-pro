import React from 'react';
import { Calendar, MapPin, Trophy, Flame } from 'lucide-react';
import { DS_ANIMATIONS } from '@lib/design-system.js';

/**
 * PublicMatchCard - Card ampia per visualizzazione pubblica partite
 * Layout orizzontale ottimizzato per modalità "solo partite"
 */
function PublicMatchCard({ match, teams }) {
  // Trova le squadre
  const team1 = teams?.find((t) => t.id === match.team1Id);
  const team2 = teams?.find((t) => t.id === match.team2Id);

  // Calcola i punteggi dai set se non sono presenti team1Score/team2Score
  const calculateScoresFromSets = () => {
    if (!match.sets || match.sets.length === 0) {
      // Debug: verifica perché non ci sono set
      if (match.status === 'completed') {
        console.log('⚠️ Partita completata senza set:', {
          matchId: match.id,
          team1Score: match.team1Score,
          team2Score: match.team2Score,
          sets: match.sets,
          allMatchData: match,
        });
      }
      return {
        team1Score: match.team1Score || 0,
        team2Score: match.team2Score || 0,
      };
    }

    // Se ci sono già i punteggi, usali
    if (match.team1Score !== undefined && match.team2Score !== undefined) {
      return {
        team1Score: match.team1Score,
        team2Score: match.team2Score,
      };
    }

    // Altrimenti calcola dal numero di set vinti
    let team1Sets = 0;
    let team2Sets = 0;

    match.sets.forEach((set) => {
      // I set possono avere nomi diversi: team1/team2 oppure team1Score/team2Score
      const score1 = Number(set.team1Score || set.team1) || 0;
      const score2 = Number(set.team2Score || set.team2) || 0;
      
      if (score1 > score2) {
        team1Sets++;
      } else if (score2 > score1) {
        team2Sets++;
      }
    });

    return {
      team1Score: team1Sets,
      team2Score: team2Sets,
    };
  };

  const scores = calculateScoresFromSets();

  // Determina lo stato e i colori
  const getStatusConfig = () => {
    switch (match.status) {
      case 'completed':
        return {
          label: 'COMPLETATA',
          bgColor: 'bg-emerald-900/30',
          borderColor: 'border-emerald-600',
          accentColor: 'text-emerald-400',
          icon: Trophy,
        };
      case 'in_progress':
        return {
          label: 'LIVE',
          bgColor: 'bg-gray-800/50',
          borderColor: 'border-red-500',
          accentColor: 'text-red-400',
          icon: Flame,
        };
      case 'scheduled':
        return {
          label: 'PROGRAMMATA',
          bgColor: 'bg-gray-800/50',
          borderColor: 'border-gray-600',
          accentColor: 'text-gray-400',
          icon: Calendar,
        };
      default:
        return {
          label: 'DA PROGRAMMARE',
          bgColor: 'bg-gray-800/30',
          borderColor: 'border-gray-700',
          accentColor: 'text-gray-500',
          icon: Calendar,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Formatta data/ora - gestisce sia stringhe che Timestamp di Firestore
  const formatDateTime = (dateValue) => {
    if (!dateValue) return null;
    
    let date;
    // Se è un Timestamp di Firestore (ha il metodo toDate o la proprietà seconds)
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    } else if (dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      // Altrimenti tratta come stringa/numero
      date = new Date(dateValue);
    }
    
    // Verifica che la data sia valida
    if (isNaN(date.getTime())) return null;
    
    return {
      date: date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
      time: date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const dateTime = match.scheduledDate ? formatDateTime(match.scheduledDate) : null;

  // Determina il vincitore
  const getWinnerStyle = (teamId) => {
    if (match.status !== 'completed') return '';
    if (match.winnerId === teamId) return 'ring-2 ring-emerald-500 bg-emerald-900/20';
    return 'opacity-70';
  };

  return (
    <div
      className={`
        relative
        md:h-full
        md:flex
        md:flex-col
        ${match.status === 'in_progress' ? 'bg-gray-900' : statusConfig.bgColor}
        ${
          match.status === 'in_progress' 
            ? 'shadow-[0_0_15px_rgba(239,68,68,0.6)]' 
            : match.status === 'completed'
            ? 'border-4 border-emerald-500'
            : 'border-4 border-gray-400'
        }
        rounded-xl 
        overflow-hidden
        hover:shadow-2xl hover:scale-[1.02]
        ${DS_ANIMATIONS.base}
      `}
      data-match-live={match.status === 'in_progress' ? 'true' : 'false'}
    >
      {/* Border glow animation per partite in corso */}
      {match.status === 'in_progress' && (
        <div className="absolute inset-0 border-4 border-red-500 rounded-xl opacity-0 [animation:pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] pointer-events-none" />
      )}
      {/* Header con Status */}
      <div
        className={`px-6 py-3 border-b ${statusConfig.borderColor} ${match.status === 'in_progress' ? 'bg-red-900/60 [animation:pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' : 'bg-gray-900/50'} flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <StatusIcon
            className={`w-5 h-5 ${statusConfig.accentColor}`}
          />
          <span className={`text-sm font-bold tracking-wider ${match.status === 'scheduled' && dateTime?.time ? 'text-blue-400' : statusConfig.accentColor}`}>
            {/* Mostra orario invece di "PROGRAMMATA" se disponibile */}
            {match.status === 'scheduled' && dateTime?.time
              ? dateTime.time
              : statusConfig.label}
          </span>
        </div>
        {/* Info campo in alto a destra */}
        {match.courtNumber && (
          <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            <span>Campo {match.courtNumber}</span>
          </div>
        )}
      </div>

      {/* Main Content - Layout Responsive: Verticale su mobile, Orizzontale su desktop */}
      <div className="flex md:grid md:grid-cols-[1fr_auto_1fr] flex-col gap-3 p-4 md:items-center md:flex-1 md:justify-center">
        {/* SQUADRA 1 */}
        <div
          className={`flex items-center md:justify-end justify-between ${getWinnerStyle(match.team1Id)} rounded-lg p-3 ${DS_ANIMATIONS.fast}`}
        >
          <div className="md:text-right text-left flex-1">
            <h3 className="text-base md:text-lg font-bold text-blue-400 mb-1">{team1?.teamName || 'Squadra 1'}</h3>
            {team1?.players && team1.players.length > 0 && (
              <div className="text-sm md:text-base text-gray-300 leading-snug">
                {team1.players
                  .map((p) => p.playerName || p.name || p.displayName || '')
                  .filter(Boolean)
                  .map((name, idx) => (
                    <div key={idx}>{name}</div>
                  ))}
              </div>
            )}
          </div>
          {/* Score su mobile - solo per squadra 1 */}
          {(match.status === 'completed' || match.status === 'in_progress') && (
            <div className="md:hidden ml-4">
              <div
                className={`text-3xl font-black ${match.winnerId === match.team1Id ? 'text-emerald-400' : 'text-white'}`}
              >
                {scores.team1Score}
              </div>
            </div>
          )}
        </div>

        {/* CENTRO - Score & VS (nascosto su mobile) */}
        <div className="hidden md:flex flex-col items-center gap-2 min-w-[140px]">
          {match.status === 'completed' || match.status === 'in_progress' ? (
            <>
              {/* Score Principale */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div
                    className={`text-4xl font-black ${match.winnerId === match.team1Id ? 'text-emerald-400' : 'text-white'}`}
                  >
                    {scores.team1Score}
                  </div>
                </div>
                <div className="text-2xl font-light text-gray-600">-</div>
                <div className="text-center">
                  <div
                    className={`text-4xl font-black ${match.winnerId === match.team2Id ? 'text-emerald-400' : 'text-white'}`}
                  >
                    {scores.team2Score}
                  </div>
                </div>
              </div>

              {/* Score Set (se disponibile) */}
              {match.sets && match.sets.length > 0 && (
                <div className="flex flex-col gap-1">
                  {match.sets.map((set, idx) => {
                    // I set possono avere nomi diversi
                    const score1 = set.team1Score || set.team1 || 0;
                    const score2 = set.team2Score || set.team2 || 0;
                    
                    // Determina chi ha vinto il set
                    const team1WonSet = score1 > score2;
                    const team2WonSet = score2 > score1;
                    
                    // Colora il bordo in base a chi ha vinto il set e la partita
                    let borderColor = 'border-gray-600';
                    let shadowColor = '';
                    if (match.winnerId) {
                      if (team1WonSet && match.winnerId === match.team1Id) {
                        borderColor = 'border-emerald-500';
                        shadowColor = 'shadow-[0_0_12px_rgba(16,185,129,0.6)]'; // Glow verde
                      } else if (team2WonSet && match.winnerId === match.team2Id) {
                        borderColor = 'border-emerald-500';
                        shadowColor = 'shadow-[0_0_12px_rgba(16,185,129,0.6)]'; // Glow verde
                      } else if (team1WonSet && match.winnerId === match.team2Id) {
                        borderColor = 'border-red-500';
                        shadowColor = 'shadow-[0_0_12px_rgba(239,68,68,0.6)]'; // Glow rosso
                      } else if (team2WonSet && match.winnerId === match.team1Id) {
                        borderColor = 'border-red-500';
                        shadowColor = 'shadow-[0_0_12px_rgba(239,68,68,0.6)]'; // Glow rosso
                      }
                    }

                    return (
                      <div
                        key={idx}
                        className={`bg-gray-800 border-4 ${borderColor} ${shadowColor} rounded-lg px-4 py-2 text-xl font-mono`}
                      >
                        <span className={score1 > score2 ? 'text-emerald-400' : 'text-white'}>
                          {score1}
                        </span>
                        <span className="text-gray-500 mx-2">-</span>
                        <span className={score2 > score1 ? 'text-emerald-400' : 'text-white'}>
                          {score2}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <div className="text-3xl font-black text-gray-600 mb-1">VS</div>
              <div className="text-xs text-gray-500 font-medium">
                {match.status === 'scheduled' ? 'Prossimamente' : 'Da Programmare'}
              </div>
            </div>
          )}
        </div>

        {/* SQUADRA 2 */}
        <div
          className={`flex items-center md:justify-start justify-between ${getWinnerStyle(match.team2Id)} rounded-lg p-3 ${DS_ANIMATIONS.fast}`}
        >
          <div className="md:text-left text-left flex-1">
            <h3 className="text-base md:text-lg font-bold text-blue-400 mb-1">{team2?.teamName || 'Squadra 2'}</h3>
            {team2?.players && team2.players.length > 0 && (
              <div className="text-sm md:text-base text-gray-300 leading-snug">
                {team2.players
                  .map((p) => p.playerName || p.name || p.displayName || '')
                  .filter(Boolean)
                  .map((name, idx) => (
                    <div key={idx}>{name}</div>
                  ))}
              </div>
            )}
          </div>
          {/* Score su mobile - solo per squadra 2 */}
          {(match.status === 'completed' || match.status === 'in_progress') && (
            <div className="md:hidden ml-4">
              <div
                className={`text-3xl font-black ${match.winnerId === match.team2Id ? 'text-emerald-400' : 'text-white'}`}
              >
                {scores.team2Score}
              </div>
            </div>
          )}
        </div>

        {/* VS su mobile - mostrato tra le squadre */}
        {match.status === 'scheduled' && (
          <div className="md:hidden text-center py-2 -my-2">
            <div className="text-2xl font-black text-gray-600">VS</div>
            <div className="text-xs text-gray-500 font-medium">Prossimamente</div>
          </div>
        )}

        {/* Set Details su mobile */}
        {(match.status === 'completed' || match.status === 'in_progress') &&
          match.sets &&
          match.sets.length > 0 && (
            <div className="md:hidden flex flex-wrap gap-2 justify-center">
              {match.sets.map((set, idx) => {
                const score1 = set.team1Score || set.team1 || 0;
                const score2 = set.team2Score || set.team2 || 0;

                // Determina chi ha vinto il set
                const team1WonSet = score1 > score2;
                const team2WonSet = score2 > score1;

                // Colora il bordo in base a chi ha vinto il set e la partita
                let borderColor = 'border-gray-600';
                let shadowColor = '';
                if (match.winnerId) {
                  if (team1WonSet && match.winnerId === match.team1Id) {
                    borderColor = 'border-emerald-500';
                    shadowColor = 'shadow-[0_0_12px_rgba(16,185,129,0.6)]'; // Glow verde
                  } else if (team2WonSet && match.winnerId === match.team2Id) {
                    borderColor = 'border-emerald-500';
                    shadowColor = 'shadow-[0_0_12px_rgba(16,185,129,0.6)]'; // Glow verde
                  } else if (team1WonSet && match.winnerId === match.team2Id) {
                    borderColor = 'border-red-500';
                    shadowColor = 'shadow-[0_0_12px_rgba(239,68,68,0.6)]'; // Glow rosso
                  } else if (team2WonSet && match.winnerId === match.team1Id) {
                    borderColor = 'border-red-500';
                    shadowColor = 'shadow-[0_0_12px_rgba(239,68,68,0.6)]'; // Glow rosso
                  }
                }

                return (
                  <div
                    key={idx}
                    className={`bg-gray-800 border-4 ${borderColor} ${shadowColor} rounded-lg px-4 py-2 text-lg font-mono`}
                  >
                    <span className={score1 > score2 ? 'text-emerald-400' : 'text-white'}>
                      {score1}
                    </span>
                    <span className="text-gray-500 mx-2">-</span>
                    <span className={score2 > score1 ? 'text-emerald-400' : 'text-white'}>
                      {score2}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* Footer con Info Aggiuntive */}
      {match.notes && (
        <div
          className={`px-4 py-2 border-t ${statusConfig.borderColor} bg-gray-900/30 flex items-center gap-4 text-xs text-gray-400`}
        >
          <div className="flex items-center gap-2">
            <span className="italic">{match.notes}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicMatchCard;
