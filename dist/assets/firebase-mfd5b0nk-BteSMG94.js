const Dd = () => {};
var tc = {};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ku = function (n) {
    const e = [];
    let t = 0;
    for (let r = 0; r < n.length; r++) {
      let s = n.charCodeAt(r);
      s < 128
        ? (e[t++] = s)
        : s < 2048
          ? ((e[t++] = (s >> 6) | 192), (e[t++] = (s & 63) | 128))
          : (s & 64512) === 55296 && r + 1 < n.length && (n.charCodeAt(r + 1) & 64512) === 56320
            ? ((s = 65536 + ((s & 1023) << 10) + (n.charCodeAt(++r) & 1023)),
              (e[t++] = (s >> 18) | 240),
              (e[t++] = ((s >> 12) & 63) | 128),
              (e[t++] = ((s >> 6) & 63) | 128),
              (e[t++] = (s & 63) | 128))
            : ((e[t++] = (s >> 12) | 224),
              (e[t++] = ((s >> 6) & 63) | 128),
              (e[t++] = (s & 63) | 128));
    }
    return e;
  },
  Od = function (n) {
    const e = [];
    let t = 0,
      r = 0;
    for (; t < n.length; ) {
      const s = n[t++];
      if (s < 128) e[r++] = String.fromCharCode(s);
      else if (s > 191 && s < 224) {
        const o = n[t++];
        e[r++] = String.fromCharCode(((s & 31) << 6) | (o & 63));
      } else if (s > 239 && s < 365) {
        const o = n[t++],
          a = n[t++],
          u = n[t++],
          h = (((s & 7) << 18) | ((o & 63) << 12) | ((a & 63) << 6) | (u & 63)) - 65536;
        ((e[r++] = String.fromCharCode(55296 + (h >> 10))),
          (e[r++] = String.fromCharCode(56320 + (h & 1023))));
      } else {
        const o = n[t++],
          a = n[t++];
        e[r++] = String.fromCharCode(((s & 15) << 12) | ((o & 63) << 6) | (a & 63));
      }
    }
    return e.join('');
  },
  Nu = {
    byteToCharMap_: null,
    charToByteMap_: null,
    byteToCharMapWebSafe_: null,
    charToByteMapWebSafe_: null,
    ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    get ENCODED_VALS() {
      return this.ENCODED_VALS_BASE + '+/=';
    },
    get ENCODED_VALS_WEBSAFE() {
      return this.ENCODED_VALS_BASE + '-_.';
    },
    HAS_NATIVE_SUPPORT: typeof atob == 'function',
    encodeByteArray(n, e) {
      if (!Array.isArray(n)) throw Error('encodeByteArray takes an array as a parameter');
      this.init_();
      const t = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_,
        r = [];
      for (let s = 0; s < n.length; s += 3) {
        const o = n[s],
          a = s + 1 < n.length,
          u = a ? n[s + 1] : 0,
          h = s + 2 < n.length,
          d = h ? n[s + 2] : 0,
          p = o >> 2,
          E = ((o & 3) << 4) | (u >> 4);
        let y = ((u & 15) << 2) | (d >> 6),
          C = d & 63;
        (h || ((C = 64), a || (y = 64)), r.push(t[p], t[E], t[y], t[C]));
      }
      return r.join('');
    },
    encodeString(n, e) {
      return this.HAS_NATIVE_SUPPORT && !e ? btoa(n) : this.encodeByteArray(ku(n), e);
    },
    decodeString(n, e) {
      return this.HAS_NATIVE_SUPPORT && !e ? atob(n) : Od(this.decodeStringToByteArray(n, e));
    },
    decodeStringToByteArray(n, e) {
      this.init_();
      const t = e ? this.charToByteMapWebSafe_ : this.charToByteMap_,
        r = [];
      for (let s = 0; s < n.length; ) {
        const o = t[n.charAt(s++)],
          u = s < n.length ? t[n.charAt(s)] : 0;
        ++s;
        const d = s < n.length ? t[n.charAt(s)] : 64;
        ++s;
        const E = s < n.length ? t[n.charAt(s)] : 64;
        if ((++s, o == null || u == null || d == null || E == null)) throw new Md();
        const y = (o << 2) | (u >> 4);
        if ((r.push(y), d !== 64)) {
          const C = ((u << 4) & 240) | (d >> 2);
          if ((r.push(C), E !== 64)) {
            const b = ((d << 6) & 192) | E;
            r.push(b);
          }
        }
      }
      return r;
    },
    init_() {
      if (!this.byteToCharMap_) {
        ((this.byteToCharMap_ = {}),
          (this.charToByteMap_ = {}),
          (this.byteToCharMapWebSafe_ = {}),
          (this.charToByteMapWebSafe_ = {}));
        for (let n = 0; n < this.ENCODED_VALS.length; n++)
          ((this.byteToCharMap_[n] = this.ENCODED_VALS.charAt(n)),
            (this.charToByteMap_[this.byteToCharMap_[n]] = n),
            (this.byteToCharMapWebSafe_[n] = this.ENCODED_VALS_WEBSAFE.charAt(n)),
            (this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]] = n),
            n >= this.ENCODED_VALS_BASE.length &&
              ((this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)] = n),
              (this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)] = n)));
      }
    },
  };
class Md extends Error {
  constructor() {
    (super(...arguments), (this.name = 'DecodeBase64StringError'));
  }
}
const Ld = function (n) {
    const e = ku(n);
    return Nu.encodeByteArray(e, !0);
  },
  Du = function (n) {
    return Ld(n).replace(/\./g, '');
  },
  Ou = function (n) {
    try {
      return Nu.decodeString(n, !0);
    } catch (e) {
      console.error('base64Decode failed: ', e);
    }
    return null;
  };
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function xd() {
  if (typeof self < 'u') return self;
  if (typeof window < 'u') return window;
  if (typeof global < 'u') return global;
  throw new Error('Unable to locate global object.');
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Fd = () => xd().__FIREBASE_DEFAULTS__,
  Ud = () => {
    if (typeof process > 'u' || typeof tc > 'u') return;
    const n = tc.__FIREBASE_DEFAULTS__;
    if (n) return JSON.parse(n);
  },
  Bd = () => {
    if (typeof document > 'u') return;
    let n;
    try {
      n = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
    } catch {
      return;
    }
    const e = n && Ou(n[1]);
    return e && JSON.parse(e);
  },
  ws = () => {
    try {
      return Dd() || Fd() || Ud() || Bd();
    } catch (n) {
      console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);
      return;
    }
  },
  qd = (n) => ws()?.emulatorHosts?.[n],
  Mu = () => ws()?.config,
  Lu = (n) => ws()?.[`_${n}`];
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class jd {
  constructor() {
    ((this.reject = () => {}),
      (this.resolve = () => {}),
      (this.promise = new Promise((e, t) => {
        ((this.resolve = e), (this.reject = t));
      })));
  }
  wrapCallback(e) {
    return (t, r) => {
      (t ? this.reject(t) : this.resolve(r),
        typeof e == 'function' && (this.promise.catch(() => {}), e.length === 1 ? e(t) : e(t, r)));
    };
  }
}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function gn(n) {
  try {
    return (n.startsWith('http://') || n.startsWith('https://') ? new URL(n).hostname : n).endsWith(
      '.cloudworkstations.dev'
    );
  } catch {
    return !1;
  }
}
async function xu(n) {
  return (await fetch(n, { credentials: 'include' })).ok;
}
const Wn = {};
function $d() {
  const n = { prod: [], emulator: [] };
  for (const e of Object.keys(Wn)) Wn[e] ? n.emulator.push(e) : n.prod.push(e);
  return n;
}
function zd(n) {
  let e = document.getElementById(n),
    t = !1;
  return (
    e || ((e = document.createElement('div')), e.setAttribute('id', n), (t = !0)),
    { created: t, element: e }
  );
}
let nc = !1;
function Hd(n, e) {
  if (
    typeof window > 'u' ||
    typeof document > 'u' ||
    !gn(window.location.host) ||
    Wn[n] === e ||
    Wn[n] ||
    nc
  )
    return;
  Wn[n] = e;
  function t(y) {
    return `__firebase__banner__${y}`;
  }
  const r = '__firebase__banner',
    o = $d().prod.length > 0;
  function a() {
    const y = document.getElementById(r);
    y && y.remove();
  }
  function u(y) {
    ((y.style.display = 'flex'),
      (y.style.background = '#7faaf0'),
      (y.style.position = 'fixed'),
      (y.style.bottom = '5px'),
      (y.style.left = '5px'),
      (y.style.padding = '.5em'),
      (y.style.borderRadius = '5px'),
      (y.style.alignItems = 'center'));
  }
  function h(y, C) {
    (y.setAttribute('width', '24'),
      y.setAttribute('id', C),
      y.setAttribute('height', '24'),
      y.setAttribute('viewBox', '0 0 24 24'),
      y.setAttribute('fill', 'none'),
      (y.style.marginLeft = '-6px'));
  }
  function d() {
    const y = document.createElement('span');
    return (
      (y.style.cursor = 'pointer'),
      (y.style.marginLeft = '16px'),
      (y.style.fontSize = '24px'),
      (y.innerHTML = ' &times;'),
      (y.onclick = () => {
        ((nc = !0), a());
      }),
      y
    );
  }
  function p(y, C) {
    (y.setAttribute('id', C),
      (y.innerText = 'Learn more'),
      (y.href = 'https://firebase.google.com/docs/studio/preview-apps#preview-backend'),
      y.setAttribute('target', '__blank'),
      (y.style.paddingLeft = '5px'),
      (y.style.textDecoration = 'underline'));
  }
  function E() {
    const y = zd(r),
      C = t('text'),
      b = document.getElementById(C) || document.createElement('span'),
      O = t('learnmore'),
      N = document.getElementById(O) || document.createElement('a'),
      z = t('preprendIcon'),
      B =
        document.getElementById(z) || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (y.created) {
      const H = y.element;
      (u(H), p(N, O));
      const ue = d();
      (h(B, z), H.append(B, b, N, ue), document.body.appendChild(H));
    }
    (o
      ? ((b.innerText = 'Preview backend disconnected.'),
        (B.innerHTML = `<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`))
      : ((B.innerHTML = `<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`),
        (b.innerText = 'Preview backend running in this workspace.')),
      b.setAttribute('id', C));
  }
  document.readyState === 'loading' ? window.addEventListener('DOMContentLoaded', E) : E();
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Te() {
  return typeof navigator < 'u' && typeof navigator.userAgent == 'string'
    ? navigator.userAgent
    : '';
}
function Wd() {
  return (
    typeof window < 'u' &&
    !!(window.cordova || window.phonegap || window.PhoneGap) &&
    /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Te())
  );
}
function Gd() {
  const n = ws()?.forceEnvironment;
  if (n === 'node') return !0;
  if (n === 'browser') return !1;
  try {
    return Object.prototype.toString.call(global.process) === '[object process]';
  } catch {
    return !1;
  }
}
function Kd() {
  return typeof navigator < 'u' && navigator.userAgent === 'Cloudflare-Workers';
}
function Qd() {
  const n =
    typeof chrome == 'object'
      ? chrome.runtime
      : typeof browser == 'object'
        ? browser.runtime
        : void 0;
  return typeof n == 'object' && n.id !== void 0;
}
function Yd() {
  return typeof navigator == 'object' && navigator.product === 'ReactNative';
}
function Xd() {
  const n = Te();
  return n.indexOf('MSIE ') >= 0 || n.indexOf('Trident/') >= 0;
}
function Jd() {
  return (
    !Gd() &&
    !!navigator.userAgent &&
    navigator.userAgent.includes('Safari') &&
    !navigator.userAgent.includes('Chrome')
  );
}
function Zd() {
  try {
    return typeof indexedDB == 'object';
  } catch {
    return !1;
  }
}
function ef() {
  return new Promise((n, e) => {
    try {
      let t = !0;
      const r = 'validate-browser-context-for-indexeddb-analytics-module',
        s = self.indexedDB.open(r);
      ((s.onsuccess = () => {
        (s.result.close(), t || self.indexedDB.deleteDatabase(r), n(!0));
      }),
        (s.onupgradeneeded = () => {
          t = !1;
        }),
        (s.onerror = () => {
          e(s.error?.message || '');
        }));
    } catch (t) {
      e(t);
    }
  });
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const tf = 'FirebaseError';
class ot extends Error {
  constructor(e, t, r) {
    (super(t),
      (this.code = e),
      (this.customData = r),
      (this.name = tf),
      Object.setPrototypeOf(this, ot.prototype),
      Error.captureStackTrace && Error.captureStackTrace(this, lr.prototype.create));
  }
}
class lr {
  constructor(e, t, r) {
    ((this.service = e), (this.serviceName = t), (this.errors = r));
  }
  create(e, ...t) {
    const r = t[0] || {},
      s = `${this.service}/${e}`,
      o = this.errors[e],
      a = o ? nf(o, r) : 'Error',
      u = `${this.serviceName}: ${a} (${s}).`;
    return new ot(s, u, r);
  }
}
function nf(n, e) {
  return n.replace(rf, (t, r) => {
    const s = e[r];
    return s != null ? String(s) : `<${r}?>`;
  });
}
const rf = /\{\$([^}]+)}/g;
function sf(n) {
  for (const e in n) if (Object.prototype.hasOwnProperty.call(n, e)) return !1;
  return !0;
}
function qt(n, e) {
  if (n === e) return !0;
  const t = Object.keys(n),
    r = Object.keys(e);
  for (const s of t) {
    if (!r.includes(s)) return !1;
    const o = n[s],
      a = e[s];
    if (rc(o) && rc(a)) {
      if (!qt(o, a)) return !1;
    } else if (o !== a) return !1;
  }
  for (const s of r) if (!t.includes(s)) return !1;
  return !0;
}
function rc(n) {
  return n !== null && typeof n == 'object';
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function hr(n) {
  const e = [];
  for (const [t, r] of Object.entries(n))
    Array.isArray(r)
      ? r.forEach((s) => {
          e.push(encodeURIComponent(t) + '=' + encodeURIComponent(s));
        })
      : e.push(encodeURIComponent(t) + '=' + encodeURIComponent(r));
  return e.length ? '&' + e.join('&') : '';
}
function Bn(n) {
  const e = {};
  return (
    n
      .replace(/^\?/, '')
      .split('&')
      .forEach((r) => {
        if (r) {
          const [s, o] = r.split('=');
          e[decodeURIComponent(s)] = decodeURIComponent(o);
        }
      }),
    e
  );
}
function qn(n) {
  const e = n.indexOf('?');
  if (!e) return '';
  const t = n.indexOf('#', e);
  return n.substring(e, t > 0 ? t : void 0);
}
function of(n, e) {
  const t = new af(n, e);
  return t.subscribe.bind(t);
}
class af {
  constructor(e, t) {
    ((this.observers = []),
      (this.unsubscribes = []),
      (this.observerCount = 0),
      (this.task = Promise.resolve()),
      (this.finalized = !1),
      (this.onNoObservers = t),
      this.task
        .then(() => {
          e(this);
        })
        .catch((r) => {
          this.error(r);
        }));
  }
  next(e) {
    this.forEachObserver((t) => {
      t.next(e);
    });
  }
  error(e) {
    (this.forEachObserver((t) => {
      t.error(e);
    }),
      this.close(e));
  }
  complete() {
    (this.forEachObserver((e) => {
      e.complete();
    }),
      this.close());
  }
  subscribe(e, t, r) {
    let s;
    if (e === void 0 && t === void 0 && r === void 0) throw new Error('Missing Observer.');
    (cf(e, ['next', 'error', 'complete']) ? (s = e) : (s = { next: e, error: t, complete: r }),
      s.next === void 0 && (s.next = Ii),
      s.error === void 0 && (s.error = Ii),
      s.complete === void 0 && (s.complete = Ii));
    const o = this.unsubscribeOne.bind(this, this.observers.length);
    return (
      this.finalized &&
        this.task.then(() => {
          try {
            this.finalError ? s.error(this.finalError) : s.complete();
          } catch {}
        }),
      this.observers.push(s),
      o
    );
  }
  unsubscribeOne(e) {
    this.observers === void 0 ||
      this.observers[e] === void 0 ||
      (delete this.observers[e],
      (this.observerCount -= 1),
      this.observerCount === 0 && this.onNoObservers !== void 0 && this.onNoObservers(this));
  }
  forEachObserver(e) {
    if (!this.finalized) for (let t = 0; t < this.observers.length; t++) this.sendOne(t, e);
  }
  sendOne(e, t) {
    this.task.then(() => {
      if (this.observers !== void 0 && this.observers[e] !== void 0)
        try {
          t(this.observers[e]);
        } catch (r) {
          typeof console < 'u' && console.error && console.error(r);
        }
    });
  }
  close(e) {
    this.finalized ||
      ((this.finalized = !0),
      e !== void 0 && (this.finalError = e),
      this.task.then(() => {
        ((this.observers = void 0), (this.onNoObservers = void 0));
      }));
  }
}
function cf(n, e) {
  if (typeof n != 'object' || n === null) return !1;
  for (const t of e) if (t in n && typeof n[t] == 'function') return !0;
  return !1;
}
function Ii() {}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function re(n) {
  return n && n._delegate ? n._delegate : n;
}
class jt {
  constructor(e, t, r) {
    ((this.name = e),
      (this.instanceFactory = t),
      (this.type = r),
      (this.multipleInstances = !1),
      (this.serviceProps = {}),
      (this.instantiationMode = 'LAZY'),
      (this.onInstanceCreated = null));
  }
  setInstantiationMode(e) {
    return ((this.instantiationMode = e), this);
  }
  setMultipleInstances(e) {
    return ((this.multipleInstances = e), this);
  }
  setServiceProps(e) {
    return ((this.serviceProps = e), this);
  }
  setInstanceCreatedCallback(e) {
    return ((this.onInstanceCreated = e), this);
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Lt = '[DEFAULT]';
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class uf {
  constructor(e, t) {
    ((this.name = e),
      (this.container = t),
      (this.component = null),
      (this.instances = new Map()),
      (this.instancesDeferred = new Map()),
      (this.instancesOptions = new Map()),
      (this.onInitCallbacks = new Map()));
  }
  get(e) {
    const t = this.normalizeInstanceIdentifier(e);
    if (!this.instancesDeferred.has(t)) {
      const r = new jd();
      if ((this.instancesDeferred.set(t, r), this.isInitialized(t) || this.shouldAutoInitialize()))
        try {
          const s = this.getOrInitializeService({ instanceIdentifier: t });
          s && r.resolve(s);
        } catch {}
    }
    return this.instancesDeferred.get(t).promise;
  }
  getImmediate(e) {
    const t = this.normalizeInstanceIdentifier(e?.identifier),
      r = e?.optional ?? !1;
    if (this.isInitialized(t) || this.shouldAutoInitialize())
      try {
        return this.getOrInitializeService({ instanceIdentifier: t });
      } catch (s) {
        if (r) return null;
        throw s;
      }
    else {
      if (r) return null;
      throw Error(`Service ${this.name} is not available`);
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(e) {
    if (e.name !== this.name)
      throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
    if (this.component) throw Error(`Component for ${this.name} has already been provided`);
    if (((this.component = e), !!this.shouldAutoInitialize())) {
      if (hf(e))
        try {
          this.getOrInitializeService({ instanceIdentifier: Lt });
        } catch {}
      for (const [t, r] of this.instancesDeferred.entries()) {
        const s = this.normalizeInstanceIdentifier(t);
        try {
          const o = this.getOrInitializeService({ instanceIdentifier: s });
          r.resolve(o);
        } catch {}
      }
    }
  }
  clearInstance(e = Lt) {
    (this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e));
  }
  async delete() {
    const e = Array.from(this.instances.values());
    await Promise.all([
      ...e.filter((t) => 'INTERNAL' in t).map((t) => t.INTERNAL.delete()),
      ...e.filter((t) => '_delete' in t).map((t) => t._delete()),
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(e = Lt) {
    return this.instances.has(e);
  }
  getOptions(e = Lt) {
    return this.instancesOptions.get(e) || {};
  }
  initialize(e = {}) {
    const { options: t = {} } = e,
      r = this.normalizeInstanceIdentifier(e.instanceIdentifier);
    if (this.isInitialized(r)) throw Error(`${this.name}(${r}) has already been initialized`);
    if (!this.isComponentSet()) throw Error(`Component ${this.name} has not been registered yet`);
    const s = this.getOrInitializeService({ instanceIdentifier: r, options: t });
    for (const [o, a] of this.instancesDeferred.entries()) {
      const u = this.normalizeInstanceIdentifier(o);
      r === u && a.resolve(s);
    }
    return s;
  }
  onInit(e, t) {
    const r = this.normalizeInstanceIdentifier(t),
      s = this.onInitCallbacks.get(r) ?? new Set();
    (s.add(e), this.onInitCallbacks.set(r, s));
    const o = this.instances.get(r);
    return (
      o && e(o, r),
      () => {
        s.delete(e);
      }
    );
  }
  invokeOnInitCallbacks(e, t) {
    const r = this.onInitCallbacks.get(t);
    if (r)
      for (const s of r)
        try {
          s(e, t);
        } catch {}
  }
  getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
    let r = this.instances.get(e);
    if (
      !r &&
      this.component &&
      ((r = this.component.instanceFactory(this.container, {
        instanceIdentifier: lf(e),
        options: t,
      })),
      this.instances.set(e, r),
      this.instancesOptions.set(e, t),
      this.invokeOnInitCallbacks(r, e),
      this.component.onInstanceCreated)
    )
      try {
        this.component.onInstanceCreated(this.container, e, r);
      } catch {}
    return r || null;
  }
  normalizeInstanceIdentifier(e = Lt) {
    return this.component ? (this.component.multipleInstances ? e : Lt) : e;
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== 'EXPLICIT';
  }
}
function lf(n) {
  return n === Lt ? void 0 : n;
}
function hf(n) {
  return n.instantiationMode === 'EAGER';
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class df {
  constructor(e) {
    ((this.name = e), (this.providers = new Map()));
  }
  addComponent(e) {
    const t = this.getProvider(e.name);
    if (t.isComponentSet())
      throw new Error(`Component ${e.name} has already been registered with ${this.name}`);
    t.setComponent(e);
  }
  addOrOverwriteComponent(e) {
    (this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name),
      this.addComponent(e));
  }
  getProvider(e) {
    if (this.providers.has(e)) return this.providers.get(e);
    const t = new uf(e, this);
    return (this.providers.set(e, t), t);
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var q;
(function (n) {
  ((n[(n.DEBUG = 0)] = 'DEBUG'),
    (n[(n.VERBOSE = 1)] = 'VERBOSE'),
    (n[(n.INFO = 2)] = 'INFO'),
    (n[(n.WARN = 3)] = 'WARN'),
    (n[(n.ERROR = 4)] = 'ERROR'),
    (n[(n.SILENT = 5)] = 'SILENT'));
})(q || (q = {}));
const ff = {
    debug: q.DEBUG,
    verbose: q.VERBOSE,
    info: q.INFO,
    warn: q.WARN,
    error: q.ERROR,
    silent: q.SILENT,
  },
  pf = q.INFO,
  mf = {
    [q.DEBUG]: 'log',
    [q.VERBOSE]: 'log',
    [q.INFO]: 'info',
    [q.WARN]: 'warn',
    [q.ERROR]: 'error',
  },
  gf = (n, e, ...t) => {
    if (e < n.logLevel) return;
    const r = new Date().toISOString(),
      s = mf[e];
    if (s) console[s](`[${r}]  ${n.name}:`, ...t);
    else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);
  };
class no {
  constructor(e) {
    ((this.name = e),
      (this._logLevel = pf),
      (this._logHandler = gf),
      (this._userLogHandler = null));
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(e) {
    if (!(e in q)) throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
    this._logLevel = e;
  }
  setLogLevel(e) {
    this._logLevel = typeof e == 'string' ? ff[e] : e;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(e) {
    if (typeof e != 'function')
      throw new TypeError('Value assigned to `logHandler` must be a function');
    this._logHandler = e;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(e) {
    this._userLogHandler = e;
  }
  debug(...e) {
    (this._userLogHandler && this._userLogHandler(this, q.DEBUG, ...e),
      this._logHandler(this, q.DEBUG, ...e));
  }
  log(...e) {
    (this._userLogHandler && this._userLogHandler(this, q.VERBOSE, ...e),
      this._logHandler(this, q.VERBOSE, ...e));
  }
  info(...e) {
    (this._userLogHandler && this._userLogHandler(this, q.INFO, ...e),
      this._logHandler(this, q.INFO, ...e));
  }
  warn(...e) {
    (this._userLogHandler && this._userLogHandler(this, q.WARN, ...e),
      this._logHandler(this, q.WARN, ...e));
  }
  error(...e) {
    (this._userLogHandler && this._userLogHandler(this, q.ERROR, ...e),
      this._logHandler(this, q.ERROR, ...e));
  }
}
const _f = (n, e) => e.some((t) => n instanceof t);
let sc, ic;
function yf() {
  return sc || (sc = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction]);
}
function Ef() {
  return (
    ic ||
    (ic = [
      IDBCursor.prototype.advance,
      IDBCursor.prototype.continue,
      IDBCursor.prototype.continuePrimaryKey,
    ])
  );
}
const Fu = new WeakMap(),
  Ni = new WeakMap(),
  Uu = new WeakMap(),
  Ti = new WeakMap(),
  ro = new WeakMap();
function If(n) {
  const e = new Promise((t, r) => {
    const s = () => {
        (n.removeEventListener('success', o), n.removeEventListener('error', a));
      },
      o = () => {
        (t(Et(n.result)), s());
      },
      a = () => {
        (r(n.error), s());
      };
    (n.addEventListener('success', o), n.addEventListener('error', a));
  });
  return (
    e
      .then((t) => {
        t instanceof IDBCursor && Fu.set(t, n);
      })
      .catch(() => {}),
    ro.set(e, n),
    e
  );
}
function Tf(n) {
  if (Ni.has(n)) return;
  const e = new Promise((t, r) => {
    const s = () => {
        (n.removeEventListener('complete', o),
          n.removeEventListener('error', a),
          n.removeEventListener('abort', a));
      },
      o = () => {
        (t(), s());
      },
      a = () => {
        (r(n.error || new DOMException('AbortError', 'AbortError')), s());
      };
    (n.addEventListener('complete', o),
      n.addEventListener('error', a),
      n.addEventListener('abort', a));
  });
  Ni.set(n, e);
}
let Di = {
  get(n, e, t) {
    if (n instanceof IDBTransaction) {
      if (e === 'done') return Ni.get(n);
      if (e === 'objectStoreNames') return n.objectStoreNames || Uu.get(n);
      if (e === 'store')
        return t.objectStoreNames[1] ? void 0 : t.objectStore(t.objectStoreNames[0]);
    }
    return Et(n[e]);
  },
  set(n, e, t) {
    return ((n[e] = t), !0);
  },
  has(n, e) {
    return n instanceof IDBTransaction && (e === 'done' || e === 'store') ? !0 : e in n;
  },
};
function vf(n) {
  Di = n(Di);
}
function wf(n) {
  return n === IDBDatabase.prototype.transaction &&
    !('objectStoreNames' in IDBTransaction.prototype)
    ? function (e, ...t) {
        const r = n.call(vi(this), e, ...t);
        return (Uu.set(r, e.sort ? e.sort() : [e]), Et(r));
      }
    : Ef().includes(n)
      ? function (...e) {
          return (n.apply(vi(this), e), Et(Fu.get(this)));
        }
      : function (...e) {
          return Et(n.apply(vi(this), e));
        };
}
function Af(n) {
  return typeof n == 'function'
    ? wf(n)
    : (n instanceof IDBTransaction && Tf(n), _f(n, yf()) ? new Proxy(n, Di) : n);
}
function Et(n) {
  if (n instanceof IDBRequest) return If(n);
  if (Ti.has(n)) return Ti.get(n);
  const e = Af(n);
  return (e !== n && (Ti.set(n, e), ro.set(e, n)), e);
}
const vi = (n) => ro.get(n);
function Rf(n, e, { blocked: t, upgrade: r, blocking: s, terminated: o } = {}) {
  const a = indexedDB.open(n, e),
    u = Et(a);
  return (
    r &&
      a.addEventListener('upgradeneeded', (h) => {
        r(Et(a.result), h.oldVersion, h.newVersion, Et(a.transaction), h);
      }),
    t && a.addEventListener('blocked', (h) => t(h.oldVersion, h.newVersion, h)),
    u
      .then((h) => {
        (o && h.addEventListener('close', () => o()),
          s && h.addEventListener('versionchange', (d) => s(d.oldVersion, d.newVersion, d)));
      })
      .catch(() => {}),
    u
  );
}
const Sf = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
  Pf = ['put', 'add', 'delete', 'clear'],
  wi = new Map();
function oc(n, e) {
  if (!(n instanceof IDBDatabase && !(e in n) && typeof e == 'string')) return;
  if (wi.get(e)) return wi.get(e);
  const t = e.replace(/FromIndex$/, ''),
    r = e !== t,
    s = Pf.includes(t);
  if (!(t in (r ? IDBIndex : IDBObjectStore).prototype) || !(s || Sf.includes(t))) return;
  const o = async function (a, ...u) {
    const h = this.transaction(a, s ? 'readwrite' : 'readonly');
    let d = h.store;
    return (r && (d = d.index(u.shift())), (await Promise.all([d[t](...u), s && h.done]))[0]);
  };
  return (wi.set(e, o), o);
}
vf((n) => ({
  ...n,
  get: (e, t, r) => oc(e, t) || n.get(e, t, r),
  has: (e, t) => !!oc(e, t) || n.has(e, t),
}));
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Cf {
  constructor(e) {
    this.container = e;
  }
  getPlatformInfoString() {
    return this.container
      .getProviders()
      .map((t) => {
        if (bf(t)) {
          const r = t.getImmediate();
          return `${r.library}/${r.version}`;
        } else return null;
      })
      .filter((t) => t)
      .join(' ');
  }
}
function bf(n) {
  return n.getComponent()?.type === 'VERSION';
}
const Oi = '@firebase/app',
  ac = '0.14.2';
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const tt = new no('@firebase/app'),
  Vf = '@firebase/app-compat',
  kf = '@firebase/analytics-compat',
  Nf = '@firebase/analytics',
  Df = '@firebase/app-check-compat',
  Of = '@firebase/app-check',
  Mf = '@firebase/auth',
  Lf = '@firebase/auth-compat',
  xf = '@firebase/database',
  Ff = '@firebase/data-connect',
  Uf = '@firebase/database-compat',
  Bf = '@firebase/functions',
  qf = '@firebase/functions-compat',
  jf = '@firebase/installations',
  $f = '@firebase/installations-compat',
  zf = '@firebase/messaging',
  Hf = '@firebase/messaging-compat',
  Wf = '@firebase/performance',
  Gf = '@firebase/performance-compat',
  Kf = '@firebase/remote-config',
  Qf = '@firebase/remote-config-compat',
  Yf = '@firebase/storage',
  Xf = '@firebase/storage-compat',
  Jf = '@firebase/firestore',
  Zf = '@firebase/ai',
  ep = '@firebase/firestore-compat',
  tp = 'firebase',
  np = '12.2.0';
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Mi = '[DEFAULT]',
  rp = {
    [Oi]: 'fire-core',
    [Vf]: 'fire-core-compat',
    [Nf]: 'fire-analytics',
    [kf]: 'fire-analytics-compat',
    [Of]: 'fire-app-check',
    [Df]: 'fire-app-check-compat',
    [Mf]: 'fire-auth',
    [Lf]: 'fire-auth-compat',
    [xf]: 'fire-rtdb',
    [Ff]: 'fire-data-connect',
    [Uf]: 'fire-rtdb-compat',
    [Bf]: 'fire-fn',
    [qf]: 'fire-fn-compat',
    [jf]: 'fire-iid',
    [$f]: 'fire-iid-compat',
    [zf]: 'fire-fcm',
    [Hf]: 'fire-fcm-compat',
    [Wf]: 'fire-perf',
    [Gf]: 'fire-perf-compat',
    [Kf]: 'fire-rc',
    [Qf]: 'fire-rc-compat',
    [Yf]: 'fire-gcs',
    [Xf]: 'fire-gcs-compat',
    [Jf]: 'fire-fst',
    [ep]: 'fire-fst-compat',
    [Zf]: 'fire-vertex',
    'fire-js': 'fire-js',
    [tp]: 'fire-js-all',
  };
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Jn = new Map(),
  sp = new Map(),
  Li = new Map();
function cc(n, e) {
  try {
    n.container.addComponent(e);
  } catch (t) {
    tt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`, t);
  }
}
function un(n) {
  const e = n.name;
  if (Li.has(e)) return (tt.debug(`There were multiple attempts to register component ${e}.`), !1);
  Li.set(e, n);
  for (const t of Jn.values()) cc(t, n);
  for (const t of sp.values()) cc(t, n);
  return !0;
}
function so(n, e) {
  const t = n.container.getProvider('heartbeat').getImmediate({ optional: !0 });
  return (t && t.triggerHeartbeat(), n.container.getProvider(e));
}
function Ae(n) {
  return n == null ? !1 : n.settings !== void 0;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ip = {
    'no-app': "No Firebase App '{$appName}' has been created - call initializeApp() first",
    'bad-app-name': "Illegal App name: '{$appName}'",
    'duplicate-app':
      "Firebase App named '{$appName}' already exists with different options or config",
    'app-deleted': "Firebase App named '{$appName}' already deleted",
    'server-app-deleted': 'Firebase Server App has been deleted',
    'no-options': 'Need to provide options, when not being deployed to hosting via source.',
    'invalid-app-argument':
      'firebase.{$appName}() takes either no argument or a Firebase App instance.',
    'invalid-log-argument': 'First argument to `onLog` must be null or a function.',
    'idb-open': 'Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.',
    'idb-get': 'Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.',
    'idb-set': 'Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.',
    'idb-delete':
      'Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.',
    'finalization-registry-not-supported':
      'FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.',
    'invalid-server-app-environment': 'FirebaseServerApp is not for use in browser environments.',
  },
  It = new lr('app', 'Firebase', ip);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class op {
  constructor(e, t, r) {
    ((this._isDeleted = !1),
      (this._options = { ...e }),
      (this._config = { ...t }),
      (this._name = t.name),
      (this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled),
      (this._container = r),
      this.container.addComponent(new jt('app', () => this, 'PUBLIC')));
  }
  get automaticDataCollectionEnabled() {
    return (this.checkDestroyed(), this._automaticDataCollectionEnabled);
  }
  set automaticDataCollectionEnabled(e) {
    (this.checkDestroyed(), (this._automaticDataCollectionEnabled = e));
  }
  get name() {
    return (this.checkDestroyed(), this._name);
  }
  get options() {
    return (this.checkDestroyed(), this._options);
  }
  get config() {
    return (this.checkDestroyed(), this._config);
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(e) {
    this._isDeleted = e;
  }
  checkDestroyed() {
    if (this.isDeleted) throw It.create('app-deleted', { appName: this._name });
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const _n = np;
function ap(n, e = {}) {
  let t = n;
  typeof e != 'object' && (e = { name: e });
  const r = { name: Mi, automaticDataCollectionEnabled: !0, ...e },
    s = r.name;
  if (typeof s != 'string' || !s) throw It.create('bad-app-name', { appName: String(s) });
  if ((t || (t = Mu()), !t)) throw It.create('no-options');
  const o = Jn.get(s);
  if (o) {
    if (qt(t, o.options) && qt(r, o.config)) return o;
    throw It.create('duplicate-app', { appName: s });
  }
  const a = new df(s);
  for (const h of Li.values()) a.addComponent(h);
  const u = new op(t, r, a);
  return (Jn.set(s, u), u);
}
function cp(n = Mi) {
  const e = Jn.get(n);
  if (!e && n === Mi && Mu()) return ap();
  if (!e) throw It.create('no-app', { appName: n });
  return e;
}
function qE() {
  return Array.from(Jn.values());
}
function Tt(n, e, t) {
  let r = rp[n] ?? n;
  t && (r += `-${t}`);
  const s = r.match(/\s|\//),
    o = e.match(/\s|\//);
  if (s || o) {
    const a = [`Unable to register library "${r}" with version "${e}":`];
    (s && a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),
      s && o && a.push('and'),
      o && a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),
      tt.warn(a.join(' ')));
    return;
  }
  un(new jt(`${r}-version`, () => ({ library: r, version: e }), 'VERSION'));
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const up = 'firebase-heartbeat-database',
  lp = 1,
  Zn = 'firebase-heartbeat-store';
let Ai = null;
function Bu() {
  return (
    Ai ||
      (Ai = Rf(up, lp, {
        upgrade: (n, e) => {
          switch (e) {
            case 0:
              try {
                n.createObjectStore(Zn);
              } catch (t) {
                console.warn(t);
              }
          }
        },
      }).catch((n) => {
        throw It.create('idb-open', { originalErrorMessage: n.message });
      })),
    Ai
  );
}
async function hp(n) {
  try {
    const t = (await Bu()).transaction(Zn),
      r = await t.objectStore(Zn).get(qu(n));
    return (await t.done, r);
  } catch (e) {
    if (e instanceof ot) tt.warn(e.message);
    else {
      const t = It.create('idb-get', { originalErrorMessage: e?.message });
      tt.warn(t.message);
    }
  }
}
async function uc(n, e) {
  try {
    const r = (await Bu()).transaction(Zn, 'readwrite');
    (await r.objectStore(Zn).put(e, qu(n)), await r.done);
  } catch (t) {
    if (t instanceof ot) tt.warn(t.message);
    else {
      const r = It.create('idb-set', { originalErrorMessage: t?.message });
      tt.warn(r.message);
    }
  }
}
function qu(n) {
  return `${n.name}!${n.options.appId}`;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const dp = 1024,
  fp = 30;
class pp {
  constructor(e) {
    ((this.container = e), (this._heartbeatsCache = null));
    const t = this.container.getProvider('app').getImmediate();
    ((this._storage = new gp(t)),
      (this._heartbeatsCachePromise = this._storage
        .read()
        .then((r) => ((this._heartbeatsCache = r), r))));
  }
  async triggerHeartbeat() {
    try {
      const t = this.container
          .getProvider('platform-logger')
          .getImmediate()
          .getPlatformInfoString(),
        r = lc();
      if (
        (this._heartbeatsCache?.heartbeats == null &&
          ((this._heartbeatsCache = await this._heartbeatsCachePromise),
          this._heartbeatsCache?.heartbeats == null)) ||
        this._heartbeatsCache.lastSentHeartbeatDate === r ||
        this._heartbeatsCache.heartbeats.some((s) => s.date === r)
      )
        return;
      if (
        (this._heartbeatsCache.heartbeats.push({ date: r, agent: t }),
        this._heartbeatsCache.heartbeats.length > fp)
      ) {
        const s = _p(this._heartbeatsCache.heartbeats);
        this._heartbeatsCache.heartbeats.splice(s, 1);
      }
      return this._storage.overwrite(this._heartbeatsCache);
    } catch (e) {
      tt.warn(e);
    }
  }
  async getHeartbeatsHeader() {
    try {
      if (
        (this._heartbeatsCache === null && (await this._heartbeatsCachePromise),
        this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0)
      )
        return '';
      const e = lc(),
        { heartbeatsToSend: t, unsentEntries: r } = mp(this._heartbeatsCache.heartbeats),
        s = Du(JSON.stringify({ version: 2, heartbeats: t }));
      return (
        (this._heartbeatsCache.lastSentHeartbeatDate = e),
        r.length > 0
          ? ((this._heartbeatsCache.heartbeats = r),
            await this._storage.overwrite(this._heartbeatsCache))
          : ((this._heartbeatsCache.heartbeats = []),
            this._storage.overwrite(this._heartbeatsCache)),
        s
      );
    } catch (e) {
      return (tt.warn(e), '');
    }
  }
}
function lc() {
  return new Date().toISOString().substring(0, 10);
}
function mp(n, e = dp) {
  const t = [];
  let r = n.slice();
  for (const s of n) {
    const o = t.find((a) => a.agent === s.agent);
    if (o) {
      if ((o.dates.push(s.date), hc(t) > e)) {
        o.dates.pop();
        break;
      }
    } else if ((t.push({ agent: s.agent, dates: [s.date] }), hc(t) > e)) {
      t.pop();
      break;
    }
    r = r.slice(1);
  }
  return { heartbeatsToSend: t, unsentEntries: r };
}
class gp {
  constructor(e) {
    ((this.app = e), (this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck()));
  }
  async runIndexedDBEnvironmentCheck() {
    return Zd()
      ? ef()
          .then(() => !0)
          .catch(() => !1)
      : !1;
  }
  async read() {
    if (await this._canUseIndexedDBPromise) {
      const t = await hp(this.app);
      return t?.heartbeats ? t : { heartbeats: [] };
    } else return { heartbeats: [] };
  }
  async overwrite(e) {
    if (await this._canUseIndexedDBPromise) {
      const r = await this.read();
      return uc(this.app, {
        lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? r.lastSentHeartbeatDate,
        heartbeats: e.heartbeats,
      });
    } else return;
  }
  async add(e) {
    if (await this._canUseIndexedDBPromise) {
      const r = await this.read();
      return uc(this.app, {
        lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? r.lastSentHeartbeatDate,
        heartbeats: [...r.heartbeats, ...e.heartbeats],
      });
    } else return;
  }
}
function hc(n) {
  return Du(JSON.stringify({ version: 2, heartbeats: n })).length;
}
function _p(n) {
  if (n.length === 0) return -1;
  let e = 0,
    t = n[0].date;
  for (let r = 1; r < n.length; r++) n[r].date < t && ((t = n[r].date), (e = r));
  return e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function yp(n) {
  (un(new jt('platform-logger', (e) => new Cf(e), 'PRIVATE')),
    un(new jt('heartbeat', (e) => new pp(e), 'PRIVATE')),
    Tt(Oi, ac, n),
    Tt(Oi, ac, 'esm2020'),
    Tt('fire-js', ''));
}
yp('');
var Ep = 'firebase',
  Ip = '12.2.1';
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ Tt(Ep, Ip, 'app');
var dc =
  typeof globalThis < 'u'
    ? globalThis
    : typeof window < 'u'
      ? window
      : typeof global < 'u'
        ? global
        : typeof self < 'u'
          ? self
          : {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/ var vt, ju;
(function () {
  var n;
  /** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/ function e(v, m) {
    function _() {}
    ((_.prototype = m.prototype),
      (v.D = m.prototype),
      (v.prototype = new _()),
      (v.prototype.constructor = v),
      (v.C = function (I, T, A) {
        for (var g = Array(arguments.length - 2), Qe = 2; Qe < arguments.length; Qe++)
          g[Qe - 2] = arguments[Qe];
        return m.prototype[T].apply(I, g);
      }));
  }
  function t() {
    this.blockSize = -1;
  }
  function r() {
    ((this.blockSize = -1),
      (this.blockSize = 64),
      (this.g = Array(4)),
      (this.B = Array(this.blockSize)),
      (this.o = this.h = 0),
      this.s());
  }
  (e(r, t),
    (r.prototype.s = function () {
      ((this.g[0] = 1732584193),
        (this.g[1] = 4023233417),
        (this.g[2] = 2562383102),
        (this.g[3] = 271733878),
        (this.o = this.h = 0));
    }));
  function s(v, m, _) {
    _ || (_ = 0);
    var I = Array(16);
    if (typeof m == 'string')
      for (var T = 0; 16 > T; ++T)
        I[T] =
          m.charCodeAt(_++) |
          (m.charCodeAt(_++) << 8) |
          (m.charCodeAt(_++) << 16) |
          (m.charCodeAt(_++) << 24);
    else for (T = 0; 16 > T; ++T) I[T] = m[_++] | (m[_++] << 8) | (m[_++] << 16) | (m[_++] << 24);
    ((m = v.g[0]), (_ = v.g[1]), (T = v.g[2]));
    var A = v.g[3],
      g = (m + (A ^ (_ & (T ^ A))) + I[0] + 3614090360) & 4294967295;
    ((m = _ + (((g << 7) & 4294967295) | (g >>> 25))),
      (g = (A + (T ^ (m & (_ ^ T))) + I[1] + 3905402710) & 4294967295),
      (A = m + (((g << 12) & 4294967295) | (g >>> 20))),
      (g = (T + (_ ^ (A & (m ^ _))) + I[2] + 606105819) & 4294967295),
      (T = A + (((g << 17) & 4294967295) | (g >>> 15))),
      (g = (_ + (m ^ (T & (A ^ m))) + I[3] + 3250441966) & 4294967295),
      (_ = T + (((g << 22) & 4294967295) | (g >>> 10))),
      (g = (m + (A ^ (_ & (T ^ A))) + I[4] + 4118548399) & 4294967295),
      (m = _ + (((g << 7) & 4294967295) | (g >>> 25))),
      (g = (A + (T ^ (m & (_ ^ T))) + I[5] + 1200080426) & 4294967295),
      (A = m + (((g << 12) & 4294967295) | (g >>> 20))),
      (g = (T + (_ ^ (A & (m ^ _))) + I[6] + 2821735955) & 4294967295),
      (T = A + (((g << 17) & 4294967295) | (g >>> 15))),
      (g = (_ + (m ^ (T & (A ^ m))) + I[7] + 4249261313) & 4294967295),
      (_ = T + (((g << 22) & 4294967295) | (g >>> 10))),
      (g = (m + (A ^ (_ & (T ^ A))) + I[8] + 1770035416) & 4294967295),
      (m = _ + (((g << 7) & 4294967295) | (g >>> 25))),
      (g = (A + (T ^ (m & (_ ^ T))) + I[9] + 2336552879) & 4294967295),
      (A = m + (((g << 12) & 4294967295) | (g >>> 20))),
      (g = (T + (_ ^ (A & (m ^ _))) + I[10] + 4294925233) & 4294967295),
      (T = A + (((g << 17) & 4294967295) | (g >>> 15))),
      (g = (_ + (m ^ (T & (A ^ m))) + I[11] + 2304563134) & 4294967295),
      (_ = T + (((g << 22) & 4294967295) | (g >>> 10))),
      (g = (m + (A ^ (_ & (T ^ A))) + I[12] + 1804603682) & 4294967295),
      (m = _ + (((g << 7) & 4294967295) | (g >>> 25))),
      (g = (A + (T ^ (m & (_ ^ T))) + I[13] + 4254626195) & 4294967295),
      (A = m + (((g << 12) & 4294967295) | (g >>> 20))),
      (g = (T + (_ ^ (A & (m ^ _))) + I[14] + 2792965006) & 4294967295),
      (T = A + (((g << 17) & 4294967295) | (g >>> 15))),
      (g = (_ + (m ^ (T & (A ^ m))) + I[15] + 1236535329) & 4294967295),
      (_ = T + (((g << 22) & 4294967295) | (g >>> 10))),
      (g = (m + (T ^ (A & (_ ^ T))) + I[1] + 4129170786) & 4294967295),
      (m = _ + (((g << 5) & 4294967295) | (g >>> 27))),
      (g = (A + (_ ^ (T & (m ^ _))) + I[6] + 3225465664) & 4294967295),
      (A = m + (((g << 9) & 4294967295) | (g >>> 23))),
      (g = (T + (m ^ (_ & (A ^ m))) + I[11] + 643717713) & 4294967295),
      (T = A + (((g << 14) & 4294967295) | (g >>> 18))),
      (g = (_ + (A ^ (m & (T ^ A))) + I[0] + 3921069994) & 4294967295),
      (_ = T + (((g << 20) & 4294967295) | (g >>> 12))),
      (g = (m + (T ^ (A & (_ ^ T))) + I[5] + 3593408605) & 4294967295),
      (m = _ + (((g << 5) & 4294967295) | (g >>> 27))),
      (g = (A + (_ ^ (T & (m ^ _))) + I[10] + 38016083) & 4294967295),
      (A = m + (((g << 9) & 4294967295) | (g >>> 23))),
      (g = (T + (m ^ (_ & (A ^ m))) + I[15] + 3634488961) & 4294967295),
      (T = A + (((g << 14) & 4294967295) | (g >>> 18))),
      (g = (_ + (A ^ (m & (T ^ A))) + I[4] + 3889429448) & 4294967295),
      (_ = T + (((g << 20) & 4294967295) | (g >>> 12))),
      (g = (m + (T ^ (A & (_ ^ T))) + I[9] + 568446438) & 4294967295),
      (m = _ + (((g << 5) & 4294967295) | (g >>> 27))),
      (g = (A + (_ ^ (T & (m ^ _))) + I[14] + 3275163606) & 4294967295),
      (A = m + (((g << 9) & 4294967295) | (g >>> 23))),
      (g = (T + (m ^ (_ & (A ^ m))) + I[3] + 4107603335) & 4294967295),
      (T = A + (((g << 14) & 4294967295) | (g >>> 18))),
      (g = (_ + (A ^ (m & (T ^ A))) + I[8] + 1163531501) & 4294967295),
      (_ = T + (((g << 20) & 4294967295) | (g >>> 12))),
      (g = (m + (T ^ (A & (_ ^ T))) + I[13] + 2850285829) & 4294967295),
      (m = _ + (((g << 5) & 4294967295) | (g >>> 27))),
      (g = (A + (_ ^ (T & (m ^ _))) + I[2] + 4243563512) & 4294967295),
      (A = m + (((g << 9) & 4294967295) | (g >>> 23))),
      (g = (T + (m ^ (_ & (A ^ m))) + I[7] + 1735328473) & 4294967295),
      (T = A + (((g << 14) & 4294967295) | (g >>> 18))),
      (g = (_ + (A ^ (m & (T ^ A))) + I[12] + 2368359562) & 4294967295),
      (_ = T + (((g << 20) & 4294967295) | (g >>> 12))),
      (g = (m + (_ ^ T ^ A) + I[5] + 4294588738) & 4294967295),
      (m = _ + (((g << 4) & 4294967295) | (g >>> 28))),
      (g = (A + (m ^ _ ^ T) + I[8] + 2272392833) & 4294967295),
      (A = m + (((g << 11) & 4294967295) | (g >>> 21))),
      (g = (T + (A ^ m ^ _) + I[11] + 1839030562) & 4294967295),
      (T = A + (((g << 16) & 4294967295) | (g >>> 16))),
      (g = (_ + (T ^ A ^ m) + I[14] + 4259657740) & 4294967295),
      (_ = T + (((g << 23) & 4294967295) | (g >>> 9))),
      (g = (m + (_ ^ T ^ A) + I[1] + 2763975236) & 4294967295),
      (m = _ + (((g << 4) & 4294967295) | (g >>> 28))),
      (g = (A + (m ^ _ ^ T) + I[4] + 1272893353) & 4294967295),
      (A = m + (((g << 11) & 4294967295) | (g >>> 21))),
      (g = (T + (A ^ m ^ _) + I[7] + 4139469664) & 4294967295),
      (T = A + (((g << 16) & 4294967295) | (g >>> 16))),
      (g = (_ + (T ^ A ^ m) + I[10] + 3200236656) & 4294967295),
      (_ = T + (((g << 23) & 4294967295) | (g >>> 9))),
      (g = (m + (_ ^ T ^ A) + I[13] + 681279174) & 4294967295),
      (m = _ + (((g << 4) & 4294967295) | (g >>> 28))),
      (g = (A + (m ^ _ ^ T) + I[0] + 3936430074) & 4294967295),
      (A = m + (((g << 11) & 4294967295) | (g >>> 21))),
      (g = (T + (A ^ m ^ _) + I[3] + 3572445317) & 4294967295),
      (T = A + (((g << 16) & 4294967295) | (g >>> 16))),
      (g = (_ + (T ^ A ^ m) + I[6] + 76029189) & 4294967295),
      (_ = T + (((g << 23) & 4294967295) | (g >>> 9))),
      (g = (m + (_ ^ T ^ A) + I[9] + 3654602809) & 4294967295),
      (m = _ + (((g << 4) & 4294967295) | (g >>> 28))),
      (g = (A + (m ^ _ ^ T) + I[12] + 3873151461) & 4294967295),
      (A = m + (((g << 11) & 4294967295) | (g >>> 21))),
      (g = (T + (A ^ m ^ _) + I[15] + 530742520) & 4294967295),
      (T = A + (((g << 16) & 4294967295) | (g >>> 16))),
      (g = (_ + (T ^ A ^ m) + I[2] + 3299628645) & 4294967295),
      (_ = T + (((g << 23) & 4294967295) | (g >>> 9))),
      (g = (m + (T ^ (_ | ~A)) + I[0] + 4096336452) & 4294967295),
      (m = _ + (((g << 6) & 4294967295) | (g >>> 26))),
      (g = (A + (_ ^ (m | ~T)) + I[7] + 1126891415) & 4294967295),
      (A = m + (((g << 10) & 4294967295) | (g >>> 22))),
      (g = (T + (m ^ (A | ~_)) + I[14] + 2878612391) & 4294967295),
      (T = A + (((g << 15) & 4294967295) | (g >>> 17))),
      (g = (_ + (A ^ (T | ~m)) + I[5] + 4237533241) & 4294967295),
      (_ = T + (((g << 21) & 4294967295) | (g >>> 11))),
      (g = (m + (T ^ (_ | ~A)) + I[12] + 1700485571) & 4294967295),
      (m = _ + (((g << 6) & 4294967295) | (g >>> 26))),
      (g = (A + (_ ^ (m | ~T)) + I[3] + 2399980690) & 4294967295),
      (A = m + (((g << 10) & 4294967295) | (g >>> 22))),
      (g = (T + (m ^ (A | ~_)) + I[10] + 4293915773) & 4294967295),
      (T = A + (((g << 15) & 4294967295) | (g >>> 17))),
      (g = (_ + (A ^ (T | ~m)) + I[1] + 2240044497) & 4294967295),
      (_ = T + (((g << 21) & 4294967295) | (g >>> 11))),
      (g = (m + (T ^ (_ | ~A)) + I[8] + 1873313359) & 4294967295),
      (m = _ + (((g << 6) & 4294967295) | (g >>> 26))),
      (g = (A + (_ ^ (m | ~T)) + I[15] + 4264355552) & 4294967295),
      (A = m + (((g << 10) & 4294967295) | (g >>> 22))),
      (g = (T + (m ^ (A | ~_)) + I[6] + 2734768916) & 4294967295),
      (T = A + (((g << 15) & 4294967295) | (g >>> 17))),
      (g = (_ + (A ^ (T | ~m)) + I[13] + 1309151649) & 4294967295),
      (_ = T + (((g << 21) & 4294967295) | (g >>> 11))),
      (g = (m + (T ^ (_ | ~A)) + I[4] + 4149444226) & 4294967295),
      (m = _ + (((g << 6) & 4294967295) | (g >>> 26))),
      (g = (A + (_ ^ (m | ~T)) + I[11] + 3174756917) & 4294967295),
      (A = m + (((g << 10) & 4294967295) | (g >>> 22))),
      (g = (T + (m ^ (A | ~_)) + I[2] + 718787259) & 4294967295),
      (T = A + (((g << 15) & 4294967295) | (g >>> 17))),
      (g = (_ + (A ^ (T | ~m)) + I[9] + 3951481745) & 4294967295),
      (v.g[0] = (v.g[0] + m) & 4294967295),
      (v.g[1] = (v.g[1] + (T + (((g << 21) & 4294967295) | (g >>> 11)))) & 4294967295),
      (v.g[2] = (v.g[2] + T) & 4294967295),
      (v.g[3] = (v.g[3] + A) & 4294967295));
  }
  ((r.prototype.u = function (v, m) {
    m === void 0 && (m = v.length);
    for (var _ = m - this.blockSize, I = this.B, T = this.h, A = 0; A < m; ) {
      if (T == 0) for (; A <= _; ) (s(this, v, A), (A += this.blockSize));
      if (typeof v == 'string') {
        for (; A < m; )
          if (((I[T++] = v.charCodeAt(A++)), T == this.blockSize)) {
            (s(this, I), (T = 0));
            break;
          }
      } else
        for (; A < m; )
          if (((I[T++] = v[A++]), T == this.blockSize)) {
            (s(this, I), (T = 0));
            break;
          }
    }
    ((this.h = T), (this.o += m));
  }),
    (r.prototype.v = function () {
      var v = Array((56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h);
      v[0] = 128;
      for (var m = 1; m < v.length - 8; ++m) v[m] = 0;
      var _ = 8 * this.o;
      for (m = v.length - 8; m < v.length; ++m) ((v[m] = _ & 255), (_ /= 256));
      for (this.u(v), v = Array(16), m = _ = 0; 4 > m; ++m)
        for (var I = 0; 32 > I; I += 8) v[_++] = (this.g[m] >>> I) & 255;
      return v;
    }));
  function o(v, m) {
    var _ = u;
    return Object.prototype.hasOwnProperty.call(_, v) ? _[v] : (_[v] = m(v));
  }
  function a(v, m) {
    this.h = m;
    for (var _ = [], I = !0, T = v.length - 1; 0 <= T; T--) {
      var A = v[T] | 0;
      (I && A == m) || ((_[T] = A), (I = !1));
    }
    this.g = _;
  }
  var u = {};
  function h(v) {
    return -128 <= v && 128 > v
      ? o(v, function (m) {
          return new a([m | 0], 0 > m ? -1 : 0);
        })
      : new a([v | 0], 0 > v ? -1 : 0);
  }
  function d(v) {
    if (isNaN(v) || !isFinite(v)) return E;
    if (0 > v) return N(d(-v));
    for (var m = [], _ = 1, I = 0; v >= _; I++) ((m[I] = (v / _) | 0), (_ *= 4294967296));
    return new a(m, 0);
  }
  function p(v, m) {
    if (v.length == 0) throw Error('number format error: empty string');
    if (((m = m || 10), 2 > m || 36 < m)) throw Error('radix out of range: ' + m);
    if (v.charAt(0) == '-') return N(p(v.substring(1), m));
    if (0 <= v.indexOf('-')) throw Error('number format error: interior "-" character');
    for (var _ = d(Math.pow(m, 8)), I = E, T = 0; T < v.length; T += 8) {
      var A = Math.min(8, v.length - T),
        g = parseInt(v.substring(T, T + A), m);
      8 > A ? ((A = d(Math.pow(m, A))), (I = I.j(A).add(d(g)))) : ((I = I.j(_)), (I = I.add(d(g))));
    }
    return I;
  }
  var E = h(0),
    y = h(1),
    C = h(16777216);
  ((n = a.prototype),
    (n.m = function () {
      if (O(this)) return -N(this).m();
      for (var v = 0, m = 1, _ = 0; _ < this.g.length; _++) {
        var I = this.i(_);
        ((v += (0 <= I ? I : 4294967296 + I) * m), (m *= 4294967296));
      }
      return v;
    }),
    (n.toString = function (v) {
      if (((v = v || 10), 2 > v || 36 < v)) throw Error('radix out of range: ' + v);
      if (b(this)) return '0';
      if (O(this)) return '-' + N(this).toString(v);
      for (var m = d(Math.pow(v, 6)), _ = this, I = ''; ; ) {
        var T = ue(_, m).g;
        _ = z(_, T.j(m));
        var A = ((0 < _.g.length ? _.g[0] : _.h) >>> 0).toString(v);
        if (((_ = T), b(_))) return A + I;
        for (; 6 > A.length; ) A = '0' + A;
        I = A + I;
      }
    }),
    (n.i = function (v) {
      return 0 > v ? 0 : v < this.g.length ? this.g[v] : this.h;
    }));
  function b(v) {
    if (v.h != 0) return !1;
    for (var m = 0; m < v.g.length; m++) if (v.g[m] != 0) return !1;
    return !0;
  }
  function O(v) {
    return v.h == -1;
  }
  n.l = function (v) {
    return ((v = z(this, v)), O(v) ? -1 : b(v) ? 0 : 1);
  };
  function N(v) {
    for (var m = v.g.length, _ = [], I = 0; I < m; I++) _[I] = ~v.g[I];
    return new a(_, ~v.h).add(y);
  }
  ((n.abs = function () {
    return O(this) ? N(this) : this;
  }),
    (n.add = function (v) {
      for (var m = Math.max(this.g.length, v.g.length), _ = [], I = 0, T = 0; T <= m; T++) {
        var A = I + (this.i(T) & 65535) + (v.i(T) & 65535),
          g = (A >>> 16) + (this.i(T) >>> 16) + (v.i(T) >>> 16);
        ((I = g >>> 16), (A &= 65535), (g &= 65535), (_[T] = (g << 16) | A));
      }
      return new a(_, _[_.length - 1] & -2147483648 ? -1 : 0);
    }));
  function z(v, m) {
    return v.add(N(m));
  }
  n.j = function (v) {
    if (b(this) || b(v)) return E;
    if (O(this)) return O(v) ? N(this).j(N(v)) : N(N(this).j(v));
    if (O(v)) return N(this.j(N(v)));
    if (0 > this.l(C) && 0 > v.l(C)) return d(this.m() * v.m());
    for (var m = this.g.length + v.g.length, _ = [], I = 0; I < 2 * m; I++) _[I] = 0;
    for (I = 0; I < this.g.length; I++)
      for (var T = 0; T < v.g.length; T++) {
        var A = this.i(I) >>> 16,
          g = this.i(I) & 65535,
          Qe = v.i(T) >>> 16,
          wn = v.i(T) & 65535;
        ((_[2 * I + 2 * T] += g * wn),
          B(_, 2 * I + 2 * T),
          (_[2 * I + 2 * T + 1] += A * wn),
          B(_, 2 * I + 2 * T + 1),
          (_[2 * I + 2 * T + 1] += g * Qe),
          B(_, 2 * I + 2 * T + 1),
          (_[2 * I + 2 * T + 2] += A * Qe),
          B(_, 2 * I + 2 * T + 2));
      }
    for (I = 0; I < m; I++) _[I] = (_[2 * I + 1] << 16) | _[2 * I];
    for (I = m; I < 2 * m; I++) _[I] = 0;
    return new a(_, 0);
  };
  function B(v, m) {
    for (; (v[m] & 65535) != v[m]; ) ((v[m + 1] += v[m] >>> 16), (v[m] &= 65535), m++);
  }
  function H(v, m) {
    ((this.g = v), (this.h = m));
  }
  function ue(v, m) {
    if (b(m)) throw Error('division by zero');
    if (b(v)) return new H(E, E);
    if (O(v)) return ((m = ue(N(v), m)), new H(N(m.g), N(m.h)));
    if (O(m)) return ((m = ue(v, N(m))), new H(N(m.g), m.h));
    if (30 < v.g.length) {
      if (O(v) || O(m)) throw Error('slowDivide_ only works with positive integers.');
      for (var _ = y, I = m; 0 >= I.l(v); ) ((_ = Ue(_)), (I = Ue(I)));
      var T = pe(_, 1),
        A = pe(I, 1);
      for (I = pe(I, 2), _ = pe(_, 2); !b(I); ) {
        var g = A.add(I);
        (0 >= g.l(v) && ((T = T.add(_)), (A = g)), (I = pe(I, 1)), (_ = pe(_, 1)));
      }
      return ((m = z(v, T.j(m))), new H(T, m));
    }
    for (T = E; 0 <= v.l(m); ) {
      for (
        _ = Math.max(1, Math.floor(v.m() / m.m())),
          I = Math.ceil(Math.log(_) / Math.LN2),
          I = 48 >= I ? 1 : Math.pow(2, I - 48),
          A = d(_),
          g = A.j(m);
        O(g) || 0 < g.l(v);

      )
        ((_ -= I), (A = d(_)), (g = A.j(m)));
      (b(A) && (A = y), (T = T.add(A)), (v = z(v, g)));
    }
    return new H(T, v);
  }
  ((n.A = function (v) {
    return ue(this, v).h;
  }),
    (n.and = function (v) {
      for (var m = Math.max(this.g.length, v.g.length), _ = [], I = 0; I < m; I++)
        _[I] = this.i(I) & v.i(I);
      return new a(_, this.h & v.h);
    }),
    (n.or = function (v) {
      for (var m = Math.max(this.g.length, v.g.length), _ = [], I = 0; I < m; I++)
        _[I] = this.i(I) | v.i(I);
      return new a(_, this.h | v.h);
    }),
    (n.xor = function (v) {
      for (var m = Math.max(this.g.length, v.g.length), _ = [], I = 0; I < m; I++)
        _[I] = this.i(I) ^ v.i(I);
      return new a(_, this.h ^ v.h);
    }));
  function Ue(v) {
    for (var m = v.g.length + 1, _ = [], I = 0; I < m; I++)
      _[I] = (v.i(I) << 1) | (v.i(I - 1) >>> 31);
    return new a(_, v.h);
  }
  function pe(v, m) {
    var _ = m >> 5;
    m %= 32;
    for (var I = v.g.length - _, T = [], A = 0; A < I; A++)
      T[A] = 0 < m ? (v.i(A + _) >>> m) | (v.i(A + _ + 1) << (32 - m)) : v.i(A + _);
    return new a(T, v.h);
  }
  ((r.prototype.digest = r.prototype.v),
    (r.prototype.reset = r.prototype.s),
    (r.prototype.update = r.prototype.u),
    (ju = r),
    (a.prototype.add = a.prototype.add),
    (a.prototype.multiply = a.prototype.j),
    (a.prototype.modulo = a.prototype.A),
    (a.prototype.compare = a.prototype.l),
    (a.prototype.toNumber = a.prototype.m),
    (a.prototype.toString = a.prototype.toString),
    (a.prototype.getBits = a.prototype.i),
    (a.fromNumber = d),
    (a.fromString = p),
    (vt = a));
}).apply(typeof dc < 'u' ? dc : typeof self < 'u' ? self : typeof window < 'u' ? window : {});
var qr =
  typeof globalThis < 'u'
    ? globalThis
    : typeof window < 'u'
      ? window
      : typeof global < 'u'
        ? global
        : typeof self < 'u'
          ? self
          : {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/ var $u, jn, zu, Gr, xi, Hu, Wu, Gu;
(function () {
  var n,
    e =
      typeof Object.defineProperties == 'function'
        ? Object.defineProperty
        : function (i, c, l) {
            return (i == Array.prototype || i == Object.prototype || (i[c] = l.value), i);
          };
  function t(i) {
    i = [
      typeof globalThis == 'object' && globalThis,
      i,
      typeof window == 'object' && window,
      typeof self == 'object' && self,
      typeof qr == 'object' && qr,
    ];
    for (var c = 0; c < i.length; ++c) {
      var l = i[c];
      if (l && l.Math == Math) return l;
    }
    throw Error('Cannot find global object');
  }
  var r = t(this);
  function s(i, c) {
    if (c)
      e: {
        var l = r;
        i = i.split('.');
        for (var f = 0; f < i.length - 1; f++) {
          var w = i[f];
          if (!(w in l)) break e;
          l = l[w];
        }
        ((i = i[i.length - 1]),
          (f = l[i]),
          (c = c(f)),
          c != f && c != null && e(l, i, { configurable: !0, writable: !0, value: c }));
      }
  }
  function o(i, c) {
    i instanceof String && (i += '');
    var l = 0,
      f = !1,
      w = {
        next: function () {
          if (!f && l < i.length) {
            var R = l++;
            return { value: c(R, i[R]), done: !1 };
          }
          return ((f = !0), { done: !0, value: void 0 });
        },
      };
    return (
      (w[Symbol.iterator] = function () {
        return w;
      }),
      w
    );
  }
  s('Array.prototype.values', function (i) {
    return (
      i ||
      function () {
        return o(this, function (c, l) {
          return l;
        });
      }
    );
  });
  /** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/ var a = a || {},
    u = this || self;
  function h(i) {
    var c = typeof i;
    return (
      (c = c != 'object' ? c : i ? (Array.isArray(i) ? 'array' : c) : 'null'),
      c == 'array' || (c == 'object' && typeof i.length == 'number')
    );
  }
  function d(i) {
    var c = typeof i;
    return (c == 'object' && i != null) || c == 'function';
  }
  function p(i, c, l) {
    return i.call.apply(i.bind, arguments);
  }
  function E(i, c, l) {
    if (!i) throw Error();
    if (2 < arguments.length) {
      var f = Array.prototype.slice.call(arguments, 2);
      return function () {
        var w = Array.prototype.slice.call(arguments);
        return (Array.prototype.unshift.apply(w, f), i.apply(c, w));
      };
    }
    return function () {
      return i.apply(c, arguments);
    };
  }
  function y(i, c, l) {
    return (
      (y =
        Function.prototype.bind && Function.prototype.bind.toString().indexOf('native code') != -1
          ? p
          : E),
      y.apply(null, arguments)
    );
  }
  function C(i, c) {
    var l = Array.prototype.slice.call(arguments, 1);
    return function () {
      var f = l.slice();
      return (f.push.apply(f, arguments), i.apply(this, f));
    };
  }
  function b(i, c) {
    function l() {}
    ((l.prototype = c.prototype),
      (i.aa = c.prototype),
      (i.prototype = new l()),
      (i.prototype.constructor = i),
      (i.Qb = function (f, w, R) {
        for (var V = Array(arguments.length - 2), Q = 2; Q < arguments.length; Q++)
          V[Q - 2] = arguments[Q];
        return c.prototype[w].apply(f, V);
      }));
  }
  function O(i) {
    const c = i.length;
    if (0 < c) {
      const l = Array(c);
      for (let f = 0; f < c; f++) l[f] = i[f];
      return l;
    }
    return [];
  }
  function N(i, c) {
    for (let l = 1; l < arguments.length; l++) {
      const f = arguments[l];
      if (h(f)) {
        const w = i.length || 0,
          R = f.length || 0;
        i.length = w + R;
        for (let V = 0; V < R; V++) i[w + V] = f[V];
      } else i.push(f);
    }
  }
  class z {
    constructor(c, l) {
      ((this.i = c), (this.j = l), (this.h = 0), (this.g = null));
    }
    get() {
      let c;
      return (
        0 < this.h ? (this.h--, (c = this.g), (this.g = c.next), (c.next = null)) : (c = this.i()),
        c
      );
    }
  }
  function B(i) {
    return /^[\s\xa0]*$/.test(i);
  }
  function H() {
    var i = u.navigator;
    return i && (i = i.userAgent) ? i : '';
  }
  function ue(i) {
    return (ue[' '](i), i);
  }
  ue[' '] = function () {};
  var Ue =
    H().indexOf('Gecko') != -1 &&
    !(H().toLowerCase().indexOf('webkit') != -1 && H().indexOf('Edge') == -1) &&
    !(H().indexOf('Trident') != -1 || H().indexOf('MSIE') != -1) &&
    H().indexOf('Edge') == -1;
  function pe(i, c, l) {
    for (const f in i) c.call(l, i[f], f, i);
  }
  function v(i, c) {
    for (const l in i) c.call(void 0, i[l], l, i);
  }
  function m(i) {
    const c = {};
    for (const l in i) c[l] = i[l];
    return c;
  }
  const _ =
    'constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf'.split(
      ' '
    );
  function I(i, c) {
    let l, f;
    for (let w = 1; w < arguments.length; w++) {
      f = arguments[w];
      for (l in f) i[l] = f[l];
      for (let R = 0; R < _.length; R++)
        ((l = _[R]), Object.prototype.hasOwnProperty.call(f, l) && (i[l] = f[l]));
    }
  }
  function T(i) {
    var c = 1;
    i = i.split(':');
    const l = [];
    for (; 0 < c && i.length; ) (l.push(i.shift()), c--);
    return (i.length && l.push(i.join(':')), l);
  }
  function A(i) {
    u.setTimeout(() => {
      throw i;
    }, 0);
  }
  function g() {
    var i = Ys;
    let c = null;
    return (i.g && ((c = i.g), (i.g = i.g.next), i.g || (i.h = null), (c.next = null)), c);
  }
  class Qe {
    constructor() {
      this.h = this.g = null;
    }
    add(c, l) {
      const f = wn.get();
      (f.set(c, l), this.h ? (this.h.next = f) : (this.g = f), (this.h = f));
    }
  }
  var wn = new z(
    () => new Jh(),
    (i) => i.reset()
  );
  class Jh {
    constructor() {
      this.next = this.g = this.h = null;
    }
    set(c, l) {
      ((this.h = c), (this.g = l), (this.next = null));
    }
    reset() {
      this.next = this.g = this.h = null;
    }
  }
  let An,
    Rn = !1,
    Ys = new Qe(),
    ta = () => {
      const i = u.Promise.resolve(void 0);
      An = () => {
        i.then(Zh);
      };
    };
  var Zh = () => {
    for (var i; (i = g()); ) {
      try {
        i.h.call(i.g);
      } catch (l) {
        A(l);
      }
      var c = wn;
      (c.j(i), 100 > c.h && (c.h++, (i.next = c.g), (c.g = i)));
    }
    Rn = !1;
  };
  function ut() {
    ((this.s = this.s), (this.C = this.C));
  }
  ((ut.prototype.s = !1),
    (ut.prototype.ma = function () {
      this.s || ((this.s = !0), this.N());
    }),
    (ut.prototype.N = function () {
      if (this.C) for (; this.C.length; ) this.C.shift()();
    }));
  function me(i, c) {
    ((this.type = i), (this.g = this.target = c), (this.defaultPrevented = !1));
  }
  me.prototype.h = function () {
    this.defaultPrevented = !0;
  };
  var ed = (function () {
    if (!u.addEventListener || !Object.defineProperty) return !1;
    var i = !1,
      c = Object.defineProperty({}, 'passive', {
        get: function () {
          i = !0;
        },
      });
    try {
      const l = () => {};
      (u.addEventListener('test', l, c), u.removeEventListener('test', l, c));
    } catch {}
    return i;
  })();
  function Sn(i, c) {
    if (
      (me.call(this, i ? i.type : ''),
      (this.relatedTarget = this.g = this.target = null),
      (this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0),
      (this.key = ''),
      (this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1),
      (this.state = null),
      (this.pointerId = 0),
      (this.pointerType = ''),
      (this.i = null),
      i)
    ) {
      var l = (this.type = i.type),
        f = i.changedTouches && i.changedTouches.length ? i.changedTouches[0] : null;
      if (((this.target = i.target || i.srcElement), (this.g = c), (c = i.relatedTarget))) {
        if (Ue) {
          e: {
            try {
              ue(c.nodeName);
              var w = !0;
              break e;
            } catch {}
            w = !1;
          }
          w || (c = null);
        }
      } else l == 'mouseover' ? (c = i.fromElement) : l == 'mouseout' && (c = i.toElement);
      ((this.relatedTarget = c),
        f
          ? ((this.clientX = f.clientX !== void 0 ? f.clientX : f.pageX),
            (this.clientY = f.clientY !== void 0 ? f.clientY : f.pageY),
            (this.screenX = f.screenX || 0),
            (this.screenY = f.screenY || 0))
          : ((this.clientX = i.clientX !== void 0 ? i.clientX : i.pageX),
            (this.clientY = i.clientY !== void 0 ? i.clientY : i.pageY),
            (this.screenX = i.screenX || 0),
            (this.screenY = i.screenY || 0)),
        (this.button = i.button),
        (this.key = i.key || ''),
        (this.ctrlKey = i.ctrlKey),
        (this.altKey = i.altKey),
        (this.shiftKey = i.shiftKey),
        (this.metaKey = i.metaKey),
        (this.pointerId = i.pointerId || 0),
        (this.pointerType =
          typeof i.pointerType == 'string' ? i.pointerType : td[i.pointerType] || ''),
        (this.state = i.state),
        (this.i = i),
        i.defaultPrevented && Sn.aa.h.call(this));
    }
  }
  b(Sn, me);
  var td = { 2: 'touch', 3: 'pen', 4: 'mouse' };
  Sn.prototype.h = function () {
    Sn.aa.h.call(this);
    var i = this.i;
    i.preventDefault ? i.preventDefault() : (i.returnValue = !1);
  };
  var vr = 'closure_listenable_' + ((1e6 * Math.random()) | 0),
    nd = 0;
  function rd(i, c, l, f, w) {
    ((this.listener = i),
      (this.proxy = null),
      (this.src = c),
      (this.type = l),
      (this.capture = !!f),
      (this.ha = w),
      (this.key = ++nd),
      (this.da = this.fa = !1));
  }
  function wr(i) {
    ((i.da = !0), (i.listener = null), (i.proxy = null), (i.src = null), (i.ha = null));
  }
  function Ar(i) {
    ((this.src = i), (this.g = {}), (this.h = 0));
  }
  Ar.prototype.add = function (i, c, l, f, w) {
    var R = i.toString();
    ((i = this.g[R]), i || ((i = this.g[R] = []), this.h++));
    var V = Js(i, c, f, w);
    return (
      -1 < V
        ? ((c = i[V]), l || (c.fa = !1))
        : ((c = new rd(c, this.src, R, !!f, w)), (c.fa = l), i.push(c)),
      c
    );
  };
  function Xs(i, c) {
    var l = c.type;
    if (l in i.g) {
      var f = i.g[l],
        w = Array.prototype.indexOf.call(f, c, void 0),
        R;
      ((R = 0 <= w) && Array.prototype.splice.call(f, w, 1),
        R && (wr(c), i.g[l].length == 0 && (delete i.g[l], i.h--)));
    }
  }
  function Js(i, c, l, f) {
    for (var w = 0; w < i.length; ++w) {
      var R = i[w];
      if (!R.da && R.listener == c && R.capture == !!l && R.ha == f) return w;
    }
    return -1;
  }
  var Zs = 'closure_lm_' + ((1e6 * Math.random()) | 0),
    ei = {};
  function na(i, c, l, f, w) {
    if (Array.isArray(c)) {
      for (var R = 0; R < c.length; R++) na(i, c[R], l, f, w);
      return null;
    }
    return (
      (l = ia(l)),
      i && i[vr] ? i.K(c, l, d(f) ? !!f.capture : !1, w) : sd(i, c, l, !1, f, w)
    );
  }
  function sd(i, c, l, f, w, R) {
    if (!c) throw Error('Invalid event type');
    var V = d(w) ? !!w.capture : !!w,
      Q = ni(i);
    if ((Q || (i[Zs] = Q = new Ar(i)), (l = Q.add(c, l, f, V, R)), l.proxy)) return l;
    if (((f = id()), (l.proxy = f), (f.src = i), (f.listener = l), i.addEventListener))
      (ed || (w = V), w === void 0 && (w = !1), i.addEventListener(c.toString(), f, w));
    else if (i.attachEvent) i.attachEvent(sa(c.toString()), f);
    else if (i.addListener && i.removeListener) i.addListener(f);
    else throw Error('addEventListener and attachEvent are unavailable.');
    return l;
  }
  function id() {
    function i(l) {
      return c.call(i.src, i.listener, l);
    }
    const c = od;
    return i;
  }
  function ra(i, c, l, f, w) {
    if (Array.isArray(c)) for (var R = 0; R < c.length; R++) ra(i, c[R], l, f, w);
    else
      ((f = d(f) ? !!f.capture : !!f),
        (l = ia(l)),
        i && i[vr]
          ? ((i = i.i),
            (c = String(c).toString()),
            c in i.g &&
              ((R = i.g[c]),
              (l = Js(R, l, f, w)),
              -1 < l &&
                (wr(R[l]),
                Array.prototype.splice.call(R, l, 1),
                R.length == 0 && (delete i.g[c], i.h--))))
          : i &&
            (i = ni(i)) &&
            ((c = i.g[c.toString()]),
            (i = -1),
            c && (i = Js(c, l, f, w)),
            (l = -1 < i ? c[i] : null) && ti(l)));
  }
  function ti(i) {
    if (typeof i != 'number' && i && !i.da) {
      var c = i.src;
      if (c && c[vr]) Xs(c.i, i);
      else {
        var l = i.type,
          f = i.proxy;
        (c.removeEventListener
          ? c.removeEventListener(l, f, i.capture)
          : c.detachEvent
            ? c.detachEvent(sa(l), f)
            : c.addListener && c.removeListener && c.removeListener(f),
          (l = ni(c)) ? (Xs(l, i), l.h == 0 && ((l.src = null), (c[Zs] = null))) : wr(i));
      }
    }
  }
  function sa(i) {
    return i in ei ? ei[i] : (ei[i] = 'on' + i);
  }
  function od(i, c) {
    if (i.da) i = !0;
    else {
      c = new Sn(c, this);
      var l = i.listener,
        f = i.ha || i.src;
      (i.fa && ti(i), (i = l.call(f, c)));
    }
    return i;
  }
  function ni(i) {
    return ((i = i[Zs]), i instanceof Ar ? i : null);
  }
  var ri = '__closure_events_fn_' + ((1e9 * Math.random()) >>> 0);
  function ia(i) {
    return typeof i == 'function'
      ? i
      : (i[ri] ||
          (i[ri] = function (c) {
            return i.handleEvent(c);
          }),
        i[ri]);
  }
  function ge() {
    (ut.call(this), (this.i = new Ar(this)), (this.M = this), (this.F = null));
  }
  (b(ge, ut),
    (ge.prototype[vr] = !0),
    (ge.prototype.removeEventListener = function (i, c, l, f) {
      ra(this, i, c, l, f);
    }));
  function ve(i, c) {
    var l,
      f = i.F;
    if (f) for (l = []; f; f = f.F) l.push(f);
    if (((i = i.M), (f = c.type || c), typeof c == 'string')) c = new me(c, i);
    else if (c instanceof me) c.target = c.target || i;
    else {
      var w = c;
      ((c = new me(f, i)), I(c, w));
    }
    if (((w = !0), l))
      for (var R = l.length - 1; 0 <= R; R--) {
        var V = (c.g = l[R]);
        w = Rr(V, f, !0, c) && w;
      }
    if (((V = c.g = i), (w = Rr(V, f, !0, c) && w), (w = Rr(V, f, !1, c) && w), l))
      for (R = 0; R < l.length; R++) ((V = c.g = l[R]), (w = Rr(V, f, !1, c) && w));
  }
  ((ge.prototype.N = function () {
    if ((ge.aa.N.call(this), this.i)) {
      var i = this.i,
        c;
      for (c in i.g) {
        for (var l = i.g[c], f = 0; f < l.length; f++) wr(l[f]);
        (delete i.g[c], i.h--);
      }
    }
    this.F = null;
  }),
    (ge.prototype.K = function (i, c, l, f) {
      return this.i.add(String(i), c, !1, l, f);
    }),
    (ge.prototype.L = function (i, c, l, f) {
      return this.i.add(String(i), c, !0, l, f);
    }));
  function Rr(i, c, l, f) {
    if (((c = i.i.g[String(c)]), !c)) return !0;
    c = c.concat();
    for (var w = !0, R = 0; R < c.length; ++R) {
      var V = c[R];
      if (V && !V.da && V.capture == l) {
        var Q = V.listener,
          le = V.ha || V.src;
        (V.fa && Xs(i.i, V), (w = Q.call(le, f) !== !1 && w));
      }
    }
    return w && !f.defaultPrevented;
  }
  function oa(i, c, l) {
    if (typeof i == 'function') l && (i = y(i, l));
    else if (i && typeof i.handleEvent == 'function') i = y(i.handleEvent, i);
    else throw Error('Invalid listener argument');
    return 2147483647 < Number(c) ? -1 : u.setTimeout(i, c || 0);
  }
  function aa(i) {
    i.g = oa(() => {
      ((i.g = null), i.i && ((i.i = !1), aa(i)));
    }, i.l);
    const c = i.h;
    ((i.h = null), i.m.apply(null, c));
  }
  class ad extends ut {
    constructor(c, l) {
      (super(), (this.m = c), (this.l = l), (this.h = null), (this.i = !1), (this.g = null));
    }
    j(c) {
      ((this.h = arguments), this.g ? (this.i = !0) : aa(this));
    }
    N() {
      (super.N(),
        this.g && (u.clearTimeout(this.g), (this.g = null), (this.i = !1), (this.h = null)));
    }
  }
  function Pn(i) {
    (ut.call(this), (this.h = i), (this.g = {}));
  }
  b(Pn, ut);
  var ca = [];
  function ua(i) {
    (pe(
      i.g,
      function (c, l) {
        this.g.hasOwnProperty(l) && ti(c);
      },
      i
    ),
      (i.g = {}));
  }
  ((Pn.prototype.N = function () {
    (Pn.aa.N.call(this), ua(this));
  }),
    (Pn.prototype.handleEvent = function () {
      throw Error('EventHandler.handleEvent not implemented');
    }));
  var si = u.JSON.stringify,
    cd = u.JSON.parse,
    ud = class {
      stringify(i) {
        return u.JSON.stringify(i, void 0);
      }
      parse(i) {
        return u.JSON.parse(i, void 0);
      }
    };
  function ii() {}
  ii.prototype.h = null;
  function la(i) {
    return i.h || (i.h = i.i());
  }
  function ha() {}
  var Cn = { OPEN: 'a', kb: 'b', Ja: 'c', wb: 'd' };
  function oi() {
    me.call(this, 'd');
  }
  b(oi, me);
  function ai() {
    me.call(this, 'c');
  }
  b(ai, me);
  var Nt = {},
    da = null;
  function Sr() {
    return (da = da || new ge());
  }
  Nt.La = 'serverreachability';
  function fa(i) {
    me.call(this, Nt.La, i);
  }
  b(fa, me);
  function bn(i) {
    const c = Sr();
    ve(c, new fa(c));
  }
  Nt.STAT_EVENT = 'statevent';
  function pa(i, c) {
    (me.call(this, Nt.STAT_EVENT, i), (this.stat = c));
  }
  b(pa, me);
  function we(i) {
    const c = Sr();
    ve(c, new pa(c, i));
  }
  Nt.Ma = 'timingevent';
  function ma(i, c) {
    (me.call(this, Nt.Ma, i), (this.size = c));
  }
  b(ma, me);
  function Vn(i, c) {
    if (typeof i != 'function') throw Error('Fn must not be null and must be a function');
    return u.setTimeout(function () {
      i();
    }, c);
  }
  function kn() {
    this.g = !0;
  }
  kn.prototype.xa = function () {
    this.g = !1;
  };
  function ld(i, c, l, f, w, R) {
    i.info(function () {
      if (i.g)
        if (R)
          for (var V = '', Q = R.split('&'), le = 0; le < Q.length; le++) {
            var G = Q[le].split('=');
            if (1 < G.length) {
              var _e = G[0];
              G = G[1];
              var ye = _e.split('_');
              V =
                2 <= ye.length && ye[1] == 'type'
                  ? V + (_e + '=' + G + '&')
                  : V + (_e + '=redacted&');
            }
          }
        else V = null;
      else V = R;
      return (
        'XMLHTTP REQ (' +
        f +
        ') [attempt ' +
        w +
        ']: ' +
        c +
        `
` +
        l +
        `
` +
        V
      );
    });
  }
  function hd(i, c, l, f, w, R, V) {
    i.info(function () {
      return (
        'XMLHTTP RESP (' +
        f +
        ') [ attempt ' +
        w +
        ']: ' +
        c +
        `
` +
        l +
        `
` +
        R +
        ' ' +
        V
      );
    });
  }
  function Yt(i, c, l, f) {
    i.info(function () {
      return 'XMLHTTP TEXT (' + c + '): ' + fd(i, l) + (f ? ' ' + f : '');
    });
  }
  function dd(i, c) {
    i.info(function () {
      return 'TIMEOUT: ' + c;
    });
  }
  kn.prototype.info = function () {};
  function fd(i, c) {
    if (!i.g) return c;
    if (!c) return null;
    try {
      var l = JSON.parse(c);
      if (l) {
        for (i = 0; i < l.length; i++)
          if (Array.isArray(l[i])) {
            var f = l[i];
            if (!(2 > f.length)) {
              var w = f[1];
              if (Array.isArray(w) && !(1 > w.length)) {
                var R = w[0];
                if (R != 'noop' && R != 'stop' && R != 'close')
                  for (var V = 1; V < w.length; V++) w[V] = '';
              }
            }
          }
      }
      return si(l);
    } catch {
      return c;
    }
  }
  var Pr = { NO_ERROR: 0, gb: 1, tb: 2, sb: 3, nb: 4, rb: 5, ub: 6, Ia: 7, TIMEOUT: 8, xb: 9 },
    ga = {
      lb: 'complete',
      Hb: 'success',
      Ja: 'error',
      Ia: 'abort',
      zb: 'ready',
      Ab: 'readystatechange',
      TIMEOUT: 'timeout',
      vb: 'incrementaldata',
      yb: 'progress',
      ob: 'downloadprogress',
      Pb: 'uploadprogress',
    },
    ci;
  function Cr() {}
  (b(Cr, ii),
    (Cr.prototype.g = function () {
      return new XMLHttpRequest();
    }),
    (Cr.prototype.i = function () {
      return {};
    }),
    (ci = new Cr()));
  function lt(i, c, l, f) {
    ((this.j = i),
      (this.i = c),
      (this.l = l),
      (this.R = f || 1),
      (this.U = new Pn(this)),
      (this.I = 45e3),
      (this.H = null),
      (this.o = !1),
      (this.m = this.A = this.v = this.L = this.F = this.S = this.B = null),
      (this.D = []),
      (this.g = null),
      (this.C = 0),
      (this.s = this.u = null),
      (this.X = -1),
      (this.J = !1),
      (this.O = 0),
      (this.M = null),
      (this.W = this.K = this.T = this.P = !1),
      (this.h = new _a()));
  }
  function _a() {
    ((this.i = null), (this.g = ''), (this.h = !1));
  }
  var ya = {},
    ui = {};
  function li(i, c, l) {
    ((i.L = 1), (i.v = Nr(Ye(c))), (i.m = l), (i.P = !0), Ea(i, null));
  }
  function Ea(i, c) {
    ((i.F = Date.now()), br(i), (i.A = Ye(i.v)));
    var l = i.A,
      f = i.R;
    (Array.isArray(f) || (f = [String(f)]),
      Da(l.i, 't', f),
      (i.C = 0),
      (l = i.j.J),
      (i.h = new _a()),
      (i.g = Xa(i.j, l ? c : null, !i.m)),
      0 < i.O && (i.M = new ad(y(i.Y, i, i.g), i.O)),
      (c = i.U),
      (l = i.g),
      (f = i.ca));
    var w = 'readystatechange';
    Array.isArray(w) || (w && (ca[0] = w.toString()), (w = ca));
    for (var R = 0; R < w.length; R++) {
      var V = na(l, w[R], f || c.handleEvent, !1, c.h || c);
      if (!V) break;
      c.g[V.key] = V;
    }
    ((c = i.H ? m(i.H) : {}),
      i.m
        ? (i.u || (i.u = 'POST'),
          (c['Content-Type'] = 'application/x-www-form-urlencoded'),
          i.g.ea(i.A, i.u, i.m, c))
        : ((i.u = 'GET'), i.g.ea(i.A, i.u, null, c)),
      bn(),
      ld(i.i, i.u, i.A, i.l, i.R, i.m));
  }
  ((lt.prototype.ca = function (i) {
    i = i.target;
    const c = this.M;
    c && Xe(i) == 3 ? c.j() : this.Y(i);
  }),
    (lt.prototype.Y = function (i) {
      try {
        if (i == this.g)
          e: {
            const ye = Xe(this.g);
            var c = this.g.Ba();
            const Zt = this.g.Z();
            if (!(3 > ye) && (ye != 3 || (this.g && (this.h.h || this.g.oa() || Ba(this.g))))) {
              (this.J || ye != 4 || c == 7 || (c == 8 || 0 >= Zt ? bn(3) : bn(2)), hi(this));
              var l = this.g.Z();
              this.X = l;
              t: if (Ia(this)) {
                var f = Ba(this.g);
                i = '';
                var w = f.length,
                  R = Xe(this.g) == 4;
                if (!this.h.i) {
                  if (typeof TextDecoder > 'u') {
                    (Dt(this), Nn(this));
                    var V = '';
                    break t;
                  }
                  this.h.i = new u.TextDecoder();
                }
                for (c = 0; c < w; c++)
                  ((this.h.h = !0), (i += this.h.i.decode(f[c], { stream: !(R && c == w - 1) })));
                ((f.length = 0), (this.h.g += i), (this.C = 0), (V = this.h.g));
              } else V = this.g.oa();
              if (
                ((this.o = l == 200), hd(this.i, this.u, this.A, this.l, this.R, ye, l), this.o)
              ) {
                if (this.T && !this.K) {
                  t: {
                    if (this.g) {
                      var Q,
                        le = this.g;
                      if (
                        (Q = le.g ? le.g.getResponseHeader('X-HTTP-Initial-Response') : null) &&
                        !B(Q)
                      ) {
                        var G = Q;
                        break t;
                      }
                    }
                    G = null;
                  }
                  if ((l = G))
                    (Yt(
                      this.i,
                      this.l,
                      l,
                      'Initial handshake response via X-HTTP-Initial-Response'
                    ),
                      (this.K = !0),
                      di(this, l));
                  else {
                    ((this.o = !1), (this.s = 3), we(12), Dt(this), Nn(this));
                    break e;
                  }
                }
                if (this.P) {
                  l = !0;
                  let Oe;
                  for (; !this.J && this.C < V.length; )
                    if (((Oe = pd(this, V)), Oe == ui)) {
                      (ye == 4 && ((this.s = 4), we(14), (l = !1)),
                        Yt(this.i, this.l, null, '[Incomplete Response]'));
                      break;
                    } else if (Oe == ya) {
                      ((this.s = 4), we(15), Yt(this.i, this.l, V, '[Invalid Chunk]'), (l = !1));
                      break;
                    } else (Yt(this.i, this.l, Oe, null), di(this, Oe));
                  if (
                    (Ia(this) && this.C != 0 && ((this.h.g = this.h.g.slice(this.C)), (this.C = 0)),
                    ye != 4 || V.length != 0 || this.h.h || ((this.s = 1), we(16), (l = !1)),
                    (this.o = this.o && l),
                    !l)
                  )
                    (Yt(this.i, this.l, V, '[Invalid Chunked Response]'), Dt(this), Nn(this));
                  else if (0 < V.length && !this.W) {
                    this.W = !0;
                    var _e = this.j;
                    _e.g == this &&
                      _e.ba &&
                      !_e.M &&
                      (_e.j.info('Great, no buffering proxy detected. Bytes received: ' + V.length),
                      yi(_e),
                      (_e.M = !0),
                      we(11));
                  }
                } else (Yt(this.i, this.l, V, null), di(this, V));
                (ye == 4 && Dt(this),
                  this.o && !this.J && (ye == 4 ? Ga(this.j, this) : ((this.o = !1), br(this))));
              } else
                (kd(this.g),
                  l == 400 && 0 < V.indexOf('Unknown SID')
                    ? ((this.s = 3), we(12))
                    : ((this.s = 0), we(13)),
                  Dt(this),
                  Nn(this));
            }
          }
      } catch {
      } finally {
      }
    }));
  function Ia(i) {
    return i.g ? i.u == 'GET' && i.L != 2 && i.j.Ca : !1;
  }
  function pd(i, c) {
    var l = i.C,
      f = c.indexOf(
        `
`,
        l
      );
    return f == -1
      ? ui
      : ((l = Number(c.substring(l, f))),
        isNaN(l)
          ? ya
          : ((f += 1), f + l > c.length ? ui : ((c = c.slice(f, f + l)), (i.C = f + l), c)));
  }
  lt.prototype.cancel = function () {
    ((this.J = !0), Dt(this));
  };
  function br(i) {
    ((i.S = Date.now() + i.I), Ta(i, i.I));
  }
  function Ta(i, c) {
    if (i.B != null) throw Error('WatchDog timer not null');
    i.B = Vn(y(i.ba, i), c);
  }
  function hi(i) {
    i.B && (u.clearTimeout(i.B), (i.B = null));
  }
  lt.prototype.ba = function () {
    this.B = null;
    const i = Date.now();
    0 <= i - this.S
      ? (dd(this.i, this.A), this.L != 2 && (bn(), we(17)), Dt(this), (this.s = 2), Nn(this))
      : Ta(this, this.S - i);
  };
  function Nn(i) {
    i.j.G == 0 || i.J || Ga(i.j, i);
  }
  function Dt(i) {
    hi(i);
    var c = i.M;
    (c && typeof c.ma == 'function' && c.ma(),
      (i.M = null),
      ua(i.U),
      i.g && ((c = i.g), (i.g = null), c.abort(), c.ma()));
  }
  function di(i, c) {
    try {
      var l = i.j;
      if (l.G != 0 && (l.g == i || fi(l.h, i))) {
        if (!i.K && fi(l.h, i) && l.G == 3) {
          try {
            var f = l.Da.g.parse(c);
          } catch {
            f = null;
          }
          if (Array.isArray(f) && f.length == 3) {
            var w = f;
            if (w[0] == 0) {
              e: if (!l.u) {
                if (l.g)
                  if (l.g.F + 3e3 < i.F) (Fr(l), Lr(l));
                  else break e;
                (_i(l), we(18));
              }
            } else
              ((l.za = w[1]),
                0 < l.za - l.T &&
                  37500 > w[2] &&
                  l.F &&
                  l.v == 0 &&
                  !l.C &&
                  (l.C = Vn(y(l.Za, l), 6e3)));
            if (1 >= Aa(l.h) && l.ca) {
              try {
                l.ca();
              } catch {}
              l.ca = void 0;
            }
          } else Mt(l, 11);
        } else if (((i.K || l.g == i) && Fr(l), !B(c)))
          for (w = l.Da.g.parse(c), c = 0; c < w.length; c++) {
            let G = w[c];
            if (((l.T = G[0]), (G = G[1]), l.G == 2))
              if (G[0] == 'c') {
                ((l.K = G[1]), (l.ia = G[2]));
                const _e = G[3];
                _e != null && ((l.la = _e), l.j.info('VER=' + l.la));
                const ye = G[4];
                ye != null && ((l.Aa = ye), l.j.info('SVER=' + l.Aa));
                const Zt = G[5];
                (Zt != null &&
                  typeof Zt == 'number' &&
                  0 < Zt &&
                  ((f = 1.5 * Zt), (l.L = f), l.j.info('backChannelRequestTimeoutMs_=' + f)),
                  (f = l));
                const Oe = i.g;
                if (Oe) {
                  const Br = Oe.g ? Oe.g.getResponseHeader('X-Client-Wire-Protocol') : null;
                  if (Br) {
                    var R = f.h;
                    R.g ||
                      (Br.indexOf('spdy') == -1 &&
                        Br.indexOf('quic') == -1 &&
                        Br.indexOf('h2') == -1) ||
                      ((R.j = R.l), (R.g = new Set()), R.h && (pi(R, R.h), (R.h = null)));
                  }
                  if (f.D) {
                    const Ei = Oe.g ? Oe.g.getResponseHeader('X-HTTP-Session-Id') : null;
                    Ei && ((f.ya = Ei), X(f.I, f.D, Ei));
                  }
                }
                ((l.G = 3),
                  l.l && l.l.ua(),
                  l.ba && ((l.R = Date.now() - i.F), l.j.info('Handshake RTT: ' + l.R + 'ms')),
                  (f = l));
                var V = i;
                if (((f.qa = Ya(f, f.J ? f.ia : null, f.W)), V.K)) {
                  Ra(f.h, V);
                  var Q = V,
                    le = f.L;
                  (le && (Q.I = le), Q.B && (hi(Q), br(Q)), (f.g = V));
                } else Ha(f);
                0 < l.i.length && xr(l);
              } else (G[0] != 'stop' && G[0] != 'close') || Mt(l, 7);
            else
              l.G == 3 &&
                (G[0] == 'stop' || G[0] == 'close'
                  ? G[0] == 'stop'
                    ? Mt(l, 7)
                    : gi(l)
                  : G[0] != 'noop' && l.l && l.l.ta(G),
                (l.v = 0));
          }
      }
      bn(4);
    } catch {}
  }
  var md = class {
    constructor(i, c) {
      ((this.g = i), (this.map = c));
    }
  };
  function va(i) {
    ((this.l = i || 10),
      u.PerformanceNavigationTiming
        ? ((i = u.performance.getEntriesByType('navigation')),
          (i = 0 < i.length && (i[0].nextHopProtocol == 'hq' || i[0].nextHopProtocol == 'h2')))
        : (i = !!(
            u.chrome &&
            u.chrome.loadTimes &&
            u.chrome.loadTimes() &&
            u.chrome.loadTimes().wasFetchedViaSpdy
          )),
      (this.j = i ? this.l : 1),
      (this.g = null),
      1 < this.j && (this.g = new Set()),
      (this.h = null),
      (this.i = []));
  }
  function wa(i) {
    return i.h ? !0 : i.g ? i.g.size >= i.j : !1;
  }
  function Aa(i) {
    return i.h ? 1 : i.g ? i.g.size : 0;
  }
  function fi(i, c) {
    return i.h ? i.h == c : i.g ? i.g.has(c) : !1;
  }
  function pi(i, c) {
    i.g ? i.g.add(c) : (i.h = c);
  }
  function Ra(i, c) {
    i.h && i.h == c ? (i.h = null) : i.g && i.g.has(c) && i.g.delete(c);
  }
  va.prototype.cancel = function () {
    if (((this.i = Sa(this)), this.h)) (this.h.cancel(), (this.h = null));
    else if (this.g && this.g.size !== 0) {
      for (const i of this.g.values()) i.cancel();
      this.g.clear();
    }
  };
  function Sa(i) {
    if (i.h != null) return i.i.concat(i.h.D);
    if (i.g != null && i.g.size !== 0) {
      let c = i.i;
      for (const l of i.g.values()) c = c.concat(l.D);
      return c;
    }
    return O(i.i);
  }
  function gd(i) {
    if (i.V && typeof i.V == 'function') return i.V();
    if ((typeof Map < 'u' && i instanceof Map) || (typeof Set < 'u' && i instanceof Set))
      return Array.from(i.values());
    if (typeof i == 'string') return i.split('');
    if (h(i)) {
      for (var c = [], l = i.length, f = 0; f < l; f++) c.push(i[f]);
      return c;
    }
    ((c = []), (l = 0));
    for (f in i) c[l++] = i[f];
    return c;
  }
  function _d(i) {
    if (i.na && typeof i.na == 'function') return i.na();
    if (!i.V || typeof i.V != 'function') {
      if (typeof Map < 'u' && i instanceof Map) return Array.from(i.keys());
      if (!(typeof Set < 'u' && i instanceof Set)) {
        if (h(i) || typeof i == 'string') {
          var c = [];
          i = i.length;
          for (var l = 0; l < i; l++) c.push(l);
          return c;
        }
        ((c = []), (l = 0));
        for (const f in i) c[l++] = f;
        return c;
      }
    }
  }
  function Pa(i, c) {
    if (i.forEach && typeof i.forEach == 'function') i.forEach(c, void 0);
    else if (h(i) || typeof i == 'string') Array.prototype.forEach.call(i, c, void 0);
    else
      for (var l = _d(i), f = gd(i), w = f.length, R = 0; R < w; R++)
        c.call(void 0, f[R], l && l[R], i);
  }
  var Ca = RegExp(
    '^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$'
  );
  function yd(i, c) {
    if (i) {
      i = i.split('&');
      for (var l = 0; l < i.length; l++) {
        var f = i[l].indexOf('='),
          w = null;
        if (0 <= f) {
          var R = i[l].substring(0, f);
          w = i[l].substring(f + 1);
        } else R = i[l];
        c(R, w ? decodeURIComponent(w.replace(/\+/g, ' ')) : '');
      }
    }
  }
  function Ot(i) {
    if (
      ((this.g = this.o = this.j = ''),
      (this.s = null),
      (this.m = this.l = ''),
      (this.h = !1),
      i instanceof Ot)
    ) {
      ((this.h = i.h),
        Vr(this, i.j),
        (this.o = i.o),
        (this.g = i.g),
        kr(this, i.s),
        (this.l = i.l));
      var c = i.i,
        l = new Mn();
      ((l.i = c.i), c.g && ((l.g = new Map(c.g)), (l.h = c.h)), ba(this, l), (this.m = i.m));
    } else
      i && (c = String(i).match(Ca))
        ? ((this.h = !1),
          Vr(this, c[1] || '', !0),
          (this.o = Dn(c[2] || '')),
          (this.g = Dn(c[3] || '', !0)),
          kr(this, c[4]),
          (this.l = Dn(c[5] || '', !0)),
          ba(this, c[6] || '', !0),
          (this.m = Dn(c[7] || '')))
        : ((this.h = !1), (this.i = new Mn(null, this.h)));
  }
  Ot.prototype.toString = function () {
    var i = [],
      c = this.j;
    c && i.push(On(c, Va, !0), ':');
    var l = this.g;
    return (
      (l || c == 'file') &&
        (i.push('//'),
        (c = this.o) && i.push(On(c, Va, !0), '@'),
        i.push(encodeURIComponent(String(l)).replace(/%25([0-9a-fA-F]{2})/g, '%$1')),
        (l = this.s),
        l != null && i.push(':', String(l))),
      (l = this.l) &&
        (this.g && l.charAt(0) != '/' && i.push('/'),
        i.push(On(l, l.charAt(0) == '/' ? Td : Id, !0))),
      (l = this.i.toString()) && i.push('?', l),
      (l = this.m) && i.push('#', On(l, wd)),
      i.join('')
    );
  };
  function Ye(i) {
    return new Ot(i);
  }
  function Vr(i, c, l) {
    ((i.j = l ? Dn(c, !0) : c), i.j && (i.j = i.j.replace(/:$/, '')));
  }
  function kr(i, c) {
    if (c) {
      if (((c = Number(c)), isNaN(c) || 0 > c)) throw Error('Bad port number ' + c);
      i.s = c;
    } else i.s = null;
  }
  function ba(i, c, l) {
    c instanceof Mn ? ((i.i = c), Ad(i.i, i.h)) : (l || (c = On(c, vd)), (i.i = new Mn(c, i.h)));
  }
  function X(i, c, l) {
    i.i.set(c, l);
  }
  function Nr(i) {
    return (
      X(
        i,
        'zx',
        Math.floor(2147483648 * Math.random()).toString(36) +
          Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36)
      ),
      i
    );
  }
  function Dn(i, c) {
    return i ? (c ? decodeURI(i.replace(/%25/g, '%2525')) : decodeURIComponent(i)) : '';
  }
  function On(i, c, l) {
    return typeof i == 'string'
      ? ((i = encodeURI(i).replace(c, Ed)), l && (i = i.replace(/%25([0-9a-fA-F]{2})/g, '%$1')), i)
      : null;
  }
  function Ed(i) {
    return ((i = i.charCodeAt(0)), '%' + ((i >> 4) & 15).toString(16) + (i & 15).toString(16));
  }
  var Va = /[#\/\?@]/g,
    Id = /[#\?:]/g,
    Td = /[#\?]/g,
    vd = /[#\?@]/g,
    wd = /#/g;
  function Mn(i, c) {
    ((this.h = this.g = null), (this.i = i || null), (this.j = !!c));
  }
  function ht(i) {
    i.g ||
      ((i.g = new Map()),
      (i.h = 0),
      i.i &&
        yd(i.i, function (c, l) {
          i.add(decodeURIComponent(c.replace(/\+/g, ' ')), l);
        }));
  }
  ((n = Mn.prototype),
    (n.add = function (i, c) {
      (ht(this), (this.i = null), (i = Xt(this, i)));
      var l = this.g.get(i);
      return (l || this.g.set(i, (l = [])), l.push(c), (this.h += 1), this);
    }));
  function ka(i, c) {
    (ht(i),
      (c = Xt(i, c)),
      i.g.has(c) && ((i.i = null), (i.h -= i.g.get(c).length), i.g.delete(c)));
  }
  function Na(i, c) {
    return (ht(i), (c = Xt(i, c)), i.g.has(c));
  }
  ((n.forEach = function (i, c) {
    (ht(this),
      this.g.forEach(function (l, f) {
        l.forEach(function (w) {
          i.call(c, w, f, this);
        }, this);
      }, this));
  }),
    (n.na = function () {
      ht(this);
      const i = Array.from(this.g.values()),
        c = Array.from(this.g.keys()),
        l = [];
      for (let f = 0; f < c.length; f++) {
        const w = i[f];
        for (let R = 0; R < w.length; R++) l.push(c[f]);
      }
      return l;
    }),
    (n.V = function (i) {
      ht(this);
      let c = [];
      if (typeof i == 'string') Na(this, i) && (c = c.concat(this.g.get(Xt(this, i))));
      else {
        i = Array.from(this.g.values());
        for (let l = 0; l < i.length; l++) c = c.concat(i[l]);
      }
      return c;
    }),
    (n.set = function (i, c) {
      return (
        ht(this),
        (this.i = null),
        (i = Xt(this, i)),
        Na(this, i) && (this.h -= this.g.get(i).length),
        this.g.set(i, [c]),
        (this.h += 1),
        this
      );
    }),
    (n.get = function (i, c) {
      return i ? ((i = this.V(i)), 0 < i.length ? String(i[0]) : c) : c;
    }));
  function Da(i, c, l) {
    (ka(i, c), 0 < l.length && ((i.i = null), i.g.set(Xt(i, c), O(l)), (i.h += l.length)));
  }
  n.toString = function () {
    if (this.i) return this.i;
    if (!this.g) return '';
    const i = [],
      c = Array.from(this.g.keys());
    for (var l = 0; l < c.length; l++) {
      var f = c[l];
      const R = encodeURIComponent(String(f)),
        V = this.V(f);
      for (f = 0; f < V.length; f++) {
        var w = R;
        (V[f] !== '' && (w += '=' + encodeURIComponent(String(V[f]))), i.push(w));
      }
    }
    return (this.i = i.join('&'));
  };
  function Xt(i, c) {
    return ((c = String(c)), i.j && (c = c.toLowerCase()), c);
  }
  function Ad(i, c) {
    (c &&
      !i.j &&
      (ht(i),
      (i.i = null),
      i.g.forEach(function (l, f) {
        var w = f.toLowerCase();
        f != w && (ka(this, f), Da(this, w, l));
      }, i)),
      (i.j = c));
  }
  function Rd(i, c) {
    const l = new kn();
    if (u.Image) {
      const f = new Image();
      ((f.onload = C(dt, l, 'TestLoadImage: loaded', !0, c, f)),
        (f.onerror = C(dt, l, 'TestLoadImage: error', !1, c, f)),
        (f.onabort = C(dt, l, 'TestLoadImage: abort', !1, c, f)),
        (f.ontimeout = C(dt, l, 'TestLoadImage: timeout', !1, c, f)),
        u.setTimeout(function () {
          f.ontimeout && f.ontimeout();
        }, 1e4),
        (f.src = i));
    } else c(!1);
  }
  function Sd(i, c) {
    const l = new kn(),
      f = new AbortController(),
      w = setTimeout(() => {
        (f.abort(), dt(l, 'TestPingServer: timeout', !1, c));
      }, 1e4);
    fetch(i, { signal: f.signal })
      .then((R) => {
        (clearTimeout(w),
          R.ok ? dt(l, 'TestPingServer: ok', !0, c) : dt(l, 'TestPingServer: server error', !1, c));
      })
      .catch(() => {
        (clearTimeout(w), dt(l, 'TestPingServer: error', !1, c));
      });
  }
  function dt(i, c, l, f, w) {
    try {
      (w && ((w.onload = null), (w.onerror = null), (w.onabort = null), (w.ontimeout = null)),
        f(l));
    } catch {}
  }
  function Pd() {
    this.g = new ud();
  }
  function Cd(i, c, l) {
    const f = l || '';
    try {
      Pa(i, function (w, R) {
        let V = w;
        (d(w) && (V = si(w)), c.push(f + R + '=' + encodeURIComponent(V)));
      });
    } catch (w) {
      throw (c.push(f + 'type=' + encodeURIComponent('_badmap')), w);
    }
  }
  function Dr(i) {
    ((this.l = i.Ub || null), (this.j = i.eb || !1));
  }
  (b(Dr, ii),
    (Dr.prototype.g = function () {
      return new Or(this.l, this.j);
    }),
    (Dr.prototype.i = (function (i) {
      return function () {
        return i;
      };
    })({})));
  function Or(i, c) {
    (ge.call(this),
      (this.D = i),
      (this.o = c),
      (this.m = void 0),
      (this.status = this.readyState = 0),
      (this.responseType = this.responseText = this.response = this.statusText = ''),
      (this.onreadystatechange = null),
      (this.u = new Headers()),
      (this.h = null),
      (this.B = 'GET'),
      (this.A = ''),
      (this.g = !1),
      (this.v = this.j = this.l = null));
  }
  (b(Or, ge),
    (n = Or.prototype),
    (n.open = function (i, c) {
      if (this.readyState != 0) throw (this.abort(), Error('Error reopening a connection'));
      ((this.B = i), (this.A = c), (this.readyState = 1), xn(this));
    }),
    (n.send = function (i) {
      if (this.readyState != 1) throw (this.abort(), Error('need to call open() first. '));
      this.g = !0;
      const c = { headers: this.u, method: this.B, credentials: this.m, cache: void 0 };
      (i && (c.body = i),
        (this.D || u).fetch(new Request(this.A, c)).then(this.Sa.bind(this), this.ga.bind(this)));
    }),
    (n.abort = function () {
      ((this.response = this.responseText = ''),
        (this.u = new Headers()),
        (this.status = 0),
        this.j && this.j.cancel('Request was aborted.').catch(() => {}),
        1 <= this.readyState && this.g && this.readyState != 4 && ((this.g = !1), Ln(this)),
        (this.readyState = 0));
    }),
    (n.Sa = function (i) {
      if (
        this.g &&
        ((this.l = i),
        this.h ||
          ((this.status = this.l.status),
          (this.statusText = this.l.statusText),
          (this.h = i.headers),
          (this.readyState = 2),
          xn(this)),
        this.g && ((this.readyState = 3), xn(this), this.g))
      )
        if (this.responseType === 'arraybuffer')
          i.arrayBuffer().then(this.Qa.bind(this), this.ga.bind(this));
        else if (typeof u.ReadableStream < 'u' && 'body' in i) {
          if (((this.j = i.body.getReader()), this.o)) {
            if (this.responseType)
              throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
            this.response = [];
          } else ((this.response = this.responseText = ''), (this.v = new TextDecoder()));
          Oa(this);
        } else i.text().then(this.Ra.bind(this), this.ga.bind(this));
    }));
  function Oa(i) {
    i.j.read().then(i.Pa.bind(i)).catch(i.ga.bind(i));
  }
  ((n.Pa = function (i) {
    if (this.g) {
      if (this.o && i.value) this.response.push(i.value);
      else if (!this.o) {
        var c = i.value ? i.value : new Uint8Array(0);
        (c = this.v.decode(c, { stream: !i.done })) && (this.response = this.responseText += c);
      }
      (i.done ? Ln(this) : xn(this), this.readyState == 3 && Oa(this));
    }
  }),
    (n.Ra = function (i) {
      this.g && ((this.response = this.responseText = i), Ln(this));
    }),
    (n.Qa = function (i) {
      this.g && ((this.response = i), Ln(this));
    }),
    (n.ga = function () {
      this.g && Ln(this);
    }));
  function Ln(i) {
    ((i.readyState = 4), (i.l = null), (i.j = null), (i.v = null), xn(i));
  }
  ((n.setRequestHeader = function (i, c) {
    this.u.append(i, c);
  }),
    (n.getResponseHeader = function (i) {
      return (this.h && this.h.get(i.toLowerCase())) || '';
    }),
    (n.getAllResponseHeaders = function () {
      if (!this.h) return '';
      const i = [],
        c = this.h.entries();
      for (var l = c.next(); !l.done; ) ((l = l.value), i.push(l[0] + ': ' + l[1]), (l = c.next()));
      return i.join(`\r
`);
    }));
  function xn(i) {
    i.onreadystatechange && i.onreadystatechange.call(i);
  }
  Object.defineProperty(Or.prototype, 'withCredentials', {
    get: function () {
      return this.m === 'include';
    },
    set: function (i) {
      this.m = i ? 'include' : 'same-origin';
    },
  });
  function Ma(i) {
    let c = '';
    return (
      pe(i, function (l, f) {
        ((c += f),
          (c += ':'),
          (c += l),
          (c += `\r
`));
      }),
      c
    );
  }
  function mi(i, c, l) {
    e: {
      for (f in l) {
        var f = !1;
        break e;
      }
      f = !0;
    }
    f ||
      ((l = Ma(l)), typeof i == 'string' ? l != null && encodeURIComponent(String(l)) : X(i, c, l));
  }
  function ee(i) {
    (ge.call(this),
      (this.headers = new Map()),
      (this.o = i || null),
      (this.h = !1),
      (this.v = this.g = null),
      (this.D = ''),
      (this.m = 0),
      (this.l = ''),
      (this.j = this.B = this.u = this.A = !1),
      (this.I = null),
      (this.H = ''),
      (this.J = !1));
  }
  b(ee, ge);
  var bd = /^https?$/i,
    Vd = ['POST', 'PUT'];
  ((n = ee.prototype),
    (n.Ha = function (i) {
      this.J = i;
    }),
    (n.ea = function (i, c, l, f) {
      if (this.g)
        throw Error(
          '[goog.net.XhrIo] Object is active with another request=' + this.D + '; newUri=' + i
        );
      ((c = c ? c.toUpperCase() : 'GET'),
        (this.D = i),
        (this.l = ''),
        (this.m = 0),
        (this.A = !1),
        (this.h = !0),
        (this.g = this.o ? this.o.g() : ci.g()),
        (this.v = this.o ? la(this.o) : la(ci)),
        (this.g.onreadystatechange = y(this.Ea, this)));
      try {
        ((this.B = !0), this.g.open(c, String(i), !0), (this.B = !1));
      } catch (R) {
        La(this, R);
        return;
      }
      if (((i = l || ''), (l = new Map(this.headers)), f))
        if (Object.getPrototypeOf(f) === Object.prototype) for (var w in f) l.set(w, f[w]);
        else if (typeof f.keys == 'function' && typeof f.get == 'function')
          for (const R of f.keys()) l.set(R, f.get(R));
        else throw Error('Unknown input type for opt_headers: ' + String(f));
      ((f = Array.from(l.keys()).find((R) => R.toLowerCase() == 'content-type')),
        (w = u.FormData && i instanceof u.FormData),
        !(0 <= Array.prototype.indexOf.call(Vd, c, void 0)) ||
          f ||
          w ||
          l.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8'));
      for (const [R, V] of l) this.g.setRequestHeader(R, V);
      (this.H && (this.g.responseType = this.H),
        'withCredentials' in this.g &&
          this.g.withCredentials !== this.J &&
          (this.g.withCredentials = this.J));
      try {
        (Ua(this), (this.u = !0), this.g.send(i), (this.u = !1));
      } catch (R) {
        La(this, R);
      }
    }));
  function La(i, c) {
    ((i.h = !1), i.g && ((i.j = !0), i.g.abort(), (i.j = !1)), (i.l = c), (i.m = 5), xa(i), Mr(i));
  }
  function xa(i) {
    i.A || ((i.A = !0), ve(i, 'complete'), ve(i, 'error'));
  }
  ((n.abort = function (i) {
    this.g &&
      this.h &&
      ((this.h = !1),
      (this.j = !0),
      this.g.abort(),
      (this.j = !1),
      (this.m = i || 7),
      ve(this, 'complete'),
      ve(this, 'abort'),
      Mr(this));
  }),
    (n.N = function () {
      (this.g &&
        (this.h && ((this.h = !1), (this.j = !0), this.g.abort(), (this.j = !1)), Mr(this, !0)),
        ee.aa.N.call(this));
    }),
    (n.Ea = function () {
      this.s || (this.B || this.u || this.j ? Fa(this) : this.bb());
    }),
    (n.bb = function () {
      Fa(this);
    }));
  function Fa(i) {
    if (i.h && typeof a < 'u' && (!i.v[1] || Xe(i) != 4 || i.Z() != 2)) {
      if (i.u && Xe(i) == 4) oa(i.Ea, 0, i);
      else if ((ve(i, 'readystatechange'), Xe(i) == 4)) {
        i.h = !1;
        try {
          const V = i.Z();
          e: switch (V) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var c = !0;
              break e;
            default:
              c = !1;
          }
          var l;
          if (!(l = c)) {
            var f;
            if ((f = V === 0)) {
              var w = String(i.D).match(Ca)[1] || null;
              (!w && u.self && u.self.location && (w = u.self.location.protocol.slice(0, -1)),
                (f = !bd.test(w ? w.toLowerCase() : '')));
            }
            l = f;
          }
          if (l) (ve(i, 'complete'), ve(i, 'success'));
          else {
            i.m = 6;
            try {
              var R = 2 < Xe(i) ? i.g.statusText : '';
            } catch {
              R = '';
            }
            ((i.l = R + ' [' + i.Z() + ']'), xa(i));
          }
        } finally {
          Mr(i);
        }
      }
    }
  }
  function Mr(i, c) {
    if (i.g) {
      Ua(i);
      const l = i.g,
        f = i.v[0] ? () => {} : null;
      ((i.g = null), (i.v = null), c || ve(i, 'ready'));
      try {
        l.onreadystatechange = f;
      } catch {}
    }
  }
  function Ua(i) {
    i.I && (u.clearTimeout(i.I), (i.I = null));
  }
  n.isActive = function () {
    return !!this.g;
  };
  function Xe(i) {
    return i.g ? i.g.readyState : 0;
  }
  ((n.Z = function () {
    try {
      return 2 < Xe(this) ? this.g.status : -1;
    } catch {
      return -1;
    }
  }),
    (n.oa = function () {
      try {
        return this.g ? this.g.responseText : '';
      } catch {
        return '';
      }
    }),
    (n.Oa = function (i) {
      if (this.g) {
        var c = this.g.responseText;
        return (i && c.indexOf(i) == 0 && (c = c.substring(i.length)), cd(c));
      }
    }));
  function Ba(i) {
    try {
      if (!i.g) return null;
      if ('response' in i.g) return i.g.response;
      switch (i.H) {
        case '':
        case 'text':
          return i.g.responseText;
        case 'arraybuffer':
          if ('mozResponseArrayBuffer' in i.g) return i.g.mozResponseArrayBuffer;
      }
      return null;
    } catch {
      return null;
    }
  }
  function kd(i) {
    const c = {};
    i = ((i.g && 2 <= Xe(i) && i.g.getAllResponseHeaders()) || '').split(`\r
`);
    for (let f = 0; f < i.length; f++) {
      if (B(i[f])) continue;
      var l = T(i[f]);
      const w = l[0];
      if (((l = l[1]), typeof l != 'string')) continue;
      l = l.trim();
      const R = c[w] || [];
      ((c[w] = R), R.push(l));
    }
    v(c, function (f) {
      return f.join(', ');
    });
  }
  ((n.Ba = function () {
    return this.m;
  }),
    (n.Ka = function () {
      return typeof this.l == 'string' ? this.l : String(this.l);
    }));
  function Fn(i, c, l) {
    return (l && l.internalChannelParams && l.internalChannelParams[i]) || c;
  }
  function qa(i) {
    ((this.Aa = 0),
      (this.i = []),
      (this.j = new kn()),
      (this.ia =
        this.qa =
        this.I =
        this.W =
        this.g =
        this.ya =
        this.D =
        this.H =
        this.m =
        this.S =
        this.o =
          null),
      (this.Ya = this.U = 0),
      (this.Va = Fn('failFast', !1, i)),
      (this.F = this.C = this.u = this.s = this.l = null),
      (this.X = !0),
      (this.za = this.T = -1),
      (this.Y = this.v = this.B = 0),
      (this.Ta = Fn('baseRetryDelayMs', 5e3, i)),
      (this.cb = Fn('retryDelaySeedMs', 1e4, i)),
      (this.Wa = Fn('forwardChannelMaxRetries', 2, i)),
      (this.wa = Fn('forwardChannelRequestTimeoutMs', 2e4, i)),
      (this.pa = (i && i.xmlHttpFactory) || void 0),
      (this.Xa = (i && i.Tb) || void 0),
      (this.Ca = (i && i.useFetchStreams) || !1),
      (this.L = void 0),
      (this.J = (i && i.supportsCrossDomainXhr) || !1),
      (this.K = ''),
      (this.h = new va(i && i.concurrentRequestLimit)),
      (this.Da = new Pd()),
      (this.P = (i && i.fastHandshake) || !1),
      (this.O = (i && i.encodeInitMessageHeaders) || !1),
      this.P && this.O && (this.O = !1),
      (this.Ua = (i && i.Rb) || !1),
      i && i.xa && this.j.xa(),
      i && i.forceLongPolling && (this.X = !1),
      (this.ba = (!this.P && this.X && i && i.detectBufferingProxy) || !1),
      (this.ja = void 0),
      i && i.longPollingTimeout && 0 < i.longPollingTimeout && (this.ja = i.longPollingTimeout),
      (this.ca = void 0),
      (this.R = 0),
      (this.M = !1),
      (this.ka = this.A = null));
  }
  ((n = qa.prototype),
    (n.la = 8),
    (n.G = 1),
    (n.connect = function (i, c, l, f) {
      (we(0),
        (this.W = i),
        (this.H = c || {}),
        l && f !== void 0 && ((this.H.OSID = l), (this.H.OAID = f)),
        (this.F = this.X),
        (this.I = Ya(this, null, this.W)),
        xr(this));
    }));
  function gi(i) {
    if ((ja(i), i.G == 3)) {
      var c = i.U++,
        l = Ye(i.I);
      if (
        (X(l, 'SID', i.K),
        X(l, 'RID', c),
        X(l, 'TYPE', 'terminate'),
        Un(i, l),
        (c = new lt(i, i.j, c)),
        (c.L = 2),
        (c.v = Nr(Ye(l))),
        (l = !1),
        u.navigator && u.navigator.sendBeacon)
      )
        try {
          l = u.navigator.sendBeacon(c.v.toString(), '');
        } catch {}
      (!l && u.Image && ((new Image().src = c.v), (l = !0)),
        l || ((c.g = Xa(c.j, null)), c.g.ea(c.v)),
        (c.F = Date.now()),
        br(c));
    }
    Qa(i);
  }
  function Lr(i) {
    i.g && (yi(i), i.g.cancel(), (i.g = null));
  }
  function ja(i) {
    (Lr(i),
      i.u && (u.clearTimeout(i.u), (i.u = null)),
      Fr(i),
      i.h.cancel(),
      i.s && (typeof i.s == 'number' && u.clearTimeout(i.s), (i.s = null)));
  }
  function xr(i) {
    if (!wa(i.h) && !i.s) {
      i.s = !0;
      var c = i.Ga;
      (An || ta(), Rn || (An(), (Rn = !0)), Ys.add(c, i), (i.B = 0));
    }
  }
  function Nd(i, c) {
    return Aa(i.h) >= i.h.j - (i.s ? 1 : 0)
      ? !1
      : i.s
        ? ((i.i = c.D.concat(i.i)), !0)
        : i.G == 1 || i.G == 2 || i.B >= (i.Va ? 0 : i.Wa)
          ? !1
          : ((i.s = Vn(y(i.Ga, i, c), Ka(i, i.B))), i.B++, !0);
  }
  n.Ga = function (i) {
    if (this.s)
      if (((this.s = null), this.G == 1)) {
        if (!i) {
          ((this.U = Math.floor(1e5 * Math.random())), (i = this.U++));
          const w = new lt(this, this.j, i);
          let R = this.o;
          if (
            (this.S && (R ? ((R = m(R)), I(R, this.S)) : (R = this.S)),
            this.m !== null || this.O || ((w.H = R), (R = null)),
            this.P)
          )
            e: {
              for (var c = 0, l = 0; l < this.i.length; l++) {
                t: {
                  var f = this.i[l];
                  if ('__data__' in f.map && ((f = f.map.__data__), typeof f == 'string')) {
                    f = f.length;
                    break t;
                  }
                  f = void 0;
                }
                if (f === void 0) break;
                if (((c += f), 4096 < c)) {
                  c = l;
                  break e;
                }
                if (c === 4096 || l === this.i.length - 1) {
                  c = l + 1;
                  break e;
                }
              }
              c = 1e3;
            }
          else c = 1e3;
          ((c = za(this, w, c)),
            (l = Ye(this.I)),
            X(l, 'RID', i),
            X(l, 'CVER', 22),
            this.D && X(l, 'X-HTTP-Session-Id', this.D),
            Un(this, l),
            R &&
              (this.O
                ? (c = 'headers=' + encodeURIComponent(String(Ma(R))) + '&' + c)
                : this.m && mi(l, this.m, R)),
            pi(this.h, w),
            this.Ua && X(l, 'TYPE', 'init'),
            this.P
              ? (X(l, '$req', c), X(l, 'SID', 'null'), (w.T = !0), li(w, l, null))
              : li(w, l, c),
            (this.G = 2));
        }
      } else this.G == 3 && (i ? $a(this, i) : this.i.length == 0 || wa(this.h) || $a(this));
  };
  function $a(i, c) {
    var l;
    c ? (l = c.l) : (l = i.U++);
    const f = Ye(i.I);
    (X(f, 'SID', i.K),
      X(f, 'RID', l),
      X(f, 'AID', i.T),
      Un(i, f),
      i.m && i.o && mi(f, i.m, i.o),
      (l = new lt(i, i.j, l, i.B + 1)),
      i.m === null && (l.H = i.o),
      c && (i.i = c.D.concat(i.i)),
      (c = za(i, l, 1e3)),
      (l.I = Math.round(0.5 * i.wa) + Math.round(0.5 * i.wa * Math.random())),
      pi(i.h, l),
      li(l, f, c));
  }
  function Un(i, c) {
    (i.H &&
      pe(i.H, function (l, f) {
        X(c, f, l);
      }),
      i.l &&
        Pa({}, function (l, f) {
          X(c, f, l);
        }));
  }
  function za(i, c, l) {
    l = Math.min(i.i.length, l);
    var f = i.l ? y(i.l.Na, i.l, i) : null;
    e: {
      var w = i.i;
      let R = -1;
      for (;;) {
        const V = ['count=' + l];
        R == -1 ? (0 < l ? ((R = w[0].g), V.push('ofs=' + R)) : (R = 0)) : V.push('ofs=' + R);
        let Q = !0;
        for (let le = 0; le < l; le++) {
          let G = w[le].g;
          const _e = w[le].map;
          if (((G -= R), 0 > G)) ((R = Math.max(0, w[le].g - 100)), (Q = !1));
          else
            try {
              Cd(_e, V, 'req' + G + '_');
            } catch {
              f && f(_e);
            }
        }
        if (Q) {
          f = V.join('&');
          break e;
        }
      }
    }
    return ((i = i.i.splice(0, l)), (c.D = i), f);
  }
  function Ha(i) {
    if (!i.g && !i.u) {
      i.Y = 1;
      var c = i.Fa;
      (An || ta(), Rn || (An(), (Rn = !0)), Ys.add(c, i), (i.v = 0));
    }
  }
  function _i(i) {
    return i.g || i.u || 3 <= i.v ? !1 : (i.Y++, (i.u = Vn(y(i.Fa, i), Ka(i, i.v))), i.v++, !0);
  }
  ((n.Fa = function () {
    if (((this.u = null), Wa(this), this.ba && !(this.M || this.g == null || 0 >= this.R))) {
      var i = 2 * this.R;
      (this.j.info('BP detection timer enabled: ' + i), (this.A = Vn(y(this.ab, this), i)));
    }
  }),
    (n.ab = function () {
      this.A &&
        ((this.A = null),
        this.j.info('BP detection timeout reached.'),
        this.j.info('Buffering proxy detected and switch to long-polling!'),
        (this.F = !1),
        (this.M = !0),
        we(10),
        Lr(this),
        Wa(this));
    }));
  function yi(i) {
    i.A != null && (u.clearTimeout(i.A), (i.A = null));
  }
  function Wa(i) {
    ((i.g = new lt(i, i.j, 'rpc', i.Y)), i.m === null && (i.g.H = i.o), (i.g.O = 0));
    var c = Ye(i.qa);
    (X(c, 'RID', 'rpc'),
      X(c, 'SID', i.K),
      X(c, 'AID', i.T),
      X(c, 'CI', i.F ? '0' : '1'),
      !i.F && i.ja && X(c, 'TO', i.ja),
      X(c, 'TYPE', 'xmlhttp'),
      Un(i, c),
      i.m && i.o && mi(c, i.m, i.o),
      i.L && (i.g.I = i.L));
    var l = i.g;
    ((i = i.ia), (l.L = 1), (l.v = Nr(Ye(c))), (l.m = null), (l.P = !0), Ea(l, i));
  }
  n.Za = function () {
    this.C != null && ((this.C = null), Lr(this), _i(this), we(19));
  };
  function Fr(i) {
    i.C != null && (u.clearTimeout(i.C), (i.C = null));
  }
  function Ga(i, c) {
    var l = null;
    if (i.g == c) {
      (Fr(i), yi(i), (i.g = null));
      var f = 2;
    } else if (fi(i.h, c)) ((l = c.D), Ra(i.h, c), (f = 1));
    else return;
    if (i.G != 0) {
      if (c.o)
        if (f == 1) {
          ((l = c.m ? c.m.length : 0), (c = Date.now() - c.F));
          var w = i.B;
          ((f = Sr()), ve(f, new ma(f, l)), xr(i));
        } else Ha(i);
      else if (
        ((w = c.s), w == 3 || (w == 0 && 0 < c.X) || !((f == 1 && Nd(i, c)) || (f == 2 && _i(i))))
      )
        switch ((l && 0 < l.length && ((c = i.h), (c.i = c.i.concat(l))), w)) {
          case 1:
            Mt(i, 5);
            break;
          case 4:
            Mt(i, 10);
            break;
          case 3:
            Mt(i, 6);
            break;
          default:
            Mt(i, 2);
        }
    }
  }
  function Ka(i, c) {
    let l = i.Ta + Math.floor(Math.random() * i.cb);
    return (i.isActive() || (l *= 2), l * c);
  }
  function Mt(i, c) {
    if ((i.j.info('Error code ' + c), c == 2)) {
      var l = y(i.fb, i),
        f = i.Xa;
      const w = !f;
      ((f = new Ot(f || '//www.google.com/images/cleardot.gif')),
        (u.location && u.location.protocol == 'http') || Vr(f, 'https'),
        Nr(f),
        w ? Rd(f.toString(), l) : Sd(f.toString(), l));
    } else we(2);
    ((i.G = 0), i.l && i.l.sa(c), Qa(i), ja(i));
  }
  n.fb = function (i) {
    i
      ? (this.j.info('Successfully pinged google.com'), we(2))
      : (this.j.info('Failed to ping google.com'), we(1));
  };
  function Qa(i) {
    if (((i.G = 0), (i.ka = []), i.l)) {
      const c = Sa(i.h);
      ((c.length != 0 || i.i.length != 0) &&
        (N(i.ka, c), N(i.ka, i.i), (i.h.i.length = 0), O(i.i), (i.i.length = 0)),
        i.l.ra());
    }
  }
  function Ya(i, c, l) {
    var f = l instanceof Ot ? Ye(l) : new Ot(l);
    if (f.g != '') (c && (f.g = c + '.' + f.g), kr(f, f.s));
    else {
      var w = u.location;
      ((f = w.protocol), (c = c ? c + '.' + w.hostname : w.hostname), (w = +w.port));
      var R = new Ot(null);
      (f && Vr(R, f), c && (R.g = c), w && kr(R, w), l && (R.l = l), (f = R));
    }
    return ((l = i.D), (c = i.ya), l && c && X(f, l, c), X(f, 'VER', i.la), Un(i, f), f);
  }
  function Xa(i, c, l) {
    if (c && !i.J) throw Error("Can't create secondary domain capable XhrIo object.");
    return ((c = i.Ca && !i.pa ? new ee(new Dr({ eb: l })) : new ee(i.pa)), c.Ha(i.J), c);
  }
  n.isActive = function () {
    return !!this.l && this.l.isActive(this);
  };
  function Ja() {}
  ((n = Ja.prototype),
    (n.ua = function () {}),
    (n.ta = function () {}),
    (n.sa = function () {}),
    (n.ra = function () {}),
    (n.isActive = function () {
      return !0;
    }),
    (n.Na = function () {}));
  function Ur() {}
  Ur.prototype.g = function (i, c) {
    return new Ce(i, c);
  };
  function Ce(i, c) {
    (ge.call(this),
      (this.g = new qa(c)),
      (this.l = i),
      (this.h = (c && c.messageUrlParams) || null),
      (i = (c && c.messageHeaders) || null),
      c &&
        c.clientProtocolHeaderRequired &&
        (i ? (i['X-Client-Protocol'] = 'webchannel') : (i = { 'X-Client-Protocol': 'webchannel' })),
      (this.g.o = i),
      (i = (c && c.initMessageHeaders) || null),
      c &&
        c.messageContentType &&
        (i
          ? (i['X-WebChannel-Content-Type'] = c.messageContentType)
          : (i = { 'X-WebChannel-Content-Type': c.messageContentType })),
      c &&
        c.va &&
        (i
          ? (i['X-WebChannel-Client-Profile'] = c.va)
          : (i = { 'X-WebChannel-Client-Profile': c.va })),
      (this.g.S = i),
      (i = c && c.Sb) && !B(i) && (this.g.m = i),
      (this.v = (c && c.supportsCrossDomainXhr) || !1),
      (this.u = (c && c.sendRawJson) || !1),
      (c = c && c.httpSessionIdParam) &&
        !B(c) &&
        ((this.g.D = c),
        (i = this.h),
        i !== null && c in i && ((i = this.h), c in i && delete i[c])),
      (this.j = new Jt(this)));
  }
  (b(Ce, ge),
    (Ce.prototype.m = function () {
      ((this.g.l = this.j), this.v && (this.g.J = !0), this.g.connect(this.l, this.h || void 0));
    }),
    (Ce.prototype.close = function () {
      gi(this.g);
    }),
    (Ce.prototype.o = function (i) {
      var c = this.g;
      if (typeof i == 'string') {
        var l = {};
        ((l.__data__ = i), (i = l));
      } else this.u && ((l = {}), (l.__data__ = si(i)), (i = l));
      (c.i.push(new md(c.Ya++, i)), c.G == 3 && xr(c));
    }),
    (Ce.prototype.N = function () {
      ((this.g.l = null), delete this.j, gi(this.g), delete this.g, Ce.aa.N.call(this));
    }));
  function Za(i) {
    (oi.call(this),
      i.__headers__ &&
        ((this.headers = i.__headers__),
        (this.statusCode = i.__status__),
        delete i.__headers__,
        delete i.__status__));
    var c = i.__sm__;
    if (c) {
      e: {
        for (const l in c) {
          i = l;
          break e;
        }
        i = void 0;
      }
      ((this.i = i) && ((i = this.i), (c = c !== null && i in c ? c[i] : void 0)), (this.data = c));
    } else this.data = i;
  }
  b(Za, oi);
  function ec() {
    (ai.call(this), (this.status = 1));
  }
  b(ec, ai);
  function Jt(i) {
    this.g = i;
  }
  (b(Jt, Ja),
    (Jt.prototype.ua = function () {
      ve(this.g, 'a');
    }),
    (Jt.prototype.ta = function (i) {
      ve(this.g, new Za(i));
    }),
    (Jt.prototype.sa = function (i) {
      ve(this.g, new ec());
    }),
    (Jt.prototype.ra = function () {
      ve(this.g, 'b');
    }),
    (Ur.prototype.createWebChannel = Ur.prototype.g),
    (Ce.prototype.send = Ce.prototype.o),
    (Ce.prototype.open = Ce.prototype.m),
    (Ce.prototype.close = Ce.prototype.close),
    (Gu = function () {
      return new Ur();
    }),
    (Wu = function () {
      return Sr();
    }),
    (Hu = Nt),
    (xi = {
      mb: 0,
      pb: 1,
      qb: 2,
      Jb: 3,
      Ob: 4,
      Lb: 5,
      Mb: 6,
      Kb: 7,
      Ib: 8,
      Nb: 9,
      PROXY: 10,
      NOPROXY: 11,
      Gb: 12,
      Cb: 13,
      Db: 14,
      Bb: 15,
      Eb: 16,
      Fb: 17,
      ib: 18,
      hb: 19,
      jb: 20,
    }),
    (Pr.NO_ERROR = 0),
    (Pr.TIMEOUT = 8),
    (Pr.HTTP_ERROR = 6),
    (Gr = Pr),
    (ga.COMPLETE = 'complete'),
    (zu = ga),
    (ha.EventType = Cn),
    (Cn.OPEN = 'a'),
    (Cn.CLOSE = 'b'),
    (Cn.ERROR = 'c'),
    (Cn.MESSAGE = 'd'),
    (ge.prototype.listen = ge.prototype.K),
    (jn = ha),
    (ee.prototype.listenOnce = ee.prototype.L),
    (ee.prototype.getLastError = ee.prototype.Ka),
    (ee.prototype.getLastErrorCode = ee.prototype.Ba),
    (ee.prototype.getStatus = ee.prototype.Z),
    (ee.prototype.getResponseJson = ee.prototype.Oa),
    (ee.prototype.getResponseText = ee.prototype.oa),
    (ee.prototype.send = ee.prototype.ea),
    (ee.prototype.setWithCredentials = ee.prototype.Ha),
    ($u = ee));
}).apply(typeof qr < 'u' ? qr : typeof self < 'u' ? self : typeof window < 'u' ? window : {});
const fc = '@firebase/firestore',
  pc = '4.9.1';
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Re {
  constructor(e) {
    this.uid = e;
  }
  isAuthenticated() {
    return this.uid != null;
  }
  toKey() {
    return this.isAuthenticated() ? 'uid:' + this.uid : 'anonymous-user';
  }
  isEqual(e) {
    return e.uid === this.uid;
  }
}
((Re.UNAUTHENTICATED = new Re(null)),
  (Re.GOOGLE_CREDENTIALS = new Re('google-credentials-uid')),
  (Re.FIRST_PARTY = new Re('first-party-uid')),
  (Re.MOCK_USER = new Re('mock-user')));
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ let yn = '12.2.0';
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const $t = new no('@firebase/firestore');
function en() {
  return $t.logLevel;
}
function D(n, ...e) {
  if ($t.logLevel <= q.DEBUG) {
    const t = e.map(io);
    $t.debug(`Firestore (${yn}): ${n}`, ...t);
  }
}
function nt(n, ...e) {
  if ($t.logLevel <= q.ERROR) {
    const t = e.map(io);
    $t.error(`Firestore (${yn}): ${n}`, ...t);
  }
}
function er(n, ...e) {
  if ($t.logLevel <= q.WARN) {
    const t = e.map(io);
    $t.warn(`Firestore (${yn}): ${n}`, ...t);
  }
}
function io(n) {
  if (typeof n == 'string') return n;
  try {
    /**
     * @license
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */ return (function (t) {
      return JSON.stringify(t);
    })(n);
  } catch {
    return n;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function x(n, e, t) {
  let r = 'Unexpected state';
  (typeof e == 'string' ? (r = e) : (t = e), Ku(n, r, t));
}
function Ku(n, e, t) {
  let r = `FIRESTORE (${yn}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;
  if (t !== void 0)
    try {
      r += ' CONTEXT: ' + JSON.stringify(t);
    } catch {
      r += ' CONTEXT: ' + t;
    }
  throw (nt(r), new Error(r));
}
function K(n, e, t, r) {
  let s = 'Unexpected state';
  (typeof t == 'string' ? (s = t) : (r = t), n || Ku(e, s, r));
}
function U(n, e) {
  return n;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const S = {
  OK: 'ok',
  CANCELLED: 'cancelled',
  UNKNOWN: 'unknown',
  INVALID_ARGUMENT: 'invalid-argument',
  DEADLINE_EXCEEDED: 'deadline-exceeded',
  NOT_FOUND: 'not-found',
  ALREADY_EXISTS: 'already-exists',
  PERMISSION_DENIED: 'permission-denied',
  UNAUTHENTICATED: 'unauthenticated',
  RESOURCE_EXHAUSTED: 'resource-exhausted',
  FAILED_PRECONDITION: 'failed-precondition',
  ABORTED: 'aborted',
  OUT_OF_RANGE: 'out-of-range',
  UNIMPLEMENTED: 'unimplemented',
  INTERNAL: 'internal',
  UNAVAILABLE: 'unavailable',
  DATA_LOSS: 'data-loss',
};
class k extends ot {
  constructor(e, t) {
    (super(e, t),
      (this.code = e),
      (this.message = t),
      (this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class et {
  constructor() {
    this.promise = new Promise((e, t) => {
      ((this.resolve = e), (this.reject = t));
    });
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Tp {
  constructor(e, t) {
    ((this.user = t),
      (this.type = 'OAuth'),
      (this.headers = new Map()),
      this.headers.set('Authorization', `Bearer ${e}`));
  }
}
class vp {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {}
  start(e, t) {
    e.enqueueRetryable(() => t(Re.UNAUTHENTICATED));
  }
  shutdown() {}
}
class wp {
  constructor(e) {
    ((this.t = e),
      (this.currentUser = Re.UNAUTHENTICATED),
      (this.i = 0),
      (this.forceRefresh = !1),
      (this.auth = null));
  }
  start(e, t) {
    K(this.o === void 0, 42304);
    let r = this.i;
    const s = (h) => (this.i !== r ? ((r = this.i), t(h)) : Promise.resolve());
    let o = new et();
    this.o = () => {
      (this.i++,
        (this.currentUser = this.u()),
        o.resolve(),
        (o = new et()),
        e.enqueueRetryable(() => s(this.currentUser)));
    };
    const a = () => {
        const h = o;
        e.enqueueRetryable(async () => {
          (await h.promise, await s(this.currentUser));
        });
      },
      u = (h) => {
        (D('FirebaseAuthCredentialsProvider', 'Auth detected'),
          (this.auth = h),
          this.o && (this.auth.addAuthTokenListener(this.o), a()));
      };
    (this.t.onInit((h) => u(h)),
      setTimeout(() => {
        if (!this.auth) {
          const h = this.t.getImmediate({ optional: !0 });
          h
            ? u(h)
            : (D('FirebaseAuthCredentialsProvider', 'Auth not yet detected'),
              o.resolve(),
              (o = new et()));
        }
      }, 0),
      a());
  }
  getToken() {
    const e = this.i,
      t = this.forceRefresh;
    return (
      (this.forceRefresh = !1),
      this.auth
        ? this.auth
            .getToken(t)
            .then((r) =>
              this.i !== e
                ? (D('FirebaseAuthCredentialsProvider', 'getToken aborted due to token change.'),
                  this.getToken())
                : r
                  ? (K(typeof r.accessToken == 'string', 31837, { l: r }),
                    new Tp(r.accessToken, this.currentUser))
                  : null
            )
        : Promise.resolve(null)
    );
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    (this.auth && this.o && this.auth.removeAuthTokenListener(this.o), (this.o = void 0));
  }
  u() {
    const e = this.auth && this.auth.getUid();
    return (K(e === null || typeof e == 'string', 2055, { h: e }), new Re(e));
  }
}
class Ap {
  constructor(e, t, r) {
    ((this.P = e),
      (this.T = t),
      (this.I = r),
      (this.type = 'FirstParty'),
      (this.user = Re.FIRST_PARTY),
      (this.A = new Map()));
  }
  R() {
    return this.I ? this.I() : null;
  }
  get headers() {
    this.A.set('X-Goog-AuthUser', this.P);
    const e = this.R();
    return (
      e && this.A.set('Authorization', e),
      this.T && this.A.set('X-Goog-Iam-Authorization-Token', this.T),
      this.A
    );
  }
}
class Rp {
  constructor(e, t, r) {
    ((this.P = e), (this.T = t), (this.I = r));
  }
  getToken() {
    return Promise.resolve(new Ap(this.P, this.T, this.I));
  }
  start(e, t) {
    e.enqueueRetryable(() => t(Re.FIRST_PARTY));
  }
  shutdown() {}
  invalidateToken() {}
}
class mc {
  constructor(e) {
    ((this.value = e),
      (this.type = 'AppCheck'),
      (this.headers = new Map()),
      e && e.length > 0 && this.headers.set('x-firebase-appcheck', this.value));
  }
}
class Sp {
  constructor(e, t) {
    ((this.V = t),
      (this.forceRefresh = !1),
      (this.appCheck = null),
      (this.m = null),
      (this.p = null),
      Ae(e) && e.settings.appCheckToken && (this.p = e.settings.appCheckToken));
  }
  start(e, t) {
    K(this.o === void 0, 3512);
    const r = (o) => {
      o.error != null &&
        D(
          'FirebaseAppCheckTokenProvider',
          `Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`
        );
      const a = o.token !== this.m;
      return (
        (this.m = o.token),
        D('FirebaseAppCheckTokenProvider', `Received ${a ? 'new' : 'existing'} token.`),
        a ? t(o.token) : Promise.resolve()
      );
    };
    this.o = (o) => {
      e.enqueueRetryable(() => r(o));
    };
    const s = (o) => {
      (D('FirebaseAppCheckTokenProvider', 'AppCheck detected'),
        (this.appCheck = o),
        this.o && this.appCheck.addTokenListener(this.o));
    };
    (this.V.onInit((o) => s(o)),
      setTimeout(() => {
        if (!this.appCheck) {
          const o = this.V.getImmediate({ optional: !0 });
          o ? s(o) : D('FirebaseAppCheckTokenProvider', 'AppCheck not yet detected');
        }
      }, 0));
  }
  getToken() {
    if (this.p) return Promise.resolve(new mc(this.p));
    const e = this.forceRefresh;
    return (
      (this.forceRefresh = !1),
      this.appCheck
        ? this.appCheck
            .getToken(e)
            .then((t) =>
              t
                ? (K(typeof t.token == 'string', 44558, { tokenResult: t }),
                  (this.m = t.token),
                  new mc(t.token))
                : null
            )
        : Promise.resolve(null)
    );
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    (this.appCheck && this.o && this.appCheck.removeTokenListener(this.o), (this.o = void 0));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Pp(n) {
  const e = typeof self < 'u' && (self.crypto || self.msCrypto),
    t = new Uint8Array(n);
  if (e && typeof e.getRandomValues == 'function') e.getRandomValues(t);
  else for (let r = 0; r < n; r++) t[r] = Math.floor(256 * Math.random());
  return t;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class oo {
  static newId() {
    const e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      t = 62 * Math.floor(4.129032258064516);
    let r = '';
    for (; r.length < 20; ) {
      const s = Pp(40);
      for (let o = 0; o < s.length; ++o) r.length < 20 && s[o] < t && (r += e.charAt(s[o] % 62));
    }
    return r;
  }
}
function j(n, e) {
  return n < e ? -1 : n > e ? 1 : 0;
}
function Fi(n, e) {
  const t = Math.min(n.length, e.length);
  for (let r = 0; r < t; r++) {
    const s = n.charAt(r),
      o = e.charAt(r);
    if (s !== o) return Ri(s) === Ri(o) ? j(s, o) : Ri(s) ? 1 : -1;
  }
  return j(n.length, e.length);
}
const Cp = 55296,
  bp = 57343;
function Ri(n) {
  const e = n.charCodeAt(0);
  return e >= Cp && e <= bp;
}
function ln(n, e, t) {
  return n.length === e.length && n.every((r, s) => t(r, e[s]));
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const gc = '__name__';
class Be {
  constructor(e, t, r) {
    (t === void 0 ? (t = 0) : t > e.length && x(637, { offset: t, range: e.length }),
      r === void 0
        ? (r = e.length - t)
        : r > e.length - t && x(1746, { length: r, range: e.length - t }),
      (this.segments = e),
      (this.offset = t),
      (this.len = r));
  }
  get length() {
    return this.len;
  }
  isEqual(e) {
    return Be.comparator(this, e) === 0;
  }
  child(e) {
    const t = this.segments.slice(this.offset, this.limit());
    return (
      e instanceof Be
        ? e.forEach((r) => {
            t.push(r);
          })
        : t.push(e),
      this.construct(t)
    );
  }
  limit() {
    return this.offset + this.length;
  }
  popFirst(e) {
    return (
      (e = e === void 0 ? 1 : e),
      this.construct(this.segments, this.offset + e, this.length - e)
    );
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(e) {
    return this.segments[this.offset + e];
  }
  isEmpty() {
    return this.length === 0;
  }
  isPrefixOf(e) {
    if (e.length < this.length) return !1;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  isImmediateParentOf(e) {
    if (this.length + 1 !== e.length) return !1;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  forEach(e) {
    for (let t = this.offset, r = this.limit(); t < r; t++) e(this.segments[t]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  static comparator(e, t) {
    const r = Math.min(e.length, t.length);
    for (let s = 0; s < r; s++) {
      const o = Be.compareSegments(e.get(s), t.get(s));
      if (o !== 0) return o;
    }
    return j(e.length, t.length);
  }
  static compareSegments(e, t) {
    const r = Be.isNumericId(e),
      s = Be.isNumericId(t);
    return r && !s
      ? -1
      : !r && s
        ? 1
        : r && s
          ? Be.extractNumericId(e).compare(Be.extractNumericId(t))
          : Fi(e, t);
  }
  static isNumericId(e) {
    return e.startsWith('__id') && e.endsWith('__');
  }
  static extractNumericId(e) {
    return vt.fromString(e.substring(4, e.length - 2));
  }
}
class Y extends Be {
  construct(e, t, r) {
    return new Y(e, t, r);
  }
  canonicalString() {
    return this.toArray().join('/');
  }
  toString() {
    return this.canonicalString();
  }
  toUriEncodedString() {
    return this.toArray().map(encodeURIComponent).join('/');
  }
  static fromString(...e) {
    const t = [];
    for (const r of e) {
      if (r.indexOf('//') >= 0)
        throw new k(
          S.INVALID_ARGUMENT,
          `Invalid segment (${r}). Paths must not contain // in them.`
        );
      t.push(...r.split('/').filter((s) => s.length > 0));
    }
    return new Y(t);
  }
  static emptyPath() {
    return new Y([]);
  }
}
const Vp = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
class de extends Be {
  construct(e, t, r) {
    return new de(e, t, r);
  }
  static isValidIdentifier(e) {
    return Vp.test(e);
  }
  canonicalString() {
    return this.toArray()
      .map(
        (e) => (
          (e = e.replace(/\\/g, '\\\\').replace(/`/g, '\\`')),
          de.isValidIdentifier(e) || (e = '`' + e + '`'),
          e
        )
      )
      .join('.');
  }
  toString() {
    return this.canonicalString();
  }
  isKeyField() {
    return this.length === 1 && this.get(0) === gc;
  }
  static keyField() {
    return new de([gc]);
  }
  static fromServerFormat(e) {
    const t = [];
    let r = '',
      s = 0;
    const o = () => {
      if (r.length === 0)
        throw new k(
          S.INVALID_ARGUMENT,
          `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`
        );
      (t.push(r), (r = ''));
    };
    let a = !1;
    for (; s < e.length; ) {
      const u = e[s];
      if (u === '\\') {
        if (s + 1 === e.length)
          throw new k(S.INVALID_ARGUMENT, 'Path has trailing escape character: ' + e);
        const h = e[s + 1];
        if (h !== '\\' && h !== '.' && h !== '`')
          throw new k(S.INVALID_ARGUMENT, 'Path has invalid escape sequence: ' + e);
        ((r += h), (s += 2));
      } else u === '`' ? ((a = !a), s++) : u !== '.' || a ? ((r += u), s++) : (o(), s++);
    }
    if ((o(), a)) throw new k(S.INVALID_ARGUMENT, 'Unterminated ` in path: ' + e);
    return new de(t);
  }
  static emptyPath() {
    return new de([]);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class M {
  constructor(e) {
    this.path = e;
  }
  static fromPath(e) {
    return new M(Y.fromString(e));
  }
  static fromName(e) {
    return new M(Y.fromString(e).popFirst(5));
  }
  static empty() {
    return new M(Y.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  hasCollectionId(e) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
  }
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(e) {
    return e !== null && Y.comparator(this.path, e.path) === 0;
  }
  toString() {
    return this.path.toString();
  }
  static comparator(e, t) {
    return Y.comparator(e.path, t.path);
  }
  static isDocumentKey(e) {
    return e.length % 2 == 0;
  }
  static fromSegments(e) {
    return new M(new Y(e.slice()));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Qu(n, e, t) {
  if (!t) throw new k(S.INVALID_ARGUMENT, `Function ${n}() cannot be called with an empty ${e}.`);
}
function kp(n, e, t, r) {
  if (e === !0 && r === !0)
    throw new k(S.INVALID_ARGUMENT, `${n} and ${t} cannot be used together.`);
}
function _c(n) {
  if (!M.isDocumentKey(n))
    throw new k(
      S.INVALID_ARGUMENT,
      `Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`
    );
}
function yc(n) {
  if (M.isDocumentKey(n))
    throw new k(
      S.INVALID_ARGUMENT,
      `Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`
    );
}
function Yu(n) {
  return (
    typeof n == 'object' &&
    n !== null &&
    (Object.getPrototypeOf(n) === Object.prototype || Object.getPrototypeOf(n) === null)
  );
}
function As(n) {
  if (n === void 0) return 'undefined';
  if (n === null) return 'null';
  if (typeof n == 'string')
    return (n.length > 20 && (n = `${n.substring(0, 20)}...`), JSON.stringify(n));
  if (typeof n == 'number' || typeof n == 'boolean') return '' + n;
  if (typeof n == 'object') {
    if (n instanceof Array) return 'an array';
    {
      const e = (function (r) {
        return r.constructor ? r.constructor.name : null;
      })(n);
      return e ? `a custom ${e} object` : 'an object';
    }
  }
  return typeof n == 'function' ? 'a function' : x(12329, { type: typeof n });
}
function Ve(n, e) {
  if (('_delegate' in n && (n = n._delegate), !(n instanceof e))) {
    if (e.name === n.constructor.name)
      throw new k(
        S.INVALID_ARGUMENT,
        'Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?'
      );
    {
      const t = As(n);
      throw new k(S.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${t}`);
    }
  }
  return n;
}
function Np(n, e) {
  if (e <= 0)
    throw new k(
      S.INVALID_ARGUMENT,
      `Function ${n}() requires a positive number, but it was: ${e}.`
    );
}
/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function oe(n, e) {
  const t = { typeString: n };
  return (e && (t.value = e), t);
}
function dr(n, e) {
  if (!Yu(n)) throw new k(S.INVALID_ARGUMENT, 'JSON must be an object');
  let t;
  for (const r in e)
    if (e[r]) {
      const s = e[r].typeString,
        o = 'value' in e[r] ? { value: e[r].value } : void 0;
      if (!(r in n)) {
        t = `JSON missing required field: '${r}'`;
        break;
      }
      const a = n[r];
      if (s && typeof a !== s) {
        t = `JSON field '${r}' must be a ${s}.`;
        break;
      }
      if (o !== void 0 && a !== o.value) {
        t = `Expected '${r}' field to equal '${o.value}'`;
        break;
      }
    }
  if (t) throw new k(S.INVALID_ARGUMENT, t);
  return !0;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Ec = -62135596800,
  Ic = 1e6;
class J {
  static now() {
    return J.fromMillis(Date.now());
  }
  static fromDate(e) {
    return J.fromMillis(e.getTime());
  }
  static fromMillis(e) {
    const t = Math.floor(e / 1e3),
      r = Math.floor((e - 1e3 * t) * Ic);
    return new J(t, r);
  }
  constructor(e, t) {
    if (((this.seconds = e), (this.nanoseconds = t), t < 0))
      throw new k(S.INVALID_ARGUMENT, 'Timestamp nanoseconds out of range: ' + t);
    if (t >= 1e9) throw new k(S.INVALID_ARGUMENT, 'Timestamp nanoseconds out of range: ' + t);
    if (e < Ec) throw new k(S.INVALID_ARGUMENT, 'Timestamp seconds out of range: ' + e);
    if (e >= 253402300800) throw new k(S.INVALID_ARGUMENT, 'Timestamp seconds out of range: ' + e);
  }
  toDate() {
    return new Date(this.toMillis());
  }
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / Ic;
  }
  _compareTo(e) {
    return this.seconds === e.seconds
      ? j(this.nanoseconds, e.nanoseconds)
      : j(this.seconds, e.seconds);
  }
  isEqual(e) {
    return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
  }
  toString() {
    return 'Timestamp(seconds=' + this.seconds + ', nanoseconds=' + this.nanoseconds + ')';
  }
  toJSON() {
    return { type: J._jsonSchemaVersion, seconds: this.seconds, nanoseconds: this.nanoseconds };
  }
  static fromJSON(e) {
    if (dr(e, J._jsonSchema)) return new J(e.seconds, e.nanoseconds);
  }
  valueOf() {
    const e = this.seconds - Ec;
    return String(e).padStart(12, '0') + '.' + String(this.nanoseconds).padStart(9, '0');
  }
}
((J._jsonSchemaVersion = 'firestore/timestamp/1.0'),
  (J._jsonSchema = {
    type: oe('string', J._jsonSchemaVersion),
    seconds: oe('number'),
    nanoseconds: oe('number'),
  }));
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class F {
  static fromTimestamp(e) {
    return new F(e);
  }
  static min() {
    return new F(new J(0, 0));
  }
  static max() {
    return new F(new J(253402300799, 999999999));
  }
  constructor(e) {
    this.timestamp = e;
  }
  compareTo(e) {
    return this.timestamp._compareTo(e.timestamp);
  }
  isEqual(e) {
    return this.timestamp.isEqual(e.timestamp);
  }
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return 'SnapshotVersion(' + this.timestamp.toString() + ')';
  }
  toTimestamp() {
    return this.timestamp;
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const tr = -1;
function Dp(n, e) {
  const t = n.toTimestamp().seconds,
    r = n.toTimestamp().nanoseconds + 1,
    s = F.fromTimestamp(r === 1e9 ? new J(t + 1, 0) : new J(t, r));
  return new At(s, M.empty(), e);
}
function Op(n) {
  return new At(n.readTime, n.key, tr);
}
class At {
  constructor(e, t, r) {
    ((this.readTime = e), (this.documentKey = t), (this.largestBatchId = r));
  }
  static min() {
    return new At(F.min(), M.empty(), tr);
  }
  static max() {
    return new At(F.max(), M.empty(), tr);
  }
}
function Mp(n, e) {
  let t = n.readTime.compareTo(e.readTime);
  return t !== 0
    ? t
    : ((t = M.comparator(n.documentKey, e.documentKey)),
      t !== 0 ? t : j(n.largestBatchId, e.largestBatchId));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Lp =
  'The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.';
class xp {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(e) {
    this.onCommittedListeners.push(e);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach((e) => e());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function En(n) {
  if (n.code !== S.FAILED_PRECONDITION || n.message !== Lp) throw n;
  D('LocalStore', 'Unexpectedly lost primary lease');
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class P {
  constructor(e) {
    ((this.nextCallback = null),
      (this.catchCallback = null),
      (this.result = void 0),
      (this.error = void 0),
      (this.isDone = !1),
      (this.callbackAttached = !1),
      e(
        (t) => {
          ((this.isDone = !0), (this.result = t), this.nextCallback && this.nextCallback(t));
        },
        (t) => {
          ((this.isDone = !0), (this.error = t), this.catchCallback && this.catchCallback(t));
        }
      ));
  }
  catch(e) {
    return this.next(void 0, e);
  }
  next(e, t) {
    return (
      this.callbackAttached && x(59440),
      (this.callbackAttached = !0),
      this.isDone
        ? this.error
          ? this.wrapFailure(t, this.error)
          : this.wrapSuccess(e, this.result)
        : new P((r, s) => {
            ((this.nextCallback = (o) => {
              this.wrapSuccess(e, o).next(r, s);
            }),
              (this.catchCallback = (o) => {
                this.wrapFailure(t, o).next(r, s);
              }));
          })
    );
  }
  toPromise() {
    return new Promise((e, t) => {
      this.next(e, t);
    });
  }
  wrapUserFunction(e) {
    try {
      const t = e();
      return t instanceof P ? t : P.resolve(t);
    } catch (t) {
      return P.reject(t);
    }
  }
  wrapSuccess(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : P.resolve(t);
  }
  wrapFailure(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : P.reject(t);
  }
  static resolve(e) {
    return new P((t, r) => {
      t(e);
    });
  }
  static reject(e) {
    return new P((t, r) => {
      r(e);
    });
  }
  static waitFor(e) {
    return new P((t, r) => {
      let s = 0,
        o = 0,
        a = !1;
      (e.forEach((u) => {
        (++s,
          u.next(
            () => {
              (++o, a && o === s && t());
            },
            (h) => r(h)
          ));
      }),
        (a = !0),
        o === s && t());
    });
  }
  static or(e) {
    let t = P.resolve(!1);
    for (const r of e) t = t.next((s) => (s ? P.resolve(s) : r()));
    return t;
  }
  static forEach(e, t) {
    const r = [];
    return (
      e.forEach((s, o) => {
        r.push(t.call(this, s, o));
      }),
      this.waitFor(r)
    );
  }
  static mapArray(e, t) {
    return new P((r, s) => {
      const o = e.length,
        a = new Array(o);
      let u = 0;
      for (let h = 0; h < o; h++) {
        const d = h;
        t(e[d]).next(
          (p) => {
            ((a[d] = p), ++u, u === o && r(a));
          },
          (p) => s(p)
        );
      }
    });
  }
  static doWhile(e, t) {
    return new P((r, s) => {
      const o = () => {
        e() === !0
          ? t().next(() => {
              o();
            }, s)
          : r();
      };
      o();
    });
  }
}
function Fp(n) {
  const e = n.match(/Android ([\d.]+)/i),
    t = e ? e[1].split('.').slice(0, 2).join('.') : '-1';
  return Number(t);
}
function In(n) {
  return n.name === 'IndexedDbTransactionError';
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Rs {
  constructor(e, t) {
    ((this.previousValue = e),
      t &&
        ((t.sequenceNumberHandler = (r) => this.ae(r)),
        (this.ue = (r) => t.writeSequenceNumber(r))));
  }
  ae(e) {
    return ((this.previousValue = Math.max(e, this.previousValue)), this.previousValue);
  }
  next() {
    const e = ++this.previousValue;
    return (this.ue && this.ue(e), e);
  }
}
Rs.ce = -1;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ao = -1;
function Ss(n) {
  return n == null;
}
function rs(n) {
  return n === 0 && 1 / n == -1 / 0;
}
function Up(n) {
  return (
    typeof n == 'number' &&
    Number.isInteger(n) &&
    !rs(n) &&
    n <= Number.MAX_SAFE_INTEGER &&
    n >= Number.MIN_SAFE_INTEGER
  );
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Xu = '';
function Bp(n) {
  let e = '';
  for (let t = 0; t < n.length; t++) (e.length > 0 && (e = Tc(e)), (e = qp(n.get(t), e)));
  return Tc(e);
}
function qp(n, e) {
  let t = e;
  const r = n.length;
  for (let s = 0; s < r; s++) {
    const o = n.charAt(s);
    switch (o) {
      case '\0':
        t += '';
        break;
      case Xu:
        t += '';
        break;
      default:
        t += o;
    }
  }
  return t;
}
function Tc(n) {
  return n + Xu + '';
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function vc(n) {
  let e = 0;
  for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && e++;
  return e;
}
function Vt(n, e) {
  for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && e(t, n[t]);
}
function Ju(n) {
  for (const e in n) if (Object.prototype.hasOwnProperty.call(n, e)) return !1;
  return !0;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Z {
  constructor(e, t) {
    ((this.comparator = e), (this.root = t || he.EMPTY));
  }
  insert(e, t) {
    return new Z(
      this.comparator,
      this.root.insert(e, t, this.comparator).copy(null, null, he.BLACK, null, null)
    );
  }
  remove(e) {
    return new Z(
      this.comparator,
      this.root.remove(e, this.comparator).copy(null, null, he.BLACK, null, null)
    );
  }
  get(e) {
    let t = this.root;
    for (; !t.isEmpty(); ) {
      const r = this.comparator(e, t.key);
      if (r === 0) return t.value;
      r < 0 ? (t = t.left) : r > 0 && (t = t.right);
    }
    return null;
  }
  indexOf(e) {
    let t = 0,
      r = this.root;
    for (; !r.isEmpty(); ) {
      const s = this.comparator(e, r.key);
      if (s === 0) return t + r.left.size;
      s < 0 ? (r = r.left) : ((t += r.left.size + 1), (r = r.right));
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  get size() {
    return this.root.size;
  }
  minKey() {
    return this.root.minKey();
  }
  maxKey() {
    return this.root.maxKey();
  }
  inorderTraversal(e) {
    return this.root.inorderTraversal(e);
  }
  forEach(e) {
    this.inorderTraversal((t, r) => (e(t, r), !1));
  }
  toString() {
    const e = [];
    return (this.inorderTraversal((t, r) => (e.push(`${t}:${r}`), !1)), `{${e.join(', ')}}`);
  }
  reverseTraversal(e) {
    return this.root.reverseTraversal(e);
  }
  getIterator() {
    return new jr(this.root, null, this.comparator, !1);
  }
  getIteratorFrom(e) {
    return new jr(this.root, e, this.comparator, !1);
  }
  getReverseIterator() {
    return new jr(this.root, null, this.comparator, !0);
  }
  getReverseIteratorFrom(e) {
    return new jr(this.root, e, this.comparator, !0);
  }
}
class jr {
  constructor(e, t, r, s) {
    ((this.isReverse = s), (this.nodeStack = []));
    let o = 1;
    for (; !e.isEmpty(); )
      if (((o = t ? r(e.key, t) : 1), t && s && (o *= -1), o < 0))
        e = this.isReverse ? e.left : e.right;
      else {
        if (o === 0) {
          this.nodeStack.push(e);
          break;
        }
        (this.nodeStack.push(e), (e = this.isReverse ? e.right : e.left));
      }
  }
  getNext() {
    let e = this.nodeStack.pop();
    const t = { key: e.key, value: e.value };
    if (this.isReverse) for (e = e.left; !e.isEmpty(); ) (this.nodeStack.push(e), (e = e.right));
    else for (e = e.right; !e.isEmpty(); ) (this.nodeStack.push(e), (e = e.left));
    return t;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (this.nodeStack.length === 0) return null;
    const e = this.nodeStack[this.nodeStack.length - 1];
    return { key: e.key, value: e.value };
  }
}
class he {
  constructor(e, t, r, s, o) {
    ((this.key = e),
      (this.value = t),
      (this.color = r ?? he.RED),
      (this.left = s ?? he.EMPTY),
      (this.right = o ?? he.EMPTY),
      (this.size = this.left.size + 1 + this.right.size));
  }
  copy(e, t, r, s, o) {
    return new he(e ?? this.key, t ?? this.value, r ?? this.color, s ?? this.left, o ?? this.right);
  }
  isEmpty() {
    return !1;
  }
  inorderTraversal(e) {
    return (
      this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e)
    );
  }
  reverseTraversal(e) {
    return (
      this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e)
    );
  }
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  minKey() {
    return this.min().key;
  }
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  insert(e, t, r) {
    let s = this;
    const o = r(e, s.key);
    return (
      (s =
        o < 0
          ? s.copy(null, null, null, s.left.insert(e, t, r), null)
          : o === 0
            ? s.copy(null, t, null, null, null)
            : s.copy(null, null, null, null, s.right.insert(e, t, r))),
      s.fixUp()
    );
  }
  removeMin() {
    if (this.left.isEmpty()) return he.EMPTY;
    let e = this;
    return (
      e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()),
      (e = e.copy(null, null, null, e.left.removeMin(), null)),
      e.fixUp()
    );
  }
  remove(e, t) {
    let r,
      s = this;
    if (t(e, s.key) < 0)
      (s.left.isEmpty() || s.left.isRed() || s.left.left.isRed() || (s = s.moveRedLeft()),
        (s = s.copy(null, null, null, s.left.remove(e, t), null)));
    else {
      if (
        (s.left.isRed() && (s = s.rotateRight()),
        s.right.isEmpty() || s.right.isRed() || s.right.left.isRed() || (s = s.moveRedRight()),
        t(e, s.key) === 0)
      ) {
        if (s.right.isEmpty()) return he.EMPTY;
        ((r = s.right.min()), (s = s.copy(r.key, r.value, null, null, s.right.removeMin())));
      }
      s = s.copy(null, null, null, null, s.right.remove(e, t));
    }
    return s.fixUp();
  }
  isRed() {
    return this.color;
  }
  fixUp() {
    let e = this;
    return (
      e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()),
      e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()),
      e.left.isRed() && e.right.isRed() && (e = e.colorFlip()),
      e
    );
  }
  moveRedLeft() {
    let e = this.colorFlip();
    return (
      e.right.left.isRed() &&
        ((e = e.copy(null, null, null, null, e.right.rotateRight())),
        (e = e.rotateLeft()),
        (e = e.colorFlip())),
      e
    );
  }
  moveRedRight() {
    let e = this.colorFlip();
    return (e.left.left.isRed() && ((e = e.rotateRight()), (e = e.colorFlip())), e);
  }
  rotateLeft() {
    const e = this.copy(null, null, he.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, e, null);
  }
  rotateRight() {
    const e = this.copy(null, null, he.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, e);
  }
  colorFlip() {
    const e = this.left.copy(null, null, !this.left.color, null, null),
      t = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, e, t);
  }
  checkMaxDepth() {
    const e = this.check();
    return Math.pow(2, e) <= this.size + 1;
  }
  check() {
    if (this.isRed() && this.left.isRed()) throw x(43730, { key: this.key, value: this.value });
    if (this.right.isRed()) throw x(14113, { key: this.key, value: this.value });
    const e = this.left.check();
    if (e !== this.right.check()) throw x(27949);
    return e + (this.isRed() ? 0 : 1);
  }
}
((he.EMPTY = null), (he.RED = !0), (he.BLACK = !1));
he.EMPTY = new (class {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw x(57766);
  }
  get value() {
    throw x(16141);
  }
  get color() {
    throw x(16727);
  }
  get left() {
    throw x(29726);
  }
  get right() {
    throw x(36894);
  }
  copy(e, t, r, s, o) {
    return this;
  }
  insert(e, t, r) {
    return new he(e, t);
  }
  remove(e, t) {
    return this;
  }
  isEmpty() {
    return !0;
  }
  inorderTraversal(e) {
    return !1;
  }
  reverseTraversal(e) {
    return !1;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return !1;
  }
  checkMaxDepth() {
    return !0;
  }
  check() {
    return 0;
  }
})();
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ae {
  constructor(e) {
    ((this.comparator = e), (this.data = new Z(this.comparator)));
  }
  has(e) {
    return this.data.get(e) !== null;
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(e) {
    return this.data.indexOf(e);
  }
  forEach(e) {
    this.data.inorderTraversal((t, r) => (e(t), !1));
  }
  forEachInRange(e, t) {
    const r = this.data.getIteratorFrom(e[0]);
    for (; r.hasNext(); ) {
      const s = r.getNext();
      if (this.comparator(s.key, e[1]) >= 0) return;
      t(s.key);
    }
  }
  forEachWhile(e, t) {
    let r;
    for (r = t !== void 0 ? this.data.getIteratorFrom(t) : this.data.getIterator(); r.hasNext(); )
      if (!e(r.getNext().key)) return;
  }
  firstAfterOrEqual(e) {
    const t = this.data.getIteratorFrom(e);
    return t.hasNext() ? t.getNext().key : null;
  }
  getIterator() {
    return new wc(this.data.getIterator());
  }
  getIteratorFrom(e) {
    return new wc(this.data.getIteratorFrom(e));
  }
  add(e) {
    return this.copy(this.data.remove(e).insert(e, !0));
  }
  delete(e) {
    return this.has(e) ? this.copy(this.data.remove(e)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(e) {
    let t = this;
    return (
      t.size < e.size && ((t = e), (e = this)),
      e.forEach((r) => {
        t = t.add(r);
      }),
      t
    );
  }
  isEqual(e) {
    if (!(e instanceof ae) || this.size !== e.size) return !1;
    const t = this.data.getIterator(),
      r = e.data.getIterator();
    for (; t.hasNext(); ) {
      const s = t.getNext().key,
        o = r.getNext().key;
      if (this.comparator(s, o) !== 0) return !1;
    }
    return !0;
  }
  toArray() {
    const e = [];
    return (
      this.forEach((t) => {
        e.push(t);
      }),
      e
    );
  }
  toString() {
    const e = [];
    return (this.forEach((t) => e.push(t)), 'SortedSet(' + e.toString() + ')');
  }
  copy(e) {
    const t = new ae(this.comparator);
    return ((t.data = e), t);
  }
}
class wc {
  constructor(e) {
    this.iter = e;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class be {
  constructor(e) {
    ((this.fields = e), e.sort(de.comparator));
  }
  static empty() {
    return new be([]);
  }
  unionWith(e) {
    let t = new ae(de.comparator);
    for (const r of this.fields) t = t.add(r);
    for (const r of e) t = t.add(r);
    return new be(t.toArray());
  }
  covers(e) {
    for (const t of this.fields) if (t.isPrefixOf(e)) return !0;
    return !1;
  }
  isEqual(e) {
    return ln(this.fields, e.fields, (t, r) => t.isEqual(r));
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Zu extends Error {
  constructor() {
    (super(...arguments), (this.name = 'Base64DecodeError'));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class fe {
  constructor(e) {
    this.binaryString = e;
  }
  static fromBase64String(e) {
    const t = (function (s) {
      try {
        return atob(s);
      } catch (o) {
        throw typeof DOMException < 'u' && o instanceof DOMException
          ? new Zu('Invalid base64 string: ' + o)
          : o;
      }
    })(e);
    return new fe(t);
  }
  static fromUint8Array(e) {
    const t = (function (s) {
      let o = '';
      for (let a = 0; a < s.length; ++a) o += String.fromCharCode(s[a]);
      return o;
    })(e);
    return new fe(t);
  }
  [Symbol.iterator]() {
    let e = 0;
    return {
      next: () =>
        e < this.binaryString.length
          ? { value: this.binaryString.charCodeAt(e++), done: !1 }
          : { value: void 0, done: !0 },
    };
  }
  toBase64() {
    return (function (t) {
      return btoa(t);
    })(this.binaryString);
  }
  toUint8Array() {
    return (function (t) {
      const r = new Uint8Array(t.length);
      for (let s = 0; s < t.length; s++) r[s] = t.charCodeAt(s);
      return r;
    })(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(e) {
    return j(this.binaryString, e.binaryString);
  }
  isEqual(e) {
    return this.binaryString === e.binaryString;
  }
}
fe.EMPTY_BYTE_STRING = new fe('');
const jp = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function Rt(n) {
  if ((K(!!n, 39018), typeof n == 'string')) {
    let e = 0;
    const t = jp.exec(n);
    if ((K(!!t, 46558, { timestamp: n }), t[1])) {
      let s = t[1];
      ((s = (s + '000000000').substr(0, 9)), (e = Number(s)));
    }
    const r = new Date(n);
    return { seconds: Math.floor(r.getTime() / 1e3), nanos: e };
  }
  return { seconds: ne(n.seconds), nanos: ne(n.nanos) };
}
function ne(n) {
  return typeof n == 'number' ? n : typeof n == 'string' ? Number(n) : 0;
}
function St(n) {
  return typeof n == 'string' ? fe.fromBase64String(n) : fe.fromUint8Array(n);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const el = 'server_timestamp',
  tl = '__type__',
  nl = '__previous_value__',
  rl = '__local_write_time__';
function co(n) {
  return (n?.mapValue?.fields || {})[tl]?.stringValue === el;
}
function Ps(n) {
  const e = n.mapValue.fields[nl];
  return co(e) ? Ps(e) : e;
}
function nr(n) {
  const e = Rt(n.mapValue.fields[rl].timestampValue);
  return new J(e.seconds, e.nanos);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class $p {
  constructor(e, t, r, s, o, a, u, h, d, p) {
    ((this.databaseId = e),
      (this.appId = t),
      (this.persistenceKey = r),
      (this.host = s),
      (this.ssl = o),
      (this.forceLongPolling = a),
      (this.autoDetectLongPolling = u),
      (this.longPollingOptions = h),
      (this.useFetchStreams = d),
      (this.isUsingEmulator = p));
  }
}
const ss = '(default)';
class rr {
  constructor(e, t) {
    ((this.projectId = e), (this.database = t || ss));
  }
  static empty() {
    return new rr('', '');
  }
  get isDefaultDatabase() {
    return this.database === ss;
  }
  isEqual(e) {
    return e instanceof rr && e.projectId === this.projectId && e.database === this.database;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const sl = '__type__',
  zp = '__max__',
  $r = { mapValue: {} },
  il = '__vector__',
  is = 'value';
function Pt(n) {
  return 'nullValue' in n
    ? 0
    : 'booleanValue' in n
      ? 1
      : 'integerValue' in n || 'doubleValue' in n
        ? 2
        : 'timestampValue' in n
          ? 3
          : 'stringValue' in n
            ? 5
            : 'bytesValue' in n
              ? 6
              : 'referenceValue' in n
                ? 7
                : 'geoPointValue' in n
                  ? 8
                  : 'arrayValue' in n
                    ? 9
                    : 'mapValue' in n
                      ? co(n)
                        ? 4
                        : Wp(n)
                          ? 9007199254740991
                          : Hp(n)
                            ? 10
                            : 11
                      : x(28295, { value: n });
}
function We(n, e) {
  if (n === e) return !0;
  const t = Pt(n);
  if (t !== Pt(e)) return !1;
  switch (t) {
    case 0:
    case 9007199254740991:
      return !0;
    case 1:
      return n.booleanValue === e.booleanValue;
    case 4:
      return nr(n).isEqual(nr(e));
    case 3:
      return (function (s, o) {
        if (
          typeof s.timestampValue == 'string' &&
          typeof o.timestampValue == 'string' &&
          s.timestampValue.length === o.timestampValue.length
        )
          return s.timestampValue === o.timestampValue;
        const a = Rt(s.timestampValue),
          u = Rt(o.timestampValue);
        return a.seconds === u.seconds && a.nanos === u.nanos;
      })(n, e);
    case 5:
      return n.stringValue === e.stringValue;
    case 6:
      return (function (s, o) {
        return St(s.bytesValue).isEqual(St(o.bytesValue));
      })(n, e);
    case 7:
      return n.referenceValue === e.referenceValue;
    case 8:
      return (function (s, o) {
        return (
          ne(s.geoPointValue.latitude) === ne(o.geoPointValue.latitude) &&
          ne(s.geoPointValue.longitude) === ne(o.geoPointValue.longitude)
        );
      })(n, e);
    case 2:
      return (function (s, o) {
        if ('integerValue' in s && 'integerValue' in o)
          return ne(s.integerValue) === ne(o.integerValue);
        if ('doubleValue' in s && 'doubleValue' in o) {
          const a = ne(s.doubleValue),
            u = ne(o.doubleValue);
          return a === u ? rs(a) === rs(u) : isNaN(a) && isNaN(u);
        }
        return !1;
      })(n, e);
    case 9:
      return ln(n.arrayValue.values || [], e.arrayValue.values || [], We);
    case 10:
    case 11:
      return (function (s, o) {
        const a = s.mapValue.fields || {},
          u = o.mapValue.fields || {};
        if (vc(a) !== vc(u)) return !1;
        for (const h in a)
          if (a.hasOwnProperty(h) && (u[h] === void 0 || !We(a[h], u[h]))) return !1;
        return !0;
      })(n, e);
    default:
      return x(52216, { left: n });
  }
}
function sr(n, e) {
  return (n.values || []).find((t) => We(t, e)) !== void 0;
}
function hn(n, e) {
  if (n === e) return 0;
  const t = Pt(n),
    r = Pt(e);
  if (t !== r) return j(t, r);
  switch (t) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return j(n.booleanValue, e.booleanValue);
    case 2:
      return (function (o, a) {
        const u = ne(o.integerValue || o.doubleValue),
          h = ne(a.integerValue || a.doubleValue);
        return u < h ? -1 : u > h ? 1 : u === h ? 0 : isNaN(u) ? (isNaN(h) ? 0 : -1) : 1;
      })(n, e);
    case 3:
      return Ac(n.timestampValue, e.timestampValue);
    case 4:
      return Ac(nr(n), nr(e));
    case 5:
      return Fi(n.stringValue, e.stringValue);
    case 6:
      return (function (o, a) {
        const u = St(o),
          h = St(a);
        return u.compareTo(h);
      })(n.bytesValue, e.bytesValue);
    case 7:
      return (function (o, a) {
        const u = o.split('/'),
          h = a.split('/');
        for (let d = 0; d < u.length && d < h.length; d++) {
          const p = j(u[d], h[d]);
          if (p !== 0) return p;
        }
        return j(u.length, h.length);
      })(n.referenceValue, e.referenceValue);
    case 8:
      return (function (o, a) {
        const u = j(ne(o.latitude), ne(a.latitude));
        return u !== 0 ? u : j(ne(o.longitude), ne(a.longitude));
      })(n.geoPointValue, e.geoPointValue);
    case 9:
      return Rc(n.arrayValue, e.arrayValue);
    case 10:
      return (function (o, a) {
        const u = o.fields || {},
          h = a.fields || {},
          d = u[is]?.arrayValue,
          p = h[is]?.arrayValue,
          E = j(d?.values?.length || 0, p?.values?.length || 0);
        return E !== 0 ? E : Rc(d, p);
      })(n.mapValue, e.mapValue);
    case 11:
      return (function (o, a) {
        if (o === $r.mapValue && a === $r.mapValue) return 0;
        if (o === $r.mapValue) return 1;
        if (a === $r.mapValue) return -1;
        const u = o.fields || {},
          h = Object.keys(u),
          d = a.fields || {},
          p = Object.keys(d);
        (h.sort(), p.sort());
        for (let E = 0; E < h.length && E < p.length; ++E) {
          const y = Fi(h[E], p[E]);
          if (y !== 0) return y;
          const C = hn(u[h[E]], d[p[E]]);
          if (C !== 0) return C;
        }
        return j(h.length, p.length);
      })(n.mapValue, e.mapValue);
    default:
      throw x(23264, { he: t });
  }
}
function Ac(n, e) {
  if (typeof n == 'string' && typeof e == 'string' && n.length === e.length) return j(n, e);
  const t = Rt(n),
    r = Rt(e),
    s = j(t.seconds, r.seconds);
  return s !== 0 ? s : j(t.nanos, r.nanos);
}
function Rc(n, e) {
  const t = n.values || [],
    r = e.values || [];
  for (let s = 0; s < t.length && s < r.length; ++s) {
    const o = hn(t[s], r[s]);
    if (o) return o;
  }
  return j(t.length, r.length);
}
function dn(n) {
  return Ui(n);
}
function Ui(n) {
  return 'nullValue' in n
    ? 'null'
    : 'booleanValue' in n
      ? '' + n.booleanValue
      : 'integerValue' in n
        ? '' + n.integerValue
        : 'doubleValue' in n
          ? '' + n.doubleValue
          : 'timestampValue' in n
            ? (function (t) {
                const r = Rt(t);
                return `time(${r.seconds},${r.nanos})`;
              })(n.timestampValue)
            : 'stringValue' in n
              ? n.stringValue
              : 'bytesValue' in n
                ? (function (t) {
                    return St(t).toBase64();
                  })(n.bytesValue)
                : 'referenceValue' in n
                  ? (function (t) {
                      return M.fromName(t).toString();
                    })(n.referenceValue)
                  : 'geoPointValue' in n
                    ? (function (t) {
                        return `geo(${t.latitude},${t.longitude})`;
                      })(n.geoPointValue)
                    : 'arrayValue' in n
                      ? (function (t) {
                          let r = '[',
                            s = !0;
                          for (const o of t.values || []) (s ? (s = !1) : (r += ','), (r += Ui(o)));
                          return r + ']';
                        })(n.arrayValue)
                      : 'mapValue' in n
                        ? (function (t) {
                            const r = Object.keys(t.fields || {}).sort();
                            let s = '{',
                              o = !0;
                            for (const a of r)
                              (o ? (o = !1) : (s += ','), (s += `${a}:${Ui(t.fields[a])}`));
                            return s + '}';
                          })(n.mapValue)
                        : x(61005, { value: n });
}
function Kr(n) {
  switch (Pt(n)) {
    case 0:
    case 1:
      return 4;
    case 2:
      return 8;
    case 3:
    case 8:
      return 16;
    case 4:
      const e = Ps(n);
      return e ? 16 + Kr(e) : 16;
    case 5:
      return 2 * n.stringValue.length;
    case 6:
      return St(n.bytesValue).approximateByteSize();
    case 7:
      return n.referenceValue.length;
    case 9:
      return (function (r) {
        return (r.values || []).reduce((s, o) => s + Kr(o), 0);
      })(n.arrayValue);
    case 10:
    case 11:
      return (function (r) {
        let s = 0;
        return (
          Vt(r.fields, (o, a) => {
            s += o.length + Kr(a);
          }),
          s
        );
      })(n.mapValue);
    default:
      throw x(13486, { value: n });
  }
}
function Sc(n, e) {
  return {
    referenceValue: `projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`,
  };
}
function Bi(n) {
  return !!n && 'integerValue' in n;
}
function uo(n) {
  return !!n && 'arrayValue' in n;
}
function Pc(n) {
  return !!n && 'nullValue' in n;
}
function Cc(n) {
  return !!n && 'doubleValue' in n && isNaN(Number(n.doubleValue));
}
function Qr(n) {
  return !!n && 'mapValue' in n;
}
function Hp(n) {
  return (n?.mapValue?.fields || {})[sl]?.stringValue === il;
}
function Gn(n) {
  if (n.geoPointValue) return { geoPointValue: { ...n.geoPointValue } };
  if (n.timestampValue && typeof n.timestampValue == 'object')
    return { timestampValue: { ...n.timestampValue } };
  if (n.mapValue) {
    const e = { mapValue: { fields: {} } };
    return (Vt(n.mapValue.fields, (t, r) => (e.mapValue.fields[t] = Gn(r))), e);
  }
  if (n.arrayValue) {
    const e = { arrayValue: { values: [] } };
    for (let t = 0; t < (n.arrayValue.values || []).length; ++t)
      e.arrayValue.values[t] = Gn(n.arrayValue.values[t]);
    return e;
  }
  return { ...n };
}
function Wp(n) {
  return (((n.mapValue || {}).fields || {}).__type__ || {}).stringValue === zp;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Pe {
  constructor(e) {
    this.value = e;
  }
  static empty() {
    return new Pe({ mapValue: {} });
  }
  field(e) {
    if (e.isEmpty()) return this.value;
    {
      let t = this.value;
      for (let r = 0; r < e.length - 1; ++r)
        if (((t = (t.mapValue.fields || {})[e.get(r)]), !Qr(t))) return null;
      return ((t = (t.mapValue.fields || {})[e.lastSegment()]), t || null);
    }
  }
  set(e, t) {
    this.getFieldsMap(e.popLast())[e.lastSegment()] = Gn(t);
  }
  setAll(e) {
    let t = de.emptyPath(),
      r = {},
      s = [];
    e.forEach((a, u) => {
      if (!t.isImmediateParentOf(u)) {
        const h = this.getFieldsMap(t);
        (this.applyChanges(h, r, s), (r = {}), (s = []), (t = u.popLast()));
      }
      a ? (r[u.lastSegment()] = Gn(a)) : s.push(u.lastSegment());
    });
    const o = this.getFieldsMap(t);
    this.applyChanges(o, r, s);
  }
  delete(e) {
    const t = this.field(e.popLast());
    Qr(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
  }
  isEqual(e) {
    return We(this.value, e.value);
  }
  getFieldsMap(e) {
    let t = this.value;
    t.mapValue.fields || (t.mapValue = { fields: {} });
    for (let r = 0; r < e.length; ++r) {
      let s = t.mapValue.fields[e.get(r)];
      ((Qr(s) && s.mapValue.fields) ||
        ((s = { mapValue: { fields: {} } }), (t.mapValue.fields[e.get(r)] = s)),
        (t = s));
    }
    return t.mapValue.fields;
  }
  applyChanges(e, t, r) {
    Vt(t, (s, o) => (e[s] = o));
    for (const s of r) delete e[s];
  }
  clone() {
    return new Pe(Gn(this.value));
  }
}
function ol(n) {
  const e = [];
  return (
    Vt(n.fields, (t, r) => {
      const s = new de([t]);
      if (Qr(r)) {
        const o = ol(r.mapValue).fields;
        if (o.length === 0) e.push(s);
        else for (const a of o) e.push(s.child(a));
      } else e.push(s);
    }),
    new be(e)
  );
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Ie {
  constructor(e, t, r, s, o, a, u) {
    ((this.key = e),
      (this.documentType = t),
      (this.version = r),
      (this.readTime = s),
      (this.createTime = o),
      (this.data = a),
      (this.documentState = u));
  }
  static newInvalidDocument(e) {
    return new Ie(e, 0, F.min(), F.min(), F.min(), Pe.empty(), 0);
  }
  static newFoundDocument(e, t, r, s) {
    return new Ie(e, 1, t, F.min(), r, s, 0);
  }
  static newNoDocument(e, t) {
    return new Ie(e, 2, t, F.min(), F.min(), Pe.empty(), 0);
  }
  static newUnknownDocument(e, t) {
    return new Ie(e, 3, t, F.min(), F.min(), Pe.empty(), 2);
  }
  convertToFoundDocument(e, t) {
    return (
      !this.createTime.isEqual(F.min()) ||
        (this.documentType !== 2 && this.documentType !== 0) ||
        (this.createTime = e),
      (this.version = e),
      (this.documentType = 1),
      (this.data = t),
      (this.documentState = 0),
      this
    );
  }
  convertToNoDocument(e) {
    return (
      (this.version = e),
      (this.documentType = 2),
      (this.data = Pe.empty()),
      (this.documentState = 0),
      this
    );
  }
  convertToUnknownDocument(e) {
    return (
      (this.version = e),
      (this.documentType = 3),
      (this.data = Pe.empty()),
      (this.documentState = 2),
      this
    );
  }
  setHasCommittedMutations() {
    return ((this.documentState = 2), this);
  }
  setHasLocalMutations() {
    return ((this.documentState = 1), (this.version = F.min()), this);
  }
  setReadTime(e) {
    return ((this.readTime = e), this);
  }
  get hasLocalMutations() {
    return this.documentState === 1;
  }
  get hasCommittedMutations() {
    return this.documentState === 2;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return this.documentType !== 0;
  }
  isFoundDocument() {
    return this.documentType === 1;
  }
  isNoDocument() {
    return this.documentType === 2;
  }
  isUnknownDocument() {
    return this.documentType === 3;
  }
  isEqual(e) {
    return (
      e instanceof Ie &&
      this.key.isEqual(e.key) &&
      this.version.isEqual(e.version) &&
      this.documentType === e.documentType &&
      this.documentState === e.documentState &&
      this.data.isEqual(e.data)
    );
  }
  mutableCopy() {
    return new Ie(
      this.key,
      this.documentType,
      this.version,
      this.readTime,
      this.createTime,
      this.data.clone(),
      this.documentState
    );
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class os {
  constructor(e, t) {
    ((this.position = e), (this.inclusive = t));
  }
}
function bc(n, e, t) {
  let r = 0;
  for (let s = 0; s < n.position.length; s++) {
    const o = e[s],
      a = n.position[s];
    if (
      (o.field.isKeyField()
        ? (r = M.comparator(M.fromName(a.referenceValue), t.key))
        : (r = hn(a, t.data.field(o.field))),
      o.dir === 'desc' && (r *= -1),
      r !== 0)
    )
      break;
  }
  return r;
}
function Vc(n, e) {
  if (n === null) return e === null;
  if (e === null || n.inclusive !== e.inclusive || n.position.length !== e.position.length)
    return !1;
  for (let t = 0; t < n.position.length; t++) if (!We(n.position[t], e.position[t])) return !1;
  return !0;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ir {
  constructor(e, t = 'asc') {
    ((this.field = e), (this.dir = t));
  }
}
function Gp(n, e) {
  return n.dir === e.dir && n.field.isEqual(e.field);
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class al {}
class ie extends al {
  constructor(e, t, r) {
    (super(), (this.field = e), (this.op = t), (this.value = r));
  }
  static create(e, t, r) {
    return e.isKeyField()
      ? t === 'in' || t === 'not-in'
        ? this.createKeyFieldInFilter(e, t, r)
        : new Qp(e, t, r)
      : t === 'array-contains'
        ? new Jp(e, r)
        : t === 'in'
          ? new Zp(e, r)
          : t === 'not-in'
            ? new em(e, r)
            : t === 'array-contains-any'
              ? new tm(e, r)
              : new ie(e, t, r);
  }
  static createKeyFieldInFilter(e, t, r) {
    return t === 'in' ? new Yp(e, r) : new Xp(e, r);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return this.op === '!='
      ? t !== null && t.nullValue === void 0 && this.matchesComparison(hn(t, this.value))
      : t !== null && Pt(this.value) === Pt(t) && this.matchesComparison(hn(t, this.value));
  }
  matchesComparison(e) {
    switch (this.op) {
      case '<':
        return e < 0;
      case '<=':
        return e <= 0;
      case '==':
        return e === 0;
      case '!=':
        return e !== 0;
      case '>':
        return e > 0;
      case '>=':
        return e >= 0;
      default:
        return x(47266, { operator: this.op });
    }
  }
  isInequality() {
    return ['<', '<=', '>', '>=', '!=', 'not-in'].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
}
class Fe extends al {
  constructor(e, t) {
    (super(), (this.filters = e), (this.op = t), (this.Pe = null));
  }
  static create(e, t) {
    return new Fe(e, t);
  }
  matches(e) {
    return cl(this)
      ? this.filters.find((t) => !t.matches(e)) === void 0
      : this.filters.find((t) => t.matches(e)) !== void 0;
  }
  getFlattenedFilters() {
    return (
      this.Pe !== null ||
        (this.Pe = this.filters.reduce((e, t) => e.concat(t.getFlattenedFilters()), [])),
      this.Pe
    );
  }
  getFilters() {
    return Object.assign([], this.filters);
  }
}
function cl(n) {
  return n.op === 'and';
}
function ul(n) {
  return Kp(n) && cl(n);
}
function Kp(n) {
  for (const e of n.filters) if (e instanceof Fe) return !1;
  return !0;
}
function qi(n) {
  if (n instanceof ie) return n.field.canonicalString() + n.op.toString() + dn(n.value);
  if (ul(n)) return n.filters.map((e) => qi(e)).join(',');
  {
    const e = n.filters.map((t) => qi(t)).join(',');
    return `${n.op}(${e})`;
  }
}
function ll(n, e) {
  return n instanceof ie
    ? (function (r, s) {
        return s instanceof ie && r.op === s.op && r.field.isEqual(s.field) && We(r.value, s.value);
      })(n, e)
    : n instanceof Fe
      ? (function (r, s) {
          return s instanceof Fe && r.op === s.op && r.filters.length === s.filters.length
            ? r.filters.reduce((o, a, u) => o && ll(a, s.filters[u]), !0)
            : !1;
        })(n, e)
      : void x(19439);
}
function hl(n) {
  return n instanceof ie
    ? (function (t) {
        return `${t.field.canonicalString()} ${t.op} ${dn(t.value)}`;
      })(n)
    : n instanceof Fe
      ? (function (t) {
          return t.op.toString() + ' {' + t.getFilters().map(hl).join(' ,') + '}';
        })(n)
      : 'Filter';
}
class Qp extends ie {
  constructor(e, t, r) {
    (super(e, t, r), (this.key = M.fromName(r.referenceValue)));
  }
  matches(e) {
    const t = M.comparator(e.key, this.key);
    return this.matchesComparison(t);
  }
}
class Yp extends ie {
  constructor(e, t) {
    (super(e, 'in', t), (this.keys = dl('in', t)));
  }
  matches(e) {
    return this.keys.some((t) => t.isEqual(e.key));
  }
}
class Xp extends ie {
  constructor(e, t) {
    (super(e, 'not-in', t), (this.keys = dl('not-in', t)));
  }
  matches(e) {
    return !this.keys.some((t) => t.isEqual(e.key));
  }
}
function dl(n, e) {
  return (e.arrayValue?.values || []).map((t) => M.fromName(t.referenceValue));
}
class Jp extends ie {
  constructor(e, t) {
    super(e, 'array-contains', t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return uo(t) && sr(t.arrayValue, this.value);
  }
}
class Zp extends ie {
  constructor(e, t) {
    super(e, 'in', t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return t !== null && sr(this.value.arrayValue, t);
  }
}
class em extends ie {
  constructor(e, t) {
    super(e, 'not-in', t);
  }
  matches(e) {
    if (sr(this.value.arrayValue, { nullValue: 'NULL_VALUE' })) return !1;
    const t = e.data.field(this.field);
    return t !== null && t.nullValue === void 0 && !sr(this.value.arrayValue, t);
  }
}
class tm extends ie {
  constructor(e, t) {
    super(e, 'array-contains-any', t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return (
      !(!uo(t) || !t.arrayValue.values) &&
      t.arrayValue.values.some((r) => sr(this.value.arrayValue, r))
    );
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class nm {
  constructor(e, t = null, r = [], s = [], o = null, a = null, u = null) {
    ((this.path = e),
      (this.collectionGroup = t),
      (this.orderBy = r),
      (this.filters = s),
      (this.limit = o),
      (this.startAt = a),
      (this.endAt = u),
      (this.Te = null));
  }
}
function kc(n, e = null, t = [], r = [], s = null, o = null, a = null) {
  return new nm(n, e, t, r, s, o, a);
}
function lo(n) {
  const e = U(n);
  if (e.Te === null) {
    let t = e.path.canonicalString();
    (e.collectionGroup !== null && (t += '|cg:' + e.collectionGroup),
      (t += '|f:'),
      (t += e.filters.map((r) => qi(r)).join(',')),
      (t += '|ob:'),
      (t += e.orderBy
        .map((r) =>
          (function (o) {
            return o.field.canonicalString() + o.dir;
          })(r)
        )
        .join(',')),
      Ss(e.limit) || ((t += '|l:'), (t += e.limit)),
      e.startAt &&
        ((t += '|lb:'),
        (t += e.startAt.inclusive ? 'b:' : 'a:'),
        (t += e.startAt.position.map((r) => dn(r)).join(','))),
      e.endAt &&
        ((t += '|ub:'),
        (t += e.endAt.inclusive ? 'a:' : 'b:'),
        (t += e.endAt.position.map((r) => dn(r)).join(','))),
      (e.Te = t));
  }
  return e.Te;
}
function ho(n, e) {
  if (n.limit !== e.limit || n.orderBy.length !== e.orderBy.length) return !1;
  for (let t = 0; t < n.orderBy.length; t++) if (!Gp(n.orderBy[t], e.orderBy[t])) return !1;
  if (n.filters.length !== e.filters.length) return !1;
  for (let t = 0; t < n.filters.length; t++) if (!ll(n.filters[t], e.filters[t])) return !1;
  return (
    n.collectionGroup === e.collectionGroup &&
    !!n.path.isEqual(e.path) &&
    !!Vc(n.startAt, e.startAt) &&
    Vc(n.endAt, e.endAt)
  );
}
function ji(n) {
  return M.isDocumentKey(n.path) && n.collectionGroup === null && n.filters.length === 0;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Tn {
  constructor(e, t = null, r = [], s = [], o = null, a = 'F', u = null, h = null) {
    ((this.path = e),
      (this.collectionGroup = t),
      (this.explicitOrderBy = r),
      (this.filters = s),
      (this.limit = o),
      (this.limitType = a),
      (this.startAt = u),
      (this.endAt = h),
      (this.Ie = null),
      (this.Ee = null),
      (this.de = null),
      this.startAt,
      this.endAt);
  }
}
function rm(n, e, t, r, s, o, a, u) {
  return new Tn(n, e, t, r, s, o, a, u);
}
function Cs(n) {
  return new Tn(n);
}
function Nc(n) {
  return (
    n.filters.length === 0 &&
    n.limit === null &&
    n.startAt == null &&
    n.endAt == null &&
    (n.explicitOrderBy.length === 0 ||
      (n.explicitOrderBy.length === 1 && n.explicitOrderBy[0].field.isKeyField()))
  );
}
function fl(n) {
  return n.collectionGroup !== null;
}
function Kn(n) {
  const e = U(n);
  if (e.Ie === null) {
    e.Ie = [];
    const t = new Set();
    for (const o of e.explicitOrderBy) (e.Ie.push(o), t.add(o.field.canonicalString()));
    const r =
      e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : 'asc';
    ((function (a) {
      let u = new ae(de.comparator);
      return (
        a.filters.forEach((h) => {
          h.getFlattenedFilters().forEach((d) => {
            d.isInequality() && (u = u.add(d.field));
          });
        }),
        u
      );
    })(e).forEach((o) => {
      t.has(o.canonicalString()) || o.isKeyField() || e.Ie.push(new ir(o, r));
    }),
      t.has(de.keyField().canonicalString()) || e.Ie.push(new ir(de.keyField(), r)));
  }
  return e.Ie;
}
function qe(n) {
  const e = U(n);
  return (e.Ee || (e.Ee = sm(e, Kn(n))), e.Ee);
}
function sm(n, e) {
  if (n.limitType === 'F')
    return kc(n.path, n.collectionGroup, e, n.filters, n.limit, n.startAt, n.endAt);
  {
    e = e.map((s) => {
      const o = s.dir === 'desc' ? 'asc' : 'desc';
      return new ir(s.field, o);
    });
    const t = n.endAt ? new os(n.endAt.position, n.endAt.inclusive) : null,
      r = n.startAt ? new os(n.startAt.position, n.startAt.inclusive) : null;
    return kc(n.path, n.collectionGroup, e, n.filters, n.limit, t, r);
  }
}
function $i(n, e) {
  const t = n.filters.concat([e]);
  return new Tn(
    n.path,
    n.collectionGroup,
    n.explicitOrderBy.slice(),
    t,
    n.limit,
    n.limitType,
    n.startAt,
    n.endAt
  );
}
function as(n, e, t) {
  return new Tn(
    n.path,
    n.collectionGroup,
    n.explicitOrderBy.slice(),
    n.filters.slice(),
    e,
    t,
    n.startAt,
    n.endAt
  );
}
function bs(n, e) {
  return ho(qe(n), qe(e)) && n.limitType === e.limitType;
}
function pl(n) {
  return `${lo(qe(n))}|lt:${n.limitType}`;
}
function tn(n) {
  return `Query(target=${(function (t) {
    let r = t.path.canonicalString();
    return (
      t.collectionGroup !== null && (r += ' collectionGroup=' + t.collectionGroup),
      t.filters.length > 0 && (r += `, filters: [${t.filters.map((s) => hl(s)).join(', ')}]`),
      Ss(t.limit) || (r += ', limit: ' + t.limit),
      t.orderBy.length > 0 &&
        (r += `, orderBy: [${t.orderBy
          .map((s) =>
            (function (a) {
              return `${a.field.canonicalString()} (${a.dir})`;
            })(s)
          )
          .join(', ')}]`),
      t.startAt &&
        ((r += ', startAt: '),
        (r += t.startAt.inclusive ? 'b:' : 'a:'),
        (r += t.startAt.position.map((s) => dn(s)).join(','))),
      t.endAt &&
        ((r += ', endAt: '),
        (r += t.endAt.inclusive ? 'a:' : 'b:'),
        (r += t.endAt.position.map((s) => dn(s)).join(','))),
      `Target(${r})`
    );
  })(qe(n))}; limitType=${n.limitType})`;
}
function Vs(n, e) {
  return (
    e.isFoundDocument() &&
    (function (r, s) {
      const o = s.key.path;
      return r.collectionGroup !== null
        ? s.key.hasCollectionId(r.collectionGroup) && r.path.isPrefixOf(o)
        : M.isDocumentKey(r.path)
          ? r.path.isEqual(o)
          : r.path.isImmediateParentOf(o);
    })(n, e) &&
    (function (r, s) {
      for (const o of Kn(r)) if (!o.field.isKeyField() && s.data.field(o.field) === null) return !1;
      return !0;
    })(n, e) &&
    (function (r, s) {
      for (const o of r.filters) if (!o.matches(s)) return !1;
      return !0;
    })(n, e) &&
    (function (r, s) {
      return !(
        (r.startAt &&
          !(function (a, u, h) {
            const d = bc(a, u, h);
            return a.inclusive ? d <= 0 : d < 0;
          })(r.startAt, Kn(r), s)) ||
        (r.endAt &&
          !(function (a, u, h) {
            const d = bc(a, u, h);
            return a.inclusive ? d >= 0 : d > 0;
          })(r.endAt, Kn(r), s))
      );
    })(n, e)
  );
}
function im(n) {
  return (
    n.collectionGroup ||
    (n.path.length % 2 == 1 ? n.path.lastSegment() : n.path.get(n.path.length - 2))
  );
}
function ml(n) {
  return (e, t) => {
    let r = !1;
    for (const s of Kn(n)) {
      const o = om(s, e, t);
      if (o !== 0) return o;
      r = r || s.field.isKeyField();
    }
    return 0;
  };
}
function om(n, e, t) {
  const r = n.field.isKeyField()
    ? M.comparator(e.key, t.key)
    : (function (o, a, u) {
        const h = a.data.field(o),
          d = u.data.field(o);
        return h !== null && d !== null ? hn(h, d) : x(42886);
      })(n.field, e, t);
  switch (n.dir) {
    case 'asc':
      return r;
    case 'desc':
      return -1 * r;
    default:
      return x(19790, { direction: n.dir });
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Gt {
  constructor(e, t) {
    ((this.mapKeyFn = e), (this.equalsFn = t), (this.inner = {}), (this.innerSize = 0));
  }
  get(e) {
    const t = this.mapKeyFn(e),
      r = this.inner[t];
    if (r !== void 0) {
      for (const [s, o] of r) if (this.equalsFn(s, e)) return o;
    }
  }
  has(e) {
    return this.get(e) !== void 0;
  }
  set(e, t) {
    const r = this.mapKeyFn(e),
      s = this.inner[r];
    if (s === void 0) return ((this.inner[r] = [[e, t]]), void this.innerSize++);
    for (let o = 0; o < s.length; o++) if (this.equalsFn(s[o][0], e)) return void (s[o] = [e, t]);
    (s.push([e, t]), this.innerSize++);
  }
  delete(e) {
    const t = this.mapKeyFn(e),
      r = this.inner[t];
    if (r === void 0) return !1;
    for (let s = 0; s < r.length; s++)
      if (this.equalsFn(r[s][0], e))
        return (r.length === 1 ? delete this.inner[t] : r.splice(s, 1), this.innerSize--, !0);
    return !1;
  }
  forEach(e) {
    Vt(this.inner, (t, r) => {
      for (const [s, o] of r) e(s, o);
    });
  }
  isEmpty() {
    return Ju(this.inner);
  }
  size() {
    return this.innerSize;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const am = new Z(M.comparator);
function rt() {
  return am;
}
const gl = new Z(M.comparator);
function $n(...n) {
  let e = gl;
  for (const t of n) e = e.insert(t.key, t);
  return e;
}
function _l(n) {
  let e = gl;
  return (n.forEach((t, r) => (e = e.insert(t, r.overlayedDocument))), e);
}
function xt() {
  return Qn();
}
function yl() {
  return Qn();
}
function Qn() {
  return new Gt(
    (n) => n.toString(),
    (n, e) => n.isEqual(e)
  );
}
const cm = new Z(M.comparator),
  um = new ae(M.comparator);
function $(...n) {
  let e = um;
  for (const t of n) e = e.add(t);
  return e;
}
const lm = new ae(j);
function hm() {
  return lm;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function fo(n, e) {
  if (n.useProto3Json) {
    if (isNaN(e)) return { doubleValue: 'NaN' };
    if (e === 1 / 0) return { doubleValue: 'Infinity' };
    if (e === -1 / 0) return { doubleValue: '-Infinity' };
  }
  return { doubleValue: rs(e) ? '-0' : e };
}
function El(n) {
  return { integerValue: '' + n };
}
function dm(n, e) {
  return Up(e) ? El(e) : fo(n, e);
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ks {
  constructor() {
    this._ = void 0;
  }
}
function fm(n, e, t) {
  return n instanceof or
    ? (function (s, o) {
        const a = {
          fields: {
            [tl]: { stringValue: el },
            [rl]: { timestampValue: { seconds: s.seconds, nanos: s.nanoseconds } },
          },
        };
        return (o && co(o) && (o = Ps(o)), o && (a.fields[nl] = o), { mapValue: a });
      })(t, e)
    : n instanceof ar
      ? Tl(n, e)
      : n instanceof cr
        ? vl(n, e)
        : (function (s, o) {
            const a = Il(s, o),
              u = Dc(a) + Dc(s.Ae);
            return Bi(a) && Bi(s.Ae) ? El(u) : fo(s.serializer, u);
          })(n, e);
}
function pm(n, e, t) {
  return n instanceof ar ? Tl(n, e) : n instanceof cr ? vl(n, e) : t;
}
function Il(n, e) {
  return n instanceof cs
    ? (function (r) {
        return (
          Bi(r) ||
          (function (o) {
            return !!o && 'doubleValue' in o;
          })(r)
        );
      })(e)
      ? e
      : { integerValue: 0 }
    : null;
}
class or extends ks {}
class ar extends ks {
  constructor(e) {
    (super(), (this.elements = e));
  }
}
function Tl(n, e) {
  const t = wl(e);
  for (const r of n.elements) t.some((s) => We(s, r)) || t.push(r);
  return { arrayValue: { values: t } };
}
class cr extends ks {
  constructor(e) {
    (super(), (this.elements = e));
  }
}
function vl(n, e) {
  let t = wl(e);
  for (const r of n.elements) t = t.filter((s) => !We(s, r));
  return { arrayValue: { values: t } };
}
class cs extends ks {
  constructor(e, t) {
    (super(), (this.serializer = e), (this.Ae = t));
  }
}
function Dc(n) {
  return ne(n.integerValue || n.doubleValue);
}
function wl(n) {
  return uo(n) && n.arrayValue.values ? n.arrayValue.values.slice() : [];
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class mm {
  constructor(e, t) {
    ((this.field = e), (this.transform = t));
  }
}
function gm(n, e) {
  return (
    n.field.isEqual(e.field) &&
    (function (r, s) {
      return (r instanceof ar && s instanceof ar) || (r instanceof cr && s instanceof cr)
        ? ln(r.elements, s.elements, We)
        : r instanceof cs && s instanceof cs
          ? We(r.Ae, s.Ae)
          : r instanceof or && s instanceof or;
    })(n.transform, e.transform)
  );
}
class _m {
  constructor(e, t) {
    ((this.version = e), (this.transformResults = t));
  }
}
class Ne {
  constructor(e, t) {
    ((this.updateTime = e), (this.exists = t));
  }
  static none() {
    return new Ne();
  }
  static exists(e) {
    return new Ne(void 0, e);
  }
  static updateTime(e) {
    return new Ne(e);
  }
  get isNone() {
    return this.updateTime === void 0 && this.exists === void 0;
  }
  isEqual(e) {
    return (
      this.exists === e.exists &&
      (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime)
    );
  }
}
function Yr(n, e) {
  return n.updateTime !== void 0
    ? e.isFoundDocument() && e.version.isEqual(n.updateTime)
    : n.exists === void 0 || n.exists === e.isFoundDocument();
}
class Ns {}
function Al(n, e) {
  if (!n.hasLocalMutations || (e && e.fields.length === 0)) return null;
  if (e === null)
    return n.isNoDocument() ? new po(n.key, Ne.none()) : new fr(n.key, n.data, Ne.none());
  {
    const t = n.data,
      r = Pe.empty();
    let s = new ae(de.comparator);
    for (let o of e.fields)
      if (!s.has(o)) {
        let a = t.field(o);
        (a === null && o.length > 1 && ((o = o.popLast()), (a = t.field(o))),
          a === null ? r.delete(o) : r.set(o, a),
          (s = s.add(o)));
      }
    return new kt(n.key, r, new be(s.toArray()), Ne.none());
  }
}
function ym(n, e, t) {
  n instanceof fr
    ? (function (s, o, a) {
        const u = s.value.clone(),
          h = Mc(s.fieldTransforms, o, a.transformResults);
        (u.setAll(h), o.convertToFoundDocument(a.version, u).setHasCommittedMutations());
      })(n, e, t)
    : n instanceof kt
      ? (function (s, o, a) {
          if (!Yr(s.precondition, o)) return void o.convertToUnknownDocument(a.version);
          const u = Mc(s.fieldTransforms, o, a.transformResults),
            h = o.data;
          (h.setAll(Rl(s)),
            h.setAll(u),
            o.convertToFoundDocument(a.version, h).setHasCommittedMutations());
        })(n, e, t)
      : (function (s, o, a) {
          o.convertToNoDocument(a.version).setHasCommittedMutations();
        })(0, e, t);
}
function Yn(n, e, t, r) {
  return n instanceof fr
    ? (function (o, a, u, h) {
        if (!Yr(o.precondition, a)) return u;
        const d = o.value.clone(),
          p = Lc(o.fieldTransforms, h, a);
        return (d.setAll(p), a.convertToFoundDocument(a.version, d).setHasLocalMutations(), null);
      })(n, e, t, r)
    : n instanceof kt
      ? (function (o, a, u, h) {
          if (!Yr(o.precondition, a)) return u;
          const d = Lc(o.fieldTransforms, h, a),
            p = a.data;
          return (
            p.setAll(Rl(o)),
            p.setAll(d),
            a.convertToFoundDocument(a.version, p).setHasLocalMutations(),
            u === null
              ? null
              : u.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map((E) => E.field))
          );
        })(n, e, t, r)
      : (function (o, a, u) {
          return Yr(o.precondition, a)
            ? (a.convertToNoDocument(a.version).setHasLocalMutations(), null)
            : u;
        })(n, e, t);
}
function Em(n, e) {
  let t = null;
  for (const r of n.fieldTransforms) {
    const s = e.data.field(r.field),
      o = Il(r.transform, s || null);
    o != null && (t === null && (t = Pe.empty()), t.set(r.field, o));
  }
  return t || null;
}
function Oc(n, e) {
  return (
    n.type === e.type &&
    !!n.key.isEqual(e.key) &&
    !!n.precondition.isEqual(e.precondition) &&
    !!(function (r, s) {
      return (r === void 0 && s === void 0) || (!(!r || !s) && ln(r, s, (o, a) => gm(o, a)));
    })(n.fieldTransforms, e.fieldTransforms) &&
    (n.type === 0
      ? n.value.isEqual(e.value)
      : n.type !== 1 || (n.data.isEqual(e.data) && n.fieldMask.isEqual(e.fieldMask)))
  );
}
class fr extends Ns {
  constructor(e, t, r, s = []) {
    (super(),
      (this.key = e),
      (this.value = t),
      (this.precondition = r),
      (this.fieldTransforms = s),
      (this.type = 0));
  }
  getFieldMask() {
    return null;
  }
}
class kt extends Ns {
  constructor(e, t, r, s, o = []) {
    (super(),
      (this.key = e),
      (this.data = t),
      (this.fieldMask = r),
      (this.precondition = s),
      (this.fieldTransforms = o),
      (this.type = 1));
  }
  getFieldMask() {
    return this.fieldMask;
  }
}
function Rl(n) {
  const e = new Map();
  return (
    n.fieldMask.fields.forEach((t) => {
      if (!t.isEmpty()) {
        const r = n.data.field(t);
        e.set(t, r);
      }
    }),
    e
  );
}
function Mc(n, e, t) {
  const r = new Map();
  K(n.length === t.length, 32656, { Re: t.length, Ve: n.length });
  for (let s = 0; s < t.length; s++) {
    const o = n[s],
      a = o.transform,
      u = e.data.field(o.field);
    r.set(o.field, pm(a, u, t[s]));
  }
  return r;
}
function Lc(n, e, t) {
  const r = new Map();
  for (const s of n) {
    const o = s.transform,
      a = t.data.field(s.field);
    r.set(s.field, fm(o, a, e));
  }
  return r;
}
class po extends Ns {
  constructor(e, t) {
    (super(),
      (this.key = e),
      (this.precondition = t),
      (this.type = 2),
      (this.fieldTransforms = []));
  }
  getFieldMask() {
    return null;
  }
}
class Im extends Ns {
  constructor(e, t) {
    (super(),
      (this.key = e),
      (this.precondition = t),
      (this.type = 3),
      (this.fieldTransforms = []));
  }
  getFieldMask() {
    return null;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Tm {
  constructor(e, t, r, s) {
    ((this.batchId = e), (this.localWriteTime = t), (this.baseMutations = r), (this.mutations = s));
  }
  applyToRemoteDocument(e, t) {
    const r = t.mutationResults;
    for (let s = 0; s < this.mutations.length; s++) {
      const o = this.mutations[s];
      o.key.isEqual(e.key) && ym(o, e, r[s]);
    }
  }
  applyToLocalView(e, t) {
    for (const r of this.baseMutations)
      r.key.isEqual(e.key) && (t = Yn(r, e, t, this.localWriteTime));
    for (const r of this.mutations) r.key.isEqual(e.key) && (t = Yn(r, e, t, this.localWriteTime));
    return t;
  }
  applyToLocalDocumentSet(e, t) {
    const r = yl();
    return (
      this.mutations.forEach((s) => {
        const o = e.get(s.key),
          a = o.overlayedDocument;
        let u = this.applyToLocalView(a, o.mutatedFields);
        u = t.has(s.key) ? null : u;
        const h = Al(a, u);
        (h !== null && r.set(s.key, h), a.isValidDocument() || a.convertToNoDocument(F.min()));
      }),
      r
    );
  }
  keys() {
    return this.mutations.reduce((e, t) => e.add(t.key), $());
  }
  isEqual(e) {
    return (
      this.batchId === e.batchId &&
      ln(this.mutations, e.mutations, (t, r) => Oc(t, r)) &&
      ln(this.baseMutations, e.baseMutations, (t, r) => Oc(t, r))
    );
  }
}
class mo {
  constructor(e, t, r, s) {
    ((this.batch = e),
      (this.commitVersion = t),
      (this.mutationResults = r),
      (this.docVersions = s));
  }
  static from(e, t, r) {
    K(e.mutations.length === r.length, 58842, { me: e.mutations.length, fe: r.length });
    let s = (function () {
      return cm;
    })();
    const o = e.mutations;
    for (let a = 0; a < o.length; a++) s = s.insert(o[a].key, r[a].version);
    return new mo(e, t, r, s);
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class vm {
  constructor(e, t) {
    ((this.largestBatchId = e), (this.mutation = t));
  }
  getKey() {
    return this.mutation.key;
  }
  isEqual(e) {
    return e !== null && this.mutation === e.mutation;
  }
  toString() {
    return `Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class wm {
  constructor(e, t) {
    ((this.count = e), (this.unchangedNames = t));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ var se, W;
function Am(n) {
  switch (n) {
    case S.OK:
      return x(64938);
    case S.CANCELLED:
    case S.UNKNOWN:
    case S.DEADLINE_EXCEEDED:
    case S.RESOURCE_EXHAUSTED:
    case S.INTERNAL:
    case S.UNAVAILABLE:
    case S.UNAUTHENTICATED:
      return !1;
    case S.INVALID_ARGUMENT:
    case S.NOT_FOUND:
    case S.ALREADY_EXISTS:
    case S.PERMISSION_DENIED:
    case S.FAILED_PRECONDITION:
    case S.ABORTED:
    case S.OUT_OF_RANGE:
    case S.UNIMPLEMENTED:
    case S.DATA_LOSS:
      return !0;
    default:
      return x(15467, { code: n });
  }
}
function Sl(n) {
  if (n === void 0) return (nt('GRPC error has no .code'), S.UNKNOWN);
  switch (n) {
    case se.OK:
      return S.OK;
    case se.CANCELLED:
      return S.CANCELLED;
    case se.UNKNOWN:
      return S.UNKNOWN;
    case se.DEADLINE_EXCEEDED:
      return S.DEADLINE_EXCEEDED;
    case se.RESOURCE_EXHAUSTED:
      return S.RESOURCE_EXHAUSTED;
    case se.INTERNAL:
      return S.INTERNAL;
    case se.UNAVAILABLE:
      return S.UNAVAILABLE;
    case se.UNAUTHENTICATED:
      return S.UNAUTHENTICATED;
    case se.INVALID_ARGUMENT:
      return S.INVALID_ARGUMENT;
    case se.NOT_FOUND:
      return S.NOT_FOUND;
    case se.ALREADY_EXISTS:
      return S.ALREADY_EXISTS;
    case se.PERMISSION_DENIED:
      return S.PERMISSION_DENIED;
    case se.FAILED_PRECONDITION:
      return S.FAILED_PRECONDITION;
    case se.ABORTED:
      return S.ABORTED;
    case se.OUT_OF_RANGE:
      return S.OUT_OF_RANGE;
    case se.UNIMPLEMENTED:
      return S.UNIMPLEMENTED;
    case se.DATA_LOSS:
      return S.DATA_LOSS;
    default:
      return x(39323, { code: n });
  }
}
(((W = se || (se = {}))[(W.OK = 0)] = 'OK'),
  (W[(W.CANCELLED = 1)] = 'CANCELLED'),
  (W[(W.UNKNOWN = 2)] = 'UNKNOWN'),
  (W[(W.INVALID_ARGUMENT = 3)] = 'INVALID_ARGUMENT'),
  (W[(W.DEADLINE_EXCEEDED = 4)] = 'DEADLINE_EXCEEDED'),
  (W[(W.NOT_FOUND = 5)] = 'NOT_FOUND'),
  (W[(W.ALREADY_EXISTS = 6)] = 'ALREADY_EXISTS'),
  (W[(W.PERMISSION_DENIED = 7)] = 'PERMISSION_DENIED'),
  (W[(W.UNAUTHENTICATED = 16)] = 'UNAUTHENTICATED'),
  (W[(W.RESOURCE_EXHAUSTED = 8)] = 'RESOURCE_EXHAUSTED'),
  (W[(W.FAILED_PRECONDITION = 9)] = 'FAILED_PRECONDITION'),
  (W[(W.ABORTED = 10)] = 'ABORTED'),
  (W[(W.OUT_OF_RANGE = 11)] = 'OUT_OF_RANGE'),
  (W[(W.UNIMPLEMENTED = 12)] = 'UNIMPLEMENTED'),
  (W[(W.INTERNAL = 13)] = 'INTERNAL'),
  (W[(W.UNAVAILABLE = 14)] = 'UNAVAILABLE'),
  (W[(W.DATA_LOSS = 15)] = 'DATA_LOSS'));
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Rm() {
  return new TextEncoder();
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Sm = new vt([4294967295, 4294967295], 0);
function xc(n) {
  const e = Rm().encode(n),
    t = new ju();
  return (t.update(e), new Uint8Array(t.digest()));
}
function Fc(n) {
  const e = new DataView(n.buffer),
    t = e.getUint32(0, !0),
    r = e.getUint32(4, !0),
    s = e.getUint32(8, !0),
    o = e.getUint32(12, !0);
  return [new vt([t, r], 0), new vt([s, o], 0)];
}
class go {
  constructor(e, t, r) {
    if (((this.bitmap = e), (this.padding = t), (this.hashCount = r), t < 0 || t >= 8))
      throw new zn(`Invalid padding: ${t}`);
    if (r < 0) throw new zn(`Invalid hash count: ${r}`);
    if (e.length > 0 && this.hashCount === 0) throw new zn(`Invalid hash count: ${r}`);
    if (e.length === 0 && t !== 0) throw new zn(`Invalid padding when bitmap length is 0: ${t}`);
    ((this.ge = 8 * e.length - t), (this.pe = vt.fromNumber(this.ge)));
  }
  ye(e, t, r) {
    let s = e.add(t.multiply(vt.fromNumber(r)));
    return (
      s.compare(Sm) === 1 && (s = new vt([s.getBits(0), s.getBits(1)], 0)),
      s.modulo(this.pe).toNumber()
    );
  }
  we(e) {
    return !!(this.bitmap[Math.floor(e / 8)] & (1 << e % 8));
  }
  mightContain(e) {
    if (this.ge === 0) return !1;
    const t = xc(e),
      [r, s] = Fc(t);
    for (let o = 0; o < this.hashCount; o++) {
      const a = this.ye(r, s, o);
      if (!this.we(a)) return !1;
    }
    return !0;
  }
  static create(e, t, r) {
    const s = e % 8 == 0 ? 0 : 8 - (e % 8),
      o = new Uint8Array(Math.ceil(e / 8)),
      a = new go(o, s, t);
    return (r.forEach((u) => a.insert(u)), a);
  }
  insert(e) {
    if (this.ge === 0) return;
    const t = xc(e),
      [r, s] = Fc(t);
    for (let o = 0; o < this.hashCount; o++) {
      const a = this.ye(r, s, o);
      this.Se(a);
    }
  }
  Se(e) {
    const t = Math.floor(e / 8),
      r = e % 8;
    this.bitmap[t] |= 1 << r;
  }
}
class zn extends Error {
  constructor() {
    (super(...arguments), (this.name = 'BloomFilterError'));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Ds {
  constructor(e, t, r, s, o) {
    ((this.snapshotVersion = e),
      (this.targetChanges = t),
      (this.targetMismatches = r),
      (this.documentUpdates = s),
      (this.resolvedLimboDocuments = o));
  }
  static createSynthesizedRemoteEventForCurrentChange(e, t, r) {
    const s = new Map();
    return (
      s.set(e, pr.createSynthesizedTargetChangeForCurrentChange(e, t, r)),
      new Ds(F.min(), s, new Z(j), rt(), $())
    );
  }
}
class pr {
  constructor(e, t, r, s, o) {
    ((this.resumeToken = e),
      (this.current = t),
      (this.addedDocuments = r),
      (this.modifiedDocuments = s),
      (this.removedDocuments = o));
  }
  static createSynthesizedTargetChangeForCurrentChange(e, t, r) {
    return new pr(r, t, $(), $(), $());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Xr {
  constructor(e, t, r, s) {
    ((this.be = e), (this.removedTargetIds = t), (this.key = r), (this.De = s));
  }
}
class Pl {
  constructor(e, t) {
    ((this.targetId = e), (this.Ce = t));
  }
}
class Cl {
  constructor(e, t, r = fe.EMPTY_BYTE_STRING, s = null) {
    ((this.state = e), (this.targetIds = t), (this.resumeToken = r), (this.cause = s));
  }
}
class Uc {
  constructor() {
    ((this.ve = 0),
      (this.Fe = Bc()),
      (this.Me = fe.EMPTY_BYTE_STRING),
      (this.xe = !1),
      (this.Oe = !0));
  }
  get current() {
    return this.xe;
  }
  get resumeToken() {
    return this.Me;
  }
  get Ne() {
    return this.ve !== 0;
  }
  get Be() {
    return this.Oe;
  }
  Le(e) {
    e.approximateByteSize() > 0 && ((this.Oe = !0), (this.Me = e));
  }
  ke() {
    let e = $(),
      t = $(),
      r = $();
    return (
      this.Fe.forEach((s, o) => {
        switch (o) {
          case 0:
            e = e.add(s);
            break;
          case 2:
            t = t.add(s);
            break;
          case 1:
            r = r.add(s);
            break;
          default:
            x(38017, { changeType: o });
        }
      }),
      new pr(this.Me, this.xe, e, t, r)
    );
  }
  qe() {
    ((this.Oe = !1), (this.Fe = Bc()));
  }
  Qe(e, t) {
    ((this.Oe = !0), (this.Fe = this.Fe.insert(e, t)));
  }
  $e(e) {
    ((this.Oe = !0), (this.Fe = this.Fe.remove(e)));
  }
  Ue() {
    this.ve += 1;
  }
  Ke() {
    ((this.ve -= 1), K(this.ve >= 0, 3241, { ve: this.ve }));
  }
  We() {
    ((this.Oe = !0), (this.xe = !0));
  }
}
class Pm {
  constructor(e) {
    ((this.Ge = e),
      (this.ze = new Map()),
      (this.je = rt()),
      (this.Je = zr()),
      (this.He = zr()),
      (this.Ye = new Z(j)));
  }
  Ze(e) {
    for (const t of e.be)
      e.De && e.De.isFoundDocument() ? this.Xe(t, e.De) : this.et(t, e.key, e.De);
    for (const t of e.removedTargetIds) this.et(t, e.key, e.De);
  }
  tt(e) {
    this.forEachTarget(e, (t) => {
      const r = this.nt(t);
      switch (e.state) {
        case 0:
          this.rt(t) && r.Le(e.resumeToken);
          break;
        case 1:
          (r.Ke(), r.Ne || r.qe(), r.Le(e.resumeToken));
          break;
        case 2:
          (r.Ke(), r.Ne || this.removeTarget(t));
          break;
        case 3:
          this.rt(t) && (r.We(), r.Le(e.resumeToken));
          break;
        case 4:
          this.rt(t) && (this.it(t), r.Le(e.resumeToken));
          break;
        default:
          x(56790, { state: e.state });
      }
    });
  }
  forEachTarget(e, t) {
    e.targetIds.length > 0
      ? e.targetIds.forEach(t)
      : this.ze.forEach((r, s) => {
          this.rt(s) && t(s);
        });
  }
  st(e) {
    const t = e.targetId,
      r = e.Ce.count,
      s = this.ot(t);
    if (s) {
      const o = s.target;
      if (ji(o))
        if (r === 0) {
          const a = new M(o.path);
          this.et(t, a, Ie.newNoDocument(a, F.min()));
        } else K(r === 1, 20013, { expectedCount: r });
      else {
        const a = this._t(t);
        if (a !== r) {
          const u = this.ut(e),
            h = u ? this.ct(u, e, a) : 1;
          if (h !== 0) {
            this.it(t);
            const d =
              h === 2
                ? 'TargetPurposeExistenceFilterMismatchBloom'
                : 'TargetPurposeExistenceFilterMismatch';
            this.Ye = this.Ye.insert(t, d);
          }
        }
      }
    }
  }
  ut(e) {
    const t = e.Ce.unchangedNames;
    if (!t || !t.bits) return null;
    const {
      bits: { bitmap: r = '', padding: s = 0 },
      hashCount: o = 0,
    } = t;
    let a, u;
    try {
      a = St(r).toUint8Array();
    } catch (h) {
      if (h instanceof Zu)
        return (
          er(
            'Decoding the base64 bloom filter in existence filter failed (' +
              h.message +
              '); ignoring the bloom filter and falling back to full re-query.'
          ),
          null
        );
      throw h;
    }
    try {
      u = new go(a, s, o);
    } catch (h) {
      return (
        er(h instanceof zn ? 'BloomFilter error: ' : 'Applying bloom filter failed: ', h),
        null
      );
    }
    return u.ge === 0 ? null : u;
  }
  ct(e, t, r) {
    return t.Ce.count === r - this.Pt(e, t.targetId) ? 0 : 2;
  }
  Pt(e, t) {
    const r = this.Ge.getRemoteKeysForTarget(t);
    let s = 0;
    return (
      r.forEach((o) => {
        const a = this.Ge.ht(),
          u = `projects/${a.projectId}/databases/${a.database}/documents/${o.path.canonicalString()}`;
        e.mightContain(u) || (this.et(t, o, null), s++);
      }),
      s
    );
  }
  Tt(e) {
    const t = new Map();
    this.ze.forEach((o, a) => {
      const u = this.ot(a);
      if (u) {
        if (o.current && ji(u.target)) {
          const h = new M(u.target.path);
          this.It(h).has(a) || this.Et(a, h) || this.et(a, h, Ie.newNoDocument(h, e));
        }
        o.Be && (t.set(a, o.ke()), o.qe());
      }
    });
    let r = $();
    (this.He.forEach((o, a) => {
      let u = !0;
      (a.forEachWhile((h) => {
        const d = this.ot(h);
        return !d || d.purpose === 'TargetPurposeLimboResolution' || ((u = !1), !1);
      }),
        u && (r = r.add(o)));
    }),
      this.je.forEach((o, a) => a.setReadTime(e)));
    const s = new Ds(e, t, this.Ye, this.je, r);
    return ((this.je = rt()), (this.Je = zr()), (this.He = zr()), (this.Ye = new Z(j)), s);
  }
  Xe(e, t) {
    if (!this.rt(e)) return;
    const r = this.Et(e, t.key) ? 2 : 0;
    (this.nt(e).Qe(t.key, r),
      (this.je = this.je.insert(t.key, t)),
      (this.Je = this.Je.insert(t.key, this.It(t.key).add(e))),
      (this.He = this.He.insert(t.key, this.dt(t.key).add(e))));
  }
  et(e, t, r) {
    if (!this.rt(e)) return;
    const s = this.nt(e);
    (this.Et(e, t) ? s.Qe(t, 1) : s.$e(t),
      (this.He = this.He.insert(t, this.dt(t).delete(e))),
      (this.He = this.He.insert(t, this.dt(t).add(e))),
      r && (this.je = this.je.insert(t, r)));
  }
  removeTarget(e) {
    this.ze.delete(e);
  }
  _t(e) {
    const t = this.nt(e).ke();
    return this.Ge.getRemoteKeysForTarget(e).size + t.addedDocuments.size - t.removedDocuments.size;
  }
  Ue(e) {
    this.nt(e).Ue();
  }
  nt(e) {
    let t = this.ze.get(e);
    return (t || ((t = new Uc()), this.ze.set(e, t)), t);
  }
  dt(e) {
    let t = this.He.get(e);
    return (t || ((t = new ae(j)), (this.He = this.He.insert(e, t))), t);
  }
  It(e) {
    let t = this.Je.get(e);
    return (t || ((t = new ae(j)), (this.Je = this.Je.insert(e, t))), t);
  }
  rt(e) {
    const t = this.ot(e) !== null;
    return (t || D('WatchChangeAggregator', 'Detected inactive target', e), t);
  }
  ot(e) {
    const t = this.ze.get(e);
    return t && t.Ne ? null : this.Ge.At(e);
  }
  it(e) {
    (this.ze.set(e, new Uc()),
      this.Ge.getRemoteKeysForTarget(e).forEach((t) => {
        this.et(e, t, null);
      }));
  }
  Et(e, t) {
    return this.Ge.getRemoteKeysForTarget(e).has(t);
  }
}
function zr() {
  return new Z(M.comparator);
}
function Bc() {
  return new Z(M.comparator);
}
const Cm = { asc: 'ASCENDING', desc: 'DESCENDING' },
  bm = {
    '<': 'LESS_THAN',
    '<=': 'LESS_THAN_OR_EQUAL',
    '>': 'GREATER_THAN',
    '>=': 'GREATER_THAN_OR_EQUAL',
    '==': 'EQUAL',
    '!=': 'NOT_EQUAL',
    'array-contains': 'ARRAY_CONTAINS',
    in: 'IN',
    'not-in': 'NOT_IN',
    'array-contains-any': 'ARRAY_CONTAINS_ANY',
  },
  Vm = { and: 'AND', or: 'OR' };
class km {
  constructor(e, t) {
    ((this.databaseId = e), (this.useProto3Json = t));
  }
}
function zi(n, e) {
  return n.useProto3Json || Ss(e) ? e : { value: e };
}
function us(n, e) {
  return n.useProto3Json
    ? `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, '').replace('Z', '')}.${('000000000' + e.nanoseconds).slice(-9)}Z`
    : { seconds: '' + e.seconds, nanos: e.nanoseconds };
}
function bl(n, e) {
  return n.useProto3Json ? e.toBase64() : e.toUint8Array();
}
function Nm(n, e) {
  return us(n, e.toTimestamp());
}
function je(n) {
  return (
    K(!!n, 49232),
    F.fromTimestamp(
      (function (t) {
        const r = Rt(t);
        return new J(r.seconds, r.nanos);
      })(n)
    )
  );
}
function _o(n, e) {
  return Hi(n, e).canonicalString();
}
function Hi(n, e) {
  const t = (function (s) {
    return new Y(['projects', s.projectId, 'databases', s.database]);
  })(n).child('documents');
  return e === void 0 ? t : t.child(e);
}
function Vl(n) {
  const e = Y.fromString(n);
  return (K(Ml(e), 10190, { key: e.toString() }), e);
}
function Wi(n, e) {
  return _o(n.databaseId, e.path);
}
function Si(n, e) {
  const t = Vl(e);
  if (t.get(1) !== n.databaseId.projectId)
    throw new k(
      S.INVALID_ARGUMENT,
      'Tried to deserialize key from different project: ' +
        t.get(1) +
        ' vs ' +
        n.databaseId.projectId
    );
  if (t.get(3) !== n.databaseId.database)
    throw new k(
      S.INVALID_ARGUMENT,
      'Tried to deserialize key from different database: ' +
        t.get(3) +
        ' vs ' +
        n.databaseId.database
    );
  return new M(Nl(t));
}
function kl(n, e) {
  return _o(n.databaseId, e);
}
function Dm(n) {
  const e = Vl(n);
  return e.length === 4 ? Y.emptyPath() : Nl(e);
}
function Gi(n) {
  return new Y([
    'projects',
    n.databaseId.projectId,
    'databases',
    n.databaseId.database,
  ]).canonicalString();
}
function Nl(n) {
  return (K(n.length > 4 && n.get(4) === 'documents', 29091, { key: n.toString() }), n.popFirst(5));
}
function qc(n, e, t) {
  return { name: Wi(n, e), fields: t.value.mapValue.fields };
}
function Om(n, e) {
  let t;
  if ('targetChange' in e) {
    e.targetChange;
    const r = (function (d) {
        return d === 'NO_CHANGE'
          ? 0
          : d === 'ADD'
            ? 1
            : d === 'REMOVE'
              ? 2
              : d === 'CURRENT'
                ? 3
                : d === 'RESET'
                  ? 4
                  : x(39313, { state: d });
      })(e.targetChange.targetChangeType || 'NO_CHANGE'),
      s = e.targetChange.targetIds || [],
      o = (function (d, p) {
        return d.useProto3Json
          ? (K(p === void 0 || typeof p == 'string', 58123), fe.fromBase64String(p || ''))
          : (K(p === void 0 || p instanceof Buffer || p instanceof Uint8Array, 16193),
            fe.fromUint8Array(p || new Uint8Array()));
      })(n, e.targetChange.resumeToken),
      a = e.targetChange.cause,
      u =
        a &&
        (function (d) {
          const p = d.code === void 0 ? S.UNKNOWN : Sl(d.code);
          return new k(p, d.message || '');
        })(a);
    t = new Cl(r, s, o, u || null);
  } else if ('documentChange' in e) {
    e.documentChange;
    const r = e.documentChange;
    (r.document, r.document.name, r.document.updateTime);
    const s = Si(n, r.document.name),
      o = je(r.document.updateTime),
      a = r.document.createTime ? je(r.document.createTime) : F.min(),
      u = new Pe({ mapValue: { fields: r.document.fields } }),
      h = Ie.newFoundDocument(s, o, a, u),
      d = r.targetIds || [],
      p = r.removedTargetIds || [];
    t = new Xr(d, p, h.key, h);
  } else if ('documentDelete' in e) {
    e.documentDelete;
    const r = e.documentDelete;
    r.document;
    const s = Si(n, r.document),
      o = r.readTime ? je(r.readTime) : F.min(),
      a = Ie.newNoDocument(s, o),
      u = r.removedTargetIds || [];
    t = new Xr([], u, a.key, a);
  } else if ('documentRemove' in e) {
    e.documentRemove;
    const r = e.documentRemove;
    r.document;
    const s = Si(n, r.document),
      o = r.removedTargetIds || [];
    t = new Xr([], o, s, null);
  } else {
    if (!('filter' in e)) return x(11601, { Rt: e });
    {
      e.filter;
      const r = e.filter;
      r.targetId;
      const { count: s = 0, unchangedNames: o } = r,
        a = new wm(s, o),
        u = r.targetId;
      t = new Pl(u, a);
    }
  }
  return t;
}
function Mm(n, e) {
  let t;
  if (e instanceof fr) t = { update: qc(n, e.key, e.value) };
  else if (e instanceof po) t = { delete: Wi(n, e.key) };
  else if (e instanceof kt) t = { update: qc(n, e.key, e.data), updateMask: zm(e.fieldMask) };
  else {
    if (!(e instanceof Im)) return x(16599, { Vt: e.type });
    t = { verify: Wi(n, e.key) };
  }
  return (
    e.fieldTransforms.length > 0 &&
      (t.updateTransforms = e.fieldTransforms.map((r) =>
        (function (o, a) {
          const u = a.transform;
          if (u instanceof or)
            return { fieldPath: a.field.canonicalString(), setToServerValue: 'REQUEST_TIME' };
          if (u instanceof ar)
            return {
              fieldPath: a.field.canonicalString(),
              appendMissingElements: { values: u.elements },
            };
          if (u instanceof cr)
            return {
              fieldPath: a.field.canonicalString(),
              removeAllFromArray: { values: u.elements },
            };
          if (u instanceof cs) return { fieldPath: a.field.canonicalString(), increment: u.Ae };
          throw x(20930, { transform: a.transform });
        })(0, r)
      )),
    e.precondition.isNone ||
      (t.currentDocument = (function (s, o) {
        return o.updateTime !== void 0
          ? { updateTime: Nm(s, o.updateTime) }
          : o.exists !== void 0
            ? { exists: o.exists }
            : x(27497);
      })(n, e.precondition)),
    t
  );
}
function Lm(n, e) {
  return n && n.length > 0
    ? (K(e !== void 0, 14353),
      n.map((t) =>
        (function (s, o) {
          let a = s.updateTime ? je(s.updateTime) : je(o);
          return (a.isEqual(F.min()) && (a = je(o)), new _m(a, s.transformResults || []));
        })(t, e)
      ))
    : [];
}
function xm(n, e) {
  return { documents: [kl(n, e.path)] };
}
function Fm(n, e) {
  const t = { structuredQuery: {} },
    r = e.path;
  let s;
  (e.collectionGroup !== null
    ? ((s = r),
      (t.structuredQuery.from = [{ collectionId: e.collectionGroup, allDescendants: !0 }]))
    : ((s = r.popLast()), (t.structuredQuery.from = [{ collectionId: r.lastSegment() }])),
    (t.parent = kl(n, s)));
  const o = (function (d) {
    if (d.length !== 0) return Ol(Fe.create(d, 'and'));
  })(e.filters);
  o && (t.structuredQuery.where = o);
  const a = (function (d) {
    if (d.length !== 0)
      return d.map((p) =>
        (function (y) {
          return { field: nn(y.field), direction: qm(y.dir) };
        })(p)
      );
  })(e.orderBy);
  a && (t.structuredQuery.orderBy = a);
  const u = zi(n, e.limit);
  return (
    u !== null && (t.structuredQuery.limit = u),
    e.startAt &&
      (t.structuredQuery.startAt = (function (d) {
        return { before: d.inclusive, values: d.position };
      })(e.startAt)),
    e.endAt &&
      (t.structuredQuery.endAt = (function (d) {
        return { before: !d.inclusive, values: d.position };
      })(e.endAt)),
    { ft: t, parent: s }
  );
}
function Um(n) {
  let e = Dm(n.parent);
  const t = n.structuredQuery,
    r = t.from ? t.from.length : 0;
  let s = null;
  if (r > 0) {
    K(r === 1, 65062);
    const p = t.from[0];
    p.allDescendants ? (s = p.collectionId) : (e = e.child(p.collectionId));
  }
  let o = [];
  t.where &&
    (o = (function (E) {
      const y = Dl(E);
      return y instanceof Fe && ul(y) ? y.getFilters() : [y];
    })(t.where));
  let a = [];
  t.orderBy &&
    (a = (function (E) {
      return E.map((y) =>
        (function (b) {
          return new ir(
            rn(b.field),
            (function (N) {
              switch (N) {
                case 'ASCENDING':
                  return 'asc';
                case 'DESCENDING':
                  return 'desc';
                default:
                  return;
              }
            })(b.direction)
          );
        })(y)
      );
    })(t.orderBy));
  let u = null;
  t.limit &&
    (u = (function (E) {
      let y;
      return ((y = typeof E == 'object' ? E.value : E), Ss(y) ? null : y);
    })(t.limit));
  let h = null;
  t.startAt &&
    (h = (function (E) {
      const y = !!E.before,
        C = E.values || [];
      return new os(C, y);
    })(t.startAt));
  let d = null;
  return (
    t.endAt &&
      (d = (function (E) {
        const y = !E.before,
          C = E.values || [];
        return new os(C, y);
      })(t.endAt)),
    rm(e, s, a, o, u, 'F', h, d)
  );
}
function Bm(n, e) {
  const t = (function (s) {
    switch (s) {
      case 'TargetPurposeListen':
        return null;
      case 'TargetPurposeExistenceFilterMismatch':
        return 'existence-filter-mismatch';
      case 'TargetPurposeExistenceFilterMismatchBloom':
        return 'existence-filter-mismatch-bloom';
      case 'TargetPurposeLimboResolution':
        return 'limbo-document';
      default:
        return x(28987, { purpose: s });
    }
  })(e.purpose);
  return t == null ? null : { 'goog-listen-tags': t };
}
function Dl(n) {
  return n.unaryFilter !== void 0
    ? (function (t) {
        switch (t.unaryFilter.op) {
          case 'IS_NAN':
            const r = rn(t.unaryFilter.field);
            return ie.create(r, '==', { doubleValue: NaN });
          case 'IS_NULL':
            const s = rn(t.unaryFilter.field);
            return ie.create(s, '==', { nullValue: 'NULL_VALUE' });
          case 'IS_NOT_NAN':
            const o = rn(t.unaryFilter.field);
            return ie.create(o, '!=', { doubleValue: NaN });
          case 'IS_NOT_NULL':
            const a = rn(t.unaryFilter.field);
            return ie.create(a, '!=', { nullValue: 'NULL_VALUE' });
          case 'OPERATOR_UNSPECIFIED':
            return x(61313);
          default:
            return x(60726);
        }
      })(n)
    : n.fieldFilter !== void 0
      ? (function (t) {
          return ie.create(
            rn(t.fieldFilter.field),
            (function (s) {
              switch (s) {
                case 'EQUAL':
                  return '==';
                case 'NOT_EQUAL':
                  return '!=';
                case 'GREATER_THAN':
                  return '>';
                case 'GREATER_THAN_OR_EQUAL':
                  return '>=';
                case 'LESS_THAN':
                  return '<';
                case 'LESS_THAN_OR_EQUAL':
                  return '<=';
                case 'ARRAY_CONTAINS':
                  return 'array-contains';
                case 'IN':
                  return 'in';
                case 'NOT_IN':
                  return 'not-in';
                case 'ARRAY_CONTAINS_ANY':
                  return 'array-contains-any';
                case 'OPERATOR_UNSPECIFIED':
                  return x(58110);
                default:
                  return x(50506);
              }
            })(t.fieldFilter.op),
            t.fieldFilter.value
          );
        })(n)
      : n.compositeFilter !== void 0
        ? (function (t) {
            return Fe.create(
              t.compositeFilter.filters.map((r) => Dl(r)),
              (function (s) {
                switch (s) {
                  case 'AND':
                    return 'and';
                  case 'OR':
                    return 'or';
                  default:
                    return x(1026);
                }
              })(t.compositeFilter.op)
            );
          })(n)
        : x(30097, { filter: n });
}
function qm(n) {
  return Cm[n];
}
function jm(n) {
  return bm[n];
}
function $m(n) {
  return Vm[n];
}
function nn(n) {
  return { fieldPath: n.canonicalString() };
}
function rn(n) {
  return de.fromServerFormat(n.fieldPath);
}
function Ol(n) {
  return n instanceof ie
    ? (function (t) {
        if (t.op === '==') {
          if (Cc(t.value)) return { unaryFilter: { field: nn(t.field), op: 'IS_NAN' } };
          if (Pc(t.value)) return { unaryFilter: { field: nn(t.field), op: 'IS_NULL' } };
        } else if (t.op === '!=') {
          if (Cc(t.value)) return { unaryFilter: { field: nn(t.field), op: 'IS_NOT_NAN' } };
          if (Pc(t.value)) return { unaryFilter: { field: nn(t.field), op: 'IS_NOT_NULL' } };
        }
        return { fieldFilter: { field: nn(t.field), op: jm(t.op), value: t.value } };
      })(n)
    : n instanceof Fe
      ? (function (t) {
          const r = t.getFilters().map((s) => Ol(s));
          return r.length === 1 ? r[0] : { compositeFilter: { op: $m(t.op), filters: r } };
        })(n)
      : x(54877, { filter: n });
}
function zm(n) {
  const e = [];
  return (n.fields.forEach((t) => e.push(t.canonicalString())), { fieldPaths: e });
}
function Ml(n) {
  return n.length >= 4 && n.get(0) === 'projects' && n.get(2) === 'databases';
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class yt {
  constructor(e, t, r, s, o = F.min(), a = F.min(), u = fe.EMPTY_BYTE_STRING, h = null) {
    ((this.target = e),
      (this.targetId = t),
      (this.purpose = r),
      (this.sequenceNumber = s),
      (this.snapshotVersion = o),
      (this.lastLimboFreeSnapshotVersion = a),
      (this.resumeToken = u),
      (this.expectedCount = h));
  }
  withSequenceNumber(e) {
    return new yt(
      this.target,
      this.targetId,
      this.purpose,
      e,
      this.snapshotVersion,
      this.lastLimboFreeSnapshotVersion,
      this.resumeToken,
      this.expectedCount
    );
  }
  withResumeToken(e, t) {
    return new yt(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      t,
      this.lastLimboFreeSnapshotVersion,
      e,
      null
    );
  }
  withExpectedCount(e) {
    return new yt(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      this.snapshotVersion,
      this.lastLimboFreeSnapshotVersion,
      this.resumeToken,
      e
    );
  }
  withLastLimboFreeSnapshotVersion(e) {
    return new yt(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      this.snapshotVersion,
      e,
      this.resumeToken,
      this.expectedCount
    );
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Hm {
  constructor(e) {
    this.yt = e;
  }
}
function Wm(n) {
  const e = Um({ parent: n.parent, structuredQuery: n.structuredQuery });
  return n.limitType === 'LAST' ? as(e, e.limit, 'L') : e;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Gm {
  constructor() {
    this.Cn = new Km();
  }
  addToCollectionParentIndex(e, t) {
    return (this.Cn.add(t), P.resolve());
  }
  getCollectionParents(e, t) {
    return P.resolve(this.Cn.getEntries(t));
  }
  addFieldIndex(e, t) {
    return P.resolve();
  }
  deleteFieldIndex(e, t) {
    return P.resolve();
  }
  deleteAllFieldIndexes(e) {
    return P.resolve();
  }
  createTargetIndexes(e, t) {
    return P.resolve();
  }
  getDocumentsMatchingTarget(e, t) {
    return P.resolve(null);
  }
  getIndexType(e, t) {
    return P.resolve(0);
  }
  getFieldIndexes(e, t) {
    return P.resolve([]);
  }
  getNextCollectionGroupToUpdate(e) {
    return P.resolve(null);
  }
  getMinOffset(e, t) {
    return P.resolve(At.min());
  }
  getMinOffsetFromCollectionGroup(e, t) {
    return P.resolve(At.min());
  }
  updateCollectionGroup(e, t, r) {
    return P.resolve();
  }
  updateIndexEntries(e, t) {
    return P.resolve();
  }
}
class Km {
  constructor() {
    this.index = {};
  }
  add(e) {
    const t = e.lastSegment(),
      r = e.popLast(),
      s = this.index[t] || new ae(Y.comparator),
      o = !s.has(r);
    return ((this.index[t] = s.add(r)), o);
  }
  has(e) {
    const t = e.lastSegment(),
      r = e.popLast(),
      s = this.index[t];
    return s && s.has(r);
  }
  getEntries(e) {
    return (this.index[e] || new ae(Y.comparator)).toArray();
  }
}
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const jc = { didRun: !1, sequenceNumbersCollected: 0, targetsRemoved: 0, documentsRemoved: 0 },
  Ll = 41943040;
class Se {
  static withCacheSize(e) {
    return new Se(e, Se.DEFAULT_COLLECTION_PERCENTILE, Se.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT);
  }
  constructor(e, t, r) {
    ((this.cacheSizeCollectionThreshold = e),
      (this.percentileToCollect = t),
      (this.maximumSequenceNumbersToCollect = r));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ ((Se.DEFAULT_COLLECTION_PERCENTILE = 10),
  (Se.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3),
  (Se.DEFAULT = new Se(
    Ll,
    Se.DEFAULT_COLLECTION_PERCENTILE,
    Se.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT
  )),
  (Se.DISABLED = new Se(-1, 0, 0)));
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class fn {
  constructor(e) {
    this.ar = e;
  }
  next() {
    return ((this.ar += 2), this.ar);
  }
  static ur() {
    return new fn(0);
  }
  static cr() {
    return new fn(-1);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const $c = 'LruGarbageCollector',
  xl = 1048576;
function zc([n, e], [t, r]) {
  const s = j(n, t);
  return s === 0 ? j(e, r) : s;
}
class Qm {
  constructor(e) {
    ((this.Ir = e), (this.buffer = new ae(zc)), (this.Er = 0));
  }
  dr() {
    return ++this.Er;
  }
  Ar(e) {
    const t = [e, this.dr()];
    if (this.buffer.size < this.Ir) this.buffer = this.buffer.add(t);
    else {
      const r = this.buffer.last();
      zc(t, r) < 0 && (this.buffer = this.buffer.delete(r).add(t));
    }
  }
  get maxValue() {
    return this.buffer.last()[0];
  }
}
class Ym {
  constructor(e, t, r) {
    ((this.garbageCollector = e), (this.asyncQueue = t), (this.localStore = r), (this.Rr = null));
  }
  start() {
    this.garbageCollector.params.cacheSizeCollectionThreshold !== -1 && this.Vr(6e4);
  }
  stop() {
    this.Rr && (this.Rr.cancel(), (this.Rr = null));
  }
  get started() {
    return this.Rr !== null;
  }
  Vr(e) {
    (D($c, `Garbage collection scheduled in ${e}ms`),
      (this.Rr = this.asyncQueue.enqueueAfterDelay('lru_garbage_collection', e, async () => {
        this.Rr = null;
        try {
          await this.localStore.collectGarbage(this.garbageCollector);
        } catch (t) {
          In(t) ? D($c, 'Ignoring IndexedDB error during garbage collection: ', t) : await En(t);
        }
        await this.Vr(3e5);
      })));
  }
}
class Xm {
  constructor(e, t) {
    ((this.mr = e), (this.params = t));
  }
  calculateTargetCount(e, t) {
    return this.mr.gr(e).next((r) => Math.floor((t / 100) * r));
  }
  nthSequenceNumber(e, t) {
    if (t === 0) return P.resolve(Rs.ce);
    const r = new Qm(t);
    return this.mr
      .forEachTarget(e, (s) => r.Ar(s.sequenceNumber))
      .next(() => this.mr.pr(e, (s) => r.Ar(s)))
      .next(() => r.maxValue);
  }
  removeTargets(e, t, r) {
    return this.mr.removeTargets(e, t, r);
  }
  removeOrphanedDocuments(e, t) {
    return this.mr.removeOrphanedDocuments(e, t);
  }
  collect(e, t) {
    return this.params.cacheSizeCollectionThreshold === -1
      ? (D('LruGarbageCollector', 'Garbage collection skipped; disabled'), P.resolve(jc))
      : this.getCacheSize(e).next((r) =>
          r < this.params.cacheSizeCollectionThreshold
            ? (D(
                'LruGarbageCollector',
                `Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`
              ),
              jc)
            : this.yr(e, t)
        );
  }
  getCacheSize(e) {
    return this.mr.getCacheSize(e);
  }
  yr(e, t) {
    let r, s, o, a, u, h, d;
    const p = Date.now();
    return this.calculateTargetCount(e, this.params.percentileToCollect)
      .next(
        (E) => (
          E > this.params.maximumSequenceNumbersToCollect
            ? (D(
                'LruGarbageCollector',
                `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${E}`
              ),
              (s = this.params.maximumSequenceNumbersToCollect))
            : (s = E),
          (a = Date.now()),
          this.nthSequenceNumber(e, s)
        )
      )
      .next((E) => ((r = E), (u = Date.now()), this.removeTargets(e, r, t)))
      .next((E) => ((o = E), (h = Date.now()), this.removeOrphanedDocuments(e, r)))
      .next(
        (E) => (
          (d = Date.now()),
          en() <= q.DEBUG &&
            D(
              'LruGarbageCollector',
              `LRU Garbage Collection
	Counted targets in ${a - p}ms
	Determined least recently used ${s} in ` +
                (u - a) +
                `ms
	Removed ${o} targets in ` +
                (h - u) +
                `ms
	Removed ${E} documents in ` +
                (d - h) +
                `ms
Total Duration: ${d - p}ms`
            ),
          P.resolve({
            didRun: !0,
            sequenceNumbersCollected: s,
            targetsRemoved: o,
            documentsRemoved: E,
          })
        )
      );
  }
}
function Jm(n, e) {
  return new Xm(n, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Zm {
  constructor() {
    ((this.changes = new Gt(
      (e) => e.toString(),
      (e, t) => e.isEqual(t)
    )),
      (this.changesApplied = !1));
  }
  addEntry(e) {
    (this.assertNotApplied(), this.changes.set(e.key, e));
  }
  removeEntry(e, t) {
    (this.assertNotApplied(), this.changes.set(e, Ie.newInvalidDocument(e).setReadTime(t)));
  }
  getEntry(e, t) {
    this.assertNotApplied();
    const r = this.changes.get(t);
    return r !== void 0 ? P.resolve(r) : this.getFromCache(e, t);
  }
  getEntries(e, t) {
    return this.getAllFromCache(e, t);
  }
  apply(e) {
    return (this.assertNotApplied(), (this.changesApplied = !0), this.applyChanges(e));
  }
  assertNotApplied() {}
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class eg {
  constructor(e, t) {
    ((this.overlayedDocument = e), (this.mutatedFields = t));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class tg {
  constructor(e, t, r, s) {
    ((this.remoteDocumentCache = e),
      (this.mutationQueue = t),
      (this.documentOverlayCache = r),
      (this.indexManager = s));
  }
  getDocument(e, t) {
    let r = null;
    return this.documentOverlayCache
      .getOverlay(e, t)
      .next((s) => ((r = s), this.remoteDocumentCache.getEntry(e, t)))
      .next((s) => (r !== null && Yn(r.mutation, s, be.empty(), J.now()), s));
  }
  getDocuments(e, t) {
    return this.remoteDocumentCache
      .getEntries(e, t)
      .next((r) => this.getLocalViewOfDocuments(e, r, $()).next(() => r));
  }
  getLocalViewOfDocuments(e, t, r = $()) {
    const s = xt();
    return this.populateOverlays(e, s, t).next(() =>
      this.computeViews(e, t, s, r).next((o) => {
        let a = $n();
        return (
          o.forEach((u, h) => {
            a = a.insert(u, h.overlayedDocument);
          }),
          a
        );
      })
    );
  }
  getOverlayedDocuments(e, t) {
    const r = xt();
    return this.populateOverlays(e, r, t).next(() => this.computeViews(e, t, r, $()));
  }
  populateOverlays(e, t, r) {
    const s = [];
    return (
      r.forEach((o) => {
        t.has(o) || s.push(o);
      }),
      this.documentOverlayCache.getOverlays(e, s).next((o) => {
        o.forEach((a, u) => {
          t.set(a, u);
        });
      })
    );
  }
  computeViews(e, t, r, s) {
    let o = rt();
    const a = Qn(),
      u = (function () {
        return Qn();
      })();
    return (
      t.forEach((h, d) => {
        const p = r.get(d.key);
        s.has(d.key) && (p === void 0 || p.mutation instanceof kt)
          ? (o = o.insert(d.key, d))
          : p !== void 0
            ? (a.set(d.key, p.mutation.getFieldMask()),
              Yn(p.mutation, d, p.mutation.getFieldMask(), J.now()))
            : a.set(d.key, be.empty());
      }),
      this.recalculateAndSaveOverlays(e, o).next(
        (h) => (
          h.forEach((d, p) => a.set(d, p)),
          t.forEach((d, p) => u.set(d, new eg(p, a.get(d) ?? null))),
          u
        )
      )
    );
  }
  recalculateAndSaveOverlays(e, t) {
    const r = Qn();
    let s = new Z((a, u) => a - u),
      o = $();
    return this.mutationQueue
      .getAllMutationBatchesAffectingDocumentKeys(e, t)
      .next((a) => {
        for (const u of a)
          u.keys().forEach((h) => {
            const d = t.get(h);
            if (d === null) return;
            let p = r.get(h) || be.empty();
            ((p = u.applyToLocalView(d, p)), r.set(h, p));
            const E = (s.get(u.batchId) || $()).add(h);
            s = s.insert(u.batchId, E);
          });
      })
      .next(() => {
        const a = [],
          u = s.getReverseIterator();
        for (; u.hasNext(); ) {
          const h = u.getNext(),
            d = h.key,
            p = h.value,
            E = yl();
          (p.forEach((y) => {
            if (!o.has(y)) {
              const C = Al(t.get(y), r.get(y));
              (C !== null && E.set(y, C), (o = o.add(y)));
            }
          }),
            a.push(this.documentOverlayCache.saveOverlays(e, d, E)));
        }
        return P.waitFor(a);
      })
      .next(() => r);
  }
  recalculateAndSaveOverlaysForDocumentKeys(e, t) {
    return this.remoteDocumentCache
      .getEntries(e, t)
      .next((r) => this.recalculateAndSaveOverlays(e, r));
  }
  getDocumentsMatchingQuery(e, t, r, s) {
    return (function (a) {
      return M.isDocumentKey(a.path) && a.collectionGroup === null && a.filters.length === 0;
    })(t)
      ? this.getDocumentsMatchingDocumentQuery(e, t.path)
      : fl(t)
        ? this.getDocumentsMatchingCollectionGroupQuery(e, t, r, s)
        : this.getDocumentsMatchingCollectionQuery(e, t, r, s);
  }
  getNextDocuments(e, t, r, s) {
    return this.remoteDocumentCache.getAllFromCollectionGroup(e, t, r, s).next((o) => {
      const a =
        s - o.size > 0
          ? this.documentOverlayCache.getOverlaysForCollectionGroup(
              e,
              t,
              r.largestBatchId,
              s - o.size
            )
          : P.resolve(xt());
      let u = tr,
        h = o;
      return a.next((d) =>
        P.forEach(
          d,
          (p, E) => (
            u < E.largestBatchId && (u = E.largestBatchId),
            o.get(p)
              ? P.resolve()
              : this.remoteDocumentCache.getEntry(e, p).next((y) => {
                  h = h.insert(p, y);
                })
          )
        )
          .next(() => this.populateOverlays(e, d, o))
          .next(() => this.computeViews(e, h, d, $()))
          .next((p) => ({ batchId: u, changes: _l(p) }))
      );
    });
  }
  getDocumentsMatchingDocumentQuery(e, t) {
    return this.getDocument(e, new M(t)).next((r) => {
      let s = $n();
      return (r.isFoundDocument() && (s = s.insert(r.key, r)), s);
    });
  }
  getDocumentsMatchingCollectionGroupQuery(e, t, r, s) {
    const o = t.collectionGroup;
    let a = $n();
    return this.indexManager.getCollectionParents(e, o).next((u) =>
      P.forEach(u, (h) => {
        const d = (function (E, y) {
          return new Tn(
            y,
            null,
            E.explicitOrderBy.slice(),
            E.filters.slice(),
            E.limit,
            E.limitType,
            E.startAt,
            E.endAt
          );
        })(t, h.child(o));
        return this.getDocumentsMatchingCollectionQuery(e, d, r, s).next((p) => {
          p.forEach((E, y) => {
            a = a.insert(E, y);
          });
        });
      }).next(() => a)
    );
  }
  getDocumentsMatchingCollectionQuery(e, t, r, s) {
    let o;
    return this.documentOverlayCache
      .getOverlaysForCollection(e, t.path, r.largestBatchId)
      .next((a) => ((o = a), this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, r, o, s)))
      .next((a) => {
        o.forEach((h, d) => {
          const p = d.getKey();
          a.get(p) === null && (a = a.insert(p, Ie.newInvalidDocument(p)));
        });
        let u = $n();
        return (
          a.forEach((h, d) => {
            const p = o.get(h);
            (p !== void 0 && Yn(p.mutation, d, be.empty(), J.now()),
              Vs(t, d) && (u = u.insert(h, d)));
          }),
          u
        );
      });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ng {
  constructor(e) {
    ((this.serializer = e), (this.Lr = new Map()), (this.kr = new Map()));
  }
  getBundleMetadata(e, t) {
    return P.resolve(this.Lr.get(t));
  }
  saveBundleMetadata(e, t) {
    return (
      this.Lr.set(
        t.id,
        (function (s) {
          return { id: s.id, version: s.version, createTime: je(s.createTime) };
        })(t)
      ),
      P.resolve()
    );
  }
  getNamedQuery(e, t) {
    return P.resolve(this.kr.get(t));
  }
  saveNamedQuery(e, t) {
    return (
      this.kr.set(
        t.name,
        (function (s) {
          return { name: s.name, query: Wm(s.bundledQuery), readTime: je(s.readTime) };
        })(t)
      ),
      P.resolve()
    );
  }
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class rg {
  constructor() {
    ((this.overlays = new Z(M.comparator)), (this.qr = new Map()));
  }
  getOverlay(e, t) {
    return P.resolve(this.overlays.get(t));
  }
  getOverlays(e, t) {
    const r = xt();
    return P.forEach(t, (s) =>
      this.getOverlay(e, s).next((o) => {
        o !== null && r.set(s, o);
      })
    ).next(() => r);
  }
  saveOverlays(e, t, r) {
    return (
      r.forEach((s, o) => {
        this.St(e, t, o);
      }),
      P.resolve()
    );
  }
  removeOverlaysForBatchId(e, t, r) {
    const s = this.qr.get(r);
    return (
      s !== void 0 &&
        (s.forEach((o) => (this.overlays = this.overlays.remove(o))), this.qr.delete(r)),
      P.resolve()
    );
  }
  getOverlaysForCollection(e, t, r) {
    const s = xt(),
      o = t.length + 1,
      a = new M(t.child('')),
      u = this.overlays.getIteratorFrom(a);
    for (; u.hasNext(); ) {
      const h = u.getNext().value,
        d = h.getKey();
      if (!t.isPrefixOf(d.path)) break;
      d.path.length === o && h.largestBatchId > r && s.set(h.getKey(), h);
    }
    return P.resolve(s);
  }
  getOverlaysForCollectionGroup(e, t, r, s) {
    let o = new Z((d, p) => d - p);
    const a = this.overlays.getIterator();
    for (; a.hasNext(); ) {
      const d = a.getNext().value;
      if (d.getKey().getCollectionGroup() === t && d.largestBatchId > r) {
        let p = o.get(d.largestBatchId);
        (p === null && ((p = xt()), (o = o.insert(d.largestBatchId, p))), p.set(d.getKey(), d));
      }
    }
    const u = xt(),
      h = o.getIterator();
    for (; h.hasNext() && (h.getNext().value.forEach((d, p) => u.set(d, p)), !(u.size() >= s)); );
    return P.resolve(u);
  }
  St(e, t, r) {
    const s = this.overlays.get(r.key);
    if (s !== null) {
      const a = this.qr.get(s.largestBatchId).delete(r.key);
      this.qr.set(s.largestBatchId, a);
    }
    this.overlays = this.overlays.insert(r.key, new vm(t, r));
    let o = this.qr.get(t);
    (o === void 0 && ((o = $()), this.qr.set(t, o)), this.qr.set(t, o.add(r.key)));
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class sg {
  constructor() {
    this.sessionToken = fe.EMPTY_BYTE_STRING;
  }
  getSessionToken(e) {
    return P.resolve(this.sessionToken);
  }
  setSessionToken(e, t) {
    return ((this.sessionToken = t), P.resolve());
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class yo {
  constructor() {
    ((this.Qr = new ae(ce.$r)), (this.Ur = new ae(ce.Kr)));
  }
  isEmpty() {
    return this.Qr.isEmpty();
  }
  addReference(e, t) {
    const r = new ce(e, t);
    ((this.Qr = this.Qr.add(r)), (this.Ur = this.Ur.add(r)));
  }
  Wr(e, t) {
    e.forEach((r) => this.addReference(r, t));
  }
  removeReference(e, t) {
    this.Gr(new ce(e, t));
  }
  zr(e, t) {
    e.forEach((r) => this.removeReference(r, t));
  }
  jr(e) {
    const t = new M(new Y([])),
      r = new ce(t, e),
      s = new ce(t, e + 1),
      o = [];
    return (
      this.Ur.forEachInRange([r, s], (a) => {
        (this.Gr(a), o.push(a.key));
      }),
      o
    );
  }
  Jr() {
    this.Qr.forEach((e) => this.Gr(e));
  }
  Gr(e) {
    ((this.Qr = this.Qr.delete(e)), (this.Ur = this.Ur.delete(e)));
  }
  Hr(e) {
    const t = new M(new Y([])),
      r = new ce(t, e),
      s = new ce(t, e + 1);
    let o = $();
    return (
      this.Ur.forEachInRange([r, s], (a) => {
        o = o.add(a.key);
      }),
      o
    );
  }
  containsKey(e) {
    const t = new ce(e, 0),
      r = this.Qr.firstAfterOrEqual(t);
    return r !== null && e.isEqual(r.key);
  }
}
class ce {
  constructor(e, t) {
    ((this.key = e), (this.Yr = t));
  }
  static $r(e, t) {
    return M.comparator(e.key, t.key) || j(e.Yr, t.Yr);
  }
  static Kr(e, t) {
    return j(e.Yr, t.Yr) || M.comparator(e.key, t.key);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ig {
  constructor(e, t) {
    ((this.indexManager = e),
      (this.referenceDelegate = t),
      (this.mutationQueue = []),
      (this.tr = 1),
      (this.Zr = new ae(ce.$r)));
  }
  checkEmpty(e) {
    return P.resolve(this.mutationQueue.length === 0);
  }
  addMutationBatch(e, t, r, s) {
    const o = this.tr;
    (this.tr++, this.mutationQueue.length > 0 && this.mutationQueue[this.mutationQueue.length - 1]);
    const a = new Tm(o, t, r, s);
    this.mutationQueue.push(a);
    for (const u of s)
      ((this.Zr = this.Zr.add(new ce(u.key, o))),
        this.indexManager.addToCollectionParentIndex(e, u.key.path.popLast()));
    return P.resolve(a);
  }
  lookupMutationBatch(e, t) {
    return P.resolve(this.Xr(t));
  }
  getNextMutationBatchAfterBatchId(e, t) {
    const r = t + 1,
      s = this.ei(r),
      o = s < 0 ? 0 : s;
    return P.resolve(this.mutationQueue.length > o ? this.mutationQueue[o] : null);
  }
  getHighestUnacknowledgedBatchId() {
    return P.resolve(this.mutationQueue.length === 0 ? ao : this.tr - 1);
  }
  getAllMutationBatches(e) {
    return P.resolve(this.mutationQueue.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(e, t) {
    const r = new ce(t, 0),
      s = new ce(t, Number.POSITIVE_INFINITY),
      o = [];
    return (
      this.Zr.forEachInRange([r, s], (a) => {
        const u = this.Xr(a.Yr);
        o.push(u);
      }),
      P.resolve(o)
    );
  }
  getAllMutationBatchesAffectingDocumentKeys(e, t) {
    let r = new ae(j);
    return (
      t.forEach((s) => {
        const o = new ce(s, 0),
          a = new ce(s, Number.POSITIVE_INFINITY);
        this.Zr.forEachInRange([o, a], (u) => {
          r = r.add(u.Yr);
        });
      }),
      P.resolve(this.ti(r))
    );
  }
  getAllMutationBatchesAffectingQuery(e, t) {
    const r = t.path,
      s = r.length + 1;
    let o = r;
    M.isDocumentKey(o) || (o = o.child(''));
    const a = new ce(new M(o), 0);
    let u = new ae(j);
    return (
      this.Zr.forEachWhile((h) => {
        const d = h.key.path;
        return !!r.isPrefixOf(d) && (d.length === s && (u = u.add(h.Yr)), !0);
      }, a),
      P.resolve(this.ti(u))
    );
  }
  ti(e) {
    const t = [];
    return (
      e.forEach((r) => {
        const s = this.Xr(r);
        s !== null && t.push(s);
      }),
      t
    );
  }
  removeMutationBatch(e, t) {
    (K(this.ni(t.batchId, 'removed') === 0, 55003), this.mutationQueue.shift());
    let r = this.Zr;
    return P.forEach(t.mutations, (s) => {
      const o = new ce(s.key, t.batchId);
      return ((r = r.delete(o)), this.referenceDelegate.markPotentiallyOrphaned(e, s.key));
    }).next(() => {
      this.Zr = r;
    });
  }
  ir(e) {}
  containsKey(e, t) {
    const r = new ce(t, 0),
      s = this.Zr.firstAfterOrEqual(r);
    return P.resolve(t.isEqual(s && s.key));
  }
  performConsistencyCheck(e) {
    return (this.mutationQueue.length, P.resolve());
  }
  ni(e, t) {
    return this.ei(e);
  }
  ei(e) {
    return this.mutationQueue.length === 0 ? 0 : e - this.mutationQueue[0].batchId;
  }
  Xr(e) {
    const t = this.ei(e);
    return t < 0 || t >= this.mutationQueue.length ? null : this.mutationQueue[t];
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class og {
  constructor(e) {
    ((this.ri = e),
      (this.docs = (function () {
        return new Z(M.comparator);
      })()),
      (this.size = 0));
  }
  setIndexManager(e) {
    this.indexManager = e;
  }
  addEntry(e, t) {
    const r = t.key,
      s = this.docs.get(r),
      o = s ? s.size : 0,
      a = this.ri(t);
    return (
      (this.docs = this.docs.insert(r, { document: t.mutableCopy(), size: a })),
      (this.size += a - o),
      this.indexManager.addToCollectionParentIndex(e, r.path.popLast())
    );
  }
  removeEntry(e) {
    const t = this.docs.get(e);
    t && ((this.docs = this.docs.remove(e)), (this.size -= t.size));
  }
  getEntry(e, t) {
    const r = this.docs.get(t);
    return P.resolve(r ? r.document.mutableCopy() : Ie.newInvalidDocument(t));
  }
  getEntries(e, t) {
    let r = rt();
    return (
      t.forEach((s) => {
        const o = this.docs.get(s);
        r = r.insert(s, o ? o.document.mutableCopy() : Ie.newInvalidDocument(s));
      }),
      P.resolve(r)
    );
  }
  getDocumentsMatchingQuery(e, t, r, s) {
    let o = rt();
    const a = t.path,
      u = new M(a.child('__id-9223372036854775808__')),
      h = this.docs.getIteratorFrom(u);
    for (; h.hasNext(); ) {
      const {
        key: d,
        value: { document: p },
      } = h.getNext();
      if (!a.isPrefixOf(d.path)) break;
      d.path.length > a.length + 1 ||
        Mp(Op(p), r) <= 0 ||
        ((s.has(p.key) || Vs(t, p)) && (o = o.insert(p.key, p.mutableCopy())));
    }
    return P.resolve(o);
  }
  getAllFromCollectionGroup(e, t, r, s) {
    x(9500);
  }
  ii(e, t) {
    return P.forEach(this.docs, (r) => t(r));
  }
  newChangeBuffer(e) {
    return new ag(this);
  }
  getSize(e) {
    return P.resolve(this.size);
  }
}
class ag extends Zm {
  constructor(e) {
    (super(), (this.Nr = e));
  }
  applyChanges(e) {
    const t = [];
    return (
      this.changes.forEach((r, s) => {
        s.isValidDocument() ? t.push(this.Nr.addEntry(e, s)) : this.Nr.removeEntry(r);
      }),
      P.waitFor(t)
    );
  }
  getFromCache(e, t) {
    return this.Nr.getEntry(e, t);
  }
  getAllFromCache(e, t) {
    return this.Nr.getEntries(e, t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class cg {
  constructor(e) {
    ((this.persistence = e),
      (this.si = new Gt((t) => lo(t), ho)),
      (this.lastRemoteSnapshotVersion = F.min()),
      (this.highestTargetId = 0),
      (this.oi = 0),
      (this._i = new yo()),
      (this.targetCount = 0),
      (this.ai = fn.ur()));
  }
  forEachTarget(e, t) {
    return (this.si.forEach((r, s) => t(s)), P.resolve());
  }
  getLastRemoteSnapshotVersion(e) {
    return P.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(e) {
    return P.resolve(this.oi);
  }
  allocateTargetId(e) {
    return ((this.highestTargetId = this.ai.next()), P.resolve(this.highestTargetId));
  }
  setTargetsMetadata(e, t, r) {
    return (r && (this.lastRemoteSnapshotVersion = r), t > this.oi && (this.oi = t), P.resolve());
  }
  Pr(e) {
    this.si.set(e.target, e);
    const t = e.targetId;
    (t > this.highestTargetId && ((this.ai = new fn(t)), (this.highestTargetId = t)),
      e.sequenceNumber > this.oi && (this.oi = e.sequenceNumber));
  }
  addTargetData(e, t) {
    return (this.Pr(t), (this.targetCount += 1), P.resolve());
  }
  updateTargetData(e, t) {
    return (this.Pr(t), P.resolve());
  }
  removeTargetData(e, t) {
    return (this.si.delete(t.target), this._i.jr(t.targetId), (this.targetCount -= 1), P.resolve());
  }
  removeTargets(e, t, r) {
    let s = 0;
    const o = [];
    return (
      this.si.forEach((a, u) => {
        u.sequenceNumber <= t &&
          r.get(u.targetId) === null &&
          (this.si.delete(a), o.push(this.removeMatchingKeysForTargetId(e, u.targetId)), s++);
      }),
      P.waitFor(o).next(() => s)
    );
  }
  getTargetCount(e) {
    return P.resolve(this.targetCount);
  }
  getTargetData(e, t) {
    const r = this.si.get(t) || null;
    return P.resolve(r);
  }
  addMatchingKeys(e, t, r) {
    return (this._i.Wr(t, r), P.resolve());
  }
  removeMatchingKeys(e, t, r) {
    this._i.zr(t, r);
    const s = this.persistence.referenceDelegate,
      o = [];
    return (
      s &&
        t.forEach((a) => {
          o.push(s.markPotentiallyOrphaned(e, a));
        }),
      P.waitFor(o)
    );
  }
  removeMatchingKeysForTargetId(e, t) {
    return (this._i.jr(t), P.resolve());
  }
  getMatchingKeysForTargetId(e, t) {
    const r = this._i.Hr(t);
    return P.resolve(r);
  }
  containsKey(e, t) {
    return P.resolve(this._i.containsKey(t));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Fl {
  constructor(e, t) {
    ((this.ui = {}),
      (this.overlays = {}),
      (this.ci = new Rs(0)),
      (this.li = !1),
      (this.li = !0),
      (this.hi = new sg()),
      (this.referenceDelegate = e(this)),
      (this.Pi = new cg(this)),
      (this.indexManager = new Gm()),
      (this.remoteDocumentCache = (function (s) {
        return new og(s);
      })((r) => this.referenceDelegate.Ti(r))),
      (this.serializer = new Hm(t)),
      (this.Ii = new ng(this.serializer)));
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return ((this.li = !1), Promise.resolve());
  }
  get started() {
    return this.li;
  }
  setDatabaseDeletedListener() {}
  setNetworkEnabled() {}
  getIndexManager(e) {
    return this.indexManager;
  }
  getDocumentOverlayCache(e) {
    let t = this.overlays[e.toKey()];
    return (t || ((t = new rg()), (this.overlays[e.toKey()] = t)), t);
  }
  getMutationQueue(e, t) {
    let r = this.ui[e.toKey()];
    return (r || ((r = new ig(t, this.referenceDelegate)), (this.ui[e.toKey()] = r)), r);
  }
  getGlobalsCache() {
    return this.hi;
  }
  getTargetCache() {
    return this.Pi;
  }
  getRemoteDocumentCache() {
    return this.remoteDocumentCache;
  }
  getBundleCache() {
    return this.Ii;
  }
  runTransaction(e, t, r) {
    D('MemoryPersistence', 'Starting transaction:', e);
    const s = new ug(this.ci.next());
    return (
      this.referenceDelegate.Ei(),
      r(s)
        .next((o) => this.referenceDelegate.di(s).next(() => o))
        .toPromise()
        .then((o) => (s.raiseOnCommittedEvent(), o))
    );
  }
  Ai(e, t) {
    return P.or(Object.values(this.ui).map((r) => () => r.containsKey(e, t)));
  }
}
class ug extends xp {
  constructor(e) {
    (super(), (this.currentSequenceNumber = e));
  }
}
class Eo {
  constructor(e) {
    ((this.persistence = e), (this.Ri = new yo()), (this.Vi = null));
  }
  static mi(e) {
    return new Eo(e);
  }
  get fi() {
    if (this.Vi) return this.Vi;
    throw x(60996);
  }
  addReference(e, t, r) {
    return (this.Ri.addReference(r, t), this.fi.delete(r.toString()), P.resolve());
  }
  removeReference(e, t, r) {
    return (this.Ri.removeReference(r, t), this.fi.add(r.toString()), P.resolve());
  }
  markPotentiallyOrphaned(e, t) {
    return (this.fi.add(t.toString()), P.resolve());
  }
  removeTarget(e, t) {
    this.Ri.jr(t.targetId).forEach((s) => this.fi.add(s.toString()));
    const r = this.persistence.getTargetCache();
    return r
      .getMatchingKeysForTargetId(e, t.targetId)
      .next((s) => {
        s.forEach((o) => this.fi.add(o.toString()));
      })
      .next(() => r.removeTargetData(e, t));
  }
  Ei() {
    this.Vi = new Set();
  }
  di(e) {
    const t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return P.forEach(this.fi, (r) => {
      const s = M.fromPath(r);
      return this.gi(e, s).next((o) => {
        o || t.removeEntry(s, F.min());
      });
    }).next(() => ((this.Vi = null), t.apply(e)));
  }
  updateLimboDocument(e, t) {
    return this.gi(e, t).next((r) => {
      r ? this.fi.delete(t.toString()) : this.fi.add(t.toString());
    });
  }
  Ti(e) {
    return 0;
  }
  gi(e, t) {
    return P.or([
      () => P.resolve(this.Ri.containsKey(t)),
      () => this.persistence.getTargetCache().containsKey(e, t),
      () => this.persistence.Ai(e, t),
    ]);
  }
}
class ls {
  constructor(e, t) {
    ((this.persistence = e),
      (this.pi = new Gt(
        (r) => Bp(r.path),
        (r, s) => r.isEqual(s)
      )),
      (this.garbageCollector = Jm(this, t)));
  }
  static mi(e, t) {
    return new ls(e, t);
  }
  Ei() {}
  di(e) {
    return P.resolve();
  }
  forEachTarget(e, t) {
    return this.persistence.getTargetCache().forEachTarget(e, t);
  }
  gr(e) {
    const t = this.wr(e);
    return this.persistence
      .getTargetCache()
      .getTargetCount(e)
      .next((r) => t.next((s) => r + s));
  }
  wr(e) {
    let t = 0;
    return this.pr(e, (r) => {
      t++;
    }).next(() => t);
  }
  pr(e, t) {
    return P.forEach(this.pi, (r, s) => this.br(e, r, s).next((o) => (o ? P.resolve() : t(s))));
  }
  removeTargets(e, t, r) {
    return this.persistence.getTargetCache().removeTargets(e, t, r);
  }
  removeOrphanedDocuments(e, t) {
    let r = 0;
    const s = this.persistence.getRemoteDocumentCache(),
      o = s.newChangeBuffer();
    return s
      .ii(e, (a) =>
        this.br(e, a, t).next((u) => {
          u || (r++, o.removeEntry(a, F.min()));
        })
      )
      .next(() => o.apply(e))
      .next(() => r);
  }
  markPotentiallyOrphaned(e, t) {
    return (this.pi.set(t, e.currentSequenceNumber), P.resolve());
  }
  removeTarget(e, t) {
    const r = t.withSequenceNumber(e.currentSequenceNumber);
    return this.persistence.getTargetCache().updateTargetData(e, r);
  }
  addReference(e, t, r) {
    return (this.pi.set(r, e.currentSequenceNumber), P.resolve());
  }
  removeReference(e, t, r) {
    return (this.pi.set(r, e.currentSequenceNumber), P.resolve());
  }
  updateLimboDocument(e, t) {
    return (this.pi.set(t, e.currentSequenceNumber), P.resolve());
  }
  Ti(e) {
    let t = e.key.toString().length;
    return (e.isFoundDocument() && (t += Kr(e.data.value)), t);
  }
  br(e, t, r) {
    return P.or([
      () => this.persistence.Ai(e, t),
      () => this.persistence.getTargetCache().containsKey(e, t),
      () => {
        const s = this.pi.get(t);
        return P.resolve(s !== void 0 && s > r);
      },
    ]);
  }
  getCacheSize(e) {
    return this.persistence.getRemoteDocumentCache().getSize(e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Io {
  constructor(e, t, r, s) {
    ((this.targetId = e), (this.fromCache = t), (this.Es = r), (this.ds = s));
  }
  static As(e, t) {
    let r = $(),
      s = $();
    for (const o of t.docChanges)
      switch (o.type) {
        case 0:
          r = r.add(o.doc.key);
          break;
        case 1:
          s = s.add(o.doc.key);
      }
    return new Io(e, t.fromCache, r, s);
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class lg {
  constructor() {
    this._documentReadCount = 0;
  }
  get documentReadCount() {
    return this._documentReadCount;
  }
  incrementDocumentReadCount(e) {
    this._documentReadCount += e;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class hg {
  constructor() {
    ((this.Rs = !1),
      (this.Vs = !1),
      (this.fs = 100),
      (this.gs = (function () {
        return Jd() ? 8 : Fp(Te()) > 0 ? 6 : 4;
      })()));
  }
  initialize(e, t) {
    ((this.ps = e), (this.indexManager = t), (this.Rs = !0));
  }
  getDocumentsMatchingQuery(e, t, r, s) {
    const o = { result: null };
    return this.ys(e, t)
      .next((a) => {
        o.result = a;
      })
      .next(() => {
        if (!o.result)
          return this.ws(e, t, s, r).next((a) => {
            o.result = a;
          });
      })
      .next(() => {
        if (o.result) return;
        const a = new lg();
        return this.Ss(e, t, a).next((u) => {
          if (((o.result = u), this.Vs)) return this.bs(e, t, a, u.size);
        });
      })
      .next(() => o.result);
  }
  bs(e, t, r, s) {
    return r.documentReadCount < this.fs
      ? (en() <= q.DEBUG &&
          D(
            'QueryEngine',
            'SDK will not create cache indexes for query:',
            tn(t),
            'since it only creates cache indexes for collection contains',
            'more than or equal to',
            this.fs,
            'documents'
          ),
        P.resolve())
      : (en() <= q.DEBUG &&
          D(
            'QueryEngine',
            'Query:',
            tn(t),
            'scans',
            r.documentReadCount,
            'local documents and returns',
            s,
            'documents as results.'
          ),
        r.documentReadCount > this.gs * s
          ? (en() <= q.DEBUG &&
              D(
                'QueryEngine',
                'The SDK decides to create cache indexes for query:',
                tn(t),
                'as using cache indexes may help improve performance.'
              ),
            this.indexManager.createTargetIndexes(e, qe(t)))
          : P.resolve());
  }
  ys(e, t) {
    if (Nc(t)) return P.resolve(null);
    let r = qe(t);
    return this.indexManager.getIndexType(e, r).next((s) =>
      s === 0
        ? null
        : (t.limit !== null && s === 1 && ((t = as(t, null, 'F')), (r = qe(t))),
          this.indexManager.getDocumentsMatchingTarget(e, r).next((o) => {
            const a = $(...o);
            return this.ps.getDocuments(e, a).next((u) =>
              this.indexManager.getMinOffset(e, r).next((h) => {
                const d = this.Ds(t, u);
                return this.Cs(t, d, a, h.readTime)
                  ? this.ys(e, as(t, null, 'F'))
                  : this.vs(e, d, t, h);
              })
            );
          }))
    );
  }
  ws(e, t, r, s) {
    return Nc(t) || s.isEqual(F.min())
      ? P.resolve(null)
      : this.ps.getDocuments(e, r).next((o) => {
          const a = this.Ds(t, o);
          return this.Cs(t, a, r, s)
            ? P.resolve(null)
            : (en() <= q.DEBUG &&
                D(
                  'QueryEngine',
                  'Re-using previous result from %s to execute query: %s',
                  s.toString(),
                  tn(t)
                ),
              this.vs(e, a, t, Dp(s, tr)).next((u) => u));
        });
  }
  Ds(e, t) {
    let r = new ae(ml(e));
    return (
      t.forEach((s, o) => {
        Vs(e, o) && (r = r.add(o));
      }),
      r
    );
  }
  Cs(e, t, r, s) {
    if (e.limit === null) return !1;
    if (r.size !== t.size) return !0;
    const o = e.limitType === 'F' ? t.last() : t.first();
    return !!o && (o.hasPendingWrites || o.version.compareTo(s) > 0);
  }
  Ss(e, t, r) {
    return (
      en() <= q.DEBUG && D('QueryEngine', 'Using full collection scan to execute query:', tn(t)),
      this.ps.getDocumentsMatchingQuery(e, t, At.min(), r)
    );
  }
  vs(e, t, r, s) {
    return this.ps.getDocumentsMatchingQuery(e, r, s).next(
      (o) => (
        t.forEach((a) => {
          o = o.insert(a.key, a);
        }),
        o
      )
    );
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const To = 'LocalStore',
  dg = 3e8;
class fg {
  constructor(e, t, r, s) {
    ((this.persistence = e),
      (this.Fs = t),
      (this.serializer = s),
      (this.Ms = new Z(j)),
      (this.xs = new Gt((o) => lo(o), ho)),
      (this.Os = new Map()),
      (this.Ns = e.getRemoteDocumentCache()),
      (this.Pi = e.getTargetCache()),
      (this.Ii = e.getBundleCache()),
      this.Bs(r));
  }
  Bs(e) {
    ((this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e)),
      (this.indexManager = this.persistence.getIndexManager(e)),
      (this.mutationQueue = this.persistence.getMutationQueue(e, this.indexManager)),
      (this.localDocuments = new tg(
        this.Ns,
        this.mutationQueue,
        this.documentOverlayCache,
        this.indexManager
      )),
      this.Ns.setIndexManager(this.indexManager),
      this.Fs.initialize(this.localDocuments, this.indexManager));
  }
  collectGarbage(e) {
    return this.persistence.runTransaction('Collect garbage', 'readwrite-primary', (t) =>
      e.collect(t, this.Ms)
    );
  }
}
function pg(n, e, t, r) {
  return new fg(n, e, t, r);
}
async function Ul(n, e) {
  const t = U(n);
  return await t.persistence.runTransaction('Handle user change', 'readonly', (r) => {
    let s;
    return t.mutationQueue
      .getAllMutationBatches(r)
      .next((o) => ((s = o), t.Bs(e), t.mutationQueue.getAllMutationBatches(r)))
      .next((o) => {
        const a = [],
          u = [];
        let h = $();
        for (const d of s) {
          a.push(d.batchId);
          for (const p of d.mutations) h = h.add(p.key);
        }
        for (const d of o) {
          u.push(d.batchId);
          for (const p of d.mutations) h = h.add(p.key);
        }
        return t.localDocuments
          .getDocuments(r, h)
          .next((d) => ({ Ls: d, removedBatchIds: a, addedBatchIds: u }));
      });
  });
}
function mg(n, e) {
  const t = U(n);
  return t.persistence.runTransaction('Acknowledge batch', 'readwrite-primary', (r) => {
    const s = e.batch.keys(),
      o = t.Ns.newChangeBuffer({ trackRemovals: !0 });
    return (function (u, h, d, p) {
      const E = d.batch,
        y = E.keys();
      let C = P.resolve();
      return (
        y.forEach((b) => {
          C = C.next(() => p.getEntry(h, b)).next((O) => {
            const N = d.docVersions.get(b);
            (K(N !== null, 48541),
              O.version.compareTo(N) < 0 &&
                (E.applyToRemoteDocument(O, d),
                O.isValidDocument() && (O.setReadTime(d.commitVersion), p.addEntry(O))));
          });
        }),
        C.next(() => u.mutationQueue.removeMutationBatch(h, E))
      );
    })(t, r, e, o)
      .next(() => o.apply(r))
      .next(() => t.mutationQueue.performConsistencyCheck(r))
      .next(() => t.documentOverlayCache.removeOverlaysForBatchId(r, s, e.batch.batchId))
      .next(() =>
        t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(
          r,
          (function (u) {
            let h = $();
            for (let d = 0; d < u.mutationResults.length; ++d)
              u.mutationResults[d].transformResults.length > 0 &&
                (h = h.add(u.batch.mutations[d].key));
            return h;
          })(e)
        )
      )
      .next(() => t.localDocuments.getDocuments(r, s));
  });
}
function Bl(n) {
  const e = U(n);
  return e.persistence.runTransaction('Get last remote snapshot version', 'readonly', (t) =>
    e.Pi.getLastRemoteSnapshotVersion(t)
  );
}
function gg(n, e) {
  const t = U(n),
    r = e.snapshotVersion;
  let s = t.Ms;
  return t.persistence
    .runTransaction('Apply remote event', 'readwrite-primary', (o) => {
      const a = t.Ns.newChangeBuffer({ trackRemovals: !0 });
      s = t.Ms;
      const u = [];
      e.targetChanges.forEach((p, E) => {
        const y = s.get(E);
        if (!y) return;
        u.push(
          t.Pi.removeMatchingKeys(o, p.removedDocuments, E).next(() =>
            t.Pi.addMatchingKeys(o, p.addedDocuments, E)
          )
        );
        let C = y.withSequenceNumber(o.currentSequenceNumber);
        (e.targetMismatches.get(E) !== null
          ? (C = C.withResumeToken(fe.EMPTY_BYTE_STRING, F.min()).withLastLimboFreeSnapshotVersion(
              F.min()
            ))
          : p.resumeToken.approximateByteSize() > 0 && (C = C.withResumeToken(p.resumeToken, r)),
          (s = s.insert(E, C)),
          (function (O, N, z) {
            return O.resumeToken.approximateByteSize() === 0 ||
              N.snapshotVersion.toMicroseconds() - O.snapshotVersion.toMicroseconds() >= dg
              ? !0
              : z.addedDocuments.size + z.modifiedDocuments.size + z.removedDocuments.size > 0;
          })(y, C, p) && u.push(t.Pi.updateTargetData(o, C)));
      });
      let h = rt(),
        d = $();
      if (
        (e.documentUpdates.forEach((p) => {
          e.resolvedLimboDocuments.has(p) &&
            u.push(t.persistence.referenceDelegate.updateLimboDocument(o, p));
        }),
        u.push(
          _g(o, a, e.documentUpdates).next((p) => {
            ((h = p.ks), (d = p.qs));
          })
        ),
        !r.isEqual(F.min()))
      ) {
        const p = t.Pi.getLastRemoteSnapshotVersion(o).next((E) =>
          t.Pi.setTargetsMetadata(o, o.currentSequenceNumber, r)
        );
        u.push(p);
      }
      return P.waitFor(u)
        .next(() => a.apply(o))
        .next(() => t.localDocuments.getLocalViewOfDocuments(o, h, d))
        .next(() => h);
    })
    .then((o) => ((t.Ms = s), o));
}
function _g(n, e, t) {
  let r = $(),
    s = $();
  return (
    t.forEach((o) => (r = r.add(o))),
    e.getEntries(n, r).next((o) => {
      let a = rt();
      return (
        t.forEach((u, h) => {
          const d = o.get(u);
          (h.isFoundDocument() !== d.isFoundDocument() && (s = s.add(u)),
            h.isNoDocument() && h.version.isEqual(F.min())
              ? (e.removeEntry(u, h.readTime), (a = a.insert(u, h)))
              : !d.isValidDocument() ||
                  h.version.compareTo(d.version) > 0 ||
                  (h.version.compareTo(d.version) === 0 && d.hasPendingWrites)
                ? (e.addEntry(h), (a = a.insert(u, h)))
                : D(
                    To,
                    'Ignoring outdated watch update for ',
                    u,
                    '. Current version:',
                    d.version,
                    ' Watch version:',
                    h.version
                  ));
        }),
        { ks: a, qs: s }
      );
    })
  );
}
function yg(n, e) {
  const t = U(n);
  return t.persistence.runTransaction(
    'Get next mutation batch',
    'readonly',
    (r) => (e === void 0 && (e = ao), t.mutationQueue.getNextMutationBatchAfterBatchId(r, e))
  );
}
function Eg(n, e) {
  const t = U(n);
  return t.persistence
    .runTransaction('Allocate target', 'readwrite', (r) => {
      let s;
      return t.Pi.getTargetData(r, e).next((o) =>
        o
          ? ((s = o), P.resolve(s))
          : t.Pi.allocateTargetId(r).next(
              (a) => (
                (s = new yt(e, a, 'TargetPurposeListen', r.currentSequenceNumber)),
                t.Pi.addTargetData(r, s).next(() => s)
              )
            )
      );
    })
    .then((r) => {
      const s = t.Ms.get(r.targetId);
      return (
        (s === null || r.snapshotVersion.compareTo(s.snapshotVersion) > 0) &&
          ((t.Ms = t.Ms.insert(r.targetId, r)), t.xs.set(e, r.targetId)),
        r
      );
    });
}
async function Ki(n, e, t) {
  const r = U(n),
    s = r.Ms.get(e),
    o = t ? 'readwrite' : 'readwrite-primary';
  try {
    t ||
      (await r.persistence.runTransaction('Release target', o, (a) =>
        r.persistence.referenceDelegate.removeTarget(a, s)
      ));
  } catch (a) {
    if (!In(a)) throw a;
    D(To, `Failed to update sequence numbers for target ${e}: ${a}`);
  }
  ((r.Ms = r.Ms.remove(e)), r.xs.delete(s.target));
}
function Hc(n, e, t) {
  const r = U(n);
  let s = F.min(),
    o = $();
  return r.persistence.runTransaction('Execute query', 'readwrite', (a) =>
    (function (h, d, p) {
      const E = U(h),
        y = E.xs.get(p);
      return y !== void 0 ? P.resolve(E.Ms.get(y)) : E.Pi.getTargetData(d, p);
    })(r, a, qe(e))
      .next((u) => {
        if (u)
          return (
            (s = u.lastLimboFreeSnapshotVersion),
            r.Pi.getMatchingKeysForTargetId(a, u.targetId).next((h) => {
              o = h;
            })
          );
      })
      .next(() => r.Fs.getDocumentsMatchingQuery(a, e, t ? s : F.min(), t ? o : $()))
      .next((u) => (Ig(r, im(e), u), { documents: u, Qs: o }))
  );
}
function Ig(n, e, t) {
  let r = n.Os.get(e) || F.min();
  (t.forEach((s, o) => {
    o.readTime.compareTo(r) > 0 && (r = o.readTime);
  }),
    n.Os.set(e, r));
}
class Wc {
  constructor() {
    this.activeTargetIds = hm();
  }
  zs(e) {
    this.activeTargetIds = this.activeTargetIds.add(e);
  }
  js(e) {
    this.activeTargetIds = this.activeTargetIds.delete(e);
  }
  Gs() {
    const e = { activeTargetIds: this.activeTargetIds.toArray(), updateTimeMs: Date.now() };
    return JSON.stringify(e);
  }
}
class Tg {
  constructor() {
    ((this.Mo = new Wc()),
      (this.xo = {}),
      (this.onlineStateHandler = null),
      (this.sequenceNumberHandler = null));
  }
  addPendingMutation(e) {}
  updateMutationState(e, t, r) {}
  addLocalQueryTarget(e, t = !0) {
    return (t && this.Mo.zs(e), this.xo[e] || 'not-current');
  }
  updateQueryState(e, t, r) {
    this.xo[e] = t;
  }
  removeLocalQueryTarget(e) {
    this.Mo.js(e);
  }
  isLocalQueryTarget(e) {
    return this.Mo.activeTargetIds.has(e);
  }
  clearQueryState(e) {
    delete this.xo[e];
  }
  getAllActiveQueryTargets() {
    return this.Mo.activeTargetIds;
  }
  isActiveQueryTarget(e) {
    return this.Mo.activeTargetIds.has(e);
  }
  start() {
    return ((this.Mo = new Wc()), Promise.resolve());
  }
  handleUserChange(e, t, r) {}
  setOnlineState(e) {}
  shutdown() {}
  writeSequenceNumber(e) {}
  notifyBundleLoaded(e) {}
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class vg {
  Oo(e) {}
  shutdown() {}
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Gc = 'ConnectivityMonitor';
class Kc {
  constructor() {
    ((this.No = () => this.Bo()), (this.Lo = () => this.ko()), (this.qo = []), this.Qo());
  }
  Oo(e) {
    this.qo.push(e);
  }
  shutdown() {
    (window.removeEventListener('online', this.No), window.removeEventListener('offline', this.Lo));
  }
  Qo() {
    (window.addEventListener('online', this.No), window.addEventListener('offline', this.Lo));
  }
  Bo() {
    D(Gc, 'Network connectivity changed: AVAILABLE');
    for (const e of this.qo) e(0);
  }
  ko() {
    D(Gc, 'Network connectivity changed: UNAVAILABLE');
    for (const e of this.qo) e(1);
  }
  static v() {
    return (
      typeof window < 'u' &&
      window.addEventListener !== void 0 &&
      window.removeEventListener !== void 0
    );
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ let Hr = null;
function Qi() {
  return (
    Hr === null
      ? (Hr = (function () {
          return 268435456 + Math.round(2147483648 * Math.random());
        })())
      : Hr++,
    '0x' + Hr.toString(16)
  );
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Pi = 'RestConnection',
  wg = {
    BatchGetDocuments: 'batchGet',
    Commit: 'commit',
    RunQuery: 'runQuery',
    RunAggregationQuery: 'runAggregationQuery',
  };
class Ag {
  get $o() {
    return !1;
  }
  constructor(e) {
    ((this.databaseInfo = e), (this.databaseId = e.databaseId));
    const t = e.ssl ? 'https' : 'http',
      r = encodeURIComponent(this.databaseId.projectId),
      s = encodeURIComponent(this.databaseId.database);
    ((this.Uo = t + '://' + e.host),
      (this.Ko = `projects/${r}/databases/${s}`),
      (this.Wo =
        this.databaseId.database === ss ? `project_id=${r}` : `project_id=${r}&database_id=${s}`));
  }
  Go(e, t, r, s, o) {
    const a = Qi(),
      u = this.zo(e, t.toUriEncodedString());
    D(Pi, `Sending RPC '${e}' ${a}:`, u, r);
    const h = { 'google-cloud-resource-prefix': this.Ko, 'x-goog-request-params': this.Wo };
    this.jo(h, s, o);
    const { host: d } = new URL(u),
      p = gn(d);
    return this.Jo(e, u, h, r, p).then(
      (E) => (D(Pi, `Received RPC '${e}' ${a}: `, E), E),
      (E) => {
        throw (er(Pi, `RPC '${e}' ${a} failed with error: `, E, 'url: ', u, 'request:', r), E);
      }
    );
  }
  Ho(e, t, r, s, o, a) {
    return this.Go(e, t, r, s, o);
  }
  jo(e, t, r) {
    ((e['X-Goog-Api-Client'] = (function () {
      return 'gl-js/ fire/' + yn;
    })()),
      (e['Content-Type'] = 'text/plain'),
      this.databaseInfo.appId && (e['X-Firebase-GMPID'] = this.databaseInfo.appId),
      t && t.headers.forEach((s, o) => (e[o] = s)),
      r && r.headers.forEach((s, o) => (e[o] = s)));
  }
  zo(e, t) {
    const r = wg[e];
    return `${this.Uo}/v1/${t}:${r}`;
  }
  terminate() {}
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Rg {
  constructor(e) {
    ((this.Yo = e.Yo), (this.Zo = e.Zo));
  }
  Xo(e) {
    this.e_ = e;
  }
  t_(e) {
    this.n_ = e;
  }
  r_(e) {
    this.i_ = e;
  }
  onMessage(e) {
    this.s_ = e;
  }
  close() {
    this.Zo();
  }
  send(e) {
    this.Yo(e);
  }
  o_() {
    this.e_();
  }
  __() {
    this.n_();
  }
  a_(e) {
    this.i_(e);
  }
  u_(e) {
    this.s_(e);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Ee = 'WebChannelConnection';
class Sg extends Ag {
  constructor(e) {
    (super(e),
      (this.c_ = []),
      (this.forceLongPolling = e.forceLongPolling),
      (this.autoDetectLongPolling = e.autoDetectLongPolling),
      (this.useFetchStreams = e.useFetchStreams),
      (this.longPollingOptions = e.longPollingOptions));
  }
  Jo(e, t, r, s, o) {
    const a = Qi();
    return new Promise((u, h) => {
      const d = new $u();
      (d.setWithCredentials(!0),
        d.listenOnce(zu.COMPLETE, () => {
          try {
            switch (d.getLastErrorCode()) {
              case Gr.NO_ERROR:
                const E = d.getResponseJson();
                (D(Ee, `XHR for RPC '${e}' ${a} received:`, JSON.stringify(E)), u(E));
                break;
              case Gr.TIMEOUT:
                (D(Ee, `RPC '${e}' ${a} timed out`),
                  h(new k(S.DEADLINE_EXCEEDED, 'Request time out')));
                break;
              case Gr.HTTP_ERROR:
                const y = d.getStatus();
                if (
                  (D(
                    Ee,
                    `RPC '${e}' ${a} failed with status:`,
                    y,
                    'response text:',
                    d.getResponseText()
                  ),
                  y > 0)
                ) {
                  let C = d.getResponseJson();
                  Array.isArray(C) && (C = C[0]);
                  const b = C?.error;
                  if (b && b.status && b.message) {
                    const O = (function (z) {
                      const B = z.toLowerCase().replace(/_/g, '-');
                      return Object.values(S).indexOf(B) >= 0 ? B : S.UNKNOWN;
                    })(b.status);
                    h(new k(O, b.message));
                  } else h(new k(S.UNKNOWN, 'Server responded with status ' + d.getStatus()));
                } else h(new k(S.UNAVAILABLE, 'Connection failed.'));
                break;
              default:
                x(9055, { l_: e, streamId: a, h_: d.getLastErrorCode(), P_: d.getLastError() });
            }
          } finally {
            D(Ee, `RPC '${e}' ${a} completed.`);
          }
        }));
      const p = JSON.stringify(s);
      (D(Ee, `RPC '${e}' ${a} sending request:`, s), d.send(t, 'POST', p, r, 15));
    });
  }
  T_(e, t, r) {
    const s = Qi(),
      o = [this.Uo, '/', 'google.firestore.v1.Firestore', '/', e, '/channel'],
      a = Gu(),
      u = Wu(),
      h = {
        httpSessionIdParam: 'gsessionid',
        initMessageHeaders: {},
        messageUrlParams: {
          database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`,
        },
        sendRawJson: !0,
        supportsCrossDomainXhr: !0,
        internalChannelParams: { forwardChannelRequestTimeoutMs: 6e5 },
        forceLongPolling: this.forceLongPolling,
        detectBufferingProxy: this.autoDetectLongPolling,
      },
      d = this.longPollingOptions.timeoutSeconds;
    (d !== void 0 && (h.longPollingTimeout = Math.round(1e3 * d)),
      this.useFetchStreams && (h.useFetchStreams = !0),
      this.jo(h.initMessageHeaders, t, r),
      (h.encodeInitMessageHeaders = !0));
    const p = o.join('');
    D(Ee, `Creating RPC '${e}' stream ${s}: ${p}`, h);
    const E = a.createWebChannel(p, h);
    this.I_(E);
    let y = !1,
      C = !1;
    const b = new Rg({
        Yo: (N) => {
          C
            ? D(Ee, `Not sending because RPC '${e}' stream ${s} is closed:`, N)
            : (y || (D(Ee, `Opening RPC '${e}' stream ${s} transport.`), E.open(), (y = !0)),
              D(Ee, `RPC '${e}' stream ${s} sending:`, N),
              E.send(N));
        },
        Zo: () => E.close(),
      }),
      O = (N, z, B) => {
        N.listen(z, (H) => {
          try {
            B(H);
          } catch (ue) {
            setTimeout(() => {
              throw ue;
            }, 0);
          }
        });
      };
    return (
      O(E, jn.EventType.OPEN, () => {
        C || (D(Ee, `RPC '${e}' stream ${s} transport opened.`), b.o_());
      }),
      O(E, jn.EventType.CLOSE, () => {
        C || ((C = !0), D(Ee, `RPC '${e}' stream ${s} transport closed`), b.a_(), this.E_(E));
      }),
      O(E, jn.EventType.ERROR, (N) => {
        C ||
          ((C = !0),
          er(Ee, `RPC '${e}' stream ${s} transport errored. Name:`, N.name, 'Message:', N.message),
          b.a_(new k(S.UNAVAILABLE, 'The operation could not be completed')));
      }),
      O(E, jn.EventType.MESSAGE, (N) => {
        if (!C) {
          const z = N.data[0];
          K(!!z, 16349);
          const B = z,
            H = B?.error || B[0]?.error;
          if (H) {
            D(Ee, `RPC '${e}' stream ${s} received error:`, H);
            const ue = H.status;
            let Ue = (function (m) {
                const _ = se[m];
                if (_ !== void 0) return Sl(_);
              })(ue),
              pe = H.message;
            (Ue === void 0 &&
              ((Ue = S.INTERNAL),
              (pe = 'Unknown error status: ' + ue + ' with message ' + H.message)),
              (C = !0),
              b.a_(new k(Ue, pe)),
              E.close());
          } else (D(Ee, `RPC '${e}' stream ${s} received:`, z), b.u_(z));
        }
      }),
      O(u, Hu.STAT_EVENT, (N) => {
        N.stat === xi.PROXY
          ? D(Ee, `RPC '${e}' stream ${s} detected buffering proxy`)
          : N.stat === xi.NOPROXY && D(Ee, `RPC '${e}' stream ${s} detected no buffering proxy`);
      }),
      setTimeout(() => {
        b.__();
      }, 0),
      b
    );
  }
  terminate() {
    (this.c_.forEach((e) => e.close()), (this.c_ = []));
  }
  I_(e) {
    this.c_.push(e);
  }
  E_(e) {
    this.c_ = this.c_.filter((t) => t === e);
  }
}
function Ci() {
  return typeof document < 'u' ? document : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Os(n) {
  return new km(n, !0);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ql {
  constructor(e, t, r = 1e3, s = 1.5, o = 6e4) {
    ((this.Mi = e),
      (this.timerId = t),
      (this.d_ = r),
      (this.A_ = s),
      (this.R_ = o),
      (this.V_ = 0),
      (this.m_ = null),
      (this.f_ = Date.now()),
      this.reset());
  }
  reset() {
    this.V_ = 0;
  }
  g_() {
    this.V_ = this.R_;
  }
  p_(e) {
    this.cancel();
    const t = Math.floor(this.V_ + this.y_()),
      r = Math.max(0, Date.now() - this.f_),
      s = Math.max(0, t - r);
    (s > 0 &&
      D(
        'ExponentialBackoff',
        `Backing off for ${s} ms (base delay: ${this.V_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`
      ),
      (this.m_ = this.Mi.enqueueAfterDelay(this.timerId, s, () => ((this.f_ = Date.now()), e()))),
      (this.V_ *= this.A_),
      this.V_ < this.d_ && (this.V_ = this.d_),
      this.V_ > this.R_ && (this.V_ = this.R_));
  }
  w_() {
    this.m_ !== null && (this.m_.skipDelay(), (this.m_ = null));
  }
  cancel() {
    this.m_ !== null && (this.m_.cancel(), (this.m_ = null));
  }
  y_() {
    return (Math.random() - 0.5) * this.V_;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Qc = 'PersistentStream';
class jl {
  constructor(e, t, r, s, o, a, u, h) {
    ((this.Mi = e),
      (this.S_ = r),
      (this.b_ = s),
      (this.connection = o),
      (this.authCredentialsProvider = a),
      (this.appCheckCredentialsProvider = u),
      (this.listener = h),
      (this.state = 0),
      (this.D_ = 0),
      (this.C_ = null),
      (this.v_ = null),
      (this.stream = null),
      (this.F_ = 0),
      (this.M_ = new ql(e, t)));
  }
  x_() {
    return this.state === 1 || this.state === 5 || this.O_();
  }
  O_() {
    return this.state === 2 || this.state === 3;
  }
  start() {
    ((this.F_ = 0), this.state !== 4 ? this.auth() : this.N_());
  }
  async stop() {
    this.x_() && (await this.close(0));
  }
  B_() {
    ((this.state = 0), this.M_.reset());
  }
  L_() {
    this.O_() &&
      this.C_ === null &&
      (this.C_ = this.Mi.enqueueAfterDelay(this.S_, 6e4, () => this.k_()));
  }
  q_(e) {
    (this.Q_(), this.stream.send(e));
  }
  async k_() {
    if (this.O_()) return this.close(0);
  }
  Q_() {
    this.C_ && (this.C_.cancel(), (this.C_ = null));
  }
  U_() {
    this.v_ && (this.v_.cancel(), (this.v_ = null));
  }
  async close(e, t) {
    (this.Q_(),
      this.U_(),
      this.M_.cancel(),
      this.D_++,
      e !== 4
        ? this.M_.reset()
        : t && t.code === S.RESOURCE_EXHAUSTED
          ? (nt(t.toString()),
            nt('Using maximum backoff delay to prevent overloading the backend.'),
            this.M_.g_())
          : t &&
            t.code === S.UNAUTHENTICATED &&
            this.state !== 3 &&
            (this.authCredentialsProvider.invalidateToken(),
            this.appCheckCredentialsProvider.invalidateToken()),
      this.stream !== null && (this.K_(), this.stream.close(), (this.stream = null)),
      (this.state = e),
      await this.listener.r_(t));
  }
  K_() {}
  auth() {
    this.state = 1;
    const e = this.W_(this.D_),
      t = this.D_;
    Promise.all([
      this.authCredentialsProvider.getToken(),
      this.appCheckCredentialsProvider.getToken(),
    ]).then(
      ([r, s]) => {
        this.D_ === t && this.G_(r, s);
      },
      (r) => {
        e(() => {
          const s = new k(S.UNKNOWN, 'Fetching auth token failed: ' + r.message);
          return this.z_(s);
        });
      }
    );
  }
  G_(e, t) {
    const r = this.W_(this.D_);
    ((this.stream = this.j_(e, t)),
      this.stream.Xo(() => {
        r(() => this.listener.Xo());
      }),
      this.stream.t_(() => {
        r(
          () => (
            (this.state = 2),
            (this.v_ = this.Mi.enqueueAfterDelay(
              this.b_,
              1e4,
              () => (this.O_() && (this.state = 3), Promise.resolve())
            )),
            this.listener.t_()
          )
        );
      }),
      this.stream.r_((s) => {
        r(() => this.z_(s));
      }),
      this.stream.onMessage((s) => {
        r(() => (++this.F_ == 1 ? this.J_(s) : this.onNext(s)));
      }));
  }
  N_() {
    ((this.state = 5),
      this.M_.p_(async () => {
        ((this.state = 0), this.start());
      }));
  }
  z_(e) {
    return (D(Qc, `close with error: ${e}`), (this.stream = null), this.close(4, e));
  }
  W_(e) {
    return (t) => {
      this.Mi.enqueueAndForget(() =>
        this.D_ === e
          ? t()
          : (D(Qc, 'stream callback skipped by getCloseGuardedDispatcher.'), Promise.resolve())
      );
    };
  }
}
class Pg extends jl {
  constructor(e, t, r, s, o, a) {
    (super(
      e,
      'listen_stream_connection_backoff',
      'listen_stream_idle',
      'health_check_timeout',
      t,
      r,
      s,
      a
    ),
      (this.serializer = o));
  }
  j_(e, t) {
    return this.connection.T_('Listen', e, t);
  }
  J_(e) {
    return this.onNext(e);
  }
  onNext(e) {
    this.M_.reset();
    const t = Om(this.serializer, e),
      r = (function (o) {
        if (!('targetChange' in o)) return F.min();
        const a = o.targetChange;
        return a.targetIds && a.targetIds.length ? F.min() : a.readTime ? je(a.readTime) : F.min();
      })(e);
    return this.listener.H_(t, r);
  }
  Y_(e) {
    const t = {};
    ((t.database = Gi(this.serializer)),
      (t.addTarget = (function (o, a) {
        let u;
        const h = a.target;
        if (
          ((u = ji(h) ? { documents: xm(o, h) } : { query: Fm(o, h).ft }),
          (u.targetId = a.targetId),
          a.resumeToken.approximateByteSize() > 0)
        ) {
          u.resumeToken = bl(o, a.resumeToken);
          const d = zi(o, a.expectedCount);
          d !== null && (u.expectedCount = d);
        } else if (a.snapshotVersion.compareTo(F.min()) > 0) {
          u.readTime = us(o, a.snapshotVersion.toTimestamp());
          const d = zi(o, a.expectedCount);
          d !== null && (u.expectedCount = d);
        }
        return u;
      })(this.serializer, e)));
    const r = Bm(this.serializer, e);
    (r && (t.labels = r), this.q_(t));
  }
  Z_(e) {
    const t = {};
    ((t.database = Gi(this.serializer)), (t.removeTarget = e), this.q_(t));
  }
}
class Cg extends jl {
  constructor(e, t, r, s, o, a) {
    (super(
      e,
      'write_stream_connection_backoff',
      'write_stream_idle',
      'health_check_timeout',
      t,
      r,
      s,
      a
    ),
      (this.serializer = o));
  }
  get X_() {
    return this.F_ > 0;
  }
  start() {
    ((this.lastStreamToken = void 0), super.start());
  }
  K_() {
    this.X_ && this.ea([]);
  }
  j_(e, t) {
    return this.connection.T_('Write', e, t);
  }
  J_(e) {
    return (
      K(!!e.streamToken, 31322),
      (this.lastStreamToken = e.streamToken),
      K(!e.writeResults || e.writeResults.length === 0, 55816),
      this.listener.ta()
    );
  }
  onNext(e) {
    (K(!!e.streamToken, 12678), (this.lastStreamToken = e.streamToken), this.M_.reset());
    const t = Lm(e.writeResults, e.commitTime),
      r = je(e.commitTime);
    return this.listener.na(r, t);
  }
  ra() {
    const e = {};
    ((e.database = Gi(this.serializer)), this.q_(e));
  }
  ea(e) {
    const t = { streamToken: this.lastStreamToken, writes: e.map((r) => Mm(this.serializer, r)) };
    this.q_(t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class bg {}
class Vg extends bg {
  constructor(e, t, r, s) {
    (super(),
      (this.authCredentials = e),
      (this.appCheckCredentials = t),
      (this.connection = r),
      (this.serializer = s),
      (this.ia = !1));
  }
  sa() {
    if (this.ia) throw new k(S.FAILED_PRECONDITION, 'The client has already been terminated.');
  }
  Go(e, t, r, s) {
    return (
      this.sa(),
      Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()])
        .then(([o, a]) => this.connection.Go(e, Hi(t, r), s, o, a))
        .catch((o) => {
          throw o.name === 'FirebaseError'
            ? (o.code === S.UNAUTHENTICATED &&
                (this.authCredentials.invalidateToken(),
                this.appCheckCredentials.invalidateToken()),
              o)
            : new k(S.UNKNOWN, o.toString());
        })
    );
  }
  Ho(e, t, r, s, o) {
    return (
      this.sa(),
      Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()])
        .then(([a, u]) => this.connection.Ho(e, Hi(t, r), s, a, u, o))
        .catch((a) => {
          throw a.name === 'FirebaseError'
            ? (a.code === S.UNAUTHENTICATED &&
                (this.authCredentials.invalidateToken(),
                this.appCheckCredentials.invalidateToken()),
              a)
            : new k(S.UNKNOWN, a.toString());
        })
    );
  }
  terminate() {
    ((this.ia = !0), this.connection.terminate());
  }
}
class kg {
  constructor(e, t) {
    ((this.asyncQueue = e),
      (this.onlineStateHandler = t),
      (this.state = 'Unknown'),
      (this.oa = 0),
      (this._a = null),
      (this.aa = !0));
  }
  ua() {
    this.oa === 0 &&
      (this.ca('Unknown'),
      (this._a = this.asyncQueue.enqueueAfterDelay(
        'online_state_timeout',
        1e4,
        () => (
          (this._a = null),
          this.la("Backend didn't respond within 10 seconds."),
          this.ca('Offline'),
          Promise.resolve()
        )
      )));
  }
  ha(e) {
    this.state === 'Online'
      ? this.ca('Unknown')
      : (this.oa++,
        this.oa >= 1 &&
          (this.Pa(),
          this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),
          this.ca('Offline')));
  }
  set(e) {
    (this.Pa(), (this.oa = 0), e === 'Online' && (this.aa = !1), this.ca(e));
  }
  ca(e) {
    e !== this.state && ((this.state = e), this.onlineStateHandler(e));
  }
  la(e) {
    const t = `Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this.aa ? (nt(t), (this.aa = !1)) : D('OnlineStateTracker', t);
  }
  Pa() {
    this._a !== null && (this._a.cancel(), (this._a = null));
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const zt = 'RemoteStore';
class Ng {
  constructor(e, t, r, s, o) {
    ((this.localStore = e),
      (this.datastore = t),
      (this.asyncQueue = r),
      (this.remoteSyncer = {}),
      (this.Ta = []),
      (this.Ia = new Map()),
      (this.Ea = new Set()),
      (this.da = []),
      (this.Aa = o),
      this.Aa.Oo((a) => {
        r.enqueueAndForget(async () => {
          Kt(this) &&
            (D(zt, 'Restarting streams for network reachability change.'),
            await (async function (h) {
              const d = U(h);
              (d.Ea.add(4), await mr(d), d.Ra.set('Unknown'), d.Ea.delete(4), await Ms(d));
            })(this));
        });
      }),
      (this.Ra = new kg(r, s)));
  }
}
async function Ms(n) {
  if (Kt(n)) for (const e of n.da) await e(!0);
}
async function mr(n) {
  for (const e of n.da) await e(!1);
}
function $l(n, e) {
  const t = U(n);
  t.Ia.has(e.targetId) || (t.Ia.set(e.targetId, e), Ro(t) ? Ao(t) : vn(t).O_() && wo(t, e));
}
function vo(n, e) {
  const t = U(n),
    r = vn(t);
  (t.Ia.delete(e),
    r.O_() && zl(t, e),
    t.Ia.size === 0 && (r.O_() ? r.L_() : Kt(t) && t.Ra.set('Unknown')));
}
function wo(n, e) {
  if (
    (n.Va.Ue(e.targetId),
    e.resumeToken.approximateByteSize() > 0 || e.snapshotVersion.compareTo(F.min()) > 0)
  ) {
    const t = n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;
    e = e.withExpectedCount(t);
  }
  vn(n).Y_(e);
}
function zl(n, e) {
  (n.Va.Ue(e), vn(n).Z_(e));
}
function Ao(n) {
  ((n.Va = new Pm({
    getRemoteKeysForTarget: (e) => n.remoteSyncer.getRemoteKeysForTarget(e),
    At: (e) => n.Ia.get(e) || null,
    ht: () => n.datastore.serializer.databaseId,
  })),
    vn(n).start(),
    n.Ra.ua());
}
function Ro(n) {
  return Kt(n) && !vn(n).x_() && n.Ia.size > 0;
}
function Kt(n) {
  return U(n).Ea.size === 0;
}
function Hl(n) {
  n.Va = void 0;
}
async function Dg(n) {
  n.Ra.set('Online');
}
async function Og(n) {
  n.Ia.forEach((e, t) => {
    wo(n, e);
  });
}
async function Mg(n, e) {
  (Hl(n), Ro(n) ? (n.Ra.ha(e), Ao(n)) : n.Ra.set('Unknown'));
}
async function Lg(n, e, t) {
  if ((n.Ra.set('Online'), e instanceof Cl && e.state === 2 && e.cause))
    try {
      await (async function (s, o) {
        const a = o.cause;
        for (const u of o.targetIds)
          s.Ia.has(u) &&
            (await s.remoteSyncer.rejectListen(u, a), s.Ia.delete(u), s.Va.removeTarget(u));
      })(n, e);
    } catch (r) {
      (D(zt, 'Failed to remove targets %s: %s ', e.targetIds.join(','), r), await hs(n, r));
    }
  else if (
    (e instanceof Xr ? n.Va.Ze(e) : e instanceof Pl ? n.Va.st(e) : n.Va.tt(e), !t.isEqual(F.min()))
  )
    try {
      const r = await Bl(n.localStore);
      t.compareTo(r) >= 0 &&
        (await (function (o, a) {
          const u = o.Va.Tt(a);
          return (
            u.targetChanges.forEach((h, d) => {
              if (h.resumeToken.approximateByteSize() > 0) {
                const p = o.Ia.get(d);
                p && o.Ia.set(d, p.withResumeToken(h.resumeToken, a));
              }
            }),
            u.targetMismatches.forEach((h, d) => {
              const p = o.Ia.get(h);
              if (!p) return;
              (o.Ia.set(h, p.withResumeToken(fe.EMPTY_BYTE_STRING, p.snapshotVersion)), zl(o, h));
              const E = new yt(p.target, h, d, p.sequenceNumber);
              wo(o, E);
            }),
            o.remoteSyncer.applyRemoteEvent(u)
          );
        })(n, t));
    } catch (r) {
      (D(zt, 'Failed to raise snapshot:', r), await hs(n, r));
    }
}
async function hs(n, e, t) {
  if (!In(e)) throw e;
  (n.Ea.add(1),
    await mr(n),
    n.Ra.set('Offline'),
    t || (t = () => Bl(n.localStore)),
    n.asyncQueue.enqueueRetryable(async () => {
      (D(zt, 'Retrying IndexedDB access'), await t(), n.Ea.delete(1), await Ms(n));
    }));
}
function Wl(n, e) {
  return e().catch((t) => hs(n, t, e));
}
async function Ls(n) {
  const e = U(n),
    t = Ct(e);
  let r = e.Ta.length > 0 ? e.Ta[e.Ta.length - 1].batchId : ao;
  for (; xg(e); )
    try {
      const s = await yg(e.localStore, r);
      if (s === null) {
        e.Ta.length === 0 && t.L_();
        break;
      }
      ((r = s.batchId), Fg(e, s));
    } catch (s) {
      await hs(e, s);
    }
  Gl(e) && Kl(e);
}
function xg(n) {
  return Kt(n) && n.Ta.length < 10;
}
function Fg(n, e) {
  n.Ta.push(e);
  const t = Ct(n);
  t.O_() && t.X_ && t.ea(e.mutations);
}
function Gl(n) {
  return Kt(n) && !Ct(n).x_() && n.Ta.length > 0;
}
function Kl(n) {
  Ct(n).start();
}
async function Ug(n) {
  Ct(n).ra();
}
async function Bg(n) {
  const e = Ct(n);
  for (const t of n.Ta) e.ea(t.mutations);
}
async function qg(n, e, t) {
  const r = n.Ta.shift(),
    s = mo.from(r, e, t);
  (await Wl(n, () => n.remoteSyncer.applySuccessfulWrite(s)), await Ls(n));
}
async function jg(n, e) {
  (e &&
    Ct(n).X_ &&
    (await (async function (r, s) {
      if (
        (function (a) {
          return Am(a) && a !== S.ABORTED;
        })(s.code)
      ) {
        const o = r.Ta.shift();
        (Ct(r).B_(),
          await Wl(r, () => r.remoteSyncer.rejectFailedWrite(o.batchId, s)),
          await Ls(r));
      }
    })(n, e)),
    Gl(n) && Kl(n));
}
async function Yc(n, e) {
  const t = U(n);
  (t.asyncQueue.verifyOperationInProgress(), D(zt, 'RemoteStore received new credentials'));
  const r = Kt(t);
  (t.Ea.add(3),
    await mr(t),
    r && t.Ra.set('Unknown'),
    await t.remoteSyncer.handleCredentialChange(e),
    t.Ea.delete(3),
    await Ms(t));
}
async function $g(n, e) {
  const t = U(n);
  e ? (t.Ea.delete(2), await Ms(t)) : e || (t.Ea.add(2), await mr(t), t.Ra.set('Unknown'));
}
function vn(n) {
  return (
    n.ma ||
      ((n.ma = (function (t, r, s) {
        const o = U(t);
        return (
          o.sa(),
          new Pg(r, o.connection, o.authCredentials, o.appCheckCredentials, o.serializer, s)
        );
      })(n.datastore, n.asyncQueue, {
        Xo: Dg.bind(null, n),
        t_: Og.bind(null, n),
        r_: Mg.bind(null, n),
        H_: Lg.bind(null, n),
      })),
      n.da.push(async (e) => {
        e ? (n.ma.B_(), Ro(n) ? Ao(n) : n.Ra.set('Unknown')) : (await n.ma.stop(), Hl(n));
      })),
    n.ma
  );
}
function Ct(n) {
  return (
    n.fa ||
      ((n.fa = (function (t, r, s) {
        const o = U(t);
        return (
          o.sa(),
          new Cg(r, o.connection, o.authCredentials, o.appCheckCredentials, o.serializer, s)
        );
      })(n.datastore, n.asyncQueue, {
        Xo: () => Promise.resolve(),
        t_: Ug.bind(null, n),
        r_: jg.bind(null, n),
        ta: Bg.bind(null, n),
        na: qg.bind(null, n),
      })),
      n.da.push(async (e) => {
        e
          ? (n.fa.B_(), await Ls(n))
          : (await n.fa.stop(),
            n.Ta.length > 0 &&
              (D(zt, `Stopping write stream with ${n.Ta.length} pending writes`), (n.Ta = [])));
      })),
    n.fa
  );
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class So {
  constructor(e, t, r, s, o) {
    ((this.asyncQueue = e),
      (this.timerId = t),
      (this.targetTimeMs = r),
      (this.op = s),
      (this.removalCallback = o),
      (this.deferred = new et()),
      (this.then = this.deferred.promise.then.bind(this.deferred.promise)),
      this.deferred.promise.catch((a) => {}));
  }
  get promise() {
    return this.deferred.promise;
  }
  static createAndSchedule(e, t, r, s, o) {
    const a = Date.now() + r,
      u = new So(e, t, a, s, o);
    return (u.start(r), u);
  }
  start(e) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), e);
  }
  skipDelay() {
    return this.handleDelayElapsed();
  }
  cancel(e) {
    this.timerHandle !== null &&
      (this.clearTimeout(),
      this.deferred.reject(new k(S.CANCELLED, 'Operation cancelled' + (e ? ': ' + e : ''))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() =>
      this.timerHandle !== null
        ? (this.clearTimeout(), this.op().then((e) => this.deferred.resolve(e)))
        : Promise.resolve()
    );
  }
  clearTimeout() {
    this.timerHandle !== null &&
      (this.removalCallback(this), clearTimeout(this.timerHandle), (this.timerHandle = null));
  }
}
function Po(n, e) {
  if ((nt('AsyncQueue', `${e}: ${n}`), In(n))) return new k(S.UNAVAILABLE, `${e}: ${n}`);
  throw n;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class sn {
  static emptySet(e) {
    return new sn(e.comparator);
  }
  constructor(e) {
    ((this.comparator = e
      ? (t, r) => e(t, r) || M.comparator(t.key, r.key)
      : (t, r) => M.comparator(t.key, r.key)),
      (this.keyedMap = $n()),
      (this.sortedSet = new Z(this.comparator)));
  }
  has(e) {
    return this.keyedMap.get(e) != null;
  }
  get(e) {
    return this.keyedMap.get(e);
  }
  first() {
    return this.sortedSet.minKey();
  }
  last() {
    return this.sortedSet.maxKey();
  }
  isEmpty() {
    return this.sortedSet.isEmpty();
  }
  indexOf(e) {
    const t = this.keyedMap.get(e);
    return t ? this.sortedSet.indexOf(t) : -1;
  }
  get size() {
    return this.sortedSet.size;
  }
  forEach(e) {
    this.sortedSet.inorderTraversal((t, r) => (e(t), !1));
  }
  add(e) {
    const t = this.delete(e.key);
    return t.copy(t.keyedMap.insert(e.key, e), t.sortedSet.insert(e, null));
  }
  delete(e) {
    const t = this.get(e);
    return t ? this.copy(this.keyedMap.remove(e), this.sortedSet.remove(t)) : this;
  }
  isEqual(e) {
    if (!(e instanceof sn) || this.size !== e.size) return !1;
    const t = this.sortedSet.getIterator(),
      r = e.sortedSet.getIterator();
    for (; t.hasNext(); ) {
      const s = t.getNext().key,
        o = r.getNext().key;
      if (!s.isEqual(o)) return !1;
    }
    return !0;
  }
  toString() {
    const e = [];
    return (
      this.forEach((t) => {
        e.push(t.toString());
      }),
      e.length === 0
        ? 'DocumentSet ()'
        : `DocumentSet (
  ` +
          e.join(`  
`) +
          `
)`
    );
  }
  copy(e, t) {
    const r = new sn();
    return ((r.comparator = this.comparator), (r.keyedMap = e), (r.sortedSet = t), r);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Xc {
  constructor() {
    this.ga = new Z(M.comparator);
  }
  track(e) {
    const t = e.doc.key,
      r = this.ga.get(t);
    r
      ? e.type !== 0 && r.type === 3
        ? (this.ga = this.ga.insert(t, e))
        : e.type === 3 && r.type !== 1
          ? (this.ga = this.ga.insert(t, { type: r.type, doc: e.doc }))
          : e.type === 2 && r.type === 2
            ? (this.ga = this.ga.insert(t, { type: 2, doc: e.doc }))
            : e.type === 2 && r.type === 0
              ? (this.ga = this.ga.insert(t, { type: 0, doc: e.doc }))
              : e.type === 1 && r.type === 0
                ? (this.ga = this.ga.remove(t))
                : e.type === 1 && r.type === 2
                  ? (this.ga = this.ga.insert(t, { type: 1, doc: r.doc }))
                  : e.type === 0 && r.type === 1
                    ? (this.ga = this.ga.insert(t, { type: 2, doc: e.doc }))
                    : x(63341, { Rt: e, pa: r })
      : (this.ga = this.ga.insert(t, e));
  }
  ya() {
    const e = [];
    return (
      this.ga.inorderTraversal((t, r) => {
        e.push(r);
      }),
      e
    );
  }
}
class pn {
  constructor(e, t, r, s, o, a, u, h, d) {
    ((this.query = e),
      (this.docs = t),
      (this.oldDocs = r),
      (this.docChanges = s),
      (this.mutatedKeys = o),
      (this.fromCache = a),
      (this.syncStateChanged = u),
      (this.excludesMetadataChanges = h),
      (this.hasCachedResults = d));
  }
  static fromInitialDocuments(e, t, r, s, o) {
    const a = [];
    return (
      t.forEach((u) => {
        a.push({ type: 0, doc: u });
      }),
      new pn(e, t, sn.emptySet(t), a, r, s, !0, !1, o)
    );
  }
  get hasPendingWrites() {
    return !this.mutatedKeys.isEmpty();
  }
  isEqual(e) {
    if (
      !(
        this.fromCache === e.fromCache &&
        this.hasCachedResults === e.hasCachedResults &&
        this.syncStateChanged === e.syncStateChanged &&
        this.mutatedKeys.isEqual(e.mutatedKeys) &&
        bs(this.query, e.query) &&
        this.docs.isEqual(e.docs) &&
        this.oldDocs.isEqual(e.oldDocs)
      )
    )
      return !1;
    const t = this.docChanges,
      r = e.docChanges;
    if (t.length !== r.length) return !1;
    for (let s = 0; s < t.length; s++)
      if (t[s].type !== r[s].type || !t[s].doc.isEqual(r[s].doc)) return !1;
    return !0;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class zg {
  constructor() {
    ((this.wa = void 0), (this.Sa = []));
  }
  ba() {
    return this.Sa.some((e) => e.Da());
  }
}
class Hg {
  constructor() {
    ((this.queries = Jc()), (this.onlineState = 'Unknown'), (this.Ca = new Set()));
  }
  terminate() {
    (function (t, r) {
      const s = U(t),
        o = s.queries;
      ((s.queries = Jc()),
        o.forEach((a, u) => {
          for (const h of u.Sa) h.onError(r);
        }));
    })(this, new k(S.ABORTED, 'Firestore shutting down'));
  }
}
function Jc() {
  return new Gt((n) => pl(n), bs);
}
async function Co(n, e) {
  const t = U(n);
  let r = 3;
  const s = e.query;
  let o = t.queries.get(s);
  o ? !o.ba() && e.Da() && (r = 2) : ((o = new zg()), (r = e.Da() ? 0 : 1));
  try {
    switch (r) {
      case 0:
        o.wa = await t.onListen(s, !0);
        break;
      case 1:
        o.wa = await t.onListen(s, !1);
        break;
      case 2:
        await t.onFirstRemoteStoreListen(s);
    }
  } catch (a) {
    const u = Po(a, `Initialization of query '${tn(e.query)}' failed`);
    return void e.onError(u);
  }
  (t.queries.set(s, o), o.Sa.push(e), e.va(t.onlineState), o.wa && e.Fa(o.wa) && Vo(t));
}
async function bo(n, e) {
  const t = U(n),
    r = e.query;
  let s = 3;
  const o = t.queries.get(r);
  if (o) {
    const a = o.Sa.indexOf(e);
    a >= 0 &&
      (o.Sa.splice(a, 1), o.Sa.length === 0 ? (s = e.Da() ? 0 : 1) : !o.ba() && e.Da() && (s = 2));
  }
  switch (s) {
    case 0:
      return (t.queries.delete(r), t.onUnlisten(r, !0));
    case 1:
      return (t.queries.delete(r), t.onUnlisten(r, !1));
    case 2:
      return t.onLastRemoteStoreUnlisten(r);
    default:
      return;
  }
}
function Wg(n, e) {
  const t = U(n);
  let r = !1;
  for (const s of e) {
    const o = s.query,
      a = t.queries.get(o);
    if (a) {
      for (const u of a.Sa) u.Fa(s) && (r = !0);
      a.wa = s;
    }
  }
  r && Vo(t);
}
function Gg(n, e, t) {
  const r = U(n),
    s = r.queries.get(e);
  if (s) for (const o of s.Sa) o.onError(t);
  r.queries.delete(e);
}
function Vo(n) {
  n.Ca.forEach((e) => {
    e.next();
  });
}
var Yi, Zc;
(((Zc = Yi || (Yi = {})).Ma = 'default'), (Zc.Cache = 'cache'));
class ko {
  constructor(e, t, r) {
    ((this.query = e),
      (this.xa = t),
      (this.Oa = !1),
      (this.Na = null),
      (this.onlineState = 'Unknown'),
      (this.options = r || {}));
  }
  Fa(e) {
    if (!this.options.includeMetadataChanges) {
      const r = [];
      for (const s of e.docChanges) s.type !== 3 && r.push(s);
      e = new pn(
        e.query,
        e.docs,
        e.oldDocs,
        r,
        e.mutatedKeys,
        e.fromCache,
        e.syncStateChanged,
        !0,
        e.hasCachedResults
      );
    }
    let t = !1;
    return (
      this.Oa
        ? this.Ba(e) && (this.xa.next(e), (t = !0))
        : this.La(e, this.onlineState) && (this.ka(e), (t = !0)),
      (this.Na = e),
      t
    );
  }
  onError(e) {
    this.xa.error(e);
  }
  va(e) {
    this.onlineState = e;
    let t = !1;
    return (this.Na && !this.Oa && this.La(this.Na, e) && (this.ka(this.Na), (t = !0)), t);
  }
  La(e, t) {
    if (!e.fromCache || !this.Da()) return !0;
    const r = t !== 'Offline';
    return (!this.options.qa || !r) && (!e.docs.isEmpty() || e.hasCachedResults || t === 'Offline');
  }
  Ba(e) {
    if (e.docChanges.length > 0) return !0;
    const t = this.Na && this.Na.hasPendingWrites !== e.hasPendingWrites;
    return !(!e.syncStateChanged && !t) && this.options.includeMetadataChanges === !0;
  }
  ka(e) {
    ((e = pn.fromInitialDocuments(e.query, e.docs, e.mutatedKeys, e.fromCache, e.hasCachedResults)),
      (this.Oa = !0),
      this.xa.next(e));
  }
  Da() {
    return this.options.source !== Yi.Cache;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Ql {
  constructor(e) {
    this.key = e;
  }
}
class Yl {
  constructor(e) {
    this.key = e;
  }
}
class Kg {
  constructor(e, t) {
    ((this.query = e),
      (this.Ya = t),
      (this.Za = null),
      (this.hasCachedResults = !1),
      (this.current = !1),
      (this.Xa = $()),
      (this.mutatedKeys = $()),
      (this.eu = ml(e)),
      (this.tu = new sn(this.eu)));
  }
  get nu() {
    return this.Ya;
  }
  ru(e, t) {
    const r = t ? t.iu : new Xc(),
      s = t ? t.tu : this.tu;
    let o = t ? t.mutatedKeys : this.mutatedKeys,
      a = s,
      u = !1;
    const h = this.query.limitType === 'F' && s.size === this.query.limit ? s.last() : null,
      d = this.query.limitType === 'L' && s.size === this.query.limit ? s.first() : null;
    if (
      (e.inorderTraversal((p, E) => {
        const y = s.get(p),
          C = Vs(this.query, E) ? E : null,
          b = !!y && this.mutatedKeys.has(y.key),
          O =
            !!C &&
            (C.hasLocalMutations || (this.mutatedKeys.has(C.key) && C.hasCommittedMutations));
        let N = !1;
        (y && C
          ? y.data.isEqual(C.data)
            ? b !== O && (r.track({ type: 3, doc: C }), (N = !0))
            : this.su(y, C) ||
              (r.track({ type: 2, doc: C }),
              (N = !0),
              ((h && this.eu(C, h) > 0) || (d && this.eu(C, d) < 0)) && (u = !0))
          : !y && C
            ? (r.track({ type: 0, doc: C }), (N = !0))
            : y && !C && (r.track({ type: 1, doc: y }), (N = !0), (h || d) && (u = !0)),
          N &&
            (C
              ? ((a = a.add(C)), (o = O ? o.add(p) : o.delete(p)))
              : ((a = a.delete(p)), (o = o.delete(p)))));
      }),
      this.query.limit !== null)
    )
      for (; a.size > this.query.limit; ) {
        const p = this.query.limitType === 'F' ? a.last() : a.first();
        ((a = a.delete(p.key)), (o = o.delete(p.key)), r.track({ type: 1, doc: p }));
      }
    return { tu: a, iu: r, Cs: u, mutatedKeys: o };
  }
  su(e, t) {
    return e.hasLocalMutations && t.hasCommittedMutations && !t.hasLocalMutations;
  }
  applyChanges(e, t, r, s) {
    const o = this.tu;
    ((this.tu = e.tu), (this.mutatedKeys = e.mutatedKeys));
    const a = e.iu.ya();
    (a.sort(
      (p, E) =>
        (function (C, b) {
          const O = (N) => {
            switch (N) {
              case 0:
                return 1;
              case 2:
              case 3:
                return 2;
              case 1:
                return 0;
              default:
                return x(20277, { Rt: N });
            }
          };
          return O(C) - O(b);
        })(p.type, E.type) || this.eu(p.doc, E.doc)
    ),
      this.ou(r),
      (s = s ?? !1));
    const u = t && !s ? this._u() : [],
      h = this.Xa.size === 0 && this.current && !s ? 1 : 0,
      d = h !== this.Za;
    return (
      (this.Za = h),
      a.length !== 0 || d
        ? {
            snapshot: new pn(
              this.query,
              e.tu,
              o,
              a,
              e.mutatedKeys,
              h === 0,
              d,
              !1,
              !!r && r.resumeToken.approximateByteSize() > 0
            ),
            au: u,
          }
        : { au: u }
    );
  }
  va(e) {
    return this.current && e === 'Offline'
      ? ((this.current = !1),
        this.applyChanges({ tu: this.tu, iu: new Xc(), mutatedKeys: this.mutatedKeys, Cs: !1 }, !1))
      : { au: [] };
  }
  uu(e) {
    return !this.Ya.has(e) && !!this.tu.has(e) && !this.tu.get(e).hasLocalMutations;
  }
  ou(e) {
    e &&
      (e.addedDocuments.forEach((t) => (this.Ya = this.Ya.add(t))),
      e.modifiedDocuments.forEach((t) => {}),
      e.removedDocuments.forEach((t) => (this.Ya = this.Ya.delete(t))),
      (this.current = e.current));
  }
  _u() {
    if (!this.current) return [];
    const e = this.Xa;
    ((this.Xa = $()),
      this.tu.forEach((r) => {
        this.uu(r.key) && (this.Xa = this.Xa.add(r.key));
      }));
    const t = [];
    return (
      e.forEach((r) => {
        this.Xa.has(r) || t.push(new Yl(r));
      }),
      this.Xa.forEach((r) => {
        e.has(r) || t.push(new Ql(r));
      }),
      t
    );
  }
  cu(e) {
    ((this.Ya = e.Qs), (this.Xa = $()));
    const t = this.ru(e.documents);
    return this.applyChanges(t, !0);
  }
  lu() {
    return pn.fromInitialDocuments(
      this.query,
      this.tu,
      this.mutatedKeys,
      this.Za === 0,
      this.hasCachedResults
    );
  }
}
const No = 'SyncEngine';
class Qg {
  constructor(e, t, r) {
    ((this.query = e), (this.targetId = t), (this.view = r));
  }
}
class Yg {
  constructor(e) {
    ((this.key = e), (this.hu = !1));
  }
}
class Xg {
  constructor(e, t, r, s, o, a) {
    ((this.localStore = e),
      (this.remoteStore = t),
      (this.eventManager = r),
      (this.sharedClientState = s),
      (this.currentUser = o),
      (this.maxConcurrentLimboResolutions = a),
      (this.Pu = {}),
      (this.Tu = new Gt((u) => pl(u), bs)),
      (this.Iu = new Map()),
      (this.Eu = new Set()),
      (this.du = new Z(M.comparator)),
      (this.Au = new Map()),
      (this.Ru = new yo()),
      (this.Vu = {}),
      (this.mu = new Map()),
      (this.fu = fn.cr()),
      (this.onlineState = 'Unknown'),
      (this.gu = void 0));
  }
  get isPrimaryClient() {
    return this.gu === !0;
  }
}
async function Jg(n, e, t = !0) {
  const r = nh(n);
  let s;
  const o = r.Tu.get(e);
  return (
    o
      ? (r.sharedClientState.addLocalQueryTarget(o.targetId), (s = o.view.lu()))
      : (s = await Xl(r, e, t, !0)),
    s
  );
}
async function Zg(n, e) {
  const t = nh(n);
  await Xl(t, e, !0, !1);
}
async function Xl(n, e, t, r) {
  const s = await Eg(n.localStore, qe(e)),
    o = s.targetId,
    a = n.sharedClientState.addLocalQueryTarget(o, t);
  let u;
  return (
    r && (u = await e_(n, e, o, a === 'current', s.resumeToken)),
    n.isPrimaryClient && t && $l(n.remoteStore, s),
    u
  );
}
async function e_(n, e, t, r, s) {
  n.pu = (E, y, C) =>
    (async function (O, N, z, B) {
      let H = N.view.ru(z);
      H.Cs && (H = await Hc(O.localStore, N.query, !1).then(({ documents: v }) => N.view.ru(v, H)));
      const ue = B && B.targetChanges.get(N.targetId),
        Ue = B && B.targetMismatches.get(N.targetId) != null,
        pe = N.view.applyChanges(H, O.isPrimaryClient, ue, Ue);
      return (tu(O, N.targetId, pe.au), pe.snapshot);
    })(n, E, y, C);
  const o = await Hc(n.localStore, e, !0),
    a = new Kg(e, o.Qs),
    u = a.ru(o.documents),
    h = pr.createSynthesizedTargetChangeForCurrentChange(t, r && n.onlineState !== 'Offline', s),
    d = a.applyChanges(u, n.isPrimaryClient, h);
  tu(n, t, d.au);
  const p = new Qg(e, t, a);
  return (n.Tu.set(e, p), n.Iu.has(t) ? n.Iu.get(t).push(e) : n.Iu.set(t, [e]), d.snapshot);
}
async function t_(n, e, t) {
  const r = U(n),
    s = r.Tu.get(e),
    o = r.Iu.get(s.targetId);
  if (o.length > 1)
    return (
      r.Iu.set(
        s.targetId,
        o.filter((a) => !bs(a, e))
      ),
      void r.Tu.delete(e)
    );
  r.isPrimaryClient
    ? (r.sharedClientState.removeLocalQueryTarget(s.targetId),
      r.sharedClientState.isActiveQueryTarget(s.targetId) ||
        (await Ki(r.localStore, s.targetId, !1)
          .then(() => {
            (r.sharedClientState.clearQueryState(s.targetId),
              t && vo(r.remoteStore, s.targetId),
              Xi(r, s.targetId));
          })
          .catch(En)))
    : (Xi(r, s.targetId), await Ki(r.localStore, s.targetId, !0));
}
async function n_(n, e) {
  const t = U(n),
    r = t.Tu.get(e),
    s = t.Iu.get(r.targetId);
  t.isPrimaryClient &&
    s.length === 1 &&
    (t.sharedClientState.removeLocalQueryTarget(r.targetId), vo(t.remoteStore, r.targetId));
}
async function r_(n, e, t) {
  const r = l_(n);
  try {
    const s = await (function (a, u) {
      const h = U(a),
        d = J.now(),
        p = u.reduce((C, b) => C.add(b.key), $());
      let E, y;
      return h.persistence
        .runTransaction('Locally write mutations', 'readwrite', (C) => {
          let b = rt(),
            O = $();
          return h.Ns.getEntries(C, p)
            .next((N) => {
              ((b = N),
                b.forEach((z, B) => {
                  B.isValidDocument() || (O = O.add(z));
                }));
            })
            .next(() => h.localDocuments.getOverlayedDocuments(C, b))
            .next((N) => {
              E = N;
              const z = [];
              for (const B of u) {
                const H = Em(B, E.get(B.key).overlayedDocument);
                H != null && z.push(new kt(B.key, H, ol(H.value.mapValue), Ne.exists(!0)));
              }
              return h.mutationQueue.addMutationBatch(C, d, z, u);
            })
            .next((N) => {
              y = N;
              const z = N.applyToLocalDocumentSet(E, O);
              return h.documentOverlayCache.saveOverlays(C, N.batchId, z);
            });
        })
        .then(() => ({ batchId: y.batchId, changes: _l(E) }));
    })(r.localStore, e);
    (r.sharedClientState.addPendingMutation(s.batchId),
      (function (a, u, h) {
        let d = a.Vu[a.currentUser.toKey()];
        (d || (d = new Z(j)), (d = d.insert(u, h)), (a.Vu[a.currentUser.toKey()] = d));
      })(r, s.batchId, t),
      await gr(r, s.changes),
      await Ls(r.remoteStore));
  } catch (s) {
    const o = Po(s, 'Failed to persist write');
    t.reject(o);
  }
}
async function Jl(n, e) {
  const t = U(n);
  try {
    const r = await gg(t.localStore, e);
    (e.targetChanges.forEach((s, o) => {
      const a = t.Au.get(o);
      a &&
        (K(s.addedDocuments.size + s.modifiedDocuments.size + s.removedDocuments.size <= 1, 22616),
        s.addedDocuments.size > 0
          ? (a.hu = !0)
          : s.modifiedDocuments.size > 0
            ? K(a.hu, 14607)
            : s.removedDocuments.size > 0 && (K(a.hu, 42227), (a.hu = !1)));
    }),
      await gr(t, r, e));
  } catch (r) {
    await En(r);
  }
}
function eu(n, e, t) {
  const r = U(n);
  if ((r.isPrimaryClient && t === 0) || (!r.isPrimaryClient && t === 1)) {
    const s = [];
    (r.Tu.forEach((o, a) => {
      const u = a.view.va(e);
      u.snapshot && s.push(u.snapshot);
    }),
      (function (a, u) {
        const h = U(a);
        h.onlineState = u;
        let d = !1;
        (h.queries.forEach((p, E) => {
          for (const y of E.Sa) y.va(u) && (d = !0);
        }),
          d && Vo(h));
      })(r.eventManager, e),
      s.length && r.Pu.H_(s),
      (r.onlineState = e),
      r.isPrimaryClient && r.sharedClientState.setOnlineState(e));
  }
}
async function s_(n, e, t) {
  const r = U(n);
  r.sharedClientState.updateQueryState(e, 'rejected', t);
  const s = r.Au.get(e),
    o = s && s.key;
  if (o) {
    let a = new Z(M.comparator);
    a = a.insert(o, Ie.newNoDocument(o, F.min()));
    const u = $().add(o),
      h = new Ds(F.min(), new Map(), new Z(j), a, u);
    (await Jl(r, h), (r.du = r.du.remove(o)), r.Au.delete(e), Do(r));
  } else
    await Ki(r.localStore, e, !1)
      .then(() => Xi(r, e, t))
      .catch(En);
}
async function i_(n, e) {
  const t = U(n),
    r = e.batch.batchId;
  try {
    const s = await mg(t.localStore, e);
    (eh(t, r, null),
      Zl(t, r),
      t.sharedClientState.updateMutationState(r, 'acknowledged'),
      await gr(t, s));
  } catch (s) {
    await En(s);
  }
}
async function o_(n, e, t) {
  const r = U(n);
  try {
    const s = await (function (a, u) {
      const h = U(a);
      return h.persistence.runTransaction('Reject batch', 'readwrite-primary', (d) => {
        let p;
        return h.mutationQueue
          .lookupMutationBatch(d, u)
          .next(
            (E) => (K(E !== null, 37113), (p = E.keys()), h.mutationQueue.removeMutationBatch(d, E))
          )
          .next(() => h.mutationQueue.performConsistencyCheck(d))
          .next(() => h.documentOverlayCache.removeOverlaysForBatchId(d, p, u))
          .next(() => h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d, p))
          .next(() => h.localDocuments.getDocuments(d, p));
      });
    })(r.localStore, e);
    (eh(r, e, t),
      Zl(r, e),
      r.sharedClientState.updateMutationState(e, 'rejected', t),
      await gr(r, s));
  } catch (s) {
    await En(s);
  }
}
function Zl(n, e) {
  ((n.mu.get(e) || []).forEach((t) => {
    t.resolve();
  }),
    n.mu.delete(e));
}
function eh(n, e, t) {
  const r = U(n);
  let s = r.Vu[r.currentUser.toKey()];
  if (s) {
    const o = s.get(e);
    (o && (t ? o.reject(t) : o.resolve(), (s = s.remove(e))), (r.Vu[r.currentUser.toKey()] = s));
  }
}
function Xi(n, e, t = null) {
  n.sharedClientState.removeLocalQueryTarget(e);
  for (const r of n.Iu.get(e)) (n.Tu.delete(r), t && n.Pu.yu(r, t));
  (n.Iu.delete(e),
    n.isPrimaryClient &&
      n.Ru.jr(e).forEach((r) => {
        n.Ru.containsKey(r) || th(n, r);
      }));
}
function th(n, e) {
  n.Eu.delete(e.path.canonicalString());
  const t = n.du.get(e);
  t !== null && (vo(n.remoteStore, t), (n.du = n.du.remove(e)), n.Au.delete(t), Do(n));
}
function tu(n, e, t) {
  for (const r of t)
    r instanceof Ql
      ? (n.Ru.addReference(r.key, e), a_(n, r))
      : r instanceof Yl
        ? (D(No, 'Document no longer in limbo: ' + r.key),
          n.Ru.removeReference(r.key, e),
          n.Ru.containsKey(r.key) || th(n, r.key))
        : x(19791, { wu: r });
}
function a_(n, e) {
  const t = e.key,
    r = t.path.canonicalString();
  n.du.get(t) || n.Eu.has(r) || (D(No, 'New document in limbo: ' + t), n.Eu.add(r), Do(n));
}
function Do(n) {
  for (; n.Eu.size > 0 && n.du.size < n.maxConcurrentLimboResolutions; ) {
    const e = n.Eu.values().next().value;
    n.Eu.delete(e);
    const t = new M(Y.fromString(e)),
      r = n.fu.next();
    (n.Au.set(r, new Yg(t)),
      (n.du = n.du.insert(t, r)),
      $l(n.remoteStore, new yt(qe(Cs(t.path)), r, 'TargetPurposeLimboResolution', Rs.ce)));
  }
}
async function gr(n, e, t) {
  const r = U(n),
    s = [],
    o = [],
    a = [];
  r.Tu.isEmpty() ||
    (r.Tu.forEach((u, h) => {
      a.push(
        r.pu(h, e, t).then((d) => {
          if ((d || t) && r.isPrimaryClient) {
            const p = d ? !d.fromCache : t?.targetChanges.get(h.targetId)?.current;
            r.sharedClientState.updateQueryState(h.targetId, p ? 'current' : 'not-current');
          }
          if (d) {
            s.push(d);
            const p = Io.As(h.targetId, d);
            o.push(p);
          }
        })
      );
    }),
    await Promise.all(a),
    r.Pu.H_(s),
    await (async function (h, d) {
      const p = U(h);
      try {
        await p.persistence.runTransaction('notifyLocalViewChanges', 'readwrite', (E) =>
          P.forEach(d, (y) =>
            P.forEach(y.Es, (C) =>
              p.persistence.referenceDelegate.addReference(E, y.targetId, C)
            ).next(() =>
              P.forEach(y.ds, (C) =>
                p.persistence.referenceDelegate.removeReference(E, y.targetId, C)
              )
            )
          )
        );
      } catch (E) {
        if (!In(E)) throw E;
        D(To, 'Failed to update sequence numbers: ' + E);
      }
      for (const E of d) {
        const y = E.targetId;
        if (!E.fromCache) {
          const C = p.Ms.get(y),
            b = C.snapshotVersion,
            O = C.withLastLimboFreeSnapshotVersion(b);
          p.Ms = p.Ms.insert(y, O);
        }
      }
    })(r.localStore, o));
}
async function c_(n, e) {
  const t = U(n);
  if (!t.currentUser.isEqual(e)) {
    D(No, 'User change. New user:', e.toKey());
    const r = await Ul(t.localStore, e);
    ((t.currentUser = e),
      (function (o, a) {
        (o.mu.forEach((u) => {
          u.forEach((h) => {
            h.reject(new k(S.CANCELLED, a));
          });
        }),
          o.mu.clear());
      })(t, "'waitForPendingWrites' promise is rejected due to a user change."),
      t.sharedClientState.handleUserChange(e, r.removedBatchIds, r.addedBatchIds),
      await gr(t, r.Ls));
  }
}
function u_(n, e) {
  const t = U(n),
    r = t.Au.get(e);
  if (r && r.hu) return $().add(r.key);
  {
    let s = $();
    const o = t.Iu.get(e);
    if (!o) return s;
    for (const a of o) {
      const u = t.Tu.get(a);
      s = s.unionWith(u.view.nu);
    }
    return s;
  }
}
function nh(n) {
  const e = U(n);
  return (
    (e.remoteStore.remoteSyncer.applyRemoteEvent = Jl.bind(null, e)),
    (e.remoteStore.remoteSyncer.getRemoteKeysForTarget = u_.bind(null, e)),
    (e.remoteStore.remoteSyncer.rejectListen = s_.bind(null, e)),
    (e.Pu.H_ = Wg.bind(null, e.eventManager)),
    (e.Pu.yu = Gg.bind(null, e.eventManager)),
    e
  );
}
function l_(n) {
  const e = U(n);
  return (
    (e.remoteStore.remoteSyncer.applySuccessfulWrite = i_.bind(null, e)),
    (e.remoteStore.remoteSyncer.rejectFailedWrite = o_.bind(null, e)),
    e
  );
}
class ds {
  constructor() {
    ((this.kind = 'memory'), (this.synchronizeTabs = !1));
  }
  async initialize(e) {
    ((this.serializer = Os(e.databaseInfo.databaseId)),
      (this.sharedClientState = this.Du(e)),
      (this.persistence = this.Cu(e)),
      await this.persistence.start(),
      (this.localStore = this.vu(e)),
      (this.gcScheduler = this.Fu(e, this.localStore)),
      (this.indexBackfillerScheduler = this.Mu(e, this.localStore)));
  }
  Fu(e, t) {
    return null;
  }
  Mu(e, t) {
    return null;
  }
  vu(e) {
    return pg(this.persistence, new hg(), e.initialUser, this.serializer);
  }
  Cu(e) {
    return new Fl(Eo.mi, this.serializer);
  }
  Du(e) {
    return new Tg();
  }
  async terminate() {
    (this.gcScheduler?.stop(),
      this.indexBackfillerScheduler?.stop(),
      this.sharedClientState.shutdown(),
      await this.persistence.shutdown());
  }
}
ds.provider = { build: () => new ds() };
class h_ extends ds {
  constructor(e) {
    (super(), (this.cacheSizeBytes = e));
  }
  Fu(e, t) {
    K(this.persistence.referenceDelegate instanceof ls, 46915);
    const r = this.persistence.referenceDelegate.garbageCollector;
    return new Ym(r, e.asyncQueue, t);
  }
  Cu(e) {
    const t = this.cacheSizeBytes !== void 0 ? Se.withCacheSize(this.cacheSizeBytes) : Se.DEFAULT;
    return new Fl((r) => ls.mi(r, t), this.serializer);
  }
}
class Ji {
  async initialize(e, t) {
    this.localStore ||
      ((this.localStore = e.localStore),
      (this.sharedClientState = e.sharedClientState),
      (this.datastore = this.createDatastore(t)),
      (this.remoteStore = this.createRemoteStore(t)),
      (this.eventManager = this.createEventManager(t)),
      (this.syncEngine = this.createSyncEngine(t, !e.synchronizeTabs)),
      (this.sharedClientState.onlineStateHandler = (r) => eu(this.syncEngine, r, 1)),
      (this.remoteStore.remoteSyncer.handleCredentialChange = c_.bind(null, this.syncEngine)),
      await $g(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(e) {
    return (function () {
      return new Hg();
    })();
  }
  createDatastore(e) {
    const t = Os(e.databaseInfo.databaseId),
      r = (function (o) {
        return new Sg(o);
      })(e.databaseInfo);
    return (function (o, a, u, h) {
      return new Vg(o, a, u, h);
    })(e.authCredentials, e.appCheckCredentials, r, t);
  }
  createRemoteStore(e) {
    return (function (r, s, o, a, u) {
      return new Ng(r, s, o, a, u);
    })(
      this.localStore,
      this.datastore,
      e.asyncQueue,
      (t) => eu(this.syncEngine, t, 0),
      (function () {
        return Kc.v() ? new Kc() : new vg();
      })()
    );
  }
  createSyncEngine(e, t) {
    return (function (s, o, a, u, h, d, p) {
      const E = new Xg(s, o, a, u, h, d);
      return (p && (E.gu = !0), E);
    })(
      this.localStore,
      this.remoteStore,
      this.eventManager,
      this.sharedClientState,
      e.initialUser,
      e.maxConcurrentLimboResolutions,
      t
    );
  }
  async terminate() {
    (await (async function (t) {
      const r = U(t);
      (D(zt, 'RemoteStore shutting down.'),
        r.Ea.add(5),
        await mr(r),
        r.Aa.shutdown(),
        r.Ra.set('Unknown'));
    })(this.remoteStore),
      this.datastore?.terminate(),
      this.eventManager?.terminate());
  }
}
Ji.provider = { build: () => new Ji() };
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Oo {
  constructor(e) {
    ((this.observer = e), (this.muted = !1));
  }
  next(e) {
    this.muted || (this.observer.next && this.Ou(this.observer.next, e));
  }
  error(e) {
    this.muted ||
      (this.observer.error
        ? this.Ou(this.observer.error, e)
        : nt('Uncaught Error in snapshot listener:', e.toString()));
  }
  Nu() {
    this.muted = !0;
  }
  Ou(e, t) {
    setTimeout(() => {
      this.muted || e(t);
    }, 0);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const bt = 'FirestoreClient';
class d_ {
  constructor(e, t, r, s, o) {
    ((this.authCredentials = e),
      (this.appCheckCredentials = t),
      (this.asyncQueue = r),
      (this.databaseInfo = s),
      (this.user = Re.UNAUTHENTICATED),
      (this.clientId = oo.newId()),
      (this.authCredentialListener = () => Promise.resolve()),
      (this.appCheckCredentialListener = () => Promise.resolve()),
      (this._uninitializedComponentsProvider = o),
      this.authCredentials.start(r, async (a) => {
        (D(bt, 'Received user=', a.uid), await this.authCredentialListener(a), (this.user = a));
      }),
      this.appCheckCredentials.start(
        r,
        (a) => (
          D(bt, 'Received new app check token=', a),
          this.appCheckCredentialListener(a, this.user)
        )
      ));
  }
  get configuration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this.databaseInfo,
      clientId: this.clientId,
      authCredentials: this.authCredentials,
      appCheckCredentials: this.appCheckCredentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100,
    };
  }
  setCredentialChangeListener(e) {
    this.authCredentialListener = e;
  }
  setAppCheckTokenChangeListener(e) {
    this.appCheckCredentialListener = e;
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const e = new et();
    return (
      this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
        try {
          (this._onlineComponents && (await this._onlineComponents.terminate()),
            this._offlineComponents && (await this._offlineComponents.terminate()),
            this.authCredentials.shutdown(),
            this.appCheckCredentials.shutdown(),
            e.resolve());
        } catch (t) {
          const r = Po(t, 'Failed to shutdown persistence');
          e.reject(r);
        }
      }),
      e.promise
    );
  }
}
async function bi(n, e) {
  (n.asyncQueue.verifyOperationInProgress(), D(bt, 'Initializing OfflineComponentProvider'));
  const t = n.configuration;
  await e.initialize(t);
  let r = t.initialUser;
  (n.setCredentialChangeListener(async (s) => {
    r.isEqual(s) || (await Ul(e.localStore, s), (r = s));
  }),
    e.persistence.setDatabaseDeletedListener(() => n.terminate()),
    (n._offlineComponents = e));
}
async function nu(n, e) {
  n.asyncQueue.verifyOperationInProgress();
  const t = await f_(n);
  (D(bt, 'Initializing OnlineComponentProvider'),
    await e.initialize(t, n.configuration),
    n.setCredentialChangeListener((r) => Yc(e.remoteStore, r)),
    n.setAppCheckTokenChangeListener((r, s) => Yc(e.remoteStore, s)),
    (n._onlineComponents = e));
}
async function f_(n) {
  if (!n._offlineComponents)
    if (n._uninitializedComponentsProvider) {
      D(bt, 'Using user provided OfflineComponentProvider');
      try {
        await bi(n, n._uninitializedComponentsProvider._offline);
      } catch (e) {
        const t = e;
        if (
          !(function (s) {
            return s.name === 'FirebaseError'
              ? s.code === S.FAILED_PRECONDITION || s.code === S.UNIMPLEMENTED
              : !(typeof DOMException < 'u' && s instanceof DOMException) ||
                  s.code === 22 ||
                  s.code === 20 ||
                  s.code === 11;
          })(t)
        )
          throw t;
        (er('Error using user provided cache. Falling back to memory cache: ' + t),
          await bi(n, new ds()));
      }
    } else (D(bt, 'Using default OfflineComponentProvider'), await bi(n, new h_(void 0)));
  return n._offlineComponents;
}
async function rh(n) {
  return (
    n._onlineComponents ||
      (n._uninitializedComponentsProvider
        ? (D(bt, 'Using user provided OnlineComponentProvider'),
          await nu(n, n._uninitializedComponentsProvider._online))
        : (D(bt, 'Using default OnlineComponentProvider'), await nu(n, new Ji()))),
    n._onlineComponents
  );
}
function p_(n) {
  return rh(n).then((e) => e.syncEngine);
}
async function fs(n) {
  const e = await rh(n),
    t = e.eventManager;
  return (
    (t.onListen = Jg.bind(null, e.syncEngine)),
    (t.onUnlisten = t_.bind(null, e.syncEngine)),
    (t.onFirstRemoteStoreListen = Zg.bind(null, e.syncEngine)),
    (t.onLastRemoteStoreUnlisten = n_.bind(null, e.syncEngine)),
    t
  );
}
function m_(n, e, t = {}) {
  const r = new et();
  return (
    n.asyncQueue.enqueueAndForget(async () =>
      (function (o, a, u, h, d) {
        const p = new Oo({
            next: (y) => {
              (p.Nu(), a.enqueueAndForget(() => bo(o, E)));
              const C = y.docs.has(u);
              !C && y.fromCache
                ? d.reject(
                    new k(S.UNAVAILABLE, 'Failed to get document because the client is offline.')
                  )
                : C && y.fromCache && h && h.source === 'server'
                  ? d.reject(
                      new k(
                        S.UNAVAILABLE,
                        'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)'
                      )
                    )
                  : d.resolve(y);
            },
            error: (y) => d.reject(y),
          }),
          E = new ko(Cs(u.path), p, { includeMetadataChanges: !0, qa: !0 });
        return Co(o, E);
      })(await fs(n), n.asyncQueue, e, t, r)
    ),
    r.promise
  );
}
function g_(n, e, t = {}) {
  const r = new et();
  return (
    n.asyncQueue.enqueueAndForget(async () =>
      (function (o, a, u, h, d) {
        const p = new Oo({
            next: (y) => {
              (p.Nu(),
                a.enqueueAndForget(() => bo(o, E)),
                y.fromCache && h.source === 'server'
                  ? d.reject(
                      new k(
                        S.UNAVAILABLE,
                        'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)'
                      )
                    )
                  : d.resolve(y));
            },
            error: (y) => d.reject(y),
          }),
          E = new ko(u, p, { includeMetadataChanges: !0, qa: !0 });
        return Co(o, E);
      })(await fs(n), n.asyncQueue, e, t, r)
    ),
    r.promise
  );
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function sh(n) {
  const e = {};
  return (n.timeoutSeconds !== void 0 && (e.timeoutSeconds = n.timeoutSeconds), e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ru = new Map();
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const __ = 'firestore.googleapis.com',
  su = !0;
class iu {
  constructor(e) {
    if (e.host === void 0) {
      if (e.ssl !== void 0)
        throw new k(S.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      ((this.host = __), (this.ssl = su));
    } else ((this.host = e.host), (this.ssl = e.ssl ?? su));
    if (
      ((this.isUsingEmulator = e.emulatorOptions !== void 0),
      (this.credentials = e.credentials),
      (this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties),
      (this.localCache = e.localCache),
      e.cacheSizeBytes === void 0)
    )
      this.cacheSizeBytes = Ll;
    else {
      if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < xl)
        throw new k(S.INVALID_ARGUMENT, 'cacheSizeBytes must be at least 1048576');
      this.cacheSizeBytes = e.cacheSizeBytes;
    }
    (kp(
      'experimentalForceLongPolling',
      e.experimentalForceLongPolling,
      'experimentalAutoDetectLongPolling',
      e.experimentalAutoDetectLongPolling
    ),
      (this.experimentalForceLongPolling = !!e.experimentalForceLongPolling),
      this.experimentalForceLongPolling
        ? (this.experimentalAutoDetectLongPolling = !1)
        : e.experimentalAutoDetectLongPolling === void 0
          ? (this.experimentalAutoDetectLongPolling = !0)
          : (this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling),
      (this.experimentalLongPollingOptions = sh(e.experimentalLongPollingOptions ?? {})),
      (function (r) {
        if (r.timeoutSeconds !== void 0) {
          if (isNaN(r.timeoutSeconds))
            throw new k(
              S.INVALID_ARGUMENT,
              `invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`
            );
          if (r.timeoutSeconds < 5)
            throw new k(
              S.INVALID_ARGUMENT,
              `invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`
            );
          if (r.timeoutSeconds > 30)
            throw new k(
              S.INVALID_ARGUMENT,
              `invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`
            );
        }
      })(this.experimentalLongPollingOptions),
      (this.useFetchStreams = !!e.useFetchStreams));
  }
  isEqual(e) {
    return (
      this.host === e.host &&
      this.ssl === e.ssl &&
      this.credentials === e.credentials &&
      this.cacheSizeBytes === e.cacheSizeBytes &&
      this.experimentalForceLongPolling === e.experimentalForceLongPolling &&
      this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling &&
      (function (r, s) {
        return r.timeoutSeconds === s.timeoutSeconds;
      })(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) &&
      this.ignoreUndefinedProperties === e.ignoreUndefinedProperties &&
      this.useFetchStreams === e.useFetchStreams
    );
  }
}
class Mo {
  constructor(e, t, r, s) {
    ((this._authCredentials = e),
      (this._appCheckCredentials = t),
      (this._databaseId = r),
      (this._app = s),
      (this.type = 'firestore-lite'),
      (this._persistenceKey = '(lite)'),
      (this._settings = new iu({})),
      (this._settingsFrozen = !1),
      (this._emulatorOptions = {}),
      (this._terminateTask = 'notTerminated'));
  }
  get app() {
    if (!this._app)
      throw new k(
        S.FAILED_PRECONDITION,
        "Firestore was not initialized using the Firebase SDK. 'app' is not available"
      );
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return this._terminateTask !== 'notTerminated';
  }
  _setSettings(e) {
    if (this._settingsFrozen)
      throw new k(
        S.FAILED_PRECONDITION,
        'Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.'
      );
    ((this._settings = new iu(e)),
      (this._emulatorOptions = e.emulatorOptions || {}),
      e.credentials !== void 0 &&
        (this._authCredentials = (function (r) {
          if (!r) return new vp();
          switch (r.type) {
            case 'firstParty':
              return new Rp(r.sessionIndex || '0', r.iamToken || null, r.authTokenFactory || null);
            case 'provider':
              return r.client;
            default:
              throw new k(
                S.INVALID_ARGUMENT,
                'makeAuthCredentialsProvider failed due to invalid credential type'
              );
          }
        })(e.credentials)));
  }
  _getSettings() {
    return this._settings;
  }
  _getEmulatorOptions() {
    return this._emulatorOptions;
  }
  _freezeSettings() {
    return ((this._settingsFrozen = !0), this._settings);
  }
  _delete() {
    return (
      this._terminateTask === 'notTerminated' && (this._terminateTask = this._terminate()),
      this._terminateTask
    );
  }
  async _restart() {
    this._terminateTask === 'notTerminated'
      ? await this._terminate()
      : (this._terminateTask = 'notTerminated');
  }
  toJSON() {
    return { app: this._app, databaseId: this._databaseId, settings: this._settings };
  }
  _terminate() {
    return (
      (function (t) {
        const r = ru.get(t);
        r && (D('ComponentProvider', 'Removing Datastore'), ru.delete(t), r.terminate());
      })(this),
      Promise.resolve()
    );
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class at {
  constructor(e, t, r) {
    ((this.converter = t), (this._query = r), (this.type = 'query'), (this.firestore = e));
  }
  withConverter(e) {
    return new at(this.firestore, e, this._query);
  }
}
class te {
  constructor(e, t, r) {
    ((this.converter = t), (this._key = r), (this.type = 'document'), (this.firestore = e));
  }
  get _path() {
    return this._key.path;
  }
  get id() {
    return this._key.path.lastSegment();
  }
  get path() {
    return this._key.path.canonicalString();
  }
  get parent() {
    return new wt(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(e) {
    return new te(this.firestore, e, this._key);
  }
  toJSON() {
    return { type: te._jsonSchemaVersion, referencePath: this._key.toString() };
  }
  static fromJSON(e, t, r) {
    if (dr(t, te._jsonSchema)) return new te(e, r || null, new M(Y.fromString(t.referencePath)));
  }
}
((te._jsonSchemaVersion = 'firestore/documentReference/1.0'),
  (te._jsonSchema = { type: oe('string', te._jsonSchemaVersion), referencePath: oe('string') }));
class wt extends at {
  constructor(e, t, r) {
    (super(e, t, Cs(r)), (this._path = r), (this.type = 'collection'));
  }
  get id() {
    return this._query.path.lastSegment();
  }
  get path() {
    return this._query.path.canonicalString();
  }
  get parent() {
    const e = this._path.popLast();
    return e.isEmpty() ? null : new te(this.firestore, null, new M(e));
  }
  withConverter(e) {
    return new wt(this.firestore, e, this._path);
  }
}
function $E(n, e, ...t) {
  if (((n = re(n)), Qu('collection', 'path', e), n instanceof Mo)) {
    const r = Y.fromString(e, ...t);
    return (yc(r), new wt(n, null, r));
  }
  {
    if (!(n instanceof te || n instanceof wt))
      throw new k(
        S.INVALID_ARGUMENT,
        'Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore'
      );
    const r = n._path.child(Y.fromString(e, ...t));
    return (yc(r), new wt(n.firestore, null, r));
  }
}
function y_(n, e, ...t) {
  if (
    ((n = re(n)), arguments.length === 1 && (e = oo.newId()), Qu('doc', 'path', e), n instanceof Mo)
  ) {
    const r = Y.fromString(e, ...t);
    return (_c(r), new te(n, null, new M(r)));
  }
  {
    if (!(n instanceof te || n instanceof wt))
      throw new k(
        S.INVALID_ARGUMENT,
        'Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore'
      );
    const r = n._path.child(Y.fromString(e, ...t));
    return (_c(r), new te(n.firestore, n instanceof wt ? n.converter : null, new M(r)));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ou = 'AsyncQueue';
class au {
  constructor(e = Promise.resolve()) {
    ((this.Xu = []),
      (this.ec = !1),
      (this.tc = []),
      (this.nc = null),
      (this.rc = !1),
      (this.sc = !1),
      (this.oc = []),
      (this.M_ = new ql(this, 'async_queue_retry')),
      (this._c = () => {
        const r = Ci();
        (r && D(ou, 'Visibility state changed to ' + r.visibilityState), this.M_.w_());
      }),
      (this.ac = e));
    const t = Ci();
    t && typeof t.addEventListener == 'function' && t.addEventListener('visibilitychange', this._c);
  }
  get isShuttingDown() {
    return this.ec;
  }
  enqueueAndForget(e) {
    this.enqueue(e);
  }
  enqueueAndForgetEvenWhileRestricted(e) {
    (this.uc(), this.cc(e));
  }
  enterRestrictedMode(e) {
    if (!this.ec) {
      ((this.ec = !0), (this.sc = e || !1));
      const t = Ci();
      t &&
        typeof t.removeEventListener == 'function' &&
        t.removeEventListener('visibilitychange', this._c);
    }
  }
  enqueue(e) {
    if ((this.uc(), this.ec)) return new Promise(() => {});
    const t = new et();
    return this.cc(() =>
      this.ec && this.sc ? Promise.resolve() : (e().then(t.resolve, t.reject), t.promise)
    ).then(() => t.promise);
  }
  enqueueRetryable(e) {
    this.enqueueAndForget(() => (this.Xu.push(e), this.lc()));
  }
  async lc() {
    if (this.Xu.length !== 0) {
      try {
        (await this.Xu[0](), this.Xu.shift(), this.M_.reset());
      } catch (e) {
        if (!In(e)) throw e;
        D(ou, 'Operation failed with retryable error: ' + e);
      }
      this.Xu.length > 0 && this.M_.p_(() => this.lc());
    }
  }
  cc(e) {
    const t = this.ac.then(
      () => (
        (this.rc = !0),
        e()
          .catch((r) => {
            throw ((this.nc = r), (this.rc = !1), nt('INTERNAL UNHANDLED ERROR: ', cu(r)), r);
          })
          .then((r) => ((this.rc = !1), r))
      )
    );
    return ((this.ac = t), t);
  }
  enqueueAfterDelay(e, t, r) {
    (this.uc(), this.oc.indexOf(e) > -1 && (t = 0));
    const s = So.createAndSchedule(this, e, t, r, (o) => this.hc(o));
    return (this.tc.push(s), s);
  }
  uc() {
    this.nc && x(47125, { Pc: cu(this.nc) });
  }
  verifyOperationInProgress() {}
  async Tc() {
    let e;
    do ((e = this.ac), await e);
    while (e !== this.ac);
  }
  Ic(e) {
    for (const t of this.tc) if (t.timerId === e) return !0;
    return !1;
  }
  Ec(e) {
    return this.Tc().then(() => {
      this.tc.sort((t, r) => t.targetTimeMs - r.targetTimeMs);
      for (const t of this.tc) if ((t.skipDelay(), e !== 'all' && t.timerId === e)) break;
      return this.Tc();
    });
  }
  dc(e) {
    this.oc.push(e);
  }
  hc(e) {
    const t = this.tc.indexOf(e);
    this.tc.splice(t, 1);
  }
}
function cu(n) {
  let e = n.message || '';
  return (
    n.stack &&
      (e = n.stack.includes(n.message)
        ? n.stack
        : n.message +
          `
` +
          n.stack),
    e
  );
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function uu(n) {
  return (function (t, r) {
    if (typeof t != 'object' || t === null) return !1;
    const s = t;
    for (const o of r) if (o in s && typeof s[o] == 'function') return !0;
    return !1;
  })(n, ['next', 'error', 'complete']);
}
class st extends Mo {
  constructor(e, t, r, s) {
    (super(e, t, r, s),
      (this.type = 'firestore'),
      (this._queue = new au()),
      (this._persistenceKey = s?.name || '[DEFAULT]'));
  }
  async _terminate() {
    if (this._firestoreClient) {
      const e = this._firestoreClient.terminate();
      ((this._queue = new au(e)), (this._firestoreClient = void 0), await e);
    }
  }
}
function zE(n, e, t) {
  t || (t = ss);
  const r = so(n, 'firestore');
  if (r.isInitialized(t)) {
    const s = r.getImmediate({ identifier: t }),
      o = r.getOptions(t);
    if (qt(o, e)) return s;
    throw new k(
      S.FAILED_PRECONDITION,
      'initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.'
    );
  }
  if (e.cacheSizeBytes !== void 0 && e.localCache !== void 0)
    throw new k(
      S.INVALID_ARGUMENT,
      'cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object'
    );
  if (e.cacheSizeBytes !== void 0 && e.cacheSizeBytes !== -1 && e.cacheSizeBytes < xl)
    throw new k(S.INVALID_ARGUMENT, 'cacheSizeBytes must be at least 1048576');
  return (e.host && gn(e.host) && xu(e.host), r.initialize({ options: e, instanceIdentifier: t }));
}
function xs(n) {
  if (n._terminated) throw new k(S.FAILED_PRECONDITION, 'The client has already been terminated.');
  return (n._firestoreClient || E_(n), n._firestoreClient);
}
function E_(n) {
  const e = n._freezeSettings(),
    t = (function (s, o, a, u) {
      return new $p(
        s,
        o,
        a,
        u.host,
        u.ssl,
        u.experimentalForceLongPolling,
        u.experimentalAutoDetectLongPolling,
        sh(u.experimentalLongPollingOptions),
        u.useFetchStreams,
        u.isUsingEmulator
      );
    })(n._databaseId, n._app?.options.appId || '', n._persistenceKey, e);
  (n._componentsProvider ||
    (e.localCache?._offlineComponentProvider &&
      e.localCache?._onlineComponentProvider &&
      (n._componentsProvider = {
        _offline: e.localCache._offlineComponentProvider,
        _online: e.localCache._onlineComponentProvider,
      })),
    (n._firestoreClient = new d_(
      n._authCredentials,
      n._appCheckCredentials,
      n._queue,
      t,
      n._componentsProvider &&
        (function (s) {
          const o = s?._online.build();
          return { _offline: s?._offline.build(o), _online: o };
        })(n._componentsProvider)
    )));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ke {
  constructor(e) {
    this._byteString = e;
  }
  static fromBase64String(e) {
    try {
      return new ke(fe.fromBase64String(e));
    } catch (t) {
      throw new k(S.INVALID_ARGUMENT, 'Failed to construct data from Base64 string: ' + t);
    }
  }
  static fromUint8Array(e) {
    return new ke(fe.fromUint8Array(e));
  }
  toBase64() {
    return this._byteString.toBase64();
  }
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  toString() {
    return 'Bytes(base64: ' + this.toBase64() + ')';
  }
  isEqual(e) {
    return this._byteString.isEqual(e._byteString);
  }
  toJSON() {
    return { type: ke._jsonSchemaVersion, bytes: this.toBase64() };
  }
  static fromJSON(e) {
    if (dr(e, ke._jsonSchema)) return ke.fromBase64String(e.bytes);
  }
}
((ke._jsonSchemaVersion = 'firestore/bytes/1.0'),
  (ke._jsonSchema = { type: oe('string', ke._jsonSchemaVersion), bytes: oe('string') }));
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Fs {
  constructor(...e) {
    for (let t = 0; t < e.length; ++t)
      if (e[t].length === 0)
        throw new k(
          S.INVALID_ARGUMENT,
          'Invalid field name at argument $(i + 1). Field names must not be empty.'
        );
    this._internalPath = new de(e);
  }
  isEqual(e) {
    return this._internalPath.isEqual(e._internalPath);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Us {
  constructor(e) {
    this._methodName = e;
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class $e {
  constructor(e, t) {
    if (!isFinite(e) || e < -90 || e > 90)
      throw new k(
        S.INVALID_ARGUMENT,
        'Latitude must be a number between -90 and 90, but was: ' + e
      );
    if (!isFinite(t) || t < -180 || t > 180)
      throw new k(
        S.INVALID_ARGUMENT,
        'Longitude must be a number between -180 and 180, but was: ' + t
      );
    ((this._lat = e), (this._long = t));
  }
  get latitude() {
    return this._lat;
  }
  get longitude() {
    return this._long;
  }
  isEqual(e) {
    return this._lat === e._lat && this._long === e._long;
  }
  _compareTo(e) {
    return j(this._lat, e._lat) || j(this._long, e._long);
  }
  toJSON() {
    return { latitude: this._lat, longitude: this._long, type: $e._jsonSchemaVersion };
  }
  static fromJSON(e) {
    if (dr(e, $e._jsonSchema)) return new $e(e.latitude, e.longitude);
  }
}
(($e._jsonSchemaVersion = 'firestore/geoPoint/1.0'),
  ($e._jsonSchema = {
    type: oe('string', $e._jsonSchemaVersion),
    latitude: oe('number'),
    longitude: oe('number'),
  }));
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ze {
  constructor(e) {
    this._values = (e || []).map((t) => t);
  }
  toArray() {
    return this._values.map((e) => e);
  }
  isEqual(e) {
    return (function (r, s) {
      if (r.length !== s.length) return !1;
      for (let o = 0; o < r.length; ++o) if (r[o] !== s[o]) return !1;
      return !0;
    })(this._values, e._values);
  }
  toJSON() {
    return { type: ze._jsonSchemaVersion, vectorValues: this._values };
  }
  static fromJSON(e) {
    if (dr(e, ze._jsonSchema)) {
      if (Array.isArray(e.vectorValues) && e.vectorValues.every((t) => typeof t == 'number'))
        return new ze(e.vectorValues);
      throw new k(S.INVALID_ARGUMENT, "Expected 'vectorValues' field to be a number array");
    }
  }
}
((ze._jsonSchemaVersion = 'firestore/vectorValue/1.0'),
  (ze._jsonSchema = { type: oe('string', ze._jsonSchemaVersion), vectorValues: oe('object') }));
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const I_ = /^__.*__$/;
class T_ {
  constructor(e, t, r) {
    ((this.data = e), (this.fieldMask = t), (this.fieldTransforms = r));
  }
  toMutation(e, t) {
    return this.fieldMask !== null
      ? new kt(e, this.data, this.fieldMask, t, this.fieldTransforms)
      : new fr(e, this.data, t, this.fieldTransforms);
  }
}
class ih {
  constructor(e, t, r) {
    ((this.data = e), (this.fieldMask = t), (this.fieldTransforms = r));
  }
  toMutation(e, t) {
    return new kt(e, this.data, this.fieldMask, t, this.fieldTransforms);
  }
}
function oh(n) {
  switch (n) {
    case 0:
    case 2:
    case 1:
      return !0;
    case 3:
    case 4:
      return !1;
    default:
      throw x(40011, { Ac: n });
  }
}
class Lo {
  constructor(e, t, r, s, o, a) {
    ((this.settings = e),
      (this.databaseId = t),
      (this.serializer = r),
      (this.ignoreUndefinedProperties = s),
      o === void 0 && this.Rc(),
      (this.fieldTransforms = o || []),
      (this.fieldMask = a || []));
  }
  get path() {
    return this.settings.path;
  }
  get Ac() {
    return this.settings.Ac;
  }
  Vc(e) {
    return new Lo(
      { ...this.settings, ...e },
      this.databaseId,
      this.serializer,
      this.ignoreUndefinedProperties,
      this.fieldTransforms,
      this.fieldMask
    );
  }
  mc(e) {
    const t = this.path?.child(e),
      r = this.Vc({ path: t, fc: !1 });
    return (r.gc(e), r);
  }
  yc(e) {
    const t = this.path?.child(e),
      r = this.Vc({ path: t, fc: !1 });
    return (r.Rc(), r);
  }
  wc(e) {
    return this.Vc({ path: void 0, fc: !0 });
  }
  Sc(e) {
    return ps(e, this.settings.methodName, this.settings.bc || !1, this.path, this.settings.Dc);
  }
  contains(e) {
    return (
      this.fieldMask.find((t) => e.isPrefixOf(t)) !== void 0 ||
      this.fieldTransforms.find((t) => e.isPrefixOf(t.field)) !== void 0
    );
  }
  Rc() {
    if (this.path) for (let e = 0; e < this.path.length; e++) this.gc(this.path.get(e));
  }
  gc(e) {
    if (e.length === 0) throw this.Sc('Document fields must not be empty');
    if (oh(this.Ac) && I_.test(e)) throw this.Sc('Document fields cannot begin and end with "__"');
  }
}
class v_ {
  constructor(e, t, r) {
    ((this.databaseId = e), (this.ignoreUndefinedProperties = t), (this.serializer = r || Os(e)));
  }
  Cc(e, t, r, s = !1) {
    return new Lo(
      { Ac: e, methodName: t, Dc: r, path: de.emptyPath(), fc: !1, bc: s },
      this.databaseId,
      this.serializer,
      this.ignoreUndefinedProperties
    );
  }
}
function Bs(n) {
  const e = n._freezeSettings(),
    t = Os(n._databaseId);
  return new v_(n._databaseId, !!e.ignoreUndefinedProperties, t);
}
function ah(n, e, t, r, s, o = {}) {
  const a = n.Cc(o.merge || o.mergeFields ? 2 : 0, e, t, s);
  Fo('Data must be an object, but it was:', a, r);
  const u = ch(r, a);
  let h, d;
  if (o.merge) ((h = new be(a.fieldMask)), (d = a.fieldTransforms));
  else if (o.mergeFields) {
    const p = [];
    for (const E of o.mergeFields) {
      const y = Zi(e, E, t);
      if (!a.contains(y))
        throw new k(
          S.INVALID_ARGUMENT,
          `Field '${y}' is specified in your field mask but missing from your input data.`
        );
      lh(p, y) || p.push(y);
    }
    ((h = new be(p)), (d = a.fieldTransforms.filter((E) => h.covers(E.field))));
  } else ((h = null), (d = a.fieldTransforms));
  return new T_(new Pe(u), h, d);
}
class qs extends Us {
  _toFieldTransform(e) {
    if (e.Ac !== 2)
      throw e.Ac === 1
        ? e.Sc(`${this._methodName}() can only appear at the top level of your update data`)
        : e.Sc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
    return (e.fieldMask.push(e.path), null);
  }
  isEqual(e) {
    return e instanceof qs;
  }
}
class xo extends Us {
  _toFieldTransform(e) {
    return new mm(e.path, new or());
  }
  isEqual(e) {
    return e instanceof xo;
  }
}
function w_(n, e, t, r) {
  const s = n.Cc(1, e, t);
  Fo('Data must be an object, but it was:', s, r);
  const o = [],
    a = Pe.empty();
  Vt(r, (h, d) => {
    const p = Uo(e, h, t);
    d = re(d);
    const E = s.yc(p);
    if (d instanceof qs) o.push(p);
    else {
      const y = _r(d, E);
      y != null && (o.push(p), a.set(p, y));
    }
  });
  const u = new be(o);
  return new ih(a, u, s.fieldTransforms);
}
function A_(n, e, t, r, s, o) {
  const a = n.Cc(1, e, t),
    u = [Zi(e, r, t)],
    h = [s];
  if (o.length % 2 != 0)
    throw new k(
      S.INVALID_ARGUMENT,
      `Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`
    );
  for (let y = 0; y < o.length; y += 2) (u.push(Zi(e, o[y])), h.push(o[y + 1]));
  const d = [],
    p = Pe.empty();
  for (let y = u.length - 1; y >= 0; --y)
    if (!lh(d, u[y])) {
      const C = u[y];
      let b = h[y];
      b = re(b);
      const O = a.yc(C);
      if (b instanceof qs) d.push(C);
      else {
        const N = _r(b, O);
        N != null && (d.push(C), p.set(C, N));
      }
    }
  const E = new be(d);
  return new ih(p, E, a.fieldTransforms);
}
function R_(n, e, t, r = !1) {
  return _r(t, n.Cc(r ? 4 : 3, e));
}
function _r(n, e) {
  if (uh((n = re(n)))) return (Fo('Unsupported field value:', e, n), ch(n, e));
  if (n instanceof Us)
    return (
      (function (r, s) {
        if (!oh(s.Ac)) throw s.Sc(`${r._methodName}() can only be used with update() and set()`);
        if (!s.path) throw s.Sc(`${r._methodName}() is not currently supported inside arrays`);
        const o = r._toFieldTransform(s);
        o && s.fieldTransforms.push(o);
      })(n, e),
      null
    );
  if (n === void 0 && e.ignoreUndefinedProperties) return null;
  if ((e.path && e.fieldMask.push(e.path), n instanceof Array)) {
    if (e.settings.fc && e.Ac !== 4) throw e.Sc('Nested arrays are not supported');
    return (function (r, s) {
      const o = [];
      let a = 0;
      for (const u of r) {
        let h = _r(u, s.wc(a));
        (h == null && (h = { nullValue: 'NULL_VALUE' }), o.push(h), a++);
      }
      return { arrayValue: { values: o } };
    })(n, e);
  }
  return (function (r, s) {
    if ((r = re(r)) === null) return { nullValue: 'NULL_VALUE' };
    if (typeof r == 'number') return dm(s.serializer, r);
    if (typeof r == 'boolean') return { booleanValue: r };
    if (typeof r == 'string') return { stringValue: r };
    if (r instanceof Date) {
      const o = J.fromDate(r);
      return { timestampValue: us(s.serializer, o) };
    }
    if (r instanceof J) {
      const o = new J(r.seconds, 1e3 * Math.floor(r.nanoseconds / 1e3));
      return { timestampValue: us(s.serializer, o) };
    }
    if (r instanceof $e) return { geoPointValue: { latitude: r.latitude, longitude: r.longitude } };
    if (r instanceof ke) return { bytesValue: bl(s.serializer, r._byteString) };
    if (r instanceof te) {
      const o = s.databaseId,
        a = r.firestore._databaseId;
      if (!a.isEqual(o))
        throw s.Sc(
          `Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`
        );
      return { referenceValue: _o(r.firestore._databaseId || s.databaseId, r._key.path) };
    }
    if (r instanceof ze)
      return (function (a, u) {
        return {
          mapValue: {
            fields: {
              [sl]: { stringValue: il },
              [is]: {
                arrayValue: {
                  values: a.toArray().map((d) => {
                    if (typeof d != 'number')
                      throw u.Sc('VectorValues must only contain numeric values.');
                    return fo(u.serializer, d);
                  }),
                },
              },
            },
          },
        };
      })(r, s);
    throw s.Sc(`Unsupported field value: ${As(r)}`);
  })(n, e);
}
function ch(n, e) {
  const t = {};
  return (
    Ju(n)
      ? e.path && e.path.length > 0 && e.fieldMask.push(e.path)
      : Vt(n, (r, s) => {
          const o = _r(s, e.mc(r));
          o != null && (t[r] = o);
        }),
    { mapValue: { fields: t } }
  );
}
function uh(n) {
  return !(
    typeof n != 'object' ||
    n === null ||
    n instanceof Array ||
    n instanceof Date ||
    n instanceof J ||
    n instanceof $e ||
    n instanceof ke ||
    n instanceof te ||
    n instanceof Us ||
    n instanceof ze
  );
}
function Fo(n, e, t) {
  if (!uh(t) || !Yu(t)) {
    const r = As(t);
    throw r === 'an object' ? e.Sc(n + ' a custom object') : e.Sc(n + ' ' + r);
  }
}
function Zi(n, e, t) {
  if ((e = re(e)) instanceof Fs) return e._internalPath;
  if (typeof e == 'string') return Uo(n, e);
  throw ps('Field path arguments must be of type string or ', n, !1, void 0, t);
}
const S_ = new RegExp('[~\\*/\\[\\]]');
function Uo(n, e, t) {
  if (e.search(S_) >= 0)
    throw ps(
      `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
      n,
      !1,
      void 0,
      t
    );
  try {
    return new Fs(...e.split('.'))._internalPath;
  } catch {
    throw ps(
      `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      n,
      !1,
      void 0,
      t
    );
  }
}
function ps(n, e, t, r, s) {
  const o = r && !r.isEmpty(),
    a = s !== void 0;
  let u = `Function ${e}() called with invalid data`;
  (t && (u += ' (via `toFirestore()`)'), (u += '. '));
  let h = '';
  return (
    (o || a) &&
      ((h += ' (found'), o && (h += ` in field ${r}`), a && (h += ` in document ${s}`), (h += ')')),
    new k(S.INVALID_ARGUMENT, u + n + h)
  );
}
function lh(n, e) {
  return n.some((t) => t.isEqual(e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class hh {
  constructor(e, t, r, s, o) {
    ((this._firestore = e),
      (this._userDataWriter = t),
      (this._key = r),
      (this._document = s),
      (this._converter = o));
  }
  get id() {
    return this._key.path.lastSegment();
  }
  get ref() {
    return new te(this._firestore, this._converter, this._key);
  }
  exists() {
    return this._document !== null;
  }
  data() {
    if (this._document) {
      if (this._converter) {
        const e = new P_(this._firestore, this._userDataWriter, this._key, this._document, null);
        return this._converter.fromFirestore(e);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  get(e) {
    if (this._document) {
      const t = this._document.data.field(js('DocumentSnapshot.get', e));
      if (t !== null) return this._userDataWriter.convertValue(t);
    }
  }
}
class P_ extends hh {
  data() {
    return super.data();
  }
}
function js(n, e) {
  return typeof e == 'string'
    ? Uo(n, e)
    : e instanceof Fs
      ? e._internalPath
      : e._delegate._internalPath;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function dh(n) {
  if (n.limitType === 'L' && n.explicitOrderBy.length === 0)
    throw new k(
      S.UNIMPLEMENTED,
      'limitToLast() queries require specifying at least one orderBy() clause'
    );
}
class Bo {}
class qo extends Bo {}
function HE(n, e, ...t) {
  let r = [];
  (e instanceof Bo && r.push(e),
    (r = r.concat(t)),
    (function (o) {
      const a = o.filter((h) => h instanceof jo).length,
        u = o.filter((h) => h instanceof $s).length;
      if (a > 1 || (a > 0 && u > 0))
        throw new k(
          S.INVALID_ARGUMENT,
          'InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.'
        );
    })(r));
  for (const s of r) n = s._apply(n);
  return n;
}
class $s extends qo {
  constructor(e, t, r) {
    (super(), (this._field = e), (this._op = t), (this._value = r), (this.type = 'where'));
  }
  static _create(e, t, r) {
    return new $s(e, t, r);
  }
  _apply(e) {
    const t = this._parse(e);
    return (fh(e._query, t), new at(e.firestore, e.converter, $i(e._query, t)));
  }
  _parse(e) {
    const t = Bs(e.firestore);
    return (function (o, a, u, h, d, p, E) {
      let y;
      if (d.isKeyField()) {
        if (p === 'array-contains' || p === 'array-contains-any')
          throw new k(
            S.INVALID_ARGUMENT,
            `Invalid Query. You can't perform '${p}' queries on documentId().`
          );
        if (p === 'in' || p === 'not-in') {
          hu(E, p);
          const b = [];
          for (const O of E) b.push(lu(h, o, O));
          y = { arrayValue: { values: b } };
        } else y = lu(h, o, E);
      } else
        ((p !== 'in' && p !== 'not-in' && p !== 'array-contains-any') || hu(E, p),
          (y = R_(u, a, E, p === 'in' || p === 'not-in')));
      return ie.create(d, p, y);
    })(e._query, 'where', t, e.firestore._databaseId, this._field, this._op, this._value);
  }
}
function WE(n, e, t) {
  const r = e,
    s = js('where', n);
  return $s._create(s, r, t);
}
class jo extends Bo {
  constructor(e, t) {
    (super(), (this.type = e), (this._queryConstraints = t));
  }
  static _create(e, t) {
    return new jo(e, t);
  }
  _parse(e) {
    const t = this._queryConstraints
      .map((r) => r._parse(e))
      .filter((r) => r.getFilters().length > 0);
    return t.length === 1 ? t[0] : Fe.create(t, this._getOperator());
  }
  _apply(e) {
    const t = this._parse(e);
    return t.getFilters().length === 0
      ? e
      : ((function (s, o) {
          let a = s;
          const u = o.getFlattenedFilters();
          for (const h of u) (fh(a, h), (a = $i(a, h)));
        })(e._query, t),
        new at(e.firestore, e.converter, $i(e._query, t)));
  }
  _getQueryConstraints() {
    return this._queryConstraints;
  }
  _getOperator() {
    return this.type === 'and' ? 'and' : 'or';
  }
}
class $o extends qo {
  constructor(e, t) {
    (super(), (this._field = e), (this._direction = t), (this.type = 'orderBy'));
  }
  static _create(e, t) {
    return new $o(e, t);
  }
  _apply(e) {
    const t = (function (s, o, a) {
      if (s.startAt !== null)
        throw new k(
          S.INVALID_ARGUMENT,
          'Invalid query. You must not call startAt() or startAfter() before calling orderBy().'
        );
      if (s.endAt !== null)
        throw new k(
          S.INVALID_ARGUMENT,
          'Invalid query. You must not call endAt() or endBefore() before calling orderBy().'
        );
      return new ir(o, a);
    })(e._query, this._field, this._direction);
    return new at(
      e.firestore,
      e.converter,
      (function (s, o) {
        const a = s.explicitOrderBy.concat([o]);
        return new Tn(
          s.path,
          s.collectionGroup,
          a,
          s.filters.slice(),
          s.limit,
          s.limitType,
          s.startAt,
          s.endAt
        );
      })(e._query, t)
    );
  }
}
function GE(n, e = 'asc') {
  const t = e,
    r = js('orderBy', n);
  return $o._create(r, t);
}
class zo extends qo {
  constructor(e, t, r) {
    (super(), (this.type = e), (this._limit = t), (this._limitType = r));
  }
  static _create(e, t, r) {
    return new zo(e, t, r);
  }
  _apply(e) {
    return new at(e.firestore, e.converter, as(e._query, this._limit, this._limitType));
  }
}
function KE(n) {
  return (Np('limit', n), zo._create('limit', n, 'F'));
}
function lu(n, e, t) {
  if (typeof (t = re(t)) == 'string') {
    if (t === '')
      throw new k(
        S.INVALID_ARGUMENT,
        'Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.'
      );
    if (!fl(e) && t.indexOf('/') !== -1)
      throw new k(
        S.INVALID_ARGUMENT,
        `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`
      );
    const r = e.path.child(Y.fromString(t));
    if (!M.isDocumentKey(r))
      throw new k(
        S.INVALID_ARGUMENT,
        `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`
      );
    return Sc(n, new M(r));
  }
  if (t instanceof te) return Sc(n, t._key);
  throw new k(
    S.INVALID_ARGUMENT,
    `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${As(t)}.`
  );
}
function hu(n, e) {
  if (!Array.isArray(n) || n.length === 0)
    throw new k(
      S.INVALID_ARGUMENT,
      `Invalid Query. A non-empty array is required for '${e.toString()}' filters.`
    );
}
function fh(n, e) {
  const t = (function (s, o) {
    for (const a of s)
      for (const u of a.getFlattenedFilters()) if (o.indexOf(u.op) >= 0) return u.op;
    return null;
  })(
    n.filters,
    (function (s) {
      switch (s) {
        case '!=':
          return ['!=', 'not-in'];
        case 'array-contains-any':
        case 'in':
          return ['not-in'];
        case 'not-in':
          return ['array-contains-any', 'in', 'not-in', '!='];
        default:
          return [];
      }
    })(e.op)
  );
  if (t !== null)
    throw t === e.op
      ? new k(
          S.INVALID_ARGUMENT,
          `Invalid query. You cannot use more than one '${e.op.toString()}' filter.`
        )
      : new k(
          S.INVALID_ARGUMENT,
          `Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`
        );
}
class C_ {
  convertValue(e, t = 'none') {
    switch (Pt(e)) {
      case 0:
        return null;
      case 1:
        return e.booleanValue;
      case 2:
        return ne(e.integerValue || e.doubleValue);
      case 3:
        return this.convertTimestamp(e.timestampValue);
      case 4:
        return this.convertServerTimestamp(e, t);
      case 5:
        return e.stringValue;
      case 6:
        return this.convertBytes(St(e.bytesValue));
      case 7:
        return this.convertReference(e.referenceValue);
      case 8:
        return this.convertGeoPoint(e.geoPointValue);
      case 9:
        return this.convertArray(e.arrayValue, t);
      case 11:
        return this.convertObject(e.mapValue, t);
      case 10:
        return this.convertVectorValue(e.mapValue);
      default:
        throw x(62114, { value: e });
    }
  }
  convertObject(e, t) {
    return this.convertObjectMap(e.fields, t);
  }
  convertObjectMap(e, t = 'none') {
    const r = {};
    return (
      Vt(e, (s, o) => {
        r[s] = this.convertValue(o, t);
      }),
      r
    );
  }
  convertVectorValue(e) {
    const t = e.fields?.[is].arrayValue?.values?.map((r) => ne(r.doubleValue));
    return new ze(t);
  }
  convertGeoPoint(e) {
    return new $e(ne(e.latitude), ne(e.longitude));
  }
  convertArray(e, t) {
    return (e.values || []).map((r) => this.convertValue(r, t));
  }
  convertServerTimestamp(e, t) {
    switch (t) {
      case 'previous':
        const r = Ps(e);
        return r == null ? null : this.convertValue(r, t);
      case 'estimate':
        return this.convertTimestamp(nr(e));
      default:
        return null;
    }
  }
  convertTimestamp(e) {
    const t = Rt(e);
    return new J(t.seconds, t.nanos);
  }
  convertDocumentKey(e, t) {
    const r = Y.fromString(e);
    K(Ml(r), 9688, { name: e });
    const s = new rr(r.get(1), r.get(3)),
      o = new M(r.popFirst(5));
    return (
      s.isEqual(t) ||
        nt(
          `Document ${o} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`
        ),
      o
    );
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function ph(n, e, t) {
  let r;
  return (
    (r = n ? (t && (t.merge || t.mergeFields) ? n.toFirestore(e, t) : n.toFirestore(e)) : e),
    r
  );
}
class Hn {
  constructor(e, t) {
    ((this.hasPendingWrites = e), (this.fromCache = t));
  }
  isEqual(e) {
    return this.hasPendingWrites === e.hasPendingWrites && this.fromCache === e.fromCache;
  }
}
class Ut extends hh {
  constructor(e, t, r, s, o, a) {
    (super(e, t, r, s, a), (this._firestore = e), (this._firestoreImpl = e), (this.metadata = o));
  }
  exists() {
    return super.exists();
  }
  data(e = {}) {
    if (this._document) {
      if (this._converter) {
        const t = new Jr(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          this.metadata,
          null
        );
        return this._converter.fromFirestore(t, e);
      }
      return this._userDataWriter.convertValue(this._document.data.value, e.serverTimestamps);
    }
  }
  get(e, t = {}) {
    if (this._document) {
      const r = this._document.data.field(js('DocumentSnapshot.get', e));
      if (r !== null) return this._userDataWriter.convertValue(r, t.serverTimestamps);
    }
  }
  toJSON() {
    if (this.metadata.hasPendingWrites)
      throw new k(
        S.FAILED_PRECONDITION,
        'DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().'
      );
    const e = this._document,
      t = {};
    return (
      (t.type = Ut._jsonSchemaVersion),
      (t.bundle = ''),
      (t.bundleSource = 'DocumentSnapshot'),
      (t.bundleName = this._key.toString()),
      !e || !e.isValidDocument() || !e.isFoundDocument()
        ? t
        : (this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields, 'previous'),
          (t.bundle = (this._firestore, this.ref.path, 'NOT SUPPORTED')),
          t)
    );
  }
}
((Ut._jsonSchemaVersion = 'firestore/documentSnapshot/1.0'),
  (Ut._jsonSchema = {
    type: oe('string', Ut._jsonSchemaVersion),
    bundleSource: oe('string', 'DocumentSnapshot'),
    bundleName: oe('string'),
    bundle: oe('string'),
  }));
class Jr extends Ut {
  data(e = {}) {
    return super.data(e);
  }
}
class Bt {
  constructor(e, t, r, s) {
    ((this._firestore = e),
      (this._userDataWriter = t),
      (this._snapshot = s),
      (this.metadata = new Hn(s.hasPendingWrites, s.fromCache)),
      (this.query = r));
  }
  get docs() {
    const e = [];
    return (this.forEach((t) => e.push(t)), e);
  }
  get size() {
    return this._snapshot.docs.size;
  }
  get empty() {
    return this.size === 0;
  }
  forEach(e, t) {
    this._snapshot.docs.forEach((r) => {
      e.call(
        t,
        new Jr(
          this._firestore,
          this._userDataWriter,
          r.key,
          r,
          new Hn(this._snapshot.mutatedKeys.has(r.key), this._snapshot.fromCache),
          this.query.converter
        )
      );
    });
  }
  docChanges(e = {}) {
    const t = !!e.includeMetadataChanges;
    if (t && this._snapshot.excludesMetadataChanges)
      throw new k(
        S.INVALID_ARGUMENT,
        'To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().'
      );
    return (
      (this._cachedChanges && this._cachedChangesIncludeMetadataChanges === t) ||
        ((this._cachedChanges = (function (s, o) {
          if (s._snapshot.oldDocs.isEmpty()) {
            let a = 0;
            return s._snapshot.docChanges.map((u) => {
              const h = new Jr(
                s._firestore,
                s._userDataWriter,
                u.doc.key,
                u.doc,
                new Hn(s._snapshot.mutatedKeys.has(u.doc.key), s._snapshot.fromCache),
                s.query.converter
              );
              return (u.doc, { type: 'added', doc: h, oldIndex: -1, newIndex: a++ });
            });
          }
          {
            let a = s._snapshot.oldDocs;
            return s._snapshot.docChanges
              .filter((u) => o || u.type !== 3)
              .map((u) => {
                const h = new Jr(
                  s._firestore,
                  s._userDataWriter,
                  u.doc.key,
                  u.doc,
                  new Hn(s._snapshot.mutatedKeys.has(u.doc.key), s._snapshot.fromCache),
                  s.query.converter
                );
                let d = -1,
                  p = -1;
                return (
                  u.type !== 0 && ((d = a.indexOf(u.doc.key)), (a = a.delete(u.doc.key))),
                  u.type !== 1 && ((a = a.add(u.doc)), (p = a.indexOf(u.doc.key))),
                  { type: b_(u.type), doc: h, oldIndex: d, newIndex: p }
                );
              });
          }
        })(this, t)),
        (this._cachedChangesIncludeMetadataChanges = t)),
      this._cachedChanges
    );
  }
  toJSON() {
    if (this.metadata.hasPendingWrites)
      throw new k(
        S.FAILED_PRECONDITION,
        'QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().'
      );
    const e = {};
    ((e.type = Bt._jsonSchemaVersion),
      (e.bundleSource = 'QuerySnapshot'),
      (e.bundleName = oo.newId()),
      this._firestore._databaseId.database,
      this._firestore._databaseId.projectId);
    const t = [],
      r = [],
      s = [];
    return (
      this.docs.forEach((o) => {
        o._document !== null &&
          (t.push(o._document),
          r.push(
            this._userDataWriter.convertObjectMap(
              o._document.data.value.mapValue.fields,
              'previous'
            )
          ),
          s.push(o.ref.path));
      }),
      (e.bundle = (this._firestore, this.query._query, e.bundleName, 'NOT SUPPORTED')),
      e
    );
  }
}
function b_(n) {
  switch (n) {
    case 0:
      return 'added';
    case 2:
    case 3:
      return 'modified';
    case 1:
      return 'removed';
    default:
      return x(61501, { type: n });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function QE(n) {
  n = Ve(n, te);
  const e = Ve(n.firestore, st);
  return m_(xs(e), n._key).then((t) => mh(e, n, t));
}
((Bt._jsonSchemaVersion = 'firestore/querySnapshot/1.0'),
  (Bt._jsonSchema = {
    type: oe('string', Bt._jsonSchemaVersion),
    bundleSource: oe('string', 'QuerySnapshot'),
    bundleName: oe('string'),
    bundle: oe('string'),
  }));
class Ho extends C_ {
  constructor(e) {
    (super(), (this.firestore = e));
  }
  convertBytes(e) {
    return new ke(e);
  }
  convertReference(e) {
    const t = this.convertDocumentKey(e, this.firestore._databaseId);
    return new te(this.firestore, null, t);
  }
}
function YE(n) {
  n = Ve(n, at);
  const e = Ve(n.firestore, st),
    t = xs(e),
    r = new Ho(e);
  return (dh(n._query), g_(t, n._query).then((s) => new Bt(e, r, n, s)));
}
function XE(n, e, t) {
  n = Ve(n, te);
  const r = Ve(n.firestore, st),
    s = ph(n.converter, e, t);
  return zs(r, [
    ah(Bs(r), 'setDoc', n._key, s, n.converter !== null, t).toMutation(n._key, Ne.none()),
  ]);
}
function JE(n, e, t, ...r) {
  n = Ve(n, te);
  const s = Ve(n.firestore, st),
    o = Bs(s);
  let a;
  return (
    (a =
      typeof (e = re(e)) == 'string' || e instanceof Fs
        ? A_(o, 'updateDoc', n._key, e, t, r)
        : w_(o, 'updateDoc', n._key, e)),
    zs(s, [a.toMutation(n._key, Ne.exists(!0))])
  );
}
function ZE(n) {
  return zs(Ve(n.firestore, st), [new po(n._key, Ne.none())]);
}
function eI(n, e) {
  const t = Ve(n.firestore, st),
    r = y_(n),
    s = ph(n.converter, e);
  return zs(t, [
    ah(Bs(n.firestore), 'addDoc', r._key, s, n.converter !== null, {}).toMutation(
      r._key,
      Ne.exists(!1)
    ),
  ]).then(() => r);
}
function tI(n, ...e) {
  n = re(n);
  let t = { includeMetadataChanges: !1, source: 'default' },
    r = 0;
  typeof e[r] != 'object' || uu(e[r]) || (t = e[r++]);
  const s = { includeMetadataChanges: t.includeMetadataChanges, source: t.source };
  if (uu(e[r])) {
    const h = e[r];
    ((e[r] = h.next?.bind(h)), (e[r + 1] = h.error?.bind(h)), (e[r + 2] = h.complete?.bind(h)));
  }
  let o, a, u;
  if (n instanceof te)
    ((a = Ve(n.firestore, st)),
      (u = Cs(n._key.path)),
      (o = {
        next: (h) => {
          e[r] && e[r](mh(a, n, h));
        },
        error: e[r + 1],
        complete: e[r + 2],
      }));
  else {
    const h = Ve(n, at);
    ((a = Ve(h.firestore, st)), (u = h._query));
    const d = new Ho(a);
    ((o = {
      next: (p) => {
        e[r] && e[r](new Bt(a, d, h, p));
      },
      error: e[r + 1],
      complete: e[r + 2],
    }),
      dh(n._query));
  }
  return (function (d, p, E, y) {
    const C = new Oo(y),
      b = new ko(p, C, E);
    return (
      d.asyncQueue.enqueueAndForget(async () => Co(await fs(d), b)),
      () => {
        (C.Nu(), d.asyncQueue.enqueueAndForget(async () => bo(await fs(d), b)));
      }
    );
  })(xs(a), u, s, o);
}
function zs(n, e) {
  return (function (r, s) {
    const o = new et();
    return (r.asyncQueue.enqueueAndForget(async () => r_(await p_(r), s, o)), o.promise);
  })(xs(n), e);
}
function mh(n, e, t) {
  const r = t.docs.get(e._key),
    s = new Ho(n);
  return new Ut(n, s, e._key, r, new Hn(t.hasPendingWrites, t.fromCache), e.converter);
}
function nI() {
  return new xo('serverTimestamp');
}
(function (e, t = !0) {
  ((function (s) {
    yn = s;
  })(_n),
    un(
      new jt(
        'firestore',
        (r, { instanceIdentifier: s, options: o }) => {
          const a = r.getProvider('app').getImmediate(),
            u = new st(
              new wp(r.getProvider('auth-internal')),
              new Sp(a, r.getProvider('app-check-internal')),
              (function (d, p) {
                if (!Object.prototype.hasOwnProperty.apply(d.options, ['projectId']))
                  throw new k(
                    S.INVALID_ARGUMENT,
                    '"projectId" not provided in firebase.initializeApp.'
                  );
                return new rr(d.options.projectId, p);
              })(a, s),
              a
            );
          return ((o = { useFetchStreams: t, ...o }), u._setSettings(o), u);
        },
        'PUBLIC'
      ).setMultipleInstances(!0)
    ),
    Tt(fc, pc, e),
    Tt(fc, pc, 'esm2020'));
})();
function gh() {
  return {
    'dependent-sdk-initialized-before-auth':
      'Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.',
  };
}
const V_ = gh,
  _h = new lr('auth', 'Firebase', gh());
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ms = new no('@firebase/auth');
function k_(n, ...e) {
  ms.logLevel <= q.WARN && ms.warn(`Auth (${_n}): ${n}`, ...e);
}
function Zr(n, ...e) {
  ms.logLevel <= q.ERROR && ms.error(`Auth (${_n}): ${n}`, ...e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function De(n, ...e) {
  throw Go(n, ...e);
}
function Le(n, ...e) {
  return Go(n, ...e);
}
function Wo(n, e, t) {
  const r = { ...V_(), [e]: t };
  return new lr('auth', 'Firebase', r).create(e, { appName: n.name });
}
function xe(n) {
  return Wo(
    n,
    'operation-not-supported-in-this-environment',
    'Operations that alter the current user are not supported in conjunction with FirebaseServerApp'
  );
}
function yh(n, e, t) {
  const r = t;
  if (!(e instanceof r))
    throw (
      r.name !== e.constructor.name && De(n, 'argument-error'),
      Wo(
        n,
        'argument-error',
        `Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`
      )
    );
}
function Go(n, ...e) {
  if (typeof n != 'string') {
    const t = e[0],
      r = [...e.slice(1)];
    return (r[0] && (r[0].appName = n.name), n._errorFactory.create(t, ...r));
  }
  return _h.create(n, ...e);
}
function L(n, e, ...t) {
  if (!n) throw Go(e, ...t);
}
function Je(n) {
  const e = 'INTERNAL ASSERTION FAILED: ' + n;
  throw (Zr(e), new Error(e));
}
function it(n, e) {
  n || Je(e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function gs() {
  return (typeof self < 'u' && self.location?.href) || '';
}
function N_() {
  return du() === 'http:' || du() === 'https:';
}
function du() {
  return (typeof self < 'u' && self.location?.protocol) || null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function D_() {
  return typeof navigator < 'u' &&
    navigator &&
    'onLine' in navigator &&
    typeof navigator.onLine == 'boolean' &&
    (N_() || Qd() || 'connection' in navigator)
    ? navigator.onLine
    : !0;
}
function O_() {
  if (typeof navigator > 'u') return null;
  const n = navigator;
  return (n.languages && n.languages[0]) || n.language || null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class yr {
  constructor(e, t) {
    ((this.shortDelay = e),
      (this.longDelay = t),
      it(t > e, 'Short delay should be less than long delay!'),
      (this.isMobile = Wd() || Yd()));
  }
  get() {
    return D_()
      ? this.isMobile
        ? this.longDelay
        : this.shortDelay
      : Math.min(5e3, this.shortDelay);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Ko(n, e) {
  it(n.emulator, 'Emulator should always be set here');
  const { url: t } = n.emulator;
  return e ? `${t}${e.startsWith('/') ? e.slice(1) : e}` : t;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Eh {
  static initialize(e, t, r) {
    ((this.fetchImpl = e), t && (this.headersImpl = t), r && (this.responseImpl = r));
  }
  static fetch() {
    if (this.fetchImpl) return this.fetchImpl;
    if (typeof self < 'u' && 'fetch' in self) return self.fetch;
    if (typeof globalThis < 'u' && globalThis.fetch) return globalThis.fetch;
    if (typeof fetch < 'u') return fetch;
    Je(
      'Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
    );
  }
  static headers() {
    if (this.headersImpl) return this.headersImpl;
    if (typeof self < 'u' && 'Headers' in self) return self.Headers;
    if (typeof globalThis < 'u' && globalThis.Headers) return globalThis.Headers;
    if (typeof Headers < 'u') return Headers;
    Je(
      'Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
    );
  }
  static response() {
    if (this.responseImpl) return this.responseImpl;
    if (typeof self < 'u' && 'Response' in self) return self.Response;
    if (typeof globalThis < 'u' && globalThis.Response) return globalThis.Response;
    if (typeof Response < 'u') return Response;
    Je(
      'Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill'
    );
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const M_ = {
  CREDENTIAL_MISMATCH: 'custom-token-mismatch',
  MISSING_CUSTOM_TOKEN: 'internal-error',
  INVALID_IDENTIFIER: 'invalid-email',
  MISSING_CONTINUE_URI: 'internal-error',
  INVALID_PASSWORD: 'wrong-password',
  MISSING_PASSWORD: 'missing-password',
  INVALID_LOGIN_CREDENTIALS: 'invalid-credential',
  EMAIL_EXISTS: 'email-already-in-use',
  PASSWORD_LOGIN_DISABLED: 'operation-not-allowed',
  INVALID_IDP_RESPONSE: 'invalid-credential',
  INVALID_PENDING_TOKEN: 'invalid-credential',
  FEDERATED_USER_ID_ALREADY_LINKED: 'credential-already-in-use',
  MISSING_REQ_TYPE: 'internal-error',
  EMAIL_NOT_FOUND: 'user-not-found',
  RESET_PASSWORD_EXCEED_LIMIT: 'too-many-requests',
  EXPIRED_OOB_CODE: 'expired-action-code',
  INVALID_OOB_CODE: 'invalid-action-code',
  MISSING_OOB_CODE: 'internal-error',
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN: 'requires-recent-login',
  INVALID_ID_TOKEN: 'invalid-user-token',
  TOKEN_EXPIRED: 'user-token-expired',
  USER_NOT_FOUND: 'user-token-expired',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'too-many-requests',
  PASSWORD_DOES_NOT_MEET_REQUIREMENTS: 'password-does-not-meet-requirements',
  INVALID_CODE: 'invalid-verification-code',
  INVALID_SESSION_INFO: 'invalid-verification-id',
  INVALID_TEMPORARY_PROOF: 'invalid-credential',
  MISSING_SESSION_INFO: 'missing-verification-id',
  SESSION_EXPIRED: 'code-expired',
  MISSING_ANDROID_PACKAGE_NAME: 'missing-android-pkg-name',
  UNAUTHORIZED_DOMAIN: 'unauthorized-continue-uri',
  INVALID_OAUTH_CLIENT_ID: 'invalid-oauth-client-id',
  ADMIN_ONLY_OPERATION: 'admin-restricted-operation',
  INVALID_MFA_PENDING_CREDENTIAL: 'invalid-multi-factor-session',
  MFA_ENROLLMENT_NOT_FOUND: 'multi-factor-info-not-found',
  MISSING_MFA_ENROLLMENT_ID: 'missing-multi-factor-info',
  MISSING_MFA_PENDING_CREDENTIAL: 'missing-multi-factor-session',
  SECOND_FACTOR_EXISTS: 'second-factor-already-in-use',
  SECOND_FACTOR_LIMIT_EXCEEDED: 'maximum-second-factor-count-exceeded',
  BLOCKING_FUNCTION_ERROR_RESPONSE: 'internal-error',
  RECAPTCHA_NOT_ENABLED: 'recaptcha-not-enabled',
  MISSING_RECAPTCHA_TOKEN: 'missing-recaptcha-token',
  INVALID_RECAPTCHA_TOKEN: 'invalid-recaptcha-token',
  INVALID_RECAPTCHA_ACTION: 'invalid-recaptcha-action',
  MISSING_CLIENT_TYPE: 'missing-client-type',
  MISSING_RECAPTCHA_VERSION: 'missing-recaptcha-version',
  INVALID_RECAPTCHA_VERSION: 'invalid-recaptcha-version',
  INVALID_REQ_TYPE: 'invalid-req-type',
};
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const L_ = [
    '/v1/accounts:signInWithCustomToken',
    '/v1/accounts:signInWithEmailLink',
    '/v1/accounts:signInWithIdp',
    '/v1/accounts:signInWithPassword',
    '/v1/accounts:signInWithPhoneNumber',
    '/v1/token',
  ],
  x_ = new yr(3e4, 6e4);
function ct(n, e) {
  return n.tenantId && !e.tenantId ? { ...e, tenantId: n.tenantId } : e;
}
async function Ge(n, e, t, r, s = {}) {
  return Ih(n, s, async () => {
    let o = {},
      a = {};
    r && (e === 'GET' ? (a = r) : (o = { body: JSON.stringify(r) }));
    const u = hr({ key: n.config.apiKey, ...a }).slice(1),
      h = await n._getAdditionalHeaders();
    ((h['Content-Type'] = 'application/json'),
      n.languageCode && (h['X-Firebase-Locale'] = n.languageCode));
    const d = { method: e, headers: h, ...o };
    return (
      Kd() || (d.referrerPolicy = 'no-referrer'),
      n.emulatorConfig && gn(n.emulatorConfig.host) && (d.credentials = 'include'),
      Eh.fetch()(await Th(n, n.config.apiHost, t, u), d)
    );
  });
}
async function Ih(n, e, t) {
  n._canInitEmulator = !1;
  const r = { ...M_, ...e };
  try {
    const s = new U_(n),
      o = await Promise.race([t(), s.promise]);
    s.clearNetworkTimeout();
    const a = await o.json();
    if ('needConfirmation' in a) throw Wr(n, 'account-exists-with-different-credential', a);
    if (o.ok && !('errorMessage' in a)) return a;
    {
      const u = o.ok ? a.errorMessage : a.error.message,
        [h, d] = u.split(' : ');
      if (h === 'FEDERATED_USER_ID_ALREADY_LINKED') throw Wr(n, 'credential-already-in-use', a);
      if (h === 'EMAIL_EXISTS') throw Wr(n, 'email-already-in-use', a);
      if (h === 'USER_DISABLED') throw Wr(n, 'user-disabled', a);
      const p = r[h] || h.toLowerCase().replace(/[_\s]+/g, '-');
      if (d) throw Wo(n, p, d);
      De(n, p);
    }
  } catch (s) {
    if (s instanceof ot) throw s;
    De(n, 'network-request-failed', { message: String(s) });
  }
}
async function Er(n, e, t, r, s = {}) {
  const o = await Ge(n, e, t, r, s);
  return (
    'mfaPendingCredential' in o && De(n, 'multi-factor-auth-required', { _serverResponse: o }),
    o
  );
}
async function Th(n, e, t, r) {
  const s = `${e}${t}?${r}`,
    o = n,
    a = o.config.emulator ? Ko(n.config, s) : `${n.config.apiScheme}://${s}`;
  return L_.includes(t) &&
    (await o._persistenceManagerAvailable, o._getPersistenceType() === 'COOKIE')
    ? o._getPersistence()._getFinalTarget(a).toString()
    : a;
}
function F_(n) {
  switch (n) {
    case 'ENFORCE':
      return 'ENFORCE';
    case 'AUDIT':
      return 'AUDIT';
    case 'OFF':
      return 'OFF';
    default:
      return 'ENFORCEMENT_STATE_UNSPECIFIED';
  }
}
class U_ {
  clearNetworkTimeout() {
    clearTimeout(this.timer);
  }
  constructor(e) {
    ((this.auth = e),
      (this.timer = null),
      (this.promise = new Promise((t, r) => {
        this.timer = setTimeout(() => r(Le(this.auth, 'network-request-failed')), x_.get());
      })));
  }
}
function Wr(n, e, t) {
  const r = { appName: n.name };
  (t.email && (r.email = t.email), t.phoneNumber && (r.phoneNumber = t.phoneNumber));
  const s = Le(n, e, r);
  return ((s.customData._tokenResponse = t), s);
}
function fu(n) {
  return n !== void 0 && n.enterprise !== void 0;
}
class B_ {
  constructor(e) {
    if (((this.siteKey = ''), (this.recaptchaEnforcementState = []), e.recaptchaKey === void 0))
      throw new Error('recaptchaKey undefined');
    ((this.siteKey = e.recaptchaKey.split('/')[3]),
      (this.recaptchaEnforcementState = e.recaptchaEnforcementState));
  }
  getProviderEnforcementState(e) {
    if (!this.recaptchaEnforcementState || this.recaptchaEnforcementState.length === 0) return null;
    for (const t of this.recaptchaEnforcementState)
      if (t.provider && t.provider === e) return F_(t.enforcementState);
    return null;
  }
  isProviderEnabled(e) {
    return (
      this.getProviderEnforcementState(e) === 'ENFORCE' ||
      this.getProviderEnforcementState(e) === 'AUDIT'
    );
  }
  isAnyProviderEnabled() {
    return (
      this.isProviderEnabled('EMAIL_PASSWORD_PROVIDER') || this.isProviderEnabled('PHONE_PROVIDER')
    );
  }
}
async function q_(n, e) {
  return Ge(n, 'GET', '/v2/recaptchaConfig', ct(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function j_(n, e) {
  return Ge(n, 'POST', '/v1/accounts:delete', e);
}
async function _s(n, e) {
  return Ge(n, 'POST', '/v1/accounts:lookup', e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Xn(n) {
  if (n)
    try {
      const e = new Date(Number(n));
      if (!isNaN(e.getTime())) return e.toUTCString();
    } catch {}
}
async function $_(n, e = !1) {
  const t = re(n),
    r = await t.getIdToken(e),
    s = Qo(r);
  L(s && s.exp && s.auth_time && s.iat, t.auth, 'internal-error');
  const o = typeof s.firebase == 'object' ? s.firebase : void 0,
    a = o?.sign_in_provider;
  return {
    claims: s,
    token: r,
    authTime: Xn(Vi(s.auth_time)),
    issuedAtTime: Xn(Vi(s.iat)),
    expirationTime: Xn(Vi(s.exp)),
    signInProvider: a || null,
    signInSecondFactor: o?.sign_in_second_factor || null,
  };
}
function Vi(n) {
  return Number(n) * 1e3;
}
function Qo(n) {
  const [e, t, r] = n.split('.');
  if (e === void 0 || t === void 0 || r === void 0)
    return (Zr('JWT malformed, contained fewer than 3 sections'), null);
  try {
    const s = Ou(t);
    return s ? JSON.parse(s) : (Zr('Failed to decode base64 JWT payload'), null);
  } catch (s) {
    return (Zr('Caught error parsing JWT payload as JSON', s?.toString()), null);
  }
}
function pu(n) {
  const e = Qo(n);
  return (
    L(e, 'internal-error'),
    L(typeof e.exp < 'u', 'internal-error'),
    L(typeof e.iat < 'u', 'internal-error'),
    Number(e.exp) - Number(e.iat)
  );
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function mn(n, e, t = !1) {
  if (t) return e;
  try {
    return await e;
  } catch (r) {
    throw (r instanceof ot && z_(r) && n.auth.currentUser === n && (await n.auth.signOut()), r);
  }
}
function z_({ code: n }) {
  return n === 'auth/user-disabled' || n === 'auth/user-token-expired';
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class H_ {
  constructor(e) {
    ((this.user = e), (this.isRunning = !1), (this.timerId = null), (this.errorBackoff = 3e4));
  }
  _start() {
    this.isRunning || ((this.isRunning = !0), this.schedule());
  }
  _stop() {
    this.isRunning && ((this.isRunning = !1), this.timerId !== null && clearTimeout(this.timerId));
  }
  getInterval(e) {
    if (e) {
      const t = this.errorBackoff;
      return ((this.errorBackoff = Math.min(this.errorBackoff * 2, 96e4)), t);
    } else {
      this.errorBackoff = 3e4;
      const r = (this.user.stsTokenManager.expirationTime ?? 0) - Date.now() - 3e5;
      return Math.max(0, r);
    }
  }
  schedule(e = !1) {
    if (!this.isRunning) return;
    const t = this.getInterval(e);
    this.timerId = setTimeout(async () => {
      await this.iteration();
    }, t);
  }
  async iteration() {
    try {
      await this.user.getIdToken(!0);
    } catch (e) {
      e?.code === 'auth/network-request-failed' && this.schedule(!0);
      return;
    }
    this.schedule();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class eo {
  constructor(e, t) {
    ((this.createdAt = e), (this.lastLoginAt = t), this._initializeTime());
  }
  _initializeTime() {
    ((this.lastSignInTime = Xn(this.lastLoginAt)), (this.creationTime = Xn(this.createdAt)));
  }
  _copy(e) {
    ((this.createdAt = e.createdAt), (this.lastLoginAt = e.lastLoginAt), this._initializeTime());
  }
  toJSON() {
    return { createdAt: this.createdAt, lastLoginAt: this.lastLoginAt };
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function ys(n) {
  const e = n.auth,
    t = await n.getIdToken(),
    r = await mn(n, _s(e, { idToken: t }));
  L(r?.users.length, e, 'internal-error');
  const s = r.users[0];
  n._notifyReloadListener(s);
  const o = s.providerUserInfo?.length ? vh(s.providerUserInfo) : [],
    a = G_(n.providerData, o),
    u = n.isAnonymous,
    h = !(n.email && s.passwordHash) && !a?.length,
    d = u ? h : !1,
    p = {
      uid: s.localId,
      displayName: s.displayName || null,
      photoURL: s.photoUrl || null,
      email: s.email || null,
      emailVerified: s.emailVerified || !1,
      phoneNumber: s.phoneNumber || null,
      tenantId: s.tenantId || null,
      providerData: a,
      metadata: new eo(s.createdAt, s.lastLoginAt),
      isAnonymous: d,
    };
  Object.assign(n, p);
}
async function W_(n) {
  const e = re(n);
  (await ys(e), await e.auth._persistUserIfCurrent(e), e.auth._notifyListenersIfCurrent(e));
}
function G_(n, e) {
  return [...n.filter((r) => !e.some((s) => s.providerId === r.providerId)), ...e];
}
function vh(n) {
  return n.map(({ providerId: e, ...t }) => ({
    providerId: e,
    uid: t.rawId || '',
    displayName: t.displayName || null,
    email: t.email || null,
    phoneNumber: t.phoneNumber || null,
    photoURL: t.photoUrl || null,
  }));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function K_(n, e) {
  const t = await Ih(n, {}, async () => {
    const r = hr({ grant_type: 'refresh_token', refresh_token: e }).slice(1),
      { tokenApiHost: s, apiKey: o } = n.config,
      a = await Th(n, s, '/v1/token', `key=${o}`),
      u = await n._getAdditionalHeaders();
    u['Content-Type'] = 'application/x-www-form-urlencoded';
    const h = { method: 'POST', headers: u, body: r };
    return (
      n.emulatorConfig && gn(n.emulatorConfig.host) && (h.credentials = 'include'),
      Eh.fetch()(a, h)
    );
  });
  return { accessToken: t.access_token, expiresIn: t.expires_in, refreshToken: t.refresh_token };
}
async function Q_(n, e) {
  return Ge(n, 'POST', '/v2/accounts:revokeToken', ct(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class on {
  constructor() {
    ((this.refreshToken = null), (this.accessToken = null), (this.expirationTime = null));
  }
  get isExpired() {
    return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
  }
  updateFromServerResponse(e) {
    (L(e.idToken, 'internal-error'),
      L(typeof e.idToken < 'u', 'internal-error'),
      L(typeof e.refreshToken < 'u', 'internal-error'));
    const t = 'expiresIn' in e && typeof e.expiresIn < 'u' ? Number(e.expiresIn) : pu(e.idToken);
    this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
  }
  updateFromIdToken(e) {
    L(e.length !== 0, 'internal-error');
    const t = pu(e);
    this.updateTokensAndExpiration(e, null, t);
  }
  async getToken(e, t = !1) {
    return !t && this.accessToken && !this.isExpired
      ? this.accessToken
      : (L(this.refreshToken, e, 'user-token-expired'),
        this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
  }
  clearRefreshToken() {
    this.refreshToken = null;
  }
  async refresh(e, t) {
    const { accessToken: r, refreshToken: s, expiresIn: o } = await K_(e, t);
    this.updateTokensAndExpiration(r, s, Number(o));
  }
  updateTokensAndExpiration(e, t, r) {
    ((this.refreshToken = t || null),
      (this.accessToken = e || null),
      (this.expirationTime = Date.now() + r * 1e3));
  }
  static fromJSON(e, t) {
    const { refreshToken: r, accessToken: s, expirationTime: o } = t,
      a = new on();
    return (
      r && (L(typeof r == 'string', 'internal-error', { appName: e }), (a.refreshToken = r)),
      s && (L(typeof s == 'string', 'internal-error', { appName: e }), (a.accessToken = s)),
      o && (L(typeof o == 'number', 'internal-error', { appName: e }), (a.expirationTime = o)),
      a
    );
  }
  toJSON() {
    return {
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expirationTime: this.expirationTime,
    };
  }
  _assign(e) {
    ((this.accessToken = e.accessToken),
      (this.refreshToken = e.refreshToken),
      (this.expirationTime = e.expirationTime));
  }
  _clone() {
    return Object.assign(new on(), this.toJSON());
  }
  _performRefresh() {
    return Je('not implemented');
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function ft(n, e) {
  L(typeof n == 'string' || typeof n > 'u', 'internal-error', { appName: e });
}
class Me {
  constructor({ uid: e, auth: t, stsTokenManager: r, ...s }) {
    ((this.providerId = 'firebase'),
      (this.proactiveRefresh = new H_(this)),
      (this.reloadUserInfo = null),
      (this.reloadListener = null),
      (this.uid = e),
      (this.auth = t),
      (this.stsTokenManager = r),
      (this.accessToken = r.accessToken),
      (this.displayName = s.displayName || null),
      (this.email = s.email || null),
      (this.emailVerified = s.emailVerified || !1),
      (this.phoneNumber = s.phoneNumber || null),
      (this.photoURL = s.photoURL || null),
      (this.isAnonymous = s.isAnonymous || !1),
      (this.tenantId = s.tenantId || null),
      (this.providerData = s.providerData ? [...s.providerData] : []),
      (this.metadata = new eo(s.createdAt || void 0, s.lastLoginAt || void 0)));
  }
  async getIdToken(e) {
    const t = await mn(this, this.stsTokenManager.getToken(this.auth, e));
    return (
      L(t, this.auth, 'internal-error'),
      this.accessToken !== t &&
        ((this.accessToken = t),
        await this.auth._persistUserIfCurrent(this),
        this.auth._notifyListenersIfCurrent(this)),
      t
    );
  }
  getIdTokenResult(e) {
    return $_(this, e);
  }
  reload() {
    return W_(this);
  }
  _assign(e) {
    this !== e &&
      (L(this.uid === e.uid, this.auth, 'internal-error'),
      (this.displayName = e.displayName),
      (this.photoURL = e.photoURL),
      (this.email = e.email),
      (this.emailVerified = e.emailVerified),
      (this.phoneNumber = e.phoneNumber),
      (this.isAnonymous = e.isAnonymous),
      (this.tenantId = e.tenantId),
      (this.providerData = e.providerData.map((t) => ({ ...t }))),
      this.metadata._copy(e.metadata),
      this.stsTokenManager._assign(e.stsTokenManager));
  }
  _clone(e) {
    const t = new Me({ ...this, auth: e, stsTokenManager: this.stsTokenManager._clone() });
    return (t.metadata._copy(this.metadata), t);
  }
  _onReload(e) {
    (L(!this.reloadListener, this.auth, 'internal-error'),
      (this.reloadListener = e),
      this.reloadUserInfo &&
        (this._notifyReloadListener(this.reloadUserInfo), (this.reloadUserInfo = null)));
  }
  _notifyReloadListener(e) {
    this.reloadListener ? this.reloadListener(e) : (this.reloadUserInfo = e);
  }
  _startProactiveRefresh() {
    this.proactiveRefresh._start();
  }
  _stopProactiveRefresh() {
    this.proactiveRefresh._stop();
  }
  async _updateTokensIfNecessary(e, t = !1) {
    let r = !1;
    (e.idToken &&
      e.idToken !== this.stsTokenManager.accessToken &&
      (this.stsTokenManager.updateFromServerResponse(e), (r = !0)),
      t && (await ys(this)),
      await this.auth._persistUserIfCurrent(this),
      r && this.auth._notifyListenersIfCurrent(this));
  }
  async delete() {
    if (Ae(this.auth.app)) return Promise.reject(xe(this.auth));
    const e = await this.getIdToken();
    return (
      await mn(this, j_(this.auth, { idToken: e })),
      this.stsTokenManager.clearRefreshToken(),
      this.auth.signOut()
    );
  }
  toJSON() {
    return {
      uid: this.uid,
      email: this.email || void 0,
      emailVerified: this.emailVerified,
      displayName: this.displayName || void 0,
      isAnonymous: this.isAnonymous,
      photoURL: this.photoURL || void 0,
      phoneNumber: this.phoneNumber || void 0,
      tenantId: this.tenantId || void 0,
      providerData: this.providerData.map((e) => ({ ...e })),
      stsTokenManager: this.stsTokenManager.toJSON(),
      _redirectEventId: this._redirectEventId,
      ...this.metadata.toJSON(),
      apiKey: this.auth.config.apiKey,
      appName: this.auth.name,
    };
  }
  get refreshToken() {
    return this.stsTokenManager.refreshToken || '';
  }
  static _fromJSON(e, t) {
    const r = t.displayName ?? void 0,
      s = t.email ?? void 0,
      o = t.phoneNumber ?? void 0,
      a = t.photoURL ?? void 0,
      u = t.tenantId ?? void 0,
      h = t._redirectEventId ?? void 0,
      d = t.createdAt ?? void 0,
      p = t.lastLoginAt ?? void 0,
      { uid: E, emailVerified: y, isAnonymous: C, providerData: b, stsTokenManager: O } = t;
    L(E && O, e, 'internal-error');
    const N = on.fromJSON(this.name, O);
    (L(typeof E == 'string', e, 'internal-error'),
      ft(r, e.name),
      ft(s, e.name),
      L(typeof y == 'boolean', e, 'internal-error'),
      L(typeof C == 'boolean', e, 'internal-error'),
      ft(o, e.name),
      ft(a, e.name),
      ft(u, e.name),
      ft(h, e.name),
      ft(d, e.name),
      ft(p, e.name));
    const z = new Me({
      uid: E,
      auth: e,
      email: s,
      emailVerified: y,
      displayName: r,
      isAnonymous: C,
      photoURL: a,
      phoneNumber: o,
      tenantId: u,
      stsTokenManager: N,
      createdAt: d,
      lastLoginAt: p,
    });
    return (
      b && Array.isArray(b) && (z.providerData = b.map((B) => ({ ...B }))),
      h && (z._redirectEventId = h),
      z
    );
  }
  static async _fromIdTokenResponse(e, t, r = !1) {
    const s = new on();
    s.updateFromServerResponse(t);
    const o = new Me({ uid: t.localId, auth: e, stsTokenManager: s, isAnonymous: r });
    return (await ys(o), o);
  }
  static async _fromGetAccountInfoResponse(e, t, r) {
    const s = t.users[0];
    L(s.localId !== void 0, 'internal-error');
    const o = s.providerUserInfo !== void 0 ? vh(s.providerUserInfo) : [],
      a = !(s.email && s.passwordHash) && !o?.length,
      u = new on();
    u.updateFromIdToken(r);
    const h = new Me({ uid: s.localId, auth: e, stsTokenManager: u, isAnonymous: a }),
      d = {
        uid: s.localId,
        displayName: s.displayName || null,
        photoURL: s.photoUrl || null,
        email: s.email || null,
        emailVerified: s.emailVerified || !1,
        phoneNumber: s.phoneNumber || null,
        tenantId: s.tenantId || null,
        providerData: o,
        metadata: new eo(s.createdAt, s.lastLoginAt),
        isAnonymous: !(s.email && s.passwordHash) && !o?.length,
      };
    return (Object.assign(h, d), h);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const mu = new Map();
function Ze(n) {
  it(n instanceof Function, 'Expected a class definition');
  let e = mu.get(n);
  return e
    ? (it(e instanceof n, 'Instance stored in cache mismatched with class'), e)
    : ((e = new n()), mu.set(n, e), e);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class wh {
  constructor() {
    ((this.type = 'NONE'), (this.storage = {}));
  }
  async _isAvailable() {
    return !0;
  }
  async _set(e, t) {
    this.storage[e] = t;
  }
  async _get(e) {
    const t = this.storage[e];
    return t === void 0 ? null : t;
  }
  async _remove(e) {
    delete this.storage[e];
  }
  _addListener(e, t) {}
  _removeListener(e, t) {}
}
wh.type = 'NONE';
const gu = wh;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function es(n, e, t) {
  return `firebase:${n}:${e}:${t}`;
}
class an {
  constructor(e, t, r) {
    ((this.persistence = e), (this.auth = t), (this.userKey = r));
    const { config: s, name: o } = this.auth;
    ((this.fullUserKey = es(this.userKey, s.apiKey, o)),
      (this.fullPersistenceKey = es('persistence', s.apiKey, o)),
      (this.boundEventHandler = t._onStorageEvent.bind(t)),
      this.persistence._addListener(this.fullUserKey, this.boundEventHandler));
  }
  setCurrentUser(e) {
    return this.persistence._set(this.fullUserKey, e.toJSON());
  }
  async getCurrentUser() {
    const e = await this.persistence._get(this.fullUserKey);
    if (!e) return null;
    if (typeof e == 'string') {
      const t = await _s(this.auth, { idToken: e }).catch(() => {});
      return t ? Me._fromGetAccountInfoResponse(this.auth, t, e) : null;
    }
    return Me._fromJSON(this.auth, e);
  }
  removeCurrentUser() {
    return this.persistence._remove(this.fullUserKey);
  }
  savePersistenceForRedirect() {
    return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
  }
  async setPersistence(e) {
    if (this.persistence === e) return;
    const t = await this.getCurrentUser();
    if ((await this.removeCurrentUser(), (this.persistence = e), t)) return this.setCurrentUser(t);
  }
  delete() {
    this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
  }
  static async create(e, t, r = 'authUser') {
    if (!t.length) return new an(Ze(gu), e, r);
    const s = (
      await Promise.all(
        t.map(async (d) => {
          if (await d._isAvailable()) return d;
        })
      )
    ).filter((d) => d);
    let o = s[0] || Ze(gu);
    const a = es(r, e.config.apiKey, e.name);
    let u = null;
    for (const d of t)
      try {
        const p = await d._get(a);
        if (p) {
          let E;
          if (typeof p == 'string') {
            const y = await _s(e, { idToken: p }).catch(() => {});
            if (!y) break;
            E = await Me._fromGetAccountInfoResponse(e, y, p);
          } else E = Me._fromJSON(e, p);
          (d !== o && (u = E), (o = d));
          break;
        }
      } catch {}
    const h = s.filter((d) => d._shouldAllowMigration);
    return !o._shouldAllowMigration || !h.length
      ? new an(o, e, r)
      : ((o = h[0]),
        u && (await o._set(a, u.toJSON())),
        await Promise.all(
          t.map(async (d) => {
            if (d !== o)
              try {
                await d._remove(a);
              } catch {}
          })
        ),
        new an(o, e, r));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function _u(n) {
  const e = n.toLowerCase();
  if (e.includes('opera/') || e.includes('opr/') || e.includes('opios/')) return 'Opera';
  if (Ph(e)) return 'IEMobile';
  if (e.includes('msie') || e.includes('trident/')) return 'IE';
  if (e.includes('edge/')) return 'Edge';
  if (Ah(e)) return 'Firefox';
  if (e.includes('silk/')) return 'Silk';
  if (bh(e)) return 'Blackberry';
  if (Vh(e)) return 'Webos';
  if (Rh(e)) return 'Safari';
  if ((e.includes('chrome/') || Sh(e)) && !e.includes('edge/')) return 'Chrome';
  if (Ch(e)) return 'Android';
  {
    const t = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,
      r = n.match(t);
    if (r?.length === 2) return r[1];
  }
  return 'Other';
}
function Ah(n = Te()) {
  return /firefox\//i.test(n);
}
function Rh(n = Te()) {
  const e = n.toLowerCase();
  return (
    e.includes('safari/') &&
    !e.includes('chrome/') &&
    !e.includes('crios/') &&
    !e.includes('android')
  );
}
function Sh(n = Te()) {
  return /crios\//i.test(n);
}
function Ph(n = Te()) {
  return /iemobile/i.test(n);
}
function Ch(n = Te()) {
  return /android/i.test(n);
}
function bh(n = Te()) {
  return /blackberry/i.test(n);
}
function Vh(n = Te()) {
  return /webos/i.test(n);
}
function Yo(n = Te()) {
  return /iphone|ipad|ipod/i.test(n) || (/macintosh/i.test(n) && /mobile/i.test(n));
}
function Y_(n = Te()) {
  return Yo(n) && !!window.navigator?.standalone;
}
function X_() {
  return Xd() && document.documentMode === 10;
}
function kh(n = Te()) {
  return Yo(n) || Ch(n) || Vh(n) || bh(n) || /windows phone/i.test(n) || Ph(n);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Nh(n, e = []) {
  let t;
  switch (n) {
    case 'Browser':
      t = _u(Te());
      break;
    case 'Worker':
      t = `${_u(Te())}-${n}`;
      break;
    default:
      t = n;
  }
  const r = e.length ? e.join(',') : 'FirebaseCore-web';
  return `${t}/JsCore/${_n}/${r}`;
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class J_ {
  constructor(e) {
    ((this.auth = e), (this.queue = []));
  }
  pushCallback(e, t) {
    const r = (o) =>
      new Promise((a, u) => {
        try {
          const h = e(o);
          a(h);
        } catch (h) {
          u(h);
        }
      });
    ((r.onAbort = t), this.queue.push(r));
    const s = this.queue.length - 1;
    return () => {
      this.queue[s] = () => Promise.resolve();
    };
  }
  async runMiddleware(e) {
    if (this.auth.currentUser === e) return;
    const t = [];
    try {
      for (const r of this.queue) (await r(e), r.onAbort && t.push(r.onAbort));
    } catch (r) {
      t.reverse();
      for (const s of t)
        try {
          s();
        } catch {}
      throw this.auth._errorFactory.create('login-blocked', { originalMessage: r?.message });
    }
  }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function Z_(n, e = {}) {
  return Ge(n, 'GET', '/v2/passwordPolicy', ct(n, e));
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ey = 6;
class ty {
  constructor(e) {
    const t = e.customStrengthOptions;
    ((this.customStrengthOptions = {}),
      (this.customStrengthOptions.minPasswordLength = t.minPasswordLength ?? ey),
      t.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = t.maxPasswordLength),
      t.containsLowercaseCharacter !== void 0 &&
        (this.customStrengthOptions.containsLowercaseLetter = t.containsLowercaseCharacter),
      t.containsUppercaseCharacter !== void 0 &&
        (this.customStrengthOptions.containsUppercaseLetter = t.containsUppercaseCharacter),
      t.containsNumericCharacter !== void 0 &&
        (this.customStrengthOptions.containsNumericCharacter = t.containsNumericCharacter),
      t.containsNonAlphanumericCharacter !== void 0 &&
        (this.customStrengthOptions.containsNonAlphanumericCharacter =
          t.containsNonAlphanumericCharacter),
      (this.enforcementState = e.enforcementState),
      this.enforcementState === 'ENFORCEMENT_STATE_UNSPECIFIED' && (this.enforcementState = 'OFF'),
      (this.allowedNonAlphanumericCharacters = e.allowedNonAlphanumericCharacters?.join('') ?? ''),
      (this.forceUpgradeOnSignin = e.forceUpgradeOnSignin ?? !1),
      (this.schemaVersion = e.schemaVersion));
  }
  validatePassword(e) {
    const t = { isValid: !0, passwordPolicy: this };
    return (
      this.validatePasswordLengthOptions(e, t),
      this.validatePasswordCharacterOptions(e, t),
      t.isValid && (t.isValid = t.meetsMinPasswordLength ?? !0),
      t.isValid && (t.isValid = t.meetsMaxPasswordLength ?? !0),
      t.isValid && (t.isValid = t.containsLowercaseLetter ?? !0),
      t.isValid && (t.isValid = t.containsUppercaseLetter ?? !0),
      t.isValid && (t.isValid = t.containsNumericCharacter ?? !0),
      t.isValid && (t.isValid = t.containsNonAlphanumericCharacter ?? !0),
      t
    );
  }
  validatePasswordLengthOptions(e, t) {
    const r = this.customStrengthOptions.minPasswordLength,
      s = this.customStrengthOptions.maxPasswordLength;
    (r && (t.meetsMinPasswordLength = e.length >= r),
      s && (t.meetsMaxPasswordLength = e.length <= s));
  }
  validatePasswordCharacterOptions(e, t) {
    this.updatePasswordCharacterOptionsStatuses(t, !1, !1, !1, !1);
    let r;
    for (let s = 0; s < e.length; s++)
      ((r = e.charAt(s)),
        this.updatePasswordCharacterOptionsStatuses(
          t,
          r >= 'a' && r <= 'z',
          r >= 'A' && r <= 'Z',
          r >= '0' && r <= '9',
          this.allowedNonAlphanumericCharacters.includes(r)
        ));
  }
  updatePasswordCharacterOptionsStatuses(e, t, r, s, o) {
    (this.customStrengthOptions.containsLowercaseLetter &&
      (e.containsLowercaseLetter || (e.containsLowercaseLetter = t)),
      this.customStrengthOptions.containsUppercaseLetter &&
        (e.containsUppercaseLetter || (e.containsUppercaseLetter = r)),
      this.customStrengthOptions.containsNumericCharacter &&
        (e.containsNumericCharacter || (e.containsNumericCharacter = s)),
      this.customStrengthOptions.containsNonAlphanumericCharacter &&
        (e.containsNonAlphanumericCharacter || (e.containsNonAlphanumericCharacter = o)));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ny {
  constructor(e, t, r, s) {
    ((this.app = e),
      (this.heartbeatServiceProvider = t),
      (this.appCheckServiceProvider = r),
      (this.config = s),
      (this.currentUser = null),
      (this.emulatorConfig = null),
      (this.operations = Promise.resolve()),
      (this.authStateSubscription = new yu(this)),
      (this.idTokenSubscription = new yu(this)),
      (this.beforeStateQueue = new J_(this)),
      (this.redirectUser = null),
      (this.isProactiveRefreshEnabled = !1),
      (this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1),
      (this._canInitEmulator = !0),
      (this._isInitialized = !1),
      (this._deleted = !1),
      (this._initializationPromise = null),
      (this._popupRedirectResolver = null),
      (this._errorFactory = _h),
      (this._agentRecaptchaConfig = null),
      (this._tenantRecaptchaConfigs = {}),
      (this._projectPasswordPolicy = null),
      (this._tenantPasswordPolicies = {}),
      (this._resolvePersistenceManagerAvailable = void 0),
      (this.lastNotifiedUid = void 0),
      (this.languageCode = null),
      (this.tenantId = null),
      (this.settings = { appVerificationDisabledForTesting: !1 }),
      (this.frameworks = []),
      (this.name = e.name),
      (this.clientVersion = s.sdkClientVersion),
      (this._persistenceManagerAvailable = new Promise(
        (o) => (this._resolvePersistenceManagerAvailable = o)
      )));
  }
  _initializeWithPersistence(e, t) {
    return (
      t && (this._popupRedirectResolver = Ze(t)),
      (this._initializationPromise = this.queue(async () => {
        if (
          !this._deleted &&
          ((this.persistenceManager = await an.create(this, e)),
          this._resolvePersistenceManagerAvailable?.(),
          !this._deleted)
        ) {
          if (this._popupRedirectResolver?._shouldInitProactively)
            try {
              await this._popupRedirectResolver._initialize(this);
            } catch {}
          (await this.initializeCurrentUser(t),
            (this.lastNotifiedUid = this.currentUser?.uid || null),
            !this._deleted && (this._isInitialized = !0));
        }
      })),
      this._initializationPromise
    );
  }
  async _onStorageEvent() {
    if (this._deleted) return;
    const e = await this.assertedPersistence.getCurrentUser();
    if (!(!this.currentUser && !e)) {
      if (this.currentUser && e && this.currentUser.uid === e.uid) {
        (this._currentUser._assign(e), await this.currentUser.getIdToken());
        return;
      }
      await this._updateCurrentUser(e, !0);
    }
  }
  async initializeCurrentUserFromIdToken(e) {
    try {
      const t = await _s(this, { idToken: e }),
        r = await Me._fromGetAccountInfoResponse(this, t, e);
      await this.directlySetCurrentUser(r);
    } catch (t) {
      (console.warn('FirebaseServerApp could not login user with provided authIdToken: ', t),
        await this.directlySetCurrentUser(null));
    }
  }
  async initializeCurrentUser(e) {
    if (Ae(this.app)) {
      const o = this.app.settings.authIdToken;
      return o
        ? new Promise((a) => {
            setTimeout(() => this.initializeCurrentUserFromIdToken(o).then(a, a));
          })
        : this.directlySetCurrentUser(null);
    }
    const t = await this.assertedPersistence.getCurrentUser();
    let r = t,
      s = !1;
    if (e && this.config.authDomain) {
      await this.getOrInitRedirectPersistenceManager();
      const o = this.redirectUser?._redirectEventId,
        a = r?._redirectEventId,
        u = await this.tryRedirectSignIn(e);
      (!o || o === a) && u?.user && ((r = u.user), (s = !0));
    }
    if (!r) return this.directlySetCurrentUser(null);
    if (!r._redirectEventId) {
      if (s)
        try {
          await this.beforeStateQueue.runMiddleware(r);
        } catch (o) {
          ((r = t),
            this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(o)));
        }
      return r ? this.reloadAndSetCurrentUserOrClear(r) : this.directlySetCurrentUser(null);
    }
    return (
      L(this._popupRedirectResolver, this, 'argument-error'),
      await this.getOrInitRedirectPersistenceManager(),
      this.redirectUser && this.redirectUser._redirectEventId === r._redirectEventId
        ? this.directlySetCurrentUser(r)
        : this.reloadAndSetCurrentUserOrClear(r)
    );
  }
  async tryRedirectSignIn(e) {
    let t = null;
    try {
      t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
    } catch {
      await this._setRedirectUser(null);
    }
    return t;
  }
  async reloadAndSetCurrentUserOrClear(e) {
    try {
      await ys(e);
    } catch (t) {
      if (t?.code !== 'auth/network-request-failed') return this.directlySetCurrentUser(null);
    }
    return this.directlySetCurrentUser(e);
  }
  useDeviceLanguage() {
    this.languageCode = O_();
  }
  async _delete() {
    this._deleted = !0;
  }
  async updateCurrentUser(e) {
    if (Ae(this.app)) return Promise.reject(xe(this));
    const t = e ? re(e) : null;
    return (
      t && L(t.auth.config.apiKey === this.config.apiKey, this, 'invalid-user-token'),
      this._updateCurrentUser(t && t._clone(this))
    );
  }
  async _updateCurrentUser(e, t = !1) {
    if (!this._deleted)
      return (
        e && L(this.tenantId === e.tenantId, this, 'tenant-id-mismatch'),
        t || (await this.beforeStateQueue.runMiddleware(e)),
        this.queue(async () => {
          (await this.directlySetCurrentUser(e), this.notifyAuthListeners());
        })
      );
  }
  async signOut() {
    return Ae(this.app)
      ? Promise.reject(xe(this))
      : (await this.beforeStateQueue.runMiddleware(null),
        (this.redirectPersistenceManager || this._popupRedirectResolver) &&
          (await this._setRedirectUser(null)),
        this._updateCurrentUser(null, !0));
  }
  setPersistence(e) {
    return Ae(this.app)
      ? Promise.reject(xe(this))
      : this.queue(async () => {
          await this.assertedPersistence.setPersistence(Ze(e));
        });
  }
  _getRecaptchaConfig() {
    return this.tenantId == null
      ? this._agentRecaptchaConfig
      : this._tenantRecaptchaConfigs[this.tenantId];
  }
  async validatePassword(e) {
    this._getPasswordPolicyInternal() || (await this._updatePasswordPolicy());
    const t = this._getPasswordPolicyInternal();
    return t.schemaVersion !== this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION
      ? Promise.reject(this._errorFactory.create('unsupported-password-policy-schema-version', {}))
      : t.validatePassword(e);
  }
  _getPasswordPolicyInternal() {
    return this.tenantId === null
      ? this._projectPasswordPolicy
      : this._tenantPasswordPolicies[this.tenantId];
  }
  async _updatePasswordPolicy() {
    const e = await Z_(this),
      t = new ty(e);
    this.tenantId === null
      ? (this._projectPasswordPolicy = t)
      : (this._tenantPasswordPolicies[this.tenantId] = t);
  }
  _getPersistenceType() {
    return this.assertedPersistence.persistence.type;
  }
  _getPersistence() {
    return this.assertedPersistence.persistence;
  }
  _updateErrorMap(e) {
    this._errorFactory = new lr('auth', 'Firebase', e());
  }
  onAuthStateChanged(e, t, r) {
    return this.registerStateListener(this.authStateSubscription, e, t, r);
  }
  beforeAuthStateChanged(e, t) {
    return this.beforeStateQueue.pushCallback(e, t);
  }
  onIdTokenChanged(e, t, r) {
    return this.registerStateListener(this.idTokenSubscription, e, t, r);
  }
  authStateReady() {
    return new Promise((e, t) => {
      if (this.currentUser) e();
      else {
        const r = this.onAuthStateChanged(() => {
          (r(), e());
        }, t);
      }
    });
  }
  async revokeAccessToken(e) {
    if (this.currentUser) {
      const t = await this.currentUser.getIdToken(),
        r = { providerId: 'apple.com', tokenType: 'ACCESS_TOKEN', token: e, idToken: t };
      (this.tenantId != null && (r.tenantId = this.tenantId), await Q_(this, r));
    }
  }
  toJSON() {
    return {
      apiKey: this.config.apiKey,
      authDomain: this.config.authDomain,
      appName: this.name,
      currentUser: this._currentUser?.toJSON(),
    };
  }
  async _setRedirectUser(e, t) {
    const r = await this.getOrInitRedirectPersistenceManager(t);
    return e === null ? r.removeCurrentUser() : r.setCurrentUser(e);
  }
  async getOrInitRedirectPersistenceManager(e) {
    if (!this.redirectPersistenceManager) {
      const t = (e && Ze(e)) || this._popupRedirectResolver;
      (L(t, this, 'argument-error'),
        (this.redirectPersistenceManager = await an.create(
          this,
          [Ze(t._redirectPersistence)],
          'redirectUser'
        )),
        (this.redirectUser = await this.redirectPersistenceManager.getCurrentUser()));
    }
    return this.redirectPersistenceManager;
  }
  async _redirectUserForId(e) {
    return (
      this._isInitialized && (await this.queue(async () => {})),
      this._currentUser?._redirectEventId === e
        ? this._currentUser
        : this.redirectUser?._redirectEventId === e
          ? this.redirectUser
          : null
    );
  }
  async _persistUserIfCurrent(e) {
    if (e === this.currentUser) return this.queue(async () => this.directlySetCurrentUser(e));
  }
  _notifyListenersIfCurrent(e) {
    e === this.currentUser && this.notifyAuthListeners();
  }
  _key() {
    return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
  }
  _startProactiveRefresh() {
    ((this.isProactiveRefreshEnabled = !0),
      this.currentUser && this._currentUser._startProactiveRefresh());
  }
  _stopProactiveRefresh() {
    ((this.isProactiveRefreshEnabled = !1),
      this.currentUser && this._currentUser._stopProactiveRefresh());
  }
  get _currentUser() {
    return this.currentUser;
  }
  notifyAuthListeners() {
    if (!this._isInitialized) return;
    this.idTokenSubscription.next(this.currentUser);
    const e = this.currentUser?.uid ?? null;
    this.lastNotifiedUid !== e &&
      ((this.lastNotifiedUid = e), this.authStateSubscription.next(this.currentUser));
  }
  registerStateListener(e, t, r, s) {
    if (this._deleted) return () => {};
    const o = typeof t == 'function' ? t : t.next.bind(t);
    let a = !1;
    const u = this._isInitialized ? Promise.resolve() : this._initializationPromise;
    if (
      (L(u, this, 'internal-error'),
      u.then(() => {
        a || o(this.currentUser);
      }),
      typeof t == 'function')
    ) {
      const h = e.addObserver(t, r, s);
      return () => {
        ((a = !0), h());
      };
    } else {
      const h = e.addObserver(t);
      return () => {
        ((a = !0), h());
      };
    }
  }
  async directlySetCurrentUser(e) {
    (this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(),
      e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(),
      (this.currentUser = e),
      e
        ? await this.assertedPersistence.setCurrentUser(e)
        : await this.assertedPersistence.removeCurrentUser());
  }
  queue(e) {
    return ((this.operations = this.operations.then(e, e)), this.operations);
  }
  get assertedPersistence() {
    return (L(this.persistenceManager, this, 'internal-error'), this.persistenceManager);
  }
  _logFramework(e) {
    !e ||
      this.frameworks.includes(e) ||
      (this.frameworks.push(e),
      this.frameworks.sort(),
      (this.clientVersion = Nh(this.config.clientPlatform, this._getFrameworks())));
  }
  _getFrameworks() {
    return this.frameworks;
  }
  async _getAdditionalHeaders() {
    const e = { 'X-Client-Version': this.clientVersion };
    this.app.options.appId && (e['X-Firebase-gmpid'] = this.app.options.appId);
    const t = await this.heartbeatServiceProvider
      .getImmediate({ optional: !0 })
      ?.getHeartbeatsHeader();
    t && (e['X-Firebase-Client'] = t);
    const r = await this._getAppCheckToken();
    return (r && (e['X-Firebase-AppCheck'] = r), e);
  }
  async _getAppCheckToken() {
    if (Ae(this.app) && this.app.settings.appCheckToken) return this.app.settings.appCheckToken;
    const e = await this.appCheckServiceProvider.getImmediate({ optional: !0 })?.getToken();
    return (e?.error && k_(`Error while retrieving App Check token: ${e.error}`), e?.token);
  }
}
function Ke(n) {
  return re(n);
}
class yu {
  constructor(e) {
    ((this.auth = e), (this.observer = null), (this.addObserver = of((t) => (this.observer = t))));
  }
  get next() {
    return (L(this.observer, this.auth, 'internal-error'), this.observer.next.bind(this.observer));
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ let Hs = {
  async loadJS() {
    throw new Error('Unable to load external scripts');
  },
  recaptchaV2Script: '',
  recaptchaEnterpriseScript: '',
  gapiScript: '',
};
function ry(n) {
  Hs = n;
}
function Dh(n) {
  return Hs.loadJS(n);
}
function sy() {
  return Hs.recaptchaEnterpriseScript;
}
function iy() {
  return Hs.gapiScript;
}
function oy(n) {
  return `__${n}${Math.floor(Math.random() * 1e6)}`;
}
class ay {
  constructor() {
    this.enterprise = new cy();
  }
  ready(e) {
    e();
  }
  execute(e, t) {
    return Promise.resolve('token');
  }
  render(e, t) {
    return '';
  }
}
class cy {
  ready(e) {
    e();
  }
  execute(e, t) {
    return Promise.resolve('token');
  }
  render(e, t) {
    return '';
  }
}
const uy = 'recaptcha-enterprise',
  Oh = 'NO_RECAPTCHA';
class ly {
  constructor(e) {
    ((this.type = uy), (this.auth = Ke(e)));
  }
  async verify(e = 'verify', t = !1) {
    async function r(o) {
      if (!t) {
        if (o.tenantId == null && o._agentRecaptchaConfig != null)
          return o._agentRecaptchaConfig.siteKey;
        if (o.tenantId != null && o._tenantRecaptchaConfigs[o.tenantId] !== void 0)
          return o._tenantRecaptchaConfigs[o.tenantId].siteKey;
      }
      return new Promise(async (a, u) => {
        q_(o, { clientType: 'CLIENT_TYPE_WEB', version: 'RECAPTCHA_ENTERPRISE' })
          .then((h) => {
            if (h.recaptchaKey === void 0) u(new Error('recaptcha Enterprise site key undefined'));
            else {
              const d = new B_(h);
              return (
                o.tenantId == null
                  ? (o._agentRecaptchaConfig = d)
                  : (o._tenantRecaptchaConfigs[o.tenantId] = d),
                a(d.siteKey)
              );
            }
          })
          .catch((h) => {
            u(h);
          });
      });
    }
    function s(o, a, u) {
      const h = window.grecaptcha;
      fu(h)
        ? h.enterprise.ready(() => {
            h.enterprise
              .execute(o, { action: e })
              .then((d) => {
                a(d);
              })
              .catch(() => {
                a(Oh);
              });
          })
        : u(Error('No reCAPTCHA enterprise script loaded.'));
    }
    return this.auth.settings.appVerificationDisabledForTesting
      ? new ay().execute('siteKey', { action: 'verify' })
      : new Promise((o, a) => {
          r(this.auth)
            .then((u) => {
              if (!t && fu(window.grecaptcha)) s(u, o, a);
              else {
                if (typeof window > 'u') {
                  a(new Error('RecaptchaVerifier is only supported in browser'));
                  return;
                }
                let h = sy();
                (h.length !== 0 && (h += u),
                  Dh(h)
                    .then(() => {
                      s(u, o, a);
                    })
                    .catch((d) => {
                      a(d);
                    }));
              }
            })
            .catch((u) => {
              a(u);
            });
        });
  }
}
async function Eu(n, e, t, r = !1, s = !1) {
  const o = new ly(n);
  let a;
  if (s) a = Oh;
  else
    try {
      a = await o.verify(t);
    } catch {
      a = await o.verify(t, !0);
    }
  const u = { ...e };
  if (t === 'mfaSmsEnrollment' || t === 'mfaSmsSignIn') {
    if ('phoneEnrollmentInfo' in u) {
      const h = u.phoneEnrollmentInfo.phoneNumber,
        d = u.phoneEnrollmentInfo.recaptchaToken;
      Object.assign(u, {
        phoneEnrollmentInfo: {
          phoneNumber: h,
          recaptchaToken: d,
          captchaResponse: a,
          clientType: 'CLIENT_TYPE_WEB',
          recaptchaVersion: 'RECAPTCHA_ENTERPRISE',
        },
      });
    } else if ('phoneSignInInfo' in u) {
      const h = u.phoneSignInInfo.recaptchaToken;
      Object.assign(u, {
        phoneSignInInfo: {
          recaptchaToken: h,
          captchaResponse: a,
          clientType: 'CLIENT_TYPE_WEB',
          recaptchaVersion: 'RECAPTCHA_ENTERPRISE',
        },
      });
    }
    return u;
  }
  return (
    r ? Object.assign(u, { captchaResp: a }) : Object.assign(u, { captchaResponse: a }),
    Object.assign(u, { clientType: 'CLIENT_TYPE_WEB' }),
    Object.assign(u, { recaptchaVersion: 'RECAPTCHA_ENTERPRISE' }),
    u
  );
}
async function Es(n, e, t, r, s) {
  if (n._getRecaptchaConfig()?.isProviderEnabled('EMAIL_PASSWORD_PROVIDER')) {
    const o = await Eu(n, e, t, t === 'getOobCode');
    return r(n, o);
  } else
    return r(n, e).catch(async (o) => {
      if (o.code === 'auth/missing-recaptcha-token') {
        console.log(
          `${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`
        );
        const a = await Eu(n, e, t, t === 'getOobCode');
        return r(n, a);
      } else return Promise.reject(o);
    });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function hy(n, e) {
  const t = so(n, 'auth');
  if (t.isInitialized()) {
    const s = t.getImmediate(),
      o = t.getOptions();
    if (qt(o, e ?? {})) return s;
    De(s, 'already-initialized');
  }
  return t.initialize({ options: e });
}
function dy(n, e) {
  const t = e?.persistence || [],
    r = (Array.isArray(t) ? t : [t]).map(Ze);
  (e?.errorMap && n._updateErrorMap(e.errorMap),
    n._initializeWithPersistence(r, e?.popupRedirectResolver));
}
function fy(n, e, t) {
  const r = Ke(n);
  L(/^https?:\/\//.test(e), r, 'invalid-emulator-scheme');
  const s = !1,
    o = Mh(e),
    { host: a, port: u } = py(e),
    h = u === null ? '' : `:${u}`,
    d = { url: `${o}//${a}${h}/` },
    p = Object.freeze({
      host: a,
      port: u,
      protocol: o.replace(':', ''),
      options: Object.freeze({ disableWarnings: s }),
    });
  if (!r._canInitEmulator) {
    (L(r.config.emulator && r.emulatorConfig, r, 'emulator-config-failed'),
      L(qt(d, r.config.emulator) && qt(p, r.emulatorConfig), r, 'emulator-config-failed'));
    return;
  }
  ((r.config.emulator = d),
    (r.emulatorConfig = p),
    (r.settings.appVerificationDisabledForTesting = !0),
    gn(a) ? (xu(`${o}//${a}${h}`), Hd('Auth', !0)) : my());
}
function Mh(n) {
  const e = n.indexOf(':');
  return e < 0 ? '' : n.substr(0, e + 1);
}
function py(n) {
  const e = Mh(n),
    t = /(\/\/)?([^?#/]+)/.exec(n.substr(e.length));
  if (!t) return { host: '', port: null };
  const r = t[2].split('@').pop() || '',
    s = /^(\[[^\]]+\])(:|$)/.exec(r);
  if (s) {
    const o = s[1];
    return { host: o, port: Iu(r.substr(o.length + 1)) };
  } else {
    const [o, a] = r.split(':');
    return { host: o, port: Iu(a) };
  }
}
function Iu(n) {
  if (!n) return null;
  const e = Number(n);
  return isNaN(e) ? null : e;
}
function my() {
  function n() {
    const e = document.createElement('p'),
      t = e.style;
    ((e.innerText = 'Running in emulator mode. Do not use with production credentials.'),
      (t.position = 'fixed'),
      (t.width = '100%'),
      (t.backgroundColor = '#ffffff'),
      (t.border = '.1em solid #000000'),
      (t.color = '#b50000'),
      (t.bottom = '0px'),
      (t.left = '0px'),
      (t.margin = '0px'),
      (t.zIndex = '10000'),
      (t.textAlign = 'center'),
      e.classList.add('firebase-emulator-warning'),
      document.body.appendChild(e));
  }
  (typeof console < 'u' &&
    typeof console.info == 'function' &&
    console.info(
      'WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.'
    ),
    typeof window < 'u' &&
      typeof document < 'u' &&
      (document.readyState === 'loading' ? window.addEventListener('DOMContentLoaded', n) : n()));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Xo {
  constructor(e, t) {
    ((this.providerId = e), (this.signInMethod = t));
  }
  toJSON() {
    return Je('not implemented');
  }
  _getIdTokenResponse(e) {
    return Je('not implemented');
  }
  _linkToIdToken(e, t) {
    return Je('not implemented');
  }
  _getReauthenticationResolver(e) {
    return Je('not implemented');
  }
}
async function gy(n, e) {
  return Ge(n, 'POST', '/v1/accounts:signUp', e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function _y(n, e) {
  return Er(n, 'POST', '/v1/accounts:signInWithPassword', ct(n, e));
}
async function yy(n, e) {
  return Ge(n, 'POST', '/v1/accounts:sendOobCode', ct(n, e));
}
async function Ey(n, e) {
  return yy(n, e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function Iy(n, e) {
  return Er(n, 'POST', '/v1/accounts:signInWithEmailLink', ct(n, e));
}
async function Ty(n, e) {
  return Er(n, 'POST', '/v1/accounts:signInWithEmailLink', ct(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ur extends Xo {
  constructor(e, t, r, s = null) {
    (super('password', r), (this._email = e), (this._password = t), (this._tenantId = s));
  }
  static _fromEmailAndPassword(e, t) {
    return new ur(e, t, 'password');
  }
  static _fromEmailAndCode(e, t, r = null) {
    return new ur(e, t, 'emailLink', r);
  }
  toJSON() {
    return {
      email: this._email,
      password: this._password,
      signInMethod: this.signInMethod,
      tenantId: this._tenantId,
    };
  }
  static fromJSON(e) {
    const t = typeof e == 'string' ? JSON.parse(e) : e;
    if (t?.email && t?.password) {
      if (t.signInMethod === 'password') return this._fromEmailAndPassword(t.email, t.password);
      if (t.signInMethod === 'emailLink')
        return this._fromEmailAndCode(t.email, t.password, t.tenantId);
    }
    return null;
  }
  async _getIdTokenResponse(e) {
    switch (this.signInMethod) {
      case 'password':
        const t = {
          returnSecureToken: !0,
          email: this._email,
          password: this._password,
          clientType: 'CLIENT_TYPE_WEB',
        };
        return Es(e, t, 'signInWithPassword', _y);
      case 'emailLink':
        return Iy(e, { email: this._email, oobCode: this._password });
      default:
        De(e, 'internal-error');
    }
  }
  async _linkToIdToken(e, t) {
    switch (this.signInMethod) {
      case 'password':
        const r = {
          idToken: t,
          returnSecureToken: !0,
          email: this._email,
          password: this._password,
          clientType: 'CLIENT_TYPE_WEB',
        };
        return Es(e, r, 'signUpPassword', gy);
      case 'emailLink':
        return Ty(e, { idToken: t, email: this._email, oobCode: this._password });
      default:
        De(e, 'internal-error');
    }
  }
  _getReauthenticationResolver(e) {
    return this._getIdTokenResponse(e);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function cn(n, e) {
  return Er(n, 'POST', '/v1/accounts:signInWithIdp', ct(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const vy = 'http://localhost';
class Ht extends Xo {
  constructor() {
    (super(...arguments), (this.pendingToken = null));
  }
  static _fromParams(e) {
    const t = new Ht(e.providerId, e.signInMethod);
    return (
      e.idToken || e.accessToken
        ? (e.idToken && (t.idToken = e.idToken),
          e.accessToken && (t.accessToken = e.accessToken),
          e.nonce && !e.pendingToken && (t.nonce = e.nonce),
          e.pendingToken && (t.pendingToken = e.pendingToken))
        : e.oauthToken && e.oauthTokenSecret
          ? ((t.accessToken = e.oauthToken), (t.secret = e.oauthTokenSecret))
          : De('argument-error'),
      t
    );
  }
  toJSON() {
    return {
      idToken: this.idToken,
      accessToken: this.accessToken,
      secret: this.secret,
      nonce: this.nonce,
      pendingToken: this.pendingToken,
      providerId: this.providerId,
      signInMethod: this.signInMethod,
    };
  }
  static fromJSON(e) {
    const t = typeof e == 'string' ? JSON.parse(e) : e,
      { providerId: r, signInMethod: s, ...o } = t;
    if (!r || !s) return null;
    const a = new Ht(r, s);
    return (
      (a.idToken = o.idToken || void 0),
      (a.accessToken = o.accessToken || void 0),
      (a.secret = o.secret),
      (a.nonce = o.nonce),
      (a.pendingToken = o.pendingToken || null),
      a
    );
  }
  _getIdTokenResponse(e) {
    const t = this.buildRequest();
    return cn(e, t);
  }
  _linkToIdToken(e, t) {
    const r = this.buildRequest();
    return ((r.idToken = t), cn(e, r));
  }
  _getReauthenticationResolver(e) {
    const t = this.buildRequest();
    return ((t.autoCreate = !1), cn(e, t));
  }
  buildRequest() {
    const e = { requestUri: vy, returnSecureToken: !0 };
    if (this.pendingToken) e.pendingToken = this.pendingToken;
    else {
      const t = {};
      (this.idToken && (t.id_token = this.idToken),
        this.accessToken && (t.access_token = this.accessToken),
        this.secret && (t.oauth_token_secret = this.secret),
        (t.providerId = this.providerId),
        this.nonce && !this.pendingToken && (t.nonce = this.nonce),
        (e.postBody = hr(t)));
    }
    return e;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function wy(n) {
  switch (n) {
    case 'recoverEmail':
      return 'RECOVER_EMAIL';
    case 'resetPassword':
      return 'PASSWORD_RESET';
    case 'signIn':
      return 'EMAIL_SIGNIN';
    case 'verifyEmail':
      return 'VERIFY_EMAIL';
    case 'verifyAndChangeEmail':
      return 'VERIFY_AND_CHANGE_EMAIL';
    case 'revertSecondFactorAddition':
      return 'REVERT_SECOND_FACTOR_ADDITION';
    default:
      return null;
  }
}
function Ay(n) {
  const e = Bn(qn(n)).link,
    t = e ? Bn(qn(e)).deep_link_id : null,
    r = Bn(qn(n)).deep_link_id;
  return (r ? Bn(qn(r)).link : null) || r || t || e || n;
}
class Ws {
  constructor(e) {
    const t = Bn(qn(e)),
      r = t.apiKey ?? null,
      s = t.oobCode ?? null,
      o = wy(t.mode ?? null);
    (L(r && s && o, 'argument-error'),
      (this.apiKey = r),
      (this.operation = o),
      (this.code = s),
      (this.continueUrl = t.continueUrl ?? null),
      (this.languageCode = t.lang ?? null),
      (this.tenantId = t.tenantId ?? null));
  }
  static parseLink(e) {
    const t = Ay(e);
    try {
      return new Ws(t);
    } catch {
      return null;
    }
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Qt {
  constructor() {
    this.providerId = Qt.PROVIDER_ID;
  }
  static credential(e, t) {
    return ur._fromEmailAndPassword(e, t);
  }
  static credentialWithLink(e, t) {
    const r = Ws.parseLink(t);
    return (L(r, 'argument-error'), ur._fromEmailAndCode(e, r.code, r.tenantId));
  }
}
Qt.PROVIDER_ID = 'password';
Qt.EMAIL_PASSWORD_SIGN_IN_METHOD = 'password';
Qt.EMAIL_LINK_SIGN_IN_METHOD = 'emailLink';
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Gs {
  constructor(e) {
    ((this.providerId = e), (this.defaultLanguageCode = null), (this.customParameters = {}));
  }
  setDefaultLanguage(e) {
    this.defaultLanguageCode = e;
  }
  setCustomParameters(e) {
    return ((this.customParameters = e), this);
  }
  getCustomParameters() {
    return this.customParameters;
  }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Ir extends Gs {
  constructor() {
    (super(...arguments), (this.scopes = []));
  }
  addScope(e) {
    return (this.scopes.includes(e) || this.scopes.push(e), this);
  }
  getScopes() {
    return [...this.scopes];
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class pt extends Ir {
  constructor() {
    super('facebook.com');
  }
  static credential(e) {
    return Ht._fromParams({
      providerId: pt.PROVIDER_ID,
      signInMethod: pt.FACEBOOK_SIGN_IN_METHOD,
      accessToken: e,
    });
  }
  static credentialFromResult(e) {
    return pt.credentialFromTaggedObject(e);
  }
  static credentialFromError(e) {
    return pt.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !('oauthAccessToken' in e) || !e.oauthAccessToken) return null;
    try {
      return pt.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
pt.FACEBOOK_SIGN_IN_METHOD = 'facebook.com';
pt.PROVIDER_ID = 'facebook.com';
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class mt extends Ir {
  constructor() {
    (super('google.com'), this.addScope('profile'));
  }
  static credential(e, t) {
    return Ht._fromParams({
      providerId: mt.PROVIDER_ID,
      signInMethod: mt.GOOGLE_SIGN_IN_METHOD,
      idToken: e,
      accessToken: t,
    });
  }
  static credentialFromResult(e) {
    return mt.credentialFromTaggedObject(e);
  }
  static credentialFromError(e) {
    return mt.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e) return null;
    const { oauthIdToken: t, oauthAccessToken: r } = e;
    if (!t && !r) return null;
    try {
      return mt.credential(t, r);
    } catch {
      return null;
    }
  }
}
mt.GOOGLE_SIGN_IN_METHOD = 'google.com';
mt.PROVIDER_ID = 'google.com';
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class gt extends Ir {
  constructor() {
    super('github.com');
  }
  static credential(e) {
    return Ht._fromParams({
      providerId: gt.PROVIDER_ID,
      signInMethod: gt.GITHUB_SIGN_IN_METHOD,
      accessToken: e,
    });
  }
  static credentialFromResult(e) {
    return gt.credentialFromTaggedObject(e);
  }
  static credentialFromError(e) {
    return gt.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !('oauthAccessToken' in e) || !e.oauthAccessToken) return null;
    try {
      return gt.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
gt.GITHUB_SIGN_IN_METHOD = 'github.com';
gt.PROVIDER_ID = 'github.com';
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class _t extends Ir {
  constructor() {
    super('twitter.com');
  }
  static credential(e, t) {
    return Ht._fromParams({
      providerId: _t.PROVIDER_ID,
      signInMethod: _t.TWITTER_SIGN_IN_METHOD,
      oauthToken: e,
      oauthTokenSecret: t,
    });
  }
  static credentialFromResult(e) {
    return _t.credentialFromTaggedObject(e);
  }
  static credentialFromError(e) {
    return _t.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e) return null;
    const { oauthAccessToken: t, oauthTokenSecret: r } = e;
    if (!t || !r) return null;
    try {
      return _t.credential(t, r);
    } catch {
      return null;
    }
  }
}
_t.TWITTER_SIGN_IN_METHOD = 'twitter.com';
_t.PROVIDER_ID = 'twitter.com';
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function Ry(n, e) {
  return Er(n, 'POST', '/v1/accounts:signUp', ct(n, e));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Wt {
  constructor(e) {
    ((this.user = e.user),
      (this.providerId = e.providerId),
      (this._tokenResponse = e._tokenResponse),
      (this.operationType = e.operationType));
  }
  static async _fromIdTokenResponse(e, t, r, s = !1) {
    const o = await Me._fromIdTokenResponse(e, r, s),
      a = Tu(r);
    return new Wt({ user: o, providerId: a, _tokenResponse: r, operationType: t });
  }
  static async _forOperation(e, t, r) {
    await e._updateTokensIfNecessary(r, !0);
    const s = Tu(r);
    return new Wt({ user: e, providerId: s, _tokenResponse: r, operationType: t });
  }
}
function Tu(n) {
  return n.providerId ? n.providerId : 'phoneNumber' in n ? 'phone' : null;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Is extends ot {
  constructor(e, t, r, s) {
    (super(t.code, t.message),
      (this.operationType = r),
      (this.user = s),
      Object.setPrototypeOf(this, Is.prototype),
      (this.customData = {
        appName: e.name,
        tenantId: e.tenantId ?? void 0,
        _serverResponse: t.customData._serverResponse,
        operationType: r,
      }));
  }
  static _fromErrorAndOperation(e, t, r, s) {
    return new Is(e, t, r, s);
  }
}
function Lh(n, e, t, r) {
  return (
    e === 'reauthenticate' ? t._getReauthenticationResolver(n) : t._getIdTokenResponse(n)
  ).catch((o) => {
    throw o.code === 'auth/multi-factor-auth-required' ? Is._fromErrorAndOperation(n, o, e, r) : o;
  });
}
async function Sy(n, e, t = !1) {
  const r = await mn(n, e._linkToIdToken(n.auth, await n.getIdToken()), t);
  return Wt._forOperation(n, 'link', r);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function Py(n, e, t = !1) {
  const { auth: r } = n;
  if (Ae(r.app)) return Promise.reject(xe(r));
  const s = 'reauthenticate';
  try {
    const o = await mn(n, Lh(r, s, e, n), t);
    L(o.idToken, r, 'internal-error');
    const a = Qo(o.idToken);
    L(a, r, 'internal-error');
    const { sub: u } = a;
    return (L(n.uid === u, r, 'user-mismatch'), Wt._forOperation(n, s, o));
  } catch (o) {
    throw (o?.code === 'auth/user-not-found' && De(r, 'user-mismatch'), o);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function xh(n, e, t = !1) {
  if (Ae(n.app)) return Promise.reject(xe(n));
  const r = 'signIn',
    s = await Lh(n, r, e),
    o = await Wt._fromIdTokenResponse(n, r, s);
  return (t || (await n._updateCurrentUser(o.user)), o);
}
async function Fh(n, e) {
  return xh(Ke(n), e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function Uh(n) {
  const e = Ke(n);
  e._getPasswordPolicyInternal() && (await e._updatePasswordPolicy());
}
async function rI(n, e, t) {
  const r = Ke(n);
  await Es(
    r,
    { requestType: 'PASSWORD_RESET', email: e, clientType: 'CLIENT_TYPE_WEB' },
    'getOobCode',
    Ey
  );
}
async function sI(n, e, t) {
  if (Ae(n.app)) return Promise.reject(xe(n));
  const r = Ke(n),
    a = await Es(
      r,
      { returnSecureToken: !0, email: e, password: t, clientType: 'CLIENT_TYPE_WEB' },
      'signUpPassword',
      Ry
    ).catch((h) => {
      throw (h.code === 'auth/password-does-not-meet-requirements' && Uh(n), h);
    }),
    u = await Wt._fromIdTokenResponse(r, 'signIn', a);
  return (await r._updateCurrentUser(u.user), u);
}
function iI(n, e, t) {
  return Ae(n.app)
    ? Promise.reject(xe(n))
    : Fh(re(n), Qt.credential(e, t)).catch(async (r) => {
        throw (r.code === 'auth/password-does-not-meet-requirements' && Uh(n), r);
      });
}
function oI(n, e) {
  return Ws.parseLink(e)?.operation === 'EMAIL_SIGNIN';
}
async function aI(n, e, t) {
  if (Ae(n.app)) return Promise.reject(xe(n));
  const r = re(n),
    s = Qt.credentialWithLink(e, t || gs());
  return (L(s._tenantId === (r.tenantId || null), r, 'tenant-id-mismatch'), Fh(r, s));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function Cy(n, e) {
  return Ge(n, 'POST', '/v1/accounts:update', e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function cI(n, { displayName: e, photoURL: t }) {
  if (e === void 0 && t === void 0) return;
  const r = re(n),
    o = { idToken: await r.getIdToken(), displayName: e, photoUrl: t, returnSecureToken: !0 },
    a = await mn(r, Cy(r.auth, o));
  ((r.displayName = a.displayName || null), (r.photoURL = a.photoUrl || null));
  const u = r.providerData.find(({ providerId: h }) => h === 'password');
  (u && ((u.displayName = r.displayName), (u.photoURL = r.photoURL)),
    await r._updateTokensIfNecessary(a));
}
function by(n, e, t, r) {
  return re(n).onIdTokenChanged(e, t, r);
}
function Vy(n, e, t) {
  return re(n).beforeAuthStateChanged(e, t);
}
function uI(n, e, t, r) {
  return re(n).onAuthStateChanged(e, t, r);
}
function lI(n) {
  return re(n).signOut();
}
const Ts = '__sak';
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Bh {
  constructor(e, t) {
    ((this.storageRetriever = e), (this.type = t));
  }
  _isAvailable() {
    try {
      return this.storage
        ? (this.storage.setItem(Ts, '1'), this.storage.removeItem(Ts), Promise.resolve(!0))
        : Promise.resolve(!1);
    } catch {
      return Promise.resolve(!1);
    }
  }
  _set(e, t) {
    return (this.storage.setItem(e, JSON.stringify(t)), Promise.resolve());
  }
  _get(e) {
    const t = this.storage.getItem(e);
    return Promise.resolve(t ? JSON.parse(t) : null);
  }
  _remove(e) {
    return (this.storage.removeItem(e), Promise.resolve());
  }
  get storage() {
    return this.storageRetriever();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ky = 1e3,
  Ny = 10;
class qh extends Bh {
  constructor() {
    (super(() => window.localStorage, 'LOCAL'),
      (this.boundEventHandler = (e, t) => this.onStorageEvent(e, t)),
      (this.listeners = {}),
      (this.localCache = {}),
      (this.pollTimer = null),
      (this.fallbackToPolling = kh()),
      (this._shouldAllowMigration = !0));
  }
  forAllChangedKeys(e) {
    for (const t of Object.keys(this.listeners)) {
      const r = this.storage.getItem(t),
        s = this.localCache[t];
      r !== s && e(t, s, r);
    }
  }
  onStorageEvent(e, t = !1) {
    if (!e.key) {
      this.forAllChangedKeys((a, u, h) => {
        this.notifyListeners(a, h);
      });
      return;
    }
    const r = e.key;
    t ? this.detachListener() : this.stopPolling();
    const s = () => {
        const a = this.storage.getItem(r);
        (!t && this.localCache[r] === a) || this.notifyListeners(r, a);
      },
      o = this.storage.getItem(r);
    X_() && o !== e.newValue && e.newValue !== e.oldValue ? setTimeout(s, Ny) : s();
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const r = this.listeners[e];
    if (r) for (const s of Array.from(r)) s(t && JSON.parse(t));
  }
  startPolling() {
    (this.stopPolling(),
      (this.pollTimer = setInterval(() => {
        this.forAllChangedKeys((e, t, r) => {
          this.onStorageEvent(
            new StorageEvent('storage', { key: e, oldValue: t, newValue: r }),
            !0
          );
        });
      }, ky)));
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), (this.pollTimer = null));
  }
  attachListener() {
    window.addEventListener('storage', this.boundEventHandler);
  }
  detachListener() {
    window.removeEventListener('storage', this.boundEventHandler);
  }
  _addListener(e, t) {
    (Object.keys(this.listeners).length === 0 &&
      (this.fallbackToPolling ? this.startPolling() : this.attachListener()),
      this.listeners[e] ||
        ((this.listeners[e] = new Set()), (this.localCache[e] = this.storage.getItem(e))),
      this.listeners[e].add(t));
  }
  _removeListener(e, t) {
    (this.listeners[e] &&
      (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]),
      Object.keys(this.listeners).length === 0 && (this.detachListener(), this.stopPolling()));
  }
  async _set(e, t) {
    (await super._set(e, t), (this.localCache[e] = JSON.stringify(t)));
  }
  async _get(e) {
    const t = await super._get(e);
    return ((this.localCache[e] = JSON.stringify(t)), t);
  }
  async _remove(e) {
    (await super._remove(e), delete this.localCache[e]);
  }
}
qh.type = 'LOCAL';
const Dy = qh;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class jh extends Bh {
  constructor() {
    super(() => window.sessionStorage, 'SESSION');
  }
  _addListener(e, t) {}
  _removeListener(e, t) {}
}
jh.type = 'SESSION';
const $h = jh;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Oy(n) {
  return Promise.all(
    n.map(async (e) => {
      try {
        return { fulfilled: !0, value: await e };
      } catch (t) {
        return { fulfilled: !1, reason: t };
      }
    })
  );
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Ks {
  constructor(e) {
    ((this.eventTarget = e),
      (this.handlersMap = {}),
      (this.boundEventHandler = this.handleEvent.bind(this)));
  }
  static _getInstance(e) {
    const t = this.receivers.find((s) => s.isListeningto(e));
    if (t) return t;
    const r = new Ks(e);
    return (this.receivers.push(r), r);
  }
  isListeningto(e) {
    return this.eventTarget === e;
  }
  async handleEvent(e) {
    const t = e,
      { eventId: r, eventType: s, data: o } = t.data,
      a = this.handlersMap[s];
    if (!a?.size) return;
    t.ports[0].postMessage({ status: 'ack', eventId: r, eventType: s });
    const u = Array.from(a).map(async (d) => d(t.origin, o)),
      h = await Oy(u);
    t.ports[0].postMessage({ status: 'done', eventId: r, eventType: s, response: h });
  }
  _subscribe(e, t) {
    (Object.keys(this.handlersMap).length === 0 &&
      this.eventTarget.addEventListener('message', this.boundEventHandler),
      this.handlersMap[e] || (this.handlersMap[e] = new Set()),
      this.handlersMap[e].add(t));
  }
  _unsubscribe(e, t) {
    (this.handlersMap[e] && t && this.handlersMap[e].delete(t),
      (!t || this.handlersMap[e].size === 0) && delete this.handlersMap[e],
      Object.keys(this.handlersMap).length === 0 &&
        this.eventTarget.removeEventListener('message', this.boundEventHandler));
  }
}
Ks.receivers = [];
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Jo(n = '', e = 10) {
  let t = '';
  for (let r = 0; r < e; r++) t += Math.floor(Math.random() * 10);
  return n + t;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class My {
  constructor(e) {
    ((this.target = e), (this.handlers = new Set()));
  }
  removeMessageHandler(e) {
    (e.messageChannel &&
      (e.messageChannel.port1.removeEventListener('message', e.onMessage),
      e.messageChannel.port1.close()),
      this.handlers.delete(e));
  }
  async _send(e, t, r = 50) {
    const s = typeof MessageChannel < 'u' ? new MessageChannel() : null;
    if (!s) throw new Error('connection_unavailable');
    let o, a;
    return new Promise((u, h) => {
      const d = Jo('', 20);
      s.port1.start();
      const p = setTimeout(() => {
        h(new Error('unsupported_event'));
      }, r);
      ((a = {
        messageChannel: s,
        onMessage(E) {
          const y = E;
          if (y.data.eventId === d)
            switch (y.data.status) {
              case 'ack':
                (clearTimeout(p),
                  (o = setTimeout(() => {
                    h(new Error('timeout'));
                  }, 3e3)));
                break;
              case 'done':
                (clearTimeout(o), u(y.data.response));
                break;
              default:
                (clearTimeout(p), clearTimeout(o), h(new Error('invalid_response')));
                break;
            }
        },
      }),
        this.handlers.add(a),
        s.port1.addEventListener('message', a.onMessage),
        this.target.postMessage({ eventType: e, eventId: d, data: t }, [s.port2]));
    }).finally(() => {
      a && this.removeMessageHandler(a);
    });
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function He() {
  return window;
}
function Ly(n) {
  He().location.href = n;
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function zh() {
  return typeof He().WorkerGlobalScope < 'u' && typeof He().importScripts == 'function';
}
async function xy() {
  if (!navigator?.serviceWorker) return null;
  try {
    return (await navigator.serviceWorker.ready).active;
  } catch {
    return null;
  }
}
function Fy() {
  return navigator?.serviceWorker?.controller || null;
}
function Uy() {
  return zh() ? self : null;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Hh = 'firebaseLocalStorageDb',
  By = 1,
  vs = 'firebaseLocalStorage',
  Wh = 'fbase_key';
class Tr {
  constructor(e) {
    this.request = e;
  }
  toPromise() {
    return new Promise((e, t) => {
      (this.request.addEventListener('success', () => {
        e(this.request.result);
      }),
        this.request.addEventListener('error', () => {
          t(this.request.error);
        }));
    });
  }
}
function Qs(n, e) {
  return n.transaction([vs], e ? 'readwrite' : 'readonly').objectStore(vs);
}
function qy() {
  const n = indexedDB.deleteDatabase(Hh);
  return new Tr(n).toPromise();
}
function to() {
  const n = indexedDB.open(Hh, By);
  return new Promise((e, t) => {
    (n.addEventListener('error', () => {
      t(n.error);
    }),
      n.addEventListener('upgradeneeded', () => {
        const r = n.result;
        try {
          r.createObjectStore(vs, { keyPath: Wh });
        } catch (s) {
          t(s);
        }
      }),
      n.addEventListener('success', async () => {
        const r = n.result;
        r.objectStoreNames.contains(vs) ? e(r) : (r.close(), await qy(), e(await to()));
      }));
  });
}
async function vu(n, e, t) {
  const r = Qs(n, !0).put({ [Wh]: e, value: t });
  return new Tr(r).toPromise();
}
async function jy(n, e) {
  const t = Qs(n, !1).get(e),
    r = await new Tr(t).toPromise();
  return r === void 0 ? null : r.value;
}
function wu(n, e) {
  const t = Qs(n, !0).delete(e);
  return new Tr(t).toPromise();
}
const $y = 800,
  zy = 3;
class Gh {
  constructor() {
    ((this.type = 'LOCAL'),
      (this._shouldAllowMigration = !0),
      (this.listeners = {}),
      (this.localCache = {}),
      (this.pollTimer = null),
      (this.pendingWrites = 0),
      (this.receiver = null),
      (this.sender = null),
      (this.serviceWorkerReceiverAvailable = !1),
      (this.activeServiceWorker = null),
      (this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(
        () => {},
        () => {}
      )));
  }
  async _openDb() {
    return this.db ? this.db : ((this.db = await to()), this.db);
  }
  async _withRetries(e) {
    let t = 0;
    for (;;)
      try {
        const r = await this._openDb();
        return await e(r);
      } catch (r) {
        if (t++ > zy) throw r;
        this.db && (this.db.close(), (this.db = void 0));
      }
  }
  async initializeServiceWorkerMessaging() {
    return zh() ? this.initializeReceiver() : this.initializeSender();
  }
  async initializeReceiver() {
    ((this.receiver = Ks._getInstance(Uy())),
      this.receiver._subscribe('keyChanged', async (e, t) => ({
        keyProcessed: (await this._poll()).includes(t.key),
      })),
      this.receiver._subscribe('ping', async (e, t) => ['keyChanged']));
  }
  async initializeSender() {
    if (((this.activeServiceWorker = await xy()), !this.activeServiceWorker)) return;
    this.sender = new My(this.activeServiceWorker);
    const e = await this.sender._send('ping', {}, 800);
    e &&
      e[0]?.fulfilled &&
      e[0]?.value.includes('keyChanged') &&
      (this.serviceWorkerReceiverAvailable = !0);
  }
  async notifyServiceWorker(e) {
    if (!(!this.sender || !this.activeServiceWorker || Fy() !== this.activeServiceWorker))
      try {
        await this.sender._send(
          'keyChanged',
          { key: e },
          this.serviceWorkerReceiverAvailable ? 800 : 50
        );
      } catch {}
  }
  async _isAvailable() {
    try {
      if (!indexedDB) return !1;
      const e = await to();
      return (await vu(e, Ts, '1'), await wu(e, Ts), !0);
    } catch {}
    return !1;
  }
  async _withPendingWrite(e) {
    this.pendingWrites++;
    try {
      await e();
    } finally {
      this.pendingWrites--;
    }
  }
  async _set(e, t) {
    return this._withPendingWrite(
      async () => (
        await this._withRetries((r) => vu(r, e, t)),
        (this.localCache[e] = t),
        this.notifyServiceWorker(e)
      )
    );
  }
  async _get(e) {
    const t = await this._withRetries((r) => jy(r, e));
    return ((this.localCache[e] = t), t);
  }
  async _remove(e) {
    return this._withPendingWrite(
      async () => (
        await this._withRetries((t) => wu(t, e)),
        delete this.localCache[e],
        this.notifyServiceWorker(e)
      )
    );
  }
  async _poll() {
    const e = await this._withRetries((s) => {
      const o = Qs(s, !1).getAll();
      return new Tr(o).toPromise();
    });
    if (!e) return [];
    if (this.pendingWrites !== 0) return [];
    const t = [],
      r = new Set();
    if (e.length !== 0)
      for (const { fbase_key: s, value: o } of e)
        (r.add(s),
          JSON.stringify(this.localCache[s]) !== JSON.stringify(o) &&
            (this.notifyListeners(s, o), t.push(s)));
    for (const s of Object.keys(this.localCache))
      this.localCache[s] && !r.has(s) && (this.notifyListeners(s, null), t.push(s));
    return t;
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const r = this.listeners[e];
    if (r) for (const s of Array.from(r)) s(t);
  }
  startPolling() {
    (this.stopPolling(), (this.pollTimer = setInterval(async () => this._poll(), $y)));
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), (this.pollTimer = null));
  }
  _addListener(e, t) {
    (Object.keys(this.listeners).length === 0 && this.startPolling(),
      this.listeners[e] || ((this.listeners[e] = new Set()), this._get(e)),
      this.listeners[e].add(t));
  }
  _removeListener(e, t) {
    (this.listeners[e] &&
      (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]),
      Object.keys(this.listeners).length === 0 && this.stopPolling());
  }
}
Gh.type = 'LOCAL';
const Hy = Gh;
new yr(3e4, 6e4);
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function Zo(n, e) {
  return e ? Ze(e) : (L(n._popupRedirectResolver, n, 'argument-error'), n._popupRedirectResolver);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class ea extends Xo {
  constructor(e) {
    (super('custom', 'custom'), (this.params = e));
  }
  _getIdTokenResponse(e) {
    return cn(e, this._buildIdpRequest());
  }
  _linkToIdToken(e, t) {
    return cn(e, this._buildIdpRequest(t));
  }
  _getReauthenticationResolver(e) {
    return cn(e, this._buildIdpRequest());
  }
  _buildIdpRequest(e) {
    const t = {
      requestUri: this.params.requestUri,
      sessionId: this.params.sessionId,
      postBody: this.params.postBody,
      tenantId: this.params.tenantId,
      pendingToken: this.params.pendingToken,
      returnSecureToken: !0,
      returnIdpCredential: !0,
    };
    return (e && (t.idToken = e), t);
  }
}
function Wy(n) {
  return xh(n.auth, new ea(n), n.bypassAuthState);
}
function Gy(n) {
  const { auth: e, user: t } = n;
  return (L(t, e, 'internal-error'), Py(t, new ea(n), n.bypassAuthState));
}
async function Ky(n) {
  const { auth: e, user: t } = n;
  return (L(t, e, 'internal-error'), Sy(t, new ea(n), n.bypassAuthState));
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Kh {
  constructor(e, t, r, s, o = !1) {
    ((this.auth = e),
      (this.resolver = r),
      (this.user = s),
      (this.bypassAuthState = o),
      (this.pendingPromise = null),
      (this.eventManager = null),
      (this.filter = Array.isArray(t) ? t : [t]));
  }
  execute() {
    return new Promise(async (e, t) => {
      this.pendingPromise = { resolve: e, reject: t };
      try {
        ((this.eventManager = await this.resolver._initialize(this.auth)),
          await this.onExecution(),
          this.eventManager.registerConsumer(this));
      } catch (r) {
        this.reject(r);
      }
    });
  }
  async onAuthEvent(e) {
    const { urlResponse: t, sessionId: r, postBody: s, tenantId: o, error: a, type: u } = e;
    if (a) {
      this.reject(a);
      return;
    }
    const h = {
      auth: this.auth,
      requestUri: t,
      sessionId: r,
      tenantId: o || void 0,
      postBody: s || void 0,
      user: this.user,
      bypassAuthState: this.bypassAuthState,
    };
    try {
      this.resolve(await this.getIdpTask(u)(h));
    } catch (d) {
      this.reject(d);
    }
  }
  onError(e) {
    this.reject(e);
  }
  getIdpTask(e) {
    switch (e) {
      case 'signInViaPopup':
      case 'signInViaRedirect':
        return Wy;
      case 'linkViaPopup':
      case 'linkViaRedirect':
        return Ky;
      case 'reauthViaPopup':
      case 'reauthViaRedirect':
        return Gy;
      default:
        De(this.auth, 'internal-error');
    }
  }
  resolve(e) {
    (it(this.pendingPromise, 'Pending promise was never set'),
      this.pendingPromise.resolve(e),
      this.unregisterAndCleanUp());
  }
  reject(e) {
    (it(this.pendingPromise, 'Pending promise was never set'),
      this.pendingPromise.reject(e),
      this.unregisterAndCleanUp());
  }
  unregisterAndCleanUp() {
    (this.eventManager && this.eventManager.unregisterConsumer(this),
      (this.pendingPromise = null),
      this.cleanUp());
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Qy = new yr(2e3, 1e4);
async function hI(n, e, t) {
  if (Ae(n.app)) return Promise.reject(Le(n, 'operation-not-supported-in-this-environment'));
  const r = Ke(n);
  yh(n, e, Gs);
  const s = Zo(r, t);
  return new Ft(r, 'signInViaPopup', e, s).executeNotNull();
}
class Ft extends Kh {
  constructor(e, t, r, s, o) {
    (super(e, t, s, o),
      (this.provider = r),
      (this.authWindow = null),
      (this.pollId = null),
      Ft.currentPopupAction && Ft.currentPopupAction.cancel(),
      (Ft.currentPopupAction = this));
  }
  async executeNotNull() {
    const e = await this.execute();
    return (L(e, this.auth, 'internal-error'), e);
  }
  async onExecution() {
    it(this.filter.length === 1, 'Popup operations only handle one event');
    const e = Jo();
    ((this.authWindow = await this.resolver._openPopup(
      this.auth,
      this.provider,
      this.filter[0],
      e
    )),
      (this.authWindow.associatedEvent = e),
      this.resolver._originValidation(this.auth).catch((t) => {
        this.reject(t);
      }),
      this.resolver._isIframeWebStorageSupported(this.auth, (t) => {
        t || this.reject(Le(this.auth, 'web-storage-unsupported'));
      }),
      this.pollUserCancellation());
  }
  get eventId() {
    return this.authWindow?.associatedEvent || null;
  }
  cancel() {
    this.reject(Le(this.auth, 'cancelled-popup-request'));
  }
  cleanUp() {
    (this.authWindow && this.authWindow.close(),
      this.pollId && window.clearTimeout(this.pollId),
      (this.authWindow = null),
      (this.pollId = null),
      (Ft.currentPopupAction = null));
  }
  pollUserCancellation() {
    const e = () => {
      if (this.authWindow?.window?.closed) {
        this.pollId = window.setTimeout(() => {
          ((this.pollId = null), this.reject(Le(this.auth, 'popup-closed-by-user')));
        }, 8e3);
        return;
      }
      this.pollId = window.setTimeout(e, Qy.get());
    };
    e();
  }
}
Ft.currentPopupAction = null;
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const Yy = 'pendingRedirect',
  ts = new Map();
class Xy extends Kh {
  constructor(e, t, r = !1) {
    (super(
      e,
      ['signInViaRedirect', 'linkViaRedirect', 'reauthViaRedirect', 'unknown'],
      t,
      void 0,
      r
    ),
      (this.eventId = null));
  }
  async execute() {
    let e = ts.get(this.auth._key());
    if (!e) {
      try {
        const r = (await Jy(this.resolver, this.auth)) ? await super.execute() : null;
        e = () => Promise.resolve(r);
      } catch (t) {
        e = () => Promise.reject(t);
      }
      ts.set(this.auth._key(), e);
    }
    return (this.bypassAuthState || ts.set(this.auth._key(), () => Promise.resolve(null)), e());
  }
  async onAuthEvent(e) {
    if (e.type === 'signInViaRedirect') return super.onAuthEvent(e);
    if (e.type === 'unknown') {
      this.resolve(null);
      return;
    }
    if (e.eventId) {
      const t = await this.auth._redirectUserForId(e.eventId);
      if (t) return ((this.user = t), super.onAuthEvent(e));
      this.resolve(null);
    }
  }
  async onExecution() {}
  cleanUp() {}
}
async function Jy(n, e) {
  const t = Yh(e),
    r = Qh(n);
  if (!(await r._isAvailable())) return !1;
  const s = (await r._get(t)) === 'true';
  return (await r._remove(t), s);
}
async function Zy(n, e) {
  return Qh(n)._set(Yh(e), 'true');
}
function eE(n, e) {
  ts.set(n._key(), e);
}
function Qh(n) {
  return Ze(n._redirectPersistence);
}
function Yh(n) {
  return es(Yy, n.config.apiKey, n.name);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function dI(n, e, t) {
  return tE(n, e, t);
}
async function tE(n, e, t) {
  if (Ae(n.app)) return Promise.reject(xe(n));
  const r = Ke(n);
  (yh(n, e, Gs), await r._initializationPromise);
  const s = Zo(r, t);
  return (await Zy(s, r), s._openRedirect(r, e, 'signInViaRedirect'));
}
async function nE(n, e, t = !1) {
  if (Ae(n.app)) return Promise.reject(xe(n));
  const r = Ke(n),
    s = Zo(r, e),
    a = await new Xy(r, s, t).execute();
  return (
    a &&
      !t &&
      (delete a.user._redirectEventId,
      await r._persistUserIfCurrent(a.user),
      await r._setRedirectUser(null, e)),
    a
  );
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const rE = 600 * 1e3;
class sE {
  constructor(e) {
    ((this.auth = e),
      (this.cachedEventUids = new Set()),
      (this.consumers = new Set()),
      (this.queuedRedirectEvent = null),
      (this.hasHandledPotentialRedirect = !1),
      (this.lastProcessedEventTime = Date.now()));
  }
  registerConsumer(e) {
    (this.consumers.add(e),
      this.queuedRedirectEvent &&
        this.isEventForConsumer(this.queuedRedirectEvent, e) &&
        (this.sendToConsumer(this.queuedRedirectEvent, e),
        this.saveEventToCache(this.queuedRedirectEvent),
        (this.queuedRedirectEvent = null)));
  }
  unregisterConsumer(e) {
    this.consumers.delete(e);
  }
  onEvent(e) {
    if (this.hasEventBeenHandled(e)) return !1;
    let t = !1;
    return (
      this.consumers.forEach((r) => {
        this.isEventForConsumer(e, r) &&
          ((t = !0), this.sendToConsumer(e, r), this.saveEventToCache(e));
      }),
      this.hasHandledPotentialRedirect ||
        !iE(e) ||
        ((this.hasHandledPotentialRedirect = !0), t || ((this.queuedRedirectEvent = e), (t = !0))),
      t
    );
  }
  sendToConsumer(e, t) {
    if (e.error && !Xh(e)) {
      const r = e.error.code?.split('auth/')[1] || 'internal-error';
      t.onError(Le(this.auth, r));
    } else t.onAuthEvent(e);
  }
  isEventForConsumer(e, t) {
    const r = t.eventId === null || (!!e.eventId && e.eventId === t.eventId);
    return t.filter.includes(e.type) && r;
  }
  hasEventBeenHandled(e) {
    return (
      Date.now() - this.lastProcessedEventTime >= rE && this.cachedEventUids.clear(),
      this.cachedEventUids.has(Au(e))
    );
  }
  saveEventToCache(e) {
    (this.cachedEventUids.add(Au(e)), (this.lastProcessedEventTime = Date.now()));
  }
}
function Au(n) {
  return [n.type, n.eventId, n.sessionId, n.tenantId].filter((e) => e).join('-');
}
function Xh({ type: n, error: e }) {
  return n === 'unknown' && e?.code === 'auth/no-auth-event';
}
function iE(n) {
  switch (n.type) {
    case 'signInViaRedirect':
    case 'linkViaRedirect':
    case 'reauthViaRedirect':
      return !0;
    case 'unknown':
      return Xh(n);
    default:
      return !1;
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function oE(n, e = {}) {
  return Ge(n, 'GET', '/v1/projects', e);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const aE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  cE = /^https?/;
async function uE(n) {
  if (n.config.emulator) return;
  const { authorizedDomains: e } = await oE(n);
  for (const t of e)
    try {
      if (lE(t)) return;
    } catch {}
  De(n, 'unauthorized-domain');
}
function lE(n) {
  const e = gs(),
    { protocol: t, hostname: r } = new URL(e);
  if (n.startsWith('chrome-extension://')) {
    const a = new URL(n);
    return a.hostname === '' && r === ''
      ? t === 'chrome-extension:' &&
          n.replace('chrome-extension://', '') === e.replace('chrome-extension://', '')
      : t === 'chrome-extension:' && a.hostname === r;
  }
  if (!cE.test(t)) return !1;
  if (aE.test(n)) return r === n;
  const s = n.replace(/\./g, '\\.');
  return new RegExp('^(.+\\.' + s + '|' + s + ')$', 'i').test(r);
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const hE = new yr(3e4, 6e4);
function Ru() {
  const n = He().___jsl;
  if (n?.H) {
    for (const e of Object.keys(n.H))
      if (
        ((n.H[e].r = n.H[e].r || []), (n.H[e].L = n.H[e].L || []), (n.H[e].r = [...n.H[e].L]), n.CP)
      )
        for (let t = 0; t < n.CP.length; t++) n.CP[t] = null;
  }
}
function dE(n) {
  return new Promise((e, t) => {
    function r() {
      (Ru(),
        gapi.load('gapi.iframes', {
          callback: () => {
            e(gapi.iframes.getContext());
          },
          ontimeout: () => {
            (Ru(), t(Le(n, 'network-request-failed')));
          },
          timeout: hE.get(),
        }));
    }
    if (He().gapi?.iframes?.Iframe) e(gapi.iframes.getContext());
    else if (He().gapi?.load) r();
    else {
      const s = oy('iframefcb');
      return (
        (He()[s] = () => {
          gapi.load ? r() : t(Le(n, 'network-request-failed'));
        }),
        Dh(`${iy()}?onload=${s}`).catch((o) => t(o))
      );
    }
  }).catch((e) => {
    throw ((ns = null), e);
  });
}
let ns = null;
function fE(n) {
  return ((ns = ns || dE(n)), ns);
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const pE = new yr(5e3, 15e3),
  mE = '__/auth/iframe',
  gE = 'emulator/auth/iframe',
  _E = {
    style: { position: 'absolute', top: '-100px', width: '1px', height: '1px' },
    'aria-hidden': 'true',
    tabindex: '-1',
  },
  yE = new Map([
    ['identitytoolkit.googleapis.com', 'p'],
    ['staging-identitytoolkit.sandbox.googleapis.com', 's'],
    ['test-identitytoolkit.sandbox.googleapis.com', 't'],
  ]);
function EE(n) {
  const e = n.config;
  L(e.authDomain, n, 'auth-domain-config-required');
  const t = e.emulator ? Ko(e, gE) : `https://${n.config.authDomain}/${mE}`,
    r = { apiKey: e.apiKey, appName: n.name, v: _n },
    s = yE.get(n.config.apiHost);
  s && (r.eid = s);
  const o = n._getFrameworks();
  return (o.length && (r.fw = o.join(',')), `${t}?${hr(r).slice(1)}`);
}
async function IE(n) {
  const e = await fE(n),
    t = He().gapi;
  return (
    L(t, n, 'internal-error'),
    e.open(
      {
        where: document.body,
        url: EE(n),
        messageHandlersFilter: t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
        attributes: _E,
        dontclear: !0,
      },
      (r) =>
        new Promise(async (s, o) => {
          await r.restyle({ setHideOnLeave: !1 });
          const a = Le(n, 'network-request-failed'),
            u = He().setTimeout(() => {
              o(a);
            }, pE.get());
          function h() {
            (He().clearTimeout(u), s(r));
          }
          r.ping(h).then(h, () => {
            o(a);
          });
        })
    )
  );
}
/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const TE = { location: 'yes', resizable: 'yes', statusbar: 'yes', toolbar: 'no' },
  vE = 500,
  wE = 600,
  AE = '_blank',
  RE = 'http://localhost';
class Su {
  constructor(e) {
    ((this.window = e), (this.associatedEvent = null));
  }
  close() {
    if (this.window)
      try {
        this.window.close();
      } catch {}
  }
}
function SE(n, e, t, r = vE, s = wE) {
  const o = Math.max((window.screen.availHeight - s) / 2, 0).toString(),
    a = Math.max((window.screen.availWidth - r) / 2, 0).toString();
  let u = '';
  const h = { ...TE, width: r.toString(), height: s.toString(), top: o, left: a },
    d = Te().toLowerCase();
  (t && (u = Sh(d) ? AE : t), Ah(d) && ((e = e || RE), (h.scrollbars = 'yes')));
  const p = Object.entries(h).reduce((y, [C, b]) => `${y}${C}=${b},`, '');
  if (Y_(d) && u !== '_self') return (PE(e || '', u), new Su(null));
  const E = window.open(e || '', u, p);
  L(E, n, 'popup-blocked');
  try {
    E.focus();
  } catch {}
  return new Su(E);
}
function PE(n, e) {
  const t = document.createElement('a');
  ((t.href = n), (t.target = e));
  const r = document.createEvent('MouseEvent');
  (r.initMouseEvent('click', !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null),
    t.dispatchEvent(r));
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const CE = '__/auth/handler',
  bE = 'emulator/auth/handler',
  VE = encodeURIComponent('fac');
async function Pu(n, e, t, r, s, o) {
  (L(n.config.authDomain, n, 'auth-domain-config-required'),
    L(n.config.apiKey, n, 'invalid-api-key'));
  const a = {
    apiKey: n.config.apiKey,
    appName: n.name,
    authType: t,
    redirectUrl: r,
    v: _n,
    eventId: s,
  };
  if (e instanceof Gs) {
    (e.setDefaultLanguage(n.languageCode),
      (a.providerId = e.providerId || ''),
      sf(e.getCustomParameters()) ||
        (a.customParameters = JSON.stringify(e.getCustomParameters())));
    for (const [p, E] of Object.entries({})) a[p] = E;
  }
  if (e instanceof Ir) {
    const p = e.getScopes().filter((E) => E !== '');
    p.length > 0 && (a.scopes = p.join(','));
  }
  n.tenantId && (a.tid = n.tenantId);
  const u = a;
  for (const p of Object.keys(u)) u[p] === void 0 && delete u[p];
  const h = await n._getAppCheckToken(),
    d = h ? `#${VE}=${encodeURIComponent(h)}` : '';
  return `${kE(n)}?${hr(u).slice(1)}${d}`;
}
function kE({ config: n }) {
  return n.emulator ? Ko(n, bE) : `https://${n.authDomain}/${CE}`;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ki = 'webStorageSupport';
class NE {
  constructor() {
    ((this.eventManagers = {}),
      (this.iframes = {}),
      (this.originValidationPromises = {}),
      (this._redirectPersistence = $h),
      (this._completeRedirectFn = nE),
      (this._overrideRedirectResult = eE));
  }
  async _openPopup(e, t, r, s) {
    it(this.eventManagers[e._key()]?.manager, '_initialize() not called before _openPopup()');
    const o = await Pu(e, t, r, gs(), s);
    return SE(e, o, Jo());
  }
  async _openRedirect(e, t, r, s) {
    await this._originValidation(e);
    const o = await Pu(e, t, r, gs(), s);
    return (Ly(o), new Promise(() => {}));
  }
  _initialize(e) {
    const t = e._key();
    if (this.eventManagers[t]) {
      const { manager: s, promise: o } = this.eventManagers[t];
      return s ? Promise.resolve(s) : (it(o, 'If manager is not set, promise should be'), o);
    }
    const r = this.initAndGetManager(e);
    return (
      (this.eventManagers[t] = { promise: r }),
      r.catch(() => {
        delete this.eventManagers[t];
      }),
      r
    );
  }
  async initAndGetManager(e) {
    const t = await IE(e),
      r = new sE(e);
    return (
      t.register(
        'authEvent',
        (s) => (
          L(s?.authEvent, e, 'invalid-auth-event'),
          { status: r.onEvent(s.authEvent) ? 'ACK' : 'ERROR' }
        ),
        gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER
      ),
      (this.eventManagers[e._key()] = { manager: r }),
      (this.iframes[e._key()] = t),
      r
    );
  }
  _isIframeWebStorageSupported(e, t) {
    this.iframes[e._key()].send(
      ki,
      { type: ki },
      (s) => {
        const o = s?.[0]?.[ki];
        (o !== void 0 && t(!!o), De(e, 'internal-error'));
      },
      gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER
    );
  }
  _originValidation(e) {
    const t = e._key();
    return (
      this.originValidationPromises[t] || (this.originValidationPromises[t] = uE(e)),
      this.originValidationPromises[t]
    );
  }
  get _shouldInitProactively() {
    return kh() || Rh() || Yo();
  }
}
const DE = NE;
var Cu = '@firebase/auth',
  bu = '1.11.0';
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class OE {
  constructor(e) {
    ((this.auth = e), (this.internalListeners = new Map()));
  }
  getUid() {
    return (this.assertAuthConfigured(), this.auth.currentUser?.uid || null);
  }
  async getToken(e) {
    return (
      this.assertAuthConfigured(),
      await this.auth._initializationPromise,
      this.auth.currentUser ? { accessToken: await this.auth.currentUser.getIdToken(e) } : null
    );
  }
  addAuthTokenListener(e) {
    if ((this.assertAuthConfigured(), this.internalListeners.has(e))) return;
    const t = this.auth.onIdTokenChanged((r) => {
      e(r?.stsTokenManager.accessToken || null);
    });
    (this.internalListeners.set(e, t), this.updateProactiveRefresh());
  }
  removeAuthTokenListener(e) {
    this.assertAuthConfigured();
    const t = this.internalListeners.get(e);
    t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
  }
  assertAuthConfigured() {
    L(this.auth._initializationPromise, 'dependent-sdk-initialized-before-auth');
  }
  updateProactiveRefresh() {
    this.internalListeners.size > 0
      ? this.auth._startProactiveRefresh()
      : this.auth._stopProactiveRefresh();
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function ME(n) {
  switch (n) {
    case 'Node':
      return 'node';
    case 'ReactNative':
      return 'rn';
    case 'Worker':
      return 'webworker';
    case 'Cordova':
      return 'cordova';
    case 'WebExtension':
      return 'web-extension';
    default:
      return;
  }
}
function LE(n) {
  (un(
    new jt(
      'auth',
      (e, { options: t }) => {
        const r = e.getProvider('app').getImmediate(),
          s = e.getProvider('heartbeat'),
          o = e.getProvider('app-check-internal'),
          { apiKey: a, authDomain: u } = r.options;
        L(a && !a.includes(':'), 'invalid-api-key', { appName: r.name });
        const h = {
            apiKey: a,
            authDomain: u,
            clientPlatform: n,
            apiHost: 'identitytoolkit.googleapis.com',
            tokenApiHost: 'securetoken.googleapis.com',
            apiScheme: 'https',
            sdkClientVersion: Nh(n),
          },
          d = new ny(r, s, o, h);
        return (dy(d, t), d);
      },
      'PUBLIC'
    )
      .setInstantiationMode('EXPLICIT')
      .setInstanceCreatedCallback((e, t, r) => {
        e.getProvider('auth-internal').initialize();
      })
  ),
    un(
      new jt(
        'auth-internal',
        (e) => {
          const t = Ke(e.getProvider('auth').getImmediate());
          return ((r) => new OE(r))(t);
        },
        'PRIVATE'
      ).setInstantiationMode('EXPLICIT')
    ),
    Tt(Cu, bu, ME(n)),
    Tt(Cu, bu, 'esm2020'));
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const xE = 300,
  FE = Lu('authIdTokenMaxAge') || xE;
let Vu = null;
const UE = (n) => async (e) => {
  const t = e && (await e.getIdTokenResult()),
    r = t && (new Date().getTime() - Date.parse(t.issuedAtTime)) / 1e3;
  if (r && r > FE) return;
  const s = t?.token;
  Vu !== s &&
    ((Vu = s),
    await fetch(n, {
      method: s ? 'POST' : 'DELETE',
      headers: s ? { Authorization: `Bearer ${s}` } : {},
    }));
};
function fI(n = cp()) {
  const e = so(n, 'auth');
  if (e.isInitialized()) return e.getImmediate();
  const t = hy(n, { popupRedirectResolver: DE, persistence: [Hy, Dy, $h] }),
    r = Lu('authTokenSyncURL');
  if (r && typeof isSecureContext == 'boolean' && isSecureContext) {
    const o = new URL(r, location.origin);
    if (location.origin === o.origin) {
      const a = UE(o.toString());
      (Vy(t, a, () => a(t.currentUser)), by(t, (u) => a(u)));
    }
  }
  const s = qd('auth');
  return (s && fy(t, `http://${s}`), t);
}
function BE() {
  return document.getElementsByTagName('head')?.[0] ?? document;
}
ry({
  loadJS(n) {
    return new Promise((e, t) => {
      const r = document.createElement('script');
      (r.setAttribute('src', n),
        (r.onload = e),
        (r.onerror = (s) => {
          const o = Le('internal-error');
          ((o.customData = s), t(o));
        }),
        (r.type = 'text/javascript'),
        (r.charset = 'UTF-8'),
        BE().appendChild(r));
    });
  },
  gapiScript: 'https://apis.google.com/js/api.js',
  recaptchaV2Script: 'https://www.google.com/recaptcha/api.js',
  recaptchaEnterpriseScript: 'https://www.google.com/recaptcha/enterprise.js?render=',
});
LE('Browser');
export {
  eI as A,
  JE as B,
  ZE as C,
  pt as F,
  mt as G,
  cp as a,
  zE as b,
  fI as c,
  oI as d,
  lI as e,
  hI as f,
  qE as g,
  dI as h,
  ap as i,
  sI as j,
  iI as k,
  rI as l,
  y_ as m,
  XE as n,
  QE as o,
  $E as p,
  YE as q,
  HE as r,
  aI as s,
  KE as t,
  cI as u,
  uI as v,
  tI as w,
  GE as x,
  WE as y,
  nI as z,
};
