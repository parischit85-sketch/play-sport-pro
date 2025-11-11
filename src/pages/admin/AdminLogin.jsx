import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';

// Lista degli admin autorizzati - Spostato fuori dal componente per evitare dipendenze cicliche
const AUTHORIZED_ADMINS = [
  'paris.andrea@live.it',
  'admin@playsport.it',
  // Aggiungi qui altri email admin
];

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se l'utente è già loggato come admin, reindirizza alla dashboard
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && AUTHORIZED_ADMINS.includes(user.email)) {
        navigate('/admin/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }

    // Verifica che l'email sia autorizzata
    if (!AUTHORIZED_ADMINS.includes(email)) {
      setError('Accesso non autorizzato. Contatta il supporto per i permessi di amministratore.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 🔧 DEVELOPMENT BYPASS: In development mode, allow any authorized email with any password
      if (import.meta.env.DEV && AUTHORIZED_ADMINS.includes(email)) {
        console.log('🔐 [DEV MODE] Admin login bypass activated for:', email);

        // Create mock admin user for development
        const mockAdminUser = {
          uid: `admin-dev-${email.replace(/[^a-z0-9]/g, '')}`,
          email: email,
          displayName: 'Admin Developer',
          isAdmin: true,
        };

        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify(mockAdminUser));
        console.log('✅ [DEV MODE] Admin session created:', mockAdminUser);

        // Reindirizza alla dashboard admin
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
        return;
      }

      // PRODUCTION: Use Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Doppia verifica che l'utente sia autorizzato
      if (!AUTHORIZED_ADMINS.includes(user.email)) {
        await auth.signOut();
        setError('Accesso non autorizzato');
        return;
      }

      // Verifica se esiste un profilo admin (opzionale)
      try {
        const adminRef = doc(db, 'admin', user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          // Crea profilo admin se non esiste
          // Questa logica può essere estesa in futuro
          console.log('Primo accesso admin, profilo da creare se necessario');
        }
      } catch (adminError) {
        console.warn('Errore verifica profilo admin:', adminError);
        // Non bloccare il login per questo
      }

      // Reindirizza alla dashboard admin
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Errore login admin:', error);
      let errorMessage = 'Errore durante il login';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Account non trovato';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password non corretta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email non valida';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Account disabilitato';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Troppi tentativi. Riprova più tardi';
          break;
        default:
          errorMessage = 'Errore durante il login. Riprova';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e titolo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PlaySport Admin</h1>
          <p className="text-blue-200">Portale di amministrazione</p>
        </div>

        {/* Form di login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Amministratore
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="admin@playsport.it"
                required
              />
            </div>

            {/* Campo password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Messaggio di errore */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Bottone di login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Accesso in corso...</span>
                </div>
              ) : (
                'Accedi al Portale Admin'
              )}
            </button>
          </form>

          {/* Note di sicurezza */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Accesso riservato agli amministratori autorizzati di PlaySport.
              <br />
              Le attività sono monitorate e registrate.
            </p>
          </div>
        </div>

        {/* Link per tornare al sito */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-200 hover:text-white transition-colors text-sm"
          >
            ← Torna al sito principale
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
