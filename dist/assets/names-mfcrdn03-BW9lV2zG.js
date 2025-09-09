const a = new Set([
    'di',
    'de',
    'del',
    'della',
    'dello',
    'dalla',
    'dalle',
    'dei',
    'degli',
    'delle',
    'da',
    'dal',
    'd',
    'lo',
    'la',
    'le',
    'van',
    'von',
  ]),
  i = (e) => String(e || '').toLowerCase();
function c(e = '') {
  const t = String(e || '')
    .trim()
    .split(/\s+/);
  if (t.length <= 1) return t[0] || '';
  const s = t[t.length - 1],
    n = t[t.length - 2],
    l = i(n?.replace?.(/\.$/, '') || '');
  return l.endsWith("'") || a.has(l) ? `${n} ${s}` : s;
}
const o = new Intl.Collator('it', { sensitivity: 'base', usage: 'sort', numeric: !0 }),
  r = (e = '') => {
    const t = String(e).trim().split(/\s+/),
      s = t[0] || '',
      n = t.slice(1).join(' ');
    return `${s} ${n}`.trim();
  },
  d = (e, t) => o.compare(r(e.name), r(t.name));
export { o as I, d as b, c as s };
