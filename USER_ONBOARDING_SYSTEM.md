# User Onboarding System - CHK-306 ✅

## Overview

Interactive tutorial and feature discovery system for new users. Provides step-by-step guided tours with spotlight effects, contextual tooltips, and progress tracking to improve user activation and feature adoption.

---

## 🎯 Features Implemented

### 1. ✅ OnboardingWizard Component
**File:** `src/components/onboarding/OnboardingWizard.jsx` (300+ lines)

**Features:**
- **Spotlight Effect:** Highlights target element with darkened overlay
- **Smooth Scrolling:** Auto-scrolls to each tour step
- **Progress Tracking:** Visual progress bar and step indicators
- **Navigation:** Previous, Next, Skip, Finish buttons
- **Responsive Tooltips:** Auto-positioning (top, bottom, left, right)
- **LocalStorage Persistence:** Saves progress to resume later
- **Animations:** Smooth fade-in transitions and pulsing highlight

**Visual Elements:**
- Progress bar (0-100%)
- Step counter (e.g., "Passo 2 di 5")
- Dot indicators (completed = green, current = blue expanded, upcoming = gray)
- Action hints with 💡 icon
- Pulsing border around highlighted element

### 2. ✅ FeatureTooltip Component
**File:** `src/components/onboarding/FeatureTooltip.jsx` (200+ lines)

**Features:**
- **Multiple Triggers:** hover, click, auto (on mount)
- **Smart Positioning:** top, bottom, left, right with viewport detection
- **Auto-Dismiss:** Configurable delay before hiding
- **Show Once:** Persistent storage (localStorage)
- **Customizable:** Title, content, delay, placement
- **Arrow Pointer:** Visual arrow pointing to target element

**Use Cases:**
- Hover tooltips for new features
- Click tooltips for complex interactions
- Auto tooltips for first-time visitors
- Feature announcements

### 3. ✅ Onboarding Configuration
**File:** `src/lib/onboardingSteps.js` (200+ lines)

**Tour Types:**

#### **New User Tour** (5 steps)
1. Dashboard welcome
2. Navigation menu overview
3. Book button introduction
4. Profile completion prompt
5. Notifications system

#### **Club Admin Tour** (5 steps)
1. Admin panel overview
2. Courts manager
3. Bookings list
4. Analytics dashboard
5. Club settings

#### **Booking Flow Tour** (5 steps)
1. Club selector
2. Date picker
3. Time slot selection
4. Court grid
5. Booking summary

#### **Feature Discovery** (4 tooltips)
1. Dark mode toggle
2. Favorites button
3. Share functionality
4. Calendar sync

**Helper Functions:**
```javascript
getOnboardingProgress()           // Get all tour progress
saveOnboardingProgress(tour, step, completed)  // Save progress
hasCompletedTour(tourName)        // Check if tour completed
shouldShowOnboarding(userRole, tourName)  // Auto-show logic
resetOnboarding()                 // Clear all progress
```

### 4. ✅ OnboardingProvider Context
**File:** `src/contexts/OnboardingContext.jsx` (80+ lines)

**Features:**
- Global onboarding state management
- Auto-start tours for new users
- Role-based tour assignment
- Tour completion tracking

**Context API:**
```javascript
const { activeTour, startTour, stopTour, hasCompletedTour } = useOnboarding();

// Start a tour programmatically
startTour('newUser');

// Check completion
if (hasCompletedTour('bookingFlow')) {
  // User has completed booking tour
}
```

---

## 📖 Usage Guide

### Setup

**1. Wrap app with OnboardingProvider:**
```javascript
// src/App.jsx
import { OnboardingProvider } from '@contexts/OnboardingContext';

function App() {
  return (
    <OnboardingProvider>
      <YourApp />
    </OnboardingProvider>
  );
}
```

**2. Add `data-tour` attributes to elements:**
```javascript
// Add to elements you want to highlight
<button data-tour="book-button">Prenota Campo</button>
<div data-tour="dashboard">Dashboard Content</div>
<nav data-tour="navigation">Navigation Menu</nav>
```

### Using OnboardingWizard

**Manual Tour Start:**
```javascript
import { useOnboarding } from '@contexts/OnboardingContext';

function MyComponent() {
  const { startTour } = useOnboarding();

  return (
    <button onClick={() => startTour('newUser')}>
      Start Tutorial
    </button>
  );
}
```

**Auto-Start on Mount:**
```javascript
// Automatically starts in OnboardingProvider based on:
// - User role (user, club_admin, admin)
// - Tour completion status (localStorage)
// - Time since last visit
```

### Using FeatureTooltip

**Hover Tooltip:**
```javascript
import FeatureTooltip from '@components/onboarding/FeatureTooltip';

<FeatureTooltip
  content="Clicca qui per attivare la modalità scura"
  title="Modalità Scura"
  placement="bottom"
  trigger="hover"
  featureId="dark-mode-toggle"
  showOnce={true}
>
  <button>🌙 Toggle Dark Mode</button>
</FeatureTooltip>
```

**Click Tooltip:**
```javascript
<FeatureTooltip
  content="Aggiungi questo club ai preferiti per accesso rapido"
  placement="left"
  trigger="click"
  featureId="add-favorite"
>
  <button>⭐ Add to Favorites</button>
</FeatureTooltip>
```

**Auto-Show Tooltip:**
```javascript
<FeatureTooltip
  content="Nuovo! Esporta la prenotazione nel tuo calendario"
  title="Sincronizza Calendario"
  placement="top"
  trigger="auto"
  delay={3000}
  featureId="calendar-sync"
  showOnce={true}
>
  <button>📆 Sync Calendar</button>
</FeatureTooltip>
```

### Creating Custom Tours

**Add new tour to configuration:**
```javascript
// src/lib/onboardingSteps.js
export const ONBOARDING_TOURS = {
  // ... existing tours
  
  customTour: [
    {
      target: '[data-tour="my-element"]',
      title: 'Step Title',
      content: 'Step description...',
      placement: 'bottom',
      highlightPadding: 10,
      action: 'Optional action hint',
    },
    // ... more steps
  ],
};
```

**Start custom tour:**
```javascript
const { startTour } = useOnboarding();
startTour('customTour');
```

---

## 🎨 Visual Design

### Color Scheme
- **Primary (Blue):** rgb(37, 99, 235) - Tour tooltips, progress
- **Success (Green):** rgb(34, 197, 94) - Completed steps
- **Spotlight:** rgba(0, 0, 0, 0.75) - Background overlay
- **Highlight:** Blue pulsing border around target

### Animations
- **Fade In:** 0.3s ease for tooltips
- **Pulse:** Continuous animation on highlight border
- **Progress Bar:** Smooth width transition
- **Scroll:** Smooth scroll to target element

### Responsive Design
- **Mobile:** Single column layout, adjusted tooltip sizes
- **Tablet:** Optimized positioning
- **Desktop:** Full experience with larger tooltips

### Dark Mode Support
- All components support dark mode
- Auto-adjusts colors and contrast
- Maintains readability in both themes

---

## 🔧 Technical Implementation

### Spotlight Effect
```javascript
const getSpotlightStyle = () => {
  return {
    position: 'fixed',
    top: `${targetRect.top - padding}px`,
    left: `${targetRect.left - padding}px`,
    width: `${targetRect.width + padding * 2}px`,
    height: `${targetRect.height + padding * 2}px`,
    borderRadius: '8px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',  // The magic!
    pointerEvents: 'none',
    zIndex: 10000,
  };
};
```

### Auto-Positioning Tooltip
```javascript
const getTooltipStyle = () => {
  const tooltip = tooltipRef.current.getBoundingClientRect();
  
  // Calculate based on placement
  switch (placement) {
    case 'top':
      top = targetRect.top - tooltip.height - 20;
      break;
    // ... other placements
  }
  
  // Keep in viewport
  const maxLeft = window.innerWidth - tooltip.width - 20;
  left = Math.max(20, Math.min(left, maxLeft));
  
  return { top: `${top}px`, left: `${left}px` };
};
```

### Progress Persistence
```javascript
// Save to localStorage
const saveProgress = (tourName, step, completed) => {
  const progress = {
    [tourName]: {
      currentStep: step,
      completed,
      lastUpdated: new Date().toISOString(),
    },
  };
  localStorage.setItem('playAndSport_onboarding', JSON.stringify(progress));
};

// Resume from saved progress
const getProgress = () => {
  const stored = localStorage.getItem('playAndSport_onboarding');
  return stored ? JSON.parse(stored) : {};
};
```

---

## 📊 Analytics Integration

### Track Onboarding Events

**Firebase Analytics:**
```javascript
import { logEvent } from 'firebase/analytics';
import { analytics } from '@config/firebase';

// Tour started
logEvent(analytics, 'onboarding_tour_started', {
  tour_name: 'newUser',
  user_role: 'user',
});

// Step completed
logEvent(analytics, 'onboarding_step_completed', {
  tour_name: 'newUser',
  step_number: 3,
  step_title: 'Book Button',
});

// Tour completed
logEvent(analytics, 'onboarding_tour_completed', {
  tour_name: 'newUser',
  total_steps: 5,
  time_spent: '2m 15s',
});

// Tour skipped
logEvent(analytics, 'onboarding_tour_skipped', {
  tour_name: 'newUser',
  skipped_at_step: 2,
});
```

### Metrics to Track
- **Completion Rate:** % of users who finish tours
- **Drop-off Points:** Which steps users skip
- **Time per Step:** Average time on each step
- **Feature Adoption:** % increase after tooltip shown
- **Tour Restarts:** How many times users restart tours

---

## 🎓 Best Practices

### Tour Design

**1. Keep Steps Short:**
- Maximum 5-7 steps per tour
- Each step < 3 sentences
- Clear action-oriented titles

**2. Highlight Key Features:**
- Focus on core workflows (booking, payment, profile)
- Skip obvious UI elements
- Prioritize features with low adoption

**3. Contextual Timing:**
- Show booking tour when user clicks "Prenota"
- Admin tour on first login as club_admin
- Feature tooltips on new releases

**4. Progressive Disclosure:**
- Basic tour for all new users
- Advanced tours for power users
- Role-specific tours (admin, instructor, user)

### Tooltip Guidelines

**1. When to Use Tooltips:**
- ✅ New features (first 30 days after release)
- ✅ Complex interactions (multi-step processes)
- ✅ Hidden features (keyboard shortcuts, gestures)
- ❌ Obvious buttons (save, cancel, close)
- ❌ Every single UI element (overwhelming)

**2. Content Writing:**
- Use conversational tone
- Lead with benefit ("Save time by...")
- Include emojis for visual appeal
- Keep under 2 lines if possible

**3. Timing:**
- Hover: Immediate (no delay)
- Auto: 500-1000ms after element visible
- Click: On first interaction only

---

## 🚀 Advanced Features

### Conditional Tours

**Show tour based on user behavior:**
```javascript
// Show booking tour if user hasn't booked yet
useEffect(() => {
  if (user.bookingsCount === 0 && !hasCompletedTour('bookingFlow')) {
    startTour('bookingFlow');
  }
}, [user.bookingsCount]);
```

### Multi-Language Support
```javascript
// src/lib/onboardingSteps.js
export const ONBOARDING_TOURS = {
  newUser: {
    it: [
      { title: 'Benvenuto', content: '...' },
    ],
    en: [
      { title: 'Welcome', content: '...' },
    ],
  },
};

// Use with i18n
const steps = ONBOARDING_TOURS.newUser[currentLanguage];
```

### A/B Testing Tours
```javascript
import { getExperimentVariant } from '@lib/featureFlags';

// Test different tour lengths
const tourVariant = getExperimentVariant('onboarding_tour_length', user.id);

const steps = tourVariant === 'short' 
  ? ONBOARDING_TOURS.newUserShort 
  : ONBOARDING_TOURS.newUserFull;
```

---

## 🐛 Troubleshooting

### Issue: Tooltip not positioning correctly
**Cause:** Target element not in DOM yet  
**Solution:** Add delay before starting tour
```javascript
setTimeout(() => startTour('newUser'), 500);
```

### Issue: Spotlight not highlighting element
**Cause:** Element has `data-tour` but selector not found  
**Solution:** Verify attribute and selector match exactly

### Issue: Tour starts on every page load
**Cause:** LocalStorage not saving completion  
**Solution:** Check browser storage permissions

### Issue: Tooltip covers target element
**Cause:** Wrong placement value  
**Solution:** Try different placement (top → bottom, left → right)

---

## ✅ CHK-306 Status: COMPLETE

**Implementation Time:** ~5 hours  
**Lines of Code:** 800+  
**Components:** 4  
**Tours:** 4 predefined  
**Tooltips:** Unlimited (reusable component)

**Files Created:**
- `src/components/onboarding/OnboardingWizard.jsx` (300 lines)
- `src/components/onboarding/FeatureTooltip.jsx` (200 lines)
- `src/lib/onboardingSteps.js` (200 lines)
- `src/contexts/OnboardingContext.jsx` (80 lines)
- `USER_ONBOARDING_SYSTEM.md` (this file)

**Features:**
- ✅ Multi-step guided tours
- ✅ Spotlight effect with pulsing highlight
- ✅ Contextual feature tooltips
- ✅ Progress tracking with localStorage
- ✅ Auto-start for new users
- ✅ Role-based tours
- ✅ Skip/Resume capability
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Analytics-ready

**Next Steps:**
1. Add `data-tour` attributes to key UI elements
2. Integrate OnboardingProvider in App.jsx
3. Test all tours with different user roles
4. Gather user feedback on tour effectiveness
5. Proceed to CHK-307 (Advanced Search & Filters)

---

**Developed with ❤️ for Play & Sport**  
**Guided Tours, Better User Experience.**
