// =============================================
// FILE: src/lib/format.js
// =============================================
export const euro  = (n) => new Intl.NumberFormat('it-IT',{ style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);
export const euro2 = (n) => new Intl.NumberFormat('it-IT',{ style:'currency', currency:'EUR', minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);

