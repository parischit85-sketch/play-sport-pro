# 🗂️ Play Sport Pro - Sistema di Backup v2.0

Sistema completo di backup per il progetto Play Sport Pro, con diverse opzioni per ogni necessità.

## 📁 File di Backup Disponibili

### 1. `backup-new.cmd` - Sistema Principale
Script principale con menu interattivo che offre 4 tipi di backup:

- **BACKUP LIGHT** - Codice sorgente + configurazioni (raccomandato)
- **BACKUP COMPLETO** - Tutto incluso (molto pesante)  
- **BACKUP DEPLOY** - Solo file per deployment
- **BACKUP CONFIG** - Solo configurazioni e documentazione

### 2. `backup-quick.cmd` - Backup Rapido
Per backup frequenti durante lo sviluppo:
- Solo cartelle `src/` e `public/`
- File di configurazione principali
- Mantiene automaticamente solo gli ultimi 10 backup
- Destinazione: `%USERPROFILE%\Documents\PlaySport-QuickBackups`

### 3. `backup-enhanced.ps1` - Script PowerShell
Script avanzato chiamato dai file `.cmd` con:
- Logging dettagliato
- Calcolo statistiche
- Apertura automatica cartella destinazione
- Gestione errori avanzata

## 🚀 Come Usare

### Backup Principale (Raccomandato)
```cmd
# Doppio click su backup-new.cmd
# Seleziona opzione 1 (LIGHT) per uso normale
```

### Backup Rapido Sviluppo
```cmd
# Doppio click su backup-quick.cmd
# Backup automatico in pochi secondi
```

### Backup da PowerShell (Avanzato)
```powershell
# Backup light
.\backup-enhanced.ps1 -Type "light"

# Backup deploy
.\backup-enhanced.ps1 -Type "deploy" 

# Backup config
.\backup-enhanced.ps1 -Type "config"
```

## 📂 Contenuto dei Backup

### 🟢 BACKUP LIGHT (Raccomandato - ~5MB)
**Incluso:**
- `src/` - Tutto il codice sorgente React
- `public/` - Assets PWA e risorse statiche
- `package.json` - Dipendenze e script
- `vite.config.js` - Configurazione build
- `tailwind.config.js` - Configurazione CSS
- `firebase.json` + `firestore.*` - Configurazione Firebase
- `capacitor.config.ts` - Configurazione mobile
- `android/app/src/main` - Configurazioni Android essenziali
- Tutti i file `*.md` - Documentazione
- File di configurazione (`.env.example`, `.eslintrc.*`, etc.)

**Escluso:**
- `node_modules/` - Dipendenze (reinstallabili con `npm install`)
- `dist/` - Build output (rigenerabile con `npm run build`)
- `.git/` - Storia Git
- File di log e cache

### 🟡 BACKUP DEPLOY (~2MB)
**Incluso:**
- `dist/` - Build di produzione ottimizzato
- `public/` - Assets statici
- Configurazioni deployment (Firebase, Netlify, Capacitor)
- `android/app/src/main` - Build Android
- Documentazione essenziale

### 🔵 BACKUP CONFIG (~500KB)
**Incluso:**
- Tutti i file `*.json`, `*.js`, `*.ts`
- File di configurazione (`.env.*`, `.eslintrc.*`, etc.)
- Script di utilità (`*.cmd`, `*.ps1`)
- Documentazione completa (`*.md`)
- Regole Firestore e configurazioni Firebase

### 🔴 BACKUP COMPLETO (~200MB+)
**Incluso:**
- Tutto il progetto incluso `node_modules/`, `.git/`, `dist/`
- ⚠️ **Attenzione**: Molto pesante, usare solo se necessario

## 🎯 Destinazioni Backup

- **Backup Principale**: `%USERPROFILE%\Downloads\backup-playsport-pro\`
- **Backup Rapido**: `%USERPROFILE%\Documents\PlaySport-QuickBackups\`

## ⚡ Restore Rapido

### Da Backup Light:
```cmd
1. Estrai il backup
2. cd play-sport-pro-light-TIMESTAMP
3. npm install
4. npm run dev
```

### Da Backup Deploy:
```cmd
1. Estrai il backup  
2. Upload dist/ su hosting
3. Configura Firebase/Netlify
```

## 🛠️ Caratteristiche Avanzate

- **Timestamp automatico** - Ogni backup ha data/ora univoca
- **Logging dettagliato** - Output colorato con informazioni complete  
- **Calcolo statistiche** - File copiati e dimensione totale
- **Pulizia automatica** - Backup rapidi mantengono solo ultimi 10
- **Apertura cartella** - Si apre automaticamente la destinazione
- **Cross-platform** - Funziona su Windows con PowerShell

## 📝 Backup Info

Ogni backup include un file `BACKUP_INFO.txt` con:
- Timestamp e tipo backup
- Versione progetto corrente
- Caratteristiche tecniche
- Sistemi implementati
- Note sugli ultimi aggiornamenti

## 🔧 Configurazione Progetto

**Versione Corrente**: 1.0.1  
**Stack Tecnologico**:
- React 18.3.1 + Vite 7.1.5
- Tailwind CSS + Componenti Custom
- Firebase (Firestore, Auth, Hosting)  
- Capacitor 7.4.3 (Android)
- PWA con Service Worker

**Sistemi Principali**:
- ✅ Sistema prenotazione campi unificato
- ✅ Sistema prenotazione lezioni multi-maestri  
- ✅ Validazione conflitti booking cross-type
- ✅ Hole prevention per slot booking
- ✅ UI responsive + dark mode
- ✅ PWA con notifiche push

---

💡 **Tip**: Per sviluppo quotidiano, usa `backup-quick.cmd`. Per backup importanti prima di release o modifiche major, usa `backup-new.cmd` con opzione LIGHT.
