# AGGIORNAMENTO: Soluzione Base64 Implementata ✅

## Il problema CORS è stato risolto!

**Non serve più configurare CORS!** 

Ho modificato il sistema di upload del logo per usare **Base64** invece di Firebase Storage.
Questo significa che l'immagine viene convertita in testo e salvata direttamente nel documento Firestore del torneo.

### Vantaggi
✅ Funziona immediatamente senza configurazione
✅ Nessun problema CORS
✅ Più semplice da gestire
✅ Logo disponibile istantaneamente

### Limiti
⚠️ Dimensione massima: **500KB** (invece di 2MB)
- Per immagini più grandi, è necessario comprimerle prima
- Consigliato: 200-300KB per prestazioni ottimali

### Come usare
1. Vai alla sezione "Nome e Logo Torneo" nel pannello admin
2. Clicca sull'area di upload
3. Seleziona un'immagine (JPG, PNG, ecc.) **max 500KB**
4. Il logo verrà caricato e apparirà nelle viste pubbliche

---

# ISTRUZIONI OBSOLETE: Configurare CORS su Firebase Storage

⚠️ **Queste istruzioni NON sono più necessarie** con la nuova implementazione Base64.

Sono mantenute solo per riferimento futuro nel caso si voglia usare Firebase Storage
per file più grandi.

## Il problema (RISOLTO)
Quando tenti di caricare un logo, ottieni errori CORS perché Firebase Storage blocca le richieste da localhost.

## Soluzione 1: Firebase Console (RACCOMANDATO - 2 minuti)

1. Vai a Google Cloud Console:
   https://console.cloud.google.com/storage/browser?project=m-padelweb

2. Clicca sul bucket `m-padelweb.firebasestorage.app`

3. Vai alla tab "Permissions" (Autorizzazioni)

4. Scorri fino a "CORS configuration"

5. Clicca su "Edit CORS configuration"

6. Incolla questa configurazione:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Content-Disposition", "Authorization"]
  }
]
```

7. Clicca "Save"

8. **Ricarica la pagina del browser** e riprova a caricare il logo

---

## Soluzione 2: Google Cloud SDK (per deployment automatizzati)

### Installazione:
1. Scarica e installa Google Cloud SDK:
   https://cloud.google.com/sdk/docs/install

2. Dopo l'installazione, apri un nuovo terminale e esegui:
   ```bash
   gcloud auth login
   gcloud config set project m-padelweb
   ```

3. Applica il CORS:
   ```bash
   gsutil cors set cors.json gs://m-padelweb.firebasestorage.app
   ```

---

## Verifica

Dopo aver applicato il CORS, ricarica la pagina e prova a caricare un logo.
Gli errori CORS dovrebbero scomparire.

---

## Nota tecnica

Le Firebase Storage Rules sono già configurate correttamente per permettere:
- Upload solo da admin del club
- File max 2MB
- Solo immagini
- Path: `tournaments/{clubId}/{tournamentId}/logo_{timestamp}`

Il problema è solo la configurazione CORS del bucket Storage.
