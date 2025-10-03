// =============================================
// FILE: src/lib/date.js
// =============================================
export function sameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
export function floorToSlot(date, slotMinutes = 30) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  const m = d.getMinutes();
  const chunk = Math.floor(m / slotMinutes) * slotMinutes;
  d.setMinutes(chunk);
  return d;
}
export function addMinutes(date, mins) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + mins);
  return d;
}
export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}
export function hmToMinutes(hm) {
  const [h, m] = (hm || '00:00').split(':').map(Number);
  return h * 60 + (m || 0);
}
export function minutesSinceMidnight(d) {
  return d.getHours() * 60 + d.getMinutes();
}
export function isWeekend(date) {
  const g = date.getDay();
  return g === 0 || g === 6;
}
export function isPeakHour(date, cfg) {
  const h = date.getHours();
  const wd = !isWeekend(date);
  return wd && h >= (cfg.peakStartHour ?? 17) && h < (cfg.peakEndHour ?? 22);
}
