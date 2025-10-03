// =============================================
// FILE: src/pages/Bootstrap.jsx
// Pagina Bootstrap per creare documenti Firestore
// =============================================
import React, { useState, useEffect } from 'react';
import { auth, db } from '@services/firebase';
import { 
    collection, 
    doc, 
    setDoc, 
    serverTimestamp,
    getDocs,
    query,
    where,
    addDoc
} from 'firebase/firestore';
import { 
    signInWithPopup, 
    GoogleAuthProvider 
} from 'firebase/auth';

const Bootstrap = () => {
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [isBootstrapping, setIsBootstrapping] = useState(false);

    const config = {
        clubId: 'default-club',
        email: 'parischit85@gmail.com'
    };

    // Auth state listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            if (user) {
                addLog(`Autenticato come: ${user.email} (${user.uid})`, 'success');
            }
        });
        return () => unsubscribe();
    }, []);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { 
            message, 
            type, 
            timestamp 
        }]);
    };

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            addLog('Login completato con successo!', 'success');
        } catch (error) {
            addLog(`Errore durante il login: ${error.message}`, 'error');
        }
    };

    const handleBootstrap = async () => {
        if (!user) {
            addLog('Devi effettuare il login prima!', 'error');
            return;
        }

        setIsBootstrapping(true);
        addLog('🚀 Avvio bootstrap Firestore...', 'info');

        try {
            // 1. Crea club
            addLog('📊 Creando club default...', 'info');
            await setDoc(doc(db, 'clubs', config.clubId), {
                name: 'Club Default',
                address: 'Via Default 123',
                city: 'Città Default',
                phone: '+39 123 456 7890',
                email: config.email,
                active: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            addLog('✅ Club creato', 'success');

            // 2. Crea settings
            addLog('⚙️ Creando settings club...', 'info');
            await setDoc(doc(db, 'clubs', config.clubId, 'settings', 'config'), {
                businessHours: {
                    monday: { open: '09:00', close: '22:00', closed: false },
                    tuesday: { open: '09:00', close: '22:00', closed: false },
                    wednesday: { open: '09:00', close: '22:00', closed: false },
                    thursday: { open: '09:00', close: '22:00', closed: false },
                    friday: { open: '09:00', close: '22:00', closed: false },
                    saturday: { open: '08:00', close: '23:00', closed: false },
                    sunday: { open: '08:00', close: '21:00', closed: false }
                },
                pricing: {
                    peak: { amount: 25, currency: 'EUR' },
                    standard: { amount: 20, currency: 'EUR' },
                    off_peak: { amount: 15, currency: 'EUR' }
                },
                bookingRules: {
                    maxAdvanceDays: 14,
                    minAdvanceHours: 2,
                    maxDurationHours: 2,
                    allowedSlots: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00']
                },
                notifications: {
                    emailEnabled: true,
                    smsEnabled: false,
                    pushEnabled: true
                },
                features: {
                    darkModeEnabled: true,
                    multiLanguageEnabled: false,
                    advancedBookingEnabled: true
                }
            });
            addLog('✅ Settings creati', 'success');

            // 3. Crea profilo utente
            addLog('👤 Creando profilo utente...', 'info');
            await setDoc(doc(db, 'profiles', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Paris Andrea',
                firstName: 'Paris',
                lastName: 'Andrea',
                phone: '+39 123 456 7890',
                dateOfBirth: null,
                gender: 'M',
                preferences: {
                    language: 'it',
                    timezone: 'Europe/Rome',
                    notifications: {
                        email: true,
                        push: true,
                        sms: false
                    },
                    theme: 'light'
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                active: true
            });
            addLog('✅ Profilo creato', 'success');

            // 4. Crea userClubRoles
            addLog('🔑 Creando ruoli utente...', 'info');
            const roleData = {};
            roleData[config.clubId] = {
                role: 'club_admin',
                permissions: ['read', 'write', 'admin'],
                assignedAt: serverTimestamp(),
                assignedBy: user.uid,
                active: true
            };
            
            await setDoc(doc(db, 'userClubRoles', user.uid), {
                userId: user.uid,
                roles: roleData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            addLog('✅ Ruoli creati', 'success');

            // 5. Crea affiliazione
            addLog('🏢 Creando affiliazione...', 'info');
            await setDoc(doc(db, 'affiliations', `${user.uid}_${config.clubId}`), {
                userId: user.uid,
                clubId: config.clubId,
                status: 'approved',
                membershipType: 'admin',
                joinedAt: serverTimestamp(),
                expiresAt: null,
                autoRenew: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            addLog('✅ Affiliazione creata', 'success');

            addLog('🎉 Bootstrap completato con successo!', 'success');
            addLog('Documenti creati:', 'info');
            addLog(`- clubs/${config.clubId}`, 'info');
            addLog(`- clubs/${config.clubId}/settings/config`, 'info');
            addLog(`- profiles/${user.uid}`, 'info');
            addLog(`- userClubRoles/${user.uid}`, 'info');
            addLog(`- affiliations/${user.uid}_${config.clubId}`, 'info');

        } catch (error) {
            addLog(`❌ Bootstrap fallito: ${error.message}`, 'error');
            console.error('Bootstrap error:', error);
        } finally {
            setIsBootstrapping(false);
        }
    };

    // New function to setup club admin in the new system
    const handleSetupClubAdmin = async () => {
        if (!user) {
            addLog('❌ Nessun utente autenticato', 'error');
            return;
        }

        setIsBootstrapping(true);
        
        try {
            addLog('🚀 Iniziando setup club admin...', 'info');
            
            // 1. Get all clubs
            const clubsRef = collection(db, 'clubs');
            const clubsSnapshot = await getDocs(clubsRef);
            
            if (clubsSnapshot.empty) {
                addLog('❌ Nessun club trovato. Esegui prima il bootstrap.', 'error');
                return;
            }
            
            addLog(`🏛️ Trovati ${clubsSnapshot.docs.length} club`, 'info');
            
            // 2. Find target club (prefer Sporting CAT or use first)
            let targetClub = null;
            clubsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                addLog(`  - ${data.name} (${doc.id})`, 'info');
                
                if (!targetClub || data.name?.toLowerCase().includes('sporting') || data.name?.toLowerCase().includes('cat')) {
                    targetClub = { id: doc.id, ...data };
                }
            });
            
            addLog(`🎯 Club selezionato: ${targetClub.name}`, 'info');
            
            // 3. Check if user already exists in club
            const clubUsersRef = collection(db, 'clubs', targetClub.id, 'users');
            const existingUserQuery = query(clubUsersRef, where('userId', '==', user.uid));
            const existingUserSnapshot = await getDocs(existingUserQuery);
            
            if (!existingUserSnapshot.empty) {
                const existing = existingUserSnapshot.docs[0].data();
                addLog(`✅ Utente già presente nel club come: ${existing.role}`, 'success');
                return;
            }
            
            // 4. Create/update user profile
            addLog('👤 Creando/aggiornando profilo...', 'info');
            const profileData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Club Admin',
                firstName: user.displayName?.split(' ')[0] || 'Admin',
                lastName: user.displayName?.split(' ')[1] || 'User',
                phone: '+39 123 456 7890', // Default phone
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                active: true
            };
            
            await setDoc(doc(db, 'profiles', user.uid), profileData, { merge: true });
            addLog('✅ Profilo aggiornato', 'success');
            
            // 5. Add user to club as admin
            addLog('🏛️ Aggiungendo utente al club come admin...', 'info');
            const clubUserData = {
                userId: user.uid,
                email: user.email,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                role: 'club_admin',
                status: 'active',
                addedAt: serverTimestamp(),
                addedBy: 'bootstrap_setup',
                isLinked: true,
                profileId: user.uid
            };
            
            await addDoc(clubUsersRef, clubUserData);
            addLog('✅ Utente aggiunto al club come admin', 'success');
            
            addLog('🎉 Setup completato! Ricarica l\'app per vedere i cambiamenti.', 'success');
            
        } catch (error) {
            addLog(`❌ Setup fallito: ${error.message}`, 'error');
            console.error('Setup error:', error);
        } finally {
            setIsBootstrapping(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    🚀 Bootstrap Firestore
                </h1>
                
                <p className="text-gray-600 mb-8">
                    Questo strumento crea i documenti base necessari per il funzionamento dell'app multi-club.
                </p>

                <div className="flex gap-4 mb-6">
                    {!user ? (
                        <button
                            onClick={handleLogin}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            🔐 Login con Google
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleBootstrap}
                                disabled={isBootstrapping}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                {isBootstrapping ? '⏳ Creando...' : '📊 Esegui Bootstrap'}
                            </button>
                            
                            <button
                                onClick={handleSetupClubAdmin}
                                disabled={isBootstrapping}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                {isBootstrapping ? '⏳ Setup...' : '👑 Setup Club Admin'}
                            </button>
                        </>
                    )}
                    
                    <button
                        onClick={() => setLogs([])}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        🗑️ Cancella Log
                    </button>
                </div>

                {user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <strong className="text-blue-900">👤 Utente:</strong> 
                        <span className="text-blue-800 ml-2">{user.email}</span><br/>
                        <strong className="text-blue-900">🆔 UID:</strong> 
                        <span className="text-blue-800 ml-2 font-mono text-sm">{user.uid}</span>
                    </div>
                )}

                <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {logs.length === 0 ? (
                        <p className="text-gray-500 text-center">Nessun log ancora...</p>
                    ) : (
                        logs.map((log, index) => (
                            <div 
                                key={index} 
                                className={`mb-1 text-sm font-mono ${
                                    log.type === 'error' ? 'text-red-600' :
                                    log.type === 'success' ? 'text-green-600' :
                                    'text-gray-700'
                                }`}
                            >
                                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bootstrap;