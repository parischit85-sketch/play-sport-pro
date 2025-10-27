# 🧪 Test Guide - Logo Editor

## Quick Test Steps

### 1️⃣ Test Registrazione Circolo

```bash
# Apri browser
http://localhost:5173/register-club
```

**Passi:**
1. Compila Step 1 (Nome, Email, Password, Telefono)
2. Click "Avanti"
3. In Step 2, click su input "Logo del Circolo (opzionale)"
4. Seleziona un'immagine dal tuo device
5. ⭐ **EDITOR SI APRE AUTOMATICAMENTE**

**Verifica Editor:**
- [ ] Modal fullscreen con backdrop scuro
- [ ] Immagine visibile nell'area cropper
- [ ] Crop circolare (non quadrato)
- [ ] Slider zoom funzionante (1x - 3x)
- [ ] Pulsanti zoom +/- funzionanti
- [ ] Slider rotazione funzionante (0° - 360°)
- [ ] Pulsanti rotazione 90° funzionanti
- [ ] Drag per riposizionare l'immagine
- [ ] Tips box visibile

**Azioni:**
- [ ] Zoom in/out
- [ ] Ruota immagine
- [ ] Riposiziona con drag
- [ ] Click "Conferma"
- [ ] Verifica "Processing..." appare
- [ ] Verifica preview logo aggiornato
- [ ] Verifica messaggio "📤 Caricamento in corso..."
- [ ] Verifica logo caricato su Cloudinary

**Test Annullamento:**
- [ ] Riapri editor
- [ ] Click "Annulla" o X
- [ ] Verifica editor si chiude
- [ ] Verifica input file resettato

---

### 2️⃣ Test Settings Admin Club

```bash
# Login come admin club
# Naviga a Settings
http://localhost:5173/club/{clubId}/settings
```

**Passi:**
1. Click tab "Aspetto" (Palette icon)
2. Scroll a sezione "Logo del Circolo"
3. Click pulsante "Carica Logo"
4. Seleziona un'immagine
5. ⭐ **EDITOR SI APRE AUTOMATICAMENTE**

**Verifica Editor:**
- [ ] Stesso design di registrazione
- [ ] Tutti i controlli funzionanti
- [ ] Dark mode supportato (se attivo)

**Azioni:**
- [ ] Modifica logo esistente
- [ ] Click "Conferma"
- [ ] Verifica anteprima aggiornata (non upload immediato!)
- [ ] Click "Salva Modifiche" in alto
- [ ] Verifica upload su Cloudinary
- [ ] Verifica logo aggiornato nel club

---

## 🔍 Test Casi Limite

### Test File Validation:

**File troppo grande:**
```
1. Seleziona file > 5MB
2. Verifica: Alert "Il file è troppo grande"
3. Verifica: Editor NON si apre
```

**File non-immagine:**
```
1. Seleziona PDF, TXT, ecc.
2. Verifica: Alert "Formato file non valido"
3. Verifica: Editor NON si apre
```

**File corrotti:**
```
1. Seleziona immagine corrotta
2. Verifica: Errore gestito gracefully
```

---

## 🎨 Test Visual

### Test Dark Mode:
```
1. Attiva dark mode
2. Apri editor
3. Verifica:
   - [ ] Background contrasto OK
   - [ ] Testo leggibile
   - [ ] Slider visibili
   - [ ] Tips box contrasto OK
```

### Test Responsive:

**Mobile (< 640px):**
```
1. Resize browser a 375px width
2. Apri editor
3. Verifica:
   - [ ] Modal responsive
   - [ ] Controlli accessibili
   - [ ] Slider usabili con touch
   - [ ] Pulsanti cliccabili
```

**Tablet (640px - 1024px):**
```
1. Resize browser a 768px width
2. Verifica layout ottimale
```

---

## 📸 Test Tipi Immagine

**PNG Trasparente:**
```
1. Upload PNG con alpha channel
2. Verifica: Sfondo bianco/grigio nel crop
3. Verifica: Output JPEG senza trasparenza
```

**JPG Grande:**
```
1. Upload JPG 4000x3000px
2. Verifica: Crop performance OK
3. Verifica: Output dimensioni ragionevoli
```

**GIF Animata:**
```
1. Upload GIF animata
2. Verifica: Primo frame estratto
3. Verifica: Output statico
```

**SVG:**
```
1. Upload SVG logo
2. Verifica: Gestione corretta o errore
```

**WebP:**
```
1. Upload WebP
2. Verifica: Supporto browser
```

---

## 🚀 Test Performance

**Upload Time:**
```
1. Upload immagine 1MB
2. Misura tempo da "Conferma" a preview aggiornato
3. Target: < 3 secondi
```

**Processing Time:**
```
1. Crop immagine grande (3000x3000px)
2. Misura tempo processing canvas
3. Target: < 1 secondo
```

**Memory:**
```
1. Apri DevTools → Performance
2. Apri/chiudi editor 10 volte
3. Verifica: No memory leaks
```

---

## ✅ Checklist Completa

### Funzionalità Base:
- [ ] Editor si apre da registrazione
- [ ] Editor si apre da settings
- [ ] Zoom funziona (slider + pulsanti)
- [ ] Rotazione funziona (slider + pulsanti)
- [ ] Drag riposizionamento funziona
- [ ] Preview real-time
- [ ] Conferma → Upload Cloudinary
- [ ] Annulla → Chiudi senza modifiche

### Validazione:
- [ ] File > 5MB bloccato
- [ ] File non-immagine bloccato
- [ ] Errori gestiti con alert chiari

### UI/UX:
- [ ] Design consistente
- [ ] Dark mode supportato
- [ ] Responsive mobile/tablet/desktop
- [ ] Loading states chiari
- [ ] Tips box utili

### Performance:
- [ ] Processing veloce (< 1s)
- [ ] Upload ragionevole (< 3s)
- [ ] No memory leaks
- [ ] Canvas cleanup corretto

### Integration:
- [ ] Logo salvato in Firestore
- [ ] Logo accessibile da altre pagine
- [ ] URL Cloudinary validi
- [ ] Preview aggiornati

---

## 🐛 Bug Noti da Verificare

**Potenziali Issues:**
- [ ] CORS errors con Cloudinary?
- [ ] Canvas toBlob browser compatibility?
- [ ] Touch events su mobile?
- [ ] File input multiple selection?
- [ ] Orientation lock su mobile?

---

## 📊 Metriche Target

| Metrica | Target | Critical |
|---------|--------|----------|
| Time to open editor | < 500ms | < 1s |
| Processing time | < 1s | < 2s |
| Upload time | < 3s | < 5s |
| File size output | < 500KB | < 1MB |
| Success rate | > 95% | > 90% |

---

## 🎯 Success Criteria

✅ **Feature è pronta per produzione se:**
1. Tutti i test funzionali passano
2. Nessun errore console critico
3. Performance entro target
4. UI responsive su tutti i device
5. Dark mode funzionante
6. Upload Cloudinary affidabile

---

## 🚨 Rollback Plan

**Se problemi critici:**
1. Commentare import LogoEditor
2. Ripristinare vecchio handleLogoChange (upload diretto)
3. Deploy hotfix
4. Investigare issue offline

**File da rollback:**
- RegisterClubPage.jsx
- ClubSettings.jsx

**File safe to keep:**
- LogoEditor.jsx (non causa problemi se non usato)

---

**Buon Testing! 🎉**
