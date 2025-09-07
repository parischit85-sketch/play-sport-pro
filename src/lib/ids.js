// =============================================
// FILE: src/lib/ids.js
// =============================================
export const uid = () => Math.random().toString(36).slice(2, 10);
export const DEFAULT_RATING = 1000;
export const LS_KEY = 'paris-league-v1';