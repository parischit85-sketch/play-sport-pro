# 🎾 Play Sport Pro

**Modern Padel League Management Platform**

A comprehensive web application for managing padel leagues, bookings, and tournaments with a modern, mobile-first design.

## ✨ Features

### 🏟️ **Booking System**

- Real-time court availability
- 30-hour cancellation policy
- Inline player editing
- Web Share API integration
- Mobile-optimized booking flow

### 👥 **Player Management**

- Complete player profiles
- Performance statistics
- Ranking system with RPA algorithm
- Tournament participation tracking

### 🏆 **Tournament Management**

- Create and manage tournaments
- Bracket visualization
- Real-time scoring
- Prize distribution tracking

### 📊 **Advanced Analytics**

- Performance dashboards
- Interactive charts with Recharts
- Mobile-responsive statistics
- Export functionality

### 📱 **Mobile-First Design**

- Progressive Web App (PWA)
- Touch-optimized interfaces
- Hybrid table/card views
- Offline capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase account
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/play-sport-pro.git

# Navigate to project directory
cd play-sport-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🏗️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Charts**: Recharts
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Core UI components
│   └── charts/         # Chart components
├── features/           # Feature-specific components
│   ├── booking/        # Booking management
│   ├── players/        # Player management
│   ├── tournaments/    # Tournament system
│   └── stats/          # Statistics & analytics
├── pages/              # Route pages
├── services/           # API & Firebase services
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
└── contexts/           # React contexts
```

## 🏢 Multi-Club Architecture (v2)

La piattaforma è stata evoluta da modello single-league a modello multi-club. Il precedente `LeagueContext` è stato completamente rimosso a favore di servizi mirati e del solo `ClubContext`.

### Concetti Chiave
- Club Namespace: ogni club ha le proprie subcollection (`courts`, `bookings`, `players`, `matches`, `tournaments`, `lessons`, `statsCache`).
- Affiliazioni Normalizzate: collezione root `affiliations` che lega `userId` ↔ `clubId` con ruoli (`member`, `staff`, `owner`, `instructor`).
- Routing: tutte le rotte contestualizzate sono sotto `/club/:clubId/...` (booking, lezioni, classifica, stats, admin bookings, ecc.).
- Context Layer: `ClubContext` fornisce `clubId`, metadata, courts live e loader lazy per players/matches (nessun layer legacy superfluo).
- Ranking per Club: wrapper `computeClubRanking` filtra dati e previene cross-contaminazione.
- Configurazioni per Club: documento Firestore `clubs/{clubId}/settings/config` con `bookingConfig` e `lessonConfig` gestiti via servizio `club-settings` + hook `useClubSettings` (creazione lazy se assente).

### Firestore Schema (estratto)
```
clubs/{clubId}
	courts/{courtId}
	bookings/{bookingId}
	players/{playerId}
	matches/{matchId}
	tournaments/{tournamentId}
	lessons/{lessonId}
	statsCache/{docId}
	settings/config (bookingConfig, lessonConfig)
affiliations/{userId_clubId}
profiles/{userId}
```

### Sicurezza
- Funzioni regole: `isAffiliated`, `isClubStaff`, `isClubAdmin`.
- Lettura bookings/matches consentita solo agli affiliati approvati.
- Creazione booking: `clubId` deve combaciare con path, autore = `createdBy`.
- Aggiornamento settings consentito solo a staff / admin del club.
 - Collezione `userClubRoles`: lettura limitata all'utente owner del documento; modifiche consentite solo a club admin (vedi snippet in `MULTI_CLUB_MIGRATION.md`).

#### 🔐 Troubleshooting Permessi (Firestore)
Se vedi nel browser errori ripetuti tipo:
`FirebaseError: [code=permission-denied]: Missing or insufficient permissions` oppure log `[getUserClubRoles] permission denied`:

1. Verifica che le regole deployate includano i blocchi `profiles` e `userClubRoles` come nel file `firestore.rules`.
2. Esegui il deploy: `firebase deploy --only firestore:rules` (assicurati di aver selezionato il project corretto con `firebase use <projectId>`).
3. Crea il documento profilo: `profiles/{uid}` con almeno `{ firstName: "Test" }` (la regola consente read se `request.auth.uid == userId`).
4. (Opzionale) Crea un documento in `userClubRoles` con campi: `userId`, `clubId`, `role` per testare la lettura.
5. Hard refresh (svuota cache) oppure riavvia dev server se necessario.

Mitigazioni implementate nel codice:
- Cooldown 60s dopo `permission-denied` per `getUserProfile` e `getUserClubRoles` (riduce spam).
- Cache breve (30s) dei dati validi già letti.
- Skip doppia esecuzione handler auth in React StrictMode (solo dev).

Se dopo il deploy persiste l'errore:
- Controlla nella Console Firestore se i documenti esistono e se il tuo utente è autenticato.
- Assicurati che non ci sia un errore sintattico nelle regole (la CLI lo segnalerebbe in fase di deploy).
- Verifica che l'orario locale non causi token scaduti (rari casi: sincronizza l'orologio di sistema).

Log utili (una sola volta) rimangono per guidare l'operatore; ulteriori tentativi vengono soppressi fino alla scadenza del cooldown.

### LocalStorage Namespacing
Chiavi prefissate: `psp:v1[:clubId]:<key>` tramite helper in `src/utils/storage.js` (evita collisioni cross-club e supporta invalidazioni mirate).

### Migrazione
Documento dettagliato: `MULTI_CLUB_MIGRATION.md` (script Node Admin SDK, checklist validazione, indici, inizializzazione settings/config).

### Prossimi Step (facoltativi)
- Cloud Function di purge prenotazioni vecchie.
- Cache ranking/stats incrementale (`statsCache`).
- Sistema notifiche per club multi-canale.
- Validazione runtime schema settings + test.


## �🎨 Design System

The application uses a comprehensive design system with:

- **Color Palette**: Professional blue/green theme
- **Typography**: Inter font family
- **Spacing**: 4px grid system
- **Components**: Consistent UI patterns
- **Responsive**: Mobile-first approach

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication and Firestore
3. Copy configuration to `src/services/firebase.js`

### Environment Variables

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 📱 PWA Features

- **Installable**: Add to home screen
- **Offline Support**: Service worker caching
- **Push Notifications**: Booking reminders
- **App-like Experience**: Full screen mode

## 🚀 Deployment

The application is optimized for deployment on:

- **Netlify**: Static hosting with redirects
- **Vercel**: Serverless functions support
- **Firebase Hosting**: Native Firebase integration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Bundle Size**: Optimized with Vite
- **Loading Time**: < 2s on 3G
- **Mobile Performance**: 90+ score

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🧪 Testing & Validation

### Test Framework
Vitest è integrato per test unit leggeri.

Script disponibili:
- `npm run test` (esecuzione una tantum)
- `npm run test:watch` (watch mode)

### Copertura Iniziale
- `computeClubRanking`: test su isolamento per `clubId`, modalità legacy (`default-club`), esclusione match cross-club.

### Validazione Settings
Le configurazioni per club (`bookingConfig`, `lessonConfig`) vengono sanificate tramite schema Zod:
- Valori out-of-range vengono ripristinati ai default
- Campi extra vengono ignorati
- Lazy init del documento `settings/config` se assente

### Estensioni Future Suggerite
- Test integrazione flusso prenotazione multi-club
- Test regole Firestore via Emulator (affiliazioni / permessi update settings)
- Test performance (slot generation e ranking su dataset esteso)

## 🙏 Acknowledgments

- **Recharts**: Beautiful charts library
- **Tailwind CSS**: Utility-first CSS framework
- **Firebase**: Backend-as-a-Service
- **Lucide**: Icon library

---

**Made with ❤️ for the Padel Community**

For support or questions, please open an issue on GitHub.
