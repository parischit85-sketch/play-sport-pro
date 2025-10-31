import React from 'react';

const ProfileDropdown = ({ onProfileClick, onBackupClick }) => {
  return (
    <button
      onClick={onProfileClick}
      className="relative bg-emerald-50/70 bg-gray-800/70 backdrop-blur-xl border border-emerald-200/40 border-gray-600/40 hover:border-emerald-300/60 hover:border-gray-500/60 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group text-center overflow-hidden w-full"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 from-gray-700/30 via-transparent to-transparent pointer-events-none" />

      <div className="relative">
        <div className="bg-gradient-to-r from-slate-50/80 to-gray-50/60 from-slate-900/40 to-gray-900/30 text-slate-600 text-slate-400 border border-white/20 border-gray-600/20 w-12 h-12 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="7" r="4" strokeWidth={1.5} />
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth={1.5} />
          </svg>
        </div>
        <h3 className="font-bold text-base mb-2 text-gray-900 text-white text-center">Profilo</h3>
        <p className="text-xs text-gray-600 text-gray-300 text-center leading-relaxed">
          Gestisci il tuo account
        </p>
      </div>
    </button>
  );
};

export default ProfileDropdown;
