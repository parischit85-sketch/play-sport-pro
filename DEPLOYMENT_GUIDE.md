# 🚀 Paris League - Deployment Configuration

## 📦 Build Setup

### **Production Build**
```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

### **Environment Variables**
Create `.env.production` for production:
```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 🌐 Deployment Options

### **1. Netlify** (Recommended)
```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Or use Netlify CLI for continuous deployment
netlify init
```

**netlify.toml**:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### **2. Vercel**
```bash
# Deploy with Vercel CLI
npm run build
vercel --prod
```

**vercel.json**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### **3. Firebase Hosting**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy --only hosting
```

**firebase.json**:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### **4. GitHub Pages**
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

## 🔧 Production Optimizations

### **Performance Features Enabled**
- ✅ **Code Splitting**: Automatic chunk separation
- ✅ **Tree Shaking**: Dead code elimination
- ✅ **Minification**: Terser optimization
- ✅ **Gzip Compression**: Most hosting providers auto-enable
- ✅ **Lazy Loading**: React.lazy() for pages
- ✅ **Image Optimization**: Manual implementation ready

### **Bundle Analysis**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### **Performance Monitoring**
Add to production for monitoring:
```javascript
// src/utils/analytics.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function initAnalytics() {
  // Web Vitals reporting
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log('Performance metric:', metric);
}
```

## 🔒 Security Configuration

### **Content Security Policy**
Add to `index.html` for production:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
">
```

### **Firebase Security Rules**
Update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - only user can read/write their own
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public data (read-only for authenticated users)
    match /leagues/{leagueId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && hasAdminRole();
    }
    
    function hasAdminRole() {
      return request.auth.token.admin == true;
    }
  }
}
```

## 📊 Monitoring & Analytics

### **Error Tracking** (Optional)
```bash
# Install Sentry for error tracking
npm install @sentry/react @sentry/tracing
```

```javascript
// src/utils/sentry.js
import * as Sentry from '@sentry/react';

export function initErrorTracking() {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    tracesSampleRate: 1.0,
  });
}
```

### **Google Analytics** (Optional)
```javascript
// src/utils/gtag.js
export const GA_TRACKING_ID = 'GA_MEASUREMENT_ID';

export function initGoogleAnalytics() {
  if (typeof window !== 'undefined') {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}
```

## 🚀 CI/CD Pipeline

### **GitHub Actions Example**
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🏥 Health Checks

### **Production Health Endpoint**
The app includes automatic health checks in development. For production monitoring:

```javascript
// src/utils/health-check.js already implemented
// Add endpoint monitoring in your hosting provider
```

### **Uptime Monitoring**
Set up monitoring with services like:
- UptimeRobot
- Pingdom  
- StatusCake

## 📝 Deployment Checklist

### **Pre-Deployment**
- [ ] Environment variables configured
- [ ] Firebase rules updated
- [ ] Build runs without errors
- [ ] All tests passing
- [ ] Performance audit completed
- [ ] Security headers configured

### **Post-Deployment**
- [ ] App loads correctly
- [ ] Authentication working
- [ ] Database connections active
- [ ] All routes accessible
- [ ] Performance metrics within targets
- [ ] Error tracking active

---

## 🎉 Ready for Production!

Your Paris League application is now configured for production deployment with:

✅ **Optimized Performance**: Code splitting, lazy loading, minification  
✅ **Security**: CSP headers, Firebase rules, input validation  
✅ **Monitoring**: Health checks, error tracking ready  
✅ **Scalability**: CDN-ready static assets, efficient bundle structure  
✅ **Reliability**: Error boundaries, graceful fallbacks  

Choose your preferred hosting platform and deploy with confidence! 🚀
