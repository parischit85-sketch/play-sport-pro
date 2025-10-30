# 🌙 Dark Theme Migration - Checklist Completa

> **Obiettivo**: Applicare il tema scuro come unico tema del sito, rimuovendo qualsiasi dipendenza dal tema chiaro del browser.

**Data creazione**: 29 Ottobre 2025  
**Senior Developer**: Analisi completa di tutte le pagine, form, modal e popup

---

## 📊 Executive Summary

### Configurazione Attuale

- **Tailwind Config**: `darkMode: "class"` (controllo manuale tramite classe CSS)
- **Stato**: Sistema a doppio tema (light/dark) basato su preferenze browser
- **Classi Dark**: Utilizzate con pattern `dark:` su tutti i componenti

### Piano di Migrazione

1. **Forzare tema scuro** indipendentemente dalle preferenze browser
2. **Rimuovere tutte le classi `dark:`** dai componenti
3. **Applicare direttamente i colori scuri** come predefiniti
4. **Aggiornare Tailwind config** per eliminare il dark mode toggle
5. **Test completo** su tutte le pagine e componenti

---

## 🗺️ MAPPA COMPLETA DEL SITO

### 1️⃣ PAGINE PRINCIPALI (26 pagine)

#### **Pubbliche (Non Autenticate)**

- [ ] `LandingPage.jsx` - Landing page con hero section e features
- [ ] `LoginPage.jsx` - Pagina di login
- [ ] `RegisterPage.jsx` - Registrazione utenti
- [ ] `RegisterClubPage.jsx` - Registrazione club
- [ ] `PublicTournamentView.jsx` - Vista pubblica tornei

#### **Dashboard & Home**

- [ ] `DashboardHomePage.jsx` - Home dashboard principale
- [ ] `DashboardPage.jsx` - Dashboard dettagliata utente
- [ ] `InstructorDashboardPage.jsx` - Dashboard istruttori

#### **Gestione Club**

- [ ] `ClubSearchPage.jsx` - Ricerca club
- [ ] `MyAffiliationsPage.jsx` - Gestione affiliazioni

#### **Prenotazioni**

- [ ] `BookingPage.jsx` - Prenotazione campi
- [ ] `LessonBookingPage.jsx` - Prenotazione lezioni
- [ ] `AdminBookingsPage.jsx` - Gestione prenotazioni admin

#### **Giocatori & Statistiche**

- [ ] `PlayersPage.jsx` - CRM giocatori
- [ ] `ProfilePage.jsx` - Profilo utente
- [ ] `StatsPage.jsx` - Statistiche e ranking
- [ ] `ClassificaPage.jsx` - Classifica generale

#### **Partite & Tornei**

- [ ] `MatchesPage.jsx` - Gestione partite
- [ ] `TournamentsPage.jsx` - Lista tornei
- [ ] `TournamentDetailsPageWrapper.jsx` - Dettagli torneo

#### **Admin**

- [ ] `AdminLogin.jsx` - Login amministratore
- [ ] `AdminDashboard.jsx` - Dashboard admin
- [ ] `ClubsManagement.jsx` - Gestione club
- [ ] `ClubSettings.jsx` - Impostazioni club
- [ ] `ClubRegistrationRequests.jsx` - Richieste registrazione
- [ ] `UsersManagement.jsx` - Gestione utenti

#### **Utilità**

- [ ] `Bootstrap.jsx` - Bootstrap app
- [ ] `DarkModeTestPage.jsx` - ⚠️ **DA RIMUOVERE O ADATTARE**

---

### 2️⃣ COMPONENTI MODALI (15+ modali)

#### **Modali Base**

- [ ] `Modal.jsx` - Modal base riutilizzabile
- [ ] `ConfirmModal.jsx` - Modal di conferma
- [ ] `ExportModal.jsx` - Export dati

#### **Modali Business**

- [ ] `FormulaModal.jsx` - Visualizzazione formula RPA
- [ ] `BookingTypeModal.jsx` - Selezione tipo prenotazione
- [ ] `BookingDetailModal.jsx` - Dettagli prenotazione
- [ ] `RegistrationTypeModal.jsx` - Selezione tipo registrazione

#### **Modali Tournament**

- [ ] `TournamentEditModal.jsx` - Modifica torneo
- [ ] `KnockoutSetupModal.jsx` - Setup knockout
- [ ] `MatchResultModal.jsx` - Risultati partita

#### **Modali Import/Export**

- [ ] `ImportExportModal.jsx` - Import/Export configurazioni
- [ ] `ImportCourtsModal.jsx` - Import campi
- [ ] `ExportCourtsModal.jsx` - Export campi

#### **Modali Admin**

- [ ] `SlotFormModal.jsx` - Form slot istruttori
- [ ] `ClubDashboardModal.jsx` - Dashboard club (scroll fix)

---

### 3️⃣ COMPONENTI FORM (20+ form)

#### **Form Autenticazione**

- [ ] `LoginPage.jsx` - Form login email/password
- [ ] `RegisterPage.jsx` - Form registrazione utente
- [ ] `RegisterClubPage.jsx` - Form registrazione club (multi-step)

#### **Form Prenotazioni**

- [ ] `UnifiedBookingFlow.jsx` - Flow prenotazione unificato
- [ ] Booking form in `BookingPage.jsx`
- [ ] Lesson booking form in `LessonBookingPage.jsx`
- [ ] Admin booking form in `AdminBookingsPage.jsx`

#### **Form Giocatori**

- [ ] `PlayerForm.jsx` - Form creazione/modifica giocatore
- [ ] Player registration in `PlayersCRM.jsx`
- [ ] Medical certificate form in `PlayerDetails.jsx`

#### **Form Tornei**

- [ ] Tournament creation form in `TournamentsPage.jsx`
- [ ] Tournament edit form in `TournamentEditModal.jsx`
- [ ] Match result form in `MatchResultModal.jsx`
- [ ] Team creation form

#### **Form Admin**

- [ ] Club settings form in `ClubSettings.jsx`
- [ ] Court configuration form in `AdminBookingsPage.jsx`
- [ ] Instructor slot form in `SlotFormModal.jsx`
- [ ] User management form in `UsersManagement.jsx`

#### **Form Profilo**

- [ ] Profile edit in `ProfilePage.jsx`
- [ ] `ClubAdminProfile.jsx` - Form profilo admin club
- [ ] Password change form
- [ ] Email verification form

---

### 4️⃣ COMPONENTI POPUP & NOTIFICATIONS (10+ popup)

#### **Toast & Notifications**

- [ ] `Toast.jsx` - Sistema toast notifications
- [ ] `NotificationSystem.jsx` - Sistema notifiche globale
- [ ] `NotificationAnalyticsDashboard.jsx` - Analytics notifiche

#### **Popup Installazione PWA**

- [ ] `PWAInstallPrompt.jsx` - Prompt installazione PWA
- [ ] `PWAInstallBanner.jsx` - Banner installazione
- [ ] `PWAFloatingButton.jsx` - Floating button PWA
- [ ] `PWABanner.jsx` - Banner generico PWA

#### **Alert & Banner**

- [ ] `CertificateExpiryAlert.jsx` - Alert scadenza certificato
- [ ] `ClubActivationBanner.jsx` - Banner attivazione club
- [ ] `DragDropNotification.jsx` - Notifica drag & drop

#### **Tooltip & Dropdown**

- [ ] `ProfileDropdown.jsx` - Dropdown profilo
- [ ] Tooltip vari nei componenti
- [ ] Context menu nelle tabelle

---

### 5️⃣ COMPONENTI UI COMUNI (30+ componenti)

#### **Navigation**

- [ ] `BottomNavigation.jsx` - Navigazione mobile
- [ ] `NavTabs.jsx` - Tab navigation desktop
- [ ] `ClubSwitcher.jsx` - Switcher club

#### **Cards & Sections**

- [ ] `StatsCard.jsx` - Card statistiche
- [ ] `UserBookingsCard.jsx` - Card prenotazioni utente
- [ ] `RecentClubsCard.jsx` - Card club recenti
- [ ] `Section.jsx` - Sezione generica
- [ ] `card.jsx` - Card base

#### **Data Display**

- [ ] `VirtualizedList.jsx` - Liste virtualizzate
- [ ] `ZoomableGrid.jsx` - Griglia zoom
- [ ] `Badge.jsx` - Badge status
- [ ] `TrendArrow.jsx` - Freccia trend
- [ ] Charts components (`charts/`)

#### **Loading & Skeleton**

- [ ] `LoadingSpinner.jsx` - Spinner caricamento
- [ ] `SkeletonLoader.jsx` - Skeleton loader

#### **Buttons & Inputs**

- [ ] `button.jsx` - Bottoni base
- [ ] `ProfileButton.jsx` - Bottone profilo
- [ ] `ShareButtons.jsx` - Bottoni condivisione

#### **Panels & Overlays**

- [ ] `TimeSlotsSlidePanel.jsx` - Panel slot orari
- [ ] Modal overlay backgrounds

---

### 6️⃣ FEATURE COMPONENTS (40+ componenti)

#### **Tournaments**

- [ ] `TournamentOverview.jsx`
- [ ] `TournamentMatches.jsx`
- [ ] `TournamentStandings.jsx`
- [ ] `PublicTournamentViewTV.jsx`

#### **Players**

- [ ] `PlayersCRM.jsx`
- [ ] `PlayerCard.jsx`
- [ ] `PlayerDetails.jsx` (7 tabs interni!)
- [ ] `PlayerForm.jsx`
- [ ] `CRMTools.jsx`

#### **Stats**

- [ ] `StatisticheGiocatore.jsx`
- [ ] `ClubFinancialStats.jsx`
- [ ] `ClubScheduleRates.jsx`

#### **Booking**

- [ ] `UnifiedBookingFlow.jsx`
- [ ] `DragDropBookings.jsx`
- [ ] Booking calendar components

#### **Admin**

- [ ] `AdminClubDashboard.jsx`
- [ ] Admin menu mobile components

#### **Instructor**

- [ ] `InstructorDashboard.jsx`

#### **Extra & Settings**

- [ ] `ImportExportModal.jsx`
- [ ] Settings panels

---

## 🎨 STRATEGIA DI MIGRAZIONE

### **Fase 1: Configurazione Base** ✅ PRIORITÀ ALTA

#### 1.1 Tailwind Configuration

```javascript
// File: tailwind.config.js

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // ❌ RIMUOVERE: darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Definire palette scura come default
        background: {
          DEFAULT: '#111827', // gray-900
          secondary: '#1f2937', // gray-800
          tertiary: '#374151', // gray-700
        },
        text: {
          DEFAULT: '#f9fafb', // gray-50
          secondary: '#e5e7eb', // gray-200
          tertiary: '#d1d5db', // gray-300
        },
        // Mantenere colori brand
        primary: {
          // Emerald per utenti
          50: '#f0fdf4',
          // ... resto scala emerald
          600: '#16a34a',
        },
        // Altri colori...
      },
    },
  },
  plugins: [],
};
```

#### 1.2 CSS Globale

```css
/* File: src/index.css */

/* RIMUOVERE tutte le media queries dark mode */
/* ❌ @media (prefers-color-scheme: dark) { ... } */

/* IMPOSTARE colori scuri come default */
:root {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #e5e7eb;
}

html,
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Scrollbar scura di default */
::-webkit-scrollbar-track {
  background: #374151;
}

::-webkit-scrollbar-thumb {
  background: #6b7280;
}
```

#### 1.3 HTML Base

```html
<!-- File: index.html -->
<!DOCTYPE html>
<html lang="it" class="dark">
  <!-- Forzare classe dark permanente -->
  <body class="bg-gray-900 text-gray-50">
    <!-- ... -->
  </body>
</html>
```

---

### **Fase 2: Pattern di Sostituzione** 🔧

#### 2.1 Background Classes

```javascript
// PRIMA:
className = 'bg-white dark:bg-gray-800';

// DOPO:
className = 'bg-gray-800';

// PRIMA:
className = 'bg-gray-50 dark:bg-gray-900';

// DOPO:
className = 'bg-gray-900';
```

#### 2.2 Text Classes

```javascript
// PRIMA:
className = 'text-gray-900 dark:text-white';

// DOPO:
className = 'text-white';

// PRIMA:
className = 'text-gray-600 dark:text-gray-400';

// DOPO:
className = 'text-gray-400';
```

#### 2.3 Border Classes

```javascript
// PRIMA:
className = 'border-gray-200 dark:border-gray-700';

// DOPO:
className = 'border-gray-700';
```

#### 2.4 Hover States

```javascript
// PRIMA:
className = 'hover:bg-gray-100 dark:hover:bg-gray-700';

// DOPO:
className = 'hover:bg-gray-700';
```

---

### **Fase 3: Componenti per Categoria** 📦

#### 3.1 MODALI (Priorità: ALTA)

Tutti i modal devono avere:

- Background: `bg-gray-800` o `bg-gray-900`
- Overlay: `bg-black/60` (backdrop scuro)
- Bordi: `border-gray-700`
- Testo: `text-white` / `text-gray-200`

**File da modificare:**

1. `Modal.jsx` - Modal base
2. `FormulaModal.jsx` - Modal RPA
3. `BookingTypeModal.jsx`
4. `ConfirmModal.jsx`
5. Tutti gli altri modal...

#### 3.2 FORM (Priorità: ALTA)

Tutti i form devono avere:

- Input background: `bg-gray-700`
- Input text: `text-white`
- Label: `text-gray-200`
- Placeholder: `placeholder-gray-400`
- Focus ring: `focus:ring-blue-500`
- Select dropdown: background scuro forzato

**File da modificare:**

1. Tutti i form di registrazione
2. Booking forms
3. Player forms
4. Tournament forms
5. Admin forms

#### 3.3 NAVIGATION (Priorità: ALTA)

- [ ] `BottomNavigation.jsx` - Rimuovere tutti i `dark:`
- [ ] `NavTabs.jsx` - Applicare colori scuri fissi
- [ ] Menu e dropdown - Background scuro

#### 3.4 CARDS & LISTS (Priorità: MEDIA)

- [ ] `StatsCard.jsx`
- [ ] `UserBookingsCard.jsx`
- [ ] Liste virtualizzate
- [ ] Tabelle dati

#### 3.5 NOTIFICATIONS (Priorità: MEDIA)

- [ ] Toast messages
- [ ] Alert banners
- [ ] PWA prompts

---

### **Fase 4: Verifiche Specifiche** ✅

#### 4.1 Select Dropdowns

```css
/* Verificare che le option abbiano background scuro */
select option {
  background-color: rgb(55, 65, 81) !important; /* gray-700 */
  color: rgb(229, 231, 235) !important; /* gray-200 */
}
```

#### 4.2 Scrollbar

```css
/* Scrollbar deve essere sempre scura */
::-webkit-scrollbar-track {
  background: #374151; /* Fisso, non media query */
}
```

#### 4.3 Charts & Graphs

- Verificare colori grafici leggibili su sfondo scuro
- Tooltip con background scuro
- Assi e griglie in colori chiari

---

## 📋 CHECKLIST OPERATIVA

### **Pre-Migration**

- [ ] Backup completo del progetto
- [ ] Git commit di sicurezza
- [ ] Documentare tema corrente con screenshots
- [ ] Creare branch `dark-theme-migration`

### **Migration Steps**

#### **Step 1: Configurazione** (1 ora)

- [ ] Modificare `tailwind.config.js`
- [ ] Aggiornare `index.css`
- [ ] Forzare classe `dark` in `index.html`
- [ ] Rimuovere dark mode toggle (se presente)

#### **Step 2: Componenti Base** (2-3 ore)

- [ ] `Modal.jsx` - Modal base
- [ ] `button.jsx` - Bottoni
- [ ] `card.jsx` - Cards
- [ ] Input components base

#### **Step 3: Navigation** (2 ore)

- [ ] `BottomNavigation.jsx`
- [ ] `NavTabs.jsx`
- [ ] `ProfileDropdown.jsx`
- [ ] `ClubSwitcher.jsx`

#### **Step 4: Pages - Landing & Auth** (3 ore)

- [ ] `LandingPage.jsx`
- [ ] `LoginPage.jsx`
- [ ] `RegisterPage.jsx`
- [ ] `RegisterClubPage.jsx`

#### **Step 5: Pages - Dashboard** (3 ore)

- [ ] `DashboardHomePage.jsx`
- [ ] `DashboardPage.jsx`
- [ ] `InstructorDashboardPage.jsx`
- [ ] `AdminDashboardPage.jsx`

#### **Step 6: Pages - Booking** (2 ore)

- [ ] `BookingPage.jsx`
- [ ] `LessonBookingPage.jsx`
- [ ] `AdminBookingsPage.jsx`
- [ ] `UnifiedBookingFlow.jsx`

#### **Step 7: Pages - Players & Stats** (3 ore)

- [ ] `PlayersPage.jsx`
- [ ] `ProfilePage.jsx`
- [ ] `StatsPage.jsx`
- [ ] `ClassificaPage.jsx`
- [ ] `PlayersCRM.jsx` (complesso!)
- [ ] `PlayerDetails.jsx` (7 tabs!)

#### **Step 8: Pages - Tournaments** (3 ore)

- [ ] `TournamentsPage.jsx`
- [ ] `TournamentDetailsPageWrapper.jsx`
- [ ] `TournamentOverview.jsx`
- [ ] `TournamentMatches.jsx`
- [ ] `TournamentStandings.jsx`
- [ ] `PublicTournamentViewTV.jsx`

#### **Step 9: Pages - Matches** (1 ora)

- [ ] `MatchesPage.jsx`

#### **Step 10: Pages - Admin** (3 ore)

- [ ] `AdminDashboard.jsx`
- [ ] `ClubsManagement.jsx`
- [ ] `ClubSettings.jsx`
- [ ] `UsersManagement.jsx`
- [ ] `ClubRegistrationRequests.jsx`

#### **Step 11: Modals** (3 ore)

- [ ] Tutti i modal rimanenti (15+)
- [ ] Verificare overlay backgrounds
- [ ] Test interazioni modal

#### **Step 12: Forms** (4 ore)

- [ ] Tutti i form (20+)
- [ ] Verificare validation styles
- [ ] Test input focus states
- [ ] Select dropdowns styling

#### **Step 13: UI Components** (3 ore)

- [ ] Cards (5+ varianti)
- [ ] Badges
- [ ] Tooltips
- [ ] Loading states
- [ ] Charts

#### **Step 14: Notifications & Popups** (2 ore)

- [ ] Toast system
- [ ] PWA prompts
- [ ] Alert banners
- [ ] Dropdowns

### **Post-Migration**

#### **Testing** (4-6 ore)

- [ ] Test tutte le pagine manualmente
- [ ] Test tutti i modal
- [ ] Test tutti i form (input, validation, submit)
- [ ] Test navigation (desktop + mobile)
- [ ] Test responsive (mobile, tablet, desktop)
- [ ] Test browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Test PWA mode
- [ ] Test con screen reader (accessibilità)

#### **Visual QA**

- [ ] Verificare contrasto colori (WCAG AA compliance)
- [ ] Verificare leggibilità testi
- [ ] Verificare hover states
- [ ] Verificare focus states
- [ ] Verificare disabled states
- [ ] Verificare error states

#### **Performance**

- [ ] Build di produzione
- [ ] Verificare bundle size
- [ ] Lighthouse audit
- [ ] Test velocità caricamento

#### **Documentation**

- [ ] Aggiornare README
- [ ] Documentare nuova palette colori
- [ ] Creare style guide per future modifiche
- [ ] Screenshots before/after

#### **Cleanup**

- [ ] Rimuovere classi `dark:` non utilizzate
- [ ] Rimuovere media queries dark mode
- [ ] Rimuovere `DarkModeTestPage.jsx`
- [ ] Pulire CSS non utilizzato

---

## 🛠️ SCRIPT DI AUTOMAZIONE

### Script di Sostituzione Automatica

```bash
# File: migrate-dark-theme.sh

#!/bin/bash

echo "🌙 Starting Dark Theme Migration..."

# Backup
echo "📦 Creating backup..."
git commit -am "Pre dark-theme migration backup"

# Sostituzioni comuni
echo "🔧 Applying automatic replacements..."

# Background classes
find src -name "*.jsx" -type f -exec sed -i 's/bg-white dark:bg-gray-800/bg-gray-800/g' {} +
find src -name "*.jsx" -type f -exec sed -i 's/bg-gray-50 dark:bg-gray-900/bg-gray-900/g' {} +
find src -name "*.jsx" -type f -exec sed -i 's/bg-gray-100 dark:bg-gray-800/bg-gray-800/g' {} +

# Text classes
find src -name "*.jsx" -type f -exec sed -i 's/text-gray-900 dark:text-white/text-white/g' {} +
find src -name "*.jsx" -type f -exec sed -i 's/text-gray-800 dark:text-gray-100/text-gray-100/g' {} +
find src -name "*.jsx" -type f -exec sed -i 's/text-gray-600 dark:text-gray-400/text-gray-400/g' {} +

# Border classes
find src -name "*.jsx" -type f -exec sed -i 's/border-gray-200 dark:border-gray-700/border-gray-700/g' {} +
find src -name "*.jsx" -type f -exec sed -i 's/border-gray-300 dark:border-gray-600/border-gray-600/g' {} +

# Hover states
find src -name "*.jsx" -type f -exec sed -i 's/hover:bg-gray-100 dark:hover:bg-gray-700/hover:bg-gray-700/g' {} +
find src -name "*.jsx" -type f -exec sed -i 's/hover:bg-gray-50 dark:hover:bg-gray-800/hover:bg-gray-800/g' {} +

echo "✅ Automatic replacements complete!"
echo "⚠️  Manual review required for complex cases"
```

### Script di Verifica

```bash
# File: verify-dark-theme.sh

#!/bin/bash

echo "🔍 Verifying dark theme migration..."

# Cerca pattern che dovrebbero essere stati rimossi
echo "Searching for remaining 'dark:' classes..."
grep -r "dark:" src/ --include="*.jsx" | wc -l

echo "Searching for light backgrounds..."
grep -r "bg-white" src/ --include="*.jsx" | wc -l
grep -r "bg-gray-50" src/ --include="*.jsx" | wc -l

echo "Searching for dark text on light..."
grep -r "text-gray-900" src/ --include="*.jsx" | wc -l
grep -r "text-black" src/ --include="*.jsx" | wc -l

echo "✅ Verification complete!"
```

---

## 📝 REGEX PATTERNS PER RICERCA

### Pattern da cercare e sostituire in IDE

```regex
# Background patterns
bg-white\s+dark:bg-gray-\d+
bg-gray-50\s+dark:bg-gray-\d+
bg-gray-100\s+dark:bg-gray-\d+

# Text patterns
text-gray-900\s+dark:text-\w+
text-gray-\d+\s+dark:text-gray-\d+
text-black\s+dark:text-white

# Border patterns
border-gray-\d+\s+dark:border-gray-\d+

# Hover patterns
hover:bg-gray-\d+\s+dark:hover:bg-gray-\d+
```

---

## ⏱️ STIMA TEMPI

| Fase                    | Tempo Stimato | Priorità |
| ----------------------- | ------------- | -------- |
| Pre-Migration Setup     | 1 ora         | ALTA     |
| Configurazione Base     | 1 ora         | ALTA     |
| Componenti Base         | 2-3 ore       | ALTA     |
| Navigation              | 2 ore         | ALTA     |
| Pages - Landing & Auth  | 3 ore         | ALTA     |
| Pages - Dashboard       | 3 ore         | ALTA     |
| Pages - Booking         | 2 ore         | ALTA     |
| Pages - Players & Stats | 3 ore         | ALTA     |
| Pages - Tournaments     | 3 ore         | MEDIA    |
| Pages - Matches         | 1 ora         | MEDIA    |
| Pages - Admin           | 3 ore         | MEDIA    |
| Modals (15+)            | 3 ore         | ALTA     |
| Forms (20+)             | 4 ore         | ALTA     |
| UI Components (30+)     | 3 ore         | MEDIA    |
| Notifications & Popups  | 2 ore         | MEDIA    |
| Testing Completo        | 4-6 ore       | ALTA     |
| Visual QA               | 2 ore         | ALTA     |
| Documentation           | 1 ora         | MEDIA    |
| Cleanup                 | 1 ora         | BASSA    |
| **TOTALE**              | **40-45 ore** | -        |

---

## 🎯 PRIORITÀ DI ESECUZIONE

### **FASE 1 - CRITICAL (Giorno 1-2)**

1. Configurazione base (Tailwind + CSS)
2. Modal base
3. Componenti navigation
4. Form base
5. Landing page e Login

### **FASE 2 - HIGH (Giorno 3-4)**

6. Dashboard pages
7. Booking pages
8. Tutti i modal
9. Tutti i form
10. Testing base

### **FASE 3 - MEDIUM (Giorno 5-6)**

11. Players & Stats pages
12. Tournament pages
13. UI Components
14. Admin pages
15. Testing approfondito

### **FASE 4 - FINAL (Giorno 7)**

16. Visual QA
17. Browser testing
18. Performance optimization
19. Documentation
20. Deploy

---

## ⚠️ NOTE IMPORTANTI

### **Attenzione Particolare A:**

1. **Select Dropdowns** - Richiedono CSS specifico per background scuro
2. **Charts** - Verificare leggibilità su sfondo scuro
3. **PWA Mode** - Test specifico in modalità standalone
4. **Immagini** - Potrebbero richiedere filtri per contrasto
5. **Logo** - Verificare visibilità su background scuro
6. **QR Code** - Potrebbero richiedere background chiaro
7. **PDF Export** - Verificare generazione corretta
8. **Email Templates** - Se presenti, non modificare (restano light)

### **Componenti da NON Modificare:**

1. Email templates (HTML statico)
2. PDF exports (potrebbero richiedere tema light)
3. Immagini statiche
4. File esterni (iframe, embed)

---

## 🔗 RISORSE UTILI

### **Color Palette Reference**

```javascript
// Palette Dark Theme
const darkTheme = {
  background: {
    primary: '#111827', // gray-900
    secondary: '#1f2937', // gray-800
    tertiary: '#374151', // gray-700
  },
  text: {
    primary: '#f9fafb', // gray-50
    secondary: '#e5e7eb', // gray-200
    tertiary: '#d1d5db', // gray-300
    muted: '#9ca3af', // gray-400
  },
  border: {
    DEFAULT: '#4b5563', // gray-600
    light: '#6b7280', // gray-500
    dark: '#374151', // gray-700
  },
  brand: {
    primary: '#16a34a', // emerald-600
    hover: '#15803d', // emerald-700
    light: '#22c55e', // emerald-500
  },
};
```

### **Accessibilità WCAG**

- Contrasto minimo testo normale: 4.5:1
- Contrasto minimo testo grande: 3:1
- Tool consigliato: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 📊 PROGRESS TRACKING

### **Overall Progress**

- [ ] 0% - Setup & Configuration
- [ ] 0% - Core Components
- [ ] 0% - Pages Migration
- [ ] 0% - Modals & Forms
- [ ] 0% - Testing & QA
- [ ] 0% - Documentation
- [ ] 0% - Deploy

### **Detailed Progress per Categoria**

#### Pages (0/26)

```
[ ] 00/26 Pages migrate
```

#### Modals (0/15)

```
[ ] 00/15 Modals migrated
```

#### Forms (0/20)

```
[ ] 00/20 Forms migrated
```

#### UI Components (0/30)

```
[ ] 00/30 Components migrated
```

---

## 🚀 QUICK START

1. **Crea branch**

   ```bash
   git checkout -b dark-theme-migration
   ```

2. **Backup**

   ```bash
   git commit -am "Pre migration checkpoint"
   ```

3. **Inizia con Fase 1**
   - Modifica `tailwind.config.js`
   - Modifica `index.css`
   - Modifica `index.html`

4. **Test immediato**

   ```bash
   npm run dev
   ```

5. **Procedi con checklist**
   - Segui ordine priorità
   - Testa ogni sezione
   - Commit frequenti

---

## 📞 SUPPORTO

Per domande o problemi durante la migrazione, fare riferimento a:

- Tailwind Dark Mode docs: https://tailwindcss.com/docs/dark-mode
- WCAG Contrast guidelines: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

---

**Good Luck! 🌙✨**
