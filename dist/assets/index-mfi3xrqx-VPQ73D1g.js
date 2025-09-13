const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/LoginPage-mfi3xrqx-C7WqHhAp.js',
      'assets/router-mfi3xrqx-CHJqmtwD.js',
      'assets/vendor-mfi3xrqx-D3F3s8fL.js',
      'assets/Section-mfi3xrqx-C-mnImjO.js',
      'assets/firebase-mfi3xrqx-X_I_guKF.js',
      'assets/DashboardPage-mfi3xrqx-DSFZpMix.js',
      'assets/ClassificaPage-mfi3xrqx-uaL-W3Zk.js',
      'assets/charts-mfi3xrqx-D4Hbzm79.js',
      'assets/ShareButtons-mfi3xrqx-CEaYzNwh.js',
      'assets/StatsPage-mfi3xrqx-C6vU89wi.js',
      'assets/Modal-mfi3xrqx-Z0JKSJ-p.js',
      'assets/names-mfi3xrqx-BW9lV2zG.js',
      'assets/BookingPage-mfi3xrqx-9KNPwtCp.js',
      'assets/Badge-mfi3xrqx-BYFA4bzL.js',
      'assets/design-system-mfi3xrqx-B5fzZ68S.js',
      'assets/pricing-mfi3xrqx-DMaWA4wL.js',
      'assets/useUnifiedBookings-mfi3xrqx-DPQ_L2-K.js',
      'assets/unified-booking-service-mfi3xrqx-D9ZNhZ3r.js',
      'assets/LessonBookingPage-mfi3xrqx-H0CGnnkt.js',
      'assets/playerTypes-mfi3xrqx-CIm-hM8a.js',
      'assets/PlayersPage-mfi3xrqx-CnZ6QZ6p.js',
      'assets/MatchesPage-mfi3xrqx-Cv7SYm2t.js',
      'assets/TournamentsPage-mfi3xrqx-Cflgg-8P.js',
      'assets/ProfilePage-mfi3xrqx-DsO4TPJ6.js',
      'assets/ExtraPage-mfi3xrqx-B6xLF1I1.js',
      'assets/format-mfi3xrqx-DAEZv7Mi.js',
      'assets/AdminBookingsPage-mfi3xrqx-Ckmvq-Df.js',
      'assets/DarkModeTestPage-mfi3xrqx-4aqyT1im.js',
    ])
) => i.map((i) => d[i]);
import { r as Oe, a as We } from './vendor-mfi3xrqx-D3F3s8fL.js';
import {
  r as p,
  b as C,
  u as te,
  N as $,
  c as $e,
  O as Ue,
  B as Fe,
  d as Ve,
  e as _,
} from './router-mfi3xrqx-CHJqmtwD.js';
import {
  g as ge,
  a as fe,
  i as pe,
  b as xe,
  c as be,
  d as He,
  s as Ge,
  e as qe,
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
} from './firebase-mfi3xrqx-X_I_guKF.js';
(function () {
  const t = document.createElement('link').relList;
  if (t && t.supports && t.supports('modulepreload')) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
  new MutationObserver((s) => {
    for (const h of s)
      if (h.type === 'childList')
        for (const i of h.addedNodes) i.tagName === 'LINK' && i.rel === 'modulepreload' && n(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function a(s) {
    const h = {};
    return (
      s.integrity && (h.integrity = s.integrity),
      s.referrerPolicy && (h.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === 'use-credentials'
        ? (h.credentials = 'include')
        : s.crossOrigin === 'anonymous'
          ? (h.credentials = 'omit')
          : (h.credentials = 'same-origin'),
      h
    );
  }
  function n(s) {
    if (s.ep) return;
    s.ep = !0;
    const h = a(s);
    fetch(s.href, h);
  }
})();
var K = { exports: {} },
  D = {};
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
  if (le) return D;
  le = 1;
  var r = Oe(),
    t = Symbol.for('react.element'),
    a = Symbol.for('react.fragment'),
    n = Object.prototype.hasOwnProperty,
    s = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    h = { key: !0, ref: !0, __self: !0, __source: !0 };
  function i(l, d, u) {
    var m,
      g = {},
      c = null,
      o = null;
    (u !== void 0 && (c = '' + u),
      d.key !== void 0 && (c = '' + d.key),
      d.ref !== void 0 && (o = d.ref));
    for (m in d) n.call(d, m) && !h.hasOwnProperty(m) && (g[m] = d[m]);
    if (l && l.defaultProps) for (m in ((d = l.defaultProps), d)) g[m] === void 0 && (g[m] = d[m]);
    return { $$typeof: t, type: l, key: c, ref: o, props: g, _owner: s.current };
  }
  return ((D.Fragment = a), (D.jsx = i), (D.jsxs = i), D);
}
var ce;
function nt() {
  return (ce || ((ce = 1), (K.exports = ot())), K.exports);
}
var e = nt(),
  H = {},
  de;
function it() {
  if (de) return H;
  de = 1;
  var r = We();
  return ((H.createRoot = r.createRoot), (H.hydrateRoot = r.hydrateRoot), H);
}
var lt = it();
const ct = 'modulepreload',
  dt = function (r) {
    return '/' + r;
  },
  ue = {},
  M = function (t, a, n) {
    let s = Promise.resolve();
    if (a && a.length > 0) {
      let d = function (u) {
        return Promise.all(
          u.map((m) =>
            Promise.resolve(m).then(
              (g) => ({ status: 'fulfilled', value: g }),
              (g) => ({ status: 'rejected', reason: g })
            )
          )
        );
      };
      document.getElementsByTagName('link');
      const i = document.querySelector('meta[property=csp-nonce]'),
        l = i?.nonce || i?.getAttribute('nonce');
      s = d(
        a.map((u) => {
          if (((u = dt(u)), u in ue)) return;
          ue[u] = !0;
          const m = u.endsWith('.css'),
            g = m ? '[rel="stylesheet"]' : '';
          if (document.querySelector(`link[href="${u}"]${g}`)) return;
          const c = document.createElement('link');
          if (
            ((c.rel = m ? 'stylesheet' : ct),
            m || (c.as = 'script'),
            (c.crossOrigin = ''),
            (c.href = u),
            l && c.setAttribute('nonce', l),
            document.head.appendChild(c),
            m)
          )
            return new Promise((o, f) => {
              (c.addEventListener('load', o),
                c.addEventListener('error', () => f(new Error(`Unable to preload CSS for ${u}`))));
            });
        })
      );
    }
    function h(i) {
      const l = new Event('vite:preloadError', { cancelable: !0 });
      if (((l.payload = i), window.dispatchEvent(l), !l.defaultPrevented)) throw i;
    }
    return s.then((i) => {
      for (const l of i || []) l.status === 'rejected' && h(l.reason);
      return t().catch(h);
    });
  },
  W = {
    apiKey: 'AIzaSyDMP7772cyEY1oLzo8f9hMW7Leu4lWc6OU',
    authDomain: 'm-padelweb.firebaseapp.com',
    projectId: 'm-padelweb',
    appId: '1:1004722051733:web:3ce3c4476a9e329d80999c',
    storageBucket: 'm-padelweb.firebasestorage.app',
    messagingSenderId: '1004722051733',
    measurementId: 'G-0XZCHGMWVR',
  },
  ut = ['apiKey', 'authDomain', 'projectId', 'appId'],
  me = ut.filter((r) => !W[r]);
if (me.length > 0) throw new Error(`Missing Firebase configuration: ${me.join(', ')}`);
const Se = ge().length ? fe() : pe(W),
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
      projectId: W.projectId,
      authDomain: W.authDomain,
      appId: W.appId,
      emulator: !1,
      isDev: !1,
      user: E?.currentUser ? { uid: E.currentUser.uid } : null,
    };
    console.log('[Firebase][authdebug]', t);
  }
} catch {}
function Ae(r) {
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
async function mt() {
  const r = new Je();
  (r.addScope('email'), r.addScope('profile'), r.setCustomParameters({ prompt: 'select_account' }));
  let t = null;
  try {
    t = await ve(E, r);
  } catch (a) {
    const n = String(a?.message || '').toLowerCase(),
      s = String(a?.code || '').toLowerCase();
    if (n.includes('cross-origin-opener-policy') || n.includes('window.closed')) return t;
    if (
      s.includes('auth/unauthorized-domain') ||
      s.includes('auth/operation-not-supported') ||
      s.includes('auth/popup-blocked') ||
      s.includes('auth/popup-closed-by-user') ||
      n.includes('requests-from-referer') ||
      n.includes('cross-origin') ||
      n.includes('popup')
    )
      return (await Ke(E, r), null);
    throw a;
  }
  return (t && t.user && (await Ne(t.user)), t);
}
async function Ne(r) {
  try {
    const t = await F(r.uid);
    if (!t.email || !t.firstName) {
      const a = (r.displayName || '').split(' '),
        n = {
          email: r.email,
          firstName: t.firstName || a[0] || '',
          lastName: t.lastName || a.slice(1).join(' ') || '',
          phone: t.phone || '',
          avatar: r.photoURL || '',
          provider: 'google',
          ...t,
        };
      await G(r.uid, n);
    }
  } catch (t) {
    console.warn('Errore creazione/aggiornamento profilo:', t);
  }
}
async function ht() {
  const r = new Ye();
  (r.addScope('email'), r.addScope('public_profile'));
  const t = await ve(E, r);
  return (t && t.user && (await Ne(t.user)), t);
}
async function gt(r, t) {
  if (!r || !t) throw new Error('Email e password sono obbligatorie');
  const a = await Xe(E, r, t);
  if (a.user) {
    const n = await F(a.user.uid);
    n.email ||
      (await G(a.user.uid, {
        email: a.user.email,
        firstName: '',
        lastName: '',
        phone: '',
        provider: 'password',
        ...n,
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
    if (!He(E, r)) return null;
    let t = null;
    try {
      t = localStorage.getItem('ml-magic-email');
    } catch {}
    t || (t = window.prompt('Per completare l’accesso, inserisci la tua email:') || '');
    const a = await Ge(E, t, r);
    try {
      localStorage.removeItem('ml-magic-email');
    } catch {}
    if ((window.history.replaceState({}, document.title, window.location.pathname), a.user)) {
      const n = await F(a.user.uid);
      if (!n.email) {
        const s = {
          email: a.user.email,
          firstName: '',
          lastName: '',
          phone: '',
          provider: 'email',
          ...n,
        };
        await G(a.user.uid, s);
      }
    }
    return a;
  } catch (r) {
    throw (console.warn('completeMagicLinkIfPresent error:', r), r);
  }
}
async function bt() {
  await qe(E);
}
async function F(r) {
  const t = U(re, 'profiles', r),
    a = await we(t);
  return a.exists() ? a.data() : {};
}
async function G(r, t) {
  const a = U(re, 'profiles', r);
  await ye(a, { ...t, _updatedAt: Date.now() }, { merge: !0 });
}
async function wt(r, t) {
  await et(r, { displayName: t });
}
async function vt(r = 500) {
  const t = ke(re, 'profiles'),
    a = await je(tt(t, rt(r))),
    n = [];
  return (
    a.forEach((s) => {
      const h = s.data() || {};
      n.push({ uid: s.id, ...h });
    }),
    n
  );
}
const dr = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        auth: E,
        completeMagicLinkIfPresent: xt,
        getUserProfile: F,
        listAllUserProfiles: vt,
        loginWithEmailPassword: ft,
        loginWithFacebook: ht,
        loginWithGoogle: mt,
        logout: bt,
        onAuth: Ae,
        registerWithEmailPassword: gt,
        saveUserProfile: G,
        sendResetPassword: pt,
        setDisplayName: wt,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  Ce = p.createContext(null),
  q = () => {
    const r = p.useContext(Ce);
    if (!r) throw new Error('useAuth must be used within an AuthProvider');
    return r;
  };
function yt({ children: r }) {
  const [t, a] = p.useState(null),
    [n, s] = p.useState(null),
    [h, i] = p.useState(!0),
    [l, d] = p.useState(null);
  p.useEffect(
    () =>
      Ae(async (o) => {
        try {
          if ((a(o), o)) {
            const f = await F(o.uid);
            s(f);
          } else s(null);
          d(null);
        } catch (f) {
          (console.error('Auth error:', f), d(f), s(null));
        } finally {
          i(!1);
        }
      }),
    []
  );
  const u = !!t,
    m = n?.firstName && n?.phone,
    g = {
      user: t,
      userProfile: n,
      setUserProfile: s,
      loading: h,
      error: l,
      isAuthenticated: u,
      isProfileComplete: m,
    };
  return e.jsx(Ce.Provider, { value: g, children: r });
}
const kt = {
    apiKey: 'AIzaSyDMP7772cyEY1oLzo8f9hMW7Leu4lWc6OU',
    authDomain: 'm-padelweb.firebaseapp.com',
    projectId: 'm-padelweb',
  },
  Ie = ge().length ? fe() : pe(kt);
be(Ie);
const V = xe(Ie, {
  experimentalAutoDetectLongPolling: !0,
  experimentalForceLongPolling: !1,
  useFetchStreams: !1,
});
async function ae(r) {
  const t = await we(U(V, 'leagues', r));
  return t.exists() ? t.data() : null;
}
async function jt() {
  try {
    const r = await je(ke(V, 'leagues')),
      t = [];
    return (
      r.forEach((a) => {
        const n = a.data();
        t.push({
          id: a.id,
          name: n.name || a.id,
          players: n.players?.length || 0,
          matches: n.matches?.length || 0,
          lastUpdated: n._updatedAt ? new Date(n._updatedAt).toLocaleString() : 'N/A',
          courts: n.courts?.length || 0,
        });
      }),
      t.sort((a, n) => (n._updatedAt || 0) - (a._updatedAt || 0))
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
      const n = `firebase-backup-${Date.now()}`;
      (localStorage.setItem(
        n,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          data: a,
          reason: 'Auto-backup before potential data loss',
        })
      ),
        console.log('🔒 Backup automatico creato prima del salvataggio:', n));
    }
  } catch (a) {
    console.warn('Impossibile creare backup automatico:', a);
  }
  (await ye(U(V, 'leagues', r), t, { merge: !0 }),
    console.log('✅ Dati salvati nel cloud:', {
      players: t.players?.length,
      matches: t.matches?.length,
    }));
}
function Le(r, t) {
  return st(U(V, 'leagues', r), (a) => {
    a.exists() && t(a.data());
  });
}
const ur = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        db: V,
        listLeagues: jt,
        loadLeague: ae,
        saveLeague: Pe,
        subscribeLeague: Le,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  O = (r) => Math.round(Number(r || 0)),
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
    n = 0,
    s = 0;
  for (const i of r || []) {
    const l = Number(i?.a || 0),
      d = Number(i?.b || 0);
    (String(l) === '' && String(d) === '') || ((n += l), (s += d), l > d ? t++ : d > l && a++);
  }
  let h = null;
  return (
    t > a ? (h = 'A') : a > t && (h = 'B'),
    { setsA: t, setsB: a, gamesA: n, gamesB: s, winner: h }
  );
}
function At(r) {
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
function Nt(r) {
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
  ratingB2: n,
  gamesA: s,
  gamesB: h,
  winner: i,
  sets: l,
}) {
  const d = Number(r || 0),
    u = Number(t || 0),
    m = Number(a || 0),
    g = Number(n || 0),
    c = d + u,
    o = m + g,
    f = i === 'A' ? c : o,
    j = i === 'A' ? o : c,
    x = (c + o) / 100,
    b = j - f,
    A = At(b),
    L = i === 'A' ? s - h : h - s,
    v = (x + L) * A,
    y = Math.round(v),
    N = i === 'A' ? y : -y,
    k = i === 'B' ? y : -y,
    w = `Risultato set: ${St(l)}`,
    P =
      `Team A=${O(c)}, Team B=${O(o)}, Gap=${O(b)}
Fascia: ${Nt(b)}

Base = (${O(c)} + ${O(o)})/100 = ${Y(x)}
DG (Differenza Game) = ${L}

Punti = (Base + DG) × factor = (${Y(x)} + ${L}) × ${A.toFixed(2)} = ${Y(v)}
Punti (arrotondato) = ${y}
` +
      (i === 'A' ? `Team A +${y}, Team B -${y}` : `Team B +${y}, Team A -${y}`) +
      `
${w}`;
  return {
    deltaA: N,
    deltaB: k,
    pts: y,
    base: x,
    factor: A,
    gap: b,
    sumA: c,
    sumB: o,
    gd: L,
    formula: P,
  };
}
const mr = () => Math.random().toString(36).slice(2, 10),
  I = 1e3,
  T = 'paris-league-v1';
function Ct(r, t) {
  const a = new Map(
      r.map((i) => {
        const l = Number(i.baseRating ?? i.startRating ?? i.rating ?? I);
        return [
          i.id,
          {
            ...i,
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
    n = new Map(r.map((i) => [i.id, []])),
    s = [],
    h = [...(t || [])].sort((i, l) => new Date(i.date) - new Date(l.date));
  for (const i of h) {
    const l = a.get(i.teamA[0]),
      d = a.get(i.teamA[1]),
      u = a.get(i.teamB[0]),
      m = a.get(i.teamB[1]),
      g = X(i.sets),
      c = Z({
        ratingA1: l?.rating ?? I,
        ratingA2: d?.rating ?? I,
        ratingB1: u?.rating ?? I,
        ratingB2: m?.rating ?? I,
        gamesA: g.gamesA,
        gamesB: g.gamesB,
        winner: g.winner,
        sets: i.sets,
      }),
      o = { ...i, ...g, ...c };
    s.push(o);
    const f = (j, x) => {
      if (!j) return;
      const b = n.get(j) || [];
      (b.push(x), n.set(j, b));
    };
    (f(l?.id, c.deltaA),
      f(d?.id, c.deltaA),
      f(u?.id, c.deltaB),
      f(m?.id, c.deltaB),
      l && (l.lastDelta = c.deltaA),
      d && (d.lastDelta = c.deltaA),
      u && (u.lastDelta = c.deltaB),
      m && (m.lastDelta = c.deltaB),
      g.winner === 'A'
        ? (l && (l.rating += c.deltaA),
          d && (d.rating += c.deltaA),
          u && (u.rating += c.deltaB),
          m && (m.rating += c.deltaB),
          l && l.wins++,
          d && d.wins++,
          u && u.losses++,
          m && m.losses++)
        : g.winner === 'B' &&
          (l && (l.rating += c.deltaA),
          d && (d.rating += c.deltaA),
          u && (u.rating += c.deltaB),
          m && (m.rating += c.deltaB),
          u && u.wins++,
          m && m.wins++,
          l && l.losses++,
          d && d.losses++));
  }
  for (const i of a.values()) {
    const d = (n.get(i.id) || []).slice(-5);
    let u = 0,
      m = 0,
      g = 0;
    for (const c of d) ((g += c), c >= 0 ? (u += c) : (m += -c));
    ((i.trend5Total = g), (i.trend5Pos = u), (i.trend5Neg = m));
  }
  return { players: Array.from(a.values()), matches: s };
}
function hr(r, t, a) {
  const n = new Map(r.map((o) => [o.id, o.name])),
    h = [...(t || [])].sort((o, f) => new Date(o.date) - new Date(f.date)).slice(-15),
    i = new Map(r.map((o) => [o.id, Number(o.rating ?? I)])),
    l = new Map(i),
    d = [...h].reverse();
  for (const o of d) {
    const f = X(o.sets),
      j = Z({
        ratingA1: l.get(o.teamA[0]) ?? I,
        ratingA2: l.get(o.teamA[1]) ?? I,
        ratingB1: l.get(o.teamB[0]) ?? I,
        ratingB2: l.get(o.teamB[1]) ?? I,
        gamesA: f.gamesA,
        gamesB: f.gamesB,
        winner: f.winner,
        sets: o.sets,
      }),
      x = (b, A) => l.set(b, (l.get(b) ?? I) - A);
    (x(o.teamA[0], j.deltaA),
      x(o.teamA[1], j.deltaA),
      x(o.teamB[0], j.deltaB),
      x(o.teamB[1], j.deltaB));
  }
  const u = new Map(l),
    m = [],
    g = { label: 'Inizio periodo' };
  for (const o of a) g[n.get(o) || o] = Math.round(u.get(o) ?? I);
  m.push(g);
  for (const o of h) {
    const f = X(o.sets),
      j = Z({
        ratingA1: u.get(o.teamA[0]) ?? I,
        ratingA2: u.get(o.teamA[1]) ?? I,
        ratingB1: u.get(o.teamB[0]) ?? I,
        ratingB2: u.get(o.teamB[1]) ?? I,
        gamesA: f.gamesA,
        gamesB: f.gamesB,
        winner: f.winner,
        sets: o.sets,
      }),
      x = (A, L) => u.set(A, (u.get(A) ?? I) + L);
    (x(o.teamA[0], j.deltaA),
      x(o.teamA[1], j.deltaA),
      x(o.teamB[0], j.deltaB),
      x(o.teamB[1], j.deltaB));
    const b = {
      label: new Date(o.date).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    for (const A of a) b[n.get(A) || A] = Math.round(u.get(A) ?? I);
    m.push(b);
  }
  const c = { label: 'Attuale' };
  for (const o of a) c[n.get(o) || o] = Math.round(i.get(o) ?? I);
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
function he() {
  return { players: [], matches: [], courts: [], bookings: [], bookingConfig: z() };
}
const _e = p.createContext(null),
  It = () => {
    const r = p.useContext(_e);
    if (!r) throw new Error('useLeague must be used within a LeagueProvider');
    return r;
  };
function Pt({ children: r }) {
  const { user: t, loading: a } = q(),
    [n, s] = p.useState(null),
    [h, i] = p.useState(!0),
    [l, d] = p.useState(null),
    [u, m] = p.useState(!1),
    [g, c] = p.useState(localStorage.getItem(T + '-leagueId') || 'lega-andrea-2025'),
    o = p.useRef(null);
  if (!o.current) {
    const v = (() => {
      try {
        return localStorage.getItem('ml-client-id');
      } catch {
        return null;
      }
    })();
    if (v) o.current = v;
    else {
      const y = Math.random().toString(36).slice(2, 10);
      o.current = y;
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
      const N = typeof v == 'function' ? v(y) : v,
        k = Date.now(),
        w = (y?._rev || 0) + 1;
      return ((f.current = k + 2e3), { ...N, _updatedAt: k, _rev: w, _lastWriter: o.current });
    });
  };
  (p.useEffect(() => {
    a ||
      (async () => {
        try {
          if ((i(!0), d(null), t)) {
            const N = await ae(g);
            if (N && typeof N == 'object' && Array.isArray(N.players) && Array.isArray(N.matches)) {
              const w = { ...N };
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
            const N = localStorage.getItem(T);
            if (N) {
              const k = JSON.parse(N);
              if (k && Array.isArray(k.players) && Array.isArray(k.matches)) {
                s(k);
                const w = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
                j.current = w.reduce((P, R) => ((P[R] = k[R] || []), P), {});
                return;
              }
            }
          } catch {}
          const v = he();
          s(v);
          const y = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
          ((j.current = y.reduce((N, k) => ((N[k] = v[k] || []), N), {})),
            console.log('� App inizializzata con stato vuoto - aggiungi i tuoi dati!'));
          try {
            localStorage.setItem(T, JSON.stringify(v));
          } catch {}
        } catch (v) {
          (console.error('League load error:', v), d(v));
          const y = he();
          s(y);
        } finally {
          i(!1);
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
                const De = [
                  'players',
                  'matches',
                  'courts',
                  'bookings',
                  'bookingConfig',
                  'lessonConfig',
                ];
                j.current = De.reduce((ne, ie) => ((ne[ie] = k[ie]), ne), {});
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
      if (!n || u || !t) return;
      const v = ['players', 'matches', 'courts', 'bookings', 'bookingConfig', 'lessonConfig'],
        y = v.reduce((w, P) => ((w[P] = n[P]), w), {}),
        N = j.current;
      if (!N || v.some((w) => JSON.stringify(y[w]) !== JSON.stringify(N[w])))
        try {
          localStorage.setItem(T, JSON.stringify(n));
          const P = {
              ...Object.fromEntries(Object.entries(n).filter(([B, J]) => J !== void 0)),
              _updatedAt: Date.now(),
              _lastWriter: o.current,
              _rev: (n._rev || 0) + 1,
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
    }, [n, g, u, t]));
  const b = C.useMemo(
      () => (n ? Ct(n.players || [], n.matches || []) : { players: [], matches: [] }),
      [n]
    ),
    A = C.useMemo(() => Object.fromEntries((b.players || []).map((v) => [v.id, v])), [b]),
    L = {
      state: n,
      setState: x,
      derived: b,
      playersById: A,
      leagueId: g,
      setLeagueId: c,
      loading: h,
      error: l,
      updatingFromCloud: u,
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
    [n, s] = p.useState(() => {
      try {
        const b = sessionStorage.getItem('ml-extra-unlocked') === '1',
          A = sessionStorage.getItem('ml-club-mode') === '1';
        return b && A;
      } catch {
        return !1;
      }
    }),
    [h, i] = p.useState([]),
    [l, d] = p.useState(!1),
    [u, m] = p.useState(null);
  (p.useEffect(() => {
    try {
      t
        ? (document.documentElement.classList.add('dark'),
          localStorage.setItem('play-sport-pro-theme', 'dark'))
        : (document.documentElement.classList.remove('dark'),
          localStorage.setItem('play-sport-pro-theme', 'light'));
    } catch {}
  }, [t]),
    C.useEffect(() => {
      try {
        n ? sessionStorage.setItem('ml-club-mode', '1') : sessionStorage.removeItem('ml-club-mode');
      } catch {}
    }, [n]));
  const g = () => {
      a((b) => !b);
    },
    c = (b) => {
      const A = Math.random().toString(36).slice(2),
        L = { id: A, ...b };
      return (
        i((v) => [...v, L]),
        setTimeout(() => {
          o(A);
        }, 5e3),
        A
      );
    },
    o = (b) => {
      i((A) => A.filter((L) => L.id !== b));
    },
    x = {
      darkMode: t,
      setDarkMode: a,
      toggleTheme: g,
      clubMode: n,
      setClubMode: s,
      notifications: h,
      addNotification: c,
      removeNotification: o,
      loading: l,
      setLoading: d,
      modal: u,
      showModal: (b) => {
        m(b);
      },
      hideModal: () => {
        m(null);
      },
    };
  return e.jsx(Ee.Provider, { value: x, children: r });
}
class _t extends C.Component {
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
    const n = r.state?.from?.pathname;
    return n && n !== '/login' ? n : '/dashboard';
  }
  return a === '/' ? '/dashboard' : null;
}
function Rt({ children: r, requireProfile: t = !0 }) {
  const { user: a, userProfile: n, isAuthenticated: s, isProfileComplete: h, loading: i } = q(),
    l = te();
  if (i) return e.jsx(se, { message: 'Verifica autenticazione...' });
  if (!s) {
    const d = '/login';
    if (Q(l.pathname, d)) return e.jsx($, { to: d, state: { from: l }, replace: !0 });
  }
  if (s && t && n !== null && !h) {
    const d = '/profile';
    if (Q(l.pathname, d)) return e.jsx($, { to: d, state: { from: l }, replace: !0 });
  }
  return r;
}
function Bt({ children: r }) {
  const { isAuthenticated: t, loading: a } = q(),
    n = te();
  if (a) return e.jsx(se, { message: 'Verifica autenticazione...' });
  if (t) {
    const s = Mt(n);
    if (s && Q(n.pathname, s)) return e.jsx($, { to: s, replace: !0 });
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
function Dt() {
  const { notifications: r, removeNotification: t } = Me();
  return r.length === 0
    ? null
    : e.jsx('div', {
        className: 'fixed top-4 right-4 space-y-2',
        style: { zIndex: 100001 },
        children: r.map((a) => e.jsx(Ot, { notification: a, onRemove: t }, a.id)),
      });
}
function Ot({ notification: r, onRemove: t }) {
  const { id: a, type: n = 'info', title: s, message: h, autoClose: i = !0 } = r,
    l = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white',
    },
    d = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  return (
    C.useEffect(() => {
      if (i) {
        const u = setTimeout(() => {
          t(a);
        }, 5e3);
        return () => clearTimeout(u);
      }
    }, [a, i, t]),
    e.jsx('div', {
      className: `${l[n]} px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slide-in-right`,
      role: 'alert',
      children: e.jsxs('div', {
        className: 'flex items-start',
        children: [
          e.jsx('span', { className: 'text-lg mr-2', children: d[n] }),
          e.jsxs('div', {
            className: 'flex-1',
            children: [
              s && e.jsx('div', { className: 'font-medium', children: s }),
              h && e.jsx('div', { className: 'text-sm opacity-90', children: h }),
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
function Wt({ active: r, setActive: t, clubMode: a, T: n, user: s, navigation: h }) {
  const i = h || [
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
    children: i.map((l) =>
      e.jsx(
        'button',
        {
          type: 'button',
          onClick: () => t(l.id),
          className: `px-3 py-1.5 rounded-xl text-sm transition ring-1 ${r === l.id ? n.btnPrimary : n.ghostRing}`,
          'aria-current': r === l.id ? 'page' : void 0,
          children: l.label,
        },
        l.id
      )
    ),
  });
}
function $t({ active: r, setActive: t, navigation: a = [], clubMode: n = !1 }) {
  const [s, h] = p.useState(!1),
    i =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    l = (o, f) => {
      if ((f && (f.preventDefault(), f.stopPropagation()), r === o.id)) return;
      setTimeout(
        () => {
          (t(o.id), s && h(!1));
        },
        i ? 0 : 50
      );
    },
    d = (o) => {
      (o.stopPropagation(), o.preventDefault(), h(!s));
    },
    u = (o, f) => {
      (f.stopPropagation(),
        f.preventDefault(),
        setTimeout(() => {
          (t(o.id), h(!1));
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
    c = n
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
    onClick: (o) => o.stopPropagation(),
    onTouchEnd: (o) => o.stopPropagation(),
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
                children: g.map((o) =>
                  e.jsxs(
                    'div',
                    {
                      className: `flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${r === o.id ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 border border-blue-200/30 dark:border-blue-600/30' : 'bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 border border-white/30 dark:border-gray-600/30 shadow-lg hover:shadow-xl'}`,
                      onClick: (f) => u(o, f),
                      style: {
                        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                      },
                      children: [
                        e.jsx('div', {
                          className: `w-8 h-8 rounded-lg flex items-center justify-center ${r === o.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md'}`,
                          children: o.icon,
                        }),
                        e.jsx('span', { className: 'text-sm font-medium', children: o.label }),
                      ],
                    },
                    o.id
                  )
                ),
              }),
            ],
          }),
        }),
      e.jsxs('div', {
        className: 'grid grid-cols-5 h-16 px-2',
        children: [
          c.map((o, f) =>
            e.jsxs(
              'div',
              {
                className: `bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${r === o.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                onClick: i ? void 0 : (j) => l(o, j),
                onTouchEnd: i ? (j) => l(o, j) : void 0,
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
                    className: `relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${r === o.id ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-600/30 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 transform scale-110' : 'hover:bg-white/60 dark:hover:bg-gray-700/60 hover:backdrop-blur-sm hover:border hover:border-white/20 dark:hover:border-gray-600/20 hover:shadow-lg hover:transform hover:scale-105'}`,
                    children: [
                      r === o.id &&
                        e.jsx('div', {
                          className:
                            'absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg',
                        }),
                      o.icon,
                    ],
                  }),
                  e.jsx('span', {
                    className: `font-medium text-xs leading-tight ${r === o.id ? 'font-semibold' : ''}`,
                    children: o.label,
                  }),
                ],
              },
              o.id
            )
          ),
          n &&
            e.jsxs('div', {
              className: `bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${s ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
              onClick: i ? void 0 : (o) => d(o),
              onTouchEnd: i ? (o) => d(o) : void 0,
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
    [a, n] = p.useState(!1),
    [s, h] = p.useState(!1),
    [i, l] = p.useState({});
  p.useEffect(() => {
    ((() => {
      const x = navigator.userAgent,
        b = /iPad|iPhone|iPod/.test(x),
        A = /Android/.test(x),
        L = b || A || /Mobile|Tablet/.test(x),
        v = /Chrome/.test(x) && !/Edge|Edg/.test(x),
        y = /Edge|Edg/.test(x),
        N = /Firefox/.test(x),
        k = /Safari/.test(x) && !/Chrome|CriOS|FxiOS/.test(x),
        w = /OPR|Opera/.test(x),
        P = /SamsungBrowser/.test(x);
      l({
        isIOS: b,
        isAndroid: A,
        isMobile: L,
        isChrome: v,
        isEdge: y,
        isFirefox: N,
        isSafari: k,
        isOpera: w,
        isSamsung: P,
        supportsInstallPrompt: v || y || P || w,
      });
    })(),
      (() => {
        const x = window.matchMedia('(display-mode: standalone)').matches,
          b = window.navigator.standalone === !0,
          A = window.matchMedia('(display-mode: fullscreen)').matches,
          L = window.matchMedia('(display-mode: minimal-ui)').matches,
          v = x || b || A || L;
        (h(v), v && console.log('✅ PWA is already installed'));
      })());
    const f = (x) => {
        (console.log('🚀 PWA installation prompt ready'), x.preventDefault(), t(x), n(!0));
      },
      j = () => {
        (console.log('✅ PWA installed successfully'),
          h(!0),
          n(!1),
          t(null),
          localStorage.setItem('pwa_installed', 'true'));
      };
    return (
      i.supportsInstallPrompt &&
        (window.addEventListener('beforeinstallprompt', f),
        window.addEventListener('appinstalled', j)),
      () => {
        (window.removeEventListener('beforeinstallprompt', f),
          window.removeEventListener('appinstalled', j));
      }
    );
  }, [i.supportsInstallPrompt]);
  const d = async () => {
      if (!r) return (console.warn('⚠️ No deferred prompt available'), !1);
      try {
        r.prompt();
        const { outcome: c } = await r.userChoice;
        return c === 'accepted'
          ? (console.log('✅ User accepted PWA installation'), n(!1), t(null), !0)
          : (console.log('❌ User declined PWA installation'), !1);
      } catch (c) {
        return (console.error('❌ PWA installation failed:', c), !1);
      }
    },
    u = () => {
      const { isIOS: c, isAndroid: o, isSafari: f, isFirefox: j, isChrome: x, isEdge: b } = i;
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
              instructions: o
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
          : o && (x || b)
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
            : !i.isMobile && (x || b)
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
    isInstallable: s ? !1 : !!((i.isIOS && i.isSafari) || (a && r) || i.isFirefox),
    isInstalled: s,
    installApp: d,
    browserInfo: i,
    isPWASupported: m(),
    installInstructions: u(),
  };
}
function Ut({ className: r = '' }) {
  const {
      isInstallable: t,
      isInstalled: a,
      installApp: n,
      browserInfo: s,
      isPWASupported: h,
      installInstructions: i,
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
  if (!h)
    return e.jsx('div', {
      className: `text-gray-500 text-sm ${r}`,
      children: 'Browser non supportato per PWA',
    });
  if (!t) return null;
  const u = async () => {
      if (i.show) {
        d(!0);
        return;
      }
      try {
        (await n()) || (i.show && d(!0));
      } catch (g) {
        (console.error('Install failed:', g), i.show && d(!0));
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
        onClick: u,
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
        i.show &&
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
                  children: e.jsx('span', { className: 'text-3xl', children: i.icon }),
                }),
                e.jsx('h3', {
                  className: 'text-xl font-bold text-gray-900 mb-2',
                  children: i.title,
                }),
                e.jsx('p', {
                  className: 'text-gray-600 mb-6',
                  children: 'Segui questi semplici passaggi per installare Paris League:',
                }),
                e.jsx('div', {
                  className: 'text-left space-y-4 mb-8',
                  children: i.instructions.map((g, c) =>
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
                          (d(!1), await n());
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
      browserInfo: n,
      installInstructions: s,
    } = ze(),
    [h, i] = p.useState(!1),
    [l, d] = p.useState(!1);
  if (t || !r) return null;
  const u = async () => {
      if (s && s.show) {
        i(!0);
        return;
      }
      try {
        await a();
      } catch (g) {
        (console.error('Install failed:', g), s && s.show && i(!0));
      }
    },
    m = () => (n && n.isIOS ? '📱 Installa' : n && n.isAndroid ? '🤖 Installa' : 'Installa App');
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
                  onClick: u,
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
      h &&
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
                    n &&
                      !n.isIOS &&
                      !n.isFirefox &&
                      e.jsx('button', {
                        onClick: async () => {
                          (i(!1), await a());
                        },
                        className:
                          'w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors',
                        children: 'Prova Auto-Install',
                      }),
                    e.jsx('button', {
                      onClick: () => i(!1),
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
function Vt() {
  const [r, t] = p.useState(!0),
    [a, n] = p.useState(!1);
  return (p.useEffect(() => {}, []), null);
}
function Ht() {
  const { user: r } = q(),
    { clubMode: t, loading: a } = Me(),
    { updatingFromCloud: n } = It(),
    s = te(),
    h = $e(),
    i = C.useMemo(() => Tt(), []),
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
    u = l.find((c) => c.path === d)?.id || '',
    m = (c) => {
      if (u === c) {
        console.log(`Already on tab ${c}, preventing navigation`);
        return;
      }
      const o = l.find((f) => f.id === c);
      o && (console.log(`Navigating from ${u} to ${c}`), h(o.path, { replace: !0 }));
    },
    g = d === '/dashboard' || d === '/';
  return e.jsxs('div', {
    className: `min-h-screen safe-area-top safe-area-bottom ${i.text} ${g ? 'bg-gradient-to-b from-neutral-50 via-white to-neutral-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900' : i.pageBg}`,
    children: [
      e.jsx('header', {
        className: `sticky top-0 z-20 ${i.headerBg} safe-area-left safe-area-right`,
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
                e.jsx(Wt, { active: u, setActive: m, clubMode: t, T: i, user: r, navigation: l }),
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
      e.jsx($t, { active: u, setActive: m, navigation: l, clubMode: t }),
      e.jsx(Ft, {}),
      e.jsx(Dt, {}),
      e.jsx(Et, { visible: a || n, message: n ? 'Sincronizzazione...' : 'Caricamento...' }),
      e.jsx(Vt, {}),
    ],
  });
}
const Gt = C.lazy(() =>
    M(() => import('./LoginPage-mfi3xrqx-C7WqHhAp.js'), __vite__mapDeps([0, 1, 2, 3, 4]))
  ),
  qt = C.lazy(() =>
    M(() => import('./DashboardPage-mfi3xrqx-DSFZpMix.js'), __vite__mapDeps([5, 1, 2, 4]))
  ),
  Jt = C.lazy(() =>
    M(() => import('./ClassificaPage-mfi3xrqx-uaL-W3Zk.js'), __vite__mapDeps([6, 1, 2, 3, 7, 8, 4]))
  ),
  Kt = C.lazy(() =>
    M(
      () => import('./StatsPage-mfi3xrqx-C6vU89wi.js'),
      __vite__mapDeps([9, 1, 2, 3, 8, 7, 10, 11, 4])
    )
  ),
  Yt = C.lazy(() =>
    M(
      () => import('./BookingPage-mfi3xrqx-9KNPwtCp.js'),
      __vite__mapDeps([12, 1, 2, 13, 14, 15, 16, 17, 4])
    )
  ),
  Xt = C.lazy(() =>
    M(
      () => import('./LessonBookingPage-mfi3xrqx-H0CGnnkt.js'),
      __vite__mapDeps([18, 1, 2, 3, 13, 14, 19, 16, 17, 4, 10])
    )
  ),
  Zt = C.lazy(() =>
    M(
      () => import('./PlayersPage-mfi3xrqx-CnZ6QZ6p.js'),
      __vite__mapDeps([20, 1, 2, 3, 10, 11, 19, 17, 4])
    )
  ),
  Qt = C.lazy(() =>
    M(() => import('./MatchesPage-mfi3xrqx-Cv7SYm2t.js'), __vite__mapDeps([21, 1, 2, 3, 11, 4]))
  ),
  er = C.lazy(() =>
    M(() => import('./TournamentsPage-mfi3xrqx-Cflgg-8P.js'), __vite__mapDeps([22, 1, 2, 3, 4]))
  ),
  tr = C.lazy(() =>
    M(() => import('./ProfilePage-mfi3xrqx-DsO4TPJ6.js'), __vite__mapDeps([23, 1, 2, 3, 4]))
  ),
  rr = C.lazy(() =>
    M(() => import('./ExtraPage-mfi3xrqx-B6xLF1I1.js'), __vite__mapDeps([24, 1, 2, 3, 25, 4]))
  ),
  ar = C.lazy(() =>
    M(
      () => import('./AdminBookingsPage-mfi3xrqx-Ckmvq-Df.js'),
      __vite__mapDeps([26, 1, 2, 3, 10, 25, 15, 16, 17, 4, 19])
    )
  ),
  sr = C.lazy(() =>
    M(() => import('./DarkModeTestPage-mfi3xrqx-4aqyT1im.js'), __vite__mapDeps([27, 1, 2, 14, 4]))
  );
function or() {
  return e.jsx(_t, {
    children: e.jsx(Fe, {
      children: e.jsx(yt, {
        children: e.jsx(Pt, {
          children: e.jsx(Lt, {
            children: e.jsx(p.Suspense, {
              fallback: e.jsx(se, {}),
              children: e.jsxs(Ve, {
                children: [
                  e.jsx(_, { path: '/login', element: e.jsx(Bt, { children: e.jsx(Gt, {}) }) }),
                  e.jsxs(_, {
                    path: '/',
                    element: e.jsx(Rt, { children: e.jsx(Ht, {}) }),
                    children: [
                      e.jsx(_, { index: !0, element: e.jsx($, { to: 'dashboard', replace: !0 }) }),
                      e.jsx(_, { path: 'dashboard', element: e.jsx(qt, {}) }),
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
  gr = Object.freeze(
    Object.defineProperty({ __proto__: null, default: ee, updateService: ee }, Symbol.toStringTag, {
      value: 'Module',
    })
  );
'serviceWorker' in navigator &&
  window.addEventListener('load', async () => {
    try {
      (await ee.init(), console.log('✅ Update Service initialized'));
    } catch (r) {
      console.error('❌ Update Service failed:', r);
    }
  });
const Te = document.getElementById('root');
if (!Te) throw new Error('Elemento #root non trovato in index.html');
lt.createRoot(Te).render(e.jsx(C.StrictMode, { children: e.jsx(or, {}) }));
export {
  I as D,
  Be as L,
  M as _,
  mt as a,
  ht as b,
  xt as c,
  wt as d,
  ze as e,
  It as f,
  hr as g,
  X as h,
  mr as i,
  e as j,
  Me as k,
  bt as l,
  vt as m,
  Nt as n,
  E as o,
  F as p,
  z as q,
  At as r,
  G as s,
  Tt as t,
  q as u,
  re as v,
  dr as w,
  ur as x,
  gr as y,
};
