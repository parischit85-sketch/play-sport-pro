/**
 * Live Tournaments Modal
 * Shows a list of all public tournaments and allows navigation to appropriate views
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicTournaments } from '@features/tournaments/services/tournamentService.js';
import { Trophy, ExternalLink, Smartphone, Monitor, X, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';

export default function LiveTournamentsModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPublicTournaments();
    }
  }, [isOpen]);

  const loadPublicTournaments = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Loading public tournaments...');
      const publicTournaments = await getPublicTournaments({ limit: 20 });
      console.log('📊 Public tournaments loaded:', publicTournaments);
      console.log('📊 Number of tournaments:', publicTournaments.length);
      setTournaments(publicTournaments);
    } catch (err) {
      console.error('❌ Error loading public tournaments:', err);
      setError('Errore nel caricamento dei tornei live');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;

    // Check if it's a TV device (Google TV, Android TV, Smart TV, etc.)
    const isTVDevice =
      userAgent.includes('tv') ||
      userAgent.includes('googletv') ||
      userAgent.includes('androidtv') ||
      userAgent.includes('smarttv') ||
      userAgent.includes('appletv') ||
      userAgent.includes('hbbtv') ||
      userAgent.includes('roku') ||
      userAgent.includes('viera') ||
      userAgent.includes('opera tv') ||
      userAgent.includes('netcast') ||
      userAgent.includes('philips') ||
      userAgent.includes('web0s');

    // If it's a TV device, treat as desktop
    if (isTVDevice) {
      console.log('🖥️ TV device detected:', userAgent);
      return 'desktop';
    }

    // Check for mobile devices
    const isMobile =
      screenWidth < 768 || ('ontouchstart' in window && screenWidth < 1024 && !isTVDevice);

    console.log('📱 Device detection:', {
      userAgent,
      screenWidth,
      isMobile,
      isTVDevice,
    });

    return isMobile ? 'mobile' : 'desktop';
  };

  const openTournamentView = (tournament) => {
    const deviceType = getDeviceType();
    const token = tournament.publicView?.token;

    if (!token) {
      console.error('No public token found for tournament');
      return;
    }

    // Close modal first
    onClose();

    // Navigate to appropriate view based on device
    if (deviceType === 'mobile') {
      navigate(`/public/tournament/${tournament.clubId}/${tournament.id}/${token}`);
    } else {
      navigate(`/public/tournament-tv/${tournament.clubId}/${tournament.id}/${token}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
      case 'groups_phase':
      case 'knockout_phase':
        return 'text-green-400 bg-green-900/30';
      case 'completed':
        return 'text-blue-400 bg-blue-900/30';
      case 'draft':
        return 'text-gray-400 bg-gray-900/30';
      default:
        return 'text-yellow-400 bg-yellow-900/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'Bozza';
      case 'registration_open':
        return 'Iscrizioni Aperte';
      case 'registration_closed':
        return 'Iscrizioni Chiuse';
      case 'groups_phase':
        return 'Fase Gironi';
      case 'knockout_phase':
        return 'Fase Eliminazione';
      case 'completed':
        return 'Completato';
      case 'cancelled':
        return 'Annullato';
      default:
        return status || 'Sconosciuto';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-gray-800 rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tornei Live</h2>
              <p className="text-gray-400 text-sm">Tornei con visualizzazione pubblica attiva</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="ml-3 text-white">Caricamento tornei...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-2">⚠️ {error}</div>
              <button
                onClick={loadPublicTournaments}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Riprova
              </button>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nessun torneo live</h3>
              <p className="text-gray-400">
                Al momento non ci sono tornei con visualizzazione pubblica attiva.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div
                  key={`${tournament.clubId}-${tournament.id}`}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => openTournamentView(tournament)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openTournamentView(tournament);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate mb-1">
                        {tournament.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-2">{tournament.clubName}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}
                        >
                          {getStatusText(tournament.status)}
                        </span>
                        {tournament.registeredTeams && (
                          <span className="text-gray-400">
                            {tournament.registeredTeams} squadre
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="text-xs">
                        {getDeviceType() === 'mobile' ? (
                          <div className="flex items-center gap-1">
                            <Smartphone className="w-4 h-4" />
                            <span>Mobile</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Monitor className="w-4 h-4" />
                            <span>Desktop</span>
                          </div>
                        )}
                      </div>
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-700 border-t border-gray-600">
          <p className="text-gray-400 text-sm text-center">
            Verrà aperta la visualizzazione ottimizzata per il tuo dispositivo
          </p>
        </div>
      </div>
    </Modal>
  );
}
