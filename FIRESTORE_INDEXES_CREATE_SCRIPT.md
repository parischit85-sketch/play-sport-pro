# 🔥 Firestore Indexes - Step-by-Step Creation Guide

**Obiettivo**: Creare 11 indexes richiesti per Push Notifications v2.0  
**Tempo Stimato**: 60 minuti (5 min creazione + 5-30 min build per ciascuno)  
**Metodo**: Firebase Console (manuale)

---

## 📋 Quick Start

1. Vai a: https://console.firebase.google.com/project/m-padelweb/firestore/indexes
2. Login con il tuo account Firebase
3. Segui le istruzioni sotto per creare ogni index

---

## 🎯 Index #1: notificationEvents - By Status & CreatedAt

**Collection**: `notificationEvents`  
**Purpose**: Query notifiche per stato (pending, sent, failed) ordinate per data

### Step-by-Step:
1. Click "**Create Index**" (bottone in alto a destra)
2. Configura:
   - **Collection ID**: `notificationEvents`
   - **Field 1**: `status` → **Ascending**
   - **Field 2**: `createdAt` → **Descending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (5-15 min)

**Query Enabled**:
```javascript
db.collection('notificationEvents')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
  .limit(50);
```

---

## 🎯 Index #2: notificationEvents - By UserId & Status

**Collection**: `notificationEvents`  
**Purpose**: Query notifiche di un utente specifico filtrate per stato

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `notificationEvents`
   - **Field 1**: `userId` → **Ascending**
   - **Field 2**: `status` → **Ascending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (5-20 min)

**Query Enabled**:
```javascript
db.collection('notificationEvents')
  .where('userId', '==', 'user123')
  .where('status', '==', 'sent')
  .get();
```

---

## 🎯 Index #3: notificationEvents - By Type & CreatedAt

**Collection**: `notificationEvents`  
**Purpose**: Query notifiche per tipo (push, email, sms) ordinate per data

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `notificationEvents`
   - **Field 1**: `type` → **Ascending**
   - **Field 2**: `createdAt` → **Descending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (5-20 min)

**Query Enabled**:
```javascript
db.collection('notificationEvents')
  .where('type', '==', 'push')
  .orderBy('createdAt', 'desc')
  .limit(100);
```

---

## 🎯 Index #4: notificationEvents - Composite (UserId, Status, CreatedAt)

**Collection**: `notificationEvents`  
**Purpose**: Query notifiche utente per stato ordinate per data (query più complessa)

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `notificationEvents`
   - **Field 1**: `userId` → **Ascending**
   - **Field 2**: `status` → **Ascending**
   - **Field 3**: `createdAt` → **Descending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (10-30 min)

**Query Enabled**:
```javascript
db.collection('notificationEvents')
  .where('userId', '==', 'user123')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
  .limit(20);
```

---

## 🎯 Index #5: scheduledNotifications - By ScheduledFor & Status

**Collection**: `scheduledNotifications`  
**Purpose**: Query notifiche schedulate pronte per invio

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `scheduledNotifications`
   - **Field 1**: `scheduledFor` → **Ascending**
   - **Field 2**: `status` → **Ascending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (5-15 min)

**Query Enabled**:
```javascript
const now = new Date();
db.collection('scheduledNotifications')
  .where('scheduledFor', '<=', now)
  .where('status', '==', 'pending')
  .limit(100);
```

---

## 🎯 Index #6: scheduledNotifications - By UserId & Status

**Collection**: `scheduledNotifications`  
**Purpose**: Query notifiche schedulate di un utente

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `scheduledNotifications`
   - **Field 1**: `userId` → **Ascending**
   - **Field 2**: `status` → **Ascending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (5-15 min)

**Query Enabled**:
```javascript
db.collection('scheduledNotifications')
  .where('userId', '==', 'user123')
  .where('status', 'in', ['pending', 'processing'])
  .get();
```

---

## 🎯 Index #7: notificationDeliveries - By NotificationId & CreatedAt

**Collection**: `notificationDeliveries`  
**Purpose**: Query delivery attempts per una notifica specifica

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `notificationDeliveries`
   - **Field 1**: `notificationId` → **Ascending**
   - **Field 2**: `createdAt` → **Descending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (5-20 min)

**Query Enabled**:
```javascript
db.collection('notificationDeliveries')
  .where('notificationId', '==', 'notif-456')
  .orderBy('createdAt', 'desc')
  .get();
```

---

## 🎯 Index #8: notificationDeliveries - By Success & CreatedAt

**Collection**: `notificationDeliveries`  
**Purpose**: Query delivery failures ordinati per data

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `notificationDeliveries`
   - **Field 1**: `success` → **Ascending**
   - **Field 2**: `createdAt` → **Descending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (5-20 min)

**Query Enabled**:
```javascript
db.collection('notificationDeliveries')
  .where('success', '==', false)
  .orderBy('createdAt', 'desc')
  .limit(50);
```

---

## 🎯 Index #9: pushSubscriptions - By UserId & Active

**Collection**: `pushSubscriptions`  
**Purpose**: Query subscriptions attive di un utente

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `pushSubscriptions`
   - **Field 1**: `userId` → **Ascending**
   - **Field 2**: `active` → **Ascending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (5-15 min)

**Query Enabled**:
```javascript
db.collection('pushSubscriptions')
  .where('userId', '==', 'user123')
  .where('active', '==', true)
  .get();
```

---

## 🎯 Index #10: users - By PushEnabled & LastActive

**Collection**: `users`  
**Purpose**: Query utenti con push abilitato ordinati per attività

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `users`
   - **Field 1**: `pushEnabled` → **Ascending**
   - **Field 2**: `lastActive` → **Descending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (10-30 min)

**Query Enabled**:
```javascript
db.collection('users')
  .where('pushEnabled', '==', true)
  .orderBy('lastActive', 'desc')
  .limit(1000);
```

---

## 🎯 Index #11: users - By NotificationPreferences

**Collection**: `users`  
**Purpose**: Query utenti per preferenze notifiche

### Step-by-Step:
1. Click "**Create Index**"
2. Configura:
   - **Collection ID**: `users`
   - **Field 1**: `notificationPreferences.email` → **Ascending**
   - **Field 2**: `notificationPreferences.push` → **Ascending**
   - **Query Scopes**: Collection
3. Click "**Create Index**"
4. Status: ⏳ Building... (10-30 min)

**Query Enabled**:
```javascript
db.collection('users')
  .where('notificationPreferences.email', '==', true)
  .where('notificationPreferences.push', '==', true)
  .get();
```

---

## ✅ Checklist Completa

Spunta quando l'index è **Building** (non serve aspettare che finisca):

- [ ] Index #1: notificationEvents (status + createdAt)
- [ ] Index #2: notificationEvents (userId + status)
- [ ] Index #3: notificationEvents (type + createdAt)
- [ ] Index #4: notificationEvents (userId + status + createdAt)
- [ ] Index #5: scheduledNotifications (scheduledFor + status)
- [ ] Index #6: scheduledNotifications (userId + status)
- [ ] Index #7: notificationDeliveries (notificationId + createdAt)
- [ ] Index #8: notificationDeliveries (success + createdAt)
- [ ] Index #9: pushSubscriptions (userId + active)
- [ ] Index #10: users (pushEnabled + lastActive)
- [ ] Index #11: users (notificationPreferences.email + notificationPreferences.push)

---

## 🔍 Verifica Status Indexes

### Via Firebase Console

1. Vai a: https://console.firebase.google.com/project/m-padelweb/firestore/indexes
2. Dovresti vedere tutti gli 11 indexes con status:
   - 🟡 **Building** → In progress (5-30 min)
   - 🟢 **Enabled** → Pronto all'uso
   - 🔴 **Error** → Riprova creazione

### Via gcloud CLI (Opzionale)

```bash
firebase firestore:indexes --project m-padelweb
```

Output expected:
```
Indexes:
  - collectionGroup: notificationEvents
    fields:
      - fieldPath: status
        order: ASCENDING
      - fieldPath: createdAt
        order: DESCENDING
    queryScope: COLLECTION
  
  [... altri 10 indexes ...]
```

---

## ⏱️ Tempo Stimato per Completamento

| Index | Collection | Fields | Build Time |
|-------|-----------|--------|------------|
| #1 | notificationEvents | 2 | 5-15 min |
| #2 | notificationEvents | 2 | 5-20 min |
| #3 | notificationEvents | 2 | 5-20 min |
| #4 | notificationEvents | 3 | 10-30 min |
| #5 | scheduledNotifications | 2 | 5-15 min |
| #6 | scheduledNotifications | 2 | 5-15 min |
| #7 | notificationDeliveries | 2 | 5-20 min |
| #8 | notificationDeliveries | 2 | 5-20 min |
| #9 | pushSubscriptions | 2 | 5-15 min |
| #10 | users | 2 | 10-30 min |
| #11 | users | 2 | 10-30 min |

**Tempo Totale Creazione**: ~15 minuti (click click click)  
**Tempo Totale Build**: 60-180 minuti (Firebase fa in background)

**⚠️ IMPORTANTE**: Non serve aspettare che ogni index finisca il build prima di creare il prossimo. Crea tutti e 11 subito, Firebase li builderà in parallelo!

---

## 🐛 Troubleshooting

### Errore: "Index already exists"

**Causa**: L'index è già presente (magari creato in precedenza)

**Soluzione**: Salta questo index, è già OK! ✅

### Errore: "Permission denied"

**Causa**: Account non ha permessi su progetto Firebase

**Soluzione**:
```bash
# Login con account corretto
firebase login

# Verifica progetto
firebase projects:list
```

### Index stuck in "Building" per >1 ora

**Causa**: Database grande o Firebase sovraccarico

**Soluzione**:
1. Aspetta ancora 30-60 min
2. Se persiste, contatta Firebase Support
3. In alternativa, droppa l'index e ricrealo

### Query fallisce con "Index not found"

**Causa**: Index non ancora completato o errato

**Soluzione**:
1. Vai su Firebase Console → Indexes
2. Verifica status (deve essere **Enabled**, non **Building**)
3. Se manca, clicca il link error nella console dev per auto-creare

---

## 🎯 Success Criteria

**Index Creation COMPLETE when**:
- [x] ✅ Tutti i 11 indexes in status "Building" o "Enabled"
- [ ] ⏳ Nessun errore di creazione
- [ ] ⏳ Query nel codice funzionano senza errori

**Nota**: Gli indexes possono essere usati anche mentre sono in "Building", ma con performance degradata. Aspetta che diventino "Enabled" per performance ottimali.

---

**Tempo Totale**: ~15 min creazione + 60-180 min build (background)  
**Priority**: 🔴 **CRITICAL** (Senza indexes, le query falliranno)  
**Status**: ⏳ **PENDING** (Inizia ORA)

---

*Last Updated: 16 Ottobre 2025*  
*Project: Play Sport Pro - Push Notifications v2.0*
