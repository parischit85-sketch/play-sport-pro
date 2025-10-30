# 🔧 Configuration Guide - Modern Paris League

## 📋 Quick Start per il Team

### **Setup Development Environment**

```bash
# 1. Clone & Install
git clone [repository]
cd paris-league-backup-gestione-campi-2025-09-03-1611
npm install

# 2. Environment Variables
cp .env.example .env.local
# Configure Firebase keys in .env.local

# 3. Start Development
npm run dev
```

### **Architecture Overview**

```
src/
├── contexts/           # Global state management
│   ├── AuthContext.jsx     # Authentication state
│   ├── LeagueContext.jsx   # League data & cloud sync
│   └── UIContext.jsx       # UI state & notifications
├── hooks/              # Custom hooks
│   └── useBookings.js      # Booking operations
├── components/         # Shared components
│   ├── ErrorBoundary.jsx   # Error handling
│   ├── LoadingSpinner.jsx  # Loading states
│   ├── ProtectedRoute.jsx  # Route guards
│   └── NotificationSystem.jsx # Toast notifications
├── layouts/            # Layout components
│   └── AppLayout.jsx       # Main app layout
├── pages/              # Page components (lazy loaded)
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ClassificaPage.jsx
│   └── [others...]
└── router/             # Router configuration
    └── AppRouter.jsx       # Main router setup
```

## 🎯 Development Workflow

### **Adding New Pages**

1. **Create Page Component**
```jsx
// src/pages/NewPage.jsx
import React from 'react';
import { useAuth } from '@contexts/AuthContext.jsx';

export default function NewPage() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>New Page</h1>
      {/* Page content */}
    </div>
  );
}
```

2. **Add to Router**
```jsx
// src/router/AppRouter.jsx
const NewPage = React.lazy(() => import('@pages/NewPage.jsx'));

// Add route in Routes
<Route path="new-page" element={<NewPage />} />
```

3. **Add to Navigation** (if needed)
```jsx
// src/layouts/AppLayout.jsx
const navigation = [
  // ... existing routes
  { id: 'new-page', label: 'New Page', path: '/new-page', public: true },
];
```

### **Using Contexts**

```jsx
// In any component
import { useAuth } from '@contexts/AuthContext.jsx';
import { useLeague } from '@contexts/LeagueContext.jsx';
import { useUI } from '@contexts/UIContext.jsx';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const { state, setState, derived } = useLeague();
  const { addNotification, showModal } = useUI();
  
  const handleAction = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Action completed'
    });
  };
  
  return <div>{/* Component content */}</div>;
}
```

### **Error Handling**

```jsx
// Automatic error boundaries
<ErrorBoundary fallback={CustomErrorComponent}>
  <YourComponent />
</ErrorBoundary>

// Manual error handling
try {
  await someAsyncOperation();
  addNotification({ type: 'success', message: 'Operation successful' });
} catch (error) {
  addNotification({ type: 'error', message: 'Operation failed' });
}
```

## 🚀 Deployment Configuration

### **Environment Variables**

```bash
# .env.local (development)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional
VITE_USE_FIREBASE_EMULATOR=false
```

### **Build Configuration**

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Type checking (when TypeScript is added)
npm run type-check
```

### **Performance Monitoring**

```javascript
// Add to production build
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

if (import.meta.env.PROD) {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

## 🧪 Testing Strategy

### **Testing Setup** (Future)

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Test commands
npm run test
npm run test:watch
npm run test:coverage
```

### **Test Structure**
```
src/
├── __tests__/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   └── pages/
└── test-utils/
    └── test-setup.js
```

## 🔧 Advanced Configuration

### **PWA Setup** (Future)

```bash
# Install PWA dependencies
npm install -D vite-plugin-pwa

# Configure in vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
```

### **TypeScript Migration**

```bash
# Install TypeScript
npm install -D typescript @types/react @types/react-dom

# Rename files .jsx -> .tsx
# Add tsconfig.json
# Gradual migration by file
```

### **Bundle Analysis**

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

## 📊 Monitoring & Analytics

### **Error Tracking**

```javascript
// Add to production
window.addEventListener('error', (event) => {
  // Send to error tracking service
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  // Send to error tracking service
  console.error('Unhandled promise rejection:', event.reason);
});
```

### **Performance Tracking**

```javascript
// Custom performance marks
performance.mark('page-load-start');
// ... app logic
performance.mark('page-load-end');
performance.measure('page-load', 'page-load-start', 'page-load-end');
```

## 🔒 Security Considerations

### **Firebase Security Rules**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leagues/{leagueId} {
      allow read, write: if request.auth != null;
    }
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **CSP Headers** (Production)
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' *.googleapis.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src fonts.gstatic.com;
  img-src 'self' data: *.googleapis.com;
  connect-src 'self' *.googleapis.com wss://*.firebaseio.com;
">
```

## 🚀 Future Roadmap

### **Phase 2 Enhancements**
- [ ] TypeScript migration
- [ ] Comprehensive testing suite
- [ ] PWA implementation
- [ ] Advanced caching strategies
- [ ] Real-time notifications

### **Phase 3 Features**
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced booking features
- [ ] Payment integration

### **Performance Goals**
- [ ] Lighthouse score > 95
- [ ] First Contentful Paint < 1.5s
- [ ] Bundle size < 500KB gzipped
- [ ] Test coverage > 80%

## 📞 Support & Maintenance

### **Common Issues**

1. **Router not working**: Check React Router version compatibility
2. **Context errors**: Ensure components wrapped in providers
3. **Firebase errors**: Verify environment variables
4. **Build errors**: Check import paths and dependencies

### **Troubleshooting**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npx vite clean

# Check bundle analysis
npm run build && npx vite-bundle-analyzer dist
```

### **Code Quality**

```bash
# Linting
npm run lint

# Format code
npm run format

# Check for unused dependencies
npx depcheck
```

This modern architecture provides a solid foundation for long-term maintenance and feature development! 🚀
