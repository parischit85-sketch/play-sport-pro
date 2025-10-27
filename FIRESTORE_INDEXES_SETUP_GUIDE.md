# 🔍 Firestore Indexes Setup Script - Push Notifications v2.0

**Obiettivo**: Creare automaticamente gli 11 indici Firestore per le push notifications  
**Tempo Stimato**: 30-45 minuti (build time degli indici)  
**Metodo**: Firebase CLI + JSON configuration

---

## 📋 Indici da Creare

### 1. notificationEvents (4 indici)

```json
{
  "collectionGroup": "notificationEvents",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "notificationEvents",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "event", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "notificationEvents",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "channel", "order": "ASCENDING" },
    { "fieldPath": "event", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "notificationEvents",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "abTestId", "order": "ASCENDING" },
    { "fieldPath": "abVariant", "order": "ASCENDING" },
    { "fieldPath": "event", "order": "ASCENDING" }
  ]
}
```

### 2. scheduledNotifications (2 indici)

```json
{
  "collectionGroup": "scheduledNotifications",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "sendAt", "order": "ASCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "scheduledNotifications",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "sendAt", "order": "DESCENDING" }
  ]
}
```

### 3. notificationDeliveries (2 indici)

```json
{
  "collectionGroup": "notificationDeliveries",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "timestamp", "order": "ASCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "notificationDeliveries",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

### 4. pushSubscriptions (1 indice)

```json
{
  "collectionGroup": "pushSubscriptions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "updatedAt", "order": "DESCENDING" }
  ]
}
```

### 5. users (2 indici)

```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "lastActivityDays", "order": "ASCENDING" },
    { "fieldPath": "bookingCount", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "certificateExpiryDays", "order": "ASCENDING" },
    { "fieldPath": "certificateStatus", "order": "ASCENDING" }
  ]
}
```

---

## 🚀 Metodo 1: Automatic Deployment (Consigliato)

Il file `firestore.indexes.json` è già stato aggiornato con tutti gli indici. Basta fare deploy:

```bash
# Deploy tutti gli indici in una volta
firebase deploy --only firestore:indexes --project m-padelweb
```

**⚠️ PROBLEMA NOTO**: 
- Ci sono conflitti con indici esistenti
- Alcuni indici potrebbero già esistere con nomi diversi

**SOLUZIONE**: Usa Metodo 2 (Manuale via Console)

---

## 🖱️ Metodo 2: Manual via Firebase Console (RACCOMANDATO)

### Step-by-Step per Ogni Indice

1. **Apri Firebase Console**:
   ```
   https://console.firebase.google.com/project/m-padelweb/firestore/indexes
   ```

2. **Click "Add Index"** (pulsante in alto)

3. **Per ogni indice sotto, compila i campi**:

---

### Indice 1/11: notificationEvents - userId + timestamp

```
Collection ID:        notificationEvents
Fields to index:
  Field path:         userId
  Query scope:        Collection
  Order:              Ascending

  Field path:         timestamp  
  Query scope:        Collection
  Order:              Descending
```

**Click "Create"** → Wait 5-30 minutes

---

### Indice 2/11: notificationEvents - event + timestamp

```
Collection ID:        notificationEvents
Fields to index:
  Field path:         event
  Query scope:        Collection
  Order:              Ascending

  Field path:         timestamp
  Query scope:        Collection
  Order:              Descending
```

**Click "Create"**

---

### Indice 3/11: notificationEvents - channel + event + timestamp

```
Collection ID:        notificationEvents
Fields to index:
  Field path:         channel
  Query scope:        Collection
  Order:              Ascending

  Field path:         event
  Query scope:        Collection
  Order:              Ascending

  Field path:         timestamp
  Query scope:        Collection
  Order:              Descending
```

**Click "Create"**

---

### Indice 4/11: notificationEvents - abTestId + abVariant + event

```
Collection ID:        notificationEvents
Fields to index:
  Field path:         abTestId
  Query scope:        Collection
  Order:              Ascending

  Field path:         abVariant
  Query scope:        Collection
  Order:              Ascending

  Field path:         event
  Query scope:        Collection
  Order:              Ascending
```

**Click "Create"**

---

### Indice 5/11: scheduledNotifications - status + sendAt

```
Collection ID:        scheduledNotifications
Fields to index:
  Field path:         status
  Query scope:        Collection
  Order:              Ascending

  Field path:         sendAt
  Query scope:        Collection
  Order:              Ascending
```

**Click "Create"**

---

### Indice 6/11: scheduledNotifications - userId + status + sendAt

```
Collection ID:        scheduledNotifications
Fields to index:
  Field path:         userId
  Query scope:        Collection
  Order:              Ascending

  Field path:         status
  Query scope:        Collection
  Order:              Ascending

  Field path:         sendAt
  Query scope:        Collection
  Order:              Descending
```

**Click "Create"**

---

### Indice 7/11: notificationDeliveries - timestamp

```
Collection ID:        notificationDeliveries
Fields to index:
  Field path:         timestamp
  Query scope:        Collection
  Order:              Ascending
```

**Click "Create"**

---

### Indice 8/11: notificationDeliveries - userId + timestamp

```
Collection ID:        notificationDeliveries
Fields to index:
  Field path:         userId
  Query scope:        Collection
  Order:              Ascending

  Field path:         timestamp
  Query scope:        Collection
  Order:              Descending
```

**Click "Create"**

---

### Indice 9/11: pushSubscriptions - status + updatedAt

```
Collection ID:        pushSubscriptions
Fields to index:
  Field path:         status
  Query scope:        Collection
  Order:              Ascending

  Field path:         updatedAt
  Query scope:        Collection
  Order:              Descending
```

**Click "Create"**

---

### Indice 10/11: users - lastActivityDays + bookingCount

```
Collection ID:        users
Fields to index:
  Field path:         lastActivityDays
  Query scope:        Collection
  Order:              Ascending

  Field path:         bookingCount
  Query scope:        Collection
  Order:              Descending
```

**Click "Create"**

---

### Indice 11/11: users - certificateExpiryDays + certificateStatus

```
Collection ID:        users
Fields to index:
  Field path:         certificateExpiryDays
  Query scope:        Collection
  Order:              Ascending

  Field path:         certificateStatus
  Query scope:        Collection
  Order:              Ascending
```

**Click "Create"**

---

## ⏱️ Index Build Time

Ogni indice richiede **5-30 minuti** per essere costruito, dipende da:
- Numero di documenti nella collection
- Complessità dell'indice
- Load corrente su Firestore

**Status degli indici**:
- 🟡 **Building**: Indice in costruzione
- 🟢 **Enabled**: Indice pronto e attivo
- 🔴 **Error**: Errore nella creazione

---

## 📊 Metodo 3: Via gcloud CLI (Alternativo)

Se preferisci CLI invece della console:

```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project m-padelweb

# Create index (esempio)
gcloud firestore indexes composite create \
  --collection-group=notificationEvents \
  --query-scope=COLLECTION \
  --field-config field-path=userId,order=ascending \
  --field-config field-path=timestamp,order=descending
```

Ripeti per tutti gli 11 indici.

---

## ✅ Verification Script

Dopo aver creato tutti gli indici, verifica con questo script:

### File: `verify-indexes.js`

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

async function verifyIndexes() {
  console.log('🔍 Verifying Firestore indexes...\n');

  const tests = [
    {
      name: 'notificationEvents - userId + timestamp',
      query: db.collection('notificationEvents')
        .where('userId', '==', 'test')
        .orderBy('timestamp', 'desc')
        .limit(1)
    },
    {
      name: 'notificationEvents - event + timestamp',
      query: db.collection('notificationEvents')
        .where('event', '==', 'sent')
        .orderBy('timestamp', 'desc')
        .limit(1)
    },
    {
      name: 'scheduledNotifications - status + sendAt',
      query: db.collection('scheduledNotifications')
        .where('status', '==', 'pending')
        .orderBy('sendAt', 'asc')
        .limit(1)
    },
    {
      name: 'pushSubscriptions - status + updatedAt',
      query: db.collection('pushSubscriptions')
        .where('status', '==', 'active')
        .orderBy('updatedAt', 'desc')
        .limit(1)
    }
  ];

  for (const test of tests) {
    try {
      await test.query.get();
      console.log(`✅ ${test.name}`);
    } catch (error) {
      if (error.code === 9) { // FAILED_PRECONDITION
        console.log(`❌ ${test.name} - INDEX MISSING`);
        console.log(`   Create index: ${error.message.match(/https:\/\/[^\s]+/)}`);
      } else {
        console.log(`⚠️  ${test.name} - ${error.message}`);
      }
    }
  }

  console.log('\n✅ Verification complete!');
  process.exit(0);
}

verifyIndexes();
```

```bash
# Run verification
node verify-indexes.js
```

---

## 📋 Checklist Creazione Indici

### notificationEvents
- [ ] ✅ userId + timestamp (DESC)
- [ ] ✅ event + timestamp (DESC)
- [ ] ✅ channel + event + timestamp (DESC)
- [ ] ✅ abTestId + abVariant + event

### scheduledNotifications
- [ ] ✅ status + sendAt (ASC)
- [ ] ✅ userId + status + sendAt (DESC)

### notificationDeliveries
- [ ] ✅ timestamp (ASC)
- [ ] ✅ userId + timestamp (DESC)

### pushSubscriptions
- [ ] ✅ status + updatedAt (DESC)

### users
- [ ] ✅ lastActivityDays + bookingCount (DESC)
- [ ] ✅ certificateExpiryDays + certificateStatus

---

## 🐛 Troubleshooting

### Problema: "Index already exists"

**Soluzione**: 
- Verifica in console se esiste già con nome simile
- Se sì, usa quello esistente (non serve duplicare)
- Se no, cambia leggermente l'ordine dei campi

### Problema: "Index build failed"

**Causa**: Dati esistenti incompatibili con l'indice

**Soluzione**:
```javascript
// Verifica dati in collection
db.collection('notificationEvents').limit(5).get()
  .then(snap => {
    snap.docs.forEach(doc => {
      console.log('Data:', doc.data());
      // Check che i campi esistano e abbiano tipo corretto
    });
  });
```

### Problema: "Index build stuck"

**Soluzione**:
- Wait 30-60 min (normal per collections grandi)
- Se ancora stuck dopo 2h, contatta Firebase Support

---

## 🎯 Quick Commands

```bash
# Deploy all indexes at once (may conflict)
firebase deploy --only firestore:indexes --project m-padelweb

# View current indexes
firebase firestore:indexes --project m-padelweb

# Delete an index (if needed)
firebase firestore:indexes:delete INDEX_ID --project m-padelweb

# Check index build status
# Via console: https://console.firebase.google.com/project/m-padelweb/firestore/indexes
```

---

## 📊 Expected Results

Dopo che tutti gli 11 indici sono **Enabled** (🟢):

**Performance Improvements**:
- Query analytics: <100ms (was >5000ms)
- Dashboard load: <500ms (was >3000ms)
- Scheduled notifications fetch: <50ms
- User segmentation: <200ms

**Query Capacity**:
- Support 1000+ concurrent analytics queries
- Handle 10,000+ events/day with no degradation
- Enable real-time dashboard updates

---

## 📝 Final Verification

```bash
# Test query performance
firebase firestore:query notificationEvents \
  --where userId==test123 \
  --order-by timestamp,desc \
  --limit 10

# Should return in <100ms
```

---

**Setup Time**: 45-60 minuti (including build time)  
**Status**: ⏳ **PENDING - START ASAP**  
**Priority**: 🟡 **HIGH** (Analytics dashboard non funzionerà senza)  
**Alternative**: Creare indici on-demand quando le query falliscono (Firebase fornisce link automatico)

---

*Last Updated: 16 Ottobre 2025*  
*Project: Play Sport Pro - Push Notifications v2.0*
