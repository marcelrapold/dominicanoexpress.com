import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, '../apps/scan/index.html'), 'utf8');
const m = html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);
if (!m) throw new Error('script not found');
let js = m[1];

js = js.replace(/document\.getElementById\('([^']+)'\)/g, "el('$1')");
js = `/* Embedded ID Scanner — Dominicano Express */
function el(id) { return document.getElementById('s-' + id); }

${js}`;

/* Zuschnitt-Logik bei Änderungen parallel zu apps/web/js/scan-app.js halten */
const cropFn = `
function grayMatrixFromImage(img, maxW) {
  const scale = Math.min(1, maxW / img.width);
  const w = Math.max(32, Math.round(img.width * scale));
  const h = Math.max(32, Math.round(img.height * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h);
  const g = new Float32Array(w * h);
  for (let i = 0, j = 0; i < id.data.length; i += 4, j++) {
    g[j] = (id.data[i] * 77 + id.data[i + 1] * 150 + id.data[i + 2] * 29) >> 8;
  }
  return { g, w, h, sw: img.width / w, sh: img.height / h };
}
function edgeEnergyBounds(gray, w, h) {
  const col = new Float32Array(w).fill(0);
  const row = new Float32Array(h).fill(0);
  const at = (x, y) => gray[y * w + x];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx = Math.abs(at(x + 1, y) - at(x - 1, y));
      const gy = Math.abs(at(x, y + 1) - at(x, y - 1));
      const m = gx + gy * 0.85;
      col[x] += m;
      row[y] += m;
    }
  }
  let cmax = 0, rmax = 0;
  for (let x = 0; x < w; x++) if (col[x] > cmax) cmax = col[x];
  for (let y = 0; y < h; y++) if (row[y] > rmax) rmax = row[y];
  if (cmax < 1e-6 || rmax < 1e-6) return null;
  const cTh = cmax * 0.14, rTh = rmax * 0.14;
  let xl = 0;
  while (xl < w - 8 && col[xl] < cTh) xl++;
  let xr = w - 1;
  while (xr > 8 && col[xr] < cTh) xr--;
  let yt = 0;
  while (yt < h - 8 && row[yt] < rTh) yt++;
  let yb = h - 1;
  while (yb > 8 && row[yb] < rTh) yb--;
  if (xr - xl < w * 0.35 || yb - yt < h * 0.35) return null;
  return { xl, xr, yt, yb };
}
function cropOptimal(dataURL) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const o = grayMatrixFromImage(img, 560);
      const g = o.g, w = o.w, h = o.h, sw = o.sw, sh = o.sh;
      let sx = 0, sy = 0, cw = img.width, ch = img.height;
      const b = edgeEnergyBounds(g, w, h);
      if (b) {
        const padX = Math.round((b.xr - b.xl) * 0.02);
        const padY = Math.round((b.yb - b.yt) * 0.02);
        sx = Math.max(0, Math.floor(b.xl * sw) - padX);
        sy = Math.max(0, Math.floor(b.yt * sh) - padY);
        cw = Math.min(img.width - sx, Math.ceil((b.xr - b.xl + 1) * sw) + 2 * padX);
        ch = Math.min(img.height - sy, Math.ceil((b.yb - b.yt + 1) * sh) + 2 * padY);
      } else {
        const inset = 0.035;
        sx = Math.round(img.width * inset);
        sy = Math.round(img.height * inset);
        cw = Math.round(img.width * (1 - 2 * inset));
        ch = Math.round(img.height * (1 - 2 * inset));
      }
      const fine = 0.012;
      sx += Math.round(cw * fine);
      sy += Math.round(ch * fine);
      cw = Math.round(cw * (1 - 2 * fine));
      ch = Math.round(ch * (1 - 2 * fine));
      if (cw < 80 || ch < 80) { sx = 0; sy = 0; cw = img.width; ch = img.height; }
      const canvas = document.createElement('canvas');
      const maxLong = 1600;
      let tw = cw, th = ch;
      if (Math.max(tw, th) > maxLong) {
        const s = maxLong / Math.max(tw, th);
        tw = Math.round(tw * s); th = Math.round(th * s);
      }
      canvas.width = tw; canvas.height = th;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, cw, ch, 0, 0, tw, th);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

function fieldsToPayload(f) {
  const o = {};
  const keys = ['surname','givenNames','dob','sex','nationality','country','docNumber','docType','issued','expiry','height','placeOfOrigin','authority'];
  for (const k of keys) { if (f[k] != null && f[k] !== '') o[k] = f[k]; }
  return o;
}

function sendScanEmailAsync(imageDataURL, f, rawText) {
  const lang = document.documentElement.lang || 'es';
  const safeLang = ['es','de','en'].includes(lang) ? lang : 'es';
  fetch('/api/send-scan-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lang: safeLang,
      imageBase64: imageDataURL,
      fields: fieldsToPayload(f),
      rawText: rawText || '',
    }),
  })
    .then((r) => r.json().catch(() => ({})))
    .then((data) => {
      if (data && data.ok) {
        const msg = (window.T && window.T[safeLang] && window.T[safeLang].scan_email_sent) || 'Sent';
        scanToast(msg);
      } else {
        const msg = (window.T && window.T[safeLang] && window.T[safeLang].scan_email_fail) || 'Email failed';
        scanToast(msg, true);
      }
    })
    .catch(() => {
      const msg = (window.T && window.T[safeLang] && window.T[safeLang].scan_email_fail) || 'Email failed';
      scanToast(msg, true);
    });
}
`;

js = js.replace(
  '// ── Config ──────────────────────────────────────────────────────────────────',
  cropFn + '\n// ── Config —─────────────────────────────────────────────────────────────────'
);

js = js.replace(
  `async function runOCR(dataURL) {
  capturedURL = dataURL;`,
  `async function runOCR(dataURL) {
  dataURL = await cropOptimal(dataURL);
  capturedURL = dataURL;`
);

js = js.replace(
  `    await delay(300);
    overlay.classList.remove('active');
    renderResults(fields, text, dataURL);
    setStatus('ready', 'Complete');
    haptic('success');`,
  `    await delay(300);
    overlay.classList.remove('active');
    renderResults(fields, text, dataURL);
    setStatus('ready', 'Complete');
    haptic('success');
    try { sendScanEmailAsync(dataURL, fields, text); } catch (_) {}`
);

js = js.replace(
  'let _tt; function toast(msg, err) {',
  'let _tt; function scanToast(msg, err) {'
);
js = js.replace(/\btoast\(/g, 'scanToast(');

js += `
if (typeof window.initScanAppI18n === 'function') window.initScanAppI18n();
`;

fs.writeFileSync(path.join(__dirname, '../apps/web/js/scan-app.js'), js);
console.log('written apps/web/js/scan-app.js', js.length);
