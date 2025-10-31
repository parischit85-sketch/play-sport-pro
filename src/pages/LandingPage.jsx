// =============================================
// FILE: src/pages/LandingPage.jsx
// Landing page moderna e accattivante per Play-Sport.pro
// =============================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { themeTokens, LOGO_URL } from '@lib/theme.js';
import { useAuth } from '@contexts/AuthContext.jsx';
import RegistrationTypeModal from '@components/ui/RegistrationTypeModal';
import LiveTournamentsModal from '@components/ui/LiveTournamentsModal';
import {
  Users,
  Calendar,
  Trophy,
  MapPin,
  Star,
  Shield,
  Smartphone,
  Clock,
  Target,
  Award,
  ChevronRight,
  Play,
  UserPlus,
  Building2,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const T = React.useMemo(() => themeTokens(), []);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLiveTournamentsModal, setShowLiveTournamentsModal] = useState(false);

  // Se l'utente è già autenticato, reindirizza alla dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-blue-400" />,
      title: 'Prenotazioni Facili',
      description: 'Prenota campi sportivi in pochi click. Scegli il tuo sport, orario e conferma.',
    },
    {
      icon: <Users className="w-8 h-8 text-blue-400" />,
      title: 'Lezioni con Maestri',
      description:
        'Impara dai migliori istruttori. Lezioni individuali o di gruppo per tutti i livelli.',
    },
    {
      icon: <Trophy className="w-8 h-8 text-blue-400" />,
      title: 'Tornei e Competizioni',
      description: 'Partecipa a tornei locali e nazionali. Scala le classifiche e vinci premi.',
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-400" />,
      title: 'Trova il Tuo Circolo',
      description: 'Scopri circoli sportivi vicino a te con mappe interattive e recensioni.',
    },
    {
      icon: <Smartphone className="w-8 h-8 text-blue-400" />,
      title: 'App Mobile',
      description: 'Gestisci tutto dal tuo smartphone. Disponibile per iOS e Android.',
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      title: 'Pagamenti Sicuri',
      description: 'Transazioni protette e gestione sicura delle tue prenotazioni.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Circoli Sportivi' },
    { number: '10K+', label: 'Utenti Attivi' },
    { number: '50K+', label: 'Prenotazioni' },
    { number: '100+', label: 'Sport Diversi' },
  ];

  return (
    <div className={`min-h-screen ${T.pageBg} ${T.text}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${T.headerBg} border-b ${T.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="Play-Sport.pro"
                className="h-10 w-auto select-none"
                draggable={false}
              />
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-blue-400 font-medium transition-colors"
              >
                Accedi
              </Link>
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Registrati
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Il Tuo
              <span className="text-blue-400"> Sport</span>,
              <br />
              La Tua <span className="text-blue-400">Passione</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connetti con i migliori circoli sportivi, prenota campi, partecipa a tornei e migliora
              le tue abilità con lezioni professionali. Tutto in un'unica piattaforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Inizia Ora - È Gratuito
              </button>
              <button
                onClick={() =>
                  document.getElementById('features').scrollIntoView({ behavior: 'smooth' })
                }
                className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Scopri di Più
              </button>
              <button
                onClick={() => setShowLiveTournamentsModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Tornei Live
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-800 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-800 rounded-full opacity-20 animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-blue-700 rounded-full opacity-20 animate-bounce delay-500"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Tutto Quello che Ti Serve
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Una piattaforma completa per atleti, circoli sportivi e appassionati di sport.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Come Funziona</h2>
            <p className="text-xl text-gray-300">Inizia in pochi semplici passi</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Registrati</h3>
              <p className="text-gray-300">
                Crea il tuo profilo gratuito come giocatore o gestisci il tuo circolo sportivo.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Scegli il Tuo Sport</h3>
              <p className="text-gray-300">
                Trova il circolo ideale, prenota campi o iscriviti a lezioni e tornei.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Gioca e Migliora</h3>
              <p className="text-gray-300">
                Partecipa alle attività, traccia i tuoi progressi e connetti con altri appassionati.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Chi Può Usare Play-Sport.pro?
            </h2>
            <p className="text-xl text-emerald-50">
              Una piattaforma pensata per tutti gli appassionati di sport
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Players */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Giocatori</h3>
              </div>
              <ul className="space-y-3 text-emerald-50">
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                  Prenota campi sportivi facilmente
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                  Partecipa a lezioni con maestri professionisti
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                  Iscriviti a tornei e competizioni
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                  Traccia le tue statistiche e progressi
                </li>
              </ul>
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="inline-flex items-center gap-2 mt-6 bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Registrati come Giocatore
              </button>
            </div>

            {/* Clubs */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Circoli Sportivi</h3>
              </div>
              <ul className="space-y-3 text-emerald-50">
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                  Gestisci prenotazioni e disponibilità campi
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                  Organizza tornei e competizioni
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                  Gestisci istruttori e lezioni
                </li>
                <li className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-300" />
                  Analizza statistiche e ricavi
                </li>
              </ul>
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="inline-flex items-center gap-2 mt-6 bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Registrati come Circolo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Pronto a Iniziare la Tua Avventura Sportiva?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Unisciti a migliaia di atleti e circoli sportivi che già utilizzano Play-Sport.pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowRegistrationModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Registrati Gratuitamente
            </button>
            <Link
              to="/login"
              className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Hai già un account? Accedi
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={LOGO_URL}
                  alt="Play-Sport.pro"
                  className="h-8 w-auto brightness-0 invert"
                  draggable={false}
                />
                <span className="text-xl font-bold">Play-Sport.pro</span>
              </div>
              <p className="text-gray-300 mb-4">
                La piattaforma definitiva per connettere atleti, circoli sportivi e appassionati di
                sport. Prenota, gioca, migliora.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Piattaforma</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Come Funziona
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Prezzi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sicurezza
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Supporto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contatti</h4>
              <ul className="space-y-2 text-gray-300">
                <li>support@play-sport.pro</li>
                <li>+39 123 456 7890</li>
                <li>Milano, Italia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Play-Sport.pro. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

      {/* Registration Type Modal */}
      <RegistrationTypeModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
      />

      {/* Live Tournaments Modal */}
      <LiveTournamentsModal
        isOpen={showLiveTournamentsModal}
        onClose={() => setShowLiveTournamentsModal(false)}
      />
    </div>
  );
}
