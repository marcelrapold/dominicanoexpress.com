import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
let idx = fs.readFileSync(path.join(root, 'apps/web/index.html'), 'utf8');
const emb = fs.readFileSync(path.join(root, 'apps/web/scan-section-embed.html'), 'utf8');

const old =
  /<!-- ── ID Scanner Banner[\s\S]*?<!-- ── Process/;
if (!old.test(idx)) {
  console.error('banner block not found');
  process.exit(1);
}
idx = idx.replace(old, emb + '\n\n<!-- ── Process');

if (!idx.includes('href="/css/scan-app.css"')) {
  idx = idx.replace(
    '<link rel="manifest"         href="/site.webmanifest" />',
    '<link rel="manifest"         href="/site.webmanifest" />\n  <link rel="stylesheet" href="/css/scan-app.css" />'
  );
}

idx = idx.split('href="/scan"').join('href="#scanner"');
idx = idx.replace('</body>', '<script src="/js/scan-app.js" defer></script>\n</body>');

fs.writeFileSync(path.join(root, 'apps/web/index.html'), idx);
console.log('ok');
