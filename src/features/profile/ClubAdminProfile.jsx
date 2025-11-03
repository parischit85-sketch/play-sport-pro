// =============================================
// FILE: src/features/profile/ClubAdminProfile.jsx
// PROFILO COMPLETO DEL CIRCOLO PER ADMIN
// =============================================
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@contexts/NotificationContext';
import Section from '@ui/Section.jsx';
import { useAuth } from '@contexts/AuthContext.jsx';
// import { useUI } from '@contexts/UIContext.jsx'; // Rimosso - tema scuro forzato
import { loadAdminDashboardData } from '@services/adminDashboard.js';
import { useClubSettings } from '@hooks/useClubSettings.js';
import { db } from '@services/firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import GDPRRequestsPanel from '@features/admin/GDPRRequestsPanel.jsx';

export default function ClubAdminProfile({ T, club, clubId }) {
  const navigate = useNavigate();
  // useUI() non più necessario - tema scuro forzato
  const { logout } = useAuth();
  const { showSuccess, showError, showWarning, confirm } = useNotifications();
  const { lessonConfig, updateLessonConfig } = useClubSettings({ clubId });

  // Stati per upload logo
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  // ClubAdminProfile component initialized
  // Inizializza il componente
  // console.log('🏛️ ClubAdminProfile initialized with:', { clubId, clubName });

  const [clubData, setClubData] = useState(club);
  const [loadingClub, setLoadingClub] = useState(!club);

  const [clubStats, setClubStats] = useState({
    totalMembers: 0,
    activeInstructors: 0,
    totalCourts: 0,
    monthlyRevenue: 0,
    weeklyBookings: 0,
    activeTimeSlots: 0,
    loading: true,
  });

  const [clubSettings, setClubSettings] = useState({
    name: clubData?.name || '',
    description: clubData?.description || '',
    address: clubData?.address || '',
    phone: clubData?.phone || '',
    email: clubData?.email || '',
    website: clubData?.website || '',
    googleMapsUrl: clubData?.location?.googleMapsUrl || clubData?.googleMapsUrl || '',
    logoUrl: clubData?.logoUrl || '',
    openingHours: clubData?.openingHours || '',
    facilities: clubData?.facilities || [],
    pricing: clubData?.pricing || {},
    courtTypes: clubData?.courtTypes || ['Indoor', 'Outdoor', 'Covered'],
    loading: false,
  });

  useEffect(() => {
    if (clubId) {
      loadClubData();
      loadClubStats();
    }
  }, [clubId]);

  // Load club data if not provided
  const loadClubData = async () => {
    if (clubData || !clubId) return; // Already have data or no clubId

    try {
      setLoadingClub(true);

      // Import clubs service dynamically
      const { getClub } = await import('@services/clubs.js');
      const club = await getClub(clubId);

      if (club) {
        setClubData(club);
        setClubSettings({
          name: club.name || '',
          description: club.description || '',
          address:
            typeof club.address === 'object'
              ? `${club.address.street || ''}, ${club.address.city || ''}, ${club.address.province || ''} ${club.address.postalCode || ''}`.trim()
              : club.address || '',
          phone: club.contact?.phone || club.phone || '',
          email: club.contact?.email || club.email || '',
          website: club.contact?.website || club.website || '',
          googleMapsUrl: club.googleMapsLink || '',
          logoUrl: club.logoUrl || '',
          openingHours: club.openingHours || '',
          facilities: club.facilities || [],
          pricing: club.pricing || {},
          courtTypes: club.courtTypes || ['Indoor', 'Outdoor', 'Covered'],
          loading: false,
        });
      } else {
        console.error('⚠️ Club not found:', clubId);
        // Create minimal fallback if club not found
        const fallbackClub = {
          id: clubId,
          name: clubId === 'sporting-cat' ? 'Sporting CAT' : `Club ${clubId}`,
          description: 'Dati del club in caricamento...',
          address: '',
          phone: '',
          email: '',
          website: '',
          openingHours: '',
          facilities: [],
          pricing: {},
        };
        setClubData(fallbackClub);
        setClubSettings({
          name: fallbackClub.name,
          description: fallbackClub.description,
          address: fallbackClub.address,
          phone: fallbackClub.phone,
          email: fallbackClub.email,
          website: fallbackClub.website,
          logoUrl: fallbackClub.logoUrl || '',
          openingHours: fallbackClub.openingHours,
          facilities: fallbackClub.facilities,
          pricing: fallbackClub.pricing,
          courtTypes: ['Indoor', 'Outdoor', 'Covered'],
          loading: false,
        });
      }
    } catch (error) {
      console.error('❌ Error loading club data:', error);
    } finally {
      setLoadingClub(false);
    }
  };

  const loadClubStats = async () => {
    if (!clubId) {
      console.error('ClubId non disponibile per caricare le statistiche');
      setClubStats((prev) => ({ ...prev, loading: false }));
      return;
    }
    try {
      const data = await loadAdminDashboardData(clubId);

      // Calcola statistiche mensili e settimanali basate sui dati reali
      const todayRevenue = data.stats?.todayRevenue || 0;
      const estimatedMonthlyRevenue = todayRevenue * 30; // Stima mensile basata su oggi
      const weeklyBookings = data.stats?.weeklyBookings || 0;

      setClubStats({
        totalMembers: data.stats?.memberCount || 0,
        activeInstructors: data.availableInstructors?.length || 0,
        totalCourts: data.courts?.length || 0,
        monthlyRevenue: estimatedMonthlyRevenue,
        weeklyBookings: weeklyBookings,
        activeTimeSlots: lessonConfig?.timeSlots?.filter((slot) => slot.isActive)?.length || 0,
        // Aggiungiamo nuove statistiche più dettagliate
        todayBookings: data.stats?.todayBookingsCount || 0,
        todayLessons: data.stats?.todayLessonsCount || 0,
        todayRevenue: todayRevenue,
        courtUtilization: data.stats?.courtUtilization || 0,
        loading: false,
      });
      // Stats updated successfully
    } catch (error) {
      console.error('❌ Errore nel caricamento statistiche:', error);
      setClubStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Esci dall'account",
      message: 'Sei sicuro di voler uscire?',
      variant: 'warning',
      confirmText: 'Esci',
      cancelText: 'Annulla',
    });
    if (!confirmed) return;

    await logout();
    navigate('/', { replace: true });
    window.location.reload();
  };

  const handleSaveCourtTypes = async () => {
    if (!clubId) {
      showError('ID circolo non disponibile');
      return;
    }

    try {
      setClubSettings((prev) => ({ ...prev, loading: true }));

      // Import updateClub dynamically
      const { updateClub } = await import('@services/clubs.js');

      // Save only courtTypes to Firebase
      await updateClub(clubId, {
        courtTypes: clubSettings.courtTypes || [],
      });

      // Update local clubData to reflect changes
      setClubData((prev) => ({
        ...prev,
        courtTypes: clubSettings.courtTypes || [],
      }));

      showSuccess('Tipologie campo salvate con successo!');
    } catch (error) {
      console.error('Errore nel salvataggio delle tipologie:', error);
      showError('Errore nel salvataggio delle tipologie. Riprova.');
    } finally {
      setClubSettings((prev) => ({ ...prev, loading: false }));
    }
  };

  // Funzioni per gestione upload logo con Cloudinary
  const uploadLogo = async (file) => {
    try {
      setUploading(true);

      const cloudName = 'dlmi2epev';
      const uploadPreset = 'club_logos'; // Preset creato su Cloudinary

      // Crea FormData per l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `playsport/logos/${clubId}`);
      formData.append('public_id', `logo_${Date.now()}`);

      // Upload su Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error details:', error);
        throw new Error(error.error?.message || 'Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      return imageUrl;
    } catch (error) {
      console.error("❌ Errore durante l'upload del logo:", error);
      showError('Errore upload: ' + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verifica che sia un'immagine
      if (!file.type.startsWith('image/')) {
        showWarning('Per favore seleziona un file immagine');
        return;
      }

      // Verifica dimensione (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showWarning('Il file è troppo grande. Dimensione massima: 5MB');
        return;
      }

      setLogoFile(file);

      // Crea anteprima
      const reader = new FileReader();
      reader.onload = (e) => {
        setClubSettings((prev) => ({ ...prev, logoUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setClubSettings((prev) => ({ ...prev, logoUrl: clubData?.logoUrl || '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Funzione per salvare le impostazioni generali del circolo
  const handleSaveSettings = async () => {
    if (!clubId) {
      showError('❌ ID circolo non disponibile');
      return;
    }

    setClubSettings((prev) => ({ ...prev, loading: true }));

    try {
      // Import updateClub service dynamically
      const { updateClub } = await import('@services/clubs.js');

      // Prepara i dati da salvare
      const updateData = {
        name: clubSettings.name,
        phone: clubSettings.phone,
        email: clubSettings.email,
        website: clubSettings.website,
        address: clubSettings.address,
        description: clubSettings.description,
        location: {
          ...(clubData?.location || {}),
          googleMapsUrl: clubSettings.googleMapsUrl,
        },
      };

      await updateClub(clubId, updateData);

      showSuccess('✅ Impostazioni salvate con successo!');

      // Ricarica i dati del circolo
      await loadClubData();
    } catch (error) {
      console.error('❌ Error saving club settings:', error);
      showError('❌ Errore nel salvare le impostazioni. Riprova.');
    } finally {
      setClubSettings((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSaveLogo = async () => {
    if (!clubId) {
      showError('ID circolo non disponibile');
      return;
    }

    if (!logoFile) {
      showWarning("Seleziona prima un'immagine");
      return;
    }

    try {
      setClubSettings((prev) => ({ ...prev, loading: true }));

      // Upload del logo
      const logoUrl = await uploadLogo(logoFile);

      // Salva l'URL nel database
      await updateDoc(doc(db, 'clubs', clubId), {
        logoUrl: logoUrl,
      });

      // Aggiorna lo stato locale
      setClubSettings((prev) => ({ ...prev, logoUrl }));
      setClubData((prev) => ({ ...prev, logoUrl }));
      setLogoFile(null);

      showSuccess('Logo caricato con successo!');
    } catch (error) {
      console.error('Errore nel salvataggio del logo:', error);
      showError('Errore nel salvataggio del logo: ' + error.message);
    } finally {
      setClubSettings((prev) => ({ ...prev, loading: false }));
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div
      className={`bg-gradient-to-r ${color} rounded-2xl p-6 border border-gray-700/20 shadow-xl`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-white/80 text-sm">{title}</div>
        </div>
      </div>
      {description && <div className="text-white/70 text-xs">{description}</div>}
    </div>
  );

  // Show loading state while club data is being loaded
  if (loadingClub || (!clubData && clubId)) {
    return (
      <Section title="Profilo Circolo" T={T}>
        <div className={`rounded-2xl ${T.cardBg} ${T.border} p-4`}>
          <div className="text-sm">Caricamento profilo circolo...</div>
        </div>
      </Section>
    );
  }

  // Show error if no club data available
  if (!clubData && !loadingClub) {
    return (
      <Section title="Profilo Circolo" T={T}>
        <div className={`rounded-2xl ${T.cardBg} ${T.border} p-4`}>
          <div className="text-sm text-red-500">
            ❌ Errore nel caricamento dei dati del circolo.
            <button
              onClick={() => window.location.reload()}
              className="ml-2 text-blue-500 underline"
            >
              Riprova
            </button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Profilo Circolo */}
      <Section title={`Profilo Circolo - ${clubData?.name || 'Club Admin'} 🏟️`} T={T}>
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/20 p-6 space-y-6 shadow-2xl">
          {/* Info principale del circolo */}
          <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl backdrop-blur-sm border border-green-700/30">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
              🏟️
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-white truncate mb-1">
                {clubData?.name || 'Club Admin'}
              </h3>
              <p className="text-green-400 text-lg truncate mb-2">
                {typeof clubData?.address === 'object'
                  ? `${clubData.address.street || ''}, ${clubData.address.city || ''}`
                      .trim()
                      .replace(/^,\s*/, '')
                  : clubData?.address || 'Indirizzo non specificato'}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-emerald-900/30 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-400">Circolo Attivo</span>
                </div>
                {clubData?.isPremium && (
                  <div className="flex items-center gap-1 bg-yellow-900/30 px-3 py-1 rounded-full">
                    <span className="text-yellow-600">⭐</span>
                    <span className="text-xs font-medium text-yellow-400">Premium</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Theme Toggle RIMOSSO - Tema scuro forzato */}

          {/* Pulsante Dashboard Admin */}
          <div className="pt-6 border-t border-gray-600/20">
            <button
              type="button"
              onClick={() => navigate(`/club/${clubId}/admin/dashboard`)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              📊 Dashboard Admin
            </button>
          </div>

          {/* Pulsante Logout */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              🚪 Esci dall'account
            </button>
          </div>
        </div>
      </Section>

      {/* Statistiche del Circolo */}
      <Section title="Statistiche Circolo 📊" T={T}>
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/20 p-6 shadow-2xl">
          {clubStats.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm">Caricamento statistiche...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Prenotazioni Oggi"
                value={clubStats.todayBookings || 0}
                icon="�"
                color="from-blue-500 to-blue-600"
                description="Prenotazioni campi oggi"
              />
              <StatCard
                title="Lezioni Oggi"
                value={clubStats.todayLessons || 0}
                icon="🎾"
                color="from-green-500 to-green-600"
                description="Lezioni programmate oggi"
              />
              <StatCard
                title="Ricavi Oggi"
                value={`€${(clubStats.todayRevenue || 0).toLocaleString()}`}
                icon="💰"
                color="from-emerald-500 to-emerald-600"
                description="Incassi di oggi"
              />
              <StatCard
                title="Utilizzo Campi"
                value={`${Math.round(clubStats.courtUtilization || 0)}%`}
                icon="🏟️"
                color="from-purple-500 to-purple-600"
                description="Occupazione campi oggi"
              />
              <StatCard
                title="Maestri Attivi"
                value={clubStats.activeInstructors}
                icon="👨‍🏫"
                color="from-orange-500 to-orange-600"
                description="Istruttori disponibili"
              />
              <StatCard
                title="Campi Totali"
                value={clubStats.totalCourts}
                icon="🏟️"
                color="from-indigo-500 to-indigo-600"
                description="Campi da padel disponibili"
              />
            </div>
          )}
        </div>
      </Section>

      {/* Impostazioni Circolo */}
      <Section title="Impostazioni Circolo ⚙️" T={T}>
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/20 p-6 shadow-2xl">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Nome Circolo</label>
                <input
                  className="w-full px-4 py-3 bg-gray-700/60 backdrop-blur-xl border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={clubSettings.name}
                  onChange={(e) => setClubSettings((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome del circolo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Telefono</label>
                <input
                  className="w-full px-4 py-3 bg-gray-700/60 backdrop-blur-xl border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={clubSettings.phone}
                  onChange={(e) => setClubSettings((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+39 123 456 7890"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-700/60 backdrop-blur-xl border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={clubSettings.email}
                  onChange={(e) => setClubSettings((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="info@circolo.it"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Sito Web</label>
                <input
                  className="w-full px-4 py-3 bg-gray-700/60 backdrop-blur-xl border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={clubSettings.website}
                  onChange={(e) =>
                    setClubSettings((prev) => ({ ...prev, website: e.target.value }))
                  }
                  placeholder="https://www.circolo.it"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-300">Indirizzo</label>
                <input
                  className="w-full px-4 py-3 bg-gray-700/60 backdrop-blur-xl border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={clubSettings.address}
                  onChange={(e) =>
                    setClubSettings((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Via Roma 123, 00100 Roma (RM)"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-300">📍 Link Google Maps</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 bg-gray-700/60 backdrop-blur-xl border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={clubSettings.googleMapsUrl}
                  onChange={(e) =>
                    setClubSettings((prev) => ({ ...prev, googleMapsUrl: e.target.value }))
                  }
                  placeholder="https://www.google.com/maps/..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 Usa il link completo di Google Maps (non link abbreviati maps.app.goo.gl)
                </p>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-300">Descrizione</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/60 backdrop-blur-xl border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  value={clubSettings.description}
                  onChange={(e) =>
                    setClubSettings((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descrizione del circolo, servizi offerti, orari..."
                />
              </div>

              {/* Sezione Upload Logo */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-semibold text-gray-300 block">
                  🎨 Logo del Circolo
                </label>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Anteprima Logo */}
                  <div className="flex-shrink-0">
                    {clubSettings.logoUrl ? (
                      <div className="relative group">
                        <div className="w-40 h-40 border-2 border-gray-600 rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center shadow-lg">
                          <img
                            src={clubSettings.logoUrl}
                            alt="Logo circolo"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        {logoFile && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="Rimuovi logo"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-40 h-40 border-2 border-dashed border-gray-600 rounded-2xl bg-gray-900 flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm">Nessun logo</span>
                      </div>
                    )}
                  </div>

                  {/* Controlli Upload */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || clubSettings.loading}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span>{uploading ? 'Caricamento...' : 'Seleziona Logo'}</span>
                      </button>

                      {logoFile && (
                        <button
                          type="button"
                          onClick={handleSaveLogo}
                          disabled={uploading || clubSettings.loading}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Salva Logo</span>
                        </button>
                      )}
                    </div>

                    {logoFile && (
                      <div className="bg-green-900/20 border border-green-700 rounded-xl p-3">
                        <p className="text-sm text-green-400 flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>
                            Nuovo logo selezionato: <strong>{logoFile.name}</strong>
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4">
                      <p className="text-xs font-semibold text-blue-300 mb-2">
                        💡 Suggerimenti per il logo:
                      </p>
                      <ul className="text-xs text-blue-400 space-y-1 ml-4 list-disc">
                        <li>Formato consigliato: PNG con sfondo trasparente</li>
                        <li>Dimensioni consigliate: 512x512 px (quadrato)</li>
                        <li>Dimensione massima file: 5 MB</li>
                        <li>Formati supportati: JPG, PNG, GIF, SVG, WebP</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-600/20">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                disabled={clubSettings.loading}
              >
                {clubSettings.loading ? 'Salvando...' : 'Salva Impostazioni'}
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Tipologie Campo */}
      <Section title="🏓 Tipologie Campo" T={T}>
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/20 p-6 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Gestione Tipologie Campo</h3>
                <p className="text-sm text-gray-400">
                  Definisci le tipologie di campo disponibili nel tuo circolo (es. Indoor, Outdoor,
                  Covered)
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  // TODO: Replace prompt with custom input dialog
                  const newType = prompt('Nome della nuova tipologia:');
                  if (newType && newType.trim()) {
                    const trimmedType = newType.trim();
                    setClubSettings((prev) => {
                      const currentTypes = prev.courtTypes || [];
                      // Check if type already exists (case-insensitive)
                      if (
                        currentTypes.some(
                          (type) => type.toLowerCase() === trimmedType.toLowerCase()
                        )
                      ) {
                        showWarning(`La tipologia "${trimmedType}" esiste già!`);
                        return prev;
                      }
                      return {
                        ...prev,
                        courtTypes: [...currentTypes, trimmedType],
                      };
                    });
                  }
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                ➕ Aggiungi Tipologia
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(clubSettings.courtTypes || []).map((type, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-3 rounded-xl border border-blue-700/30"
                >
                  <span className="font-medium text-white">{type}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Rimuovi tipologia',
                        message: `Rimuovere la tipologia "${type}"?`,
                        variant: 'danger',
                        confirmText: 'Rimuovi',
                        cancelText: 'Annulla',
                      });
                      if (!confirmed) return;

                      setClubSettings((prev) => ({
                        ...prev,
                        courtTypes: prev.courtTypes.filter((_, i) => i !== index),
                      }));
                    }}
                    className="text-red-500 hover:bg-red-900/20 p-1 rounded transition-colors"
                    title="Rimuovi tipologia"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {(clubSettings.courtTypes || []).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-2xl mb-2">🏓</div>
                <div>Nessuna tipologia definita</div>
                <div className="text-sm">
                  Aggiungi almeno una tipologia per classificare i tuoi campi
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-600/20">
              <button
                type="button"
                onClick={handleSaveCourtTypes}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                disabled={clubSettings.loading}
              >
                {clubSettings.loading ? '💾 Salvando...' : '💾 Salva Tipologie'}
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Richieste GDPR */}
      <Section title="Richieste GDPR 🔒" T={T}>
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/20 p-6 shadow-2xl">
          <GDPRRequestsPanel clubId={clubId} />
        </div>
      </Section>

      {/* Accessi Rapidi */}
      <Section title="Accessi Rapidi 🚀" T={T}>
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-700/20 p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/club/${clubId}/admin/bookings`)}
              className="p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl border border-blue-700/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-semibold text-white">Gestione Prenotazioni</div>
              <div className="text-sm text-gray-400">Gestisci le prenotazioni dei campi</div>
            </button>

            <button
              onClick={() => navigate(`/club/${clubId}/admin/lessons`)}
              className="p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-700/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-2xl mb-2">🎾</div>
              <div className="font-semibold text-white">Lezioni e Maestri</div>
              <div className="text-sm text-gray-400">Gestisci lezioni e istruttori</div>
            </button>

            <button
              onClick={() => navigate(`/club/${clubId}/admin/members`)}
              className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-700/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold text-white">Membri</div>
              <div className="text-sm text-gray-400">Gestisci i membri del circolo</div>
            </button>

            <button
              onClick={() => navigate(`/club/${clubId}/admin/courts`)}
              className="p-4 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-2xl border border-orange-700/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-2xl mb-2">🏟️</div>
              <div className="font-semibold text-white">Campi</div>
              <div className="text-sm text-gray-400">Gestisci i campi da padel</div>
            </button>

            <button
              onClick={() => navigate(`/club/${clubId}/admin/settings`)}
              className="p-4 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-2xl border border-yellow-700/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-semibold text-white">Impostazioni</div>
              <div className="text-sm text-gray-400">Configura tariffe e orari</div>
            </button>

            <button
              onClick={() => navigate(`/club/${clubId}/admin/reports`)}
              className="p-4 bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-2xl border border-teal-700/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-white">Report</div>
              <div className="text-sm text-gray-400">Analisi e statistiche</div>
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
