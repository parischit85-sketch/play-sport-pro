# Unificazione Pulsanti Prenotazione

## 📋 Panoramica

Tutti i pulsanti "Prenota" nell'applicazione ora aprono il **BookingTypeModal** per una UX consistente, permettendo all'utente di selezionare prima il circolo e poi il tipo di prenotazione (campo o lezione).

---

## 🎯 Modifiche Implementate

### 1. **UserBookingsCard** - Pulsante "Prenota Ora"

**File modificato:** `src/components/ui/UserBookingsCard.jsx`

#### Modifiche:

- Aggiunta prop `onBookNow` al componente
- Modificato pulsante "Prenota Ora" per usare `onBookNow` callback invece di navigazione diretta
- Modificata card "Prenota Campo" per usare lo stesso pattern

**Codice prima:**

```jsx
export default function UserBookingsCard({ user, state, T, compact }) {
  // ...
  <button onClick={() => navigate('/booking')}>Prenota Ora</button>;
}
```

**Codice dopo:**

```jsx
export default function UserBookingsCard({ user, state, T, compact, onBookNow }) {
  // ...
  <button onClick={onBookNow || (() => navigate('/booking'))}>Prenota Ora</button>;
}
```

#### Comportamento:

- Se `onBookNow` è fornito → Apre BookingTypeModal
- Se `onBookNow` non è fornito → Fallback a navigazione diretta (backward compatibility)

---

### 2. **DashboardPage** - Passaggio Callback

**File modificato:** `src/pages/DashboardPage.jsx`

#### Modifiche:

- Passata prop `onBookNow={() => setShowBookingModal(true)}` a entrambe le istanze di UserBookingsCard (desktop e mobile)

**Codice:**

```jsx
<UserBookingsCard
  user={user}
  T={T}
  onBookNow={() => setShowBookingModal(true)}
/>

<UserBookingsCard
  user={user}
  T={T}
  compact={true}
  onBookNow={() => setShowBookingModal(true)}
/>
```

---

### 3. **AppLayout** - Header "Prenota" Button

**File modificato:** `src/layouts/AppLayout.jsx`

#### Modifiche:

1. Importato `BookingTypeModal`
2. Aggiunto state `showBookingModal`
3. Modificato `handleTabChange` per intercettare click su tab "prenota"
4. Aggiunto BookingTypeModal al layout

**Codice aggiunto:**

```jsx
import BookingTypeModal from '@ui/BookingTypeModal.jsx';

function AppLayoutInner() {
  // ... existing code

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = React.useState(false);

  const handleTabChange = (tabId) => {
    // Intercept "prenota" tab to open BookingTypeModal
    if (tabId === 'prenota') {
      console.log('🎯 [AppLayout] Opening BookingTypeModal for prenota tab');
      setShowBookingModal(true);
      return;
    }

    // ... existing navigation logic
  };

  return (
    <div>
      {/* ... existing layout */}

      {/* Booking Type Modal */}
      <BookingTypeModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSelectType={(type, selectedClubId) => {
          const targetClubId = selectedClubId || 'sporting-cat';
          const path =
            type === 'campo' ? `/club/${targetClubId}/booking` : `/club/${targetClubId}/lessons`;
          navigate(path);
          setShowBookingModal(false);
        }}
      />
    </div>
  );
}
```

---

### 4. **BottomNavigation** - Mobile "Prenota" Button

**File:** `src/components/ui/BottomNavigation.jsx`

#### Stato:

✅ **Già implementato correttamente** - Il componente già gestisce il click su "prenota" aprendo il BookingTypeModal (linee 55-59).

**Codice esistente:**

```jsx
const handleNavClick = (item, event) => {
  // Special handling for "prenota" button - show modal instead of navigating
  if (item.id === 'prenota') {
    setShowBookingModal(true);
    return;
  }
  // ... rest of navigation logic
};
```

---

## 📱 Entry Points Unificati

Ora ci sono **3 entry points** per le prenotazioni, tutti con comportamento identico:

| Entry Point                         | Componente                | Trigger                           | Comportamento            |
| ----------------------------------- | ------------------------- | --------------------------------- | ------------------------ |
| **1. Card "Prenota Campo/Lezione"** | DashboardPage             | Click su card                     | ✅ Apre BookingTypeModal |
| **2. Pulsante "Prenota Ora"**       | UserBookingsCard          | Click quando nessuna prenotazione | ✅ Apre BookingTypeModal |
| **3. Header "Prenota"**             | NavTabs (Desktop)         | Click su tab                      | ✅ Apre BookingTypeModal |
| **4. Bottom Nav "Prenota"**         | BottomNavigation (Mobile) | Click su tab                      | ✅ Apre BookingTypeModal |

---

## 🔄 Flusso Utente Unificato

```
1. Utente clicca qualsiasi pulsante "Prenota"
   ↓
2. Si apre BookingTypeModal
   ↓
3. Utente seleziona il circolo (o usa quello corrente)
   ↓
4. Utente seleziona tipo prenotazione:
   - "Campo" → Naviga a `/club/{clubId}/booking`
   - "Lezione" → Naviga a `/club/{clubId}/lessons`
   ↓
5. Modal si chiude automaticamente
   ↓
6. Utente arriva alla pagina di prenotazione selezionata
```

---

## ✅ Vantaggi

1. **UX Consistente**: Tutti i pulsanti "Prenota" si comportano allo stesso modo
2. **Selezione Circolo**: L'utente può scegliere il circolo prima di prenotare
3. **Flessibilità**: Supporta sia prenotazione campo che lezione
4. **Backward Compatibility**: UserBookingsCard mantiene fallback se usato senza prop
5. **Mobile & Desktop**: Funziona identicamente su tutti i dispositivi

---

## 🧪 Testing

### Test Cases:

1. ✅ **Dashboard - Card "Prenota Campo/Lezione"**
   - Click → Modal si apre
   - Selezione circolo + tipo → Navigazione corretta

2. ✅ **UserBookingsCard - "Prenota Ora"** (quando nessuna prenotazione)
   - Click → Modal si apre
   - Selezione circolo + tipo → Navigazione corretta

3. ✅ **Desktop Header - Tab "Prenota"**
   - Click → Modal si apre (non naviga a `/prenota`)
   - Selezione circolo + tipo → Navigazione corretta

4. ✅ **Mobile Bottom Nav - Tab "Prenota"**
   - Click → Modal si apre
   - Selezione circolo + tipo → Navigazione corretta

5. ✅ **Modal Close**
   - Click su X → Modal si chiude
   - Click fuori dal modal → Modal si chiude
   - ESC key → Modal si chiude

---

## 📝 Note Tecniche

### Props Pattern:

```jsx
// UserBookingsCard - Accetta callback opzionale
<UserBookingsCard
  onBookNow={() => setShowBookingModal(true)}
/>

// BookingTypeModal - Gestisce selezione
<BookingTypeModal
  isOpen={showBookingModal}
  onClose={() => setShowBookingModal(false)}
  onSelectType={(type, selectedClubId) => {
    // Navigate to booking page
  }}
/>
```

### State Management:

- `showBookingModal` state vive in:
  - `DashboardPage` (per card e UserBookingsCard)
  - `AppLayout` (per header desktop)
  - `BottomNavigation` (per mobile nav)

---

## 🔍 Related Files

- `src/components/ui/UserBookingsCard.jsx` - Componente prenotazioni utente
- `src/components/ui/BookingTypeModal.jsx` - Modal selezione tipo prenotazione
- `src/pages/DashboardPage.jsx` - Dashboard principale
- `src/layouts/AppLayout.jsx` - Layout globale con header
- `src/components/ui/NavTabs.jsx` - Navigazione desktop
- `src/components/ui/BottomNavigation.jsx` - Navigazione mobile

---

## 📅 Data Modifica

**5 Gennaio 2025**

## 👤 Autore

Sistema di Prenotazione Play-Sport.pro
