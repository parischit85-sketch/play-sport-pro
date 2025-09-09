import { u as Me, j as e, f as Ie, k as Be, t as ze } from './index-mfcpc59i-PpofX80g.js';
import { r as g, b as ye, c as Ee } from './router-mfcpc59i-D7zFZhMN.js';
import { S as Pe } from './Section-mfcpc59i-BMO9MkVE.js';
import { M as Le } from './Modal-mfcpc59i-CwYeunog.js';
import { a as Z, e as Fe } from './format-mfcpc59i-DAEZv7Mi.js';
import { g as le, c as be, i as O } from './pricing-mfcpc59i-DMaWA4wL.js';
import {
  loadPublicBookings as He,
  subscribeToPublicBookings as Ae,
  createCloudBooking as Ge,
  updateCloudBooking as fe,
  cancelCloudBooking as Re,
  deleteCloudBooking as Oe,
} from './cloud-bookings-mfcpc59i-cWaUvgoz.js';
import './vendor-mfcpc59i-D3F3s8fL.js';
import './firebase-mfcpc59i-BteSMG94.js';
function Ye(x, b) {
  return (
    x.getFullYear() === b.getFullYear() &&
    x.getMonth() === b.getMonth() &&
    x.getDate() === b.getDate()
  );
}
function Y(x, b = 30) {
  const h = new Date(x);
  h.setSeconds(0, 0);
  const w = h.getMinutes(),
    n = Math.floor(w / b) * b;
  return (h.setMinutes(n), h);
}
function v(x, b) {
  const h = new Date(x);
  return (h.setMinutes(h.getMinutes() + b), h);
}
function ee(x, b, h, w) {
  return x < w && h < b;
}
function Ve({ currentDay: x, onSelectDay: b, T: h }) {
  const [w, n] = g.useState(new Date(x.getFullYear(), x.getMonth(), 1)),
    C = new Date();
  C.setHours(0, 0, 0, 0);
  const i = w.getFullYear(),
    c = w.getMonth(),
    P = new Date(i, c, 1),
    L = new Date(P);
  L.setDate(L.getDate() - P.getDay() + 1);
  const $ = new Date(L);
  $.setDate($.getDate() + 41);
  const m = [];
  for (let d = new Date(L); d <= $; d.setDate(d.getDate() + 1)) m.push(new Date(d));
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
    T = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    q = () => {
      n(new Date(i, c - 1, 1));
    },
    _ = () => {
      n(new Date(i, c + 1, 1));
    },
    te = (d) => d.getTime() === C.getTime(),
    F = (d) => d.getTime() === x.getTime(),
    U = (d) => d.getMonth() === c,
    J = (d) => d < C;
  return e.jsxs('div', {
    className: 'w-full',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between mb-4',
        children: [
          e.jsx('button', {
            type: 'button',
            onClick: q,
            className:
              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors',
            children: '←',
          }),
          e.jsxs('h4', { className: `text-xl font-bold ${h.text}`, children: [V[c], ' ', i] }),
          e.jsx('button', {
            type: 'button',
            onClick: _,
            className:
              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors',
            children: '→',
          }),
        ],
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1 mb-2',
        children: T.map((d) =>
          e.jsx(
            'div',
            { className: `text-center text-sm font-semibold ${h.subtext} py-2`, children: d },
            d
          )
        ),
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1',
        children: m.map((d, R) => {
          const de = d.getDate(),
            ae = U(d),
            K = te(d),
            H = F(d),
            z = J(d);
          return e.jsx(
            'button',
            {
              type: 'button',
              onClick: () => b(d),
              disabled: z,
              className: `
                h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
                ${H ? 'bg-blue-500 text-white shadow-lg dark:bg-emerald-500' : K ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-emerald-100 dark:text-emerald-700 dark:border-emerald-300' : ae ? 'hover:bg-gray-200 dark:hover:bg-gray-700 ' + h.text : 'text-gray-400 dark:text-gray-600'}
                ${z ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `,
              children: de,
            },
            R
          );
        }),
      }),
    ],
  });
}
function Te({ state: x, setState: b, players: h, playersById: w, T: n }) {
  const { user: C } = Me(),
    i = x?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    [c, P] = g.useState(() => Y(new Date(), i.slotMinutes)),
    [L, $] = g.useState(!1),
    m = Array.isArray(x?.courts) ? x.courts : [],
    [V, T] = g.useState([]),
    q = (t) => {
      try {
        const a = new Date(`${t.date}T${String(t.time).padStart(5, '0')}:00`).toISOString();
        return {
          id: t.id,
          courtId: t.courtId,
          start: a,
          duration: Number(t.duration) || 60,
          players: [],
          playerNames: Array.isArray(t.players) ? t.players : [],
          guestNames: [],
          price: t.price ?? null,
          note: t.notes || '',
          bookedByName: t.bookedBy || '',
          addons: { lighting: !!t.lighting, heating: !!t.heating },
          status: t.status === 'confirmed' ? 'booked' : t.status || 'cancelled',
        };
      } catch {
        return null;
      }
    };
  g.useEffect(() => {
    let t;
    return (
      (async () => {
        try {
          const r = ((await He()) || [])
            .filter((l) => l.status === 'confirmed')
            .map(q)
            .filter(Boolean);
          T(r);
        } catch {}
        try {
          t = Ae((o) => {
            const r = (o || [])
              .filter((l) => l.status === 'confirmed')
              .map(q)
              .filter(Boolean);
            T(r);
          });
        } catch {}
      })(),
      () => {
        typeof t == 'function' && t();
      }
    );
  }, []);
  const _ = g.useMemo(() => {
      const t = Array.isArray(i?.defaultDurations) ? i.defaultDurations : [];
      return t.includes(90) ? 90 : t.length > 0 ? t[0] : 90;
    }, [i]),
    te = () => P(Y(new Date(), i.slotMinutes)),
    F = (t) =>
      P((a) => {
        const o = new Date(a);
        return (o.setDate(o.getDate() + t), o);
      }),
    U = new Date(c);
  U.setHours(i.dayStartHour, 0, 0, 0);
  const J = new Date(c);
  J.setHours(i.dayEndHour, 0, 0, 0);
  const d = [],
    R = new Set();
  if (
    (m.forEach((t) => {
      t.timeSlots &&
        t.timeSlots.length > 0 &&
        t.timeSlots.forEach((a) => {
          if (a.days?.includes(c.getDay())) {
            const o = parseInt(a.from.split(':')[0]) * 60 + parseInt(a.from.split(':')[1]),
              r = parseInt(a.to.split(':')[0]) * 60 + parseInt(a.to.split(':')[1]);
            for (let l = o; l < r; l += i.slotMinutes) R.add(l);
          }
        });
    }),
    R.size > 0)
  )
    Array.from(R)
      .sort((a, o) => a - o)
      .forEach((a) => {
        const o = new Date(c);
        (o.setHours(Math.floor(a / 60), a % 60, 0, 0), d.push(o));
      });
  else for (let t = new Date(U); t < J; t = v(t, i.slotMinutes)) d.push(new Date(t));
  const ae = `${((t) => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(c))} - ${String(c.getDate()).padStart(2, '0')} ${new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(c)} ${c.getFullYear()}`,
    K = g.useMemo(
      () =>
        (V || [])
          .filter((t) => t && t.status !== 'cancelled')
          .filter((t) => Ye(new Date(t.start), c))
          .sort((t, a) => new Date(t.start) - new Date(a.start)),
      [V, c]
    ),
    H = g.useMemo(() => {
      const t = new Map(m.map((a) => [a.id, []]));
      for (const a of K) {
        const o = t.get(a.courtId) || [];
        (o.push(a), t.set(a.courtId, o));
      }
      return t;
    }, [K, m]),
    z = g.useMemo(
      () =>
        d.map((t) => {
          const a = m.map((o) => le(t, i, o.id, m).rate);
          return a.length > 0 ? Math.min(...a) : 0;
        }),
      [d, i, m]
    ),
    Q = g.useMemo(() => Math.min(...z), [z]),
    se = g.useMemo(() => Math.max(...z), [z]),
    Ne = (t) =>
      !isFinite(Q) || !isFinite(se) || Q === se ? 0.18 : 0.12 + ((t - Q) / (se - Q)) * 0.22,
    je = g.useMemo(
      () =>
        [...h].sort((t, a) => (t.name || '').localeCompare(a.name, 'it', { sensitivity: 'base' })),
      [h]
    ),
    ve = (t) => w?.[t]?.name || '',
    re = (t, a) => (a && le(a, i, t, m).isPromo) || !1,
    [ce, I] = g.useState(!1),
    [f, me] = g.useState(null),
    [W, ne] = g.useState('overview'),
    [oe, ue] = g.useState('all'),
    [s, k] = g.useState({
      courtId: '',
      start: null,
      duration: _,
      p1Name: '',
      p2Name: '',
      p3Name: '',
      p4Name: '',
      note: '',
      bookedBy: '',
      useLighting: !1,
      useHeating: !1,
    });
  function xe(t, a) {
    const o = Y(a, i.slotMinutes);
    (me(null),
      k({
        courtId: t,
        start: o,
        duration: _,
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
  function ge(t) {
    me(t.id);
    const a = new Date(t.start),
      o = (t.players || []).map(ve);
    let r = t.playerNames && t.playerNames.length ? t.playerNames : o;
    const l = t.bookedByName || '';
    (l && !r.includes(l) && (r = [l, ...r].slice(0, 4)),
      k({
        courtId: t.courtId,
        start: a,
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
  function we(t, a, o, r = null) {
    const l = new Date(a),
      y = v(a, o);
    return (H.get(t) || []).find((p) => {
      if (r && p.id === r) return !1;
      const N = new Date(p.start),
        j = v(new Date(p.start), p.duration);
      return ee(l, y, N, j);
    });
  }
  const he = g.useRef('');
  g.useEffect(() => {
    const t = s.p1Name?.trim() || '',
      a = he.current;
    ((!s.bookedBy?.trim() || s.bookedBy?.trim() === a) && t && k((o) => ({ ...o, bookedBy: t })),
      (he.current = t));
  }, [s.p1Name]);
  async function pe() {
    if (!s.courtId || !s.start) {
      alert('Seleziona campo e orario.');
      return;
    }
    const t = Y(s.start, i.slotMinutes);
    if (!O(t, s.courtId, m)) {
      alert('Orario fuori dalle fasce prenotabili per questo campo.');
      return;
    }
    if (t < new Date()) {
      alert('Non puoi prenotare nel passato.');
      return;
    }
    const o = f || null;
    if (we(s.courtId, t, s.duration, o)) {
      alert('Esiste già una prenotazione che si sovrappone su questo campo.');
      return;
    }
    const r = [s.p1Name, s.p2Name, s.p3Name, s.p4Name].map((u) => (u || '').trim()).filter(Boolean),
      l = (s.bookedBy && s.bookedBy.trim()) || r[0] || '',
      y = be(
        t,
        s.duration,
        i,
        { lighting: !!s.useLighting, heating: !!s.useHeating },
        s.courtId,
        m
      ),
      S = String(t.getFullYear()).padStart(4, '0'),
      p = String(t.getMonth() + 1).padStart(2, '0'),
      N = String(t.getDate()).padStart(2, '0'),
      j = String(t.getHours()).padStart(2, '0'),
      M = String(t.getMinutes()).padStart(2, '0'),
      D = `${S}-${p}-${N}`,
      B = `${j}:${M}`,
      A = m.find((u) => u.id === s.courtId)?.name || s.courtId;
    try {
      if (f)
        await fe(
          f,
          {
            courtId: s.courtId,
            courtName: A,
            date: D,
            time: B,
            duration: s.duration,
            lighting: !!s.useLighting,
            heating: !!s.useHeating,
            price: y,
            players: r,
            notes: s.note?.trim() || '',
            ...(l ? { bookedBy: l } : {}),
          },
          C
        );
      else {
        const u = await Ge(
          {
            courtId: s.courtId,
            courtName: A,
            date: D,
            time: B,
            duration: s.duration,
            lighting: !!s.useLighting,
            heating: !!s.useHeating,
            price: y,
            players: r,
            notes: s.note?.trim() || '',
          },
          C
        );
        l && (await fe(u.id, { bookedBy: l }, C));
      }
      I(!1);
    } catch {
      alert('Errore nel salvataggio della prenotazione.');
    }
  }
  async function ke(t) {
    if (confirm('Cancellare la prenotazione?'))
      try {
        await Re(t, C);
      } catch {
        alert('Errore durante la cancellazione.');
      }
  }
  async function ie(t) {
    if (confirm('Eliminare definitivamente la prenotazione?'))
      try {
        (await Oe(t), I(!1));
      } catch {
        alert("Errore durante l'eliminazione.");
      }
  }
  const Se = (t) => m.find((a) => a.id === t)?.name || t,
    De = 52;
  function Ce(t, a) {
    const o = H.get(t) || [],
      r = o.find((u) => {
        const G = new Date(u.start),
          X = v(new Date(u.start), u.duration);
        return ee(G, X, a, v(a, i.slotMinutes));
      }),
      l = O(a, t, m);
    if (!r && !l) {
      const u = a.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return e.jsx('div', {
        className:
          'relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium bg-gray-200 dark:bg-gray-800 opacity-50 cursor-not-allowed border-dashed border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center',
        title: 'Fuori fascia oraria per questo campo',
        children: e.jsx('span', {
          className: 'absolute inset-0 grid place-items-center text-[11px] opacity-80',
          children: u,
        }),
      });
    }
    const y = o.some((u) => new Date(u.start).getTime() === v(a, i.slotMinutes).getTime());
    if (!r && y) {
      const u = a.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return e.jsx('div', {
        className:
          'relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium bg-gray-300 dark:bg-gray-700 opacity-60 cursor-not-allowed border-dashed border-2 border-gray-400 flex items-center justify-center',
        title: 'Slot non prenotabile: precede una prenotazione',
        children: e.jsx('span', {
          className: 'absolute inset-0 grid place-items-center text-[11px] opacity-90',
          children: u,
        }),
      });
    }
    if (!r) {
      const u = le(a, i, t, m),
        G = Ne(u.rate),
        X = u.source === 'discounted' || u.isPromo,
        $e = a.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return e.jsxs('button', {
        type: 'button',
        onClick: () => xe(t, a),
        className: 'relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium',
        style: { background: `rgba(16,185,129,${G})`, borderColor: 'rgba(16,185,129,0.35)' },
        title: u.isPromo ? 'Fascia Promo' : X ? 'Fascia scontata' : 'Tariffa standard',
        children: [
          X &&
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
            children: $e,
          }),
        ],
      });
    }
    const S = new Date(r.start),
      p = v(S, r.duration);
    if (!(a.getTime() === S.getTime())) return e.jsx('div', { className: 'w-full h-9' });
    const M = Math.ceil((p - a) / (i.slotMinutes * 60 * 1e3)) * De - 6,
      D = (
        r.playerNames && r.playerNames.length
          ? r.playerNames
          : (r.players || []).map((u) => w?.[u]?.name || '—')
      )
        .concat(r.guestNames || [])
        .slice(0, 4),
      B = e.jsx('span', { className: 'text-2xl', children: '💡' }),
      A = e.jsx('span', { className: 'text-2xl', children: '🔥' });
    return e.jsx('div', {
      className: 'w-full h-9 relative',
      children: e.jsxs('button', {
        type: 'button',
        onClick: () => ge(r),
        className:
          'absolute left-0 right-0 px-2 py-2 ring-1 text-left text-[13px] font-semibold flex flex-col justify-center',
        style: {
          top: 0,
          height: `${M}px`,
          background: 'rgba(220, 38, 127, 0.35)',
          borderColor: 'rgba(220, 38, 127, 0.6)',
          borderRadius: '8px',
          overflow: 'hidden',
        },
        title: `${Se(r.courtId)} — ${S.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${r.duration}′) • clicca per modificare`,
        children: [
          e.jsxs('div', {
            className: 'absolute left-2 top-2 flex flex-row items-center gap-2 z-20',
            children: [r.addons?.lighting && B, r.addons?.heating && A],
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
                      S.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      ' - ',
                      p.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      ' • ',
                      Z(r.price),
                    ],
                  }),
                  e.jsx('span', {
                    className: 'flex items-center gap-2 mt-1',
                    children: e.jsx('div', {
                      className: 'text-[10px] font-medium opacity-80 flex flex-wrap gap-1',
                      children: D.map((u, G) =>
                        e.jsx(
                          'span',
                          {
                            className: 'bg-white/20 px-1 py-0.5 rounded text-[9px] font-medium',
                            children: u,
                          },
                          G
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
                children: r.bookedByName || D[0] || '—',
              }),
            ],
          }),
          r.note &&
            e.jsx('div', { className: 'text-[11px] opacity-70 mt-1 truncate', children: r.note }),
        ],
      }),
    });
  }
  const E = g.useMemo(
    () =>
      !s.start || !s.courtId
        ? null
        : be(
            new Date(s.start),
            s.duration,
            i,
            { lighting: s.useLighting, heating: s.useHeating },
            s.courtId,
            m
          ),
    [s.start, s.duration, s.courtId, s.useLighting, s.useHeating, i, m]
  );
  return (
    g.useMemo(() => (E == null ? null : E / 4), [E]),
    e.jsx(Pe, {
      title: 'Gestione Campi',
      T: n,
      children: x
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
                      onClick: () => F(-1),
                      title: 'Giorno precedente',
                      children: '←',
                    }),
                    e.jsx('button', {
                      type: 'button',
                      onClick: () => $(!0),
                      className:
                        'text-3xl font-bold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-lime-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800',
                      title: 'Clicca per aprire calendario',
                      children: ae,
                    }),
                    e.jsx('button', {
                      type: 'button',
                      className:
                        'w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center',
                      onClick: () => F(1),
                      title: 'Giorno successivo',
                      children: '→',
                    }),
                  ],
                }),
              }),
              L &&
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
                            onClick: () => $(!1),
                            className:
                              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-2xl font-bold transition-colors',
                            title: 'Chiudi',
                            children: '✕',
                          }),
                        ],
                      }),
                      e.jsx(Ve, {
                        currentDay: c,
                        onSelectDay: (t) => {
                          (P(t), $(!1));
                        },
                        T: n,
                      }),
                      e.jsxs('div', {
                        className: 'mt-6 grid grid-cols-3 gap-3',
                        children: [
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => {
                              (te(), $(!1));
                            },
                            className: `${n.btnPrimary} py-3 text-sm font-semibold flex items-center justify-center gap-2`,
                            children: '🏠 Oggi',
                          }),
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => {
                              (F(-1), $(!1));
                            },
                            className: `${n.btnGhost} py-3 text-sm font-medium`,
                            children: '← Ieri',
                          }),
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => {
                              (F(1), $(!1));
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
                      onClick: () => ne('overview'),
                      className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${W === 'overview' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                      children: '📊 Panoramica',
                    }),
                    e.jsx('button', {
                      onClick: () => ne('detail'),
                      className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${W === 'detail' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                      children: '🔍 Dettaglio',
                    }),
                  ],
                }),
              }),
              W === 'overview' &&
                e.jsx('div', {
                  className: 'md:hidden mb-6',
                  children: e.jsx('div', {
                    className: 'grid grid-cols-2 gap-3',
                    children: m.map((t) => {
                      const a = d.filter((y) => {
                          const S = y,
                            p = v(y, i.slotMinutes),
                            N = O(y, t.id, m),
                            j = H.get(t.id)?.some((M) => {
                              const D = new Date(M.start),
                                B = v(new Date(M.start), M.duration);
                              return ee(S, p, D, B);
                            });
                          return N && !j;
                        }).length,
                        o = d.filter((y) => O(y, t.id, m)).length || 0,
                        r = o - a,
                        l = a / o;
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
                                      children: ['Liberi: ', a],
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
                                (ue(t.id), ne('detail'));
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
              W === 'detail' &&
                e.jsxs('div', {
                  className: 'md:hidden mb-6',
                  children: [
                    e.jsx('div', {
                      className: 'mb-4',
                      children: e.jsxs('select', {
                        value: oe,
                        onChange: (t) => ue(t.target.value),
                        className: `w-full ${n.input} text-sm`,
                        children: [
                          e.jsx('option', { value: 'all', children: 'Tutti i campi' }),
                          m.map((t) => e.jsx('option', { value: t.id, children: t.name }, t.id)),
                        ],
                      }),
                    }),
                    e.jsx('div', {
                      className: 'space-y-2',
                      children: d.map((t) => {
                        const a = t.toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                          r = v(t, i.slotMinutes).toLocaleTimeString('it-IT', {
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
                                    children: [a, ' - ', r],
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
                                  .filter((l) => oe === 'all' || l.id === oe)
                                  .map((l) => {
                                    const y = t,
                                      S = v(t, i.slotMinutes),
                                      p = O(t, l.id, m),
                                      N = H.get(l.id)?.find((D) => {
                                        const B = new Date(D.start),
                                          A = v(new Date(D.start), D.duration);
                                        return ee(y, S, B, A);
                                      }),
                                      j = !N && p,
                                      M = re(l.id, t);
                                    return e.jsxs(
                                      'button',
                                      {
                                        onClick: () => {
                                          if (p) {
                                            if (j) return xe(l.id, t);
                                            if (N) return ge(N);
                                          }
                                        },
                                        className: `p-2 rounded-lg text-sm font-medium transition-all ${j ? `hover:scale-105 ${n.btnGhost} border-2 ${M ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'border-green-200 dark:border-green-700'}` : p ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-not-allowed'}`,
                                        children: [
                                          e.jsxs('div', {
                                            className: 'flex items-center gap-1 justify-center',
                                            children: [
                                              e.jsx('span', {
                                                className: `w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${j ? 'bg-green-500 text-white' : p ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'}`,
                                                children: l.name[0],
                                              }),
                                              e.jsx('span', { children: l.name }),
                                            ],
                                          }),
                                          M &&
                                            j &&
                                            e.jsx('div', {
                                              className:
                                                'text-xs text-yellow-600 dark:text-yellow-400 mt-1',
                                              children: '🏷️ Promo',
                                            }),
                                          !p &&
                                            e.jsx('div', {
                                              className:
                                                'text-xs mt-1 text-gray-500 dark:text-gray-400',
                                              children: 'Fuori fascia',
                                            }),
                                          p &&
                                            !j &&
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
                                  s.start &&
                                    re(t.id, s.start) &&
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
                    d.map((t, a) =>
                      e.jsx(
                        ye.Fragment,
                        {
                          children: m.map((o) =>
                            e.jsx(
                              'div',
                              {
                                className: `px-0.5 py-0.5 ${n.cardBg} ${n.border} rounded-lg`,
                                children: Ce(o.id, t),
                              },
                              o.id + '_' + a
                            )
                          ),
                        },
                        t.getTime()
                      )
                    ),
                  ],
                }),
              }),
              e.jsx(Le, {
                open: ce,
                onClose: () => I(!1),
                title: f ? 'Modifica prenotazione' : 'Nuova prenotazione',
                T: n,
                children: s.start
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
                                  value: s.courtId,
                                  onChange: (t) => k((a) => ({ ...a, courtId: t.target.value })),
                                  className: n.input,
                                  children: x.courts.map((t) =>
                                    e.jsx('option', { value: t.id, children: t.name }, t.id)
                                  ),
                                }),
                                s.courtId &&
                                  re(s.courtId, s.start) &&
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
                                  value: `${String(new Date(s.start).getHours()).padStart(2, '0')}:${String(new Date(s.start).getMinutes()).padStart(2, '0')}`,
                                  onChange: (t) => {
                                    const [a, o] = t.target.value.split(':').map(Number),
                                      r = new Date(s.start);
                                    (r.setHours(a, o, 0, 0),
                                      k((l) => ({ ...l, start: Y(r, i.slotMinutes) })));
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
                                  value: s.duration,
                                  onChange: (t) =>
                                    k((a) => ({ ...a, duration: Number(t.target.value) })),
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
                                            checked: s.useLighting,
                                            onChange: (t) =>
                                              k((a) => ({ ...a, useLighting: t.target.checked })),
                                          }),
                                          e.jsx('span', {
                                            className:
                                              'text-sm font-medium text-blue-600 dark:text-emerald-400',
                                            children: 'Illuminazione',
                                          }),
                                          e.jsxs('span', {
                                            className: `text-xs ${n.subtext}`,
                                            children: ['+', Z(i.addons.lightingFee || 0)],
                                          }),
                                        ],
                                      }),
                                    i.addons?.heatingEnabled &&
                                      m.find((a) => a.id === s.courtId)?.hasHeating &&
                                      e.jsxs('label', {
                                        className: 'inline-flex items-center gap-2 cursor-pointer',
                                        children: [
                                          e.jsx('input', {
                                            type: 'checkbox',
                                            checked: s.useHeating,
                                            onChange: (a) =>
                                              k((o) => ({ ...o, useHeating: a.target.checked })),
                                          }),
                                          e.jsx('span', {
                                            className:
                                              'text-sm font-medium text-purple-600 dark:text-lime-400',
                                            children: 'Riscaldamento',
                                          }),
                                          e.jsxs('span', {
                                            className: `text-xs ${n.subtext}`,
                                            children: ['+', Z(i.addons.heatingFee || 0)],
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
                                    E == null ? '—' : Z(E),
                                    E != null &&
                                      e.jsxs('span', {
                                        className: `ml-3 text-xs ${n.subtext}`,
                                        children: ['/ giocatore: ', Fe(E / 4)],
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
                                  ].map(([t, a]) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        children: [
                                          e.jsx('label', {
                                            className: `text-xs font-medium ${n.subtext} mb-1 block`,
                                            children: a,
                                          }),
                                          e.jsx('input', {
                                            list: 'players-list',
                                            value: s[t],
                                            onChange: (o) =>
                                              k((r) => ({ ...r, [t]: o.target.value })),
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
                                      value: s.bookedBy,
                                      onChange: (t) =>
                                        k((a) => ({ ...a, bookedBy: t.target.value })),
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
                                      value: s.note,
                                      onChange: (t) => k((a) => ({ ...a, note: t.target.value })),
                                      className: `${n.input} text-sm py-2`,
                                      placeholder: 'Es. Lezioni, torneo, ecc.',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsx('datalist', {
                              id: 'players-list',
                              children: je.map((t) => e.jsx('option', { value: t.name }, t.id)),
                            }),
                            e.jsxs('div', {
                              className: 'hidden md:flex gap-2 pt-2',
                              children: [
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: pe,
                                  className: `${n.btnPrimary} py-2`,
                                  children: f ? 'Aggiorna prenotazione' : 'Conferma prenotazione',
                                }),
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => I(!1),
                                  className: `${n.btnGhost} py-2`,
                                  children: 'Annulla',
                                }),
                                f &&
                                  e.jsx('button', {
                                    type: 'button',
                                    onClick: () => ie(f),
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
                                onClick: pe,
                                className: `flex-1 ${n.btnPrimary} py-3 text-sm font-semibold`,
                                children: f ? '✓ Aggiorna' : '✓ Conferma',
                              }),
                              e.jsx('button', {
                                type: 'button',
                                onClick: () => I(!1),
                                className:
                                  'flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-4 py-3 rounded-lg text-sm',
                                children: 'Annulla',
                              }),
                              f &&
                                e.jsx('button', {
                                  type: 'button',
                                  onClick: () => ie(f),
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
              ce &&
                s.start &&
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
                        f &&
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => ie(f),
                            className:
                              'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold px-8 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 border border-rose-300',
                            children: '🗑️ Elimina',
                          }),
                      ],
                    }),
                    f &&
                      e.jsx('div', {
                        className:
                          'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[99999] md:hidden',
                        children: e.jsx('button', {
                          type: 'button',
                          onClick: () => ke(f),
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
function et() {
  const x = Ee(),
    { state: b, setState: h, derived: w, playersById: n, loading: C } = Ie(),
    { clubMode: i } = Be(),
    c = ye.useMemo(() => ze(), []);
  return C || !b
    ? e.jsxs('div', {
        className: `text-center py-12 ${c.cardBg} ${c.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-4xl mb-4', children: '⏳' }),
          e.jsx('h3', {
            className: `text-lg font-medium mb-2 ${c.text}`,
            children: 'Caricamento...',
          }),
          e.jsx('p', {
            className: `${c.subtext}`,
            children: 'Caricamento configurazione campi in corso...',
          }),
        ],
      })
    : i
      ? e.jsx(Te, { T: c, state: b, setState: h, players: w.players, playersById: n })
      : e.jsxs('div', {
          className: `text-center py-12 ${c.cardBg} ${c.border} rounded-xl m-4`,
          children: [
            e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
            e.jsx('h3', {
              className: `text-xl font-bold mb-2 ${c.text}`,
              children: 'Modalità Club Richiesta',
            }),
            e.jsx('p', {
              className: `${c.subtext} mb-4`,
              children:
                'Per accedere alla gestione campi, devi prima sbloccare la modalità club nella sezione Extra.',
            }),
            e.jsx('button', {
              onClick: () => x('/extra'),
              className: `${c.btnPrimary} px-6 py-3`,
              children: 'Vai a Extra per sbloccare',
            }),
          ],
        });
}
export { et as default };
