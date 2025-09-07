// =============================================
// FILE: src/lib/csv.js
// =============================================
export const toCSV = (rows=[]) => { if (!rows.length) return ''; const esc = (v) => `"${String(v).replace(/"/g, '""')}"`; const header = Object.keys(rows[0]).map(esc).join(','); const body = rows.map((r) => Object.values(r).map(esc).join(',')).join('\n'); return header + '\n' + body; };
export function downloadBlob(name, blob) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener'; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 250); }

