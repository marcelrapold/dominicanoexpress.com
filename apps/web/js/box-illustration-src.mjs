/**
 * Isometrische Kartonboxen als pures SVG.
 * Maße in cm: H = Höhe, R = Tiefe, L = Breite.
 * Eigene Projektion (30°), keine Abhängigkeit mehr auf die Library.
 */

/** Zentrale Maßangaben aller Kisten (cm). Jede Grösse bekommt eine eigene,
 *  leicht abgestufte Kartonfarbe — Mediana hell-sandig, Mega satt-karamell.
 *  Das visualisiert die Hierarchie der Boxgrössen, ohne zu knallig zu werden. */
const PALETTE_MEDIANA = {
  top: '#efe0c2',
  front: '#d3b989',
  side: '#b5965e',
  edge: '#6b4f2c'
};
const PALETTE_JUMBO = {
  top: '#e8d7b4',
  front: '#c9a876',
  side: '#a58250',
  edge: '#5c4327'
};
const PALETTE_MAXI = {
  top: '#decba0',
  front: '#bf9a63',
  side: '#946f42',
  edge: '#4c3720'
};
const PALETTE_MEGA = {
  top: '#d3bc8a',
  front: '#b18a52',
  side: '#825f35',
  edge: '#3c2a17'
};

export const BOX_MODELS = {
  mediana: { id: 'mediana', h: 50, r: 50, l: 70, palette: PALETTE_MEDIANA },
  jumbo:   { id: 'jumbo',   h: 60, r: 60, l: 85, palette: PALETTE_JUMBO },
  maxi:    { id: 'maxi',    h: 70, r: 70, l: 100, palette: PALETTE_MAXI },
  mega:    { id: 'mega',    h: 85, r: 85, l: 120, palette: PALETTE_MEGA }
};

const NS = 'http://www.w3.org/2000/svg';

const BASE_COLORS = {
  tape: '#f3e9d2',
  tapeStroke: '#c2a574',
  dimLine: '#1e3a5f',
  dimText: '#102a4c',
  shadow: 'rgba(23, 37, 84, 0.18)'
};

/** Baut das finale Farbschema pro Box: Palette + statische Tape/Dim-Farben. */
function buildColors (palette) {
  const p = palette || PALETTE_JUMBO;
  return {
    top: p.top,
    front: p.front,
    side: p.side,
    edge: p.edge,
    ...BASE_COLORS
  };
}

/** Isometrische Projektion (30° nach links/rechts). */
function proj (cx, cy, x, y, z, scale) {
  const s = Math.sqrt(3) / 2; /* cos(30°) */
  return {
    x: cx + (x - y) * scale * s,
    y: cy + (x + y) * scale * 0.5 - z * scale
  };
}

function el (name, attrs, parent) {
  const n = document.createElementNS(NS, name);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v != null && v !== '') n.setAttribute(k, String(v));
  });
  if (parent) parent.appendChild(n);
  return n;
}

function pathFrom (points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';
}

/**
 * Maßkette entlang zweier 3D-Punkte, nach außen versetzt.
 * @param {SVGElement} svg
 * @param {object} p1 { x, y, z } in Welt
 * @param {object} p2 { x, y, z }
 * @param {number} cx
 * @param {number} cy
 * @param {number} scale
 * @param {string} label
 * @param {{ side?: 'left'|'right', fontSize?: number, gap?: number }} opts
 */
function dimension (svg, p1, p2, cx, cy, scale, label, opts = {}) {
  const { side = 'left', fontSize = 11, gap = 18, COLORS = buildColors() } = opts;
  const a = proj(cx, cy, p1.x, p1.y, p1.z, scale);
  const b = proj(cx, cy, p2.x, p2.y, p2.z, scale);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  /* Senkrecht: nach „außen“ vom Kartonmittelpunkt aus */
  let nx = -uy;
  let ny = ux;
  if (side === 'right') {
    nx = -nx;
    ny = -ny;
  }

  const pA = { x: a.x + nx * gap, y: a.y + ny * gap };
  const pB = { x: b.x + nx * gap, y: b.y + ny * gap };

  const g = el(
    'g',
    {
      class: 'box-dim',
      fill: 'none',
      stroke: COLORS.dimLine,
      'stroke-width': 1.1,
      'stroke-linecap': 'round'
    },
    svg
  );

  /* Hilfslinien (dünn, gestrichelt) */
  el('line', {
    x1: a.x, y1: a.y, x2: pA.x, y2: pA.y,
    'stroke-dasharray': '3 3', opacity: '0.55'
  }, g);
  el('line', {
    x1: b.x, y1: b.y, x2: pB.x, y2: pB.y,
    'stroke-dasharray': '3 3', opacity: '0.55'
  }, g);

  /* Hauptmaßlinie, leicht über die Hilfslinien hinaus */
  const ext = 4;
  el('line', {
    x1: pA.x - ux * ext, y1: pA.y - uy * ext,
    x2: pB.x + ux * ext, y2: pB.y + uy * ext
  }, g);

  /* Kleine Pfeilspitzen (einfach als Linienkreuze) */
  const tick = 4;
  const tx = -ny * tick;
  const ty = nx * tick;
  el('line', {
    x1: pA.x - ux * ext + tx, y1: pA.y - uy * ext + ty,
    x2: pA.x - ux * ext - tx, y2: pA.y - uy * ext - ty
  }, g);
  el('line', {
    x1: pB.x + ux * ext + tx, y1: pB.y + uy * ext + ty,
    x2: pB.x + ux * ext - tx, y2: pB.y + uy * ext - ty
  }, g);

  /* Label: immer aufrecht lesbar, leichter Versatz nach außen */
  const mx = (pA.x + pB.x) / 2 + nx * 12;
  const my = (pA.y + pB.y) / 2 + ny * 12;

  /* Weißer Hinterlauf für Lesbarkeit */
  const tBg = el('text', {
    x: mx,
    y: my,
    fill: '#fff',
    stroke: '#fff',
    'stroke-width': 4,
    'stroke-linejoin': 'round',
    'font-size': fontSize,
    'font-family': 'system-ui, Segoe UI, Roboto, sans-serif',
    'font-weight': '700',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    'paint-order': 'stroke'
  }, g);
  tBg.textContent = label;

  const t = el('text', {
    x: mx,
    y: my,
    fill: COLORS.dimText,
    'font-size': fontSize,
    'font-family': 'system-ui, Segoe UI, Roboto, sans-serif',
    'font-weight': '700',
    'text-anchor': 'middle',
    'dominant-baseline': 'central'
  }, g);
  t.textContent = label;
}

/**
 * Zeichnet eine vollständige 3D-Kiste als SVG ins container-Element.
 * @param {HTMLElement} container
 * @param {{ h:number, r:number, l:number }} dims
 * @param {{ variant?: 'card'|'hero' }} opts
 */
export function mountBoxIllustration (container, dims, opts = {}) {
  const { h: H, r: R, l: L, palette } = dims;
  const variant = opts.variant || 'card';
  const COLORS = buildColors(palette);
  const wPx = variant === 'hero' ? 240 : 280;
  const hPx = variant === 'hero' ? 160 : 200;
  const fontSize = variant === 'hero' ? 10 : 12;

  /* Scale so berechnen, dass Kiste + Bemaßung in den viewBox passen.
     Zusätzlich zum Padding plane ich Platz für die Maßketten ein (ca. 34 px). */
  const sinCos = Math.sqrt(3) / 2;
  const projW = (L + R) * sinCos;
  const projH = (L + R) * 0.5 + H;
  const padX = variant === 'hero' ? 34 : 48;
  const padY = variant === 'hero' ? 26 : 42;
  const scale = Math.min((wPx - padX * 2) / projW, (hPx - padY * 2) / projH);

  /* Zentrum: leicht nach unten, damit Maße oben Platz haben */
  const cx = wPx / 2;
  const cy = hPx / 2 + (projH * scale) / 2 - (H * scale);

  container.innerHTML = '';
  container.classList.add('box-illustration-root');

  const svg = el('svg', {
    xmlns: NS,
    viewBox: `0 0 ${wPx} ${hPx}`,
    width: wPx,
    height: hPx,
    role: 'img',
    overflow: 'visible'
  }, container);

  /* Definitionen: weicher Schatten + Kantenhighlight */
  const defs = el('defs', {}, svg);
  const filterId = `box-shadow-${Math.random().toString(36).slice(2, 7)}`;
  const filter = el('filter', {
    id: filterId, x: '-20%', y: '-20%', width: '140%', height: '140%'
  }, defs);
  el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '2.2' }, filter);

  /* Bodenschatten (Ellipse unterm Karton) */
  const base = proj(cx, cy, L / 2, R / 2, 0, scale);
  const shadow = el('g', {}, svg);
  el('ellipse', {
    cx: base.x,
    cy: base.y + 6,
    rx: (projW * scale) / 2 * 0.92,
    ry: (projW * scale) / 2 * 0.18,
    fill: COLORS.shadow,
    filter: `url(#${filterId})`
  }, shadow);

  /* 3D-Eckpunkte der Kiste (Welt): x=L, y=R, z=H */
  const P = (x, y, z) => proj(cx, cy, x, y, z, scale);
  /* unten: 0, oben: H */
  const V = {
    b000: P(0, 0, 0),
    bL00: P(L, 0, 0),
    b0R0: P(0, R, 0),
    bLR0: P(L, R, 0),
    t00H: P(0, 0, H),
    tL0H: P(L, 0, H),
    t0RH: P(0, R, H),
    tLRH: P(L, R, H)
  };

  const body = el('g', { class: 'box-body' }, svg);

  /* Rückflächen zuerst (werden dann verdeckt) — für saubere Kanten an der Hinterseite */
  /* FRONT-RECHTS: Seite rechts → Fläche (L,0,0)-(L,R,0)-(L,R,H)-(L,0,H) */
  el('path', {
    d: pathFrom([V.bL00, V.bLR0, V.tLRH, V.tL0H]),
    fill: COLORS.side,
    stroke: COLORS.edge,
    'stroke-width': 1.1,
    'stroke-linejoin': 'round'
  }, body);

  /* FRONT-LINKS: Seite links → (0,0,0)-(L,0,0)-(L,0,H)-(0,0,H) */
  el('path', {
    d: pathFrom([V.b000, V.bL00, V.tL0H, V.t00H]),
    fill: COLORS.front,
    stroke: COLORS.edge,
    'stroke-width': 1.1,
    'stroke-linejoin': 'round'
  }, body);

  /* TOP: obere Fläche (0,0,H)-(L,0,H)-(L,R,H)-(0,R,H) */
  el('path', {
    d: pathFrom([V.t00H, V.tL0H, V.tLRH, V.t0RH]),
    fill: COLORS.top,
    stroke: COLORS.edge,
    'stroke-width': 1.1,
    'stroke-linejoin': 'round'
  }, body);

  /* Leichte Beleuchtung: halbdurchsichtiger Farbverlauf oben (heller zur Kante) */
  const topGradId = `top-grad-${Math.random().toString(36).slice(2, 7)}`;
  const lg = el('linearGradient', {
    id: topGradId, x1: '0%', y1: '0%', x2: '0%', y2: '100%'
  }, defs);
  el('stop', { offset: '0%', 'stop-color': '#fff5e0', 'stop-opacity': '0.55' }, lg);
  el('stop', { offset: '100%', 'stop-color': '#fff5e0', 'stop-opacity': '0' }, lg);
  el('path', {
    d: pathFrom([V.t00H, V.tL0H, V.tLRH, V.t0RH]),
    fill: `url(#${topGradId})`
  }, body);

  /* Klebestreifen (Tape) quer über das Deckel — entlang der y-Achse (Tiefe) */
  const tapeHalf = Math.min(L, R) * 0.055; /* Breite proportional */
  const tyMid = R / 2;
  el('path', {
    d: pathFrom([
      P(L * 0.12, tyMid - tapeHalf, H + 0.01),
      P(L * 0.88, tyMid - tapeHalf, H + 0.01),
      P(L * 0.88, tyMid + tapeHalf, H + 0.01),
      P(L * 0.12, tyMid + tapeHalf, H + 0.01)
    ]),
    fill: COLORS.tape,
    stroke: COLORS.tapeStroke,
    'stroke-width': 0.8,
    opacity: '0.9'
  }, body);
  /* Mittelnaht */
  el('line', {
    x1: P(L * 0.12, tyMid, H + 0.02).x,
    y1: P(L * 0.12, tyMid, H + 0.02).y,
    x2: P(L * 0.88, tyMid, H + 0.02).x,
    y2: P(L * 0.88, tyMid, H + 0.02).y,
    stroke: COLORS.tapeStroke,
    'stroke-width': 0.6,
    'stroke-dasharray': '2 3',
    opacity: '0.75'
  }, body);

  /* Versandlabel auf der Vorderseite (Front-links, Fläche y=0) */
  const labelW = L * 0.36;
  const labelH = H * 0.28;
  const lx0 = L * 0.08;
  const ly0 = H * 0.12;
  el('path', {
    d: pathFrom([
      P(lx0, 0, ly0),
      P(lx0 + labelW, 0, ly0),
      P(lx0 + labelW, 0, ly0 + labelH),
      P(lx0, 0, ly0 + labelH)
    ]),
    fill: '#fefaf1',
    stroke: '#6d5634',
    'stroke-width': 0.7,
    opacity: '0.95'
  }, body);
  /* Zwei schmale Linien im Label (simuliertes Adressfeld) */
  const ln = (yrel, w) => {
    const y = ly0 + labelH * yrel;
    el('line', {
      x1: P(lx0 + labelW * 0.1, 0, y).x,
      y1: P(lx0 + labelW * 0.1, 0, y).y,
      x2: P(lx0 + labelW * (0.1 + w), 0, y).x,
      y2: P(lx0 + labelW * (0.1 + w), 0, y).y,
      stroke: '#8c6b3a',
      'stroke-width': 0.8,
      opacity: '0.6'
    }, body);
  };
  ln(0.28, 0.75);
  ln(0.55, 0.55);
  ln(0.78, 0.65);

  /* Dominicano-Express-Monogramm oben rechts im Label.
     Rotes Kreis-Badge mit weissem „DE" — liest sich auf jeder Boxgrösse
     gleich klar und unterscheidet die eigenen Kartons visuell. */
  const badgeR = Math.min(labelW, labelH) * 0.16;
  const badgeCX = lx0 + labelW - badgeR - labelW * 0.08;
  const badgeCY = ly0 + labelH - (labelH - badgeR) - labelH * 0.04;
  const badgePos = P(badgeCX, 0, badgeCY);
  /* Projizierte „Grösse" des Badges: in iso landet ein Kreis auf der
     y=0-Fläche als leichte Ellipse. Wir nutzen einen echten Kreis in
     Bildschirm-Pixeln (optisch sauber, da der Betrachter frontal schaut). */
  const badgeRadiusPx = badgeR * scale * 0.9;
  el('circle', {
    cx: badgePos.x,
    cy: badgePos.y,
    r: badgeRadiusPx,
    fill: '#c0392b',
    stroke: '#7a1f14',
    'stroke-width': 0.8,
    opacity: '0.95'
  }, body);
  const badgeText = el('text', {
    x: badgePos.x,
    y: badgePos.y,
    fill: '#ffffff',
    'font-size': badgeRadiusPx * 0.95,
    'font-family': 'system-ui, Segoe UI, Roboto, sans-serif',
    'font-weight': '800',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    'letter-spacing': '-0.5'
  }, body);
  badgeText.textContent = 'DE';

  /* Kantenhervorhebung an der oberen Deckel-Oberkante (Akzent) */
  el('line', {
    x1: V.t00H.x, y1: V.t00H.y,
    x2: V.tL0H.x, y2: V.tL0H.y,
    stroke: COLORS.edge,
    'stroke-width': 1.4,
    'stroke-linecap': 'round'
  }, body);
  el('line', {
    x1: V.tL0H.x, y1: V.tL0H.y,
    x2: V.tLRH.x, y2: V.tLRH.y,
    stroke: COLORS.edge,
    'stroke-width': 1.4,
    'stroke-linecap': 'round'
  }, body);

  /* Maßketten */
  const dimLayer = el('g', { class: 'box-dimensions', 'pointer-events': 'none' }, svg);

  const gap = variant === 'hero' ? 14 : 18;

  /* Höhe H: linke vordere Kante (unten → oben) */
  dimension(
    dimLayer,
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: H },
    cx, cy, scale,
    `${H}`,
    { side: 'left', fontSize, gap, COLORS }
  );

  /* Breite L: obere vordere Kante (links → rechts) */
  dimension(
    dimLayer,
    { x: 0, y: 0, z: H },
    { x: L, y: 0, z: H },
    cx, cy, scale,
    `${L}`,
    { side: 'left', fontSize, gap, COLORS }
  );

  /* Tiefe R: obere rechte Kante (vorne → hinten) */
  dimension(
    dimLayer,
    { x: L, y: 0, z: H },
    { x: L, y: R, z: H },
    cx, cy, scale,
    `${R}`,
    { side: 'right', fontSize, gap, COLORS }
  );

  /* ARIA-Label */
  const ariaKey = container.getAttribute('data-i18n-aria');
  const lang =
    typeof document !== 'undefined' ? document.documentElement.lang || 'es' : 'es';
  if (ariaKey && typeof window !== 'undefined' && window.T?.[lang]?.[ariaKey]) {
    container.setAttribute('aria-label', window.T[lang][ariaKey]);
  } else {
    container.setAttribute('aria-label', `${L} × ${R} × ${H} cm`);
  }

  return svg;
}

/** Init aller Elemente mit data-box-model="…". */
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
