import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const h = fs.readFileSync(path.join(__dirname, '../apps/scan/index.html'), 'utf8');
const m = h.match(/<style>([\s\S]*?)<\/style>/);
if (!m) throw new Error('no style');
let css = m[1].trim();
css = css.replace(/^\*,\s*\*::before,\s*\*::after\s*\{/, '#section-scanner, #section-scanner *, #section-scanner *::before, #section-scanner *::after {');
css = css.replace(/:root\s*\{/, '#scanner {');
css = css.replace(/\s*html\s*\{[^}]+\}/, '');
css = css.replace(/\s*body\s*\{[\s\S]*?\}/, `#section-scanner .scan-skin {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}`);
css = css.replace(/\s*header\s*\{/, ' #section-scanner .scan-toolbar {');
css = css.replace(/\s*main\s*\{/, ' #section-scanner .scan-main {');
const idMap = [
  ['#camera-video', '#s-camera-video'],
  ['#captured-img', '#s-captured-img'],
  ['#results-section', '#s-results-section'],
  ['#export-textarea', '#s-export-textarea'],
  ['#scan-frame', '#s-scan-frame'],
];
for (const [a, b] of idMap) css = css.split(a).join(b);
css += `
#section-scanner input[type=file] { display: none; }
#section-scanner #s-capture-canvas { display: none; }
`;
fs.writeFileSync(path.join(__dirname, '../apps/web/css/scan-app.css'), css.trim() + '\n');
console.log('written apps/web/css/scan-app.css');
