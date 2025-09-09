const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/LoginPage-mfcpc59i-CrMfgFNV.js',
      'assets/router-mfcpc59i-D7zFZhMN.js',
      'assets/vendor-mfcpc59i-D3F3s8fL.js',
      'assets/Section-mfcpc59i-BMO9MkVE.js',
      'assets/firebase-mfcpc59i-BteSMG94.js',
      'assets/DashboardPage-mfcpc59i-CrACviT3.js',
      'assets/ClassificaPage-mfcpc59i-BA25TTeR.js',
      'assets/charts-mfcpc59i-CodDicdT.js',
      'assets/ShareButtons-mfcpc59i-BMXeOcIL.js',
      'assets/StatsPage-mfcpc59i-BtHLFKn9.js',
      'assets/Modal-mfcpc59i-CwYeunog.js',
      'assets/names-mfcpc59i-BW9lV2zG.js',
      'assets/BookingPage-mfcpc59i-B5Bp8c-3.js',
      'assets/bookings-mfcpc59i-CVZv2cx1.js',
      'assets/cloud-bookings-mfcpc59i-cWaUvgoz.js',
      'assets/pricing-mfcpc59i-DMaWA4wL.js',
      'assets/PlayersPage-mfcpc59i-B7bPQcnY.js',
      'assets/MatchesPage-mfcpc59i-CF2bGWrY.js',
      'assets/TournamentsPage-mfcpc59i-QxcAvAOD.js',
      'assets/ProfilePage-mfcpc59i-C11FW6DL.js',
      'assets/Extra-mfcpc59i-BNdmwD8l.js',
      'assets/format-mfcpc59i-DAEZv7Mi.js',
      'assets/ExtraPage-mfcpc59i-Nn9iQ7dR.js',
      'assets/AdminBookingsPage-mfcpc59i-CL8LCE-8.js',
    ])
) => i.map((i) => d[i]);
import { r as Te, a as ze } from './vendor-mfcpc59i-D3F3s8fL.js';
import {
  r as x,
  b as P,
  u as Q,
  N as W,
  c as Oe,
  O as We,
  B as $e,
  d as Fe,
  e as _,
} from './router-mfcpc59i-D7zFZhMN.js';
import {
  g as me,
  a as fe,
  i as ge,
  b as he,
  c as pe,
  d as Ue,
  s as Ve,
  e as He,
  G as qe,
  f as xe,
  h as Ge,
  F as Je,
  j as Ke,
  k as Ye,
  l as Xe,
  m as $,
  n as be,
  u as Ze,
  o as we,
  p as ve,
  q as ye,
  r as Qe,
  t as et,
  v as tt,
  w as st,
} from './firebase-mfcpc59i-BteSMG94.js';
(function () {
  const s = document.createElement('link').relList;
  if (s && s.supports && s.supports('modulepreload')) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) a(n);
  new MutationObserver((n) => {
    for (const f of n)
      if (f.type === 'childList')
        for (const o of f.addedNodes) o.tagName === 'LINK' && o.rel === 'modulepreload' && a(o);
  }).observe(document, { childList: !0, subtree: !0 });
  function r(n) {
    const f = {};
    return (
      n.integrity && (f.integrity = n.integrity),
      n.referrerPolicy && (f.referrerPolicy = n.referrerPolicy),
      n.crossOrigin === 'use-credentials'
        ? (f.credentials = 'include')
        : n.crossOrigin === 'anonymous'
          ? (f.credentials = 'omit')
          : (f.credentials = 'same-origin'),
      f
    );
  }
  function a(n) {
    if (n.ep) return;
    n.ep = !0;
    const f = r(n);
    fetch(n.href, f);
  }
})();
var J = { exports: {} },
  T = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var oe;
function rt() {
  if (oe) return T;
  oe = 1;
  var t = Te(),
    s = Symbol.for('react.element'),
    r = Symbol.for('react.fragment'),
    a = Object.prototype.hasOwnProperty,
    n = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    f = { key: !0, ref: !0, __self: !0, __source: !0 };
  function o(l, u, d) {
    var m,
      g = {},
      i = null,
      c = null;
    (d !== void 0 && (i = '' + d),
      u.key !== void 0 && (i = '' + u.key),
      u.ref !== void 0 && (c = u.ref));
    for (m in u) a.call(u, m) && !f.hasOwnProperty(m) && (g[m] = u[m]);
    if (l && l.defaultProps) for (m in ((u = l.defaultProps), u)) g[m] === void 0 && (g[m] = u[m]);
    return { $$typeof: s, type: l, key: i, ref: c, props: g, _owner: n.current };
  }
  return ((T.Fragment = r), (T.jsx = o), (T.jsxs = o), T);
}
var ie;
function at() {
  return (ie || ((ie = 1), (J.exports = rt())), J.exports);
}
var e = at(),
  H = {},
  le;
function nt() {
  if (le) return H;
  le = 1;
  var t = ze();
  return ((H.createRoot = t.createRoot), (H.hydrateRoot = t.hydrateRoot), H);
}
var ot = nt();
const it = 'modulepreload',
  lt = function (t) {
    return '/' + t;
  },
  ce = {},
  B = function (s, r, a) {
    let n = Promise.resolve();
    if (r && r.length > 0) {
      let u = function (d) {
        return Promise.all(
          d.map((m) =>
            Promise.resolve(m).then(
              (g) => ({ status: 'fulfilled', value: g }),
              (g) => ({ status: 'rejected', reason: g })
            )
          )
        );
      };
      document.getElementsByTagName('link');
      const o = document.querySelector('meta[property=csp-nonce]'),
        l = o?.nonce || o?.getAttribute('nonce');
      n = u(
        r.map((d) => {
          if (((d = lt(d)), d in ce)) return;
          ce[d] = !0;
          const m = d.endsWith('.css'),
            g = m ? '[rel="stylesheet"]' : '';
          if (document.querySelector(`link[href="${d}"]${g}`)) return;
          const i = document.createElement('link');
          if (
            ((i.rel = m ? 'stylesheet' : it),
            m || (i.as = 'script'),
            (i.crossOrigin = ''),
            (i.href = d),
            l && i.setAttribute('nonce', l),
            document.head.appendChild(i),
            m)
          )
            return new Promise((c, p) => {
              (i.addEventListener('load', c),
                i.addEventListener('error', () => p(new Error(`Unable to preload CSS for ${d}`))));
            });
        })
      );
    }
    function f(o) {
      const l = new Event('vite:preloadError', { cancelable: !0 });
      if (((l.payload = o), window.dispatchEvent(l), !l.defaultPrevented)) throw o;
    }
    return n.then((o) => {
      for (const l of o || []) l.status === 'rejected' && f(l.reason);
      return s().catch(f);
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
  ct = ['apiKey', 'authDomain', 'projectId', 'appId'],
  ue = ct.filter((t) => !O[t]);
if (ue.length > 0) throw new Error(`Missing Firebase configuration: ${ue.join(', ')}`);
const je = me().length ? fe() : ge(O),
  ee = he(je, {
    experimentalAutoDetectLongPolling: !0,
    experimentalForceLongPolling: !1,
    useFetchStreams: !1,
  }),
  L = pe(je);
L.useDeviceLanguage && L.useDeviceLanguage();
try {
  if (typeof window < 'u' && new URLSearchParams(window.location.search || '').has('authdebug')) {
    const s = {
      projectId: O.projectId,
      authDomain: O.authDomain,
      appId: O.appId,
      emulator: !1,
      isDev: !1,
      user: L?.currentUser ? { uid: L.currentUser.uid } : null,
    };
    console.log('[Firebase][authdebug]', s);
  }
} catch {}
function ke(t) {
  return tt(
    L,
    (s) => {
      try {
        t(s);
      } catch (r) {
        (console.error('onAuth callback error:', r), t(null));
      }
    },
    (s) => {
      (console.error('Firebase Auth error:', s), t(null));
    }
  );
}
async function ut() {
  const t = new qe();
  (t.addScope('email'), t.addScope('profile'), t.setCustomParameters({ prompt: 'select_account' }));
  let s = null;
  try {
    s = await xe(L, t);
  } catch (r) {
    const a = String(r?.message || '').toLowerCase(),
      n = String(r?.code || '').toLowerCase();
    if (a.includes('cross-origin-opener-policy') || a.includes('window.closed')) return s;
    if (
      n.includes('auth/unauthorized-domain') ||
      n.includes('auth/operation-not-supported') ||
      n.includes('auth/popup-blocked') ||
      n.includes('auth/popup-closed-by-user') ||
      a.includes('requests-from-referer') ||
      a.includes('cross-origin') ||
      a.includes('popup')
    )
      return (await Ge(L, t), null);
    throw r;
  }
  return (s && s.user && (await Ae(s.user)), s);
}
async function Ae(t) {
  try {
    const s = await F(t.uid);
    if (!s.email || !s.firstName) {
      const r = (t.displayName || '').split(' '),
        a = {
          email: t.email,
          firstName: s.firstName || r[0] || '',
          lastName: s.lastName || r.slice(1).join(' ') || '',
          phone: s.phone || '',
          avatar: t.photoURL || '',
          provider: 'google',
          ...s,
        };
      await q(t.uid, a);
    }
  } catch (s) {
    console.warn('Errore creazione/aggiornamento profilo:', s);
  }
}
async function dt() {
  const t = new Je();
  (t.addScope('email'), t.addScope('public_profile'));
  const s = await xe(L, t);
  return (s && s.user && (await Ae(s.user)), s);
}
async function mt(t, s) {
  if (!t || !s) throw new Error('Email e password sono obbligatorie');
  const r = await Ke(L, t, s);
  if (r.user) {
    const a = await F(r.user.uid);
    a.email ||
      (await q(r.user.uid, {
        email: r.user.email,
        firstName: '',
        lastName: '',
        phone: '',
        provider: 'password',
        ...a,
      }));
  }
  return r;
}
async function ft(t, s) {
  if (!t || !s) throw new Error('Email e password sono obbligatorie');
  return Ye(L, t, s);
}
async function gt(t) {
  if (!t) throw new Error('Email obbligatoria');
  return Xe(L, t);
}
async function ht() {
  try {
    const t = window.location.href;
    if (!Ue(L, t)) return null;
    let s = null;
    try {
      s = localStorage.getItem('ml-magic-email');
    } catch {}
    s || (s = window.prompt('Per completare l’accesso, inserisci la tua email:') || '');
    const r = await Ve(L, s, t);
    try {
      localStorage.removeItem('ml-magic-email');
    } catch {}
    if ((window.history.replaceState({}, document.title, window.location.pathname), r.user)) {
      const a = await F(r.user.uid);
      if (!a.email) {
        const n = {
          email: r.user.email,
          firstName: '',
          lastName: '',
          phone: '',
          provider: 'email',
          ...a,
        };
        await q(r.user.uid, n);
      }
    }
    return r;
  } catch (t) {
    throw (console.warn('completeMagicLinkIfPresent error:', t), t);
  }
}
async function pt() {
  await He(L);
}
async function F(t) {
  const s = $(ee, 'profiles', t),
    r = await we(s);
  return r.exists() ? r.data() : {};
}
async function q(t, s) {
  const r = $(ee, 'profiles', t);
  await be(r, { ...s, _updatedAt: Date.now() }, { merge: !0 });
}
async function xt(t, s) {
  await Ze(t, { displayName: s });
}
async function bt(t = 500) {
  const s = ve(ee, 'profiles'),
    r = await ye(Qe(s, et(t))),
    a = [];
  return (
    r.forEach((n) => {
      const f = n.data() || {};
      a.push({ uid: n.id, ...f });
    }),
    a
  );
}
const as = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        auth: L,
        completeMagicLinkIfPresent: ht,
        getUserProfile: F,
        listAllUserProfiles: bt,
        loginWithEmailPassword: ft,
        loginWithFacebook: dt,
        loginWithGoogle: ut,
        logout: pt,
        onAuth: ke,
        registerWithEmailPassword: mt,
        saveUserProfile: q,
        sendResetPassword: gt,
        setDisplayName: xt,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  Ne = x.createContext(null),
  G = () => {
    const t = x.useContext(Ne);
    if (!t) throw new Error('useAuth must be used within an AuthProvider');
    return t;
  };
function wt({ children: t }) {
  const [s, r] = x.useState(null),
    [a, n] = x.useState(null),
    [f, o] = x.useState(!0),
    [l, u] = x.useState(null);
  x.useEffect(
    () =>
      ke(async (c) => {
        try {
          if ((r(c), c)) {
            const p = await F(c.uid);
            n(p);
          } else n(null);
          u(null);
        } catch (p) {
          (console.error('Auth error:', p), u(p), n(null));
        } finally {
          o(!1);
        }
      }),
    []
  );
  const d = !!s,
    m = a?.firstName && a?.phone,
    g = {
      user: s,
      userProfile: a,
      setUserProfile: n,
      loading: f,
      error: l,
      isAuthenticated: d,
      isProfileComplete: m,
    };
  return e.jsx(Ne.Provider, { value: g, children: t });
}
const vt = {
    apiKey: 'AIzaSyDMP7772cyEY1oLzo8f9hMW7Leu4lWc6OU',
    authDomain: 'm-padelweb.firebaseapp.com',
    projectId: 'm-padelweb',
  },
  Se = me().length ? fe() : ge(vt);
pe(Se);
const U = he(Se, {
  experimentalAutoDetectLongPolling: !0,
  experimentalForceLongPolling: !1,
  useFetchStreams: !1,
});
async function te(t) {
  const s = await we($(U, 'leagues', t));
  return s.exists() ? s.data() : null;
}
async function yt() {
  try {
    const t = await ye(ve(U, 'leagues')),
      s = [];
    return (
      t.forEach((r) => {
        const a = r.data();
        s.push({
          id: r.id,
          name: a.name || r.id,
          players: a.players?.length || 0,
          matches: a.matches?.length || 0,
          lastUpdated: a._updatedAt ? new Date(a._updatedAt).toLocaleString() : 'N/A',
          courts: a.courts?.length || 0,
        });
      }),
      s.sort((r, a) => (a._updatedAt || 0) - (r._updatedAt || 0))
    );
  } catch (t) {
    return (console.error('Errore nel recupero della lista backup:', t), []);
  }
}
async function Ie(t, s) {
  if (s._restored) console.log('🔥 Ripristino manuale autorizzato - bypassando protezioni');
  else if (s.players && s.players.length < 5) {
    (console.warn(
      '🚨 PROTEZIONE ATTIVA: Rifiutato salvataggio di dati con pochi giocatori (possibili seed data)'
    ),
      console.warn('Dati non salvati:', {
        players: s.players?.length,
        matches: s.matches?.length,
      }));
    return;
  }
  try {
    const r = await te(t);
    if (r && r.players && r.players.length > (s.players?.length || 0)) {
      const a = `firebase-backup-${Date.now()}`;
      (localStorage.setItem(
        a,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          data: r,
          reason: 'Auto-backup before potential data loss',
        })
      ),
        console.log('🔒 Backup automatico creato prima del salvataggio:', a));
    }
  } catch (r) {
    console.warn('Impossibile creare backup automatico:', r);
  }
  (await be($(U, 'leagues', t), s, { merge: !0 }),
    console.log('✅ Dati salvati nel cloud:', {
      players: s.players?.length,
      matches: s.matches?.length,
    }));
}
function Pe(t, s) {
  return st($(U, 'leagues', t), (r) => {
    r.exists() && s(r.data());
  });
}
const ns = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        db: U,
        listLeagues: yt,
        loadLeague: te,
        saveLeague: Ie,
        subscribeLeague: Pe,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  z = (t) => Math.round(Number(t || 0)),
  K = (t) => Number(t || 0).toFixed(2);
function jt(t) {
  return (t || [])
    .filter((s) => String(s?.a ?? '') !== '' || String(s?.b ?? '') !== '')
    .map((s) => `${Number(s.a || 0)}-${Number(s.b || 0)}`)
    .join(', ');
}
function Y(t) {
  let s = 0,
    r = 0,
    a = 0,
    n = 0;
  for (const o of t || []) {
    const l = Number(o?.a || 0),
      u = Number(o?.b || 0);
    (String(l) === '' && String(u) === '') || ((a += l), (n += u), l > u ? s++ : u > l && r++);
  }
  let f = null;
  return (
    s > r ? (f = 'A') : r > s && (f = 'B'),
    { setsA: s, setsB: r, gamesA: a, gamesB: n, winner: f }
  );
}
function kt(t) {
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
function At(t) {
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
function X({
  ratingA1: t,
  ratingA2: s,
  ratingB1: r,
  ratingB2: a,
  gamesA: n,
  gamesB: f,
  winner: o,
  sets: l,
}) {
  const u = Number(t || 0),
    d = Number(s || 0),
    m = Number(r || 0),
    g = Number(a || 0),
    i = u + d,
    c = m + g,
    p = o === 'A' ? i : c,
    w = o === 'A' ? c : i,
    h = (i + c) / 100,
    A = w - p,
    S = kt(A),
    E = o === 'A' ? n - f : f - n,
    y = (h + E) * S,
    v = Math.round(y),
    N = o === 'A' ? v : -v,
    j = o === 'B' ? v : -v,
    b = `Risultato set: ${jt(l)}`,
    C =
      `Team A=${z(i)}, Team B=${z(c)}, Gap=${z(A)}
Fascia: ${At(A)}

Base = (${z(i)} + ${z(c)})/100 = ${K(h)}
DG (Differenza Game) = ${E}

Punti = (Base + DG) × factor = (${K(h)} + ${E}) × ${S.toFixed(2)} = ${K(y)}
Punti (arrotondato) = ${v}
` +
      (o === 'A' ? `Team A +${v}, Team B -${v}` : `Team B +${v}, Team A -${v}`) +
      `
${b}`;
  return {
    deltaA: N,
    deltaB: j,
    pts: v,
    base: h,
    factor: S,
    gap: A,
    sumA: i,
    sumB: c,
    gd: E,
    formula: C,
  };
}
const os = () => Math.random().toString(36).slice(2, 10),
  I = 1e3,
  D = 'paris-league-v1';
function Nt(t, s) {
  const r = new Map(
      t.map((o) => {
        const l = Number(o.baseRating ?? o.startRating ?? o.rating ?? I);
        return [
          o.id,
          {
            ...o,
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
    a = new Map(t.map((o) => [o.id, []])),
    n = [],
    f = [...(s || [])].sort((o, l) => new Date(o.date) - new Date(l.date));
  for (const o of f) {
    const l = r.get(o.teamA[0]),
      u = r.get(o.teamA[1]),
      d = r.get(o.teamB[0]),
      m = r.get(o.teamB[1]),
      g = Y(o.sets),
      i = X({
        ratingA1: l?.rating ?? I,
        ratingA2: u?.rating ?? I,
        ratingB1: d?.rating ?? I,
        ratingB2: m?.rating ?? I,
        gamesA: g.gamesA,
        gamesB: g.gamesB,
        winner: g.winner,
        sets: o.sets,
      }),
      c = { ...o, ...g, ...i };
    n.push(c);
    const p = (w, h) => {
      if (!w) return;
      const A = a.get(w) || [];
      (A.push(h), a.set(w, A));
    };
    (p(l?.id, i.deltaA),
      p(u?.id, i.deltaA),
      p(d?.id, i.deltaB),
      p(m?.id, i.deltaB),
      l && (l.lastDelta = i.deltaA),
      u && (u.lastDelta = i.deltaA),
      d && (d.lastDelta = i.deltaB),
      m && (m.lastDelta = i.deltaB),
      g.winner === 'A'
        ? (l && (l.rating += i.deltaA),
          u && (u.rating += i.deltaA),
          d && (d.rating += i.deltaB),
          m && (m.rating += i.deltaB),
          l && l.wins++,
          u && u.wins++,
          d && d.losses++,
          m && m.losses++)
        : g.winner === 'B' &&
          (l && (l.rating += i.deltaA),
          u && (u.rating += i.deltaA),
          d && (d.rating += i.deltaB),
          m && (m.rating += i.deltaB),
          d && d.wins++,
          m && m.wins++,
          l && l.losses++,
          u && u.losses++));
  }
  for (const o of r.values()) {
    const u = (a.get(o.id) || []).slice(-5);
    let d = 0,
      m = 0,
      g = 0;
    for (const i of u) ((g += i), i >= 0 ? (d += i) : (m += -i));
    ((o.trend5Total = g), (o.trend5Pos = d), (o.trend5Neg = m));
  }
  return { players: Array.from(r.values()), matches: n };
}
function is(t, s, r) {
  const a = new Map(t.map((c) => [c.id, c.name])),
    f = [...(s || [])].sort((c, p) => new Date(c.date) - new Date(p.date)).slice(-15),
    o = new Map(t.map((c) => [c.id, Number(c.rating ?? I)])),
    l = new Map(o),
    u = [...f].reverse();
  for (const c of u) {
    const p = Y(c.sets),
      w = X({
        ratingA1: l.get(c.teamA[0]) ?? I,
        ratingA2: l.get(c.teamA[1]) ?? I,
        ratingB1: l.get(c.teamB[0]) ?? I,
        ratingB2: l.get(c.teamB[1]) ?? I,
        gamesA: p.gamesA,
        gamesB: p.gamesB,
        winner: p.winner,
        sets: c.sets,
      }),
      h = (A, S) => l.set(A, (l.get(A) ?? I) - S);
    (h(c.teamA[0], w.deltaA),
      h(c.teamA[1], w.deltaA),
      h(c.teamB[0], w.deltaB),
      h(c.teamB[1], w.deltaB));
  }
  const d = new Map(l),
    m = [],
    g = { label: 'Inizio periodo' };
  for (const c of r) g[a.get(c) || c] = Math.round(d.get(c) ?? I);
  m.push(g);
  for (const c of f) {
    const p = Y(c.sets),
      w = X({
        ratingA1: d.get(c.teamA[0]) ?? I,
        ratingA2: d.get(c.teamA[1]) ?? I,
        ratingB1: d.get(c.teamB[0]) ?? I,
        ratingB2: d.get(c.teamB[1]) ?? I,
        gamesA: p.gamesA,
        gamesB: p.gamesB,
        winner: p.winner,
        sets: c.sets,
      }),
      h = (S, E) => d.set(S, (d.get(S) ?? I) + E);
    (h(c.teamA[0], w.deltaA),
      h(c.teamA[1], w.deltaA),
      h(c.teamB[0], w.deltaB),
      h(c.teamB[1], w.deltaB));
    const A = {
      label: new Date(c.date).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    for (const S of r) A[a.get(S) || S] = Math.round(d.get(S) ?? I);
    m.push(A);
  }
  const i = { label: 'Attuale' };
  for (const c of r) i[a.get(c) || c] = Math.round(o.get(c) ?? I);
  return (m.push(i), m);
}
function R() {
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
function de() {
  return { players: [], matches: [], courts: [], bookings: [], bookingConfig: R() };
}
const Ce = x.createContext(null),
  St = () => {
    const t = x.useContext(Ce);
    if (!t) throw new Error('useLeague must be used within a LeagueProvider');
    return t;
  };
function It({ children: t }) {
  const { user: s, loading: r } = G(),
    [a, n] = x.useState(null),
    [f, o] = x.useState(!0),
    [l, u] = x.useState(null),
    [d, m] = x.useState(!1),
    [g, i] = x.useState(localStorage.getItem(D + '-leagueId') || 'lega-andrea-2025'),
    c = x.useRef(null);
  if (!c.current) {
    const y = (() => {
      try {
        return localStorage.getItem('ml-client-id');
      } catch {
        return null;
      }
    })();
    if (y) c.current = y;
    else {
      const v = Math.random().toString(36).slice(2, 10);
      c.current = v;
      try {
        localStorage.setItem('ml-client-id', v);
      } catch {}
    }
  }
  const p = x.useRef(0),
    w = x.useRef(null);
  x.useEffect(() => {
    localStorage.setItem(D + '-leagueId', g);
  }, [g]);
  const h = (y) => {
    n((v) => {
      const N = typeof y == 'function' ? y(v) : y,
        j = Date.now(),
        b = (v?._rev || 0) + 1;
      return ((p.current = j + 2e3), { ...N, _updatedAt: j, _rev: b, _lastWriter: c.current });
    });
  };
  (x.useEffect(() => {
    r ||
      (async () => {
        try {
          if ((o(!0), u(null), s)) {
            const N = await te(g);
            if (N && typeof N == 'object' && Array.isArray(N.players) && Array.isArray(N.matches)) {
              const b = { ...N };
              (Array.isArray(b.courts) || (b.courts = []),
                Array.isArray(b.bookings) || (b.bookings = []),
                b.bookingConfig || (b.bookingConfig = R()),
                b.bookingConfig.pricing || (b.bookingConfig.pricing = R().pricing),
                b.bookingConfig.addons || (b.bookingConfig.addons = R().addons),
                n(b));
              const C = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
              w.current = C.reduce((M, V) => ((M[V] = b[V]), M), {});
              try {
                localStorage.setItem(D, JSON.stringify(b));
              } catch {}
              return;
            }
          }
          try {
            const N = localStorage.getItem(D);
            if (N) {
              const j = JSON.parse(N);
              if (j && Array.isArray(j.players) && Array.isArray(j.matches)) {
                n(j);
                const b = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
                w.current = b.reduce((C, M) => ((C[M] = j[M] || []), C), {});
                return;
              }
            }
          } catch {}
          const y = de();
          n(y);
          const v = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
          ((w.current = v.reduce((N, j) => ((N[j] = y[j] || []), N), {})),
            console.log('� App inizializzata con stato vuoto - aggiungi i tuoi dati!'));
          try {
            localStorage.setItem(D, JSON.stringify(y));
          } catch {}
        } catch (y) {
          (console.error('League load error:', y), u(y));
          const v = de();
          n(v);
        } finally {
          o(!1);
        }
      })();
  }, [g, s, r]),
    x.useEffect(() => {
      if (!g || !s || r) return;
      let y = null;
      try {
        y = Pe(g, (v) => {
          if (
            !(v && typeof v == 'object' && Array.isArray(v.players) && Array.isArray(v.matches)) ||
            Date.now() < p.current
          )
            return;
          const j = { ...v };
          (Array.isArray(j.courts) || (j.courts = []),
            Array.isArray(j.bookings) || (j.bookings = []),
            j.bookingConfig || (j.bookingConfig = R()),
            j.bookingConfig.pricing || (j.bookingConfig.pricing = R().pricing),
            j.bookingConfig.addons || (j.bookingConfig.addons = R().addons),
            m(!0),
            n((b) => {
              const C = b?._rev ?? 0,
                M = j?._rev ?? 0,
                V = b?._updatedAt ?? 0,
                Re = j?._updatedAt ?? 0,
                re = M > C || (M === C && Re > V);
              if (re) {
                const De = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'];
                w.current = De.reduce((ae, ne) => ((ae[ne] = j[ne]), ae), {});
              }
              return re ? j : b;
            }),
            m(!1));
        });
      } catch (v) {
        console.error('Subscribe error:', v);
      }
      return () => y && y();
    }, [g, s, r]),
    x.useEffect(() => {
      if (!a || d || !s) return;
      const y = ['players', 'matches', 'courts', 'bookings', 'bookingConfig'],
        v = y.reduce((b, C) => ((b[C] = a[C]), b), {}),
        N = w.current;
      if (!N || y.some((b) => JSON.stringify(v[b]) !== JSON.stringify(N[b])))
        try {
          localStorage.setItem(D, JSON.stringify(a));
          const b = {
              ...a,
              _updatedAt: Date.now(),
              _lastWriter: c.current,
              _rev: (a._rev || 0) + 1,
            },
            C = setTimeout(async () => {
              try {
                (await Ie(g, b), (w.current = v));
              } catch (M) {
                console.error('Cloud save error:', M);
              }
            }, 800);
          return () => clearTimeout(C);
        } catch (b) {
          console.error('LocalStorage save error:', b);
        }
    }, [a, g, d, s]));
  const A = P.useMemo(
      () => (a ? Nt(a.players || [], a.matches || []) : { players: [], matches: [] }),
      [a]
    ),
    S = P.useMemo(() => Object.fromEntries((A.players || []).map((y) => [y.id, y])), [A]),
    E = {
      state: a,
      setState: h,
      derived: A,
      playersById: S,
      leagueId: g,
      setLeagueId: i,
      loading: f,
      error: l,
      updatingFromCloud: d,
    };
  return e.jsx(Ce.Provider, { value: E, children: t });
}
const Le = x.createContext(null),
  _e = () => {
    const t = x.useContext(Le);
    if (!t) throw new Error('useUI must be used within a UIProvider');
    return t;
  };
function Pt({ children: t }) {
  const [s, r] = x.useState(() => {
      try {
        const p = sessionStorage.getItem('ml-extra-unlocked') === '1',
          w = sessionStorage.getItem('ml-club-mode') === '1';
        return p && w;
      } catch {
        return !1;
      }
    }),
    [a, n] = x.useState([]),
    [f, o] = x.useState(!1),
    [l, u] = x.useState(null);
  P.useEffect(() => {
    try {
      s ? sessionStorage.setItem('ml-club-mode', '1') : sessionStorage.removeItem('ml-club-mode');
    } catch {}
  }, [s]);
  const d = (p) => {
      const w = Math.random().toString(36).slice(2),
        h = { id: w, ...p };
      return (
        n((A) => [...A, h]),
        setTimeout(() => {
          m(w);
        }, 5e3),
        w
      );
    },
    m = (p) => {
      n((w) => w.filter((h) => h.id !== p));
    },
    c = {
      clubMode: s,
      setClubMode: r,
      notifications: a,
      addNotification: d,
      removeNotification: m,
      loading: f,
      setLoading: o,
      modal: l,
      showModal: (p) => {
        u(p);
      },
      hideModal: () => {
        u(null);
      },
    };
  return e.jsx(Le.Provider, { value: c, children: t });
}
class Ct extends P.Component {
  constructor(s) {
    (super(s), (this.state = { hasError: !1, error: null, errorInfo: null }));
  }
  static getDerivedStateFromError(s) {
    return { hasError: !0 };
  }
  componentDidCatch(s, r) {
    this.setState({ error: s, errorInfo: r });
  }
  render() {
    if (this.state.hasError) {
      const { fallback: s } = this.props;
      return s
        ? e.jsx(s, {
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
function Ee({ size: t = 'md', className: s = '' }) {
  const r = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12', xl: 'h-16 w-16' };
  return e.jsx('div', {
    className: `animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${r[t]} ${s}`,
  });
}
function se({ message: t = 'Caricamento...' }) {
  return e.jsx('div', {
    className: 'min-h-screen bg-gray-50 flex items-center justify-center',
    children: e.jsxs('div', {
      className: 'text-center',
      children: [
        e.jsx(Ee, { size: 'xl', className: 'mx-auto mb-4' }),
        e.jsx('p', { className: 'text-gray-600 text-lg', children: t }),
      ],
    }),
  });
}
function Lt({ message: t = 'Caricamento...', visible: s = !0 }) {
  return s
    ? e.jsx('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center',
        style: { zIndex: 1e5 },
        children: e.jsxs('div', {
          className: 'bg-white rounded-lg p-6 flex items-center space-x-3',
          children: [
            e.jsx(Ee, { size: 'md' }),
            e.jsx('span', { className: 'text-gray-700', children: t }),
          ],
        }),
      })
    : null;
}
function Z(t, s, r) {
  return t !== s;
}
function _t(t, s) {
  const r = t.pathname;
  if (r === '/login') {
    const a = t.state?.from?.pathname;
    return a && a !== '/login' ? a : '/dashboard';
  }
  return r === '/' ? '/dashboard' : null;
}
function Et({ children: t, requireProfile: s = !0 }) {
  const { user: r, userProfile: a, isAuthenticated: n, isProfileComplete: f, loading: o } = G(),
    l = Q();
  if (o) return e.jsx(se, { message: 'Verifica autenticazione...' });
  if (!n) {
    const u = '/login';
    if (Z(l.pathname, u)) return e.jsx(W, { to: u, state: { from: l }, replace: !0 });
  }
  if (n && s && a !== null && !f) {
    const u = '/profile';
    if (Z(l.pathname, u)) return e.jsx(W, { to: u, state: { from: l }, replace: !0 });
  }
  return t;
}
function Bt({ children: t }) {
  const { isAuthenticated: s, loading: r } = G(),
    a = Q();
  if (r) return e.jsx(se, { message: 'Verifica autenticazione...' });
  if (s) {
    const n = _t(a);
    if (n && Z(a.pathname, n)) return e.jsx(W, { to: n, replace: !0 });
  }
  return t;
}
const Mt = '/play-sport-pro_horizontal.svg',
  k = {
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
    name: 'modern',
    ...{
      borderSm: k.borderRadius.sm,
      borderMd: k.borderRadius.md,
      borderLg: k.borderRadius.lg,
      borderFull: k.borderRadius.full,
      spacingXs: k.spacing.xs,
      spacingSm: k.spacing.sm,
      spacingMd: k.spacing.md,
      spacingLg: k.spacing.lg,
      spacingXl: k.spacing.xl,
      shadowCard: k.shadows.card,
      shadowSm: k.shadows.sm,
      shadowMd: k.shadows.md,
      shadowLg: k.shadows.lg,
      transitionFast: k.transitions.fast,
      transitionNormal: k.transitions.normal,
      transitionSlow: k.transitions.slow,
      focusRing: 'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2',
    },
    pageBg: 'bg-neutral-50',
    text: 'text-neutral-900',
    subtext: 'text-neutral-600',
    cardBg: 'bg-white',
    border: 'ring-1 ring-black/10',
    headerBg: 'bg-white border-b border-black/10',
    neonText: 'text-emerald-600',
    link: 'underline underline-offset-4 decoration-emerald-600 hover:text-emerald-700',
    ghostRing: 'ring-black/10 hover:bg-black/5',
    tableHeadText: 'text-neutral-500',
    input: `${k.borderRadius.md} px-3 py-2 bg-white border border-black/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none ${k.transitions.normal}`,
    btnPrimary: `inline-flex items-center justify-center ${k.borderRadius.md} px-4 py-2 font-medium text-black bg-gradient-to-r from-emerald-400 to-lime-400 hover:brightness-110 active:brightness-95 ${k.transitions.normal} ${k.shadows.sm}`,
    btnGhost: `inline-flex items-center justify-center ${k.borderRadius.md} px-4 py-2 font-medium ring-1 ring-black/10 hover:bg-black/5 ${k.transitions.normal}`,
    btnGhostSm: `inline-flex items-center justify-center ${k.borderRadius.sm} px-2 py-1 text-xs font-medium ring-1 ring-black/10 hover:bg-black/5 ${k.transitions.normal}`,
    accentGood: 'text-emerald-600',
    accentBad: 'text-rose-600',
    accentWarning: 'text-amber-600',
    accentInfo: 'text-blue-600',
    chip: 'bg-emerald-500 text-black',
    card: `${k.borderRadius.lg} bg-white ring-1 ring-black/10 ${k.spacing.md} ${k.shadows.card}`,
    cardHover: `${k.borderRadius.lg} bg-white ring-1 ring-black/10 ${k.spacing.md} ${k.shadows.md} hover:shadow-lg ${k.transitions.normal}`,
  };
}
function Dt() {
  const { notifications: t, removeNotification: s } = _e();
  return t.length === 0
    ? null
    : e.jsx('div', {
        className: 'fixed top-4 right-4 space-y-2',
        style: { zIndex: 100001 },
        children: t.map((r) => e.jsx(Tt, { notification: r, onRemove: s }, r.id)),
      });
}
function Tt({ notification: t, onRemove: s }) {
  const { id: r, type: a = 'info', title: n, message: f, autoClose: o = !0 } = t,
    l = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-black',
      info: 'bg-blue-500 text-white',
    },
    u = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  return (
    P.useEffect(() => {
      if (o) {
        const d = setTimeout(() => {
          s(r);
        }, 5e3);
        return () => clearTimeout(d);
      }
    }, [r, o, s]),
    e.jsx('div', {
      className: `${l[a]} px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slide-in-right`,
      role: 'alert',
      children: e.jsxs('div', {
        className: 'flex items-start',
        children: [
          e.jsx('span', { className: 'text-lg mr-2', children: u[a] }),
          e.jsxs('div', {
            className: 'flex-1',
            children: [
              n && e.jsx('div', { className: 'font-medium', children: n }),
              f && e.jsx('div', { className: 'text-sm opacity-90', children: f }),
            ],
          }),
          e.jsx('button', {
            onClick: () => s(r),
            className: 'ml-2 text-lg leading-none opacity-70 hover:opacity-100',
            'aria-label': 'Chiudi notifica',
            children: '×',
          }),
        ],
      }),
    })
  );
}
function zt({ active: t, setActive: s, clubMode: r, T: a, user: n, navigation: f }) {
  const o = f || [
    { id: 'classifica', label: 'Classifica' },
    { id: 'stats', label: 'Statistiche' },
    { id: 'prenota-campo', label: 'Prenota Campo' },
    ...(r
      ? [
          { id: 'giocatori', label: 'Giocatori' },
          { id: 'crea', label: 'Crea Partita' },
          { id: 'prenota', label: 'Gestione Campi' },
          { id: 'tornei', label: 'Crea Tornei' },
        ]
      : []),
    { id: n ? 'profile' : 'auth', label: n ? 'Profilo' : 'Accedi' },
    { id: 'extra', label: 'Extra' },
  ];
  return e.jsx('nav', {
    className: 'hidden md:flex gap-1',
    children: o.map((l) =>
      e.jsx(
        'button',
        {
          type: 'button',
          onClick: () => s(l.id),
          className: `px-3 py-1.5 rounded-xl text-sm transition ring-1 ${t === l.id ? a.btnPrimary : a.ghostRing}`,
          'aria-current': t === l.id ? 'page' : void 0,
          children: l.label,
        },
        l.id
      )
    ),
  });
}
function Ot({ active: t, setActive: s, navigation: r = [], clubMode: a = !1 }) {
  const [n, f] = x.useState(!1);
  x.useEffect(() => {
    n && f(!1);
  }, [t, a]);
  const o = [
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
        label: 'Prenota',
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
        label: 'Statistiche',
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
    l = [
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
    u = o,
    d = (i) => {
      (s(i.id), n && f(!1));
    },
    m = (i) => {
      (i.stopPropagation(), i.preventDefault(), f(!n));
    },
    g = (i, c) => {
      (c.stopPropagation(), c.preventDefault(), s(i.id), f(!1));
    };
  return e.jsxs('div', {
    className: 'md:hidden bottom-nav-container bg-white border-t border-gray-200',
    style: {
      zIndex: 999999,
      paddingBottom: 'env(safe-area-inset-bottom)',
      height: 'calc(64px + env(safe-area-inset-bottom))',
    },
    onClick: (i) => i.stopPropagation(),
    onTouchEnd: (i) => i.stopPropagation(),
    children: [
      n &&
        e.jsx('div', {
          className:
            'club-menu-container absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg',
          style: { zIndex: 1e6 },
          children: e.jsxs('div', {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex justify-between items-center mb-3',
                children: [
                  e.jsx('div', {
                    className: 'text-sm font-medium text-gray-500',
                    children: 'Menu Circolo',
                  }),
                  e.jsx('button', {
                    onClick: m,
                    className: 'text-gray-400 hover:text-gray-600 p-1',
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
                className: 'grid grid-cols-2 gap-2',
                children: l.map((i) =>
                  e.jsxs(
                    'div',
                    {
                      className: `flex items-center space-x-2 p-2.5 rounded-lg cursor-pointer transition-colors ${t === i.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`,
                      onClick: (c) => g(i, c),
                      style: {
                        WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                      },
                      children: [
                        i.icon,
                        e.jsx('span', { className: 'text-xs font-medium', children: i.label }),
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
        className: `grid h-16 ${a ? 'grid-cols-5' : 'grid-cols-4'}`,
        children: [
          u.map((i) =>
            e.jsxs(
              'div',
              {
                className: `bottom-nav-item flex flex-col items-center justify-center space-y-1 ${t === i.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`,
                onClick: () => d(i),
                onTouchEnd: () => d(i),
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
                  i.icon,
                  e.jsx('span', { className: 'font-medium text-xs', children: i.label }),
                ],
              },
              i.id
            )
          ),
          a &&
            e.jsxs('div', {
              className: `bottom-nav-item flex flex-col items-center justify-center space-y-1 cursor-pointer ${n ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`,
              onClick: m,
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
                e.jsx('svg', {
                  className: 'w-5 h-5',
                  fill: 'none',
                  stroke: 'currentColor',
                  viewBox: '0 0 24 24',
                  children: e.jsx('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 2,
                    d: 'M4 6h16M4 12h16M4 18h16',
                  }),
                }),
                e.jsx('span', { className: 'text-xs font-medium', children: 'Menu' }),
              ],
            }),
        ],
      }),
    ],
  });
}
function Be() {
  const [t, s] = x.useState(null),
    [r, a] = x.useState(!1),
    [n, f] = x.useState(!1),
    [o, l] = x.useState({});
  x.useEffect(() => {
    ((() => {
      const h = navigator.userAgent,
        A = /iPad|iPhone|iPod/.test(h),
        S = /Android/.test(h),
        E = A || S || /Mobile|Tablet/.test(h),
        y = /Chrome/.test(h) && !/Edge|Edg/.test(h),
        v = /Edge|Edg/.test(h),
        N = /Firefox/.test(h),
        j = /Safari/.test(h) && !/Chrome|CriOS|FxiOS/.test(h),
        b = /OPR|Opera/.test(h),
        C = /SamsungBrowser/.test(h);
      l({
        isIOS: A,
        isAndroid: S,
        isMobile: E,
        isChrome: y,
        isEdge: v,
        isFirefox: N,
        isSafari: j,
        isOpera: b,
        isSamsung: C,
        supportsInstallPrompt: y || v || C || b,
      });
    })(),
      (() => {
        const h = window.matchMedia('(display-mode: standalone)').matches,
          A = window.navigator.standalone === !0,
          S = window.matchMedia('(display-mode: fullscreen)').matches,
          E = window.matchMedia('(display-mode: minimal-ui)').matches,
          y = h || A || S || E;
        (f(y), y && console.log('✅ PWA is already installed'));
      })());
    const p = (h) => {
        (console.log('🚀 PWA installation prompt ready'), h.preventDefault(), s(h), a(!0));
      },
      w = () => {
        (console.log('✅ PWA installed successfully'),
          f(!0),
          a(!1),
          s(null),
          localStorage.setItem('pwa_installed', 'true'));
      };
    return (
      o.supportsInstallPrompt &&
        (window.addEventListener('beforeinstallprompt', p),
        window.addEventListener('appinstalled', w)),
      () => {
        (window.removeEventListener('beforeinstallprompt', p),
          window.removeEventListener('appinstalled', w));
      }
    );
  }, [o.supportsInstallPrompt]);
  const u = async () => {
      if (!t) return (console.warn('⚠️ No deferred prompt available'), !1);
      try {
        t.prompt();
        const { outcome: i } = await t.userChoice;
        return i === 'accepted'
          ? (console.log('✅ User accepted PWA installation'), a(!1), s(null), !0)
          : (console.log('❌ User declined PWA installation'), !1);
      } catch (i) {
        return (console.error('❌ PWA installation failed:', i), !1);
      }
    },
    d = () => {
      const { isIOS: i, isAndroid: c, isSafari: p, isFirefox: w, isChrome: h, isEdge: A } = o;
      return i && p
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
        : w
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
          : c && (h || A)
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
            : !o.isMobile && (h || A)
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
    isInstallable: n ? !1 : !!((o.isIOS && o.isSafari) || (r && t) || o.isFirefox),
    isInstalled: n,
    installApp: u,
    browserInfo: o,
    isPWASupported: m(),
    installInstructions: d(),
  };
}
function Wt({ className: t = '' }) {
  const {
      isInstallable: s,
      isInstalled: r,
      installApp: a,
      browserInfo: n,
      isPWASupported: f,
      installInstructions: o,
    } = Be(),
    [l, u] = x.useState(!1);
  if (r)
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
  if (!f)
    return e.jsx('div', {
      className: `text-gray-500 text-sm ${t}`,
      children: 'Browser non supportato per PWA',
    });
  if (!s) return null;
  const d = async () => {
      if (o.show) {
        u(!0);
        return;
      }
      try {
        (await a()) || (o.show && u(!0));
      } catch (g) {
        (console.error('Install failed:', g), o.show && u(!0));
      }
    },
    m = () =>
      n.isIOS
        ? '📱 Installa su iPhone'
        : n.isAndroid
          ? '🤖 Installa su Android'
          : n.isFirefox
            ? '🦊 Installa con Firefox'
            : '💻 Installa App';
  return e.jsxs(e.Fragment, {
    children: [
      e.jsxs('button', {
        onClick: d,
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
        o.show &&
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
                  children: e.jsx('span', { className: 'text-3xl', children: o.icon }),
                }),
                e.jsx('h3', {
                  className: 'text-xl font-bold text-gray-900 mb-2',
                  children: o.title,
                }),
                e.jsx('p', {
                  className: 'text-gray-600 mb-6',
                  children: 'Segui questi semplici passaggi per installare Paris League:',
                }),
                e.jsx('div', {
                  className: 'text-left space-y-4 mb-8',
                  children: o.instructions.map((g, i) =>
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
                      n.isChrome
                        ? 'Chrome'
                        : n.isFirefox
                          ? 'Firefox'
                          : n.isEdge
                            ? 'Edge'
                            : n.isSafari
                              ? 'Safari'
                              : n.isOpera
                                ? 'Opera'
                                : n.isSamsung
                                  ? 'Samsung Internet'
                                  : 'Altro',
                      n.isMobile && ' Mobile',
                    ],
                  }),
                }),
                e.jsxs('div', {
                  className: 'flex gap-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => u(!1),
                      className:
                        'flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors',
                      children: 'Chiudi',
                    }),
                    !n.isIOS &&
                      !n.isFirefox &&
                      e.jsx('button', {
                        onClick: async () => {
                          (u(!1), await a());
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
      isInstalled: s,
      installApp: r,
      browserInfo: a,
      installInstructions: n,
    } = Be(),
    [f, o] = x.useState(!1),
    [l, u] = x.useState(!1);
  if (s || !t) return null;
  const d = async () => {
      if (n && n.show) {
        o(!0);
        return;
      }
      try {
        await r();
      } catch (g) {
        (console.error('Install failed:', g), n && n.show && o(!0));
      }
    },
    m = () => (a && a.isIOS ? '📱 Installa' : a && a.isAndroid ? '🤖 Installa' : 'Installa App');
  return e.jsxs(e.Fragment, {
    children: [
      e.jsx('div', {
        className: 'sm:hidden fixed right-4 bottom-20 z-[9999]',
        children: l
          ? e.jsx('button', {
              onClick: () => u(!1),
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
                  onClick: d,
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
                  onClick: () => u(!0),
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
      f &&
        n &&
        n.show &&
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
                  children: e.jsx('span', { className: 'text-2xl', children: n.icon || '📱' }),
                }),
                e.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-900 mb-2',
                  children: n.title || 'Installa App',
                }),
                e.jsx('p', {
                  className: 'text-sm text-gray-600 mb-4',
                  children: "Segui questi passaggi per installare l'app:",
                }),
                n.instructions &&
                  e.jsx('div', {
                    className: 'text-left space-y-3 mb-6',
                    children: n.instructions.map((g, i) =>
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
                    a &&
                      !a.isIOS &&
                      !a.isFirefox &&
                      e.jsx('button', {
                        onClick: async () => {
                          (o(!1), await r());
                        },
                        className:
                          'w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors',
                        children: 'Prova Auto-Install',
                      }),
                    e.jsx('button', {
                      onClick: () => o(!1),
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
    { clubMode: s, loading: r } = _e(),
    { updatingFromCloud: a } = St(),
    n = Q(),
    f = Oe(),
    o = P.useMemo(() => Rt(), []),
    l = [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', public: !0 },
      { id: 'classifica', label: 'Classifica', path: '/classifica', public: !0 },
      { id: 'stats', label: 'Statistiche', path: '/stats', public: !0 },
      { id: 'prenota-campo', label: 'Prenota Campo', path: '/booking', public: !0 },
      ...(s
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
    u = n.pathname,
    d = l.find((i) => i.path === u)?.id || '',
    m = (i) => {
      const c = l.find((p) => p.id === i);
      c && f(c.path);
    },
    g = u === '/dashboard' || u === '/';
  return e.jsxs('div', {
    className: `min-h-screen safe-area-top safe-area-bottom ${o.text} ${g ? 'bg-gradient-to-b from-neutral-50 via-white to-neutral-100' : o.pageBg}`,
    children: [
      e.jsx('header', {
        className: `sticky top-0 z-20 ${o.headerBg} safe-area-left safe-area-right`,
        children: e.jsxs('div', {
          className:
            'max-w-[1800px] mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-2 sm:gap-3 min-w-0',
              children: [
                e.jsx('img', {
                  src: Mt,
                  alt: 'Sporting Cat',
                  className: 'h-8 w-auto rounded-md shadow shrink-0',
                }),
                e.jsx('div', {
                  className: 'text-lg sm:text-2xl font-bold tracking-wide truncate text-black',
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
                e.jsx(zt, { active: d, setActive: m, clubMode: s, T: o, user: t, navigation: l }),
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
      e.jsx(Ot, { active: d, setActive: m, navigation: l, clubMode: s }),
      e.jsx($t, {}),
      e.jsx(Dt, {}),
      e.jsx(Lt, { visible: r || a, message: a ? 'Sincronizzazione...' : 'Caricamento...' }),
    ],
  });
}
const Ut = P.lazy(() =>
    B(() => import('./LoginPage-mfcpc59i-CrMfgFNV.js'), __vite__mapDeps([0, 1, 2, 3, 4]))
  ),
  Vt = P.lazy(() =>
    B(() => import('./DashboardPage-mfcpc59i-CrACviT3.js'), __vite__mapDeps([5, 1, 2, 4]))
  ),
  Ht = P.lazy(() =>
    B(() => import('./ClassificaPage-mfcpc59i-BA25TTeR.js'), __vite__mapDeps([6, 1, 2, 3, 7, 8, 4]))
  ),
  qt = P.lazy(() =>
    B(
      () => import('./StatsPage-mfcpc59i-BtHLFKn9.js'),
      __vite__mapDeps([9, 1, 2, 3, 8, 7, 10, 11, 4])
    )
  ),
  Gt = P.lazy(() =>
    B(
      () => import('./BookingPage-mfcpc59i-B5Bp8c-3.js'),
      __vite__mapDeps([12, 1, 2, 13, 14, 4, 15])
    )
  ),
  Jt = P.lazy(() =>
    B(
      () => import('./PlayersPage-mfcpc59i-B7bPQcnY.js'),
      __vite__mapDeps([16, 1, 2, 3, 10, 11, 14, 4])
    )
  ),
  Kt = P.lazy(() =>
    B(() => import('./MatchesPage-mfcpc59i-CF2bGWrY.js'), __vite__mapDeps([17, 1, 2, 3, 11, 4]))
  ),
  Yt = P.lazy(() =>
    B(() => import('./TournamentsPage-mfcpc59i-QxcAvAOD.js'), __vite__mapDeps([18, 1, 2, 3, 4]))
  ),
  Xt = P.lazy(() =>
    B(
      () => import('./ProfilePage-mfcpc59i-C11FW6DL.js'),
      __vite__mapDeps([19, 1, 2, 3, 10, 20, 21, 14, 4])
    )
  ),
  Zt = P.lazy(() =>
    B(() => import('./ExtraPage-mfcpc59i-Nn9iQ7dR.js'), __vite__mapDeps([22, 1, 2, 20, 3, 21, 4]))
  ),
  Qt = P.lazy(() =>
    B(
      () => import('./AdminBookingsPage-mfcpc59i-CL8LCE-8.js'),
      __vite__mapDeps([23, 1, 2, 3, 10, 21, 15, 14, 4])
    )
  );
function es() {
  return e.jsx(Ct, {
    children: e.jsx($e, {
      children: e.jsx(wt, {
        children: e.jsx(It, {
          children: e.jsx(Pt, {
            children: e.jsx(x.Suspense, {
              fallback: e.jsx(se, {}),
              children: e.jsxs(Fe, {
                children: [
                  e.jsx(_, { path: '/login', element: e.jsx(Bt, { children: e.jsx(Ut, {}) }) }),
                  e.jsxs(_, {
                    path: '/',
                    element: e.jsx(Et, { children: e.jsx(Ft, {}) }),
                    children: [
                      e.jsx(_, { index: !0, element: e.jsx(W, { to: 'dashboard', replace: !0 }) }),
                      e.jsx(_, { path: 'dashboard', element: e.jsx(Vt, {}) }),
                      e.jsx(_, { path: 'classifica', element: e.jsx(Ht, {}) }),
                      e.jsx(_, { path: 'stats', element: e.jsx(qt, {}) }),
                      e.jsx(_, { path: 'booking', element: e.jsx(Gt, {}) }),
                      e.jsx(_, { path: 'extra', element: e.jsx(Zt, {}) }),
                      e.jsx(_, { path: 'players', element: e.jsx(Jt, {}) }),
                      e.jsx(_, { path: 'matches/create', element: e.jsx(Kt, {}) }),
                      e.jsx(_, { path: 'tournaments', element: e.jsx(Yt, {}) }),
                      e.jsx(_, { path: 'admin/bookings', element: e.jsx(Qt, {}) }),
                      e.jsx(_, { path: 'profile', element: e.jsx(Xt, {}) }),
                    ],
                  }),
                  e.jsx(_, { path: '*', element: e.jsx(W, { to: '/dashboard', replace: !0 }) }),
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
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((t) => {
        (console.log('✅ SW registered: ', t),
          t.addEventListener('updatefound', () => {
            const s = t.installing;
            s.addEventListener('statechange', () => {
              s.state === 'installed' &&
                navigator.serviceWorker.controller &&
                console.log('🔄 New content available! Please refresh.');
            });
          }));
      })
      .catch((t) => {
        console.log('❌ SW registration failed: ', t);
      });
  });
const Me = document.getElementById('root');
if (!Me) throw new Error('Elemento #root non trovato in index.html');
ot.createRoot(Me).render(e.jsx(P.StrictMode, { children: e.jsx(es, {}) }));
export {
  I as D,
  Mt as L,
  Wt as P,
  B as _,
  ut as a,
  dt as b,
  ht as c,
  xt as d,
  Be as e,
  St as f,
  is as g,
  Y as h,
  os as i,
  e as j,
  _e as k,
  pt as l,
  bt as m,
  At as n,
  L as o,
  R as p,
  ee as q,
  kt as r,
  q as s,
  Rt as t,
  G as u,
  as as v,
  ns as w,
};
