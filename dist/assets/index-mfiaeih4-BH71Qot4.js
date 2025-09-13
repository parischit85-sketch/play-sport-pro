const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/LoginPage-mfiaeih4-D6cNoLTE.js',
      'assets/router-mfiaeih4-DNPpahz0.js',
      'assets/vendor-mfiaeih4-D3F3s8fL.js',
      'assets/Section-mfiaeih4-DiH4h-T9.js',
      'assets/firebase-mfiaeih4-X_I_guKF.js',
      'assets/DashboardPage-mfiaeih4-B6JBE8hn.js',
      'assets/ClassificaPage-mfiaeih4-DL7K_yCQ.js',
      'assets/charts-mfiaeih4-DMw8RURm.js',
      'assets/ShareButtons-mfiaeih4-yxDytiyk.js',
      'assets/StatsPage-mfiaeih4-CoH8pDng.js',
      'assets/Modal-mfiaeih4-DqY2S1Zr.js',
      'assets/names-mfiaeih4-BW9lV2zG.js',
      'assets/BookingPage-mfiaeih4-L9lykQc3.js',
      'assets/Badge-mfiaeih4-BV5ik9nr.js',
      'assets/design-system-mfiaeih4-B5fzZ68S.js',
      'assets/pricing-mfiaeih4-BdjzWTQe.js',
      'assets/useUnifiedBookings-mfiaeih4-B_RTsWnr.js',
      'assets/unified-booking-service-mfiaeih4-D7duu2eN.js',
      'assets/LessonBookingPage-mfiaeih4-B6FKKRrB.js',
      'assets/playerTypes-mfiaeih4-CIm-hM8a.js',
      'assets/PlayersPage-mfiaeih4-hAcfgnb0.js',
      'assets/MatchesPage-mfiaeih4-_4D0ONW6.js',
      'assets/TournamentsPage-mfiaeih4-QCv7_2Sy.js',
      'assets/ProfilePage-mfiaeih4-BkvhQDrG.js',
      'assets/ExtraPage-mfiaeih4-D2-nef3t.js',
      'assets/format-mfiaeih4-DAEZv7Mi.js',
      'assets/AdminBookingsPage-mfiaeih4-BMgX2YLP.js',
      'assets/DarkModeTestPage-mfiaeih4-DtGvE0tQ.js',
    ])
) => i.map((i) => d[i]);
import { r as De, a as Oe } from './vendor-mfiaeih4-D3F3s8fL.js';
import {
  r as p,
  b as N,
  u as te,
  N as $,
  c as $e,
  O as Ue,
  B as Fe,
  d as He,
  e as _,
} from './router-mfiaeih4-DNPpahz0.js';
import {
  g as ge,
  a as fe,
  i as pe,
  b as xe,
  c as be,
  d as Ve,
  s as qe,
  e as Ge,
  f as U,
  h as we,
  G as Je,
  j as ve,
  k as Ke,
  F as Ye,
  l as Xe,
  m as Ze,
  n as Qe,
  o as ye,
  u as et,
  p as ke,
  q as je,
  r as tt,
  t as rt,
  v as at,
  w as st,
} from './firebase-mfiaeih4-X_I_guKF.js';
(function () {
  const t = document.createElement('link').relList;
  if (t && t.supports && t.supports('modulepreload')) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) o(s);
  new MutationObserver((s) => {
    for (const u of s)
      if (u.type === 'childList')
        for (const n of u.addedNodes) n.tagName === 'LINK' && n.rel === 'modulepreload' && o(n);
  }).observe(document, { childList: !0, subtree: !0 });
  function a(s) {
    const u = {};
    return (
      s.integrity && (u.integrity = s.integrity),
      s.referrerPolicy && (u.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === 'use-credentials'
        ? (u.credentials = 'include')
        : s.crossOrigin === 'anonymous'
          ? (u.credentials = 'omit')
          : (u.credentials = 'same-origin'),
      u
    );
  }
  function o(s) {
    if (s.ep) return;
    s.ep = !0;
    const u = a(s);
    fetch(s.href, u);
  }
})();
var K = { exports: {} },
  W = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var le;
function ot() {
  if (le) return W;
  le = 1;
  var r = De(),
    t = Symbol.for('react.element'),
    a = Symbol.for('react.fragment'),
    o = Object.prototype.hasOwnProperty,
    s = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    u = { key: !0, ref: !0, __self: !0, __source: !0 };
  function n(l, d, h) {
    var m,
      g = {},
      c = null,
      i = null;
    (h !== void 0 && (c = '' + h),
      d.key !== void 0 && (c = '' + d.key),
      d.ref !== void 0 && (i = d.ref));
    for (m in d) o.call(d, m) && !u.hasOwnProperty(m) && (g[m] = d[m]);
    if (l && l.defaultProps) for (m in ((d = l.defaultProps), d)) g[m] === void 0 && (g[m] = d[m]);
    return { $$typeof: t, type: l, key: c, ref: i, props: g, _owner: s.current };
  }
  return ((W.Fragment = a), (W.jsx = n), (W.jsxs = n), W);
}
var ce;
function nt() {
  return (ce || ((ce = 1), (K.exports = ot())), K.exports);
}
var e = nt(),
  V = {},
  de;
function it() {
  if (de) return V;
  de = 1;
  var r = Oe();
  return ((V.createRoot = r.createRoot), (V.hydrateRoot = r.hydrateRoot), V);
}
var lt = it();
const ct = 'modulepreload',
  dt = function (r) {
    return '/' + r;
  },
  ue = {},
  M = function (t, a, o) {
    let s = Promise.resolve();
    if (a && a.length > 0) {
      let d = function (h) {
        return Promise.all(
          h.map((m) =>
            Promise.resolve(m).then(
              (g) => ({ status: 'fulfilled', value: g }),
              (g) => ({ status: 'rejected', reason: g })
            )
          )
        );
      };
      document.getElementsByTagName('link');
      const n = document.querySelector('meta[property=csp-nonce]'),
        l = n?.nonce || n?.getAttribute('nonce');
      s = d(
        a.map((h) => {
          if (((h = dt(h)), h in ue)) return;
          ue[h] = !0;
          const m = h.endsWith('.css'),
            g = m ? '[rel="stylesheet"]' : '';
          if (document.querySelector(`link[href="${h}"]${g}`)) return;
          const c = document.createElement('link');
          if (
            ((c.rel = m ? 'stylesheet' : ct),
            m || (c.as = 'script'),
            (c.crossOrigin = ''),
            (c.href = h),
            l && c.setAttribute('nonce', l),
            document.head.appendChild(c),
            m)
          )
            return new Promise((i, f) => {
              (c.addEventListener('load', i),
                c.addEventListener('error', () => f(new Error(`Unable to preload CSS for ${h}`))));
            });
        })
      );
    }
    function u(n) {
      const l = new Event('vite:preloadError', { cancelable: !0 });
      if (((l.payload = n), window.dispatchEvent(l), !l.defaultPrevented)) throw n;
    }
    return s.then((n) => {
      for (const l of n || []) l.status === 'rejected' && u(l.reason);
      return t().catch(u);
    });
  },
  O = {
    apiKey: 'AIzaSyDMP7772cyEY1oLzo8f9hMW7Leu4lWc6OU',
    authDomain: 'm-padelweb.firebaseapp.com',
    projectId: 'm-padelweb',
    appId: '1:1004722051733:web:3ce3c4476a9e329d80999c',
    storageBucket: 'm-padelweb.firebasestorage.app',
    messagingSenderId: '1004722051733',
    measurementId: 'G-0XZCHGMWVR',
  },
  ut = ['apiKey', 'authDomain', 'projectId', 'appId'],
  he = ut.filter((r) => !O[r]);
if (he.length > 0) throw new Error(`Missing Firebase configuration: ${he.join(', ')}`);
const Se = ge().length ? fe() : pe(O),
  re = xe(Se, {
    experimentalAutoDetectLongPolling: !0,
    experimentalForceLongPolling: !1,
    useFetchStreams: !1,
  }),
  E = be(Se);
E.useDeviceLanguage && E.useDeviceLanguage();
try {
  if (typeof window < 'u' && new URLSearchParams(window.location.search || '').has('authdebug')) {
    const t = {
      projectId: O.projectId,
      authDomain: O.authDomain,
      appId: O.appId,
      emulator: !1,
      isDev: !1,
      user: E?.currentUser ? { uid: E.currentUser.uid } : null,
    };
    console.log('[Firebase][authdebug]', t);
  }
} catch {}
function Ce(r) {
  return at(
    E,
    (t) => {
      try {
        r(t);
      } catch (a) {
        (console.error('onAuth callback error:', a), r(null));
      }
    },
    (t) => {
      (console.error('Firebase Auth error:', t), r(null));
    }
  );
}
async function ht() {
  const r = new Je();
  (r.addScope('email'), r.addScope('profile'), r.setCustomParameters({ prompt: 'select_account' }));
  let t = null;
  try {
    t = await ve(E, r);
  } catch (a) {
    const o = String(a?.message || '').toLowerCase(),
      s = String(a?.code || '').toLowerCase();
    if (o.includes('cross-origin-opener-policy') || o.includes('window.closed')) return t;
    if (
      s.includes('auth/unauthorized-domain') ||
      s.includes('auth/operation-not-supported') ||
      s.includes('auth/popup-blocked') ||
      s.includes('auth/popup-closed-by-user') ||
      o.includes('requests-from-referer') ||
      o.includes('cross-origin') ||
      o.includes('popup')
    )
      return (await Ke(E, r), null);
    throw a;
  }
  return (t && t.user && (await Ae(t.user)), t);
}
async function Ae(r) {
  try {
    const t = await F(r.uid);
    if (!t.email || !t.firstName) {
      const a = (r.displayName || '').split(' '),
        o = {
          email: r.email,
          firstName: t.firstName || a[0] || '',
          lastName: t.lastName || a.slice(1).join(' ') || '',
          phone: t.phone || '',
          avatar: r.photoURL || '',
          provider: 'google',
          ...t,
        };
      await q(r.uid, o);
    }
  } catch (t) {
    console.warn('Errore creazione/aggiornamento profilo:', t);
  }
}
async function mt() {
  const r = new Ye();
  (r.addScope('email'), r.addScope('public_profile'));
  const t = await ve(E, r);
  return (t && t.user && (await Ae(t.user)), t);
}
async function gt(r, t) {
  if (!r || !t) throw new Error('Email e password sono obbligatorie');
  const a = await Xe(E, r, t);
  if (a.user) {
    const o = await F(a.user.uid);
    o.email ||
      (await q(a.user.uid, {
        email: a.user.email,
        firstName: '',
        lastName: '',
        phone: '',
        provider: 'password',
        ...o,
      }));
  }
  return a;
}
async function ft(r, t) {
  if (!r || !t) throw new Error('Email e password sono obbligatorie');
  return Ze(E, r, t);
}
async function pt(r) {
  if (!r) throw new Error('Email obbligatoria');
  return Qe(E, r);
}
async function xt() {
  try {
    const r = window.location.href;
    if (!Ve(E, r)) return null;
    let t = null;
    try {
      t = localStorage.getItem('ml-magic-email');
    } catch {}
    t || (t = window.prompt('Per completare l’accesso, inserisci la tua email:') || '');
    const a = await qe(E, t, r);
    try {
      localStorage.removeItem('ml-magic-email');
    } catch {}
    if ((window.history.replaceState({}, document.title, window.location.pathname), a.user)) {
      const o = await F(a.user.uid);
      if (!o.email) {
        const s = {
          email: a.user.email,
          firstName: '',
          lastName: '',
          phone: '',
          provider: 'email',
          ...o,
        };
        await q(a.user.uid, s);
      }
    }
    return a;
  } catch (r) {
    throw (console.warn('completeMagicLinkIfPresent error:', r), r);
  }
}
async function bt() {
  await Ge(E);
}
async function F(r) {
  const t = U(re, 'profiles', r),
    a = await we(t);
  return a.exists() ? a.data() : {};
}
async function q(r, t) {
  const a = U(re, 'profiles', r);
  await ye(a, { ...t, _updatedAt: Date.now() }, { merge: !0 });
}
async function wt(r, t) {
  await et(r, { displayName: t });
}
async function vt(r = 500) {
  const t = ke(re, 'profiles'),
    a = await je(tt(t, rt(r))),
    o = [];
  return (
    a.forEach((s) => {
      const u = s.data() || {};
      o.push({ uid: s.id, ...u });
    }),
    o
  );
}
const hr = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        auth: E,
        completeMagicLinkIfPresent: xt,
        getUserProfile: F,
        listAllUserProfiles: vt,
        loginWithEmailPassword: ft,
        loginWithFacebook: mt,
        loginWithGoogle: ht,
        logout: bt,
        onAuth: Ce,
        registerWithEmailPassword: gt,
        saveUserProfile: q,
        sendResetPassword: pt,
        setDisplayName: wt,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  Ne = p.createContext(null),
  G = () => {
    const r = p.useContext(Ne);
    if (!r) throw new Error('useAuth must be used within an AuthProvider');
    return r;
  };
function yt({ children: r }) {
  const [t, a] = p.useState(null),
    [o, s] = p.useState(null),
    [u, n] = p.useState(!0),
    [l, d] = p.useState(null);
  p.useEffect(
    () =>
      Ce(async (i) => {
        try {
          if ((a(i), i)) {
            const f = await F(i.uid);
            s(f);
          } else s(null);
          d(null);
        } catch (f) {
          (console.error('Auth error:', f), d(f), s(null));
        } finally {
          n(!1);
        }
      }),
    []
  );
  const h = !!t,
    m = o?.firstName && o?.phone,
    g = {
      user: t,
      userProfile: o,
      setUserProfile: s,
      loading: u,
      error: l,
      isAuthenticated: h,
      isProfileComplete: m,
    };
  return e.jsx(Ne.Provider, { value: g, children: r });
}
const kt = {
    apiKey: 'AIzaSyDMP7772cyEY1oLzo8f9hMW7Leu4lWc6OU',
    authDomain: 'm-padelweb.firebaseapp.com',
    projectId: 'm-padelweb',
  },
  Ie = ge().length ? fe() : pe(kt);
be(Ie);
const H = xe(Ie, {
  experimentalAutoDetectLongPolling: !0,
  experimentalForceLongPolling: !1,
  useFetchStreams: !1,
});
async function ae(r) {
  const t = await we(U(H, 'leagues', r));
  return t.exists() ? t.data() : null;
}
async function jt() {
  try {
    const r = await je(ke(H, 'leagues')),
      t = [];
    return (
      r.forEach((a) => {
        const o = a.data();
        t.push({
          id: a.id,
          name: o.name || a.id,
          players: o.players?.length || 0,
          matches: o.matches?.length || 0,
          lastUpdated: o._updatedAt ? new Date(o._updatedAt).toLocaleString() : 'N/A',
          courts: o.courts?.length || 0,
        });
      }),
      t.sort((a, o) => (o._updatedAt || 0) - (a._updatedAt || 0))
    );
  } catch (r) {
    return (console.error('Errore nel recupero della lista backup:', r), []);
  }
}
async function Pe(r, t) {
  if (t._restored) console.log('🔥 Ripristino manuale autorizzato - bypassando protezioni');
  else if (t.players && t.players.length < 5) {
    (console.warn(
      '🚨 PROTEZIONE ATTIVA: Rifiutato salvataggio di dati con pochi giocatori (possibili seed data)'
    ),
      console.warn('Dati non salvati:', {
        players: t.players?.length,
        matches: t.matches?.length,
      }));
    return;
  }
  try {
    const a = await ae(r);
    if (a && a.players && a.players.length > (t.players?.length || 0)) {
      const o = `firebase-backup-${Date.now()}`;
      (localStorage.setItem(
        o,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          data: a,
          reason: 'Auto-backup before potential data loss',
        })
      ),
        console.log('🔒 Backup automatico creato prima del salvataggio:', o));
    }
  } catch (a) {
    console.warn('Impossibile creare backup automatico:', a);
  }
  (await ye(U(H, 'leagues', r), t, { merge: !0 }),
    console.log('✅ Dati salvati nel cloud:', {
      players: t.players?.length,
      matches: t.matches?.length,
    }));
}
function Le(r, t) {
  return st(U(H, 'leagues', r), (a) => {
    a.exists() && t(a.data());
  });
}
const mr = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        db: H,
        listLeagues: jt,
        loadLeague: ae,
        saveLeague: Pe,
        subscribeLeague: Le,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  D = (r) => Math.round(Number(r || 0)),
  Y = (r) => Number(r || 0).toFixed(2);
function St(r) {
  return (r || [])
    .filter((t) => String(t?.a ?? '') !== '' || String(t?.b ?? '') !== '')
    .map((t) => `${Number(t.a || 0)}-${Number(t.b || 0)}`)
    .join(', ');
}
function X(r) {
  let t = 0,
    a = 0,
    o = 0,
    s = 0;
  for (const n of r || []) {
    const l = Number(n?.a || 0),
      d = Number(n?.b || 0);
    (String(l) === '' && String(d) === '') || ((o += l), (s += d), l > d ? t++ : d > l && a++);
  }
  let u = null;
  return (
    t > a ? (u = 'A') : a > t && (u = 'B'),
    { setsA: t, setsB: a, gamesA: o, gamesB: s, winner: u }
  );
}
function Ct(r) {
  return r <= -2e3
    ? 0.4
    : r <= -1500
      ? 0.6
      : r <= -900
        ? 0.75
        : r <= -300
          ? 0.9
          : r < 300 && r > -300
            ? 1
            : r <= 900
              ? 1.1
              : r <= 1500
                ? 1.25
                : r <= 2e3
                  ? 1.4
                  : 1.6;
}
function At(r) {
  return r <= -2e3
    ? 'gap ≤ −2000 ⇒ 0.40'
    : r <= -1500
      ? '−2000 < gap ≤ −1500 ⇒ 0.60'
      : r <= -900
        ? '−1500 < gap ≤ −900 ⇒ 0.75'
        : r <= -300
          ? '−900 < gap ≤ −300 ⇒ 0.90'
          : r < 300 && r > -300
            ? '−300 < gap < +300 ⇒ 1.00'
            : r <= 900
              ? '+300 ≤ gap ≤ +900 ⇒ 1.10'
              : r <= 1500
                ? '+900 < gap ≤ +1500 ⇒ 1.25'
                : r <= 2e3
                  ? '+1500 < gap ≤ +2000 ⇒ 1.40'
                  : 'gap ≥ +2000 ⇒ 1.60';
}
function Z({
  ratingA1: r,
  ratingA2: t,
  ratingB1: a,
  ratingB2: o,
  gamesA: s,
  gamesB: u,
  winner: n,
  sets: l,
}) {
  const d = Number(r || 0),
    h = Number(t || 0),
    m = Number(a || 0),
    g = Number(o || 0),
    c = d + h,
    i = m + g,
    f = n === 'A' ? c : i,
    j = n === 'A' ? i : c,
    x = (c + i) / 100,
    b = j - f,
    C = Ct(b),
    L = n === 'A' ? s - u : u - s,
    v = (x + L) * C,
    y = Math.round(v),
    A = n === 'A' ? y : -y,
    k = n === 'B' ? y : -y,
    w = `Risultato set: ${St(l)}`,
    P =
      `Team A=${D(c)}, Team B=${D(i)}, Gap=${D(b)}
Fascia: ${At(b)}

Base = (${D(c)} + ${D(i)})/100 = ${Y(x)}
DG (Differenza Game) = ${L}

Punti = (Base + DG) × factor = (${Y(x)} + ${L}) × ${C.toFixed(2)} = ${Y(v)}
Punti (arrotondato) = ${y}
` +
      (n === 'A' ? `Team A +${y}, Team B -${y}` : `Team B +${y}, Team A -${y}`) +
      `
${w}`;
  return {
    deltaA: A,
    deltaB: k,
    pts: y,
    base: x,
    factor: C,
    gap: b,
    sumA: c,
    sumB: i,
    gd: L,
    formula: P,
  };
}
const gr = () => Math.random().toString(36).slice(2, 10),
  I = 1e3,
  T = 'paris-league-v1';
function Nt(r, t) {
  const a = new Map(
      r.map((n) => {
        const l = Number(n.baseRating ?? n.startRating ?? n.rating ?? I);
        return [
          n.id,
          {
            ...n,
            rating: l,
            wins: 0,
            losses: 0,
            lastDelta: 0,
            trend5Total: 0,
            trend5Pos: 0,
            trend5Neg: 0,
          },
        ];
      })
    ),
    o = new Map(r.map((n) => [n.id, []])),
    s = [],
    u = [...(t || [])].sort((n, l) => new Date(n.date) - new Date(l.date));
  for (const n of u) {
    const l = a.get(n.teamA[0]),
      d = a.get(n.teamA[1]),
      h = a.get(n.teamB[0]),
      m = a.get(n.teamB[1]),
      g = X(n.sets),
      c = Z({
        ratingA1: l?.rating ?? I,
        ratingA2: d?.rating ?? I,
        ratingB1: h?.rating ?? I,
        ratingB2: m?.rating ?? I,
        gamesA: g.gamesA,
        gamesB: g.gamesB,
        winner: g.winner,
        sets: n.sets,
      }),
      i = { ...n, ...g, ...c };
    s.push(i);
    const f = (j, x) => {
      if (!j) return;
      const b = o.get(j) || [];
      (b.push(x), o.set(j, b));
    };
    (f(l?.id, c.deltaA),
      f(d?.id, c.deltaA),
      f(h?.id, c.deltaB),
      f(m?.id, c.deltaB),
      l && (l.lastDelta = c.deltaA),
      d && (d.lastDelta = c.deltaA),
      h && (h.lastDelta = c.deltaB),
      m && (m.lastDelta = c.deltaB),
      g.winner === 'A'
        ? (l && (l.rating += c.deltaA),
          d && (d.rating += c.deltaA),
          h && (h.rating += c.deltaB),
          m && (m.rating += c.deltaB),
          l && l.wins++,
          d && d.wins++,
          h && h.losses++,
          m && m.losses++)
        : g.winner === 'B' &&
          (l && (l.rating += c.deltaA),
          d && (d.rating += c.deltaA),
          h && (h.rating += c.deltaB),
          m && (m.rating += c.deltaB),
          h && h.wins++,
          m && m.wins++,
          l && l.losses++,
          d && d.losses++));
  }
  for (const n of a.values()) {
    const d = (o.get(n.id) || []).slice(-5);
    let h = 0,
      m = 0,
      g = 0;
    for (const c of d) ((g += c), c >= 0 ? (h += c) : (m += -c));
    ((n.trend5Total = g), (n.trend5Pos = h), (n.trend5Neg = m));
  }
  return { players: Array.from(a.values()), matches: s };
}
function fr(r, t, a) {
  const o = new Map(r.map((i) => [i.id, i.name])),
    u = [...(t || [])].sort((i, f) => new Date(i.date) - new Date(f.date)).slice(-15),
    n = new Map(r.map((i) => [i.id, Number(i.rating ?? I)])),
    l = new Map(n),
    d = [...u].reverse();
  for (const i of d) {
    const f = X(i.sets),
      j = Z({
        ratingA1: l.get(i.teamA[0]) ?? I,
        ratingA2: l.get(i.teamA[1]) ?? I,
        ratingB1: l.get(i.teamB[0]) ?? I,
        ratingB2: l.get(i.teamB[1]) ?? I,
        gamesA: f.gamesA,
        gamesB: f.gamesB,
        winner: f.winner,
        sets: i.sets,
      }),
      x = (b, C) => l.set(b, (l.get(b) ?? I) - C);
    (x(i.teamA[0], j.deltaA),
      x(i.teamA[1], j.deltaA),
      x(i.teamB[0], j.deltaB),
      x(i.teamB[1], j.deltaB));
  }
  const h = new Map(l),
    m = [],
    g = { label: 'Inizio periodo' };
  for (const i of a) g[o.get(i) || i] = Math.round(h.get(i) ?? I);
  m.push(g);
  for (const i of u) {
    const f = X(i.sets),
      j = Z({
        ratingA1: h.get(i.teamA[0]) ?? I,
        ratingA2: h.get(i.teamA[1]) ?? I,
        ratingB1: h.get(i.teamB[0]) ?? I,
        ratingB2: h.get(i.teamB[1]) ?? I,
        gamesA: f.gamesA,
        gamesB: f.gamesB,
        winner: f.winner,
        sets: i.sets,
      }),
      x = (C, L) => h.set(C, (h.get(C) ?? I) + L);
    (x(i.teamA[0], j.deltaA),
      x(i.teamA[1], j.deltaA),
      x(i.teamB[0], j.deltaB),
      x(i.teamB[1], j.deltaB));
    const b = {
      label: new Date(i.date).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    for (const C of a) b[o.get(C) || C] = Math.round(h.get(C) ?? I);
    m.push(b);
  }
  const c = { label: 'Attuale' };
  for (const i of a) c[o.get(i) || i] = Math.round(n.get(i) ?? I);
  return (m.push(c), m);
}
function z() {
  return {
    slotMinutes: 30,
    dayStartHour: 8,
    dayEndHour: 23,
    defaultDurations: [60, 90, 120],
    pricing: { full: [], discounted: [] },
    addons: { lightingEnabled: !0, lightingFee: 2, heatingEnabled: !0, heatingFee: 4 },
    baseRateWeekday: 24,
    baseRatePeak: 32,
    baseRateWeekend: 28,
    peakStartHour: 17,
    peakEndHour: 22,
  };
}
function me() {
  return { players: [], matches: [], courts: [], bookings: [], bookingConfig: z() };
}
const _e = p.createContext(null),
  It = () => {
    const r = p.useContext(_e);
    if (!r) throw new Error('useLeague must be used within a LeagueProvider');
    return r;
  };
function Pt({ children: r }) {
  const { user: t, loading: a } = G(),
    [o, s] = p.useState(null),
    [u, n] = p.useState(!0),
    [l, d] = p.useState(null),
    [h, m] = p.useState(!1),
    [g, c] = p.useState(localStorage.getItem(T + '-leagueId') || 'lega-andrea-2025'),
    i = p.useRef(null);
  if (!i.current) {
    const v = (() => {
      try {
        return localStorage.getItem('ml-client-id');
      } catch {
        return null;
      }
    })();
    if (v) i.current = v;
    else {
      const y = Math.random().toString(36).slice(2, 10);
      i.current = y;
      try {
        localStorage.setItem('ml-client-id', y);
      } catch {}
    }
  }
  const f = p.useRef(0),
    j = p.useRef(null);
  p.useEffect(() => {
    localStorage.setItem(T + '-leagueId', g);
  }, [g]);
  const x = (v) => {
    s((y) => {
      const A = typeof v == 'function' ? v(y) : v,
        k = Date.now(),
        w = (y?._rev || 0) + 1;
      return ((f.current = k + 2e3), { ...A, _updatedAt: k, _rev: w, _lastWriter: i.current });
    });
  };
  (p.useEffect(() => {
    a ||
      (async () => {
        try {
          if ((n(!0), d(null), t)) {
            const A = await ae(g);
            if (A && typeof A == 'object' && Array.isArray(A.players) && Array.isArray(A.matches)) {
              const w = { ...A };
              (Array.isArray(w.courts) || (w.courts = []),
                Array.isArray(w.bookings) || (w.bookings = []),
                w.bookingConfig || (w.bookingConfig = z()),
                w.bookingConfig.pricing || (w.bookingConfig.pricing = z().pricing),
                w.bookingConfig.addons || (w.bookingConfig.addons = z().addons),
                s(w));
              const P = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
              j.current = P.reduce((R, B) => ((R[B] = w[B]), R), {});
              try {
                localStorage.setItem(T, JSON.stringify(w));
              } catch {}
              return;
            }
          }
          try {
            const A = localStorage.getItem(T);
            if (A) {
              const k = JSON.parse(A);
              if (k && Array.isArray(k.players) && Array.isArray(k.matches)) {
                s(k);
                const w = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
                j.current = w.reduce((P, R) => ((P[R] = k[R] || []), P), {});
                return;
              }
            }
          } catch {}
          const v = me();
          s(v);
          const y = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
          ((j.current = y.reduce((A, k) => ((A[k] = v[k] || []), A), {})),
            console.log('� App inizializzata con stato vuoto - aggiungi i tuoi dati!'));
          try {
            localStorage.setItem(T, JSON.stringify(v));
          } catch {}
        } catch (v) {
          (console.error('League load error:', v), d(v));
          const y = me();
          s(y);
        } finally {
          n(!1);
        }
      })();
  }, [g, t, a]),
    p.useEffect(() => {
      if (!g || !t || a) return;
      let v = null;
      try {
        v = Le(g, (y) => {
          if (
            !(y && typeof y == 'object' && Array.isArray(y.players) && Array.isArray(y.matches)) ||
            Date.now() < f.current
          )
            return;
          const k = { ...y };
          (Array.isArray(k.courts) || (k.courts = []),
            Array.isArray(k.bookings) || (k.bookings = []),
            k.bookingConfig || (k.bookingConfig = z()),
            k.bookingConfig.pricing || (k.bookingConfig.pricing = z().pricing),
            k.bookingConfig.addons || (k.bookingConfig.addons = z().addons),
            k.lessonConfig || (k.lessonConfig = {}),
            m(!0),
            s((w) => {
              const P = w?._rev ?? 0,
                R = k?._rev ?? 0,
                B = w?._updatedAt ?? 0,
                J = k?._updatedAt ?? 0,
                oe = R > P || (R === P && J > B);
              if (oe) {
                const We = [
                  'players',
                  'matches',
                  'courts',
                  'bookings',
                  'bookingConfig',
                  'lessonConfig',
                ];
                j.current = We.reduce((ne, ie) => ((ne[ie] = k[ie]), ne), {});
              }
              return oe ? k : w;
            }),
            m(!1));
        });
      } catch (y) {
        console.error('Subscribe error:', y);
      }
      return () => v && v();
    }, [g, t, a]),
    p.useEffect(() => {
      if (!o || h || !t) return;
      const v = ['players', 'matches', 'courts', 'bookings', 'bookingConfig', 'lessonConfig'],
        y = v.reduce((w, P) => ((w[P] = o[P]), w), {}),
        A = j.current;
      if (!A || v.some((w) => JSON.stringify(y[w]) !== JSON.stringify(A[w])))
        try {
          localStorage.setItem(T, JSON.stringify(o));
          const P = {
              ...Object.fromEntries(Object.entries(o).filter(([B, J]) => J !== void 0)),
              _updatedAt: Date.now(),
              _lastWriter: i.current,
              _rev: (o._rev || 0) + 1,
            },
            R = setTimeout(async () => {
              try {
                (await Pe(g, P), (j.current = y));
              } catch (B) {
                console.error('Cloud save error:', B);
              }
            }, 800);
          return () => clearTimeout(R);
        } catch (w) {
          console.error('LocalStorage save error:', w);
        }
    }, [o, g, h, t]));
  const b = N.useMemo(
      () => (o ? Nt(o.players || [], o.matches || []) : { players: [], matches: [] }),
      [o]
    ),
    C = N.useMemo(() => Object.fromEntries((b.players || []).map((v) => [v.id, v])), [b]),
    L = {
      state: o,
      setState: x,
      derived: b,
      playersById: C,
      leagueId: g,
      setLeagueId: c,
      loading: u,
      error: l,
      updatingFromCloud: h,
    };
  return e.jsx(_e.Provider, { value: L, children: r });
}
const Ee = p.createContext(null),
  Me = () => {
    const r = p.useContext(Ee);
    if (!r) throw new Error('useUI must be used within a UIProvider');
    return r;
  };
function Lt({ children: r }) {
  const [t, a] = p.useState(() => {
      try {
        const b = localStorage.getItem('play-sport-pro-theme');
        return b ? b === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {
        return !1;
      }
    }),
    [o, s] = p.useState(() => {
      try {
        const b = sessionStorage.getItem('ml-extra-unlocked') === '1',
          C = sessionStorage.getItem('ml-club-mode') === '1';
        return b && C;
      } catch {
        return !1;
      }
    }),
    [u, n] = p.useState([]),
    [l, d] = p.useState(!1),
    [h, m] = p.useState(null);
  (p.useEffect(() => {
    try {
      t
        ? (document.documentElement.classList.add('dark'),
          localStorage.setItem('play-sport-pro-theme', 'dark'))
        : (document.documentElement.classList.remove('dark'),
          localStorage.setItem('play-sport-pro-theme', 'light'));
    } catch {}
  }, [t]),
    N.useEffect(() => {
      try {
        o ? sessionStorage.setItem('ml-club-mode', '1') : sessionStorage.removeItem('ml-club-mode');
      } catch {}
    }, [o]));
  const g = () => {
      a((b) => !b);
    },
    c = (b) => {
      const C = Math.random().toString(36).slice(2),
        L = { id: C, ...b };
      return (
        n((v) => [...v, L]),
        setTimeout(() => {
          i(C);
        }, 5e3),
        C
      );
    },
    i = (b) => {
      n((C) => C.filter((L) => L.id !== b));
    },
    x = {
      darkMode: t,
      setDarkMode: a,
      toggleTheme: g,
      clubMode: o,
      setClubMode: s,
      notifications: u,
      addNotification: c,
      removeNotification: i,
      loading: l,
      setLoading: d,
      modal: h,
      showModal: (b) => {
        m(b);
      },
      hideModal: () => {
        m(null);
      },
    };
  return e.jsx(Ee.Provider, { value: x, children: r });
}
class _t extends N.Component {
  constructor(t) {
    (super(t), (this.state = { hasError: !1, error: null, errorInfo: null }));
  }
  static getDerivedStateFromError(t) {
    return { hasError: !0 };
  }
  componentDidCatch(t, a) {
    this.setState({ error: t, errorInfo: a });
  }
  render() {
    if (this.state.hasError) {
      const { fallback: t } = this.props;
      return t
        ? e.jsx(t, {
            error: this.state.error,
            resetError: () => this.setState({ hasError: !1, error: null, errorInfo: null }),
          })
        : e.jsx('div', {
            className: 'min-h-screen bg-gray-50 flex items-center justify-center p-4',
            children: e.jsxs('div', {
              className: 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center mb-4',
                  children: [
                    e.jsx('div', {
                      className: 'flex-shrink-0',
                      children: e.jsx('svg', {
                        className: 'h-6 w-6 text-red-400',
                        fill: 'none',
                        viewBox: '0 0 24 24',
                        stroke: 'currentColor',
                        children: e.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
                        }),
                      }),
                    }),
                    e.jsx('div', {
                      className: 'ml-3',
                      children: e.jsx('h3', {
                        className: 'text-sm font-medium text-gray-800',
                        children: 'Oops! Qualcosa è andato storto',
                      }),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'mb-4',
                  children: [
                    e.jsx('p', {
                      className: 'text-sm text-gray-600',
                      children:
                        'Si è verificato un errore imprevisto. Prova a ricaricare la pagina.',
                    }),
                    !1,
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex gap-2',
                  children: [
                    e.jsx('button', {
                      onClick: () => window.location.reload(),
                      className:
                        'flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      children: 'Ricarica Pagina',
                    }),
                    e.jsx('button', {
                      onClick: () => this.setState({ hasError: !1, error: null, errorInfo: null }),
                      className:
                        'flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
                      children: 'Riprova',
                    }),
                  ],
                }),
              ],
            }),
          });
    }
    return this.props.children;
  }
}
function Re({ size: r = 'md', className: t = '' }) {
  const a = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12', xl: 'h-16 w-16' };
  return e.jsx('div', {
    className: `animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${a[r]} ${t}`,
  });
}
function se({ message: r = 'Caricamento...' }) {
  return e.jsx('div', {
    className: 'min-h-screen bg-gray-50 flex items-center justify-center',
    children: e.jsxs('div', {
      className: 'text-center',
      children: [
        e.jsx(Re, { size: 'xl', className: 'mx-auto mb-4' }),
        e.jsx('p', { className: 'text-gray-600 text-lg', children: r }),
      ],
    }),
  });
}
function Et({ message: r = 'Caricamento...', visible: t = !0 }) {
  return t
    ? e.jsx('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center',
        style: { zIndex: 1e5 },
        children: e.jsxs('div', {
          className: 'bg-white rounded-lg p-6 flex items-center space-x-3',
          children: [
            e.jsx(Re, { size: 'md' }),
            e.jsx('span', { className: 'text-gray-700', children: r }),
          ],
        }),
      })
    : null;
}
function Q(r, t, a) {
  return r !== t;
}
function Mt(r, t) {
  const a = r.pathname;
  if (a === '/login') {
    const o = r.state?.from?.pathname;
    return o && o !== '/login' ? o : '/dashboard';
  }
  return a === '/' ? '/dashboard' : null;
}
function Rt({ children: r, requireProfile: t = !0 }) {
  const { user: a, userProfile: o, isAuthenticated: s, isProfileComplete: u, loading: n } = G(),
    l = te();
  if (n) return e.jsx(se, { message: 'Verifica autenticazione...' });
  if (!s) {
    const d = '/login';
    if (Q(l.pathname, d)) return e.jsx($, { to: d, state: { from: l }, replace: !0 });
  }
  if (s && t && o !== null && !u) {
    const d = '/profile';
    if (Q(l.pathname, d)) return e.jsx($, { to: d, state: { from: l }, replace: !0 });
  }
  return r;
}
function Bt({ children: r }) {
  const { isAuthenticated: t, loading: a } = G(),
    o = te();
  if (a) return e.jsx(se, { message: 'Verifica autenticazione...' });
  if (t) {
    const s = Mt(o);
    if (s && Q(o.pathname, s)) return e.jsx($, { to: s, replace: !0 });
  }
  return r;
}
const Be = '/play-sport-pro_horizontal.svg',
  zt = '/play-sport-pro_icon_only.svg',
  S = {
    borderRadius: { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl', full: 'rounded-full' },
    spacing: { xs: 'p-2', sm: 'p-3', md: 'p-4', lg: 'p-6', xl: 'p-8' },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      card: 'shadow-[0_0_0_1px_rgba(0,0,0,0.02)] shadow-sm',
    },
    transitions: {
      fast: 'transition-all duration-150 ease-in-out',
      normal: 'transition-all duration-200 ease-in-out',
      slow: 'transition-all duration-300 ease-in-out',
    },
  };
function Tt() {
  return {
    name: 'universal',
    ...{
      borderSm: S.borderRadius.sm,
      borderMd: S.borderRadius.md,
      borderLg: S.borderRadius.lg,
      borderFull: S.borderRadius.full,
      spacingXs: S.spacing.xs,
      spacingSm: S.spacing.sm,
      spacingMd: S.spacing.md,
      spacingLg: S.spacing.lg,
      spacingXl: S.spacing.xl,
      shadowCard: S.shadows.card + ' dark:shadow-dark-sm',
      shadowSm: S.shadows.sm + ' dark:shadow-dark-sm',
      shadowMd: S.shadows.md + ' dark:shadow-dark-md',
      shadowLg: S.shadows.lg + ' dark:shadow-dark-lg',
      transitionFast: S.transitions.fast,
      transitionNormal: S.transitions.normal,
      transitionSlow: S.transitions.slow,
      focusRing:
        'focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
      primaryRing: 'ring-emerald-400 dark:ring-emerald-500',
    },
    logos: { main: Be, icon: zt },
    pageBg: 'bg-neutral-50 dark:bg-gray-900',
    text: 'text-neutral-900 dark:text-white',
    subtext: 'text-neutral-600 dark:text-gray-300',
    cardBg: 'bg-white dark:bg-gray-800',
    border: 'ring-1 ring-black/10 dark:ring-white/10',
    headerBg: 'bg-white dark:bg-gray-800 border-b border-black/10 dark:border-white/10',
    neonText: 'text-emerald-600 dark:text-emerald-400',
    link: 'underline underline-offset-4 decoration-emerald-600 dark:decoration-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
    ghostRing: 'ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5',
    tableHeadText: 'text-neutral-500 dark:text-gray-400',
    input: `${S.borderRadius.md} px-3 py-2 bg-white dark:bg-gray-700 border border-black/10 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-gray-400 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 dark:focus:ring-emerald-500 outline-none ${S.transitions.normal}`,
    btnPrimary: `inline-flex items-center justify-center ${S.borderRadius.md} px-4 py-2 font-medium text-black bg-gradient-to-r from-emerald-400 to-lime-400 hover:brightness-110 active:brightness-95 ${S.transitions.normal} ${S.shadows.sm}`,
    btnGhost: `inline-flex items-center justify-center ${S.borderRadius.md} px-4 py-2 font-medium ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-900 dark:text-white ${S.transitions.normal}`,
    btnGhostSm: `inline-flex items-center justify-center ${S.borderRadius.sm} px-2 py-1 text-xs font-medium ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-900 dark:text-white ${S.transitions.normal}`,
    accentGood: 'text-emerald-600 dark:text-emerald-400',
    accentBad: 'text-rose-600 dark:text-rose-400',
    accentWarning: 'text-amber-600 dark:text-amber-400',
    accentInfo: 'text-blue-600 dark:text-blue-400',
    chip: 'bg-emerald-500 text-black',
    card: `${S.borderRadius.lg} bg-white dark:bg-gray-800 ring-1 ring-black/10 dark:ring-white/10 ${S.spacing.md} ${S.shadows.card} dark:shadow-dark-sm`,
    cardHover: `${S.borderRadius.lg} bg-white dark:bg-gray-800 ring-1 ring-black/10 dark:ring-white/10 ${S.spacing.md} ${S.shadows.md} dark:shadow-dark-md hover:shadow-lg dark:hover:shadow-dark-lg ${S.transitions.normal}`,
  };
}
function Wt() {
  const { notifications: r, removeNotification: t } = Me();
  return r.length === 0
    ? null
    : e.jsx('div', {
        className: 'fixed top-4 right-4 space-y-2',
        style: { zIndex: 100001 },
        children: r.map((a) => e.jsx(Dt, { notification: a, onRemove: t }, a.id)),
      });
}
function Dt({ notification: r, onRemove: t }) {
  const { id: a, type: o = 'info', title: s, message: u, autoClose: n = !0 } = r,
    l = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white',
    },
    d = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  return (
    N.useEffect(() => {
      if (n) {
        const h = setTimeout(() => {
          t(a);
        }, 5e3);
        return () => clearTimeout(h);
      }
    }, [a, n, t]),
    e.jsx('div', {
      className: `${l[o]} px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slide-in-right`,
      role: 'alert',
      children: e.jsxs('div', {
        className: 'flex items-start',
        children: [
          e.jsx('span', { className: 'text-lg mr-2', children: d[o] }),
          e.jsxs('div', {
            className: 'flex-1',
            children: [
              s && e.jsx('div', { className: 'font-medium', children: s }),
              u && e.jsx('div', { className: 'text-sm opacity-90', children: u }),
            ],
          }),
          e.jsx('button', {
            onClick: () => t(a),
            className: 'ml-2 text-lg leading-none opacity-70 hover:opacity-100',
            'aria-label': 'Chiudi notifica',
            children: '×',
          }),
        ],
      }),
    })
  );
}
function Ot({ active: r, setActive: t, clubMode: a, T: o, user: s, navigation: u }) {
  const n = u || [
    { id: 'classifica', label: 'Classifica' },
    { id: 'stats', label: 'Statistiche' },
    { id: 'prenota-campo', label: 'Prenota Campo' },
    ...(a
      ? [
          { id: 'giocatori', label: 'Giocatori' },
          { id: 'crea', label: 'Crea Partita' },
          { id: 'prenota', label: 'Gestione Campi' },
          { id: 'tornei', label: 'Crea Tornei' },
        ]
      : []),
    { id: s ? 'profile' : 'auth', label: s ? 'Profilo' : 'Accedi' },
    { id: 'extra', label: 'Extra' },
  ];
  return e.jsx('nav', {
    className: 'hidden md:flex gap-1',
    children: n.map((l) =>
      e.jsx(
        'button',
        {
          type: 'button',
          onClick: () => t(l.id),
          className: `px-3 py-1.5 rounded-xl text-sm transition ring-1 ${r === l.id ? o.btnPrimary : o.ghostRing}`,
          'aria-current': r === l.id ? 'page' : void 0,
          children: l.label,
        },
        l.id
      )
    ),
  });
}
function $t({ active: r, setActive: t, navigation: a = [], clubMode: o = !1 }) {
  const [s, u] = p.useState(!1),
    n =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    l = (i, f) => {
      if ((f && (f.preventDefault(), f.stopPropagation()), r === i.id)) return;
      setTimeout(
        () => {
          (t(i.id), s && u(!1));
        },
        n ? 0 : 50
      );
    },
    d = (i) => {
      (i.stopPropagation(), i.preventDefault(), u(!s));
    },
    h = (i, f) => {
      (f.stopPropagation(),
        f.preventDefault(),
        setTimeout(() => {
          (t(i.id), u(!1));
        }, 50));
    },
    m = [
      {
        id: 'dashboard',
        label: 'Home',
        path: '/dashboard',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
          }),
        }),
      },
      {
        id: 'prenota-campo',
        label: 'Campo',
        path: '/booking',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
          }),
        }),
      },
      {
        id: 'prenota-lezione',
        label: 'Lezione',
        path: '/lessons',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
          }),
        }),
      },
      {
        id: 'classifica',
        label: 'Classifica',
        path: '/classifica',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
          }),
        }),
      },
      {
        id: 'stats',
        label: 'Stats',
        path: '/stats',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
          }),
        }),
      },
    ],
    g = [
      {
        id: 'giocatori',
        label: 'Giocatori',
        path: '/players',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
          }),
        }),
      },
      {
        id: 'crea',
        label: 'Crea Partita',
        path: '/matches/create',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4',
          }),
        }),
      },
      {
        id: 'prenota',
        label: 'Gestione Campi',
        path: '/booking-admin',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
          }),
        }),
      },
      {
        id: 'tornei',
        label: 'Crea Tornei',
        path: '/tournaments',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          }),
        }),
      },
      {
        id: 'profile',
        label: 'Profilo',
        path: '/profile',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          }),
        }),
      },
      {
        id: 'extra',
        label: 'Extra',
        path: '/extra',
        icon: e.jsx('svg', {
          className: 'w-5 h-5',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4',
          }),
        }),
      },
    ],
    c = o
      ? [
          ...m.slice(0, 3),
          {
            id: 'giocatori',
            label: 'Players',
            path: '/players',
            icon: e.jsx('svg', {
              className: 'w-5 h-5',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24',
              children: e.jsx('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
              }),
            }),
          },
          {
            id: 'prenota',
            label: 'Admin',
            path: '/admin/bookings',
            icon: e.jsxs('svg', {
              className: 'w-5 h-5',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24',
              children: [
                e.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
                }),
                e.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                }),
              ],
            }),
          },
        ]
      : m;
  return e.jsxs('div', {
    className:
      'md:hidden bottom-nav-container bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/10 dark:shadow-black/20',
    style: {
      zIndex: 999999,
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: 'calc(68px + env(safe-area-inset-bottom))',
    },
    onClick: (i) => i.stopPropagation(),
    onTouchEnd: (i) => i.stopPropagation(),
    children: [
      s &&
        e.jsx('div', {
          className:
            'club-menu-container absolute bottom-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-white/20 dark:border-gray-700/30 shadow-2xl shadow-gray-900/20 dark:shadow-black/40',
          style: { zIndex: 1e6 },
          children: e.jsxs('div', {
            className: 'p-6',
            children: [
              e.jsxs('div', {
                className: 'flex justify-between items-center mb-4',
                children: [
                  e.jsx('div', {
                    className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
                    children: 'Menu Circolo',
                  }),
                  e.jsx('button', {
                    onClick: d,
                    className:
                      'w-8 h-8 rounded-full bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/80 dark:hover:bg-gray-600/80 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105',
                    children: e.jsx('svg', {
                      className: 'w-4 h-4',
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24',
                      children: e.jsx('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M6 18L18 6M6 6l12 12',
                      }),
                    }),
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'grid grid-cols-2 gap-3',
                children: g.map((i) =>
                  e.jsxs(
                    'div',
                    {
                      className: `flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${r === i.id ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 border border-blue-200/30 dark:border-blue-600/30' : 'bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 border border-white/30 dark:border-gray-600/30 shadow-lg hover:shadow-xl'}`,
                      onClick: (f) => h(i, f),
                      style: {
                        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                      },
                      children: [
                        e.jsx('div', {
                          className: `w-8 h-8 rounded-lg flex items-center justify-center ${r === i.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md'}`,
                          children: i.icon,
                        }),
                        e.jsx('span', { className: 'text-sm font-medium', children: i.label }),
                      ],
                    },
                    i.id
                  )
                ),
              }),
            ],
          }),
        }),
      e.jsxs('div', {
        className: 'grid grid-cols-5 h-16 px-2',
        children: [
          c.map((i, f) =>
            e.jsxs(
              'div',
              {
                className: `bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${r === i.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                onClick: n ? void 0 : (j) => l(i, j),
                onTouchEnd: n ? (j) => l(i, j) : void 0,
                style: {
                  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  minHeight: '48px',
                  position: 'relative',
                  zIndex: 1e6,
                },
                children: [
                  e.jsxs('div', {
                    className: `relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${r === i.id ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-600/30 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 transform scale-110' : 'hover:bg-white/60 dark:hover:bg-gray-700/60 hover:backdrop-blur-sm hover:border hover:border-white/20 dark:hover:border-gray-600/20 hover:shadow-lg hover:transform hover:scale-105'}`,
                    children: [
                      r === i.id &&
                        e.jsx('div', {
                          className:
                            'absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg',
                        }),
                      i.icon,
                    ],
                  }),
                  e.jsx('span', {
                    className: `font-medium text-xs leading-tight ${r === i.id ? 'font-semibold' : ''}`,
                    children: i.label,
                  }),
                ],
              },
              i.id
            )
          ),
          o &&
            e.jsxs('div', {
              className: `bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${s ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
              onClick: n ? void 0 : (i) => d(i),
              onTouchEnd: n ? (i) => d(i) : void 0,
              style: {
                WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                minHeight: '48px',
                position: 'relative',
                zIndex: 1e6,
              },
              children: [
                e.jsxs('div', {
                  className: `relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${s ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/20 dark:to-pink-400/20 backdrop-blur-sm border border-purple-200/30 dark:border-purple-600/30 shadow-lg shadow-purple-100/30 dark:shadow-purple-900/20 transform scale-110' : 'hover:bg-white/60 dark:hover:bg-gray-700/60 hover:backdrop-blur-sm hover:border hover:border-white/20 dark:hover:border-gray-600/20 hover:shadow-lg hover:transform hover:scale-105'}`,
                  children: [
                    s &&
                      e.jsx('div', {
                        className:
                          'absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-lg',
                      }),
                    e.jsx('svg', {
                      className: 'w-5 h-5',
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24',
                      children: e.jsx('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: s ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16',
                      }),
                    }),
                  ],
                }),
                e.jsx('span', {
                  className: `font-medium text-xs leading-tight ${s ? 'font-semibold' : ''}`,
                  children: 'Menu',
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
function ze() {
  const [r, t] = p.useState(null),
    [a, o] = p.useState(!1),
    [s, u] = p.useState(!1),
    [n, l] = p.useState({});
  p.useEffect(() => {
    ((() => {
      const x = navigator.userAgent,
        b = /iPad|iPhone|iPod/.test(x),
        C = /Android/.test(x),
        L = b || C || /Mobile|Tablet/.test(x),
        v = /Chrome/.test(x) && !/Edge|Edg/.test(x),
        y = /Edge|Edg/.test(x),
        A = /Firefox/.test(x),
        k = /Safari/.test(x) && !/Chrome|CriOS|FxiOS/.test(x),
        w = /OPR|Opera/.test(x),
        P = /SamsungBrowser/.test(x);
      l({
        isIOS: b,
        isAndroid: C,
        isMobile: L,
        isChrome: v,
        isEdge: y,
        isFirefox: A,
        isSafari: k,
        isOpera: w,
        isSamsung: P,
        supportsInstallPrompt: v || y || P || w,
      });
    })(),
      (() => {
        const x = window.matchMedia('(display-mode: standalone)').matches,
          b = window.navigator.standalone === !0,
          C = window.matchMedia('(display-mode: fullscreen)').matches,
          L = window.matchMedia('(display-mode: minimal-ui)').matches,
          v = x || b || C || L;
        (u(v), v && console.log('✅ PWA is already installed'));
      })());
    const f = (x) => {
        (console.log('🚀 PWA installation prompt ready'), x.preventDefault(), t(x), o(!0));
      },
      j = () => {
        (console.log('✅ PWA installed successfully'),
          u(!0),
          o(!1),
          t(null),
          localStorage.setItem('pwa_installed', 'true'));
      };
    return (
      n.supportsInstallPrompt &&
        (window.addEventListener('beforeinstallprompt', f),
        window.addEventListener('appinstalled', j)),
      () => {
        (window.removeEventListener('beforeinstallprompt', f),
          window.removeEventListener('appinstalled', j));
      }
    );
  }, [n.supportsInstallPrompt]);
  const d = async () => {
      if (!r) return (console.warn('⚠️ No deferred prompt available'), !1);
      try {
        r.prompt();
        const { outcome: c } = await r.userChoice;
        return c === 'accepted'
          ? (console.log('✅ User accepted PWA installation'), o(!1), t(null), !0)
          : (console.log('❌ User declined PWA installation'), !1);
      } catch (c) {
        return (console.error('❌ PWA installation failed:', c), !1);
      }
    },
    h = () => {
      const { isIOS: c, isAndroid: i, isSafari: f, isFirefox: j, isChrome: x, isEdge: b } = n;
      return c && f
        ? {
            show: !0,
            title: 'Installa su iPhone/iPad',
            icon: '📱',
            instructions: [
              'Tocca il pulsante Condividi in basso',
              'Scorri verso il basso e tocca "Aggiungi alla schermata Home"',
              `Tocca "Aggiungi" nell'angolo in alto a destra`,
              "L'app apparirà nella tua home screen",
            ],
          }
        : j
          ? {
              show: !0,
              title: 'Installa con Firefox',
              icon: '🦊',
              instructions: i
                ? [
                    'Tocca il menu (3 punti) in alto a destra',
                    'Seleziona "Installa"',
                    'Conferma toccando "Aggiungi"',
                  ]
                : [
                    "Clicca sull'icona più (+) nella barra degli indirizzi",
                    'Seleziona "Installa questa app"',
                    'Conferma cliccando "Installa"',
                  ],
            }
          : i && (x || b)
            ? {
                show: !0,
                title: 'Installa su Android',
                icon: '🤖',
                instructions: [
                  'Tocca il menu (3 punti) in alto a destra',
                  'Seleziona "Installa app" o "Aggiungi alla schermata Home"',
                  'Conferma toccando "Installa"',
                  "L'app verrà aggiunta alla home screen",
                ],
              }
            : !n.isMobile && (x || b)
              ? {
                  show: !0,
                  title: 'Installa sul Desktop',
                  icon: '💻',
                  instructions: [
                    `Clicca sull'icona "Installa" nella barra degli indirizzi`,
                    'Oppure apri il menu (3 punti) → "Installa Paris League"',
                    'Conferma cliccando "Installa"',
                    "L'app apparirà nel menu Start/Applicazioni",
                  ],
                }
              : { show: !1, instructions: [] };
    },
    m = () =>
      'serviceWorker' in navigator &&
      'Cache' in window &&
      'caches' in window &&
      'PushManager' in window;
  return {
    isInstallable: s ? !1 : !!((n.isIOS && n.isSafari) || (a && r) || n.isFirefox),
    isInstalled: s,
    installApp: d,
    browserInfo: n,
    isPWASupported: m(),
    installInstructions: h(),
  };
}
function Ut({ className: r = '' }) {
  const {
      isInstallable: t,
      isInstalled: a,
      installApp: o,
      browserInfo: s,
      isPWASupported: u,
      installInstructions: n,
    } = ze(),
    [l, d] = p.useState(!1);
  if (a)
    return e.jsxs('div', {
      className: `flex items-center gap-2 text-green-600 text-sm ${r}`,
      children: [
        e.jsx('svg', {
          className: 'w-4 h-4',
          fill: 'currentColor',
          viewBox: '0 0 24 24',
          children: e.jsx('path', { d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' }),
        }),
        'App già installata',
      ],
    });
  if (!u)
    return e.jsx('div', {
      className: `text-gray-500 text-sm ${r}`,
      children: 'Browser non supportato per PWA',
    });
  if (!t) return null;
  const h = async () => {
      if (n.show) {
        d(!0);
        return;
      }
      try {
        (await o()) || (n.show && d(!0));
      } catch (g) {
        (console.error('Install failed:', g), n.show && d(!0));
      }
    },
    m = () =>
      s.isIOS
        ? '📱 Installa su iPhone'
        : s.isAndroid
          ? '🤖 Installa su Android'
          : s.isFirefox
            ? '🦊 Installa con Firefox'
            : '💻 Installa App';
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs('button', {
        onClick: h,
        className: `flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${r}`,
        children: [
          e.jsx('svg', {
            className: 'w-5 h-5',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            children: e.jsx('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10',
            }),
          }),
          m(),
        ],
      }),
      l &&
        n.show &&
        e.jsx('div', {
          className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4',
          children: e.jsx('div', {
            className: 'bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl',
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', {
                  className:
                    'w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4',
                  children: e.jsx('span', { className: 'text-3xl', children: n.icon }),
                }),
                e.jsx('h3', {
                  className: 'text-xl font-bold text-gray-900 mb-2',
                  children: n.title,
                }),
                e.jsx('p', {
                  className: 'text-gray-600 mb-6',
                  children: 'Segui questi semplici passaggi per installare Paris League:',
                }),
                e.jsx('div', {
                  className: 'text-left space-y-4 mb-8',
                  children: n.instructions.map((g, c) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex items-start gap-4',
                        children: [
                          e.jsx('div', {
                            className:
                              'w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                            children: c + 1,
                          }),
                          e.jsx('div', {
                            className: 'flex-1',
                            children: e.jsx('p', {
                              className: 'text-gray-700 leading-relaxed',
                              children: g,
                            }),
                          }),
                        ],
                      },
                      c
                    )
                  ),
                }),
                e.jsx('div', {
                  className: 'bg-gray-50 rounded-lg p-3 mb-6',
                  children: e.jsxs('p', {
                    className: 'text-xs text-gray-600 text-center',
                    children: [
                      'Browser rilevato: ',
                      s.isChrome
                        ? 'Chrome'
                        : s.isFirefox
                          ? 'Firefox'
                          : s.isEdge
                            ? 'Edge'
                            : s.isSafari
                              ? 'Safari'
                              : s.isOpera
                                ? 'Opera'
                                : s.isSamsung
                                  ? 'Samsung Internet'
                                  : 'Altro',
                      s.isMobile && ' Mobile',
                    ],
                  }),
                }),
                e.jsxs('div', {
                  className: 'flex gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => d(!1),
                      className:
                        'flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors',
                      children: 'Chiudi',
                    }),
                    !s.isIOS &&
                      !s.isFirefox &&
                      e.jsx('button', {
                        onClick: async () => {
                          (d(!1), await o());
                        },
                        className:
                          'flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-lg',
                        children: 'Prova Auto-Install',
                      }),
                  ],
                }),
              ],
            }),
          }),
        }),
    ],
  });
}
function Ft() {
  const {
      isInstallable: r,
      isInstalled: t,
      installApp: a,
      browserInfo: o,
      installInstructions: s,
    } = ze(),
    [u, n] = p.useState(!1),
    [l, d] = p.useState(!1);
  if (t || !r) return null;
  const h = async () => {
      if (s && s.show) {
        n(!0);
        return;
      }
      try {
        await a();
      } catch (g) {
        (console.error('Install failed:', g), s && s.show && n(!0));
      }
    },
    m = () => (o && o.isIOS ? '📱 Installa' : o && o.isAndroid ? '🤖 Installa' : 'Installa App');
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx('div', {
        className: 'sm:hidden fixed right-4 bottom-20 z-[9999]',
        children: l
          ? e.jsx('button', {
              onClick: () => d(!1),
              className:
                'w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm',
              children: e.jsx('svg', {
                className: 'w-5 h-5',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                children: e.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10',
                }),
              }),
            })
          : e.jsxs('div', {
              className:
                'flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg backdrop-blur-sm',
              children: [
                e.jsxs('button', {
                  onClick: h,
                  className: 'flex items-center gap-2 px-4 py-3 text-sm font-medium',
                  children: [
                    e.jsx('svg', {
                      className: 'w-4 h-4',
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24',
                      children: e.jsx('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10',
                      }),
                    }),
                    m(),
                  ],
                }),
                e.jsx('button', {
                  onClick: () => d(!0),
                  className: 'px-3 py-3 text-white/70 hover:text-white border-l border-white/20',
                  children: e.jsx('svg', {
                    className: 'w-3 h-3',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24',
                    children: e.jsx('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M6 18L18 6M6 6l12 12',
                    }),
                  }),
                }),
              ],
            }),
      }),
      u &&
        s &&
        s.show &&
        e.jsx('div', {
          className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4',
          children: e.jsx('div', {
            className: 'bg-white rounded-xl p-6 max-w-sm w-full mx-4',
            children: e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', {
                  className:
                    'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4',
                  children: e.jsx('span', { className: 'text-2xl', children: s.icon || '📱' }),
                }),
                e.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-900 mb-2',
                  children: s.title || 'Installa App',
                }),
                e.jsx('p', {
                  className: 'text-sm text-gray-600 mb-4',
                  children: "Segui questi passaggi per installare l'app:",
                }),
                s.instructions &&
                  e.jsx('div', {
                    className: 'text-left space-y-3 mb-6',
                    children: s.instructions.map((g, c) =>
                      e.jsxs(
                        'div',
                        {
                          className: 'flex items-start gap-3',
                          children: [
                            e.jsx('div', {
                              className:
                                'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                              children: c + 1,
                            }),
                            e.jsx('p', { className: 'text-sm text-gray-700', children: g }),
                          ],
                        },
                        c
                      )
                    ),
                  }),
                e.jsxs('div', {
                  className: 'space-y-2',
                  children: [
                    o &&
                      !o.isIOS &&
                      !o.isFirefox &&
                      e.jsx('button', {
                        onClick: async () => {
                          (n(!1), await a());
                        },
                        className:
                          'w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors',
                        children: 'Prova Auto-Install',
                      }),
                    e.jsx('button', {
                      onClick: () => n(!1),
                      className:
                        'w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors text-sm',
                      children: 'Ho capito',
                    }),
                  ],
                }),
              ],
            }),
          }),
        }),
    ],
  });
}
function Ht() {
  const [r, t] = p.useState(!0),
    [a, o] = p.useState(!1);
  return (p.useEffect(() => {}, []), null);
}
function Vt() {
  const { user: r } = G(),
    { clubMode: t, loading: a } = Me(),
    { updatingFromCloud: o } = It(),
    s = te(),
    u = $e(),
    n = N.useMemo(() => Tt(), []),
    l = [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', public: !0 },
      { id: 'classifica', label: 'Classifica', path: '/classifica', public: !0 },
      { id: 'stats', label: 'Statistiche', path: '/stats', public: !0 },
      { id: 'prenota-campo', label: 'Prenota Campo', path: '/booking', public: !0 },
      { id: 'prenota-lezione', label: 'Prenota Lezione', path: '/lessons', public: !0 },
      ...(t
        ? [
            { id: 'giocatori', label: 'Giocatori', path: '/players', club: !0 },
            { id: 'crea', label: 'Crea Partita', path: '/matches/create', club: !0 },
            { id: 'prenota', label: 'Gestione Campi', path: '/admin/bookings', club: !0 },
            { id: 'tornei', label: 'Crea Tornei', path: '/tournaments', club: !0 },
          ]
        : []),
      {
        id: r ? 'profile' : 'auth',
        label: r ? 'Profilo' : 'Accedi',
        path: r ? '/profile' : '/login',
      },
      { id: 'extra', label: 'Extra', path: '/extra', public: !0 },
    ],
    d = s.pathname,
    h = l.find((c) => c.path === d)?.id || '',
    m = (c) => {
      if (h === c) {
        console.log(`Already on tab ${c}, preventing navigation`);
        return;
      }
      const i = l.find((f) => f.id === c);
      i && (console.log(`Navigating from ${h} to ${c}`), u(i.path, { replace: !0 }));
    },
    g = d === '/dashboard' || d === '/';
  return e.jsxs('div', {
    className: `min-h-screen safe-area-top safe-area-bottom ${n.text} ${g ? 'bg-gradient-to-b from-neutral-50 via-white to-neutral-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900' : n.pageBg}`,
    children: [
      e.jsx('header', {
        className: `sticky top-0 z-20 ${n.headerBg} safe-area-left safe-area-right`,
        children: e.jsxs('div', {
          className:
            'max-w-[1800px] mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-2 sm:gap-3 min-w-0',
              children: [
                e.jsx('div', {
                  className: 'h-10 w-auto rounded-md shadow shrink-0 flex items-center',
                  children: e.jsx('img', {
                    src: Be,
                    alt: 'Play-Sport.pro',
                    className: 'h-10 w-auto select-none dark:bg-white dark:rounded-md dark:p-1',
                    draggable: !1,
                  }),
                }),
                e.jsx('div', {
                  className:
                    'text-lg sm:text-2xl font-bold tracking-wide truncate text-neutral-900 dark:text-white',
                  children: 'Sporting Cat',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-2 overflow-x-auto no-scrollbar',
              children: [
                e.jsx('div', {
                  className: 'hidden sm:block',
                  children: e.jsx(Ut, { className: 'text-xs px-3 py-1.5' }),
                }),
                e.jsx(Ot, { active: h, setActive: m, clubMode: t, T: n, user: r, navigation: l }),
              ],
            }),
          ],
        }),
      }),
      e.jsx('main', {
        className:
          'max-w-[1800px] mx-auto px-3 sm:px-4 py-5 sm:py-6 safe-area-left safe-area-right pb-20 md:pb-5',
        children: e.jsx(Ue, {}),
      }),
      e.jsx($t, { active: h, setActive: m, navigation: l, clubMode: t }),
      e.jsx(Ft, {}),
      e.jsx(Wt, {}),
      e.jsx(Et, { visible: a || o, message: o ? 'Sincronizzazione...' : 'Caricamento...' }),
      e.jsx(Ht, {}),
    ],
  });
}
const qt = N.lazy(() =>
    M(() => import('./LoginPage-mfiaeih4-D6cNoLTE.js'), __vite__mapDeps([0, 1, 2, 3, 4]))
  ),
  Gt = N.lazy(() =>
    M(() => import('./DashboardPage-mfiaeih4-B6JBE8hn.js'), __vite__mapDeps([5, 1, 2, 4]))
  ),
  Jt = N.lazy(() =>
    M(() => import('./ClassificaPage-mfiaeih4-DL7K_yCQ.js'), __vite__mapDeps([6, 1, 2, 3, 7, 8, 4]))
  ),
  Kt = N.lazy(() =>
    M(
      () => import('./StatsPage-mfiaeih4-CoH8pDng.js'),
      __vite__mapDeps([9, 1, 2, 3, 8, 7, 10, 11, 4])
    )
  ),
  Yt = N.lazy(() =>
    M(
      () => import('./BookingPage-mfiaeih4-L9lykQc3.js'),
      __vite__mapDeps([12, 1, 2, 13, 14, 15, 16, 17, 4])
    )
  ),
  Xt = N.lazy(() =>
    M(
      () => import('./LessonBookingPage-mfiaeih4-B6FKKRrB.js'),
      __vite__mapDeps([18, 1, 2, 3, 13, 14, 19, 16, 17, 4, 10])
    )
  ),
  Zt = N.lazy(() =>
    M(
      () => import('./PlayersPage-mfiaeih4-hAcfgnb0.js'),
      __vite__mapDeps([20, 1, 2, 3, 10, 11, 19, 17, 4])
    )
  ),
  Qt = N.lazy(() =>
    M(() => import('./MatchesPage-mfiaeih4-_4D0ONW6.js'), __vite__mapDeps([21, 1, 2, 3, 11, 4]))
  ),
  er = N.lazy(() =>
    M(() => import('./TournamentsPage-mfiaeih4-QCv7_2Sy.js'), __vite__mapDeps([22, 1, 2, 3, 4]))
  ),
  tr = N.lazy(() =>
    M(() => import('./ProfilePage-mfiaeih4-BkvhQDrG.js'), __vite__mapDeps([23, 1, 2, 3, 4]))
  ),
  rr = N.lazy(() =>
    M(() => import('./ExtraPage-mfiaeih4-D2-nef3t.js'), __vite__mapDeps([24, 1, 2, 3, 25, 4]))
  ),
  ar = N.lazy(() =>
    M(
      () => import('./AdminBookingsPage-mfiaeih4-BMgX2YLP.js'),
      __vite__mapDeps([26, 1, 2, 3, 10, 25, 15, 16, 17, 4, 19])
    )
  ),
  sr = N.lazy(() =>
    M(() => import('./DarkModeTestPage-mfiaeih4-DtGvE0tQ.js'), __vite__mapDeps([27, 1, 2, 14, 4]))
  );
function or() {
  return e.jsx(_t, {
    children: e.jsx(Fe, {
      children: e.jsx(yt, {
        children: e.jsx(Pt, {
          children: e.jsx(Lt, {
            children: e.jsx(p.Suspense, {
              fallback: e.jsx(se, {}),
              children: e.jsxs(He, {
                children: [
                  e.jsx(_, { path: '/login', element: e.jsx(Bt, { children: e.jsx(qt, {}) }) }),
                  e.jsxs(_, {
                    path: '/',
                    element: e.jsx(Rt, { children: e.jsx(Vt, {}) }),
                    children: [
                      e.jsx(_, { index: !0, element: e.jsx($, { to: 'dashboard', replace: !0 }) }),
                      e.jsx(_, { path: 'dashboard', element: e.jsx(Gt, {}) }),
                      e.jsx(_, { path: 'classifica', element: e.jsx(Jt, {}) }),
                      e.jsx(_, { path: 'stats', element: e.jsx(Kt, {}) }),
                      e.jsx(_, { path: 'booking', element: e.jsx(Yt, {}) }),
                      e.jsx(_, { path: 'lessons', element: e.jsx(Xt, {}) }),
                      e.jsx(_, { path: 'extra', element: e.jsx(rr, {}) }),
                      e.jsx(_, { path: 'players', element: e.jsx(Zt, {}) }),
                      e.jsx(_, { path: 'matches/create', element: e.jsx(Qt, {}) }),
                      e.jsx(_, { path: 'tournaments', element: e.jsx(er, {}) }),
                      e.jsx(_, { path: 'admin/bookings', element: e.jsx(ar, {}) }),
                      e.jsx(_, { path: 'profile', element: e.jsx(tr, {}) }),
                      e.jsx(_, { path: 'test/dark-mode', element: e.jsx(sr, {}) }),
                    ],
                  }),
                  e.jsx(_, { path: '*', element: e.jsx($, { to: '/dashboard', replace: !0 }) }),
                ],
              }),
            }),
          }),
        }),
      }),
    }),
  });
}
class nr {
  constructor() {
    ((this.currentVersion = '1.8.0'),
      (this.swRegistration = null),
      (this.updateCheckInterval = null));
  }
  async init() {
    if ('serviceWorker' in navigator)
      try {
        ((this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })),
          console.log('[UpdateService] Service Worker registrato:', this.swRegistration.scope),
          this.startUpdateCheck(),
          navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this)),
          this.swRegistration.waiting && this.showUpdateAvailable(),
          this.swRegistration.addEventListener('updatefound', () => {
            const t = this.swRegistration.installing;
            t &&
              t.addEventListener('statechange', () => {
                t.state === 'installed' &&
                  navigator.serviceWorker.controller &&
                  this.showUpdateAvailable();
              });
          }));
      } catch (t) {
        console.error('[UpdateService] Errore registrazione SW:', t);
      }
  }
  startUpdateCheck() {
    (this.checkForUpdates(),
      (this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates();
      }, 15e3)));
  }
  async checkForUpdates() {
    if (this.swRegistration)
      try {
        await this.swRegistration.update();
      } catch (t) {
        console.log('[UpdateService] Update check failed:', t);
      }
  }
  handleSWMessage(t) {
    const { data: a } = t;
    a.type === 'RELOAD_PAGE' && this.reloadPage();
  }
  showUpdateAvailable() {
    const t = this.createUpdateBanner();
    document.body.appendChild(t);
  }
  createUpdateBanner() {
    const t = document.createElement('div');
    return (
      (t.id = 'update-banner'),
      (t.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `),
      (t.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Nuova versione disponibile!</span>
      </div>
      <button id="update-btn" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      ">Aggiorna</button>
    `),
      t.querySelector('#update-btn').addEventListener('click', () => {
        (this.applyUpdate(), t.remove());
      }),
      t
    );
  }
  async applyUpdate() {
    (this.swRegistration &&
      this.swRegistration.waiting &&
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' }),
      await this.clearCache(),
      setTimeout(() => {
        this.reloadPage();
      }, 100));
  }
  async clearCache() {
    if ('caches' in window)
      try {
        const t = await caches.keys();
        (await Promise.all(t.map((a) => caches.delete(a))),
          console.log('[UpdateService] Cache cleared'));
      } catch (t) {
        console.error('[UpdateService] Cache clear failed:', t);
      }
    if (this.swRegistration && this.swRegistration.active) {
      const t = new MessageChannel();
      this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' }, [t.port2]);
    }
  }
  reloadPage() {
    if (window.location.reload) window.location.reload(!0);
    else {
      const t = new URL(window.location);
      (t.searchParams.set('_cb', Date.now()), (window.location.href = t.toString()));
    }
  }
  async forceUpdate() {
    (await this.clearCache(), this.reloadPage());
  }
  destroy() {
    this.updateCheckInterval && clearInterval(this.updateCheckInterval);
  }
}
const ee = new nr(),
  pr = Object.freeze(
    Object.defineProperty({ __proto__: null, default: ee, updateService: ee }, Symbol.toStringTag, {
      value: 'Module',
    })
  );
class ir {
  constructor() {
    ((this.currentHash = null), (this.checkInterval = null), (this.isChecking = !1));
  }
  extractCurrentHash() {
    try {
      const t = document.querySelectorAll('link[rel="stylesheet"]');
      for (const u of t) {
        const n = u.href.match(/assets\/index-([^-]+)-/);
        if (n) return n[1];
      }
      const a = document.querySelectorAll('script[src*="/assets/"]');
      for (const u of a) {
        const n = u.src.match(/assets\/[^-]+-([^-]+)-/);
        if (n) return n[1];
      }
      const s = document.documentElement.outerHTML.match(/assets\/index-([a-z0-9]+)-/);
      return s ? s[1] : null;
    } catch (t) {
      return (console.error('[HashChecker] Error extracting hash:', t), null);
    }
  }
  init() {
    console.log('[HashChecker] Temporarily disabled to prevent refresh loops');
  }
  async checkForUpdates() {
    try {
      if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
      const t = new MessageChannel();
      return new Promise((a) => {
        ((t.port1.onmessage = (o) => {
          const { hashMismatch: s, currentHash: u, clientHash: n } = o.data;
          (s &&
            (console.log('[HashChecker] Hash mismatch detected!'),
            console.log('Client hash:', n),
            console.log('SW hash:', u),
            this.handleHashMismatch()),
            a(o.data));
        }),
          navigator.serviceWorker.controller.postMessage(
            { type: 'CHECK_HASH', hash: this.currentHash },
            [t.port2]
          ));
      });
    } catch (t) {
      console.error('[HashChecker] Update check failed:', t);
    }
  }
  handleHashMismatch() {
    this.clearCacheAndReload();
  }
  async clearCacheAndReload() {
    try {
      if ((console.log('[HashChecker] Clearing cache and reloading...'), 'caches' in window)) {
        const t = await caches.keys();
        await Promise.all(t.map((a) => caches.delete(a)));
      }
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        const t = new MessageChannel();
        ((t.port1.onmessage = () => {
          setTimeout(() => {
            window.location.reload(!0);
          }, 500);
        }),
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' }, [t.port2]));
      } else
        setTimeout(() => {
          window.location.reload(!0);
        }, 500);
    } catch (t) {
      (console.error('[HashChecker] Cache clear failed:', t), window.location.reload(!0));
    }
  }
  stop() {
    (this.checkInterval && (clearInterval(this.checkInterval), (this.checkInterval = null)),
      (this.isChecking = !1));
  }
  async forceCheck() {
    return this.checkForUpdates();
  }
}
const lr = new ir();
'serviceWorker' in navigator
  ? window.addEventListener('load', async () => {
      try {
        (ee.init(), lr.init(), console.log('✅ Update Service initialized'));
      } catch (r) {
        console.error('❌ Update Service failed:', r);
      }
    })
  : console.log('🔧 Service Worker disabled in development mode');
const Te = document.getElementById('root');
if (!Te) throw new Error('Elemento #root non trovato in index.html');
lt.createRoot(Te).render(e.jsx(N.StrictMode, { children: e.jsx(or, {}) }));
export {
  I as D,
  Be as L,
  M as _,
  ht as a,
  mt as b,
  xt as c,
  wt as d,
  ze as e,
  It as f,
  fr as g,
  X as h,
  gr as i,
  e as j,
  Me as k,
  bt as l,
  vt as m,
  At as n,
  E as o,
  F as p,
  z as q,
  Ct as r,
  q as s,
  Tt as t,
  G as u,
  re as v,
  hr as w,
  mr as x,
  pr as y,
};
