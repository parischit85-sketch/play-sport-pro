import { j as e, f as we, k as ke, t as De } from './index-mfce5qh5-Bjue6Tcf.js';
import { r as h, b as he, c as Ce } from './router-mfce5qh5-SMEpEpls.js';
import { S as Se } from './Section-mfce5qh5-BVq7CZw3.js';
import { M as $e } from './Modal-mfce5qh5-Dv_rJ4XO.js';
import { a as T, e as Me } from './format-mfce5qh5-DAEZv7Mi.js';
import { g as re, c as ge } from './pricing-mfce5qh5-CpqSxGe3.js';
import './vendor-mfce5qh5-D3F3s8fL.js';
import './firebase-mfce5qh5-jcIpuiEY.js';
function Ie(c, x) {
  return (
    c.getFullYear() === x.getFullYear() &&
    c.getMonth() === x.getMonth() &&
    c.getDate() === x.getDate()
  );
}
function O(c, x = 30) {
  const g = new Date(c);
  g.setSeconds(0, 0);
  const k = g.getMinutes(),
    n = Math.floor(k / x) * x;
  return (g.setMinutes(n), g);
}
function w(c, x) {
  const g = new Date(c);
  return (g.setMinutes(g.getMinutes() + x), g);
}
function W(c, x, g, k) {
  return c < k && g < x;
}
function Be({ currentDay: c, onSelectDay: x, T: g }) {
  const [k, n] = h.useState(new Date(c.getFullYear(), c.getMonth(), 1)),
    i = new Date();
  i.setHours(0, 0, 0, 0);
  const p = k.getFullYear(),
    u = k.getMonth(),
    U = new Date(p, u, 1),
    D = new Date(U);
  D.setDate(D.getDate() - U.getDay() + 1);
  const m = new Date(D);
  m.setDate(m.getDate() + 41);
  const A = [];
  for (let d = new Date(D); d <= m; d.setDate(d.getDate() + 1)) A.push(new Date(d));
  const V = [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ],
    X = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    P = () => {
      n(new Date(p, u - 1, 1));
    },
    Y = () => {
      n(new Date(p, u + 1, 1));
    },
    _ = (d) => d.getTime() === i.getTime(),
    S = (d) => d.getTime() === c.getTime(),
    F = (d) => d.getMonth() === u,
    oe = (d) => d < i;
  return e.jsxs('div', {
    className: 'w-full',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between mb-4',
        children: [
          e.jsx('button', {
            type: 'button',
            onClick: P,
            className:
              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors',
            children: '←',
          }),
          e.jsxs('h4', { className: `text-xl font-bold ${g.text}`, children: [V[u], ' ', p] }),
          e.jsx('button', {
            type: 'button',
            onClick: Y,
            className:
              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors',
            children: '→',
          }),
        ],
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1 mb-2',
        children: X.map((d) =>
          e.jsx(
            'div',
            { className: `text-center text-sm font-semibold ${g.subtext} py-2`, children: d },
            d
          )
        ),
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1',
        children: A.map((d, q) => {
          const z = d.getDate(),
            L = F(d),
            E = _(d),
            G = S(d),
            J = oe(d);
          return e.jsx(
            'button',
            {
              type: 'button',
              onClick: () => x(d),
              disabled: J,
              className: `
                h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
                ${G ? 'bg-blue-500 text-white shadow-lg dark:bg-emerald-500' : E ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-emerald-100 dark:text-emerald-700 dark:border-emerald-300' : L ? 'hover:bg-gray-200 dark:hover:bg-gray-700 ' + g.text : 'text-gray-400 dark:text-gray-600'}
                ${J ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `,
              children: z,
            },
            q
          );
        }),
      }),
    ],
  });
}
function Pe({ state: c, setState: x, players: g, playersById: k, T: n }) {
  const i = c?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    [p, u] = h.useState(() => O(new Date(), i.slotMinutes)),
    [U, D] = h.useState(!1),
    m = Array.isArray(c?.courts) ? c.courts : [],
    A = Array.isArray(c?.bookings) ? c.bookings : [],
    V = h.useMemo(() => {
      const t = Array.isArray(i?.defaultDurations) ? i.defaultDurations : [];
      return t.includes(90) ? 90 : t.length > 0 ? t[0] : 90;
    }, [i]),
    X = () => u(O(new Date(), i.slotMinutes)),
    P = (t) =>
      u((s) => {
        const o = new Date(s);
        return (o.setDate(o.getDate() + t), o);
      }),
    Y = new Date(p);
  Y.setHours(i.dayStartHour, 0, 0, 0);
  const _ = new Date(p);
  _.setHours(i.dayEndHour, 0, 0, 0);
  const S = [],
    F = new Set();
  if (
    (m.forEach((t) => {
      t.timeSlots &&
        t.timeSlots.length > 0 &&
        t.timeSlots.forEach((s) => {
          if (s.days?.includes(p.getDay())) {
            const o = parseInt(s.from.split(':')[0]) * 60 + parseInt(s.from.split(':')[1]),
              r = parseInt(s.to.split(':')[0]) * 60 + parseInt(s.to.split(':')[1]);
            for (let l = o; l < r; l += i.slotMinutes) F.add(l);
          }
        });
    }),
    F.size > 0)
  )
    Array.from(F)
      .sort((s, o) => s - o)
      .forEach((s) => {
        const o = new Date(p);
        (o.setHours(Math.floor(s / 60), s % 60, 0, 0), S.push(o));
      });
  else for (let t = new Date(Y); t < _; t = w(t, i.slotMinutes)) S.push(new Date(t));
  const d = `${((t) => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(p))} - ${String(p.getDate()).padStart(2, '0')} ${new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(p)} ${p.getFullYear()}`,
    q = h.useMemo(
      () =>
        A.filter((t) => Ie(new Date(t.start), p)).sort(
          (t, s) => new Date(t.start) - new Date(s.start)
        ),
      [A, p]
    ),
    z = h.useMemo(() => {
      const t = new Map(m.map((s) => [s.id, []]));
      for (const s of q) {
        const o = t.get(s.courtId) || [];
        (o.push(s), t.set(s.courtId, o));
      }
      return t;
    }, [q, m]),
    L = h.useMemo(
      () =>
        S.map((t) => {
          const s = m.map((o) => re(t, i, o.id, m).rate);
          return s.length > 0 ? Math.min(...s) : 0;
        }),
      [S, i, m]
    ),
    E = h.useMemo(() => Math.min(...L), [L]),
    G = h.useMemo(() => Math.max(...L), [L]),
    J = (t) => (!isFinite(E) || !isFinite(G) || E === G ? 0.18 : 0.12 + ((t - E) / (G - E)) * 0.22),
    ie = h.useMemo(
      () =>
        [...g].sort((t, s) => (t.name || '').localeCompare(s.name, 'it', { sensitivity: 'base' })),
      [g]
    ),
    pe = (t) => k?.[t]?.name || '',
    be = (t) => {
      const s = (t || '').trim().toLowerCase();
      return (s && ie.find((r) => r.name.trim().toLowerCase() === s)?.id) || null;
    },
    Z = (t, s) => (s && re(s, i, t, m).isPromo) || !1,
    [le, I] = h.useState(!1),
    [j, de] = h.useState(null),
    [K, ee] = h.useState('overview'),
    [te, ce] = h.useState('all'),
    [a, C] = h.useState({
      courtId: '',
      start: null,
      duration: V,
      p1Name: '',
      p2Name: '',
      p3Name: '',
      p4Name: '',
      note: '',
      bookedBy: '',
      useLighting: !1,
      useHeating: !1,
    });
  function me(t, s) {
    const o = O(s, i.slotMinutes);
    (de(null),
      C({
        courtId: t,
        start: o,
        duration: V,
        p1Name: '',
        p2Name: '',
        p3Name: '',
        p4Name: '',
        note: '',
        bookedBy: '',
        useLighting: !1,
        useHeating: !1,
      }),
      I(!0));
  }
  function ue(t) {
    de(t.id);
    const s = new Date(t.start),
      o = (t.players || []).map(pe);
    let r = t.playerNames && t.playerNames.length ? t.playerNames : o;
    const l = t.bookedByName || '';
    (l && !r.includes(l) && (r = [l, ...r].slice(0, 4)),
      C({
        courtId: t.courtId,
        start: s,
        duration: t.duration,
        p1Name: r[0] || '',
        p2Name: r[1] || '',
        p3Name: r[2] || '',
        p4Name: r[3] || '',
        note: t.note || '',
        bookedBy: l,
        useLighting: !!t.addons?.lighting,
        useHeating: !!t.addons?.heating,
      }),
      I(!0));
  }
  function fe(t, s, o, r = null) {
    const l = new Date(s),
      v = w(s, o);
    return (z.get(t) || []).find((N) => {
      if (r && N.id === r) return !1;
      const f = new Date(N.start),
        b = w(new Date(N.start), N.duration);
      return W(l, v, f, b);
    });
  }
  const xe = h.useRef('');
  h.useEffect(() => {
    const t = a.p1Name?.trim() || '',
      s = xe.current;
    ((!a.bookedBy?.trim() || a.bookedBy?.trim() === s) && t && C((o) => ({ ...o, bookedBy: t })),
      (xe.current = t));
  }, [a.p1Name]);
  function se() {
    if (!a.courtId || !a.start) {
      alert('Seleziona campo e orario.');
      return;
    }
    const t = O(a.start, i.slotMinutes);
    if (t < new Date()) {
      alert('Non puoi prenotare nel passato.');
      return;
    }
    const o = j || null;
    if (fe(a.courtId, t, a.duration, o)) {
      alert('Esiste già una prenotazione che si sovrappone su questo campo.');
      return;
    }
    const r = [a.p1Name, a.p2Name, a.p3Name, a.p4Name].map((f) => (f || '').trim()).filter(Boolean),
      l = r.map(be).filter(Boolean),
      v = (a.bookedBy && a.bookedBy.trim()) || r[0] || '',
      $ = ge(
        t,
        a.duration,
        i,
        { lighting: !!a.useLighting, heating: !!a.useHeating },
        a.courtId,
        m
      ),
      N = {
        courtId: a.courtId,
        start: t.toISOString(),
        duration: a.duration,
        players: l,
        playerNames: r,
        price: $,
        note: a.note?.trim() || '',
        bookedByName: v,
        addons: { lighting: !!a.useLighting, heating: !!a.useHeating },
        status: 'booked',
      };
    if (j)
      x((f) => ({
        ...f,
        bookings: (f.bookings || []).map((b) =>
          b.id === j ? { ...b, ...N, updatedAt: Date.now() } : b
        ),
      }));
    else {
      const f = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        createdAt: Date.now(),
        ...N,
      };
      x((b) => ({ ...b, bookings: [...(b.bookings || []), f] }));
    }
    I(!1);
  }
  function ae(t) {
    confirm('Cancellare la prenotazione?') &&
      x((s) => ({ ...s, bookings: (s.bookings || []).filter((o) => o.id !== t) }));
  }
  const ye = (t) => m.find((s) => s.id === t)?.name || t,
    Ne = 52;
  function je(t, s) {
    const o = z.get(t) || [],
      r = o.find((y) => {
        const H = new Date(y.start),
          Q = w(new Date(y.start), y.duration);
        return W(H, Q, s, w(s, i.slotMinutes));
      }),
      l = o.some((y) => new Date(y.start).getTime() === w(s, i.slotMinutes).getTime());
    if (!r && l) {
      const y = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return e.jsx('div', {
        className:
          'relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium bg-gray-300 dark:bg-gray-700 opacity-60 cursor-not-allowed border-dashed border-2 border-gray-400 flex items-center justify-center',
        title: 'Slot non prenotabile: precede una prenotazione',
        children: e.jsx('span', {
          className: 'absolute inset-0 grid place-items-center text-[11px] opacity-90',
          children: y,
        }),
      });
    }
    if (!r) {
      const y = re(s, i, t, m),
        H = J(y.rate),
        Q = y.source === 'discounted' || y.isPromo,
        ve = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return e.jsxs('button', {
        type: 'button',
        onClick: () => me(t, s),
        className: 'relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium',
        style: { background: `rgba(16,185,129,${H})`, borderColor: 'rgba(16,185,129,0.35)' },
        title: y.isPromo ? 'Fascia Promo' : Q ? 'Fascia scontata' : 'Tariffa standard',
        children: [
          Q &&
            e.jsx('span', {
              className:
                'absolute top-0.5 right-0.5 px-1.5 py-[1px] rounded-full text-[10px] leading-none',
              style: {
                background: 'rgba(16,185,129,0.9)',
                color: '#0b0b0b',
                border: '1px solid rgba(16,185,129,0.6)',
              },
              children: '★ Promo',
            }),
          e.jsx('span', {
            className: 'absolute inset-0 grid place-items-center text-[11px] opacity-90',
            children: ve,
          }),
        ],
      });
    }
    const v = new Date(r.start),
      $ = w(v, r.duration);
    if (!(s.getTime() === v.getTime())) return e.jsx('div', { className: 'w-full h-9' });
    const b = Math.ceil(($ - s) / (i.slotMinutes * 60 * 1e3)) * Ne - 6,
      M = (
        r.playerNames && r.playerNames.length
          ? r.playerNames
          : (r.players || []).map((y) => k?.[y]?.name || '—')
      )
        .concat(r.guestNames || [])
        .slice(0, 4),
      R = e.jsx('span', { className: 'text-2xl', children: '💡' }),
      ne = e.jsx('span', { className: 'text-2xl', children: '🔥' });
    return e.jsx('div', {
      className: 'w-full h-9 relative',
      children: e.jsxs('button', {
        type: 'button',
        onClick: () => ue(r),
        className:
          'absolute left-0 right-0 px-2 py-2 ring-1 text-left text-[13px] font-semibold flex flex-col justify-center',
        style: {
          top: 0,
          height: `${b}px`,
          background: 'rgba(220, 38, 127, 0.35)',
          borderColor: 'rgba(220, 38, 127, 0.6)',
          borderRadius: '8px',
          overflow: 'hidden',
        },
        title: `${ye(r.courtId)} — ${v.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${r.duration}′) • clicca per modificare`,
        children: [
          e.jsxs('div', {
            className: 'absolute left-2 top-2 flex flex-row items-center gap-2 z-20',
            children: [r.addons?.lighting && R, r.addons?.heating && ne],
          }),
          e.jsxs('div', {
            className: 'flex items-center justify-between gap-2 mb-1 mt-2',
            children: [
              e.jsxs('div', {
                className: 'min-w-0 flex flex-col',
                children: [
                  e.jsxs('span', {
                    className: 'font-bold text-[15px] leading-tight',
                    children: [
                      v.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      ' - ',
                      $.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      ' • ',
                      T(r.price),
                    ],
                  }),
                  e.jsx('span', {
                    className: 'flex items-center gap-2 mt-1',
                    children: e.jsx('div', {
                      className: 'text-[10px] font-medium opacity-80 flex flex-wrap gap-1',
                      children: M.map((y, H) =>
                        e.jsx(
                          'span',
                          {
                            className: 'bg-white/20 px-1 py-0.5 rounded text-[9px] font-medium',
                            children: y,
                          },
                          H
                        )
                      ),
                    }),
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'shrink-0 text-[13px] opacity-80 font-bold',
                children: [Math.round(r.duration), '′'],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'text-[12px] opacity-80 truncate',
            children: [
              'Prenotato da: ',
              e.jsx('span', {
                className: 'font-semibold',
                children: r.bookedByName || M[0] || '—',
              }),
            ],
          }),
          r.note &&
            e.jsx('div', { className: 'text-[11px] opacity-70 mt-1 truncate', children: r.note }),
        ],
      }),
    });
  }
  const B = h.useMemo(
    () =>
      !a.start || !a.courtId
        ? null
        : ge(
            new Date(a.start),
            a.duration,
            i,
            { lighting: a.useLighting, heating: a.useHeating },
            a.courtId,
            m
          ),
    [a.start, a.duration, a.courtId, a.useLighting, a.useHeating, i, m]
  );
  return (
    h.useMemo(() => (B == null ? null : B / 4), [B]),
    e.jsx(Se, {
      title: 'Gestione Campi',
      T: n,
      children: c
        ? e.jsxs(e.Fragment, {
            children: [
              e.jsx('div', {
                className: `flex flex-col items-center gap-6 mb-6 ${n.cardBg} ${n.border} p-6 rounded-xl shadow-lg`,
                children: e.jsxs('div', {
                  className: 'flex items-center justify-center gap-6',
                  children: [
                    e.jsx('button', {
                      type: 'button',
                      className:
                        'w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center',
                      onClick: () => P(-1),
                      title: 'Giorno precedente',
                      children: '←',
                    }),
                    e.jsx('button', {
                      type: 'button',
                      onClick: () => D(!0),
                      className:
                        'text-3xl font-bold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-lime-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800',
                      title: 'Clicca per aprire calendario',
                      children: d,
                    }),
                    e.jsx('button', {
                      type: 'button',
                      className:
                        'w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center',
                      onClick: () => P(1),
                      title: 'Giorno successivo',
                      children: '→',
                    }),
                  ],
                }),
              }),
              U &&
                e.jsx('div', {
                  className:
                    'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
                  children: e.jsxs('div', {
                    className: `${n.cardBg} ${n.border} rounded-2xl shadow-2xl p-8 max-w-2xl w-full`,
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center justify-between mb-6',
                        children: [
                          e.jsx('h3', {
                            className: `text-2xl font-bold ${n.text} flex items-center gap-2`,
                            children: '📅 Seleziona data',
                          }),
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => D(!1),
                            className:
                              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-2xl font-bold transition-colors',
                            title: 'Chiudi',
                            children: '✕',
                          }),
                        ],
                      }),
                      e.jsx(Be, {
                        currentDay: p,
                        onSelectDay: (t) => {
                          (u(t), D(!1));
                        },
                        T: n,
                      }),
                      e.jsxs('div', {
                        className: 'mt-6 grid grid-cols-3 gap-3',
                        children: [
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => {
                              (X(), D(!1));
                            },
                            className: `${n.btnPrimary} py-3 text-sm font-semibold flex items-center justify-center gap-2`,
                            children: '🏠 Oggi',
                          }),
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => {
                              (P(-1), D(!1));
                            },
                            className: `${n.btnGhost} py-3 text-sm font-medium`,
                            children: '← Ieri',
                          }),
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => {
                              (P(1), D(!1));
                            },
                            className: `${n.btnGhost} py-3 text-sm font-medium`,
                            children: 'Domani →',
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              e.jsx('div', {
                className: 'md:hidden mb-4',
                children: e.jsxs('div', {
                  className: 'flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1',
                  children: [
                    e.jsx('button', {
                      onClick: () => ee('overview'),
                      className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${K === 'overview' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                      children: '📊 Panoramica',
                    }),
                    e.jsx('button', {
                      onClick: () => ee('detail'),
                      className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${K === 'detail' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                      children: '🔍 Dettaglio',
                    }),
                  ],
                }),
              }),
              K === 'overview' &&
                e.jsx('div', {
                  className: 'md:hidden mb-6',
                  children: e.jsx('div', {
                    className: 'grid grid-cols-2 gap-3',
                    children: m.map((t) => {
                      const s = S.filter((v) => {
                          const $ = v,
                            N = w(v, i.slotMinutes);
                          return !z.get(t.id)?.some((b) => {
                            const M = new Date(b.start),
                              R = w(new Date(b.start), b.duration);
                            return W($, N, M, R);
                          });
                        }).length,
                        o = S.length,
                        r = o - s,
                        l = s / o;
                      return e.jsxs(
                        'div',
                        {
                          className: `${n.cardBg} ${n.border} rounded-xl p-4 shadow-md`,
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-2 mb-3',
                              children: [
                                e.jsx('span', {
                                  className:
                                    'w-8 h-8 rounded-full bg-blue-400 dark:bg-emerald-400 text-white flex items-center justify-center font-bold text-sm shadow',
                                  children: t.name[0],
                                }),
                                e.jsxs('div', {
                                  className: 'flex-1',
                                  children: [
                                    e.jsx('div', {
                                      className: 'font-semibold text-sm',
                                      children: t.name,
                                    }),
                                    t.hasHeating &&
                                      e.jsx('div', {
                                        className: 'text-xs text-orange-500 dark:text-orange-400',
                                        children: '🔥 Riscaldato',
                                      }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'mb-2',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex justify-between text-xs mb-1',
                                  children: [
                                    e.jsxs('span', {
                                      className: 'text-green-600 dark:text-green-400',
                                      children: ['Liberi: ', s],
                                    }),
                                    e.jsxs('span', {
                                      className: 'text-red-600 dark:text-red-400',
                                      children: ['Occupati: ', r],
                                    }),
                                  ],
                                }),
                                e.jsx('div', {
                                  className: 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2',
                                  children: e.jsx('div', {
                                    className: `h-2 rounded-full transition-all duration-300 ${l > 0.7 ? 'bg-green-500' : l > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`,
                                    style: { width: `${l * 100}%` },
                                  }),
                                }),
                              ],
                            }),
                            e.jsx('button', {
                              onClick: () => {
                                (ce(t.id), ee('detail'));
                              },
                              className: `w-full ${n.btnGhost} py-2 text-xs font-semibold`,
                              children: 'Visualizza dettaglio',
                            }),
                          ],
                        },
                        t.id
                      );
                    }),
                  }),
                }),
              K === 'detail' &&
                e.jsxs('div', {
                  className: 'md:hidden mb-6',
                  children: [
                    e.jsx('div', {
                      className: 'mb-4',
                      children: e.jsxs('select', {
                        value: te,
                        onChange: (t) => ce(t.target.value),
                        className: `w-full ${n.input} text-sm`,
                        children: [
                          e.jsx('option', { value: 'all', children: 'Tutti i campi' }),
                          m.map((t) => e.jsx('option', { value: t.id, children: t.name }, t.id)),
                        ],
                      }),
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children: S.map((t) => {
                        const s = t.toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                          r = w(t, i.slotMinutes).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        return e.jsxs(
                          'div',
                          {
                            className: `${n.cardBg} ${n.border} rounded-lg p-3 shadow-sm`,
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center justify-between mb-2',
                                children: [
                                  e.jsxs('div', {
                                    className: 'font-semibold text-base',
                                    children: [s, ' - ', r],
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-500 dark:text-gray-400',
                                    children: t.toLocaleDateString('it-IT', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short',
                                    }),
                                  }),
                                ],
                              }),
                              e.jsx('div', {
                                className: 'grid grid-cols-2 gap-2',
                                children: m
                                  .filter((l) => te === 'all' || l.id === te)
                                  .map((l) => {
                                    const v = t,
                                      $ = w(t, i.slotMinutes),
                                      N = z.get(l.id)?.find((M) => {
                                        const R = new Date(M.start),
                                          ne = w(new Date(M.start), M.duration);
                                        return W(v, $, R, ne);
                                      }),
                                      f = !N,
                                      b = Z(l.id, t);
                                    return e.jsxs(
                                      'button',
                                      {
                                        onClick: () => (f ? me(l.id, t) : ue(N)),
                                        className: `p-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${f ? `${n.btnGhost} border-2 ${b ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'border-green-200 dark:border-green-700'}` : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer'}`,
                                        children: [
                                          e.jsxs('div', {
                                            className: 'flex items-center gap-1 justify-center',
                                            children: [
                                              e.jsx('span', {
                                                className: `w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${f ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`,
                                                children: l.name[0],
                                              }),
                                              e.jsx('span', { children: l.name }),
                                            ],
                                          }),
                                          b &&
                                            f &&
                                            e.jsx('div', {
                                              className:
                                                'text-xs text-yellow-600 dark:text-yellow-400 mt-1',
                                              children: '🏷️ Promo',
                                            }),
                                          !f &&
                                            N &&
                                            e.jsxs('div', {
                                              className: 'text-xs mt-1 truncate',
                                              children: [
                                                e.jsx('div', {
                                                  className: 'font-medium',
                                                  children: N.bookedByName || 'Occupato',
                                                }),
                                                e.jsx('div', {
                                                  className:
                                                    'text-gray-400 dark:text-gray-500 text-[10px]',
                                                  children: '👆 Clicca per dettagli',
                                                }),
                                              ],
                                            }),
                                        ],
                                      },
                                      l.id
                                    );
                                  }),
                              }),
                            ],
                          },
                          t.getTime()
                        );
                      }),
                    }),
                  ],
                }),
              e.jsx('div', {
                className: 'hidden md:block overflow-x-auto pb-4',
                children: e.jsxs('div', {
                  className: 'min-w-[720px] grid gap-2',
                  style: { gridTemplateColumns: `repeat(${m.length}, 1fr)` },
                  children: [
                    m.map((t) =>
                      e.jsx(
                        'div',
                        {
                          className: `px-2 py-3 text-base font-bold text-center rounded-xl shadow-md mb-2 ${n.cardBg} ${n.border}`,
                          children: e.jsxs('span', {
                            className: 'inline-flex items-center gap-2',
                            children: [
                              e.jsx('span', {
                                className:
                                  'w-7 h-7 rounded-full bg-blue-400 dark:bg-emerald-400 text-white flex items-center justify-center font-bold shadow',
                                children: t.name[0],
                              }),
                              e.jsxs('div', {
                                className: 'flex flex-col items-start',
                                children: [
                                  e.jsx('span', { children: t.name }),
                                  a.start &&
                                    Z(t.id, a.start) &&
                                    e.jsx('span', {
                                      className:
                                        'text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-0.5 rounded-full font-medium',
                                      children: '🏷️ Promo',
                                    }),
                                  t.hasHeating &&
                                    e.jsx('span', {
                                      className:
                                        'text-xs text-orange-500 dark:text-orange-400 font-medium',
                                      children: '🔥 Riscaldato',
                                    }),
                                ],
                              }),
                            ],
                          }),
                        },
                        `hdr_${t.id}`
                      )
                    ),
                    S.map((t, s) =>
                      e.jsx(
                        he.Fragment,
                        {
                          children: m.map((o) =>
                            e.jsx(
                              'div',
                              {
                                className: `px-0.5 py-0.5 ${n.cardBg} ${n.border} rounded-lg`,
                                children: je(o.id, t),
                              },
                              o.id + '_' + s
                            )
                          ),
                        },
                        t.getTime()
                      )
                    ),
                  ],
                }),
              }),
              e.jsx($e, {
                open: le,
                onClose: () => I(!1),
                title: j ? 'Modifica prenotazione' : 'Nuova prenotazione',
                T: n,
                children: a.start
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl p-6 shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600',
                      children: [
                        e.jsxs('div', {
                          className: 'grid sm:grid-cols-2 gap-4',
                          children: [
                            e.jsxs('div', {
                              className: 'flex flex-col gap-1',
                              children: [
                                e.jsx('label', {
                                  className: `text-xs font-semibold ${n.subtext}`,
                                  children: 'Campo',
                                }),
                                e.jsx('select', {
                                  value: a.courtId,
                                  onChange: (t) => C((s) => ({ ...s, courtId: t.target.value })),
                                  className: n.input,
                                  children: c.courts.map((t) =>
                                    e.jsx('option', { value: t.id, children: t.name }, t.id)
                                  ),
                                }),
                                a.courtId &&
                                  Z(a.courtId, a.start) &&
                                  e.jsx('div', {
                                    className:
                                      'text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-lg font-medium inline-flex items-center gap-1 w-fit',
                                    children: '🏷️ Fascia Promo attiva',
                                  }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex flex-col gap-1',
                              children: [
                                e.jsx('label', {
                                  className: `text-xs font-semibold ${n.subtext}`,
                                  children: 'Inizio',
                                }),
                                e.jsx('input', {
                                  type: 'time',
                                  value: `${String(new Date(a.start).getHours()).padStart(2, '0')}:${String(new Date(a.start).getMinutes()).padStart(2, '0')}`,
                                  onChange: (t) => {
                                    const [s, o] = t.target.value.split(':').map(Number),
                                      r = new Date(a.start);
                                    (r.setHours(s, o, 0, 0),
                                      C((l) => ({ ...l, start: O(r, i.slotMinutes) })));
                                  },
                                  className: n.input,
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex flex-col gap-1',
                              children: [
                                e.jsx('label', {
                                  className: `text-xs font-semibold ${n.subtext}`,
                                  children: 'Durata',
                                }),
                                e.jsx('select', {
                                  value: a.duration,
                                  onChange: (t) =>
                                    C((s) => ({ ...s, duration: Number(t.target.value) })),
                                  className: n.input,
                                  children: (i.defaultDurations || [60, 90, 120]).map((t) =>
                                    e.jsxs('option', { value: t, children: [t, ' minuti'] }, t)
                                  ),
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'sm:col-span-2',
                              children: [
                                e.jsxs('div', {
                                  className:
                                    'flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3',
                                  children: [
                                    i.addons?.lightingEnabled &&
                                      e.jsxs('label', {
                                        className: 'inline-flex items-center gap-2 cursor-pointer',
                                        children: [
                                          e.jsx('input', {
                                            type: 'checkbox',
                                            checked: a.useLighting,
                                            onChange: (t) =>
                                              C((s) => ({ ...s, useLighting: t.target.checked })),
                                          }),
                                          e.jsx('span', {
                                            className:
                                              'text-sm font-medium text-blue-600 dark:text-emerald-400',
                                            children: 'Illuminazione',
                                          }),
                                          e.jsxs('span', {
                                            className: `text-xs ${n.subtext}`,
                                            children: ['+', T(i.addons.lightingFee || 0)],
                                          }),
                                        ],
                                      }),
                                    i.addons?.heatingEnabled &&
                                      m.find((s) => s.id === a.courtId)?.hasHeating &&
                                      e.jsxs('label', {
                                        className: 'inline-flex items-center gap-2 cursor-pointer',
                                        children: [
                                          e.jsx('input', {
                                            type: 'checkbox',
                                            checked: a.useHeating,
                                            onChange: (s) =>
                                              C((o) => ({ ...o, useHeating: s.target.checked })),
                                          }),
                                          e.jsx('span', {
                                            className:
                                              'text-sm font-medium text-purple-600 dark:text-lime-400',
                                            children: 'Riscaldamento',
                                          }),
                                          e.jsxs('span', {
                                            className: `text-xs ${n.subtext}`,
                                            children: ['+', T(i.addons.heatingFee || 0)],
                                          }),
                                        ],
                                      }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className:
                                    'font-bold text-lg text-blue-700 dark:text-emerald-400 text-center sm:text-left',
                                  children: [
                                    'Totale: ',
                                    B == null ? '—' : T(B),
                                    B != null &&
                                      e.jsxs('span', {
                                        className: `ml-3 text-xs ${n.subtext}`,
                                        children: ['/ giocatore: ', Me(B / 4)],
                                      }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className:
                                    'text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2',
                                  children: '👥 Giocatori',
                                }),
                                e.jsx('div', {
                                  className: 'grid grid-cols-2 gap-2',
                                  children: [
                                    ['p1Name', 'Giocatore 1'],
                                    ['p2Name', 'Giocatore 2'],
                                    ['p3Name', 'Giocatore 3'],
                                    ['p4Name', 'Giocatore 4'],
                                  ].map(([t, s]) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        children: [
                                          e.jsx('label', {
                                            className: `text-xs font-medium ${n.subtext} mb-1 block`,
                                            children: s,
                                          }),
                                          e.jsx('input', {
                                            list: 'players-list',
                                            value: a[t],
                                            onChange: (o) =>
                                              C((r) => ({ ...r, [t]: o.target.value })),
                                            className: `${n.input} text-sm py-2`,
                                            placeholder: 'Nome giocatore',
                                          }),
                                        ],
                                      },
                                      t
                                    )
                                  ),
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'space-y-3',
                              children: [
                                e.jsxs('div', {
                                  children: [
                                    e.jsx('label', {
                                      className: `text-xs font-semibold ${n.subtext} mb-1 block`,
                                      children: 'Prenotazione a nome di',
                                    }),
                                    e.jsx('input', {
                                      value: a.bookedBy,
                                      onChange: (t) =>
                                        C((s) => ({ ...s, bookedBy: t.target.value })),
                                      className: `${n.input} text-sm py-2`,
                                      placeholder: 'Es. Andrea Paris',
                                    }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  children: [
                                    e.jsx('label', {
                                      className: `text-xs font-semibold ${n.subtext} mb-1 block`,
                                      children: 'Note',
                                    }),
                                    e.jsx('input', {
                                      value: a.note,
                                      onChange: (t) => C((s) => ({ ...s, note: t.target.value })),
                                      className: `${n.input} text-sm py-2`,
                                      placeholder: 'Es. Lezioni, torneo, ecc.',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsx('datalist', {
                              id: 'players-list',
                              children: ie.map((t) => e.jsx('option', { value: t.name }, t.id)),
                            }),
                            e.jsxs('div', {
                              className: 'hidden md:flex gap-2 pt-2',
                              children: [
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: se,
                                  className: `${n.btnPrimary} py-2`,
                                  children: j ? 'Aggiorna prenotazione' : 'Conferma prenotazione',
                                }),
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => I(!1),
                                  className: `${n.btnGhost} py-2`,
                                  children: 'Annulla',
                                }),
                                j &&
                                  e.jsx('button', {
                                    type: 'button',
                                    onClick: () => ae(j),
                                    className:
                                      'bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition',
                                    children: 'Elimina prenotazione',
                                  }),
                              ],
                            }),
                            e.jsx('div', { className: 'h-16 md:hidden' }),
                          ],
                        }),
                        e.jsx('div', {
                          className:
                            'md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 p-4 z-50',
                          children: e.jsxs('div', {
                            className: 'flex gap-2 max-w-md mx-auto',
                            children: [
                              e.jsx('button', {
                                type: 'button',
                                onClick: se,
                                className: `flex-1 ${n.btnPrimary} py-3 text-sm font-semibold`,
                                children: j ? '✓ Aggiorna' : '✓ Conferma',
                              }),
                              e.jsx('button', {
                                type: 'button',
                                onClick: () => I(!1),
                                className:
                                  'flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-4 py-3 rounded-lg text-sm',
                                children: 'Annulla',
                              }),
                              j &&
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => ae(j),
                                  className:
                                    'bg-red-500 text-white font-semibold px-4 py-3 rounded-lg text-sm shadow-lg',
                                  children: '🗑️',
                                }),
                            ],
                          }),
                        }),
                      ],
                    })
                  : e.jsx('div', {
                      className: `text-center py-8 text-lg ${n.subtext}`,
                      children: 'Seleziona uno slot libero nella griglia.',
                    }),
              }),
              le &&
                a.start &&
                e.jsxs(e.Fragment, {
                  children: [
                    e.jsxs('div', {
                      className:
                        'fixed bottom-24 left-4 right-4 z-[99999] flex gap-3 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700',
                      children: [
                        e.jsx('button', {
                          type: 'button',
                          onClick: () => I(!1),
                          className:
                            'flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105',
                          children: '❌ Annulla',
                        }),
                        e.jsxs('button', {
                          type: 'button',
                          onClick: se,
                          className:
                            'flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105',
                          children: ['✅ ', j ? 'Aggiorna' : 'Conferma'],
                        }),
                      ],
                    }),
                    j &&
                      e.jsx('div', {
                        className:
                          'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[99999] md:hidden',
                        children: e.jsx('button', {
                          type: 'button',
                          onClick: () => ae(j),
                          className:
                            'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold px-8 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 border border-rose-300',
                          children: '🗑️ Elimina',
                        }),
                      }),
                  ],
                }),
            ],
          })
        : e.jsx('div', {
            className: 'flex items-center justify-center py-12',
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', { className: 'text-4xl mb-4', children: '⏳' }),
                e.jsx('h3', {
                  className: 'text-lg font-medium mb-2 text-gray-900',
                  children: 'Caricamento...',
                }),
                e.jsx('p', {
                  className: 'text-gray-500',
                  children: 'Caricamento configurazione campi in corso...',
                }),
              ],
            }),
          }),
    })
  );
}
function Oe() {
  const c = Ce(),
    { state: x, setState: g, derived: k, playersById: n, loading: i } = we(),
    { clubMode: p } = ke(),
    u = he.useMemo(() => De(), []);
  return i || !x
    ? e.jsxs('div', {
        className: `text-center py-12 ${u.cardBg} ${u.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-4xl mb-4', children: '⏳' }),
          e.jsx('h3', {
            className: `text-lg font-medium mb-2 ${u.text}`,
            children: 'Caricamento...',
          }),
          e.jsx('p', {
            className: `${u.subtext}`,
            children: 'Caricamento configurazione campi in corso...',
          }),
        ],
      })
    : p
      ? e.jsx(Pe, { T: u, state: x, setState: g, players: k.players, playersById: n })
      : e.jsxs('div', {
          className: `text-center py-12 ${u.cardBg} ${u.border} rounded-xl m-4`,
          children: [
            e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
            e.jsx('h3', {
              className: `text-xl font-bold mb-2 ${u.text}`,
              children: 'Modalità Club Richiesta',
            }),
            e.jsx('p', {
              className: `${u.subtext} mb-4`,
              children:
                'Per accedere alla gestione campi, devi prima sbloccare la modalità club nella sezione Extra.',
            }),
            e.jsx('button', {
              onClick: () => c('/extra'),
              className: `${u.btnPrimary} px-6 py-3`,
              children: 'Vai a Extra per sbloccare',
            }),
          ],
        });
}
export { Oe as default };
