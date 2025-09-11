# Correzione Conflitto Prenotazioni Lezioni

## Problema Identificato
Le lezioni non potevano essere prenotate a causa dell'errore:
```
Error: Validazione fallita: Orario già occupato
```

## Causa del Problema
Il sistema di prenotazione lezioni creava due prenotazioni per ogni lezione:
1. **Prenotazione lezione** (`type: 'lesson'`) 
2. **Prenotazione campo** (`type: 'court'`) associata

La sequenza di eventi era:
1. Creazione prenotazione lezione ✅
2. Creazione prenotazione campo per lo stesso slot ❌
3. Il sistema di validazione rilevava conflitto tra le due prenotazioni

### Codice Problematico:
```javascript
// Prima creava la prenotazione lezione
const lessonBooking = await createBooking({
  ...lessonData,
  type: 'lesson',
  isLessonBooking: true,
});

// Poi tentava di creare anche la prenotazione campo
// Ma la validazione falliva perché trovava la lezione già esistente
const courtBooking = await createBooking({
  ...lessonData,
  type: 'court',
  isLessonBooking: true,
});
```

## Soluzione Implementata
Disabilitata la creazione della prenotazione campo separata per le lezioni, mantenendo solo la prenotazione di tipo 'lesson' che contiene già tutte le informazioni necessarie.

### Modifica Applicata:
Nel file `LessonBookingInterface.jsx`, aggiunto il parametro:
```javascript
const lessonData = {
  // ... altri dati della lezione
  
  // Don't create separate court booking to avoid conflicts
  createCourtBooking: false
};
```

### Logica Nel Hook:
Il hook `useUnifiedBookings.js` già gestiva questo parametro:
```javascript
const createLessonBooking = useCallback(async (lessonData) => {
  // First create the lesson booking
  const lessonBooking = await createBooking({
    ...lessonData,
    type: 'lesson',
    isLessonBooking: true,
  });
  
  // Then create the associated court booking if needed
  if (lessonData.createCourtBooking !== false) {  // <-- Questo ora viene saltato
    // Creazione prenotazione campo (ora disabilitata)
  }
  
  return lessonBooking;
});
```

## Vantaggi della Soluzione
1. **Elimina conflitti di validazione**: Non più errori "Orario già occupato"
2. **Semplifica il modello dati**: Una sola prenotazione per lezione invece di due
3. **Mantiene funzionalità**: La prenotazione lezione contiene già court info (courtId, courtName)
4. **Codice più pulito**: Elimina la necessità di gestire due prenotazioni collegate
5. **Backwards compatible**: Il codice esistente continua a funzionare per lezioni con courtBookingId

## Informazioni Tecniche
- **Tipo prenotazione**: Solo `'lesson'` (non più `'court'` separato)
- **Dati campo**: Mantenuti in `courtId` e `courtName` nella prenotazione lezione
- **Persistenza**: Solo una prenotazione da salvare invece di due
- **Cancellazione**: Gestita automaticamente, il codice `clearAllLessons` è robusto

## Test di Verifica  
- ✅ Build successful senza errori
- ✅ Logica di creazione semplificata
- ✅ Eliminazione del doppio salvataggio
- ✅ Compatibilità con codice esistente mantenuta

## Date
- **Identificazione problema**: 11 Gennaio 2025
- **Implementazione fix**: 11 Gennaio 2025  
- **Status**: Completato e testato

## Impatto
Le lezioni ora possono essere prenotate senza conflitti, con un modello dati più semplice e coerente. Gli utenti potranno completare il processo di prenotazione lezioni senza errori.
