const P = (e = '00:00') => {
    const [t, n] = String(e)
      .split(':')
      .map((o) => +o || 0);
    return t * 60 + n;
  },
  M = (e) => e.getDay(),
  p = (e) => e.getHours() * 60 + e.getMinutes();
function d(e, t, n) {
  if (!t) return !1;
  const o = p(e),
    i = o >= P(t.from) && o < P(t.to),
    r = Array.isArray(t.days) ? t.days.includes(M(e)) : !0,
    u = Array.isArray(t.courts) && t.courts.length ? t.courts.includes(n) : !0;
  return i && r && u;
}
function h(e, t, n) {
  const o = n?.find((s) => s.id === t);
  if (!o?.timeSlots) return null;
  const i = e.getDay(),
    r = e.getHours() * 60 + e.getMinutes();
  return o.timeSlots.find((s) => {
    if (!s.days?.includes(i)) return !1;
    const l = P(s.from),
      a = P(s.to);
    return r >= l && r < a;
  });
}
function H(e, t, n = null) {
  const o = n || [],
    i = o.find((r) => r.id === t);
  return !i?.timeSlots || i.timeSlots.length === 0 ? !1 : !!h(e, t, o);
}
function D(e, t, n, o = null) {
  const i = o || t?.courts || [],
    r = h(e, n, i);
  if (r)
    return {
      rate: Number(r.eurPerHour || r.price) || 0,
      source: 'court-slot',
      slot: r,
      isPromo: !!r.isPromo,
    };
  const u = t?.pricing || {},
    s = (u.discounted || []).find((c) => d(e, c, n));
  if (s) return { rate: Number(s.eurPerHour) || 0, source: 'legacy', rule: s, isPromo: !1 };
  const l = (u.full || []).find((c) => d(e, c, n));
  if (l) return { rate: Number(l.eurPerHour) || 0, source: 'legacy', rule: l, isPromo: !1 };
  const a = e.getHours(),
    f = e.getDay() === 0 || e.getDay() === 6,
    g = a >= (t?.peakStartHour || 17) && a < (t?.peakEndHour || 22);
  let m = t?.baseRateWeekday || 20;
  return (
    f ? (m = t?.baseRateWeekend || 25) : g && (m = t?.baseRatePeak || 28),
    { rate: m, source: 'base', rule: null, isPromo: !1 }
  );
}
function S(e, t, n, o = {}, i, r = null, u = null) {
  const s = Math.max(5, Number(n?.slotMinutes) || 30),
    l = Math.ceil(t / s);
  let a = new Date(e),
    f = 0;
  const g = r || n?.courts || [],
    m = g.find((y) => y.id === i);
  for (let y = 0; y < l; y++) {
    const { rate: b } = D(a, n, i, g);
    ((f += (b * s) / 60), (a = new Date(a.getTime() + s * 60 * 1e3)));
  }
  const c = n?.addons || {};
  return (
    o.lighting && c.lightingEnabled && (f += Number(c.lightingFee || 0)),
    o.heating && m?.hasHeating && c.heatingEnabled && (f += Number(c.heatingFee || 0)),
    Math.round(f * 100) / 100
  );
}
function A(e, t, n, o = {}, i, r = null, u = 4) {
  const s = S(e, t, n, o, i, r);
  return Math.round((s / u) * 100) / 100;
}
export { A as a, S as c, D as g, H as i };
