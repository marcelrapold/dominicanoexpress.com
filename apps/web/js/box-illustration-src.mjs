/**
 * Vektor-Kisten mit Isometrie (@elchininet/isometric) + Bemaßungslinien (SVG).
 * Maße in cm: H = Höhe (t-Achse), R = Tiefe (r), L = Breite (l).
 */
import {
  IsometricCanvas,
  IsometricGroup,
  IsometricRectangle,
  PlaneView
} from '@elchininet/isometric';

/** Zentral: alle Kisten (Bestandsangaben Mediana 70×50×50, übrige Staffelung) */
export const BOX_MODELS = {
  mediana: { id: 'mediana', h: 70, r: 50, l: 50 },
  jumbo: { id: 'jumbo', h: 85, r: 60, l: 60 },
  maxi: { id: 'maxi', h: 100, r: 70, l: 70 },
  mega: { id: 'mega', h: 120, r: 85, l: 85 }
};

const COLORS = {
  top: '#e8dcc8',
  front: '#d4b896',
  side: '#c4a574',
  stroke: '#5c4a32',
  dimLine: '#1e3a5f',
  dimText: '#102a4c'
};

const NS = 'http://www.w3.org/2000/svg';

/** Projektion wie in der Library: k(cx,cy,{r,l,t},scale) */
function proj (cx, cy, r, l, t, scale) {
  const s = Math.sqrt(3) / 2;
  return {
    x: cx + (r - l) * scale * s,
    y: cy + ((r + l) / 2 - t) * scale
  };
}

function el (name, attrs, parent) {
  const n = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null && v !== '') n.setAttribute(k, String(v));
  });
  if (parent) parent.appendChild(n);
  return n;
}

/** Einheitlicher Maßketten-Stil: Strecke p1–p2, Versatz nach außen, Label */
function addAlignedDimension (svg, cx, cy, scale, p1, p2, label, offsetDir, options = {}) {
  const { color = COLORS.dimLine, fontSize = 11 } = options;
  const a = proj(cx, cy, p1.r, p1.l, p1.t, scale);
  const b = proj(cx, cy, p2.r, p2.l, p2.t, scale);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  /* Senkrecht nach „links“ (Zeiger um -90°) */
  let nx = -uy;
  let ny = ux;
  if (offsetDir === 'inward') {
    nx = -nx;
    ny = -ny;
  }
  const gap = 16;
  const ext = 6;
  const pA = { x: a.x + nx * gap, y: a.y + ny * gap };
  const pB = { x: b.x + nx * gap, y: b.y + ny * gap };

  const g = el('g', {
    class: 'box-dim',
    fill: 'none',
    stroke: color,
    'stroke-width': 1,
    'stroke-linecap': 'round'
  }, svg);

  /* Hilfslinien (kurz) */
  el('line', { x1: a.x, y1: a.y, x2: pA.x, y2: pA.y, 'stroke-dasharray': '3 3', opacity: '0.5' }, g);
  el('line', { x1: b.x, y1: b.y, x2: pB.x, y2: pB.y, 'stroke-dasharray': '3 3', opacity: '0.5' }, g);

  /* Maßlinie */
  el('line', {
    x1: pA.x - ux * ext,
    y1: pA.y - uy * ext,
    x2: pB.x + ux * ext,
    y2: pB.y + uy * ext
  }, g);

  /* kleine Striche an Enden */
  const tick = 3;
  const tx = -ny * tick;
  const ty = nx * tick;
  el('line', { x1: pA.x - ux * ext + tx, y1: pA.y - uy * ext + ty, x2: pA.x - ux * ext - tx, y2: pA.y - uy * ext - ty }, g);
  el('line', { x1: pB.x + ux * ext + tx, y1: pB.y + uy * ext + ty, x2: pB.x + ux * ext - tx, y2: pB.y + uy * ext - ty }, g);

  const mx = (pA.x + pB.x) / 2 + nx * (gap * 0.35);
  const my = (pA.y + pB.y) / 2 + ny * (gap * 0.35);
  const ang = Math.atan2(pB.y - pA.y, pB.x - pA.x) * (180 / Math.PI);
  const t = el('text', {
    x: mx,
    y: my,
    fill: COLORS.dimText,
    'font-size': fontSize,
    'font-family': 'system-ui, Segoe UI, sans-serif',
    'font-weight': '600',
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    transform: `rotate(${ang > 90 || ang < -90 ? ang + 180 : ang}, ${mx}, ${my})`
  }, g);
  t.textContent = label;
}

/**
 * Baut Quader: TOP bei t=H, FRONT bei r=0, SIDE bei l=0.
 * r = Tiefe, l = Breite, t = Höhe (alle gleiche Einheiten).
 */
function buildBoxGroup (R, L, H) {
  const g = new IsometricGroup();

  const side = new IsometricRectangle({
    planeView: PlaneView.SIDE,
    width: R,
    height: H,
    right: 0,
    left: 0,
    top: 0,
    fillColor: COLORS.side,
    strokeColor: COLORS.stroke,
    strokeWidth: 0.8
  });

  const front = new IsometricRectangle({
    planeView: PlaneView.FRONT,
    width: L,
    height: H,
    right: 0,
    left: 0,
    top: 0,
    fillColor: COLORS.front,
    strokeColor: COLORS.stroke,
    strokeWidth: 0.8
  });

  const top = new IsometricRectangle({
    planeView: PlaneView.TOP,
    width: R,
    height: L,
    right: 0,
    left: 0,
    top: H,
    fillColor: COLORS.top,
    strokeColor: COLORS.stroke,
    strokeWidth: 0.8
  });

  g.addChildren(side, front, top);
  return g;
}

/**
 * @param {HTMLElement} container
 * @param {{ h: number, r: number, l: number }} dims cm
 * @param {{ variant?: 'card'|'hero' }} opts
 */
export function mountBoxIllustration (container, dims, opts = {}) {
  const { h: H, r: R, l: L } = dims;
  const variant = opts.variant || 'card';
  const wPx = variant === 'hero' ? 220 : 300;
  const hPx = variant === 'hero' ? 140 : 210;
  const scale = variant === 'hero' ? 0.5 : 0.68;
  const cx = wPx / 2;
  const cy = hPx / 2;
  const dimFont = variant === 'hero' ? 9 : 11;

  container.innerHTML = '';
  container.classList.add('box-illustration-root');

  const canvas = new IsometricCanvas({
    container,
    width: wPx,
    height: hPx,
    scale,
    backgroundColor: 'transparent'
  });

  /* SVG-Hintergrund transparent (Library setzt oft rect) */
  const svg = canvas.getElement();
  svg.setAttribute('overflow', 'visible');
  const bg = svg.querySelector('rect');
  if (bg) {
    bg.setAttribute('fill', 'none');
    bg.setAttribute('opacity', '0');
  }

  const group = buildBoxGroup(R, L, H);
  canvas.addChild(group);
  canvas.update();

  const dimLayer = el('g', { class: 'box-dimensions', 'pointer-events': 'none' }, svg);

  const ariaKey = container.getAttribute('data-i18n-aria');
  const lang = typeof document !== 'undefined' ? (document.documentElement.lang || 'es') : 'es';
  if (ariaKey && typeof window !== 'undefined' && window.T?.[lang]?.[ariaKey]) {
    container.setAttribute('aria-label', window.T[lang][ariaKey]);
  } else {
    container.setAttribute('aria-label', `${H} × ${R} × ${L} cm`);
  }

  /* Maße: vertikal H ; Deckkante R (Tiefe) und L (Breite) */
  addAlignedDimension(
    dimLayer,
    cx,
    cy,
    scale,
    { r: 0, l: 0, t: 0 },
    { r: 0, l: 0, t: H },
    `${H}`,
    'inward',
    { fontSize: dimFont }
  );

  addAlignedDimension(
    dimLayer,
    cx,
    cy,
    scale,
    { r: 0, l: 0, t: H },
    { r: R, l: 0, t: H },
    `${R}`,
    'outward',
    { fontSize: dimFont }
  );

  addAlignedDimension(
    dimLayer,
    cx,
    cy,
    scale,
    { r: 0, l: 0, t: H },
    { r: 0, l: L, t: H },
    `${L}`,
    'outward',
    { fontSize: dimFont }
  );

  return svg;
}

/** data-box-model="mediana" … */
export function initAllBoxIllustrations () {
  document.querySelectorAll('[data-box-model]').forEach(node => {
    const key = node.getAttribute('data-box-model');
    const variant = node.getAttribute('data-box-variant') || 'card';
    const m = BOX_MODELS[key];
    if (!m || !(node instanceof HTMLElement)) return;
    try {
      mountBoxIllustration(node, m, { variant: variant === 'hero' ? 'hero' : 'card' });
    } catch (e) {
      console.error('box-illustration', e);
    }
  });
}

if (typeof window !== 'undefined') {
  window.initBoxIllustrations = initAllBoxIllustrations;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAllBoxIllustrations());
  } else {
    initAllBoxIllustrations();
  }
}
