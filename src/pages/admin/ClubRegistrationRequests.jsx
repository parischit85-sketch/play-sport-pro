// =============================================
// FILE: src/pages/admin/ClubRegistrationRequests.jsx
// Gestione richieste di registrazione circoli
// =============================================
import React, { useState, useEffect } from 'react';
import { useNotifications } from '@contexts/NotificationContext';
import { db } from '@services/firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Building2,
  Check,
  X,
  Eye,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react';

export default function ClubRegistrationRequests() {
  const { showSuccess, showError, confirm } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'clubRegistrationRequests'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
      showError('Errore nel caricamento delle richieste');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    const confirmed = await confirm({
      title: 'Approva richiesta',
      message: `Confermi di voler approvare la richiesta per "${request.name}"?`,
      variant: 'success',
      confirmText: 'Approva',
      cancelText: 'Annulla',
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      // Nota: Il logo viene salvato come Base64 nel documento del circolo
      // Per caricare su Storage, devi prima configurare le regole Firebase Storage
      // Vedi: CLUB_REGISTRATION_SYSTEM.md per le istruzioni

      // 1. Crea il circolo nella collection clubs
      const clubData = {
        name: request.name,
        description: request.description || '',
        address: request.address,
        location: {
          city: request.address.city,
          province: request.address.province || '',
          coordinates: null,
        },
        contact: request.contact,
        logo: request.logoBase64 || null,
        settings: {
          bookingDuration: 90,
          advanceBookingDays: 14,
          cancellationHours: 24,
          allowGuestBooking: false,
        },
        sports: [],
        courts: [],
        instructors: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        status: 'approved',
        ownerId: request.adminData?.userId,
        ownerEmail: request.adminData?.email,
        managers: [request.adminData?.userId],
      };

      const clubRef = await addDoc(collection(db, 'clubs'), clubData);
      const clubId = clubRef.id;

      // 2. Crea il record affiliations per l'admin del circolo
      if (request.adminData?.userId) {
        await addDoc(collection(db, 'affiliations'), {
          userId: request.adminData.userId,
          clubId: clubId,
          role: 'club_admin',
          status: 'approved',
          isClubAdmin: true,
          
          // Permission flags
          canManageBookings: true,
          canManageCourts: true,
          canManageInstructors: true,
          canViewReports: true,
          canManageMembers: true,
          canManageSettings: true,
          
          requestedAt: serverTimestamp(),
          approvedAt: serverTimestamp(),
          joinedAt: serverTimestamp(),
          _createdAt: serverTimestamp(),
          _updatedAt: serverTimestamp(),
        });
      }

      // 3. Aggiorna lo status della richiesta
      await updateDoc(doc(db, 'clubRegistrationRequests', request.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        clubId: clubId,
      });

      showSuccess(
        `✅ Circolo "${request.name}" approvato con successo!\n\nID Circolo: ${clubId}\n${request.adminData ? `Admin: ${request.adminData.firstName} ${request.adminData.lastName}` : ''}`
      );
      loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      showError("❌ Errore durante l'approvazione: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request) => {
    // TODO: Replace prompt with custom dialog input
    const reason = prompt('Motivo del rifiuto (opzionale):');
    if (reason === null) return; // Cancellato

    setProcessing(true);
    try {
      await updateDoc(doc(db, 'clubRegistrationRequests', request.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectionReason: reason || 'Non specificato',
      });

      showSuccess(`❌ Richiesta rifiutata`);
      loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      showError('Errore durante il rifiuto');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/D';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento richieste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Richieste di Registrazione Circoli
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestisci le richieste di nuovi circoli sportivi
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {requests.length}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">In Attesa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Richieste */}
      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nessuna richiesta in attesa
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Al momento non ci sono richieste di registrazione da approvare
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    {request.logoBase64 ? (
                      <img
                        src={request.logoBase64}
                        alt={request.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                    )}

                    {/* Info */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {request.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Richiesta il {formatDate(request.requestedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSelectedRequest(selectedRequest?.id === request.id ? null : request)
                      }
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {selectedRequest?.id === request.id ? 'Nascondi' : 'Dettagli'}
                    </button>
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approva
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      disabled={processing}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Rifiuta
                    </button>
                  </div>
                </div>

                {/* Dettagli Espansi */}
                {selectedRequest?.id === request.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Colonna 1 */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Descrizione
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {request.description || 'Nessuna descrizione fornita'}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Indirizzo
                          </h4>
                          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                              <p>{request.address.street}</p>
                              <p>
                                {request.address.postalCode} {request.address.city} (
                                {request.address.province})
                              </p>
                              <p>{request.address.country}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Colonna 2 */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Contatti
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Phone className="w-5 h-5" />
                              <a
                                href={`tel:${request.contact.phone}`}
                                className="hover:text-blue-600"
                              >
                                {request.contact.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Mail className="w-5 h-5" />
                              <a
                                href={`mailto:${request.contact.email}`}
                                className="hover:text-blue-600"
                              >
                                {request.contact.email}
                              </a>
                            </div>
                            {request.contact.website && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Globe className="w-5 h-5" />
                                <a
                                  href={request.contact.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600"
                                >
                                  {request.contact.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
