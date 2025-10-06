# Geolocalizzazione: Richiesta Permessi al Primo Accesso

Data: 2025-10-06

## Obiettivo
Mostrare automaticamente (solo la prima volta) un preflight della geolocalizzazione per migliorare l'esperienza di ricerca circoli vicini senza forzare l'utente in un flusso bloccante.

## Implementazione
File modificato: `src/layouts/AppLayout.jsx`

Aggiunto `useEffect` con:
- Flag persistente `geoPermissionAskedV1` in `localStorage` per evitare richieste ripetute.
- Lettura stato iniziale dei permessi via `navigator.permissions.query` (se disponibile).
- Prefetch silenzioso della posizione se già `granted` (ottimizza UX successiva).
- Notifica informativa prima della richiesta nativa (delay ~1.2s) per contesto all'utente.
- Gestione degli esiti con dispatch di eventi `notify` (success / warning / error) al `NotificationSystem` globale.
- Heuristic fallback se blocco da policy (`blocked_by_policy`).

## Sicurezza & Privacy
- Nessuna posizione viene salvata persistentemente: solo caching temporaneo in memoria (component state di chi consumerà). 
- Nessun invio lato server in questo hook.
- L'utente può negare e continuare ad usare la ricerca manuale.

## Permissions-Policy
Ripristinata configurazione sicura in `netlify.toml`:
```
Permissions-Policy: geolocation=(self), microphone=(), camera=()
```
Rimossa la variante temporanea `geolocation=(*)` usata per debug.

## Eventi Notifica Utilizzati
| Caso | Tipo | Messaggio |
|------|------|-----------|
| Successo | success | Posizione rilevata! |
| Negato | warning | Hai negato il permesso GPS... |
| Timeout / Unavailable | warning | Non siamo riusciti a ottenere la posizione... |
| Bloccato da policy | error | Il server blocca la geolocalizzazione... |

## Possibili Miglioramenti Futuri
- Aggiungere un piccolo pulsante "Abilita ora" se l'utente chiude la notifica prima della richiesta.
- Salvare timestamp ultima richiesta per analisi UX.
- Integrare una mini-modal invece della sola notifica per contesti educativi.

## Verifica
- Test in ambiente local (localhost) -> prompt appare solo una volta.
- Test con permesso già concesso -> niente prompt, prefetch silenzioso.
- Test negazione -> notifica warning e nessun loop.

---
Documento generato automaticamente come traccia tecnica della modifica.
