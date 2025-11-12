/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase.js';
import { collection, getDocs, doc, updateDoc, setDoc, query } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { invalidateUserProfileCache } from '../../services/auth.jsx';
import {
  Users,
  ArrowLeft,
  Search,
  Mail,
  Calendar,
  UserCog,
  Crown,
  Building2,
  Edit,
  UserX,
} from 'lucide-react';

const UsersManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser, reloadUserData } = useAuth();
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('all');
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    isActive: true,
    notes: '',
    skipEmailVerification: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carica tutti i circoli
      const clubsSnap = await getDocs(collection(db, 'clubs'));
      const clubsData = clubsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClubs(clubsData);

      // Carica tutti gli utenti da tutti i circoli
      const userMap = new Map(); // Per evitare duplicati

      for (const club of clubsData) {
        try {
          const profilesSnap = await getDocs(collection(db, 'clubs', club.id, 'profiles'));

          for (const profileDoc of profilesSnap.docs) {
            const profileData = profileDoc.data();
            const userId = profileDoc.id;

            if (!userMap.has(userId)) {
              // Carica le affiliazioni dell'utente
              const affiliationsSnap = await getDocs(
                query(collection(db, 'clubs', club.id, 'affiliations'))
              );

              const userAffiliations = affiliationsSnap.docs
                .filter((doc) => doc.data().userId === userId)
                .map((doc) => ({
                  clubId: club.id,
                  clubName: club.name,
                  ...doc.data(),
                }));

              // Controlla se l'utente è admin di questo club
              const isClubAdmin =
                profileData.role === 'admin' ||
                profileData.isClubAdmin === true ||
                userAffiliations.some((aff) => aff.role === 'admin' || aff.isClubAdmin === true) ||
                club.managers?.includes(userId);

              const adminClubs = isClubAdmin ? [club.id] : [];

              const userData = {
                id: userId,
                email: profileData.email || 'Non disponibile',
                displayName: profileData.displayName || profileData.nome || 'Nome non disponibile',
                createdAt: profileData._createdAt || profileData._updatedAt,
                lastLogin: profileData._updatedAt,
                clubs: userAffiliations,
                isAdmin: isClubAdmin,
                adminClubs: adminClubs,
                skipEmailVerification: profileData.skipEmailVerification || false,
                phone: profileData.phone || '',
                isActive: profileData.isActive !== false,
                notes: profileData.notes || '',
              };

              console.log('👤 [UsersManagement] Loaded user:', {
                id: userId,
                email: userData.email,
                skipEmailVerification: userData.skipEmailVerification,
              });

              userMap.set(userId, userData);
            } else {
              // Aggiungi questo club alle affiliazioni dell'utente esistente
              const existingUser = userMap.get(userId);
              const affiliationsSnap = await getDocs(
                query(collection(db, 'clubs', club.id, 'affiliations'))
              );

              const clubAffiliations = affiliationsSnap.docs
                .filter((doc) => doc.data().userId === userId)
                .map((doc) => ({
                  clubId: club.id,
                  clubName: club.name,
                  ...doc.data(),
                }));

              existingUser.clubs.push(...clubAffiliations);

              // Controlla se è admin anche di questo club
              const profileData = profileDoc.data();
              const isClubAdmin =
                profileData.role === 'admin' ||
                profileData.isClubAdmin === true ||
                clubAffiliations.some((aff) => aff.role === 'admin' || aff.isClubAdmin === true) ||
                club.managers?.includes(userId);

              if (isClubAdmin) {
                existingUser.isAdmin = true;
                if (!existingUser.adminClubs.includes(club.id)) {
                  existingUser.adminClubs.push(club.id);
                }
              }

              // Aggiorna anche skipEmailVerification se presente nel profilo
              if (profileData.skipEmailVerification !== undefined) {
                existingUser.skipEmailVerification = profileData.skipEmailVerification;
              }
            }
          }
        } catch (error) {
          // Errore non critico - i dati verranno caricati dalla collezione 'users' globale
          console.debug(
            `⚠️ [UsersManagement] Impossibile caricare profili per ${club.id} (non critico):`,
            error.code
          );
        }
      }

      // Carica anche gli utenti dalla collezione globale 'users'
      // per includere utenti senza affiliazioni a club
      console.log('🔍 [UsersManagement] Loading users from global collection...');
      try {
        const globalUsersSnap = await getDocs(collection(db, 'users'));
        console.log(
          `📊 [UsersManagement] Found ${globalUsersSnap.docs.length} users in global collection`
        );

        for (const userDoc of globalUsersSnap.docs) {
          const userId = userDoc.id;
          const userData = userDoc.data();

          if (!userMap.has(userId)) {
            // Utente non trovato nei club, aggiungilo dalla collezione globale
            console.log('➕ [UsersManagement] Adding user from global collection:', {
              id: userId,
              email: userData.email,
              skipEmailVerification: userData.skipEmailVerification,
            });

            userMap.set(userId, {
              id: userId,
              email: userData.email || 'Non disponibile',
              displayName:
                userData.displayName ||
                userData.firstName + ' ' + userData.lastName ||
                'Nome non disponibile',
              createdAt: userData.registeredAt || userData._createdAt,
              lastLogin: userData._updatedAt,
              clubs: [], // Nessuna affiliazione a club
              isAdmin: false,
              adminClubs: [],
              skipEmailVerification: userData.skipEmailVerification || false,
              phone: userData.phone || '',
              isActive: userData.isActive !== false,
              notes: userData.notes || '',
            });
          } else {
            // Utente già esistente, aggiorna skipEmailVerification dalla collezione globale
            const existingUser = userMap.get(userId);
            if (userData.skipEmailVerification !== undefined) {
              console.log(
                '🔄 [UsersManagement] Updating skipEmailVerification from global for:',
                userId,
                userData.skipEmailVerification
              );
              existingUser.skipEmailVerification = userData.skipEmailVerification;
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Errore nel caricare gli utenti dalla collezione globale:', error);
      }

      setUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error('Errore nel caricare i dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (user, clubId) => {
    console.log('🚀 [PROMOTE DEBUG] Inizio promozione utente:', {
      userId: user.id,
      userEmail: user.email,
      userName: user.displayName,
      clubId: clubId,
      timestamp: new Date().toISOString(),
    });

    try {
      const club = clubs.find((c) => c.id === clubId);
      if (!club) {
        console.error('❌ [PROMOTE DEBUG] Circolo non trovato:', clubId);
        alert('Circolo non trovato');
        return;
      }

      console.log('✅ [PROMOTE DEBUG] Circolo trovato:', {
        clubId: club.id,
        clubName: club.name,
        currentManagers: club.managers || [],
      });

      // 1. Aggiorna il profilo dell'utente nel circolo con ruolo admin
      console.log(
        '📝 [PROMOTE DEBUG] STEP 1: Aggiornamento profilo utente in clubs/{clubId}/profiles/{userId}'
      );
      const userProfileRef = doc(db, 'clubs', clubId, 'profiles', user.id);
      const profileData = {
        role: 'admin',
        isClubAdmin: true,
        promotedToAdminAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
      };
      console.log('📝 [PROMOTE DEBUG] Dati profilo da salvare:', profileData);

      await updateDoc(userProfileRef, profileData);
      console.log('✅ [PROMOTE DEBUG] STEP 1 COMPLETATO: Profilo aggiornato con successo');

      // 2. Aggiorna/crea l'affiliazione dell'utente nel circolo (collezione globale)
      console.log(
        '📝 [PROMOTE DEBUG] STEP 2: Aggiornamento affiliazione in affiliations/{affiliationId}'
      );
      const affiliationId = `${user.id}_${clubId}`;
      const affiliationRef = doc(db, 'affiliations', affiliationId);
      const affiliationData = {
        userId: user.id,
        clubId: clubId,
        role: 'admin',
        isClubAdmin: true,
        status: 'approved',
        promotedToAdminAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
      };
      console.log('📝 [PROMOTE DEBUG] Dati affiliazione da salvare:', {
        affiliationId,
        ...affiliationData,
      });

      // Usa setDoc con merge per gestire sia creazione che aggiornamento
      await setDoc(affiliationRef, affiliationData, { merge: true });
      console.log('✅ [PROMOTE DEBUG] STEP 2 COMPLETATO: Affiliazione salvata con successo');

      // 3. Aggiorna il documento del circolo con la lista dei manager
      console.log('📝 [PROMOTE DEBUG] STEP 3: Aggiornamento managers in clubs/{clubId}');
      const clubRef = doc(db, 'clubs', clubId);
      const currentManagers = club.managers || [];
      console.log('📝 [PROMOTE DEBUG] Managers attuali:', currentManagers);

      if (!currentManagers.includes(user.id)) {
        const newManagers = [...currentManagers, user.id];
        console.log('📝 [PROMOTE DEBUG] Nuova lista managers:', newManagers);

        await updateDoc(clubRef, {
          managers: newManagers,
          _updatedAt: new Date().toISOString(),
        });
        console.log('✅ [PROMOTE DEBUG] STEP 3 COMPLETATO: Lista managers aggiornata');
      } else {
        console.log('⚠️ [PROMOTE DEBUG] STEP 3 SALTATO: Utente già presente in managers');
      }

      console.log('🎉 [PROMOTE DEBUG] PROMOZIONE COMPLETATA CON SUCCESSO!');
      alert(`✅ ${user.displayName} è stato promosso ad amministratore del circolo "${club.name}"`);

      // Ricarica i dati per mostrare i cambiamenti
      console.log('🔄 [PROMOTE DEBUG] Ricaricamento dati in corso...');
      await loadData();
      console.log('✅ [PROMOTE DEBUG] Dati ricaricati');

      // Se l'utente promosso è l'utente corrente, ricarica i suoi dati di autorizzazione
      if (currentUser && currentUser.uid === user.id) {
        console.log('🔄 [PROMOTE DEBUG] Ricaricamento dati utente corrente...');
        await reloadUserData();
        console.log('✅ [PROMOTE DEBUG] Dati utente ricaricati');
      }

      setShowPromoteModal(false);
      setSelectedUser(null);
      console.log('✅ [PROMOTE DEBUG] Modal chiuso e stato pulito');
    } catch (error) {
      console.error('❌ [PROMOTE DEBUG] ERRORE DURANTE LA PROMOZIONE:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: error,
      });
      alert(`❌ Errore nella promozione dell'utente: ${error.message}`);
    }
  };

  const handleDemoteFromAdmin = async (user, clubId) => {
    try {
      const club = clubs.find((c) => c.id === clubId);
      if (!club) {
        alert('Circolo non trovato');
        return;
      }

      // 1. Aggiorna il profilo dell'utente nel circolo rimuovendo ruolo admin
      const userProfileRef = doc(db, 'clubs', clubId, 'profiles', user.id);
      await updateDoc(userProfileRef, {
        role: 'member',
        isClubAdmin: false,
        demotedFromAdminAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString(),
      });

      // 2. Aggiorna l'affiliazione dell'utente nel circolo (collezione globale)
      const affiliationId = `${user.id}_${clubId}`;
      const affiliationRef = doc(db, 'affiliations', affiliationId);

      try {
        await setDoc(
          affiliationRef,
          {
            role: 'member',
            isClubAdmin: false,
            demotedFromAdminAt: new Date().toISOString(),
            _updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Errore nell'aggiornamento dell'affiliazione:", error);
        // Continua anche se l'affiliazione non esiste
      }

      // 3. Rimuovi l'utente dalla lista dei manager del circolo
      const clubRef = doc(db, 'clubs', clubId);
      const currentManagers = club.managers || [];
      const updatedManagers = currentManagers.filter((managerId) => managerId !== user.id);

      await updateDoc(clubRef, {
        managers: updatedManagers,
        _updatedAt: new Date().toISOString(),
      });

      alert(
        `✅ ${user.displayName} è stato retrocesso da amministratore del circolo "${club.name}"`
      );

      // Ricarica i dati per mostrare i cambiamenti
      await loadData();

      // Se l'utente retrocesso è l'utente corrente, ricarica i suoi dati di autorizzazione
      if (currentUser && currentUser.uid === user.id) {
        await reloadUserData();
      }
    } catch (error) {
      console.error('Errore nella retrocessione:', error);
      alert(`❌ Errore nella retrocessione dell'utente: ${error.message}`);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      displayName: user.displayName || '',
      email: user.email || '',
      phone: user.phone || '',
      isActive: user.isActive !== false,
      notes: user.notes || '',
      skipEmailVerification: user.skipEmailVerification || false,
    });
    setShowEditModal(true);
  };

  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;

    console.log('🔧 [UsersManagement] Saving user changes:', {
      userId: selectedUser.id,
      email: selectedUser.email,
      skipEmailVerification: editFormData.skipEmailVerification,
      formData: editFormData,
    });

    try {
      // Aggiorna il profilo utente in tutti i circoli dove è presente
      console.log(
        '📝 [UsersManagement] Updating club profiles...',
        selectedUser.clubs.length,
        'clubs'
      );
      for (const clubAffiliation of selectedUser.clubs) {
        const profileRef = doc(db, 'clubs', clubAffiliation.clubId, 'profiles', selectedUser.id);
        console.log('📝 [UsersManagement] Updating club:', clubAffiliation.clubId);
        await updateDoc(profileRef, {
          displayName: editFormData.displayName,
          email: editFormData.email,
          phone: editFormData.phone,
          isActive: editFormData.isActive,
          notes: editFormData.notes,
          skipEmailVerification: editFormData.skipEmailVerification,
          _updatedAt: new Date().toISOString(),
        });
        console.log('✅ [UsersManagement] Club profile updated:', clubAffiliation.clubId);
      }

      // Aggiorna anche il profilo globale se esiste
      console.log('📝 [UsersManagement] Updating global profile for user:', selectedUser.id);
      try {
        const globalProfileRef = doc(db, 'users', selectedUser.id);
        const updateData = {
          skipEmailVerification: editFormData.skipEmailVerification,
          displayName: editFormData.displayName,
          email: editFormData.email,
          phone: editFormData.phone,
          isActive: editFormData.isActive,
          notes: editFormData.notes,
          _updatedAt: new Date().toISOString(),
        };
        console.log('📝 [UsersManagement] Global profile update data:', updateData);
        await updateDoc(globalProfileRef, updateData);
        console.log('✅ [UsersManagement] Global profile updated successfully');
      } catch (error) {
        console.warn('⚠️ [UsersManagement] Global profile update failed, trying to create:', error);
        // Se non esiste, prova a crearlo
        try {
          const globalProfileRef = doc(db, 'users', selectedUser.id);
          const createData = {
            skipEmailVerification: editFormData.skipEmailVerification,
            displayName: editFormData.displayName,
            email: editFormData.email,
            phone: editFormData.phone,
            isActive: editFormData.isActive,
            notes: editFormData.notes,
            _createdAt: new Date().toISOString(),
            _updatedAt: new Date().toISOString(),
          };
          console.log('📝 [UsersManagement] Creating global profile with data:', createData);
          await setDoc(globalProfileRef, createData);
          console.log('✅ [UsersManagement] Global profile created successfully');
        } catch (createError) {
          console.error('❌ [UsersManagement] Failed to create global profile:', createError);
        }
      }

      console.log('✅ [UsersManagement] All updates completed successfully');

      // Se l'utente modificato è quello corrente (controlla sia UID che email)
      const isCurrentUser =
        currentUser &&
        (currentUser.uid === selectedUser.id || currentUser.email === selectedUser.email);

      if (isCurrentUser) {
        alert(
          'Utente aggiornato con successo! La pagina verrà ricaricata per applicare le modifiche.'
        );
      } else {
        alert(
          "Utente aggiornato con successo! L'utente dovrà disconnettersi e riconnettersi per vedere le modifiche applicate."
        );
      }

      // Invalida la cache del profilo utente per forzare il reload
      console.log('🔄 [UsersManagement] Invalidating profile cache for user:', selectedUser.id);
      invalidateUserProfileCache(selectedUser.id);

      if (isCurrentUser) {
        console.log('🔄 [UsersManagement] Reloading current user data...');
        // Invalida anche la cache del current user se è diverso
        if (currentUser.uid !== selectedUser.id) {
          console.log(
            '🔄 [UsersManagement] Also invalidating cache for current user:',
            currentUser.uid
          );
          invalidateUserProfileCache(currentUser.uid);

          // Aggiorna anche il profilo del current user (duplicato con stessa email)
          console.log('📝 [UsersManagement] Also updating current user profile with same email');
          try {
            const currentUserProfileRef = doc(db, 'users', currentUser.uid);
            await updateDoc(currentUserProfileRef, {
              skipEmailVerification: editFormData.skipEmailVerification,
              _updatedAt: new Date().toISOString(),
            });
            console.log('✅ [UsersManagement] Current user profile also updated');

            // Aspetta un attimo per permettere a Firebase di sincronizzare
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (err) {
            console.warn('⚠️ [UsersManagement] Failed to update current user profile:', err);
          }
        }
        await reloadUserData();
        console.log('✅ [UsersManagement] Current user data reloaded');

        // Force page reload per essere sicuri che il profilo venga ricaricato
        console.log('🔄 [UsersManagement] Force reloading page to refresh profile...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

      loadData();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Errore nell'aggiornare l'utente:", error);
      alert("Errore nell'aggiornare l'utente");
    }
  };

  const handleDeactivateUser = async (user) => {
    if (!confirm(`Sei sicuro di voler disattivare l'utente ${user.displayName}?`)) {
      return;
    }

    try {
      // Disattiva l'utente in tutti i circoli
      for (const clubAffiliation of user.clubs) {
        const profileRef = doc(db, 'clubs', clubAffiliation.clubId, 'profiles', user.id);
        await updateDoc(profileRef, {
          isActive: false,
          deactivatedAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
        });
      }

      alert('Utente disattivato con successo!');
      loadData();
    } catch (error) {
      console.error('Errore nella disattivazione:', error);
      alert("Errore nella disattivazione dell'utente");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedClub === 'all') return matchesSearch;

    return matchesSearch && user.clubs.some((club) => club.clubId === selectedClub);
  });

  const UserCard = ({ user }) => (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold relative ${
              user.isAdmin
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }`}
          >
            {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
            {user.isAdmin && <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">{user.displayName}</h3>
              {user.isAdmin && (
                <span className="px-2 py-1 bg-yellow-900 text-yellow-200 text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
              {user.skipEmailVerification && (
                <span className="px-2 py-1 bg-orange-900 text-orange-200 text-xs rounded-full font-medium flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>No Verifica Email</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditUser(user)}
            className="p-2 text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Modifica Utente"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowPromoteModal(true);
            }}
            className="p-2 text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Gestisci Ruoli"
          >
            <UserCog className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeactivateUser(user)}
            className="p-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Disattiva Utente"
          >
            <UserX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Informazioni utente */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            Registrato:{' '}
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Data sconosciuta'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>
            Ultimo accesso: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Mai'}
          </span>
        </div>
      </div>

      {/* Affiliazioni ai circoli */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center space-x-2 mb-3">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Circoli ({user.clubs.length})</span>
        </div>
        {user.clubs.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuna affiliazione</p>
        ) : (
          <div className="space-y-2">
            {user.clubs.slice(0, 3).map((club, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{club.clubName}</span>
                <div className="flex items-center space-x-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      club.status === 'approved'
                        ? 'bg-green-900 text-green-200'
                        : club.status === 'pending'
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {club.status === 'approved'
                      ? 'Approvato'
                      : club.status === 'pending'
                        ? 'In attesa'
                        : 'Sconosciuto'}
                  </span>
                  {(user.adminClubs?.includes(club.clubId) ||
                    club.role === 'admin' ||
                    club.isClubAdmin === true) && (
                    <Crown className="w-3 h-3 text-yellow-500" title="Amministratore" />
                  )}
                </div>
              </div>
            ))}
            {user.clubs.length > 3 && (
              <p className="text-sm text-gray-500">+{user.clubs.length - 3} altri circoli</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Caricamento utenti...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">Gestione Utenti</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Cerca utenti per nome o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tutti i circoli</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Riepilogo Utenti</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-blue-400">{users.length}</p>
              <p className="text-sm text-gray-400">Utenti Totali</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {
                  users.filter((user) => user.clubs.some((club) => club.status === 'approved'))
                    .length
                }
              </p>
              <p className="text-sm text-gray-400">Utenti Attivi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">
                {users.filter((user) => user.adminClubs?.length > 0).length}
              </p>
              <p className="text-sm text-gray-400">Amministratori Circoli</p>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl shadow-lg">
            <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-xl text-gray-400 mb-2">
              {searchTerm ? 'Nessun utente trovato' : 'Nessun utente presente'}
            </p>
            <p className="text-gray-500">
              {searchTerm
                ? 'Prova a modificare i termini di ricerca'
                : 'Gli utenti appariranno qui quando si registreranno'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </main>

      {/* Modal di modifica utente */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center space-x-2 text-white">
                <Edit className="w-5 h-5" />
                <span>Modifica Utente - {selectedUser.displayName}</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome visualizzato */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Visualizzato
                </label>
                <input
                  type="text"
                  value={editFormData.displayName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, displayName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Telefono */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefono</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+39 123 456 7890"
                />
              </div>

              {/* Stato attivo */}
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Account Attivo</span>
                </label>
              </div>

              {/* Skip Email Verification */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editFormData.skipEmailVerification}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          skipEmailVerification: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-300 flex items-center space-x-1">
                      <Mail className="w-4 h-4 text-yellow-600" />
                      <span>Disabilita Verifica Email</span>
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  ⚠️ L&apos;utente dovrà disconnettersi e riconnettersi per applicare questa
                  modifica
                </p>
              </div>

              {/* Note amministrative */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Note Amministrative
                </label>
                <textarea
                  rows="4"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Note interne per l'amministrazione..."
                />
              </div>
            </div>

            {/* Affiliazioni dell'utente */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-white mb-4">Affiliazioni Attuali</h4>
              <div className="space-y-3">
                {selectedUser.clubs.map((club, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">{club.clubName}</p>
                      <p className="text-sm text-gray-400">
                        Status:{' '}
                        {club.status === 'approved'
                          ? 'Approvato'
                          : club.status === 'pending'
                            ? 'In attesa'
                            : 'Sconosciuto'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {club.role === 'admin' && (
                        <span className="px-2 py-1 bg-yellow-900 text-yellow-200 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          club.status === 'approved'
                            ? 'bg-green-900 text-green-200'
                            : club.status === 'pending'
                              ? 'bg-yellow-900 text-yellow-200'
                              : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {club.status === 'approved'
                          ? 'Attivo'
                          : club.status === 'pending'
                            ? 'Pendente'
                            : 'Inattivo'}
                      </span>
                    </div>
                  </div>
                ))}
                {selectedUser.clubs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nessuna affiliazione trovata</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveUserChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal di promozione */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-white">
              <UserCog className="w-5 h-5" />
              <span>Gestisci Ruoli - {selectedUser.displayName}</span>
            </h3>

            <div className="space-y-4">
              <p className="text-gray-300">Gestisci i ruoli di amministratore per questo utente:</p>

              {clubs.map((club) => {
                const isAdminOfThisClub =
                  selectedUser.adminClubs?.includes(club.id) ||
                  selectedUser.clubs.some(
                    (userClub) =>
                      userClub.clubId === club.id &&
                      (userClub.role === 'admin' || userClub.isClubAdmin === true)
                  );

                return (
                  <div
                    key={club.id}
                    className="flex items-center justify-between p-3 border border-gray-600 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">{club.name}</p>
                      <p className="text-sm text-gray-400">{club.city}</p>
                      {isAdminOfThisClub && (
                        <span className="inline-block mt-1 px-2 py-1 bg-yellow-900 text-yellow-200 text-xs rounded-full">
                          Attualmente Admin
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!isAdminOfThisClub ? (
                        <button
                          onClick={() => handlePromoteToAdmin(selectedUser, club.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Promuovi Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDemoteFromAdmin(selectedUser, club.id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Rimuovi Admin
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPromoteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
