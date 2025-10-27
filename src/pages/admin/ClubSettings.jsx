import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase.js';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import {
  ArrowLeft,
  Settings,
  Save,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Euro,
  Users,
  Calendar,
  Shield,
  Bell,
  Palette,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import ClubActivationBanner from '@ui/ClubActivationBanner.jsx';
import LogoEditor from '@components/shared/LogoEditor.jsx';

const ClubSettings = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  // Stati per Logo Editor
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [originalLogoSrc, setOriginalLogoSrc] = useState(null);

  // Form data state
  const [settings, setSettings] = useState({
    // Impostazioni generali
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    googleMapsUrl: '',

    // Configurazioni struttura
    courts: 1,
    openingTime: '08:00',
    closingTime: '22:00',
    slotDuration: 60,

    // Prezzi
    weekdayPrice: 25,
    weekendPrice: 30,
    memberDiscount: 10,

    // Regole di prenotazione
    maxAdvanceBookingDays: 7,
    minBookingDuration: 60,
    maxBookingDuration: 120,
    allowMultipleBookings: true,
    requireDeposit: false,
    depositAmount: 0,

    // Notifiche
    emailNotifications: true,
    smsNotifications: false,
    reminderHours: 24,

    // Aspetto
    primaryColor: '#3B82F6',
    logoUrl: '',

    // Sicurezza
    autoApproveMembers: false,
    requireMembershipApproval: true,
    allowGuestBookings: false,
  });

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      const clubDoc = await getDoc(doc(db, 'clubs', clubId));

      if (clubDoc.exists()) {
        const clubData = clubDoc.data();
        setClub({ id: clubDoc.id, ...clubData });

        // Popola i settings con i dati esistenti
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...clubData,
        }));
      } else {
        alert('Circolo non trovato');
        navigate('/admin/clubs');
      }
    } catch (error) {
      console.error('Errore nel caricare i dati del circolo:', error);
      alert('Errore nel caricare i dati del circolo');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Se c'è un nuovo logo da uploadare, caricalo prima
      let finalLogoUrl = settings.logoUrl;
      if (logoFile) {
        finalLogoUrl = await uploadLogo(logoFile);
      }

      const updateData = {
        ...settings,
        logoUrl: finalLogoUrl,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'clubs', clubId), updateData);

      // Aggiorna lo stato locale
      setSettings((prev) => ({ ...prev, logoUrl: finalLogoUrl }));
      setLogoFile(null);

      alert('Configurazioni salvate con successo!');
    } catch (error) {
      console.error('Errore nel salvare le configurazioni:', error);
      alert('Errore nel salvare le configurazioni: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file) => {
    try {
      setUploading(true);

      const cloudName = 'dlmi2epev';
      const uploadPreset = 'club_logos';

      // Crea FormData per l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `playsport/logos/${clubId}`);
      formData.append('public_id', `logo_${Date.now()}`);

      // Upload su Cloudinary
      console.log('📤 Uploading logo to Cloudinary...');
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

      console.log('✅ Logo caricato con successo su Cloudinary:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("❌ Errore durante l'upload del logo:", error);
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
        alert('Per favore seleziona un file immagine');
        return;
      }

      // Verifica dimensione (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Il file è troppo grande. Dimensione massima: 5MB');
        return;
      }

      // Apri l'editor invece di impostare direttamente il file
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalLogoSrc(reader.result);
        setShowLogoEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestione completamento editor logo
  const handleLogoEditorComplete = async (croppedBlob) => {
    try {
      setShowLogoEditor(false);
      
      // Crea un File dal blob
      const croppedFile = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
      setLogoFile(croppedFile);

      // Anteprima del logo croppato
      const previewUrl = URL.createObjectURL(croppedBlob);
      setSettings((prev) => ({ ...prev, logoUrl: previewUrl }));
    } catch (error) {
      console.error('Errore durante il crop del logo:', error);
      alert('Errore durante l\'elaborazione dell\'immagine');
    }
  };

  // Gestione annullamento editor logo
  const handleLogoEditorCancel = () => {
    setShowLogoEditor(false);
    setOriginalLogoSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setSettings((prev) => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'general', label: 'Generale', icon: Settings },
    { id: 'structure', label: 'Struttura', icon: MapPin },
    { id: 'pricing', label: 'Prezzi', icon: Euro },
    { id: 'booking', label: 'Prenotazioni', icon: Calendar },
    { id: 'notifications', label: 'Notifiche', icon: Bell },
    { id: 'appearance', label: 'Aspetto', icon: Palette },
    { id: 'security', label: 'Sicurezza', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Caricamento configurazioni...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/clubs')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Configurazioni Circolo</h1>
                  <p className="text-sm text-gray-600">{club?.name}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Salvando...' : 'Salva Modifiche'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Stato Attivazione Circolo */}
        <ClubActivationBanner club={club} />

        <div className="flex space-x-8">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Tab Content */}
              {activeTab === 'general' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Informazioni Generali</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Circolo
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sito Web
                      </label>
                      <input
                        type="url"
                        value={settings.website || ''}
                        onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Indirizzo
                      </label>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📍 Link Google Maps
                      </label>
                      <input
                        type="url"
                        value={settings.googleMapsUrl || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, googleMapsUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://maps.app.goo.gl/... o https://www.google.com/maps/..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Incolla il link di Google Maps per permettere il calcolo della distanza
                        nella ricerca circoli
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Città</label>
                      <input
                        type="text"
                        value={settings.city}
                        onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefono
                      </label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrizione
                      </label>
                      <textarea
                        rows="4"
                        value={settings.description}
                        onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'structure' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Configurazioni Struttura</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numero di Campi
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={settings.courts}
                        onChange={(e) =>
                          setSettings({ ...settings, courts: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durata Slot (minuti)
                      </label>
                      <select
                        value={settings.slotDuration}
                        onChange={(e) =>
                          setSettings({ ...settings, slotDuration: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={30}>30 minuti</option>
                        <option value={60}>60 minuti</option>
                        <option value={90}>90 minuti</option>
                        <option value={120}>120 minuti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orario Apertura
                      </label>
                      <input
                        type="time"
                        value={settings.openingTime}
                        onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orario Chiusura
                      </label>
                      <input
                        type="time"
                        value={settings.closingTime}
                        onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Configurazioni Prezzi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prezzo Giorni Feriali (€/ora)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.50"
                        value={settings.weekdayPrice}
                        onChange={(e) =>
                          setSettings({ ...settings, weekdayPrice: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prezzo Weekend (€/ora)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.50"
                        value={settings.weekendPrice}
                        onChange={(e) =>
                          setSettings({ ...settings, weekendPrice: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sconto Soci (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.memberDiscount}
                        onChange={(e) =>
                          setSettings({ ...settings, memberDiscount: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caparra (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.50"
                        value={settings.depositAmount}
                        onChange={(e) =>
                          setSettings({ ...settings, depositAmount: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.requireDeposit}
                          onChange={(e) =>
                            setSettings({ ...settings, requireDeposit: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Richiedi caparra per le prenotazioni
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'booking' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Regole di Prenotazione</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giorni Massimi Anticipo
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.maxAdvanceBookingDays}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            maxAdvanceBookingDays: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durata Minima (minuti)
                      </label>
                      <select
                        value={settings.minBookingDuration}
                        onChange={(e) =>
                          setSettings({ ...settings, minBookingDuration: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={30}>30 minuti</option>
                        <option value={60}>60 minuti</option>
                        <option value={90}>90 minuti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durata Massima (minuti)
                      </label>
                      <select
                        value={settings.maxBookingDuration}
                        onChange={(e) =>
                          setSettings({ ...settings, maxBookingDuration: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={60}>60 minuti</option>
                        <option value={90}>90 minuti</option>
                        <option value={120}>120 minuti</option>
                        <option value={180}>180 minuti</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.allowMultipleBookings}
                          onChange={(e) =>
                            setSettings({ ...settings, allowMultipleBookings: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Consenti prenotazioni multiple
                        </span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.allowGuestBookings}
                          onChange={(e) =>
                            setSettings({ ...settings, allowGuestBookings: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Consenti prenotazioni ospiti</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Configurazioni Notifiche</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Promemoria (ore prima)
                        </label>
                        <select
                          value={settings.reminderHours}
                          onChange={(e) =>
                            setSettings({ ...settings, reminderHours: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={1}>1 ora</option>
                          <option value={2}>2 ore</option>
                          <option value={6}>6 ore</option>
                          <option value={12}>12 ore</option>
                          <option value={24}>24 ore</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) =>
                            setSettings({ ...settings, emailNotifications: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Notifiche Email</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.smsNotifications}
                          onChange={(e) =>
                            setSettings({ ...settings, smsNotifications: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Notifiche SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Personalizzazione Aspetto</h3>
                  <div className="space-y-8">
                    {/* Upload Logo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Logo del Circolo
                      </label>

                      <div className="flex flex-col space-y-4">
                        {/* Anteprima Logo */}
                        {settings.logoUrl ? (
                          <div className="relative inline-block">
                            <div className="w-48 h-48 border-2 border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                              <img
                                src={settings.logoUrl}
                                alt="Logo circolo"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              title="Rimuovi logo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-sm">Nessun logo</span>
                          </div>
                        )}

                        {/* Pulsante Upload */}
                        <div className="flex items-center space-x-3">
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
                            disabled={uploading}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <Upload className="w-4 h-4" />
                            <span>{uploading ? 'Caricamento...' : 'Carica Logo'}</span>
                          </button>
                          {logoFile && (
                            <span className="text-sm text-green-600 flex items-center space-x-1">
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
                              <span>Nuovo logo selezionato</span>
                            </span>
                          )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs text-blue-800">
                            <strong>💡 Suggerimenti:</strong>
                          </p>
                          <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                            <li>Formato consigliato: PNG con sfondo trasparente</li>
                            <li>Dimensioni consigliate: 512x512 px (quadrato)</li>
                            <li>Dimensione massima file: 5 MB</li>
                            <li>Formati supportati: JPG, PNG, GIF, SVG, WebP</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Colore Primario */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Colore Primario
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) =>
                            setSettings({ ...settings, primaryColor: e.target.value })
                          }
                          className="w-16 h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.primaryColor}
                          onChange={(e) =>
                            setSettings({ ...settings, primaryColor: e.target.value })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Configurazioni Sicurezza</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.autoApproveMembers}
                        onChange={(e) =>
                          setSettings({ ...settings, autoApproveMembers: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Approva automaticamente nuovi membri
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.requireMembershipApproval}
                        onChange={(e) =>
                          setSettings({ ...settings, requireMembershipApproval: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Richiedi approvazione per iscrizioni
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Logo Editor Modal */}
      {showLogoEditor && originalLogoSrc && (
        <LogoEditor
          imageSrc={originalLogoSrc}
          onComplete={handleLogoEditorComplete}
          onCancel={handleLogoEditorCancel}
        />
      )}
    </div>
  );
};

export default ClubSettings;
