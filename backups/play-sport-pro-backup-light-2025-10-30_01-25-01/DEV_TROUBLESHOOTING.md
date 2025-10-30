# 🛠️ Development Troubleshooting Guide

## WebSocket Connection Issues

Se vedi errori come:

```
WebSocket connection to 'ws://localhost:5173/' failed
[vite] failed to connect to websocket
```

### Soluzioni Quick Fix:

1. **Hard Refresh**: `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac)
2. **Clear Cache**: `Ctrl + Shift + Del` e seleziona "Cached images and files"
3. **Restart Dev Server**: Ferma con `Ctrl + C` e riavvia con `npm run dev`

### Configurazioni Avanzate:

#### Usa porta diversa per HMR:

```bash
npm run dev:host
```

#### Pulisci cache Vite:

```bash
npm run dev:clean
```

#### Disabilita HMR (solo HTTP):

Aggiungi in `.env.local`:

```env
VITE_HMR=false
```

## React DevTools

Installa l'estensione per una migliore esperienza di sviluppo:

- **Chrome/Edge**: [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- **Firefox**: [React DevTools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## Service Worker in Development

Il Service Worker è attivo anche in development per testare le funzionalità PWA. Se causa problemi:

1. Apri DevTools (F12)
2. Vai su Application > Service Workers
3. Clicca "Unregister" per disabilitarlo temporaneamente

## Script Utili

- `npm run dev` - Server di sviluppo standard
- `npm run dev:host` - Server con accesso da rete locale
- `npm run dev:clean` - Pulisce cache e avvia
- `npm run build:clean` - Build pulito
- `.\start-dev.ps1` - Script helper PowerShell (Windows)

## Port Configuration

- **Main Server**: `localhost:5173`
- **HMR WebSocket**: `localhost:5174`
- **Network Access**: Disponibile con `--host` flag

## Troubleshooting Checklist

- [ ] Hard refresh del browser
- [ ] Cache del browser pulita
- [ ] Server dev riavviato
- [ ] React DevTools installati
- [ ] Porte 5173/5174 libere
- [ ] Firewall non blocca le porte
- [ ] Antivirus non interferisce

## Contatti

Per problemi tecnici persistenti, controlla:

- [Vite Documentation](https://vite.dev/guide/troubleshooting.html)
- [React Documentation](https://react.dev)
- File di log in `node_modules/.vite/`
