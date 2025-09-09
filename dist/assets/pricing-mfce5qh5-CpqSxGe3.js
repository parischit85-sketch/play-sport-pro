const g = (t = '00:00') => {
    const [e, n] = String(t)
      .split(':')
      .map((r) => +r || 0);
    return e * 60 + n;
  },
  b = (t) => t.getDay(),
  M = (t) => t.getHours() * 60 + t.getMinutes();
function d(t, e, n) {
  if (!e) return !1;
  const r = M(t),
    c = r >= g(e.from) && r < g(e.to),
    s = Array.isArray(e.days) ? e.days.includes(b(t)) : !0,
    i = Array.isArray(e.courts) && e.courts.length ? e.courts.includes(n) : !0;
  return c && s && i;
}
function P(t, e, n) {
  const r = n?.find((o) => o.id === e);
  if (!r?.timeSlots) return null;
  const c = t.getDay(),
    s = t.getHours() * 60 + t.getMinutes();
  return r.timeSlots.find((o) => {
    if (!o.days?.includes(c)) return !1;
    const u = g(o.from),
      a = g(o.to);
    return s >= u && s < a;
  });
}
function p(t, e, n, r = null) {
  const c = r || e?.courts || [],
    s = P(t, n, c);
  if (s)
    return {
      rate: Number(s.eurPerHour || s.price) || 0,
      source: 'court-slot',
      slot: s,
      isPromo: !!s.isPromo,
    };
  const i = e?.pricing || {},
    o = (i.discounted || []).find((f) => d(t, f, n));
  if (o) return { rate: Number(o.eurPerHour) || 0, source: 'legacy', rule: o, isPromo: !1 };
  const u = (i.full || []).find((f) => d(t, f, n));
  if (u) return { rate: Number(u.eurPerHour) || 0, source: 'legacy', rule: u, isPromo: !1 };
  const a = t.getHours(),
    m = t.getDay() === 0 || t.getDay() === 6,
    y = a >= (e?.peakStartHour || 17) && a < (e?.peakEndHour || 22);
  let l = e?.baseRateWeekday || 20;
  return (
    m ? (l = e?.baseRateWeekend || 25) : y && (l = e?.baseRatePeak || 28),
    { rate: l, source: 'base', rule: null, isPromo: !1 }
  );
}
function D(t, e, n, r = {}, c, s = null) {
  const i = Math.max(5, Number(n?.slotMinutes) || 30),
    o = Math.ceil(e / i);
  let u = new Date(t),
    a = 0;
  const m = s || n?.courts || [],
    y = m.find((f) => f.id === c);
  for (let f = 0; f < o; f++) {
    const { rate: h } = p(u, n, c, m);
    ((a += (h * i) / 60), (u = new Date(u.getTime() + i * 60 * 1e3)));
  }
  const l = n?.addons || {};
  return (
    r.lighting && l.lightingEnabled && (a += Number(l.lightingFee || 0)),
    r.heating && y?.hasHeating && l.heatingEnabled && (a += Number(l.heatingFee || 0)),
    Math.round(a * 100) / 100
  );
}
export { D as c, p as g };
