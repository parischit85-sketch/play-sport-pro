// Test per verificare che le fasce promo funzionino
console.log("Test fasce promo");

// Simuliamo una fascia promo
const testCourt = {
  id: '1',
  name: 'Campo 1',
  timeSlots: [
    {
      id: 'test1',
      label: 'Mattutina Promo',
      from: '09:00',
      to: '12:00',
      days: [1, 2, 3, 4, 5], // Lunedì-Venerdì
      eurPerHour: 15,
      isPromo: true
    },
    {
      id: 'test2',
      label: 'Serale',
      from: '18:00',
      to: '22:00', 
      days: [1, 2, 3, 4, 5],
      eurPerHour: 25,
      isPromo: false
    }
  ]
};

// Test getRateInfo
import { getRateInfo } from './src/lib/pricing.js';

const testDate1 = new Date('2025-09-08T10:00:00'); // Lunedì mattina - dovrebbe essere promo
const testDate2 = new Date('2025-09-08T19:00:00'); // Lunedì sera - non promo

const courts = [testCourt];
const cfg = {};

console.log('Test 1 (10:00 lunedì):', getRateInfo(testDate1, cfg, '1', courts));
console.log('Test 2 (19:00 lunedì):', getRateInfo(testDate2, cfg, '1', courts));
