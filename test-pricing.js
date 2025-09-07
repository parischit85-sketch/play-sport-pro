// Test del nuovo sistema di pricing
import { computePrice, getRateInfo } from './src/lib/pricing.js';

// Mock courts con time slots
const courts = [
  {
    id: 'court1',
    name: 'Campo 1',
    timeSlots: [
      { id: 'slot1', from: '08:00', to: '17:00', days: [1,2,3,4,5], price: 24 },
      { id: 'slot2', from: '17:00', to: '23:00', days: [1,2,3,4,5], price: 32 },
      { id: 'slot3', from: '08:00', to: '23:00', days: [0,6], price: 28 }
    ],
    hasHeating: false
  }
];

const cfg = {
  slotMinutes: 30,
  addons: {
    lightingEnabled: true,
    lightingFee: 2,
    heatingEnabled: true,
    heatingFee: 4
  }
};

// Test 1: Lunedì ore 10:00 (dovrebbe essere 24€/h)
const date1 = new Date('2025-09-08T10:00:00'); // Lunedì
const result1 = getRateInfo(date1, cfg, 'court1', courts);
console.log('Test 1 - Lunedì 10:00:', result1);

// Test 2: Lunedì ore 18:00 (dovrebbe essere 32€/h)
const date2 = new Date('2025-09-08T18:00:00'); // Lunedì
const result2 = getRateInfo(date2, cfg, 'court1', courts);
console.log('Test 2 - Lunedì 18:00:', result2);

// Test 3: Domenica ore 10:00 (dovrebbe essere 28€/h)
const date3 = new Date('2025-09-07T10:00:00'); // Domenica
const result3 = getRateInfo(date3, cfg, 'court1', courts);
console.log('Test 3 - Domenica 10:00:', result3);

// Test 4: Prezzo per 90 minuti lunedì ore 10:00
const price1 = computePrice(date1, 90, cfg, {}, 'court1', courts);
console.log('Test 4 - Prezzo 90min Lunedì 10:00:', price1, '€');

// Test 5: Prezzo per 90 minuti lunedì ore 18:00  
const price2 = computePrice(date2, 90, cfg, {}, 'court1', courts);
console.log('Test 5 - Prezzo 90min Lunedì 18:00:', price2, '€');
