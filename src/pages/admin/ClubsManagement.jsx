import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase.js';
import { logAdminAction } from '../../services/auditService.js';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Search,
  Settings,
  Calendar,
  Activity,
} from 'lucide-react';

const ClubsManagement = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, active, inactive
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: '',
    courts: 1,
    openingTime: '08:00',
    closingTime: '22:00',
  });

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const clubsSnap = await getDocs(collection(db, 'clubs'));
      const clubsData = [];

      for (const clubDoc of clubsSnap.docs) {
        const clubData = { id: clubDoc.id, ...clubDoc.data() };

        // Carica statistiche per ogni club
        try {
          const [profilesSnap, matchesSnap, bookingsSnap] = await Promise.all([
            getDocs(collection(db, 'clubs', clubDoc.id, 'profiles')),
            getDocs(collection(db, 'clubs', clubDoc.id, 'matches')),
            getDocs(query(collection(db, 'bookings'), where('clubId', '==', clubDoc.id))),
          ]);

          clubData.stats = {
            members: profilesSnap.size,
            matches: matchesSnap.size,
            bookings: bookingsSnap.size,
          };
        } catch (error) {
          console.warn(`Errore nel caricare le statistiche per ${clubDoc.id}:`, error);
          clubData.stats = { members: 0, matches: 0, bookings: 0 };
        }

        clubsData.push(clubData);
      }

      setClubs(clubsData);
    } catch (error) {
      console.error('Errore nel caricare i circoli:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (clubId, clubName) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare il circolo "${clubName}"? Questa azione non può essere annullata.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'clubs', clubId));
      setClubs(clubs.filter((club) => club.id !== clubId));
      // Audit log (fire-and-forget)
      logAdminAction({
        action: 'delete',
        targetType: 'club',
        targetId: clubId,
        reason: 'Manual delete from Super Admin panel',
        metadata: { clubName },
      });
      alert('Circolo eliminato con successo');
    } catch (error) {
      console.error("Errore nell'eliminare il circolo:", error);
      alert("Errore nell'eliminare il circolo");
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Il nome del circolo è obbligatorio');
      return;
    }

    try {
      const clubData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        description: formData.description.trim(),
        courts: parseInt(formData.courts) || 1,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        createdAt: serverTimestamp(),
        isActive: true,
      };

      const docRef = await addDoc(collection(db, 'clubs'), clubData);

      // Aggiungi il nuovo circolo alla lista locale
      const newClub = {
        id: docRef.id,
        ...clubData,
        stats: { members: 0, matches: 0, bookings: 0 },
      };

      setClubs([...clubs, newClub]);
      setShowCreateModal(false);
      resetForm();
      // Audit log (fire-and-forget)
      logAdminAction({
        action: 'create',
        targetType: 'club',
        targetId: docRef.id,
        reason: 'Club created from Super Admin panel',
        metadata: { clubName: formData.name?.trim() || '' },
      });
      alert('Circolo creato con successo!');
    } catch (error) {
      console.error('Errore nella creazione del circolo:', error);
      alert('Errore nella creazione del circolo');
    }
  };

  const handleEditClub = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Il nome del circolo è obbligatorio');
      return;
    }

    try {
      const clubData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        description: formData.description.trim(),
        courts: parseInt(formData.courts) || 1,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'clubs', editingClub.id), clubData);

      // Aggiorna il circolo nella lista locale
      setClubs(clubs.map((club) => (club.id === editingClub.id ? { ...club, ...clubData } : club)));

      setEditingClub(null);
      resetForm();
      alert('Circolo aggiornato con successo!');
    } catch (error) {
      console.error("Errore nell'aggiornare il circolo:", error);
      alert("Errore nell'aggiornare il circolo");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      description: '',
      googleMapsUrl: '',
      courts: 1,
      openingTime: '08:00',
      closingTime: '22:00',
    });
  };

  const openEditModal = (club) => {
    setFormData({
      name: club.name || '',
      address: club.address || '',
      city: club.city || '',
      phone: club.phone || '',
      email: club.email || '',
      description: club.description || '',
      courts: club.courts || 1,
      openingTime: club.openingTime || '08:00',
      closingTime: club.closingTime || '22:00',
    });
    setEditingClub(club);
  };

  const handleToggleActive = async (clubId, clubName, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'attivare' : 'disattivare';

    if (!window.confirm(`Confermi di voler ${action} il circolo "${clubName}"?`)) {
      return;
    }

    try {
      const clubRef = doc(db, 'clubs', clubId);
      await updateDoc(clubRef, {
        isActive: newStatus,
        status: newStatus ? 'approved' : 'pending',
        updatedAt: serverTimestamp(),
      });

      // Fire-and-forget audit log via callable (do not block UI on failure)
      // Note: Cloud Function enforces admin role via server-side check
      logAdminAction({
        action: newStatus ? 'activate' : 'deactivate',
        targetType: 'club',
        targetId: clubId,
        clubId,
        reason: `Manual ${newStatus ? 'activation' : 'deactivation'} from Super Admin panel`,
        metadata: { clubName },
      });

      // Ricarica i circoli per aggiornare la lista
      await loadClubs();

      alert(`Circolo ${newStatus ? 'attivato' : 'disattivato'} con successo!`);
    } catch (error) {
      console.error('Errore durante il cambio stato del circolo:', error);
      alert('Errore durante il cambio stato del circolo. Riprova.');
    }
  };

  const filteredClubs = clubs.filter((club) => {
    // Filtro per testo di ricerca
    const searchLower = searchTerm.toLowerCase();

    // Gestisci address come stringa o oggetto
    const addressStr =
      typeof club.address === 'string'
        ? club.address
        : club.location?.address || club.address?.street || '';

    // Gestisci city come stringa o oggetto
    const cityStr =
      typeof club.city === 'string' ? club.city : club.location?.city || club.address?.city || '';

    const matchesSearch =
      club.name?.toLowerCase().includes(searchLower) ||
      addressStr.toLowerCase().includes(searchLower) ||
      cityStr.toLowerCase().includes(searchLower);

    // Filtro per stato
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending')
      return matchesSearch && (!club.isActive || club.status === 'pending');
    if (statusFilter === 'active') return matchesSearch && club.isActive === true;
    if (statusFilter === 'inactive')
      return matchesSearch && club.isActive === false && club.status !== 'pending';

    return matchesSearch;
  });

  const ClubCard = ({ club }) => {
    // Determina lo stato del circolo
    const isPending = !club.isActive || club.status === 'pending';
    const isActive = club.isActive === true;
    const isInactive = club.isActive === false && club.status !== 'pending';

    const getStatusBadge = () => {
      if (isPending) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            In Attesa
          </span>
        );
      }
      if (isActive) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Attivo
          </span>
        );
      }
      if (isInactive) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Disattivato
          </span>
        );
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-600">ID: {club.id}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => openEditModal(club)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifica"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/admin/clubs/${club.id}/settings`)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Configurazioni"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteClub(club.id, club.name)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Elimina"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informazioni di contatto */}
        <div className="space-y-2 mb-4">
          {(club.address || club.location) && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                {typeof club.address === 'string'
                  ? `${club.address}${club.city ? `, ${club.city}` : ''}`
                  : club.location?.address || club.location?.city || 'Indirizzo non disponibile'}
              </span>
            </div>
          )}
          {club.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{club.phone}</span>
            </div>
          )}
          {club.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{club.email}</span>
            </div>
          )}
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{club.stats?.members || 0}</p>
            <p className="text-xs text-gray-600">Membri</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
              <Activity className="w-4 h-4" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{club.stats?.matches || 0}</p>
            <p className="text-xs text-gray-600">Partite</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-lg font-semibold text-gray-900">{club.stats?.bookings || 0}</p>
            <p className="text-xs text-gray-600">Prenotazioni</p>
          </div>
        </div>

        {/* Toggle Attivazione/Disattivazione */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleToggleActive(club.id, club.name, club.isActive)}
            className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
              club.isActive
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {club.isActive ? 'Disattiva Circolo' : 'Attiva Circolo'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Caricamento circoli...</span>
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
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Gestione Circoli</h1>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Circolo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca circoli per nome, indirizzo o città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtri per stato */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tutti
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Attesa
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Attivi
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Disattivati
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">{clubs.length}</p>
              <p className="text-sm text-gray-600">Totali</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {clubs.filter((c) => !c.isActive || c.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">In Attesa</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {clubs.filter((c) => c.isActive === true).length}
              </p>
              <p className="text-sm text-gray-600">Attivi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {clubs.filter((c) => c.isActive === false && c.status !== 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Disattivati</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {clubs.reduce((sum, club) => sum + (club.stats?.members || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Membri</p>
            </div>
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 mb-2">
              {searchTerm ? 'Nessun circolo trovato' : 'Nessun circolo presente'}
            </p>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? 'Prova a modificare i termini di ricerca'
                : 'Inizia creando il tuo primo circolo'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crea Primo Circolo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </main>

      {/* Modal di creazione/modifica circolo */}
      {(showCreateModal || editingClub) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={editingClub ? handleEditClub : handleCreateClub} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingClub ? 'Modifica Circolo' : 'Crea Nuovo Circolo'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingClub(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome del circolo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Circolo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Es. Tennis Club Milano"
                  />
                </div>

                {/* Indirizzo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Via Roma 123"
                  />
                </div>

                {/* Città */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Città</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Milano"
                  />
                </div>

                {/* Google Maps URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 Link Google Maps
                  </label>
                  <input
                    type="url"
                    value={formData.googleMapsUrl || ''}
                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://maps.app.goo.gl/... o https://www.google.com/maps/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Incolla il link di Google Maps per permettere il calcolo della distanza
                  </p>
                </div>

                {/* Telefono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+39 02 1234567"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@tennisclub.it"
                  />
                </div>

                {/* Numero campi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero Campi
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.courts}
                    onChange={(e) => setFormData({ ...formData, courts: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Orario apertura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orario Apertura
                  </label>
                  <input
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Orario chiusura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orario Chiusura
                  </label>
                  <input
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Descrizione */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrizione del circolo..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingClub(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingClub ? 'Aggiorna Circolo' : 'Crea Circolo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsManagement;
