# 🔥 GUIDA BACKUP AUTOMATICO FIREBASE

## 📦 Opzione 1: Firebase Extensions (FACILE)

### Installazione:
1. Vai alla [Console Firebase](https://console.firebase.google.com)
2. Seleziona il progetto `m-padelweb`
3. Vai su **Extensions** → **Browse Extensions**
4. Cerca "**Export Collections to Cloud Storage**"
5. Clicca **Install** e segui la configurazione

### Configurazione:
```json
{
  "collectionGroupIds": ["leagues"],
  "outputUriPrefix": "gs://m-padelweb.appspot.com/backups/",
  "scheduleFrequency": "every 24 hours"
}
```

### Vantaggi:
- ✅ Completamente automatico
- ✅ Backup su Google Cloud Storage  
- ✅ Configurabile (ogni ora, giorno, settimana)
- ✅ Nessun codice da scrivere

---

## 💻 Opzione 2: Cloud Functions (PROGRAMMABILE)

### Setup Cloud Functions:
```bash
npm install -g firebase-tools
firebase init functions
```

### Funzione di Backup:
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.scheduledFirestoreBackup = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Europe/Rome')
  .onRun(async (context) => {
    const firestore = admin.firestore();
    
    // Backup di tutte le leghe
    const snapshot = await firestore.collection('leagues').get();
    const backup = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      data: {}
    };
    
    snapshot.forEach(doc => {
      backup.data[doc.id] = doc.data();
    });
    
    // Salva il backup
    await firestore
      .collection('backups')
      .doc(`backup-${Date.now()}`)
      .set(backup);
      
    console.log('Backup automatico completato');
    return null;
  });
```

---

## 🛠️ Opzione 3: Backup dal Client (IMMEDIATO)

Implemento nel codice attuale:
