/**
 * Sports Selector Component
 * Allows users to select sports/disciplines for their club
 */

import React from 'react';
import { AVAILABLE_SPORTS } from '@services/club-registration.js';
import { AlertCircle } from 'lucide-react';

export default function SportsSelector({ value = [], onChange, required = false }) {
  const handleToggleSport = (sportId) => {
    const newValue = value.includes(sportId)
      ? value.filter((id) => id !== sportId)
      : [...value, sportId];
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 text-gray-300 mb-3">
          Sport e Discipline {required && '*'}
        </label>
        <p className="text-xs text-gray-500 text-gray-400 mb-4">
          Seleziona gli sport che il tuo circolo gestisce (minimo 1)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {AVAILABLE_SPORTS.map((sport) => (
          <button
            key={sport.id}
            type="button"
            onClick={() => handleToggleSport(sport.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all cursor-pointer
              ${
                value.includes(sport.id)
                  ? `border-blue-500 bg-blue-50 bg-blue-900/30 ring-2 ring-blue-300 ring-blue-600`
                  : `border-gray-200 border-gray-600 bg-white bg-gray-700 hover:border-blue-300 hover:border-blue-500`
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{sport.icon}</span>
              <span className="text-sm font-medium text-neutral-900 text-white text-center">
                {sport.label}
              </span>
            </div>
            {value.includes(sport.id) && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {required && value.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-red-50 bg-red-900/20 border border-red-200 border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 text-red-400">
            Seleziona almeno uno sport per continuare
          </p>
        </div>
      )}

      {value.length > 0 && (
        <div className="p-3 bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 text-blue-300">
            Hai selezionato <span className="font-semibold">{value.length}</span> sport
          </p>
          <p className="text-xs text-blue-600 text-blue-400 mt-1">
            Potrai aggiungerne altri dalle impostazioni del circolo
          </p>
        </div>
      )}
    </div>
  );
}

