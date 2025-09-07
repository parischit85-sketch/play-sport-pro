// Test del sistema con campi vuoti
import { getRateInfo, computePrice } from './src/lib/pricing.js';

// Configurazione come quella del seed (senza time slots)
const cfg = {
  slotMinutes: 30,
  baseRateWeekday: 20,
  baseRateWeekend: 25,
  baseRatePeak: 28,
  peakStartHour: 17,
  peakEndHour: 22
};

// Campi vuoti (come dal seed aggiornato)
const courts = [
  { id: 'court1', name: 'Campo 1', timeSlots: [], hasHeating: false },
  { id: 'court2', name: 'Campo 2', timeSlots: [], hasHeating: false },
  { id: 'court3', name: 'Campo 3', timeSlots: [], hasHeating: true }
];

console.log('Test con campi VUOTI (come dovrebbe essere all\'inizio):');

// Test ore diverse con campi vuoti
const tests = [
  { desc: 'Lunedì 10:00 (feriale normale)', date: new Date(2025, 8, 8, 10, 0) },
  { desc: 'Lunedì 18:00 (feriale peak)', date: new Date(2025, 8, 8, 18, 0) },
  { desc: 'Sabato 10:00 (weekend)', date: new Date(2025, 8, 13, 10, 0) }
];

tests.forEach((test, i) => {
  const rateInfo = getRateInfo(test.date, cfg, 'court1', courts);
  const price = computePrice(test.date, 90, cfg, { lighting: false, heating: false }, 'court1', courts);
  console.log(`${i+1}. ${test.desc}:`);
  console.log(`   Rate: ${rateInfo.rate}€/h (source: ${rateInfo.source})`);
  console.log(`   Prezzo 90min: ${price}€`);
  console.log('');
});

console.log('Ora l\'utente può configurare i time slots tramite il pannello!');
