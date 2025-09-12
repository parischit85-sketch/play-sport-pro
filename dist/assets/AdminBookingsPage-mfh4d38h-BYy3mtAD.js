import { u as We, j as e, f as Je, k as Ke, t as Qe } from './index-mfh4d38h-CPKWh84w.js';
import { r as x, b as Be, c as Xe } from './router-mfh4d38h-D14HHbEI.js';
import { S as Ze } from './Section-mfh4d38h-Df1Gzqw4.js';
import { M as et } from './Modal-mfh4d38h-xCnxAVWo.js';
import { a as ge, e as tt } from './format-mfh4d38h-DAEZv7Mi.js';
import { g as Ne, c as ze, i as W } from './pricing-mfh4d38h-DMaWA4wL.js';
import { u as rt } from './useUnifiedBookings-mfh4d38h-CC_USPZv.js';
import { P as at } from './playerTypes-mfh4d38h-CIm-hM8a.js';
import './vendor-mfh4d38h-D3F3s8fL.js';
import './firebase-mfh4d38h-X_I_guKF.js';
import './unified-booking-service-mfh4d38h-1xV4n-cy.js';
function ot(h, M) {
  return (
    h.getFullYear() === M.getFullYear() &&
    h.getMonth() === M.getMonth() &&
    h.getDate() === M.getDate()
  );
}
function J(h, M = 30) {
  const v = new Date(h);
  v.setSeconds(0, 0);
  const P = v.getMinutes(),
    c = Math.floor(P / M) * M;
  return (v.setMinutes(c), v);
}
function k(h, M) {
  const v = new Date(h);
  return (v.setMinutes(v.getMinutes() + M), v);
}
function K(h, M, v, P) {
  return h < P && v < M;
}
function nt({ currentDay: h, onSelectDay: M, T: v }) {
  const [P, c] = x.useState(new Date(h.getFullYear(), h.getMonth(), 1)),
    Y = new Date();
  Y.setHours(0, 0, 0, 0);
  const R = P.getFullYear(),
    N = P.getMonth(),
    oe = new Date(R, N, 1),
    H = new Date(oe);
  H.setDate(H.getDate() - oe.getDay() + 1);
  const X = new Date(H);
  X.setDate(X.getDate() + 41);
  const l = [];
  for (let b = new Date(H); b <= X; b.setDate(b.getDate() + 1)) l.push(new Date(b));
  const E = [
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
    Z = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
    me = () => {
      c(new Date(R, N - 1, 1));
    },
    U = () => {
      c(new Date(R, N + 1, 1));
    },
    u = (b) => b.getTime() === Y.getTime(),
    O = (b) => b.getTime() === h.getTime(),
    q = (b) => b.getMonth() === N,
    ne = (b) => b < Y;
  return e.jsxs('div', {
    className: 'w-full',
    children: [
      e.jsxs('div', {
        className: 'flex items-center justify-between mb-4',
        children: [
          e.jsx('button', {
            type: 'button',
            onClick: me,
            className:
              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors',
            children: '←',
          }),
          e.jsxs('h4', { className: `text-xl font-bold ${v.text}`, children: [E[N], ' ', R] }),
          e.jsx('button', {
            type: 'button',
            onClick: U,
            className:
              'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-xl font-bold transition-colors',
            children: '→',
          }),
        ],
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1 mb-2',
        children: Z.map((b) =>
          e.jsx(
            'div',
            { className: `text-center text-sm font-semibold ${v.subtext} py-2`, children: b },
            b
          )
        ),
      }),
      e.jsx('div', {
        className: 'grid grid-cols-7 gap-1',
        children: l.map((b, Q) => {
          const se = b.getDate(),
            ie = q(b),
            F = u(b),
            ee = O(b),
            xe = ne(b);
          return e.jsx(
            'button',
            {
              type: 'button',
              onClick: () => M(b),
              disabled: xe,
              className: `
                h-12 w-full rounded-lg text-sm font-medium transition-all duration-200
                ${ee ? 'bg-blue-500 text-white shadow-lg dark:bg-emerald-500' : F ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-emerald-100 dark:text-emerald-700 dark:border-emerald-300' : ie ? 'hover:bg-gray-200 dark:hover:bg-gray-700 ' + v.text : 'text-gray-400 dark:text-gray-600'}
                ${xe ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `,
              children: se,
            },
            Q
          );
        }),
      }),
    ],
  });
}
function st({ state: h, setState: M, players: v, playersById: P, T: c }) {
  const { user: Y } = We(),
    {
      bookings: R,
      refresh: N,
      createBooking: oe,
      updateBooking: H,
      deleteBooking: X,
    } = rt({ autoLoadUser: !1, autoLoadLessons: !0, enableRealtime: !0 }),
    l = h?.bookingConfig || {
      slotMinutes: 30,
      dayStartHour: 8,
      dayEndHour: 23,
      defaultDurations: [60, 90, 120],
      addons: {},
    },
    [E, Z] = x.useState(() => J(new Date(), l.slotMinutes)),
    [me, U] = x.useState(!1),
    u = Array.isArray(h?.courts) ? h.courts : [],
    O = x.useMemo(
      () =>
        (h.players || []).filter(
          (r) => r.category === at.INSTRUCTOR && r.instructorData?.isInstructor
        ),
      [h.players]
    ),
    q = x.useMemo(
      () =>
        (R || [])
          .filter((t) => t.status === 'confirmed')
          .map((t) => {
            try {
              const r = new Date(`${t.date}T${String(t.time).padStart(5, '0')}:00`).toISOString();
              return {
                id: t.id,
                courtId: t.courtId,
                start: r,
                duration: Number(t.duration) || 60,
                players: [],
                playerNames: Array.isArray(t.players) ? t.players : [],
                guestNames: [],
                price: t.price ?? null,
                note: t.notes || '',
                notes: t.notes || '',
                bookedByName: t.bookedBy || '',
                addons: { lighting: !!t.lighting, heating: !!t.heating },
                status: 'booked',
                instructorId: t.instructorId,
                isLessonBooking: t.isLessonBooking || !1,
                color: t.color,
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean),
      [R]
    ),
    ne = x.useMemo(() => {
      const t = Array.isArray(l?.defaultDurations) ? l.defaultDurations : [];
      return t.includes(90) ? 90 : t.length > 0 ? t[0] : 90;
    }, [l]),
    b = () => Z(J(new Date(), l.slotMinutes)),
    Q = (t) =>
      Z((r) => {
        const n = new Date(r);
        return (n.setDate(n.getDate() + t), n);
      }),
    se = new Date(E);
  se.setHours(l.dayStartHour, 0, 0, 0);
  const ie = new Date(E);
  ie.setHours(l.dayEndHour, 0, 0, 0);
  const F = [],
    ee = new Set();
  if (
    (u.forEach((t) => {
      t.timeSlots &&
        t.timeSlots.length > 0 &&
        t.timeSlots.forEach((r) => {
          if (r.days?.includes(E.getDay())) {
            const n = parseInt(r.from.split(':')[0]) * 60 + parseInt(r.from.split(':')[1]),
              o = parseInt(r.to.split(':')[0]) * 60 + parseInt(r.to.split(':')[1]);
            for (let i = n; i < o; i += l.slotMinutes) ee.add(i);
          }
        });
    }),
    ee.size > 0)
  )
    Array.from(ee)
      .sort((r, n) => r - n)
      .forEach((r) => {
        const n = new Date(E);
        (n.setHours(Math.floor(r / 60), r % 60, 0, 0), F.push(n));
      });
  else for (let t = new Date(se); t < ie; t = k(t, l.slotMinutes)) F.push(new Date(t));
  const Ee = `${((t) => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(E))} - ${String(E.getDate()).padStart(2, '0')} ${new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(E)} ${E.getFullYear()}`,
    we = x.useMemo(
      () =>
        (q || [])
          .filter((t) => t && t.status !== 'cancelled')
          .filter((t) => ot(new Date(t.start), E))
          .sort((t, r) => new Date(t.start) - new Date(r.start)),
      [q, E]
    ),
    te = x.useMemo(() => {
      const t = new Map(u.map((r) => [r.id, []]));
      for (const r of we) {
        const n = t.get(r.courtId) || [];
        (n.push(r), t.set(r.courtId, n));
      }
      return t;
    }, [we, u]),
    le = x.useMemo(
      () =>
        F.map((t) => {
          const r = u.map((n) => Ne(t, l, n.id, u).rate);
          return r.length > 0 ? Math.min(...r) : 0;
        }),
      [F, l, u]
    ),
    de = x.useMemo(() => Math.min(...le), [le]),
    be = x.useMemo(() => Math.max(...le), [le]),
    Le = (t) =>
      !isFinite(de) || !isFinite(be) || de === be ? 0.18 : 0.12 + ((t - de) / (be - de)) * 0.22,
    Oe = x.useMemo(
      () =>
        [...v].sort((t, r) => (t.name || '').localeCompare(r.name, 'it', { sensitivity: 'base' })),
      [v]
    ),
    Pe = (t) => P?.[t]?.name || '',
    pe = (t, r) => (r && Ne(r, l, t, u).isPromo) || !1,
    [je, V] = x.useState(!1),
    [B, Se] = x.useState(null),
    [ce, he] = x.useState('overview'),
    [fe, De] = x.useState('all'),
    [w, ye] = x.useState(null),
    [ke, re] = x.useState(null),
    [z, Ae] = x.useState(() => window.innerWidth >= 1024);
  x.useEffect(() => {
    const t = () => {
      Ae(window.innerWidth >= 1024);
    };
    return (window.addEventListener('resize', t), () => window.removeEventListener('resize', t));
  }, []);
  const [a, C] = x.useState({
    courtId: '',
    start: null,
    duration: ne,
    p1Name: '',
    p2Name: '',
    p3Name: '',
    p4Name: '',
    note: '',
    bookedBy: '',
    useLighting: !1,
    useHeating: !1,
    color: '#e91e63',
    bookingType: 'partita',
    instructorId: '',
  });
  function Ie(t, r) {
    const n = J(r, l.slotMinutes);
    (Se(null),
      C({
        courtId: t,
        start: n,
        duration: ne,
        p1Name: '',
        p2Name: '',
        p3Name: '',
        p4Name: '',
        note: '',
        bookedBy: '',
        useLighting: !1,
        useHeating: !1,
        color: '#e91e63',
        bookingType: 'partita',
        instructorId: '',
      }),
      V(!0));
  }
  function Ce(t) {
    Se(t.id);
    const r = new Date(t.start),
      n = (t.players || []).map(Pe);
    let o = t.playerNames && t.playerNames.length ? t.playerNames : n;
    const i = t.bookedByName || '';
    (i && !o.includes(i) && (o = [i, ...o].slice(0, 4)),
      C({
        courtId: t.courtId,
        start: r,
        duration: t.duration,
        p1Name: o[0] || '',
        p2Name: o[1] || '',
        p3Name: o[2] || '',
        p4Name: o[3] || '',
        note: t.note || '',
        bookedBy: i,
        useLighting: !!t.addons?.lighting,
        useHeating: !!t.addons?.heating,
        color: t.color || '#e91e63',
        bookingType: t.instructorId ? 'lezione' : 'partita',
        instructorId: t.instructorId || '',
      }),
      V(!0));
  }
  function Fe(t, r, n, o = null) {
    const i = new Date(r),
      g = k(r, n),
      $ = te.get(t) || [];
    return (
      console.log('🔍 Checking overlap for:', {
        courtId: t,
        blockStart: i.toISOString(),
        blockEnd: g.toISOString(),
        duration: n,
        ignoreId: o,
        existingBookings: $.length,
      }),
      $.find((p) => {
        if (o && p.id === o) return (console.log('⏭️ Ignoring booking:', p.id), !1);
        const S = new Date(p.start),
          m = k(new Date(p.start), p.duration),
          T = K(i, g, S, m);
        return (
          T &&
            console.log('🚫 Overlap detected with booking:', {
              bookingId: p.id,
              bookingStart: S.toISOString(),
              bookingEnd: m.toISOString(),
              bookingDuration: p.duration,
            }),
          T
        );
      })
    );
  }
  const $e = x.useRef('');
  (x.useEffect(() => {
    const t = a.p1Name?.trim() || '',
      r = $e.current;
    ((!a.bookedBy?.trim() || a.bookedBy?.trim() === r) && t && C((n) => ({ ...n, bookedBy: t })),
      ($e.current = t));
  }, [a.p1Name]),
    x.useEffect(() => {
      if (a.bookingType === 'lezione' && a.instructorId && O.length > 0) {
        const t = O.find((r) => r.id === a.instructorId);
        t?.instructorData?.color && C((r) => ({ ...r, color: t.instructorData.color }));
      } else a.bookingType === 'partita' && C((t) => ({ ...t, color: '#e91e63' }));
    }, [a.bookingType, a.instructorId, O]));
  async function Te() {
    if (!a.courtId || !a.start) {
      alert('Seleziona campo e orario.');
      return;
    }
    if (a.bookingType === 'lezione' && !a.instructorId) {
      alert('Seleziona un maestro per le lezioni.');
      return;
    }
    const t = J(a.start, l.slotMinutes);
    if (!W(t, a.courtId, u)) {
      alert('Orario fuori dalle fasce prenotabili per questo campo.');
      return;
    }
    if (t < new Date()) {
      alert('Non puoi prenotare nel passato.');
      return;
    }
    const n = B || null;
    if (Fe(a.courtId, t, a.duration, n)) {
      alert('Esiste già una prenotazione che si sovrappone su questo campo.');
      return;
    }
    const o = [a.p1Name, a.p2Name, a.p3Name, a.p4Name].map((y) => (y || '').trim()).filter(Boolean),
      i = (a.bookedBy && a.bookedBy.trim()) || o[0] || '',
      g = ze(
        t,
        a.duration,
        l,
        { lighting: !!a.useLighting, heating: !!a.useHeating },
        a.courtId,
        u
      ),
      $ = String(t.getFullYear()).padStart(4, '0'),
      j = String(t.getMonth() + 1).padStart(2, '0'),
      p = String(t.getDate()).padStart(2, '0'),
      S = String(t.getHours()).padStart(2, '0'),
      m = String(t.getMinutes()).padStart(2, '0'),
      T = `${$}-${j}-${p}`,
      d = `${S}:${m}`,
      D = u.find((y) => y.id === a.courtId)?.name || a.courtId;
    try {
      if (B) {
        const y = {
          courtId: a.courtId,
          courtName: D,
          date: T,
          time: d,
          duration: a.duration,
          lighting: !!a.useLighting,
          heating: !!a.useHeating,
          price: g,
          players: o,
          notes: a.note?.trim() || '',
          color: a.color,
          ...(i ? { bookedBy: i } : {}),
          ...(a.bookingType === 'lezione' && a.instructorId
            ? {
                instructorId: a.instructorId,
                instructorName: O.find((L) => L.id === a.instructorId)?.name || '',
                lessonType: 'individual',
              }
            : { instructorId: null, instructorName: null, lessonType: null }),
        };
        await H(B, y, Y);
      } else {
        const y = {
            courtId: a.courtId,
            courtName: D,
            date: T,
            time: d,
            duration: a.duration,
            lighting: !!a.useLighting,
            heating: !!a.useHeating,
            price: g,
            players: o,
            notes: a.note?.trim() || '',
            type: 'court',
            color: a.color,
            ...(a.bookingType === 'lezione' && a.instructorId
              ? {
                  instructorId: a.instructorId,
                  instructorName: O.find((s) => s.id === a.instructorId)?.name || '',
                  lessonType: 'individual',
                }
              : {}),
          },
          L = await oe(y);
        i && (await H(L.id, { bookedBy: i }));
      }
      V(!1);
    } catch {
      alert('Errore nel salvataggio della prenotazione.');
    }
  }
  async function Re(t) {
    if (confirm('Cancellare la prenotazione?'))
      try {
        await H(t, { status: 'cancelled', cancelledAt: new Date().toISOString() });
      } catch {
        alert('Errore durante la cancellazione.');
      }
  }
  async function ve(t) {
    if (confirm('Eliminare definitivamente la prenotazione?'))
      try {
        (await X(t), V(!1));
      } catch {
        alert("Errore durante l'eliminazione.");
      }
  }
  const Me = (t) => u.find((r) => r.id === t)?.name || t,
    He = (t, r) => {
      z &&
        (ye(r),
        (t.dataTransfer.effectAllowed = 'move'),
        t.dataTransfer.setData('text/plain', r.id),
        (t.target.style.opacity = '0.6'));
    },
    Ge = (t) => {
      z && (ye(null), re(null), (t.target.style.opacity = '1'));
    },
    Ue = (t, r, n) => {
      if (!z || !w) return;
      (t.preventDefault(), (t.dataTransfer.dropEffect = 'move'));
      const o = new Date(w.start).toDateString(),
        i = n.toDateString();
      if (o !== i) return;
      const g = J(n, l.slotMinutes),
        $ = w.duration || 60,
        j = k(g, $),
        p = [];
      let S = !1;
      for (let m = new Date(g); m < j; m = k(m, l.slotMinutes)) {
        if (!W(m, r, u)) {
          S = !0;
          break;
        }
        const T = k(m, l.slotMinutes);
        if (
          q.find((D) => {
            if (D.id === w.id || D.courtId !== r) return !1;
            const y = new Date(D.start),
              L = k(y, D.duration);
            return K(m, T, y, L);
          })
        ) {
          S = !0;
          break;
        }
        p.push({ courtId: r, time: m.getTime() });
      }
      re(S ? null : { courtId: r, slots: p });
    },
    Ve = (t) => {
      z && (t.currentTarget.contains(t.relatedTarget) || re(null));
    },
    Ye = async (t, r, n) => {
      if (!(!z || !w)) {
        (t.preventDefault(),
          re(null),
          console.log('🎯 DROP EVENT:', {
            courtId: r,
            slotTime: n.toISOString(),
            draggedBookingId: w.id,
            draggedBookingDuration: w.duration,
          }));
        try {
          const o = new Date(w.start).toDateString(),
            i = n.toDateString();
          if (o !== i) {
            alert("Puoi spostare le prenotazioni solo all'interno dello stesso giorno.");
            return;
          }
          const g = J(n, l.slotMinutes),
            $ = k(g, w.duration);
          console.log('🎯 Drop validation:', {
            targetTime: g.toISOString(),
            targetEnd: $.toISOString(),
            duration: w.duration,
          });
          const j = [];
          for (let d = new Date(g); d < $; d = k(d, l.slotMinutes)) j.push(new Date(d));
          for (const d of j)
            if (!W(d, r, u)) {
              alert(
                'Uno o più slot di destinazione sono fuori dalle fasce prenotabili per questo campo.'
              );
              return;
            }
          const p = q.find((d) => {
            if (d.id === w.id || d.courtId !== r) return !1;
            const D = new Date(d.start),
              y = k(D, d.duration);
            return K(g, $, D, y);
          });
          if (p) {
            (console.log('🚫 Conflict detected with booking:', p.id),
              alert("Lo slot di destinazione è già occupato da un'altra prenotazione."));
            return;
          }
          for (const d of j) {
            const D = k(d, l.slotMinutes);
            if (
              q.find((L) => {
                if (L.id === w.id || L.courtId !== r) return !1;
                const s = new Date(L.start),
                  f = k(s, L.duration);
                return K(d, D, s, f);
              })
            ) {
              (console.log('🚫 Slot conflict detected at:', d.toISOString()),
                alert("Lo slot di destinazione è già occupato da un'altra prenotazione."));
              return;
            }
          }
          console.log('✅ Drop validation passed, updating booking...');
          const S = new Date(g.getTime() - g.getTimezoneOffset() * 6e4),
            m = S.toISOString().split('T')[0],
            T = S.toISOString().split('T')[1].substring(0, 5);
          (console.log('🔄 Updating booking with:', {
            bookingId: w.id,
            newCourtId: r,
            newDateStr: m,
            newTimeStr: T,
            targetTimeLocal: g.toLocaleString('it-IT'),
          }),
            await H(w.id, {
              courtId: r,
              courtName: Me(r),
              date: m,
              time: T,
              updatedAt: new Date().toISOString(),
            }),
            console.log('✅ Booking moved successfully'),
            N &&
              setTimeout(() => {
                (console.log('🔄 Refreshing bookings after drag & drop...'), N());
              }, 500));
        } catch (o) {
          (console.error('❌ Error moving booking:', o),
            alert('Errore durante lo spostamento della prenotazione.'));
        }
        ye(null);
      }
    },
    qe = 52;
  function _e(t, r) {
    const o = (te.get(t) || []).find((s) => {
        const f = new Date(s.start),
          I = k(new Date(s.start), s.duration);
        return K(f, I, r, k(r, l.slotMinutes));
      }),
      i = W(r, t, u);
    if (!o && !i) {
      const s = r.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return e.jsx('div', {
        className:
          'relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium bg-gray-200 dark:bg-gray-800 opacity-50 cursor-not-allowed border-dashed border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center',
        title: 'Fuori fascia oraria per questo campo',
        children: e.jsx('span', {
          className: 'absolute inset-0 grid place-items-center text-[11px] opacity-80',
          children: s,
        }),
      });
    }
    if (!o) {
      const s = Ne(r, l, t, u),
        f = Le(s.rate),
        I = s.source === 'discounted' || s.isPromo,
        A = r.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        G = ke && ke.courtId === t && ke.slots?.some((ae) => ae.time === r.getTime()),
        ue =
          w && w.start && new Date(w.start).toDateString() === r.toDateString() && t !== w.courtId;
      return e.jsxs('button', {
        type: 'button',
        onClick: () => Ie(t, r),
        className: `relative w-full h-9 rounded-lg ring-1 text-[11px] font-medium transition-all duration-200 ${G ? 'ring-2 ring-blue-500 ring-offset-1 scale-105' : ue ? 'ring-2 ring-red-300 ring-offset-1 opacity-75' : ''}`,
        style: {
          background: G
            ? 'rgba(59, 130, 246, 0.2)'
            : ue
              ? 'rgba(239, 68, 68, 0.1)'
              : `rgba(16,185,129,${f})`,
          borderColor: G
            ? 'rgba(59, 130, 246, 0.6)'
            : ue
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(16,185,129,0.35)',
        },
        title: G
          ? 'Rilascia qui per spostare la prenotazione'
          : ue
            ? 'Disponibile per nuove prenotazioni (non compatibile con lo spostamento)'
            : s.isPromo
              ? 'Fascia Promo'
              : I
                ? 'Fascia scontata'
                : 'Tariffa standard',
        onDragOver: z ? (ae) => Ue(ae, t, r) : void 0,
        onDragLeave: z ? Ve : void 0,
        onDrop: z ? (ae) => Ye(ae, t, r) : void 0,
        children: [
          I &&
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
            children: A,
          }),
        ],
      });
    }
    const g = new Date(o.start),
      $ = k(g, o.duration);
    if (!(r.getTime() === g.getTime())) return e.jsx('div', { className: 'w-full h-9' });
    const S = Math.ceil(($ - r) / (l.slotMinutes * 60 * 1e3)) * qe - 6,
      m = (
        o.playerNames && o.playerNames.length
          ? o.playerNames
          : (o.players || []).map((s) => P?.[s]?.name || '—')
      )
        .concat(o.guestNames || [])
        .slice(0, 4),
      T = e.jsx('span', { className: 'text-2xl', children: '💡' }),
      d = e.jsx('span', { className: 'text-2xl', children: '🔥' });
    let D = 'rgba(220, 38, 127, 0.35)',
      y = 'rgba(220, 38, 127, 0.6)';
    const L =
      o.isLessonBooking ||
      (o.notes && o.notes.includes('Lezione con')) ||
      o.instructorId ||
      o.instructorName;
    if (o.color) {
      const s = o.color.replace('#', ''),
        f = parseInt(s.substr(0, 2), 16),
        I = parseInt(s.substr(2, 2), 16),
        A = parseInt(s.substr(4, 2), 16);
      ((D = `rgba(${f}, ${I}, ${A}, 0.35)`), (y = `rgba(${f}, ${I}, ${A}, 0.6)`));
    } else if (L) {
      let s = null;
      if (o.instructorId) s = O.find((f) => f.id === o.instructorId);
      else {
        const f = o.notes.match(/Lezione con (.+)/);
        if (f) {
          const I = f[1];
          s = O.find((A) => A.name === I);
        }
      }
      if (s && s.instructorData?.color) {
        const f = s.instructorData.color.replace('#', ''),
          I = parseInt(f.substr(0, 2), 16),
          A = parseInt(f.substr(2, 2), 16),
          G = parseInt(f.substr(4, 2), 16);
        ((D = `rgba(${I}, ${A}, ${G}, 0.35)`), (y = `rgba(${I}, ${A}, ${G}, 0.6)`));
      }
    }
    return e.jsx('div', {
      className: 'w-full h-9 relative',
      children: e.jsxs('button', {
        type: 'button',
        onClick: () => Ce(o),
        className: `absolute left-0 right-0 px-2 py-2 ring-1 text-left text-[13px] font-semibold flex flex-col justify-center transition-all duration-200 ${z ? 'cursor-grab hover:shadow-lg' : ''}`,
        style: {
          top: 0,
          height: `${S}px`,
          background: D,
          borderColor: y,
          borderRadius: '8px',
          overflow: 'hidden',
        },
        title: `${Me(o.courtId)} — ${g.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${o.duration}′) • ${z ? 'Trascina per spostare o clicca per modificare' : 'Clicca per modificare'}`,
        draggable: z,
        onDragStart: z ? (s) => He(s, o) : void 0,
        onDragEnd: z ? Ge : void 0,
        onMouseDown: z ? (s) => (s.target.style.cursor = 'grabbing') : void 0,
        onMouseUp: z ? (s) => (s.target.style.cursor = 'grab') : void 0,
        children: [
          e.jsxs('div', {
            className: 'absolute left-2 top-2 flex flex-row items-center gap-2 z-20',
            children: [o.addons?.lighting && T, o.addons?.heating && d],
          }),
          L &&
            (() => {
              let s = null,
                f = '';
              if (o.instructorId) s = O.find((I) => I.id === o.instructorId);
              else {
                const I = o.notes.match(/Lezione con (.+)/);
                if (I) {
                  const A = I[1];
                  s = O.find((G) => G.name === A);
                }
              }
              return (
                s?.name && (f = s.name.trim().split(/\s+/)[0]),
                e.jsx('div', {
                  className: 'absolute right-2 top-2 z-30',
                  children: e.jsxs('span', {
                    className:
                      'text-[13px] px-2 py-1 bg-orange-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-lg border-2 border-white',
                    title: `Lezione${s?.name ? ` con ${s.name}` : ''}`,
                    children: [
                      '🎾',
                      f &&
                        e.jsx('span', {
                          className: 'text-[11px] font-bold uppercase',
                          children: f,
                        }),
                    ],
                  }),
                })
              );
            })(),
          e.jsx('div', {
            className: 'flex items-center justify-between gap-2 mb-1 mt-2',
            children: e.jsxs('div', {
              className: 'min-w-0 flex flex-col',
              children: [
                e.jsxs('span', {
                  className: 'font-bold text-[15px] leading-tight',
                  children: [
                    g.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ' -',
                    ' ',
                    $.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    ' •',
                    ' ',
                    ge(o.price),
                  ],
                }),
                e.jsx('span', {
                  className: 'flex items-center gap-2 mt-1',
                  children: e.jsx('div', {
                    className: 'text-[10px] font-medium opacity-80 flex flex-wrap gap-1',
                    children: m.map((s, f) =>
                      e.jsx(
                        'span',
                        {
                          className: 'bg-white/20 px-1 py-0.5 rounded text-[9px] font-medium',
                          children: s,
                        },
                        f
                      )
                    ),
                  }),
                }),
              ],
            }),
          }),
          e.jsxs('div', {
            className: 'text-[12px] opacity-80 truncate',
            children: [
              'Prenotato da:',
              ' ',
              e.jsx('span', {
                className: 'font-semibold',
                children: o.bookedByName || m[0] || '—',
              }),
            ],
          }),
          o.note &&
            e.jsx('div', { className: 'text-[11px] opacity-70 mt-1 truncate', children: o.note }),
          e.jsx('div', {
            className: 'absolute bottom-2 right-2 z-20',
            children: e.jsxs('span', {
              className: 'text-[13px] opacity-80 font-bold bg-black/20 px-2 py-1 rounded',
              children: [Math.round(o.duration), '′'],
            }),
          }),
        ],
      }),
    });
  }
  const _ = x.useMemo(
    () =>
      !a.start || !a.courtId
        ? null
        : ze(
            new Date(a.start),
            a.duration,
            l,
            { lighting: a.useLighting, heating: a.useHeating },
            a.courtId,
            u
          ),
    [a.start, a.duration, a.courtId, a.useLighting, a.useHeating, l, u]
  );
  return (
    x.useMemo(() => (_ == null ? null : _ / 4), [_]),
    e.jsxs(Ze, {
      title: 'Gestione Campi',
      T: c,
      children: [
        z &&
          e.jsx('div', {
            className:
              'mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg',
            children: e.jsxs('div', {
              className: 'flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300',
              children: [
                e.jsx('span', { className: 'text-lg', children: '🖱️' }),
                e.jsx('span', { className: 'font-medium', children: 'Drag & Drop attivo:' }),
                e.jsx('span', {
                  children:
                    'Trascina le prenotazioni per spostarle su slot liberi dello stesso giorno',
                }),
              ],
            }),
          }),
        h
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsx('div', {
                  className: `flex flex-col items-center gap-6 mb-6 ${c.cardBg} ${c.border} p-6 rounded-xl shadow-lg`,
                  children: e.jsxs('div', {
                    className: 'flex items-center justify-center gap-6',
                    children: [
                      e.jsx('button', {
                        type: 'button',
                        className:
                          'w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center',
                        onClick: () => Q(-1),
                        title: 'Giorno precedente',
                        children: '←',
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: () => U(!0),
                        className:
                          'text-3xl font-bold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-lime-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800',
                        title: 'Clicca per aprire calendario',
                        children: Ee,
                      }),
                      e.jsx('button', {
                        type: 'button',
                        className:
                          'w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-2xl font-bold shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center',
                        onClick: () => Q(1),
                        title: 'Giorno successivo',
                        children: '→',
                      }),
                    ],
                  }),
                }),
                me &&
                  e.jsx('div', {
                    className:
                      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
                    children: e.jsxs('div', {
                      className: `${c.cardBg} ${c.border} rounded-2xl shadow-2xl p-8 max-w-2xl w-full`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between mb-6',
                          children: [
                            e.jsx('h3', {
                              className: `text-2xl font-bold ${c.text} flex items-center gap-2`,
                              children: '📅 Seleziona data',
                            }),
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => U(!1),
                              className:
                                'w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-2xl font-bold transition-colors',
                              title: 'Chiudi',
                              children: '✕',
                            }),
                          ],
                        }),
                        e.jsx(nt, {
                          currentDay: E,
                          onSelectDay: (t) => {
                            (Z(t), U(!1));
                          },
                          T: c,
                        }),
                        e.jsxs('div', {
                          className: 'mt-6 grid grid-cols-3 gap-3',
                          children: [
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (b(), U(!1));
                              },
                              className: `${c.btnPrimary} py-3 text-sm font-semibold flex items-center justify-center gap-2`,
                              children: '🏠 Oggi',
                            }),
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (Q(-1), U(!1));
                              },
                              className: `${c.btnGhost} py-3 text-sm font-medium`,
                              children: '← Ieri',
                            }),
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => {
                                (Q(1), U(!1));
                              },
                              className: `${c.btnGhost} py-3 text-sm font-medium`,
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
                        onClick: () => he('overview'),
                        className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${ce === 'overview' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                        children: '📊 Panoramica',
                      }),
                      e.jsx('button', {
                        onClick: () => he('detail'),
                        className: `flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-semibold transition-all ${ce === 'detail' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-emerald-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                        children: '🔍 Dettaglio',
                      }),
                    ],
                  }),
                }),
                ce === 'overview' &&
                  e.jsx('div', {
                    className: 'md:hidden mb-6',
                    children: e.jsx('div', {
                      className: 'grid grid-cols-2 gap-3',
                      children: u.map((t) => {
                        const r = F.filter((g) => {
                            const $ = g,
                              j = k(g, l.slotMinutes),
                              p = W(g, t.id, u),
                              S = te.get(t.id)?.some((m) => {
                                const T = new Date(m.start),
                                  d = k(new Date(m.start), m.duration);
                                return K($, j, T, d);
                              });
                            return p && !S;
                          }).length,
                          n = F.filter((g) => W(g, t.id, u)).length || 0,
                          o = n - r,
                          i = r / n;
                        return e.jsxs(
                          'div',
                          {
                            className: `${c.cardBg} ${c.border} rounded-xl p-4 shadow-md`,
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
                                        children: ['Liberi: ', r],
                                      }),
                                      e.jsxs('span', {
                                        className: 'text-red-600 dark:text-red-400',
                                        children: ['Occupati: ', o],
                                      }),
                                    ],
                                  }),
                                  e.jsx('div', {
                                    className:
                                      'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2',
                                    children: e.jsx('div', {
                                      className: `h-2 rounded-full transition-all duration-300 ${i > 0.7 ? 'bg-green-500' : i > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`,
                                      style: { width: `${i * 100}%` },
                                    }),
                                  }),
                                ],
                              }),
                              e.jsx('button', {
                                onClick: () => {
                                  (De(t.id), he('detail'));
                                },
                                className: `w-full ${c.btnGhost} py-2 text-xs font-semibold`,
                                children: 'Visualizza dettaglio',
                              }),
                            ],
                          },
                          t.id
                        );
                      }),
                    }),
                  }),
                ce === 'detail' &&
                  e.jsxs('div', {
                    className: 'md:hidden mb-6',
                    children: [
                      e.jsx('div', {
                        className: 'mb-4',
                        children: e.jsxs('select', {
                          value: fe,
                          onChange: (t) => De(t.target.value),
                          className: `w-full ${c.input} text-sm`,
                          children: [
                            e.jsx('option', { value: 'all', children: 'Tutti i campi' }),
                            u.map((t) => e.jsx('option', { value: t.id, children: t.name }, t.id)),
                          ],
                        }),
                      }),
                      e.jsx('div', {
                        className: 'space-y-2',
                        children: F.map((t) => {
                          const r = t.toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                            o = k(t, l.slotMinutes).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                          return e.jsxs(
                            'div',
                            {
                              className: `${c.cardBg} ${c.border} rounded-lg p-3 shadow-sm`,
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center justify-between mb-2',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'font-semibold text-base',
                                      children: [r, ' - ', o],
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
                                  children: u
                                    .filter((i) => fe === 'all' || i.id === fe)
                                    .map((i) => {
                                      const g = t,
                                        $ = k(t, l.slotMinutes),
                                        j = W(t, i.id, u),
                                        p = te.get(i.id)?.find((d) => {
                                          const D = new Date(d.start),
                                            y = k(new Date(d.start), d.duration);
                                          return K(g, $, D, y);
                                        }),
                                        S = !p && j;
                                      S &&
                                        (t.toISOString().split('T')[0],
                                        t.toISOString().split('T')[1].substring(0, 5),
                                        l.slotMinutes,
                                        Array.from(te.get(i.id) || []).map((d) => ({
                                          courtId: i.id,
                                          date: d.start.split('T')[0],
                                          time: d.start.split('T')[1].substring(0, 5),
                                          duration: d.duration,
                                          status: 'booked',
                                        })));
                                      const m = S,
                                        T = pe(i.id, t);
                                      return e.jsxs(
                                        'button',
                                        {
                                          onClick: () => {
                                            if (j) {
                                              if (m) return Ie(i.id, t);
                                              if (p) return Ce(p);
                                            }
                                          },
                                          className: `p-2 rounded-lg text-sm font-medium transition-all ${m ? `hover:scale-105 ${c.btnGhost} border-2 ${T ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'border-green-200 dark:border-green-700'}` : j ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-not-allowed'}`,
                                          children: [
                                            e.jsxs('div', {
                                              className: 'flex items-center gap-1 justify-center',
                                              children: [
                                                e.jsx('span', {
                                                  className: `w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${m ? 'bg-green-500 text-white' : j ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'}`,
                                                  children: i.name[0],
                                                }),
                                                e.jsx('span', { children: i.name }),
                                              ],
                                            }),
                                            T &&
                                              m &&
                                              e.jsx('div', {
                                                className:
                                                  'text-xs text-yellow-600 dark:text-yellow-400 mt-1',
                                                children: '🏷️ Promo',
                                              }),
                                            !j &&
                                              e.jsx('div', {
                                                className:
                                                  'text-xs mt-1 text-gray-500 dark:text-gray-400',
                                                children: 'Fuori fascia',
                                              }),
                                            j &&
                                              !m &&
                                              p &&
                                              e.jsxs('div', {
                                                className: 'text-xs mt-1 truncate',
                                                children: [
                                                  e.jsx('div', {
                                                    className: 'font-medium',
                                                    children: p.bookedByName || 'Occupato',
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
                                        i.id
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
                    style: { gridTemplateColumns: `repeat(${u.length}, 1fr)` },
                    children: [
                      u.map((t) =>
                        e.jsx(
                          'div',
                          {
                            className: `px-2 py-3 text-base font-bold text-center rounded-xl shadow-md mb-2 ${c.cardBg} ${c.border}`,
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
                                      pe(t.id, a.start) &&
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
                      F.map((t, r) =>
                        e.jsx(
                          Be.Fragment,
                          {
                            children: u.map((n) =>
                              e.jsx(
                                'div',
                                {
                                  className: `px-0.5 py-0.5 ${c.cardBg} ${c.border} rounded-lg`,
                                  children: _e(n.id, t),
                                },
                                n.id + '_' + r
                              )
                            ),
                          },
                          t.getTime()
                        )
                      ),
                    ],
                  }),
                }),
                e.jsx(et, {
                  open: je,
                  onClose: () => V(!1),
                  title: B ? 'Modifica prenotazione' : 'Nuova prenotazione',
                  T: c,
                  size: 'xl',
                  children: a.start
                    ? e.jsxs('div', {
                        className: 'relative',
                        children: [
                          e.jsx('div', {
                            className:
                              'absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl',
                          }),
                          e.jsxs('div', {
                            className:
                              'relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-4 shadow-2xl',
                            children: [
                              e.jsxs('div', {
                                className: 'grid sm:grid-cols-2 gap-4',
                                children: [
                                  e.jsxs('div', {
                                    className: 'sm:col-span-2 flex flex-col gap-1',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                        children: '🎯 Tipo prenotazione',
                                      }),
                                      e.jsxs('select', {
                                        value: a.bookingType,
                                        onChange: (t) => {
                                          const r = t.target.value;
                                          C((n) => ({
                                            ...n,
                                            bookingType: r,
                                            instructorId: r === 'partita' ? '' : n.instructorId,
                                          }));
                                        },
                                        className:
                                          'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: [
                                          e.jsx('option', {
                                            value: 'partita',
                                            children: '🏓 Partita',
                                          }),
                                          e.jsx('option', {
                                            value: 'lezione',
                                            children: '👨‍🏫 Lezione',
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  a.bookingType === 'lezione' &&
                                    e.jsxs('div', {
                                      className: 'sm:col-span-2 flex flex-col gap-1',
                                      children: [
                                        e.jsx('label', {
                                          className:
                                            'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                          children: '👨‍🏫 Maestro',
                                        }),
                                        e.jsxs('select', {
                                          value: a.instructorId,
                                          onChange: (t) =>
                                            C((r) => ({ ...r, instructorId: t.target.value })),
                                          className:
                                            'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                          required: a.bookingType === 'lezione',
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '-- Seleziona un maestro --',
                                            }),
                                            O.map((t) =>
                                              e.jsxs(
                                                'option',
                                                {
                                                  value: t.id,
                                                  children: [
                                                    t.name,
                                                    t.instructorData?.specialties?.length > 0 &&
                                                      ` (${t.instructorData.specialties.join(', ')})`,
                                                  ],
                                                },
                                                t.id
                                              )
                                            ),
                                          ],
                                        }),
                                        a.bookingType === 'lezione' &&
                                          !a.instructorId &&
                                          e.jsx('div', {
                                            className:
                                              'text-sm text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-200/50 dark:border-red-800/30',
                                            children: '⚠️ Seleziona un maestro per le lezioni',
                                          }),
                                      ],
                                    }),
                                  e.jsxs('div', {
                                    className: 'flex flex-col gap-1',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                        children: '🏟️ Campo',
                                      }),
                                      e.jsx('select', {
                                        value: a.courtId,
                                        onChange: (t) =>
                                          C((r) => ({ ...r, courtId: t.target.value })),
                                        className:
                                          'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: h.courts.map((t) =>
                                          e.jsx('option', { value: t.id, children: t.name }, t.id)
                                        ),
                                      }),
                                      a.courtId &&
                                        pe(a.courtId, a.start) &&
                                        e.jsx('div', {
                                          className:
                                            'text-sm bg-gradient-to-r from-yellow-400/80 to-orange-400/80 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-lg font-semibold inline-flex items-center gap-1 w-fit backdrop-blur-sm border border-yellow-300/50',
                                          children: '🏷️ Fascia Promo',
                                        }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex flex-col gap-1',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                        children: '⏰ Inizio',
                                      }),
                                      e.jsx('input', {
                                        type: 'time',
                                        value: `${String(new Date(a.start).getHours()).padStart(2, '0')}:${String(new Date(a.start).getMinutes()).padStart(2, '0')}`,
                                        onChange: (t) => {
                                          const [r, n] = t.target.value.split(':').map(Number),
                                            o = new Date(a.start);
                                          (o.setHours(r, n, 0, 0),
                                            C((i) => ({ ...i, start: J(o, l.slotMinutes) })));
                                        },
                                        className:
                                          'px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex flex-col gap-2',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                        children: '⏱️ Durata',
                                      }),
                                      e.jsx('select', {
                                        value: a.duration,
                                        onChange: (t) =>
                                          C((r) => ({ ...r, duration: Number(t.target.value) })),
                                        className:
                                          'px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 font-medium',
                                        children: (l.defaultDurations || [60, 90, 120]).map((t) =>
                                          e.jsxs(
                                            'option',
                                            { value: t, children: [t, ' minuti'] },
                                            t
                                          )
                                        ),
                                      }),
                                    ],
                                  }),
                                  e.jsx('div', {
                                    className: 'sm:col-span-1',
                                    children: e.jsxs('div', {
                                      className:
                                        'bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg p-2 border border-white/20 dark:border-gray-600/20',
                                      children: [
                                        e.jsx('div', {
                                          className: 'flex items-center gap-1 mb-1',
                                          children: e.jsx('h3', {
                                            className:
                                              'text-xs font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
                                            children: '⚡ Servizi',
                                          }),
                                        }),
                                        e.jsxs('div', {
                                          className: 'flex flex-col gap-2',
                                          children: [
                                            l.addons?.lightingEnabled &&
                                              e.jsxs('label', {
                                                className:
                                                  'inline-flex items-center gap-2 cursor-pointer bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:bg-blue-100/50 dark:hover:bg-blue-800/30 transition-all duration-200',
                                                children: [
                                                  e.jsx('input', {
                                                    type: 'checkbox',
                                                    checked: a.useLighting,
                                                    onChange: (t) =>
                                                      C((r) => ({
                                                        ...r,
                                                        useLighting: t.target.checked,
                                                      })),
                                                    className:
                                                      'w-4 h-4 text-blue-600 bg-white/50 border-blue-300 rounded focus:ring-blue-500 focus:ring-2',
                                                  }),
                                                  e.jsxs('div', {
                                                    className: 'flex flex-col',
                                                    children: [
                                                      e.jsx('span', {
                                                        className:
                                                          'text-sm font-semibold text-blue-700 dark:text-blue-300',
                                                        children: '💡 Illuminazione',
                                                      }),
                                                      e.jsxs('span', {
                                                        className:
                                                          'text-xs text-blue-600 dark:text-blue-400',
                                                        children: [
                                                          '+',
                                                          ge(l.addons.lightingFee || 0),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            l.addons?.heatingEnabled &&
                                              u.find((r) => r.id === a.courtId)?.hasHeating &&
                                              e.jsxs('label', {
                                                className:
                                                  'inline-flex items-center gap-2 cursor-pointer bg-purple-50/50 dark:bg-purple-900/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-purple-200/50 dark:border-purple-800/30 hover:bg-purple-100/50 dark:hover:bg-purple-800/30 transition-all duration-200',
                                                children: [
                                                  e.jsx('input', {
                                                    type: 'checkbox',
                                                    checked: a.useHeating,
                                                    onChange: (r) =>
                                                      C((n) => ({
                                                        ...n,
                                                        useHeating: r.target.checked,
                                                      })),
                                                    className:
                                                      'w-4 h-4 text-purple-600 bg-white/50 border-purple-300 rounded focus:ring-purple-500 focus:ring-2',
                                                  }),
                                                  e.jsxs('div', {
                                                    className: 'flex flex-col',
                                                    children: [
                                                      e.jsx('span', {
                                                        className:
                                                          'text-sm font-semibold text-purple-700 dark:text-purple-300',
                                                        children: '🔥 Riscaldamento',
                                                      }),
                                                      e.jsxs('span', {
                                                        className:
                                                          'text-xs text-purple-600 dark:text-purple-400',
                                                        children: [
                                                          '+',
                                                          ge(l.addons.heatingFee || 0),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                          ],
                                        }),
                                        e.jsx('div', {
                                          className: 'mt-4 flex justify-end',
                                          children: e.jsx('div', {
                                            className:
                                              'bg-gradient-to-r from-emerald-500/90 to-blue-500/90 backdrop-blur-xl rounded-xl border border-white/20 px-4 py-3 shadow-xl',
                                            children: e.jsxs('div', {
                                              className: 'text-right',
                                              children: [
                                                e.jsxs('div', {
                                                  className: 'text-lg font-bold text-white',
                                                  children: ['Totale: ', _ == null ? '—' : ge(_)],
                                                }),
                                                _ != null &&
                                                  e.jsxs('div', {
                                                    className: 'text-sm text-emerald-100 mt-1',
                                                    children: ['/ giocatore: ', tt(_ / 4)],
                                                  }),
                                              ],
                                            }),
                                          }),
                                        }),
                                      ],
                                    }),
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx('div', {
                                        className:
                                          'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2',
                                        children: '👥 Giocatori',
                                      }),
                                      e.jsx('div', {
                                        className: 'grid grid-cols-2 gap-3',
                                        children: [
                                          ['p1Name', 'Giocatore 1'],
                                          ['p2Name', 'Giocatore 2'],
                                          ['p3Name', 'Giocatore 3'],
                                          ['p4Name', 'Giocatore 4'],
                                        ].map(([t, r]) =>
                                          e.jsxs(
                                            'div',
                                            {
                                              children: [
                                                e.jsx('label', {
                                                  className:
                                                    'text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block',
                                                  children: r,
                                                }),
                                                e.jsx('input', {
                                                  list: 'players-list',
                                                  value: a[t],
                                                  onChange: (n) =>
                                                    C((o) => ({ ...o, [t]: n.target.value })),
                                                  className:
                                                    'w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200',
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
                                            className:
                                              'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block',
                                            children: '📝 Prenotazione a nome di',
                                          }),
                                          e.jsx('input', {
                                            value: a.bookedBy,
                                            onChange: (t) =>
                                              C((r) => ({ ...r, bookedBy: t.target.value })),
                                            className:
                                              'w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200',
                                            placeholder: 'Es. Andrea Paris',
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        children: [
                                          e.jsx('label', {
                                            className:
                                              'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block',
                                            children: '💬 Note',
                                          }),
                                          e.jsx('input', {
                                            value: a.note,
                                            onChange: (t) =>
                                              C((r) => ({ ...r, note: t.target.value })),
                                            className:
                                              'w-full px-3 py-2 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200',
                                            placeholder: 'Es. Lezioni, torneo, ecc.',
                                          }),
                                        ],
                                      }),
                                      e.jsxs('div', {
                                        children: [
                                          e.jsxs('label', {
                                            className:
                                              'text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1 block',
                                            children: [
                                              '🎨 Colore prenotazione',
                                              a.bookingType === 'lezione' &&
                                                a.instructorId &&
                                                e.jsx('span', {
                                                  className:
                                                    'ml-2 text-xs text-blue-600 dark:text-blue-400 font-normal',
                                                  children: '(Colore del maestro)',
                                                }),
                                              a.bookingType === 'partita' &&
                                                e.jsx('span', {
                                                  className:
                                                    'ml-2 text-xs text-pink-600 dark:text-pink-400 font-normal',
                                                  children: '(Colore standard partita)',
                                                }),
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className: 'space-y-4',
                                            children: [
                                              e.jsxs('div', {
                                                className: 'flex items-center gap-3',
                                                children: [
                                                  e.jsx('input', {
                                                    type: 'color',
                                                    value: a.color,
                                                    onChange: (t) =>
                                                      C((r) => ({ ...r, color: t.target.value })),
                                                    className:
                                                      'w-12 h-12 rounded-xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg',
                                                    title: 'Seleziona il colore della prenotazione',
                                                  }),
                                                  e.jsx('div', {
                                                    className: 'flex-1',
                                                    children: e.jsx('div', {
                                                      className:
                                                        'h-12 rounded-xl border-2 flex items-center px-4 text-sm font-semibold shadow-lg backdrop-blur-sm',
                                                      style: {
                                                        backgroundColor: a.color + '33',
                                                        borderColor: a.color,
                                                        color: a.color,
                                                      },
                                                      children: 'Anteprima colore',
                                                    }),
                                                  }),
                                                ],
                                              }),
                                              e.jsxs('div', {
                                                className:
                                                  'bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-xl p-3 border border-white/20 dark:border-gray-600/20',
                                                children: [
                                                  e.jsx('span', {
                                                    className:
                                                      'text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2',
                                                    children: 'Colori predefiniti:',
                                                  }),
                                                  e.jsx('div', {
                                                    className: 'flex gap-2 flex-wrap',
                                                    children: [
                                                      { color: '#e91e63', name: 'Rosa (default)' },
                                                      { color: '#f44336', name: 'Rosso' },
                                                      { color: '#00bcd4', name: 'Turchese' },
                                                      { color: '#2196f3', name: 'Blu' },
                                                      { color: '#4caf50', name: 'Verde' },
                                                      { color: '#ff9800', name: 'Arancione' },
                                                      { color: '#9c27b0', name: 'Viola' },
                                                      { color: '#607d8b', name: 'Grigio' },
                                                    ].map((t) =>
                                                      e.jsx(
                                                        'button',
                                                        {
                                                          type: 'button',
                                                          onClick: () =>
                                                            C((r) => ({ ...r, color: t.color })),
                                                          className: `w-10 h-10 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-110 shadow-lg ${a.color === t.color ? 'border-gray-800 dark:border-white scale-110 shadow-xl' : 'border-white/50 dark:border-gray-600/50'}`,
                                                          style: { backgroundColor: t.color },
                                                          title: t.name,
                                                        },
                                                        t.color
                                                      )
                                                    ),
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                  e.jsx('datalist', {
                                    id: 'players-list',
                                    children: Oe.map((t) =>
                                      e.jsx('option', { value: t.name }, t.id)
                                    ),
                                  }),
                                  e.jsxs('div', {
                                    className: 'hidden md:flex gap-3 pt-6',
                                    children: [
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: Te,
                                        className:
                                          'flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105',
                                        children: B
                                          ? '✓ Aggiorna prenotazione'
                                          : '✓ Conferma prenotazione',
                                      }),
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: () => V(!1),
                                        className:
                                          'px-6 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-200',
                                        children: 'Annulla',
                                      }),
                                      B &&
                                        e.jsx('button', {
                                          type: 'button',
                                          onClick: () => ve(B),
                                          className:
                                            'bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold px-6 py-3 rounded-xl shadow-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105',
                                          children: '🗑️ Elimina',
                                        }),
                                    ],
                                  }),
                                  e.jsx('div', { className: 'h-16 md:hidden' }),
                                ],
                              }),
                              e.jsx('div', {
                                className:
                                  'md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/30 p-4 z-50 shadow-2xl',
                                children: e.jsxs('div', {
                                  className: 'flex gap-3 max-w-md mx-auto',
                                  children: [
                                    e.jsx('button', {
                                      type: 'button',
                                      onClick: Te,
                                      className:
                                        'flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105',
                                      children: B ? '✓ Aggiorna' : '✓ Conferma',
                                    }),
                                    e.jsx('button', {
                                      type: 'button',
                                      onClick: () => V(!1),
                                      className:
                                        'flex-1 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold py-4 rounded-xl border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 transition-all duration-200',
                                      children: 'Annulla',
                                    }),
                                    B &&
                                      e.jsx('button', {
                                        type: 'button',
                                        onClick: () => ve(B),
                                        className:
                                          'bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold px-6 py-4 rounded-xl shadow-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300',
                                        children: '🗑️',
                                      }),
                                  ],
                                }),
                              }),
                            ],
                          }),
                        ],
                      })
                    : e.jsxs('div', {
                        className: 'text-center py-12',
                        children: [
                          e.jsx('div', {
                            className:
                              'w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl',
                            children: e.jsx('span', {
                              className: 'text-3xl text-white',
                              children: '📅',
                            }),
                          }),
                          e.jsx('div', {
                            className:
                              'text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2',
                            children: 'Seleziona uno slot',
                          }),
                          e.jsx('div', {
                            className: 'text-gray-600 dark:text-gray-400',
                            children: 'Clicca su uno slot libero nella griglia per iniziare',
                          }),
                        ],
                      }),
                }),
                je &&
                  a.start &&
                  e.jsxs(e.Fragment, {
                    children: [
                      e.jsxs('div', {
                        className:
                          'fixed bottom-24 left-4 right-4 z-[99999] flex gap-3 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30',
                        children: [
                          e.jsx('button', {
                            type: 'button',
                            onClick: () => V(!1),
                            className:
                              'flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105',
                            children: '❌ Annulla',
                          }),
                          B &&
                            e.jsx('button', {
                              type: 'button',
                              onClick: () => ve(B),
                              className:
                                'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 border border-red-300/50',
                              children: '🗑️ Elimina',
                            }),
                        ],
                      }),
                      B &&
                        e.jsx('div', {
                          className:
                            'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[99999] md:hidden',
                          children: e.jsx('button', {
                            type: 'button',
                            onClick: () => Re(B),
                            className:
                              'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-8 py-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 border border-red-300/50',
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
                    className: 'text-lg font-medium mb-2 text-gray-900 dark:text-white',
                    children: 'Caricamento...',
                  }),
                  e.jsx('p', {
                    className: 'text-gray-500',
                    children: 'Caricamento configurazione campi in corso...',
                  }),
                ],
              }),
            }),
      ],
    })
  );
}
function ft() {
  const h = Xe(),
    { state: M, setState: v, derived: P, playersById: c, loading: Y } = Je(),
    { clubMode: R } = Ke(),
    N = Be.useMemo(() => Qe(), []);
  return Y || !M
    ? e.jsxs('div', {
        className: `text-center py-12 ${N.cardBg} ${N.border} rounded-xl m-4`,
        children: [
          e.jsx('div', { className: 'text-4xl mb-4', children: '⏳' }),
          e.jsx('h3', {
            className: `text-lg font-medium mb-2 ${N.text}`,
            children: 'Caricamento...',
          }),
          e.jsx('p', {
            className: `${N.subtext}`,
            children: 'Caricamento configurazione campi in corso...',
          }),
        ],
      })
    : R
      ? e.jsx(st, { T: N, state: M, setState: v, players: P.players, playersById: c })
      : e.jsxs('div', {
          className: `text-center py-12 ${N.cardBg} ${N.border} rounded-xl m-4`,
          children: [
            e.jsx('div', { className: 'text-6xl mb-4', children: '🔒' }),
            e.jsx('h3', {
              className: `text-xl font-bold mb-2 ${N.text}`,
              children: 'Modalità Club Richiesta',
            }),
            e.jsx('p', {
              className: `${N.subtext} mb-4`,
              children:
                'Per accedere alla gestione campi, devi prima sbloccare la modalità club nella sezione Extra.',
            }),
            e.jsx('button', {
              onClick: () => h('/extra'),
              className: `${N.btnPrimary} px-6 py-3`,
              children: 'Vai a Extra per sbloccare',
            }),
          ],
        });
}
export { ft as default };
