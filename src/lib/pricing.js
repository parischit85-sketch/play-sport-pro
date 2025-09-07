// =============================================
// FILE: src/lib/pricing.js
// =============================================
import { isWeekend, isPeakHour, minutesSinceMidnight, hmToMinutes, addMinutes } from './date.js';
const toMin = (hhmm = '00:00') => {
  const [h, m] = String(hhmm).split(':').map(n => +n || 0);
  return h * 60 + m;
};
const dayOf = (d) => d.getDay(); // 0=Dom .. 6=Sab
const timeOf = (d) => d.getHours() * 60 + d.getMinutes();

function ruleMatches(date, rule, courtId) {
  if (!rule) return false;
  const t = timeOf(date);
  const inTime = t >= toMin(rule.from) && t < toMin(rule.to);
  const inDay  = Array.isArray(rule.days) ? rule.days.includes(dayOf(date)) : true;
  const inCourt = Array.isArray(rule.courts) && rule.courts.length
    ? rule.courts.includes(courtId)
    : true; // vuoto = tutti i campi
  return inTime && inDay && inCourt;
}

/**
 * Trova il time slot attivo per un campo in una data/ora specifica
 */
function findActiveTimeSlot(date, courtId, courts) {
  const court = courts?.find(c => c.id === courtId);
  if (!court?.timeSlots) {
    return null;
  }

  const dayOfWeek = date.getDay();
  const timeMinutes = date.getHours() * 60 + date.getMinutes();

  const activeSlot = court.timeSlots.find(slot => {
    // Controlla se il giorno è attivo
    if (!slot.days?.includes(dayOfWeek)) return false;
    
    // Controlla se l'ora è nell'intervallo
    const fromMinutes = toMin(slot.from);
    const toMinutes = toMin(slot.to);
    
    return timeMinutes >= fromMinutes && timeMinutes < toMinutes;
  });

  return activeSlot;
}

/**
 * Ritorna { rate, source, slot, isPromo } dove source: 'court-slot' | 'legacy' | 'base'
 */
export function getRateInfo(date, cfg, courtId, courts = null) {
  // Nuovo sistema: cerca nei time slots del campo specifico
  const courtsData = courts || cfg?.courts || [];
  const activeSlot = findActiveTimeSlot(date, courtId, courtsData);
  
  if (activeSlot) {
    return { 
      rate: Number(activeSlot.eurPerHour || activeSlot.price) || 0, 
      source: 'court-slot', 
      slot: activeSlot,
      isPromo: !!activeSlot.isPromo
    };
  }

  // Fallback: sistema legacy (se presente)
  const pricing = cfg?.pricing || {};
  const disc = (pricing.discounted || []).find(r => ruleMatches(date, r, courtId));
  if (disc) return { rate: Number(disc.eurPerHour) || 0, source: 'legacy', rule: disc, isPromo: false };
  const full = (pricing.full || []).find(r => ruleMatches(date, r, courtId));
  if (full) return { rate: Number(full.eurPerHour) || 0, source: 'legacy', rule: full, isPromo: false };
  
  // Ultimo fallback: calcolo base basato su orario e giorno
  const hour = date.getHours();
  const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
  const isPeakTime = hour >= (cfg?.peakStartHour || 17) && hour < (cfg?.peakEndHour || 22);
  
  let baseRate = cfg?.baseRateWeekday || 20;
  if (isWeekendDay) {
    baseRate = cfg?.baseRateWeekend || 25;
  } else if (isPeakTime) {
    baseRate = cfg?.baseRatePeak || 28;
  }
  
  return { rate: baseRate, source: 'base', rule: null, isPromo: false };
}

/**
 * Calcola il prezzo totale su intervallo (in minuti) tenendo conto dei time slots per-campo
 */
export function computePrice(startDate, durationMin, cfg, addons = {}, courtId, courts = null) {
  const slot = Math.max(5, Number(cfg?.slotMinutes) || 30);
  const steps = Math.ceil(durationMin / slot);
  let d = new Date(startDate);
  let euro = 0;

  // Trova il campo per controllare le caratteristiche specifiche
  const courtsData = courts || cfg?.courts || [];
  const court = courtsData.find(c => c.id === courtId);

  for (let i = 0; i < steps; i++) {
    const { rate } = getRateInfo(d, cfg, courtId, courtsData);
    euro += (rate * slot) / 60;
    d = new Date(d.getTime() + slot * 60 * 1000);
  }

  // Opzioni per-campo
  const a = cfg?.addons || {};
  if (addons.lighting && a.lightingEnabled) euro += Number(a.lightingFee || 0);
  
  // Riscaldamento: controlla se il campo lo supporta
  if (addons.heating && court?.hasHeating && a.heatingEnabled) {
    euro += Number(a.heatingFee || 0);
  }

  return Math.round(euro * 100) / 100;
}