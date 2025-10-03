# 📊 GOOGLE ANALYTICS INTEGRATION GUIDE

## 📋 Overview

Google Analytics 4 (GA4) è ora integrato in PlaySport per fornire **comprehensive user behavior analytics e business insights**.

### ✨ **Features Implementate:**

- ✅ **Event Tracking**: Monitoraggio azioni utente dettagliato
- ✅ **Conversion Funnels**: Analisi percorsi booking e onboarding
- ✅ **User Journey Mapping**: Tracciamento navigazione completa
- ✅ **Admin Activity Tracking**: Monitoraggio azioni amministrative
- ✅ **Business Metrics**: KPI e metriche di performance
- ✅ **GDPR Compliance**: Gestione consenso privacy
- ✅ **Real-time Analytics**: Dati in tempo reale

---

## 🚀 Setup Google Analytics

### 1. **Crea Account GA4**
1. Vai su [analytics.google.com](https://analytics.google.com)
2. Crea nuovo **Property** (GA4)
3. Seleziona **Web** come platform
4. Configura **Data Stream** per PlaySport

### 2. **Ottieni Measurement ID**
1. In GA4 → **Admin** → **Data Streams** → **Web**
2. Copia il **Measurement ID** (formato: `G-XXXXXXXXXX`)

### 3. **Configura Environment Variables**

Aggiungi al tuo `.env.local`:
```env
# Google Analytics Configuration
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 📊 Event Tracking Implementato

### **🔐 Authentication Events**

#### Auto-tracked nel sistema:
```javascript
// Login attempts and outcomes
trackAuth.loginAttempt('google' | 'email' | 'admin')
trackAuth.loginSuccess(method, userId)
trackAuth.loginFailed(method, errorCode)
trackAuth.logout()
```

#### Eventi generati:
- `login_attempt` - Tentativo di login
- `login` - Login riuscito con metodo
- `login_failed` - Login fallito con codice errore
- `logout` - Logout utente

### **🏟️ Booking Flow Conversion Funnel**

#### Funnel completo tracciato:
```javascript
ConversionFunnels.BOOKING_FLOW = {
  steps: [
    'court_selection',    // Selezione data/campo
    'time_selection',     // Selezione orario
    'player_selection',   // Selezione giocatori
    'payment_info',       // Info pagamento
    'booking_confirmation' // Conferma prenotazione
  ]
}
```

#### Eventi automatici nel booking:
- `booking_create_attempt` - Inizio prenotazione
- `booking_created` - Prenotazione completata (con value per revenue)
- `booking_create_failed` - Prenotazione fallita
- `booking_cancelled` - Prenotazione cancellata

### **👑 Admin Activity Tracking**

#### Eventi amministrativi:
```javascript
// Tracked automatically in admin dashboard
trackAdmin.actionPerformed('navigate_clubs', 'dashboard_stat_card')
trackAdmin.actionPerformed('navigate_users', 'dashboard')
trackAdmin.reportGenerated('bookings_report')
trackAdmin.settingChanged('court_price', newValue)
```

### **📱 Navigation & User Engagement**

#### Page Views automatici:
- Ogni cambio route tracciato con React Router
- Titolo pagina e path automaticamente registrati
- Engagement time calcolato per sessione

#### User Interactions:
```javascript
trackNavigation.menuClick('booking')
trackNavigation.tabChange('stats', 'player_dashboard')
trackNavigation.searchPerformed('milan', 15)
trackEngagement.buttonClick('create_booking', 'booking_page')
```

---

## 🎯 Conversion Funnels Configurati

### **1. Booking Flow Funnel**
```javascript
// Tracked automatically durante booking process
Steps: Data Selection → Time Selection → Player Selection → Confirmation
Goal: Booking completata con revenue tracking
```

### **2. User Onboarding Funnel**
```javascript
// Per nuovi utenti
Steps: Landing → Signup → Email Verification → Profile Setup → First Booking
Goal: Primo booking completato
```

### **3. Admin Workflow Funnel**
```javascript
// Per azioni amministrative
Steps: Admin Login → Dashboard View → Action Selection → Changes Saved
Goal: Admin task completato
```

---

## 📈 Business Metrics Tracking

### **Revenue Tracking**
```javascript
// Automatic revenue tracking on booking completion
trackBusiness.revenueGenerated(bookingPrice, 'booking', 'current_month')

// Court utilization metrics
trackBusiness.courtUtilization('court-1', 85, 'weekly')
```

### **User Retention**
```javascript
// Tracked on user return
trackBusiness.userRetention(userId, daysSinceLastVisit)
```

### **Performance Metrics**
```javascript
// API response times
trackPerformance.apiResponse('/api/bookings', 450, 200)

// Page load performance
trackPerformance.pageLoadTime('booking_page', 1200)
```

---

## 🔍 Custom Events per Feature

### **Club Management**
- `club_selected` - Selezione club
- `club_joined` - Iscrizione a club
- `club_switched` - Cambio club attivo

### **Match Creation**
- `match_created` - Partita creata
- `player_invited` - Giocatore invitato
- `match_confirmed` - Partita confermata

### **Profile Management**
- `profile_updated` - Aggiornamento profilo
- `profile_completed` - Profilo completato (first time)

---

## 📊 Dashboard GA4 Setup

### **Custom Dimensions da Configurare**

1. **User Type**: `user_type` (user, club_admin, admin)
2. **Club ID**: `club_id` per segmentazione
3. **User Role**: `user_role` per permissions
4. **Booking Type**: `booking_type` (court, lesson)

### **Goals & Conversions**

#### Conversioni Primarie:
1. **Booking Completed** - `booking_created` event
2. **User Registration** - `sign_up` event
3. **Club Subscription** - `club_joined` event

#### Conversioni Secondarie:
1. **Profile Completion** - `profile_completed`
2. **First Login** - `login` with `first_time: true`
3. **Admin Action** - admin events

### **Custom Reports Raccomandati**

#### 1. **Booking Funnel Report**
- Visualizza drop-off in ogni step del booking
- Segmenta per tipo campo e orario
- Identifica bottlenecks nel processo

#### 2. **User Engagement Report**
- Sessioni per user type
- Time on site per feature
- Page views per club

#### 3. **Revenue Analytics**
- Revenue per booking type
- Average order value trends
- Revenue per club/court

---

## 🎯 Event Segmentation

### **Per User Type**
```javascript
setUserProperties({
  user_type: 'club_admin' | 'user' | 'admin',
  subscription_status: 'active' | 'inactive',
  club_count: userAffiliations.length
})
```

### **Per Club Context**
```javascript
// Events automatically tagged with club context
trackEvent('booking_created', {
  club_id: currentClub.id,
  club_name: currentClub.name,
  court_type: 'padel'
})
```

---

## 🔧 Advanced Configuration

### **Enhanced Ecommerce**
```javascript
// Automatic revenue tracking
window.gtag('event', 'purchase', {
  transaction_id: bookingId,
  value: bookingPrice,
  currency: 'EUR',
  items: [{
    item_id: courtId,
    item_name: courtName,
    category: 'court_booking',
    quantity: 1,
    price: bookingPrice
  }]
})
```

### **User Cohorts**
- **New Users**: First week activity
- **Returning Users**: 7+ days since last session
- **Power Users**: 5+ bookings per month
- **Admin Users**: Admin role tracking

---

## 📱 Real-time Monitoring

### **Alerting Setup**

1. **Conversions Drop**: Booking rate < 15%
2. **Error Spike**: Error events > 50/hour
3. **Admin Activity**: Unusual admin actions
4. **Revenue Drop**: Daily revenue < threshold

### **Key Metrics Dashboard**

#### Daily Monitoring:
- Active Users (1-day, 7-day, 30-day)
- Conversion Rate (visitor to booking)
- Revenue per User
- Error Rate

#### Weekly Analysis:
- Funnel Performance
- Feature Adoption
- User Retention Cohorts
- Club Performance

---

## 🎨 Custom Event Examples

### **Booking Context Tracking**
```javascript
// Rich booking event with full context
trackBooking.createSuccess(bookingId, 'padel_court', 90, 25.00, {
  time_slot: 'peak_hour',
  advance_booking_days: 3,
  player_count: 4,
  club_tier: 'premium'
})
```

### **User Journey Mapping**
```javascript
// Track user path through app
trackNavigation.userJourney([
  'dashboard',
  'club_selection', 
  'booking_interface',
  'booking_confirmation'
], { 
  journey_duration: 180, // seconds
  conversions: 1
})
```

---

## 🛡️ Privacy & GDPR

### **Consent Management**
```javascript
// Check consent before initialization
if (hasAnalyticsConsent()) {
  initializeGA()
} else {
  // Show consent banner
  setAnalyticsConsent(false)
}
```

### **Data Anonymization**
- IP anonymization attivata di default
- User ID hash per privacy
- No PII in event parameters
- Consent-based tracking

---

## 📊 ROI & Business Impact

### **Before Google Analytics**
- ❌ Nessun insight su user behavior
- ❌ Conversion rate sconosciuto
- ❌ Bottlenecks non identificati
- ❌ Nessun revenue attribution

### **After Google Analytics**
- ✅ **User Journey Insights**: Path analysis completa
- ✅ **Conversion Optimization**: Funnel improvement
- ✅ **Revenue Attribution**: Source tracking preciso
- ✅ **Feature Usage Analytics**: Data-driven development
- ✅ **Real-time Monitoring**: Issue detection rapida

---

## 🚀 Next Steps

### **Immediate Setup**
1. Configura GA4 Measurement ID
2. Verifica event tracking in real-time
3. Configura basic goals e conversions

### **Advanced Analytics**
1. Custom audience creation
2. Attribution modeling setup
3. Cohort analysis implementation
4. A/B testing integration

### **Business Intelligence**
1. Automated reporting setup
2. Dashboard creation per stakeholders
3. Alert configuration per KPI critici
4. Integration con business tools

---

## 📚 Resources

- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [Enhanced Ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Custom Events](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Conversion Tracking](https://support.google.com/analytics/answer/9267568)

---

**🎉 Google Analytics Integration Complete!**

Il sistema ora traccia automaticamente tutti gli eventi critici per business insights e ottimizzazione conversioni.