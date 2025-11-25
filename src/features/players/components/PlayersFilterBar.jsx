import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { PLAYER_CATEGORIES } from '../types/playerTypes';

export default function PlayersFilterBar({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  showAdvancedFilters,
  setShowAdvancedFilters,
  filterStatus,
  setFilterStatus,
  filterRegistrationDate,
  setFilterRegistrationDate,
  filterLastActivity,
  setFilterLastActivity,
  onResetFilters,
  activeFiltersCount,
  T,
}) {
  return (
    <div className="space-y-4 mb-6">
      {/* Main Bar */}
      <div className={`flex flex-col lg:flex-row gap-4 p-4 ${T.cardBg} ${T.border} rounded-xl shadow-sm`}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca per nome, email, telefono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${T.input} w-full pl-10 py-2.5`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`${T.input} min-w-[160px] py-2.5`}
          >
            <option value="all">Tutte le categorie</option>
            <option value={PLAYER_CATEGORIES.MEMBER}>Soci</option>
            <option value={PLAYER_CATEGORIES.VIP}>Vip</option>
            <option value={PLAYER_CATEGORIES.GUEST}>Ospiti</option>
            <option value={PLAYER_CATEGORIES.INSTRUCTOR}>Istruttori</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`${T.input} min-w-[160px] py-2.5`}
          >
            <option value="name">Nome (A-Z)</option>
            <option value="registration">Più recenti</option>
            <option value="lastActivity">Ultimo accesso</option>
            <option value="rating">Ranking (Alto-Basso)</option>
          </select>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors whitespace-nowrap ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-primary-600 border-primary-500 text-white'
                : `${T.btnSecondary}`
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtri</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-primary-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-6 animate-in fade-in slide-in-from-top-2`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-semibold ${T.text} flex items-center gap-2`}>
              <Filter className="w-4 h-4" />
              Filtri Avanzati
            </h4>
            <button
              onClick={onResetFilters}
              className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset tutto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status */}
            <div>
              <label className={`text-xs font-medium ${T.subtext} uppercase tracking-wider mb-2 block`}>
                Stato Account
              </label>
              <div className="space-y-2">
                {['all', 'active', 'inactive'].map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={filterStatus === status}
                      onChange={() => setFilterStatus(status)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className={T.text}>
                      {status === 'all' ? 'Tutti' : status === 'active' ? 'Attivi' : 'Inattivi'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Registration Date */}
            <div>
              <label className={`text-xs font-medium ${T.subtext} uppercase tracking-wider mb-2 block`}>
                Data Registrazione
              </label>
              <select
                value={filterRegistrationDate}
                onChange={(e) => setFilterRegistrationDate(e.target.value)}
                className={`${T.input} w-full`}
              >
                <option value="all">Qualsiasi data</option>
                <option value="today">Oggi</option>
                <option value="week">Ultimi 7 giorni</option>
                <option value="month">Ultimi 30 giorni</option>
              </select>
            </div>

            {/* Last Activity */}
            <div>
              <label className={`text-xs font-medium ${T.subtext} uppercase tracking-wider mb-2 block`}>
                Ultimo Accesso
              </label>
              <select
                value={filterLastActivity}
                onChange={(e) => setFilterLastActivity(e.target.value)}
                className={`${T.input} w-full`}
              >
                <option value="all">Qualsiasi data</option>
                <option value="today">Oggi</option>
                <option value="week">Ultimi 7 giorni</option>
                <option value="month">Ultimi 30 giorni</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
