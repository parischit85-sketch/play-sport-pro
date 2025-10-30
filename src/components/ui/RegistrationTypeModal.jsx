// =============================================
// FILE: src/components/ui/RegistrationTypeModal.jsx
// Modal per scegliere il tipo di registrazione: Utente o Circolo
// =============================================
import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { User, Building2, X } from 'lucide-react';
import { themeTokens } from '@lib/theme.js';

export default function RegistrationTypeModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const T = React.useMemo(() => themeTokens(), []);

  if (!isOpen) return null;

  const handleUserRegistration = () => {
    navigate('/register');
    onClose();
  };

  const handleClubRegistration = () => {
    navigate('/register-club');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className={`${T.cardBg} rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 from-blue-600 to-indigo-700 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">Benvenuto!</h2>
          <p className="text-white/90">Scegli come vuoi registrarti</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Registrazione Utente */}
            <button
              onClick={handleUserRegistration}
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-900/20 to-green-900/10 rounded-xl p-6 border-2 border-emerald-700/30 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Registrati come Utente
                </h3>

                <p className="text-sm text-gray-400 mb-4">
                  Prenota campi, partecipa a tornei, segui statistiche e migliora il tuo gioco
                </p>

                <div className="space-y-2 text-xs text-gray-500 text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Prenotazioni rapide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Statistiche personali</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Tornei e classifiche</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 font-semibold">
                  <span>Inizia subito</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Registrazione Circolo */}
            <button
              onClick={handleClubRegistration}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-900/20 to-indigo-900/10 rounded-xl p-6 border-2 border-blue-700/30 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Registra il tuo Circolo
                </h3>

                <p className="text-sm text-gray-400 mb-4">
                  Gestisci campi, prenotazioni, tornei e membri del tuo circolo sportivo
                </p>

                <div className="space-y-2 text-xs text-gray-500 text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Gestione completa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Dashboard amministrativa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Analisi e reportistica</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-blue-400 font-semibold">
                  <span>Registra circolo</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Potrai sempre cambiare o aggiungere ruoli successivamente
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

