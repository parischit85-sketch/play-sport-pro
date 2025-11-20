# Club Admin Dashboard – Audit e Proposte (Nov 17, 2025)

## Stato attuale (che c'è già)
- Panoramica oggi: prenotazioni/lezioni imminenti, ricavi del giorno, contatore membri
- Maestri disponibili (con slot), meteo, certificati medici in scadenza
- Info circolo (campi, città, premium)
- Azioni rapide: Gestione Campi, Giocatori, Crea Partita
- Gestione fasce orarie lezioni: panel laterale, duplica/attiva/disattiva, validazioni base
- Auto-refresh ogni 2 min + refresh manuale, gestione errori con retry
- Club settings completi: generali, struttura, prezzi, regole, notifiche, aspetto, sicurezza
- Gestione utenti club: aggiungi/collega profilo esistente, rimuovi, schede utente

## Gaps principali (opportunità)
- Pagamenti/ricavi: manca integrazione pagamenti, incassi pendenti, caparre operative
- Reportistica: niente trend settimanali/mensili, tasso occupazione campi, no-show/cancellazioni
- Comunicazioni: niente broadcast ai membri del club (target per segmenti)
- Membership/abbonamenti: assenti piani, pacchetti, crediti, validità
- Pianificazione: ricorrenze/serie per fasce orarie, ferie/festivi, manutenzioni campi
- Operatività: check-in/QR, registro presenze lezioni, lista d’attesa, overbooking protection
- Compliance locale: GDPR a livello club, log di audit filtrati per club, alert certificati blocking
- Integrazioni: Calendari (Google/ICS), WhatsApp share, contabilità (export)

## Proposte – Priorità e criteri d'accettazione

### Quick wins (1-3 giorni)
1) Export giornaliero
- Aggiungi "Esporta Oggi" (CSV) per prenotazioni+lezioni con: orario, campo, cliente, prezzo, maestro
- OK quando: file scaricabile dalla dashboard, colonne corrette, filtra per clubId e data oggi

2) Avvisi operativi in header
- Banner con: certificati scaduti critici (N), cancellazioni ultime 24h, meteo avverso oggi
- OK quando: compaiono solo se >0, link alla vista di dettaglio

3) Ricorrenza base fasce orarie
- Nel panel fasce: "Copia su altri giorni della settimana" e "Copia settimana prossima"
- OK quando: genera timeSlots coerenti senza duplicati, con validazioni

4) Calendario festività/chiusure
- Tab in ClubSettings: elenco giorni di chiusura e note, blocco prenotazioni automatico
- OK quando: prenotazione in data chiusa viene impedita con messaggio chiaro

5) Segmenti rapidi comunicazioni
- Pulsanti: "Scrivi a iscritti attivi", "Inattivi 30gg", "Giocatori lezioni" → apre compose (push/email)
- OK quando: precompila target e mostra conteggio destinatari

### Medio termine (1-2 settimane)
6) Analytics essenziali
- Widget: occupazione campi (%) per giorno/settimana, ricavi per categoria (campi/lezioni), cancellazioni e no-show
- OK quando: range selezionabile (7/30 giorni), grafici semplici, dati da Firestore queries/aggregazioni cache

7) Abbonamenti e pacchetti
- Modello: piani (mensile/annuale), carnet ore/lezioni, saldo crediti per utente
- OK quando: il pagamento/consumo viene scalato in prenotazione, saldo visibile in gestione utenti

8) Lista d’attesa e riempimento
- Per slot pieni: utente si iscrive in waitlist, auto-notifica se si libera, conferma entro X minuti
- OK quando: flusso end-to-end testato su 1 campo con vincoli di concorrenza

9) Registro presenze e no-show
- Check-in da dashboard (QR opzionale), stato presenza, regole penali su no-show
- OK quando: metrica no-show appare negli analytics, e blocchi opzionali su ripetuti

10) Manutenzione e blackout campi
- Stato per campo: "In manutenzione" con intervallo, blocco prenotazioni automatico
- OK quando: calendario riflette indisponibilità e giustifica il motivo

### Strategico (3-6 settimane)
11) Integrazione pagamenti (Stripe)
- Pagamenti online per prenotazioni/lezioni, depositi, rimborsi; report incassi
- OK quando: flusso completo pagamento → conferma prenotazione; riepilogo ricavi nel dashboard

12) Dynamic pricing & promo
- Prezzi peak/off-peak, coupon e codici sconto, sconti membership
- OK quando: prezzo finale calcolato server-side, tracciato in storico

13) Calendari e integrazioni
- Sync Google Calendar per campi/maestri, feed ICS pubblico per ogni campo
- OK quando: creazione/cancellazione si riflette su calendario esterno entro 1 minuto

14) Kiosk/Check-in QR e badge
- Modalità totem per reception, generazione QR per prenotazioni/lezioni, scansione mobile admin
- OK quando: check-in fluido con feedback, riduzione code e no-show documentata

15) CRM leggero e campagne
- Tag utenti, funnel attivazione/riattivazione, campagne (email/push) con template e metriche
- OK quando: segmenti salvati, invii tracciati, open/click rate base

## Dati e servizi richiesti
- Firestore: indici per stats (per data, courtId, clubId), collezioni: payments, memberships, waitlists, attendance
- Cloud Functions: aggregazioni giornaliere, notifiche waitlist, check-in QR, calcolo dynamic pricing
- Sicurezza: regole per clubId scope, ruoli staff, audit log per azioni

## UX/Tech notes
- Aggiornare auto-refresh con visibilità tab e rete online/offline
- Evitare import misti dinamici/statici per firebase (coerenza chunking)
- Aggiungere skeletons e stati vuoti uniformi
- Preferire useCallback/useMemo su funzioni/array passati a subcomponents

---
Se vuoi, posso partire dai Quick Wins (es. export CSV + ricorrenze fasce + calendario chiusure) e portarli in PR piccole e indipendenti.
