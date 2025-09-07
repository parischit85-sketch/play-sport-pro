// =============================================
// FILE: src/lib/names.js
// =============================================
const COMPOUND = new Set(['di','de','del','della','dello','dalla','dalle','dei','degli','delle','da','dal','d','lo','la','le','van','von']);
const clean = (s) => String(s || '').toLowerCase();
export function surnameOf(fullName='') { const parts = String(fullName || '').trim().split(/\s+/); if (parts.length <= 1) return parts[0] || ''; const last = parts[parts.length - 1]; const prevRaw = parts[parts.length - 2]; const prev = clean(prevRaw?.replace?.(/\.$/, '') || ''); return prev.endsWith("'") || COMPOUND.has(prev) ? `${prevRaw} ${last}` : last; }
export const IT_COLLATOR = new Intl.Collator('it', { sensitivity: 'base', usage: 'sort', numeric: true });
const firstKey = (fullName='') => { const parts = String(fullName).trim().split(/\s+/); const first = parts[0] || ''; const rest = parts.slice(1).join(' '); return `${first} ${rest}`.trim(); };
export const byPlayerFirstAlpha = (a,b) => IT_COLLATOR.compare(firstKey(a.name), firstKey(b.name));

