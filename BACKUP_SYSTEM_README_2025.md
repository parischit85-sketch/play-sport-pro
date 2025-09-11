# 🎾 Play Sport Pro - Sistema di Backup v3.0

**Aggiornato**: 11 Settembre 2025  
**Progetto**: Sistema unificato di prenotazioni campi + lezioni  
**Versione**: 1.0.1 (React 18.3.1 + Vite 7.1.4 + Firebase)

---

## 📋 Panoramica Sistema

Il **Play Sport Pro Backup System v3.0** è un sistema completo di backup progettato specificamente per questo progetto React/Firebase. Offre diverse modalità di backup ottimizzate per diversi scenari d'uso.

### 🏗️ Architettura Progetto

- **Frontend**: React 18.3.1 + Vite 7.1.4 + Tailwind CSS 3.4.13
- **State Management**: React Context API + React Query
- **Backend**: Firebase (Firestore + Authentication + Hosting)
- **Mobile**: Capacitor 7.4.3 (Android ready)
- **PWA**: Service Worker + offline support
- **Deploy**: Netlify + Firebase automatico

### 🚀 Features Principali

✅ **Sistema prenotazione campi** con drag & drop avanzato  
✅ **Sistema prenotazione lezioni** multi-maestri  
✅ **Validazione conflitti** cross-type (campi vs lezioni)  
✅ **Hole prevention** per slot booking consecutivi  
✅ **UI responsive** + dark mode completo  
✅ **PWA** con notifiche push e offline support  
✅ **Build Android** ottimizzato con Capacitor  
✅ **Deploy automatico** Netlify + Firebase

---

## 🔧 Script di Backup Disponibili

### 1. 🖥️ **backup-system-2025.cmd** (Principale)

**Script principale interattivo** con menu completo

```cmd
backup-system-2025.cmd
```

**Opzioni disponibili:**

- 🪶 **BACKUP LIGHT**: Codice + config (1-2 MB)
- 🚀 **BACKUP DEPLOY**: Solo file deployment (5-10 MB)
- ⚙️ **BACKUP CONFIG**: Solo configurazioni (500 KB)
- 💯 **BACKUP COMPLETO**: Tutto incluso (200-500 MB)
- 📊 **INFO SISTEMA**: Statistiche progetto

### 2. ⚡ **backup-quick-2025.cmd** (Sviluppo)

**Backup rapido per sviluppatori**

```cmd
backup-quick-2025.cmd
```

**Caratteristiche:**

- ⏱️ Veloce: ~30 secondi
- 💾 Leggero: ~1-2 MB
- 🔄 Auto-cleanup: mantiene 20 backup
- 📂 Destinazione: `Documents\PlaySport-QuickBackups-2025`

### 3. 🔧 **backup-enhanced-2025.ps1** (PowerShell)

**Engine PowerShell avanzato**

```powershell
.\backup-enhanced-2025.ps1 -Type "light"
.\backup-enhanced-2025.ps1 -Type "deploy" -DestinationRoot "C:\MyBackups"
```

**Parametri:**

- `-Type`: light, deploy, config, full
- `-Source`: Cartella sorgente (default: script location)
- `-DestinationRoot`: Cartella destinazione

---

## 📦 Tipi di Backup Dettagliati

### 🪶 BACKUP LIGHT (Raccomandato)

**Ideale per**: Backup quotidiani, condivisione codice, version control

**Incluso:**

- ✅ `src/` - Tutto il codice React
- ✅ `public/` - Assets PWA e manifest
- ✅ File configurazione (package.json, vite.config.js, etc.)
- ✅ Documentazione completa (\*.md)
- ✅ Script di utilità (_.ps1, _.cmd)
- ✅ Configurazioni Firebase/Netlify
- ✅ Setup Android/PWA

**Escluso:**

- ❌ `node_modules` (dipendenze npm)
- ❌ `dist` (build output)
- ❌ `.git` (repository git)
- ❌ Cache e file temporanei

**Dimensioni**: 1-2 MB  
**Tempo**: 10-30 secondi

### 🚀 BACKUP DEPLOY

**Ideale per**: Emergency restore, backup pre-deploy

**Incluso:**

- ✅ `dist/` - Build ottimizzato pronto per deploy
- ✅ `public/` - Assets PWA
- ✅ `firebase.json`, `firestore.rules` - Config Firebase
- ✅ `netlify.toml` - Config Netlify
- ✅ `android/app/src/main` - Config Android
- ✅ `capacitor.config.ts` - Config Capacitor
- ✅ Documentazione deployment

**Dimensioni**: 5-10 MB  
**Tempo**: 30-60 secondi

### ⚙️ BACKUP CONFIG

**Ideale per**: Backup configurazioni, setup reference

**Incluso:**

- ✅ Tutti i file _.json, _.js, \*.ts di configurazione
- ✅ Documentazione (\*.md)
- ✅ Script di utilità
- ✅ Environment files (.env.\*)
- ✅ Linting configs (.eslintrc, .prettierrc)
- ✅ Git configs (.gitignore)

**Dimensioni**: 500 KB  
**Tempo**: 5-15 secondi

### 💯 BACKUP COMPLETO

**Ideale per**: Migrazione sistema, backup completo pre-upgrade

**Incluso:**

- ✅ **TUTTO** il progetto senza esclusioni
- ✅ `node_modules` - Tutte le dipendenze
- ✅ `.git` - History completa repository
- ✅ `dist` - Build output
- ✅ Cache e file temporanei

**Dimensioni**: 200-500 MB  
**Tempo**: 2-5 minuti

---

## 📂 Struttura Cartelle Backup

```
📁 Downloads\backup-play-sport-pro-2025\
├── 📁 play-sport-pro-light-20250911_143022\
├── 📁 play-sport-pro-deploy-20250911_144511\
├── 📁 play-sport-pro-config-20250911_145002\
└── 📁 play-sport-pro-full-20250911_150033\

📁 Documents\PlaySport-QuickBackups-2025\
├── 📁 playsport-quick-20250911_1430\
├── 📁 playsport-quick-20250911_1445\
└── 📁 playsport-quick-20250911_1500\
```

---

## 🔄 Gestione Automatica

### 🧹 Auto-Cleanup

- **Backup principali**: Mantiene ultimi 15 backup
- **Quick backup**: Mantiene ultimi 20 backup
- **Pulizia automatica**: Ad ogni nuovo backup

### 📊 Logging Dettagliato

Ogni backup include un file `BACKUP_INFO_*.txt` con:

- Timestamp e configurazione backup
- Statistiche dettagliate del progetto
- Lista features implementate
- Informazioni architettura
- Istruzioni per restore

### ⚡ Performance

- **Robocopy**: Utilizzato per copie veloci
- **Exclusion patterns**: Ottimizzati per evitare file inutili
- **Compression ratio**: Fino al 95% di riduzione dimensioni

---

## 📋 Utilizzo Raccomandato

### 👨‍💻 Per Sviluppatori

```cmd
# Backup rapido durante sviluppo (ogni 1-2 ore)
backup-quick-2025.cmd

# Backup light giornaliero
backup-system-2025.cmd → Opzione 1
```

### 🚀 Pre-Deploy

```cmd
# Backup deploy prima di release
backup-system-2025.cmd → Opzione 2

# Backup completo prima di upgrade major
backup-system-2025.cmd → Opzione 4
```

### ⚙️ Setup/Config

```cmd
# Backup solo config per reference
backup-system-2025.cmd → Opzione 3
```

---

## 🔧 Personalizzazione

### Modifica Destinazioni

Modifica le variabili negli script:

```cmd
rem In backup-system-2025.cmd
set "DEST_ROOT=%USERPROFILE%\Downloads\backup-play-sport-pro-2025"

rem In backup-quick-2025.cmd
set "QUICK_BACKUP=%USERPROFILE%\Documents\PlaySport-QuickBackups-2025"
```

### Modifica Esclusioni

Nel file `backup-enhanced-2025.ps1`:

```powershell
$excludeDirs = @(
    "node_modules",
    "dist",
    ".git",
    ".vscode",      # Aggiungi altre cartelle
    "custom_cache"  # da escludere
)
```

---

## ⚠️ Note Importanti

### Sicurezza

- ❌ **I backup NON includono** file `.env` con secrets
- ✅ Include solo `.env.example` (template)
- 🔐 Secrets devono essere configurati manualmente dopo restore

### Restore Process

1. Estrarre backup nella destinazione
2. Eseguire `npm install` (per backup light/config)
3. Configurare variabili ambiente (.env)
4. Eseguire `npm run build` se necessario
5. Testare con `npm run dev`

### Performance Tips

- 🪶 Usa **BACKUP LIGHT** per backup frequenti
- ⚡ Usa **QUICK BACKUP** durante sviluppo attivo
- 💯 Usa **BACKUP COMPLETO** solo quando necessario
- 📱 Quick backup è perfetto per esperimenti

---

## 🐛 Troubleshooting

### Errori Comuni

**❌ "PowerShell execution policy"**

```cmd
powershell -ExecutionPolicy Bypass -File backup-enhanced-2025.ps1
```

**❌ "Access denied"**

- Chiudere VS Code/editor
- Eseguire cmd come Amministratore
- Verificare antivirus non blocchi script

**❌ "Path too long"**

- Backup in cartella con path più corto
- Escludere node_modules se presente

### Performance Issues

- **Lento**: Usa Quick backup invece di Light
- **Spazio disco**: Esegui cleanup manuale backup vecchi
- **Antivirus**: Aggiungi esclusioni per cartelle backup

---

## 📞 Supporto

Per problemi o suggerimenti relativi al sistema di backup:

1. Verificare i log dettagliati in `BACKUP_INFO_*.txt`
2. Controllare spazio disco disponibile
3. Verificare permessi cartelle destinazione
4. Consultare troubleshooting sopra

---

## 📝 Changelog v3.0

### ✨ Novità

- 🎨 UI migliorata con emoji e colori
- 📊 Statistiche dettagliate progetto
- 🧹 Auto-cleanup backup vecchi
- ⚡ Performance ottimizzate
- 📋 Documentazione completa

### 🔧 Miglioramenti

- Gestione errori robusta
- Logging dettagliato
- Supporto PowerShell avanzato
- Menu interattivo migliorato
- Validazione input utente

### 🐛 Bug Fixes

- Risolti problemi path lunghi
- Migliorata gestione permessi
- Fix encoding caratteri speciali

---

**🎉 Play Sport Pro Backup System v3.0** - _Backup professionali per sviluppatori professionali_
