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

const cropFn = `
function cropOptimal(dataURL) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const inset = 0.045;
      const sx = Math.round(img.width * inset);
      const sy = Math.round(img.height * inset);
      const w = Math.round(img.width * (1 - 2 * inset));
      const h = Math.round(img.height * (1 - 2 * inset));
      const canvas = document.createElement('canvas');
      const maxLong = 1600;
      let tw = w, th = h;
      if (Math.max(tw, th) > maxLong) {
        const s = maxLong / Math.max(tw, th);
        tw = Math.round(tw * s);
        th = Math.round(th * s);
      }
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, w, h, 0, 0, tw, th);
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
