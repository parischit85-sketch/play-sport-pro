import { r as n } from './router-mfgod96n-jGu93CuW.js';
import { u as S } from './index-mfgod96n-DwV9PbJ5.js';
import { U as i } from './unified-booking-service-mfgod96n-DTtpuuMW.js';
const { BOOKING_STATUS: K } = i.CONSTANTS;
function C(B = {}) {
  const { user: a } = S(),
    [k, l] = n.useState([]),
    [d, f] = n.useState([]),
    [m, L] = n.useState([]),
    [h, c] = n.useState(!0),
    [g, u] = n.useState(null),
    { autoLoadUser: p = !0, autoLoadLessons: U = !0, enableRealtime: E = !0 } = B;
  n.useEffect(() => {
    (i.initialize({ cloudEnabled: !0, user: a }), i.migrateOldData());
  }, [a]);
  const w = n.useCallback(
    async (s = !1) => {
      try {
        (c(!0), u(null));
        const e = await i.getPublicBookings({ forceRefresh: s });
        if ((l(e), a && p)) {
          const t = await i.getUserBookings(a);
          f(t);
        }
        if (U) {
          const t = await i.getLessonBookings();
          L(t);
        }
      } catch (e) {
        (console.error('Error loading bookings:', e), u(e.message));
      } finally {
        c(!1);
      }
    },
    [a, p, U]
  );
  (n.useEffect(() => {
    w();
  }, [w]),
    n.useEffect(() => {
      if (!E) return;
      const s = i.addEventListener('bookingsUpdated', (r) => {
          l(r.bookings);
        }),
        e = i.addEventListener('bookingCreated', (r) => {
          w(!0);
        }),
        t = i.addEventListener('bookingDeleted', ({ id: r }) => {
          (l((o) => o.filter((y) => y.id !== r)),
            f((o) => o.filter((y) => y.id !== r)),
            L((o) => o.filter((y) => y.id !== r)));
        });
      return () => {
        (s(), e(), t());
      };
    }, [E, w]));
  const v = n.useCallback(
      async (s) => {
        try {
          c(!0);
          const e = await i.createBooking(s, a);
          return (await w(!0), e);
        } catch (e) {
          throw (u(e.message), e);
        } finally {
          c(!1);
        }
      },
      [a, w]
    ),
    A = n.useCallback(
      async (s, e) => {
        try {
          const t = await i.updateBooking(s, e, a);
          return (
            l((r) => r.map((o) => (o.id === s ? { ...o, ...e } : o))),
            f((r) => r.map((o) => (o.id === s ? { ...o, ...e } : o))),
            L((r) => r.map((o) => (o.id === s ? { ...o, ...e } : o))),
            t
          );
        } catch (t) {
          throw (u(t.message), t);
        }
      },
      [a]
    ),
    O = n.useCallback(
      async (s) => {
        try {
          const e = await i.cancelBooking(s, a),
            t = { status: 'cancelled', cancelledAt: new Date().toISOString() };
          return (
            l((r) => r.map((o) => (o.id === s ? { ...o, ...t } : o))),
            f((r) => r.map((o) => (o.id === s ? { ...o, ...t } : o))),
            L((r) => r.map((o) => (o.id === s ? { ...o, ...t } : o))),
            e
          );
        } catch (e) {
          throw (u(e.message), e);
        }
      },
      [a]
    ),
    M = n.useCallback(
      async (s) => {
        try {
          (await i.deleteBooking(s, a),
            l((e) => e.filter((t) => t.id !== s)),
            f((e) => e.filter((t) => t.id !== s)),
            L((e) => e.filter((t) => t.id !== s)));
        } catch (e) {
          throw (u(e.message), e);
        }
      },
      [a]
    ),
    N = n.useMemo(() => k.filter((s) => s.status === 'confirmed'), [k]),
    T = n.useMemo(() => d.filter((s) => s.status === 'confirmed'), [d]),
    b = n.useMemo(() => m.filter((s) => s.status === 'confirmed'), [m]),
    D = n.useMemo(() => k.filter((s) => !s.isLessonBooking), [k]);
  return {
    bookings: k,
    userBookings: d,
    lessonBookings: m,
    activeBookings: N,
    activeUserBookings: T,
    activeLessonBookings: b,
    courtBookings: D,
    loading: h,
    error: g,
    createBooking: v,
    updateBooking: A,
    cancelBooking: O,
    deleteBooking: M,
    refresh: w,
    clearError: () => u(null),
  };
}
function P() {
  const { user: B } = S(),
    {
      lessonBookings: a,
      loading: k,
      error: l,
      createBooking: d,
      cancelBooking: f,
      refresh: m,
    } = C({ autoLoadUser: !0, autoLoadLessons: !0 }),
    L = n.useCallback(
      async (c) => {
        const g = await d({ ...c, type: 'lesson', isLessonBooking: !0 });
        if (c.createCourtBooking !== !1) {
          const u = await d({
            ...c,
            type: 'court',
            isLessonBooking: !0,
            notes: `Lezione con ${c.instructorName || 'istruttore'}`,
            courtBookingId: g.id,
          });
          g.courtBookingId = u.id;
        }
        return g;
      },
      [d]
    ),
    h = n.useCallback(async () => {
      const c = await i.getLessonBookings();
      for (const g of c)
        try {
          (await i.deleteBooking(g.id, B),
            g.courtBookingId && (await i.deleteBooking(g.courtBookingId, B)));
        } catch (u) {
          console.warn('Error deleting lesson:', g.id, u);
        }
      return (await m(!0), c.length);
    }, [B, m]);
  return {
    lessonBookings: a,
    loading: k,
    error: l,
    createLessonBooking: L,
    cancelBooking: f,
    clearAllLessons: h,
    refresh: m,
  };
}
function R() {
  const {
    userBookings: B,
    activeUserBookings: a,
    loading: k,
    error: l,
    refresh: d,
  } = C({ autoLoadUser: !0, autoLoadLessons: !1 });
  return { userBookings: B, activeUserBookings: a, loading: k, error: l, refresh: d };
}
export { K as B, R as a, P as b, C as u };
