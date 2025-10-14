# Setup Netlify Dev per Testing Locale

Questo script configura l'ambiente per testare le Netlify Functions localmente durante lo sviluppo.

## Prerequisiti

1. **Netlify CLI installato**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Variabili d'ambiente configurate**:
   - Copia `.env.local` in `.env.development`
   - Aggiungi le variabili Netlify-specifiche

## Setup

### 1. Installa dipendenze aggiuntive per development

```bash
npm install --save-dev concurrently
```

### 2. Aggiorna package.json

Aggiungi questi script:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:functions": "netlify dev --port 8888",
    "dev:full": "concurrently \"npm run dev\" \"npm run dev:functions\"",
    "dev:test": "npm run dev:full"
  }
}
```

### 3. Crea .env.development

```bash
# Copia da .env.local e aggiungi:
VITE_FUNCTIONS_URL=http://localhost:8888/.netlify/functions

# Mantieni tutte le altre variabili...
```

### 4. Configura netlify.toml per development

```toml
[build]
  functions = "netlify/functions"
  publish = "dist"

[dev]
  functions = "netlify/functions"
  port = 8888
  publish = "dist"

# Environment variables per development
[dev.environment]
  NODE_ENV = "development"
  VITE_FUNCTIONS_URL = "http://localhost:8888/.netlify/functions"
```

## Come Usare

### Opzione A: Development completo (Raccomandato)

```bash
npm run dev:full
```

Questo avvia:
- ✅ Vite dev server su `http://localhost:5173`
- ✅ Netlify Functions su `http://localhost:8888`
- ✅ Hot reload per entrambi

### Opzione B: Solo Functions

```bash
npm run dev:functions
```

Poi apri un altro terminale e avvia Vite:
```bash
npm run dev
```

### Opzione C: Test specifico

```bash
# Testa una function specifica
curl http://localhost:8888/.netlify/functions/test-env

# Testa push subscription
curl -X POST http://localhost:8888/.netlify/functions/save-push-subscription \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","subscription":{"endpoint":"test"},"endpoint":"test"}'
```

## Debug

### 1. Verifica che le functions siano caricate

```bash
# Lista functions disponibili
curl http://localhost:8888/.netlify/functions/
```

### 2. Controlla logs Netlify

I logs delle functions appaiono nel terminale dove hai avviato `netlify dev`.

### 3. Test da browser

1. Apri `http://localhost:5173?mockPush` (usa mock mode)
2. Vai su Profile → Push Notifications
3. Clicca "Attiva Notifiche"
4. Dovresti vedere logs nel terminale Netlify

### 4. Troubleshooting

**Errore: "Functions not found"**
```bash
# Verifica che le functions esistano
ls -la netlify/functions/

# Riavvia netlify dev
npm run dev:functions
```

**Errore: "Port already in use"**
```bash
# Cambia porta in netlify.toml
[dev]
  port = 9999
```

**Errore: "Environment variables not loaded"**
```bash
# Verifica .env.development
cat .env.development

# Riavvia netlify dev dopo modifiche env
```

## Workflow Raccomandato

1. **Sviluppo normale**: `npm run dev` (con mock mode)
2. **Test functions reali**: `npm run dev:full`
3. **Debug production**: Deploy su Netlify e testa

## Note Importanti

- ⚠️ **Non committare** `.env.development` (aggiungilo a .gitignore)
- ⚠️ **Netlify dev** usa le stesse env vars di produzione
- ⚠️ **Database** sarà quello di produzione se usi le stesse credenziali
- ✅ **Safe per development** se usi un database di test separato

## Testing Checklist

- [ ] `npm run dev:functions` si avvia senza errori
- [ ] Functions raggiungibili su localhost:8888
- [ ] Vite + Netlify dev funzionano insieme
- [ ] Push notifications funzionano in mock mode
- [ ] Push notifications funzionano con functions locali
- [ ] Database operations non toccano produzione