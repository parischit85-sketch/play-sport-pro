const g = (e = '00:00') => {
    const [t, n] = String(e)
      .split(':')
      .map((o) => +o || 0);
    return t * 60 + n;
  },
  D = (e) => e.getDay(),
  M = (e) => e.getHours() * 60 + e.getMinutes();
function d(e, t, n) {
  if (!t) return !1;
  const o = M(e),
    r = o >= g(t.from) && o < g(t.to),
    s = Array.isArray(t.days) ? t.days.includes(D(e)) : !0,
    u = Array.isArray(t.courts) && t.courts.length ? t.courts.includes(n) : !0;
  return r && s && u;
}
function h(e, t, n) {
  const o = n?.find((i) => i.id === t);
  if (!o?.timeSlots) return null;
  const r = e.getDay(),
    s = e.getHours() * 60 + e.getMinutes();
  return o.timeSlots.find((i) => {
    if (!i.days?.includes(r)) return !1;
    const a = g(i.from),
      c = g(i.to);
    return s >= a && s < c;
  });
}
function p(e, t, n = null) {
  const o = n || [],
    r = o.find((s) => s.id === t);
  return !r?.timeSlots || r.timeSlots.length === 0 ? !1 : !!h(e, t, o);
}
function P(e, t, n, o = null) {
  const r = o || t?.courts || [],
    s = h(e, n, r);
  if (s)
    return {
      rate: Number(s.eurPerHour || s.price) || 0,
      source: 'court-slot',
      slot: s,
      isPromo: !!s.isPromo,
    };
  const u = t?.pricing || {},
    i = (u.discounted || []).find((f) => d(e, f, n));
  if (i) return { rate: Number(i.eurPerHour) || 0, source: 'legacy', rule: i, isPromo: !1 };
  const a = (u.full || []).find((f) => d(e, f, n));
  if (a) return { rate: Number(a.eurPerHour) || 0, source: 'legacy', rule: a, isPromo: !1 };
  const c = e.getHours(),
    m = e.getDay() === 0 || e.getDay() === 6,
    y = c >= (t?.peakStartHour || 17) && c < (t?.peakEndHour || 22);
  let l = t?.baseRateWeekday || 20;
  return (
    m ? (l = t?.baseRateWeekend || 25) : y && (l = t?.baseRatePeak || 28),
    { rate: l, source: 'base', rule: null, isPromo: !1 }
  );
}
function S(e, t, n, o = {}, r, s = null) {
  const u = Math.max(5, Number(n?.slotMinutes) || 30),
    i = Math.ceil(t / u);
  let a = new Date(e),
    c = 0;
  const m = s || n?.courts || [],
    y = m.find((f) => f.id === r);
  for (let f = 0; f < i; f++) {
    const { rate: b } = P(a, n, r, m);
    ((c += (b * u) / 60), (a = new Date(a.getTime() + u * 60 * 1e3)));
  }
  const l = n?.addons || {};
  return (
    o.lighting && l.lightingEnabled && (c += Number(l.lightingFee || 0)),
    o.heating && y?.hasHeating && l.heatingEnabled && (c += Number(l.heatingFee || 0)),
    Math.round(c * 100) / 100
  );
}
export { S as c, P as g, p as i };
