import { r as y, a as Zd, R as My } from './router-mfh82qsn-Bc5I10Ra.js';
import { g as Mt, r as Pu } from './vendor-mfh82qsn-D3F3s8fL.js';
function Jd(e) {
  var t,
    r,
    n = '';
  if (typeof e == 'string' || typeof e == 'number') n += e;
  else if (typeof e == 'object')
    if (Array.isArray(e)) {
      var i = e.length;
      for (t = 0; t < i; t++) e[t] && (r = Jd(e[t])) && (n && (n += ' '), (n += r));
    } else for (r in e) e[r] && (n && (n += ' '), (n += r));
  return n;
}
function K() {
  for (var e, t, r = 0, n = '', i = arguments.length; r < i; r++)
    (e = arguments[r]) && (t = Jd(e)) && (n && (n += ' '), (n += t));
  return n;
}
var Yi = {},
  Gi = {},
  uc;
function ky() {
  return (
    uc ||
      ((uc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return r === '__proto__';
        }
        e.isUnsafeProperty = t;
      })(Gi)),
    Gi
  );
}
var Vi = {},
  lc;
function Qd() {
  return (
    lc ||
      ((lc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          switch (typeof r) {
            case 'number':
            case 'symbol':
              return !1;
            case 'string':
              return r.includes('.') || r.includes('[') || r.includes(']');
          }
        }
        e.isDeepKey = t;
      })(Vi)),
    Vi
  );
}
var Xi = {},
  cc;
function eh() {
  return (
    cc ||
      ((cc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return typeof r == 'string' || typeof r == 'symbol'
            ? r
            : Object.is(r?.valueOf?.(), -0)
              ? '-0'
              : String(r);
        }
        e.toKey = t;
      })(Xi)),
    Xi
  );
}
var Zi = {},
  sc;
function Ou() {
  return (
    sc ||
      ((sc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          const n = [],
            i = r.length;
          if (i === 0) return n;
          let a = 0,
            o = '',
            u = '',
            l = !1;
          for (r.charCodeAt(0) === 46 && (n.push(''), a++); a < i; ) {
            const s = r[a];
            (u
              ? s === '\\' && a + 1 < i
                ? (a++, (o += r[a]))
                : s === u
                  ? (u = '')
                  : (o += s)
              : l
                ? s === '"' || s === "'"
                  ? (u = s)
                  : s === ']'
                    ? ((l = !1), n.push(o), (o = ''))
                    : (o += s)
                : s === '['
                  ? ((l = !0), o && (n.push(o), (o = '')))
                  : s === '.'
                    ? o && (n.push(o), (o = ''))
                    : (o += s),
              a++);
          }
          return (o && n.push(o), n);
        }
        e.toPath = t;
      })(Zi)),
    Zi
  );
}
var fc;
function Au() {
  return (
    fc ||
      ((fc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = ky(),
          r = Qd(),
          n = eh(),
          i = Ou();
        function a(u, l, s) {
          if (u == null) return s;
          switch (typeof l) {
            case 'string': {
              if (t.isUnsafeProperty(l)) return s;
              const c = u[l];
              return c === void 0 ? (r.isDeepKey(l) ? a(u, i.toPath(l), s) : s) : c;
            }
            case 'number':
            case 'symbol': {
              typeof l == 'number' && (l = n.toKey(l));
              const c = u[l];
              return c === void 0 ? s : c;
            }
            default: {
              if (Array.isArray(l)) return o(u, l, s);
              if (
                (Object.is(l?.valueOf(), -0) ? (l = '-0') : (l = String(l)), t.isUnsafeProperty(l))
              )
                return s;
              const c = u[l];
              return c === void 0 ? s : c;
            }
          }
        }
        function o(u, l, s) {
          if (l.length === 0) return s;
          let c = u;
          for (let f = 0; f < l.length; f++) {
            if (c == null || t.isUnsafeProperty(l[f])) return s;
            c = c[l[f]];
          }
          return c === void 0 ? s : c;
        }
        e.get = a;
      })(Yi)),
    Yi
  );
}
var Ji, dc;
function Iy() {
  return (dc || ((dc = 1), (Ji = Au().get)), Ji);
}
var Dy = Iy();
const Jt = Mt(Dy);
var Qi = { exports: {} },
  W = {};
/**
 * @license React
 * react-is.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var hc;
function Ny() {
  if (hc) return W;
  hc = 1;
  var e = Symbol.for('react.transitional.element'),
    t = Symbol.for('react.portal'),
    r = Symbol.for('react.fragment'),
    n = Symbol.for('react.strict_mode'),
    i = Symbol.for('react.profiler'),
    a = Symbol.for('react.consumer'),
    o = Symbol.for('react.context'),
    u = Symbol.for('react.forward_ref'),
    l = Symbol.for('react.suspense'),
    s = Symbol.for('react.suspense_list'),
    c = Symbol.for('react.memo'),
    f = Symbol.for('react.lazy'),
    d = Symbol.for('react.view_transition'),
    h = Symbol.for('react.client.reference');
  function v(p) {
    if (typeof p == 'object' && p !== null) {
      var m = p.$$typeof;
      switch (m) {
        case e:
          switch (((p = p.type), p)) {
            case r:
            case i:
            case n:
            case l:
            case s:
            case d:
              return p;
            default:
              switch (((p = p && p.$$typeof), p)) {
                case o:
                case u:
                case f:
                case c:
                  return p;
                case a:
                  return p;
                default:
                  return m;
              }
          }
        case t:
          return m;
      }
    }
  }
  return (
    (W.ContextConsumer = a),
    (W.ContextProvider = o),
    (W.Element = e),
    (W.ForwardRef = u),
    (W.Fragment = r),
    (W.Lazy = f),
    (W.Memo = c),
    (W.Portal = t),
    (W.Profiler = i),
    (W.StrictMode = n),
    (W.Suspense = l),
    (W.SuspenseList = s),
    (W.isContextConsumer = function (p) {
      return v(p) === a;
    }),
    (W.isContextProvider = function (p) {
      return v(p) === o;
    }),
    (W.isElement = function (p) {
      return typeof p == 'object' && p !== null && p.$$typeof === e;
    }),
    (W.isForwardRef = function (p) {
      return v(p) === u;
    }),
    (W.isFragment = function (p) {
      return v(p) === r;
    }),
    (W.isLazy = function (p) {
      return v(p) === f;
    }),
    (W.isMemo = function (p) {
      return v(p) === c;
    }),
    (W.isPortal = function (p) {
      return v(p) === t;
    }),
    (W.isProfiler = function (p) {
      return v(p) === i;
    }),
    (W.isStrictMode = function (p) {
      return v(p) === n;
    }),
    (W.isSuspense = function (p) {
      return v(p) === l;
    }),
    (W.isSuspenseList = function (p) {
      return v(p) === s;
    }),
    (W.isValidElementType = function (p) {
      return (
        typeof p == 'string' ||
        typeof p == 'function' ||
        p === r ||
        p === i ||
        p === n ||
        p === l ||
        p === s ||
        (typeof p == 'object' &&
          p !== null &&
          (p.$$typeof === f ||
            p.$$typeof === c ||
            p.$$typeof === o ||
            p.$$typeof === a ||
            p.$$typeof === u ||
            p.$$typeof === h ||
            p.getModuleId !== void 0))
      );
    }),
    (W.typeOf = v),
    W
  );
}
var vc;
function $y() {
  return (vc || ((vc = 1), (Qi.exports = Ny())), Qi.exports);
}
var Ry = $y(),
  Ue = (e) => (e === 0 ? 0 : e > 0 ? 1 : -1),
  $e = (e) => typeof e == 'number' && e != +e,
  Ft = (e) => typeof e == 'string' && e.indexOf('%') === e.length - 1,
  k = (e) => (typeof e == 'number' || e instanceof Number) && !$e(e),
  it = (e) => k(e) || typeof e == 'string',
  Ly = 0,
  zr = (e) => {
    var t = ++Ly;
    return ''.concat(e || '').concat(t);
  },
  jt = function (t, r) {
    var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0,
      i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
    if (!k(t) && typeof t != 'string') return n;
    var a;
    if (Ft(t)) {
      if (r == null) return n;
      var o = t.indexOf('%');
      a = (r * parseFloat(t.slice(0, o))) / 100;
    } else a = +t;
    return ($e(a) && (a = n), i && r != null && a > r && (a = r), a);
  },
  th = (e) => {
    if (!Array.isArray(e)) return !1;
    for (var t = e.length, r = {}, n = 0; n < t; n++)
      if (!r[e[n]]) r[e[n]] = !0;
      else return !0;
    return !1;
  };
function Xe(e, t, r) {
  return k(e) && k(t) ? e + r * (t - e) : t;
}
function rh(e, t, r) {
  if (!(!e || !e.length))
    return e.find((n) => n && (typeof t == 'function' ? t(n) : Jt(n, t)) === r);
}
var te = (e) => e === null || typeof e > 'u',
  Qr = (e) => (te(e) ? e : ''.concat(e.charAt(0).toUpperCase()).concat(e.slice(1))),
  By = [
    'dangerouslySetInnerHTML',
    'onCopy',
    'onCopyCapture',
    'onCut',
    'onCutCapture',
    'onPaste',
    'onPasteCapture',
    'onCompositionEnd',
    'onCompositionEndCapture',
    'onCompositionStart',
    'onCompositionStartCapture',
    'onCompositionUpdate',
    'onCompositionUpdateCapture',
    'onFocus',
    'onFocusCapture',
    'onBlur',
    'onBlurCapture',
    'onChange',
    'onChangeCapture',
    'onBeforeInput',
    'onBeforeInputCapture',
    'onInput',
    'onInputCapture',
    'onReset',
    'onResetCapture',
    'onSubmit',
    'onSubmitCapture',
    'onInvalid',
    'onInvalidCapture',
    'onLoad',
    'onLoadCapture',
    'onError',
    'onErrorCapture',
    'onKeyDown',
    'onKeyDownCapture',
    'onKeyPress',
    'onKeyPressCapture',
    'onKeyUp',
    'onKeyUpCapture',
    'onAbort',
    'onAbortCapture',
    'onCanPlay',
    'onCanPlayCapture',
    'onCanPlayThrough',
    'onCanPlayThroughCapture',
    'onDurationChange',
    'onDurationChangeCapture',
    'onEmptied',
    'onEmptiedCapture',
    'onEncrypted',
    'onEncryptedCapture',
    'onEnded',
    'onEndedCapture',
    'onLoadedData',
    'onLoadedDataCapture',
    'onLoadedMetadata',
    'onLoadedMetadataCapture',
    'onLoadStart',
    'onLoadStartCapture',
    'onPause',
    'onPauseCapture',
    'onPlay',
    'onPlayCapture',
    'onPlaying',
    'onPlayingCapture',
    'onProgress',
    'onProgressCapture',
    'onRateChange',
    'onRateChangeCapture',
    'onSeeked',
    'onSeekedCapture',
    'onSeeking',
    'onSeekingCapture',
    'onStalled',
    'onStalledCapture',
    'onSuspend',
    'onSuspendCapture',
    'onTimeUpdate',
    'onTimeUpdateCapture',
    'onVolumeChange',
    'onVolumeChangeCapture',
    'onWaiting',
    'onWaitingCapture',
    'onAuxClick',
    'onAuxClickCapture',
    'onClick',
    'onClickCapture',
    'onContextMenu',
    'onContextMenuCapture',
    'onDoubleClick',
    'onDoubleClickCapture',
    'onDrag',
    'onDragCapture',
    'onDragEnd',
    'onDragEndCapture',
    'onDragEnter',
    'onDragEnterCapture',
    'onDragExit',
    'onDragExitCapture',
    'onDragLeave',
    'onDragLeaveCapture',
    'onDragOver',
    'onDragOverCapture',
    'onDragStart',
    'onDragStartCapture',
    'onDrop',
    'onDropCapture',
    'onMouseDown',
    'onMouseDownCapture',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseMoveCapture',
    'onMouseOut',
    'onMouseOutCapture',
    'onMouseOver',
    'onMouseOverCapture',
    'onMouseUp',
    'onMouseUpCapture',
    'onSelect',
    'onSelectCapture',
    'onTouchCancel',
    'onTouchCancelCapture',
    'onTouchEnd',
    'onTouchEndCapture',
    'onTouchMove',
    'onTouchMoveCapture',
    'onTouchStart',
    'onTouchStartCapture',
    'onPointerDown',
    'onPointerDownCapture',
    'onPointerMove',
    'onPointerMoveCapture',
    'onPointerUp',
    'onPointerUpCapture',
    'onPointerCancel',
    'onPointerCancelCapture',
    'onPointerEnter',
    'onPointerEnterCapture',
    'onPointerLeave',
    'onPointerLeaveCapture',
    'onPointerOver',
    'onPointerOverCapture',
    'onPointerOut',
    'onPointerOutCapture',
    'onGotPointerCapture',
    'onGotPointerCaptureCapture',
    'onLostPointerCapture',
    'onLostPointerCaptureCapture',
    'onScroll',
    'onScrollCapture',
    'onWheel',
    'onWheelCapture',
    'onAnimationStart',
    'onAnimationStartCapture',
    'onAnimationEnd',
    'onAnimationEndCapture',
    'onAnimationIteration',
    'onAnimationIterationCapture',
    'onTransitionEnd',
    'onTransitionEndCapture',
  ];
function Su(e) {
  if (typeof e != 'string') return !1;
  var t = By;
  return t.includes(e);
}
var qy = ['viewBox', 'children'],
  pc = ['points', 'pathLength'],
  ea = { svg: qy, polygon: pc, polyline: pc },
  Eu = (e, t) => {
    if (!e || typeof e == 'function' || typeof e == 'boolean') return null;
    var r = e;
    if ((y.isValidElement(e) && (r = e.props), typeof r != 'object' && typeof r != 'function'))
      return null;
    var n = {};
    return (
      Object.keys(r).forEach((i) => {
        Su(i) && (n[i] = (a) => r[i](r, a));
      }),
      n
    );
  },
  zy = (e, t, r) => (n) => (e(t, r, n), null),
  nh = (e, t, r) => {
    if (e === null || (typeof e != 'object' && typeof e != 'function')) return null;
    var n = null;
    return (
      Object.keys(e).forEach((i) => {
        var a = e[i];
        Su(i) && typeof a == 'function' && (n || (n = {}), (n[i] = zy(a, t, r)));
      }),
      n
    );
  },
  Fy = [
    'aria-activedescendant',
    'aria-atomic',
    'aria-autocomplete',
    'aria-busy',
    'aria-checked',
    'aria-colcount',
    'aria-colindex',
    'aria-colspan',
    'aria-controls',
    'aria-current',
    'aria-describedby',
    'aria-details',
    'aria-disabled',
    'aria-errormessage',
    'aria-expanded',
    'aria-flowto',
    'aria-haspopup',
    'aria-hidden',
    'aria-invalid',
    'aria-keyshortcuts',
    'aria-label',
    'aria-labelledby',
    'aria-level',
    'aria-live',
    'aria-modal',
    'aria-multiline',
    'aria-multiselectable',
    'aria-orientation',
    'aria-owns',
    'aria-placeholder',
    'aria-posinset',
    'aria-pressed',
    'aria-readonly',
    'aria-relevant',
    'aria-required',
    'aria-roledescription',
    'aria-rowcount',
    'aria-rowindex',
    'aria-rowspan',
    'aria-selected',
    'aria-setsize',
    'aria-sort',
    'aria-valuemax',
    'aria-valuemin',
    'aria-valuenow',
    'aria-valuetext',
    'className',
    'color',
    'height',
    'id',
    'lang',
    'max',
    'media',
    'method',
    'min',
    'name',
    'style',
    'target',
    'width',
    'role',
    'tabIndex',
    'accentHeight',
    'accumulate',
    'additive',
    'alignmentBaseline',
    'allowReorder',
    'alphabetic',
    'amplitude',
    'arabicForm',
    'ascent',
    'attributeName',
    'attributeType',
    'autoReverse',
    'azimuth',
    'baseFrequency',
    'baselineShift',
    'baseProfile',
    'bbox',
    'begin',
    'bias',
    'by',
    'calcMode',
    'capHeight',
    'clip',
    'clipPath',
    'clipPathUnits',
    'clipRule',
    'colorInterpolation',
    'colorInterpolationFilters',
    'colorProfile',
    'colorRendering',
    'contentScriptType',
    'contentStyleType',
    'cursor',
    'cx',
    'cy',
    'd',
    'decelerate',
    'descent',
    'diffuseConstant',
    'direction',
    'display',
    'divisor',
    'dominantBaseline',
    'dur',
    'dx',
    'dy',
    'edgeMode',
    'elevation',
    'enableBackground',
    'end',
    'exponent',
    'externalResourcesRequired',
    'fill',
    'fillOpacity',
    'fillRule',
    'filter',
    'filterRes',
    'filterUnits',
    'floodColor',
    'floodOpacity',
    'focusable',
    'fontFamily',
    'fontSize',
    'fontSizeAdjust',
    'fontStretch',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'format',
    'from',
    'fx',
    'fy',
    'g1',
    'g2',
    'glyphName',
    'glyphOrientationHorizontal',
    'glyphOrientationVertical',
    'glyphRef',
    'gradientTransform',
    'gradientUnits',
    'hanging',
    'horizAdvX',
    'horizOriginX',
    'href',
    'ideographic',
    'imageRendering',
    'in2',
    'in',
    'intercept',
    'k1',
    'k2',
    'k3',
    'k4',
    'k',
    'kernelMatrix',
    'kernelUnitLength',
    'kerning',
    'keyPoints',
    'keySplines',
    'keyTimes',
    'lengthAdjust',
    'letterSpacing',
    'lightingColor',
    'limitingConeAngle',
    'local',
    'markerEnd',
    'markerHeight',
    'markerMid',
    'markerStart',
    'markerUnits',
    'markerWidth',
    'mask',
    'maskContentUnits',
    'maskUnits',
    'mathematical',
    'mode',
    'numOctaves',
    'offset',
    'opacity',
    'operator',
    'order',
    'orient',
    'orientation',
    'origin',
    'overflow',
    'overlinePosition',
    'overlineThickness',
    'paintOrder',
    'panose1',
    'pathLength',
    'patternContentUnits',
    'patternTransform',
    'patternUnits',
    'pointerEvents',
    'pointsAtX',
    'pointsAtY',
    'pointsAtZ',
    'preserveAlpha',
    'preserveAspectRatio',
    'primitiveUnits',
    'r',
    'radius',
    'refX',
    'refY',
    'renderingIntent',
    'repeatCount',
    'repeatDur',
    'requiredExtensions',
    'requiredFeatures',
    'restart',
    'result',
    'rotate',
    'rx',
    'ry',
    'seed',
    'shapeRendering',
    'slope',
    'spacing',
    'specularConstant',
    'specularExponent',
    'speed',
    'spreadMethod',
    'startOffset',
    'stdDeviation',
    'stemh',
    'stemv',
    'stitchTiles',
    'stopColor',
    'stopOpacity',
    'strikethroughPosition',
    'strikethroughThickness',
    'string',
    'stroke',
    'strokeDasharray',
    'strokeDashoffset',
    'strokeLinecap',
    'strokeLinejoin',
    'strokeMiterlimit',
    'strokeOpacity',
    'strokeWidth',
    'surfaceScale',
    'systemLanguage',
    'tableValues',
    'targetX',
    'targetY',
    'textAnchor',
    'textDecoration',
    'textLength',
    'textRendering',
    'to',
    'transform',
    'u1',
    'u2',
    'underlinePosition',
    'underlineThickness',
    'unicode',
    'unicodeBidi',
    'unicodeRange',
    'unitsPerEm',
    'vAlphabetic',
    'values',
    'vectorEffect',
    'version',
    'vertAdvY',
    'vertOriginX',
    'vertOriginY',
    'vHanging',
    'vIdeographic',
    'viewTarget',
    'visibility',
    'vMathematical',
    'widths',
    'wordSpacing',
    'writingMode',
    'x1',
    'x2',
    'x',
    'xChannelSelector',
    'xHeight',
    'xlinkActuate',
    'xlinkArcrole',
    'xlinkHref',
    'xlinkRole',
    'xlinkShow',
    'xlinkTitle',
    'xlinkType',
    'xmlBase',
    'xmlLang',
    'xmlns',
    'xmlnsXlink',
    'xmlSpace',
    'y1',
    'y2',
    'y',
    'yChannelSelector',
    'z',
    'zoomAndPan',
    'ref',
    'key',
    'angle',
  ];
function ih(e) {
  if (typeof e != 'string') return !1;
  var t = Fy;
  return t.includes(e);
}
function kt(e) {
  var t = Object.entries(e).filter((r) => {
    var [n] = r;
    return ih(n);
  });
  return Object.fromEntries(t);
}
var mc = (e) => (typeof e == 'string' ? e : e ? e.displayName || e.name || 'Component' : ''),
  yc = null,
  ta = null,
  ah = (e) => {
    if (e === yc && Array.isArray(ta)) return ta;
    var t = [];
    return (
      y.Children.forEach(e, (r) => {
        te(r) || (Ry.isFragment(r) ? (t = t.concat(ah(r.props.children))) : t.push(r));
      }),
      (ta = t),
      (yc = e),
      t
    );
  };
function oh(e, t) {
  var r = [],
    n = [];
  return (
    Array.isArray(t) ? (n = t.map((i) => mc(i))) : (n = [mc(t)]),
    ah(e).forEach((i) => {
      var a = Jt(i, 'type.displayName') || Jt(i, 'type.name');
      n.indexOf(a) !== -1 && r.push(i);
    }),
    r
  );
}
var si = (e) => (e && typeof e == 'object' && 'clipDot' in e ? !!e.clipDot : !0),
  Ky = (e, t, r, n) => {
    var i;
    if (typeof t == 'symbol' || typeof t == 'number') return !0;
    var a = (i = n && ea?.[n]) !== null && i !== void 0 ? i : [],
      o = t.startsWith('data-'),
      u = typeof e != 'function' && ((!!n && a.includes(t)) || ih(t)),
      l = !!r && Su(t);
    return o || u || l;
  },
  ee = (e, t, r) => {
    if (!e || typeof e == 'function' || typeof e == 'boolean') return null;
    var n = e;
    if ((y.isValidElement(e) && (n = e.props), typeof n != 'object' && typeof n != 'function'))
      return null;
    var i = {};
    return (
      Object.keys(n).forEach((a) => {
        var o;
        Ky((o = n) === null || o === void 0 ? void 0 : o[a], a, t, r) && (i[a] = n[a]);
      }),
      i
    );
  },
  Wy = ['children', 'width', 'height', 'viewBox', 'className', 'style', 'title', 'desc'];
function To() {
  return (
    (To = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    To.apply(null, arguments)
  );
}
function Uy(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = Hy(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function Hy(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var _u = y.forwardRef((e, t) => {
    var {
        children: r,
        width: n,
        height: i,
        viewBox: a,
        className: o,
        style: u,
        title: l,
        desc: s,
      } = e,
      c = Uy(e, Wy),
      f = a || { width: n, height: i, x: 0, y: 0 },
      d = K('recharts-surface', o);
    return y.createElement(
      'svg',
      To({}, ee(c, !0, 'svg'), {
        className: d,
        width: n,
        height: i,
        style: u,
        viewBox: ''.concat(f.x, ' ').concat(f.y, ' ').concat(f.width, ' ').concat(f.height),
        ref: t,
      }),
      y.createElement('title', null, l),
      y.createElement('desc', null, s),
      r
    );
  }),
  Yy = ['children', 'className'];
function Co() {
  return (
    (Co = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Co.apply(null, arguments)
  );
}
function Gy(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = Vy(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function Vy(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var et = y.forwardRef((e, t) => {
    var { children: r, className: n } = e,
      i = Gy(e, Yy),
      a = K('recharts-layer', n);
    return y.createElement('g', Co({ className: a }, ee(i, !0), { ref: t }), r);
  }),
  uh = y.createContext(null),
  Xy = () => y.useContext(uh);
function V(e) {
  return function () {
    return e;
  };
}
const lh = Math.cos,
  Tn = Math.sin,
  tt = Math.sqrt,
  Cn = Math.PI,
  fi = 2 * Cn,
  jo = Math.PI,
  Mo = 2 * jo,
  Bt = 1e-6,
  Zy = Mo - Bt;
function ch(e) {
  this._ += e[0];
  for (let t = 1, r = e.length; t < r; ++t) this._ += arguments[t] + e[t];
}
function Jy(e) {
  let t = Math.floor(e);
  if (!(t >= 0)) throw new Error(`invalid digits: ${e}`);
  if (t > 15) return ch;
  const r = 10 ** t;
  return function (n) {
    this._ += n[0];
    for (let i = 1, a = n.length; i < a; ++i) this._ += Math.round(arguments[i] * r) / r + n[i];
  };
}
class Qy {
  constructor(t) {
    ((this._x0 = this._y0 = this._x1 = this._y1 = null),
      (this._ = ''),
      (this._append = t == null ? ch : Jy(t)));
  }
  moveTo(t, r) {
    this._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +r)}`;
  }
  closePath() {
    this._x1 !== null && ((this._x1 = this._x0), (this._y1 = this._y0), this._append`Z`);
  }
  lineTo(t, r) {
    this._append`L${(this._x1 = +t)},${(this._y1 = +r)}`;
  }
  quadraticCurveTo(t, r, n, i) {
    this._append`Q${+t},${+r},${(this._x1 = +n)},${(this._y1 = +i)}`;
  }
  bezierCurveTo(t, r, n, i, a, o) {
    this._append`C${+t},${+r},${+n},${+i},${(this._x1 = +a)},${(this._y1 = +o)}`;
  }
  arcTo(t, r, n, i, a) {
    if (((t = +t), (r = +r), (n = +n), (i = +i), (a = +a), a < 0))
      throw new Error(`negative radius: ${a}`);
    let o = this._x1,
      u = this._y1,
      l = n - t,
      s = i - r,
      c = o - t,
      f = u - r,
      d = c * c + f * f;
    if (this._x1 === null) this._append`M${(this._x1 = t)},${(this._y1 = r)}`;
    else if (d > Bt)
      if (!(Math.abs(f * l - s * c) > Bt) || !a) this._append`L${(this._x1 = t)},${(this._y1 = r)}`;
      else {
        let h = n - o,
          v = i - u,
          p = l * l + s * s,
          m = h * h + v * v,
          g = Math.sqrt(p),
          w = Math.sqrt(d),
          b = a * Math.tan((jo - Math.acos((p + d - m) / (2 * g * w))) / 2),
          P = b / w,
          x = b / g;
        (Math.abs(P - 1) > Bt && this._append`L${t + P * c},${r + P * f}`,
          this
            ._append`A${a},${a},0,0,${+(f * h > c * v)},${(this._x1 = t + x * l)},${(this._y1 = r + x * s)}`);
      }
  }
  arc(t, r, n, i, a, o) {
    if (((t = +t), (r = +r), (n = +n), (o = !!o), n < 0)) throw new Error(`negative radius: ${n}`);
    let u = n * Math.cos(i),
      l = n * Math.sin(i),
      s = t + u,
      c = r + l,
      f = 1 ^ o,
      d = o ? i - a : a - i;
    (this._x1 === null
      ? this._append`M${s},${c}`
      : (Math.abs(this._x1 - s) > Bt || Math.abs(this._y1 - c) > Bt) && this._append`L${s},${c}`,
      n &&
        (d < 0 && (d = (d % Mo) + Mo),
        d > Zy
          ? this
              ._append`A${n},${n},0,1,${f},${t - u},${r - l}A${n},${n},0,1,${f},${(this._x1 = s)},${(this._y1 = c)}`
          : d > Bt &&
            this
              ._append`A${n},${n},0,${+(d >= jo)},${f},${(this._x1 = t + n * Math.cos(a))},${(this._y1 = r + n * Math.sin(a))}`));
  }
  rect(t, r, n, i) {
    this
      ._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +r)}h${(n = +n)}v${+i}h${-n}Z`;
  }
  toString() {
    return this._;
  }
}
function Tu(e) {
  let t = 3;
  return (
    (e.digits = function (r) {
      if (!arguments.length) return t;
      if (r == null) t = null;
      else {
        const n = Math.floor(r);
        if (!(n >= 0)) throw new RangeError(`invalid digits: ${r}`);
        t = n;
      }
      return e;
    }),
    () => new Qy(t)
  );
}
function Cu(e) {
  return typeof e == 'object' && 'length' in e ? e : Array.from(e);
}
function sh(e) {
  this._context = e;
}
sh.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    this._point = 0;
  },
  lineEnd: function () {
    ((this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t));
        break;
      case 1:
        this._point = 2;
      default:
        this._context.lineTo(e, t);
        break;
    }
  },
};
function di(e) {
  return new sh(e);
}
function fh(e) {
  return e[0];
}
function dh(e) {
  return e[1];
}
function hh(e, t) {
  var r = V(!0),
    n = null,
    i = di,
    a = null,
    o = Tu(u);
  ((e = typeof e == 'function' ? e : e === void 0 ? fh : V(e)),
    (t = typeof t == 'function' ? t : t === void 0 ? dh : V(t)));
  function u(l) {
    var s,
      c = (l = Cu(l)).length,
      f,
      d = !1,
      h;
    for (n == null && (a = i((h = o()))), s = 0; s <= c; ++s)
      (!(s < c && r((f = l[s]), s, l)) === d && ((d = !d) ? a.lineStart() : a.lineEnd()),
        d && a.point(+e(f, s, l), +t(f, s, l)));
    if (h) return ((a = null), h + '' || null);
  }
  return (
    (u.x = function (l) {
      return arguments.length ? ((e = typeof l == 'function' ? l : V(+l)), u) : e;
    }),
    (u.y = function (l) {
      return arguments.length ? ((t = typeof l == 'function' ? l : V(+l)), u) : t;
    }),
    (u.defined = function (l) {
      return arguments.length ? ((r = typeof l == 'function' ? l : V(!!l)), u) : r;
    }),
    (u.curve = function (l) {
      return arguments.length ? ((i = l), n != null && (a = i(n)), u) : i;
    }),
    (u.context = function (l) {
      return arguments.length ? (l == null ? (n = a = null) : (a = i((n = l))), u) : n;
    }),
    u
  );
}
function hn(e, t, r) {
  var n = null,
    i = V(!0),
    a = null,
    o = di,
    u = null,
    l = Tu(s);
  ((e = typeof e == 'function' ? e : e === void 0 ? fh : V(+e)),
    (t = typeof t == 'function' ? t : V(t === void 0 ? 0 : +t)),
    (r = typeof r == 'function' ? r : r === void 0 ? dh : V(+r)));
  function s(f) {
    var d,
      h,
      v,
      p = (f = Cu(f)).length,
      m,
      g = !1,
      w,
      b = new Array(p),
      P = new Array(p);
    for (a == null && (u = o((w = l()))), d = 0; d <= p; ++d) {
      if (!(d < p && i((m = f[d]), d, f)) === g)
        if ((g = !g)) ((h = d), u.areaStart(), u.lineStart());
        else {
          for (u.lineEnd(), u.lineStart(), v = d - 1; v >= h; --v) u.point(b[v], P[v]);
          (u.lineEnd(), u.areaEnd());
        }
      g &&
        ((b[d] = +e(m, d, f)),
        (P[d] = +t(m, d, f)),
        u.point(n ? +n(m, d, f) : b[d], r ? +r(m, d, f) : P[d]));
    }
    if (w) return ((u = null), w + '' || null);
  }
  function c() {
    return hh().defined(i).curve(o).context(a);
  }
  return (
    (s.x = function (f) {
      return arguments.length ? ((e = typeof f == 'function' ? f : V(+f)), (n = null), s) : e;
    }),
    (s.x0 = function (f) {
      return arguments.length ? ((e = typeof f == 'function' ? f : V(+f)), s) : e;
    }),
    (s.x1 = function (f) {
      return arguments.length
        ? ((n = f == null ? null : typeof f == 'function' ? f : V(+f)), s)
        : n;
    }),
    (s.y = function (f) {
      return arguments.length ? ((t = typeof f == 'function' ? f : V(+f)), (r = null), s) : t;
    }),
    (s.y0 = function (f) {
      return arguments.length ? ((t = typeof f == 'function' ? f : V(+f)), s) : t;
    }),
    (s.y1 = function (f) {
      return arguments.length
        ? ((r = f == null ? null : typeof f == 'function' ? f : V(+f)), s)
        : r;
    }),
    (s.lineX0 = s.lineY0 =
      function () {
        return c().x(e).y(t);
      }),
    (s.lineY1 = function () {
      return c().x(e).y(r);
    }),
    (s.lineX1 = function () {
      return c().x(n).y(t);
    }),
    (s.defined = function (f) {
      return arguments.length ? ((i = typeof f == 'function' ? f : V(!!f)), s) : i;
    }),
    (s.curve = function (f) {
      return arguments.length ? ((o = f), a != null && (u = o(a)), s) : o;
    }),
    (s.context = function (f) {
      return arguments.length ? (f == null ? (a = u = null) : (u = o((a = f))), s) : a;
    }),
    s
  );
}
class vh {
  constructor(t, r) {
    ((this._context = t), (this._x = r));
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    ((this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      (this._line = 1 - this._line));
  }
  point(t, r) {
    switch (((t = +t), (r = +r), this._point)) {
      case 0: {
        ((this._point = 1), this._line ? this._context.lineTo(t, r) : this._context.moveTo(t, r));
        break;
      }
      case 1:
        this._point = 2;
      default: {
        this._x
          ? this._context.bezierCurveTo(
              (this._x0 = (this._x0 + t) / 2),
              this._y0,
              this._x0,
              r,
              t,
              r
            )
          : this._context.bezierCurveTo(
              this._x0,
              (this._y0 = (this._y0 + r) / 2),
              t,
              this._y0,
              t,
              r
            );
        break;
      }
    }
    ((this._x0 = t), (this._y0 = r));
  }
}
function eg(e) {
  return new vh(e, !0);
}
function tg(e) {
  return new vh(e, !1);
}
const ju = {
    draw(e, t) {
      const r = tt(t / Cn);
      (e.moveTo(r, 0), e.arc(0, 0, r, 0, fi));
    },
  },
  rg = {
    draw(e, t) {
      const r = tt(t / 5) / 2;
      (e.moveTo(-3 * r, -r),
        e.lineTo(-r, -r),
        e.lineTo(-r, -3 * r),
        e.lineTo(r, -3 * r),
        e.lineTo(r, -r),
        e.lineTo(3 * r, -r),
        e.lineTo(3 * r, r),
        e.lineTo(r, r),
        e.lineTo(r, 3 * r),
        e.lineTo(-r, 3 * r),
        e.lineTo(-r, r),
        e.lineTo(-3 * r, r),
        e.closePath());
    },
  },
  ph = tt(1 / 3),
  ng = ph * 2,
  ig = {
    draw(e, t) {
      const r = tt(t / ng),
        n = r * ph;
      (e.moveTo(0, -r), e.lineTo(n, 0), e.lineTo(0, r), e.lineTo(-n, 0), e.closePath());
    },
  },
  ag = {
    draw(e, t) {
      const r = tt(t),
        n = -r / 2;
      e.rect(n, n, r, r);
    },
  },
  og = 0.8908130915292852,
  mh = Tn(Cn / 10) / Tn((7 * Cn) / 10),
  ug = Tn(fi / 10) * mh,
  lg = -lh(fi / 10) * mh,
  cg = {
    draw(e, t) {
      const r = tt(t * og),
        n = ug * r,
        i = lg * r;
      (e.moveTo(0, -r), e.lineTo(n, i));
      for (let a = 1; a < 5; ++a) {
        const o = (fi * a) / 5,
          u = lh(o),
          l = Tn(o);
        (e.lineTo(l * r, -u * r), e.lineTo(u * n - l * i, l * n + u * i));
      }
      e.closePath();
    },
  },
  ra = tt(3),
  sg = {
    draw(e, t) {
      const r = -tt(t / (ra * 3));
      (e.moveTo(0, r * 2), e.lineTo(-ra * r, -r), e.lineTo(ra * r, -r), e.closePath());
    },
  },
  qe = -0.5,
  ze = tt(3) / 2,
  ko = 1 / tt(12),
  fg = (ko / 2 + 1) * 3,
  dg = {
    draw(e, t) {
      const r = tt(t / fg),
        n = r / 2,
        i = r * ko,
        a = n,
        o = r * ko + r,
        u = -a,
        l = o;
      (e.moveTo(n, i),
        e.lineTo(a, o),
        e.lineTo(u, l),
        e.lineTo(qe * n - ze * i, ze * n + qe * i),
        e.lineTo(qe * a - ze * o, ze * a + qe * o),
        e.lineTo(qe * u - ze * l, ze * u + qe * l),
        e.lineTo(qe * n + ze * i, qe * i - ze * n),
        e.lineTo(qe * a + ze * o, qe * o - ze * a),
        e.lineTo(qe * u + ze * l, qe * l - ze * u),
        e.closePath());
    },
  };
function hg(e, t) {
  let r = null,
    n = Tu(i);
  ((e = typeof e == 'function' ? e : V(e || ju)),
    (t = typeof t == 'function' ? t : V(t === void 0 ? 64 : +t)));
  function i() {
    let a;
    if ((r || (r = a = n()), e.apply(this, arguments).draw(r, +t.apply(this, arguments)), a))
      return ((r = null), a + '' || null);
  }
  return (
    (i.type = function (a) {
      return arguments.length ? ((e = typeof a == 'function' ? a : V(a)), i) : e;
    }),
    (i.size = function (a) {
      return arguments.length ? ((t = typeof a == 'function' ? a : V(+a)), i) : t;
    }),
    (i.context = function (a) {
      return arguments.length ? ((r = a ?? null), i) : r;
    }),
    i
  );
}
function jn() {}
function Mn(e, t, r) {
  e._context.bezierCurveTo(
    (2 * e._x0 + e._x1) / 3,
    (2 * e._y0 + e._y1) / 3,
    (e._x0 + 2 * e._x1) / 3,
    (e._y0 + 2 * e._y1) / 3,
    (e._x0 + 4 * e._x1 + t) / 6,
    (e._y0 + 4 * e._y1 + r) / 6
  );
}
function yh(e) {
  this._context = e;
}
yh.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = NaN), (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 3:
        Mn(this, this._x1, this._y1);
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    ((this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t));
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        ((this._point = 3),
          this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6));
      default:
        Mn(this, e, t);
        break;
    }
    ((this._x0 = this._x1), (this._x1 = e), (this._y0 = this._y1), (this._y1 = t));
  },
};
function vg(e) {
  return new yh(e);
}
function gh(e) {
  this._context = e;
}
gh.prototype = {
  areaStart: jn,
  areaEnd: jn,
  lineStart: function () {
    ((this._x0 =
      this._x1 =
      this._x2 =
      this._x3 =
      this._x4 =
      this._y0 =
      this._y1 =
      this._y2 =
      this._y3 =
      this._y4 =
        NaN),
      (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 1: {
        (this._context.moveTo(this._x2, this._y2), this._context.closePath());
        break;
      }
      case 2: {
        (this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3),
          this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3),
          this._context.closePath());
        break;
      }
      case 3: {
        (this.point(this._x2, this._y2),
          this.point(this._x3, this._y3),
          this.point(this._x4, this._y4));
        break;
      }
    }
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), (this._x2 = e), (this._y2 = t));
        break;
      case 1:
        ((this._point = 2), (this._x3 = e), (this._y3 = t));
        break;
      case 2:
        ((this._point = 3),
          (this._x4 = e),
          (this._y4 = t),
          this._context.moveTo(
            (this._x0 + 4 * this._x1 + e) / 6,
            (this._y0 + 4 * this._y1 + t) / 6
          ));
        break;
      default:
        Mn(this, e, t);
        break;
    }
    ((this._x0 = this._x1), (this._x1 = e), (this._y0 = this._y1), (this._y1 = t));
  },
};
function pg(e) {
  return new gh(e);
}
function bh(e) {
  this._context = e;
}
bh.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = NaN), (this._point = 0));
  },
  lineEnd: function () {
    ((this._line || (this._line !== 0 && this._point === 3)) && this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        var r = (this._x0 + 4 * this._x1 + e) / 6,
          n = (this._y0 + 4 * this._y1 + t) / 6;
        this._line ? this._context.lineTo(r, n) : this._context.moveTo(r, n);
        break;
      case 3:
        this._point = 4;
      default:
        Mn(this, e, t);
        break;
    }
    ((this._x0 = this._x1), (this._x1 = e), (this._y0 = this._y1), (this._y1 = t));
  },
};
function mg(e) {
  return new bh(e);
}
function wh(e) {
  this._context = e;
}
wh.prototype = {
  areaStart: jn,
  areaEnd: jn,
  lineStart: function () {
    this._point = 0;
  },
  lineEnd: function () {
    this._point && this._context.closePath();
  },
  point: function (e, t) {
    ((e = +e),
      (t = +t),
      this._point ? this._context.lineTo(e, t) : ((this._point = 1), this._context.moveTo(e, t)));
  },
};
function yg(e) {
  return new wh(e);
}
function gc(e) {
  return e < 0 ? -1 : 1;
}
function bc(e, t, r) {
  var n = e._x1 - e._x0,
    i = t - e._x1,
    a = (e._y1 - e._y0) / (n || (i < 0 && -0)),
    o = (r - e._y1) / (i || (n < 0 && -0)),
    u = (a * i + o * n) / (n + i);
  return (gc(a) + gc(o)) * Math.min(Math.abs(a), Math.abs(o), 0.5 * Math.abs(u)) || 0;
}
function wc(e, t) {
  var r = e._x1 - e._x0;
  return r ? ((3 * (e._y1 - e._y0)) / r - t) / 2 : t;
}
function na(e, t, r) {
  var n = e._x0,
    i = e._y0,
    a = e._x1,
    o = e._y1,
    u = (a - n) / 3;
  e._context.bezierCurveTo(n + u, i + u * t, a - u, o - u * r, a, o);
}
function kn(e) {
  this._context = e;
}
kn.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN), (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        na(this, this._t0, wc(this, this._t0));
        break;
    }
    ((this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (e, t) {
    var r = NaN;
    if (((e = +e), (t = +t), !(e === this._x1 && t === this._y1))) {
      switch (this._point) {
        case 0:
          ((this._point = 1), this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t));
          break;
        case 1:
          this._point = 2;
          break;
        case 2:
          ((this._point = 3), na(this, wc(this, (r = bc(this, e, t))), r));
          break;
        default:
          na(this, this._t0, (r = bc(this, e, t)));
          break;
      }
      ((this._x0 = this._x1),
        (this._x1 = e),
        (this._y0 = this._y1),
        (this._y1 = t),
        (this._t0 = r));
    }
  },
};
function xh(e) {
  this._context = new Ph(e);
}
(xh.prototype = Object.create(kn.prototype)).point = function (e, t) {
  kn.prototype.point.call(this, t, e);
};
function Ph(e) {
  this._context = e;
}
Ph.prototype = {
  moveTo: function (e, t) {
    this._context.moveTo(t, e);
  },
  closePath: function () {
    this._context.closePath();
  },
  lineTo: function (e, t) {
    this._context.lineTo(t, e);
  },
  bezierCurveTo: function (e, t, r, n, i, a) {
    this._context.bezierCurveTo(t, e, n, r, a, i);
  },
};
function gg(e) {
  return new kn(e);
}
function bg(e) {
  return new xh(e);
}
function Oh(e) {
  this._context = e;
}
Oh.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x = []), (this._y = []));
  },
  lineEnd: function () {
    var e = this._x,
      t = this._y,
      r = e.length;
    if (r)
      if (
        (this._line ? this._context.lineTo(e[0], t[0]) : this._context.moveTo(e[0], t[0]), r === 2)
      )
        this._context.lineTo(e[1], t[1]);
      else
        for (var n = xc(e), i = xc(t), a = 0, o = 1; o < r; ++a, ++o)
          this._context.bezierCurveTo(n[0][a], i[0][a], n[1][a], i[1][a], e[o], t[o]);
    ((this._line || (this._line !== 0 && r === 1)) && this._context.closePath(),
      (this._line = 1 - this._line),
      (this._x = this._y = null));
  },
  point: function (e, t) {
    (this._x.push(+e), this._y.push(+t));
  },
};
function xc(e) {
  var t,
    r = e.length - 1,
    n,
    i = new Array(r),
    a = new Array(r),
    o = new Array(r);
  for (i[0] = 0, a[0] = 2, o[0] = e[0] + 2 * e[1], t = 1; t < r - 1; ++t)
    ((i[t] = 1), (a[t] = 4), (o[t] = 4 * e[t] + 2 * e[t + 1]));
  for (i[r - 1] = 2, a[r - 1] = 7, o[r - 1] = 8 * e[r - 1] + e[r], t = 1; t < r; ++t)
    ((n = i[t] / a[t - 1]), (a[t] -= n), (o[t] -= n * o[t - 1]));
  for (i[r - 1] = o[r - 1] / a[r - 1], t = r - 2; t >= 0; --t) i[t] = (o[t] - i[t + 1]) / a[t];
  for (a[r - 1] = (e[r] + i[r - 1]) / 2, t = 0; t < r - 1; ++t) a[t] = 2 * e[t + 1] - i[t + 1];
  return [i, a];
}
function wg(e) {
  return new Oh(e);
}
function hi(e, t) {
  ((this._context = e), (this._t = t));
}
hi.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x = this._y = NaN), (this._point = 0));
  },
  lineEnd: function () {
    (0 < this._t && this._t < 1 && this._point === 2 && this._context.lineTo(this._x, this._y),
      (this._line || (this._line !== 0 && this._point === 1)) && this._context.closePath(),
      this._line >= 0 && ((this._t = 1 - this._t), (this._line = 1 - this._line)));
  },
  point: function (e, t) {
    switch (((e = +e), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t));
        break;
      case 1:
        this._point = 2;
      default: {
        if (this._t <= 0) (this._context.lineTo(this._x, t), this._context.lineTo(e, t));
        else {
          var r = this._x * (1 - this._t) + e * this._t;
          (this._context.lineTo(r, this._y), this._context.lineTo(r, t));
        }
        break;
      }
    }
    ((this._x = e), (this._y = t));
  },
};
function xg(e) {
  return new hi(e, 0.5);
}
function Pg(e) {
  return new hi(e, 0);
}
function Og(e) {
  return new hi(e, 1);
}
function hr(e, t) {
  if ((o = e.length) > 1)
    for (var r = 1, n, i, a = e[t[0]], o, u = a.length; r < o; ++r)
      for (i = a, a = e[t[r]], n = 0; n < u; ++n)
        a[n][1] += a[n][0] = isNaN(i[n][1]) ? i[n][0] : i[n][1];
}
function Io(e) {
  for (var t = e.length, r = new Array(t); --t >= 0; ) r[t] = t;
  return r;
}
function Ag(e, t) {
  return e[t];
}
function Sg(e) {
  const t = [];
  return ((t.key = e), t);
}
function Eg() {
  var e = V([]),
    t = Io,
    r = hr,
    n = Ag;
  function i(a) {
    var o = Array.from(e.apply(this, arguments), Sg),
      u,
      l = o.length,
      s = -1,
      c;
    for (const f of a) for (u = 0, ++s; u < l; ++u) (o[u][s] = [0, +n(f, o[u].key, s, a)]).data = f;
    for (u = 0, c = Cu(t(o)); u < l; ++u) o[c[u]].index = u;
    return (r(o, c), o);
  }
  return (
    (i.keys = function (a) {
      return arguments.length ? ((e = typeof a == 'function' ? a : V(Array.from(a))), i) : e;
    }),
    (i.value = function (a) {
      return arguments.length ? ((n = typeof a == 'function' ? a : V(+a)), i) : n;
    }),
    (i.order = function (a) {
      return arguments.length
        ? ((t = a == null ? Io : typeof a == 'function' ? a : V(Array.from(a))), i)
        : t;
    }),
    (i.offset = function (a) {
      return arguments.length ? ((r = a ?? hr), i) : r;
    }),
    i
  );
}
function _g(e, t) {
  if ((n = e.length) > 0) {
    for (var r, n, i = 0, a = e[0].length, o; i < a; ++i) {
      for (o = r = 0; r < n; ++r) o += e[r][i][1] || 0;
      if (o) for (r = 0; r < n; ++r) e[r][i][1] /= o;
    }
    hr(e, t);
  }
}
function Tg(e, t) {
  if ((i = e.length) > 0) {
    for (var r = 0, n = e[t[0]], i, a = n.length; r < a; ++r) {
      for (var o = 0, u = 0; o < i; ++o) u += e[o][r][1] || 0;
      n[r][1] += n[r][0] = -u / 2;
    }
    hr(e, t);
  }
}
function Cg(e, t) {
  if (!(!((o = e.length) > 0) || !((a = (i = e[t[0]]).length) > 0))) {
    for (var r = 0, n = 1, i, a, o; n < a; ++n) {
      for (var u = 0, l = 0, s = 0; u < o; ++u) {
        for (
          var c = e[t[u]], f = c[n][1] || 0, d = c[n - 1][1] || 0, h = (f - d) / 2, v = 0;
          v < u;
          ++v
        ) {
          var p = e[t[v]],
            m = p[n][1] || 0,
            g = p[n - 1][1] || 0;
          h += m - g;
        }
        ((l += f), (s += h * f));
      }
      ((i[n - 1][1] += i[n - 1][0] = r), l && (r -= s / l));
    }
    ((i[n - 1][1] += i[n - 1][0] = r), hr(e, t));
  }
}
var jg = ['type', 'size', 'sizeType'];
function Do() {
  return (
    (Do = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Do.apply(null, arguments)
  );
}
function Pc(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Oc(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Pc(Object(r), !0).forEach(function (n) {
          Mg(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Pc(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Mg(e, t, r) {
  return (
    (t = kg(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function kg(e) {
  var t = Ig(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Ig(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Dg(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = Ng(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function Ng(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var Ah = {
    symbolCircle: ju,
    symbolCross: rg,
    symbolDiamond: ig,
    symbolSquare: ag,
    symbolStar: cg,
    symbolTriangle: sg,
    symbolWye: dg,
  },
  $g = Math.PI / 180,
  Rg = (e) => {
    var t = 'symbol'.concat(Qr(e));
    return Ah[t] || ju;
  },
  Lg = (e, t, r) => {
    if (t === 'area') return e;
    switch (r) {
      case 'cross':
        return (5 * e * e) / 9;
      case 'diamond':
        return (0.5 * e * e) / Math.sqrt(3);
      case 'square':
        return e * e;
      case 'star': {
        var n = 18 * $g;
        return 1.25 * e * e * (Math.tan(n) - Math.tan(n * 2) * Math.tan(n) ** 2);
      }
      case 'triangle':
        return (Math.sqrt(3) * e * e) / 4;
      case 'wye':
        return ((21 - 10 * Math.sqrt(3)) * e * e) / 8;
      default:
        return (Math.PI * e * e) / 4;
    }
  },
  Bg = (e, t) => {
    Ah['symbol'.concat(Qr(e))] = t;
  },
  Sh = (e) => {
    var { type: t = 'circle', size: r = 64, sizeType: n = 'area' } = e,
      i = Dg(e, jg),
      a = Oc(Oc({}, i), {}, { type: t, size: r, sizeType: n }),
      o = () => {
        var f = Rg(t),
          d = hg()
            .type(f)
            .size(Lg(r, n, t));
        return d();
      },
      { className: u, cx: l, cy: s } = a,
      c = ee(a, !0);
    return l === +l && s === +s && r === +r
      ? y.createElement(
          'path',
          Do({}, c, {
            className: K('recharts-symbols', u),
            transform: 'translate('.concat(l, ', ').concat(s, ')'),
            d: o(),
          })
        )
      : null;
  };
Sh.registerSymbol = Bg;
function No() {
  return (
    (No = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    No.apply(null, arguments)
  );
}
function Ac(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function qg(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Ac(Object(r), !0).forEach(function (n) {
          Mu(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Ac(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Mu(e, t, r) {
  return (
    (t = zg(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function zg(e) {
  var t = Fg(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Fg(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var Fe = 32;
class ku extends y.PureComponent {
  renderIcon(t, r) {
    var { inactiveColor: n } = this.props,
      i = Fe / 2,
      a = Fe / 6,
      o = Fe / 3,
      u = t.inactive ? n : t.color,
      l = r ?? t.type;
    if (l === 'none') return null;
    if (l === 'plainline')
      return y.createElement('line', {
        strokeWidth: 4,
        fill: 'none',
        stroke: u,
        strokeDasharray: t.payload.strokeDasharray,
        x1: 0,
        y1: i,
        x2: Fe,
        y2: i,
        className: 'recharts-legend-icon',
      });
    if (l === 'line')
      return y.createElement('path', {
        strokeWidth: 4,
        fill: 'none',
        stroke: u,
        d: 'M0,'
          .concat(i, 'h')
          .concat(
            o,
            `
            A`
          )
          .concat(a, ',')
          .concat(a, ',0,1,1,')
          .concat(2 * o, ',')
          .concat(
            i,
            `
            H`
          )
          .concat(Fe, 'M')
          .concat(2 * o, ',')
          .concat(
            i,
            `
            A`
          )
          .concat(a, ',')
          .concat(a, ',0,1,1,')
          .concat(o, ',')
          .concat(i),
        className: 'recharts-legend-icon',
      });
    if (l === 'rect')
      return y.createElement('path', {
        stroke: 'none',
        fill: u,
        d: 'M0,'
          .concat(Fe / 8, 'h')
          .concat(Fe, 'v')
          .concat((Fe * 3) / 4, 'h')
          .concat(-Fe, 'z'),
        className: 'recharts-legend-icon',
      });
    if (y.isValidElement(t.legendIcon)) {
      var s = qg({}, t);
      return (delete s.legendIcon, y.cloneElement(t.legendIcon, s));
    }
    return y.createElement(Sh, { fill: u, cx: i, cy: i, size: Fe, sizeType: 'diameter', type: l });
  }
  renderItems() {
    var {
        payload: t,
        iconSize: r,
        layout: n,
        formatter: i,
        inactiveColor: a,
        iconType: o,
      } = this.props,
      u = { x: 0, y: 0, width: Fe, height: Fe },
      l = { display: n === 'horizontal' ? 'inline-block' : 'block', marginRight: 10 },
      s = { display: 'inline-block', verticalAlign: 'middle', marginRight: 4 };
    return t.map((c, f) => {
      var d = c.formatter || i,
        h = K({ 'recharts-legend-item': !0, ['legend-item-'.concat(f)]: !0, inactive: c.inactive });
      if (c.type === 'none') return null;
      var v = c.inactive ? a : c.color,
        p = d ? d(c.value, c, f) : c.value;
      return y.createElement(
        'li',
        No({ className: h, style: l, key: 'legend-item-'.concat(f) }, nh(this.props, c, f)),
        y.createElement(
          _u,
          { width: r, height: r, viewBox: u, style: s, 'aria-label': ''.concat(p, ' legend icon') },
          this.renderIcon(c, o)
        ),
        y.createElement('span', { className: 'recharts-legend-item-text', style: { color: v } }, p)
      );
    });
  }
  render() {
    var { payload: t, layout: r, align: n } = this.props;
    if (!t || !t.length) return null;
    var i = { padding: 0, margin: 0, textAlign: r === 'horizontal' ? n : 'left' };
    return y.createElement(
      'ul',
      { className: 'recharts-default-legend', style: i },
      this.renderItems()
    );
  }
}
Mu(ku, 'displayName', 'Legend');
Mu(ku, 'defaultProps', {
  align: 'center',
  iconSize: 14,
  inactiveColor: '#ccc',
  layout: 'horizontal',
  verticalAlign: 'middle',
});
var ia = {},
  aa = {},
  Sc;
function Kg() {
  return (
    Sc ||
      ((Sc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r, n) {
          const i = new Map();
          for (let a = 0; a < r.length; a++) {
            const o = r[a],
              u = n(o);
            i.has(u) || i.set(u, o);
          }
          return Array.from(i.values());
        }
        e.uniqBy = t;
      })(aa)),
    aa
  );
}
var oa = {},
  Ec;
function Eh() {
  return (
    Ec ||
      ((Ec = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return r;
        }
        e.identity = t;
      })(oa)),
    oa
  );
}
var ua = {},
  la = {},
  ca = {},
  _c;
function Wg() {
  return (
    _c ||
      ((_c = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return Number.isSafeInteger(r) && r >= 0;
        }
        e.isLength = t;
      })(ca)),
    ca
  );
}
var Tc;
function Iu() {
  return (
    Tc ||
      ((Tc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Wg();
        function r(n) {
          return n != null && typeof n != 'function' && t.isLength(n.length);
        }
        e.isArrayLike = r;
      })(la)),
    la
  );
}
var sa = {},
  Cc;
function Ug() {
  return (
    Cc ||
      ((Cc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return typeof r == 'object' && r !== null;
        }
        e.isObjectLike = t;
      })(sa)),
    sa
  );
}
var jc;
function Hg() {
  return (
    jc ||
      ((jc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Iu(),
          r = Ug();
        function n(i) {
          return r.isObjectLike(i) && t.isArrayLike(i);
        }
        e.isArrayLikeObject = n;
      })(ua)),
    ua
  );
}
var fa = {},
  da = {},
  Mc;
function Yg() {
  return (
    Mc ||
      ((Mc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Au();
        function r(n) {
          return function (i) {
            return t.get(i, n);
          };
        }
        e.property = r;
      })(da)),
    da
  );
}
var ha = {},
  va = {},
  pa = {},
  ma = {},
  kc;
function _h() {
  return (
    kc ||
      ((kc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return r !== null && (typeof r == 'object' || typeof r == 'function');
        }
        e.isObject = t;
      })(ma)),
    ma
  );
}
var ya = {},
  Ic;
function Th() {
  return (
    Ic ||
      ((Ic = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return r == null || (typeof r != 'object' && typeof r != 'function');
        }
        e.isPrimitive = t;
      })(ya)),
    ya
  );
}
var ga = {},
  Dc;
function Du() {
  return (
    Dc ||
      ((Dc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r, n) {
          return r === n || (Number.isNaN(r) && Number.isNaN(n));
        }
        e.eq = t;
      })(ga)),
    ga
  );
}
var Nc;
function Gg() {
  return (
    Nc ||
      ((Nc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Nu(),
          r = _h(),
          n = Th(),
          i = Du();
        function a(f, d, h) {
          return typeof h != 'function'
            ? t.isMatch(f, d)
            : o(
                f,
                d,
                function v(p, m, g, w, b, P) {
                  const x = h(p, m, g, w, b, P);
                  return x !== void 0 ? !!x : o(p, m, v, P);
                },
                new Map()
              );
        }
        function o(f, d, h, v) {
          if (d === f) return !0;
          switch (typeof d) {
            case 'object':
              return u(f, d, h, v);
            case 'function':
              return Object.keys(d).length > 0 ? o(f, { ...d }, h, v) : i.eq(f, d);
            default:
              return r.isObject(f) ? (typeof d == 'string' ? d === '' : !0) : i.eq(f, d);
          }
        }
        function u(f, d, h, v) {
          if (d == null) return !0;
          if (Array.isArray(d)) return s(f, d, h, v);
          if (d instanceof Map) return l(f, d, h, v);
          if (d instanceof Set) return c(f, d, h, v);
          const p = Object.keys(d);
          if (f == null) return p.length === 0;
          if (p.length === 0) return !0;
          if (v && v.has(d)) return v.get(d) === f;
          v && v.set(d, f);
          try {
            for (let m = 0; m < p.length; m++) {
              const g = p[m];
              if (
                (!n.isPrimitive(f) && !(g in f)) ||
                (d[g] === void 0 && f[g] !== void 0) ||
                (d[g] === null && f[g] !== null) ||
                !h(f[g], d[g], g, f, d, v)
              )
                return !1;
            }
            return !0;
          } finally {
            v && v.delete(d);
          }
        }
        function l(f, d, h, v) {
          if (d.size === 0) return !0;
          if (!(f instanceof Map)) return !1;
          for (const [p, m] of d.entries()) {
            const g = f.get(p);
            if (h(g, m, p, f, d, v) === !1) return !1;
          }
          return !0;
        }
        function s(f, d, h, v) {
          if (d.length === 0) return !0;
          if (!Array.isArray(f)) return !1;
          const p = new Set();
          for (let m = 0; m < d.length; m++) {
            const g = d[m];
            let w = !1;
            for (let b = 0; b < f.length; b++) {
              if (p.has(b)) continue;
              const P = f[b];
              let x = !1;
              if ((h(P, g, m, f, d, v) && (x = !0), x)) {
                (p.add(b), (w = !0));
                break;
              }
            }
            if (!w) return !1;
          }
          return !0;
        }
        function c(f, d, h, v) {
          return d.size === 0 ? !0 : f instanceof Set ? s([...f], [...d], h, v) : !1;
        }
        ((e.isMatchWith = a), (e.isSetMatch = c));
      })(pa)),
    pa
  );
}
var $c;
function Nu() {
  return (
    $c ||
      (($c = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Gg();
        function r(n, i) {
          return t.isMatchWith(n, i, () => {});
        }
        e.isMatch = r;
      })(va)),
    va
  );
}
var ba = {},
  wa = {},
  xa = {},
  Rc;
function Ch() {
  return (
    Rc ||
      ((Rc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return Object.getOwnPropertySymbols(r).filter((n) =>
            Object.prototype.propertyIsEnumerable.call(r, n)
          );
        }
        e.getSymbols = t;
      })(xa)),
    xa
  );
}
var Pa = {},
  Lc;
function $u() {
  return (
    Lc ||
      ((Lc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return r == null
            ? r === void 0
              ? '[object Undefined]'
              : '[object Null]'
            : Object.prototype.toString.call(r);
        }
        e.getTag = t;
      })(Pa)),
    Pa
  );
}
var Oa = {},
  Bc;
function Ru() {
  return (
    Bc ||
      ((Bc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = '[object RegExp]',
          r = '[object String]',
          n = '[object Number]',
          i = '[object Boolean]',
          a = '[object Arguments]',
          o = '[object Symbol]',
          u = '[object Date]',
          l = '[object Map]',
          s = '[object Set]',
          c = '[object Array]',
          f = '[object Function]',
          d = '[object ArrayBuffer]',
          h = '[object Object]',
          v = '[object Error]',
          p = '[object DataView]',
          m = '[object Uint8Array]',
          g = '[object Uint8ClampedArray]',
          w = '[object Uint16Array]',
          b = '[object Uint32Array]',
          P = '[object BigUint64Array]',
          x = '[object Int8Array]',
          O = '[object Int16Array]',
          S = '[object Int32Array]',
          _ = '[object BigInt64Array]',
          C = '[object Float32Array]',
          N = '[object Float64Array]';
        ((e.argumentsTag = a),
          (e.arrayBufferTag = d),
          (e.arrayTag = c),
          (e.bigInt64ArrayTag = _),
          (e.bigUint64ArrayTag = P),
          (e.booleanTag = i),
          (e.dataViewTag = p),
          (e.dateTag = u),
          (e.errorTag = v),
          (e.float32ArrayTag = C),
          (e.float64ArrayTag = N),
          (e.functionTag = f),
          (e.int16ArrayTag = O),
          (e.int32ArrayTag = S),
          (e.int8ArrayTag = x),
          (e.mapTag = l),
          (e.numberTag = n),
          (e.objectTag = h),
          (e.regexpTag = t),
          (e.setTag = s),
          (e.stringTag = r),
          (e.symbolTag = o),
          (e.uint16ArrayTag = w),
          (e.uint32ArrayTag = b),
          (e.uint8ArrayTag = m),
          (e.uint8ClampedArrayTag = g));
      })(Oa)),
    Oa
  );
}
var Aa = {},
  qc;
function Vg() {
  return (
    qc ||
      ((qc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return ArrayBuffer.isView(r) && !(r instanceof DataView);
        }
        e.isTypedArray = t;
      })(Aa)),
    Aa
  );
}
var zc;
function jh() {
  return (
    zc ||
      ((zc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Ch(),
          r = $u(),
          n = Ru(),
          i = Th(),
          a = Vg();
        function o(c, f) {
          return u(c, void 0, c, new Map(), f);
        }
        function u(c, f, d, h = new Map(), v = void 0) {
          const p = v?.(c, f, d, h);
          if (p !== void 0) return p;
          if (i.isPrimitive(c)) return c;
          if (h.has(c)) return h.get(c);
          if (Array.isArray(c)) {
            const m = new Array(c.length);
            h.set(c, m);
            for (let g = 0; g < c.length; g++) m[g] = u(c[g], g, d, h, v);
            return (
              Object.hasOwn(c, 'index') && (m.index = c.index),
              Object.hasOwn(c, 'input') && (m.input = c.input),
              m
            );
          }
          if (c instanceof Date) return new Date(c.getTime());
          if (c instanceof RegExp) {
            const m = new RegExp(c.source, c.flags);
            return ((m.lastIndex = c.lastIndex), m);
          }
          if (c instanceof Map) {
            const m = new Map();
            h.set(c, m);
            for (const [g, w] of c) m.set(g, u(w, g, d, h, v));
            return m;
          }
          if (c instanceof Set) {
            const m = new Set();
            h.set(c, m);
            for (const g of c) m.add(u(g, void 0, d, h, v));
            return m;
          }
          if (typeof Buffer < 'u' && Buffer.isBuffer(c)) return c.subarray();
          if (a.isTypedArray(c)) {
            const m = new (Object.getPrototypeOf(c).constructor)(c.length);
            h.set(c, m);
            for (let g = 0; g < c.length; g++) m[g] = u(c[g], g, d, h, v);
            return m;
          }
          if (
            c instanceof ArrayBuffer ||
            (typeof SharedArrayBuffer < 'u' && c instanceof SharedArrayBuffer)
          )
            return c.slice(0);
          if (c instanceof DataView) {
            const m = new DataView(c.buffer.slice(0), c.byteOffset, c.byteLength);
            return (h.set(c, m), l(m, c, d, h, v), m);
          }
          if (typeof File < 'u' && c instanceof File) {
            const m = new File([c], c.name, { type: c.type });
            return (h.set(c, m), l(m, c, d, h, v), m);
          }
          if (c instanceof Blob) {
            const m = new Blob([c], { type: c.type });
            return (h.set(c, m), l(m, c, d, h, v), m);
          }
          if (c instanceof Error) {
            const m = new c.constructor();
            return (
              h.set(c, m),
              (m.message = c.message),
              (m.name = c.name),
              (m.stack = c.stack),
              (m.cause = c.cause),
              l(m, c, d, h, v),
              m
            );
          }
          if (typeof c == 'object' && s(c)) {
            const m = Object.create(Object.getPrototypeOf(c));
            return (h.set(c, m), l(m, c, d, h, v), m);
          }
          return c;
        }
        function l(c, f, d = c, h, v) {
          const p = [...Object.keys(f), ...t.getSymbols(f)];
          for (let m = 0; m < p.length; m++) {
            const g = p[m],
              w = Object.getOwnPropertyDescriptor(c, g);
            (w == null || w.writable) && (c[g] = u(f[g], g, d, h, v));
          }
        }
        function s(c) {
          switch (r.getTag(c)) {
            case n.argumentsTag:
            case n.arrayTag:
            case n.arrayBufferTag:
            case n.dataViewTag:
            case n.booleanTag:
            case n.dateTag:
            case n.float32ArrayTag:
            case n.float64ArrayTag:
            case n.int8ArrayTag:
            case n.int16ArrayTag:
            case n.int32ArrayTag:
            case n.mapTag:
            case n.numberTag:
            case n.objectTag:
            case n.regexpTag:
            case n.setTag:
            case n.stringTag:
            case n.symbolTag:
            case n.uint8ArrayTag:
            case n.uint8ClampedArrayTag:
            case n.uint16ArrayTag:
            case n.uint32ArrayTag:
              return !0;
            default:
              return !1;
          }
        }
        ((e.cloneDeepWith = o), (e.cloneDeepWithImpl = u), (e.copyProperties = l));
      })(wa)),
    wa
  );
}
var Fc;
function Xg() {
  return (
    Fc ||
      ((Fc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = jh();
        function r(n) {
          return t.cloneDeepWithImpl(n, void 0, n, new Map(), void 0);
        }
        e.cloneDeep = r;
      })(ba)),
    ba
  );
}
var Kc;
function Zg() {
  return (
    Kc ||
      ((Kc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Nu(),
          r = Xg();
        function n(i) {
          return ((i = r.cloneDeep(i)), (a) => t.isMatch(a, i));
        }
        e.matches = n;
      })(ha)),
    ha
  );
}
var Sa = {},
  Ea = {},
  _a = {},
  Wc;
function Jg() {
  return (
    Wc ||
      ((Wc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = jh(),
          r = Ru();
        function n(i, a) {
          return t.cloneDeepWith(i, (o, u, l, s) => {
            const c = a?.(o, u, l, s);
            if (c !== void 0) return c;
            if (typeof i == 'object')
              switch (Object.prototype.toString.call(i)) {
                case r.numberTag:
                case r.stringTag:
                case r.booleanTag: {
                  const f = new i.constructor(i?.valueOf());
                  return (t.copyProperties(f, i), f);
                }
                case r.argumentsTag: {
                  const f = {};
                  return (
                    t.copyProperties(f, i),
                    (f.length = i.length),
                    (f[Symbol.iterator] = i[Symbol.iterator]),
                    f
                  );
                }
                default:
                  return;
              }
          });
        }
        e.cloneDeepWith = n;
      })(_a)),
    _a
  );
}
var Uc;
function Qg() {
  return (
    Uc ||
      ((Uc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Jg();
        function r(n) {
          return t.cloneDeepWith(n);
        }
        e.cloneDeep = r;
      })(Ea)),
    Ea
  );
}
var Ta = {},
  Ca = {},
  Hc;
function Mh() {
  return (
    Hc ||
      ((Hc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = /^(?:0|[1-9]\d*)$/;
        function r(n, i = Number.MAX_SAFE_INTEGER) {
          switch (typeof n) {
            case 'number':
              return Number.isInteger(n) && n >= 0 && n < i;
            case 'symbol':
              return !1;
            case 'string':
              return t.test(n);
          }
        }
        e.isIndex = r;
      })(Ca)),
    Ca
  );
}
var ja = {},
  Yc;
function e0() {
  return (
    Yc ||
      ((Yc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = $u();
        function r(n) {
          return n !== null && typeof n == 'object' && t.getTag(n) === '[object Arguments]';
        }
        e.isArguments = r;
      })(ja)),
    ja
  );
}
var Gc;
function t0() {
  return (
    Gc ||
      ((Gc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Qd(),
          r = Mh(),
          n = e0(),
          i = Ou();
        function a(o, u) {
          let l;
          if (
            (Array.isArray(u)
              ? (l = u)
              : typeof u == 'string' && t.isDeepKey(u) && o?.[u] == null
                ? (l = i.toPath(u))
                : (l = [u]),
            l.length === 0)
          )
            return !1;
          let s = o;
          for (let c = 0; c < l.length; c++) {
            const f = l[c];
            if (
              (s == null || !Object.hasOwn(s, f)) &&
              !((Array.isArray(s) || n.isArguments(s)) && r.isIndex(f) && f < s.length)
            )
              return !1;
            s = s[f];
          }
          return !0;
        }
        e.has = a;
      })(Ta)),
    Ta
  );
}
var Vc;
function r0() {
  return (
    Vc ||
      ((Vc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Nu(),
          r = eh(),
          n = Qg(),
          i = Au(),
          a = t0();
        function o(u, l) {
          switch (typeof u) {
            case 'object': {
              Object.is(u?.valueOf(), -0) && (u = '-0');
              break;
            }
            case 'number': {
              u = r.toKey(u);
              break;
            }
          }
          return (
            (l = n.cloneDeep(l)),
            function (s) {
              const c = i.get(s, u);
              return c === void 0 ? a.has(s, u) : l === void 0 ? c === void 0 : t.isMatch(c, l);
            }
          );
        }
        e.matchesProperty = o;
      })(Sa)),
    Sa
  );
}
var Xc;
function n0() {
  return (
    Xc ||
      ((Xc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Eh(),
          r = Yg(),
          n = Zg(),
          i = r0();
        function a(o) {
          if (o == null) return t.identity;
          switch (typeof o) {
            case 'function':
              return o;
            case 'object':
              return Array.isArray(o) && o.length === 2
                ? i.matchesProperty(o[0], o[1])
                : n.matches(o);
            case 'string':
            case 'symbol':
            case 'number':
              return r.property(o);
          }
        }
        e.iteratee = a;
      })(fa)),
    fa
  );
}
var Zc;
function i0() {
  return (
    Zc ||
      ((Zc = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Kg(),
          r = Eh(),
          n = Hg(),
          i = n0();
        function a(o, u = r.identity) {
          return n.isArrayLikeObject(o) ? t.uniqBy(Array.from(o), i.iteratee(u)) : [];
        }
        e.uniqBy = a;
      })(ia)),
    ia
  );
}
var Ma, Jc;
function a0() {
  return (Jc || ((Jc = 1), (Ma = i0().uniqBy)), Ma);
}
var o0 = a0();
const Qc = Mt(o0);
function kh(e, t, r) {
  return t === !0 ? Qc(e, r) : typeof t == 'function' ? Qc(e, t) : e;
}
var ka = { exports: {} },
  Ia = {},
  Da = { exports: {} },
  Na = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var es;
function u0() {
  if (es) return Na;
  es = 1;
  var e = Pu();
  function t(f, d) {
    return (f === d && (f !== 0 || 1 / f === 1 / d)) || (f !== f && d !== d);
  }
  var r = typeof Object.is == 'function' ? Object.is : t,
    n = e.useState,
    i = e.useEffect,
    a = e.useLayoutEffect,
    o = e.useDebugValue;
  function u(f, d) {
    var h = d(),
      v = n({ inst: { value: h, getSnapshot: d } }),
      p = v[0].inst,
      m = v[1];
    return (
      a(
        function () {
          ((p.value = h), (p.getSnapshot = d), l(p) && m({ inst: p }));
        },
        [f, h, d]
      ),
      i(
        function () {
          return (
            l(p) && m({ inst: p }),
            f(function () {
              l(p) && m({ inst: p });
            })
          );
        },
        [f]
      ),
      o(h),
      h
    );
  }
  function l(f) {
    var d = f.getSnapshot;
    f = f.value;
    try {
      var h = d();
      return !r(f, h);
    } catch {
      return !0;
    }
  }
  function s(f, d) {
    return d();
  }
  var c =
    typeof window > 'u' ||
    typeof window.document > 'u' ||
    typeof window.document.createElement > 'u'
      ? s
      : u;
  return (
    (Na.useSyncExternalStore = e.useSyncExternalStore !== void 0 ? e.useSyncExternalStore : c),
    Na
  );
}
var ts;
function l0() {
  return (ts || ((ts = 1), (Da.exports = u0())), Da.exports);
}
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var rs;
function c0() {
  if (rs) return Ia;
  rs = 1;
  var e = Pu(),
    t = l0();
  function r(s, c) {
    return (s === c && (s !== 0 || 1 / s === 1 / c)) || (s !== s && c !== c);
  }
  var n = typeof Object.is == 'function' ? Object.is : r,
    i = t.useSyncExternalStore,
    a = e.useRef,
    o = e.useEffect,
    u = e.useMemo,
    l = e.useDebugValue;
  return (
    (Ia.useSyncExternalStoreWithSelector = function (s, c, f, d, h) {
      var v = a(null);
      if (v.current === null) {
        var p = { hasValue: !1, value: null };
        v.current = p;
      } else p = v.current;
      v = u(
        function () {
          function g(O) {
            if (!w) {
              if (((w = !0), (b = O), (O = d(O)), h !== void 0 && p.hasValue)) {
                var S = p.value;
                if (h(S, O)) return (P = S);
              }
              return (P = O);
            }
            if (((S = P), n(b, O))) return S;
            var _ = d(O);
            return h !== void 0 && h(S, _) ? ((b = O), S) : ((b = O), (P = _));
          }
          var w = !1,
            b,
            P,
            x = f === void 0 ? null : f;
          return [
            function () {
              return g(c());
            },
            x === null
              ? void 0
              : function () {
                  return g(x());
                },
          ];
        },
        [c, f, d, h]
      );
      var m = i(s, v[0], v[1]);
      return (
        o(
          function () {
            ((p.hasValue = !0), (p.value = m));
          },
          [m]
        ),
        l(m),
        m
      );
    }),
    Ia
  );
}
var ns;
function s0() {
  return (ns || ((ns = 1), (ka.exports = c0())), ka.exports);
}
var f0 = s0(),
  Lu = y.createContext(null),
  d0 = (e) => e,
  me = () => {
    var e = y.useContext(Lu);
    return e ? e.store.dispatch : d0;
  },
  _n = () => {},
  h0 = () => _n,
  v0 = (e, t) => e === t;
function D(e) {
  var t = y.useContext(Lu);
  return f0.useSyncExternalStoreWithSelector(
    t ? t.subscription.addNestedSub : h0,
    t ? t.store.getState : _n,
    t ? t.store.getState : _n,
    t ? e : _n,
    v0
  );
}
function p0(e, t = `expected a function, instead received ${typeof e}`) {
  if (typeof e != 'function') throw new TypeError(t);
}
function m0(e, t = `expected an object, instead received ${typeof e}`) {
  if (typeof e != 'object') throw new TypeError(t);
}
function y0(e, t = 'expected all items to be functions, instead received the following types: ') {
  if (!e.every((r) => typeof r == 'function')) {
    const r = e
      .map((n) => (typeof n == 'function' ? `function ${n.name || 'unnamed'}()` : typeof n))
      .join(', ');
    throw new TypeError(`${t}[${r}]`);
  }
}
var is = (e) => (Array.isArray(e) ? e : [e]);
function g0(e) {
  const t = Array.isArray(e[0]) ? e[0] : e;
  return (
    y0(
      t,
      'createSelector expects all input-selectors to be functions, but received the following types: '
    ),
    t
  );
}
function b0(e, t) {
  const r = [],
    { length: n } = e;
  for (let i = 0; i < n; i++) r.push(e[i].apply(null, t));
  return r;
}
var w0 = class {
    constructor(e) {
      this.value = e;
    }
    deref() {
      return this.value;
    }
  },
  x0 = typeof WeakRef < 'u' ? WeakRef : w0,
  P0 = 0,
  as = 1;
function vn() {
  return { s: P0, v: void 0, o: null, p: null };
}
function Ih(e, t = {}) {
  let r = vn();
  const { resultEqualityCheck: n } = t;
  let i,
    a = 0;
  function o() {
    let u = r;
    const { length: l } = arguments;
    for (let f = 0, d = l; f < d; f++) {
      const h = arguments[f];
      if (typeof h == 'function' || (typeof h == 'object' && h !== null)) {
        let v = u.o;
        v === null && (u.o = v = new WeakMap());
        const p = v.get(h);
        p === void 0 ? ((u = vn()), v.set(h, u)) : (u = p);
      } else {
        let v = u.p;
        v === null && (u.p = v = new Map());
        const p = v.get(h);
        p === void 0 ? ((u = vn()), v.set(h, u)) : (u = p);
      }
    }
    const s = u;
    let c;
    if (u.s === as) c = u.v;
    else if (((c = e.apply(null, arguments)), a++, n)) {
      const f = i?.deref?.() ?? i;
      (f != null && n(f, c) && ((c = f), a !== 0 && a--),
        (i = (typeof c == 'object' && c !== null) || typeof c == 'function' ? new x0(c) : c));
    }
    return ((s.s = as), (s.v = c), c);
  }
  return (
    (o.clearCache = () => {
      ((r = vn()), o.resetResultsCount());
    }),
    (o.resultsCount = () => a),
    (o.resetResultsCount = () => {
      a = 0;
    }),
    o
  );
}
function O0(e, ...t) {
  const r = typeof e == 'function' ? { memoize: e, memoizeOptions: t } : e,
    n = (...i) => {
      let a = 0,
        o = 0,
        u,
        l = {},
        s = i.pop();
      (typeof s == 'object' && ((l = s), (s = i.pop())),
        p0(
          s,
          `createSelector expects an output function after the inputs, but received: [${typeof s}]`
        ));
      const c = { ...r, ...l },
        { memoize: f, memoizeOptions: d = [], argsMemoize: h = Ih, argsMemoizeOptions: v = [] } = c,
        p = is(d),
        m = is(v),
        g = g0(i),
        w = f(
          function () {
            return (a++, s.apply(null, arguments));
          },
          ...p
        ),
        b = h(
          function () {
            o++;
            const x = b0(g, arguments);
            return ((u = w.apply(null, x)), u);
          },
          ...m
        );
      return Object.assign(b, {
        resultFunc: s,
        memoizedResultFunc: w,
        dependencies: g,
        dependencyRecomputations: () => o,
        resetDependencyRecomputations: () => {
          o = 0;
        },
        lastResult: () => u,
        recomputations: () => a,
        resetRecomputations: () => {
          a = 0;
        },
        memoize: f,
        argsMemoize: h,
      });
    };
  return (Object.assign(n, { withTypes: () => n }), n);
}
var A = O0(Ih),
  A0 = Object.assign(
    (e, t = A) => {
      m0(
        e,
        `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof e}`
      );
      const r = Object.keys(e),
        n = r.map((a) => e[a]);
      return t(n, (...a) => a.reduce((o, u, l) => ((o[r[l]] = u), o), {}));
    },
    { withTypes: () => A0 }
  ),
  $a = {},
  Ra = {},
  La = {},
  os;
function S0() {
  return (
    os ||
      ((os = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(n) {
          return typeof n == 'symbol' ? 1 : n === null ? 2 : n === void 0 ? 3 : n !== n ? 4 : 0;
        }
        const r = (n, i, a) => {
          if (n !== i) {
            const o = t(n),
              u = t(i);
            if (o === u && o === 0) {
              if (n < i) return a === 'desc' ? 1 : -1;
              if (n > i) return a === 'desc' ? -1 : 1;
            }
            return a === 'desc' ? u - o : o - u;
          }
          return 0;
        };
        e.compareValues = r;
      })(La)),
    La
  );
}
var Ba = {},
  qa = {},
  us;
function Dh() {
  return (
    us ||
      ((us = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return typeof r == 'symbol' || r instanceof Symbol;
        }
        e.isSymbol = t;
      })(qa)),
    qa
  );
}
var ls;
function E0() {
  return (
    ls ||
      ((ls = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Dh(),
          r = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
          n = /^\w*$/;
        function i(a, o) {
          return Array.isArray(a)
            ? !1
            : typeof a == 'number' || typeof a == 'boolean' || a == null || t.isSymbol(a)
              ? !0
              : (typeof a == 'string' && (n.test(a) || !r.test(a))) ||
                (o != null && Object.hasOwn(o, a));
        }
        e.isKey = i;
      })(Ba)),
    Ba
  );
}
var cs;
function _0() {
  return (
    cs ||
      ((cs = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = S0(),
          r = E0(),
          n = Ou();
        function i(a, o, u, l) {
          if (a == null) return [];
          ((u = l ? void 0 : u),
            Array.isArray(a) || (a = Object.values(a)),
            Array.isArray(o) || (o = o == null ? [null] : [o]),
            o.length === 0 && (o = [null]),
            Array.isArray(u) || (u = u == null ? [] : [u]),
            (u = u.map((h) => String(h))));
          const s = (h, v) => {
              let p = h;
              for (let m = 0; m < v.length && p != null; ++m) p = p[v[m]];
              return p;
            },
            c = (h, v) =>
              v == null || h == null
                ? v
                : typeof h == 'object' && 'key' in h
                  ? Object.hasOwn(v, h.key)
                    ? v[h.key]
                    : s(v, h.path)
                  : typeof h == 'function'
                    ? h(v)
                    : Array.isArray(h)
                      ? s(v, h)
                      : typeof v == 'object'
                        ? v[h]
                        : v,
            f = o.map(
              (h) => (
                Array.isArray(h) && h.length === 1 && (h = h[0]),
                h == null || typeof h == 'function' || Array.isArray(h) || r.isKey(h)
                  ? h
                  : { key: h, path: n.toPath(h) }
              )
            );
          return a
            .map((h) => ({ original: h, criteria: f.map((v) => c(v, h)) }))
            .slice()
            .sort((h, v) => {
              for (let p = 0; p < f.length; p++) {
                const m = t.compareValues(h.criteria[p], v.criteria[p], u[p]);
                if (m !== 0) return m;
              }
              return 0;
            })
            .map((h) => h.original);
        }
        e.orderBy = i;
      })(Ra)),
    Ra
  );
}
var za = {},
  ss;
function T0() {
  return (
    ss ||
      ((ss = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r, n = 1) {
          const i = [],
            a = Math.floor(n),
            o = (u, l) => {
              for (let s = 0; s < u.length; s++) {
                const c = u[s];
                Array.isArray(c) && l < a ? o(c, l + 1) : i.push(c);
              }
            };
          return (o(r, 0), i);
        }
        e.flatten = t;
      })(za)),
    za
  );
}
var Fa = {},
  fs;
function Nh() {
  return (
    fs ||
      ((fs = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Mh(),
          r = Iu(),
          n = _h(),
          i = Du();
        function a(o, u, l) {
          return n.isObject(l) &&
            ((typeof u == 'number' && r.isArrayLike(l) && t.isIndex(u) && u < l.length) ||
              (typeof u == 'string' && u in l))
            ? i.eq(l[u], o)
            : !1;
        }
        e.isIterateeCall = a;
      })(Fa)),
    Fa
  );
}
var ds;
function C0() {
  return (
    ds ||
      ((ds = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = _0(),
          r = T0(),
          n = Nh();
        function i(a, ...o) {
          const u = o.length;
          return (
            u > 1 && n.isIterateeCall(a, o[0], o[1])
              ? (o = [])
              : u > 2 && n.isIterateeCall(o[0], o[1], o[2]) && (o = [o[0]]),
            t.orderBy(a, r.flatten(o), ['asc'])
          );
        }
        e.sortBy = i;
      })($a)),
    $a
  );
}
var Ka, hs;
function j0() {
  return (hs || ((hs = 1), (Ka = C0().sortBy)), Ka);
}
var M0 = j0();
const vi = Mt(M0);
var $h = (e) => e.legend.settings,
  k0 = (e) => e.legend.size,
  I0 = (e) => e.legend.payload,
  D0 = A([I0, $h], (e, t) => {
    var { itemSorter: r } = t,
      n = e.flat(1);
    return r ? vi(n, r) : n;
  });
function N0() {
  return D(D0);
}
var pn = 1;
function Rh() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [],
    [t, r] = y.useState({ height: 0, left: 0, top: 0, width: 0 }),
    n = y.useCallback(
      (i) => {
        if (i != null) {
          var a = i.getBoundingClientRect(),
            o = { height: a.height, left: a.left, top: a.top, width: a.width };
          (Math.abs(o.height - t.height) > pn ||
            Math.abs(o.left - t.left) > pn ||
            Math.abs(o.top - t.top) > pn ||
            Math.abs(o.width - t.width) > pn) &&
            r({ height: o.height, left: o.left, top: o.top, width: o.width });
        }
      },
      [t.width, t.height, t.top, t.left, ...e]
    );
  return [t, n];
}
function de(e) {
  return `Minified Redux error #${e}; visit https://redux.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var $0 = (typeof Symbol == 'function' && Symbol.observable) || '@@observable',
  vs = $0,
  Wa = () => Math.random().toString(36).substring(7).split('').join('.'),
  R0 = {
    INIT: `@@redux/INIT${Wa()}`,
    REPLACE: `@@redux/REPLACE${Wa()}`,
    PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${Wa()}`,
  },
  In = R0;
function Bu(e) {
  if (typeof e != 'object' || e === null) return !1;
  let t = e;
  for (; Object.getPrototypeOf(t) !== null; ) t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(e) === t || Object.getPrototypeOf(e) === null;
}
function Lh(e, t, r) {
  if (typeof e != 'function') throw new Error(de(2));
  if (
    (typeof t == 'function' && typeof r == 'function') ||
    (typeof r == 'function' && typeof arguments[3] == 'function')
  )
    throw new Error(de(0));
  if ((typeof t == 'function' && typeof r > 'u' && ((r = t), (t = void 0)), typeof r < 'u')) {
    if (typeof r != 'function') throw new Error(de(1));
    return r(Lh)(e, t);
  }
  let n = e,
    i = t,
    a = new Map(),
    o = a,
    u = 0,
    l = !1;
  function s() {
    o === a &&
      ((o = new Map()),
      a.forEach((m, g) => {
        o.set(g, m);
      }));
  }
  function c() {
    if (l) throw new Error(de(3));
    return i;
  }
  function f(m) {
    if (typeof m != 'function') throw new Error(de(4));
    if (l) throw new Error(de(5));
    let g = !0;
    s();
    const w = u++;
    return (
      o.set(w, m),
      function () {
        if (g) {
          if (l) throw new Error(de(6));
          ((g = !1), s(), o.delete(w), (a = null));
        }
      }
    );
  }
  function d(m) {
    if (!Bu(m)) throw new Error(de(7));
    if (typeof m.type > 'u') throw new Error(de(8));
    if (typeof m.type != 'string') throw new Error(de(17));
    if (l) throw new Error(de(9));
    try {
      ((l = !0), (i = n(i, m)));
    } finally {
      l = !1;
    }
    return (
      (a = o).forEach((w) => {
        w();
      }),
      m
    );
  }
  function h(m) {
    if (typeof m != 'function') throw new Error(de(10));
    ((n = m), d({ type: In.REPLACE }));
  }
  function v() {
    const m = f;
    return {
      subscribe(g) {
        if (typeof g != 'object' || g === null) throw new Error(de(11));
        function w() {
          const P = g;
          P.next && P.next(c());
        }
        return (w(), { unsubscribe: m(w) });
      },
      [vs]() {
        return this;
      },
    };
  }
  return (
    d({ type: In.INIT }),
    { dispatch: d, subscribe: f, getState: c, replaceReducer: h, [vs]: v }
  );
}
function L0(e) {
  Object.keys(e).forEach((t) => {
    const r = e[t];
    if (typeof r(void 0, { type: In.INIT }) > 'u') throw new Error(de(12));
    if (typeof r(void 0, { type: In.PROBE_UNKNOWN_ACTION() }) > 'u') throw new Error(de(13));
  });
}
function Bh(e) {
  const t = Object.keys(e),
    r = {};
  for (let a = 0; a < t.length; a++) {
    const o = t[a];
    typeof e[o] == 'function' && (r[o] = e[o]);
  }
  const n = Object.keys(r);
  let i;
  try {
    L0(r);
  } catch (a) {
    i = a;
  }
  return function (o = {}, u) {
    if (i) throw i;
    let l = !1;
    const s = {};
    for (let c = 0; c < n.length; c++) {
      const f = n[c],
        d = r[f],
        h = o[f],
        v = d(h, u);
      if (typeof v > 'u') throw (u && u.type, new Error(de(14)));
      ((s[f] = v), (l = l || v !== h));
    }
    return ((l = l || n.length !== Object.keys(o).length), l ? s : o);
  };
}
function Dn(...e) {
  return e.length === 0
    ? (t) => t
    : e.length === 1
      ? e[0]
      : e.reduce(
          (t, r) =>
            (...n) =>
              t(r(...n))
        );
}
function B0(...e) {
  return (t) => (r, n) => {
    const i = t(r, n);
    let a = () => {
      throw new Error(de(15));
    };
    const o = { getState: i.getState, dispatch: (l, ...s) => a(l, ...s) },
      u = e.map((l) => l(o));
    return ((a = Dn(...u)(i.dispatch)), { ...i, dispatch: a });
  };
}
function qh(e) {
  return Bu(e) && 'type' in e && typeof e.type == 'string';
}
var zh = Symbol.for('immer-nothing'),
  ps = Symbol.for('immer-draftable'),
  Re = Symbol.for('immer-state');
function Je(e, ...t) {
  throw new Error(`[Immer] minified error nr: ${e}. Full error at: https://bit.ly/3cXEKWf`);
}
var vr = Object.getPrototypeOf;
function Qt(e) {
  return !!e && !!e[Re];
}
function pt(e) {
  return e ? Fh(e) || Array.isArray(e) || !!e[ps] || !!e.constructor?.[ps] || en(e) || mi(e) : !1;
}
var q0 = Object.prototype.constructor.toString();
function Fh(e) {
  if (!e || typeof e != 'object') return !1;
  const t = vr(e);
  if (t === null) return !0;
  const r = Object.hasOwnProperty.call(t, 'constructor') && t.constructor;
  return r === Object ? !0 : typeof r == 'function' && Function.toString.call(r) === q0;
}
function Nn(e, t) {
  pi(e) === 0
    ? Reflect.ownKeys(e).forEach((r) => {
        t(r, e[r], e);
      })
    : e.forEach((r, n) => t(n, r, e));
}
function pi(e) {
  const t = e[Re];
  return t ? t.type_ : Array.isArray(e) ? 1 : en(e) ? 2 : mi(e) ? 3 : 0;
}
function $o(e, t) {
  return pi(e) === 2 ? e.has(t) : Object.prototype.hasOwnProperty.call(e, t);
}
function Kh(e, t, r) {
  const n = pi(e);
  n === 2 ? e.set(t, r) : n === 3 ? e.add(r) : (e[t] = r);
}
function z0(e, t) {
  return e === t ? e !== 0 || 1 / e === 1 / t : e !== e && t !== t;
}
function en(e) {
  return e instanceof Map;
}
function mi(e) {
  return e instanceof Set;
}
function qt(e) {
  return e.copy_ || e.base_;
}
function Ro(e, t) {
  if (en(e)) return new Map(e);
  if (mi(e)) return new Set(e);
  if (Array.isArray(e)) return Array.prototype.slice.call(e);
  const r = Fh(e);
  if (t === !0 || (t === 'class_only' && !r)) {
    const n = Object.getOwnPropertyDescriptors(e);
    delete n[Re];
    let i = Reflect.ownKeys(n);
    for (let a = 0; a < i.length; a++) {
      const o = i[a],
        u = n[o];
      (u.writable === !1 && ((u.writable = !0), (u.configurable = !0)),
        (u.get || u.set) &&
          (n[o] = { configurable: !0, writable: !0, enumerable: u.enumerable, value: e[o] }));
    }
    return Object.create(vr(e), n);
  } else {
    const n = vr(e);
    if (n !== null && r) return { ...e };
    const i = Object.create(n);
    return Object.assign(i, e);
  }
}
function qu(e, t = !1) {
  return (
    yi(e) ||
      Qt(e) ||
      !pt(e) ||
      (pi(e) > 1 &&
        Object.defineProperties(e, {
          set: { value: mn },
          add: { value: mn },
          clear: { value: mn },
          delete: { value: mn },
        }),
      Object.freeze(e),
      t && Object.values(e).forEach((r) => qu(r, !0))),
    e
  );
}
function mn() {
  Je(2);
}
function yi(e) {
  return Object.isFrozen(e);
}
var F0 = {};
function er(e) {
  const t = F0[e];
  return (t || Je(0, e), t);
}
var Fr;
function Wh() {
  return Fr;
}
function K0(e, t) {
  return { drafts_: [], parent_: e, immer_: t, canAutoFreeze_: !0, unfinalizedDrafts_: 0 };
}
function ms(e, t) {
  t && (er('Patches'), (e.patches_ = []), (e.inversePatches_ = []), (e.patchListener_ = t));
}
function Lo(e) {
  (Bo(e), e.drafts_.forEach(W0), (e.drafts_ = null));
}
function Bo(e) {
  e === Fr && (Fr = e.parent_);
}
function ys(e) {
  return (Fr = K0(Fr, e));
}
function W0(e) {
  const t = e[Re];
  t.type_ === 0 || t.type_ === 1 ? t.revoke_() : (t.revoked_ = !0);
}
function gs(e, t) {
  t.unfinalizedDrafts_ = t.drafts_.length;
  const r = t.drafts_[0];
  return (
    e !== void 0 && e !== r
      ? (r[Re].modified_ && (Lo(t), Je(4)),
        pt(e) && ((e = $n(t, e)), t.parent_ || Rn(t, e)),
        t.patches_ &&
          er('Patches').generateReplacementPatches_(r[Re].base_, e, t.patches_, t.inversePatches_))
      : (e = $n(t, r, [])),
    Lo(t),
    t.patches_ && t.patchListener_(t.patches_, t.inversePatches_),
    e !== zh ? e : void 0
  );
}
function $n(e, t, r) {
  if (yi(t)) return t;
  const n = t[Re];
  if (!n) return (Nn(t, (i, a) => bs(e, n, t, i, a, r)), t);
  if (n.scope_ !== e) return t;
  if (!n.modified_) return (Rn(e, n.base_, !0), n.base_);
  if (!n.finalized_) {
    ((n.finalized_ = !0), n.scope_.unfinalizedDrafts_--);
    const i = n.copy_;
    let a = i,
      o = !1;
    (n.type_ === 3 && ((a = new Set(i)), i.clear(), (o = !0)),
      Nn(a, (u, l) => bs(e, n, i, u, l, r, o)),
      Rn(e, i, !1),
      r && e.patches_ && er('Patches').generatePatches_(n, r, e.patches_, e.inversePatches_));
  }
  return n.copy_;
}
function bs(e, t, r, n, i, a, o) {
  if (Qt(i)) {
    const u = a && t && t.type_ !== 3 && !$o(t.assigned_, n) ? a.concat(n) : void 0,
      l = $n(e, i, u);
    if ((Kh(r, n, l), Qt(l))) e.canAutoFreeze_ = !1;
    else return;
  } else o && r.add(i);
  if (pt(i) && !yi(i)) {
    if (!e.immer_.autoFreeze_ && e.unfinalizedDrafts_ < 1) return;
    ($n(e, i),
      (!t || !t.scope_.parent_) &&
        typeof n != 'symbol' &&
        (en(r) ? r.has(n) : Object.prototype.propertyIsEnumerable.call(r, n)) &&
        Rn(e, i));
  }
}
function Rn(e, t, r = !1) {
  !e.parent_ && e.immer_.autoFreeze_ && e.canAutoFreeze_ && qu(t, r);
}
function U0(e, t) {
  const r = Array.isArray(e),
    n = {
      type_: r ? 1 : 0,
      scope_: t ? t.scope_ : Wh(),
      modified_: !1,
      finalized_: !1,
      assigned_: {},
      parent_: t,
      base_: e,
      draft_: null,
      copy_: null,
      revoke_: null,
      isManual_: !1,
    };
  let i = n,
    a = zu;
  r && ((i = [n]), (a = Kr));
  const { revoke: o, proxy: u } = Proxy.revocable(i, a);
  return ((n.draft_ = u), (n.revoke_ = o), u);
}
var zu = {
    get(e, t) {
      if (t === Re) return e;
      const r = qt(e);
      if (!$o(r, t)) return H0(e, r, t);
      const n = r[t];
      return e.finalized_ || !pt(n)
        ? n
        : n === Ua(e.base_, t)
          ? (Ha(e), (e.copy_[t] = zo(n, e)))
          : n;
    },
    has(e, t) {
      return t in qt(e);
    },
    ownKeys(e) {
      return Reflect.ownKeys(qt(e));
    },
    set(e, t, r) {
      const n = Uh(qt(e), t);
      if (n?.set) return (n.set.call(e.draft_, r), !0);
      if (!e.modified_) {
        const i = Ua(qt(e), t),
          a = i?.[Re];
        if (a && a.base_ === r) return ((e.copy_[t] = r), (e.assigned_[t] = !1), !0);
        if (z0(r, i) && (r !== void 0 || $o(e.base_, t))) return !0;
        (Ha(e), qo(e));
      }
      return (
        (e.copy_[t] === r && (r !== void 0 || t in e.copy_)) ||
          (Number.isNaN(r) && Number.isNaN(e.copy_[t])) ||
          ((e.copy_[t] = r), (e.assigned_[t] = !0)),
        !0
      );
    },
    deleteProperty(e, t) {
      return (
        Ua(e.base_, t) !== void 0 || t in e.base_
          ? ((e.assigned_[t] = !1), Ha(e), qo(e))
          : delete e.assigned_[t],
        e.copy_ && delete e.copy_[t],
        !0
      );
    },
    getOwnPropertyDescriptor(e, t) {
      const r = qt(e),
        n = Reflect.getOwnPropertyDescriptor(r, t);
      return (
        n && {
          writable: !0,
          configurable: e.type_ !== 1 || t !== 'length',
          enumerable: n.enumerable,
          value: r[t],
        }
      );
    },
    defineProperty() {
      Je(11);
    },
    getPrototypeOf(e) {
      return vr(e.base_);
    },
    setPrototypeOf() {
      Je(12);
    },
  },
  Kr = {};
Nn(zu, (e, t) => {
  Kr[e] = function () {
    return ((arguments[0] = arguments[0][0]), t.apply(this, arguments));
  };
});
Kr.deleteProperty = function (e, t) {
  return Kr.set.call(this, e, t, void 0);
};
Kr.set = function (e, t, r) {
  return zu.set.call(this, e[0], t, r, e[0]);
};
function Ua(e, t) {
  const r = e[Re];
  return (r ? qt(r) : e)[t];
}
function H0(e, t, r) {
  const n = Uh(t, r);
  return n ? ('value' in n ? n.value : n.get?.call(e.draft_)) : void 0;
}
function Uh(e, t) {
  if (!(t in e)) return;
  let r = vr(e);
  for (; r; ) {
    const n = Object.getOwnPropertyDescriptor(r, t);
    if (n) return n;
    r = vr(r);
  }
}
function qo(e) {
  e.modified_ || ((e.modified_ = !0), e.parent_ && qo(e.parent_));
}
function Ha(e) {
  e.copy_ || (e.copy_ = Ro(e.base_, e.scope_.immer_.useStrictShallowCopy_));
}
var Y0 = class {
  constructor(e) {
    ((this.autoFreeze_ = !0),
      (this.useStrictShallowCopy_ = !1),
      (this.produce = (t, r, n) => {
        if (typeof t == 'function' && typeof r != 'function') {
          const a = r;
          r = t;
          const o = this;
          return function (l = a, ...s) {
            return o.produce(l, (c) => r.call(this, c, ...s));
          };
        }
        (typeof r != 'function' && Je(6), n !== void 0 && typeof n != 'function' && Je(7));
        let i;
        if (pt(t)) {
          const a = ys(this),
            o = zo(t, void 0);
          let u = !0;
          try {
            ((i = r(o)), (u = !1));
          } finally {
            u ? Lo(a) : Bo(a);
          }
          return (ms(a, n), gs(i, a));
        } else if (!t || typeof t != 'object') {
          if (
            ((i = r(t)),
            i === void 0 && (i = t),
            i === zh && (i = void 0),
            this.autoFreeze_ && qu(i, !0),
            n)
          ) {
            const a = [],
              o = [];
            (er('Patches').generateReplacementPatches_(t, i, a, o), n(a, o));
          }
          return i;
        } else Je(1, t);
      }),
      (this.produceWithPatches = (t, r) => {
        if (typeof t == 'function')
          return (o, ...u) => this.produceWithPatches(o, (l) => t(l, ...u));
        let n, i;
        return [
          this.produce(t, r, (o, u) => {
            ((n = o), (i = u));
          }),
          n,
          i,
        ];
      }),
      typeof e?.autoFreeze == 'boolean' && this.setAutoFreeze(e.autoFreeze),
      typeof e?.useStrictShallowCopy == 'boolean' &&
        this.setUseStrictShallowCopy(e.useStrictShallowCopy));
  }
  createDraft(e) {
    (pt(e) || Je(8), Qt(e) && (e = dt(e)));
    const t = ys(this),
      r = zo(e, void 0);
    return ((r[Re].isManual_ = !0), Bo(t), r);
  }
  finishDraft(e, t) {
    const r = e && e[Re];
    (!r || !r.isManual_) && Je(9);
    const { scope_: n } = r;
    return (ms(n, t), gs(void 0, n));
  }
  setAutoFreeze(e) {
    this.autoFreeze_ = e;
  }
  setUseStrictShallowCopy(e) {
    this.useStrictShallowCopy_ = e;
  }
  applyPatches(e, t) {
    let r;
    for (r = t.length - 1; r >= 0; r--) {
      const i = t[r];
      if (i.path.length === 0 && i.op === 'replace') {
        e = i.value;
        break;
      }
    }
    r > -1 && (t = t.slice(r + 1));
    const n = er('Patches').applyPatches_;
    return Qt(e) ? n(e, t) : this.produce(e, (i) => n(i, t));
  }
};
function zo(e, t) {
  const r = en(e) ? er('MapSet').proxyMap_(e, t) : mi(e) ? er('MapSet').proxySet_(e, t) : U0(e, t);
  return ((t ? t.scope_ : Wh()).drafts_.push(r), r);
}
function dt(e) {
  return (Qt(e) || Je(10, e), Hh(e));
}
function Hh(e) {
  if (!pt(e) || yi(e)) return e;
  const t = e[Re];
  let r;
  if (t) {
    if (!t.modified_) return t.base_;
    ((t.finalized_ = !0), (r = Ro(e, t.scope_.immer_.useStrictShallowCopy_)));
  } else r = Ro(e, !0);
  return (
    Nn(r, (n, i) => {
      Kh(r, n, Hh(i));
    }),
    t && (t.finalized_ = !1),
    r
  );
}
var G0 = new Y0(),
  Yh = G0.produce;
function Gh(e) {
  return ({ dispatch: r, getState: n }) =>
    (i) =>
    (a) =>
      typeof a == 'function' ? a(r, n, e) : i(a);
}
var V0 = Gh(),
  X0 = Gh,
  Z0 =
    typeof window < 'u' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : function () {
          if (arguments.length !== 0)
            return typeof arguments[0] == 'object' ? Dn : Dn.apply(null, arguments);
        };
function Ye(e, t) {
  function r(...n) {
    if (t) {
      let i = t(...n);
      if (!i) throw new Error(Ne(0));
      return {
        type: e,
        payload: i.payload,
        ...('meta' in i && { meta: i.meta }),
        ...('error' in i && { error: i.error }),
      };
    }
    return { type: e, payload: n[0] };
  }
  return ((r.toString = () => `${e}`), (r.type = e), (r.match = (n) => qh(n) && n.type === e), r);
}
var Vh = class $r extends Array {
  constructor(...t) {
    (super(...t), Object.setPrototypeOf(this, $r.prototype));
  }
  static get [Symbol.species]() {
    return $r;
  }
  concat(...t) {
    return super.concat.apply(this, t);
  }
  prepend(...t) {
    return t.length === 1 && Array.isArray(t[0])
      ? new $r(...t[0].concat(this))
      : new $r(...t.concat(this));
  }
};
function ws(e) {
  return pt(e) ? Yh(e, () => {}) : e;
}
function yn(e, t, r) {
  return e.has(t) ? e.get(t) : e.set(t, r(t)).get(t);
}
function J0(e) {
  return typeof e == 'boolean';
}
var Q0 = () =>
    function (t) {
      const {
        thunk: r = !0,
        immutableCheck: n = !0,
        serializableCheck: i = !0,
        actionCreatorCheck: a = !0,
      } = t ?? {};
      let o = new Vh();
      return (r && (J0(r) ? o.push(V0) : o.push(X0(r.extraArgument))), o);
    },
  eb = 'RTK_autoBatch',
  xs = (e) => (t) => {
    setTimeout(t, e);
  },
  tb =
    (e = { type: 'raf' }) =>
    (t) =>
    (...r) => {
      const n = t(...r);
      let i = !0,
        a = !1,
        o = !1;
      const u = new Set(),
        l =
          e.type === 'tick'
            ? queueMicrotask
            : e.type === 'raf'
              ? typeof window < 'u' && window.requestAnimationFrame
                ? window.requestAnimationFrame
                : xs(10)
              : e.type === 'callback'
                ? e.queueNotification
                : xs(e.timeout),
        s = () => {
          ((o = !1), a && ((a = !1), u.forEach((c) => c())));
        };
      return Object.assign({}, n, {
        subscribe(c) {
          const f = () => i && c(),
            d = n.subscribe(f);
          return (
            u.add(c),
            () => {
              (d(), u.delete(c));
            }
          );
        },
        dispatch(c) {
          try {
            return ((i = !c?.meta?.[eb]), (a = !i), a && (o || ((o = !0), l(s))), n.dispatch(c));
          } finally {
            i = !0;
          }
        },
      });
    },
  rb = (e) =>
    function (r) {
      const { autoBatch: n = !0 } = r ?? {};
      let i = new Vh(e);
      return (n && i.push(tb(typeof n == 'object' ? n : void 0)), i);
    };
function nb(e) {
  const t = Q0(),
    {
      reducer: r = void 0,
      middleware: n,
      devTools: i = !0,
      preloadedState: a = void 0,
      enhancers: o = void 0,
    } = e || {};
  let u;
  if (typeof r == 'function') u = r;
  else if (Bu(r)) u = Bh(r);
  else throw new Error(Ne(1));
  let l;
  typeof n == 'function' ? (l = n(t)) : (l = t());
  let s = Dn;
  i && (s = Z0({ trace: !1, ...(typeof i == 'object' && i) }));
  const c = B0(...l),
    f = rb(c);
  let d = typeof o == 'function' ? o(f) : f();
  const h = s(...d);
  return Lh(u, a, h);
}
function Xh(e) {
  const t = {},
    r = [];
  let n;
  const i = {
    addCase(a, o) {
      const u = typeof a == 'string' ? a : a.type;
      if (!u) throw new Error(Ne(28));
      if (u in t) throw new Error(Ne(29));
      return ((t[u] = o), i);
    },
    addAsyncThunk(a, o) {
      return (
        o.pending && (t[a.pending.type] = o.pending),
        o.rejected && (t[a.rejected.type] = o.rejected),
        o.fulfilled && (t[a.fulfilled.type] = o.fulfilled),
        o.settled && r.push({ matcher: a.settled, reducer: o.settled }),
        i
      );
    },
    addMatcher(a, o) {
      return (r.push({ matcher: a, reducer: o }), i);
    },
    addDefaultCase(a) {
      return ((n = a), i);
    },
  };
  return (e(i), [t, r, n]);
}
function ib(e) {
  return typeof e == 'function';
}
function ab(e, t) {
  let [r, n, i] = Xh(t),
    a;
  if (ib(e)) a = () => ws(e());
  else {
    const u = ws(e);
    a = () => u;
  }
  function o(u = a(), l) {
    let s = [r[l.type], ...n.filter(({ matcher: c }) => c(l)).map(({ reducer: c }) => c)];
    return (
      s.filter((c) => !!c).length === 0 && (s = [i]),
      s.reduce((c, f) => {
        if (f)
          if (Qt(c)) {
            const h = f(c, l);
            return h === void 0 ? c : h;
          } else {
            if (pt(c)) return Yh(c, (d) => f(d, l));
            {
              const d = f(c, l);
              if (d === void 0) {
                if (c === null) return c;
                throw Error('A case reducer on a non-draftable value must not return undefined');
              }
              return d;
            }
          }
        return c;
      }, u)
    );
  }
  return ((o.getInitialState = a), o);
}
var ob = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW',
  ub = (e = 21) => {
    let t = '',
      r = e;
    for (; r--; ) t += ob[(Math.random() * 64) | 0];
    return t;
  },
  lb = Symbol.for('rtk-slice-createasyncthunk');
function cb(e, t) {
  return `${e}/${t}`;
}
function sb({ creators: e } = {}) {
  const t = e?.asyncThunk?.[lb];
  return function (n) {
    const { name: i, reducerPath: a = i } = n;
    if (!i) throw new Error(Ne(11));
    const o = (typeof n.reducers == 'function' ? n.reducers(db()) : n.reducers) || {},
      u = Object.keys(o),
      l = {
        sliceCaseReducersByName: {},
        sliceCaseReducersByType: {},
        actionCreators: {},
        sliceMatchers: [],
      },
      s = {
        addCase(b, P) {
          const x = typeof b == 'string' ? b : b.type;
          if (!x) throw new Error(Ne(12));
          if (x in l.sliceCaseReducersByType) throw new Error(Ne(13));
          return ((l.sliceCaseReducersByType[x] = P), s);
        },
        addMatcher(b, P) {
          return (l.sliceMatchers.push({ matcher: b, reducer: P }), s);
        },
        exposeAction(b, P) {
          return ((l.actionCreators[b] = P), s);
        },
        exposeCaseReducer(b, P) {
          return ((l.sliceCaseReducersByName[b] = P), s);
        },
      };
    u.forEach((b) => {
      const P = o[b],
        x = { reducerName: b, type: cb(i, b), createNotation: typeof n.reducers == 'function' };
      vb(P) ? mb(x, P, s, t) : hb(x, P, s);
    });
    function c() {
      const [b = {}, P = [], x = void 0] =
          typeof n.extraReducers == 'function' ? Xh(n.extraReducers) : [n.extraReducers],
        O = { ...b, ...l.sliceCaseReducersByType };
      return ab(n.initialState, (S) => {
        for (let _ in O) S.addCase(_, O[_]);
        for (let _ of l.sliceMatchers) S.addMatcher(_.matcher, _.reducer);
        for (let _ of P) S.addMatcher(_.matcher, _.reducer);
        x && S.addDefaultCase(x);
      });
    }
    const f = (b) => b,
      d = new Map(),
      h = new WeakMap();
    let v;
    function p(b, P) {
      return (v || (v = c()), v(b, P));
    }
    function m() {
      return (v || (v = c()), v.getInitialState());
    }
    function g(b, P = !1) {
      function x(S) {
        let _ = S[b];
        return (typeof _ > 'u' && P && (_ = yn(h, x, m)), _);
      }
      function O(S = f) {
        const _ = yn(d, P, () => new WeakMap());
        return yn(_, S, () => {
          const C = {};
          for (const [N, T] of Object.entries(n.selectors ?? {}))
            C[N] = fb(T, S, () => yn(h, S, m), P);
          return C;
        });
      }
      return {
        reducerPath: b,
        getSelectors: O,
        get selectors() {
          return O(x);
        },
        selectSlice: x,
      };
    }
    const w = {
      name: i,
      reducer: p,
      actions: l.actionCreators,
      caseReducers: l.sliceCaseReducersByName,
      getInitialState: m,
      ...g(a),
      injectInto(b, { reducerPath: P, ...x } = {}) {
        const O = P ?? a;
        return (b.inject({ reducerPath: O, reducer: p }, x), { ...w, ...g(O, !0) });
      },
    };
    return w;
  };
}
function fb(e, t, r, n) {
  function i(a, ...o) {
    let u = t(a);
    return (typeof u > 'u' && n && (u = r()), e(u, ...o));
  }
  return ((i.unwrapped = e), i);
}
var Le = sb();
function db() {
  function e(t, r) {
    return { _reducerDefinitionType: 'asyncThunk', payloadCreator: t, ...r };
  }
  return (
    (e.withTypes = () => e),
    {
      reducer(t) {
        return Object.assign(
          {
            [t.name](...r) {
              return t(...r);
            },
          }[t.name],
          { _reducerDefinitionType: 'reducer' }
        );
      },
      preparedReducer(t, r) {
        return { _reducerDefinitionType: 'reducerWithPrepare', prepare: t, reducer: r };
      },
      asyncThunk: e,
    }
  );
}
function hb({ type: e, reducerName: t, createNotation: r }, n, i) {
  let a, o;
  if ('reducer' in n) {
    if (r && !pb(n)) throw new Error(Ne(17));
    ((a = n.reducer), (o = n.prepare));
  } else a = n;
  i.addCase(e, a)
    .exposeCaseReducer(t, a)
    .exposeAction(t, o ? Ye(e, o) : Ye(e));
}
function vb(e) {
  return e._reducerDefinitionType === 'asyncThunk';
}
function pb(e) {
  return e._reducerDefinitionType === 'reducerWithPrepare';
}
function mb({ type: e, reducerName: t }, r, n, i) {
  if (!i) throw new Error(Ne(18));
  const { payloadCreator: a, fulfilled: o, pending: u, rejected: l, settled: s, options: c } = r,
    f = i(e, a, c);
  (n.exposeAction(t, f),
    o && n.addCase(f.fulfilled, o),
    u && n.addCase(f.pending, u),
    l && n.addCase(f.rejected, l),
    s && n.addMatcher(f.settled, s),
    n.exposeCaseReducer(t, {
      fulfilled: o || gn,
      pending: u || gn,
      rejected: l || gn,
      settled: s || gn,
    }));
}
function gn() {}
var yb = 'task',
  Zh = 'listener',
  Jh = 'completed',
  Fu = 'cancelled',
  gb = `task-${Fu}`,
  bb = `task-${Jh}`,
  Fo = `${Zh}-${Fu}`,
  wb = `${Zh}-${Jh}`,
  gi = class {
    constructor(e) {
      ((this.code = e), (this.message = `${yb} ${Fu} (reason: ${e})`));
    }
    name = 'TaskAbortError';
    message;
  },
  Ku = (e, t) => {
    if (typeof e != 'function') throw new TypeError(Ne(32));
  },
  Ln = () => {},
  Qh = (e, t = Ln) => (e.catch(t), e),
  ev = (e, t) => (
    e.addEventListener('abort', t, { once: !0 }),
    () => e.removeEventListener('abort', t)
  ),
  Gt = (e, t) => {
    const r = e.signal;
    r.aborted ||
      ('reason' in r ||
        Object.defineProperty(r, 'reason', {
          enumerable: !0,
          value: t,
          configurable: !0,
          writable: !0,
        }),
      e.abort(t));
  },
  Vt = (e) => {
    if (e.aborted) {
      const { reason: t } = e;
      throw new gi(t);
    }
  };
function tv(e, t) {
  let r = Ln;
  return new Promise((n, i) => {
    const a = () => i(new gi(e.reason));
    if (e.aborted) {
      a();
      return;
    }
    ((r = ev(e, a)), t.finally(() => r()).then(n, i));
  }).finally(() => {
    r = Ln;
  });
}
var xb = async (e, t) => {
    try {
      return (await Promise.resolve(), { status: 'ok', value: await e() });
    } catch (r) {
      return { status: r instanceof gi ? 'cancelled' : 'rejected', error: r };
    } finally {
      t?.();
    }
  },
  Bn = (e) => (t) => Qh(tv(e, t).then((r) => (Vt(e), r))),
  rv = (e) => {
    const t = Bn(e);
    return (r) => t(new Promise((n) => setTimeout(n, r)));
  },
  { assign: fr } = Object,
  Ps = {},
  bi = 'listenerMiddleware',
  Pb = (e, t) => {
    const r = (n) => ev(e, () => Gt(n, e.reason));
    return (n, i) => {
      Ku(n);
      const a = new AbortController();
      r(a);
      const o = xb(
        async () => {
          (Vt(e), Vt(a.signal));
          const u = await n({ pause: Bn(a.signal), delay: rv(a.signal), signal: a.signal });
          return (Vt(a.signal), u);
        },
        () => Gt(a, bb)
      );
      return (
        i?.autoJoin && t.push(o.catch(Ln)),
        {
          result: Bn(e)(o),
          cancel() {
            Gt(a, gb);
          },
        }
      );
    };
  },
  Ob = (e, t) => {
    const r = async (n, i) => {
      Vt(t);
      let a = () => {};
      const u = [
        new Promise((l, s) => {
          let c = e({
            predicate: n,
            effect: (f, d) => {
              (d.unsubscribe(), l([f, d.getState(), d.getOriginalState()]));
            },
          });
          a = () => {
            (c(), s());
          };
        }),
      ];
      i != null && u.push(new Promise((l) => setTimeout(l, i, null)));
      try {
        const l = await tv(t, Promise.race(u));
        return (Vt(t), l);
      } finally {
        a();
      }
    };
    return (n, i) => Qh(r(n, i));
  },
  nv = (e) => {
    let { type: t, actionCreator: r, matcher: n, predicate: i, effect: a } = e;
    if (t) i = Ye(t).match;
    else if (r) ((t = r.type), (i = r.match));
    else if (n) i = n;
    else if (!i) throw new Error(Ne(21));
    return (Ku(a), { predicate: i, type: t, effect: a });
  },
  iv = fr(
    (e) => {
      const { type: t, predicate: r, effect: n } = nv(e);
      return {
        id: ub(),
        effect: n,
        type: t,
        predicate: r,
        pending: new Set(),
        unsubscribe: () => {
          throw new Error(Ne(22));
        },
      };
    },
    { withTypes: () => iv }
  ),
  Os = (e, t) => {
    const { type: r, effect: n, predicate: i } = nv(t);
    return Array.from(e.values()).find(
      (a) => (typeof r == 'string' ? a.type === r : a.predicate === i) && a.effect === n
    );
  },
  Ko = (e) => {
    e.pending.forEach((t) => {
      Gt(t, Fo);
    });
  },
  Ab = (e) => () => {
    (e.forEach(Ko), e.clear());
  },
  As = (e, t, r) => {
    try {
      e(t, r);
    } catch (n) {
      setTimeout(() => {
        throw n;
      }, 0);
    }
  },
  av = fr(Ye(`${bi}/add`), { withTypes: () => av }),
  Sb = Ye(`${bi}/removeAll`),
  ov = fr(Ye(`${bi}/remove`), { withTypes: () => ov }),
  Eb = (...e) => {
    console.error(`${bi}/error`, ...e);
  },
  tn = (e = {}) => {
    const t = new Map(),
      { extra: r, onError: n = Eb } = e;
    Ku(n);
    const i = (c) => (
        (c.unsubscribe = () => t.delete(c.id)),
        t.set(c.id, c),
        (f) => {
          (c.unsubscribe(), f?.cancelActive && Ko(c));
        }
      ),
      a = (c) => {
        const f = Os(t, c) ?? iv(c);
        return i(f);
      };
    fr(a, { withTypes: () => a });
    const o = (c) => {
      const f = Os(t, c);
      return (f && (f.unsubscribe(), c.cancelActive && Ko(f)), !!f);
    };
    fr(o, { withTypes: () => o });
    const u = async (c, f, d, h) => {
        const v = new AbortController(),
          p = Ob(a, v.signal),
          m = [];
        try {
          (c.pending.add(v),
            await Promise.resolve(
              c.effect(
                f,
                fr({}, d, {
                  getOriginalState: h,
                  condition: (g, w) => p(g, w).then(Boolean),
                  take: p,
                  delay: rv(v.signal),
                  pause: Bn(v.signal),
                  extra: r,
                  signal: v.signal,
                  fork: Pb(v.signal, m),
                  unsubscribe: c.unsubscribe,
                  subscribe: () => {
                    t.set(c.id, c);
                  },
                  cancelActiveListeners: () => {
                    c.pending.forEach((g, w, b) => {
                      g !== v && (Gt(g, Fo), b.delete(g));
                    });
                  },
                  cancel: () => {
                    (Gt(v, Fo), c.pending.delete(v));
                  },
                  throwIfCancelled: () => {
                    Vt(v.signal);
                  },
                })
              )
            ));
        } catch (g) {
          g instanceof gi || As(n, g, { raisedBy: 'effect' });
        } finally {
          (await Promise.all(m), Gt(v, wb), c.pending.delete(v));
        }
      },
      l = Ab(t);
    return {
      middleware: (c) => (f) => (d) => {
        if (!qh(d)) return f(d);
        if (av.match(d)) return a(d.payload);
        if (Sb.match(d)) {
          l();
          return;
        }
        if (ov.match(d)) return o(d.payload);
        let h = c.getState();
        const v = () => {
          if (h === Ps) throw new Error(Ne(23));
          return h;
        };
        let p;
        try {
          if (((p = f(d)), t.size > 0)) {
            const m = c.getState(),
              g = Array.from(t.values());
            for (const w of g) {
              let b = !1;
              try {
                b = w.predicate(d, m, h);
              } catch (P) {
                ((b = !1), As(n, P, { raisedBy: 'predicate' }));
              }
              b && u(w, d, c, v);
            }
          }
        } finally {
          h = Ps;
        }
        return p;
      },
      startListening: a,
      stopListening: o,
      clearListeners: l,
    };
  };
function Ne(e) {
  return `Minified Redux Toolkit error #${e}; visit https://redux-toolkit.js.org/Errors?code=${e} for the full message or use the non-minified dev environment for full errors. `;
}
var _b = {
    layoutType: 'horizontal',
    width: 0,
    height: 0,
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
    scale: 1,
  },
  uv = Le({
    name: 'chartLayout',
    initialState: _b,
    reducers: {
      setLayout(e, t) {
        e.layoutType = t.payload;
      },
      setChartSize(e, t) {
        ((e.width = t.payload.width), (e.height = t.payload.height));
      },
      setMargin(e, t) {
        ((e.margin.top = t.payload.top),
          (e.margin.right = t.payload.right),
          (e.margin.bottom = t.payload.bottom),
          (e.margin.left = t.payload.left));
      },
      setScale(e, t) {
        e.scale = t.payload;
      },
    },
  }),
  { setMargin: Tb, setLayout: Cb, setChartSize: jb, setScale: Mb } = uv.actions,
  kb = uv.reducer;
function Ss(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Es(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Ss(Object(r), !0).forEach(function (n) {
          Ib(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Ss(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Ib(e, t, r) {
  return (
    (t = Db(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Db(e) {
  var t = Nb(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Nb(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var qn = Math.PI / 180,
  $b = (e) => (e * 180) / Math.PI,
  ve = (e, t, r, n) => ({ x: e + Math.cos(-qn * n) * r, y: t + Math.sin(-qn * n) * r }),
  Rb = function (t, r) {
    var n =
      arguments.length > 2 && arguments[2] !== void 0
        ? arguments[2]
        : { top: 0, right: 0, bottom: 0, left: 0 };
    return (
      Math.min(
        Math.abs(t - (n.left || 0) - (n.right || 0)),
        Math.abs(r - (n.top || 0) - (n.bottom || 0))
      ) / 2
    );
  },
  Lb = (e, t) => {
    var { x: r, y: n } = e,
      { x: i, y: a } = t;
    return Math.sqrt((r - i) ** 2 + (n - a) ** 2);
  },
  Bb = (e, t) => {
    var { x: r, y: n } = e,
      { cx: i, cy: a } = t,
      o = Lb({ x: r, y: n }, { x: i, y: a });
    if (o <= 0) return { radius: o, angle: 0 };
    var u = (r - i) / o,
      l = Math.acos(u);
    return (n > a && (l = 2 * Math.PI - l), { radius: o, angle: $b(l), angleInRadian: l });
  },
  qb = (e) => {
    var { startAngle: t, endAngle: r } = e,
      n = Math.floor(t / 360),
      i = Math.floor(r / 360),
      a = Math.min(n, i);
    return { startAngle: t - a * 360, endAngle: r - a * 360 };
  },
  zb = (e, t) => {
    var { startAngle: r, endAngle: n } = t,
      i = Math.floor(r / 360),
      a = Math.floor(n / 360),
      o = Math.min(i, a);
    return e + o * 360;
  },
  Fb = (e, t) => {
    var { x: r, y: n } = e,
      { radius: i, angle: a } = Bb({ x: r, y: n }, t),
      { innerRadius: o, outerRadius: u } = t;
    if (i < o || i > u || i === 0) return null;
    var { startAngle: l, endAngle: s } = qb(t),
      c = a,
      f;
    if (l <= s) {
      for (; c > s; ) c -= 360;
      for (; c < l; ) c += 360;
      f = c >= l && c <= s;
    } else {
      for (; c > l; ) c -= 360;
      for (; c < s; ) c += 360;
      f = c >= s && c <= l;
    }
    return f ? Es(Es({}, t), {}, { radius: i, angle: zb(c, t) }) : null;
  };
function lv(e, t, r) {
  return Array.isArray(e) && e && t + r !== 0 ? e.slice(t, r + 1) : e;
}
function _s(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function We(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? _s(Object(r), !0).forEach(function (n) {
          Kb(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : _s(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Kb(e, t, r) {
  return (
    (t = Wb(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Wb(e) {
  var t = Ub(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Ub(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function pe(e, t, r) {
  return te(e) || te(t) ? r : it(t) ? Jt(e, t, r) : typeof t == 'function' ? t(e) : r;
}
var Hb = (e, t, r, n, i) => {
    var a,
      o = -1,
      u = (a = t?.length) !== null && a !== void 0 ? a : 0;
    if (u <= 1 || e == null) return 0;
    if (n === 'angleAxis' && i != null && Math.abs(Math.abs(i[1] - i[0]) - 360) <= 1e-6)
      for (var l = 0; l < u; l++) {
        var s = l > 0 ? r[l - 1].coordinate : r[u - 1].coordinate,
          c = r[l].coordinate,
          f = l >= u - 1 ? r[0].coordinate : r[l + 1].coordinate,
          d = void 0;
        if (Ue(c - s) !== Ue(f - c)) {
          var h = [];
          if (Ue(f - c) === Ue(i[1] - i[0])) {
            d = f;
            var v = c + i[1] - i[0];
            ((h[0] = Math.min(v, (v + s) / 2)), (h[1] = Math.max(v, (v + s) / 2)));
          } else {
            d = s;
            var p = f + i[1] - i[0];
            ((h[0] = Math.min(c, (p + c) / 2)), (h[1] = Math.max(c, (p + c) / 2)));
          }
          var m = [Math.min(c, (d + c) / 2), Math.max(c, (d + c) / 2)];
          if ((e > m[0] && e <= m[1]) || (e >= h[0] && e <= h[1])) {
            ({ index: o } = r[l]);
            break;
          }
        } else {
          var g = Math.min(s, f),
            w = Math.max(s, f);
          if (e > (g + c) / 2 && e <= (w + c) / 2) {
            ({ index: o } = r[l]);
            break;
          }
        }
      }
    else if (t) {
      for (var b = 0; b < u; b++)
        if (
          (b === 0 && e <= (t[b].coordinate + t[b + 1].coordinate) / 2) ||
          (b > 0 &&
            b < u - 1 &&
            e > (t[b].coordinate + t[b - 1].coordinate) / 2 &&
            e <= (t[b].coordinate + t[b + 1].coordinate) / 2) ||
          (b === u - 1 && e > (t[b].coordinate + t[b - 1].coordinate) / 2)
        ) {
          ({ index: o } = t[b]);
          break;
        }
    }
    return o;
  },
  Yb = (e, t, r) => {
    if (t && r) {
      var { width: n, height: i } = r,
        { align: a, verticalAlign: o, layout: u } = t;
      if ((u === 'vertical' || (u === 'horizontal' && o === 'middle')) && a !== 'center' && k(e[a]))
        return We(We({}, e), {}, { [a]: e[a] + (n || 0) });
      if ((u === 'horizontal' || (u === 'vertical' && a === 'center')) && o !== 'middle' && k(e[o]))
        return We(We({}, e), {}, { [o]: e[o] + (i || 0) });
    }
    return e;
  },
  ot = (e, t) =>
    (e === 'horizontal' && t === 'xAxis') ||
    (e === 'vertical' && t === 'yAxis') ||
    (e === 'centric' && t === 'angleAxis') ||
    (e === 'radial' && t === 'radiusAxis'),
  cv = (e, t, r, n) => {
    if (n) return e.map((u) => u.coordinate);
    var i,
      a,
      o = e.map(
        (u) => (u.coordinate === t && (i = !0), u.coordinate === r && (a = !0), u.coordinate)
      );
    return (i || o.push(t), a || o.push(r), o);
  },
  sv = (e, t, r) => {
    if (!e) return null;
    var {
      duplicateDomain: n,
      type: i,
      range: a,
      scale: o,
      realScaleType: u,
      isCategorical: l,
      categoricalDomain: s,
      tickCount: c,
      ticks: f,
      niceTicks: d,
      axisType: h,
    } = e;
    if (!o) return null;
    var v = u === 'scaleBand' && o.bandwidth ? o.bandwidth() / 2 : 2,
      p = i === 'category' && o.bandwidth ? o.bandwidth() / v : 0;
    if (((p = h === 'angleAxis' && a && a.length >= 2 ? Ue(a[0] - a[1]) * 2 * p : p), f || d)) {
      var m = (f || d || []).map((g, w) => {
        var b = n ? n.indexOf(g) : g;
        return { coordinate: o(b) + p, value: g, offset: p, index: w };
      });
      return m.filter((g) => !$e(g.coordinate));
    }
    return l && s
      ? s.map((g, w) => ({ coordinate: o(g) + p, value: g, index: w, offset: p }))
      : o.ticks && c != null
        ? o.ticks(c).map((g, w) => ({ coordinate: o(g) + p, value: g, offset: p, index: w }))
        : o
            .domain()
            .map((g, w) => ({ coordinate: o(g) + p, value: n ? n[g] : g, index: w, offset: p }));
  },
  Ts = 1e-4,
  Gb = (e) => {
    var t = e.domain();
    if (!(!t || t.length <= 2)) {
      var r = t.length,
        n = e.range(),
        i = Math.min(n[0], n[1]) - Ts,
        a = Math.max(n[0], n[1]) + Ts,
        o = e(t[0]),
        u = e(t[r - 1]);
      (o < i || o > a || u < i || u > a) && e.domain([t[0], t[r - 1]]);
    }
  },
  Vb = (e) => {
    var t = e.length;
    if (!(t <= 0))
      for (var r = 0, n = e[0].length; r < n; ++r)
        for (var i = 0, a = 0, o = 0; o < t; ++o) {
          var u = $e(e[o][r][1]) ? e[o][r][0] : e[o][r][1];
          u >= 0
            ? ((e[o][r][0] = i), (e[o][r][1] = i + u), (i = e[o][r][1]))
            : ((e[o][r][0] = a), (e[o][r][1] = a + u), (a = e[o][r][1]));
        }
  },
  Xb = (e) => {
    var t = e.length;
    if (!(t <= 0))
      for (var r = 0, n = e[0].length; r < n; ++r)
        for (var i = 0, a = 0; a < t; ++a) {
          var o = $e(e[a][r][1]) ? e[a][r][0] : e[a][r][1];
          o >= 0
            ? ((e[a][r][0] = i), (e[a][r][1] = i + o), (i = e[a][r][1]))
            : ((e[a][r][0] = 0), (e[a][r][1] = 0));
        }
  },
  Zb = { sign: Vb, expand: _g, none: hr, silhouette: Tg, wiggle: Cg, positive: Xb },
  Jb = (e, t, r) => {
    var n = Zb[r],
      i = Eg()
        .keys(t)
        .value((a, o) => +pe(a, o, 0))
        .order(Io)
        .offset(n);
    return i(e);
  };
function Qb(e) {
  return e == null ? void 0 : String(e);
}
function zn(e) {
  var { axis: t, ticks: r, bandSize: n, entry: i, index: a, dataKey: o } = e;
  if (t.type === 'category') {
    if (!t.allowDuplicatedCategory && t.dataKey && !te(i[t.dataKey])) {
      var u = rh(r, 'value', i[t.dataKey]);
      if (u) return u.coordinate + n / 2;
    }
    return r[a] ? r[a].coordinate + n / 2 : null;
  }
  var l = pe(i, te(o) ? t.dataKey : o);
  return te(l) ? null : t.scale(l);
}
var ew = (e) => {
    var t = e.flat(2).filter(k);
    return [Math.min(...t), Math.max(...t)];
  },
  tw = (e) => [e[0] === 1 / 0 ? 0 : e[0], e[1] === -1 / 0 ? 0 : e[1]],
  rw = (e, t, r) => {
    if (e != null)
      return tw(
        Object.keys(e).reduce(
          (n, i) => {
            var a = e[i],
              { stackedData: o } = a,
              u = o.reduce(
                (l, s) => {
                  var c = lv(s, t, r),
                    f = ew(c);
                  return [Math.min(l[0], f[0]), Math.max(l[1], f[1])];
                },
                [1 / 0, -1 / 0]
              );
            return [Math.min(u[0], n[0]), Math.max(u[1], n[1])];
          },
          [1 / 0, -1 / 0]
        )
      );
  },
  Cs = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/,
  js = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/,
  Wr = (e, t, r) => {
    if (e && e.scale && e.scale.bandwidth) {
      var n = e.scale.bandwidth();
      if (!r || n > 0) return n;
    }
    if (e && t && t.length >= 2) {
      for (var i = vi(t, (c) => c.coordinate), a = 1 / 0, o = 1, u = i.length; o < u; o++) {
        var l = i[o],
          s = i[o - 1];
        a = Math.min((l.coordinate || 0) - (s.coordinate || 0), a);
      }
      return a === 1 / 0 ? 0 : a;
    }
    return r ? void 0 : 0;
  };
function Ms(e) {
  var { tooltipEntrySettings: t, dataKey: r, payload: n, value: i, name: a } = e;
  return We(We({}, t), {}, { dataKey: r, payload: n, value: i, name: a });
}
function wi(e, t) {
  if (e) return String(e);
  if (typeof t == 'string') return t;
}
function nw(e, t, r, n, i) {
  if (r === 'horizontal' || r === 'vertical') {
    var a = e >= i.left && e <= i.left + i.width && t >= i.top && t <= i.top + i.height;
    return a ? { x: e, y: t } : null;
  }
  return n ? Fb({ x: e, y: t }, n) : null;
}
var iw = (e, t, r, n) => {
    var i = t.find((s) => s && s.index === r);
    if (i) {
      if (e === 'horizontal') return { x: i.coordinate, y: n.y };
      if (e === 'vertical') return { x: n.x, y: i.coordinate };
      if (e === 'centric') {
        var a = i.coordinate,
          { radius: o } = n;
        return We(We(We({}, n), ve(n.cx, n.cy, o, a)), {}, { angle: a, radius: o });
      }
      var u = i.coordinate,
        { angle: l } = n;
      return We(We(We({}, n), ve(n.cx, n.cy, u, l)), {}, { angle: l, radius: u });
    }
    return { x: 0, y: 0 };
  },
  aw = (e, t) =>
    t === 'horizontal' ? e.x : t === 'vertical' ? e.y : t === 'centric' ? e.angle : e.radius,
  bt = (e) => e.layout.width,
  wt = (e) => e.layout.height,
  ow = (e) => e.layout.scale,
  fv = (e) => e.layout.margin,
  Wu = A(
    (e) => e.cartesianAxis.xAxis,
    (e) => Object.values(e)
  ),
  Uu = A(
    (e) => e.cartesianAxis.yAxis,
    (e) => Object.values(e)
  ),
  uw = 'data-recharts-item-index',
  lw = 'data-recharts-item-data-key',
  xi = 60;
function ks(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function At(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? ks(Object(r), !0).forEach(function (n) {
          cw(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : ks(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function cw(e, t, r) {
  return (
    (t = sw(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function sw(e) {
  var t = fw(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function fw(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var dw = (e) => e.brush.height,
  ye = A([bt, wt, fv, dw, Wu, Uu, $h, k0], (e, t, r, n, i, a, o, u) => {
    var l = a.reduce(
        (v, p) => {
          var { orientation: m } = p;
          if (!p.mirror && !p.hide) {
            var g = typeof p.width == 'number' ? p.width : xi;
            return At(At({}, v), {}, { [m]: v[m] + g });
          }
          return v;
        },
        { left: r.left || 0, right: r.right || 0 }
      ),
      s = i.reduce(
        (v, p) => {
          var { orientation: m } = p;
          return !p.mirror && !p.hide
            ? At(At({}, v), {}, { [m]: Jt(v, ''.concat(m)) + p.height })
            : v;
        },
        { top: r.top || 0, bottom: r.bottom || 0 }
      ),
      c = At(At({}, s), l),
      f = c.bottom;
    ((c.bottom += n), (c = Yb(c, o, u)));
    var d = e - c.left - c.right,
      h = t - c.top - c.bottom;
    return At(At({ brushBottom: f }, c), {}, { width: Math.max(d, 0), height: Math.max(h, 0) });
  }),
  hw = A(ye, (e) => ({ x: e.left, y: e.top, width: e.width, height: e.height })),
  dv = A(bt, wt, (e, t) => ({ x: 0, y: 0, width: e, height: t })),
  vw = y.createContext(null),
  Se = () => y.useContext(vw) != null,
  Pi = (e) => e.brush,
  Oi = A([Pi, ye, fv], (e, t, r) => ({
    height: e.height,
    x: k(e.x) ? e.x : t.left,
    y: k(e.y) ? e.y : t.top + t.height + t.brushBottom - (r?.bottom || 0),
    width: k(e.width) ? e.width : t.width,
  })),
  Hu = () => {
    var e,
      t = Se(),
      r = D(hw),
      n = D(Oi),
      i = (e = D(Pi)) === null || e === void 0 ? void 0 : e.padding;
    return !t || !n || !i
      ? r
      : {
          width: n.width - i.left - i.right,
          height: n.height - i.top - i.bottom,
          x: i.left,
          y: i.top,
        };
  },
  pw = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, brushBottom: 0 },
  hv = () => {
    var e;
    return (e = D(ye)) !== null && e !== void 0 ? e : pw;
  },
  Yu = () => D(bt),
  Gu = () => D(wt),
  mw = { top: 0, right: 0, bottom: 0, left: 0 },
  yw = () => {
    var e;
    return (e = D((t) => t.layout.margin)) !== null && e !== void 0 ? e : mw;
  },
  U = (e) => e.layout.layoutType,
  Ai = () => D(U),
  gw = {
    settings: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'middle',
      itemSorter: 'value',
    },
    size: { width: 0, height: 0 },
    payload: [],
  },
  vv = Le({
    name: 'legend',
    initialState: gw,
    reducers: {
      setLegendSize(e, t) {
        ((e.size.width = t.payload.width), (e.size.height = t.payload.height));
      },
      setLegendSettings(e, t) {
        ((e.settings.align = t.payload.align),
          (e.settings.layout = t.payload.layout),
          (e.settings.verticalAlign = t.payload.verticalAlign),
          (e.settings.itemSorter = t.payload.itemSorter));
      },
      addLegendPayload(e, t) {
        e.payload.push(t.payload);
      },
      removeLegendPayload(e, t) {
        var r = dt(e).payload.indexOf(t.payload);
        r > -1 && e.payload.splice(r, 1);
      },
    },
  }),
  {
    setLegendSize: Is,
    setLegendSettings: bw,
    addLegendPayload: ww,
    removeLegendPayload: xw,
  } = vv.actions,
  Pw = vv.reducer,
  Ow = ['contextPayload'];
function Wo() {
  return (
    (Wo = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Wo.apply(null, arguments)
  );
}
function Ds(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function pr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Ds(Object(r), !0).forEach(function (n) {
          Vu(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Ds(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Vu(e, t, r) {
  return (
    (t = Aw(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Aw(e) {
  var t = Sw(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Sw(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Ew(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = _w(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function _w(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Tw(e) {
  return e.value;
}
function Cw(e) {
  var { contextPayload: t } = e,
    r = Ew(e, Ow),
    n = kh(t, e.payloadUniqBy, Tw),
    i = pr(pr({}, r), {}, { payload: n });
  return y.isValidElement(e.content)
    ? y.cloneElement(e.content, i)
    : typeof e.content == 'function'
      ? y.createElement(e.content, i)
      : y.createElement(ku, i);
}
function jw(e, t, r, n, i, a) {
  var { layout: o, align: u, verticalAlign: l } = t,
    s,
    c;
  return (
    (!e || ((e.left === void 0 || e.left === null) && (e.right === void 0 || e.right === null))) &&
      (u === 'center' && o === 'vertical'
        ? (s = { left: ((n || 0) - a.width) / 2 })
        : (s = u === 'right' ? { right: (r && r.right) || 0 } : { left: (r && r.left) || 0 })),
    (!e || ((e.top === void 0 || e.top === null) && (e.bottom === void 0 || e.bottom === null))) &&
      (l === 'middle'
        ? (c = { top: ((i || 0) - a.height) / 2 })
        : (c = l === 'bottom' ? { bottom: (r && r.bottom) || 0 } : { top: (r && r.top) || 0 })),
    pr(pr({}, s), c)
  );
}
function Mw(e) {
  var t = me();
  return (
    y.useEffect(() => {
      t(bw(e));
    }, [t, e]),
    null
  );
}
function kw(e) {
  var t = me();
  return (
    y.useEffect(
      () => (
        t(Is(e)),
        () => {
          t(Is({ width: 0, height: 0 }));
        }
      ),
      [t, e]
    ),
    null
  );
}
function Iw(e) {
  var t = N0(),
    r = Xy(),
    n = yw(),
    { width: i, height: a, wrapperStyle: o, portal: u } = e,
    [l, s] = Rh([t]),
    c = Yu(),
    f = Gu(),
    d = c - (n.left || 0) - (n.right || 0),
    h = Xu.getWidthOrHeight(e.layout, a, i, d),
    v = u
      ? o
      : pr(
          pr(
            {
              position: 'absolute',
              width: h?.width || i || 'auto',
              height: h?.height || a || 'auto',
            },
            jw(o, e, n, c, f, l)
          ),
          o
        ),
    p = u ?? r;
  if (p == null) return null;
  var m = y.createElement(
    'div',
    { className: 'recharts-legend-wrapper', style: v, ref: s },
    y.createElement(Mw, {
      layout: e.layout,
      align: e.align,
      verticalAlign: e.verticalAlign,
      itemSorter: e.itemSorter,
    }),
    y.createElement(kw, { width: l.width, height: l.height }),
    y.createElement(
      Cw,
      Wo({}, e, h, { margin: n, chartWidth: c, chartHeight: f, contextPayload: t })
    )
  );
  return Zd.createPortal(m, p);
}
class Xu extends y.PureComponent {
  static getWidthOrHeight(t, r, n, i) {
    return t === 'vertical' && k(r) ? { height: r } : t === 'horizontal' ? { width: n || i } : null;
  }
  render() {
    return y.createElement(Iw, this.props);
  }
}
Vu(Xu, 'displayName', 'Legend');
Vu(Xu, 'defaultProps', {
  align: 'center',
  iconSize: 14,
  itemSorter: 'value',
  layout: 'horizontal',
  verticalAlign: 'bottom',
});
function Uo() {
  return (
    (Uo = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Uo.apply(null, arguments)
  );
}
function Ns(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Ya(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Ns(Object(r), !0).forEach(function (n) {
          Dw(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Ns(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Dw(e, t, r) {
  return (
    (t = Nw(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Nw(e) {
  var t = $w(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function $w(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Rw(e) {
  return Array.isArray(e) && it(e[0]) && it(e[1]) ? e.join(' ~ ') : e;
}
var Lw = (e) => {
    var {
        separator: t = ' : ',
        contentStyle: r = {},
        itemStyle: n = {},
        labelStyle: i = {},
        payload: a,
        formatter: o,
        itemSorter: u,
        wrapperClassName: l,
        labelClassName: s,
        label: c,
        labelFormatter: f,
        accessibilityLayer: d = !1,
      } = e,
      h = () => {
        if (a && a.length) {
          var x = { padding: 0, margin: 0 },
            O = (u ? vi(a, u) : a).map((S, _) => {
              if (S.type === 'none') return null;
              var C = S.formatter || o || Rw,
                { value: N, name: T } = S,
                M = N,
                L = T;
              if (C) {
                var z = C(N, T, S, _, a);
                if (Array.isArray(z)) [M, L] = z;
                else if (z != null) M = z;
                else return null;
              }
              var J = Ya(
                { display: 'block', paddingTop: 4, paddingBottom: 4, color: S.color || '#000' },
                n
              );
              return y.createElement(
                'li',
                { className: 'recharts-tooltip-item', key: 'tooltip-item-'.concat(_), style: J },
                it(L)
                  ? y.createElement('span', { className: 'recharts-tooltip-item-name' }, L)
                  : null,
                it(L)
                  ? y.createElement('span', { className: 'recharts-tooltip-item-separator' }, t)
                  : null,
                y.createElement('span', { className: 'recharts-tooltip-item-value' }, M),
                y.createElement('span', { className: 'recharts-tooltip-item-unit' }, S.unit || '')
              );
            });
          return y.createElement('ul', { className: 'recharts-tooltip-item-list', style: x }, O);
        }
        return null;
      },
      v = Ya(
        {
          margin: 0,
          padding: 10,
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          whiteSpace: 'nowrap',
        },
        r
      ),
      p = Ya({ margin: 0 }, i),
      m = !te(c),
      g = m ? c : '',
      w = K('recharts-default-tooltip', l),
      b = K('recharts-tooltip-label', s);
    m && f && a !== void 0 && a !== null && (g = f(c, a));
    var P = d ? { role: 'status', 'aria-live': 'assertive' } : {};
    return y.createElement(
      'div',
      Uo({ className: w, style: v }, P),
      y.createElement('p', { className: b, style: p }, y.isValidElement(g) ? g : ''.concat(g)),
      h()
    );
  },
  Cr = 'recharts-tooltip-wrapper',
  Bw = { visibility: 'hidden' };
function qw(e) {
  var { coordinate: t, translateX: r, translateY: n } = e;
  return K(Cr, {
    [''.concat(Cr, '-right')]: k(r) && t && k(t.x) && r >= t.x,
    [''.concat(Cr, '-left')]: k(r) && t && k(t.x) && r < t.x,
    [''.concat(Cr, '-bottom')]: k(n) && t && k(t.y) && n >= t.y,
    [''.concat(Cr, '-top')]: k(n) && t && k(t.y) && n < t.y,
  });
}
function $s(e) {
  var {
    allowEscapeViewBox: t,
    coordinate: r,
    key: n,
    offsetTopLeft: i,
    position: a,
    reverseDirection: o,
    tooltipDimension: u,
    viewBox: l,
    viewBoxDimension: s,
  } = e;
  if (a && k(a[n])) return a[n];
  var c = r[n] - u - (i > 0 ? i : 0),
    f = r[n] + i;
  if (t[n]) return o[n] ? c : f;
  var d = l[n];
  if (d == null) return 0;
  if (o[n]) {
    var h = c,
      v = d;
    return h < v ? Math.max(f, d) : Math.max(c, d);
  }
  if (s == null) return 0;
  var p = f + u,
    m = d + s;
  return p > m ? Math.max(c, d) : Math.max(f, d);
}
function zw(e) {
  var { translateX: t, translateY: r, useTranslate3d: n } = e;
  return {
    transform: n
      ? 'translate3d('.concat(t, 'px, ').concat(r, 'px, 0)')
      : 'translate('.concat(t, 'px, ').concat(r, 'px)'),
  };
}
function Fw(e) {
  var {
      allowEscapeViewBox: t,
      coordinate: r,
      offsetTopLeft: n,
      position: i,
      reverseDirection: a,
      tooltipBox: o,
      useTranslate3d: u,
      viewBox: l,
    } = e,
    s,
    c,
    f;
  return (
    o.height > 0 && o.width > 0 && r
      ? ((c = $s({
          allowEscapeViewBox: t,
          coordinate: r,
          key: 'x',
          offsetTopLeft: n,
          position: i,
          reverseDirection: a,
          tooltipDimension: o.width,
          viewBox: l,
          viewBoxDimension: l.width,
        })),
        (f = $s({
          allowEscapeViewBox: t,
          coordinate: r,
          key: 'y',
          offsetTopLeft: n,
          position: i,
          reverseDirection: a,
          tooltipDimension: o.height,
          viewBox: l,
          viewBoxDimension: l.height,
        })),
        (s = zw({ translateX: c, translateY: f, useTranslate3d: u })))
      : (s = Bw),
    { cssProperties: s, cssClasses: qw({ translateX: c, translateY: f, coordinate: r }) }
  );
}
function Rs(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function bn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Rs(Object(r), !0).forEach(function (n) {
          Ho(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Rs(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Ho(e, t, r) {
  return (
    (t = Kw(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Kw(e) {
  var t = Ww(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Ww(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
class Uw extends y.PureComponent {
  constructor() {
    (super(...arguments),
      Ho(this, 'state', { dismissed: !1, dismissedAtCoordinate: { x: 0, y: 0 } }),
      Ho(this, 'handleKeyDown', (t) => {
        if (t.key === 'Escape') {
          var r, n, i, a;
          this.setState({
            dismissed: !0,
            dismissedAtCoordinate: {
              x:
                (r = (n = this.props.coordinate) === null || n === void 0 ? void 0 : n.x) !==
                  null && r !== void 0
                  ? r
                  : 0,
              y:
                (i = (a = this.props.coordinate) === null || a === void 0 ? void 0 : a.y) !==
                  null && i !== void 0
                  ? i
                  : 0,
            },
          });
        }
      }));
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  componentDidUpdate() {
    var t, r;
    this.state.dismissed &&
      (((t = this.props.coordinate) === null || t === void 0 ? void 0 : t.x) !==
        this.state.dismissedAtCoordinate.x ||
        ((r = this.props.coordinate) === null || r === void 0 ? void 0 : r.y) !==
          this.state.dismissedAtCoordinate.y) &&
      (this.state.dismissed = !1);
  }
  render() {
    var {
        active: t,
        allowEscapeViewBox: r,
        animationDuration: n,
        animationEasing: i,
        children: a,
        coordinate: o,
        hasPayload: u,
        isAnimationActive: l,
        offset: s,
        position: c,
        reverseDirection: f,
        useTranslate3d: d,
        viewBox: h,
        wrapperStyle: v,
        lastBoundingBox: p,
        innerRef: m,
        hasPortalFromProps: g,
      } = this.props,
      { cssClasses: w, cssProperties: b } = Fw({
        allowEscapeViewBox: r,
        coordinate: o,
        offsetTopLeft: s,
        position: c,
        reverseDirection: f,
        tooltipBox: { height: p.height, width: p.width },
        useTranslate3d: d,
        viewBox: h,
      }),
      P = g
        ? {}
        : bn(
            bn({ transition: l && t ? 'transform '.concat(n, 'ms ').concat(i) : void 0 }, b),
            {},
            {
              pointerEvents: 'none',
              visibility: !this.state.dismissed && t && u ? 'visible' : 'hidden',
              position: 'absolute',
              top: 0,
              left: 0,
            }
          ),
      x = bn(
        bn({}, P),
        {},
        { visibility: !this.state.dismissed && t && u ? 'visible' : 'hidden' },
        v
      );
    return y.createElement(
      'div',
      { xmlns: 'http://www.w3.org/1999/xhtml', tabIndex: -1, className: w, style: x, ref: m },
      a
    );
  }
}
var Hw = () =>
    !(typeof window < 'u' && window.document && window.document.createElement && window.setTimeout),
  wr = { isSsr: Hw() },
  pv = () => D((e) => e.rootProps.accessibilityLayer);
function xe(e) {
  return Number.isFinite(e);
}
function Fn(e) {
  return typeof e == 'number' && e > 0 && Number.isFinite(e);
}
function Yo() {
  return (
    (Yo = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Yo.apply(null, arguments)
  );
}
function Ls(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Bs(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Ls(Object(r), !0).forEach(function (n) {
          Yw(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Ls(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Yw(e, t, r) {
  return (
    (t = Gw(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Gw(e) {
  var t = Vw(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Vw(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var qs = {
    curveBasisClosed: pg,
    curveBasisOpen: mg,
    curveBasis: vg,
    curveBumpX: eg,
    curveBumpY: tg,
    curveLinearClosed: yg,
    curveLinear: di,
    curveMonotoneX: gg,
    curveMonotoneY: bg,
    curveNatural: wg,
    curveStep: xg,
    curveStepAfter: Og,
    curveStepBefore: Pg,
  },
  wn = (e) => xe(e.x) && xe(e.y),
  jr = (e) => e.x,
  Mr = (e) => e.y,
  Xw = (e, t) => {
    if (typeof e == 'function') return e;
    var r = 'curve'.concat(Qr(e));
    return (r === 'curveMonotone' || r === 'curveBump') && t
      ? qs[''.concat(r).concat(t === 'vertical' ? 'Y' : 'X')]
      : qs[r] || di;
  },
  Zw = (e) => {
    var { type: t = 'linear', points: r = [], baseLine: n, layout: i, connectNulls: a = !1 } = e,
      o = Xw(t, i),
      u = a ? r.filter(wn) : r,
      l;
    if (Array.isArray(n)) {
      var s = a ? n.filter((f) => wn(f)) : n,
        c = u.map((f, d) => Bs(Bs({}, f), {}, { base: s[d] }));
      return (
        i === 'vertical'
          ? (l = hn()
              .y(Mr)
              .x1(jr)
              .x0((f) => f.base.x))
          : (l = hn()
              .x(jr)
              .y1(Mr)
              .y0((f) => f.base.y)),
        l.defined(wn).curve(o),
        l(c)
      );
    }
    return (
      i === 'vertical' && k(n)
        ? (l = hn().y(Mr).x1(jr).x0(n))
        : k(n)
          ? (l = hn().x(jr).y1(Mr).y0(n))
          : (l = hh().x(jr).y(Mr)),
      l.defined(wn).curve(o),
      l(u)
    );
  },
  Lr = (e) => {
    var { className: t, points: r, path: n, pathRef: i } = e;
    if ((!r || !r.length) && !n) return null;
    var a = r && r.length ? Zw(e) : n;
    return y.createElement(
      'path',
      Yo({}, kt(e), Eu(e), {
        className: K('recharts-curve', t),
        d: a === null ? void 0 : a,
        ref: i,
      })
    );
  },
  Jw = ['x', 'y', 'top', 'left', 'width', 'height', 'className'];
function Go() {
  return (
    (Go = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Go.apply(null, arguments)
  );
}
function zs(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Qw(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? zs(Object(r), !0).forEach(function (n) {
          ex(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : zs(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function ex(e, t, r) {
  return (
    (t = tx(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function tx(e) {
  var t = rx(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function rx(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function nx(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = ix(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function ix(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var ax = (e, t, r, n, i, a) =>
    'M'.concat(e, ',').concat(i, 'v').concat(n, 'M').concat(a, ',').concat(t, 'h').concat(r),
  ox = (e) => {
    var {
        x: t = 0,
        y: r = 0,
        top: n = 0,
        left: i = 0,
        width: a = 0,
        height: o = 0,
        className: u,
      } = e,
      l = nx(e, Jw),
      s = Qw({ x: t, y: r, top: n, left: i, width: a, height: o }, l);
    return !k(t) || !k(r) || !k(a) || !k(o) || !k(n) || !k(i)
      ? null
      : y.createElement(
          'path',
          Go({}, ee(s, !0), { className: K('recharts-cross', u), d: ax(t, r, a, o, n, i) })
        );
  };
function ux(e, t, r, n) {
  var i = n / 2;
  return {
    stroke: 'none',
    fill: '#ccc',
    x: e === 'horizontal' ? t.x - i : r.left + 0.5,
    y: e === 'horizontal' ? r.top + 0.5 : t.y - i,
    width: e === 'horizontal' ? n : r.width - 1,
    height: e === 'horizontal' ? r.height - 1 : n,
  };
}
function Fs(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function lx(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Fs(Object(r), !0).forEach(function (n) {
          cx(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Fs(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function cx(e, t, r) {
  return (
    (t = sx(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function sx(e) {
  var t = fx(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function fx(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function ut(e, t) {
  var r = lx({}, e),
    n = t,
    i = Object.keys(t),
    a = i.reduce((o, u) => (o[u] === void 0 && n[u] !== void 0 && (o[u] = n[u]), o), r);
  return a;
}
var Ga = {},
  Va = {},
  Xa = {},
  Ks;
function dx() {
  return (
    Ks ||
      ((Ks = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          if (!r || typeof r != 'object') return !1;
          const n = Object.getPrototypeOf(r);
          return n === null || n === Object.prototype || Object.getPrototypeOf(n) === null
            ? Object.prototype.toString.call(r) === '[object Object]'
            : !1;
        }
        e.isPlainObject = t;
      })(Xa)),
    Xa
  );
}
var Ws;
function hx() {
  return (
    Ws ||
      ((Ws = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = dx(),
          r = Ch(),
          n = $u(),
          i = Ru(),
          a = Du();
        function o(s, c, f) {
          return u(s, c, void 0, void 0, void 0, void 0, f);
        }
        function u(s, c, f, d, h, v, p) {
          const m = p(s, c, f, d, h, v);
          if (m !== void 0) return m;
          if (typeof s == typeof c)
            switch (typeof s) {
              case 'bigint':
              case 'string':
              case 'boolean':
              case 'symbol':
              case 'undefined':
                return s === c;
              case 'number':
                return s === c || Object.is(s, c);
              case 'function':
                return s === c;
              case 'object':
                return l(s, c, v, p);
            }
          return l(s, c, v, p);
        }
        function l(s, c, f, d) {
          if (Object.is(s, c)) return !0;
          let h = n.getTag(s),
            v = n.getTag(c);
          if (
            (h === i.argumentsTag && (h = i.objectTag),
            v === i.argumentsTag && (v = i.objectTag),
            h !== v)
          )
            return !1;
          switch (h) {
            case i.stringTag:
              return s.toString() === c.toString();
            case i.numberTag: {
              const g = s.valueOf(),
                w = c.valueOf();
              return a.eq(g, w);
            }
            case i.booleanTag:
            case i.dateTag:
            case i.symbolTag:
              return Object.is(s.valueOf(), c.valueOf());
            case i.regexpTag:
              return s.source === c.source && s.flags === c.flags;
            case i.functionTag:
              return s === c;
          }
          f = f ?? new Map();
          const p = f.get(s),
            m = f.get(c);
          if (p != null && m != null) return p === c;
          (f.set(s, c), f.set(c, s));
          try {
            switch (h) {
              case i.mapTag: {
                if (s.size !== c.size) return !1;
                for (const [g, w] of s.entries())
                  if (!c.has(g) || !u(w, c.get(g), g, s, c, f, d)) return !1;
                return !0;
              }
              case i.setTag: {
                if (s.size !== c.size) return !1;
                const g = Array.from(s.values()),
                  w = Array.from(c.values());
                for (let b = 0; b < g.length; b++) {
                  const P = g[b],
                    x = w.findIndex((O) => u(P, O, void 0, s, c, f, d));
                  if (x === -1) return !1;
                  w.splice(x, 1);
                }
                return !0;
              }
              case i.arrayTag:
              case i.uint8ArrayTag:
              case i.uint8ClampedArrayTag:
              case i.uint16ArrayTag:
              case i.uint32ArrayTag:
              case i.bigUint64ArrayTag:
              case i.int8ArrayTag:
              case i.int16ArrayTag:
              case i.int32ArrayTag:
              case i.bigInt64ArrayTag:
              case i.float32ArrayTag:
              case i.float64ArrayTag: {
                if (
                  (typeof Buffer < 'u' && Buffer.isBuffer(s) !== Buffer.isBuffer(c)) ||
                  s.length !== c.length
                )
                  return !1;
                for (let g = 0; g < s.length; g++) if (!u(s[g], c[g], g, s, c, f, d)) return !1;
                return !0;
              }
              case i.arrayBufferTag:
                return s.byteLength !== c.byteLength
                  ? !1
                  : l(new Uint8Array(s), new Uint8Array(c), f, d);
              case i.dataViewTag:
                return s.byteLength !== c.byteLength || s.byteOffset !== c.byteOffset
                  ? !1
                  : l(new Uint8Array(s), new Uint8Array(c), f, d);
              case i.errorTag:
                return s.name === c.name && s.message === c.message;
              case i.objectTag: {
                if (
                  !(
                    l(s.constructor, c.constructor, f, d) ||
                    (t.isPlainObject(s) && t.isPlainObject(c))
                  )
                )
                  return !1;
                const w = [...Object.keys(s), ...r.getSymbols(s)],
                  b = [...Object.keys(c), ...r.getSymbols(c)];
                if (w.length !== b.length) return !1;
                for (let P = 0; P < w.length; P++) {
                  const x = w[P],
                    O = s[x];
                  if (!Object.hasOwn(c, x)) return !1;
                  const S = c[x];
                  if (!u(O, S, x, s, c, f, d)) return !1;
                }
                return !0;
              }
              default:
                return !1;
            }
          } finally {
            (f.delete(s), f.delete(c));
          }
        }
        e.isEqualWith = o;
      })(Va)),
    Va
  );
}
var Za = {},
  Us;
function vx() {
  return (
    Us ||
      ((Us = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t() {}
        e.noop = t;
      })(Za)),
    Za
  );
}
var Hs;
function px() {
  return (
    Hs ||
      ((Hs = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = hx(),
          r = vx();
        function n(i, a) {
          return t.isEqualWith(i, a, r.noop);
        }
        e.isEqual = n;
      })(Ga)),
    Ga
  );
}
var Ja, Ys;
function mx() {
  return (Ys || ((Ys = 1), (Ja = px().isEqual)), Ja);
}
var yx = mx();
const gx = Mt(yx);
var Kn = 1e-4,
  mv = (e, t) => [0, 3 * e, 3 * t - 6 * e, 3 * e - 3 * t + 1],
  yv = (e, t) => e.map((r, n) => r * t ** n).reduce((r, n) => r + n),
  Gs = (e, t) => (r) => {
    var n = mv(e, t);
    return yv(n, r);
  },
  bx = (e, t) => (r) => {
    var n = mv(e, t),
      i = [...n.map((a, o) => a * o).slice(1), 0];
    return yv(i, r);
  },
  Vs = function () {
    for (var t, r, n, i, a = arguments.length, o = new Array(a), u = 0; u < a; u++)
      o[u] = arguments[u];
    if (o.length === 1)
      switch (o[0]) {
        case 'linear':
          [t, n, r, i] = [0, 0, 1, 1];
          break;
        case 'ease':
          [t, n, r, i] = [0.25, 0.1, 0.25, 1];
          break;
        case 'ease-in':
          [t, n, r, i] = [0.42, 0, 1, 1];
          break;
        case 'ease-out':
          [t, n, r, i] = [0.42, 0, 0.58, 1];
          break;
        case 'ease-in-out':
          [t, n, r, i] = [0, 0, 0.58, 1];
          break;
        default: {
          var l = o[0].split('(');
          l[0] === 'cubic-bezier' &&
            l[1].split(')')[0].split(',').length === 4 &&
            ([t, n, r, i] = l[1]
              .split(')')[0]
              .split(',')
              .map((v) => parseFloat(v)));
        }
      }
    else o.length === 4 && ([t, n, r, i] = o);
    var s = Gs(t, r),
      c = Gs(n, i),
      f = bx(t, r),
      d = (v) => (v > 1 ? 1 : v < 0 ? 0 : v),
      h = (v) => {
        for (var p = v > 1 ? 1 : v, m = p, g = 0; g < 8; ++g) {
          var w = s(m) - p,
            b = f(m);
          if (Math.abs(w - p) < Kn || b < Kn) return c(m);
          m = d(m - w / b);
        }
        return c(m);
      };
    return ((h.isStepper = !1), h);
  },
  wx = function () {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
      { stiff: r = 100, damping: n = 8, dt: i = 17 } = t,
      a = (o, u, l) => {
        var s = -(o - u) * r,
          c = l * n,
          f = l + ((s - c) * i) / 1e3,
          d = (l * i) / 1e3 + o;
        return Math.abs(d - u) < Kn && Math.abs(f) < Kn ? [u, 0] : [d, f];
      };
    return ((a.isStepper = !0), (a.dt = i), a);
  },
  gv = (e) => {
    if (typeof e == 'string')
      switch (e) {
        case 'ease':
        case 'ease-in-out':
        case 'ease-out':
        case 'ease-in':
        case 'linear':
          return Vs(e);
        case 'spring':
          return wx();
        default:
          if (e.split('(')[0] === 'cubic-bezier') return Vs(e);
      }
    return typeof e == 'function' ? e : null;
  };
function Xs(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Zs(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Xs(Object(r), !0).forEach(function (n) {
          xx(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Xs(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function xx(e, t, r) {
  return (
    (t = Px(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Px(e) {
  var t = Ox(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Ox(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var Ax = (e) => e.replace(/([A-Z])/g, (t) => '-'.concat(t.toLowerCase())),
  Sx = (e, t, r) => e.map((n) => ''.concat(Ax(n), ' ').concat(t, 'ms ').concat(r)).join(','),
  Ex = (e, t) => [Object.keys(e), Object.keys(t)].reduce((r, n) => r.filter((i) => n.includes(i))),
  Ur = (e, t) => Object.keys(t).reduce((r, n) => Zs(Zs({}, r), {}, { [n]: e(n, t[n]) }), {});
function Js(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function he(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Js(Object(r), !0).forEach(function (n) {
          _x(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Js(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function _x(e, t, r) {
  return (
    (t = Tx(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Tx(e) {
  var t = Cx(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Cx(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var Wn = (e, t, r) => e + (t - e) * r,
  Vo = (e) => {
    var { from: t, to: r } = e;
    return t !== r;
  },
  bv = (e, t, r) => {
    var n = Ur((i, a) => {
      if (Vo(a)) {
        var [o, u] = e(a.from, a.to, a.velocity);
        return he(he({}, a), {}, { from: o, velocity: u });
      }
      return a;
    }, t);
    return r < 1
      ? Ur(
          (i, a) =>
            Vo(a)
              ? he(
                  he({}, a),
                  {},
                  { velocity: Wn(a.velocity, n[i].velocity, r), from: Wn(a.from, n[i].from, r) }
                )
              : a,
          t
        )
      : bv(e, n, r - 1);
  };
function jx(e, t, r, n, i, a) {
  var o,
    u = n.reduce((d, h) => he(he({}, d), {}, { [h]: { from: e[h], velocity: 0, to: t[h] } }), {}),
    l = () => Ur((d, h) => h.from, u),
    s = () => !Object.values(u).filter(Vo).length,
    c = null,
    f = (d) => {
      o || (o = d);
      var h = d - o,
        v = h / r.dt;
      ((u = bv(r, u, v)), i(he(he(he({}, e), t), l())), (o = d), s() || (c = a.setTimeout(f)));
    };
  return () => (
    (c = a.setTimeout(f)),
    () => {
      c();
    }
  );
}
function Mx(e, t, r, n, i, a, o) {
  var u = null,
    l = i.reduce((f, d) => he(he({}, f), {}, { [d]: [e[d], t[d]] }), {}),
    s,
    c = (f) => {
      s || (s = f);
      var d = (f - s) / n,
        h = Ur((p, m) => Wn(...m, r(d)), l);
      if ((a(he(he(he({}, e), t), h)), d < 1)) u = o.setTimeout(c);
      else {
        var v = Ur((p, m) => Wn(...m, r(1)), l);
        a(he(he(he({}, e), t), v));
      }
    };
  return () => (
    (u = o.setTimeout(c)),
    () => {
      u();
    }
  );
}
const wv = (e, t, r, n, i, a) => {
  var o = Ex(e, t);
  return r.isStepper === !0 ? jx(e, t, r, o, i, a) : Mx(e, t, r, n, o, i, a);
};
function kx(e) {
  var t,
    r = () => null,
    n = !1,
    i = null,
    a = (o) => {
      if (!n) {
        if (Array.isArray(o)) {
          if (!o.length) return;
          var u = o,
            [l, ...s] = u;
          if (typeof l == 'number') {
            i = e.setTimeout(a.bind(null, s), l);
            return;
          }
          (a(l), (i = e.setTimeout(a.bind(null, s))));
          return;
        }
        (typeof o == 'string' && ((t = o), r(t)),
          typeof o == 'object' && ((t = o), r(t)),
          typeof o == 'function' && o());
      }
    };
  return {
    stop: () => {
      n = !0;
    },
    start: (o) => {
      ((n = !1), i && (i(), (i = null)), a(o));
    },
    subscribe: (o) => (
      (r = o),
      () => {
        r = () => null;
      }
    ),
    getTimeoutController: () => e,
  };
}
class Ix {
  setTimeout(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
      n = performance.now(),
      i = null,
      a = (o) => {
        o - n >= r
          ? t(o)
          : typeof requestAnimationFrame == 'function' && (i = requestAnimationFrame(a));
      };
    return (
      (i = requestAnimationFrame(a)),
      () => {
        cancelAnimationFrame(i);
      }
    );
  }
}
function Dx() {
  return kx(new Ix());
}
var Nx = y.createContext(Dx);
function xv(e, t) {
  var r = y.useContext(Nx);
  return y.useMemo(() => t ?? r(e), [e, t, r]);
}
var $x = [
  'children',
  'begin',
  'duration',
  'attributeName',
  'easing',
  'isActive',
  'from',
  'to',
  'canBegin',
  'onAnimationEnd',
  'shouldReAnimate',
  'onAnimationReStart',
  'animationManager',
];
function Xo() {
  return (
    (Xo = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Xo.apply(null, arguments)
  );
}
function Rx(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = Lx(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function Lx(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Qs(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function St(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Qs(Object(r), !0).forEach(function (n) {
          Kt(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Qs(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Kt(e, t, r) {
  return (
    (t = Bx(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Bx(e) {
  var t = qx(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function qx(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
class Zu extends y.PureComponent {
  constructor(t, r) {
    (super(t, r),
      Kt(this, 'mounted', !1),
      Kt(this, 'manager', void 0),
      Kt(this, 'stopJSAnimation', null),
      Kt(this, 'unSubscribe', null));
    var {
      isActive: n,
      attributeName: i,
      from: a,
      to: o,
      children: u,
      duration: l,
      animationManager: s,
    } = this.props;
    if (
      ((this.manager = s),
      (this.handleStyleChange = this.handleStyleChange.bind(this)),
      (this.changeStyle = this.changeStyle.bind(this)),
      !n || l <= 0)
    ) {
      ((this.state = { style: {} }), typeof u == 'function' && (this.state = { style: o }));
      return;
    }
    if (a) {
      if (typeof u == 'function') {
        this.state = { style: a };
        return;
      }
      this.state = { style: i ? { [i]: a } : a };
    } else this.state = { style: {} };
  }
  componentDidMount() {
    var { isActive: t, canBegin: r } = this.props;
    ((this.mounted = !0), !(!t || !r) && this.runAnimation(this.props));
  }
  componentDidUpdate(t) {
    var {
        isActive: r,
        canBegin: n,
        attributeName: i,
        shouldReAnimate: a,
        to: o,
        from: u,
      } = this.props,
      { style: l } = this.state;
    if (n) {
      if (!r) {
        var s = { style: i ? { [i]: o } : o };
        this.state && l && ((i && l[i] !== o) || (!i && l !== o)) && this.setState(s);
        return;
      }
      if (!(gx(t.to, o) && t.canBegin && t.isActive)) {
        var c = !t.canBegin || !t.isActive;
        (this.manager.stop(), this.stopJSAnimation && this.stopJSAnimation());
        var f = c || a ? u : t.to;
        if (this.state && l) {
          var d = { style: i ? { [i]: f } : f };
          ((i && l[i] !== f) || (!i && l !== f)) && this.setState(d);
        }
        this.runAnimation(St(St({}, this.props), {}, { from: f, begin: 0 }));
      }
    }
  }
  componentWillUnmount() {
    this.mounted = !1;
    var { onAnimationEnd: t } = this.props;
    (this.unSubscribe && this.unSubscribe(),
      this.manager.stop(),
      this.stopJSAnimation && this.stopJSAnimation(),
      t && t());
  }
  handleStyleChange(t) {
    this.changeStyle(t);
  }
  changeStyle(t) {
    this.mounted && this.setState({ style: t });
  }
  runJSAnimation(t) {
    var {
        from: r,
        to: n,
        duration: i,
        easing: a,
        begin: o,
        onAnimationEnd: u,
        onAnimationStart: l,
      } = t,
      s = wv(r, n, gv(a), i, this.changeStyle, this.manager.getTimeoutController()),
      c = () => {
        this.stopJSAnimation = s();
      };
    this.manager.start([l, o, c, i, u]);
  }
  runAnimation(t) {
    var {
      begin: r,
      duration: n,
      attributeName: i,
      to: a,
      easing: o,
      onAnimationStart: u,
      onAnimationEnd: l,
      children: s,
    } = t;
    if (
      ((this.unSubscribe = this.manager.subscribe(this.handleStyleChange)),
      typeof o == 'function' || typeof s == 'function' || o === 'spring')
    ) {
      this.runJSAnimation(t);
      return;
    }
    var c = i ? { [i]: a } : a,
      f = Sx(Object.keys(c), n, o);
    this.manager.start([u, r, St(St({}, c), {}, { transition: f }), n, l]);
  }
  render() {
    var t = this.props,
      {
        children: r,
        begin: n,
        duration: i,
        attributeName: a,
        easing: o,
        isActive: u,
        from: l,
        to: s,
        canBegin: c,
        onAnimationEnd: f,
        shouldReAnimate: d,
        onAnimationReStart: h,
        animationManager: v,
      } = t,
      p = Rx(t, $x),
      m = y.Children.count(r),
      g = this.state.style;
    if (typeof r == 'function') return r(g);
    if (!u || m === 0 || i <= 0) return r;
    var w = (b) => {
      var { style: P = {}, className: x } = b.props,
        O = y.cloneElement(b, St(St({}, p), {}, { style: St(St({}, P), g), className: x }));
      return O;
    };
    return m === 1
      ? w(y.Children.only(r))
      : y.createElement(
          'div',
          null,
          y.Children.map(r, (b) => w(b))
        );
  }
}
Kt(Zu, 'displayName', 'Animate');
Kt(Zu, 'defaultProps', {
  begin: 0,
  duration: 1e3,
  attributeName: '',
  easing: 'ease',
  isActive: !0,
  canBegin: !0,
  onAnimationEnd: () => {},
  onAnimationStart: () => {},
});
function ef(e) {
  var t,
    r = xv(
      (t = e.attributeName) !== null && t !== void 0 ? t : Object.keys(e.to).join(','),
      e.animationManager
    );
  return y.createElement(Zu, Xo({}, e, { animationManager: r }));
}
function Un() {
  return (
    (Un = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Un.apply(null, arguments)
  );
}
var tf = (e, t, r, n, i) => {
    var a = Math.min(Math.abs(r) / 2, Math.abs(n) / 2),
      o = n >= 0 ? 1 : -1,
      u = r >= 0 ? 1 : -1,
      l = (n >= 0 && r >= 0) || (n < 0 && r < 0) ? 1 : 0,
      s;
    if (a > 0 && i instanceof Array) {
      for (var c = [0, 0, 0, 0], f = 0, d = 4; f < d; f++) c[f] = i[f] > a ? a : i[f];
      ((s = 'M'.concat(e, ',').concat(t + o * c[0])),
        c[0] > 0 &&
          (s += 'A '
            .concat(c[0], ',')
            .concat(c[0], ',0,0,')
            .concat(l, ',')
            .concat(e + u * c[0], ',')
            .concat(t)),
        (s += 'L '.concat(e + r - u * c[1], ',').concat(t)),
        c[1] > 0 &&
          (s += 'A '
            .concat(c[1], ',')
            .concat(c[1], ',0,0,')
            .concat(
              l,
              `,
        `
            )
            .concat(e + r, ',')
            .concat(t + o * c[1])),
        (s += 'L '.concat(e + r, ',').concat(t + n - o * c[2])),
        c[2] > 0 &&
          (s += 'A '
            .concat(c[2], ',')
            .concat(c[2], ',0,0,')
            .concat(
              l,
              `,
        `
            )
            .concat(e + r - u * c[2], ',')
            .concat(t + n)),
        (s += 'L '.concat(e + u * c[3], ',').concat(t + n)),
        c[3] > 0 &&
          (s += 'A '
            .concat(c[3], ',')
            .concat(c[3], ',0,0,')
            .concat(
              l,
              `,
        `
            )
            .concat(e, ',')
            .concat(t + n - o * c[3])),
        (s += 'Z'));
    } else if (a > 0 && i === +i && i > 0) {
      var h = Math.min(a, i);
      s = 'M '
        .concat(e, ',')
        .concat(
          t + o * h,
          `
            A `
        )
        .concat(h, ',')
        .concat(h, ',0,0,')
        .concat(l, ',')
        .concat(e + u * h, ',')
        .concat(
          t,
          `
            L `
        )
        .concat(e + r - u * h, ',')
        .concat(
          t,
          `
            A `
        )
        .concat(h, ',')
        .concat(h, ',0,0,')
        .concat(l, ',')
        .concat(e + r, ',')
        .concat(
          t + o * h,
          `
            L `
        )
        .concat(e + r, ',')
        .concat(
          t + n - o * h,
          `
            A `
        )
        .concat(h, ',')
        .concat(h, ',0,0,')
        .concat(l, ',')
        .concat(e + r - u * h, ',')
        .concat(
          t + n,
          `
            L `
        )
        .concat(e + u * h, ',')
        .concat(
          t + n,
          `
            A `
        )
        .concat(h, ',')
        .concat(h, ',0,0,')
        .concat(l, ',')
        .concat(e, ',')
        .concat(t + n - o * h, ' Z');
    } else
      s = 'M '.concat(e, ',').concat(t, ' h ').concat(r, ' v ').concat(n, ' h ').concat(-r, ' Z');
    return s;
  },
  zx = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 0,
    isAnimationActive: !1,
    isUpdateAnimationActive: !1,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
  },
  Fx = (e) => {
    var t = ut(e, zx),
      r = y.useRef(null),
      [n, i] = y.useState(-1);
    y.useEffect(() => {
      if (r.current && r.current.getTotalLength)
        try {
          var g = r.current.getTotalLength();
          g && i(g);
        } catch {}
    }, []);
    var { x: a, y: o, width: u, height: l, radius: s, className: c } = t,
      {
        animationEasing: f,
        animationDuration: d,
        animationBegin: h,
        isAnimationActive: v,
        isUpdateAnimationActive: p,
      } = t;
    if (a !== +a || o !== +o || u !== +u || l !== +l || u === 0 || l === 0) return null;
    var m = K('recharts-rectangle', c);
    return p
      ? y.createElement(
          ef,
          {
            canBegin: n > 0,
            from: { width: u, height: l, x: a, y: o },
            to: { width: u, height: l, x: a, y: o },
            duration: d,
            animationEasing: f,
            isActive: p,
          },
          (g) => {
            var { width: w, height: b, x: P, y: x } = g;
            return y.createElement(
              ef,
              {
                canBegin: n > 0,
                from: '0px '.concat(n === -1 ? 1 : n, 'px'),
                to: ''.concat(n, 'px 0px'),
                attributeName: 'strokeDasharray',
                begin: h,
                duration: d,
                isActive: v,
                easing: f,
              },
              y.createElement(
                'path',
                Un({}, ee(t, !0), { className: m, d: tf(P, x, w, b, s), ref: r })
              )
            );
          }
        )
      : y.createElement('path', Un({}, ee(t, !0), { className: m, d: tf(a, o, u, l, s) }));
  };
function Pv(e) {
  var { cx: t, cy: r, radius: n, startAngle: i, endAngle: a } = e,
    o = ve(t, r, n, i),
    u = ve(t, r, n, a);
  return { points: [o, u], cx: t, cy: r, radius: n, startAngle: i, endAngle: a };
}
function Zo() {
  return (
    (Zo = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Zo.apply(null, arguments)
  );
}
var Kx = (e, t) => {
    var r = Ue(t - e),
      n = Math.min(Math.abs(t - e), 359.999);
    return r * n;
  },
  xn = (e) => {
    var {
        cx: t,
        cy: r,
        radius: n,
        angle: i,
        sign: a,
        isExternal: o,
        cornerRadius: u,
        cornerIsExternal: l,
      } = e,
      s = u * (o ? 1 : -1) + n,
      c = Math.asin(u / s) / qn,
      f = l ? i : i + a * c,
      d = ve(t, r, s, f),
      h = ve(t, r, n, f),
      v = l ? i - a * c : i,
      p = ve(t, r, s * Math.cos(c * qn), v);
    return { center: d, circleTangency: h, lineTangency: p, theta: c };
  },
  Ov = (e) => {
    var { cx: t, cy: r, innerRadius: n, outerRadius: i, startAngle: a, endAngle: o } = e,
      u = Kx(a, o),
      l = a + u,
      s = ve(t, r, i, a),
      c = ve(t, r, i, l),
      f = 'M '
        .concat(s.x, ',')
        .concat(
          s.y,
          `
    A `
        )
        .concat(i, ',')
        .concat(
          i,
          `,0,
    `
        )
        .concat(+(Math.abs(u) > 180), ',')
        .concat(
          +(a > l),
          `,
    `
        )
        .concat(c.x, ',')
        .concat(
          c.y,
          `
  `
        );
    if (n > 0) {
      var d = ve(t, r, n, a),
        h = ve(t, r, n, l);
      f += 'L '
        .concat(h.x, ',')
        .concat(
          h.y,
          `
            A `
        )
        .concat(n, ',')
        .concat(
          n,
          `,0,
            `
        )
        .concat(+(Math.abs(u) > 180), ',')
        .concat(
          +(a <= l),
          `,
            `
        )
        .concat(d.x, ',')
        .concat(d.y, ' Z');
    } else f += 'L '.concat(t, ',').concat(r, ' Z');
    return f;
  },
  Wx = (e) => {
    var {
        cx: t,
        cy: r,
        innerRadius: n,
        outerRadius: i,
        cornerRadius: a,
        forceCornerRadius: o,
        cornerIsExternal: u,
        startAngle: l,
        endAngle: s,
      } = e,
      c = Ue(s - l),
      {
        circleTangency: f,
        lineTangency: d,
        theta: h,
      } = xn({ cx: t, cy: r, radius: i, angle: l, sign: c, cornerRadius: a, cornerIsExternal: u }),
      {
        circleTangency: v,
        lineTangency: p,
        theta: m,
      } = xn({ cx: t, cy: r, radius: i, angle: s, sign: -c, cornerRadius: a, cornerIsExternal: u }),
      g = u ? Math.abs(l - s) : Math.abs(l - s) - h - m;
    if (g < 0)
      return o
        ? 'M '
            .concat(d.x, ',')
            .concat(
              d.y,
              `
        a`
            )
            .concat(a, ',')
            .concat(a, ',0,0,1,')
            .concat(
              a * 2,
              `,0
        a`
            )
            .concat(a, ',')
            .concat(a, ',0,0,1,')
            .concat(
              -a * 2,
              `,0
      `
            )
        : Ov({ cx: t, cy: r, innerRadius: n, outerRadius: i, startAngle: l, endAngle: s });
    var w = 'M '
      .concat(d.x, ',')
      .concat(
        d.y,
        `
    A`
      )
      .concat(a, ',')
      .concat(a, ',0,0,')
      .concat(+(c < 0), ',')
      .concat(f.x, ',')
      .concat(
        f.y,
        `
    A`
      )
      .concat(i, ',')
      .concat(i, ',0,')
      .concat(+(g > 180), ',')
      .concat(+(c < 0), ',')
      .concat(v.x, ',')
      .concat(
        v.y,
        `
    A`
      )
      .concat(a, ',')
      .concat(a, ',0,0,')
      .concat(+(c < 0), ',')
      .concat(p.x, ',')
      .concat(
        p.y,
        `
  `
      );
    if (n > 0) {
      var {
          circleTangency: b,
          lineTangency: P,
          theta: x,
        } = xn({
          cx: t,
          cy: r,
          radius: n,
          angle: l,
          sign: c,
          isExternal: !0,
          cornerRadius: a,
          cornerIsExternal: u,
        }),
        {
          circleTangency: O,
          lineTangency: S,
          theta: _,
        } = xn({
          cx: t,
          cy: r,
          radius: n,
          angle: s,
          sign: -c,
          isExternal: !0,
          cornerRadius: a,
          cornerIsExternal: u,
        }),
        C = u ? Math.abs(l - s) : Math.abs(l - s) - x - _;
      if (C < 0 && a === 0) return ''.concat(w, 'L').concat(t, ',').concat(r, 'Z');
      w += 'L'
        .concat(S.x, ',')
        .concat(
          S.y,
          `
      A`
        )
        .concat(a, ',')
        .concat(a, ',0,0,')
        .concat(+(c < 0), ',')
        .concat(O.x, ',')
        .concat(
          O.y,
          `
      A`
        )
        .concat(n, ',')
        .concat(n, ',0,')
        .concat(+(C > 180), ',')
        .concat(+(c > 0), ',')
        .concat(b.x, ',')
        .concat(
          b.y,
          `
      A`
        )
        .concat(a, ',')
        .concat(a, ',0,0,')
        .concat(+(c < 0), ',')
        .concat(P.x, ',')
        .concat(P.y, 'Z');
    } else w += 'L'.concat(t, ',').concat(r, 'Z');
    return w;
  },
  Ux = {
    cx: 0,
    cy: 0,
    innerRadius: 0,
    outerRadius: 0,
    startAngle: 0,
    endAngle: 0,
    cornerRadius: 0,
    forceCornerRadius: !1,
    cornerIsExternal: !1,
  },
  Hx = (e) => {
    var t = ut(e, Ux),
      {
        cx: r,
        cy: n,
        innerRadius: i,
        outerRadius: a,
        cornerRadius: o,
        forceCornerRadius: u,
        cornerIsExternal: l,
        startAngle: s,
        endAngle: c,
        className: f,
      } = t;
    if (a < i || s === c) return null;
    var d = K('recharts-sector', f),
      h = a - i,
      v = jt(o, h, 0, !0),
      p;
    return (
      v > 0 && Math.abs(s - c) < 360
        ? (p = Wx({
            cx: r,
            cy: n,
            innerRadius: i,
            outerRadius: a,
            cornerRadius: Math.min(v, h / 2),
            forceCornerRadius: u,
            cornerIsExternal: l,
            startAngle: s,
            endAngle: c,
          }))
        : (p = Ov({ cx: r, cy: n, innerRadius: i, outerRadius: a, startAngle: s, endAngle: c })),
      y.createElement('path', Zo({}, ee(t, !0), { className: d, d: p }))
    );
  };
function Yx(e, t, r) {
  var n, i, a, o;
  if (e === 'horizontal') ((n = t.x), (a = n), (i = r.top), (o = r.top + r.height));
  else if (e === 'vertical') ((i = t.y), (o = i), (n = r.left), (a = r.left + r.width));
  else if (t.cx != null && t.cy != null)
    if (e === 'centric') {
      var { cx: u, cy: l, innerRadius: s, outerRadius: c, angle: f } = t,
        d = ve(u, l, s, f),
        h = ve(u, l, c, f);
      ((n = d.x), (i = d.y), (a = h.x), (o = h.y));
    } else return Pv(t);
  return [
    { x: n, y: i },
    { x: a, y: o },
  ];
}
var Qa = {},
  eo = {},
  to = {},
  rf;
function Gx() {
  return (
    rf ||
      ((rf = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Dh();
        function r(n) {
          return t.isSymbol(n) ? NaN : Number(n);
        }
        e.toNumber = r;
      })(to)),
    to
  );
}
var nf;
function Vx() {
  return (
    nf ||
      ((nf = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Gx();
        function r(n) {
          return n
            ? ((n = t.toNumber(n)),
              n === 1 / 0 || n === -1 / 0 ? (n < 0 ? -1 : 1) * Number.MAX_VALUE : n === n ? n : 0)
            : n === 0
              ? n
              : 0;
        }
        e.toFinite = r;
      })(eo)),
    eo
  );
}
var af;
function Xx() {
  return (
    af ||
      ((af = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = Nh(),
          r = Vx();
        function n(i, a, o) {
          (o && typeof o != 'number' && t.isIterateeCall(i, a, o) && (a = o = void 0),
            (i = r.toFinite(i)),
            a === void 0 ? ((a = i), (i = 0)) : (a = r.toFinite(a)),
            (o = o === void 0 ? (i < a ? 1 : -1) : r.toFinite(o)));
          const u = Math.max(Math.ceil((a - i) / (o || 1)), 0),
            l = new Array(u);
          for (let s = 0; s < u; s++) ((l[s] = i), (i += o));
          return l;
        }
        e.range = n;
      })(Qa)),
    Qa
  );
}
var ro, of;
function Zx() {
  return (of || ((of = 1), (ro = Xx().range)), ro);
}
var Jx = Zx();
const Av = Mt(Jx);
function Tt(e, t) {
  return e == null || t == null ? NaN : e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function Qx(e, t) {
  return e == null || t == null ? NaN : t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function Ju(e) {
  let t, r, n;
  e.length !== 2
    ? ((t = Tt), (r = (u, l) => Tt(e(u), l)), (n = (u, l) => e(u) - l))
    : ((t = e === Tt || e === Qx ? e : e1), (r = e), (n = e));
  function i(u, l, s = 0, c = u.length) {
    if (s < c) {
      if (t(l, l) !== 0) return c;
      do {
        const f = (s + c) >>> 1;
        r(u[f], l) < 0 ? (s = f + 1) : (c = f);
      } while (s < c);
    }
    return s;
  }
  function a(u, l, s = 0, c = u.length) {
    if (s < c) {
      if (t(l, l) !== 0) return c;
      do {
        const f = (s + c) >>> 1;
        r(u[f], l) <= 0 ? (s = f + 1) : (c = f);
      } while (s < c);
    }
    return s;
  }
  function o(u, l, s = 0, c = u.length) {
    const f = i(u, l, s, c - 1);
    return f > s && n(u[f - 1], l) > -n(u[f], l) ? f - 1 : f;
  }
  return { left: i, center: o, right: a };
}
function e1() {
  return 0;
}
function Sv(e) {
  return e === null ? NaN : +e;
}
function* t1(e, t) {
  for (let r of e) r != null && (r = +r) >= r && (yield r);
}
const r1 = Ju(Tt),
  rn = r1.right;
Ju(Sv).center;
class uf extends Map {
  constructor(t, r = a1) {
    if (
      (super(),
      Object.defineProperties(this, { _intern: { value: new Map() }, _key: { value: r } }),
      t != null)
    )
      for (const [n, i] of t) this.set(n, i);
  }
  get(t) {
    return super.get(lf(this, t));
  }
  has(t) {
    return super.has(lf(this, t));
  }
  set(t, r) {
    return super.set(n1(this, t), r);
  }
  delete(t) {
    return super.delete(i1(this, t));
  }
}
function lf({ _intern: e, _key: t }, r) {
  const n = t(r);
  return e.has(n) ? e.get(n) : r;
}
function n1({ _intern: e, _key: t }, r) {
  const n = t(r);
  return e.has(n) ? e.get(n) : (e.set(n, r), r);
}
function i1({ _intern: e, _key: t }, r) {
  const n = t(r);
  return (e.has(n) && ((r = e.get(n)), e.delete(n)), r);
}
function a1(e) {
  return e !== null && typeof e == 'object' ? e.valueOf() : e;
}
function o1(e = Tt) {
  if (e === Tt) return Ev;
  if (typeof e != 'function') throw new TypeError('compare is not a function');
  return (t, r) => {
    const n = e(t, r);
    return n || n === 0 ? n : (e(r, r) === 0) - (e(t, t) === 0);
  };
}
function Ev(e, t) {
  return (e == null || !(e >= e)) - (t == null || !(t >= t)) || (e < t ? -1 : e > t ? 1 : 0);
}
const u1 = Math.sqrt(50),
  l1 = Math.sqrt(10),
  c1 = Math.sqrt(2);
function Hn(e, t, r) {
  const n = (t - e) / Math.max(0, r),
    i = Math.floor(Math.log10(n)),
    a = n / Math.pow(10, i),
    o = a >= u1 ? 10 : a >= l1 ? 5 : a >= c1 ? 2 : 1;
  let u, l, s;
  return (
    i < 0
      ? ((s = Math.pow(10, -i) / o),
        (u = Math.round(e * s)),
        (l = Math.round(t * s)),
        u / s < e && ++u,
        l / s > t && --l,
        (s = -s))
      : ((s = Math.pow(10, i) * o),
        (u = Math.round(e / s)),
        (l = Math.round(t / s)),
        u * s < e && ++u,
        l * s > t && --l),
    l < u && 0.5 <= r && r < 2 ? Hn(e, t, r * 2) : [u, l, s]
  );
}
function Jo(e, t, r) {
  if (((t = +t), (e = +e), (r = +r), !(r > 0))) return [];
  if (e === t) return [e];
  const n = t < e,
    [i, a, o] = n ? Hn(t, e, r) : Hn(e, t, r);
  if (!(a >= i)) return [];
  const u = a - i + 1,
    l = new Array(u);
  if (n)
    if (o < 0) for (let s = 0; s < u; ++s) l[s] = (a - s) / -o;
    else for (let s = 0; s < u; ++s) l[s] = (a - s) * o;
  else if (o < 0) for (let s = 0; s < u; ++s) l[s] = (i + s) / -o;
  else for (let s = 0; s < u; ++s) l[s] = (i + s) * o;
  return l;
}
function Qo(e, t, r) {
  return ((t = +t), (e = +e), (r = +r), Hn(e, t, r)[2]);
}
function eu(e, t, r) {
  ((t = +t), (e = +e), (r = +r));
  const n = t < e,
    i = n ? Qo(t, e, r) : Qo(e, t, r);
  return (n ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
function cf(e, t) {
  let r;
  for (const n of e) n != null && (r < n || (r === void 0 && n >= n)) && (r = n);
  return r;
}
function sf(e, t) {
  let r;
  for (const n of e) n != null && (r > n || (r === void 0 && n >= n)) && (r = n);
  return r;
}
function _v(e, t, r = 0, n = 1 / 0, i) {
  if (
    ((t = Math.floor(t)),
    (r = Math.floor(Math.max(0, r))),
    (n = Math.floor(Math.min(e.length - 1, n))),
    !(r <= t && t <= n))
  )
    return e;
  for (i = i === void 0 ? Ev : o1(i); n > r; ) {
    if (n - r > 600) {
      const l = n - r + 1,
        s = t - r + 1,
        c = Math.log(l),
        f = 0.5 * Math.exp((2 * c) / 3),
        d = 0.5 * Math.sqrt((c * f * (l - f)) / l) * (s - l / 2 < 0 ? -1 : 1),
        h = Math.max(r, Math.floor(t - (s * f) / l + d)),
        v = Math.min(n, Math.floor(t + ((l - s) * f) / l + d));
      _v(e, t, h, v, i);
    }
    const a = e[t];
    let o = r,
      u = n;
    for (kr(e, r, t), i(e[n], a) > 0 && kr(e, r, n); o < u; ) {
      for (kr(e, o, u), ++o, --u; i(e[o], a) < 0; ) ++o;
      for (; i(e[u], a) > 0; ) --u;
    }
    (i(e[r], a) === 0 ? kr(e, r, u) : (++u, kr(e, u, n)),
      u <= t && (r = u + 1),
      t <= u && (n = u - 1));
  }
  return e;
}
function kr(e, t, r) {
  const n = e[t];
  ((e[t] = e[r]), (e[r] = n));
}
function s1(e, t, r) {
  if (((e = Float64Array.from(t1(e))), !(!(n = e.length) || isNaN((t = +t))))) {
    if (t <= 0 || n < 2) return sf(e);
    if (t >= 1) return cf(e);
    var n,
      i = (n - 1) * t,
      a = Math.floor(i),
      o = cf(_v(e, a).subarray(0, a + 1)),
      u = sf(e.subarray(a + 1));
    return o + (u - o) * (i - a);
  }
}
function f1(e, t, r = Sv) {
  if (!(!(n = e.length) || isNaN((t = +t)))) {
    if (t <= 0 || n < 2) return +r(e[0], 0, e);
    if (t >= 1) return +r(e[n - 1], n - 1, e);
    var n,
      i = (n - 1) * t,
      a = Math.floor(i),
      o = +r(e[a], a, e),
      u = +r(e[a + 1], a + 1, e);
    return o + (u - o) * (i - a);
  }
}
function d1(e, t, r) {
  ((e = +e), (t = +t), (r = (i = arguments.length) < 2 ? ((t = e), (e = 0), 1) : i < 3 ? 1 : +r));
  for (var n = -1, i = Math.max(0, Math.ceil((t - e) / r)) | 0, a = new Array(i); ++n < i; )
    a[n] = e + n * r;
  return a;
}
function Ve(e, t) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(e);
      break;
    default:
      this.range(t).domain(e);
      break;
  }
  return this;
}
function xt(e, t) {
  switch (arguments.length) {
    case 0:
      break;
    case 1: {
      typeof e == 'function' ? this.interpolator(e) : this.range(e);
      break;
    }
    default: {
      (this.domain(e), typeof t == 'function' ? this.interpolator(t) : this.range(t));
      break;
    }
  }
  return this;
}
const tu = Symbol('implicit');
function Qu() {
  var e = new uf(),
    t = [],
    r = [],
    n = tu;
  function i(a) {
    let o = e.get(a);
    if (o === void 0) {
      if (n !== tu) return n;
      e.set(a, (o = t.push(a) - 1));
    }
    return r[o % r.length];
  }
  return (
    (i.domain = function (a) {
      if (!arguments.length) return t.slice();
      ((t = []), (e = new uf()));
      for (const o of a) e.has(o) || e.set(o, t.push(o) - 1);
      return i;
    }),
    (i.range = function (a) {
      return arguments.length ? ((r = Array.from(a)), i) : r.slice();
    }),
    (i.unknown = function (a) {
      return arguments.length ? ((n = a), i) : n;
    }),
    (i.copy = function () {
      return Qu(t, r).unknown(n);
    }),
    Ve.apply(i, arguments),
    i
  );
}
function el() {
  var e = Qu().unknown(void 0),
    t = e.domain,
    r = e.range,
    n = 0,
    i = 1,
    a,
    o,
    u = !1,
    l = 0,
    s = 0,
    c = 0.5;
  delete e.unknown;
  function f() {
    var d = t().length,
      h = i < n,
      v = h ? i : n,
      p = h ? n : i;
    ((a = (p - v) / Math.max(1, d - l + s * 2)),
      u && (a = Math.floor(a)),
      (v += (p - v - a * (d - l)) * c),
      (o = a * (1 - l)),
      u && ((v = Math.round(v)), (o = Math.round(o))));
    var m = d1(d).map(function (g) {
      return v + a * g;
    });
    return r(h ? m.reverse() : m);
  }
  return (
    (e.domain = function (d) {
      return arguments.length ? (t(d), f()) : t();
    }),
    (e.range = function (d) {
      return arguments.length ? (([n, i] = d), (n = +n), (i = +i), f()) : [n, i];
    }),
    (e.rangeRound = function (d) {
      return (([n, i] = d), (n = +n), (i = +i), (u = !0), f());
    }),
    (e.bandwidth = function () {
      return o;
    }),
    (e.step = function () {
      return a;
    }),
    (e.round = function (d) {
      return arguments.length ? ((u = !!d), f()) : u;
    }),
    (e.padding = function (d) {
      return arguments.length ? ((l = Math.min(1, (s = +d))), f()) : l;
    }),
    (e.paddingInner = function (d) {
      return arguments.length ? ((l = Math.min(1, d)), f()) : l;
    }),
    (e.paddingOuter = function (d) {
      return arguments.length ? ((s = +d), f()) : s;
    }),
    (e.align = function (d) {
      return arguments.length ? ((c = Math.max(0, Math.min(1, d))), f()) : c;
    }),
    (e.copy = function () {
      return el(t(), [n, i]).round(u).paddingInner(l).paddingOuter(s).align(c);
    }),
    Ve.apply(f(), arguments)
  );
}
function Tv(e) {
  var t = e.copy;
  return (
    (e.padding = e.paddingOuter),
    delete e.paddingInner,
    delete e.paddingOuter,
    (e.copy = function () {
      return Tv(t());
    }),
    e
  );
}
function h1() {
  return Tv(el.apply(null, arguments).paddingInner(1));
}
function tl(e, t, r) {
  ((e.prototype = t.prototype = r), (r.constructor = e));
}
function Cv(e, t) {
  var r = Object.create(e.prototype);
  for (var n in t) r[n] = t[n];
  return r;
}
function nn() {}
var Hr = 0.7,
  Yn = 1 / Hr,
  dr = '\\s*([+-]?\\d+)\\s*',
  Yr = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*',
  nt = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*',
  v1 = /^#([0-9a-f]{3,8})$/,
  p1 = new RegExp(`^rgb\\(${dr},${dr},${dr}\\)$`),
  m1 = new RegExp(`^rgb\\(${nt},${nt},${nt}\\)$`),
  y1 = new RegExp(`^rgba\\(${dr},${dr},${dr},${Yr}\\)$`),
  g1 = new RegExp(`^rgba\\(${nt},${nt},${nt},${Yr}\\)$`),
  b1 = new RegExp(`^hsl\\(${Yr},${nt},${nt}\\)$`),
  w1 = new RegExp(`^hsla\\(${Yr},${nt},${nt},${Yr}\\)$`),
  ff = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074,
  };
tl(nn, Gr, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: df,
  formatHex: df,
  formatHex8: x1,
  formatHsl: P1,
  formatRgb: hf,
  toString: hf,
});
function df() {
  return this.rgb().formatHex();
}
function x1() {
  return this.rgb().formatHex8();
}
function P1() {
  return jv(this).formatHsl();
}
function hf() {
  return this.rgb().formatRgb();
}
function Gr(e) {
  var t, r;
  return (
    (e = (e + '').trim().toLowerCase()),
    (t = v1.exec(e))
      ? ((r = t[1].length),
        (t = parseInt(t[1], 16)),
        r === 6
          ? vf(t)
          : r === 3
            ? new Ae(
                ((t >> 8) & 15) | ((t >> 4) & 240),
                ((t >> 4) & 15) | (t & 240),
                ((t & 15) << 4) | (t & 15),
                1
              )
            : r === 8
              ? Pn((t >> 24) & 255, (t >> 16) & 255, (t >> 8) & 255, (t & 255) / 255)
              : r === 4
                ? Pn(
                    ((t >> 12) & 15) | ((t >> 8) & 240),
                    ((t >> 8) & 15) | ((t >> 4) & 240),
                    ((t >> 4) & 15) | (t & 240),
                    (((t & 15) << 4) | (t & 15)) / 255
                  )
                : null)
      : (t = p1.exec(e))
        ? new Ae(t[1], t[2], t[3], 1)
        : (t = m1.exec(e))
          ? new Ae((t[1] * 255) / 100, (t[2] * 255) / 100, (t[3] * 255) / 100, 1)
          : (t = y1.exec(e))
            ? Pn(t[1], t[2], t[3], t[4])
            : (t = g1.exec(e))
              ? Pn((t[1] * 255) / 100, (t[2] * 255) / 100, (t[3] * 255) / 100, t[4])
              : (t = b1.exec(e))
                ? yf(t[1], t[2] / 100, t[3] / 100, 1)
                : (t = w1.exec(e))
                  ? yf(t[1], t[2] / 100, t[3] / 100, t[4])
                  : ff.hasOwnProperty(e)
                    ? vf(ff[e])
                    : e === 'transparent'
                      ? new Ae(NaN, NaN, NaN, 0)
                      : null
  );
}
function vf(e) {
  return new Ae((e >> 16) & 255, (e >> 8) & 255, e & 255, 1);
}
function Pn(e, t, r, n) {
  return (n <= 0 && (e = t = r = NaN), new Ae(e, t, r, n));
}
function O1(e) {
  return (
    e instanceof nn || (e = Gr(e)),
    e ? ((e = e.rgb()), new Ae(e.r, e.g, e.b, e.opacity)) : new Ae()
  );
}
function ru(e, t, r, n) {
  return arguments.length === 1 ? O1(e) : new Ae(e, t, r, n ?? 1);
}
function Ae(e, t, r, n) {
  ((this.r = +e), (this.g = +t), (this.b = +r), (this.opacity = +n));
}
tl(
  Ae,
  ru,
  Cv(nn, {
    brighter(e) {
      return (
        (e = e == null ? Yn : Math.pow(Yn, e)),
        new Ae(this.r * e, this.g * e, this.b * e, this.opacity)
      );
    },
    darker(e) {
      return (
        (e = e == null ? Hr : Math.pow(Hr, e)),
        new Ae(this.r * e, this.g * e, this.b * e, this.opacity)
      );
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Ae(Xt(this.r), Xt(this.g), Xt(this.b), Gn(this.opacity));
    },
    displayable() {
      return (
        -0.5 <= this.r &&
        this.r < 255.5 &&
        -0.5 <= this.g &&
        this.g < 255.5 &&
        -0.5 <= this.b &&
        this.b < 255.5 &&
        0 <= this.opacity &&
        this.opacity <= 1
      );
    },
    hex: pf,
    formatHex: pf,
    formatHex8: A1,
    formatRgb: mf,
    toString: mf,
  })
);
function pf() {
  return `#${Wt(this.r)}${Wt(this.g)}${Wt(this.b)}`;
}
function A1() {
  return `#${Wt(this.r)}${Wt(this.g)}${Wt(this.b)}${Wt((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function mf() {
  const e = Gn(this.opacity);
  return `${e === 1 ? 'rgb(' : 'rgba('}${Xt(this.r)}, ${Xt(this.g)}, ${Xt(this.b)}${e === 1 ? ')' : `, ${e})`}`;
}
function Gn(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function Xt(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function Wt(e) {
  return ((e = Xt(e)), (e < 16 ? '0' : '') + e.toString(16));
}
function yf(e, t, r, n) {
  return (
    n <= 0 ? (e = t = r = NaN) : r <= 0 || r >= 1 ? (e = t = NaN) : t <= 0 && (e = NaN),
    new Qe(e, t, r, n)
  );
}
function jv(e) {
  if (e instanceof Qe) return new Qe(e.h, e.s, e.l, e.opacity);
  if ((e instanceof nn || (e = Gr(e)), !e)) return new Qe();
  if (e instanceof Qe) return e;
  e = e.rgb();
  var t = e.r / 255,
    r = e.g / 255,
    n = e.b / 255,
    i = Math.min(t, r, n),
    a = Math.max(t, r, n),
    o = NaN,
    u = a - i,
    l = (a + i) / 2;
  return (
    u
      ? (t === a
          ? (o = (r - n) / u + (r < n) * 6)
          : r === a
            ? (o = (n - t) / u + 2)
            : (o = (t - r) / u + 4),
        (u /= l < 0.5 ? a + i : 2 - a - i),
        (o *= 60))
      : (u = l > 0 && l < 1 ? 0 : o),
    new Qe(o, u, l, e.opacity)
  );
}
function S1(e, t, r, n) {
  return arguments.length === 1 ? jv(e) : new Qe(e, t, r, n ?? 1);
}
function Qe(e, t, r, n) {
  ((this.h = +e), (this.s = +t), (this.l = +r), (this.opacity = +n));
}
tl(
  Qe,
  S1,
  Cv(nn, {
    brighter(e) {
      return (
        (e = e == null ? Yn : Math.pow(Yn, e)),
        new Qe(this.h, this.s, this.l * e, this.opacity)
      );
    },
    darker(e) {
      return (
        (e = e == null ? Hr : Math.pow(Hr, e)),
        new Qe(this.h, this.s, this.l * e, this.opacity)
      );
    },
    rgb() {
      var e = (this.h % 360) + (this.h < 0) * 360,
        t = isNaN(e) || isNaN(this.s) ? 0 : this.s,
        r = this.l,
        n = r + (r < 0.5 ? r : 1 - r) * t,
        i = 2 * r - n;
      return new Ae(
        no(e >= 240 ? e - 240 : e + 120, i, n),
        no(e, i, n),
        no(e < 120 ? e + 240 : e - 120, i, n),
        this.opacity
      );
    },
    clamp() {
      return new Qe(gf(this.h), On(this.s), On(this.l), Gn(this.opacity));
    },
    displayable() {
      return (
        ((0 <= this.s && this.s <= 1) || isNaN(this.s)) &&
        0 <= this.l &&
        this.l <= 1 &&
        0 <= this.opacity &&
        this.opacity <= 1
      );
    },
    formatHsl() {
      const e = Gn(this.opacity);
      return `${e === 1 ? 'hsl(' : 'hsla('}${gf(this.h)}, ${On(this.s) * 100}%, ${On(this.l) * 100}%${e === 1 ? ')' : `, ${e})`}`;
    },
  })
);
function gf(e) {
  return ((e = (e || 0) % 360), e < 0 ? e + 360 : e);
}
function On(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function no(e, t, r) {
  return (
    (e < 60 ? t + ((r - t) * e) / 60 : e < 180 ? r : e < 240 ? t + ((r - t) * (240 - e)) / 60 : t) *
    255
  );
}
const rl = (e) => () => e;
function E1(e, t) {
  return function (r) {
    return e + r * t;
  };
}
function _1(e, t, r) {
  return (
    (e = Math.pow(e, r)),
    (t = Math.pow(t, r) - e),
    (r = 1 / r),
    function (n) {
      return Math.pow(e + n * t, r);
    }
  );
}
function T1(e) {
  return (e = +e) == 1
    ? Mv
    : function (t, r) {
        return r - t ? _1(t, r, e) : rl(isNaN(t) ? r : t);
      };
}
function Mv(e, t) {
  var r = t - e;
  return r ? E1(e, r) : rl(isNaN(e) ? t : e);
}
const bf = (function e(t) {
  var r = T1(t);
  function n(i, a) {
    var o = r((i = ru(i)).r, (a = ru(a)).r),
      u = r(i.g, a.g),
      l = r(i.b, a.b),
      s = Mv(i.opacity, a.opacity);
    return function (c) {
      return ((i.r = o(c)), (i.g = u(c)), (i.b = l(c)), (i.opacity = s(c)), i + '');
    };
  }
  return ((n.gamma = e), n);
})(1);
function C1(e, t) {
  t || (t = []);
  var r = e ? Math.min(t.length, e.length) : 0,
    n = t.slice(),
    i;
  return function (a) {
    for (i = 0; i < r; ++i) n[i] = e[i] * (1 - a) + t[i] * a;
    return n;
  };
}
function j1(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function M1(e, t) {
  var r = t ? t.length : 0,
    n = e ? Math.min(r, e.length) : 0,
    i = new Array(n),
    a = new Array(r),
    o;
  for (o = 0; o < n; ++o) i[o] = xr(e[o], t[o]);
  for (; o < r; ++o) a[o] = t[o];
  return function (u) {
    for (o = 0; o < n; ++o) a[o] = i[o](u);
    return a;
  };
}
function k1(e, t) {
  var r = new Date();
  return (
    (e = +e),
    (t = +t),
    function (n) {
      return (r.setTime(e * (1 - n) + t * n), r);
    }
  );
}
function Vn(e, t) {
  return (
    (e = +e),
    (t = +t),
    function (r) {
      return e * (1 - r) + t * r;
    }
  );
}
function I1(e, t) {
  var r = {},
    n = {},
    i;
  ((e === null || typeof e != 'object') && (e = {}),
    (t === null || typeof t != 'object') && (t = {}));
  for (i in t) i in e ? (r[i] = xr(e[i], t[i])) : (n[i] = t[i]);
  return function (a) {
    for (i in r) n[i] = r[i](a);
    return n;
  };
}
var nu = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
  io = new RegExp(nu.source, 'g');
function D1(e) {
  return function () {
    return e;
  };
}
function N1(e) {
  return function (t) {
    return e(t) + '';
  };
}
function $1(e, t) {
  var r = (nu.lastIndex = io.lastIndex = 0),
    n,
    i,
    a,
    o = -1,
    u = [],
    l = [];
  for (e = e + '', t = t + ''; (n = nu.exec(e)) && (i = io.exec(t)); )
    ((a = i.index) > r && ((a = t.slice(r, a)), u[o] ? (u[o] += a) : (u[++o] = a)),
      (n = n[0]) === (i = i[0])
        ? u[o]
          ? (u[o] += i)
          : (u[++o] = i)
        : ((u[++o] = null), l.push({ i: o, x: Vn(n, i) })),
      (r = io.lastIndex));
  return (
    r < t.length && ((a = t.slice(r)), u[o] ? (u[o] += a) : (u[++o] = a)),
    u.length < 2
      ? l[0]
        ? N1(l[0].x)
        : D1(t)
      : ((t = l.length),
        function (s) {
          for (var c = 0, f; c < t; ++c) u[(f = l[c]).i] = f.x(s);
          return u.join('');
        })
  );
}
function xr(e, t) {
  var r = typeof t,
    n;
  return t == null || r === 'boolean'
    ? rl(t)
    : (r === 'number'
        ? Vn
        : r === 'string'
          ? (n = Gr(t))
            ? ((t = n), bf)
            : $1
          : t instanceof Gr
            ? bf
            : t instanceof Date
              ? k1
              : j1(t)
                ? C1
                : Array.isArray(t)
                  ? M1
                  : (typeof t.valueOf != 'function' && typeof t.toString != 'function') || isNaN(t)
                    ? I1
                    : Vn)(e, t);
}
function nl(e, t) {
  return (
    (e = +e),
    (t = +t),
    function (r) {
      return Math.round(e * (1 - r) + t * r);
    }
  );
}
function R1(e, t) {
  t === void 0 && ((t = e), (e = xr));
  for (var r = 0, n = t.length - 1, i = t[0], a = new Array(n < 0 ? 0 : n); r < n; )
    a[r] = e(i, (i = t[++r]));
  return function (o) {
    var u = Math.max(0, Math.min(n - 1, Math.floor((o *= n))));
    return a[u](o - u);
  };
}
function L1(e) {
  return function () {
    return e;
  };
}
function Xn(e) {
  return +e;
}
var wf = [0, 1];
function we(e) {
  return e;
}
function iu(e, t) {
  return (t -= e = +e)
    ? function (r) {
        return (r - e) / t;
      }
    : L1(isNaN(t) ? NaN : 0.5);
}
function B1(e, t) {
  var r;
  return (
    e > t && ((r = e), (e = t), (t = r)),
    function (n) {
      return Math.max(e, Math.min(t, n));
    }
  );
}
function q1(e, t, r) {
  var n = e[0],
    i = e[1],
    a = t[0],
    o = t[1];
  return (
    i < n ? ((n = iu(i, n)), (a = r(o, a))) : ((n = iu(n, i)), (a = r(a, o))),
    function (u) {
      return a(n(u));
    }
  );
}
function z1(e, t, r) {
  var n = Math.min(e.length, t.length) - 1,
    i = new Array(n),
    a = new Array(n),
    o = -1;
  for (e[n] < e[0] && ((e = e.slice().reverse()), (t = t.slice().reverse())); ++o < n; )
    ((i[o] = iu(e[o], e[o + 1])), (a[o] = r(t[o], t[o + 1])));
  return function (u) {
    var l = rn(e, u, 1, n) - 1;
    return a[l](i[l](u));
  };
}
function an(e, t) {
  return t
    .domain(e.domain())
    .range(e.range())
    .interpolate(e.interpolate())
    .clamp(e.clamp())
    .unknown(e.unknown());
}
function Si() {
  var e = wf,
    t = wf,
    r = xr,
    n,
    i,
    a,
    o = we,
    u,
    l,
    s;
  function c() {
    var d = Math.min(e.length, t.length);
    return (o !== we && (o = B1(e[0], e[d - 1])), (u = d > 2 ? z1 : q1), (l = s = null), f);
  }
  function f(d) {
    return d == null || isNaN((d = +d)) ? a : (l || (l = u(e.map(n), t, r)))(n(o(d)));
  }
  return (
    (f.invert = function (d) {
      return o(i((s || (s = u(t, e.map(n), Vn)))(d)));
    }),
    (f.domain = function (d) {
      return arguments.length ? ((e = Array.from(d, Xn)), c()) : e.slice();
    }),
    (f.range = function (d) {
      return arguments.length ? ((t = Array.from(d)), c()) : t.slice();
    }),
    (f.rangeRound = function (d) {
      return ((t = Array.from(d)), (r = nl), c());
    }),
    (f.clamp = function (d) {
      return arguments.length ? ((o = d ? !0 : we), c()) : o !== we;
    }),
    (f.interpolate = function (d) {
      return arguments.length ? ((r = d), c()) : r;
    }),
    (f.unknown = function (d) {
      return arguments.length ? ((a = d), f) : a;
    }),
    function (d, h) {
      return ((n = d), (i = h), c());
    }
  );
}
function il() {
  return Si()(we, we);
}
function F1(e) {
  return Math.abs((e = Math.round(e))) >= 1e21
    ? e.toLocaleString('en').replace(/,/g, '')
    : e.toString(10);
}
function Zn(e, t) {
  if ((r = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf('e')) < 0) return null;
  var r,
    n = e.slice(0, r);
  return [n.length > 1 ? n[0] + n.slice(2) : n, +e.slice(r + 1)];
}
function mr(e) {
  return ((e = Zn(Math.abs(e))), e ? e[1] : NaN);
}
function K1(e, t) {
  return function (r, n) {
    for (
      var i = r.length, a = [], o = 0, u = e[0], l = 0;
      i > 0 &&
      u > 0 &&
      (l + u + 1 > n && (u = Math.max(1, n - l)),
      a.push(r.substring((i -= u), i + u)),
      !((l += u + 1) > n));

    )
      u = e[(o = (o + 1) % e.length)];
    return a.reverse().join(t);
  };
}
function W1(e) {
  return function (t) {
    return t.replace(/[0-9]/g, function (r) {
      return e[+r];
    });
  };
}
var U1 = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function Vr(e) {
  if (!(t = U1.exec(e))) throw new Error('invalid format: ' + e);
  var t;
  return new al({
    fill: t[1],
    align: t[2],
    sign: t[3],
    symbol: t[4],
    zero: t[5],
    width: t[6],
    comma: t[7],
    precision: t[8] && t[8].slice(1),
    trim: t[9],
    type: t[10],
  });
}
Vr.prototype = al.prototype;
function al(e) {
  ((this.fill = e.fill === void 0 ? ' ' : e.fill + ''),
    (this.align = e.align === void 0 ? '>' : e.align + ''),
    (this.sign = e.sign === void 0 ? '-' : e.sign + ''),
    (this.symbol = e.symbol === void 0 ? '' : e.symbol + ''),
    (this.zero = !!e.zero),
    (this.width = e.width === void 0 ? void 0 : +e.width),
    (this.comma = !!e.comma),
    (this.precision = e.precision === void 0 ? void 0 : +e.precision),
    (this.trim = !!e.trim),
    (this.type = e.type === void 0 ? '' : e.type + ''));
}
al.prototype.toString = function () {
  return (
    this.fill +
    this.align +
    this.sign +
    this.symbol +
    (this.zero ? '0' : '') +
    (this.width === void 0 ? '' : Math.max(1, this.width | 0)) +
    (this.comma ? ',' : '') +
    (this.precision === void 0 ? '' : '.' + Math.max(0, this.precision | 0)) +
    (this.trim ? '~' : '') +
    this.type
  );
};
function H1(e) {
  e: for (var t = e.length, r = 1, n = -1, i; r < t; ++r)
    switch (e[r]) {
      case '.':
        n = i = r;
        break;
      case '0':
        (n === 0 && (n = r), (i = r));
        break;
      default:
        if (!+e[r]) break e;
        n > 0 && (n = 0);
        break;
    }
  return n > 0 ? e.slice(0, n) + e.slice(i + 1) : e;
}
var kv;
function Y1(e, t) {
  var r = Zn(e, t);
  if (!r) return e + '';
  var n = r[0],
    i = r[1],
    a = i - (kv = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1,
    o = n.length;
  return a === o
    ? n
    : a > o
      ? n + new Array(a - o + 1).join('0')
      : a > 0
        ? n.slice(0, a) + '.' + n.slice(a)
        : '0.' + new Array(1 - a).join('0') + Zn(e, Math.max(0, t + a - 1))[0];
}
function xf(e, t) {
  var r = Zn(e, t);
  if (!r) return e + '';
  var n = r[0],
    i = r[1];
  return i < 0
    ? '0.' + new Array(-i).join('0') + n
    : n.length > i + 1
      ? n.slice(0, i + 1) + '.' + n.slice(i + 1)
      : n + new Array(i - n.length + 2).join('0');
}
const Pf = {
  '%': (e, t) => (e * 100).toFixed(t),
  b: (e) => Math.round(e).toString(2),
  c: (e) => e + '',
  d: F1,
  e: (e, t) => e.toExponential(t),
  f: (e, t) => e.toFixed(t),
  g: (e, t) => e.toPrecision(t),
  o: (e) => Math.round(e).toString(8),
  p: (e, t) => xf(e * 100, t),
  r: xf,
  s: Y1,
  X: (e) => Math.round(e).toString(16).toUpperCase(),
  x: (e) => Math.round(e).toString(16),
};
function Of(e) {
  return e;
}
var Af = Array.prototype.map,
  Sf = ['y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
function G1(e) {
  var t =
      e.grouping === void 0 || e.thousands === void 0
        ? Of
        : K1(Af.call(e.grouping, Number), e.thousands + ''),
    r = e.currency === void 0 ? '' : e.currency[0] + '',
    n = e.currency === void 0 ? '' : e.currency[1] + '',
    i = e.decimal === void 0 ? '.' : e.decimal + '',
    a = e.numerals === void 0 ? Of : W1(Af.call(e.numerals, String)),
    o = e.percent === void 0 ? '%' : e.percent + '',
    u = e.minus === void 0 ? '−' : e.minus + '',
    l = e.nan === void 0 ? 'NaN' : e.nan + '';
  function s(f) {
    f = Vr(f);
    var d = f.fill,
      h = f.align,
      v = f.sign,
      p = f.symbol,
      m = f.zero,
      g = f.width,
      w = f.comma,
      b = f.precision,
      P = f.trim,
      x = f.type;
    (x === 'n' ? ((w = !0), (x = 'g')) : Pf[x] || (b === void 0 && (b = 12), (P = !0), (x = 'g')),
      (m || (d === '0' && h === '=')) && ((m = !0), (d = '0'), (h = '=')));
    var O = p === '$' ? r : p === '#' && /[boxX]/.test(x) ? '0' + x.toLowerCase() : '',
      S = p === '$' ? n : /[%p]/.test(x) ? o : '',
      _ = Pf[x],
      C = /[defgprs%]/.test(x);
    b =
      b === void 0
        ? 6
        : /[gprs]/.test(x)
          ? Math.max(1, Math.min(21, b))
          : Math.max(0, Math.min(20, b));
    function N(T) {
      var M = O,
        L = S,
        z,
        J,
        H;
      if (x === 'c') ((L = _(T) + L), (T = ''));
      else {
        T = +T;
        var ie = T < 0 || 1 / T < 0;
        if (
          ((T = isNaN(T) ? l : _(Math.abs(T), b)),
          P && (T = H1(T)),
          ie && +T == 0 && v !== '+' && (ie = !1),
          (M = (ie ? (v === '(' ? v : u) : v === '-' || v === '(' ? '' : v) + M),
          (L = (x === 's' ? Sf[8 + kv / 3] : '') + L + (ie && v === '(' ? ')' : '')),
          C)
        ) {
          for (z = -1, J = T.length; ++z < J; )
            if (((H = T.charCodeAt(z)), 48 > H || H > 57)) {
              ((L = (H === 46 ? i + T.slice(z + 1) : T.slice(z)) + L), (T = T.slice(0, z)));
              break;
            }
        }
      }
      w && !m && (T = t(T, 1 / 0));
      var _e = M.length + T.length + L.length,
        ce = _e < g ? new Array(g - _e + 1).join(d) : '';
      switch ((w && m && ((T = t(ce + T, ce.length ? g - L.length : 1 / 0)), (ce = '')), h)) {
        case '<':
          T = M + T + L + ce;
          break;
        case '=':
          T = M + ce + T + L;
          break;
        case '^':
          T = ce.slice(0, (_e = ce.length >> 1)) + M + T + L + ce.slice(_e);
          break;
        default:
          T = ce + M + T + L;
          break;
      }
      return a(T);
    }
    return (
      (N.toString = function () {
        return f + '';
      }),
      N
    );
  }
  function c(f, d) {
    var h = s(((f = Vr(f)), (f.type = 'f'), f)),
      v = Math.max(-8, Math.min(8, Math.floor(mr(d) / 3))) * 3,
      p = Math.pow(10, -v),
      m = Sf[8 + v / 3];
    return function (g) {
      return h(p * g) + m;
    };
  }
  return { format: s, formatPrefix: c };
}
var An, ol, Iv;
V1({ thousands: ',', grouping: [3], currency: ['$', ''] });
function V1(e) {
  return ((An = G1(e)), (ol = An.format), (Iv = An.formatPrefix), An);
}
function X1(e) {
  return Math.max(0, -mr(Math.abs(e)));
}
function Z1(e, t) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(mr(t) / 3))) * 3 - mr(Math.abs(e)));
}
function J1(e, t) {
  return ((e = Math.abs(e)), (t = Math.abs(t) - e), Math.max(0, mr(t) - mr(e)) + 1);
}
function Dv(e, t, r, n) {
  var i = eu(e, t, r),
    a;
  switch (((n = Vr(n ?? ',f')), n.type)) {
    case 's': {
      var o = Math.max(Math.abs(e), Math.abs(t));
      return (n.precision == null && !isNaN((a = Z1(i, o))) && (n.precision = a), Iv(n, o));
    }
    case '':
    case 'e':
    case 'g':
    case 'p':
    case 'r': {
      n.precision == null &&
        !isNaN((a = J1(i, Math.max(Math.abs(e), Math.abs(t))))) &&
        (n.precision = a - (n.type === 'e'));
      break;
    }
    case 'f':
    case '%': {
      n.precision == null && !isNaN((a = X1(i))) && (n.precision = a - (n.type === '%') * 2);
      break;
    }
  }
  return ol(n);
}
function It(e) {
  var t = e.domain;
  return (
    (e.ticks = function (r) {
      var n = t();
      return Jo(n[0], n[n.length - 1], r ?? 10);
    }),
    (e.tickFormat = function (r, n) {
      var i = t();
      return Dv(i[0], i[i.length - 1], r ?? 10, n);
    }),
    (e.nice = function (r) {
      r == null && (r = 10);
      var n = t(),
        i = 0,
        a = n.length - 1,
        o = n[i],
        u = n[a],
        l,
        s,
        c = 10;
      for (u < o && ((s = o), (o = u), (u = s), (s = i), (i = a), (a = s)); c-- > 0; ) {
        if (((s = Qo(o, u, r)), s === l)) return ((n[i] = o), (n[a] = u), t(n));
        if (s > 0) ((o = Math.floor(o / s) * s), (u = Math.ceil(u / s) * s));
        else if (s < 0) ((o = Math.ceil(o * s) / s), (u = Math.floor(u * s) / s));
        else break;
        l = s;
      }
      return e;
    }),
    e
  );
}
function Nv() {
  var e = il();
  return (
    (e.copy = function () {
      return an(e, Nv());
    }),
    Ve.apply(e, arguments),
    It(e)
  );
}
function $v(e) {
  var t;
  function r(n) {
    return n == null || isNaN((n = +n)) ? t : n;
  }
  return (
    (r.invert = r),
    (r.domain = r.range =
      function (n) {
        return arguments.length ? ((e = Array.from(n, Xn)), r) : e.slice();
      }),
    (r.unknown = function (n) {
      return arguments.length ? ((t = n), r) : t;
    }),
    (r.copy = function () {
      return $v(e).unknown(t);
    }),
    (e = arguments.length ? Array.from(e, Xn) : [0, 1]),
    It(r)
  );
}
function Rv(e, t) {
  e = e.slice();
  var r = 0,
    n = e.length - 1,
    i = e[r],
    a = e[n],
    o;
  return (
    a < i && ((o = r), (r = n), (n = o), (o = i), (i = a), (a = o)),
    (e[r] = t.floor(i)),
    (e[n] = t.ceil(a)),
    e
  );
}
function Ef(e) {
  return Math.log(e);
}
function _f(e) {
  return Math.exp(e);
}
function Q1(e) {
  return -Math.log(-e);
}
function eP(e) {
  return -Math.exp(-e);
}
function tP(e) {
  return isFinite(e) ? +('1e' + e) : e < 0 ? 0 : e;
}
function rP(e) {
  return e === 10 ? tP : e === Math.E ? Math.exp : (t) => Math.pow(e, t);
}
function nP(e) {
  return e === Math.E
    ? Math.log
    : (e === 10 && Math.log10) ||
        (e === 2 && Math.log2) ||
        ((e = Math.log(e)), (t) => Math.log(t) / e);
}
function Tf(e) {
  return (t, r) => -e(-t, r);
}
function ul(e) {
  const t = e(Ef, _f),
    r = t.domain;
  let n = 10,
    i,
    a;
  function o() {
    return (
      (i = nP(n)),
      (a = rP(n)),
      r()[0] < 0 ? ((i = Tf(i)), (a = Tf(a)), e(Q1, eP)) : e(Ef, _f),
      t
    );
  }
  return (
    (t.base = function (u) {
      return arguments.length ? ((n = +u), o()) : n;
    }),
    (t.domain = function (u) {
      return arguments.length ? (r(u), o()) : r();
    }),
    (t.ticks = (u) => {
      const l = r();
      let s = l[0],
        c = l[l.length - 1];
      const f = c < s;
      f && ([s, c] = [c, s]);
      let d = i(s),
        h = i(c),
        v,
        p;
      const m = u == null ? 10 : +u;
      let g = [];
      if (!(n % 1) && h - d < m) {
        if (((d = Math.floor(d)), (h = Math.ceil(h)), s > 0)) {
          for (; d <= h; ++d)
            for (v = 1; v < n; ++v)
              if (((p = d < 0 ? v / a(-d) : v * a(d)), !(p < s))) {
                if (p > c) break;
                g.push(p);
              }
        } else
          for (; d <= h; ++d)
            for (v = n - 1; v >= 1; --v)
              if (((p = d > 0 ? v / a(-d) : v * a(d)), !(p < s))) {
                if (p > c) break;
                g.push(p);
              }
        g.length * 2 < m && (g = Jo(s, c, m));
      } else g = Jo(d, h, Math.min(h - d, m)).map(a);
      return f ? g.reverse() : g;
    }),
    (t.tickFormat = (u, l) => {
      if (
        (u == null && (u = 10),
        l == null && (l = n === 10 ? 's' : ','),
        typeof l != 'function' &&
          (!(n % 1) && (l = Vr(l)).precision == null && (l.trim = !0), (l = ol(l))),
        u === 1 / 0)
      )
        return l;
      const s = Math.max(1, (n * u) / t.ticks().length);
      return (c) => {
        let f = c / a(Math.round(i(c)));
        return (f * n < n - 0.5 && (f *= n), f <= s ? l(c) : '');
      };
    }),
    (t.nice = () =>
      r(Rv(r(), { floor: (u) => a(Math.floor(i(u))), ceil: (u) => a(Math.ceil(i(u))) }))),
    t
  );
}
function Lv() {
  const e = ul(Si()).domain([1, 10]);
  return ((e.copy = () => an(e, Lv()).base(e.base())), Ve.apply(e, arguments), e);
}
function Cf(e) {
  return function (t) {
    return Math.sign(t) * Math.log1p(Math.abs(t / e));
  };
}
function jf(e) {
  return function (t) {
    return Math.sign(t) * Math.expm1(Math.abs(t)) * e;
  };
}
function ll(e) {
  var t = 1,
    r = e(Cf(t), jf(t));
  return (
    (r.constant = function (n) {
      return arguments.length ? e(Cf((t = +n)), jf(t)) : t;
    }),
    It(r)
  );
}
function Bv() {
  var e = ll(Si());
  return (
    (e.copy = function () {
      return an(e, Bv()).constant(e.constant());
    }),
    Ve.apply(e, arguments)
  );
}
function Mf(e) {
  return function (t) {
    return t < 0 ? -Math.pow(-t, e) : Math.pow(t, e);
  };
}
function iP(e) {
  return e < 0 ? -Math.sqrt(-e) : Math.sqrt(e);
}
function aP(e) {
  return e < 0 ? -e * e : e * e;
}
function cl(e) {
  var t = e(we, we),
    r = 1;
  function n() {
    return r === 1 ? e(we, we) : r === 0.5 ? e(iP, aP) : e(Mf(r), Mf(1 / r));
  }
  return (
    (t.exponent = function (i) {
      return arguments.length ? ((r = +i), n()) : r;
    }),
    It(t)
  );
}
function sl() {
  var e = cl(Si());
  return (
    (e.copy = function () {
      return an(e, sl()).exponent(e.exponent());
    }),
    Ve.apply(e, arguments),
    e
  );
}
function oP() {
  return sl.apply(null, arguments).exponent(0.5);
}
function kf(e) {
  return Math.sign(e) * e * e;
}
function uP(e) {
  return Math.sign(e) * Math.sqrt(Math.abs(e));
}
function qv() {
  var e = il(),
    t = [0, 1],
    r = !1,
    n;
  function i(a) {
    var o = uP(e(a));
    return isNaN(o) ? n : r ? Math.round(o) : o;
  }
  return (
    (i.invert = function (a) {
      return e.invert(kf(a));
    }),
    (i.domain = function (a) {
      return arguments.length ? (e.domain(a), i) : e.domain();
    }),
    (i.range = function (a) {
      return arguments.length ? (e.range((t = Array.from(a, Xn)).map(kf)), i) : t.slice();
    }),
    (i.rangeRound = function (a) {
      return i.range(a).round(!0);
    }),
    (i.round = function (a) {
      return arguments.length ? ((r = !!a), i) : r;
    }),
    (i.clamp = function (a) {
      return arguments.length ? (e.clamp(a), i) : e.clamp();
    }),
    (i.unknown = function (a) {
      return arguments.length ? ((n = a), i) : n;
    }),
    (i.copy = function () {
      return qv(e.domain(), t).round(r).clamp(e.clamp()).unknown(n);
    }),
    Ve.apply(i, arguments),
    It(i)
  );
}
function zv() {
  var e = [],
    t = [],
    r = [],
    n;
  function i() {
    var o = 0,
      u = Math.max(1, t.length);
    for (r = new Array(u - 1); ++o < u; ) r[o - 1] = f1(e, o / u);
    return a;
  }
  function a(o) {
    return o == null || isNaN((o = +o)) ? n : t[rn(r, o)];
  }
  return (
    (a.invertExtent = function (o) {
      var u = t.indexOf(o);
      return u < 0 ? [NaN, NaN] : [u > 0 ? r[u - 1] : e[0], u < r.length ? r[u] : e[e.length - 1]];
    }),
    (a.domain = function (o) {
      if (!arguments.length) return e.slice();
      e = [];
      for (let u of o) u != null && !isNaN((u = +u)) && e.push(u);
      return (e.sort(Tt), i());
    }),
    (a.range = function (o) {
      return arguments.length ? ((t = Array.from(o)), i()) : t.slice();
    }),
    (a.unknown = function (o) {
      return arguments.length ? ((n = o), a) : n;
    }),
    (a.quantiles = function () {
      return r.slice();
    }),
    (a.copy = function () {
      return zv().domain(e).range(t).unknown(n);
    }),
    Ve.apply(a, arguments)
  );
}
function Fv() {
  var e = 0,
    t = 1,
    r = 1,
    n = [0.5],
    i = [0, 1],
    a;
  function o(l) {
    return l != null && l <= l ? i[rn(n, l, 0, r)] : a;
  }
  function u() {
    var l = -1;
    for (n = new Array(r); ++l < r; ) n[l] = ((l + 1) * t - (l - r) * e) / (r + 1);
    return o;
  }
  return (
    (o.domain = function (l) {
      return arguments.length ? (([e, t] = l), (e = +e), (t = +t), u()) : [e, t];
    }),
    (o.range = function (l) {
      return arguments.length ? ((r = (i = Array.from(l)).length - 1), u()) : i.slice();
    }),
    (o.invertExtent = function (l) {
      var s = i.indexOf(l);
      return s < 0 ? [NaN, NaN] : s < 1 ? [e, n[0]] : s >= r ? [n[r - 1], t] : [n[s - 1], n[s]];
    }),
    (o.unknown = function (l) {
      return (arguments.length && (a = l), o);
    }),
    (o.thresholds = function () {
      return n.slice();
    }),
    (o.copy = function () {
      return Fv().domain([e, t]).range(i).unknown(a);
    }),
    Ve.apply(It(o), arguments)
  );
}
function Kv() {
  var e = [0.5],
    t = [0, 1],
    r,
    n = 1;
  function i(a) {
    return a != null && a <= a ? t[rn(e, a, 0, n)] : r;
  }
  return (
    (i.domain = function (a) {
      return arguments.length
        ? ((e = Array.from(a)), (n = Math.min(e.length, t.length - 1)), i)
        : e.slice();
    }),
    (i.range = function (a) {
      return arguments.length
        ? ((t = Array.from(a)), (n = Math.min(e.length, t.length - 1)), i)
        : t.slice();
    }),
    (i.invertExtent = function (a) {
      var o = t.indexOf(a);
      return [e[o - 1], e[o]];
    }),
    (i.unknown = function (a) {
      return arguments.length ? ((r = a), i) : r;
    }),
    (i.copy = function () {
      return Kv().domain(e).range(t).unknown(r);
    }),
    Ve.apply(i, arguments)
  );
}
const ao = new Date(),
  oo = new Date();
function oe(e, t, r, n) {
  function i(a) {
    return (e((a = arguments.length === 0 ? new Date() : new Date(+a))), a);
  }
  return (
    (i.floor = (a) => (e((a = new Date(+a))), a)),
    (i.ceil = (a) => (e((a = new Date(a - 1))), t(a, 1), e(a), a)),
    (i.round = (a) => {
      const o = i(a),
        u = i.ceil(a);
      return a - o < u - a ? o : u;
    }),
    (i.offset = (a, o) => (t((a = new Date(+a)), o == null ? 1 : Math.floor(o)), a)),
    (i.range = (a, o, u) => {
      const l = [];
      if (((a = i.ceil(a)), (u = u == null ? 1 : Math.floor(u)), !(a < o) || !(u > 0))) return l;
      let s;
      do (l.push((s = new Date(+a))), t(a, u), e(a));
      while (s < a && a < o);
      return l;
    }),
    (i.filter = (a) =>
      oe(
        (o) => {
          if (o >= o) for (; e(o), !a(o); ) o.setTime(o - 1);
        },
        (o, u) => {
          if (o >= o)
            if (u < 0) for (; ++u <= 0; ) for (; t(o, -1), !a(o); );
            else for (; --u >= 0; ) for (; t(o, 1), !a(o); );
        }
      )),
    r &&
      ((i.count = (a, o) => (ao.setTime(+a), oo.setTime(+o), e(ao), e(oo), Math.floor(r(ao, oo)))),
      (i.every = (a) => (
        (a = Math.floor(a)),
        !isFinite(a) || !(a > 0)
          ? null
          : a > 1
            ? i.filter(n ? (o) => n(o) % a === 0 : (o) => i.count(0, o) % a === 0)
            : i
      ))),
    i
  );
}
const Jn = oe(
  () => {},
  (e, t) => {
    e.setTime(+e + t);
  },
  (e, t) => t - e
);
Jn.every = (e) => (
  (e = Math.floor(e)),
  !isFinite(e) || !(e > 0)
    ? null
    : e > 1
      ? oe(
          (t) => {
            t.setTime(Math.floor(t / e) * e);
          },
          (t, r) => {
            t.setTime(+t + r * e);
          },
          (t, r) => (r - t) / e
        )
      : Jn
);
Jn.range;
const st = 1e3,
  He = st * 60,
  ft = He * 60,
  mt = ft * 24,
  fl = mt * 7,
  If = mt * 30,
  uo = mt * 365,
  Ut = oe(
    (e) => {
      e.setTime(e - e.getMilliseconds());
    },
    (e, t) => {
      e.setTime(+e + t * st);
    },
    (e, t) => (t - e) / st,
    (e) => e.getUTCSeconds()
  );
Ut.range;
const dl = oe(
  (e) => {
    e.setTime(e - e.getMilliseconds() - e.getSeconds() * st);
  },
  (e, t) => {
    e.setTime(+e + t * He);
  },
  (e, t) => (t - e) / He,
  (e) => e.getMinutes()
);
dl.range;
const hl = oe(
  (e) => {
    e.setUTCSeconds(0, 0);
  },
  (e, t) => {
    e.setTime(+e + t * He);
  },
  (e, t) => (t - e) / He,
  (e) => e.getUTCMinutes()
);
hl.range;
const vl = oe(
  (e) => {
    e.setTime(e - e.getMilliseconds() - e.getSeconds() * st - e.getMinutes() * He);
  },
  (e, t) => {
    e.setTime(+e + t * ft);
  },
  (e, t) => (t - e) / ft,
  (e) => e.getHours()
);
vl.range;
const pl = oe(
  (e) => {
    e.setUTCMinutes(0, 0, 0);
  },
  (e, t) => {
    e.setTime(+e + t * ft);
  },
  (e, t) => (t - e) / ft,
  (e) => e.getUTCHours()
);
pl.range;
const on = oe(
  (e) => e.setHours(0, 0, 0, 0),
  (e, t) => e.setDate(e.getDate() + t),
  (e, t) => (t - e - (t.getTimezoneOffset() - e.getTimezoneOffset()) * He) / mt,
  (e) => e.getDate() - 1
);
on.range;
const Ei = oe(
  (e) => {
    e.setUTCHours(0, 0, 0, 0);
  },
  (e, t) => {
    e.setUTCDate(e.getUTCDate() + t);
  },
  (e, t) => (t - e) / mt,
  (e) => e.getUTCDate() - 1
);
Ei.range;
const Wv = oe(
  (e) => {
    e.setUTCHours(0, 0, 0, 0);
  },
  (e, t) => {
    e.setUTCDate(e.getUTCDate() + t);
  },
  (e, t) => (t - e) / mt,
  (e) => Math.floor(e / mt)
);
Wv.range;
function nr(e) {
  return oe(
    (t) => {
      (t.setDate(t.getDate() - ((t.getDay() + 7 - e) % 7)), t.setHours(0, 0, 0, 0));
    },
    (t, r) => {
      t.setDate(t.getDate() + r * 7);
    },
    (t, r) => (r - t - (r.getTimezoneOffset() - t.getTimezoneOffset()) * He) / fl
  );
}
const _i = nr(0),
  Qn = nr(1),
  lP = nr(2),
  cP = nr(3),
  yr = nr(4),
  sP = nr(5),
  fP = nr(6);
_i.range;
Qn.range;
lP.range;
cP.range;
yr.range;
sP.range;
fP.range;
function ir(e) {
  return oe(
    (t) => {
      (t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 7 - e) % 7)), t.setUTCHours(0, 0, 0, 0));
    },
    (t, r) => {
      t.setUTCDate(t.getUTCDate() + r * 7);
    },
    (t, r) => (r - t) / fl
  );
}
const Ti = ir(0),
  ei = ir(1),
  dP = ir(2),
  hP = ir(3),
  gr = ir(4),
  vP = ir(5),
  pP = ir(6);
Ti.range;
ei.range;
dP.range;
hP.range;
gr.range;
vP.range;
pP.range;
const ml = oe(
  (e) => {
    (e.setDate(1), e.setHours(0, 0, 0, 0));
  },
  (e, t) => {
    e.setMonth(e.getMonth() + t);
  },
  (e, t) => t.getMonth() - e.getMonth() + (t.getFullYear() - e.getFullYear()) * 12,
  (e) => e.getMonth()
);
ml.range;
const yl = oe(
  (e) => {
    (e.setUTCDate(1), e.setUTCHours(0, 0, 0, 0));
  },
  (e, t) => {
    e.setUTCMonth(e.getUTCMonth() + t);
  },
  (e, t) => t.getUTCMonth() - e.getUTCMonth() + (t.getUTCFullYear() - e.getUTCFullYear()) * 12,
  (e) => e.getUTCMonth()
);
yl.range;
const yt = oe(
  (e) => {
    (e.setMonth(0, 1), e.setHours(0, 0, 0, 0));
  },
  (e, t) => {
    e.setFullYear(e.getFullYear() + t);
  },
  (e, t) => t.getFullYear() - e.getFullYear(),
  (e) => e.getFullYear()
);
yt.every = (e) =>
  !isFinite((e = Math.floor(e))) || !(e > 0)
    ? null
    : oe(
        (t) => {
          (t.setFullYear(Math.floor(t.getFullYear() / e) * e),
            t.setMonth(0, 1),
            t.setHours(0, 0, 0, 0));
        },
        (t, r) => {
          t.setFullYear(t.getFullYear() + r * e);
        }
      );
yt.range;
const gt = oe(
  (e) => {
    (e.setUTCMonth(0, 1), e.setUTCHours(0, 0, 0, 0));
  },
  (e, t) => {
    e.setUTCFullYear(e.getUTCFullYear() + t);
  },
  (e, t) => t.getUTCFullYear() - e.getUTCFullYear(),
  (e) => e.getUTCFullYear()
);
gt.every = (e) =>
  !isFinite((e = Math.floor(e))) || !(e > 0)
    ? null
    : oe(
        (t) => {
          (t.setUTCFullYear(Math.floor(t.getUTCFullYear() / e) * e),
            t.setUTCMonth(0, 1),
            t.setUTCHours(0, 0, 0, 0));
        },
        (t, r) => {
          t.setUTCFullYear(t.getUTCFullYear() + r * e);
        }
      );
gt.range;
function Uv(e, t, r, n, i, a) {
  const o = [
    [Ut, 1, st],
    [Ut, 5, 5 * st],
    [Ut, 15, 15 * st],
    [Ut, 30, 30 * st],
    [a, 1, He],
    [a, 5, 5 * He],
    [a, 15, 15 * He],
    [a, 30, 30 * He],
    [i, 1, ft],
    [i, 3, 3 * ft],
    [i, 6, 6 * ft],
    [i, 12, 12 * ft],
    [n, 1, mt],
    [n, 2, 2 * mt],
    [r, 1, fl],
    [t, 1, If],
    [t, 3, 3 * If],
    [e, 1, uo],
  ];
  function u(s, c, f) {
    const d = c < s;
    d && ([s, c] = [c, s]);
    const h = f && typeof f.range == 'function' ? f : l(s, c, f),
      v = h ? h.range(s, +c + 1) : [];
    return d ? v.reverse() : v;
  }
  function l(s, c, f) {
    const d = Math.abs(c - s) / f,
      h = Ju(([, , m]) => m).right(o, d);
    if (h === o.length) return e.every(eu(s / uo, c / uo, f));
    if (h === 0) return Jn.every(Math.max(eu(s, c, f), 1));
    const [v, p] = o[d / o[h - 1][2] < o[h][2] / d ? h - 1 : h];
    return v.every(p);
  }
  return [u, l];
}
const [mP, yP] = Uv(gt, yl, Ti, Wv, pl, hl),
  [gP, bP] = Uv(yt, ml, _i, on, vl, dl);
function lo(e) {
  if (0 <= e.y && e.y < 100) {
    var t = new Date(-1, e.m, e.d, e.H, e.M, e.S, e.L);
    return (t.setFullYear(e.y), t);
  }
  return new Date(e.y, e.m, e.d, e.H, e.M, e.S, e.L);
}
function co(e) {
  if (0 <= e.y && e.y < 100) {
    var t = new Date(Date.UTC(-1, e.m, e.d, e.H, e.M, e.S, e.L));
    return (t.setUTCFullYear(e.y), t);
  }
  return new Date(Date.UTC(e.y, e.m, e.d, e.H, e.M, e.S, e.L));
}
function Ir(e, t, r) {
  return { y: e, m: t, d: r, H: 0, M: 0, S: 0, L: 0 };
}
function wP(e) {
  var t = e.dateTime,
    r = e.date,
    n = e.time,
    i = e.periods,
    a = e.days,
    o = e.shortDays,
    u = e.months,
    l = e.shortMonths,
    s = Dr(i),
    c = Nr(i),
    f = Dr(a),
    d = Nr(a),
    h = Dr(o),
    v = Nr(o),
    p = Dr(u),
    m = Nr(u),
    g = Dr(l),
    w = Nr(l),
    b = {
      a: ie,
      A: _e,
      b: ce,
      B: or,
      c: null,
      d: Bf,
      e: Bf,
      f: KP,
      g: QP,
      G: tO,
      H: qP,
      I: zP,
      j: FP,
      L: Hv,
      m: WP,
      M: UP,
      p: ur,
      q: $,
      Q: Ff,
      s: Kf,
      S: HP,
      u: YP,
      U: GP,
      V: VP,
      w: XP,
      W: ZP,
      x: null,
      X: null,
      y: JP,
      Y: eO,
      Z: rO,
      '%': zf,
    },
    P = {
      a: Ui,
      A: Hi,
      b: Be,
      B: Ty,
      c: null,
      d: qf,
      e: qf,
      f: oO,
      g: mO,
      G: gO,
      H: nO,
      I: iO,
      j: aO,
      L: Gv,
      m: uO,
      M: lO,
      p: Cy,
      q: jy,
      Q: Ff,
      s: Kf,
      S: cO,
      u: sO,
      U: fO,
      V: dO,
      w: hO,
      W: vO,
      x: null,
      X: null,
      y: pO,
      Y: yO,
      Z: bO,
      '%': zf,
    },
    x = {
      a: N,
      A: T,
      b: M,
      B: L,
      c: z,
      d: Rf,
      e: Rf,
      f: $P,
      g: $f,
      G: Nf,
      H: Lf,
      I: Lf,
      j: kP,
      L: NP,
      m: MP,
      M: IP,
      p: C,
      q: jP,
      Q: LP,
      s: BP,
      S: DP,
      u: SP,
      U: EP,
      V: _P,
      w: AP,
      W: TP,
      x: J,
      X: H,
      y: $f,
      Y: Nf,
      Z: CP,
      '%': RP,
    };
  ((b.x = O(r, b)),
    (b.X = O(n, b)),
    (b.c = O(t, b)),
    (P.x = O(r, P)),
    (P.X = O(n, P)),
    (P.c = O(t, P)));
  function O(I, R) {
    return function (B) {
      var E = [],
        Pe = -1,
        G = 0,
        Te = I.length,
        Ce,
        Lt,
        oc;
      for (B instanceof Date || (B = new Date(+B)); ++Pe < Te; )
        I.charCodeAt(Pe) === 37 &&
          (E.push(I.slice(G, Pe)),
          (Lt = Df[(Ce = I.charAt(++Pe))]) != null
            ? (Ce = I.charAt(++Pe))
            : (Lt = Ce === 'e' ? ' ' : '0'),
          (oc = R[Ce]) && (Ce = oc(B, Lt)),
          E.push(Ce),
          (G = Pe + 1));
      return (E.push(I.slice(G, Pe)), E.join(''));
    };
  }
  function S(I, R) {
    return function (B) {
      var E = Ir(1900, void 0, 1),
        Pe = _(E, I, (B += ''), 0),
        G,
        Te;
      if (Pe != B.length) return null;
      if ('Q' in E) return new Date(E.Q);
      if ('s' in E) return new Date(E.s * 1e3 + ('L' in E ? E.L : 0));
      if (
        (R && !('Z' in E) && (E.Z = 0),
        'p' in E && (E.H = (E.H % 12) + E.p * 12),
        E.m === void 0 && (E.m = 'q' in E ? E.q : 0),
        'V' in E)
      ) {
        if (E.V < 1 || E.V > 53) return null;
        ('w' in E || (E.w = 1),
          'Z' in E
            ? ((G = co(Ir(E.y, 0, 1))),
              (Te = G.getUTCDay()),
              (G = Te > 4 || Te === 0 ? ei.ceil(G) : ei(G)),
              (G = Ei.offset(G, (E.V - 1) * 7)),
              (E.y = G.getUTCFullYear()),
              (E.m = G.getUTCMonth()),
              (E.d = G.getUTCDate() + ((E.w + 6) % 7)))
            : ((G = lo(Ir(E.y, 0, 1))),
              (Te = G.getDay()),
              (G = Te > 4 || Te === 0 ? Qn.ceil(G) : Qn(G)),
              (G = on.offset(G, (E.V - 1) * 7)),
              (E.y = G.getFullYear()),
              (E.m = G.getMonth()),
              (E.d = G.getDate() + ((E.w + 6) % 7))));
      } else
        ('W' in E || 'U' in E) &&
          ('w' in E || (E.w = 'u' in E ? E.u % 7 : 'W' in E ? 1 : 0),
          (Te = 'Z' in E ? co(Ir(E.y, 0, 1)).getUTCDay() : lo(Ir(E.y, 0, 1)).getDay()),
          (E.m = 0),
          (E.d =
            'W' in E
              ? ((E.w + 6) % 7) + E.W * 7 - ((Te + 5) % 7)
              : E.w + E.U * 7 - ((Te + 6) % 7)));
      return 'Z' in E ? ((E.H += (E.Z / 100) | 0), (E.M += E.Z % 100), co(E)) : lo(E);
    };
  }
  function _(I, R, B, E) {
    for (var Pe = 0, G = R.length, Te = B.length, Ce, Lt; Pe < G; ) {
      if (E >= Te) return -1;
      if (((Ce = R.charCodeAt(Pe++)), Ce === 37)) {
        if (
          ((Ce = R.charAt(Pe++)),
          (Lt = x[Ce in Df ? R.charAt(Pe++) : Ce]),
          !Lt || (E = Lt(I, B, E)) < 0)
        )
          return -1;
      } else if (Ce != B.charCodeAt(E++)) return -1;
    }
    return E;
  }
  function C(I, R, B) {
    var E = s.exec(R.slice(B));
    return E ? ((I.p = c.get(E[0].toLowerCase())), B + E[0].length) : -1;
  }
  function N(I, R, B) {
    var E = h.exec(R.slice(B));
    return E ? ((I.w = v.get(E[0].toLowerCase())), B + E[0].length) : -1;
  }
  function T(I, R, B) {
    var E = f.exec(R.slice(B));
    return E ? ((I.w = d.get(E[0].toLowerCase())), B + E[0].length) : -1;
  }
  function M(I, R, B) {
    var E = g.exec(R.slice(B));
    return E ? ((I.m = w.get(E[0].toLowerCase())), B + E[0].length) : -1;
  }
  function L(I, R, B) {
    var E = p.exec(R.slice(B));
    return E ? ((I.m = m.get(E[0].toLowerCase())), B + E[0].length) : -1;
  }
  function z(I, R, B) {
    return _(I, t, R, B);
  }
  function J(I, R, B) {
    return _(I, r, R, B);
  }
  function H(I, R, B) {
    return _(I, n, R, B);
  }
  function ie(I) {
    return o[I.getDay()];
  }
  function _e(I) {
    return a[I.getDay()];
  }
  function ce(I) {
    return l[I.getMonth()];
  }
  function or(I) {
    return u[I.getMonth()];
  }
  function ur(I) {
    return i[+(I.getHours() >= 12)];
  }
  function $(I) {
    return 1 + ~~(I.getMonth() / 3);
  }
  function Ui(I) {
    return o[I.getUTCDay()];
  }
  function Hi(I) {
    return a[I.getUTCDay()];
  }
  function Be(I) {
    return l[I.getUTCMonth()];
  }
  function Ty(I) {
    return u[I.getUTCMonth()];
  }
  function Cy(I) {
    return i[+(I.getUTCHours() >= 12)];
  }
  function jy(I) {
    return 1 + ~~(I.getUTCMonth() / 3);
  }
  return {
    format: function (I) {
      var R = O((I += ''), b);
      return (
        (R.toString = function () {
          return I;
        }),
        R
      );
    },
    parse: function (I) {
      var R = S((I += ''), !1);
      return (
        (R.toString = function () {
          return I;
        }),
        R
      );
    },
    utcFormat: function (I) {
      var R = O((I += ''), P);
      return (
        (R.toString = function () {
          return I;
        }),
        R
      );
    },
    utcParse: function (I) {
      var R = S((I += ''), !0);
      return (
        (R.toString = function () {
          return I;
        }),
        R
      );
    },
  };
}
var Df = { '-': '', _: ' ', 0: '0' },
  fe = /^\s*\d+/,
  xP = /^%/,
  PP = /[\\^$*+?|[\]().{}]/g;
function q(e, t, r) {
  var n = e < 0 ? '-' : '',
    i = (n ? -e : e) + '',
    a = i.length;
  return n + (a < r ? new Array(r - a + 1).join(t) + i : i);
}
function OP(e) {
  return e.replace(PP, '\\$&');
}
function Dr(e) {
  return new RegExp('^(?:' + e.map(OP).join('|') + ')', 'i');
}
function Nr(e) {
  return new Map(e.map((t, r) => [t.toLowerCase(), r]));
}
function AP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 1));
  return n ? ((e.w = +n[0]), r + n[0].length) : -1;
}
function SP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 1));
  return n ? ((e.u = +n[0]), r + n[0].length) : -1;
}
function EP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.U = +n[0]), r + n[0].length) : -1;
}
function _P(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.V = +n[0]), r + n[0].length) : -1;
}
function TP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.W = +n[0]), r + n[0].length) : -1;
}
function Nf(e, t, r) {
  var n = fe.exec(t.slice(r, r + 4));
  return n ? ((e.y = +n[0]), r + n[0].length) : -1;
}
function $f(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3)), r + n[0].length) : -1;
}
function CP(e, t, r) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(r, r + 6));
  return n ? ((e.Z = n[1] ? 0 : -(n[2] + (n[3] || '00'))), r + n[0].length) : -1;
}
function jP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 1));
  return n ? ((e.q = n[0] * 3 - 3), r + n[0].length) : -1;
}
function MP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.m = n[0] - 1), r + n[0].length) : -1;
}
function Rf(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.d = +n[0]), r + n[0].length) : -1;
}
function kP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 3));
  return n ? ((e.m = 0), (e.d = +n[0]), r + n[0].length) : -1;
}
function Lf(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.H = +n[0]), r + n[0].length) : -1;
}
function IP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.M = +n[0]), r + n[0].length) : -1;
}
function DP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 2));
  return n ? ((e.S = +n[0]), r + n[0].length) : -1;
}
function NP(e, t, r) {
  var n = fe.exec(t.slice(r, r + 3));
  return n ? ((e.L = +n[0]), r + n[0].length) : -1;
}
function $P(e, t, r) {
  var n = fe.exec(t.slice(r, r + 6));
  return n ? ((e.L = Math.floor(n[0] / 1e3)), r + n[0].length) : -1;
}
function RP(e, t, r) {
  var n = xP.exec(t.slice(r, r + 1));
  return n ? r + n[0].length : -1;
}
function LP(e, t, r) {
  var n = fe.exec(t.slice(r));
  return n ? ((e.Q = +n[0]), r + n[0].length) : -1;
}
function BP(e, t, r) {
  var n = fe.exec(t.slice(r));
  return n ? ((e.s = +n[0]), r + n[0].length) : -1;
}
function Bf(e, t) {
  return q(e.getDate(), t, 2);
}
function qP(e, t) {
  return q(e.getHours(), t, 2);
}
function zP(e, t) {
  return q(e.getHours() % 12 || 12, t, 2);
}
function FP(e, t) {
  return q(1 + on.count(yt(e), e), t, 3);
}
function Hv(e, t) {
  return q(e.getMilliseconds(), t, 3);
}
function KP(e, t) {
  return Hv(e, t) + '000';
}
function WP(e, t) {
  return q(e.getMonth() + 1, t, 2);
}
function UP(e, t) {
  return q(e.getMinutes(), t, 2);
}
function HP(e, t) {
  return q(e.getSeconds(), t, 2);
}
function YP(e) {
  var t = e.getDay();
  return t === 0 ? 7 : t;
}
function GP(e, t) {
  return q(_i.count(yt(e) - 1, e), t, 2);
}
function Yv(e) {
  var t = e.getDay();
  return t >= 4 || t === 0 ? yr(e) : yr.ceil(e);
}
function VP(e, t) {
  return ((e = Yv(e)), q(yr.count(yt(e), e) + (yt(e).getDay() === 4), t, 2));
}
function XP(e) {
  return e.getDay();
}
function ZP(e, t) {
  return q(Qn.count(yt(e) - 1, e), t, 2);
}
function JP(e, t) {
  return q(e.getFullYear() % 100, t, 2);
}
function QP(e, t) {
  return ((e = Yv(e)), q(e.getFullYear() % 100, t, 2));
}
function eO(e, t) {
  return q(e.getFullYear() % 1e4, t, 4);
}
function tO(e, t) {
  var r = e.getDay();
  return ((e = r >= 4 || r === 0 ? yr(e) : yr.ceil(e)), q(e.getFullYear() % 1e4, t, 4));
}
function rO(e) {
  var t = e.getTimezoneOffset();
  return (t > 0 ? '-' : ((t *= -1), '+')) + q((t / 60) | 0, '0', 2) + q(t % 60, '0', 2);
}
function qf(e, t) {
  return q(e.getUTCDate(), t, 2);
}
function nO(e, t) {
  return q(e.getUTCHours(), t, 2);
}
function iO(e, t) {
  return q(e.getUTCHours() % 12 || 12, t, 2);
}
function aO(e, t) {
  return q(1 + Ei.count(gt(e), e), t, 3);
}
function Gv(e, t) {
  return q(e.getUTCMilliseconds(), t, 3);
}
function oO(e, t) {
  return Gv(e, t) + '000';
}
function uO(e, t) {
  return q(e.getUTCMonth() + 1, t, 2);
}
function lO(e, t) {
  return q(e.getUTCMinutes(), t, 2);
}
function cO(e, t) {
  return q(e.getUTCSeconds(), t, 2);
}
function sO(e) {
  var t = e.getUTCDay();
  return t === 0 ? 7 : t;
}
function fO(e, t) {
  return q(Ti.count(gt(e) - 1, e), t, 2);
}
function Vv(e) {
  var t = e.getUTCDay();
  return t >= 4 || t === 0 ? gr(e) : gr.ceil(e);
}
function dO(e, t) {
  return ((e = Vv(e)), q(gr.count(gt(e), e) + (gt(e).getUTCDay() === 4), t, 2));
}
function hO(e) {
  return e.getUTCDay();
}
function vO(e, t) {
  return q(ei.count(gt(e) - 1, e), t, 2);
}
function pO(e, t) {
  return q(e.getUTCFullYear() % 100, t, 2);
}
function mO(e, t) {
  return ((e = Vv(e)), q(e.getUTCFullYear() % 100, t, 2));
}
function yO(e, t) {
  return q(e.getUTCFullYear() % 1e4, t, 4);
}
function gO(e, t) {
  var r = e.getUTCDay();
  return ((e = r >= 4 || r === 0 ? gr(e) : gr.ceil(e)), q(e.getUTCFullYear() % 1e4, t, 4));
}
function bO() {
  return '+0000';
}
function zf() {
  return '%';
}
function Ff(e) {
  return +e;
}
function Kf(e) {
  return Math.floor(+e / 1e3);
}
var lr, Xv, Zv;
wO({
  dateTime: '%x, %X',
  date: '%-m/%-d/%Y',
  time: '%-I:%M:%S %p',
  periods: ['AM', 'PM'],
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
});
function wO(e) {
  return ((lr = wP(e)), (Xv = lr.format), lr.parse, (Zv = lr.utcFormat), lr.utcParse, lr);
}
function xO(e) {
  return new Date(e);
}
function PO(e) {
  return e instanceof Date ? +e : +new Date(+e);
}
function gl(e, t, r, n, i, a, o, u, l, s) {
  var c = il(),
    f = c.invert,
    d = c.domain,
    h = s('.%L'),
    v = s(':%S'),
    p = s('%I:%M'),
    m = s('%I %p'),
    g = s('%a %d'),
    w = s('%b %d'),
    b = s('%B'),
    P = s('%Y');
  function x(O) {
    return (
      l(O) < O
        ? h
        : u(O) < O
          ? v
          : o(O) < O
            ? p
            : a(O) < O
              ? m
              : n(O) < O
                ? i(O) < O
                  ? g
                  : w
                : r(O) < O
                  ? b
                  : P
    )(O);
  }
  return (
    (c.invert = function (O) {
      return new Date(f(O));
    }),
    (c.domain = function (O) {
      return arguments.length ? d(Array.from(O, PO)) : d().map(xO);
    }),
    (c.ticks = function (O) {
      var S = d();
      return e(S[0], S[S.length - 1], O ?? 10);
    }),
    (c.tickFormat = function (O, S) {
      return S == null ? x : s(S);
    }),
    (c.nice = function (O) {
      var S = d();
      return (
        (!O || typeof O.range != 'function') && (O = t(S[0], S[S.length - 1], O ?? 10)),
        O ? d(Rv(S, O)) : c
      );
    }),
    (c.copy = function () {
      return an(c, gl(e, t, r, n, i, a, o, u, l, s));
    }),
    c
  );
}
function OO() {
  return Ve.apply(
    gl(gP, bP, yt, ml, _i, on, vl, dl, Ut, Xv).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]),
    arguments
  );
}
function AO() {
  return Ve.apply(
    gl(mP, yP, gt, yl, Ti, Ei, pl, hl, Ut, Zv).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]),
    arguments
  );
}
function Ci() {
  var e = 0,
    t = 1,
    r,
    n,
    i,
    a,
    o = we,
    u = !1,
    l;
  function s(f) {
    return f == null || isNaN((f = +f))
      ? l
      : o(i === 0 ? 0.5 : ((f = (a(f) - r) * i), u ? Math.max(0, Math.min(1, f)) : f));
  }
  ((s.domain = function (f) {
    return arguments.length
      ? (([e, t] = f), (r = a((e = +e))), (n = a((t = +t))), (i = r === n ? 0 : 1 / (n - r)), s)
      : [e, t];
  }),
    (s.clamp = function (f) {
      return arguments.length ? ((u = !!f), s) : u;
    }),
    (s.interpolator = function (f) {
      return arguments.length ? ((o = f), s) : o;
    }));
  function c(f) {
    return function (d) {
      var h, v;
      return arguments.length ? (([h, v] = d), (o = f(h, v)), s) : [o(0), o(1)];
    };
  }
  return (
    (s.range = c(xr)),
    (s.rangeRound = c(nl)),
    (s.unknown = function (f) {
      return arguments.length ? ((l = f), s) : l;
    }),
    function (f) {
      return ((a = f), (r = f(e)), (n = f(t)), (i = r === n ? 0 : 1 / (n - r)), s);
    }
  );
}
function Dt(e, t) {
  return t.domain(e.domain()).interpolator(e.interpolator()).clamp(e.clamp()).unknown(e.unknown());
}
function Jv() {
  var e = It(Ci()(we));
  return (
    (e.copy = function () {
      return Dt(e, Jv());
    }),
    xt.apply(e, arguments)
  );
}
function Qv() {
  var e = ul(Ci()).domain([1, 10]);
  return (
    (e.copy = function () {
      return Dt(e, Qv()).base(e.base());
    }),
    xt.apply(e, arguments)
  );
}
function ep() {
  var e = ll(Ci());
  return (
    (e.copy = function () {
      return Dt(e, ep()).constant(e.constant());
    }),
    xt.apply(e, arguments)
  );
}
function bl() {
  var e = cl(Ci());
  return (
    (e.copy = function () {
      return Dt(e, bl()).exponent(e.exponent());
    }),
    xt.apply(e, arguments)
  );
}
function SO() {
  return bl.apply(null, arguments).exponent(0.5);
}
function tp() {
  var e = [],
    t = we;
  function r(n) {
    if (n != null && !isNaN((n = +n))) return t((rn(e, n, 1) - 1) / (e.length - 1));
  }
  return (
    (r.domain = function (n) {
      if (!arguments.length) return e.slice();
      e = [];
      for (let i of n) i != null && !isNaN((i = +i)) && e.push(i);
      return (e.sort(Tt), r);
    }),
    (r.interpolator = function (n) {
      return arguments.length ? ((t = n), r) : t;
    }),
    (r.range = function () {
      return e.map((n, i) => t(i / (e.length - 1)));
    }),
    (r.quantiles = function (n) {
      return Array.from({ length: n + 1 }, (i, a) => s1(e, a / n));
    }),
    (r.copy = function () {
      return tp(t).domain(e);
    }),
    xt.apply(r, arguments)
  );
}
function ji() {
  var e = 0,
    t = 0.5,
    r = 1,
    n = 1,
    i,
    a,
    o,
    u,
    l,
    s = we,
    c,
    f = !1,
    d;
  function h(p) {
    return isNaN((p = +p))
      ? d
      : ((p = 0.5 + ((p = +c(p)) - a) * (n * p < n * a ? u : l)),
        s(f ? Math.max(0, Math.min(1, p)) : p));
  }
  ((h.domain = function (p) {
    return arguments.length
      ? (([e, t, r] = p),
        (i = c((e = +e))),
        (a = c((t = +t))),
        (o = c((r = +r))),
        (u = i === a ? 0 : 0.5 / (a - i)),
        (l = a === o ? 0 : 0.5 / (o - a)),
        (n = a < i ? -1 : 1),
        h)
      : [e, t, r];
  }),
    (h.clamp = function (p) {
      return arguments.length ? ((f = !!p), h) : f;
    }),
    (h.interpolator = function (p) {
      return arguments.length ? ((s = p), h) : s;
    }));
  function v(p) {
    return function (m) {
      var g, w, b;
      return arguments.length ? (([g, w, b] = m), (s = R1(p, [g, w, b])), h) : [s(0), s(0.5), s(1)];
    };
  }
  return (
    (h.range = v(xr)),
    (h.rangeRound = v(nl)),
    (h.unknown = function (p) {
      return arguments.length ? ((d = p), h) : d;
    }),
    function (p) {
      return (
        (c = p),
        (i = p(e)),
        (a = p(t)),
        (o = p(r)),
        (u = i === a ? 0 : 0.5 / (a - i)),
        (l = a === o ? 0 : 0.5 / (o - a)),
        (n = a < i ? -1 : 1),
        h
      );
    }
  );
}
function rp() {
  var e = It(ji()(we));
  return (
    (e.copy = function () {
      return Dt(e, rp());
    }),
    xt.apply(e, arguments)
  );
}
function np() {
  var e = ul(ji()).domain([0.1, 1, 10]);
  return (
    (e.copy = function () {
      return Dt(e, np()).base(e.base());
    }),
    xt.apply(e, arguments)
  );
}
function ip() {
  var e = ll(ji());
  return (
    (e.copy = function () {
      return Dt(e, ip()).constant(e.constant());
    }),
    xt.apply(e, arguments)
  );
}
function wl() {
  var e = cl(ji());
  return (
    (e.copy = function () {
      return Dt(e, wl()).exponent(e.exponent());
    }),
    xt.apply(e, arguments)
  );
}
function EO() {
  return wl.apply(null, arguments).exponent(0.5);
}
const Rr = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      scaleBand: el,
      scaleDiverging: rp,
      scaleDivergingLog: np,
      scaleDivergingPow: wl,
      scaleDivergingSqrt: EO,
      scaleDivergingSymlog: ip,
      scaleIdentity: $v,
      scaleImplicit: tu,
      scaleLinear: Nv,
      scaleLog: Lv,
      scaleOrdinal: Qu,
      scalePoint: h1,
      scalePow: sl,
      scaleQuantile: zv,
      scaleQuantize: Fv,
      scaleRadial: qv,
      scaleSequential: Jv,
      scaleSequentialLog: Qv,
      scaleSequentialPow: bl,
      scaleSequentialQuantile: tp,
      scaleSequentialSqrt: SO,
      scaleSequentialSymlog: ep,
      scaleSqrt: oP,
      scaleSymlog: Bv,
      scaleThreshold: Kv,
      scaleTime: OO,
      scaleUtc: AO,
      tickFormat: Dv,
    },
    Symbol.toStringTag,
    { value: 'Module' }
  )
);
var Nt = (e) => e.chartData,
  _O = A([Nt], (e) => {
    var t = e.chartData != null ? e.chartData.length - 1 : 0;
    return {
      chartData: e.chartData,
      computedData: e.computedData,
      dataEndIndex: t,
      dataStartIndex: 0,
    };
  }),
  Mi = (e, t, r, n) => (n ? _O(e) : Nt(e));
function br(e) {
  if (Array.isArray(e) && e.length === 2) {
    var [t, r] = e;
    if (xe(t) && xe(r)) return !0;
  }
  return !1;
}
function Wf(e, t, r) {
  return r ? e : [Math.min(e[0], t[0]), Math.max(e[1], t[1])];
}
function TO(e, t) {
  if (t && typeof e != 'function' && Array.isArray(e) && e.length === 2) {
    var [r, n] = e,
      i,
      a;
    if (xe(r)) i = r;
    else if (typeof r == 'function') return;
    if (xe(n)) a = n;
    else if (typeof n == 'function') return;
    var o = [i, a];
    if (br(o)) return o;
  }
}
function CO(e, t, r) {
  if (!(!r && t == null)) {
    if (typeof e == 'function' && t != null)
      try {
        var n = e(t, r);
        if (br(n)) return Wf(n, t, r);
      } catch {}
    if (Array.isArray(e) && e.length === 2) {
      var [i, a] = e,
        o,
        u;
      if (i === 'auto') t != null && (o = Math.min(...t));
      else if (k(i)) o = i;
      else if (typeof i == 'function')
        try {
          t != null && (o = i(t?.[0]));
        } catch {}
      else if (typeof i == 'string' && Cs.test(i)) {
        var l = Cs.exec(i);
        if (l == null || t == null) o = void 0;
        else {
          var s = +l[1];
          o = t[0] - s;
        }
      } else o = t?.[0];
      if (a === 'auto') t != null && (u = Math.max(...t));
      else if (k(a)) u = a;
      else if (typeof a == 'function')
        try {
          t != null && (u = a(t?.[1]));
        } catch {}
      else if (typeof a == 'string' && js.test(a)) {
        var c = js.exec(a);
        if (c == null || t == null) u = void 0;
        else {
          var f = +c[1];
          u = t[1] + f;
        }
      } else u = t?.[1];
      var d = [o, u];
      if (br(d)) return t == null ? d : Wf(d, t, r);
    }
  }
}
var Pr = 1e9,
  jO = {
    precision: 20,
    rounding: 4,
    toExpNeg: -7,
    toExpPos: 21,
    LN10: '2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286',
  },
  Pl,
  Z = !0,
  Ge = '[DecimalError] ',
  Zt = Ge + 'Invalid argument: ',
  xl = Ge + 'Exponent out of range: ',
  Or = Math.floor,
  zt = Math.pow,
  MO = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
  De,
  se = 1e7,
  X = 7,
  ap = 9007199254740991,
  ti = Or(ap / X),
  j = {};
j.absoluteValue = j.abs = function () {
  var e = new this.constructor(this);
  return (e.s && (e.s = 1), e);
};
j.comparedTo = j.cmp = function (e) {
  var t,
    r,
    n,
    i,
    a = this;
  if (((e = new a.constructor(e)), a.s !== e.s)) return a.s || -e.s;
  if (a.e !== e.e) return (a.e > e.e) ^ (a.s < 0) ? 1 : -1;
  for (n = a.d.length, i = e.d.length, t = 0, r = n < i ? n : i; t < r; ++t)
    if (a.d[t] !== e.d[t]) return (a.d[t] > e.d[t]) ^ (a.s < 0) ? 1 : -1;
  return n === i ? 0 : (n > i) ^ (a.s < 0) ? 1 : -1;
};
j.decimalPlaces = j.dp = function () {
  var e = this,
    t = e.d.length - 1,
    r = (t - e.e) * X;
  if (((t = e.d[t]), t)) for (; t % 10 == 0; t /= 10) r--;
  return r < 0 ? 0 : r;
};
j.dividedBy = j.div = function (e) {
  return ht(this, new this.constructor(e));
};
j.dividedToIntegerBy = j.idiv = function (e) {
  var t = this,
    r = t.constructor;
  return Y(ht(t, new r(e), 0, 1), r.precision);
};
j.equals = j.eq = function (e) {
  return !this.cmp(e);
};
j.exponent = function () {
  return re(this);
};
j.greaterThan = j.gt = function (e) {
  return this.cmp(e) > 0;
};
j.greaterThanOrEqualTo = j.gte = function (e) {
  return this.cmp(e) >= 0;
};
j.isInteger = j.isint = function () {
  return this.e > this.d.length - 2;
};
j.isNegative = j.isneg = function () {
  return this.s < 0;
};
j.isPositive = j.ispos = function () {
  return this.s > 0;
};
j.isZero = function () {
  return this.s === 0;
};
j.lessThan = j.lt = function (e) {
  return this.cmp(e) < 0;
};
j.lessThanOrEqualTo = j.lte = function (e) {
  return this.cmp(e) < 1;
};
j.logarithm = j.log = function (e) {
  var t,
    r = this,
    n = r.constructor,
    i = n.precision,
    a = i + 5;
  if (e === void 0) e = new n(10);
  else if (((e = new n(e)), e.s < 1 || e.eq(De))) throw Error(Ge + 'NaN');
  if (r.s < 1) throw Error(Ge + (r.s ? 'NaN' : '-Infinity'));
  return r.eq(De) ? new n(0) : ((Z = !1), (t = ht(Xr(r, a), Xr(e, a), a)), (Z = !0), Y(t, i));
};
j.minus = j.sub = function (e) {
  var t = this;
  return ((e = new t.constructor(e)), t.s == e.s ? lp(t, e) : op(t, ((e.s = -e.s), e)));
};
j.modulo = j.mod = function (e) {
  var t,
    r = this,
    n = r.constructor,
    i = n.precision;
  if (((e = new n(e)), !e.s)) throw Error(Ge + 'NaN');
  return r.s ? ((Z = !1), (t = ht(r, e, 0, 1).times(e)), (Z = !0), r.minus(t)) : Y(new n(r), i);
};
j.naturalExponential = j.exp = function () {
  return up(this);
};
j.naturalLogarithm = j.ln = function () {
  return Xr(this);
};
j.negated = j.neg = function () {
  var e = new this.constructor(this);
  return ((e.s = -e.s || 0), e);
};
j.plus = j.add = function (e) {
  var t = this;
  return ((e = new t.constructor(e)), t.s == e.s ? op(t, e) : lp(t, ((e.s = -e.s), e)));
};
j.precision = j.sd = function (e) {
  var t,
    r,
    n,
    i = this;
  if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(Zt + e);
  if (((t = re(i) + 1), (n = i.d.length - 1), (r = n * X + 1), (n = i.d[n]), n)) {
    for (; n % 10 == 0; n /= 10) r--;
    for (n = i.d[0]; n >= 10; n /= 10) r++;
  }
  return e && t > r ? t : r;
};
j.squareRoot = j.sqrt = function () {
  var e,
    t,
    r,
    n,
    i,
    a,
    o,
    u = this,
    l = u.constructor;
  if (u.s < 1) {
    if (!u.s) return new l(0);
    throw Error(Ge + 'NaN');
  }
  for (
    e = re(u),
      Z = !1,
      i = Math.sqrt(+u),
      i == 0 || i == 1 / 0
        ? ((t = rt(u.d)),
          (t.length + e) % 2 == 0 && (t += '0'),
          (i = Math.sqrt(t)),
          (e = Or((e + 1) / 2) - (e < 0 || e % 2)),
          i == 1 / 0
            ? (t = '5e' + e)
            : ((t = i.toExponential()), (t = t.slice(0, t.indexOf('e') + 1) + e)),
          (n = new l(t)))
        : (n = new l(i.toString())),
      r = l.precision,
      i = o = r + 3;
    ;

  )
    if (
      ((a = n),
      (n = a.plus(ht(u, a, o + 2)).times(0.5)),
      rt(a.d).slice(0, o) === (t = rt(n.d)).slice(0, o))
    ) {
      if (((t = t.slice(o - 3, o + 1)), i == o && t == '4999')) {
        if ((Y(a, r + 1, 0), a.times(a).eq(u))) {
          n = a;
          break;
        }
      } else if (t != '9999') break;
      o += 4;
    }
  return ((Z = !0), Y(n, r));
};
j.times = j.mul = function (e) {
  var t,
    r,
    n,
    i,
    a,
    o,
    u,
    l,
    s,
    c = this,
    f = c.constructor,
    d = c.d,
    h = (e = new f(e)).d;
  if (!c.s || !e.s) return new f(0);
  for (
    e.s *= c.s,
      r = c.e + e.e,
      l = d.length,
      s = h.length,
      l < s && ((a = d), (d = h), (h = a), (o = l), (l = s), (s = o)),
      a = [],
      o = l + s,
      n = o;
    n--;

  )
    a.push(0);
  for (n = s; --n >= 0; ) {
    for (t = 0, i = l + n; i > n; )
      ((u = a[i] + h[n] * d[i - n - 1] + t), (a[i--] = u % se | 0), (t = (u / se) | 0));
    a[i] = (a[i] + t) % se | 0;
  }
  for (; !a[--o]; ) a.pop();
  return (t ? ++r : a.shift(), (e.d = a), (e.e = r), Z ? Y(e, f.precision) : e);
};
j.toDecimalPlaces = j.todp = function (e, t) {
  var r = this,
    n = r.constructor;
  return (
    (r = new n(r)),
    e === void 0
      ? r
      : (at(e, 0, Pr), t === void 0 ? (t = n.rounding) : at(t, 0, 8), Y(r, e + re(r) + 1, t))
  );
};
j.toExponential = function (e, t) {
  var r,
    n = this,
    i = n.constructor;
  return (
    e === void 0
      ? (r = tr(n, !0))
      : (at(e, 0, Pr),
        t === void 0 ? (t = i.rounding) : at(t, 0, 8),
        (n = Y(new i(n), e + 1, t)),
        (r = tr(n, !0, e + 1))),
    r
  );
};
j.toFixed = function (e, t) {
  var r,
    n,
    i = this,
    a = i.constructor;
  return e === void 0
    ? tr(i)
    : (at(e, 0, Pr),
      t === void 0 ? (t = a.rounding) : at(t, 0, 8),
      (n = Y(new a(i), e + re(i) + 1, t)),
      (r = tr(n.abs(), !1, e + re(n) + 1)),
      i.isneg() && !i.isZero() ? '-' + r : r);
};
j.toInteger = j.toint = function () {
  var e = this,
    t = e.constructor;
  return Y(new t(e), re(e) + 1, t.rounding);
};
j.toNumber = function () {
  return +this;
};
j.toPower = j.pow = function (e) {
  var t,
    r,
    n,
    i,
    a,
    o,
    u = this,
    l = u.constructor,
    s = 12,
    c = +(e = new l(e));
  if (!e.s) return new l(De);
  if (((u = new l(u)), !u.s)) {
    if (e.s < 1) throw Error(Ge + 'Infinity');
    return u;
  }
  if (u.eq(De)) return u;
  if (((n = l.precision), e.eq(De))) return Y(u, n);
  if (((t = e.e), (r = e.d.length - 1), (o = t >= r), (a = u.s), o)) {
    if ((r = c < 0 ? -c : c) <= ap) {
      for (
        i = new l(De), t = Math.ceil(n / X + 4), Z = !1;
        r % 2 && ((i = i.times(u)), Hf(i.d, t)), (r = Or(r / 2)), r !== 0;

      )
        ((u = u.times(u)), Hf(u.d, t));
      return ((Z = !0), e.s < 0 ? new l(De).div(i) : Y(i, n));
    }
  } else if (a < 0) throw Error(Ge + 'NaN');
  return (
    (a = a < 0 && e.d[Math.max(t, r)] & 1 ? -1 : 1),
    (u.s = 1),
    (Z = !1),
    (i = e.times(Xr(u, n + s))),
    (Z = !0),
    (i = up(i)),
    (i.s = a),
    i
  );
};
j.toPrecision = function (e, t) {
  var r,
    n,
    i = this,
    a = i.constructor;
  return (
    e === void 0
      ? ((r = re(i)), (n = tr(i, r <= a.toExpNeg || r >= a.toExpPos)))
      : (at(e, 1, Pr),
        t === void 0 ? (t = a.rounding) : at(t, 0, 8),
        (i = Y(new a(i), e, t)),
        (r = re(i)),
        (n = tr(i, e <= r || r <= a.toExpNeg, e))),
    n
  );
};
j.toSignificantDigits = j.tosd = function (e, t) {
  var r = this,
    n = r.constructor;
  return (
    e === void 0
      ? ((e = n.precision), (t = n.rounding))
      : (at(e, 1, Pr), t === void 0 ? (t = n.rounding) : at(t, 0, 8)),
    Y(new n(r), e, t)
  );
};
j.toString =
  j.valueOf =
  j.val =
  j.toJSON =
  j[Symbol.for('nodejs.util.inspect.custom')] =
    function () {
      var e = this,
        t = re(e),
        r = e.constructor;
      return tr(e, t <= r.toExpNeg || t >= r.toExpPos);
    };
function op(e, t) {
  var r,
    n,
    i,
    a,
    o,
    u,
    l,
    s,
    c = e.constructor,
    f = c.precision;
  if (!e.s || !t.s) return (t.s || (t = new c(e)), Z ? Y(t, f) : t);
  if (((l = e.d), (s = t.d), (o = e.e), (i = t.e), (l = l.slice()), (a = o - i), a)) {
    for (
      a < 0 ? ((n = l), (a = -a), (u = s.length)) : ((n = s), (i = o), (u = l.length)),
        o = Math.ceil(f / X),
        u = o > u ? o + 1 : u + 1,
        a > u && ((a = u), (n.length = 1)),
        n.reverse();
      a--;

    )
      n.push(0);
    n.reverse();
  }
  for (u = l.length, a = s.length, u - a < 0 && ((a = u), (n = s), (s = l), (l = n)), r = 0; a; )
    ((r = ((l[--a] = l[a] + s[a] + r) / se) | 0), (l[a] %= se));
  for (r && (l.unshift(r), ++i), u = l.length; l[--u] == 0; ) l.pop();
  return ((t.d = l), (t.e = i), Z ? Y(t, f) : t);
}
function at(e, t, r) {
  if (e !== ~~e || e < t || e > r) throw Error(Zt + e);
}
function rt(e) {
  var t,
    r,
    n,
    i = e.length - 1,
    a = '',
    o = e[0];
  if (i > 0) {
    for (a += o, t = 1; t < i; t++)
      ((n = e[t] + ''), (r = X - n.length), r && (a += Et(r)), (a += n));
    ((o = e[t]), (n = o + ''), (r = X - n.length), r && (a += Et(r)));
  } else if (o === 0) return '0';
  for (; o % 10 === 0; ) o /= 10;
  return a + o;
}
var ht = (function () {
  function e(n, i) {
    var a,
      o = 0,
      u = n.length;
    for (n = n.slice(); u--; ) ((a = n[u] * i + o), (n[u] = a % se | 0), (o = (a / se) | 0));
    return (o && n.unshift(o), n);
  }
  function t(n, i, a, o) {
    var u, l;
    if (a != o) l = a > o ? 1 : -1;
    else
      for (u = l = 0; u < a; u++)
        if (n[u] != i[u]) {
          l = n[u] > i[u] ? 1 : -1;
          break;
        }
    return l;
  }
  function r(n, i, a) {
    for (var o = 0; a--; ) ((n[a] -= o), (o = n[a] < i[a] ? 1 : 0), (n[a] = o * se + n[a] - i[a]));
    for (; !n[0] && n.length > 1; ) n.shift();
  }
  return function (n, i, a, o) {
    var u,
      l,
      s,
      c,
      f,
      d,
      h,
      v,
      p,
      m,
      g,
      w,
      b,
      P,
      x,
      O,
      S,
      _,
      C = n.constructor,
      N = n.s == i.s ? 1 : -1,
      T = n.d,
      M = i.d;
    if (!n.s) return new C(n);
    if (!i.s) throw Error(Ge + 'Division by zero');
    for (
      l = n.e - i.e, S = M.length, x = T.length, h = new C(N), v = h.d = [], s = 0;
      M[s] == (T[s] || 0);

    )
      ++s;
    if (
      (M[s] > (T[s] || 0) && --l,
      a == null ? (w = a = C.precision) : o ? (w = a + (re(n) - re(i)) + 1) : (w = a),
      w < 0)
    )
      return new C(0);
    if (((w = (w / X + 2) | 0), (s = 0), S == 1))
      for (c = 0, M = M[0], w++; (s < x || c) && w--; s++)
        ((b = c * se + (T[s] || 0)), (v[s] = (b / M) | 0), (c = b % M | 0));
    else {
      for (
        c = (se / (M[0] + 1)) | 0,
          c > 1 && ((M = e(M, c)), (T = e(T, c)), (S = M.length), (x = T.length)),
          P = S,
          p = T.slice(0, S),
          m = p.length;
        m < S;

      )
        p[m++] = 0;
      ((_ = M.slice()), _.unshift(0), (O = M[0]), M[1] >= se / 2 && ++O);
      do
        ((c = 0),
          (u = t(M, p, S, m)),
          u < 0
            ? ((g = p[0]),
              S != m && (g = g * se + (p[1] || 0)),
              (c = (g / O) | 0),
              c > 1
                ? (c >= se && (c = se - 1),
                  (f = e(M, c)),
                  (d = f.length),
                  (m = p.length),
                  (u = t(f, p, d, m)),
                  u == 1 && (c--, r(f, S < d ? _ : M, d)))
                : (c == 0 && (u = c = 1), (f = M.slice())),
              (d = f.length),
              d < m && f.unshift(0),
              r(p, f, m),
              u == -1 &&
                ((m = p.length), (u = t(M, p, S, m)), u < 1 && (c++, r(p, S < m ? _ : M, m))),
              (m = p.length))
            : u === 0 && (c++, (p = [0])),
          (v[s++] = c),
          u && p[0] ? (p[m++] = T[P] || 0) : ((p = [T[P]]), (m = 1)));
      while ((P++ < x || p[0] !== void 0) && w--);
    }
    return (v[0] || v.shift(), (h.e = l), Y(h, o ? a + re(h) + 1 : a));
  };
})();
function up(e, t) {
  var r,
    n,
    i,
    a,
    o,
    u,
    l = 0,
    s = 0,
    c = e.constructor,
    f = c.precision;
  if (re(e) > 16) throw Error(xl + re(e));
  if (!e.s) return new c(De);
  for (Z = !1, u = f, o = new c(0.03125); e.abs().gte(0.1); ) ((e = e.times(o)), (s += 5));
  for (
    n = ((Math.log(zt(2, s)) / Math.LN10) * 2 + 5) | 0,
      u += n,
      r = i = a = new c(De),
      c.precision = u;
    ;

  ) {
    if (
      ((i = Y(i.times(e), u)),
      (r = r.times(++l)),
      (o = a.plus(ht(i, r, u))),
      rt(o.d).slice(0, u) === rt(a.d).slice(0, u))
    ) {
      for (; s--; ) a = Y(a.times(a), u);
      return ((c.precision = f), t == null ? ((Z = !0), Y(a, f)) : a);
    }
    a = o;
  }
}
function re(e) {
  for (var t = e.e * X, r = e.d[0]; r >= 10; r /= 10) t++;
  return t;
}
function so(e, t, r) {
  if (t > e.LN10.sd())
    throw ((Z = !0), r && (e.precision = r), Error(Ge + 'LN10 precision limit exceeded'));
  return Y(new e(e.LN10), t);
}
function Et(e) {
  for (var t = ''; e--; ) t += '0';
  return t;
}
function Xr(e, t) {
  var r,
    n,
    i,
    a,
    o,
    u,
    l,
    s,
    c,
    f = 1,
    d = 10,
    h = e,
    v = h.d,
    p = h.constructor,
    m = p.precision;
  if (h.s < 1) throw Error(Ge + (h.s ? 'NaN' : '-Infinity'));
  if (h.eq(De)) return new p(0);
  if ((t == null ? ((Z = !1), (s = m)) : (s = t), h.eq(10)))
    return (t == null && (Z = !0), so(p, s));
  if (
    ((s += d), (p.precision = s), (r = rt(v)), (n = r.charAt(0)), (a = re(h)), Math.abs(a) < 15e14)
  ) {
    for (; (n < 7 && n != 1) || (n == 1 && r.charAt(1) > 3); )
      ((h = h.times(e)), (r = rt(h.d)), (n = r.charAt(0)), f++);
    ((a = re(h)), n > 1 ? ((h = new p('0.' + r)), a++) : (h = new p(n + '.' + r.slice(1))));
  } else
    return (
      (l = so(p, s + 2, m).times(a + '')),
      (h = Xr(new p(n + '.' + r.slice(1)), s - d).plus(l)),
      (p.precision = m),
      t == null ? ((Z = !0), Y(h, m)) : h
    );
  for (u = o = h = ht(h.minus(De), h.plus(De), s), c = Y(h.times(h), s), i = 3; ; ) {
    if (
      ((o = Y(o.times(c), s)),
      (l = u.plus(ht(o, new p(i), s))),
      rt(l.d).slice(0, s) === rt(u.d).slice(0, s))
    )
      return (
        (u = u.times(2)),
        a !== 0 && (u = u.plus(so(p, s + 2, m).times(a + ''))),
        (u = ht(u, new p(f), s)),
        (p.precision = m),
        t == null ? ((Z = !0), Y(u, m)) : u
      );
    ((u = l), (i += 2));
  }
}
function Uf(e, t) {
  var r, n, i;
  for (
    (r = t.indexOf('.')) > -1 && (t = t.replace('.', '')),
      (n = t.search(/e/i)) > 0
        ? (r < 0 && (r = n), (r += +t.slice(n + 1)), (t = t.substring(0, n)))
        : r < 0 && (r = t.length),
      n = 0;
    t.charCodeAt(n) === 48;

  )
    ++n;
  for (i = t.length; t.charCodeAt(i - 1) === 48; ) --i;
  if (((t = t.slice(n, i)), t)) {
    if (
      ((i -= n),
      (r = r - n - 1),
      (e.e = Or(r / X)),
      (e.d = []),
      (n = (r + 1) % X),
      r < 0 && (n += X),
      n < i)
    ) {
      for (n && e.d.push(+t.slice(0, n)), i -= X; n < i; ) e.d.push(+t.slice(n, (n += X)));
      ((t = t.slice(n)), (n = X - t.length));
    } else n -= i;
    for (; n--; ) t += '0';
    if ((e.d.push(+t), Z && (e.e > ti || e.e < -ti))) throw Error(xl + r);
  } else ((e.s = 0), (e.e = 0), (e.d = [0]));
  return e;
}
function Y(e, t, r) {
  var n,
    i,
    a,
    o,
    u,
    l,
    s,
    c,
    f = e.d;
  for (o = 1, a = f[0]; a >= 10; a /= 10) o++;
  if (((n = t - o), n < 0)) ((n += X), (i = t), (s = f[(c = 0)]));
  else {
    if (((c = Math.ceil((n + 1) / X)), (a = f.length), c >= a)) return e;
    for (s = a = f[c], o = 1; a >= 10; a /= 10) o++;
    ((n %= X), (i = n - X + o));
  }
  if (
    (r !== void 0 &&
      ((a = zt(10, o - i - 1)),
      (u = (s / a) % 10 | 0),
      (l = t < 0 || f[c + 1] !== void 0 || s % a),
      (l =
        r < 4
          ? (u || l) && (r == 0 || r == (e.s < 0 ? 3 : 2))
          : u > 5 ||
            (u == 5 &&
              (r == 4 ||
                l ||
                (r == 6 && (n > 0 ? (i > 0 ? s / zt(10, o - i) : 0) : f[c - 1]) % 10 & 1) ||
                r == (e.s < 0 ? 8 : 7))))),
    t < 1 || !f[0])
  )
    return (
      l
        ? ((a = re(e)),
          (f.length = 1),
          (t = t - a - 1),
          (f[0] = zt(10, (X - (t % X)) % X)),
          (e.e = Or(-t / X) || 0))
        : ((f.length = 1), (f[0] = e.e = e.s = 0)),
      e
    );
  if (
    (n == 0
      ? ((f.length = c), (a = 1), c--)
      : ((f.length = c + 1),
        (a = zt(10, X - n)),
        (f[c] = i > 0 ? ((s / zt(10, o - i)) % zt(10, i) | 0) * a : 0)),
    l)
  )
    for (;;)
      if (c == 0) {
        (f[0] += a) == se && ((f[0] = 1), ++e.e);
        break;
      } else {
        if (((f[c] += a), f[c] != se)) break;
        ((f[c--] = 0), (a = 1));
      }
  for (n = f.length; f[--n] === 0; ) f.pop();
  if (Z && (e.e > ti || e.e < -ti)) throw Error(xl + re(e));
  return e;
}
function lp(e, t) {
  var r,
    n,
    i,
    a,
    o,
    u,
    l,
    s,
    c,
    f,
    d = e.constructor,
    h = d.precision;
  if (!e.s || !t.s) return (t.s ? (t.s = -t.s) : (t = new d(e)), Z ? Y(t, h) : t);
  if (((l = e.d), (f = t.d), (n = t.e), (s = e.e), (l = l.slice()), (o = s - n), o)) {
    for (
      c = o < 0,
        c ? ((r = l), (o = -o), (u = f.length)) : ((r = f), (n = s), (u = l.length)),
        i = Math.max(Math.ceil(h / X), u) + 2,
        o > i && ((o = i), (r.length = 1)),
        r.reverse(),
        i = o;
      i--;

    )
      r.push(0);
    r.reverse();
  } else {
    for (i = l.length, u = f.length, c = i < u, c && (u = i), i = 0; i < u; i++)
      if (l[i] != f[i]) {
        c = l[i] < f[i];
        break;
      }
    o = 0;
  }
  for (c && ((r = l), (l = f), (f = r), (t.s = -t.s)), u = l.length, i = f.length - u; i > 0; --i)
    l[u++] = 0;
  for (i = f.length; i > o; ) {
    if (l[--i] < f[i]) {
      for (a = i; a && l[--a] === 0; ) l[a] = se - 1;
      (--l[a], (l[i] += se));
    }
    l[i] -= f[i];
  }
  for (; l[--u] === 0; ) l.pop();
  for (; l[0] === 0; l.shift()) --n;
  return l[0] ? ((t.d = l), (t.e = n), Z ? Y(t, h) : t) : new d(0);
}
function tr(e, t, r) {
  var n,
    i = re(e),
    a = rt(e.d),
    o = a.length;
  return (
    t
      ? (r && (n = r - o) > 0
          ? (a = a.charAt(0) + '.' + a.slice(1) + Et(n))
          : o > 1 && (a = a.charAt(0) + '.' + a.slice(1)),
        (a = a + (i < 0 ? 'e' : 'e+') + i))
      : i < 0
        ? ((a = '0.' + Et(-i - 1) + a), r && (n = r - o) > 0 && (a += Et(n)))
        : i >= o
          ? ((a += Et(i + 1 - o)), r && (n = r - i - 1) > 0 && (a = a + '.' + Et(n)))
          : ((n = i + 1) < o && (a = a.slice(0, n) + '.' + a.slice(n)),
            r && (n = r - o) > 0 && (i + 1 === o && (a += '.'), (a += Et(n)))),
    e.s < 0 ? '-' + a : a
  );
}
function Hf(e, t) {
  if (e.length > t) return ((e.length = t), !0);
}
function cp(e) {
  var t, r, n;
  function i(a) {
    var o = this;
    if (!(o instanceof i)) return new i(a);
    if (((o.constructor = i), a instanceof i)) {
      ((o.s = a.s), (o.e = a.e), (o.d = (a = a.d) ? a.slice() : a));
      return;
    }
    if (typeof a == 'number') {
      if (a * 0 !== 0) throw Error(Zt + a);
      if (a > 0) o.s = 1;
      else if (a < 0) ((a = -a), (o.s = -1));
      else {
        ((o.s = 0), (o.e = 0), (o.d = [0]));
        return;
      }
      if (a === ~~a && a < 1e7) {
        ((o.e = 0), (o.d = [a]));
        return;
      }
      return Uf(o, a.toString());
    } else if (typeof a != 'string') throw Error(Zt + a);
    if ((a.charCodeAt(0) === 45 ? ((a = a.slice(1)), (o.s = -1)) : (o.s = 1), MO.test(a))) Uf(o, a);
    else throw Error(Zt + a);
  }
  if (
    ((i.prototype = j),
    (i.ROUND_UP = 0),
    (i.ROUND_DOWN = 1),
    (i.ROUND_CEIL = 2),
    (i.ROUND_FLOOR = 3),
    (i.ROUND_HALF_UP = 4),
    (i.ROUND_HALF_DOWN = 5),
    (i.ROUND_HALF_EVEN = 6),
    (i.ROUND_HALF_CEIL = 7),
    (i.ROUND_HALF_FLOOR = 8),
    (i.clone = cp),
    (i.config = i.set = kO),
    e === void 0 && (e = {}),
    e)
  )
    for (n = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'LN10'], t = 0; t < n.length; )
      e.hasOwnProperty((r = n[t++])) || (e[r] = this[r]);
  return (i.config(e), i);
}
function kO(e) {
  if (!e || typeof e != 'object') throw Error(Ge + 'Object expected');
  var t,
    r,
    n,
    i = ['precision', 1, Pr, 'rounding', 0, 8, 'toExpNeg', -1 / 0, 0, 'toExpPos', 0, 1 / 0];
  for (t = 0; t < i.length; t += 3)
    if ((n = e[(r = i[t])]) !== void 0)
      if (Or(n) === n && n >= i[t + 1] && n <= i[t + 2]) this[r] = n;
      else throw Error(Zt + r + ': ' + n);
  if ((n = e[(r = 'LN10')]) !== void 0)
    if (n == Math.LN10) this[r] = new this(n);
    else throw Error(Zt + r + ': ' + n);
  return this;
}
var Pl = cp(jO);
De = new Pl(1);
const F = Pl;
var IO = (e) => e,
  sp = {},
  fp = (e) => e === sp,
  Yf = (e) =>
    function t() {
      return arguments.length === 0 ||
        (arguments.length === 1 && fp(arguments.length <= 0 ? void 0 : arguments[0]))
        ? t
        : e(...arguments);
    },
  dp = (e, t) =>
    e === 1
      ? t
      : Yf(function () {
          for (var r = arguments.length, n = new Array(r), i = 0; i < r; i++) n[i] = arguments[i];
          var a = n.filter((o) => o !== sp).length;
          return a >= e
            ? t(...n)
            : dp(
                e - a,
                Yf(function () {
                  for (var o = arguments.length, u = new Array(o), l = 0; l < o; l++)
                    u[l] = arguments[l];
                  var s = n.map((c) => (fp(c) ? u.shift() : c));
                  return t(...s, ...u);
                })
              );
        }),
  ki = (e) => dp(e.length, e),
  au = (e, t) => {
    for (var r = [], n = e; n < t; ++n) r[n - e] = n;
    return r;
  },
  DO = ki((e, t) =>
    Array.isArray(t)
      ? t.map(e)
      : Object.keys(t)
          .map((r) => t[r])
          .map(e)
  ),
  NO = function () {
    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
    if (!r.length) return IO;
    var i = r.reverse(),
      a = i[0],
      o = i.slice(1);
    return function () {
      return o.reduce((u, l) => l(u), a(...arguments));
    };
  },
  ou = (e) => (Array.isArray(e) ? e.reverse() : e.split('').reverse().join('')),
  hp = (e) => {
    var t = null,
      r = null;
    return function () {
      for (var n = arguments.length, i = new Array(n), a = 0; a < n; a++) i[a] = arguments[a];
      return (
        (t &&
          i.every((o, u) => {
            var l;
            return o === ((l = t) === null || l === void 0 ? void 0 : l[u]);
          })) ||
          ((t = i), (r = e(...i))),
        r
      );
    };
  };
function vp(e) {
  var t;
  return (e === 0 ? (t = 1) : (t = Math.floor(new F(e).abs().log(10).toNumber()) + 1), t);
}
function pp(e, t, r) {
  for (var n = new F(e), i = 0, a = []; n.lt(t) && i < 1e5; )
    (a.push(n.toNumber()), (n = n.add(r)), i++);
  return a;
}
ki((e, t, r) => {
  var n = +e,
    i = +t;
  return n + r * (i - n);
});
ki((e, t, r) => {
  var n = t - +e;
  return ((n = n || 1 / 0), (r - e) / n);
});
ki((e, t, r) => {
  var n = t - +e;
  return ((n = n || 1 / 0), Math.max(0, Math.min(1, (r - e) / n)));
});
var mp = (e) => {
    var [t, r] = e,
      [n, i] = [t, r];
    return (t > r && ([n, i] = [r, t]), [n, i]);
  },
  yp = (e, t, r) => {
    if (e.lte(0)) return new F(0);
    var n = vp(e.toNumber()),
      i = new F(10).pow(n),
      a = e.div(i),
      o = n !== 1 ? 0.05 : 0.1,
      u = new F(Math.ceil(a.div(o).toNumber())).add(r).mul(o),
      l = u.mul(i);
    return t ? new F(l.toNumber()) : new F(Math.ceil(l.toNumber()));
  },
  $O = (e, t, r) => {
    var n = new F(1),
      i = new F(e);
    if (!i.isint() && r) {
      var a = Math.abs(e);
      a < 1
        ? ((n = new F(10).pow(vp(e) - 1)), (i = new F(Math.floor(i.div(n).toNumber())).mul(n)))
        : a > 1 && (i = new F(Math.floor(e)));
    } else e === 0 ? (i = new F(Math.floor((t - 1) / 2))) : r || (i = new F(Math.floor(e)));
    var o = Math.floor((t - 1) / 2),
      u = NO(
        DO((l) => i.add(new F(l - o).mul(n)).toNumber()),
        au
      );
    return u(0, t);
  },
  gp = function (t, r, n, i) {
    var a = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
    if (!Number.isFinite((r - t) / (n - 1)))
      return { step: new F(0), tickMin: new F(0), tickMax: new F(0) };
    var o = yp(new F(r).sub(t).div(n - 1), i, a),
      u;
    t <= 0 && r >= 0
      ? (u = new F(0))
      : ((u = new F(t).add(r).div(2)), (u = u.sub(new F(u).mod(o))));
    var l = Math.ceil(u.sub(t).div(o).toNumber()),
      s = Math.ceil(new F(r).sub(u).div(o).toNumber()),
      c = l + s + 1;
    return c > n
      ? gp(t, r, n, i, a + 1)
      : (c < n && ((s = r > 0 ? s + (n - c) : s), (l = r > 0 ? l : l + (n - c))),
        { step: o, tickMin: u.sub(new F(l).mul(o)), tickMax: u.add(new F(s).mul(o)) });
  };
function RO(e) {
  var [t, r] = e,
    n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6,
    i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
    a = Math.max(n, 2),
    [o, u] = mp([t, r]);
  if (o === -1 / 0 || u === 1 / 0) {
    var l =
      u === 1 / 0 ? [o, ...au(0, n - 1).map(() => 1 / 0)] : [...au(0, n - 1).map(() => -1 / 0), u];
    return t > r ? ou(l) : l;
  }
  if (o === u) return $O(o, n, i);
  var { step: s, tickMin: c, tickMax: f } = gp(o, u, a, i, 0),
    d = pp(c, f.add(new F(0.1).mul(s)), s);
  return t > r ? ou(d) : d;
}
function LO(e, t) {
  var [r, n] = e,
    i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
    [a, o] = mp([r, n]);
  if (a === -1 / 0 || o === 1 / 0) return [r, n];
  if (a === o) return [a];
  var u = Math.max(t, 2),
    l = yp(new F(o).sub(a).div(u - 1), i, 0),
    s = [...pp(new F(a), new F(o), l), o];
  return (i === !1 && (s = s.map((c) => Math.round(c))), r > n ? ou(s) : s);
}
var BO = hp(RO),
  qO = hp(LO),
  zO = (e) => e.rootProps.barCategoryGap,
  Ii = (e) => e.rootProps.stackOffset,
  Ol = (e) => e.options.chartName,
  Al = (e) => e.rootProps.syncId,
  bp = (e) => e.rootProps.syncMethod,
  Sl = (e) => e.options.eventEmitter,
  lt = {
    allowDuplicatedCategory: !0,
    angleAxisId: 0,
    reversed: !1,
    scale: 'auto',
    tick: !0,
    type: 'category',
  },
  ke = {
    allowDataOverflow: !1,
    allowDuplicatedCategory: !0,
    radiusAxisId: 0,
    scale: 'auto',
    tick: !0,
    tickCount: 5,
    type: 'number',
  },
  Di = (e, t) => {
    if (!(!e || !t)) return e != null && e.reversed ? [t[1], t[0]] : t;
  },
  FO = {
    allowDataOverflow: !1,
    allowDecimals: !1,
    allowDuplicatedCategory: !1,
    dataKey: void 0,
    domain: void 0,
    id: lt.angleAxisId,
    includeHidden: !1,
    name: void 0,
    reversed: lt.reversed,
    scale: lt.scale,
    tick: lt.tick,
    tickCount: void 0,
    ticks: void 0,
    type: lt.type,
    unit: void 0,
  },
  KO = {
    allowDataOverflow: ke.allowDataOverflow,
    allowDecimals: !1,
    allowDuplicatedCategory: ke.allowDuplicatedCategory,
    dataKey: void 0,
    domain: void 0,
    id: ke.radiusAxisId,
    includeHidden: !1,
    name: void 0,
    reversed: !1,
    scale: ke.scale,
    tick: ke.tick,
    tickCount: ke.tickCount,
    ticks: void 0,
    type: ke.type,
    unit: void 0,
  },
  WO = {
    allowDataOverflow: !1,
    allowDecimals: !1,
    allowDuplicatedCategory: lt.allowDuplicatedCategory,
    dataKey: void 0,
    domain: void 0,
    id: lt.angleAxisId,
    includeHidden: !1,
    name: void 0,
    reversed: !1,
    scale: lt.scale,
    tick: lt.tick,
    tickCount: void 0,
    ticks: void 0,
    type: 'number',
    unit: void 0,
  },
  UO = {
    allowDataOverflow: ke.allowDataOverflow,
    allowDecimals: !1,
    allowDuplicatedCategory: ke.allowDuplicatedCategory,
    dataKey: void 0,
    domain: void 0,
    id: ke.radiusAxisId,
    includeHidden: !1,
    name: void 0,
    reversed: !1,
    scale: ke.scale,
    tick: ke.tick,
    tickCount: ke.tickCount,
    ticks: void 0,
    type: 'category',
    unit: void 0,
  },
  El = (e, t) =>
    e.polarAxis.angleAxis[t] != null
      ? e.polarAxis.angleAxis[t]
      : e.layout.layoutType === 'radial'
        ? WO
        : FO,
  _l = (e, t) =>
    e.polarAxis.radiusAxis[t] != null
      ? e.polarAxis.radiusAxis[t]
      : e.layout.layoutType === 'radial'
        ? UO
        : KO,
  Ni = (e) => e.polarOptions,
  Tl = A([bt, wt, ye], Rb),
  wp = A([Ni, Tl], (e, t) => {
    if (e != null) return jt(e.innerRadius, t, 0);
  }),
  xp = A([Ni, Tl], (e, t) => {
    if (e != null) return jt(e.outerRadius, t, t * 0.8);
  }),
  HO = (e) => {
    if (e == null) return [0, 0];
    var { startAngle: t, endAngle: r } = e;
    return [t, r];
  },
  Pp = A([Ni], HO);
A([El, Pp], Di);
var Op = A([Tl, wp, xp], (e, t, r) => {
  if (!(e == null || t == null || r == null)) return [t, r];
});
A([_l, Op], Di);
var Ap = A([U, Ni, wp, xp, bt, wt], (e, t, r, n, i, a) => {
    if (!((e !== 'centric' && e !== 'radial') || t == null || r == null || n == null)) {
      var { cx: o, cy: u, startAngle: l, endAngle: s } = t;
      return {
        cx: jt(o, i, i / 2),
        cy: jt(u, a, a / 2),
        innerRadius: r,
        outerRadius: n,
        startAngle: l,
        endAngle: s,
        clockWise: !1,
      };
    }
  }),
  ne = (e, t) => t,
  $i = (e, t, r) => r;
function Cl(e) {
  return e?.id;
}
var ue = (e) => {
    var t = U(e);
    return t === 'horizontal'
      ? 'xAxis'
      : t === 'vertical'
        ? 'yAxis'
        : t === 'centric'
          ? 'angleAxis'
          : 'radiusAxis';
  },
  Ar = (e) => e.tooltip.settings.axisId,
  le = (e) => {
    var t = ue(e),
      r = Ar(e);
    return un(e, t, r);
  };
function Sp(e, t, r) {
  var { chartData: n = [] } = t,
    i = r?.dataKey,
    a = new Map();
  return (
    e.forEach((o) => {
      var u,
        l = (u = o.data) !== null && u !== void 0 ? u : n;
      if (!(l == null || l.length === 0)) {
        var s = Cl(o);
        l.forEach((c, f) => {
          var d = i == null ? f : String(pe(c, i, null)),
            h = pe(c, o.dataKey, 0),
            v;
          (a.has(d) ? (v = a.get(d)) : (v = {}), Object.assign(v, { [s]: h }), a.set(d, v));
        });
      }
    }),
    Array.from(a.values())
  );
}
function jl(e) {
  return e.stackId != null && e.dataKey != null;
}
function Gf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ri(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Gf(Object(r), !0).forEach(function (n) {
          YO(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Gf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function YO(e, t, r) {
  return (
    (t = GO(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function GO(e) {
  var t = VO(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function VO(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var uu = [0, 'auto'],
  je = {
    allowDataOverflow: !1,
    allowDecimals: !0,
    allowDuplicatedCategory: !0,
    angle: 0,
    dataKey: void 0,
    domain: void 0,
    height: 30,
    hide: !0,
    id: 0,
    includeHidden: !1,
    interval: 'preserveEnd',
    minTickGap: 5,
    mirror: !1,
    name: void 0,
    orientation: 'bottom',
    padding: { left: 0, right: 0 },
    reversed: !1,
    scale: 'auto',
    tick: !0,
    tickCount: 5,
    tickFormatter: void 0,
    ticks: void 0,
    type: 'category',
    unit: void 0,
  },
  Pt = (e, t) => {
    var r = e.cartesianAxis.xAxis[t];
    return r ?? je;
  },
  Me = {
    allowDataOverflow: !1,
    allowDecimals: !0,
    allowDuplicatedCategory: !0,
    angle: 0,
    dataKey: void 0,
    domain: uu,
    hide: !0,
    id: 0,
    includeHidden: !1,
    interval: 'preserveEnd',
    minTickGap: 5,
    mirror: !1,
    name: void 0,
    orientation: 'left',
    padding: { top: 0, bottom: 0 },
    reversed: !1,
    scale: 'auto',
    tick: !0,
    tickCount: 5,
    tickFormatter: void 0,
    ticks: void 0,
    type: 'number',
    unit: void 0,
    width: xi,
  },
  $t = (e, t) => {
    var r = e.cartesianAxis.yAxis[t];
    return r ?? Me;
  },
  XO = {
    domain: [0, 'auto'],
    includeHidden: !1,
    reversed: !1,
    allowDataOverflow: !1,
    allowDuplicatedCategory: !1,
    dataKey: void 0,
    id: 0,
    name: '',
    range: [64, 64],
    scale: 'auto',
    type: 'number',
    unit: '',
  },
  Ml = (e, t) => {
    var r = e.cartesianAxis.zAxis[t];
    return r ?? XO;
  },
  Ee = (e, t, r) => {
    switch (t) {
      case 'xAxis':
        return Pt(e, r);
      case 'yAxis':
        return $t(e, r);
      case 'zAxis':
        return Ml(e, r);
      case 'angleAxis':
        return El(e, r);
      case 'radiusAxis':
        return _l(e, r);
      default:
        throw new Error('Unexpected axis type: '.concat(t));
    }
  },
  ZO = (e, t, r) => {
    switch (t) {
      case 'xAxis':
        return Pt(e, r);
      case 'yAxis':
        return $t(e, r);
      default:
        throw new Error('Unexpected axis type: '.concat(t));
    }
  },
  un = (e, t, r) => {
    switch (t) {
      case 'xAxis':
        return Pt(e, r);
      case 'yAxis':
        return $t(e, r);
      case 'angleAxis':
        return El(e, r);
      case 'radiusAxis':
        return _l(e, r);
      default:
        throw new Error('Unexpected axis type: '.concat(t));
    }
  },
  Ep = (e) =>
    e.graphicalItems.cartesianItems.some((t) => t.type === 'bar') ||
    e.graphicalItems.polarItems.some((t) => t.type === 'radialBar');
function _p(e, t) {
  return (r) => {
    switch (e) {
      case 'xAxis':
        return 'xAxisId' in r && r.xAxisId === t;
      case 'yAxis':
        return 'yAxisId' in r && r.yAxisId === t;
      case 'zAxis':
        return 'zAxisId' in r && r.zAxisId === t;
      case 'angleAxis':
        return 'angleAxisId' in r && r.angleAxisId === t;
      case 'radiusAxis':
        return 'radiusAxisId' in r && r.radiusAxisId === t;
      default:
        return !1;
    }
  };
}
var kl = (e) => e.graphicalItems.cartesianItems,
  JO = A([ne, $i], _p),
  Tp = (e, t, r) => e.filter(r).filter((n) => (t?.includeHidden === !0 ? !0 : !n.hide)),
  ln = A([kl, Ee, JO], Tp),
  Cp = A([ln], (e) => e.filter((t) => t.type === 'area' || t.type === 'bar').filter(jl)),
  jp = (e) => e.filter((t) => !('stackId' in t) || t.stackId === void 0),
  Mp = A([ln], jp),
  kp = (e) =>
    e
      .map((t) => t.data)
      .filter(Boolean)
      .flat(1),
  QO = A([ln], kp),
  Ip = (e, t) => {
    var { chartData: r = [], dataStartIndex: n, dataEndIndex: i } = t;
    return e.length > 0 ? e : r.slice(n, i + 1);
  },
  Il = A([QO, Mi], Ip),
  Dp = (e, t, r) =>
    t?.dataKey != null
      ? e.map((n) => ({ value: pe(n, t.dataKey) }))
      : r.length > 0
        ? r.map((n) => n.dataKey).flatMap((n) => e.map((i) => ({ value: pe(i, n) })))
        : e.map((n) => ({ value: n })),
  Ri = A([Il, Ee, ln], Dp);
function Np(e, t) {
  switch (e) {
    case 'xAxis':
      return t.direction === 'x';
    case 'yAxis':
      return t.direction === 'y';
    default:
      return !1;
  }
}
function ar(e) {
  return e
    .filter((t) => it(t) || t instanceof Date)
    .map(Number)
    .filter((t) => $e(t) === !1);
}
function eA(e, t, r) {
  return !r || typeof t != 'number' || $e(t)
    ? []
    : r.length
      ? ar(
          r.flatMap((n) => {
            var i = pe(e, n.dataKey),
              a,
              o;
            if ((Array.isArray(i) ? ([a, o] = i) : (a = o = i), !(!xe(a) || !xe(o))))
              return [t - a, t + o];
          })
        )
      : [];
}
var tA = A([Cp, Mi, le], Sp),
  $p = (e, t, r) => {
    var n = {},
      i = t.reduce(
        (a, o) => (
          o.stackId == null || (a[o.stackId] == null && (a[o.stackId] = []), a[o.stackId].push(o)),
          a
        ),
        n
      );
    return Object.fromEntries(
      Object.entries(i).map((a) => {
        var [o, u] = a,
          l = u.map(Cl);
        return [o, { stackedData: Jb(e, l, r), graphicalItems: u }];
      })
    );
  },
  lu = A([tA, Cp, Ii], $p),
  Rp = (e, t, r) => {
    var { dataStartIndex: n, dataEndIndex: i } = t;
    if (r !== 'zAxis') {
      var a = rw(e, n, i);
      if (!(a != null && a[0] === 0 && a[1] === 0)) return a;
    }
  },
  rA = A([lu, Nt, ne], Rp),
  Lp = (e, t, r, n, i) =>
    r.length > 0
      ? e
          .flatMap((a) =>
            r.flatMap((o) => {
              var u,
                l,
                s = (u = n[o.id]) === null || u === void 0 ? void 0 : u.filter((f) => Np(i, f)),
                c = pe(a, (l = t.dataKey) !== null && l !== void 0 ? l : o.dataKey);
              return { value: c, errorDomain: eA(a, c, s) };
            })
          )
          .filter(Boolean)
      : t?.dataKey != null
        ? e.map((a) => ({ value: pe(a, t.dataKey), errorDomain: [] }))
        : e.map((a) => ({ value: a, errorDomain: [] })),
  Li = (e) => e.errorBars,
  Bp = (e, t, r) =>
    e
      .flatMap((n) => t[n.id])
      .filter(Boolean)
      .filter((n) => Np(r, n));
A([Mp, Li, ne], Bp);
var nA = A([Il, Ee, Mp, Li, ne], Lp);
function iA(e) {
  var { value: t } = e;
  if (it(t) || t instanceof Date) return t;
}
var Vf = (e) => {
    var t = e.flatMap((n) => [n.value, n.errorDomain]).flat(1),
      r = ar(t);
    if (r.length !== 0) return [Math.min(...r), Math.max(...r)];
  },
  aA = (e, t, r) => {
    var n = e.map(iA).filter((i) => i != null);
    return r && (t.dataKey == null || (t.allowDuplicatedCategory && th(n)))
      ? Av(0, e.length)
      : t.allowDuplicatedCategory
        ? n
        : Array.from(new Set(n));
  },
  Dl = (e) => {
    var t;
    if (e == null || !('domain' in e)) return uu;
    if (e.domain != null) return e.domain;
    if (e.ticks != null) {
      if (e.type === 'number') {
        var r = ar(e.ticks);
        return [Math.min(...r), Math.max(...r)];
      }
      if (e.type === 'category') return e.ticks.map(String);
    }
    return (t = e?.domain) !== null && t !== void 0 ? t : uu;
  },
  ni = function () {
    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
    var i = r.filter(Boolean);
    if (i.length !== 0) {
      var a = i.flat(),
        o = Math.min(...a),
        u = Math.max(...a);
      return [o, u];
    }
  },
  qp = (e) => e.referenceElements.dots,
  Sr = (e, t, r) =>
    e
      .filter((n) => n.ifOverflow === 'extendDomain')
      .filter((n) => (t === 'xAxis' ? n.xAxisId === r : n.yAxisId === r)),
  oA = A([qp, ne, $i], Sr),
  zp = (e) => e.referenceElements.areas,
  uA = A([zp, ne, $i], Sr),
  Fp = (e) => e.referenceElements.lines,
  lA = A([Fp, ne, $i], Sr),
  Kp = (e, t) => {
    var r = ar(e.map((n) => (t === 'xAxis' ? n.x : n.y)));
    if (r.length !== 0) return [Math.min(...r), Math.max(...r)];
  },
  cA = A(oA, ne, Kp),
  Wp = (e, t) => {
    var r = ar(e.flatMap((n) => [t === 'xAxis' ? n.x1 : n.y1, t === 'xAxis' ? n.x2 : n.y2]));
    if (r.length !== 0) return [Math.min(...r), Math.max(...r)];
  },
  sA = A([uA, ne], Wp),
  Up = (e, t) => {
    var r = ar(e.map((n) => (t === 'xAxis' ? n.x : n.y)));
    if (r.length !== 0) return [Math.min(...r), Math.max(...r)];
  },
  fA = A(lA, ne, Up),
  dA = A(cA, fA, sA, (e, t, r) => ni(e, r, t)),
  hA = A([Ee], Dl),
  Hp = (e, t, r, n, i, a, o) => {
    var u = TO(t, e.allowDataOverflow);
    if (u != null) return u;
    var l = (a === 'vertical' && o === 'xAxis') || (a === 'horizontal' && o === 'yAxis'),
      s = l ? ni(r, i, Vf(n)) : ni(i, Vf(n));
    return CO(t, s, e.allowDataOverflow);
  },
  vA = A([Ee, hA, rA, nA, dA, U, ne], Hp),
  pA = [0, 1],
  Yp = (e, t, r, n, i, a, o) => {
    if (!((e == null || r == null || r.length === 0) && o === void 0)) {
      var { dataKey: u, type: l } = e,
        s = ot(t, a);
      return s && u == null
        ? Av(0, r.length)
        : l === 'category'
          ? aA(n, e, s)
          : i === 'expand'
            ? pA
            : o;
    }
  },
  Nl = A([Ee, U, Il, Ri, Ii, ne, vA], Yp),
  Gp = (e, t, r, n, i) => {
    if (e != null) {
      var { scale: a, type: o } = e;
      if (a === 'auto')
        return t === 'radial' && i === 'radiusAxis'
          ? 'band'
          : t === 'radial' && i === 'angleAxis'
            ? 'linear'
            : o === 'category' &&
                n &&
                (n.indexOf('LineChart') >= 0 ||
                  n.indexOf('AreaChart') >= 0 ||
                  (n.indexOf('ComposedChart') >= 0 && !r))
              ? 'point'
              : o === 'category'
                ? 'band'
                : 'linear';
      if (typeof a == 'string') {
        var u = 'scale'.concat(Qr(a));
        return u in Rr ? u : 'point';
      }
    }
  },
  cn = A([Ee, U, Ep, Ol, ne], Gp);
function mA(e) {
  if (e != null) {
    if (e in Rr) return Rr[e]();
    var t = 'scale'.concat(Qr(e));
    if (t in Rr) return Rr[t]();
  }
}
function $l(e, t, r, n) {
  if (!(r == null || n == null)) {
    if (typeof e.scale == 'function') return e.scale.copy().domain(r).range(n);
    var i = mA(t);
    if (i != null) {
      var a = i.domain(r).range(n);
      return (Gb(a), a);
    }
  }
}
var Vp = (e, t, r) => {
    var n = Dl(t);
    if (!(r !== 'auto' && r !== 'linear')) {
      if (
        t != null &&
        t.tickCount &&
        Array.isArray(n) &&
        (n[0] === 'auto' || n[1] === 'auto') &&
        br(e)
      )
        return BO(e, t.tickCount, t.allowDecimals);
      if (t != null && t.tickCount && t.type === 'number' && br(e))
        return qO(e, t.tickCount, t.allowDecimals);
    }
  },
  Rl = A([Nl, un, cn], Vp),
  Xp = (e, t, r, n) => {
    if (n !== 'angleAxis' && e?.type === 'number' && br(t) && Array.isArray(r) && r.length > 0) {
      var i = t[0],
        a = r[0],
        o = t[1],
        u = r[r.length - 1];
      return [Math.min(i, a), Math.max(o, u)];
    }
    return t;
  },
  yA = A([Ee, Nl, Rl, ne], Xp),
  gA = A(Ri, Ee, (e, t) => {
    if (!(!t || t.type !== 'number')) {
      var r = 1 / 0,
        n = Array.from(ar(e.map((u) => u.value))).sort((u, l) => u - l);
      if (n.length < 2) return 1 / 0;
      var i = n[n.length - 1] - n[0];
      if (i === 0) return 1 / 0;
      for (var a = 0; a < n.length - 1; a++) {
        var o = n[a + 1] - n[a];
        r = Math.min(r, o);
      }
      return r / i;
    }
  }),
  Zp = A(
    gA,
    U,
    zO,
    ye,
    (e, t, r, n) => n,
    (e, t, r, n, i) => {
      if (!xe(e)) return 0;
      var a = t === 'vertical' ? n.height : n.width;
      if (i === 'gap') return (e * a) / 2;
      if (i === 'no-gap') {
        var o = jt(r, e * a),
          u = (e * a) / 2;
        return u - o - ((u - o) / a) * o;
      }
      return 0;
    }
  ),
  bA = (e, t) => {
    var r = Pt(e, t);
    return r == null || typeof r.padding != 'string' ? 0 : Zp(e, 'xAxis', t, r.padding);
  },
  wA = (e, t) => {
    var r = $t(e, t);
    return r == null || typeof r.padding != 'string' ? 0 : Zp(e, 'yAxis', t, r.padding);
  },
  xA = A(Pt, bA, (e, t) => {
    var r, n;
    if (e == null) return { left: 0, right: 0 };
    var { padding: i } = e;
    return typeof i == 'string'
      ? { left: t, right: t }
      : {
          left: ((r = i.left) !== null && r !== void 0 ? r : 0) + t,
          right: ((n = i.right) !== null && n !== void 0 ? n : 0) + t,
        };
  }),
  PA = A($t, wA, (e, t) => {
    var r, n;
    if (e == null) return { top: 0, bottom: 0 };
    var { padding: i } = e;
    return typeof i == 'string'
      ? { top: t, bottom: t }
      : {
          top: ((r = i.top) !== null && r !== void 0 ? r : 0) + t,
          bottom: ((n = i.bottom) !== null && n !== void 0 ? n : 0) + t,
        };
  }),
  OA = A([ye, xA, Oi, Pi, (e, t, r) => r], (e, t, r, n, i) => {
    var { padding: a } = n;
    return i ? [a.left, r.width - a.right] : [e.left + t.left, e.left + e.width - t.right];
  }),
  AA = A([ye, U, PA, Oi, Pi, (e, t, r) => r], (e, t, r, n, i, a) => {
    var { padding: o } = i;
    return a
      ? [n.height - o.bottom, o.top]
      : t === 'horizontal'
        ? [e.top + e.height - r.bottom, e.top + r.top]
        : [e.top + r.top, e.top + e.height - r.bottom];
  }),
  sn = (e, t, r, n) => {
    var i;
    switch (t) {
      case 'xAxis':
        return OA(e, r, n);
      case 'yAxis':
        return AA(e, r, n);
      case 'zAxis':
        return (i = Ml(e, r)) === null || i === void 0 ? void 0 : i.range;
      case 'angleAxis':
        return Pp(e);
      case 'radiusAxis':
        return Op(e, r);
      default:
        return;
    }
  },
  Jp = A([Ee, sn], Di),
  Er = A([Ee, cn, yA, Jp], $l);
A([ln, Li, ne], Bp);
function Qp(e, t) {
  return e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
}
var Bi = (e, t) => t,
  qi = (e, t, r) => r,
  SA = A(Wu, Bi, qi, (e, t, r) =>
    e
      .filter((n) => n.orientation === t)
      .filter((n) => n.mirror === r)
      .sort(Qp)
  ),
  EA = A(Uu, Bi, qi, (e, t, r) =>
    e
      .filter((n) => n.orientation === t)
      .filter((n) => n.mirror === r)
      .sort(Qp)
  ),
  em = (e, t) => ({ width: e.width, height: t.height }),
  _A = (e, t) => {
    var r = typeof t.width == 'number' ? t.width : xi;
    return { width: r, height: e.height };
  },
  TA = A(ye, Pt, em),
  CA = (e, t, r) => {
    switch (t) {
      case 'top':
        return e.top;
      case 'bottom':
        return r - e.bottom;
      default:
        return 0;
    }
  },
  jA = (e, t, r) => {
    switch (t) {
      case 'left':
        return e.left;
      case 'right':
        return r - e.right;
      default:
        return 0;
    }
  },
  MA = A(wt, ye, SA, Bi, qi, (e, t, r, n, i) => {
    var a = {},
      o;
    return (
      r.forEach((u) => {
        var l = em(t, u);
        o == null && (o = CA(t, n, e));
        var s = (n === 'top' && !i) || (n === 'bottom' && i);
        ((a[u.id] = o - Number(s) * l.height), (o += (s ? -1 : 1) * l.height));
      }),
      a
    );
  }),
  kA = A(bt, ye, EA, Bi, qi, (e, t, r, n, i) => {
    var a = {},
      o;
    return (
      r.forEach((u) => {
        var l = _A(t, u);
        o == null && (o = jA(t, n, e));
        var s = (n === 'left' && !i) || (n === 'right' && i);
        ((a[u.id] = o - Number(s) * l.width), (o += (s ? -1 : 1) * l.width));
      }),
      a
    );
  }),
  IA = (e, t) => {
    var r = ye(e),
      n = Pt(e, t);
    if (n != null) {
      var i = MA(e, n.orientation, n.mirror),
        a = i[t];
      return a == null ? { x: r.left, y: 0 } : { x: r.left, y: a };
    }
  },
  DA = (e, t) => {
    var r = ye(e),
      n = $t(e, t);
    if (n != null) {
      var i = kA(e, n.orientation, n.mirror),
        a = i[t];
      return a == null ? { x: 0, y: r.top } : { x: a, y: r.top };
    }
  },
  NA = A(ye, $t, (e, t) => {
    var r = typeof t.width == 'number' ? t.width : xi;
    return { width: r, height: e.height };
  }),
  tm = (e, t, r, n) => {
    if (r != null) {
      var { allowDuplicatedCategory: i, type: a, dataKey: o } = r,
        u = ot(e, n),
        l = t.map((s) => s.value);
      if (o && u && a === 'category' && i && th(l)) return l;
    }
  },
  Ll = A([U, Ri, Ee, ne], tm),
  rm = (e, t, r, n) => {
    if (!(r == null || r.dataKey == null)) {
      var { type: i, scale: a } = r,
        o = ot(e, n);
      if (o && (i === 'number' || a !== 'auto')) return t.map((u) => u.value);
    }
  },
  Bl = A([U, Ri, un, ne], rm),
  Xf = A([U, ZO, cn, Er, Ll, Bl, sn, Rl, ne], (e, t, r, n, i, a, o, u, l) => {
    if (t == null) return null;
    var s = ot(e, l);
    return {
      angle: t.angle,
      interval: t.interval,
      minTickGap: t.minTickGap,
      orientation: t.orientation,
      tick: t.tick,
      tickCount: t.tickCount,
      tickFormatter: t.tickFormatter,
      ticks: t.ticks,
      type: t.type,
      unit: t.unit,
      axisType: l,
      categoricalDomain: a,
      duplicateDomain: i,
      isCategorical: s,
      niceTicks: u,
      range: o,
      realScaleType: r,
      scale: n,
    };
  }),
  $A = (e, t, r, n, i, a, o, u, l) => {
    if (!(t == null || n == null)) {
      var s = ot(e, l),
        { type: c, ticks: f, tickCount: d } = t,
        h = r === 'scaleBand' && typeof n.bandwidth == 'function' ? n.bandwidth() / 2 : 2,
        v = c === 'category' && n.bandwidth ? n.bandwidth() / h : 0;
      v = l === 'angleAxis' && a != null && a.length >= 2 ? Ue(a[0] - a[1]) * 2 * v : v;
      var p = f || i;
      if (p) {
        var m = p.map((g, w) => {
          var b = o ? o.indexOf(g) : g;
          return { index: w, coordinate: n(b) + v, value: g, offset: v };
        });
        return m.filter((g) => !$e(g.coordinate));
      }
      return s && u
        ? u.map((g, w) => ({ coordinate: n(g) + v, value: g, index: w, offset: v }))
        : n.ticks
          ? n.ticks(d).map((g) => ({ coordinate: n(g) + v, value: g, offset: v }))
          : n
              .domain()
              .map((g, w) => ({ coordinate: n(g) + v, value: o ? o[g] : g, index: w, offset: v }));
    }
  },
  nm = A([U, un, cn, Er, Rl, sn, Ll, Bl, ne], $A),
  RA = (e, t, r, n, i, a, o) => {
    if (!(t == null || r == null || n == null || n[0] === n[1])) {
      var u = ot(e, o),
        { tickCount: l } = t,
        s = 0;
      return (
        (s = o === 'angleAxis' && n?.length >= 2 ? Ue(n[0] - n[1]) * 2 * s : s),
        u && a
          ? a.map((c, f) => ({ coordinate: r(c) + s, value: c, index: f, offset: s }))
          : r.ticks
            ? r.ticks(l).map((c) => ({ coordinate: r(c) + s, value: c, offset: s }))
            : r
                .domain()
                .map((c, f) => ({ coordinate: r(c) + s, value: i ? i[c] : c, index: f, offset: s }))
      );
    }
  },
  zi = A([U, un, Er, sn, Ll, Bl, ne], RA),
  Fi = A(Ee, Er, (e, t) => {
    if (!(e == null || t == null)) return ri(ri({}, e), {}, { scale: t });
  }),
  LA = A([Ee, cn, Nl, Jp], $l);
A(
  (e, t, r) => Ml(e, r),
  LA,
  (e, t) => {
    if (!(e == null || t == null)) return ri(ri({}, e), {}, { scale: t });
  }
);
var BA = A([U, Wu, Uu], (e, t, r) => {
    switch (e) {
      case 'horizontal':
        return t.some((n) => n.reversed) ? 'right-to-left' : 'left-to-right';
      case 'vertical':
        return r.some((n) => n.reversed) ? 'bottom-to-top' : 'top-to-bottom';
      case 'centric':
      case 'radial':
        return 'left-to-right';
      default:
        return;
    }
  }),
  im = (e) => e.options.defaultTooltipEventType,
  am = (e) => e.options.validateTooltipEventTypes;
function om(e, t, r) {
  if (e == null) return t;
  var n = e ? 'axis' : 'item';
  return r == null ? t : r.includes(n) ? n : t;
}
function ql(e, t) {
  var r = im(e),
    n = am(e);
  return om(t, r, n);
}
function qA(e) {
  return D((t) => ql(t, e));
}
var um = (e, t) => {
    var r,
      n = Number(t);
    if (!($e(n) || t == null))
      return n >= 0
        ? e == null || (r = e[n]) === null || r === void 0
          ? void 0
          : r.value
        : void 0;
  },
  zA = (e) => e.tooltip.settings,
  _t = { active: !1, index: null, dataKey: void 0, coordinate: void 0 },
  FA = {
    itemInteraction: { click: _t, hover: _t },
    axisInteraction: { click: _t, hover: _t },
    keyboardInteraction: _t,
    syncInteraction: {
      active: !1,
      index: null,
      dataKey: void 0,
      label: void 0,
      coordinate: void 0,
    },
    tooltipItemPayloads: [],
    settings: { shared: void 0, trigger: 'hover', axisId: 0, active: !1, defaultIndex: void 0 },
  },
  lm = Le({
    name: 'tooltip',
    initialState: FA,
    reducers: {
      addTooltipEntrySettings(e, t) {
        e.tooltipItemPayloads.push(t.payload);
      },
      removeTooltipEntrySettings(e, t) {
        var r = dt(e).tooltipItemPayloads.indexOf(t.payload);
        r > -1 && e.tooltipItemPayloads.splice(r, 1);
      },
      setTooltipSettingsState(e, t) {
        e.settings = t.payload;
      },
      setActiveMouseOverItemIndex(e, t) {
        ((e.syncInteraction.active = !1),
          (e.keyboardInteraction.active = !1),
          (e.itemInteraction.hover.active = !0),
          (e.itemInteraction.hover.index = t.payload.activeIndex),
          (e.itemInteraction.hover.dataKey = t.payload.activeDataKey),
          (e.itemInteraction.hover.coordinate = t.payload.activeCoordinate));
      },
      mouseLeaveChart(e) {
        ((e.itemInteraction.hover.active = !1), (e.axisInteraction.hover.active = !1));
      },
      mouseLeaveItem(e) {
        e.itemInteraction.hover.active = !1;
      },
      setActiveClickItemIndex(e, t) {
        ((e.syncInteraction.active = !1),
          (e.itemInteraction.click.active = !0),
          (e.keyboardInteraction.active = !1),
          (e.itemInteraction.click.index = t.payload.activeIndex),
          (e.itemInteraction.click.dataKey = t.payload.activeDataKey),
          (e.itemInteraction.click.coordinate = t.payload.activeCoordinate));
      },
      setMouseOverAxisIndex(e, t) {
        ((e.syncInteraction.active = !1),
          (e.axisInteraction.hover.active = !0),
          (e.keyboardInteraction.active = !1),
          (e.axisInteraction.hover.index = t.payload.activeIndex),
          (e.axisInteraction.hover.dataKey = t.payload.activeDataKey),
          (e.axisInteraction.hover.coordinate = t.payload.activeCoordinate));
      },
      setMouseClickAxisIndex(e, t) {
        ((e.syncInteraction.active = !1),
          (e.keyboardInteraction.active = !1),
          (e.axisInteraction.click.active = !0),
          (e.axisInteraction.click.index = t.payload.activeIndex),
          (e.axisInteraction.click.dataKey = t.payload.activeDataKey),
          (e.axisInteraction.click.coordinate = t.payload.activeCoordinate));
      },
      setSyncInteraction(e, t) {
        e.syncInteraction = t.payload;
      },
      setKeyboardInteraction(e, t) {
        ((e.keyboardInteraction.active = t.payload.active),
          (e.keyboardInteraction.index = t.payload.activeIndex),
          (e.keyboardInteraction.coordinate = t.payload.activeCoordinate),
          (e.keyboardInteraction.dataKey = t.payload.activeDataKey));
      },
    },
  }),
  {
    addTooltipEntrySettings: KA,
    removeTooltipEntrySettings: WA,
    setTooltipSettingsState: UA,
    setActiveMouseOverItemIndex: HA,
    mouseLeaveItem: hM,
    mouseLeaveChart: cm,
    setActiveClickItemIndex: vM,
    setMouseOverAxisIndex: sm,
    setMouseClickAxisIndex: YA,
    setSyncInteraction: cu,
    setKeyboardInteraction: su,
  } = lm.actions,
  GA = lm.reducer;
function Zf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Sn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Zf(Object(r), !0).forEach(function (n) {
          VA(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Zf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function VA(e, t, r) {
  return (
    (t = XA(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function XA(e) {
  var t = ZA(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function ZA(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function JA(e, t, r) {
  return t === 'axis'
    ? r === 'click'
      ? e.axisInteraction.click
      : e.axisInteraction.hover
    : r === 'click'
      ? e.itemInteraction.click
      : e.itemInteraction.hover;
}
function QA(e) {
  return e.index != null;
}
var fm = (e, t, r, n) => {
    if (t == null) return _t;
    var i = JA(e, t, r);
    if (i == null) return _t;
    if (i.active) return i;
    if (e.keyboardInteraction.active) return e.keyboardInteraction;
    if (e.syncInteraction.active && e.syncInteraction.index != null) return e.syncInteraction;
    var a = e.settings.active === !0;
    if (QA(i)) {
      if (a) return Sn(Sn({}, i), {}, { active: !0 });
    } else if (n != null) return { active: !0, coordinate: void 0, dataKey: void 0, index: n };
    return Sn(Sn({}, _t), {}, { coordinate: i.coordinate });
  },
  zl = (e, t) => {
    var r = e?.index;
    if (r == null) return null;
    var n = Number(r);
    if (!xe(n)) return r;
    var i = 0,
      a = 1 / 0;
    return (t.length > 0 && (a = t.length - 1), String(Math.max(i, Math.min(n, a))));
  },
  dm = (e, t, r, n, i, a, o, u) => {
    if (!(a == null || u == null)) {
      var l = o[0],
        s = l == null ? void 0 : u(l.positions, a);
      if (s != null) return s;
      var c = i?.[Number(a)];
      if (c)
        switch (r) {
          case 'horizontal':
            return { x: c.coordinate, y: (n.top + t) / 2 };
          default:
            return { x: (n.left + e) / 2, y: c.coordinate };
        }
    }
  },
  hm = (e, t, r, n) => {
    if (t === 'axis') return e.tooltipItemPayloads;
    if (e.tooltipItemPayloads.length === 0) return [];
    var i;
    return (
      r === 'hover' ? (i = e.itemInteraction.hover.dataKey) : (i = e.itemInteraction.click.dataKey),
      i == null && n != null
        ? [e.tooltipItemPayloads[0]]
        : e.tooltipItemPayloads.filter((a) => {
            var o;
            return ((o = a.settings) === null || o === void 0 ? void 0 : o.dataKey) === i;
          })
    );
  },
  fn = (e) => e.options.tooltipPayloadSearcher,
  _r = (e) => e.tooltip;
function Jf(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Qf(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Jf(Object(r), !0).forEach(function (n) {
          eS(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Jf(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function eS(e, t, r) {
  return (
    (t = tS(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function tS(e) {
  var t = rS(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function rS(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function nS(e, t) {
  return e ?? t;
}
var vm = (e, t, r, n, i, a, o) => {
    if (!(t == null || a == null)) {
      var { chartData: u, computedData: l, dataStartIndex: s, dataEndIndex: c } = r,
        f = [];
      return e.reduce((d, h) => {
        var v,
          { dataDefinedOnItem: p, settings: m } = h,
          g = nS(p, u),
          w = Array.isArray(g) ? lv(g, s, c) : g,
          b = (v = m?.dataKey) !== null && v !== void 0 ? v : n?.dataKey,
          P = m?.nameKey,
          x;
        if (
          (n != null && n.dataKey && Array.isArray(w) && !Array.isArray(w[0]) && o === 'axis'
            ? (x = rh(w, n.dataKey, i))
            : (x = a(w, t, l, P)),
          Array.isArray(x))
        )
          x.forEach((S) => {
            var _ = Qf(Qf({}, m), {}, { name: S.name, unit: S.unit, color: void 0, fill: void 0 });
            d.push(
              Ms({
                tooltipEntrySettings: _,
                dataKey: S.dataKey,
                payload: S.payload,
                value: pe(S.payload, S.dataKey),
                name: S.name,
              })
            );
          });
        else {
          var O;
          d.push(
            Ms({
              tooltipEntrySettings: m,
              dataKey: b,
              payload: x,
              value: pe(x, b),
              name: (O = pe(x, P)) !== null && O !== void 0 ? O : m?.name,
            })
          );
        }
        return d;
      }, f);
    }
  },
  Fl = A([le, U, Ep, Ol, ue], Gp),
  iS = A([(e) => e.graphicalItems.cartesianItems, (e) => e.graphicalItems.polarItems], (e, t) => [
    ...e,
    ...t,
  ]),
  aS = A([ue, Ar], _p),
  dn = A([iS, le, aS], Tp),
  oS = A([dn], (e) => e.filter(jl)),
  uS = A([dn], kp),
  Tr = A([uS, Nt], Ip),
  lS = A([oS, Nt, le], Sp),
  Kl = A([Tr, le, dn], Dp),
  cS = A([le], Dl),
  sS = A([dn], (e) => e.filter(jl)),
  fS = A([lS, sS, Ii], $p),
  dS = A([fS, Nt, ue], Rp),
  hS = A([dn], jp),
  vS = A([Tr, le, hS, Li, ue], Lp),
  pS = A([qp, ue, Ar], Sr),
  mS = A([pS, ue], Kp),
  yS = A([zp, ue, Ar], Sr),
  gS = A([yS, ue], Wp),
  bS = A([Fp, ue, Ar], Sr),
  wS = A([bS, ue], Up),
  xS = A([mS, wS, gS], ni),
  PS = A([le, cS, dS, vS, xS, U, ue], Hp),
  pm = A([le, U, Tr, Kl, Ii, ue, PS], Yp),
  OS = A([pm, le, Fl], Vp),
  AS = A([le, pm, OS, ue], Xp),
  mm = (e) => {
    var t = ue(e),
      r = Ar(e),
      n = !1;
    return sn(e, t, r, n);
  },
  ym = A([le, mm], Di),
  gm = A([le, Fl, AS, ym], $l),
  SS = A([U, Kl, le, ue], tm),
  ES = A([U, Kl, le, ue], rm),
  _S = (e, t, r, n, i, a, o, u) => {
    if (t) {
      var { type: l } = t,
        s = ot(e, u);
      if (n) {
        var c = r === 'scaleBand' && n.bandwidth ? n.bandwidth() / 2 : 2,
          f = l === 'category' && n.bandwidth ? n.bandwidth() / c : 0;
        return (
          (f = u === 'angleAxis' && i != null && i?.length >= 2 ? Ue(i[0] - i[1]) * 2 * f : f),
          s && o
            ? o.map((d, h) => ({ coordinate: n(d) + f, value: d, index: h, offset: f }))
            : n
                .domain()
                .map((d, h) => ({ coordinate: n(d) + f, value: a ? a[d] : d, index: h, offset: f }))
        );
      }
    }
  },
  Ot = A([U, le, Fl, gm, mm, SS, ES, ue], _S),
  Wl = A([im, am, zA], (e, t, r) => om(r.shared, e, t)),
  bm = (e) => e.tooltip.settings.trigger,
  Ul = (e) => e.tooltip.settings.defaultIndex,
  Ki = A([_r, Wl, bm, Ul], fm),
  Zr = A([Ki, Tr], zl),
  wm = A([Ot, Zr], um),
  TS = A([Ki], (e) => {
    if (e) return e.dataKey;
  }),
  xm = A([_r, Wl, bm, Ul], hm),
  CS = A([bt, wt, U, ye, Ot, Ul, xm, fn], dm),
  jS = A([Ki, CS], (e, t) => (e != null && e.coordinate ? e.coordinate : t)),
  MS = A([Ki], (e) => e.active),
  kS = A([xm, Zr, Nt, le, wm, fn, Wl], vm),
  IS = A([kS], (e) => {
    if (e != null) {
      var t = e.map((r) => r.payload).filter((r) => r != null);
      return Array.from(new Set(t));
    }
  });
function ed(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function td(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? ed(Object(r), !0).forEach(function (n) {
          DS(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : ed(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function DS(e, t, r) {
  return (
    (t = NS(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function NS(e) {
  var t = $S(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function $S(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var RS = () => D(le),
  LS = () => {
    var e = RS(),
      t = D(Ot),
      r = D(gm);
    return Wr(td(td({}, e), {}, { scale: r }), t);
  },
  Pm = () => D(Ol),
  Hl = (e, t) => t,
  Om = (e, t, r) => r,
  Yl = (e, t, r, n) => n,
  BS = A(Ot, (e) => vi(e, (t) => t.coordinate)),
  Gl = A([_r, Hl, Om, Yl], fm),
  Am = A([Gl, Tr], zl),
  qS = (e, t, r) => {
    if (t != null) {
      var n = _r(e);
      return t === 'axis'
        ? r === 'hover'
          ? n.axisInteraction.hover.dataKey
          : n.axisInteraction.click.dataKey
        : r === 'hover'
          ? n.itemInteraction.hover.dataKey
          : n.itemInteraction.click.dataKey;
    }
  },
  Sm = A([_r, Hl, Om, Yl], hm),
  ii = A([bt, wt, U, ye, Ot, Yl, Sm, fn], dm),
  zS = A([Gl, ii], (e, t) => {
    var r;
    return (r = e.coordinate) !== null && r !== void 0 ? r : t;
  }),
  Em = A(Ot, Am, um),
  FS = A([Sm, Am, Nt, le, Em, fn, Hl], vm),
  KS = A([Gl], (e) => ({ isActive: e.active, activeIndex: e.index })),
  WS = (e, t, r, n, i, a, o, u) => {
    if (!(!e || !t || !n || !i || !a)) {
      var l = nw(e.chartX, e.chartY, t, r, u);
      if (l) {
        var s = aw(l, t),
          c = Hb(s, o, a, n, i),
          f = iw(t, a, c, l);
        return { activeIndex: String(c), activeCoordinate: f };
      }
    }
  };
function fu() {
  return (
    (fu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    fu.apply(null, arguments)
  );
}
function rd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function En(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? rd(Object(r), !0).forEach(function (n) {
          US(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : rd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function US(e, t, r) {
  return (
    (t = HS(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function HS(e) {
  var t = YS(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function YS(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function GS(e) {
  var {
      coordinate: t,
      payload: r,
      index: n,
      offset: i,
      tooltipAxisBandSize: a,
      layout: o,
      cursor: u,
      tooltipEventType: l,
      chartName: s,
    } = e,
    c = t,
    f = r,
    d = n;
  if (!u || !c || (s !== 'ScatterChart' && l !== 'axis')) return null;
  var h, v;
  if (s === 'ScatterChart') ((h = c), (v = ox));
  else if (s === 'BarChart') ((h = ux(o, c, i, a)), (v = Fx));
  else if (o === 'radial') {
    var { cx: p, cy: m, radius: g, startAngle: w, endAngle: b } = Pv(c);
    ((h = { cx: p, cy: m, startAngle: w, endAngle: b, innerRadius: g, outerRadius: g }), (v = Hx));
  } else ((h = { points: Yx(o, c, i) }), (v = Lr));
  var P = typeof u == 'object' && 'className' in u ? u.className : void 0,
    x = En(
      En(En(En({ stroke: '#ccc', pointerEvents: 'none' }, i), h), ee(u, !1)),
      {},
      { payload: f, payloadIndex: d, className: K('recharts-tooltip-cursor', P) }
    );
  return y.isValidElement(u) ? y.cloneElement(u, x) : y.createElement(v, x);
}
function VS(e) {
  var t = LS(),
    r = hv(),
    n = Ai(),
    i = Pm();
  return y.createElement(
    GS,
    fu({}, e, {
      coordinate: e.coordinate,
      index: e.index,
      payload: e.payload,
      offset: r,
      layout: n,
      tooltipAxisBandSize: t,
      chartName: i,
    })
  );
}
var _m = y.createContext(null),
  XS = () => y.useContext(_m),
  fo = { exports: {} },
  nd;
function ZS() {
  return (
    nd ||
      ((nd = 1),
      (function (e) {
        var t = Object.prototype.hasOwnProperty,
          r = '~';
        function n() {}
        Object.create && ((n.prototype = Object.create(null)), new n().__proto__ || (r = !1));
        function i(l, s, c) {
          ((this.fn = l), (this.context = s), (this.once = c || !1));
        }
        function a(l, s, c, f, d) {
          if (typeof c != 'function') throw new TypeError('The listener must be a function');
          var h = new i(c, f || l, d),
            v = r ? r + s : s;
          return (
            l._events[v]
              ? l._events[v].fn
                ? (l._events[v] = [l._events[v], h])
                : l._events[v].push(h)
              : ((l._events[v] = h), l._eventsCount++),
            l
          );
        }
        function o(l, s) {
          --l._eventsCount === 0 ? (l._events = new n()) : delete l._events[s];
        }
        function u() {
          ((this._events = new n()), (this._eventsCount = 0));
        }
        ((u.prototype.eventNames = function () {
          var s = [],
            c,
            f;
          if (this._eventsCount === 0) return s;
          for (f in (c = this._events)) t.call(c, f) && s.push(r ? f.slice(1) : f);
          return Object.getOwnPropertySymbols ? s.concat(Object.getOwnPropertySymbols(c)) : s;
        }),
          (u.prototype.listeners = function (s) {
            var c = r ? r + s : s,
              f = this._events[c];
            if (!f) return [];
            if (f.fn) return [f.fn];
            for (var d = 0, h = f.length, v = new Array(h); d < h; d++) v[d] = f[d].fn;
            return v;
          }),
          (u.prototype.listenerCount = function (s) {
            var c = r ? r + s : s,
              f = this._events[c];
            return f ? (f.fn ? 1 : f.length) : 0;
          }),
          (u.prototype.emit = function (s, c, f, d, h, v) {
            var p = r ? r + s : s;
            if (!this._events[p]) return !1;
            var m = this._events[p],
              g = arguments.length,
              w,
              b;
            if (m.fn) {
              switch ((m.once && this.removeListener(s, m.fn, void 0, !0), g)) {
                case 1:
                  return (m.fn.call(m.context), !0);
                case 2:
                  return (m.fn.call(m.context, c), !0);
                case 3:
                  return (m.fn.call(m.context, c, f), !0);
                case 4:
                  return (m.fn.call(m.context, c, f, d), !0);
                case 5:
                  return (m.fn.call(m.context, c, f, d, h), !0);
                case 6:
                  return (m.fn.call(m.context, c, f, d, h, v), !0);
              }
              for (b = 1, w = new Array(g - 1); b < g; b++) w[b - 1] = arguments[b];
              m.fn.apply(m.context, w);
            } else {
              var P = m.length,
                x;
              for (b = 0; b < P; b++)
                switch ((m[b].once && this.removeListener(s, m[b].fn, void 0, !0), g)) {
                  case 1:
                    m[b].fn.call(m[b].context);
                    break;
                  case 2:
                    m[b].fn.call(m[b].context, c);
                    break;
                  case 3:
                    m[b].fn.call(m[b].context, c, f);
                    break;
                  case 4:
                    m[b].fn.call(m[b].context, c, f, d);
                    break;
                  default:
                    if (!w) for (x = 1, w = new Array(g - 1); x < g; x++) w[x - 1] = arguments[x];
                    m[b].fn.apply(m[b].context, w);
                }
            }
            return !0;
          }),
          (u.prototype.on = function (s, c, f) {
            return a(this, s, c, f, !1);
          }),
          (u.prototype.once = function (s, c, f) {
            return a(this, s, c, f, !0);
          }),
          (u.prototype.removeListener = function (s, c, f, d) {
            var h = r ? r + s : s;
            if (!this._events[h]) return this;
            if (!c) return (o(this, h), this);
            var v = this._events[h];
            if (v.fn) v.fn === c && (!d || v.once) && (!f || v.context === f) && o(this, h);
            else {
              for (var p = 0, m = [], g = v.length; p < g; p++)
                (v[p].fn !== c || (d && !v[p].once) || (f && v[p].context !== f)) && m.push(v[p]);
              m.length ? (this._events[h] = m.length === 1 ? m[0] : m) : o(this, h);
            }
            return this;
          }),
          (u.prototype.removeAllListeners = function (s) {
            var c;
            return (
              s
                ? ((c = r ? r + s : s), this._events[c] && o(this, c))
                : ((this._events = new n()), (this._eventsCount = 0)),
              this
            );
          }),
          (u.prototype.off = u.prototype.removeListener),
          (u.prototype.addListener = u.prototype.on),
          (u.prefixed = r),
          (u.EventEmitter = u),
          (e.exports = u));
      })(fo)),
    fo.exports
  );
}
var JS = ZS();
const QS = Mt(JS);
var Jr = new QS(),
  du = 'recharts.syncEvent.tooltip',
  id = 'recharts.syncEvent.brush';
function Tm(e, t) {
  if (t) {
    var r = Number.parseInt(t, 10);
    if (!$e(r)) return e?.[r];
  }
}
var eE = {
    chartName: '',
    tooltipPayloadSearcher: void 0,
    eventEmitter: void 0,
    defaultTooltipEventType: 'axis',
  },
  Cm = Le({
    name: 'options',
    initialState: eE,
    reducers: {
      createEventEmitter: (e) => {
        e.eventEmitter == null && (e.eventEmitter = Symbol('rechartsEventEmitter'));
      },
    },
  }),
  tE = Cm.reducer,
  { createEventEmitter: rE } = Cm.actions;
function nE(e) {
  return e.tooltip.syncInteraction;
}
var iE = { chartData: void 0, computedData: void 0, dataStartIndex: 0, dataEndIndex: 0 },
  jm = Le({
    name: 'chartData',
    initialState: iE,
    reducers: {
      setChartData(e, t) {
        if (((e.chartData = t.payload), t.payload == null)) {
          ((e.dataStartIndex = 0), (e.dataEndIndex = 0));
          return;
        }
        t.payload.length > 0 &&
          e.dataEndIndex !== t.payload.length - 1 &&
          (e.dataEndIndex = t.payload.length - 1);
      },
      setComputedData(e, t) {
        e.computedData = t.payload;
      },
      setDataStartEndIndexes(e, t) {
        var { startIndex: r, endIndex: n } = t.payload;
        (r != null && (e.dataStartIndex = r), n != null && (e.dataEndIndex = n));
      },
    },
  }),
  { setChartData: ad, setDataStartEndIndexes: aE, setComputedData: pM } = jm.actions,
  oE = jm.reducer,
  Mm = () => {};
function uE() {
  var e = D(Al),
    t = D(Sl),
    r = me(),
    n = D(bp),
    i = D(Ot),
    a = Ai(),
    o = Hu(),
    u = D((l) => l.rootProps.className);
  y.useEffect(() => {
    if (e == null) return Mm;
    var l = (s, c, f) => {
      if (t !== f && e === s) {
        if (n === 'index') {
          r(c);
          return;
        }
        if (i != null) {
          var d;
          if (typeof n == 'function') {
            var h = {
                activeTooltipIndex: c.payload.index == null ? void 0 : Number(c.payload.index),
                isTooltipActive: c.payload.active,
                activeIndex: c.payload.index == null ? void 0 : Number(c.payload.index),
                activeLabel: c.payload.label,
                activeDataKey: c.payload.dataKey,
                activeCoordinate: c.payload.coordinate,
              },
              v = n(i, h);
            d = i[v];
          } else n === 'value' && (d = i.find((O) => String(O.value) === c.payload.label));
          var { coordinate: p } = c.payload;
          if (d == null || c.payload.active === !1 || p == null || o == null) {
            r(cu({ active: !1, coordinate: void 0, dataKey: void 0, index: null, label: void 0 }));
            return;
          }
          var { x: m, y: g } = p,
            w = Math.min(m, o.x + o.width),
            b = Math.min(g, o.y + o.height),
            P = {
              x: a === 'horizontal' ? d.coordinate : w,
              y: a === 'horizontal' ? b : d.coordinate,
            },
            x = cu({
              active: c.payload.active,
              coordinate: P,
              dataKey: c.payload.dataKey,
              index: String(d.index),
              label: c.payload.label,
            });
          r(x);
        }
      }
    };
    return (
      Jr.on(du, l),
      () => {
        Jr.off(du, l);
      }
    );
  }, [u, r, t, e, n, i, a, o]);
}
function lE() {
  var e = D(Al),
    t = D(Sl),
    r = me();
  y.useEffect(() => {
    if (e == null) return Mm;
    var n = (i, a, o) => {
      t !== o && e === i && r(aE(a));
    };
    return (
      Jr.on(id, n),
      () => {
        Jr.off(id, n);
      }
    );
  }, [r, t, e]);
}
function cE() {
  var e = me();
  (y.useEffect(() => {
    e(rE());
  }, [e]),
    uE(),
    lE());
}
function sE(e, t, r, n, i, a) {
  var o = D((d) => qS(d, e, t)),
    u = D(Sl),
    l = D(Al),
    s = D(bp),
    c = D(nE),
    f = c?.active;
  y.useEffect(() => {
    if (!f && l != null && u != null) {
      var d = cu({
        active: a,
        coordinate: r,
        dataKey: o,
        index: i,
        label: typeof n == 'number' ? String(n) : n,
      });
      Jr.emit(du, l, d, u);
    }
  }, [f, r, o, i, n, u, l, s, a]);
}
function od(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ud(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? od(Object(r), !0).forEach(function (n) {
          fE(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : od(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function fE(e, t, r) {
  return (
    (t = dE(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function dE(e) {
  var t = hE(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function hE(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function vE(e) {
  return e.dataKey;
}
function pE(e, t) {
  return y.isValidElement(e)
    ? y.cloneElement(e, t)
    : typeof e == 'function'
      ? y.createElement(e, t)
      : y.createElement(Lw, t);
}
var ld = [],
  mE = {
    allowEscapeViewBox: { x: !1, y: !1 },
    animationDuration: 400,
    animationEasing: 'ease',
    axisId: 0,
    contentStyle: {},
    cursor: !0,
    filterNull: !0,
    isAnimationActive: !wr.isSsr,
    itemSorter: 'name',
    itemStyle: {},
    labelStyle: {},
    offset: 10,
    reverseDirection: { x: !1, y: !1 },
    separator: ' : ',
    trigger: 'hover',
    useTranslate3d: !1,
    wrapperStyle: {},
  };
function mM(e) {
  var t = ut(e, mE),
    {
      active: r,
      allowEscapeViewBox: n,
      animationDuration: i,
      animationEasing: a,
      content: o,
      filterNull: u,
      isAnimationActive: l,
      offset: s,
      payloadUniqBy: c,
      position: f,
      reverseDirection: d,
      useTranslate3d: h,
      wrapperStyle: v,
      cursor: p,
      shared: m,
      trigger: g,
      defaultIndex: w,
      portal: b,
      axisId: P,
    } = t,
    x = me(),
    O = typeof w == 'number' ? String(w) : w;
  y.useEffect(() => {
    x(UA({ shared: m, trigger: g, axisId: P, active: r, defaultIndex: O }));
  }, [x, m, g, P, r, O]);
  var S = Hu(),
    _ = pv(),
    C = qA(m),
    { activeIndex: N, isActive: T } = D((Be) => KS(Be, C, g, O)),
    M = D((Be) => FS(Be, C, g, O)),
    L = D((Be) => Em(Be, C, g, O)),
    z = D((Be) => zS(Be, C, g, O)),
    J = M,
    H = XS(),
    ie = r ?? T,
    [_e, ce] = Rh([J, ie]),
    or = C === 'axis' ? L : void 0;
  sE(C, g, z, or, N, ie);
  var ur = b ?? H;
  if (ur == null) return null;
  var $ = J ?? ld;
  (ie || ($ = ld),
    u &&
      $.length &&
      ($ = kh(
        J.filter((Be) => Be.value != null && (Be.hide !== !0 || t.includeHidden)),
        c,
        vE
      )));
  var Ui = $.length > 0,
    Hi = y.createElement(
      Uw,
      {
        allowEscapeViewBox: n,
        animationDuration: i,
        animationEasing: a,
        isAnimationActive: l,
        active: ie,
        coordinate: z,
        hasPayload: Ui,
        offset: s,
        position: f,
        reverseDirection: d,
        useTranslate3d: h,
        viewBox: S,
        wrapperStyle: v,
        lastBoundingBox: _e,
        innerRef: ce,
        hasPortalFromProps: !!b,
      },
      pE(
        o,
        ud(
          ud({}, t),
          {},
          { payload: $, label: or, active: ie, coordinate: z, accessibilityLayer: _ }
        )
      )
    );
  return y.createElement(
    y.Fragment,
    null,
    Zd.createPortal(Hi, ur),
    ie &&
      y.createElement(VS, { cursor: p, tooltipEventType: C, coordinate: z, payload: J, index: N })
  );
}
var ho = {},
  vo = {},
  po = {},
  cd;
function yE() {
  return (
    cd ||
      ((cd = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r, n, { signal: i, edges: a } = {}) {
          let o,
            u = null;
          const l = a != null && a.includes('leading'),
            s = a == null || a.includes('trailing'),
            c = () => {
              u !== null && (r.apply(o, u), (o = void 0), (u = null));
            },
            f = () => {
              (s && c(), p());
            };
          let d = null;
          const h = () => {
              (d != null && clearTimeout(d),
                (d = setTimeout(() => {
                  ((d = null), f());
                }, n)));
            },
            v = () => {
              d !== null && (clearTimeout(d), (d = null));
            },
            p = () => {
              (v(), (o = void 0), (u = null));
            },
            m = () => {
              c();
            },
            g = function (...w) {
              if (i?.aborted) return;
              ((o = this), (u = w));
              const b = d == null;
              (h(), l && b && c());
            };
          return (
            (g.schedule = h),
            (g.cancel = p),
            (g.flush = m),
            i?.addEventListener('abort', p, { once: !0 }),
            g
          );
        }
        e.debounce = t;
      })(po)),
    po
  );
}
var sd;
function gE() {
  return (
    sd ||
      ((sd = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = yE();
        function r(n, i = 0, a = {}) {
          typeof a != 'object' && (a = {});
          const { leading: o = !1, trailing: u = !0, maxWait: l } = a,
            s = Array(2);
          (o && (s[0] = 'leading'), u && (s[1] = 'trailing'));
          let c,
            f = null;
          const d = t.debounce(
              function (...p) {
                ((c = n.apply(this, p)), (f = null));
              },
              i,
              { edges: s }
            ),
            h = function (...p) {
              return l != null && (f === null && (f = Date.now()), Date.now() - f >= l)
                ? ((c = n.apply(this, p)), (f = Date.now()), d.cancel(), d.schedule(), c)
                : (d.apply(this, p), c);
            },
            v = () => (d.flush(), c);
          return ((h.cancel = d.cancel), (h.flush = v), h);
        }
        e.debounce = r;
      })(vo)),
    vo
  );
}
var fd;
function bE() {
  return (
    fd ||
      ((fd = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = gE();
        function r(n, i = 0, a = {}) {
          const { leading: o = !0, trailing: u = !0 } = a;
          return t.debounce(n, i, { leading: o, maxWait: i, trailing: u });
        }
        e.throttle = r;
      })(ho)),
    ho
  );
}
var mo, dd;
function wE() {
  return (dd || ((dd = 1), (mo = bE().throttle)), mo);
}
var xE = wE();
const PE = Mt(xE);
var Br = function (t, r) {
  for (var n = arguments.length, i = new Array(n > 2 ? n - 2 : 0), a = 2; a < n; a++)
    i[a - 2] = arguments[a];
};
function hd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function yo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? hd(Object(r), !0).forEach(function (n) {
          OE(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : hd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function OE(e, t, r) {
  return (
    (t = AE(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function AE(e) {
  var t = SE(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function SE(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var yM = y.forwardRef((e, t) => {
  var {
      aspect: r,
      initialDimension: n = { width: -1, height: -1 },
      width: i = '100%',
      height: a = '100%',
      minWidth: o = 0,
      minHeight: u,
      maxHeight: l,
      children: s,
      debounce: c = 0,
      id: f,
      className: d,
      onResize: h,
      style: v = {},
    } = e,
    p = y.useRef(null),
    m = y.useRef();
  ((m.current = h), y.useImperativeHandle(t, () => p.current));
  var [g, w] = y.useState({ containerWidth: n.width, containerHeight: n.height }),
    b = y.useCallback((x, O) => {
      w((S) => {
        var _ = Math.round(x),
          C = Math.round(O);
        return S.containerWidth === _ && S.containerHeight === C
          ? S
          : { containerWidth: _, containerHeight: C };
      });
    }, []);
  y.useEffect(() => {
    var x = (C) => {
      var N,
        { width: T, height: M } = C[0].contentRect;
      (b(T, M), (N = m.current) === null || N === void 0 || N.call(m, T, M));
    };
    c > 0 && (x = PE(x, c, { trailing: !0, leading: !1 }));
    var O = new ResizeObserver(x),
      { width: S, height: _ } = p.current.getBoundingClientRect();
    return (
      b(S, _),
      O.observe(p.current),
      () => {
        O.disconnect();
      }
    );
  }, [b, c]);
  var P = y.useMemo(() => {
    var { containerWidth: x, containerHeight: O } = g;
    if (x < 0 || O < 0) return null;
    (Br(
      Ft(i) || Ft(a),
      `The width(%s) and height(%s) are both fixed numbers,
       maybe you don't need to use a ResponsiveContainer.`,
      i,
      a
    ),
      Br(!r || r > 0, 'The aspect(%s) must be greater than zero.', r));
    var S = Ft(i) ? x : i,
      _ = Ft(a) ? O : a;
    return (
      r && r > 0 && (S ? (_ = S / r) : _ && (S = _ * r), l && _ > l && (_ = l)),
      Br(
        S > 0 || _ > 0,
        `The width(%s) and height(%s) of chart should be greater than 0,
       please check the style of container, or the props width(%s) and height(%s),
       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the
       height and width.`,
        S,
        _,
        i,
        a,
        o,
        u,
        r
      ),
      y.Children.map(s, (C) =>
        y.cloneElement(C, {
          width: S,
          height: _,
          style: yo({ width: S, height: _ }, C.props.style),
        })
      )
    );
  }, [r, s, a, l, u, o, g, i]);
  return y.createElement(
    'div',
    {
      id: f ? ''.concat(f) : void 0,
      className: K('recharts-responsive-container', d),
      style: yo(yo({}, v), {}, { width: i, height: a, minWidth: o, minHeight: u, maxHeight: l }),
      ref: p,
    },
    y.createElement('div', { style: { width: 0, height: 0, overflow: 'visible' } }, P)
  );
});
function EE(e, t, r) {
  return (
    (t = _E(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function _E(e) {
  var t = TE(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function TE(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
class CE {
  constructor(t) {
    (EE(this, 'cache', new Map()), (this.maxSize = t));
  }
  get(t) {
    var r = this.cache.get(t);
    return (r !== void 0 && (this.cache.delete(t), this.cache.set(t, r)), r);
  }
  set(t, r) {
    if (this.cache.has(t)) this.cache.delete(t);
    else if (this.cache.size >= this.maxSize) {
      var n = this.cache.keys().next().value;
      this.cache.delete(n);
    }
    this.cache.set(t, r);
  }
  clear() {
    this.cache.clear();
  }
  size() {
    return this.cache.size;
  }
}
function vd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function jE(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? vd(Object(r), !0).forEach(function (n) {
          ME(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : vd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function ME(e, t, r) {
  return (
    (t = kE(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function kE(e) {
  var t = IE(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function IE(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var DE = { cacheSize: 2e3, enableCache: !0 },
  km = jE({}, DE),
  pd = new CE(km.cacheSize),
  NE = {
    position: 'absolute',
    top: '-20000px',
    left: 0,
    padding: 0,
    margin: 0,
    border: 'none',
    whiteSpace: 'pre',
  },
  md = 'recharts_measurement_span';
function $E(e, t) {
  var r = t.fontSize || '',
    n = t.fontFamily || '',
    i = t.fontWeight || '',
    a = t.fontStyle || '',
    o = t.letterSpacing || '',
    u = t.textTransform || '';
  return ''
    .concat(e, '|')
    .concat(r, '|')
    .concat(n, '|')
    .concat(i, '|')
    .concat(a, '|')
    .concat(o, '|')
    .concat(u);
}
var yd = (e, t) => {
    try {
      var r = document.getElementById(md);
      (r ||
        ((r = document.createElement('span')),
        r.setAttribute('id', md),
        r.setAttribute('aria-hidden', 'true'),
        document.body.appendChild(r)),
        Object.assign(r.style, NE, t),
        (r.textContent = ''.concat(e)));
      var n = r.getBoundingClientRect();
      return { width: n.width, height: n.height };
    } catch {
      return { width: 0, height: 0 };
    }
  },
  qr = function (t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (t == null || wr.isSsr) return { width: 0, height: 0 };
    if (!km.enableCache) return yd(t, r);
    var n = $E(t, r),
      i = pd.get(n);
    if (i) return i;
    var a = yd(t, r);
    return (pd.set(n, a), a);
  },
  gd = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/,
  bd = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/,
  RE = /^px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q$/,
  LE = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/,
  Im = {
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    pt: 96 / 72,
    pc: 96 / 6,
    in: 96,
    Q: 96 / (2.54 * 40),
    px: 1,
  },
  BE = Object.keys(Im),
  cr = 'NaN';
function qE(e, t) {
  return e * Im[t];
}
class Oe {
  static parse(t) {
    var r,
      [, n, i] = (r = LE.exec(t)) !== null && r !== void 0 ? r : [];
    return new Oe(parseFloat(n), i ?? '');
  }
  constructor(t, r) {
    ((this.num = t),
      (this.unit = r),
      (this.num = t),
      (this.unit = r),
      $e(t) && (this.unit = ''),
      r !== '' && !RE.test(r) && ((this.num = NaN), (this.unit = '')),
      BE.includes(r) && ((this.num = qE(t, r)), (this.unit = 'px')));
  }
  add(t) {
    return this.unit !== t.unit ? new Oe(NaN, '') : new Oe(this.num + t.num, this.unit);
  }
  subtract(t) {
    return this.unit !== t.unit ? new Oe(NaN, '') : new Oe(this.num - t.num, this.unit);
  }
  multiply(t) {
    return this.unit !== '' && t.unit !== '' && this.unit !== t.unit
      ? new Oe(NaN, '')
      : new Oe(this.num * t.num, this.unit || t.unit);
  }
  divide(t) {
    return this.unit !== '' && t.unit !== '' && this.unit !== t.unit
      ? new Oe(NaN, '')
      : new Oe(this.num / t.num, this.unit || t.unit);
  }
  toString() {
    return ''.concat(this.num).concat(this.unit);
  }
  isNaN() {
    return $e(this.num);
  }
}
function Dm(e) {
  if (e.includes(cr)) return cr;
  for (var t = e; t.includes('*') || t.includes('/'); ) {
    var r,
      [, n, i, a] = (r = gd.exec(t)) !== null && r !== void 0 ? r : [],
      o = Oe.parse(n ?? ''),
      u = Oe.parse(a ?? ''),
      l = i === '*' ? o.multiply(u) : o.divide(u);
    if (l.isNaN()) return cr;
    t = t.replace(gd, l.toString());
  }
  for (; t.includes('+') || /.-\d+(?:\.\d+)?/.test(t); ) {
    var s,
      [, c, f, d] = (s = bd.exec(t)) !== null && s !== void 0 ? s : [],
      h = Oe.parse(c ?? ''),
      v = Oe.parse(d ?? ''),
      p = f === '+' ? h.add(v) : h.subtract(v);
    if (p.isNaN()) return cr;
    t = t.replace(bd, p.toString());
  }
  return t;
}
var wd = /\(([^()]*)\)/;
function zE(e) {
  for (var t = e, r; (r = wd.exec(t)) != null; ) {
    var [, n] = r;
    t = t.replace(wd, Dm(n));
  }
  return t;
}
function FE(e) {
  var t = e.replace(/\s+/g, '');
  return ((t = zE(t)), (t = Dm(t)), t);
}
function KE(e) {
  try {
    return FE(e);
  } catch {
    return cr;
  }
}
function go(e) {
  var t = KE(e.slice(5, -1));
  return t === cr ? '' : t;
}
var WE = [
    'x',
    'y',
    'lineHeight',
    'capHeight',
    'scaleToFit',
    'textAnchor',
    'verticalAnchor',
    'fill',
  ],
  UE = ['dx', 'dy', 'angle', 'className', 'breakAll'];
function hu() {
  return (
    (hu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    hu.apply(null, arguments)
  );
}
function xd(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = HE(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function HE(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var Nm = /[ \f\n\r\t\v\u2028\u2029]+/,
  $m = (e) => {
    var { children: t, breakAll: r, style: n } = e;
    try {
      var i = [];
      te(t) || (r ? (i = t.toString().split('')) : (i = t.toString().split(Nm)));
      var a = i.map((u) => ({ word: u, width: qr(u, n).width })),
        o = r ? 0 : qr(' ', n).width;
      return { wordsWithComputedWidth: a, spaceWidth: o };
    } catch {
      return null;
    }
  },
  YE = (e, t, r, n, i) => {
    var { maxLines: a, children: o, style: u, breakAll: l } = e,
      s = k(a),
      c = o,
      f = function () {
        var T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
        return T.reduce((M, L) => {
          var { word: z, width: J } = L,
            H = M[M.length - 1];
          if (H && (n == null || i || H.width + J + r < Number(n)))
            (H.words.push(z), (H.width += J + r));
          else {
            var ie = { words: [z], width: J };
            M.push(ie);
          }
          return M;
        }, []);
      },
      d = f(t),
      h = (N) => N.reduce((T, M) => (T.width > M.width ? T : M));
    if (!s || i) return d;
    var v = d.length > a || h(d).width > Number(n);
    if (!v) return d;
    for (
      var p = '…',
        m = (N) => {
          var T = c.slice(0, N),
            M = $m({ breakAll: l, style: u, children: T + p }).wordsWithComputedWidth,
            L = f(M),
            z = L.length > a || h(L).width > Number(n);
          return [z, L];
        },
        g = 0,
        w = c.length - 1,
        b = 0,
        P;
      g <= w && b <= c.length - 1;

    ) {
      var x = Math.floor((g + w) / 2),
        O = x - 1,
        [S, _] = m(O),
        [C] = m(x);
      if ((!S && !C && (g = x + 1), S && C && (w = x - 1), !S && C)) {
        P = _;
        break;
      }
      b++;
    }
    return P || d;
  },
  Pd = (e) => {
    var t = te(e) ? [] : e.toString().split(Nm);
    return [{ words: t }];
  },
  GE = (e) => {
    var { width: t, scaleToFit: r, children: n, style: i, breakAll: a, maxLines: o } = e;
    if ((t || r) && !wr.isSsr) {
      var u,
        l,
        s = $m({ breakAll: a, children: n, style: i });
      if (s) {
        var { wordsWithComputedWidth: c, spaceWidth: f } = s;
        ((u = c), (l = f));
      } else return Pd(n);
      return YE({ breakAll: a, children: n, maxLines: o, style: i }, u, l, t, r);
    }
    return Pd(n);
  },
  Od = '#808080',
  Vl = y.forwardRef((e, t) => {
    var {
        x: r = 0,
        y: n = 0,
        lineHeight: i = '1em',
        capHeight: a = '0.71em',
        scaleToFit: o = !1,
        textAnchor: u = 'start',
        verticalAnchor: l = 'end',
        fill: s = Od,
      } = e,
      c = xd(e, WE),
      f = y.useMemo(
        () =>
          GE({
            breakAll: c.breakAll,
            children: c.children,
            maxLines: c.maxLines,
            scaleToFit: o,
            style: c.style,
            width: c.width,
          }),
        [c.breakAll, c.children, c.maxLines, o, c.style, c.width]
      ),
      { dx: d, dy: h, angle: v, className: p, breakAll: m } = c,
      g = xd(c, UE);
    if (!it(r) || !it(n)) return null;
    var w = r + (k(d) ? d : 0),
      b = n + (k(h) ? h : 0),
      P;
    switch (l) {
      case 'start':
        P = go('calc('.concat(a, ')'));
        break;
      case 'middle':
        P = go(
          'calc('
            .concat((f.length - 1) / 2, ' * -')
            .concat(i, ' + (')
            .concat(a, ' / 2))')
        );
        break;
      default:
        P = go('calc('.concat(f.length - 1, ' * -').concat(i, ')'));
        break;
    }
    var x = [];
    if (o) {
      var O = f[0].width,
        { width: S } = c;
      x.push('scale('.concat(k(S) ? S / O : 1, ')'));
    }
    return (
      v && x.push('rotate('.concat(v, ', ').concat(w, ', ').concat(b, ')')),
      x.length && (g.transform = x.join(' ')),
      y.createElement(
        'text',
        hu({}, ee(g, !0), {
          ref: t,
          x: w,
          y: b,
          className: K('recharts-text', p),
          textAnchor: u,
          fill: s.includes('url') ? Od : s,
        }),
        f.map((_, C) => {
          var N = _.words.join(m ? '' : ' ');
          return y.createElement(
            'tspan',
            { x: w, dy: C === 0 ? P : i, key: ''.concat(N, '-').concat(C) },
            N
          );
        })
      )
    );
  });
Vl.displayName = 'Text';
var VE = ['offset'],
  XE = ['labelRef'];
function Ad(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = ZE(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function ZE(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Sd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Q(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Sd(Object(r), !0).forEach(function (n) {
          JE(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Sd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function JE(e, t, r) {
  return (
    (t = QE(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function QE(e) {
  var t = e_(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function e_(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function ct() {
  return (
    (ct = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    ct.apply(null, arguments)
  );
}
var t_ = (e) => {
    var { value: t, formatter: r } = e,
      n = te(e.children) ? t : e.children;
    return typeof r == 'function' ? r(n) : n;
  },
  Xl = (e) => e != null && typeof e == 'function',
  r_ = (e, t) => {
    var r = Ue(t - e),
      n = Math.min(Math.abs(t - e), 360);
    return r * n;
  },
  n_ = (e, t, r, n) => {
    var { position: i, offset: a, className: o } = e,
      {
        cx: u,
        cy: l,
        innerRadius: s,
        outerRadius: c,
        startAngle: f,
        endAngle: d,
        clockWise: h,
      } = n,
      v = (s + c) / 2,
      p = r_(f, d),
      m = p >= 0 ? 1 : -1,
      g,
      w;
    (i === 'insideStart'
      ? ((g = f + m * a), (w = h))
      : i === 'insideEnd'
        ? ((g = d - m * a), (w = !h))
        : i === 'end' && ((g = d + m * a), (w = h)),
      (w = p <= 0 ? w : !w));
    var b = ve(u, l, v, g),
      P = ve(u, l, v, g + (w ? 1 : -1) * 359),
      x = 'M'
        .concat(b.x, ',')
        .concat(
          b.y,
          `
    A`
        )
        .concat(v, ',')
        .concat(v, ',0,1,')
        .concat(
          w ? 0 : 1,
          `,
    `
        )
        .concat(P.x, ',')
        .concat(P.y),
      O = te(e.id) ? zr('recharts-radial-line-') : e.id;
    return y.createElement(
      'text',
      ct({}, r, { dominantBaseline: 'central', className: K('recharts-radial-bar-label', o) }),
      y.createElement('defs', null, y.createElement('path', { id: O, d: x })),
      y.createElement('textPath', { xlinkHref: '#'.concat(O) }, t)
    );
  },
  i_ = (e, t, r) => {
    var { cx: n, cy: i, innerRadius: a, outerRadius: o, startAngle: u, endAngle: l } = e,
      s = (u + l) / 2;
    if (r === 'outside') {
      var { x: c, y: f } = ve(n, i, o + t, s);
      return { x: c, y: f, textAnchor: c >= n ? 'start' : 'end', verticalAnchor: 'middle' };
    }
    if (r === 'center') return { x: n, y: i, textAnchor: 'middle', verticalAnchor: 'middle' };
    if (r === 'centerTop') return { x: n, y: i, textAnchor: 'middle', verticalAnchor: 'start' };
    if (r === 'centerBottom') return { x: n, y: i, textAnchor: 'middle', verticalAnchor: 'end' };
    var d = (a + o) / 2,
      { x: h, y: v } = ve(n, i, d, s);
    return { x: h, y: v, textAnchor: 'middle', verticalAnchor: 'middle' };
  },
  a_ = (e, t) => {
    var { parentViewBox: r, offset: n, position: i } = e,
      { x: a, y: o, width: u, height: l } = t,
      s = l >= 0 ? 1 : -1,
      c = s * n,
      f = s > 0 ? 'end' : 'start',
      d = s > 0 ? 'start' : 'end',
      h = u >= 0 ? 1 : -1,
      v = h * n,
      p = h > 0 ? 'end' : 'start',
      m = h > 0 ? 'start' : 'end';
    if (i === 'top') {
      var g = { x: a + u / 2, y: o - s * n, textAnchor: 'middle', verticalAnchor: f };
      return Q(Q({}, g), r ? { height: Math.max(o - r.y, 0), width: u } : {});
    }
    if (i === 'bottom') {
      var w = { x: a + u / 2, y: o + l + c, textAnchor: 'middle', verticalAnchor: d };
      return Q(Q({}, w), r ? { height: Math.max(r.y + r.height - (o + l), 0), width: u } : {});
    }
    if (i === 'left') {
      var b = { x: a - v, y: o + l / 2, textAnchor: p, verticalAnchor: 'middle' };
      return Q(Q({}, b), r ? { width: Math.max(b.x - r.x, 0), height: l } : {});
    }
    if (i === 'right') {
      var P = { x: a + u + v, y: o + l / 2, textAnchor: m, verticalAnchor: 'middle' };
      return Q(Q({}, P), r ? { width: Math.max(r.x + r.width - P.x, 0), height: l } : {});
    }
    var x = r ? { width: u, height: l } : {};
    return i === 'insideLeft'
      ? Q({ x: a + v, y: o + l / 2, textAnchor: m, verticalAnchor: 'middle' }, x)
      : i === 'insideRight'
        ? Q({ x: a + u - v, y: o + l / 2, textAnchor: p, verticalAnchor: 'middle' }, x)
        : i === 'insideTop'
          ? Q({ x: a + u / 2, y: o + c, textAnchor: 'middle', verticalAnchor: d }, x)
          : i === 'insideBottom'
            ? Q({ x: a + u / 2, y: o + l - c, textAnchor: 'middle', verticalAnchor: f }, x)
            : i === 'insideTopLeft'
              ? Q({ x: a + v, y: o + c, textAnchor: m, verticalAnchor: d }, x)
              : i === 'insideTopRight'
                ? Q({ x: a + u - v, y: o + c, textAnchor: p, verticalAnchor: d }, x)
                : i === 'insideBottomLeft'
                  ? Q({ x: a + v, y: o + l - c, textAnchor: m, verticalAnchor: f }, x)
                  : i === 'insideBottomRight'
                    ? Q({ x: a + u - v, y: o + l - c, textAnchor: p, verticalAnchor: f }, x)
                    : i && typeof i == 'object' && (k(i.x) || Ft(i.x)) && (k(i.y) || Ft(i.y))
                      ? Q(
                          {
                            x: a + jt(i.x, u),
                            y: o + jt(i.y, l),
                            textAnchor: 'end',
                            verticalAnchor: 'end',
                          },
                          x
                        )
                      : Q(
                          {
                            x: a + u / 2,
                            y: o + l / 2,
                            textAnchor: 'middle',
                            verticalAnchor: 'middle',
                          },
                          x
                        );
  },
  o_ = (e) => 'cx' in e && k(e.cx);
function Ie(e) {
  var { offset: t = 5 } = e,
    r = Ad(e, VE),
    n = Q({ offset: t }, r),
    {
      viewBox: i,
      position: a,
      value: o,
      children: u,
      content: l,
      className: s = '',
      textBreakAll: c,
      labelRef: f,
    } = n,
    d = D(Ap),
    h = Hu(),
    v = a === 'center' ? h : (d ?? h),
    p = i || v;
  if (!p || (te(o) && te(u) && !y.isValidElement(l) && typeof l != 'function')) return null;
  var m = Q(Q({}, n), {}, { viewBox: p });
  if (y.isValidElement(l)) {
    var { labelRef: g } = m,
      w = Ad(m, XE);
    return y.cloneElement(l, w);
  }
  var b;
  if (typeof l == 'function') {
    if (((b = y.createElement(l, m)), y.isValidElement(b))) return b;
  } else b = t_(n);
  var P = o_(p),
    x = ee(n, !0);
  if (P && (a === 'insideStart' || a === 'insideEnd' || a === 'end')) return n_(n, b, x, p);
  var O = P ? i_(p, n.offset, n.position) : a_(n, p);
  return y.createElement(
    Vl,
    ct({ ref: f, className: K('recharts-label', s) }, x, O, { breakAll: c }),
    b
  );
}
Ie.displayName = 'Label';
var Rm = (e) => {
    var {
      cx: t,
      cy: r,
      angle: n,
      startAngle: i,
      endAngle: a,
      r: o,
      radius: u,
      innerRadius: l,
      outerRadius: s,
      x: c,
      y: f,
      top: d,
      left: h,
      width: v,
      height: p,
      clockWise: m,
      labelViewBox: g,
    } = e;
    if (g) return g;
    if (k(v) && k(p)) {
      if (k(c) && k(f)) return { x: c, y: f, width: v, height: p };
      if (k(d) && k(h)) return { x: d, y: h, width: v, height: p };
    }
    if (k(c) && k(f)) return { x: c, y: f, width: 0, height: 0 };
    if (k(t) && k(r))
      return {
        cx: t,
        cy: r,
        startAngle: i || n || 0,
        endAngle: a || n || 0,
        innerRadius: l || 0,
        outerRadius: s || u || o || 0,
        clockWise: m,
      };
    if (e.viewBox) return e.viewBox;
  },
  u_ = (e, t, r) => {
    if (!e) return null;
    var n = { viewBox: t, labelRef: r };
    return e === !0
      ? y.createElement(Ie, ct({ key: 'label-implicit' }, n))
      : it(e)
        ? y.createElement(Ie, ct({ key: 'label-implicit', value: e }, n))
        : y.isValidElement(e)
          ? e.type === Ie
            ? y.cloneElement(e, Q({ key: 'label-implicit' }, n))
            : y.createElement(Ie, ct({ key: 'label-implicit', content: e }, n))
          : Xl(e)
            ? y.createElement(Ie, ct({ key: 'label-implicit', content: e }, n))
            : e && typeof e == 'object'
              ? y.createElement(Ie, ct({}, e, { key: 'label-implicit' }, n))
              : null;
  },
  l_ = function (t, r) {
    var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
    if (!t || (!t.children && n && !t.label)) return null;
    var { children: i, labelRef: a } = t,
      o = Rm(t),
      u = oh(i, Ie).map((s, c) => y.cloneElement(s, { viewBox: r || o, key: 'label-'.concat(c) }));
    if (!n) return u;
    var l = u_(t.label, r || o, a);
    return [l, ...u];
  };
Ie.parseViewBox = Rm;
Ie.renderCallByParent = l_;
var bo = {},
  wo = {},
  Ed;
function c_() {
  return (
    Ed ||
      ((Ed = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return r[r.length - 1];
        }
        e.last = t;
      })(wo)),
    wo
  );
}
var xo = {},
  _d;
function s_() {
  return (
    _d ||
      ((_d = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        function t(r) {
          return Array.isArray(r) ? r : Array.from(r);
        }
        e.toArray = t;
      })(xo)),
    xo
  );
}
var Td;
function f_() {
  return (
    Td ||
      ((Td = 1),
      (function (e) {
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' });
        const t = c_(),
          r = s_(),
          n = Iu();
        function i(a) {
          if (n.isArrayLike(a)) return t.last(r.toArray(a));
        }
        e.last = i;
      })(bo)),
    bo
  );
}
var Po, Cd;
function d_() {
  return (Cd || ((Cd = 1), (Po = f_().last)), Po);
}
var h_ = d_();
const v_ = Mt(h_);
var p_ = ['valueAccessor'],
  m_ = ['data', 'dataKey', 'clockWise', 'id', 'textBreakAll'];
function ai() {
  return (
    (ai = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    ai.apply(null, arguments)
  );
}
function jd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Md(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? jd(Object(r), !0).forEach(function (n) {
          y_(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : jd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function y_(e, t, r) {
  return (
    (t = g_(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function g_(e) {
  var t = b_(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function b_(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function kd(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = w_(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function w_(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var x_ = (e) => (Array.isArray(e.value) ? v_(e.value) : e.value);
function Ct(e) {
  var { valueAccessor: t = x_ } = e,
    r = kd(e, p_),
    { data: n, dataKey: i, clockWise: a, id: o, textBreakAll: u } = r,
    l = kd(r, m_);
  return !n || !n.length
    ? null
    : y.createElement(
        et,
        { className: 'recharts-label-list' },
        n.map((s, c) => {
          var f = te(i) ? t(s, c) : pe(s && s.payload, i),
            d = te(o) ? {} : { id: ''.concat(o, '-').concat(c) };
          return y.createElement(
            Ie,
            ai({}, ee(s, !0), l, d, {
              parentViewBox: s.parentViewBox,
              value: f,
              textBreakAll: u,
              viewBox: Ie.parseViewBox(te(a) ? s : Md(Md({}, s), {}, { clockWise: a })),
              key: 'label-'.concat(c),
              index: c,
            })
          );
        })
      );
}
Ct.displayName = 'LabelList';
function P_(e, t) {
  return e
    ? e === !0
      ? y.createElement(Ct, { key: 'labelList-implicit', data: t })
      : y.isValidElement(e) || Xl(e)
        ? y.createElement(Ct, { key: 'labelList-implicit', data: t, content: e })
        : typeof e == 'object'
          ? y.createElement(Ct, ai({ data: t }, e, { key: 'labelList-implicit' }))
          : null
    : null;
}
function O_(e, t) {
  var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
  if (!e || (!e.children && r && !e.label)) return null;
  var { children: n } = e,
    i = oh(n, Ct).map((o, u) => y.cloneElement(o, { data: t, key: 'labelList-'.concat(u) }));
  if (!r) return i;
  var a = P_(e.label, t);
  return [a, ...i];
}
Ct.renderCallByParent = O_;
function vu() {
  return (
    (vu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    vu.apply(null, arguments)
  );
}
var Zl = (e) => {
    var { cx: t, cy: r, r: n, className: i } = e,
      a = K('recharts-dot', i);
    return t === +t && r === +r && n === +n
      ? y.createElement('circle', vu({}, kt(e), Eu(e), { className: a, cx: t, cy: r, r: n }))
      : null;
  },
  A_ = { radiusAxis: {}, angleAxis: {} },
  Lm = Le({
    name: 'polarAxis',
    initialState: A_,
    reducers: {
      addRadiusAxis(e, t) {
        e.radiusAxis[t.payload.id] = t.payload;
      },
      removeRadiusAxis(e, t) {
        delete e.radiusAxis[t.payload.id];
      },
      addAngleAxis(e, t) {
        e.angleAxis[t.payload.id] = t.payload;
      },
      removeAngleAxis(e, t) {
        delete e.angleAxis[t.payload.id];
      },
    },
  }),
  { addRadiusAxis: gM, removeRadiusAxis: bM, addAngleAxis: wM, removeAngleAxis: xM } = Lm.actions,
  S_ = Lm.reducer;
function Bm(e) {
  var { fn: t, args: r } = e,
    n = me(),
    i = Se();
  return (
    y.useEffect(() => {
      if (!i) {
        var a = t(r);
        return (
          n(KA(a)),
          () => {
            n(WA(a));
          }
        );
      }
    }, [t, r, n, i]),
    null
  );
}
var E_ = () => {};
function qm(e) {
  var { legendPayload: t } = e,
    r = me(),
    n = Se();
  return (
    y.useEffect(
      () =>
        n
          ? E_
          : (r(ww(t)),
            () => {
              r(xw(t));
            }),
      [r, n, t]
    ),
    null
  );
}
function zm(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'animation-',
    r = y.useRef(zr(t)),
    n = y.useRef(e);
  return (n.current !== e && ((r.current = zr(t)), (n.current = e)), r.current);
}
var Oo,
  __ = () => {
    var [e] = y.useState(() => zr('uid-'));
    return e;
  },
  T_ = (Oo = My.useId) !== null && Oo !== void 0 ? Oo : __;
function C_(e, t) {
  var r = T_();
  return t || (e ? ''.concat(e, '-').concat(r) : r);
}
var j_ = y.createContext(void 0),
  Fm = (e) => {
    var { id: t, type: r, children: n } = e,
      i = C_('recharts-'.concat(r), t);
    return y.createElement(j_.Provider, { value: i }, n(i));
  },
  M_ = { cartesianItems: [], polarItems: [] },
  Km = Le({
    name: 'graphicalItems',
    initialState: M_,
    reducers: {
      addCartesianGraphicalItem(e, t) {
        e.cartesianItems.push(t.payload);
      },
      replaceCartesianGraphicalItem(e, t) {
        var { prev: r, next: n } = t.payload,
          i = dt(e).cartesianItems.indexOf(r);
        i > -1 && (e.cartesianItems[i] = n);
      },
      removeCartesianGraphicalItem(e, t) {
        var r = dt(e).cartesianItems.indexOf(t.payload);
        r > -1 && e.cartesianItems.splice(r, 1);
      },
      addPolarGraphicalItem(e, t) {
        e.polarItems.push(t.payload);
      },
      removePolarGraphicalItem(e, t) {
        var r = dt(e).polarItems.indexOf(t.payload);
        r > -1 && e.polarItems.splice(r, 1);
      },
    },
  }),
  {
    addCartesianGraphicalItem: k_,
    replaceCartesianGraphicalItem: I_,
    removeCartesianGraphicalItem: D_,
    addPolarGraphicalItem: PM,
    removePolarGraphicalItem: OM,
  } = Km.actions,
  N_ = Km.reducer;
function Wm(e) {
  var t = me(),
    r = y.useRef(null);
  return (
    y.useEffect(() => {
      (r.current === null ? t(k_(e)) : r.current !== e && t(I_({ prev: r.current, next: e })),
        (r.current = e));
    }, [t, e]),
    y.useEffect(
      () => () => {
        r.current && (t(D_(r.current)), (r.current = null));
      },
      [t]
    ),
    null
  );
}
function $_() {}
var R_ = {
    begin: 0,
    duration: 1e3,
    easing: 'ease',
    isActive: !0,
    canBegin: !0,
    onAnimationEnd: () => {},
    onAnimationStart: () => {},
  },
  Id = { t: 0 },
  Ao = { t: 1 };
function Um(e) {
  var t = ut(e, R_),
    {
      isActive: r,
      canBegin: n,
      duration: i,
      easing: a,
      begin: o,
      onAnimationEnd: u,
      onAnimationStart: l,
      children: s,
    } = t,
    c = xv('JavascriptAnimate', t.animationManager),
    [f, d] = y.useState(r ? Id : Ao),
    h = y.useRef(null);
  return (
    y.useEffect(() => {
      r || d(Ao);
    }, [r]),
    y.useEffect(() => {
      if (!r || !n) return $_;
      var v = wv(Id, Ao, gv(a), i, d, c.getTimeoutController()),
        p = () => {
          h.current = v();
        };
      return (
        c.start([l, o, p, i, u]),
        () => {
          (c.stop(), h.current && h.current(), u());
        }
      );
    }, [r, n, i, a, o, l, u, c]),
    s(f.t)
  );
}
var L_ = A([ye], (e) => {
    if (e) return { top: e.top, bottom: e.bottom, left: e.left, right: e.right };
  }),
  B_ = A([L_, bt, wt], (e, t, r) => {
    if (!(!e || t == null || r == null))
      return {
        x: e.left,
        y: e.top,
        width: Math.max(0, t - e.left - e.right),
        height: Math.max(0, r - e.top - e.bottom),
      };
  }),
  Wi = () => D(B_),
  q_ = () => D(IS);
function Dd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Nd(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Dd(Object(r), !0).forEach(function (n) {
          z_(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Dd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function z_(e, t, r) {
  return (
    (t = F_(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function F_(e) {
  var t = K_(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function K_(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var W_ = (e) => {
  var { point: t, childIndex: r, mainColor: n, activeDot: i, dataKey: a } = e;
  if (i === !1 || t.x == null || t.y == null) return null;
  var o = Nd(
      Nd(
        {
          index: r,
          dataKey: a,
          cx: t.x,
          cy: t.y,
          r: 4,
          fill: n ?? 'none',
          strokeWidth: 2,
          stroke: '#fff',
          payload: t.payload,
          value: t.value,
        },
        ee(i, !1)
      ),
      Eu(i)
    ),
    u;
  return (
    y.isValidElement(i)
      ? (u = y.cloneElement(i, o))
      : typeof i == 'function'
        ? (u = i(o))
        : (u = y.createElement(Zl, o)),
    y.createElement(et, { className: 'recharts-active-dot' }, u)
  );
};
function pu(e) {
  var { points: t, mainColor: r, activeDot: n, itemDataKey: i } = e,
    a = D(Zr),
    o = q_();
  if (t == null || o == null) return null;
  var u = t.find((l) => o.includes(l.payload));
  return te(u)
    ? null
    : W_({ point: u, childIndex: Number(a), mainColor: r, dataKey: i, activeDot: n });
}
var U_ = {},
  Hm = Le({
    name: 'errorBars',
    initialState: U_,
    reducers: {
      addErrorBar: (e, t) => {
        var { itemId: r, errorBar: n } = t.payload;
        (e[r] || (e[r] = []), e[r].push(n));
      },
      removeErrorBar: (e, t) => {
        var { itemId: r, errorBar: n } = t.payload;
        e[r] && (e[r] = e[r].filter((i) => i.dataKey !== n.dataKey || i.direction !== n.direction));
      },
    },
  }),
  { addErrorBar: AM, removeErrorBar: SM } = Hm.actions,
  H_ = Hm.reducer,
  Y_ = ['children'];
function G_(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = V_(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function V_(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var X_ = {
    data: [],
    xAxisId: 'xAxis-0',
    yAxisId: 'yAxis-0',
    dataPointFormatter: () => ({ x: 0, y: 0, value: 0 }),
    errorBarOffset: 0,
  },
  Z_ = y.createContext(X_);
function J_(e) {
  var { children: t } = e,
    r = G_(e, Y_);
  return y.createElement(Z_.Provider, { value: r }, t);
}
function Jl(e, t) {
  var r,
    n,
    i = D((s) => Pt(s, e)),
    a = D((s) => $t(s, t)),
    o = (r = i?.allowDataOverflow) !== null && r !== void 0 ? r : je.allowDataOverflow,
    u = (n = a?.allowDataOverflow) !== null && n !== void 0 ? n : Me.allowDataOverflow,
    l = o || u;
  return { needClip: l, needClipX: o, needClipY: u };
}
function Ym(e) {
  var { xAxisId: t, yAxisId: r, clipPathId: n } = e,
    i = Wi(),
    { needClipX: a, needClipY: o, needClip: u } = Jl(t, r);
  if (!u) return null;
  var { x: l, y: s, width: c, height: f } = i;
  return y.createElement(
    'clipPath',
    { id: 'clipPath-'.concat(n) },
    y.createElement('rect', {
      x: a ? l : l - c / 2,
      y: o ? s : s - f / 2,
      width: a ? c : c * 2,
      height: o ? f : f * 2,
    })
  );
}
var Q_ = (e) => {
    var { chartData: t } = e,
      r = me(),
      n = Se();
    return (
      y.useEffect(
        () =>
          n
            ? () => {}
            : (r(ad(t)),
              () => {
                r(ad(void 0));
              }),
        [t, r, n]
      ),
      null
    );
  },
  $d = { x: 0, y: 0, width: 0, height: 0, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
  Gm = Le({
    name: 'brush',
    initialState: $d,
    reducers: {
      setBrushSettings(e, t) {
        return t.payload == null ? $d : t.payload;
      },
    },
  }),
  { setBrushSettings: EM } = Gm.actions,
  eT = Gm.reducer;
function tT(e, t, r) {
  return (
    (t = rT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function rT(e) {
  var t = nT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function nT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
class Ql {
  static create(t) {
    return new Ql(t);
  }
  constructor(t) {
    this.scale = t;
  }
  get domain() {
    return this.scale.domain;
  }
  get range() {
    return this.scale.range;
  }
  get rangeMin() {
    return this.range()[0];
  }
  get rangeMax() {
    return this.range()[1];
  }
  get bandwidth() {
    return this.scale.bandwidth;
  }
  apply(t) {
    var { bandAware: r, position: n } =
      arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (t !== void 0) {
      if (n)
        switch (n) {
          case 'start':
            return this.scale(t);
          case 'middle': {
            var i = this.bandwidth ? this.bandwidth() / 2 : 0;
            return this.scale(t) + i;
          }
          case 'end': {
            var a = this.bandwidth ? this.bandwidth() : 0;
            return this.scale(t) + a;
          }
          default:
            return this.scale(t);
        }
      if (r) {
        var o = this.bandwidth ? this.bandwidth() / 2 : 0;
        return this.scale(t) + o;
      }
      return this.scale(t);
    }
  }
  isInRange(t) {
    var r = this.range(),
      n = r[0],
      i = r[r.length - 1];
    return n <= i ? t >= n && t <= i : t >= i && t <= n;
  }
}
tT(Ql, 'EPS', 1e-4);
function iT(e) {
  return ((e % 180) + 180) % 180;
}
var aT = function (t) {
    var { width: r, height: n } = t,
      i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
      a = iT(i),
      o = (a * Math.PI) / 180,
      u = Math.atan(n / r),
      l = o > u && o < Math.PI - u ? n / Math.sin(o) : r / Math.cos(o);
    return Math.abs(l);
  },
  oT = { dots: [], areas: [], lines: [] },
  Vm = Le({
    name: 'referenceElements',
    initialState: oT,
    reducers: {
      addDot: (e, t) => {
        e.dots.push(t.payload);
      },
      removeDot: (e, t) => {
        var r = dt(e).dots.findIndex((n) => n === t.payload);
        r !== -1 && e.dots.splice(r, 1);
      },
      addArea: (e, t) => {
        e.areas.push(t.payload);
      },
      removeArea: (e, t) => {
        var r = dt(e).areas.findIndex((n) => n === t.payload);
        r !== -1 && e.areas.splice(r, 1);
      },
      addLine: (e, t) => {
        e.lines.push(t.payload);
      },
      removeLine: (e, t) => {
        var r = dt(e).lines.findIndex((n) => n === t.payload);
        r !== -1 && e.lines.splice(r, 1);
      },
    },
  }),
  {
    addDot: _M,
    removeDot: TM,
    addArea: CM,
    removeArea: jM,
    addLine: MM,
    removeLine: kM,
  } = Vm.actions,
  uT = Vm.reducer,
  lT = y.createContext(void 0),
  cT = (e) => {
    var { children: t } = e,
      [r] = y.useState(''.concat(zr('recharts'), '-clip')),
      n = Wi();
    if (n == null) return null;
    var { x: i, y: a, width: o, height: u } = n;
    return y.createElement(
      lT.Provider,
      { value: r },
      y.createElement(
        'defs',
        null,
        y.createElement(
          'clipPath',
          { id: r },
          y.createElement('rect', { x: i, y: a, height: u, width: o })
        )
      ),
      t
    );
  };
function So(e, t) {
  for (var r in e)
    if ({}.hasOwnProperty.call(e, r) && (!{}.hasOwnProperty.call(t, r) || e[r] !== t[r])) return !1;
  for (var n in t) if ({}.hasOwnProperty.call(t, n) && !{}.hasOwnProperty.call(e, n)) return !1;
  return !0;
}
function Xm(e, t, r) {
  if (t < 1) return [];
  if (t === 1 && r === void 0) return e;
  for (var n = [], i = 0; i < e.length; i += t) n.push(e[i]);
  return n;
}
function sT(e, t, r) {
  var n = { width: e.width + t.width, height: e.height + t.height };
  return aT(n, r);
}
function fT(e, t, r) {
  var n = r === 'width',
    { x: i, y: a, width: o, height: u } = e;
  return t === 1
    ? { start: n ? i : a, end: n ? i + o : a + u }
    : { start: n ? i + o : a + u, end: n ? i : a };
}
function oi(e, t, r, n, i) {
  if (e * t < e * n || e * t > e * i) return !1;
  var a = r();
  return e * (t - (e * a) / 2 - n) >= 0 && e * (t + (e * a) / 2 - i) <= 0;
}
function dT(e, t) {
  return Xm(e, t + 1);
}
function hT(e, t, r, n, i) {
  for (
    var a = (n || []).slice(),
      { start: o, end: u } = t,
      l = 0,
      s = 1,
      c = o,
      f = function () {
        var v = n?.[l];
        if (v === void 0) return { v: Xm(n, s) };
        var p = l,
          m,
          g = () => (m === void 0 && (m = r(v, p)), m),
          w = v.coordinate,
          b = l === 0 || oi(e, w, g, c, u);
        (b || ((l = 0), (c = o), (s += 1)), b && ((c = w + e * (g() / 2 + i)), (l += s)));
      },
      d;
    s <= a.length;

  )
    if (((d = f()), d)) return d.v;
  return [];
}
function Rd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ge(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Rd(Object(r), !0).forEach(function (n) {
          vT(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Rd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function vT(e, t, r) {
  return (
    (t = pT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function pT(e) {
  var t = mT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function mT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function yT(e, t, r, n, i) {
  for (
    var a = (n || []).slice(),
      o = a.length,
      { start: u } = t,
      { end: l } = t,
      s = function (d) {
        var h = a[d],
          v,
          p = () => (v === void 0 && (v = r(h, d)), v);
        if (d === o - 1) {
          var m = e * (h.coordinate + (e * p()) / 2 - l);
          a[d] = h = ge(ge({}, h), {}, { tickCoord: m > 0 ? h.coordinate - m * e : h.coordinate });
        } else a[d] = h = ge(ge({}, h), {}, { tickCoord: h.coordinate });
        var g = oi(e, h.tickCoord, p, u, l);
        g && ((l = h.tickCoord - e * (p() / 2 + i)), (a[d] = ge(ge({}, h), {}, { isShow: !0 })));
      },
      c = o - 1;
    c >= 0;
    c--
  )
    s(c);
  return a;
}
function gT(e, t, r, n, i, a) {
  var o = (n || []).slice(),
    u = o.length,
    { start: l, end: s } = t;
  if (a) {
    var c = n[u - 1],
      f = r(c, u - 1),
      d = e * (c.coordinate + (e * f) / 2 - s);
    o[u - 1] = c = ge(ge({}, c), {}, { tickCoord: d > 0 ? c.coordinate - d * e : c.coordinate });
    var h = oi(e, c.tickCoord, () => f, l, s);
    h && ((s = c.tickCoord - e * (f / 2 + i)), (o[u - 1] = ge(ge({}, c), {}, { isShow: !0 })));
  }
  for (
    var v = a ? u - 1 : u,
      p = function (w) {
        var b = o[w],
          P,
          x = () => (P === void 0 && (P = r(b, w)), P);
        if (w === 0) {
          var O = e * (b.coordinate - (e * x()) / 2 - l);
          o[w] = b = ge(ge({}, b), {}, { tickCoord: O < 0 ? b.coordinate - O * e : b.coordinate });
        } else o[w] = b = ge(ge({}, b), {}, { tickCoord: b.coordinate });
        var S = oi(e, b.tickCoord, x, l, s);
        S && ((l = b.tickCoord + e * (x() / 2 + i)), (o[w] = ge(ge({}, b), {}, { isShow: !0 })));
      },
      m = 0;
    m < v;
    m++
  )
    p(m);
  return o;
}
function ec(e, t, r) {
  var {
    tick: n,
    ticks: i,
    viewBox: a,
    minTickGap: o,
    orientation: u,
    interval: l,
    tickFormatter: s,
    unit: c,
    angle: f,
  } = e;
  if (!i || !i.length || !n) return [];
  if (k(l) || wr.isSsr) {
    var d;
    return (d = dT(i, k(l) ? l : 0)) !== null && d !== void 0 ? d : [];
  }
  var h = [],
    v = u === 'top' || u === 'bottom' ? 'width' : 'height',
    p = c && v === 'width' ? qr(c, { fontSize: t, letterSpacing: r }) : { width: 0, height: 0 },
    m = (b, P) => {
      var x = typeof s == 'function' ? s(b.value, P) : b.value;
      return v === 'width'
        ? sT(qr(x, { fontSize: t, letterSpacing: r }), p, f)
        : qr(x, { fontSize: t, letterSpacing: r })[v];
    },
    g = i.length >= 2 ? Ue(i[1].coordinate - i[0].coordinate) : 1,
    w = fT(a, g, v);
  return l === 'equidistantPreserveStart'
    ? hT(g, w, m, i, o)
    : (l === 'preserveStart' || l === 'preserveStartEnd'
        ? (h = gT(g, w, m, i, o, l === 'preserveStartEnd'))
        : (h = yT(g, w, m, i, o)),
      h.filter((b) => b.isShow));
}
var bT = ['viewBox'],
  wT = ['viewBox'];
function sr() {
  return (
    (sr = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    sr.apply(null, arguments)
  );
}
function Ld(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ae(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Ld(Object(r), !0).forEach(function (n) {
          tc(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Ld(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Bd(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = xT(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function xT(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function tc(e, t, r) {
  return (
    (t = PT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function PT(e) {
  var t = OT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function OT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
class Rt extends y.Component {
  constructor(t) {
    (super(t),
      (this.tickRefs = y.createRef()),
      (this.tickRefs.current = []),
      (this.state = { fontSize: '', letterSpacing: '' }));
  }
  shouldComponentUpdate(t, r) {
    var { viewBox: n } = t,
      i = Bd(t, bT),
      a = this.props,
      { viewBox: o } = a,
      u = Bd(a, wT);
    return !So(n, o) || !So(i, u) || !So(r, this.state);
  }
  getTickLineCoord(t) {
    var {
        x: r,
        y: n,
        width: i,
        height: a,
        orientation: o,
        tickSize: u,
        mirror: l,
        tickMargin: s,
      } = this.props,
      c,
      f,
      d,
      h,
      v,
      p,
      m = l ? -1 : 1,
      g = t.tickSize || u,
      w = k(t.tickCoord) ? t.tickCoord : t.coordinate;
    switch (o) {
      case 'top':
        ((c = f = t.coordinate), (h = n + +!l * a), (d = h - m * g), (p = d - m * s), (v = w));
        break;
      case 'left':
        ((d = h = t.coordinate), (f = r + +!l * i), (c = f - m * g), (v = c - m * s), (p = w));
        break;
      case 'right':
        ((d = h = t.coordinate), (f = r + +l * i), (c = f + m * g), (v = c + m * s), (p = w));
        break;
      default:
        ((c = f = t.coordinate), (h = n + +l * a), (d = h + m * g), (p = d + m * s), (v = w));
        break;
    }
    return { line: { x1: c, y1: d, x2: f, y2: h }, tick: { x: v, y: p } };
  }
  getTickTextAnchor() {
    var { orientation: t, mirror: r } = this.props,
      n;
    switch (t) {
      case 'left':
        n = r ? 'start' : 'end';
        break;
      case 'right':
        n = r ? 'end' : 'start';
        break;
      default:
        n = 'middle';
        break;
    }
    return n;
  }
  getTickVerticalAnchor() {
    var { orientation: t, mirror: r } = this.props;
    switch (t) {
      case 'left':
      case 'right':
        return 'middle';
      case 'top':
        return r ? 'start' : 'end';
      default:
        return r ? 'end' : 'start';
    }
  }
  renderAxisLine() {
    var { x: t, y: r, width: n, height: i, orientation: a, mirror: o, axisLine: u } = this.props,
      l = ae(ae(ae({}, ee(this.props, !1)), ee(u, !1)), {}, { fill: 'none' });
    if (a === 'top' || a === 'bottom') {
      var s = +((a === 'top' && !o) || (a === 'bottom' && o));
      l = ae(ae({}, l), {}, { x1: t, y1: r + s * i, x2: t + n, y2: r + s * i });
    } else {
      var c = +((a === 'left' && !o) || (a === 'right' && o));
      l = ae(ae({}, l), {}, { x1: t + c * n, y1: r, x2: t + c * n, y2: r + i });
    }
    return y.createElement(
      'line',
      sr({}, l, { className: K('recharts-cartesian-axis-line', Jt(u, 'className')) })
    );
  }
  static renderTickItem(t, r, n) {
    var i,
      a = K(r.className, 'recharts-cartesian-axis-tick-value');
    if (y.isValidElement(t)) i = y.cloneElement(t, ae(ae({}, r), {}, { className: a }));
    else if (typeof t == 'function') i = t(ae(ae({}, r), {}, { className: a }));
    else {
      var o = 'recharts-cartesian-axis-tick-value';
      (typeof t != 'boolean' && (o = K(o, t.className)),
        (i = y.createElement(Vl, sr({}, r, { className: o }), n)));
    }
    return i;
  }
  renderTicks(t, r) {
    var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [],
      { tickLine: i, stroke: a, tick: o, tickFormatter: u, unit: l, padding: s } = this.props,
      c = ec(ae(ae({}, this.props), {}, { ticks: n }), t, r),
      f = this.getTickTextAnchor(),
      d = this.getTickVerticalAnchor(),
      h = kt(this.props),
      v = ee(o, !1),
      p = ae(ae({}, h), {}, { fill: 'none' }, ee(i, !1)),
      m = c.map((g, w) => {
        var { line: b, tick: P } = this.getTickLineCoord(g),
          x = ae(
            ae(
              ae(ae({ textAnchor: f, verticalAnchor: d }, h), {}, { stroke: 'none', fill: a }, v),
              P
            ),
            {},
            { index: w, payload: g, visibleTicksCount: c.length, tickFormatter: u, padding: s }
          );
        return y.createElement(
          et,
          sr(
            {
              className: 'recharts-cartesian-axis-tick',
              key: 'tick-'.concat(g.value, '-').concat(g.coordinate, '-').concat(g.tickCoord),
            },
            nh(this.props, g, w)
          ),
          i &&
            y.createElement(
              'line',
              sr({}, p, b, {
                className: K('recharts-cartesian-axis-tick-line', Jt(i, 'className')),
              })
            ),
          o &&
            Rt.renderTickItem(
              o,
              x,
              ''.concat(typeof u == 'function' ? u(g.value, w) : g.value).concat(l || '')
            )
        );
      });
    return m.length > 0
      ? y.createElement('g', { className: 'recharts-cartesian-axis-ticks' }, m)
      : null;
  }
  render() {
    var { axisLine: t, width: r, height: n, className: i, hide: a } = this.props;
    if (a) return null;
    var { ticks: o } = this.props;
    return (r != null && r <= 0) || (n != null && n <= 0)
      ? null
      : y.createElement(
          et,
          {
            className: K('recharts-cartesian-axis', i),
            ref: (u) => {
              if (u) {
                var l = u.getElementsByClassName('recharts-cartesian-axis-tick-value');
                this.tickRefs.current = Array.from(l);
                var s = l[0];
                if (s) {
                  var c = window.getComputedStyle(s).fontSize,
                    f = window.getComputedStyle(s).letterSpacing;
                  (c !== this.state.fontSize || f !== this.state.letterSpacing) &&
                    this.setState({
                      fontSize: window.getComputedStyle(s).fontSize,
                      letterSpacing: window.getComputedStyle(s).letterSpacing,
                    });
                }
              }
            },
          },
          t && this.renderAxisLine(),
          this.renderTicks(this.state.fontSize, this.state.letterSpacing, o),
          Ie.renderCallByParent(this.props)
        );
  }
}
tc(Rt, 'displayName', 'CartesianAxis');
tc(Rt, 'defaultProps', {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  viewBox: { x: 0, y: 0, width: 0, height: 0 },
  orientation: 'bottom',
  ticks: [],
  stroke: '#666',
  tickLine: !0,
  axisLine: !0,
  tick: !0,
  mirror: !1,
  minTickGap: 5,
  tickSize: 6,
  tickMargin: 2,
  interval: 'preserveEnd',
});
var AT = ['x1', 'y1', 'x2', 'y2', 'key'],
  ST = ['offset'],
  ET = ['xAxisId', 'yAxisId'],
  _T = ['xAxisId', 'yAxisId'];
function qd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function be(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? qd(Object(r), !0).forEach(function (n) {
          TT(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : qd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function TT(e, t, r) {
  return (
    (t = CT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function CT(e) {
  var t = jT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function jT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Ht() {
  return (
    (Ht = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Ht.apply(null, arguments)
  );
}
function ui(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = MT(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function MT(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var kT = (e) => {
  var { fill: t } = e;
  if (!t || t === 'none') return null;
  var { fillOpacity: r, x: n, y: i, width: a, height: o, ry: u } = e;
  return y.createElement('rect', {
    x: n,
    y: i,
    ry: u,
    width: a,
    height: o,
    stroke: 'none',
    fill: t,
    fillOpacity: r,
    className: 'recharts-cartesian-grid-bg',
  });
};
function Zm(e, t) {
  var r;
  if (y.isValidElement(e)) r = y.cloneElement(e, t);
  else if (typeof e == 'function') r = e(t);
  else {
    var { x1: n, y1: i, x2: a, y2: o, key: u } = t,
      l = ui(t, AT),
      s = kt(l),
      { offset: c } = s,
      f = ui(s, ST);
    r = y.createElement('line', Ht({}, f, { x1: n, y1: i, x2: a, y2: o, fill: 'none', key: u }));
  }
  return r;
}
function IT(e) {
  var { x: t, width: r, horizontal: n = !0, horizontalPoints: i } = e;
  if (!n || !i || !i.length) return null;
  var { xAxisId: a, yAxisId: o } = e,
    u = ui(e, ET),
    l = i.map((s, c) => {
      var f = be(
        be({}, u),
        {},
        { x1: t, y1: s, x2: t + r, y2: s, key: 'line-'.concat(c), index: c }
      );
      return Zm(n, f);
    });
  return y.createElement('g', { className: 'recharts-cartesian-grid-horizontal' }, l);
}
function DT(e) {
  var { y: t, height: r, vertical: n = !0, verticalPoints: i } = e;
  if (!n || !i || !i.length) return null;
  var { xAxisId: a, yAxisId: o } = e,
    u = ui(e, _T),
    l = i.map((s, c) => {
      var f = be(
        be({}, u),
        {},
        { x1: s, y1: t, x2: s, y2: t + r, key: 'line-'.concat(c), index: c }
      );
      return Zm(n, f);
    });
  return y.createElement('g', { className: 'recharts-cartesian-grid-vertical' }, l);
}
function NT(e) {
  var {
    horizontalFill: t,
    fillOpacity: r,
    x: n,
    y: i,
    width: a,
    height: o,
    horizontalPoints: u,
    horizontal: l = !0,
  } = e;
  if (!l || !t || !t.length) return null;
  var s = u.map((f) => Math.round(f + i - i)).sort((f, d) => f - d);
  i !== s[0] && s.unshift(0);
  var c = s.map((f, d) => {
    var h = !s[d + 1],
      v = h ? i + o - f : s[d + 1] - f;
    if (v <= 0) return null;
    var p = d % t.length;
    return y.createElement('rect', {
      key: 'react-'.concat(d),
      y: f,
      x: n,
      height: v,
      width: a,
      stroke: 'none',
      fill: t[p],
      fillOpacity: r,
      className: 'recharts-cartesian-grid-bg',
    });
  });
  return y.createElement('g', { className: 'recharts-cartesian-gridstripes-horizontal' }, c);
}
function $T(e) {
  var {
    vertical: t = !0,
    verticalFill: r,
    fillOpacity: n,
    x: i,
    y: a,
    width: o,
    height: u,
    verticalPoints: l,
  } = e;
  if (!t || !r || !r.length) return null;
  var s = l.map((f) => Math.round(f + i - i)).sort((f, d) => f - d);
  i !== s[0] && s.unshift(0);
  var c = s.map((f, d) => {
    var h = !s[d + 1],
      v = h ? i + o - f : s[d + 1] - f;
    if (v <= 0) return null;
    var p = d % r.length;
    return y.createElement('rect', {
      key: 'react-'.concat(d),
      x: f,
      y: a,
      width: v,
      height: u,
      stroke: 'none',
      fill: r[p],
      fillOpacity: n,
      className: 'recharts-cartesian-grid-bg',
    });
  });
  return y.createElement('g', { className: 'recharts-cartesian-gridstripes-vertical' }, c);
}
var RT = (e, t) => {
    var { xAxis: r, width: n, height: i, offset: a } = e;
    return cv(
      ec(
        be(
          be(be({}, Rt.defaultProps), r),
          {},
          { ticks: sv(r), viewBox: { x: 0, y: 0, width: n, height: i } }
        )
      ),
      a.left,
      a.left + a.width,
      t
    );
  },
  LT = (e, t) => {
    var { yAxis: r, width: n, height: i, offset: a } = e;
    return cv(
      ec(
        be(
          be(be({}, Rt.defaultProps), r),
          {},
          { ticks: sv(r), viewBox: { x: 0, y: 0, width: n, height: i } }
        )
      ),
      a.top,
      a.top + a.height,
      t
    );
  },
  BT = {
    horizontal: !0,
    vertical: !0,
    horizontalPoints: [],
    verticalPoints: [],
    stroke: '#ccc',
    fill: 'none',
    verticalFill: [],
    horizontalFill: [],
    xAxisId: 0,
    yAxisId: 0,
  };
function qT(e) {
  var t = Yu(),
    r = Gu(),
    n = hv(),
    i = be(
      be({}, ut(e, BT)),
      {},
      {
        x: k(e.x) ? e.x : n.left,
        y: k(e.y) ? e.y : n.top,
        width: k(e.width) ? e.width : n.width,
        height: k(e.height) ? e.height : n.height,
      }
    ),
    {
      xAxisId: a,
      yAxisId: o,
      x: u,
      y: l,
      width: s,
      height: c,
      syncWithTicks: f,
      horizontalValues: d,
      verticalValues: h,
    } = i,
    v = Se(),
    p = D((C) => Xf(C, 'xAxis', a, v)),
    m = D((C) => Xf(C, 'yAxis', o, v));
  if (!k(s) || s <= 0 || !k(c) || c <= 0 || !k(u) || u !== +u || !k(l) || l !== +l) return null;
  var g = i.verticalCoordinatesGenerator || RT,
    w = i.horizontalCoordinatesGenerator || LT,
    { horizontalPoints: b, verticalPoints: P } = i;
  if ((!b || !b.length) && typeof w == 'function') {
    var x = d && d.length,
      O = w(
        {
          yAxis: m ? be(be({}, m), {}, { ticks: x ? d : m.ticks }) : void 0,
          width: t,
          height: r,
          offset: n,
        },
        x ? !0 : f
      );
    (Br(
      Array.isArray(O),
      'horizontalCoordinatesGenerator should return Array but instead it returned ['.concat(
        typeof O,
        ']'
      )
    ),
      Array.isArray(O) && (b = O));
  }
  if ((!P || !P.length) && typeof g == 'function') {
    var S = h && h.length,
      _ = g(
        {
          xAxis: p ? be(be({}, p), {}, { ticks: S ? h : p.ticks }) : void 0,
          width: t,
          height: r,
          offset: n,
        },
        S ? !0 : f
      );
    (Br(
      Array.isArray(_),
      'verticalCoordinatesGenerator should return Array but instead it returned ['.concat(
        typeof _,
        ']'
      )
    ),
      Array.isArray(_) && (P = _));
  }
  return y.createElement(
    'g',
    { className: 'recharts-cartesian-grid' },
    y.createElement(kT, {
      fill: i.fill,
      fillOpacity: i.fillOpacity,
      x: i.x,
      y: i.y,
      width: i.width,
      height: i.height,
      ry: i.ry,
    }),
    y.createElement(NT, Ht({}, i, { horizontalPoints: b })),
    y.createElement($T, Ht({}, i, { verticalPoints: P })),
    y.createElement(IT, Ht({}, i, { offset: n, horizontalPoints: b, xAxis: p, yAxis: m })),
    y.createElement(DT, Ht({}, i, { offset: n, verticalPoints: P, xAxis: p, yAxis: m }))
  );
}
qT.displayName = 'CartesianGrid';
var Jm = (e, t, r, n) => Fi(e, 'xAxis', t, n),
  Qm = (e, t, r, n) => zi(e, 'xAxis', t, n),
  ey = (e, t, r, n) => Fi(e, 'yAxis', r, n),
  ty = (e, t, r, n) => zi(e, 'yAxis', r, n),
  zT = A([U, Jm, ey, Qm, ty], (e, t, r, n, i) => (ot(e, 'xAxis') ? Wr(t, n, !1) : Wr(r, i, !1))),
  FT = (e, t, r, n, i) => i;
function KT(e) {
  return e.type === 'line';
}
var WT = A([kl, FT], (e, t) => e.filter(KT).find((r) => r.id === t)),
  UT = A([U, Jm, ey, Qm, ty, WT, zT, Mi], (e, t, r, n, i, a, o, u) => {
    var { chartData: l, dataStartIndex: s, dataEndIndex: c } = u;
    if (
      !(
        a == null ||
        t == null ||
        r == null ||
        n == null ||
        i == null ||
        n.length === 0 ||
        i.length === 0 ||
        o == null
      )
    ) {
      var { dataKey: f, data: d } = a,
        h;
      if ((d != null && d.length > 0 ? (h = d) : (h = l?.slice(s, c + 1)), h != null))
        return dC({
          layout: e,
          xAxis: t,
          yAxis: r,
          xAxisTicks: n,
          yAxisTicks: i,
          dataKey: f,
          bandSize: o,
          displayedData: h,
        });
    }
  }),
  HT = ['id'],
  YT = ['type', 'layout', 'connectNulls', 'needClip'],
  GT = [
    'activeDot',
    'animateNewValues',
    'animationBegin',
    'animationDuration',
    'animationEasing',
    'connectNulls',
    'dot',
    'hide',
    'isAnimationActive',
    'label',
    'legendType',
    'xAxisId',
    'yAxisId',
    'id',
  ];
function zd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Ze(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? zd(Object(r), !0).forEach(function (n) {
          VT(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : zd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function VT(e, t, r) {
  return (
    (t = XT(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function XT(e) {
  var t = ZT(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function ZT(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function rc(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = JT(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function JT(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function rr() {
  return (
    (rr = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    rr.apply(null, arguments)
  );
}
var QT = (e) => {
  var { dataKey: t, name: r, stroke: n, legendType: i, hide: a } = e;
  return [{ inactive: a, dataKey: t, type: i, color: n, value: wi(r, t), payload: e }];
};
function eC(e) {
  var { dataKey: t, data: r, stroke: n, strokeWidth: i, fill: a, name: o, hide: u, unit: l } = e;
  return {
    dataDefinedOnItem: r,
    positions: void 0,
    settings: {
      stroke: n,
      strokeWidth: i,
      fill: a,
      dataKey: t,
      nameKey: void 0,
      name: wi(o, t),
      hide: u,
      type: e.tooltipType,
      color: e.stroke,
      unit: l,
    },
  };
}
var ry = (e, t) => ''.concat(t, 'px ').concat(e - t, 'px');
function tC(e, t) {
  for (var r = e.length % 2 !== 0 ? [...e, 0] : e, n = [], i = 0; i < t; ++i) n = [...n, ...r];
  return n;
}
var rC = (e, t, r) => {
  var n = r.reduce((f, d) => f + d);
  if (!n) return ry(t, e);
  for (
    var i = Math.floor(e / n), a = e % n, o = t - e, u = [], l = 0, s = 0;
    l < r.length;
    s += r[l], ++l
  )
    if (s + r[l] > a) {
      u = [...r.slice(0, l), a - s];
      break;
    }
  var c = u.length % 2 === 0 ? [0, o] : [o];
  return [...tC(r, i), ...u, ...c].map((f) => ''.concat(f, 'px')).join(', ');
};
function nC(e, t) {
  var r;
  if (y.isValidElement(e)) r = y.cloneElement(e, t);
  else if (typeof e == 'function') r = e(t);
  else {
    var n = K('recharts-line-dot', typeof e != 'boolean' ? e.className : '');
    r = y.createElement(Zl, rr({}, t, { className: n }));
  }
  return r;
}
function iC(e, t) {
  return e == null ? !1 : t ? !0 : e.length === 1;
}
function aC(e) {
  var { clipPathId: t, points: r, props: n } = e,
    { dot: i, dataKey: a, needClip: o } = n;
  if (!iC(r, i)) return null;
  var { id: u } = n,
    l = rc(n, HT),
    s = si(i),
    c = kt(l),
    f = ee(i, !0),
    d = r.map((v, p) => {
      var m = Ze(
        Ze(Ze({ key: 'dot-'.concat(p), r: 3 }, c), f),
        {},
        { index: p, cx: v.x, cy: v.y, dataKey: a, value: v.value, payload: v.payload, points: r }
      );
      return nC(i, m);
    }),
    h = { clipPath: o ? 'url(#clipPath-'.concat(s ? '' : 'dots-').concat(t, ')') : void 0 };
  return y.createElement(et, rr({ className: 'recharts-line-dots', key: 'dots' }, h), d);
}
function mu(e) {
  var { clipPathId: t, pathRef: r, points: n, strokeDasharray: i, props: a, showLabels: o } = e,
    { type: u, layout: l, connectNulls: s, needClip: c } = a,
    f = rc(a, YT),
    d = Ze(
      Ze({}, ee(f, !0)),
      {},
      {
        fill: 'none',
        className: 'recharts-line-curve',
        clipPath: c ? 'url(#clipPath-'.concat(t, ')') : void 0,
        points: n,
        type: u,
        layout: l,
        connectNulls: s,
        strokeDasharray: i ?? a.strokeDasharray,
      }
    );
  return y.createElement(
    y.Fragment,
    null,
    n?.length > 1 && y.createElement(Lr, rr({}, d, { pathRef: r })),
    y.createElement(aC, { points: n, clipPathId: t, props: a }),
    o && Ct.renderCallByParent(a, n)
  );
}
function oC(e) {
  try {
    return (e && e.getTotalLength && e.getTotalLength()) || 0;
  } catch {
    return 0;
  }
}
function uC(e) {
  var {
      clipPathId: t,
      props: r,
      pathRef: n,
      previousPointsRef: i,
      longestAnimatedLengthRef: a,
    } = e,
    {
      points: o,
      strokeDasharray: u,
      isAnimationActive: l,
      animationBegin: s,
      animationDuration: c,
      animationEasing: f,
      animateNewValues: d,
      width: h,
      height: v,
      onAnimationEnd: p,
      onAnimationStart: m,
    } = r,
    g = i.current,
    w = zm(r, 'recharts-line-'),
    [b, P] = y.useState(!1),
    x = y.useCallback(() => {
      (typeof p == 'function' && p(), P(!1));
    }, [p]),
    O = y.useCallback(() => {
      (typeof m == 'function' && m(), P(!0));
    }, [m]),
    S = oC(n.current),
    _ = a.current;
  return y.createElement(
    Um,
    {
      begin: s,
      duration: c,
      isActive: l,
      easing: f,
      onAnimationEnd: x,
      onAnimationStart: O,
      key: w,
    },
    (C) => {
      var N = Xe(_, S + _, C),
        T = Math.min(N, S),
        M;
      if (u) {
        var L = ''
          .concat(u)
          .split(/[,\s]+/gim)
          .map((H) => parseFloat(H));
        M = rC(T, S, L);
      } else M = ry(S, T);
      if (g) {
        var z = g.length / o.length,
          J =
            C === 1
              ? o
              : o.map((H, ie) => {
                  var _e = Math.floor(ie * z);
                  if (g[_e]) {
                    var ce = g[_e];
                    return Ze(Ze({}, H), {}, { x: Xe(ce.x, H.x, C), y: Xe(ce.y, H.y, C) });
                  }
                  return d
                    ? Ze(Ze({}, H), {}, { x: Xe(h * 2, H.x, C), y: Xe(v / 2, H.y, C) })
                    : Ze(Ze({}, H), {}, { x: H.x, y: H.y });
                });
        return (
          (i.current = J),
          y.createElement(mu, {
            props: r,
            points: J,
            clipPathId: t,
            pathRef: n,
            showLabels: !b,
            strokeDasharray: M,
          })
        );
      }
      return (
        C > 0 && S > 0 && ((i.current = o), (a.current = T)),
        y.createElement(mu, {
          props: r,
          points: o,
          clipPathId: t,
          pathRef: n,
          showLabels: !b,
          strokeDasharray: M,
        })
      );
    }
  );
}
function lC(e) {
  var { clipPathId: t, props: r } = e,
    { points: n, isAnimationActive: i } = r,
    a = y.useRef(null),
    o = y.useRef(0),
    u = y.useRef(null),
    l = a.current;
  return i && n && n.length && l !== n
    ? y.createElement(uC, {
        props: r,
        clipPathId: t,
        previousPointsRef: a,
        longestAnimatedLengthRef: o,
        pathRef: u,
      })
    : y.createElement(mu, { props: r, points: n, clipPathId: t, pathRef: u, showLabels: !0 });
}
var cC = (e, t) => ({ x: e.x, y: e.y, value: e.value, errorVal: pe(e.payload, t) });
class sC extends y.Component {
  render() {
    var t,
      {
        hide: r,
        dot: n,
        points: i,
        className: a,
        xAxisId: o,
        yAxisId: u,
        top: l,
        left: s,
        width: c,
        height: f,
        id: d,
        needClip: h,
      } = this.props;
    if (r) return null;
    var v = K('recharts-line', a),
      p = d,
      { r: m = 3, strokeWidth: g = 2 } =
        (t = ee(n, !1)) !== null && t !== void 0 ? t : { r: 3, strokeWidth: 2 },
      w = si(n),
      b = m * 2 + g;
    return y.createElement(
      y.Fragment,
      null,
      y.createElement(
        et,
        { className: v },
        h &&
          y.createElement(
            'defs',
            null,
            y.createElement(Ym, { clipPathId: p, xAxisId: o, yAxisId: u }),
            !w &&
              y.createElement(
                'clipPath',
                { id: 'clipPath-dots-'.concat(p) },
                y.createElement('rect', { x: s - b / 2, y: l - b / 2, width: c + b, height: f + b })
              )
          ),
        y.createElement(lC, { props: this.props, clipPathId: p }),
        y.createElement(
          J_,
          { xAxisId: o, yAxisId: u, data: i, dataPointFormatter: cC, errorBarOffset: 0 },
          this.props.children
        )
      ),
      y.createElement(pu, {
        activeDot: this.props.activeDot,
        points: i,
        mainColor: this.props.stroke,
        itemDataKey: this.props.dataKey,
      })
    );
  }
}
var ny = {
  activeDot: !0,
  animateNewValues: !0,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  connectNulls: !1,
  dot: !0,
  fill: '#fff',
  hide: !1,
  isAnimationActive: !wr.isSsr,
  label: !1,
  legendType: 'line',
  stroke: '#3182bd',
  strokeWidth: 1,
  xAxisId: 0,
  yAxisId: 0,
};
function fC(e) {
  var t = ut(e, ny),
    {
      activeDot: r,
      animateNewValues: n,
      animationBegin: i,
      animationDuration: a,
      animationEasing: o,
      connectNulls: u,
      dot: l,
      hide: s,
      isAnimationActive: c,
      label: f,
      legendType: d,
      xAxisId: h,
      yAxisId: v,
      id: p,
    } = t,
    m = rc(t, GT),
    { needClip: g } = Jl(h, v),
    w = Wi(),
    b = Ai(),
    P = Se(),
    x = D((N) => UT(N, h, v, P, p));
  if ((b !== 'horizontal' && b !== 'vertical') || x == null || w == null) return null;
  var { height: O, width: S, x: _, y: C } = w;
  return y.createElement(
    sC,
    rr({}, m, {
      id: p,
      connectNulls: u,
      dot: l,
      activeDot: r,
      animateNewValues: n,
      animationBegin: i,
      animationDuration: a,
      animationEasing: o,
      isAnimationActive: c,
      hide: s,
      label: f,
      legendType: d,
      xAxisId: h,
      yAxisId: v,
      points: x,
      layout: b,
      height: O,
      width: S,
      left: _,
      top: C,
      needClip: g,
    })
  );
}
function dC(e) {
  var {
    layout: t,
    xAxis: r,
    yAxis: n,
    xAxisTicks: i,
    yAxisTicks: a,
    dataKey: o,
    bandSize: u,
    displayedData: l,
  } = e;
  return l
    .map((s, c) => {
      var f = pe(s, o);
      if (t === 'horizontal') {
        var d = zn({ axis: r, ticks: i, bandSize: u, entry: s, index: c }),
          h = te(f) ? null : n.scale(f);
        return { x: d, y: h, value: f, payload: s };
      }
      var v = te(f) ? null : r.scale(f),
        p = zn({ axis: n, ticks: a, bandSize: u, entry: s, index: c });
      return v == null || p == null ? null : { x: v, y: p, value: f, payload: s };
    })
    .filter(Boolean);
}
function hC(e) {
  var t = ut(e, ny),
    r = Se();
  return y.createElement(Fm, { id: t.id, type: 'line' }, (n) =>
    y.createElement(
      y.Fragment,
      null,
      y.createElement(qm, { legendPayload: QT(t) }),
      y.createElement(Bm, { fn: eC, args: t }),
      y.createElement(Wm, {
        type: 'line',
        id: n,
        data: t.data,
        xAxisId: t.xAxisId,
        yAxisId: t.yAxisId,
        zAxisId: 0,
        dataKey: t.dataKey,
        hide: t.hide,
        isPanorama: r,
      }),
      y.createElement(fC, rr({}, t, { id: n }))
    )
  );
}
hC.displayName = 'Line';
var iy = (e, t, r, n) => Fi(e, 'xAxis', t, n),
  ay = (e, t, r, n) => zi(e, 'xAxis', t, n),
  oy = (e, t, r, n) => Fi(e, 'yAxis', r, n),
  uy = (e, t, r, n) => zi(e, 'yAxis', r, n),
  vC = A([U, iy, oy, ay, uy], (e, t, r, n, i) => (ot(e, 'xAxis') ? Wr(t, n, !1) : Wr(r, i, !1))),
  pC = (e, t, r, n, i) => i,
  ly = A([kl, pC], (e, t) => e.filter((r) => r.type === 'area').find((r) => r.id === t)),
  mC = (e, t, r, n, i) => {
    var a,
      o = ly(e, t, r, n, i);
    if (o != null) {
      var u = U(e),
        l = ot(u, 'xAxis'),
        s;
      if ((l ? (s = lu(e, 'yAxis', r, n)) : (s = lu(e, 'xAxis', t, n)), s != null)) {
        var { stackId: c } = o,
          f = Cl(o);
        if (!(c == null || f == null)) {
          var d = (a = s[c]) === null || a === void 0 ? void 0 : a.stackedData;
          return d?.find((h) => h.key === f);
        }
      }
    }
  },
  yC = A([U, iy, oy, ay, uy, mC, Mi, vC, ly], (e, t, r, n, i, a, o, u, l) => {
    var { chartData: s, dataStartIndex: c, dataEndIndex: f } = o;
    if (
      !(
        l == null ||
        (e !== 'horizontal' && e !== 'vertical') ||
        t == null ||
        r == null ||
        n == null ||
        i == null ||
        n.length === 0 ||
        i.length === 0 ||
        u == null
      )
    ) {
      var { data: d } = l,
        h;
      if ((d && d.length > 0 ? (h = d) : (h = s?.slice(c, f + 1)), h != null)) {
        var v = void 0;
        return RC({
          layout: e,
          xAxis: t,
          yAxis: r,
          xAxisTicks: n,
          yAxisTicks: i,
          dataStartIndex: c,
          areaSettings: l,
          stackedData: a,
          displayedData: h,
          chartBaseValue: v,
          bandSize: u,
        });
      }
    }
  }),
  gC = ['id'],
  bC = [
    'activeDot',
    'animationBegin',
    'animationDuration',
    'animationEasing',
    'connectNulls',
    'dot',
    'fill',
    'fillOpacity',
    'hide',
    'isAnimationActive',
    'legendType',
    'stroke',
    'xAxisId',
    'yAxisId',
  ];
function cy(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = wC(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function wC(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function Fd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Yt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Fd(Object(r), !0).forEach(function (n) {
          xC(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Fd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function xC(e, t, r) {
  return (
    (t = PC(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function PC(e) {
  var t = OC(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function OC(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function vt() {
  return (
    (vt = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    vt.apply(null, arguments)
  );
}
function li(e, t) {
  return e && e !== 'none' ? e : t;
}
var AC = (e) => {
  var { dataKey: t, name: r, stroke: n, fill: i, legendType: a, hide: o } = e;
  return [{ inactive: o, dataKey: t, type: a, color: li(n, i), value: wi(r, t), payload: e }];
};
function SC(e) {
  var { dataKey: t, data: r, stroke: n, strokeWidth: i, fill: a, name: o, hide: u, unit: l } = e;
  return {
    dataDefinedOnItem: r,
    positions: void 0,
    settings: {
      stroke: n,
      strokeWidth: i,
      fill: a,
      dataKey: t,
      nameKey: void 0,
      name: wi(o, t),
      hide: u,
      type: e.tooltipType,
      color: li(n, a),
      unit: l,
    },
  };
}
var EC = (e, t) => {
  var r;
  if (y.isValidElement(e)) r = y.cloneElement(e, t);
  else if (typeof e == 'function') r = e(t);
  else {
    var n = K('recharts-area-dot', typeof e != 'boolean' ? e.className : '');
    r = y.createElement(Zl, vt({}, t, { className: n }));
  }
  return r;
};
function _C(e, t) {
  return e == null ? !1 : t ? !0 : e.length === 1;
}
function TC(e) {
  var { clipPathId: t, points: r, props: n } = e,
    { needClip: i, dot: a, dataKey: o } = n;
  if (!_C(r, a)) return null;
  var u = si(a),
    l = kt(n),
    s = ee(a, !0),
    c = r.map((d, h) => {
      var v = Yt(
        Yt(Yt({ key: 'dot-'.concat(h), r: 3 }, l), s),
        {},
        { index: h, cx: d.x, cy: d.y, dataKey: o, value: d.value, payload: d.payload, points: r }
      );
      return EC(a, v);
    }),
    f = { clipPath: i ? 'url(#clipPath-'.concat(u ? '' : 'dots-').concat(t, ')') : void 0 };
  return y.createElement(et, vt({ className: 'recharts-area-dots' }, f), c);
}
function yu(e) {
  var { points: t, baseLine: r, needClip: n, clipPathId: i, props: a, showLabels: o } = e,
    { layout: u, type: l, stroke: s, connectNulls: c, isRange: f } = a,
    { id: d } = a,
    h = cy(a, gC),
    v = kt(h);
  return y.createElement(
    y.Fragment,
    null,
    t?.length > 1 &&
      y.createElement(
        et,
        { clipPath: n ? 'url(#clipPath-'.concat(i, ')') : void 0 },
        y.createElement(
          Lr,
          vt({}, v, {
            id: d,
            points: t,
            connectNulls: c,
            type: l,
            baseLine: r,
            layout: u,
            stroke: 'none',
            className: 'recharts-area-area',
          })
        ),
        s !== 'none' &&
          y.createElement(
            Lr,
            vt({}, v, {
              className: 'recharts-area-curve',
              layout: u,
              type: l,
              connectNulls: c,
              fill: 'none',
              points: t,
            })
          ),
        s !== 'none' &&
          f &&
          y.createElement(
            Lr,
            vt({}, v, {
              className: 'recharts-area-curve',
              layout: u,
              type: l,
              connectNulls: c,
              fill: 'none',
              points: r,
            })
          )
      ),
    y.createElement(TC, { points: t, props: h, clipPathId: i }),
    o && Ct.renderCallByParent(h, t)
  );
}
function CC(e) {
  var { alpha: t, baseLine: r, points: n, strokeWidth: i } = e,
    a = n[0].y,
    o = n[n.length - 1].y;
  if (!xe(a) || !xe(o)) return null;
  var u = t * Math.abs(a - o),
    l = Math.max(...n.map((s) => s.x || 0));
  return (
    k(r)
      ? (l = Math.max(r, l))
      : r && Array.isArray(r) && r.length && (l = Math.max(...r.map((s) => s.x || 0), l)),
    k(l)
      ? y.createElement('rect', {
          x: 0,
          y: a < o ? a : a - u,
          width: l + (i ? parseInt(''.concat(i), 10) : 1),
          height: Math.floor(u),
        })
      : null
  );
}
function jC(e) {
  var { alpha: t, baseLine: r, points: n, strokeWidth: i } = e,
    a = n[0].x,
    o = n[n.length - 1].x;
  if (!xe(a) || !xe(o)) return null;
  var u = t * Math.abs(a - o),
    l = Math.max(...n.map((s) => s.y || 0));
  return (
    k(r)
      ? (l = Math.max(r, l))
      : r && Array.isArray(r) && r.length && (l = Math.max(...r.map((s) => s.y || 0), l)),
    k(l)
      ? y.createElement('rect', {
          x: a < o ? a : a - u,
          y: 0,
          width: u,
          height: Math.floor(l + (i ? parseInt(''.concat(i), 10) : 1)),
        })
      : null
  );
}
function MC(e) {
  var { alpha: t, layout: r, points: n, baseLine: i, strokeWidth: a } = e;
  return r === 'vertical'
    ? y.createElement(CC, { alpha: t, points: n, baseLine: i, strokeWidth: a })
    : y.createElement(jC, { alpha: t, points: n, baseLine: i, strokeWidth: a });
}
function kC(e) {
  var { needClip: t, clipPathId: r, props: n, previousPointsRef: i, previousBaselineRef: a } = e,
    {
      points: o,
      baseLine: u,
      isAnimationActive: l,
      animationBegin: s,
      animationDuration: c,
      animationEasing: f,
      onAnimationStart: d,
      onAnimationEnd: h,
    } = n,
    v = zm(n, 'recharts-area-'),
    [p, m] = y.useState(!0),
    g = y.useCallback(() => {
      (typeof h == 'function' && h(), m(!1));
    }, [h]),
    w = y.useCallback(() => {
      (typeof d == 'function' && d(), m(!0));
    }, [d]),
    b = i.current,
    P = a.current;
  return y.createElement(
    Um,
    {
      begin: s,
      duration: c,
      isActive: l,
      easing: f,
      onAnimationEnd: g,
      onAnimationStart: w,
      key: v,
    },
    (x) => {
      if (b) {
        var O = b.length / o.length,
          S =
            x === 1
              ? o
              : o.map((C, N) => {
                  var T = Math.floor(N * O);
                  if (b[T]) {
                    var M = b[T];
                    return Yt(Yt({}, C), {}, { x: Xe(M.x, C.x, x), y: Xe(M.y, C.y, x) });
                  }
                  return C;
                }),
          _;
        return (
          k(u)
            ? (_ = Xe(P, u, x))
            : te(u) || $e(u)
              ? (_ = Xe(P, 0, x))
              : (_ = u.map((C, N) => {
                  var T = Math.floor(N * O);
                  if (Array.isArray(P) && P[T]) {
                    var M = P[T];
                    return Yt(Yt({}, C), {}, { x: Xe(M.x, C.x, x), y: Xe(M.y, C.y, x) });
                  }
                  return C;
                })),
          x > 0 && ((i.current = S), (a.current = _)),
          y.createElement(yu, {
            points: S,
            baseLine: _,
            needClip: t,
            clipPathId: r,
            props: n,
            showLabels: !p,
          })
        );
      }
      return (
        x > 0 && ((i.current = o), (a.current = u)),
        y.createElement(
          et,
          null,
          y.createElement(
            'defs',
            null,
            y.createElement(
              'clipPath',
              { id: 'animationClipPath-'.concat(r) },
              y.createElement(MC, {
                alpha: x,
                points: o,
                baseLine: u,
                layout: n.layout,
                strokeWidth: n.strokeWidth,
              })
            )
          ),
          y.createElement(
            et,
            { clipPath: 'url(#animationClipPath-'.concat(r, ')') },
            y.createElement(yu, {
              points: o,
              baseLine: u,
              needClip: t,
              clipPathId: r,
              props: n,
              showLabels: !0,
            })
          )
        )
      );
    }
  );
}
function IC(e) {
  var { needClip: t, clipPathId: r, props: n } = e,
    { points: i, baseLine: a, isAnimationActive: o } = n,
    u = y.useRef(null),
    l = y.useRef(),
    s = u.current,
    c = l.current;
  return o && i && i.length && (s !== i || c !== a)
    ? y.createElement(kC, {
        needClip: t,
        clipPathId: r,
        props: n,
        previousPointsRef: u,
        previousBaselineRef: l,
      })
    : y.createElement(yu, {
        points: i,
        baseLine: a,
        needClip: t,
        clipPathId: r,
        props: n,
        showLabels: !0,
      });
}
class DC extends y.PureComponent {
  render() {
    var t,
      {
        hide: r,
        dot: n,
        points: i,
        className: a,
        top: o,
        left: u,
        needClip: l,
        xAxisId: s,
        yAxisId: c,
        width: f,
        height: d,
        id: h,
        baseLine: v,
      } = this.props;
    if (r) return null;
    var p = K('recharts-area', a),
      m = h,
      { r: g = 3, strokeWidth: w = 2 } =
        (t = ee(n, !1)) !== null && t !== void 0 ? t : { r: 3, strokeWidth: 2 },
      b = si(n),
      P = g * 2 + w;
    return y.createElement(
      y.Fragment,
      null,
      y.createElement(
        et,
        { className: p },
        l &&
          y.createElement(
            'defs',
            null,
            y.createElement(Ym, { clipPathId: m, xAxisId: s, yAxisId: c }),
            !b &&
              y.createElement(
                'clipPath',
                { id: 'clipPath-dots-'.concat(m) },
                y.createElement('rect', { x: u - P / 2, y: o - P / 2, width: f + P, height: d + P })
              )
          ),
        y.createElement(IC, { needClip: l, clipPathId: m, props: this.props })
      ),
      y.createElement(pu, {
        points: i,
        mainColor: li(this.props.stroke, this.props.fill),
        itemDataKey: this.props.dataKey,
        activeDot: this.props.activeDot,
      }),
      this.props.isRange &&
        Array.isArray(v) &&
        y.createElement(pu, {
          points: v,
          mainColor: li(this.props.stroke, this.props.fill),
          itemDataKey: this.props.dataKey,
          activeDot: this.props.activeDot,
        })
    );
  }
}
var sy = {
  activeDot: !0,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  connectNulls: !1,
  dot: !1,
  fill: '#3182bd',
  fillOpacity: 0.6,
  hide: !1,
  isAnimationActive: !wr.isSsr,
  legendType: 'line',
  stroke: '#3182bd',
  xAxisId: 0,
  yAxisId: 0,
};
function NC(e) {
  var t,
    r = ut(e, sy),
    {
      activeDot: n,
      animationBegin: i,
      animationDuration: a,
      animationEasing: o,
      connectNulls: u,
      dot: l,
      fill: s,
      fillOpacity: c,
      hide: f,
      isAnimationActive: d,
      legendType: h,
      stroke: v,
      xAxisId: p,
      yAxisId: m,
    } = r,
    g = cy(r, bC),
    w = Ai(),
    b = Pm(),
    { needClip: P } = Jl(p, m),
    x = Se(),
    {
      points: O,
      isRange: S,
      baseLine: _,
    } = (t = D((z) => yC(z, p, m, x, e.id))) !== null && t !== void 0 ? t : {},
    C = Wi();
  if (
    (w !== 'horizontal' && w !== 'vertical') ||
    C == null ||
    (b !== 'AreaChart' && b !== 'ComposedChart')
  )
    return null;
  var { height: N, width: T, x: M, y: L } = C;
  return !O || !O.length
    ? null
    : y.createElement(
        DC,
        vt({}, g, {
          activeDot: n,
          animationBegin: i,
          animationDuration: a,
          animationEasing: o,
          baseLine: _,
          connectNulls: u,
          dot: l,
          fill: s,
          fillOpacity: c,
          height: N,
          hide: f,
          layout: w,
          isAnimationActive: d,
          isRange: S,
          legendType: h,
          needClip: P,
          points: O,
          stroke: v,
          width: T,
          left: M,
          top: L,
          xAxisId: p,
          yAxisId: m,
        })
      );
}
var $C = (e, t, r, n, i) => {
  var a = r ?? t;
  if (k(a)) return a;
  var o = e === 'horizontal' ? i : n,
    u = o.scale.domain();
  if (o.type === 'number') {
    var l = Math.max(u[0], u[1]),
      s = Math.min(u[0], u[1]);
    return a === 'dataMin' ? s : a === 'dataMax' || l < 0 ? l : Math.max(Math.min(u[0], u[1]), 0);
  }
  return a === 'dataMin' ? u[0] : a === 'dataMax' ? u[1] : u[0];
};
function RC(e) {
  var {
      areaSettings: { connectNulls: t, baseValue: r, dataKey: n },
      stackedData: i,
      layout: a,
      chartBaseValue: o,
      xAxis: u,
      yAxis: l,
      displayedData: s,
      dataStartIndex: c,
      xAxisTicks: f,
      yAxisTicks: d,
      bandSize: h,
    } = e,
    v = i && i.length,
    p = $C(a, o, r, u, l),
    m = a === 'horizontal',
    g = !1,
    w = s.map((P, x) => {
      var O;
      v ? (O = i[c + x]) : ((O = pe(P, n)), Array.isArray(O) ? (g = !0) : (O = [p, O]));
      var S = O[1] == null || (v && !t && pe(P, n) == null);
      return m
        ? {
            x: zn({ axis: u, ticks: f, bandSize: h, entry: P, index: x }),
            y: S ? null : l.scale(O[1]),
            value: O,
            payload: P,
          }
        : {
            x: S ? null : u.scale(O[1]),
            y: zn({ axis: l, ticks: d, bandSize: h, entry: P, index: x }),
            value: O,
            payload: P,
          };
    }),
    b;
  return (
    v || g
      ? (b = w.map((P) => {
          var x = Array.isArray(P.value) ? P.value[0] : null;
          return m
            ? { x: P.x, y: x != null && P.y != null ? l.scale(x) : null, payload: P.payload }
            : { x: x != null ? u.scale(x) : null, y: P.y, payload: P.payload };
        }))
      : (b = m ? l.scale(p) : u.scale(p)),
    { points: w, baseLine: b, isRange: g }
  );
}
function LC(e) {
  var t = ut(e, sy),
    r = Se();
  return y.createElement(Fm, { id: t.id, type: 'area' }, (n) =>
    y.createElement(
      y.Fragment,
      null,
      y.createElement(qm, { legendPayload: AC(t) }),
      y.createElement(Bm, { fn: SC, args: t }),
      y.createElement(Wm, {
        type: 'area',
        id: n,
        data: t.data,
        dataKey: t.dataKey,
        xAxisId: t.xAxisId,
        yAxisId: t.yAxisId,
        zAxisId: 0,
        stackId: Qb(t.stackId),
        hide: t.hide,
        barSize: void 0,
        baseValue: t.baseValue,
        isPanorama: r,
        connectNulls: t.connectNulls,
      }),
      y.createElement(NC, vt({}, t, { id: n }))
    )
  );
}
LC.displayName = 'Area';
function Kd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Wd(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Kd(Object(r), !0).forEach(function (n) {
          BC(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Kd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function BC(e, t, r) {
  return (
    (t = qC(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function qC(e) {
  var t = zC(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function zC(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var FC = { xAxis: {}, yAxis: {}, zAxis: {} },
  fy = Le({
    name: 'cartesianAxis',
    initialState: FC,
    reducers: {
      addXAxis(e, t) {
        e.xAxis[t.payload.id] = t.payload;
      },
      removeXAxis(e, t) {
        delete e.xAxis[t.payload.id];
      },
      addYAxis(e, t) {
        e.yAxis[t.payload.id] = t.payload;
      },
      removeYAxis(e, t) {
        delete e.yAxis[t.payload.id];
      },
      addZAxis(e, t) {
        e.zAxis[t.payload.id] = t.payload;
      },
      removeZAxis(e, t) {
        delete e.zAxis[t.payload.id];
      },
      updateYAxisWidth(e, t) {
        var { id: r, width: n } = t.payload;
        e.yAxis[r] && (e.yAxis[r] = Wd(Wd({}, e.yAxis[r]), {}, { width: n }));
      },
    },
  }),
  {
    addXAxis: KC,
    removeXAxis: WC,
    addYAxis: UC,
    removeYAxis: HC,
    addZAxis: IM,
    removeZAxis: DM,
    updateYAxisWidth: YC,
  } = fy.actions,
  GC = fy.reducer,
  VC = ['children'],
  XC = ['dangerouslySetInnerHTML', 'ticks'];
function dy(e, t, r) {
  return (
    (t = ZC(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function ZC(e) {
  var t = JC(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function JC(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function gu() {
  return (
    (gu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    gu.apply(null, arguments)
  );
}
function hy(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = QC(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function QC(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function ej(e) {
  var t = me(),
    r = y.useMemo(() => {
      var { children: a } = e,
        o = hy(e, VC);
      return o;
    }, [e]),
    n = D((a) => Pt(a, r.id)),
    i = r === n;
  return (
    y.useEffect(
      () => (
        t(KC(r)),
        () => {
          t(WC(r));
        }
      ),
      [r, t]
    ),
    i ? e.children : null
  );
}
var tj = (e) => {
    var { xAxisId: t, className: r } = e,
      n = D(dv),
      i = Se(),
      a = 'xAxis',
      o = D((h) => Er(h, a, t, i)),
      u = D((h) => nm(h, a, t, i)),
      l = D((h) => TA(h, t)),
      s = D((h) => IA(h, t));
    if (l == null || s == null) return null;
    var { dangerouslySetInnerHTML: c, ticks: f } = e,
      d = hy(e, XC);
    return y.createElement(
      Rt,
      gu({}, d, {
        scale: o,
        x: s.x,
        y: s.y,
        width: l.width,
        height: l.height,
        className: K('recharts-'.concat(a, ' ').concat(a), r),
        viewBox: n,
        ticks: u,
      })
    );
  },
  rj = (e) => {
    var t, r, n, i, a;
    return y.createElement(
      ej,
      {
        interval: (t = e.interval) !== null && t !== void 0 ? t : 'preserveEnd',
        id: e.xAxisId,
        scale: e.scale,
        type: e.type,
        padding: e.padding,
        allowDataOverflow: e.allowDataOverflow,
        domain: e.domain,
        dataKey: e.dataKey,
        allowDuplicatedCategory: e.allowDuplicatedCategory,
        allowDecimals: e.allowDecimals,
        tickCount: e.tickCount,
        includeHidden: (r = e.includeHidden) !== null && r !== void 0 ? r : !1,
        reversed: e.reversed,
        ticks: e.ticks,
        height: e.height,
        orientation: e.orientation,
        mirror: e.mirror,
        hide: e.hide,
        unit: e.unit,
        name: e.name,
        angle: (n = e.angle) !== null && n !== void 0 ? n : 0,
        minTickGap: (i = e.minTickGap) !== null && i !== void 0 ? i : 5,
        tick: (a = e.tick) !== null && a !== void 0 ? a : !0,
        tickFormatter: e.tickFormatter,
      },
      y.createElement(tj, e)
    );
  };
class vy extends y.Component {
  render() {
    return y.createElement(rj, this.props);
  }
}
dy(vy, 'displayName', 'XAxis');
dy(vy, 'defaultProps', {
  allowDataOverflow: je.allowDataOverflow,
  allowDecimals: je.allowDecimals,
  allowDuplicatedCategory: je.allowDuplicatedCategory,
  height: je.height,
  hide: !1,
  mirror: je.mirror,
  orientation: je.orientation,
  padding: je.padding,
  reversed: je.reversed,
  scale: je.scale,
  tickCount: je.tickCount,
  type: je.type,
  xAxisId: 0,
});
var nj = (e) => {
    var { ticks: t, label: r, labelGapWithTick: n = 5, tickSize: i = 0, tickMargin: a = 0 } = e,
      o = 0;
    if (t) {
      t.forEach((c) => {
        if (c) {
          var f = c.getBoundingClientRect();
          f.width > o && (o = f.width);
        }
      });
      var u = r ? r.getBoundingClientRect().width : 0,
        l = i + a,
        s = o + l + u + (r ? n : 0);
      return Math.round(s);
    }
    return 0;
  },
  ij = ['dangerouslySetInnerHTML', 'ticks'];
function py(e, t, r) {
  return (
    (t = aj(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function aj(e) {
  var t = oj(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function oj(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function bu() {
  return (
    (bu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    bu.apply(null, arguments)
  );
}
function uj(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = lj(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function lj(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function cj(e) {
  var t = me();
  return (
    y.useEffect(
      () => (
        t(UC(e)),
        () => {
          t(HC(e));
        }
      ),
      [e, t]
    ),
    null
  );
}
var sj = (e) => {
    var t,
      { yAxisId: r, className: n, width: i, label: a } = e,
      o = y.useRef(null),
      u = y.useRef(null),
      l = D(dv),
      s = Se(),
      c = me(),
      f = 'yAxis',
      d = D((b) => Er(b, f, r, s)),
      h = D((b) => NA(b, r)),
      v = D((b) => DA(b, r)),
      p = D((b) => nm(b, f, r, s));
    if (
      (y.useLayoutEffect(() => {
        var b;
        if (!(i !== 'auto' || !h || Xl(a) || y.isValidElement(a))) {
          var P = o.current,
            x = P == null || (b = P.tickRefs) === null || b === void 0 ? void 0 : b.current,
            { tickSize: O, tickMargin: S } = P.props,
            _ = nj({ ticks: x, label: u.current, labelGapWithTick: 5, tickSize: O, tickMargin: S });
          Math.round(h.width) !== Math.round(_) && c(YC({ id: r, width: _ }));
        }
      }, [
        o,
        o == null ||
        (t = o.current) === null ||
        t === void 0 ||
        (t = t.tickRefs) === null ||
        t === void 0
          ? void 0
          : t.current,
        h?.width,
        h,
        c,
        a,
        r,
        i,
      ]),
      h == null || v == null)
    )
      return null;
    var { dangerouslySetInnerHTML: m, ticks: g } = e,
      w = uj(e, ij);
    return y.createElement(
      Rt,
      bu({}, w, {
        ref: o,
        labelRef: u,
        scale: d,
        x: v.x,
        y: v.y,
        width: h.width,
        height: h.height,
        className: K('recharts-'.concat(f, ' ').concat(f), n),
        viewBox: l,
        ticks: p,
      })
    );
  },
  fj = (e) => {
    var t, r, n, i, a;
    return y.createElement(
      y.Fragment,
      null,
      y.createElement(cj, {
        interval: (t = e.interval) !== null && t !== void 0 ? t : 'preserveEnd',
        id: e.yAxisId,
        scale: e.scale,
        type: e.type,
        domain: e.domain,
        allowDataOverflow: e.allowDataOverflow,
        dataKey: e.dataKey,
        allowDuplicatedCategory: e.allowDuplicatedCategory,
        allowDecimals: e.allowDecimals,
        tickCount: e.tickCount,
        padding: e.padding,
        includeHidden: (r = e.includeHidden) !== null && r !== void 0 ? r : !1,
        reversed: e.reversed,
        ticks: e.ticks,
        width: e.width,
        orientation: e.orientation,
        mirror: e.mirror,
        hide: e.hide,
        unit: e.unit,
        name: e.name,
        angle: (n = e.angle) !== null && n !== void 0 ? n : 0,
        minTickGap: (i = e.minTickGap) !== null && i !== void 0 ? i : 5,
        tick: (a = e.tick) !== null && a !== void 0 ? a : !0,
        tickFormatter: e.tickFormatter,
      }),
      y.createElement(sj, e)
    );
  },
  dj = {
    allowDataOverflow: Me.allowDataOverflow,
    allowDecimals: Me.allowDecimals,
    allowDuplicatedCategory: Me.allowDuplicatedCategory,
    hide: !1,
    mirror: Me.mirror,
    orientation: Me.orientation,
    padding: Me.padding,
    reversed: Me.reversed,
    scale: Me.scale,
    tickCount: Me.tickCount,
    type: Me.type,
    width: Me.width,
    yAxisId: 0,
  };
class my extends y.Component {
  render() {
    return y.createElement(fj, this.props);
  }
}
py(my, 'displayName', 'YAxis');
py(my, 'defaultProps', dj);
var Eo = { exports: {} },
  _o = {};
/**
 * @license React
 * use-sync-external-store-with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Ud;
function hj() {
  if (Ud) return _o;
  Ud = 1;
  var e = Pu();
  function t(l, s) {
    return (l === s && (l !== 0 || 1 / l === 1 / s)) || (l !== l && s !== s);
  }
  var r = typeof Object.is == 'function' ? Object.is : t,
    n = e.useSyncExternalStore,
    i = e.useRef,
    a = e.useEffect,
    o = e.useMemo,
    u = e.useDebugValue;
  return (
    (_o.useSyncExternalStoreWithSelector = function (l, s, c, f, d) {
      var h = i(null);
      if (h.current === null) {
        var v = { hasValue: !1, value: null };
        h.current = v;
      } else v = h.current;
      h = o(
        function () {
          function m(x) {
            if (!g) {
              if (((g = !0), (w = x), (x = f(x)), d !== void 0 && v.hasValue)) {
                var O = v.value;
                if (d(O, x)) return (b = O);
              }
              return (b = x);
            }
            if (((O = b), r(w, x))) return O;
            var S = f(x);
            return d !== void 0 && d(O, S) ? ((w = x), O) : ((w = x), (b = S));
          }
          var g = !1,
            w,
            b,
            P = c === void 0 ? null : c;
          return [
            function () {
              return m(s());
            },
            P === null
              ? void 0
              : function () {
                  return m(P());
                },
          ];
        },
        [s, c, f, d]
      );
      var p = n(l, h[0], h[1]);
      return (
        a(
          function () {
            ((v.hasValue = !0), (v.value = p));
          },
          [p]
        ),
        u(p),
        p
      );
    }),
    _o
  );
}
var Hd;
function vj() {
  return (Hd || ((Hd = 1), (Eo.exports = hj())), Eo.exports);
}
vj();
function pj(e) {
  e();
}
function mj() {
  let e = null,
    t = null;
  return {
    clear() {
      ((e = null), (t = null));
    },
    notify() {
      pj(() => {
        let r = e;
        for (; r; ) (r.callback(), (r = r.next));
      });
    },
    get() {
      const r = [];
      let n = e;
      for (; n; ) (r.push(n), (n = n.next));
      return r;
    },
    subscribe(r) {
      let n = !0;
      const i = (t = { callback: r, next: null, prev: t });
      return (
        i.prev ? (i.prev.next = i) : (e = i),
        function () {
          !n ||
            e === null ||
            ((n = !1),
            i.next ? (i.next.prev = i.prev) : (t = i.prev),
            i.prev ? (i.prev.next = i.next) : (e = i.next));
        }
      );
    },
  };
}
var Yd = { notify() {}, get: () => [] };
function yj(e, t) {
  let r,
    n = Yd,
    i = 0,
    a = !1;
  function o(p) {
    c();
    const m = n.subscribe(p);
    let g = !1;
    return () => {
      g || ((g = !0), m(), f());
    };
  }
  function u() {
    n.notify();
  }
  function l() {
    v.onStateChange && v.onStateChange();
  }
  function s() {
    return a;
  }
  function c() {
    (i++, r || ((r = e.subscribe(l)), (n = mj())));
  }
  function f() {
    (i--, r && i === 0 && (r(), (r = void 0), n.clear(), (n = Yd)));
  }
  function d() {
    a || ((a = !0), c());
  }
  function h() {
    a && ((a = !1), f());
  }
  const v = {
    addNestedSub: o,
    notifyNestedSubs: u,
    handleChangeWrapper: l,
    isSubscribed: s,
    trySubscribe: d,
    tryUnsubscribe: h,
    getListeners: () => n,
  };
  return v;
}
var gj = () =>
    typeof window < 'u' &&
    typeof window.document < 'u' &&
    typeof window.document.createElement < 'u',
  bj = gj(),
  wj = () => typeof navigator < 'u' && navigator.product === 'ReactNative',
  xj = wj(),
  Pj = () => (bj || xj ? y.useLayoutEffect : y.useEffect),
  Oj = Pj(),
  Aj = Symbol.for('react-redux-context'),
  Sj = typeof globalThis < 'u' ? globalThis : {};
function Ej() {
  if (!y.createContext) return {};
  const e = (Sj[Aj] ??= new Map());
  let t = e.get(y.createContext);
  return (t || ((t = y.createContext(null)), e.set(y.createContext, t)), t);
}
var _j = Ej();
function Tj(e) {
  const { children: t, context: r, serverState: n, store: i } = e,
    a = y.useMemo(() => {
      const l = yj(i);
      return { store: i, subscription: l, getServerState: n ? () => n : void 0 };
    }, [i, n]),
    o = y.useMemo(() => i.getState(), [i]);
  Oj(() => {
    const { subscription: l } = a;
    return (
      (l.onStateChange = l.notifyNestedSubs),
      l.trySubscribe(),
      o !== i.getState() && l.notifyNestedSubs(),
      () => {
        (l.tryUnsubscribe(), (l.onStateChange = void 0));
      }
    );
  }, [a, o]);
  const u = r || _j;
  return y.createElement(u.Provider, { value: a }, t);
}
var Cj = Tj,
  jj = (e, t) => t,
  nc = A([jj, U, Ap, ue, ym, Ot, BS, ye], WS),
  ic = (e) => {
    var t = e.currentTarget.getBoundingClientRect(),
      r = t.width / e.currentTarget.offsetWidth,
      n = t.height / e.currentTarget.offsetHeight;
    return {
      chartX: Math.round((e.clientX - t.left) / r),
      chartY: Math.round((e.clientY - t.top) / n),
    };
  },
  yy = Ye('mouseClick'),
  gy = tn();
gy.startListening({
  actionCreator: yy,
  effect: (e, t) => {
    var r = e.payload,
      n = nc(t.getState(), ic(r));
    n?.activeIndex != null &&
      t.dispatch(
        YA({
          activeIndex: n.activeIndex,
          activeDataKey: void 0,
          activeCoordinate: n.activeCoordinate,
        })
      );
  },
});
var wu = Ye('mouseMove'),
  by = tn();
by.startListening({
  actionCreator: wu,
  effect: (e, t) => {
    var r = e.payload,
      n = t.getState(),
      i = ql(n, n.tooltip.settings.shared),
      a = nc(n, ic(r));
    i === 'axis' &&
      (a?.activeIndex != null
        ? t.dispatch(
            sm({
              activeIndex: a.activeIndex,
              activeDataKey: void 0,
              activeCoordinate: a.activeCoordinate,
            })
          )
        : t.dispatch(cm()));
  },
});
function Mj(e, t) {
  return t instanceof HTMLElement
    ? 'HTMLElement <'.concat(t.tagName, ' class="').concat(t.className, '">')
    : t === window
      ? 'global.window'
      : t;
}
var Gd = {
    accessibilityLayer: !0,
    barCategoryGap: '10%',
    barGap: 4,
    barSize: void 0,
    className: void 0,
    maxBarSize: void 0,
    stackOffset: 'none',
    syncId: void 0,
    syncMethod: 'index',
  },
  wy = Le({
    name: 'rootProps',
    initialState: Gd,
    reducers: {
      updateOptions: (e, t) => {
        var r;
        ((e.accessibilityLayer = t.payload.accessibilityLayer),
          (e.barCategoryGap = t.payload.barCategoryGap),
          (e.barGap = (r = t.payload.barGap) !== null && r !== void 0 ? r : Gd.barGap),
          (e.barSize = t.payload.barSize),
          (e.maxBarSize = t.payload.maxBarSize),
          (e.stackOffset = t.payload.stackOffset),
          (e.syncId = t.payload.syncId),
          (e.syncMethod = t.payload.syncMethod),
          (e.className = t.payload.className));
      },
    },
  }),
  kj = wy.reducer,
  { updateOptions: Ij } = wy.actions,
  xy = Le({
    name: 'polarOptions',
    initialState: null,
    reducers: { updatePolarOptions: (e, t) => t.payload },
  }),
  { updatePolarOptions: NM } = xy.actions,
  Dj = xy.reducer,
  Py = Ye('keyDown'),
  Oy = Ye('focus'),
  ac = tn();
ac.startListening({
  actionCreator: Py,
  effect: (e, t) => {
    var r = t.getState(),
      n = r.rootProps.accessibilityLayer !== !1;
    if (n) {
      var { keyboardInteraction: i } = r.tooltip,
        a = e.payload;
      if (!(a !== 'ArrowRight' && a !== 'ArrowLeft' && a !== 'Enter')) {
        var o = Number(zl(i, Tr(r))),
          u = Ot(r);
        if (a === 'Enter') {
          var l = ii(r, 'axis', 'hover', String(i.index));
          t.dispatch(
            su({
              active: !i.active,
              activeIndex: i.index,
              activeDataKey: i.dataKey,
              activeCoordinate: l,
            })
          );
          return;
        }
        var s = BA(r),
          c = s === 'left-to-right' ? 1 : -1,
          f = a === 'ArrowRight' ? 1 : -1,
          d = o + f * c;
        if (!(u == null || d >= u.length || d < 0)) {
          var h = ii(r, 'axis', 'hover', String(d));
          t.dispatch(
            su({
              active: !0,
              activeIndex: d.toString(),
              activeDataKey: void 0,
              activeCoordinate: h,
            })
          );
        }
      }
    }
  },
});
ac.startListening({
  actionCreator: Oy,
  effect: (e, t) => {
    var r = t.getState(),
      n = r.rootProps.accessibilityLayer !== !1;
    if (n) {
      var { keyboardInteraction: i } = r.tooltip;
      if (!i.active && i.index == null) {
        var a = '0',
          o = ii(r, 'axis', 'hover', String(a));
        t.dispatch(su({ activeDataKey: void 0, active: !0, activeIndex: a, activeCoordinate: o }));
      }
    }
  },
});
var Ke = Ye('externalEvent'),
  Ay = tn();
Ay.startListening({
  actionCreator: Ke,
  effect: (e, t) => {
    if (e.payload.handler != null) {
      var r = t.getState(),
        n = {
          activeCoordinate: jS(r),
          activeDataKey: TS(r),
          activeIndex: Zr(r),
          activeLabel: wm(r),
          activeTooltipIndex: Zr(r),
          isTooltipActive: MS(r),
        };
      e.payload.handler(n, e.payload.reactEvent);
    }
  },
});
var Nj = A([_r], (e) => e.tooltipItemPayloads),
  $j = A([Nj, fn, (e, t, r) => t, (e, t, r) => r], (e, t, r, n) => {
    var i = e.find((u) => u.settings.dataKey === n);
    if (i != null) {
      var { positions: a } = i;
      if (a != null) {
        var o = t(a, r);
        return o;
      }
    }
  }),
  Sy = Ye('touchMove'),
  Ey = tn();
Ey.startListening({
  actionCreator: Sy,
  effect: (e, t) => {
    var r = e.payload,
      n = t.getState(),
      i = ql(n, n.tooltip.settings.shared);
    if (i === 'axis') {
      var a = nc(
        n,
        ic({
          clientX: r.touches[0].clientX,
          clientY: r.touches[0].clientY,
          currentTarget: r.currentTarget,
        })
      );
      a?.activeIndex != null &&
        t.dispatch(
          sm({
            activeIndex: a.activeIndex,
            activeDataKey: void 0,
            activeCoordinate: a.activeCoordinate,
          })
        );
    } else if (i === 'item') {
      var o,
        u = r.touches[0],
        l = document.elementFromPoint(u.clientX, u.clientY);
      if (!l || !l.getAttribute) return;
      var s = l.getAttribute(uw),
        c = (o = l.getAttribute(lw)) !== null && o !== void 0 ? o : void 0,
        f = $j(t.getState(), s, c);
      t.dispatch(HA({ activeDataKey: c, activeIndex: s, activeCoordinate: f }));
    }
  },
});
var Rj = Bh({
    brush: eT,
    cartesianAxis: GC,
    chartData: oE,
    errorBars: H_,
    graphicalItems: N_,
    layout: kb,
    legend: Pw,
    options: tE,
    polarAxis: S_,
    polarOptions: Dj,
    referenceElements: uT,
    rootProps: kj,
    tooltip: GA,
  }),
  Lj = function (t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Chart';
    return nb({
      reducer: Rj,
      preloadedState: t,
      middleware: (n) =>
        n({ serializableCheck: !1 }).concat([
          gy.middleware,
          by.middleware,
          ac.middleware,
          Ay.middleware,
          Ey.middleware,
        ]),
      devTools: { serialize: { replacer: Mj }, name: 'recharts-'.concat(r) },
    });
  };
function Bj(e) {
  var { preloadedState: t, children: r, reduxStoreName: n } = e,
    i = Se(),
    a = y.useRef(null);
  if (i) return r;
  a.current == null && (a.current = Lj(t, n));
  var o = Lu;
  return y.createElement(Cj, { context: o, store: a.current }, r);
}
function qj(e) {
  var { layout: t, width: r, height: n, margin: i } = e,
    a = me(),
    o = Se();
  return (
    y.useEffect(() => {
      o || (a(Cb(t)), a(jb({ width: r, height: n })), a(Tb(i)));
    }, [a, o, t, r, n, i]),
    null
  );
}
function zj(e) {
  var t = me();
  return (
    y.useEffect(() => {
      t(Ij(e));
    }, [t, e]),
    null
  );
}
var Fj = ['children'];
function Kj(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = Wj(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function Wj(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
function ci() {
  return (
    (ci = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    ci.apply(null, arguments)
  );
}
var Uj = { width: '100%', height: '100%' },
  Hj = y.forwardRef((e, t) => {
    var r = Yu(),
      n = Gu(),
      i = pv();
    if (!Fn(r) || !Fn(n)) return null;
    var { children: a, otherAttributes: o, title: u, desc: l } = e,
      s,
      c;
    return (
      typeof o.tabIndex == 'number' ? (s = o.tabIndex) : (s = i ? 0 : void 0),
      typeof o.role == 'string' ? (c = o.role) : (c = i ? 'application' : void 0),
      y.createElement(
        _u,
        ci({}, o, {
          title: u,
          desc: l,
          role: c,
          tabIndex: s,
          width: r,
          height: n,
          style: Uj,
          ref: t,
        }),
        a
      )
    );
  }),
  Yj = (e) => {
    var { children: t } = e,
      r = D(Oi);
    if (!r) return null;
    var { width: n, height: i, y: a, x: o } = r;
    return y.createElement(_u, { width: n, height: i, x: o, y: a }, t);
  },
  Vd = y.forwardRef((e, t) => {
    var { children: r } = e,
      n = Kj(e, Fj),
      i = Se();
    return i ? y.createElement(Yj, null, r) : y.createElement(Hj, ci({ ref: t }, n), r);
  });
function Gj() {
  var e = me(),
    [t, r] = y.useState(null),
    n = D(ow);
  return (
    y.useEffect(() => {
      if (t != null) {
        var i = t.getBoundingClientRect(),
          a = i.width / t.offsetWidth;
        xe(a) && a !== n && e(Mb(a));
      }
    }, [t, e, n]),
    r
  );
}
function Xd(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    (t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(e, i).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Vj(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? Xd(Object(r), !0).forEach(function (n) {
          Xj(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : Xd(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function Xj(e, t, r) {
  return (
    (t = Zj(t)) in e
      ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = r),
    e
  );
}
function Zj(e) {
  var t = Jj(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function Jj(e, t) {
  if (typeof e != 'object' || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var Qj = y.forwardRef((e, t) => {
    var {
        children: r,
        className: n,
        height: i,
        onClick: a,
        onContextMenu: o,
        onDoubleClick: u,
        onMouseDown: l,
        onMouseEnter: s,
        onMouseLeave: c,
        onMouseMove: f,
        onMouseUp: d,
        onTouchEnd: h,
        onTouchMove: v,
        onTouchStart: p,
        style: m,
        width: g,
      } = e,
      w = me(),
      [b, P] = y.useState(null),
      [x, O] = y.useState(null);
    cE();
    var S = Gj(),
      _ = y.useCallback(
        ($) => {
          (S($), typeof t == 'function' && t($), P($), O($));
        },
        [S, t, P, O]
      ),
      C = y.useCallback(
        ($) => {
          (w(yy($)), w(Ke({ handler: a, reactEvent: $ })));
        },
        [w, a]
      ),
      N = y.useCallback(
        ($) => {
          (w(wu($)), w(Ke({ handler: s, reactEvent: $ })));
        },
        [w, s]
      ),
      T = y.useCallback(
        ($) => {
          (w(cm()), w(Ke({ handler: c, reactEvent: $ })));
        },
        [w, c]
      ),
      M = y.useCallback(
        ($) => {
          (w(wu($)), w(Ke({ handler: f, reactEvent: $ })));
        },
        [w, f]
      ),
      L = y.useCallback(() => {
        w(Oy());
      }, [w]),
      z = y.useCallback(
        ($) => {
          w(Py($.key));
        },
        [w]
      ),
      J = y.useCallback(
        ($) => {
          w(Ke({ handler: o, reactEvent: $ }));
        },
        [w, o]
      ),
      H = y.useCallback(
        ($) => {
          w(Ke({ handler: u, reactEvent: $ }));
        },
        [w, u]
      ),
      ie = y.useCallback(
        ($) => {
          w(Ke({ handler: l, reactEvent: $ }));
        },
        [w, l]
      ),
      _e = y.useCallback(
        ($) => {
          w(Ke({ handler: d, reactEvent: $ }));
        },
        [w, d]
      ),
      ce = y.useCallback(
        ($) => {
          w(Ke({ handler: p, reactEvent: $ }));
        },
        [w, p]
      ),
      or = y.useCallback(
        ($) => {
          (w(Sy($)), w(Ke({ handler: v, reactEvent: $ })));
        },
        [w, v]
      ),
      ur = y.useCallback(
        ($) => {
          w(Ke({ handler: h, reactEvent: $ }));
        },
        [w, h]
      );
    return y.createElement(
      _m.Provider,
      { value: b },
      y.createElement(
        uh.Provider,
        { value: x },
        y.createElement(
          'div',
          {
            className: K('recharts-wrapper', n),
            style: Vj({ position: 'relative', cursor: 'default', width: g, height: i }, m),
            onClick: C,
            onContextMenu: J,
            onDoubleClick: H,
            onFocus: L,
            onKeyDown: z,
            onMouseDown: ie,
            onMouseEnter: N,
            onMouseLeave: T,
            onMouseMove: M,
            onMouseUp: _e,
            onTouchEnd: ur,
            onTouchMove: or,
            onTouchStart: ce,
            ref: _,
          },
          r
        )
      )
    );
  }),
  eM = ['children', 'className', 'width', 'height', 'style', 'compact', 'title', 'desc'];
function tM(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = rM(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function rM(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var nM = y.forwardRef((e, t) => {
    var {
        children: r,
        className: n,
        width: i,
        height: a,
        style: o,
        compact: u,
        title: l,
        desc: s,
      } = e,
      c = tM(e, eM),
      f = kt(c);
    return u
      ? y.createElement(Vd, { otherAttributes: f, title: l, desc: s }, r)
      : y.createElement(
          Qj,
          {
            className: n,
            style: o,
            width: i,
            height: a,
            onClick: e.onClick,
            onMouseLeave: e.onMouseLeave,
            onMouseEnter: e.onMouseEnter,
            onMouseMove: e.onMouseMove,
            onMouseDown: e.onMouseDown,
            onMouseUp: e.onMouseUp,
            onContextMenu: e.onContextMenu,
            onDoubleClick: e.onDoubleClick,
            onTouchStart: e.onTouchStart,
            onTouchMove: e.onTouchMove,
            onTouchEnd: e.onTouchEnd,
          },
          y.createElement(
            Vd,
            { otherAttributes: f, title: l, desc: s, ref: t },
            y.createElement(cT, null, r)
          )
        );
  }),
  iM = ['width', 'height'];
function xu() {
  return (
    (xu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r) ({}).hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    xu.apply(null, arguments)
  );
}
function aM(e, t) {
  if (e == null) return {};
  var r,
    n,
    i = oM(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (n = 0; n < a.length; n++)
      ((r = a[n]), t.indexOf(r) === -1 && {}.propertyIsEnumerable.call(e, r) && (i[r] = e[r]));
  }
  return i;
}
function oM(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) !== -1) continue;
      r[n] = e[n];
    }
  return r;
}
var uM = { top: 5, right: 5, bottom: 5, left: 5 },
  lM = {
    accessibilityLayer: !0,
    layout: 'horizontal',
    stackOffset: 'none',
    barCategoryGap: '10%',
    barGap: 4,
    margin: uM,
    reverseStackOrder: !1,
    syncMethod: 'index',
  },
  _y = y.forwardRef(function (t, r) {
    var n,
      i = ut(t.categoricalChartProps, lM),
      { width: a, height: o } = i,
      u = aM(i, iM);
    if (!Fn(a) || !Fn(o)) return null;
    var {
        chartName: l,
        defaultTooltipEventType: s,
        validateTooltipEventTypes: c,
        tooltipPayloadSearcher: f,
        categoricalChartProps: d,
      } = t,
      h = {
        chartName: l,
        defaultTooltipEventType: s,
        validateTooltipEventTypes: c,
        tooltipPayloadSearcher: f,
        eventEmitter: void 0,
      };
    return y.createElement(
      Bj,
      {
        preloadedState: { options: h },
        reduxStoreName: (n = d.id) !== null && n !== void 0 ? n : l,
      },
      y.createElement(Q_, { chartData: d.data }),
      y.createElement(qj, { width: a, height: o, layout: i.layout, margin: i.margin }),
      y.createElement(zj, {
        accessibilityLayer: i.accessibilityLayer,
        barCategoryGap: i.barCategoryGap,
        maxBarSize: i.maxBarSize,
        stackOffset: i.stackOffset,
        barGap: i.barGap,
        barSize: i.barSize,
        syncId: i.syncId,
        syncMethod: i.syncMethod,
        className: i.className,
      }),
      y.createElement(nM, xu({}, u, { width: a, height: o, ref: r }))
    );
  }),
  cM = ['axis'],
  $M = y.forwardRef((e, t) =>
    y.createElement(_y, {
      chartName: 'LineChart',
      defaultTooltipEventType: 'axis',
      validateTooltipEventTypes: cM,
      tooltipPayloadSearcher: Tm,
      categoricalChartProps: e,
      ref: t,
    })
  ),
  sM = ['axis'],
  RM = y.forwardRef((e, t) =>
    y.createElement(_y, {
      chartName: 'AreaChart',
      defaultTooltipEventType: 'axis',
      validateTooltipEventTypes: sM,
      tooltipPayloadSearcher: Tm,
      categoricalChartProps: e,
      ref: t,
    })
  );
export { RM as A, qT as C, $M as L, yM as R, mM as T, vy as X, my as Y, Xu as a, hC as b, LC as c };
