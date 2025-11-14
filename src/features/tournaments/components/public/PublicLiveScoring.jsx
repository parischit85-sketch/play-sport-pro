/**
 * Public Live Scoring Component
 * Allows anyone with the link to submit provisional match results
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import { submitProvisionalResult } from '../../services/matchService.js';
import { Check, AlertCircle, Trophy, Users, Calendar, MapPin } from 'lucide-react';

function PublicLiveScoring() {
  const { clubId, tournamentId, liveScoringToken } = useParams();

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [submitterName, setSubmitterName] = useState('');

  useEffect(() => {
    const loadTournamentData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load tournament
        const tournamentRef = doc(db, 'clubs', clubId, 'tournaments', tournamentId);
        const tournamentSnap = await getDoc(tournamentRef);

        if (!tournamentSnap.exists()) {
          setError('Torneo non trovato');
          setLoading(false);
          return;
        }

        const tournamentData = { id: tournamentSnap.id, ...tournamentSnap.data() };

        // Validate live scoring token
        if (
          !tournamentData.publicView?.liveScoringEnabled ||
          tournamentData.publicView?.liveScoringToken !== liveScoringToken
        ) {
          setError("Link non valido o scaduto. Contatta l'organizzatore del torneo.");
          setLoading(false);
          return;
        }

        setTournament(tournamentData);

        // Load teams
        const teamsRef = collection(db, 'clubs', clubId, 'tournaments', tournamentId, 'teams');
        const teamsSnap = await getDocs(teamsRef);
        const teamsData = teamsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTeams(teamsData);

        // Load matches (only scheduled and in-progress)
        const matchesRef = collection(db, 'clubs', clubId, 'tournaments', tournamentId, 'matches');
        const matchesQuery = query(matchesRef, orderBy('scheduledDate', 'asc'));
        const matchesSnap = await getDocs(matchesQuery);
        const matchesData = matchesSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (match) =>
              match.status === 'scheduled' ||
              match.status === 'in_progress' ||
              (match.status === 'completed' && match.provisionalStatus === 'pending')
          );

        setMatches(matchesData);
      } catch (err) {
        console.error('Error loading tournament data:', err);
        setError('Errore durante il caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    loadTournamentData();
  }, [clubId, tournamentId, liveScoringToken]);

  const handleSubmitResult = async (e) => {
    e.preventDefault();

    if (!selectedMatch) {
      setError('Seleziona una partita');
      return;
    }

    const score1 = parseInt(team1Score);
    const score2 = parseInt(team2Score);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      setError('Inserisci punteggi validi (numeri maggiori o uguali a 0)');
      return;
    }

    if (score1 === score2) {
      setError('I punteggi non possono essere uguali (inserisci il risultato definitivo)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await submitProvisionalResult(
        clubId,
        tournamentId,
        selectedMatch.id,
        {
          score: { team1: score1, team2: score2 },
          submittedBy: submitterName.trim() || 'Anonimo',
        },
        liveScoringToken
      );

      if (result.success) {
        setSuccess(true);
        setTeam1Score('');
        setTeam2Score('');
        setSubmitterName('');
        setSelectedMatch(null);

        // Reload page after success to update matches
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(result.error || "Errore durante l'invio del risultato");
      }
    } catch (err) {
      console.error('Error submitting result:', err);
      setError("Errore durante l'invio del risultato");
    } finally {
      setSubmitting(false);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team?.name || 'Squadra sconosciuta';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Accesso Negato</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-white" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">{tournament?.name}</h1>
          </div>
          <p className="text-white/90 text-sm md:text-base">
            Live Scoring - Inserimento Risultati Provvisori
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Check className="w-6 h-6 text-green-400" />
            <p className="text-green-300 font-medium">
              Risultato inviato con successo! In attesa di conferma da parte dell&apos;admin.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && tournament && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm">
            <strong>ℹ️ Informazioni:</strong> I risultati che inserisci qui sono provvisori.
            L&apos;amministratore del torneo dovrà confermarli prima che diventino ufficiali.
          </p>
        </div>

        {/* Match Selection & Form */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">
            Seleziona Partita e Inserisci Risultato
          </h2>

          {matches.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Nessuna partita disponibile per l&apos;inserimento risultati.
            </p>
          ) : (
            <form onSubmit={handleSubmitResult} className="space-y-6">
              {/* Match Selection */}
              <div>
                <label
                  htmlFor="match-select"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Seleziona Partita *
                </label>
                <select
                  id="match-select"
                  value={selectedMatch?.id || ''}
                  onChange={(e) => {
                    const match = matches.find((m) => m.id === e.target.value);
                    setSelectedMatch(match);
                    setTeam1Score('');
                    setTeam2Score('');
                  }}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">-- Seleziona una partita --</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}
                      {match.scheduledDate && ` - ${formatDate(match.scheduledDate)}`}
                      {match.courtNumber && ` - Campo ${match.courtNumber}`}
                      {match.provisionalStatus === 'pending' &&
                        ' (Risultato provvisorio in attesa)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Match Info */}
              {selectedMatch && (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">
                      {getTeamName(selectedMatch.team1Id)} vs {getTeamName(selectedMatch.team2Id)}
                    </span>
                  </div>
                  {selectedMatch.scheduledDate && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedMatch.scheduledDate)}</span>
                    </div>
                  )}
                  {selectedMatch.courtNumber && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Campo {selectedMatch.courtNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Score Inputs */}
              {selectedMatch && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="team1-score"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Punteggio {getTeamName(selectedMatch.team1Id)} *
                      </label>
                      <input
                        id="team1-score"
                        type="number"
                        min="0"
                        value={team1Score}
                        onChange={(e) => setTeam1Score(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="team2-score"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Punteggio {getTeamName(selectedMatch.team2Id)} *
                      </label>
                      <input
                        id="team2-score"
                        type="number"
                        min="0"
                        value={team2Score}
                        onChange={(e) => setTeam2Score(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Submitter Name */}
                  <div>
                    <label
                      htmlFor="submitter-name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Il tuo nome (opzionale)
                    </label>
                    <input
                      id="submitter-name"
                      type="text"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      placeholder="Es. Mario Rossi"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {submitting ? 'Invio in corso...' : 'Invia Risultato Provvisorio'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>
            Questo link è protetto. Non condividerlo con persone non autorizzate. Per maggiori
            informazioni, contatta l&apos;organizzatore del torneo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PublicLiveScoring;
