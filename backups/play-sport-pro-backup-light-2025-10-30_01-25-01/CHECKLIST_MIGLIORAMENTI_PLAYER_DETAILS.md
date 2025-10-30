# ✅ CHECKLIST MIGLIORAMENTI PLAYER DETAILS

> **Checklist Operativa per Refactoring e Miglioramenti**  
> **Componente Target**: PlayerDetails.jsx + sub-componenti  
> **Effort Totale**: ~40 ore  
> **Timeline**: 2-3 settimane

---

## 📊 OVERVIEW

### Metriche Iniziali

```
PlayerDetails.jsx:       1,035 righe | CC: 45 | useState: 15
Sub-componenti:          2,250 righe totali
Maintainability Score:   4/10 (CRITICO)
Overall Score:           5.7/10
```

### Metriche Target (Post-Refactoring)

```
PlayerDetails.jsx:       150 righe | CC: 8 | useState: 3
Sub-componenti:          2,530 righe (+ components splitting)
Maintainability Score:   8/10 (BUONO)
Overall Score:           8.3/10
```

---

## 🔴 FASE 1: CRITICAL FIXES (Week 1)

> **Obiettivo**: Risolvere problemi critici di architettura e UX  
> **Effort**: 24 ore | **Priorità**: MASSIMA

### Task 1.1: Component Refactoring (8 ore) 🔴

**Obiettivo**: Ridurre PlayerDetails.jsx da 1,035 a ~150 righe

#### Subtask 1.1.1: Crea PlayerDetailsHeader (2 ore)

- [ ] **Crea file** `src/features/players/components/PlayerDetails/PlayerDetailsHeader.jsx`
- [ ] **Estrai codice** da PlayerDetails.jsx (righe 380-560):
  - Avatar display
  - Nome e categoria badges
  - Stats cards (ranking, wallet, bookings)
  - Status indicators
- [ ] **Props interface**:
  ```jsx
  interface Props {
    player: Player;
    playerWithRealRating: Player;
    isEditMode: boolean;
    onToggleEditMode: () => void;
    onToggleStatus: () => void;
    T: Theme;
  }
  ```
- [ ] **Implementa React.memo** per ottimizzazione
- [ ] **Test**: Rendering corretto avatar, stats, badges

**Files da modificare**:
- 🆕 `PlayerDetails/PlayerDetailsHeader.jsx` (180 righe new)
- ✏️ `PlayerDetails.jsx` (rimuovi 180 righe)

---

#### Subtask 1.1.2: Crea PlayerEditMode (3 ore)

- [ ] **Crea file** `src/features/players/components/PlayerDetails/PlayerEditMode.jsx`
- [ ] **Estrai logica edit** da PlayerDetails.jsx:
  - Form edit completo (contatti, indirizzo, anagrafica)
  - Validazione inline
  - Error display
- [ ] **Implementa custom hook** `usePlayerEditForm`:
  ```jsx
  const {
    formData,
    errors,
    isDirty,
    handleChange,
    handleSave,
    handleCancel
  } = usePlayerEditForm(player, onUpdate);
  ```
- [ ] **Props interface**:
  ```jsx
  interface Props {
    player: Player;
    onUpdate: (data: Partial<Player>) => Promise<void>;
    onCancel: () => void;
    T: Theme;
  }
  ```
- [ ] **Aggiungi unsaved changes warning**:
  ```jsx
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  ```
- [ ] **Test**: Edit flow completo, validazione, unsaved warning

**Files da modificare**:
- 🆕 `PlayerDetails/PlayerEditMode.jsx` (250 righe new)
- 🆕 `PlayerDetails/hooks/usePlayerEditForm.js` (80 righe new)
- ✏️ `PlayerDetails.jsx` (rimuovi 300+ righe)

---

#### Subtask 1.1.3: Crea PlayerAccountLinking (2 ore)

- [ ] **Crea file** `src/features/players/components/PlayerDetails/PlayerAccountLinking.jsx`
- [ ] **Estrai logica account linking** da PlayerDetails.jsx:
  - Account picker modal
  - Search accounts
  - Link/Unlink actions
- [ ] **Implementa custom hook** `useAccountLinking`:
  ```jsx
  const {
    linking,
    linkEmail,
    accounts,
    filteredAccounts,
    loadingAccounts,
    openPicker,
    handleLink,
    handleUnlink
  } = useAccountLinking(player, clubId, onUpdate);
  ```
- [ ] **Aggiungi authorization check**:
  ```jsx
  const { hasPermission } = useAuth();
  
  if (!hasPermission('player.linkAccount')) {
    return <NoPermissionMessage />;
  }
  ```
- [ ] **Test**: Link flow, unlink flow, permission check

**Files da modificare**:
- 🆕 `PlayerDetails/PlayerAccountLinking.jsx` (150 righe new)
- 🆕 `PlayerDetails/hooks/useAccountLinking.js` (100 righe new)
- ✏️ `PlayerDetails.jsx` (rimuovi 200+ righe)

---

#### Subtask 1.1.4: Crea PlayerOverviewTab (1 ora)

- [ ] **Crea file** `src/features/players/components/PlayerDetails/PlayerOverviewTab.jsx`
- [ ] **Estrai overview tab content** da PlayerDetails.jsx (righe 700-900):
  - Contatti display (view mode)
  - Indirizzo display
  - Stats display
  - Tags e preferenze
- [ ] **Props**: player, isEditMode, T
- [ ] **Test**: Rendering overview corretto

**Files da modificare**:
- 🆕 `PlayerDetails/PlayerOverviewTab.jsx` (200 righe new)
- ✏️ `PlayerDetails.jsx` (rimuovi 200 righe)

---

#### Subtask 1.1.5: Refactor Main Container (1 ora)

- [ ] **Modifica** `PlayerDetails.jsx` → slim container
- [ ] **Nuova struttura**:
  ```jsx
  export default function PlayerDetails({ player, onUpdate, _onClose, T }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditMode, setIsEditMode] = useState(false);
    
    const playerWithRealRating = useMemo(() => {
      // Calcolo ranking
    }, [deps]);

    return (
      <div className="player-details-modal">
        <PlayerDetailsHeader 
          player={player}
          playerWithRealRating={playerWithRealRating}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          T={T}
        />
        
        <PlayerTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          T={T}
        />

        {isEditMode && activeTab === 'overview' ? (
          <PlayerEditMode 
            player={player}
            onUpdate={onUpdate}
            onCancel={() => setIsEditMode(false)}
            T={T}
          />
        ) : (
          renderTabContent()
        )}
      </div>
    );
  }
  ```
- [ ] **Verifica**: ~150 righe totali
- [ ] **Test**: Integrazione tutti i sub-componenti

**Target finale Subtask 1.1**:
- ✅ PlayerDetails.jsx: 1,035 → 150 righe (-885 righe)
- ✅ Complessità: CC 45 → 8 (-37)
- ✅ useState: 15 → 3 (-12)

---

### Task 1.2: State Management Refactoring (3 ore) 🔴

**Obiettivo**: Migrare da 15+ useState a useReducer pattern

#### Subtask 1.2.1: Crea Reducer (1.5 ore)

- [ ] **Crea file** `src/features/players/components/PlayerDetails/reducers/playerDetailsReducer.js`
- [ ] **Definisci actions**:
  ```javascript
  export const ACTIONS = {
    SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
    TOGGLE_EDIT_MODE: 'TOGGLE_EDIT_MODE',
    UPDATE_FORM_DATA: 'UPDATE_FORM_DATA',
    SET_ERRORS: 'SET_ERRORS',
    RESET_FORM: 'RESET_FORM',
    SET_LINKING_STATE: 'SET_LINKING_STATE',
    SET_ACCOUNTS: 'SET_ACCOUNTS',
  };
  ```
- [ ] **Implementa reducer**:
  ```javascript
  export const initialState = {
    activeTab: 'overview',
    isEditMode: false,
    editFormData: {},
    editErrors: {},
    linking: {
      isOpen: false,
      email: '',
      search: '',
      accounts: [],
      loading: false
    }
  };

  export function playerDetailsReducer(state, action) {
    switch (action.type) {
      case ACTIONS.SET_ACTIVE_TAB:
        return { ...state, activeTab: action.payload };
      
      case ACTIONS.TOGGLE_EDIT_MODE:
        return {
          ...state,
          isEditMode: !state.isEditMode,
          editFormData: !state.isEditMode ? action.payload.player : {},
          editErrors: {}
        };
      
      // ... altri cases
      
      default:
        return state;
    }
  }
  ```
- [ ] **Test**: Tutte le actions producono state corretto

---

#### Subtask 1.2.2: Integra Reducer in Component (1.5 ore)

- [ ] **Modifica** `PlayerDetails.jsx` - sostituisci useState con useReducer:
  ```jsx
  const [state, dispatch] = useReducer(playerDetailsReducer, initialState);

  const handleTabChange = (tab) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab });
  };

  const toggleEditMode = () => {
    dispatch({ 
      type: ACTIONS.TOGGLE_EDIT_MODE, 
      payload: { player } 
    });
  };
  ```
- [ ] **Aggiorna tutti i sub-componenti** per usare dispatch
- [ ] **Test**: Funzionalità invariata, state management centralizzato

**Target finale Task 1.2**:
- ✅ useState hooks: 15 → 1 (solo useReducer)
- ✅ State logic centralizzato e testabile

---

### Task 1.3: Loading States (2 ore) 🔴

**Obiettivo**: Feedback visivo per tutte le operazioni async

#### Subtask 1.3.1: Loading State Infrastructure (1 ora)

- [ ] **Aggiungi loading state al reducer**:
  ```javascript
  loading: {
    saving: false,
    linking: false,
    unlinking: false,
    loadingAccounts: false
  }
  ```
- [ ] **Crea LoadingButton component**:
  ```jsx
  function LoadingButton({ loading, children, ...props }) {
    return (
      <button disabled={loading} {...props}>
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Caricamento...
          </>
        ) : children}
      </button>
    );
  }
  ```

---

#### Subtask 1.3.2: Implementa Loading in Actions (1 ora)

- [ ] **PlayerEditMode - Save action**:
  ```jsx
  const handleSave = async () => {
    dispatch({ type: 'SET_LOADING', payload: { saving: true } });
    try {
      await onUpdate(formData);
      addNotification('Modifiche salvate!', 'success');
    } catch (error) {
      addNotification('Errore: ' + error.message, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { saving: false } });
    }
  };
  ```
- [ ] **PlayerAccountLinking - Link action**:
  ```jsx
  const handleLink = async (accountId) => {
    dispatch({ type: 'SET_LOADING', payload: { linking: true } });
    try {
      await linkPlayerAccount(clubId, player.id, accountId);
      addNotification('Account collegato!', 'success');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { linking: false } });
    }
  };
  ```
- [ ] **Unlink action**:
  ```jsx
  const handleUnlink = async () => {
    if (!confirm('Scollegare account?')) return;
    dispatch({ type: 'SET_LOADING', payload: { unlinking: true } });
    try {
      await unlinkAccount(clubId, player.id);
      addNotification('Account scollegato!', 'success');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { unlinking: false } });
    }
  };
  ```
- [ ] **Test**: Loading states visibili durante async ops

**Target finale Task 1.3**:
- ✅ Tutte le async actions hanno loading feedback
- ✅ Button disabilitati durante loading
- ✅ Spinner/icona loading visibile

---

### Task 1.4: Unsaved Changes Warning (1 ora) 🔴

**Obiettivo**: Prevenire data loss su edit mode exit

#### Subtask 1.4.1: Dirty State Tracking (30 min)

- [ ] **Aggiungi isDirty al reducer**:
  ```javascript
  const initialFormData = player;
  const isDirty = !isEqual(formData, initialFormData);
  ```
- [ ] **Aggiungi in state**:
  ```javascript
  editState: {
    formData: {},
    errors: {},
    isDirty: false,
    initialData: {}
  }
  ```

---

#### Subtask 1.4.2: Confirmation Dialogs (30 min)

- [ ] **Cancel button con confirm**:
  ```jsx
  const handleCancel = () => {
    if (state.editState.isDirty) {
      if (!confirm('Modifiche non salvate. Sicuro di uscire?')) {
        return;
      }
    }
    dispatch({ type: ACTIONS.RESET_FORM });
  };
  ```
- [ ] **Tab switch con confirm**:
  ```jsx
  const handleTabSwitch = (newTab) => {
    if (state.isEditMode && state.editState.isDirty) {
      if (!confirm('Modifiche non salvate. Cambiare tab?')) {
        return;
      }
      dispatch({ type: ACTIONS.TOGGLE_EDIT_MODE });
    }
    dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: newTab });
  };
  ```
- [ ] **Browser beforeunload** (già implementato in Subtask 1.1.2)
- [ ] **Test**: Conferme appaiono quando necessario

**Target finale Task 1.4**:
- ✅ No data loss accidentale
- ✅ User sempre consapevole di modifiche non salvate

---

### Task 1.5: Testing & Validation (2 ore) 🔴

#### Subtask 1.5.1: Unit Tests (1 ora)

- [ ] **Test reducer**:
  ```javascript
  describe('playerDetailsReducer', () => {
    it('should toggle edit mode', () => {
      const state = initialState;
      const action = { type: ACTIONS.TOGGLE_EDIT_MODE, payload: { player } };
      const newState = playerDetailsReducer(state, action);
      expect(newState.isEditMode).toBe(true);
    });
    
    it('should update form data', () => {
      // ...
    });
  });
  ```
- [ ] **Test custom hooks**:
  ```javascript
  describe('usePlayerEditForm', () => {
    it('should validate email format', () => {
      const { result } = renderHook(() => usePlayerEditForm(player, onUpdate));
      act(() => {
        result.current.handleChange('email', 'invalid-email');
      });
      expect(result.current.errors.email).toBeDefined();
    });
  });
  ```

---

#### Subtask 1.5.2: Integration Tests (1 ora)

- [ ] **Test edit flow completo**:
  ```javascript
  it('should edit and save player data', async () => {
    render(<PlayerDetails player={mockPlayer} onUpdate={mockUpdate} />);
    
    // Click edit button
    fireEvent.click(screen.getByText('Modifica'));
    
    // Change email
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'new@email.com' } });
    
    // Save
    fireEvent.click(screen.getByText('Salva'));
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@email.com' })
      );
    });
  });
  ```
- [ ] **Test account linking flow**
- [ ] **Test tab navigation**
- [ ] **Test unsaved changes warning**

**Target finale Task 1.5**:
- ✅ Code coverage > 80%
- ✅ Tutti i critical path testati

---

## 🟡 FASE 2: HIGH PRIORITY (Week 2)

> **Obiettivo**: Security, UX improvements, GDPR compliance  
> **Effort**: 16 ore | **Priorità**: ALTA

### Task 2.1: Authorization & Security (3 ore) 🟡

#### Subtask 2.1.1: Role-Based Access Control (2 ore)

- [ ] **Crea hook** `usePlayerPermissions`:
  ```jsx
  function usePlayerPermissions() {
    const { currentUser, hasRole } = useAuth();
    
    return {
      canEdit: hasRole('admin', 'clubOwner'),
      canDelete: hasRole('admin', 'clubOwner'),
      canLinkAccount: hasRole('admin', 'clubOwner'),
      canViewPrivateNotes: hasRole('admin', 'clubOwner'),
      canEditWallet: hasRole('admin', 'clubOwner', 'accountant'),
      canSendCommunications: hasRole('admin', 'clubOwner', 'manager')
    };
  }
  ```
- [ ] **Integra in PlayerDetails**:
  ```jsx
  const permissions = usePlayerPermissions();

  if (!permissions.canEdit) {
    return <PlayerDetailsReadOnly player={player} />;
  }
  ```
- [ ] **Proteggi azioni sensibili**:
  ```jsx
  // Edit button
  {permissions.canEdit && (
    <button onClick={toggleEditMode}>Modifica</button>
  )}

  // Delete account link
  {permissions.canLinkAccount && (
    <PlayerAccountLinking ... />
  )}
  ```
- [ ] **Test**: Permission checks funzionano correttamente

---

#### Subtask 2.1.2: Input Sanitization (1 ora)

- [ ] **Install sanitizer**: `npm install dompurify`
- [ ] **Crea utility** `src/lib/sanitize.js`:
  ```javascript
  import DOMPurify from 'dompurify';

  export function sanitizeHTML(html) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
      ALLOWED_ATTR: ['href']
    });
  }

  export function sanitizeText(text) {
    return text.replace(/[<>]/g, '');
  }
  ```
- [ ] **Sanitize note display**:
  ```jsx
  <div dangerouslySetInnerHTML={{
    __html: sanitizeHTML(note.content)
  }} />
  ```
- [ ] **Sanitize form inputs**:
  ```jsx
  const handleChange = (field, value) => {
    const sanitized = sanitizeText(value);
    dispatch({ 
      type: ACTIONS.UPDATE_FORM_DATA, 
      payload: { [field]: sanitized } 
    });
  };
  ```
- [ ] **Test**: XSS attempts bloccati

**Target finale Task 2.1**:
- ✅ Role-based access implementato
- ✅ XSS prevention attivo

---

### Task 2.2: Error Display Enhancement (2 ore) 🟡

#### Subtask 2.2.1: ValidationError Component (1 ora)

- [ ] **Crea** `src/components/common/ValidationError.jsx`:
  ```jsx
  import { AlertCircle } from 'lucide-react';

  export function ValidationError({ message, field }) {
    if (!message) return null;
    
    return (
      <div 
        role="alert"
        className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mt-1 animate-shake"
      >
        <AlertCircle size={16} />
        <span id={`${field}-error`}>{message}</span>
      </div>
    );
  }
  ```
- [ ] **Aggiungi animation** in CSS:
  ```css
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .animate-shake {
    animation: shake 0.3s ease-in-out;
  }
  ```
- [ ] **Test**: Error rendering corretto

---

#### Subtask 2.2.2: Integra in Forms (1 ora)

- [ ] **PlayerEditMode - Sostituisci error display**:
  ```jsx
  // ❌ Prima:
  {editErrors.email && (
    <span className="text-red-500 text-xs">{editErrors.email}</span>
  )}

  // ✅ Dopo:
  <ValidationError message={editErrors.email} field="email" />
  ```
- [ ] **Aggiungi aria attributes**:
  ```jsx
  <input
    id="player-email"
    aria-describedby={editErrors.email ? 'email-error' : undefined}
    aria-invalid={!!editErrors.email}
    value={formData.email}
    onChange={(e) => handleChange('email', e.target.value)}
  />
  ```
- [ ] **Applica a tutti i form fields** in edit mode
- [ ] **Test**: Accessibility check passed

**Target finale Task 2.2**:
- ✅ Errori visivamente prominenti
- ✅ Accessibilità migliorata (ARIA)

---

### Task 2.3: Success Notifications (1 ora) 🟡

#### Subtask 2.3.1: Toast Notifications (1 ora)

- [ ] **Sostituisci alert() con toast**:
  ```jsx
  // ❌ Prima:
  alert('✅ Modifiche salvate!');

  // ✅ Dopo:
  import { useUI } from '@contexts/UIContext';
  const { addNotification } = useUI();
  
  addNotification({
    type: 'success',
    title: 'Successo!',
    message: 'Modifiche salvate correttamente',
    duration: 3000
  });
  ```
- [ ] **Applica in tutte le azioni**:
  - [x] Save edit player
  - [x] Link account
  - [x] Unlink account
  - [x] Add transaction (Wallet)
  - [x] Add note
  - [x] Save tournament data
  - [x] Save certificate
  - [x] Send communication
- [ ] **Test**: Toast appaiono correttamente

**Target finale Task 2.3**:
- ✅ UX feedback professionale
- ✅ No più alert() modali

---

### Task 2.4: GDPR Compliance (6 ore) 🟡

#### Subtask 2.4.1: Export Player Data (3 ore)

- [ ] **Crea service** `src/services/playerDataExport.js`:
  ```javascript
  export async function exportPlayerData(playerId, clubId) {
    // Fetch all player data
    const player = await getPlayer(clubId, playerId);
    const bookings = await getPlayerBookings(playerId);
    const communications = await getPlayerCommunications(playerId);
    const transactions = await getPlayerTransactions(playerId);
    
    const exportData = {
      profile: {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        // ... tutti i campi
      },
      notes: player.notes || [],
      wallet: {
        balance: player.wallet?.balance,
        transactions: transactions
      },
      bookings: bookings,
      communications: communications,
      exportDate: new Date().toISOString(),
      exportedBy: currentUser.email
    };

    return exportData;
  }

  export function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  export function downloadCSV(data, filename) {
    // Convert to CSV
    const csv = objectToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    // ... download
  }
  ```
- [ ] **Aggiungi button export in PlayerDetailsHeader**:
  ```jsx
  <button 
    onClick={handleExportData}
    className="flex items-center gap-2"
  >
    <Download size={16} />
    Esporta Dati (GDPR)
  </button>
  ```
- [ ] **Implementa handler**:
  ```jsx
  const handleExportData = async () => {
    try {
      const data = await exportPlayerData(player.id, clubId);
      downloadJSON(data, `player-${player.id}-export.json`);
      addNotification('Dati esportati!', 'success');
    } catch (error) {
      addNotification('Errore export: ' + error.message, 'error');
    }
  };
  ```
- [ ] **Test**: Export genera file JSON corretto

---

#### Subtask 2.4.2: Delete Player (GDPR Right to be Forgotten) (2 ore)

- [ ] **Crea service** `src/services/playerDeletion.js`:
  ```javascript
  export async function deletePlayerPermanently(playerId, clubId) {
    // 1. Archive all player data to separate collection for audit
    await archivePlayerData(playerId, clubId);
    
    // 2. Delete player from players collection
    await deleteDoc(doc(db, `clubs/${clubId}/players`, playerId));
    
    // 3. Unlink from account (if linked)
    if (player.linkedAccountId) {
      await unlinkAccount(clubId, playerId);
    }
    
    // 4. Anonymize bookings (replace name with "Deleted User")
    await anonymizePlayerBookings(playerId);
    
    // 5. Delete notes
    await deletePlayerNotes(playerId);
    
    // 6. Keep wallet transactions (legal requirement) but anonymize
    await anonymizeWalletTransactions(playerId);
    
    return true;
  }
  ```
- [ ] **Aggiungi button delete** (admin only):
  ```jsx
  {permissions.canDelete && (
    <button 
      onClick={handleDeletePermanently}
      className="text-red-600"
    >
      <Trash2 size={16} />
      Elimina Definitivamente (GDPR)
    </button>
  )}
  ```
- [ ] **Implementa handler con doppia conferma**:
  ```jsx
  const handleDeletePermanently = async () => {
    const confirm1 = confirm(
      `ATTENZIONE: Stai per eliminare definitivamente ${player.name}. ` +
      `Questa azione è irreversibile. Continuare?`
    );
    if (!confirm1) return;

    const confirm2 = prompt(
      `Per confermare, digita il nome del giocatore: "${player.name}"`
    );
    if (confirm2 !== player.name) {
      alert('Nome non corretto. Operazione annullata.');
      return;
    }

    try {
      await deletePlayerPermanently(player.id, clubId);
      addNotification('Giocatore eliminato definitivamente', 'success');
      onClose(); // Close modal
    } catch (error) {
      addNotification('Errore: ' + error.message, 'error');
    }
  };
  ```
- [ ] **Test**: Deletion flow completo, doppia conferma

---

#### Subtask 2.4.3: Consent Management UI (1 ora)

- [ ] **Aggiungi campo consent in player schema**:
  ```javascript
  consents: {
    marketing: {
      given: false,
      date: null,
      ip: null,
      method: 'manual'
    },
    dataProcessing: {
      given: true,
      date: '2025-01-01',
      ip: '192.168.1.1',
      method: 'signup'
    },
    thirdParty: {
      given: false,
      date: null
    }
  }
  ```
- [ ] **Crea UI in PlayerOverviewTab**:
  ```jsx
  <div className="consent-management">
    <h4>Consensi Privacy</h4>
    <ConsentCheckbox
      label="Trattamento dati personali"
      checked={player.consents?.dataProcessing?.given}
      required={true}
      readonly={true}
    />
    <ConsentCheckbox
      label="Comunicazioni marketing"
      checked={player.consents?.marketing?.given}
      onChange={(checked) => updateConsent('marketing', checked)}
    />
    <ConsentCheckbox
      label="Condivisione con terze parti"
      checked={player.consents?.thirdParty?.given}
      onChange={(checked) => updateConsent('thirdParty', checked)}
    />
  </div>
  ```
- [ ] **Track consent changes** con IP e timestamp
- [ ] **Test**: Consent updates tracciati

**Target finale Task 2.4**:
- ✅ GDPR export implementato
- ✅ Right to be forgotten implementato
- ✅ Consent management UI

---

### Task 2.5: Code Splitting & Optimization (4 ore) 🟡

#### Subtask 2.5.1: Lazy Load Tab Components (2 ore)

- [ ] **Implementa lazy loading**:
  ```jsx
  import { lazy, Suspense } from 'react';

  const PlayerTournamentTab = lazy(() => 
    import('./PlayerTournamentTab')
  );
  const PlayerMedicalTab = lazy(() => 
    import('./PlayerMedicalTab')
  );
  const PlayerNotes = lazy(() => 
    import('./PlayerNotes')
  );
  const PlayerWallet = lazy(() => 
    import('./PlayerWallet')
  );
  const PlayerBookingHistory = lazy(() => 
    import('./PlayerBookingHistory')
  );
  const PlayerCommunications = lazy(() => 
    import('./PlayerCommunications')
  );
  ```
- [ ] **Crea TabLoadingSpinner**:
  ```jsx
  function TabLoadingSpinner() {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-500">Caricamento tab...</span>
      </div>
    );
  }
  ```
- [ ] **Wrap tab rendering**:
  ```jsx
  <Suspense fallback={<TabLoadingSpinner />}>
    {activeTab === 'tournament' && <PlayerTournamentTab ... />}
    {activeTab === 'medical' && <PlayerMedicalTab ... />}
    {/* ... */}
  </Suspense>
  ```
- [ ] **Test**: Bundle size ridotto, lazy loading funziona

---

#### Subtask 2.5.2: Memoization Optimization (2 ore)

- [ ] **Wrap sub-components con React.memo**:
  ```jsx
  const PlayerDetailsHeader = React.memo(({ player, ... }) => {
    // ...
  });

  const PlayerOverviewTab = React.memo(({ player, ... }) => {
    // ...
  });
  ```
- [ ] **Memoize callback functions**:
  ```jsx
  const handleSave = useCallback(async (data) => {
    await onUpdate(data);
  }, [onUpdate]);

  const handleTabChange = useCallback((tab) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab });
  }, [dispatch]);
  ```
- [ ] **Memoize expensive computations**:
  ```jsx
  const stats = useMemo(() => {
    return {
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      // ... altri calcoli
    };
  }, [bookings]);
  ```
- [ ] **Run performance audit**:
  - React DevTools Profiler
  - Lighthouse
  - Bundle size analysis
- [ ] **Test**: Re-renders ridotti, performance migliorata

**Target finale Task 2.5**:
- ✅ Bundle size: 35KB → 15KB (initial) + lazy chunks
- ✅ Re-renders ridotti del 40%
- ✅ Lighthouse score > 90

---

## 🟢 FASE 3: ENHANCEMENTS (Week 3+)

> **Obiettivo**: Nice-to-have features, polish, advanced features  
> **Effort**: Variable | **Priorità**: MEDIA-BASSA

### Task 3.1: Quick Actions Menu (3 ore) 🟢

- [ ] **Crea** `PlayerQuickActions.jsx`:
  ```jsx
  function PlayerQuickActions({ player, onAction }) {
    const actions = [
      { 
        id: 'email', 
        icon: <Mail />, 
        label: 'Invia Email',
        onClick: () => onAction('email')
      },
      {
        id: 'note',
        icon: <FileText />,
        label: 'Nuova Nota',
        onClick: () => onAction('note')
      },
      {
        id: 'transaction',
        icon: <DollarSign />,
        label: 'Aggiungi Transazione',
        onClick: () => onAction('transaction')
      },
      {
        id: 'export',
        icon: <Download />,
        label: 'Esporta Dati',
        onClick: () => onAction('export')
      }
    ];

    return (
      <Popover>
        <PopoverTrigger>
          <button className="quick-actions-btn">
            <Zap size={20} />
            Azioni Rapide
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid grid-cols-2 gap-2">
            {actions.map(action => (
              <button 
                key={action.id}
                onClick={action.onClick}
                className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-lg"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  ```
- [ ] **Integra in PlayerDetailsHeader**
- [ ] **Test**: Azioni eseguite correttamente

---

### Task 3.2: Keyboard Shortcuts (2 ore) 🟢

- [ ] **Crea hook** `usePlayerDetailsShortcuts`:
  ```jsx
  function usePlayerDetailsShortcuts({ onSave, onCancel, onClose, onExport }) {
    useEffect(() => {
      const handleKeyDown = (e) => {
        // Esc - Chiudi modal
        if (e.key === 'Escape') {
          onClose();
        }

        // Ctrl+S - Salva
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          onSave();
        }

        // Ctrl+E - Toggle edit mode
        if (e.ctrlKey && e.key === 'e') {
          e.preventDefault();
          toggleEditMode();
        }

        // Ctrl+K - Quick actions
        if (e.ctrlKey && e.key === 'k') {
          e.preventDefault();
          openQuickActions();
        }

        // Ctrl+Shift+E - Export
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
          e.preventDefault();
          onExport();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onSave, onCancel, onClose, onExport]);
  }
  ```
- [ ] **Aggiungi tooltip shortcuts** sui button
- [ ] **Test**: Shortcuts funzionano

---

### Task 3.3: Activity Timeline (5 ore) 🟢

- [ ] **Crea** `PlayerActivityTimeline.jsx`:
  ```jsx
  function PlayerActivityTimeline({ playerId }) {
    const [events, setEvents] = useState([]);

    // Fetch events from Firestore
    useEffect(() => {
      const events = [
        { type: 'created', date: player.createdAt, ... },
        { type: 'certificate_uploaded', date: cert.uploadedAt, ... },
        { type: 'account_linked', date: link.date, ... },
        { type: 'booking_created', date: booking.date, ... },
        // ...
      ];
      setEvents(events);
    }, [playerId]);

    return (
      <div className="timeline">
        {events.map(event => (
          <TimelineEvent key={event.id} event={event} />
        ))}
      </div>
    );
  }
  ```
- [ ] **Aggiungi come tab separato**
- [ ] **Test**: Timeline mostra eventi correttamente

---

### Task 3.4: Mobile Optimization (4 ore) 🟢

- [ ] **Responsive tabs** - scroll orizzontale:
  ```jsx
  <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
    {tabs.map(tab => (
      <button 
        className="snap-center flex-shrink-0 px-4 py-2 whitespace-nowrap"
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
  ```
- [ ] **Stack stats cards** su mobile:
  ```jsx
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Stats */}
  </div>
  ```
- [ ] **Mobile-friendly forms** - spacing adeguato
- [ ] **Test su device reali** (iOS, Android)

---

### Task 3.5: Accessibility Audit (3 ore) 🟢

- [ ] **Focus trap nel modal**:
  ```jsx
  import { FocusTrap } from '@headlessui/react';

  <FocusTrap>
    <div role="dialog" aria-labelledby="player-details-title">
      {/* ... */}
    </div>
  </FocusTrap>
  ```
- [ ] **Aggiungi ARIA labels** mancanti
- [ ] **Color contrast check** (tool: WAVE, axe DevTools)
- [ ] **Screen reader test** (NVDA, JAWS)
- [ ] **Keyboard navigation test**
- [ ] **Fix issues** trovati

---

## 📊 TRACKING & METRICS

### Progress Dashboard

```markdown
## FASE 1: CRITICAL FIXES ⏳
- [x] Task 1.1: Component Refactoring (0/8 ore)
  - [ ] 1.1.1: PlayerDetailsHeader
  - [ ] 1.1.2: PlayerEditMode
  - [ ] 1.1.3: PlayerAccountLinking
  - [ ] 1.1.4: PlayerOverviewTab
  - [ ] 1.1.5: Main Container Refactor
- [ ] Task 1.2: State Management (0/3 ore)
- [ ] Task 1.3: Loading States (0/2 ore)
- [ ] Task 1.4: Unsaved Changes (0/1 ora)
- [ ] Task 1.5: Testing (0/2 ore)

Progress: 0/16 task | 0/24 ore | 0%

## FASE 2: HIGH PRIORITY ⏳
- [ ] Task 2.1: Authorization (0/3 ore)
- [ ] Task 2.2: Error Display (0/2 ore)
- [ ] Task 2.3: Notifications (0/1 ora)
- [ ] Task 2.4: GDPR (0/6 ore)
- [ ] Task 2.5: Optimization (0/4 ore)

Progress: 0/5 task | 0/16 ore | 0%

## FASE 3: ENHANCEMENTS ⏳
- [ ] Task 3.1: Quick Actions (0/3 ore)
- [ ] Task 3.2: Keyboard Shortcuts (0/2 ore)
- [ ] Task 3.3: Activity Timeline (0/5 ore)
- [ ] Task 3.4: Mobile Optimization (0/4 ore)
- [ ] Task 3.5: Accessibility (0/3 ore)

Progress: 0/5 task | 0/17 ore | 0%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERALL: 0/26 task | 0/57 ore | 0%
```

### Quality Metrics Target

```
BEFORE → AFTER

Component Size:
  PlayerDetails.jsx: 1,035 → 150 righe ✅

Complexity:
  Cyclomatic: 45 → 8 ✅
  useState: 15 → 1 (useReducer) ✅

Performance:
  Bundle size: 35KB → 15KB initial ✅
  Re-renders: baseline → -40% ✅
  Lighthouse: 75 → 92 ✅

Code Quality:
  Maintainability: 4/10 → 8/10 ✅
  Test Coverage: 0% → 80% ✅
  Overall Score: 5.7/10 → 8.3/10 ✅
```

---

## 🎯 DEFINITION OF DONE

### Per ogni Task

- [ ] Codice implementato e funzionante
- [ ] Unit tests scritti e passati
- [ ] Integration tests scritti e passati
- [ ] Code review completato
- [ ] Documentazione aggiornata
- [ ] No regressioni su funzionalità esistenti
- [ ] Performance non peggiorata

### Per ogni Fase

**Fase 1 (Critical)**:
- [ ] PlayerDetails.jsx < 200 righe
- [ ] CC < 10
- [ ] useState < 3
- [ ] Tutti i loading states implementati
- [ ] Unsaved changes warning funzionante
- [ ] Test coverage > 70%

**Fase 2 (High Priority)**:
- [ ] Role checks su tutte le azioni sensibili
- [ ] XSS prevention attivo
- [ ] Toast notifications su tutte le azioni
- [ ] GDPR export/delete implementato
- [ ] Bundle size < 20KB initial
- [ ] Test coverage > 80%

**Fase 3 (Enhancements)**:
- [ ] Quick actions menu funzionante
- [ ] Keyboard shortcuts documentati
- [ ] Mobile UX testato su device reali
- [ ] Accessibility: WCAG 2.1 Level AA
- [ ] Lighthouse score > 90

---

## 📌 NOTES & TIPS

### Development Tips

1. **Lavora in branch separato**: `feature/player-details-refactor`
2. **Commit frequenti** con messaggi descrittivi
3. **Test dopo ogni subtask** (non alla fine)
4. **Code review dopo ogni task**
5. **Deploy in staging** prima di production

### Testing Strategy

```
Unit Tests (70%):
  - Reducer logic
  - Custom hooks
  - Utility functions
  - Validation logic

Integration Tests (20%):
  - Edit flow completo
  - Account linking flow
  - Tab navigation
  - GDPR export/delete

E2E Tests (10%):
  - Critical user journeys
  - Smoke tests
```

### Performance Monitoring

```javascript
// Add performance marks
performance.mark('player-details-start');
// ... component render
performance.mark('player-details-end');
performance.measure('player-details-render', 'player-details-start', 'player-details-end');

// Log to analytics
const measure = performance.getEntriesByName('player-details-render')[0];
console.log('Render time:', measure.duration, 'ms');
```

### Rollback Plan

Se qualcosa va male:

1. **Mantieni branch vecchio**: `main-backup-before-refactor`
2. **Feature flags**: Abilita/disabilita nuovo codice
   ```javascript
   const USE_NEW_PLAYER_DETAILS = process.env.FEATURE_NEW_PLAYER_DETAILS === 'true';

   return USE_NEW_PLAYER_DETAILS ? (
     <PlayerDetailsNew ... />
   ) : (
     <PlayerDetailsOld ... />
   );
   ```
3. **Database backup** prima di modifiche schema

---

**Fine Checklist** ✅  
**Prossimo aggiornamento**: Dopo ogni task completato  
**Owner**: Team Development  
**Reviewer**: Senior Developer
