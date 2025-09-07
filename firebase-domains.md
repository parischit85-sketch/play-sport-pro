# Configurazione Domini Autorizzati Firebase

## Errori CORS e Cross-Origin-Opener-Policy

### Domini da Aggiungere alla Whitelist Firebase:

1. **Console Firebase** → **Authentication** → **Settings** → **Authorized domains**

2. **Aggiungi questi domini:**
   ```
   localhost
   localhost:5173
   127.0.0.1
   127.0.0.1:5173
   *.netlify.app (se usi Netlify)
   il-tuo-dominio.com (dominio produzione)
   ```

3. **Esempio configurazione per sviluppo:**
   - `localhost` (senza porta per copertura generale)
   - `localhost:5173` (specifico per Vite dev server)

### Nota Importante:
- Firebase richiede che tutti i domini da cui provengono richieste OAuth siano nella whitelist
- I popup OAuth possono essere bloccati su localhost, per cui il codice ora usa redirect come fallback
- Su domini in produzione funzioneranno sia popup che redirect

### Test:
1. Aggiungi i domini alla whitelist
2. Ricarica l'app (Ctrl+F5)
3. Prova il login con Google
4. Se vedi ancora errori CORS, verrà usato automaticamente il redirect
