/**
 * Public View Settings - Admin Panel Component
 * Allows tournament admins to enable/disable public views and generate sharing links
 */

import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Monitor,
  Smartphone,
  QrCode,
  ChevronDown,
  ChevronUp,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import QRCodeReact from 'react-qr-code';

function PublicViewSettings({ tournament, clubId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState({ mobile: false, tv: false });
  const [showQR, setShowQR] = useState(false);
  const [groups, setGroups] = useState([]);
  const [matchesPages, setMatchesPages] = useState([]);
  const [tournamentName, setTournamentName] = useState(tournament?.name || '');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const isEnabled = tournament?.publicView?.enabled || false;

  // Genera chiavi uniche per il localStorage basate su clubId e tournamentId
  const storageKey = `publicViewExpanded_${clubId}_${tournament?.id}`;
  const groupsStorageKey = `groupsExpanded_${clubId}_${tournament?.id}`;
  const matchesOnlyStorageKey = `matchesOnlyExpanded_${clubId}_${tournament?.id}`;

  // Inizializza lo stato espanso da localStorage o apri se la vista è abilitata
  const getInitialExpandedState = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Se non c'è nessun valore salvato, apri se la vista pubblica è abilitata
      return isEnabled;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return isEnabled;
    }
  };

  // Inizializza lo stato espanso dei gironi da localStorage
  const getInitialGroupsExpandedState = () => {
    try {
      const saved = localStorage.getItem(groupsStorageKey);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return false; // Default chiuso
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return false;
    }
  };

  // Inizializza lo stato espanso di "Solo Partite" da localStorage
  const getInitialMatchesOnlyExpandedState = () => {
    try {
      const saved = localStorage.getItem(matchesOnlyStorageKey);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return false; // Default chiuso
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return false;
    }
  };

  const [isExpanded, setIsExpanded] = useState(getInitialExpandedState);
  const [groupsExpanded, setGroupsExpanded] = useState(getInitialGroupsExpandedState);
  const [matchesOnlyExpanded, setMatchesOnlyExpanded] = useState(
    getInitialMatchesOnlyExpandedState
  );

  // Salva lo stato in localStorage quando cambia
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(isExpanded));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [isExpanded, storageKey]);

  // Salva lo stato dei gironi in localStorage quando cambia
  useEffect(() => {
    try {
      localStorage.setItem(groupsStorageKey, JSON.stringify(groupsExpanded));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [groupsExpanded, groupsStorageKey]);

  // Salva lo stato di "Solo Partite" in localStorage quando cambia
  useEffect(() => {
    try {
      localStorage.setItem(matchesOnlyStorageKey, JSON.stringify(matchesOnlyExpanded));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [matchesOnlyExpanded, matchesOnlyStorageKey]);

  // Apri automaticamente se la vista pubblica viene abilitata
  useEffect(() => {
    if (isEnabled && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isEnabled, isExpanded]);

  // Aggiorna il nome quando cambia il torneo
  useEffect(() => {
    setTournamentName(tournament?.name || '');
  }, [tournament?.name]);

  // Carica i gironi dal torneo
  useEffect(() => {
    const loadGroups = async () => {
      if (!tournament?.id || !clubId) return;

      try {
        const teamsRef = collection(db, 'clubs', clubId, 'tournaments', tournament.id, 'teams');
        const teamsSnap = await getDocs(teamsRef);
        const uniqueGroups = new Set();

        teamsSnap.docs.forEach((doc) => {
          const team = doc.data();
          if (team.groupId) {
            uniqueGroups.add(team.groupId);
          }
        });

        const groupsList = Array.from(uniqueGroups).sort();
        setGroups(groupsList);
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    loadGroups();
  }, [tournament?.id, clubId]);

  // Carica le partite e calcola le pagine per matches_only
  useEffect(() => {
    const loadMatchesPages = async () => {
      if (!tournament?.id || !clubId || tournament?.participantType !== 'matches_only') {
        setMatchesPages([]);
        return;
      }

      try {
        const matchesRef = collection(
          db,
          'clubs',
          clubId,
          'tournaments',
          tournament.id,
          'matches'
        );
        const matchesSnap = await getDocs(matchesRef);
        const allMatches = matchesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Dividi le partite in pagine di 4
        const matchesPerPage = 4;
        const totalPages = Math.ceil(allMatches.length / matchesPerPage);
        const pages = [];

        for (let i = 0; i < totalPages; i++) {
          pages.push({
            pageIndex: i,
            pageNumber: i + 1,
            totalMatches: Math.min(matchesPerPage, allMatches.length - i * matchesPerPage),
          });
        }

        setMatchesPages(pages);
      } catch (error) {
        console.error('Error loading matches pages:', error);
      }
    };

    loadMatchesPages();
  }, [tournament?.id, clubId, tournament?.participantType]);

  const token = tournament?.publicView?.token || '';
  const showQRCode = tournament?.publicView?.showQRCode || false;
  const interval = tournament?.publicView?.settings?.interval || 15000; // Fallback globale
  const displaySettings = tournament?.publicView?.settings?.displaySettings || {
    groupsMatches: true,
    standings: true,
    points: true,
  };

  // Intervalli separati per ogni tipo di pagina (in secondi)
  const pageIntervals = tournament?.publicView?.settings?.pageIntervals || {
    groups: 15, // Intervallo per ogni girone
    standings: 15, // Intervallo per tabellone
    points: 15, // Intervallo per punti
    qr: 15, // Intervallo per QR code
    winners: 20, // Intervallo per pagina vincitori
  };

  const baseUrl = window.location.origin;
  const mobileUrl = token ? `${baseUrl}/public/tournament/${clubId}/${tournament.id}/${token}` : '';
  const tvUrl = token ? `${baseUrl}/public/tournament-tv/${clubId}/${tournament.id}/${token}` : '';

  const generateToken = () => {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  };

  const handleTogglePublicView = async (e) => {
    e.stopPropagation(); // Previeni la propagazione al pulsante collapsible
    setLoading(true);
    try {
      const newToken = isEnabled ? token : generateToken();
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.enabled': !isEnabled,
        'publicView.token': newToken,
        'publicView.showQRCode': showQRCode,
        'publicView.settings.interval': interval,
      });

      // La sezione si aprirà automaticamente tramite useEffect quando isEnabled diventa true

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling public view:', error);
      alert('Errore durante laggiornamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async (e) => {
    e.stopPropagation(); // Previeni la propagazione al pulsante collapsible
    if (
      !confirm('Vuoi rigenerare il token? I link esistenti smetteranno di funzionare. Continuare?')
    )
      return;

    setLoading(true);
    try {
      const newToken = generateToken();
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.token': newToken,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error regenerating token:', error);
      alert('Errore durante la rigenerazione del token');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQRCode = async (e) => {
    e.stopPropagation(); // Previeni la propagazione al pulsante collapsible
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.showQRCode': !showQRCode,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling QR code:', error);
      alert('Errore durante laggiornamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterval = async (newInterval, e) => {
    if (e) e.stopPropagation(); // Previeni la propagazione al pulsante collapsible
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.settings.interval': newInterval,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating interval:', error);
      alert('Errore durante laggiornamento dellintervallo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDisplaySettings = async (newSettings, e) => {
    if (e) e.stopPropagation(); // Previeni la propagazione al pulsante collapsible
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.settings.displaySettings': newSettings,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating display settings:', error);
      alert('Errore durante laggiornamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePageInterval = async (pageType, seconds, e) => {
    if (e) e.stopPropagation(); // Previeni la propagazione al pulsante collapsible
    setLoading(true);
    try {
      const newPageIntervals = {
        ...pageIntervals,
        [pageType]: Number(seconds),
      };
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.settings.pageIntervals': newPageIntervals,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating page interval:', error);
      alert('Errore durante laggiornamento dellintervallo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroupSettings = async (groupId, settings, e) => {
    if (e) e.stopPropagation();
    setLoading(true);
    try {
      const currentGroupSettings = tournament?.publicView?.settings?.groupSettings || {};
      const newGroupSettings = {
        ...currentGroupSettings,
        [groupId]: {
          ...currentGroupSettings[groupId],
          ...settings,
        },
      };
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.settings.groupSettings': newGroupSettings,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating group settings:', error);
      alert('Errore durante laggiornamento delle impostazioni del girone');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMatchesPageSettings = async (pageIndex, settings, e) => {
    if (e) e.stopPropagation();
    setLoading(true);
    try {
      const currentPageSettings = tournament?.publicView?.settings?.matchesPageSettings || {};
      const newPageSettings = {
        ...currentPageSettings,
        [pageIndex]: {
          ...currentPageSettings[pageIndex],
          ...settings,
        },
      };
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.settings.matchesPageSettings': newPageSettings,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating matches page settings:', error);
      alert('Errore durante laggiornamento delle impostazioni della pagina');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTournamentName = async (e) => {
    if (e) e.stopPropagation();
    const newName = tournamentName.trim();
    if (!newName) {
      alert('Il nome del torneo non può essere vuoto');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        name: newName,
      });

      if (onUpdate) onUpdate();
      alert('Nome torneo aggiornato con successo!');
    } catch (error) {
      console.error('Error updating tournament name:', error);
      alert('Errore durante laggiornamento del nome');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona un file immagine');
      return;
    }

    // Validate size (max 500KB for Base64 to avoid Firestore 1MB limit)
    if (file.size > 500 * 1024) {
      alert('Il file è troppo grande. Dimensione massima: 500KB\n\nSuggerimento: comprimi l\'immagine prima di caricarla.');
      return;
    }

    setUploadingLogo(true);
    try {
      // Convert image to Base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const logoUrl = await base64Promise;

      // Save Base64 directly to Firestore
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        logoUrl,
      });

      if (onUpdate) onUpdate();
      alert('Logo caricato con successo!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Errore durante il caricamento del logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async (e) => {
    if (e) e.stopPropagation();
    if (!confirm('Vuoi rimuovere il logo del torneo?')) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        logoUrl: null,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing logo:', error);
      alert('Errore durante la rimozione del logo');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => {
        setCopied({ ...copied, [type]: false });
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Collapsible */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-primary-400" />
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Vista Pubblica</h3>
              <p className="text-sm text-gray-400">
                Condividi il torneo su schermi pubblici senza autenticazione
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEnabled && (
              <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm font-medium">
                Abilitata
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            className="p-4 pt-0 space-y-6"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Enable/Disable Button */}
            <div className="flex justify-end">
              <button
                onClick={handleTogglePublicView}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEnabled ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
                } disabled:opacity-50`}
              >
                {isEnabled ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                {isEnabled ? 'Disabilita' : 'Abilita'}
              </button>
            </div>

            {isEnabled && (
              <>
                {/* Tournament Name and Logo */}
                <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary-400" />
                    Nome e Logo Torneo
                  </h3>

                  {/* Tournament Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome Torneo
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tournamentName}
                        onChange={(e) => setTournamentName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                        placeholder="Nome del torneo"
                      />
                      <button
                        onClick={handleUpdateTournamentName}
                        disabled={loading || tournamentName.trim() === tournament?.name}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Salva Nome
                      </button>
                    </div>
                  </div>

                  {/* Tournament Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Logo Torneo
                    </label>
                    
                    {tournament?.logoUrl ? (
                      <div className="space-y-3">
                        {/* Logo Preview */}
                        <div className="flex items-center gap-4 bg-gray-600 rounded-lg p-3">
                          <img
                            src={tournament.logoUrl}
                            alt="Tournament Logo"
                            className="w-16 h-16 object-contain rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-300">Logo caricato</p>
                            <p className="text-xs text-gray-400">Verrà visualizzato a sinistra del nome torneo</p>
                          </div>
                          <button
                            onClick={handleRemoveLogo}
                            disabled={loading}
                            className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors disabled:opacity-50"
                            title="Rimuovi logo"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block">
                          <div className="border-2 border-dashed border-gray-500 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-300 mb-1">
                              {uploadingLogo ? 'Caricamento in corso...' : 'Clicca per caricare un logo'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Formato: Immagine (JPG, PNG, ecc.) - Max 500KB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Public Links */}
                <div className="space-y-4">
                  {/* Mobile/Smartphone Link */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-5 h-5 text-primary-400" />
                      <h4 className="font-semibold text-white">Vista Smartphone</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Ottimizzata per dispositivi mobili con navigazione touch
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mobileUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(mobileUrl, 'mobile')}
                        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        title="Copia link"
                      >
                        {copied.mobile ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      <a
                        href={mobileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Apri in nuova finestra"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                    </div>
                  </div>

                  {/* TV Link */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-5 h-5 text-fuchsia-400" />
                      <h4 className="font-semibold text-white">Vista TV</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Ottimizzata per schermi grandi con grafica bold e QR code dedicato
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tvUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(tvUrl, 'tv')}
                        className="p-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
                        title="Copia link"
                      >
                        {copied.tv ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <a
                        href={tvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Apri in nuova finestra"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-white">Impostazioni</h4>

                  {/* Intervallo Auto-Scroll Globale (deprecato, mantenuto per retrocompatibilità) */}
                  <div className="opacity-50">
                    <label
                      htmlFor="global-interval"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Intervallo Auto-Scroll Globale (secondi) - Deprecato
                    </label>
                    <select
                      id="global-interval"
                      value={interval / 1000}
                      onChange={(e) => handleUpdateInterval(Number(e.target.value) * 1000)}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value={10}>10 secondi</option>
                      <option value={15}>15 secondi</option>
                      <option value={20}>20 secondi</option>
                      <option value={30}>30 secondi</option>
                      <option value={45}>45 secondi</option>
                      <option value={60}>60 secondi</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      ⚠️ Usa gli intervalli separati per pagina (sotto)
                    </p>
                  </div>

                  {/* Display Settings - Pages to show with individual intervals */}
                  <div>
                    <div className="block text-sm font-medium text-gray-300 mb-3">
                      Pagine Pubbliche da visualizzare
                    </div>
                    <div className="space-y-3">
                      {/* Gironi & Partite - Collassabile - Solo se NON è matches_only */}
                      {tournament?.participantType !== 'matches_only' && (
                        <div className="bg-gray-700 rounded-lg overflow-hidden">
                          {/* Header collassabile */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setGroupsExpanded(!groupsExpanded);
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-600 transition-colors"
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300 font-medium">
                                Gironi & Partite
                              </span>
                              {groups.length > 0 && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                  {groups.length} {groups.length === 1 ? 'girone' : 'gironi'}
                                </span>
                              )}
                            </div>
                            {groupsExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          {/* Contenuto espandibile */}
                          {groupsExpanded && (
                            <div
                              className="border-t border-gray-600 p-3 space-y-2"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              role="button"
                              tabIndex={0}
                            >
                              {groups.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-2">
                                  Nessun girone disponibile
                                </p>
                              ) : (
                                groups.map((groupId) => {
                                  const groupSettings =
                                    tournament?.publicView?.settings?.groupSettings?.[groupId] ||
                                    {};
                                  const isGroupEnabled = groupSettings.enabled !== false;
                                  const groupInterval =
                                    groupSettings.interval || pageIntervals.groups || 15;

                                  return (
                                    <div
                                      key={groupId}
                                      className="flex items-center gap-3 bg-gray-600 p-2 rounded"
                                    >
                                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                                        <input
                                          type="checkbox"
                                          checked={isGroupEnabled}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            handleUpdateGroupSettings(
                                              groupId,
                                              { enabled: e.target.checked },
                                              e
                                            );
                                          }}
                                          disabled={loading}
                                          className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <span className="text-sm text-gray-300">
                                          Girone {groupId.toUpperCase()}
                                        </span>
                                      </label>
                                      <select
                                        value={groupInterval}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          handleUpdateGroupSettings(
                                            groupId,
                                            { interval: Number(e.target.value) },
                                            e
                                          );
                                        }}
                                        disabled={loading || !isGroupEnabled}
                                        className="px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-xs min-w-[120px]"
                                        title={`Intervallo per girone ${groupId.toUpperCase()}`}
                                      >
                                        <option value={5}>5 secondi</option>
                                        <option value={10}>10 secondi</option>
                                        <option value={15}>15 secondi</option>
                                        <option value={20}>20 secondi</option>
                                        <option value={30}>30 secondi</option>
                                        <option value={45}>45 secondi</option>
                                        <option value={60}>60 secondi</option>
                                      </select>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Solo Partite - Solo se è matches_only - Collassabile */}
                      {tournament?.participantType === 'matches_only' && (
                        <div className="bg-gray-700 rounded-lg overflow-hidden">
                          {/* Header collassabile */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMatchesOnlyExpanded(!matchesOnlyExpanded);
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-600 transition-colors"
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-300 font-medium">
                                Solo Partite
                              </span>
                              <span className="px-2 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 text-xs rounded-full">
                                Vista partite
                              </span>
                            </div>
                            {matchesOnlyExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          {/* Contenuto espandibile */}
                          {matchesOnlyExpanded && (
                            <div
                              className="border-t border-gray-600 p-3 space-y-2"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                              role="button"
                              tabIndex={0}
                            >
                              {matchesPages.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-2">
                                  Nessuna partita disponibile
                                </p>
                              ) : (
                                <>
                                  <p className="text-xs text-gray-400 mb-2">
                                    {matchesPages.length} {matchesPages.length === 1 ? 'pagina' : 'pagine'} generate (max 4 partite per pagina)
                                  </p>
                                  {matchesPages.map((page) => {
                                    const pageSettings =
                                      tournament?.publicView?.settings?.matchesPageSettings?.[page.pageIndex] ||
                                      {};
                                    const isPageEnabled = pageSettings.enabled !== false;
                                    const pageInterval = pageSettings.interval || 15;

                                    return (
                                      <div
                                        key={page.pageIndex}
                                        className="flex items-center gap-3 bg-gray-600 p-2 rounded"
                                      >
                                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                                          <input
                                            type="checkbox"
                                            checked={isPageEnabled}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              handleUpdateMatchesPageSettings(
                                                page.pageIndex,
                                                { enabled: e.target.checked },
                                                e
                                              );
                                            }}
                                            disabled={loading}
                                            className="w-4 h-4 rounded border-gray-300"
                                          />
                                          <span className="text-sm text-gray-300">
                                            Pagina {page.pageNumber} ({page.totalMatches} partite)
                                          </span>
                                        </label>
                                        <select
                                          value={pageInterval}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            handleUpdateMatchesPageSettings(
                                              page.pageIndex,
                                              { interval: Number(e.target.value) },
                                              e
                                            );
                                          }}
                                          disabled={loading || !isPageEnabled}
                                          className="px-2 py-1 bg-gray-700 border border-gray-500 rounded text-white text-xs min-w-[120px]"
                                          title={`Intervallo per pagina ${page.pageNumber}`}
                                        >
                                          <option value={5}>5 secondi</option>
                                          <option value={10}>10 secondi</option>
                                          <option value={15}>15 secondi</option>
                                          <option value={20}>20 secondi</option>
                                          <option value={30}>30 secondi</option>
                                          <option value={45}>45 secondi</option>
                                          <option value={60}>60 secondi</option>
                                        </select>
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tabellone - Solo se NON è matches_only */}
                      {tournament?.participantType !== 'matches_only' && (
                        <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={displaySettings.standings || false}
                              onChange={(e) =>
                                handleUpdateDisplaySettings({
                                  ...displaySettings,
                                  standings: e.target.checked,
                                })
                              }
                              disabled={loading}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-300 font-medium">Tabellone</span>
                          </label>
                          <select
                            value={pageIntervals.standings}
                            onChange={(e) => handleUpdatePageInterval('standings', e.target.value)}
                            disabled={loading || !displaySettings.standings}
                            className="px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm min-w-[140px]"
                            title="Intervallo per tabellone"
                          >
                            <option value={5}>5 secondi</option>
                            <option value={10}>10 secondi</option>
                            <option value={15}>15 secondi</option>
                            <option value={20}>20 secondi</option>
                            <option value={30}>30 secondi</option>
                            <option value={45}>45 secondi</option>
                            <option value={60}>60 secondi</option>
                          </select>
                        </div>
                      )}

                      {/* Punti */}
                      <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={displaySettings.points || false}
                            onChange={(e) =>
                              handleUpdateDisplaySettings({
                                ...displaySettings,
                                points: e.target.checked,
                              })
                            }
                            disabled={loading}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-300 font-medium">Punti</span>
                        </label>
                        <select
                          value={pageIntervals.points}
                          onChange={(e) => handleUpdatePageInterval('points', e.target.value)}
                          disabled={loading || !displaySettings.points}
                          className="px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm min-w-[140px]"
                          title="Intervallo per punti"
                        >
                          <option value={5}>5 secondi</option>
                          <option value={10}>10 secondi</option>
                          <option value={15}>15 secondi</option>
                          <option value={20}>20 secondi</option>
                          <option value={30}>30 secondi</option>
                          <option value={45}>45 secondi</option>
                          <option value={60}>60 secondi</option>
                        </select>
                      </div>

                      {/* QR Code */}
                      <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-gray-300 font-medium">QR Code</span>
                          <span className="text-xs text-gray-500">(sempre visibile)</span>
                        </div>
                        <select
                          value={pageIntervals.qr}
                          onChange={(e) => handleUpdatePageInterval('qr', e.target.value)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm min-w-[140px]"
                          title="Intervallo per pagina QR code"
                        >
                          <option value={5}>5 secondi</option>
                          <option value={10}>10 secondi</option>
                          <option value={15}>15 secondi</option>
                          <option value={20}>20 secondi</option>
                          <option value={30}>30 secondi</option>
                          <option value={45}>45 secondi</option>
                          <option value={60}>60 secondi</option>
                        </select>
                      </div>

                      {/* Vincitori */}
                      <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-gray-300 font-medium">Vincitori</span>
                          <span className="text-xs text-gray-500">(solo dopo finale)</span>
                        </div>
                        <select
                          value={pageIntervals.winners || 20}
                          onChange={(e) => handleUpdatePageInterval('winners', e.target.value)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm min-w-[140px]"
                          title="Intervallo per pagina vincitori"
                        >
                          <option value={10}>10 secondi</option>
                          <option value={15}>15 secondi</option>
                          <option value={20}>20 secondi</option>
                          <option value={30}>30 secondi</option>
                          <option value={45}>45 secondi</option>
                          <option value={60}>60 secondi</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      ℹ️ Ogni pagina ha il suo intervallo personalizzato in secondi
                    </p>
                  </div>

                  {/* Show QR Code (only for mobile view) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="block text-sm font-medium text-gray-300">
                        Mostra QR Code (vista smartphone)
                      </div>
                      <p className="text-xs text-gray-400">
                        Aggiunge un QR code in fondo alla pagina mobile
                      </p>
                    </div>
                    <button
                      onClick={handleToggleQRCode}
                      disabled={loading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showQRCode ? 'bg-primary-600' : 'bg-gray-300'
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showQRCode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* QR Code Preview */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-2 text-primary-400 font-medium hover:underline mb-3"
                  >
                    <QrCode className="w-5 h-5" />
                    {showQR ? 'Nascondi' : 'Mostra'} QR Code
                  </button>

                  {showQR && (
                    <div className="bg-gray-600 p-6 rounded-lg inline-block">
                      <QRCodeReact value={mobileUrl} size={200} />
                      <p className="text-center text-sm text-gray-300 mt-3">Vista Smartphone</p>
                    </div>
                  )}
                </div>

                {/* Security */}
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-200 mb-1">Sicurezza</h4>
                      <p className="text-sm text-yellow-300 mb-3">
                        Il token protegge laccesso alla vista pubblica. Se sospetti un uso non
                        autorizzato, rigenera il token per invalidare i vecchi link.
                      </p>
                      <button
                        onClick={handleRegenerateToken}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Rigenera Token
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicViewSettings;
