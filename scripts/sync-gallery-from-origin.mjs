/**
 * Lädt die in index.html (GALLERY) referenzierten Dateien von einer Origin-URL.
 * dominicanoexpress.com (GoDaddy) liefert die Galerie per Client-JS — keine statischen Dateinamen.
 * Default: gleiche Bildmenge von der Vercel-Seite (rapold.io) wie im Repo.
 */
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "apps/web/img/gallery");

const FILES = [
  "IMG_3634.JPG",
  "b3a7ee22-7acb-4cd9-b647-2b8b4fe9afd2.jpeg",
  "IMG_8589.jpeg",
  "IMG_8590.jpeg",
  "1b6e3d48-4844-4333-a66c-870c036c81c8.jpeg",
  "IMG_3607.JPG",
  "IMG_0002.jpeg",
  "IMG_0015.jpeg",
  "IMG_4489.jpeg",
  "IMG_8588.jpeg",
  "IMG_2437.jpeg",
  "f25bee00-e81b-4c33-9fed-5dbd192877c9.jpeg",
  "IMG_0442.jpeg",
  "IMG_8586.jpeg",
  "f1f1c206-dc33-44e3-8339-2acc128e1b93.jpeg",
  "IMG_9300.jpeg",
  "IMG_2545.jpeg",
  "IMG_2305.jpeg",
];

const BASE =
  process.argv[2] || "https://dominicanoexpress.rapold.io/img/gallery/";

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "user-agent": "Mozilla/5.0 (GallerySync/1)" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(new URL(res.headers.location, url).href).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`${url} → ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

fs.mkdirSync(outDir, { recursive: true });
let ok = 0;
for (const f of FILES) {
  const url = BASE + encodeURIComponent(f);
  const dest = path.join(outDir, f);
  try {
    const buf = await download(url);
    fs.writeFileSync(dest, buf);
    ok++;
    console.log("OK", f, buf.length);
  } catch (e) {
    console.error("FAIL", f, e.message);
  }
}
console.log(`Done: ${ok}/${FILES.length} → ${outDir}`);
