import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase.js';
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

  const filteredClubs = clubs.filter(
    (club) =>
      club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ClubCard = ({ club }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{club.name}</h3>
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
        {club.address && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {club.address}, {club.city}
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
    </div>
  );

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
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca circoli per nome, indirizzo o città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">{clubs.length}</p>
              <p className="text-sm text-gray-600">Circoli Totali</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {clubs.reduce((sum, club) => sum + (club.stats?.members || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Membri Totali</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {clubs.reduce((sum, club) => sum + (club.stats?.matches || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Partite Totali</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {clubs.reduce((sum, club) => sum + (club.stats?.bookings || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Prenotazioni Totali</p>
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
