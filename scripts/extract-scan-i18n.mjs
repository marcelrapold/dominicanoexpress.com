import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs
  .readFileSync(path.join(__dirname, '../apps/web/index.html'), 'utf8')
  .replace(/\r\n/g, '\n');

/**
 * Parse a JS string literal (single- or double-quoted, with escape sequences).
 * Accepts the raw literal including the outer quotes.
 */
function parseJsLiteralString (raw) {
  if (!raw || raw.length < 2) throw new Error('empty literal');
  const q = raw[0];
  if ((q !== "'" && q !== '"') || raw[raw.length - 1] !== q) {
    throw new Error('not a quoted string: ' + raw.slice(0, 30));
  }
  let out = '';
  for (let i = 1; i < raw.length - 1; i++) {
    const c = raw[i];
    if (c === '\\') {
      const n = raw[++i];
      switch (n) {
        case 'n': out += '\n'; break;
        case 'r': out += '\r'; break;
        case 't': out += '\t'; break;
        case "'": out += "'"; break;
        case '"': out += '"'; break;
        case '\\': out += '\\'; break;
        case '/': out += '/'; break;
        case 'u': {
          const hex = raw.slice(i + 1, i + 5);
          out += String.fromCharCode(parseInt(hex, 16));
          i += 4;
          break;
        }
        case 'x': {
          const hex = raw.slice(i + 1, i + 3);
          out += String.fromCharCode(parseInt(hex, 16));
          i += 2;
          break;
        }
        default: out += n;
      }
    } else {
      out += c;
    }
  }
  return out;
}

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
      obj[k] = parseJsLiteralString(raw);
    } catch (e) {
      console.warn('skip', k, e.message);
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
