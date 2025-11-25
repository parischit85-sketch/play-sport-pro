import React from 'react';
import { Users, UserCheck, UserPlus, ShieldCheck, Trophy } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass = 'text-gray-500', T }) => (
  <div className={`${T.cardBg} ${T.border} rounded-xl p-4 flex items-center gap-4 transition-transform hover:scale-105`}>
    <div className={`p-3 rounded-lg bg-opacity-10 ${colorClass ? colorClass.replace('text-', 'bg-') : 'bg-gray-500'}`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
    <div>
      <p className={`text-sm ${T.subtext}`}>{title}</p>
      <h3 className={`text-2xl font-bold ${T.text}`}>{value}</h3>
      {subtext && <p className={`text-xs ${T.subtext} mt-1`}>{subtext}</p>}
    </div>
  </div>
);

export default function PlayersStatsHeader({ stats, activeFiltersCount, T }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="Totale Giocatori"
        value={stats.filtered}
        subtext={
          stats.total !== stats.filtered
            ? `su ${stats.total} totali`
            : 'Tutti visualizzati'
        }
        icon={Users}
        colorClass={T.accentInfo}
        T={T}
      />
      
      <StatCard
        title="Membri Club"
        value={stats.members}
        subtext="Iscritti ufficiali"
        icon={ShieldCheck}
        colorClass={T.accentGood}
        T={T}
      />
      
      <StatCard
        title="Attivi"
        value={stats.active}
        subtext="Stato attivo"
        icon={UserCheck}
        colorClass={T.accentWarning}
        T={T}
      />
      
      <StatCard
        title="Con Account"
        value={stats.withAccount}
        subtext="App collegata"
        icon={UserPlus}
        colorClass="text-purple-500"
        T={T}
      />
      
      <StatCard
        title="Torneo"
        value={stats.tournamentParticipants}
        subtext="Partecipanti"
        icon={Trophy}
        colorClass="text-orange-500"
        T={T}
      />
    </div>
  );
}
