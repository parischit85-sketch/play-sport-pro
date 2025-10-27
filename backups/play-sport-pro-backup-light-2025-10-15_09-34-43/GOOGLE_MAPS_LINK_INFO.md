# Google Maps Link - Documentazione

## Soluzione Semplificata (NO API KEY richiesta!)

Abbiamo scelto di NON usare Google Maps API per evitare costi. Invece:

### Input Manuale Indirizzo
- Via e numero civico
- Città (obbligatorio)
- Provincia (opzionale)
- CAP (opzionale)

### Link Google Maps (opzionale)
- Il circolo può fornire un link diretto a Google Maps
- Gli utenti possono cliccare e aprire navigazione GPS
- **Nessun costo** - usa solo link pubblici di Google Maps

## Come ottenere il link Google Maps

**⚠️ IMPORTANTE: Usa il link COMPLETO dalla barra degli indirizzi!**

### Procedura Corretta

1. Apri [Google Maps](https://maps.google.com)
2. Cerca il tuo circolo sportivo (digita l'indirizzo completo)
3. **Copia il link COMPLETO dalla barra degli indirizzi del browser**
4. Incolla nel campo "Link Google Maps" durante la registrazione

### ✅ Link Corretto

Il link deve iniziare con:
```
https://www.google.com/maps/place/...
```

Esempio:
```
https://www.google.com/maps/place/Via+Roma+123,+00100+Roma+RM/@41.9027835,12.4963655,17z/...
```

### ❌ Link NON Valido

**NON usare** il link abbreviato condiviso da Google Maps:
```
https://maps.app.goo.gl/xyz123
```

Questo link abbreviato potrebbe non funzionare correttamente nell'app.

### Perché il link completo?

- **Più affidabile**: Il link completo contiene le coordinate GPS esatte
- **Sempre funzionante**: Non dipende dal servizio di abbreviazione URL
- **Più informazioni**: Include nome del luogo e indirizzo

## Vantaggi di questa soluzione

✅ **Gratuito al 100%** - nessun costo API  
✅ **Semplice** - compilazione manuale dell'indirizzo  
✅ **Funzionale** - link GPS per i giocatori  
✅ **Affidabile** - nessuna dipendenza da servizi esterni  

## Alternative Future (se necessario)

Se in futuro si volesse aggiungere geocoding automatico:
- OpenStreetMap Nominatim (gratuito, rate limits)
- Mapbox (tier gratuito generoso)
- Geoapify (tier gratuito disponibile)

Per ora la soluzione manuale è più che sufficiente!

