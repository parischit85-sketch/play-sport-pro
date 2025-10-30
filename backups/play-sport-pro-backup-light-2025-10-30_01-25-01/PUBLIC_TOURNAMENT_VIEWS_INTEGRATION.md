# 🔌 Integration Guide - Public View Settings in Admin Panel

## Quick Integration in TournamentOverview

Apri il file: `src/features/tournaments/components/dashboard/TournamentOverview.jsx`

### Step 1: Import Component

```jsx
import PublicViewSettings from '../admin/PublicViewSettings.jsx';
```

### Step 2: Add Section

Aggiungi dopo le sezioni esistenti (es. dopo "Tournament Information" o "Status"):

```jsx
{/* Public View Settings - Only for Club Admins */}
{isClubAdmin && (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <PublicViewSettings 
      tournament={tournament}
      clubId={clubId}
      onUpdate={onUpdate}
    />
  </div>
)}
```

### Complete Example

```jsx
function TournamentOverview({ tournament, onUpdate, clubId }) {
  const { userRole, userClubRoles } = useAuth();
  
  const clubRole = userClubRoles?.[clubId];
  const isClubAdmin = 
    userRole === USER_ROLES.SUPER_ADMIN || 
    clubRole === 'admin' || 
    clubRole === 'club_admin';

  return (
    <div className="space-y-6">
      {/* Tournament Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold mb-4">Informazioni Torneo</h3>
        {/* ... existing content ... */}
      </div>

      {/* Tournament Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold mb-4">Stato</h3>
        {/* ... existing content ... */}
      </div>

      {/* 🆕 Public View Settings - Only for admins */}
      {isClubAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <PublicViewSettings 
            tournament={tournament}
            clubId={clubId}
            onUpdate={onUpdate}
          />
        </div>
      )}

      {/* Other sections... */}
    </div>
  );
}

export default TournamentOverview;
```

---

## Alternative: Add as Separate Tab

Se preferisci una tab dedicata, modifica: `src/features/tournaments/components/TournamentDetailsPage.jsx`

### Step 1: Add Tab Definition

```jsx
import { Eye } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Panoramica', icon: Trophy },
  { id: 'teams', label: 'Squadre', icon: Users },
  { id: 'standings', label: 'Gironi', icon: BarChart },
  { id: 'matches', label: 'Partite', icon: Calendar },
  { id: 'bracket', label: 'Tabellone', icon: Network },
  { id: 'points', label: 'Punti', icon: CheckCircle },
  { id: 'public', label: 'Vista Pubblica', icon: Eye }, // 🆕 NEW TAB
];
```

### Step 2: Add Tab Content

```jsx
import PublicViewSettings from './admin/PublicViewSettings.jsx';

// In the render section:
{activeTab === 'public' && (
  <PublicViewSettings 
    tournament={tournament}
    clubId={clubId}
    onUpdate={loadTournament}
  />
)}
```

### Step 3: Conditional Tab Visibility (Optional)

Solo per admin:

```jsx
// Filter tabs based on user role
const visibleTabs = TABS.filter(tab => {
  // Hide 'public' tab for non-admins
  if (tab.id === 'public' && !isClubAdmin) return false;
  // Hide 'points' tab if not applied
  if (tab.id === 'points' && !isClubAdmin && !pointsApplied) return false;
  return true;
});

// Use visibleTabs instead of TABS in the render
{visibleTabs.map((tab) => (
  // ... tab rendering
))}
```

---

## Integration in Tournament Creation Wizard

Per abilitare automaticamente la vista pubblica durante la creazione:

### In TournamentWizard.jsx

```jsx
// Step finale del wizard
const handleCreateTournament = async (formData) => {
  const tournamentData = {
    ...formData,
    publicView: {
      enabled: false, // Disabilitato di default
      token: generateToken(), // Pre-genera token
      showQRCode: true,
      settings: {
        interval: 15000, // 15 secondi
      }
    }
  };
  
  await createTournament(tournamentData);
};

function generateToken() {
  return (
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15)
  );
}
```

---

## Advanced: Auto-Enable on Tournament Start

Auto-abilita vista pubblica quando il torneo passa in fase di girone:

```jsx
// In tournamentWorkflow.js o dove gestisci le transizioni di stato
async function startGroupPhase(clubId, tournamentId) {
  const updates = {
    status: 'groups_phase',
    startedAt: new Date(),
  };
  
  // Auto-enable public view
  const tournament = await getTournamentById(clubId, tournamentId);
  if (!tournament.publicView?.enabled) {
    updates['publicView.enabled'] = true;
    updates['publicView.token'] = generateToken();
    updates['publicView.showQRCode'] = true;
    updates['publicView.settings.interval'] = 15000;
  }
  
  await updateDoc(
    doc(db, 'clubs', clubId, 'tournaments', tournamentId), 
    updates
  );
}
```

---

## Dashboard Widget

Aggiungi un widget nella dashboard principale del club:

```jsx
// In ClubDashboard.jsx
function PublicTournamentWidget({ tournament, clubId }) {
  if (!tournament.publicView?.enabled) return null;

  const mobileUrl = `${window.location.origin}/public/tournament/${clubId}/${tournament.id}/${tournament.publicView.token}`;
  
  return (
    <div className="bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Vista Pubblica Live</h3>
        <Eye className="w-6 h-6" />
      </div>
      
      <p className="text-white/90 mb-4">{tournament.name}</p>
      
      <div className="flex gap-2">
        <a
          href={mobileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-white/90 transition-colors text-center"
        >
          Apri Vista
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(mobileUrl)}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

---

## QR Code Poster Generator

Utility per generare poster stampabili:

```jsx
import QRCode from 'react-qr-code';
import { Download } from 'lucide-react';

function QRCodePoster({ tournament, clubId }) {
  const mobileUrl = `${window.location.origin}/public/tournament/${clubId}/${tournament.id}/${tournament.publicView?.token}`;

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${tournament.name}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="bg-white p-8 rounded-lg text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2">{tournament.name}</h2>
      <p className="text-gray-600 mb-6">Scansiona per seguire il torneo live</p>
      
      <div className="bg-gray-50 p-6 rounded-lg inline-block" id="qr-code-svg">
        <QRCode value={mobileUrl} size={256} />
      </div>
      
      <button
        onClick={handleDownload}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
      >
        <Download className="w-5 h-5" />
        Scarica QR Code
      </button>
      
      <p className="text-xs text-gray-500 mt-4">
        Powered by Play Sport
      </p>
    </div>
  );
}
```

---

## Notification System

Notifica gli utenti quando la vista pubblica viene abilitata:

```jsx
// In PublicViewSettings.jsx
import { useNotification } from '@contexts/NotificationContext';

function PublicViewSettings({ tournament, clubId, onUpdate }) {
  const { showNotification } = useNotification();
  
  const handleTogglePublicView = async () => {
    // ... existing code ...
    
    if (!isEnabled) {
      // Abilitazione
      showNotification({
        type: 'success',
        title: 'Vista Pubblica Abilitata',
        message: 'Il torneo è ora visibile pubblicamente. Condividi i link!',
        duration: 5000,
      });
    } else {
      // Disabilitazione
      showNotification({
        type: 'info',
        title: 'Vista Pubblica Disabilitata',
        message: 'Il torneo non è più accessibile pubblicamente.',
        duration: 3000,
      });
    }
  };
  
  // ... rest of component
}
```

---

## Analytics Tracking

Traccia l'utilizzo delle viste pubbliche:

```jsx
// In PublicTournamentView.jsx
import { trackEvent } from '@lib/analytics';

useEffect(() => {
  if (tournament) {
    trackEvent('public_view_opened', {
      tournament_id: tournamentId,
      club_id: clubId,
      view_type: 'mobile',
      device: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    });
  }
}, [tournament]);

// Track navigation
const handleGroupChange = (newIndex) => {
  setCurrentGroupIndex(newIndex);
  
  trackEvent('public_view_navigation', {
    tournament_id: tournamentId,
    from_group: groups[currentGroupIndex],
    to_group: groups[newIndex],
    navigation_type: 'manual',
  });
};
```

---

## Summary Checklist

- [ ] Import PublicViewSettings component
- [ ] Add to TournamentOverview or as separate tab
- [ ] Ensure admin-only access (isClubAdmin check)
- [ ] Test enable/disable functionality
- [ ] Test token generation
- [ ] Test link sharing
- [ ] Test QR code preview
- [ ] Optional: Add dashboard widget
- [ ] Optional: Add QR poster generator
- [ ] Optional: Add notifications
- [ ] Optional: Add analytics tracking

---

**Integration completed!** 🎉
