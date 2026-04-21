/**
 * Deutscher Führerschein (Kartenformat seit 2013).
 *
 * Keine MRZ. Felder nach EU-Richtlinie 2006/126/EG:
 *   1. Name
 *   2. Vornamen
 *   3. Geburtsdatum und -ort
 *   4a. Ausstellungsdatum
 *   4b. Ablaufdatum
 *   4c. Ausstellende Behörde
 *   5.  Führerscheinnummer
 *   9.  Klassen
 */

import { valueAfterLabels, findDateAfterLabel, countMatches } from '../utils.mjs';

const STRONG = [
  /F[ÜU]HRERSCHEIN/i,
  /DRIVING\s+LICEN[CS]E/i
];

const SUPPORTING = [
  /BUNDESREPUBLIK\s+DEUTSCHLAND/i,
  /DEUTSCHLAND/i
];

const CLASSES_RE = /\b(AM|A1|A2|A|B1|BE|B|C1E|C1|CE|C|D1E|D1|DE|D|L|T)\b/g;

export default {
  id: 'german-drivers-license',
  label: 'Deutscher Führerschein',
  docType: 'Deutscher Führerschein',
  priority: 28,

  detect (ctx) {
    if (!STRONG.some(r => r.test(ctx.upper))) return 0;
    /* Nicht greifen, wenn CH-Führerausweis (den es mit „FÜHRERAUSWEIS" gibt) */
    if (/F[ÜU]HRERAUSWEIS/i.test(ctx.text)) return 0;
    let score = 0.5;
    score += countMatches(ctx.upper, SUPPORTING) * 0.1;
    if (/\bKlassen?\b|\bKategorien?\b/i.test(ctx.text)) score += 0.15;
    if (ctx.mrz.parsed) score *= 0.15;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};

    /* DE-Führerschein druckt häufig nur die Nummer ohne Label-Wort.
       Deshalb greifen wir direkt nach „1." / „2." ohne „Name"-Keyword. */
    const sur = valueAfterLabels(txt, '1\\.(?:\\s*(?:Name|Surname))?');
    if (sur) f.surname = sur;
    const giv = valueAfterLabels(txt, '2\\.(?:\\s*(?:Vornamen?|Given\\s*names?))?');
    if (giv) f.givenNames = giv;

    const dob = findDateAfterLabel(txt, '3\\.|Geburtsdatum');
    if (dob) f.dob = dob;
    const issued = findDateAfterLabel(txt, '4a\\.|Ausstellungsdatum|Date\\s*of\\s*issue');
    if (issued) f.issued = issued;
    const expiry = findDateAfterLabel(txt, '4b\\.|Ablaufdatum|Date\\s*of\\s*expiry');
    if (expiry) f.expiry = expiry;

    const auth = valueAfterLabels(txt, '4c\\.|Ausstellende\\s*Beh[öo]rde|Issuing\\s*authority');
    if (auth) f.authority = auth;

    const nrM = txt.match(/\b5\.\s*(?:[^\n]{0,20}\n)?\s*([A-Z0-9]{8,12})\b/i);
    if (nrM) f.docNumber = nrM[1].toUpperCase();

    /* Klassen aus dem 9.-Block */
    const catBlock = txt.match(/(?:\b9\.|Klassen?|Kategorien?)[^\n]{0,4}\n?([^\n]{1,120})/i);
    if (catBlock) {
      const unique = [...new Set([...catBlock[1].matchAll(CLASSES_RE)].map(m => m[1]))];
      if (unique.length) f.categories = unique.join(', ');
    }

    if (!f.nationality) f.nationality = 'DEU';
    if (!f.country) f.country = 'DEU';
    return f;
  }
};
