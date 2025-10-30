# 🎾 Playsport Pro - Club Management System# 🎾 Play Sport Pro



# 🎾 PlaySport Pro - Club Management System

> Important notes (2025-10-24/25)
- Firebase initialization has been consolidated. Use only `src/services/firebase.js` (see `FIREBASE_INITIALIZATION_FIX.md`). Any legacy `cloud.js` usage has been removed.
- The legacy "Cloud Backup (leagues)" panel in `Extra.jsx` is now gated by the `VITE_ENABLE_LEGACY_LEAGUES` env flag (default: false). Enable only if you explicitly need the old leagues backup UI.
- React Router v7 future flags: not applicable here (we use `<BrowserRouter />`, not Data Router). No action required.


**Un'applicazione enterprise-grade per la gestione completa di club sportivi con funzionalità avanzate di prenotazione, gestione tornei, analytics e mobile app.**

[![Version](https://img.shields.io/badge/version-1.0.4-blue.svg)](package.json)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.9-646CFF.svg)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/tests-42%20passing-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/coverage-48%25-yellow.svg)]()

---

## ⚡ Quick Start

**Setup completo in 30 minuti!** 🚀

```bash
# 1. Clone repository
git clone https://github.com/your-org/play-sport-pro.git
cd play-sport-pro

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.production.example .env
# Edit .env with your Firebase credentials

# 4. Validate configuration
npm run validate-config

# 5. Start development server
npm run dev
```

**📖 Guida Dettagliata**: Vedi [QUICK_START.md](QUICK_START.md)

---

## ✨ Features



[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](package.json)A comprehensive web application for managing padel leagues, bookings, and tournaments with a modern, mobile-first design.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)

[![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange.svg)](https://firebase.google.com/)## ✨ Features

[![Vite](https://img.shields.io/badge/Vite-7.1.4-646CFF.svg)](https://vitejs.dev/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)### 🏟️ **Booking System**



---- Real-time court availability

- 30-hour cancellation policy

## 🌟 Caratteristiche Principali- Inline player editing

- Web Share API integration

### 🎯 **Core Features**- Mobile-optimized booking flow

- **📅 Sistema Prenotazioni Avanzato**: Booking intelligente con gestione conflitti e disponibilità real-time

- **🏆 Gestione Tornei & Ranking**: Sistema automatico di ranking con ELO rating e statistiche avanzate### 👥 **Player Management**

- **👥 Multi-Club Support**: Gestione di più club con amministratori dedicati

- **📱 Progressive Web App**: Esperienza mobile nativa con installazione offline- Complete player profiles

- **🔐 Autenticazione Sicura**: Firebase Auth con ruoli e permessi granulari- Performance statistics

- Ranking system with RPA algorithm

### 🚀 **Advanced Features**- Tournament participation tracking

- **📊 Analytics Avanzate**: Google Analytics 4 con tracking eventi personalizzati e conversion funnel

- **🛡️ Sicurezza Enterprise**: Input sanitization, rate limiting, CSRF protection, audit security### 🏆 **Tournament Management**

- **⚡ Performance Ottimizzate**: Service Worker, caching intelligente, Web Vitals monitoring

- **🔍 Monitoring Completo**: Sentry integration con error tracking e performance monitoring- Create and manage tournaments

- **🧪 Testing Robusto**: Framework di test completo con coverage 80%+- Bracket visualization

- Real-time scoring

---- Prize distribution tracking



## 🏗️ Architettura Tecnologica### 📊 **Advanced Analytics**



### **Frontend Stack**- Performance dashboards

```- Interactive charts with Recharts

React 18.3.1          # UI Library con Concurrent Features- Mobile-responsive statistics

├── Vite 7.1.4        # Build Tool & Dev Server ultra-veloce- Export functionality

├── TailwindCSS 3.4   # Utility-first CSS framework

├── React Query 5.8   # Server State Management### 📱 **Mobile-First Design**

├── React Hook Form   # Form Management con validazione

├── React Router 7.8  # Client-side Routing- Progressive Web App (PWA)

└── TypeScript 5.9    # Type Safety- Touch-optimized interfaces

```- Hybrid table/card views

- Offline capabilities

### **Backend & Infrastructure**

```## 🚀 Quick Start

Firebase 12.2.1       # Backend-as-a-Service

├── Firestore        # NoSQL Database con real-time sync### Prerequisites

├── Authentication   # Multi-provider auth system

├── Hosting         # Static hosting con CDN globale- Node.js 18+

├── Security Rules  # Database-level security- Firebase account

└── Cloud Functions # Serverless backend logic- Modern web browser

```

### Installation

### **Mobile & PWA**

``````bash

Capacitor 7.4.3       # Native mobile wrapper# Clone the repository

├── Android SDK      # Native Android appgit clone https://github.com/your-username/play-sport-pro.git

├── Service Worker   # Offline-first architecture

├── Web App Manifest # PWA capabilities# Navigate to project directory

└── Push Notifications # Real-time notificationscd play-sport-pro

```

# Install dependencies

### **Development Tools**npm install

```

Testing               # Vitest + React Testing Library# Start development server

├── Unit Tests       # Component & logic testingnpm run dev

├── Integration      # API & database testing```

├── E2E Testing      # End-to-end scenarios

└── Coverage 80%+    # Quality assurance### Build for Production



Code Quality          # ESLint + Prettier + Husky```bash

├── Linting          # Code style enforcement# Build the application

├── Type Checking    # TypeScript validationnpm run build

├── Pre-commit       # Automated quality checks

└── CI/CD Ready      # GitHub Actions integration# Preview production build

```npm run preview

```

---

## 🏗️ Technology Stack

## 📦 Setup & Installation

- **Frontend**: React 18 + Vite

### **Prerequisiti Sistema**- **Styling**: Tailwind CSS

```bash- **State Management**: Context API

Node.js >= 18.0.0     # JavaScript runtime- **Authentication**: Firebase Auth

npm >= 9.0.0          # Package manager- **Database**: Firestore

Git >= 2.34.0         # Version control- **Charts**: Recharts

```- **Icons**: Lucide React

- **PWA**: Vite PWA Plugin

### **Clone & Install**

```bash## 📁 Project Structure

# Clone repository

git clone https://github.com/parischit85-sketch/playsport-pro.git```

cd playsport-prosrc/

├── components/          # Reusable UI components

# Install dependencies│   ├── ui/             # Core UI components

npm ci│   └── charts/         # Chart components

├── features/           # Feature-specific components

# Verify installation│   ├── booking/        # Booking management

npm run test│   ├── players/        # Player management

```│   ├── tournaments/    # Tournament system

│   └── stats/          # Statistics & analytics

### **Configurazione Ambiente**├── pages/              # Route pages

├── services/           # API & Firebase services

Crea `.env.development`:├── lib/                # Utility functions

```bash├── hooks/              # Custom React hooks

# Firebase Configuration└── contexts/           # React contexts

VITE_FIREBASE_API_KEY=your_api_key_here```

VITE_FIREBASE_AUTH_DOMAIN=playsport-pro.firebaseapp.com

VITE_FIREBASE_PROJECT_ID=playsport-pro## 🏢 Multi-Club Architecture (v2)

VITE_FIREBASE_STORAGE_BUCKET=playsport-pro.appspot.com

VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_idLa piattaforma è stata evoluta da modello single-league a modello multi-club. Il precedente `LeagueContext` è stato completamente rimosso a favore di servizi mirati e del solo `ClubContext`.

VITE_FIREBASE_APP_ID=your_app_id

### Concetti Chiave

# Analytics & Monitoring (Development)- Club Namespace: ogni club ha le proprie subcollection (`courts`, `bookings`, `players`, `matches`, `tournaments`, `lessons`, `statsCache`).

VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX- Affiliazioni Normalizzate: collezione root `affiliations` che lega `userId` ↔ `clubId` con ruoli (`member`, `staff`, `owner`, `instructor`).

VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id- Routing: tutte le rotte contestualizzate sono sotto `/club/:clubId/...` (booking, lezioni, classifica, stats, admin bookings, ecc.).

VITE_SENTRY_ENVIRONMENT=development- Context Layer: `ClubContext` fornisce `clubId`, metadata, courts live e loader lazy per players/matches (nessun layer legacy superfluo).

- Ranking per Club: wrapper `computeClubRanking` filtra dati e previene cross-contaminazione.

# App Configuration- Configurazioni per Club: documento Firestore `clubs/{clubId}/settings/config` con `bookingConfig` e `lessonConfig` gestiti via servizio `club-settings` + hook `useClubSettings` (creazione lazy se assente).

VITE_APP_VERSION=1.0.1

VITE_APP_ENVIRONMENT=development### Firestore Schema (estratto)

VITE_APP_DEBUG=true```

```clubs/{clubId}

	courts/{courtId}

---	bookings/{bookingId}

	players/{playerId}

## 🚀 Comandi di Sviluppo	matches/{matchId}

	tournaments/{tournamentId}

### **Development Workflow**	lessons/{lessonId}

```bash	statsCache/{docId}

# Start development server	settings/config (bookingConfig, lessonConfig)

npm run dev                 # http://localhost:5173affiliations/{userId_clubId}

profiles/{userId}

# Development con network access```

npm run dev:host           # Accessible from LAN

### Sicurezza

# Clean development - Funzioni regole: `isAffiliated`, `isClubStaff`, `isClubAdmin`.

npm run dev:clean          # Clear cache & restart- Lettura bookings/matches consentita solo agli affiliati approvati.

```- Creazione booking: `clubId` deve combaciare con path, autore = `createdBy`.

- Aggiornamento settings consentito solo a staff / admin del club.

### **Build & Deploy** - Collezione `userClubRoles`: lettura limitata all'utente owner del documento; modifiche consentite solo a club admin (vedi snippet in `MULTI_CLUB_MIGRATION.md`).

```bash

# Production build#### 🔐 Troubleshooting Permessi (Firestore)

npm run build              # Build ottimizzata per produzioneSe vedi nel browser errori ripetuti tipo:

`FirebaseError: [code=permission-denied]: Missing or insufficient permissions` oppure log `[getUserClubRoles] permission denied`:

# Clean production build

npm run build:clean        # Remove dist & build1. Verifica che le regole deployate includano i blocchi `profiles` e `userClubRoles` come nel file `firestore.rules`.

2. Esegui il deploy: `firebase deploy --only firestore:rules` (assicurati di aver selezionato il project corretto con `firebase use <projectId>`).

# Preview production build3. Crea il documento profilo: `profiles/{uid}` con almeno `{ firstName: "Test" }` (la regola consente read se `request.auth.uid == userId`).

npm run preview            # Test build locally4. (Opzionale) Crea un documento in `userClubRoles` con campi: `userId`, `clubId`, `role` per testare la lettura.

5. Hard refresh (svuota cache) oppure riavvia dev server se necessario.

# Deploy Firebase

npx firebase deploy        # Deploy to Firebase HostingMitigazioni implementate nel codice:

```- Cooldown 60s dopo `permission-denied` per `getUserProfile` e `getUserClubRoles` (riduce spam).

- Cache breve (30s) dei dati validi già letti.

### **Testing & Quality**- Skip doppia esecuzione handler auth in React StrictMode (solo dev).

```bash

# Run test suiteSe dopo il deploy persiste l'errore:

npm test                   # Run all tests- Controlla nella Console Firestore se i documenti esistono e se il tuo utente è autenticato.

- Assicurati che non ci sia un errore sintattico nelle regole (la CLI lo segnalerebbe in fase di deploy).

# Watch mode- Verifica che l'orario locale non causi token scaduti (rari casi: sincronizza l'orologio di sistema).

npm run test:watch         # Watch files & re-run tests

Log utili (una sola volta) rimangono per guidare l'operatore; ulteriori tentativi vengono soppressi fino alla scadenza del cooldown.

# Test UI

npm run test:ui           # Interactive test interface### LocalStorage Namespacing

Chiavi prefissate: `psp:v1[:clubId]:<key>` tramite helper in `src/utils/storage.js` (evita collisioni cross-club e supporta invalidazioni mirate).

# Coverage report

npm run test:coverage     # Generate coverage report### Migrazione

Documento dettagliato: `MULTI_CLUB_MIGRATION.md` (script Node Admin SDK, checklist validazione, indici, inizializzazione settings/config).

# Code linting

npm run lint              # ESLint check### Prossimi Step (facoltativi)

npm run lint:fix          # Auto-fix lint issues- Cloud Function di purge prenotazioni vecchie.

- Cache ranking/stats incrementale (`statsCache`).

# Code formatting- Sistema notifiche per club multi-canale.

npm run format            # Prettier formatting- Validazione runtime schema settings + test.

```



### **Mobile Development**## �🎨 Design System

```bash

# Add Android platformThe application uses a comprehensive design system with:

npx cap add android

- **Color Palette**: Professional blue/green theme

# Sync web assets- **Typography**: Inter font family

npx cap sync android- **Spacing**: 4px grid system

- **Components**: Consistent UI patterns

# Open Android Studio- **Responsive**: Mobile-first approach

npx cap open android

## 🔧 Configuration

# Build APK

cd android && ./gradlew assembleRelease### Firebase Setup

```

1. Create a Firebase project

---2. Enable Authentication and Firestore

3. Copy configuration to `src/services/firebase.js`

## 🏗️ Struttura Progetto

### Environment Variables

```

playsport-pro/```env

├── 📁 src/                           # Source codeVITE_FIREBASE_API_KEY=your-api-key

│   ├── 📁 components/                # React componentsVITE_FIREBASE_AUTH_DOMAIN=your-auth-domain

│   │   ├── 📁 ui/                   # UI primitivesVITE_FIREBASE_PROJECT_ID=your-project-id

│   │   ├── 📁 forms/                # Form components```

│   │   └── 📁 layout/               # Layout components

│   ├── 📁 pages/                    # Route pages## 📱 PWA Features

│   │   ├── 📁 dashboard/            # Dashboard pages

│   │   ├── 📁 bookings/             # Booking management- **Installable**: Add to home screen

│   │   ├── 📁 matches/              # Match management- **Offline Support**: Service worker caching

│   │   └── 📁 admin/                # Admin panels- **Push Notifications**: Booking reminders

│   ├── 📁 hooks/                    # Custom React hooks- **App-like Experience**: Full screen mode

│   ├── 📁 contexts/                 # React contexts

│   ├── 📁 services/                 # External services## 🚀 Deployment

│   │   ├── firebase.js              # Firebase configuration

│   │   ├── api.js                   # API clientsThe application is optimized for deployment on:

│   │   └── auth.js                  # Authentication

│   ├── 📁 lib/                      # Core libraries- **Netlify**: Static hosting with redirects

│   │   ├── security.js              # Security utilities- **Vercel**: Serverless functions support

│   │   ├── analytics.js             # Analytics integration- **Firebase Hosting**: Native Firebase integration

│   │   ├── performance.js           # Performance monitoring

│   │   └── databaseOptimization.js  # DB optimization## 🤝 Contributing

│   ├── 📁 utils/                    # Utility functions

│   ├── 📁 styles/                   # CSS & styling1. Fork the repository

│   └── 📁 test/                     # Test utilities2. Create feature branch (`git checkout -b feature/amazing-feature`)

├── 📁 public/                       # Static assets3. Commit changes (`git commit -m 'Add amazing feature'`)

│   ├── sw.js                        # Service Worker4. Push to branch (`git push origin feature/amazing-feature`)

│   ├── manifest.json                # PWA manifest5. Open Pull Request

│   └── icons/                       # App icons

├── 📁 android/                      # Android app (Capacitor)## 📊 Performance

├── 📁 scripts/                      # Build & deploy scripts

├── 📁 docs/                         # Documentation- **Lighthouse Score**: 95+ on all metrics

│   ├── DEPLOYMENT_GUIDE_COMPLETO.md # Deployment guide- **Bundle Size**: Optimized with Vite

│   └── DOCUMENTAZIONE_TECNICA_COMPLETA.md # Technical docs- **Loading Time**: < 2s on 3G

├── firebase.json                    # Firebase configuration- **Mobile Performance**: 90+ score

├── capacitor.config.ts              # Capacitor configuration

├── vite.config.js                   # Vite build configuration## 🌐 Browser Support

├── vitest.config.js                 # Test configuration

└── package.json                     # Dependencies & scripts- Chrome 90+

```- Firefox 88+

- Safari 14+

---- Edge 90+



## 🏢 Architettura Multi-Club## 📄 License



La piattaforma supporta la gestione di più club con:This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



### **Concetti Chiave**## 🧪 Testing & Validation

- **Club Namespace**: Ogni club ha le proprie subcollections isolate

- **Affiliazioni Normalizzate**: Sistema di ruoli e permessi granulari### Test Framework

- **Routing Contestualizzato**: Tutte le route sono sotto `/club/:clubId/`Vitest è integrato per test unit leggeri.

- **Configurazioni per Club**: Settings personalizzabili per ogni club

- **Ranking Isolato**: Classifiche separate per ogni clubScript disponibili:

- `npm run test` (esecuzione una tantum)

### **Schema Firestore**- `npm run test:watch` (watch mode)

```

clubs/{clubId}/### Copertura Iniziale

├── courts/{courtId}- `computeClubRanking`: test su isolamento per `clubId`, modalità legacy (`default-club`), esclusione match cross-club.

├── bookings/{bookingId}

├── players/{playerId}### Validazione Settings

├── matches/{matchId}Le configurazioni per club (`bookingConfig`, `lessonConfig`) vengono sanificate tramite schema Zod:

├── tournaments/{tournamentId}- Valori out-of-range vengono ripristinati ai default

├── lessons/{lessonId}- Campi extra vengono ignorati

├── statsCache/{docId}- Lazy init del documento `settings/config` se assente

└── settings/config

### Estensioni Future Suggerite

affiliations/{userId_clubId}- Test integrazione flusso prenotazione multi-club

profiles/{userId}- Test regole Firestore via Emulator (affiliazioni / permessi update settings)

userClubRoles/{userId_clubId}- Test performance (slot generation e ranking su dataset esteso)

```

## 🙏 Acknowledgments

### **Sicurezza**

- Funzioni di controllo: `isAffiliated`, `isClubStaff`, `isClubAdmin`- **Recharts**: Beautiful charts library

- Validazione cross-club per prevenire data leakage- **Tailwind CSS**: Utility-first CSS framework

- Permessi granulari per ogni operazione- **Firebase**: Backend-as-a-Service

- **Lucide**: Icon library

---

---

## 🛡️ Sicurezza & Performance

**Made with ❤️ for the Padel Community**

### **🔒 Security Features**

- **Input Sanitization**: XSS protection con DOMPurifyFor support or questions, please open an issue on GitHub.

- **Rate Limiting**: Protezione da abuse e bot
- **CSRF Protection**: Token-based request validation
- **Content Security Policy**: HTTP headers sicurezza
- **Firebase Security Rules**: Database-level permissions
- **Audit Logging**: Tracking delle azioni sensibili

### **⚡ Performance Optimizations**
- **Code Splitting**: Lazy loading delle route e componenti
- **Service Worker**: Caching strategico e offline support
- **Bundle Analysis**: Ottimizzazione dimensioni JavaScript
- **Web Vitals**: Monitoring CLS, FID, LCP, FCP, TTFB
- **Database Optimization**: Query caching e batch operations
- **CDN**: Distribuzione statica globale via Firebase

### **📊 Monitoring & Analytics**
- **Sentry Integration**: Error tracking e performance monitoring
- **Google Analytics 4**: User behavior e conversion tracking
- **Custom Events**: Business metrics e KPI tracking
- **Real-time Dashboards**: Performance e usage analytics

---

## 🌐 Deploy & Production

### **🔥 Firebase Hosting**
```bash
# Initialize Firebase (first time only)
npx firebase init hosting

# Deploy to production
npm run build
npx firebase deploy --only hosting

# Deploy with functions
npx firebase deploy
```

### **📱 Mobile App Deployment**
```bash
# Generate signed APK
npm run build:mobile
cd android
./gradlew assembleRelease

# Upload to Google Play Store
# Follow Google Play Console guidelines
```

### **🚀 Performance Deployment Checklist**
- [ ] ✅ Build ottimizzata senza errori
- [ ] ✅ Test suite completa (80%+ coverage)
- [ ] ✅ Security audit completato
- [ ] ✅ Performance metrics validati
- [ ] ✅ Firebase rules aggiornate
- [ ] ✅ Environment variables configurate
- [ ] ✅ Service Worker attivo
- [ ] ✅ Analytics e monitoring attivi

---

## 🧪 Testing & Validation

### **Test Framework**
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI test interface
npm run test:ui
```

### **Copertura Test**
- **Unit Tests**: Componenti e logica business
- **Integration Tests**: API e database operations
- **Security Tests**: Input validation e sanitization
- **Performance Tests**: Web Vitals e bundle size

---

## 🤝 Contributing & Development

### **🔧 Development Guidelines**
1. **Branching**: Feature branches da `main`
2. **Commits**: Conventional Commits format
3. **Testing**: Tutti i PR devono avere test
4. **Code Review**: Peer review obbligatorio
5. **Quality Gates**: ESLint + Prettier + TypeScript

### **📋 Pull Request Process**
```bash
# 1. Create feature branch
git checkout -b feature/amazing-feature

# 2. Make changes with tests
npm test
npm run lint:fix

# 3. Commit with conventional format
git commit -m "feat: add amazing feature with tests"

# 4. Push and create PR
git push origin feature/amazing-feature
```

### **🎯 Roadmap & Future Features**
- [ ] 🔄 Real-time match scoring
- [ ] 🏆 Advanced tournament brackets
- [ ] 💳 Payment integration (Stripe)
- [ ] 📧 Email notifications system
- [ ] 🌍 Multi-language support (i18n)
- [ ] 📈 Advanced analytics dashboard
- [ ] 🤖 AI-powered court scheduling
- [ ] ⌚ Wearable device integration

---

## 📞 Support & Documentation

### **📚 Documentation**
- [**Deployment Guide**](./DEPLOYMENT_GUIDE_COMPLETO.md) - Guida completa al deployment
- [**Technical Documentation**](./DOCUMENTAZIONE_TECNICA_COMPLETA.md) - Documentazione tecnica approfondita
- [**Multi-Club Migration**](./MULTI_CLUB_MIGRATION.md) - Guida migrazione multi-club

### **🆘 Support**
- **GitHub Issues**: [Report bugs & feature requests](https://github.com/parischit85-sketch/playsport-pro/issues)
- **Discussions**: [Community discussions](https://github.com/parischit85-sketch/playsport-pro/discussions)

---

## 📄 License & Credits

### **📃 License**
Questo progetto è rilasciato sotto [MIT License](LICENSE).

### **🙏 Credits**
- **React Team** - Framework UI
- **Firebase Team** - Backend infrastructure
- **Vite Team** - Build tooling
- **TailwindCSS** - Styling framework
- **Community Contributors** - Open source libraries

---

## 🎉 Status del Progetto

**🟢 Stato: PRODUCTION READY**

- ✅ **Core Features**: 100% implementate
- ✅ **Testing**: 80%+ coverage
- ✅ **Documentation**: Completa
- ✅ **Security**: Enterprise-grade
- ✅ **Performance**: Ottimizzate
- ✅ **Mobile**: Android APK ready
- ✅ **Deployment**: Automatizzato

**Pronto per servire migliaia di utenti con performance, sicurezza e affidabilità di livello enterprise! 🚀**

---

**Made with ❤️ for the Sports Community**

For support or questions, please open an issue on GitHub.