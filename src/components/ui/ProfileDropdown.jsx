import React from 'react';

const ProfileDropdown = ({ onProfileClick, onBackupClick }) => {
  return (
    <button
      onClick={onProfileClick}
      className="bg-white ring-1 ring-black/10 hover:ring-black/20 p-5 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group text-center w-full"
    >
      <div className="bg-slate-50 text-slate-700 ring-1 ring-slate-200 w-11 h-11 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform mx-auto">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="7" r="4" strokeWidth={1.5}/>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth={1.5}/>
        </svg>
      </div>
      <h3 className="font-bold text-base mb-1 text-gray-900 dark:text-white text-center">
        Profilo
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
        Gestisci il tuo account
      </p>
    </button>
  );
};

export default ProfileDropdown;
