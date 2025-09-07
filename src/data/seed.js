// =============================================
// FILE: src/data/seed.js
// =============================================
import { DEFAULT_RATING, uid } from '@lib/ids.js';

export const ITA20 = [
  'Andrea Paris','Giovanni Cardarelli','Nicola Di Marzio','Stefano Ruscitti',
  'Domenico Di Gianfilippo','Giorgio Contestabile','Alfredo Di Donato','Paolo Chiola',
  'Angelo Persia','Marco Idrofano','Lorenzo Eligi','Matteo Di Stefano',
  'Claudio Morgante','Pierluigi Paris','Gabriele Rossi','Luca Bianchi',
  'Marco Verdi','Antonio Esposito','Francesco Romano','Davide Moretti'
];

export function getDefaultBookingConfig() { 
  return { 
    slotMinutes: 30, 
    dayStartHour: 8, 
    dayEndHour: 23, 
    defaultDurations: [60, 90, 120], 
    pricing: { 
      full: [], 
      discounted: [] 
    }, 
    addons: { 
      lightingEnabled: true, 
      lightingFee: 2, 
      heatingEnabled: true, 
      heatingFee: 4 
    }, 
    baseRateWeekday: 24, 
    baseRatePeak: 32, 
    baseRateWeekend: 28, 
    peakStartHour: 17, 
    peakEndHour: 22 
  }; 
}

export function makeSeed() { 
  const players = ITA20.map((name) => ({ 
    id: uid(), 
    name, 
    baseRating: DEFAULT_RATING, 
    rating: DEFAULT_RATING 
  })); 

  const pick4 = () => { 
    const pool = [...players]; 
    return new Array(4).fill(0).map(() => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); 
  }; 

  const matches = []; 
  for (let i = 0; i < 15; i++) { 
    const [a1, a2, b1, b2] = pick4(); 
    const sets = []; 
    let wA = 0, wB = 0; 
    while (wA < 2 && wB < 2) { 
      const aWin = Math.random() < 0.5; 
      const ga = 6, gb = Math.floor(Math.random() * 5); 
      if (aWin) { 
        sets.push({ a: ga, b: gb }); 
        wA++; 
      } else { 
        sets.push({ a: gb, b: ga }); 
        wB++; 
      } 
    } 
    matches.push({ 
      id: uid(), 
      date: new Date().toISOString(), 
      teamA: [a1.id, a2.id], 
      teamB: [b1.id, b2.id], 
      sets 
    }); 
  } 

  const courts = [ 
    { 
      id: uid(), 
      name: 'Campo 1 (Outdoor)',
      timeSlots: [],
      hasHeating: false
    }, 
    { 
      id: uid(), 
      name: 'Campo 2 (Outdoor)',
      timeSlots: [],
      hasHeating: false
    }, 
    { 
      id: uid(), 
      name: 'Campo 3 (Indoor)',
      timeSlots: [],
      hasHeating: true
    } 
  ]; 

  const bookings = []; 
  const bookingConfig = getDefaultBookingConfig(); 
  
  return { 
    players, 
    matches, 
    courts, 
    bookings, 
    bookingConfig 
  }; 
}

