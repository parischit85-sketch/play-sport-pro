const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/LoginPage-mfgp9duf-DfUbAcfN.js',
      'assets/router-mfgp9duf-1fFxCiHK.js',
      'assets/vendor-mfgp9duf-D3F3s8fL.js',
      'assets/Section-mfgp9duf-BzEjYta0.js',
      'assets/firebase-mfgp9duf-X_I_guKF.js',
      'assets/DashboardPage-mfgp9duf-6rSEnbNG.js',
      'assets/ClassificaPage-mfgp9duf-Do2rp-41.js',
      'assets/charts-mfgp9duf-D_Ymw6kL.js',
      'assets/ShareButtons-mfgp9duf-Bb2ChGKb.js',
      'assets/StatsPage-mfgp9duf-CfPvBF6C.js',
      'assets/Modal-mfgp9duf-C4u1B86Q.js',
      'assets/names-mfgp9duf-BW9lV2zG.js',
      'assets/BookingPage-mfgp9duf-qpQos1kS.js',
      'assets/Badge-mfgp9duf-By2BTp7T.js',
      'assets/design-system-mfgp9duf-B5fzZ68S.js',
      'assets/pricing-mfgp9duf-DMaWA4wL.js',
      'assets/useUnifiedBookings-mfgp9duf-CgieqzNu.js',
      'assets/unified-booking-service-mfgp9duf-C7TnzCvm.js',
      'assets/LessonBookingPage-mfgp9duf-TWhU6dkt.js',
      'assets/playerTypes-mfgp9duf-CIm-hM8a.js',
      'assets/PlayersPage-mfgp9duf-DRKKaX5a.js',
      'assets/MatchesPage-mfgp9duf-BMdSA3nk.js',
      'assets/TournamentsPage-mfgp9duf-BBFuB1FE.js',
      'assets/ProfilePage-mfgp9duf-CIxICKaN.js',
      'assets/ExtraPage-mfgp9duf-CLpAWw3T.js',
      'assets/format-mfgp9duf-DAEZv7Mi.js',
      'assets/AdminBookingsPage-mfgp9duf-ij3JIMmq.js',
      'assets/DarkModeTestPage-mfgp9duf-BBj6wvSP.js',
    ])
) => i.map((i) => d[i]);
import { r as De, a as Te } from './vendor-mfgp9duf-D3F3s8fL.js';
import {
  r as p,
  b as C,
  u as ee,
  N as $,
  c as Oe,
  O as We,
  B as $e,
  d as Fe,
  e as _,
} from './router-mfgp9duf-1fFxCiHK.js';
import {
  g as he,
  a as ge,
  i as fe,
  b as pe,
  c as xe,
  d as Ue,
  s as Ve,
  e as He,
  f as F,
  h as be,
  G as qe,
  j as we,
  k as Ge,
  F as Je,
  l as Ke,
  m as Ye,
  n as Xe,
  o as ve,
  u as Ze,
  p as ye,
  q as ke,
  r as Qe,
  t as et,
  v as tt,
  w as rt,
} from './firebase-mfgp9duf-X_I_guKF.js';
(function () {
  const r = document.createElement('link').relList;
  if (r && r.supports && r.supports('modulepreload')) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) o(s);
  new MutationObserver((s) => {
    for (const h of s)
      if (h.type === 'childList')
        for (const n of h.addedNodes) n.tagName === 'LINK' && n.rel === 'modulepreload' && o(n);
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
  function o(s) {
    if (s.ep) return;
    s.ep = !0;
    const h = a(s);
    fetch(s.href, h);
  }
})();
var K = { exports: {} },
  T = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ie;
function at() {
  if (ie) return T;
  ie = 1;
  var t = De(),
    r = Symbol.for('react.element'),
    a = Symbol.for('react.fragment'),
    o = Object.prototype.hasOwnProperty,
    s = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    h = { key: !0, ref: !0, __self: !0, __source: !0 };
  function n(l, d, u) {
    var m,
      g = {},
      i = null,
      c = null;
    (u !== void 0 && (i = '' + u),
      d.key !== void 0 && (i = '' + d.key),
      d.ref !== void 0 && (c = d.ref));
    for (m in d) o.call(d, m) && !h.hasOwnProperty(m) && (g[m] = d[m]);
    if (l && l.defaultProps) for (m in ((d = l.defaultProps), d)) g[m] === void 0 && (g[m] = d[m]);
    return { $$typeof: r, type: l, key: i, ref: c, props: g, _owner: s.current };
  }
  return ((T.Fragment = a), (T.jsx = n), (T.jsxs = n), T);
}
var le;
function st() {
  return (le || ((le = 1), (K.exports = at())), K.exports);
}
var e = st(),
  H = {},
  ce;
function ot() {
  if (ce) return H;
  ce = 1;
  var t = Te();
  return ((H.createRoot = t.createRoot), (H.hydrateRoot = t.hydrateRoot), H);
}
var nt = ot();
const it = 'modulepreload',
  lt = function (t) {
    return '/' + t;
  },
  de = {},
  M = function (r, a, o) {
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
      const n = document.querySelector('meta[property=csp-nonce]'),
        l = n?.nonce || n?.getAttribute('nonce');
      s = d(
        a.map((u) => {
          if (((u = lt(u)), u in de)) return;
          de[u] = !0;
          const m = u.endsWith('.css'),
            g = m ? '[rel="stylesheet"]' : '';
          if (document.querySelector(`link[href="${u}"]${g}`)) return;
          const i = document.createElement('link');
          if (
            ((i.rel = m ? 'stylesheet' : it),
            m || (i.as = 'script'),
            (i.crossOrigin = ''),
            (i.href = u),
            l && i.setAttribute('nonce', l),
            document.head.appendChild(i),
            m)
          )
            return new Promise((c, w) => {
              (i.addEventListener('load', c),
                i.addEventListener('error', () => w(new Error(`Unable to preload CSS for ${u}`))));
            });
        })
      );
    }
    function h(n) {
      const l = new Event('vite:preloadError', { cancelable: !0 });
      if (((l.payload = n), window.dispatchEvent(l), !l.defaultPrevented)) throw n;
    }
    return s.then((n) => {
      for (const l of n || []) l.status === 'rejected' && h(l.reason);
      return r().catch(h);
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
  ct = ['apiKey', 'authDomain', 'projectId', 'appId'],
  ue = ct.filter((t) => !W[t]);
if (ue.length > 0) throw new Error(`Missing Firebase configuration: ${ue.join(', ')}`);
const je = he().length ? ge() : fe(W),
  te = pe(je, {
    experimentalAutoDetectLongPolling: !0,
    experimentalForceLongPolling: !1,
    useFetchStreams: !1,
  }),
  E = xe(je);
E.useDeviceLanguage && E.useDeviceLanguage();
try {
  if (typeof window < 'u' && new URLSearchParams(window.location.search || '').has('authdebug')) {
    const r = {
      projectId: W.projectId,
      authDomain: W.authDomain,
      appId: W.appId,
      emulator: !1,
      isDev: !1,
      user: E?.currentUser ? { uid: E.currentUser.uid } : null,
    };
    console.log('[Firebase][authdebug]', r);
  }
} catch {}
function Ne(t) {
  return tt(
    E,
    (r) => {
      try {
        t(r);
      } catch (a) {
        (console.error('onAuth callback error:', a), t(null));
      }
    },
    (r) => {
      (console.error('Firebase Auth error:', r), t(null));
    }
  );
}
async function dt() {
  const t = new qe();
  (t.addScope('email'), t.addScope('profile'), t.setCustomParameters({ prompt: 'select_account' }));
  let r = null;
  try {
    r = await we(E, t);
  } catch (a) {
    const o = String(a?.message || '').toLowerCase(),
      s = String(a?.code || '').toLowerCase();
    if (o.includes('cross-origin-opener-policy') || o.includes('window.closed')) return r;
    if (
      s.includes('auth/unauthorized-domain') ||
      s.includes('auth/operation-not-supported') ||
      s.includes('auth/popup-blocked') ||
      s.includes('auth/popup-closed-by-user') ||
      o.includes('requests-from-referer') ||
      o.includes('cross-origin') ||
      o.includes('popup')
    )
      return (await Ge(E, t), null);
    throw a;
  }
  return (r && r.user && (await Ae(r.user)), r);
}
async function Ae(t) {
  try {
    const r = await U(t.uid);
    if (!r.email || !r.firstName) {
      const a = (t.displayName || '').split(' '),
        o = {
          email: t.email,
          firstName: r.firstName || a[0] || '',
          lastName: r.lastName || a.slice(1).join(' ') || '',
          phone: r.phone || '',
          avatar: t.photoURL || '',
          provider: 'google',
          ...r,
        };
      await q(t.uid, o);
    }
  } catch (r) {
    console.warn('Errore creazione/aggiornamento profilo:', r);
  }
}
async function ut() {
  const t = new Je();
  (t.addScope('email'), t.addScope('public_profile'));
  const r = await we(E, t);
  return (r && r.user && (await Ae(r.user)), r);
}
async function mt(t, r) {
  if (!t || !r) throw new Error('Email e password sono obbligatorie');
  const a = await Ke(E, t, r);
  if (a.user) {
    const o = await U(a.user.uid);
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
async function ht(t, r) {
  if (!t || !r) throw new Error('Email e password sono obbligatorie');
  return Ye(E, t, r);
}
async function gt(t) {
  if (!t) throw new Error('Email obbligatoria');
  return Xe(E, t);
}
async function ft() {
  try {
    const t = window.location.href;
    if (!Ue(E, t)) return null;
    let r = null;
    try {
      r = localStorage.getItem('ml-magic-email');
    } catch {}
    r || (r = window.prompt('Per completare l’accesso, inserisci la tua email:') || '');
    const a = await Ve(E, r, t);
    try {
      localStorage.removeItem('ml-magic-email');
    } catch {}
    if ((window.history.replaceState({}, document.title, window.location.pathname), a.user)) {
      const o = await U(a.user.uid);
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
  } catch (t) {
    throw (console.warn('completeMagicLinkIfPresent error:', t), t);
  }
}
async function pt() {
  await He(E);
}
async function U(t) {
  const r = F(te, 'profiles', t),
    a = await be(r);
  return a.exists() ? a.data() : {};
}
async function q(t, r) {
  const a = F(te, 'profiles', t);
  await ve(a, { ...r, _updatedAt: Date.now() }, { merge: !0 });
}
async function xt(t, r) {
  await Ze(t, { displayName: r });
}
async function bt(t = 500) {
  const r = ye(te, 'profiles'),
    a = await ke(Qe(r, et(t))),
    o = [];
  return (
    a.forEach((s) => {
      const h = s.data() || {};
      o.push({ uid: s.id, ...h });
    }),
    o
  );
}
const nr = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        auth: E,
        completeMagicLinkIfPresent: ft,
        getUserProfile: U,
        listAllUserProfiles: bt,
        loginWithEmailPassword: ht,
        loginWithFacebook: ut,
        loginWithGoogle: dt,
        logout: pt,
        onAuth: Ne,
        registerWithEmailPassword: mt,
        saveUserProfile: q,
        sendResetPassword: gt,
        setDisplayName: xt,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  Se = p.createContext(null),
  G = () => {
    const t = p.useContext(Se);
    if (!t) throw new Error('useAuth must be used within an AuthProvider');
    return t;
  };
function wt({ children: t }) {
  const [r, a] = p.useState(null),
    [o, s] = p.useState(null),
    [h, n] = p.useState(!0),
    [l, d] = p.useState(null);
  p.useEffect(
    () =>
      Ne(async (c) => {
        try {
          if ((a(c), c)) {
            const w = await U(c.uid);
            s(w);
          } else s(null);
          d(null);
        } catch (w) {
          (console.error('Auth error:', w), d(w), s(null));
        } finally {
          n(!1);
        }
      }),
    []
  );
  const u = !!r,
    m = o?.firstName && o?.phone,
    g = {
      user: r,
      userProfile: o,
      setUserProfile: s,
      loading: h,
      error: l,
      isAuthenticated: u,
      isProfileComplete: m,
    };
  return e.jsx(Se.Provider, { value: g, children: t });
}
const vt = {
    apiKey: 'AIzaSyDMP7772cyEY1oLzo8f9hMW7Leu4lWc6OU',
    authDomain: 'm-padelweb.firebaseapp.com',
    projectId: 'm-padelweb',
  },
  Ce = he().length ? ge() : fe(vt);
xe(Ce);
const V = pe(Ce, {
  experimentalAutoDetectLongPolling: !0,
  experimentalForceLongPolling: !1,
  useFetchStreams: !1,
});
async function re(t) {
  const r = await be(F(V, 'leagues', t));
  return r.exists() ? r.data() : null;
}
async function yt() {
  try {
    const t = await ke(ye(V, 'leagues')),
      r = [];
    return (
      t.forEach((a) => {
        const o = a.data();
        r.push({
          id: a.id,
          name: o.name || a.id,
          players: o.players?.length || 0,
          matches: o.matches?.length || 0,
          lastUpdated: o._updatedAt ? new Date(o._updatedAt).toLocaleString() : 'N/A',
          courts: o.courts?.length || 0,
        });
      }),
      r.sort((a, o) => (o._updatedAt || 0) - (a._updatedAt || 0))
    );
  } catch (t) {
    return (console.error('Errore nel recupero della lista backup:', t), []);
  }
}
async function Ie(t, r) {
  if (r._restored) console.log('🔥 Ripristino manuale autorizzato - bypassando protezioni');
  else if (r.players && r.players.length < 5) {
    (console.warn(
      '🚨 PROTEZIONE ATTIVA: Rifiutato salvataggio di dati con pochi giocatori (possibili seed data)'
    ),
      console.warn('Dati non salvati:', {
        players: r.players?.length,
        matches: r.matches?.length,
      }));
    return;
  }
  try {
    const a = await re(t);
    if (a && a.players && a.players.length > (r.players?.length || 0)) {
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
  (await ve(F(V, 'leagues', t), r, { merge: !0 }),
    console.log('✅ Dati salvati nel cloud:', {
      players: r.players?.length,
      matches: r.matches?.length,
    }));
}
function Pe(t, r) {
  return rt(F(V, 'leagues', t), (a) => {
    a.exists() && r(a.data());
  });
}
const ir = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        db: V,
        listLeagues: yt,
        loadLeague: re,
        saveLeague: Ie,
        subscribeLeague: Pe,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  O = (t) => Math.round(Number(t || 0)),
  Y = (t) => Number(t || 0).toFixed(2);
function kt(t) {
  return (t || [])
    .filter((r) => String(r?.a ?? '') !== '' || String(r?.b ?? '') !== '')
    .map((r) => `${Number(r.a || 0)}-${Number(r.b || 0)}`)
    .join(', ');
}
function X(t) {
  let r = 0,
    a = 0,
    o = 0,
    s = 0;
  for (const n of t || []) {
    const l = Number(n?.a || 0),
      d = Number(n?.b || 0);
    (String(l) === '' && String(d) === '') || ((o += l), (s += d), l > d ? r++ : d > l && a++);
  }
  let h = null;
  return (
    r > a ? (h = 'A') : a > r && (h = 'B'),
    { setsA: r, setsB: a, gamesA: o, gamesB: s, winner: h }
  );
}
function jt(t) {
  return t <= -2e3
    ? 0.4
    : t <= -1500
      ? 0.6
      : t <= -900
        ? 0.75
        : t <= -300
          ? 0.9
          : t < 300 && t > -300
            ? 1
            : t <= 900
              ? 1.1
              : t <= 1500
                ? 1.25
                : t <= 2e3
                  ? 1.4
                  : 1.6;
}
function Nt(t) {
  return t <= -2e3
    ? 'gap ≤ −2000 ⇒ 0.40'
    : t <= -1500
      ? '−2000 < gap ≤ −1500 ⇒ 0.60'
      : t <= -900
        ? '−1500 < gap ≤ −900 ⇒ 0.75'
        : t <= -300
          ? '−900 < gap ≤ −300 ⇒ 0.90'
          : t < 300 && t > -300
            ? '−300 < gap < +300 ⇒ 1.00'
            : t <= 900
              ? '+300 ≤ gap ≤ +900 ⇒ 1.10'
              : t <= 1500
                ? '+900 < gap ≤ +1500 ⇒ 1.25'
                : t <= 2e3
                  ? '+1500 < gap ≤ +2000 ⇒ 1.40'
                  : 'gap ≥ +2000 ⇒ 1.60';
}
function Z({
  ratingA1: t,
  ratingA2: r,
  ratingB1: a,
  ratingB2: o,
  gamesA: s,
  gamesB: h,
  winner: n,
  sets: l,
}) {
  const d = Number(t || 0),
    u = Number(r || 0),
    m = Number(a || 0),
    g = Number(o || 0),
    i = d + u,
    c = m + g,
    w = n === 'A' ? i : c,
    N = n === 'A' ? c : i,
    f = (i + c) / 100,
    x = N - w,
    A = jt(x),
    L = n === 'A' ? s - h : h - s,
    v = (f + L) * A,
    y = Math.round(v),
    S = n === 'A' ? y : -y,
    k = n === 'B' ? y : -y,
    b = `Risultato set: ${kt(l)}`,
    P =
      `Team A=${O(i)}, Team B=${O(c)}, Gap=${O(x)}
Fascia: ${Nt(x)}

Base = (${O(i)} + ${O(c)})/100 = ${Y(f)}
DG (Differenza Game) = ${L}

Punti = (Base + DG) × factor = (${Y(f)} + ${L}) × ${A.toFixed(2)} = ${Y(v)}
Punti (arrotondato) = ${y}
` +
      (n === 'A' ? `Team A +${y}, Team B -${y}` : `Team B +${y}, Team A -${y}`) +
      `
${b}`;
  return {
    deltaA: S,
    deltaB: k,
    pts: y,
    base: f,
    factor: A,
    gap: x,
    sumA: i,
    sumB: c,
    gd: L,
    formula: P,
  };
}
const lr = () => Math.random().toString(36).slice(2, 10),
  I = 1e3,
  D = 'paris-league-v1';
function At(t, r) {
  const a = new Map(
      t.map((n) => {
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
    o = new Map(t.map((n) => [n.id, []])),
    s = [],
    h = [...(r || [])].sort((n, l) => new Date(n.date) - new Date(l.date));
  for (const n of h) {
    const l = a.get(n.teamA[0]),
      d = a.get(n.teamA[1]),
      u = a.get(n.teamB[0]),
      m = a.get(n.teamB[1]),
      g = X(n.sets),
      i = Z({
        ratingA1: l?.rating ?? I,
        ratingA2: d?.rating ?? I,
        ratingB1: u?.rating ?? I,
        ratingB2: m?.rating ?? I,
        gamesA: g.gamesA,
        gamesB: g.gamesB,
        winner: g.winner,
        sets: n.sets,
      }),
      c = { ...n, ...g, ...i };
    s.push(c);
    const w = (N, f) => {
      if (!N) return;
      const x = o.get(N) || [];
      (x.push(f), o.set(N, x));
    };
    (w(l?.id, i.deltaA),
      w(d?.id, i.deltaA),
      w(u?.id, i.deltaB),
      w(m?.id, i.deltaB),
      l && (l.lastDelta = i.deltaA),
      d && (d.lastDelta = i.deltaA),
      u && (u.lastDelta = i.deltaB),
      m && (m.lastDelta = i.deltaB),
      g.winner === 'A'
        ? (l && (l.rating += i.deltaA),
          d && (d.rating += i.deltaA),
          u && (u.rating += i.deltaB),
          m && (m.rating += i.deltaB),
          l && l.wins++,
          d && d.wins++,
          u && u.losses++,
          m && m.losses++)
        : g.winner === 'B' &&
          (l && (l.rating += i.deltaA),
          d && (d.rating += i.deltaA),
          u && (u.rating += i.deltaB),
          m && (m.rating += i.deltaB),
          u && u.wins++,
          m && m.wins++,
          l && l.losses++,
          d && d.losses++));
  }
  for (const n of a.values()) {
    const d = (o.get(n.id) || []).slice(-5);
    let u = 0,
      m = 0,
      g = 0;
    for (const i of d) ((g += i), i >= 0 ? (u += i) : (m += -i));
    ((n.trend5Total = g), (n.trend5Pos = u), (n.trend5Neg = m));
  }
  return { players: Array.from(a.values()), matches: s };
}
function cr(t, r, a) {
  const o = new Map(t.map((c) => [c.id, c.name])),
    h = [...(r || [])].sort((c, w) => new Date(c.date) - new Date(w.date)).slice(-15),
    n = new Map(t.map((c) => [c.id, Number(c.rating ?? I)])),
    l = new Map(n),
    d = [...h].reverse();
  for (const c of d) {
    const w = X(c.sets),
      N = Z({
        ratingA1: l.get(c.teamA[0]) ?? I,
        ratingA2: l.get(c.teamA[1]) ?? I,
        ratingB1: l.get(c.teamB[0]) ?? I,
        ratingB2: l.get(c.teamB[1]) ?? I,
        gamesA: w.gamesA,
        gamesB: w.gamesB,
        winner: w.winner,
        sets: c.sets,
      }),
      f = (x, A) => l.set(x, (l.get(x) ?? I) - A);
    (f(c.teamA[0], N.deltaA),
      f(c.teamA[1], N.deltaA),
      f(c.teamB[0], N.deltaB),
      f(c.teamB[1], N.deltaB));
  }
  const u = new Map(l),
    m = [],
    g = { label: 'Inizio periodo' };
  for (const c of a) g[o.get(c) || c] = Math.round(u.get(c) ?? I);
  m.push(g);
  for (const c of h) {
    const w = X(c.sets),
      N = Z({
        ratingA1: u.get(c.teamA[0]) ?? I,
        ratingA2: u.get(c.teamA[1]) ?? I,
        ratingB1: u.get(c.teamB[0]) ?? I,
        ratingB2: u.get(c.teamB[1]) ?? I,
        gamesA: w.gamesA,
        gamesB: w.gamesB,
        winner: w.winner,
        sets: c.sets,
      }),
      f = (A, L) => u.set(A, (u.get(A) ?? I) + L);
    (f(c.teamA[0], N.deltaA),
      f(c.teamA[1], N.deltaA),
      f(c.teamB[0], N.deltaB),
      f(c.teamB[1], N.deltaB));
    const x = {
      label: new Date(c.date).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    for (const A of a) x[o.get(A) || A] = Math.round(u.get(A) ?? I);
    m.push(x);
  }
  const i = { label: 'Attuale' };
  for (const c of a) i[o.get(c) || c] = Math.round(n.get(c) ?? I);
  return (m.push(i), m);
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
const Le = p.createContext(null),
  St = () => {
    const t = p.useContext(Le);
    if (!t) throw new Error('useLeague must be used within a LeagueProvider');
    return t;
  };
function Ct({ children: t }) {
  const { user: r, loading: a } = G(),
    [o, s] = p.useState(null),
    [h, n] = p.useState(!0),
    [l, d] = p.useState(null),
    [u, m] = p.useState(!1),
    [g, i] = p.useState(localStorage.getItem(D + '-leagueId') || 'lega-andrea-2025'),
    c = p.useRef(null);
  if (!c.current) {
    const v = (() => {
      try {
        return localStorage.getItem('ml-client-id');
      } catch {
        return null;
      }
    })();
    if (v) c.current = v;
    else {
      const y = Math.random().toString(36).slice(2, 10);
      c.current = y;
      try {
        localStorage.setItem('ml-client-id', y);
      } catch {}
    }
  }
  const w = p.useRef(0),
    N = p.useRef(null);
  p.useEffect(() => {
    localStorage.setItem(D + '-leagueId', g);
  }, [g]);
  const f = (v) => {
    s((y) => {
      const S = typeof v == 'function' ? v(y) : v,
        k = Date.now(),
        b = (y?._rev || 0) + 1;
      return ((w.current = k + 2e3), { ...S, _updatedAt: k, _rev: b, _lastWriter: c.current });
    });
  };
  (p.useEffect(() => {
    a ||
      (async () => {
        try {
          if ((n(!0), d(null), r)) {
            const S = await re(g);
            if (S && typeof S == 'object' && Array.isArray(S.players) && Array.isArray(S.matches)) {
              const b = { ...S };
              (Array.isArray(b.courts) || (b.courts = []),
                Array.isArray(b.bookings) || (b.bookings = []),
                b.bookingConfig || (b.bookingConfig = z()),
                b.bookingConfig.pricing || (b.bookingConfig.pricing = z().pricing),
                b.bookingConfig.addons || (b.bookingConfig.addons = z().addons),
                s(b));
              const P = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
              N.current = P.reduce((B, R) => ((B[R] = b[R]), B), {});
              try {
                localStorage.setItem(D, JSON.stringify(b));
              } catch {}
              return;
            }
          }
          try {
            const S = localStorage.getItem(D);
            if (S) {
              const k = JSON.parse(S);
              if (k && Array.isArray(k.players) && Array.isArray(k.matches)) {
                s(k);
                const b = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
                N.current = b.reduce((P, B) => ((P[B] = k[B] || []), P), {});
                return;
              }
            }
          } catch {}
          const v = me();
          s(v);
          const y = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
          ((N.current = y.reduce((S, k) => ((S[k] = v[k] || []), S), {})),
            console.log('� App inizializzata con stato vuoto - aggiungi i tuoi dati!'));
          try {
            localStorage.setItem(D, JSON.stringify(v));
          } catch {}
        } catch (v) {
          (console.error('League load error:', v), d(v));
          const y = me();
          s(y);
        } finally {
          n(!1);
        }
      })();
  }, [g, r, a]),
    p.useEffect(() => {
      if (!g || !r || a) return;
      let v = null;
      try {
        v = Pe(g, (y) => {
          if (
            !(y && typeof y == 'object' && Array.isArray(y.players) && Array.isArray(y.matches)) ||
            Date.now() < w.current
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
            s((b) => {
              const P = b?._rev ?? 0,
                B = k?._rev ?? 0,
                R = b?._updatedAt ?? 0,
                J = k?._updatedAt ?? 0,
                se = B > P || (B === P && J > R);
              if (se) {
                const ze = [
                  'players',
                  'matches',
                  'courts',
                  'bookings',
                  'bookingConfig',
                  'lessonConfig',
                ];
                N.current = ze.reduce((oe, ne) => ((oe[ne] = k[ne]), oe), {});
              }
              return se ? k : b;
            }),
            m(!1));
        });
      } catch (y) {
        console.error('Subscribe error:', y);
      }
      return () => v && v();
    }, [g, r, a]),
    p.useEffect(() => {
      if (!o || u || !r) return;
      const v = ['players', 'matches', 'courts', 'bookings', 'bookingConfig', 'lessonConfig'],
        y = v.reduce((b, P) => ((b[P] = o[P]), b), {}),
        S = N.current;
      if (!S || v.some((b) => JSON.stringify(y[b]) !== JSON.stringify(S[b])))
        try {
          localStorage.setItem(D, JSON.stringify(o));
          const P = {
              ...Object.fromEntries(Object.entries(o).filter(([R, J]) => J !== void 0)),
              _updatedAt: Date.now(),
              _lastWriter: c.current,
              _rev: (o._rev || 0) + 1,
            },
            B = setTimeout(async () => {
              try {
                (await Ie(g, P), (N.current = y));
              } catch (R) {
                console.error('Cloud save error:', R);
              }
            }, 800);
          return () => clearTimeout(B);
        } catch (b) {
          console.error('LocalStorage save error:', b);
        }
    }, [o, g, u, r]));
  const x = C.useMemo(
      () => (o ? At(o.players || [], o.matches || []) : { players: [], matches: [] }),
      [o]
    ),
    A = C.useMemo(() => Object.fromEntries((x.players || []).map((v) => [v.id, v])), [x]),
    L = {
      state: o,
      setState: f,
      derived: x,
      playersById: A,
      leagueId: g,
      setLeagueId: i,
      loading: h,
      error: l,
      updatingFromCloud: u,
    };
  return e.jsx(Le.Provider, { value: L, children: t });
}
const _e = p.createContext(null),
  Ee = () => {
    const t = p.useContext(_e);
    if (!t) throw new Error('useUI must be used within a UIProvider');
    return t;
  };
function It({ children: t }) {
  const [r, a] = p.useState(() => {
      try {
        const x = localStorage.getItem('play-sport-pro-theme');
        return x ? x === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {
        return !1;
      }
    }),
    [o, s] = p.useState(() => {
      try {
        const x = sessionStorage.getItem('ml-extra-unlocked') === '1',
          A = sessionStorage.getItem('ml-club-mode') === '1';
        return x && A;
      } catch {
        return !1;
      }
    }),
    [h, n] = p.useState([]),
    [l, d] = p.useState(!1),
    [u, m] = p.useState(null);
  (p.useEffect(() => {
    try {
      r
        ? (document.documentElement.classList.add('dark'),
          localStorage.setItem('play-sport-pro-theme', 'dark'))
        : (document.documentElement.classList.remove('dark'),
          localStorage.setItem('play-sport-pro-theme', 'light'));
    } catch {}
  }, [r]),
    C.useEffect(() => {
      try {
        o ? sessionStorage.setItem('ml-club-mode', '1') : sessionStorage.removeItem('ml-club-mode');
      } catch {}
    }, [o]));
  const g = () => {
      a((x) => !x);
    },
    i = (x) => {
      const A = Math.random().toString(36).slice(2),
        L = { id: A, ...x };
      return (
        n((v) => [...v, L]),
        setTimeout(() => {
          c(A);
        }, 5e3),
        A
      );
    },
    c = (x) => {
      n((A) => A.filter((L) => L.id !== x));
    },
    f = {
      darkMode: r,
      setDarkMode: a,
      toggleTheme: g,
      clubMode: o,
      setClubMode: s,
      notifications: h,
      addNotification: i,
      removeNotification: c,
      loading: l,
      setLoading: d,
      modal: u,
      showModal: (x) => {
        m(x);
      },
      hideModal: () => {
        m(null);
      },
    };
  return e.jsx(_e.Provider, { value: f, children: t });
}
class Pt extends C.Component {
  constructor(r) {
    (super(r), (this.state = { hasError: !1, error: null, errorInfo: null }));
  }
  static getDerivedStateFromError(r) {
    return { hasError: !0 };
  }
  componentDidCatch(r, a) {
    this.setState({ error: r, errorInfo: a });
  }
  render() {
    if (this.state.hasError) {
      const { fallback: r } = this.props;
      return r
        ? e.jsx(r, {
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
function Me({ size: t = 'md', className: r = '' }) {
  const a = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12', xl: 'h-16 w-16' };
  return e.jsx('div', {
    className: `animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${a[t]} ${r}`,
  });
}
function ae({ message: t = 'Caricamento...' }) {
  return e.jsx('div', {
    className: 'min-h-screen bg-gray-50 flex items-center justify-center',
    children: e.jsxs('div', {
      className: 'text-center',
      children: [
        e.jsx(Me, { size: 'xl', className: 'mx-auto mb-4' }),
        e.jsx('p', { className: 'text-gray-600 text-lg', children: t }),
      ],
    }),
  });
}
function Lt({ message: t = 'Caricamento...', visible: r = !0 }) {
  return r
    ? e.jsx('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center',
        style: { zIndex: 1e5 },
        children: e.jsxs('div', {
          className: 'bg-white rounded-lg p-6 flex items-center space-x-3',
          children: [
            e.jsx(Me, { size: 'md' }),
            e.jsx('span', { className: 'text-gray-700', children: t }),
          ],
        }),
      })
    : null;
}
function Q(t, r, a) {
  return t !== r;
}
function _t(t, r) {
  const a = t.pathname;
  if (a === '/login') {
    const o = t.state?.from?.pathname;
    return o && o !== '/login' ? o : '/dashboard';
  }
  return a === '/' ? '/dashboard' : null;
}
function Et({ children: t, requireProfile: r = !0 }) {
  const { user: a, userProfile: o, isAuthenticated: s, isProfileComplete: h, loading: n } = G(),
    l = ee();
  if (n) return e.jsx(ae, { message: 'Verifica autenticazione...' });
  if (!s) {
    const d = '/login';
    if (Q(l.pathname, d)) return e.jsx($, { to: d, state: { from: l }, replace: !0 });
  }
  if (s && r && o !== null && !h) {
    const d = '/profile';
    if (Q(l.pathname, d)) return e.jsx($, { to: d, state: { from: l }, replace: !0 });
  }
  return t;
}
function Mt({ children: t }) {
  const { isAuthenticated: r, loading: a } = G(),
    o = ee();
  if (a) return e.jsx(ae, { message: 'Verifica autenticazione...' });
  if (r) {
    const s = _t(o);
    if (s && Q(o.pathname, s)) return e.jsx($, { to: s, replace: !0 });
  }
  return t;
}
const Bt = '/play-sport-pro_horizontal.svg',
  j = {
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
function Rt() {
  return {
    name: 'universal',
    ...{
      borderSm: j.borderRadius.sm,
      borderMd: j.borderRadius.md,
      borderLg: j.borderRadius.lg,
      borderFull: j.borderRadius.full,
      spacingXs: j.spacing.xs,
      spacingSm: j.spacing.sm,
      spacingMd: j.spacing.md,
      spacingLg: j.spacing.lg,
      spacingXl: j.spacing.xl,
      shadowCard: j.shadows.card + ' dark:shadow-dark-sm',
      shadowSm: j.shadows.sm + ' dark:shadow-dark-sm',
      shadowMd: j.shadows.md + ' dark:shadow-dark-md',
      shadowLg: j.shadows.lg + ' dark:shadow-dark-lg',
      transitionFast: j.transitions.fast,
      transitionNormal: j.transitions.normal,
      transitionSlow: j.transitions.slow,
      focusRing:
        'focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
      primaryRing: 'ring-emerald-400 dark:ring-emerald-500',
    },
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
    input: `${j.borderRadius.md} px-3 py-2 bg-white dark:bg-gray-700 border border-black/10 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-gray-400 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 dark:focus:ring-emerald-500 outline-none ${j.transitions.normal}`,
    btnPrimary: `inline-flex items-center justify-center ${j.borderRadius.md} px-4 py-2 font-medium text-black bg-gradient-to-r from-emerald-400 to-lime-400 hover:brightness-110 active:brightness-95 ${j.transitions.normal} ${j.shadows.sm}`,
    btnGhost: `inline-flex items-center justify-center ${j.borderRadius.md} px-4 py-2 font-medium ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-900 dark:text-white ${j.transitions.normal}`,
    btnGhostSm: `inline-flex items-center justify-center ${j.borderRadius.sm} px-2 py-1 text-xs font-medium ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-neutral-900 dark:text-white ${j.transitions.normal}`,
    accentGood: 'text-emerald-600 dark:text-emerald-400',
    accentBad: 'text-rose-600 dark:text-rose-400',
    accentWarning: 'text-amber-600 dark:text-amber-400',
    accentInfo: 'text-blue-600 dark:text-blue-400',
    chip: 'bg-emerald-500 text-black',
    card: `${j.borderRadius.lg} bg-white dark:bg-gray-800 ring-1 ring-black/10 dark:ring-white/10 ${j.spacing.md} ${j.shadows.card} dark:shadow-dark-sm`,
    cardHover: `${j.borderRadius.lg} bg-white dark:bg-gray-800 ring-1 ring-black/10 dark:ring-white/10 ${j.spacing.md} ${j.shadows.md} dark:shadow-dark-md hover:shadow-lg dark:hover:shadow-dark-lg ${j.transitions.normal}`,
  };
}
function zt() {
  const { notifications: t, removeNotification: r } = Ee();
  return t.length === 0
    ? null
    : e.jsx('div', {
        className: 'fixed top-4 right-4 space-y-2',
        style: { zIndex: 100001 },
        children: t.map((a) => e.jsx(Dt, { notification: a, onRemove: r }, a.id)),
      });
}
function Dt({ notification: t, onRemove: r }) {
  const { id: a, type: o = 'info', title: s, message: h, autoClose: n = !0 } = t,
    l = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white',
    },
    d = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  return (
    C.useEffect(() => {
      if (n) {
        const u = setTimeout(() => {
          r(a);
        }, 5e3);
        return () => clearTimeout(u);
      }
    }, [a, n, r]),
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
              h && e.jsx('div', { className: 'text-sm opacity-90', children: h }),
            ],
          }),
          e.jsx('button', {
            onClick: () => r(a),
            className: 'ml-2 text-lg leading-none opacity-70 hover:opacity-100',
            'aria-label': 'Chiudi notifica',
            children: '×',
          }),
        ],
      }),
    })
  );
}
function Tt({ active: t, setActive: r, clubMode: a, T: o, user: s, navigation: h }) {
  const n = h || [
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
          onClick: () => r(l.id),
          className: `px-3 py-1.5 rounded-xl text-sm transition ring-1 ${t === l.id ? o.btnPrimary : o.ghostRing}`,
          'aria-current': t === l.id ? 'page' : void 0,
          children: l.label,
        },
        l.id
      )
    ),
  });
}
function Ot({ active: t, setActive: r, navigation: a = [], clubMode: o = !1 }) {
  const [s, h] = p.useState(!1),
    n = (i) => {
      (r(i.id), s && h(!1));
    },
    l = (i) => {
      (i.stopPropagation(), i.preventDefault(), h(!s));
    },
    d = (i, c) => {
      (c.stopPropagation(), c.preventDefault(), r(i.id), h(!1));
    },
    u = [
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
    m = [
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
    g = o
      ? [
          ...u.slice(0, 3),
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
      : u;
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
                    onClick: l,
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
                children: m.map((i) =>
                  e.jsxs(
                    'div',
                    {
                      className: `flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${t === i.id ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 border border-blue-200/30 dark:border-blue-600/30' : 'bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 border border-white/30 dark:border-gray-600/30 shadow-lg hover:shadow-xl'}`,
                      onClick: (c) => d(i, c),
                      style: {
                        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                      },
                      children: [
                        e.jsx('div', {
                          className: `w-8 h-8 rounded-lg flex items-center justify-center ${t === i.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md'}`,
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
          g.map((i, c) =>
            e.jsxs(
              'div',
              {
                className: `bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all duration-300 ${t === i.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`,
                onClick: () => n(i),
                onTouchEnd: () => n(i),
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
                    className: `relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${t === i.id ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-600/30 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 transform scale-110' : 'hover:bg-white/60 dark:hover:bg-gray-700/60 hover:backdrop-blur-sm hover:border hover:border-white/20 dark:hover:border-gray-600/20 hover:shadow-lg hover:transform hover:scale-105'}`,
                    children: [
                      t === i.id &&
                        e.jsx('div', {
                          className:
                            'absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg',
                        }),
                      i.icon,
                    ],
                  }),
                  e.jsx('span', {
                    className: `font-medium text-xs leading-tight ${t === i.id ? 'font-semibold' : ''}`,
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
              onClick: l,
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
function Be() {
  const [t, r] = p.useState(null),
    [a, o] = p.useState(!1),
    [s, h] = p.useState(!1),
    [n, l] = p.useState({});
  p.useEffect(() => {
    ((() => {
      const f = navigator.userAgent,
        x = /iPad|iPhone|iPod/.test(f),
        A = /Android/.test(f),
        L = x || A || /Mobile|Tablet/.test(f),
        v = /Chrome/.test(f) && !/Edge|Edg/.test(f),
        y = /Edge|Edg/.test(f),
        S = /Firefox/.test(f),
        k = /Safari/.test(f) && !/Chrome|CriOS|FxiOS/.test(f),
        b = /OPR|Opera/.test(f),
        P = /SamsungBrowser/.test(f);
      l({
        isIOS: x,
        isAndroid: A,
        isMobile: L,
        isChrome: v,
        isEdge: y,
        isFirefox: S,
        isSafari: k,
        isOpera: b,
        isSamsung: P,
        supportsInstallPrompt: v || y || P || b,
      });
    })(),
      (() => {
        const f = window.matchMedia('(display-mode: standalone)').matches,
          x = window.navigator.standalone === !0,
          A = window.matchMedia('(display-mode: fullscreen)').matches,
          L = window.matchMedia('(display-mode: minimal-ui)').matches,
          v = f || x || A || L;
        (h(v), v && console.log('✅ PWA is already installed'));
      })());
    const w = (f) => {
        (console.log('🚀 PWA installation prompt ready'), f.preventDefault(), r(f), o(!0));
      },
      N = () => {
        (console.log('✅ PWA installed successfully'),
          h(!0),
          o(!1),
          r(null),
          localStorage.setItem('pwa_installed', 'true'));
      };
    return (
      n.supportsInstallPrompt &&
        (window.addEventListener('beforeinstallprompt', w),
        window.addEventListener('appinstalled', N)),
      () => {
        (window.removeEventListener('beforeinstallprompt', w),
          window.removeEventListener('appinstalled', N));
      }
    );
  }, [n.supportsInstallPrompt]);
  const d = async () => {
      if (!t) return (console.warn('⚠️ No deferred prompt available'), !1);
      try {
        t.prompt();
        const { outcome: i } = await t.userChoice;
        return i === 'accepted'
          ? (console.log('✅ User accepted PWA installation'), o(!1), r(null), !0)
          : (console.log('❌ User declined PWA installation'), !1);
      } catch (i) {
        return (console.error('❌ PWA installation failed:', i), !1);
      }
    },
    u = () => {
      const { isIOS: i, isAndroid: c, isSafari: w, isFirefox: N, isChrome: f, isEdge: x } = n;
      return i && w
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
        : N
          ? {
              show: !0,
              title: 'Installa con Firefox',
              icon: '🦊',
              instructions: c
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
          : c && (f || x)
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
            : !n.isMobile && (f || x)
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
    isInstallable: s ? !1 : !!((n.isIOS && n.isSafari) || (a && t) || n.isFirefox),
    isInstalled: s,
    installApp: d,
    browserInfo: n,
    isPWASupported: m(),
    installInstructions: u(),
  };
}
function Wt({ className: t = '' }) {
  const {
      isInstallable: r,
      isInstalled: a,
      installApp: o,
      browserInfo: s,
      isPWASupported: h,
      installInstructions: n,
    } = Be(),
    [l, d] = p.useState(!1);
  if (a)
    return e.jsxs('div', {
      className: `flex items-center gap-2 text-green-600 text-sm ${t}`,
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
      className: `text-gray-500 text-sm ${t}`,
      children: 'Browser non supportato per PWA',
    });
  if (!r) return null;
  const u = async () => {
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
        onClick: u,
        className: `flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${t}`,
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
                  children: n.instructions.map((g, i) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex items-start gap-4',
                        children: [
                          e.jsx('div', {
                            className:
                              'w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                            children: i + 1,
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
                      i
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
function $t() {
  const {
      isInstallable: t,
      isInstalled: r,
      installApp: a,
      browserInfo: o,
      installInstructions: s,
    } = Be(),
    [h, n] = p.useState(!1),
    [l, d] = p.useState(!1);
  if (r || !t) return null;
  const u = async () => {
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
                    children: s.instructions.map((g, i) =>
                      e.jsxs(
                        'div',
                        {
                          className: 'flex items-start gap-3',
                          children: [
                            e.jsx('div', {
                              className:
                                'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                              children: i + 1,
                            }),
                            e.jsx('p', { className: 'text-sm text-gray-700', children: g }),
                          ],
                        },
                        i
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
function Ft() {
  const { user: t } = G(),
    { clubMode: r, loading: a } = Ee(),
    { updatingFromCloud: o } = St(),
    s = ee(),
    h = Oe(),
    n = C.useMemo(() => Rt(), []),
    l = [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', public: !0 },
      { id: 'classifica', label: 'Classifica', path: '/classifica', public: !0 },
      { id: 'stats', label: 'Statistiche', path: '/stats', public: !0 },
      { id: 'prenota-campo', label: 'Prenota Campo', path: '/booking', public: !0 },
      { id: 'prenota-lezione', label: 'Prenota Lezione', path: '/lessons', public: !0 },
      ...(r
        ? [
            { id: 'giocatori', label: 'Giocatori', path: '/players', club: !0 },
            { id: 'crea', label: 'Crea Partita', path: '/matches/create', club: !0 },
            { id: 'prenota', label: 'Gestione Campi', path: '/admin/bookings', club: !0 },
            { id: 'tornei', label: 'Crea Tornei', path: '/tournaments', club: !0 },
          ]
        : []),
      {
        id: t ? 'profile' : 'auth',
        label: t ? 'Profilo' : 'Accedi',
        path: t ? '/profile' : '/login',
      },
      { id: 'extra', label: 'Extra', path: '/extra', public: !0 },
    ],
    d = s.pathname,
    u = l.find((i) => i.path === d)?.id || '',
    m = (i) => {
      const c = l.find((w) => w.id === i);
      c && h(c.path);
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
                e.jsx('img', {
                  src: Bt,
                  alt: 'Sporting Cat',
                  className: 'h-8 w-auto rounded-md shadow shrink-0',
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
                  children: e.jsx(Wt, { className: 'text-xs px-3 py-1.5' }),
                }),
                e.jsx(Tt, { active: u, setActive: m, clubMode: r, T: n, user: t, navigation: l }),
              ],
            }),
          ],
        }),
      }),
      e.jsx('main', {
        className:
          'max-w-[1800px] mx-auto px-3 sm:px-4 py-5 sm:py-6 safe-area-left safe-area-right pb-20 md:pb-5',
        children: e.jsx(We, {}),
      }),
      e.jsx(Ot, { active: u, setActive: m, navigation: l, clubMode: r }),
      e.jsx($t, {}),
      e.jsx(zt, {}),
      e.jsx(Lt, { visible: a || o, message: o ? 'Sincronizzazione...' : 'Caricamento...' }),
    ],
  });
}
const Ut = C.lazy(() =>
    M(() => import('./LoginPage-mfgp9duf-DfUbAcfN.js'), __vite__mapDeps([0, 1, 2, 3, 4]))
  ),
  Vt = C.lazy(() =>
    M(() => import('./DashboardPage-mfgp9duf-6rSEnbNG.js'), __vite__mapDeps([5, 1, 2, 4]))
  ),
  Ht = C.lazy(() =>
    M(() => import('./ClassificaPage-mfgp9duf-Do2rp-41.js'), __vite__mapDeps([6, 1, 2, 3, 7, 8, 4]))
  ),
  qt = C.lazy(() =>
    M(
      () => import('./StatsPage-mfgp9duf-CfPvBF6C.js'),
      __vite__mapDeps([9, 1, 2, 3, 8, 7, 10, 11, 4])
    )
  ),
  Gt = C.lazy(() =>
    M(
      () => import('./BookingPage-mfgp9duf-qpQos1kS.js'),
      __vite__mapDeps([12, 1, 2, 13, 14, 15, 16, 17, 4])
    )
  ),
  Jt = C.lazy(() =>
    M(
      () => import('./LessonBookingPage-mfgp9duf-TWhU6dkt.js'),
      __vite__mapDeps([18, 1, 2, 3, 13, 14, 19, 16, 17, 4, 10])
    )
  ),
  Kt = C.lazy(() =>
    M(
      () => import('./PlayersPage-mfgp9duf-DRKKaX5a.js'),
      __vite__mapDeps([20, 1, 2, 3, 10, 11, 19, 17, 4])
    )
  ),
  Yt = C.lazy(() =>
    M(() => import('./MatchesPage-mfgp9duf-BMdSA3nk.js'), __vite__mapDeps([21, 1, 2, 3, 11, 4]))
  ),
  Xt = C.lazy(() =>
    M(() => import('./TournamentsPage-mfgp9duf-BBFuB1FE.js'), __vite__mapDeps([22, 1, 2, 3, 4]))
  ),
  Zt = C.lazy(() =>
    M(() => import('./ProfilePage-mfgp9duf-CIxICKaN.js'), __vite__mapDeps([23, 1, 2, 3, 4]))
  ),
  Qt = C.lazy(() =>
    M(() => import('./ExtraPage-mfgp9duf-CLpAWw3T.js'), __vite__mapDeps([24, 1, 2, 3, 25, 4]))
  ),
  er = C.lazy(() =>
    M(
      () => import('./AdminBookingsPage-mfgp9duf-ij3JIMmq.js'),
      __vite__mapDeps([26, 1, 2, 3, 10, 25, 15, 16, 17, 4, 19])
    )
  ),
  tr = C.lazy(() =>
    M(() => import('./DarkModeTestPage-mfgp9duf-BBj6wvSP.js'), __vite__mapDeps([27, 1, 2, 14, 4]))
  );
function rr() {
  return e.jsx(Pt, {
    children: e.jsx($e, {
      children: e.jsx(wt, {
        children: e.jsx(Ct, {
          children: e.jsx(It, {
            children: e.jsx(p.Suspense, {
              fallback: e.jsx(ae, {}),
              children: e.jsxs(Fe, {
                children: [
                  e.jsx(_, { path: '/login', element: e.jsx(Mt, { children: e.jsx(Ut, {}) }) }),
                  e.jsxs(_, {
                    path: '/',
                    element: e.jsx(Et, { children: e.jsx(Ft, {}) }),
                    children: [
                      e.jsx(_, { index: !0, element: e.jsx($, { to: 'dashboard', replace: !0 }) }),
                      e.jsx(_, { path: 'dashboard', element: e.jsx(Vt, {}) }),
                      e.jsx(_, { path: 'classifica', element: e.jsx(Ht, {}) }),
                      e.jsx(_, { path: 'stats', element: e.jsx(qt, {}) }),
                      e.jsx(_, { path: 'booking', element: e.jsx(Gt, {}) }),
                      e.jsx(_, { path: 'lessons', element: e.jsx(Jt, {}) }),
                      e.jsx(_, { path: 'extra', element: e.jsx(Qt, {}) }),
                      e.jsx(_, { path: 'players', element: e.jsx(Kt, {}) }),
                      e.jsx(_, { path: 'matches/create', element: e.jsx(Yt, {}) }),
                      e.jsx(_, { path: 'tournaments', element: e.jsx(Xt, {}) }),
                      e.jsx(_, { path: 'admin/bookings', element: e.jsx(er, {}) }),
                      e.jsx(_, { path: 'profile', element: e.jsx(Zt, {}) }),
                      e.jsx(_, { path: 'test/dark-mode', element: e.jsx(tr, {}) }),
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
'serviceWorker' in navigator &&
  (window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((t) => {
        (console.log('✅ SW registered: ', t),
          t.addEventListener('updatefound', () => {
            const r = t.installing;
            r.addEventListener('statechange', () => {
              r.state === 'installed' &&
                navigator.serviceWorker.controller &&
                console.log('🔄 New content available! Please refresh.');
            });
          }));
      })
      .catch((t) => {
        console.log('❌ SW registration failed: ', t);
      });
  }),
  navigator.serviceWorker.addEventListener('message', (t) => {
    t.data && t.data.type === 'RELOAD_PAGE' && window.location.reload();
  }));
const Re = document.getElementById('root');
if (!Re) throw new Error('Elemento #root non trovato in index.html');
nt.createRoot(Re).render(e.jsx(C.StrictMode, { children: e.jsx(rr, {}) }));
export {
  I as D,
  Bt as L,
  M as _,
  dt as a,
  ut as b,
  ft as c,
  xt as d,
  Be as e,
  St as f,
  cr as g,
  X as h,
  lr as i,
  e as j,
  Ee as k,
  pt as l,
  bt as m,
  Nt as n,
  E as o,
  U as p,
  z as q,
  jt as r,
  q as s,
  Rt as t,
  G as u,
  te as v,
  nr as w,
  ir as x,
};
