import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs
  .readFileSync(path.join(__dirname, '../apps/web/index.html'), 'utf8')
  .replace(/\r\n/g, '\n');

const langs = ['es', 'de', 'en'];
const keysNeeded = new Set(['header_scanner']);
for (const m of html.matchAll(/(scan_[a-z_]+):/g)) keysNeeded.add(m[1]);

const out = {};
for (let li = 0; li < langs.length; li++) {
  const lang = langs[li];
  const startNeedle = `\n  ${lang}: {`;
  const start = html.indexOf(startNeedle, html.indexOf('const T ='));
  if (start === -1) throw new Error('lang block ' + lang);
  const nextLang = langs[li + 1];
  const endNeedle =
    nextLang != null ? `\n  ${nextLang}: {` : '\n};\nwindow.T = T;';
  const end = html.indexOf(endNeedle, start + startNeedle.length);
  if (end === -1) throw new Error('end for ' + lang);
  const block = html.slice(start + startNeedle.length, end);
  const obj = {};
  const lineRe = /^\s*([a-zA-Z0-9_]+)\s*:\s*((?:'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|[^,]+))\s*,?\s*$/gm;
  let lm;
  while ((lm = lineRe.exec(block)) !== null) {
    const k = lm[1];
    if (!keysNeeded.has(k)) continue;
    let raw = lm[2].trim().replace(/,$/, '');
    try {
      obj[k] = JSON.parse(raw);
    } catch (_) {
      /* ignore */
    }
  }
  out[lang] = obj;
}

const body = `/* Auto-generated from apps/web/index.html — run: node scripts/extract-scan-i18n.mjs */
(function () {
  window.T = ${JSON.stringify(out, null, 2)};
})();
`;

fs.writeFileSync(path.join(__dirname, '../apps/web/js/scan-i18n-standalone.js'), body);
console.log('written apps/web/js/scan-i18n-standalone.js', Object.keys(out.es).length, 'keys');
