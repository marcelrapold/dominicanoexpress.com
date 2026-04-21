/**
 * Schweizer Führerausweis (Permis de conduire / Licenza di condurre).
 *
 * Keine MRZ. Felder sind nach ISO 18013 nummeriert:
 *   1. Name (Surname)
 *   2. Vorname (Given names)
 *   3. Geburtsdatum und -ort
 *   4a. Ausstellungsdatum
 *   4b. Ablaufdatum
 *   4c. Ausstellungsbehörde
 *   5.  Führerausweisnummer
 *   9.  Kategorien
 */

import { valueAfterLabels, findDates, countMatches } from '../utils.mjs';

const MARKERS = [
  /F[ÜU]HRERAUSWEIS/i,
  /PERMIS\s+DE\s+CONDUIRE/i,
  /LICENZA\s+DI\s+CONDURRE/i,
  /LICENZA\s+DA\s+CUNDUCT[IA]R/i,
  /DRIVING\s+LICEN[CS]E/i
];

/** ISO-18013-Kategorien (FS-Klassen). */
const CATEGORIES_RE = /\b(A1|A35|A|B1|BE|B|C1E|CE|C1|C|D1E|DE|D1|D|F|G|M)\b/g;

export default {
  id: 'swiss-drivers-license',
  label: 'Schweizer Führerausweis',
  docType: 'Swiss Driver’s License',
  priority: 28,

  detect (ctx) {
    let score = countMatches(ctx.upper, MARKERS) * 0.35;
    if (/\bKategorien?\b|\bCat[eé]gories?\b|\bCategorie\b/i.test(ctx.text)) score += 0.15;
    if (ctx.countries.includes('CHE') && /F[ÜU]HRERAUSWEIS|PERMIS/i.test(ctx.text)) score += 0.12;
    /* Führerausweise haben keine MRZ — treffen sie trotzdem, ist ein anderer
       Dokumenttyp wahrscheinlicher. */
    if (ctx.mrz.parsed) score *= 0.15;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};

    const sur = valueAfterLabels(txt, '1\\.\\s*(?:Name|Nom|Cognome|Surname)');
    if (sur) f.surname = sur;

    const giv = valueAfterLabels(txt, '2\\.\\s*(?:Vorname|Pr[eé]nom|Nome|Given\\s*names?)');
    if (giv) f.givenNames = giv;

    /* Führerausweisnummer: Label „5." auf eigener Zeile (oder danach) */
    const nrM = txt.match(/\b5\.\s*(?:[^\n]{0,20}\n)?\s*([A-Z0-9]{6,12})\b/i);
    if (nrM) f.docNumber = nrM[1].toUpperCase();

    /* Datumsfelder: 4a = Ausstellung, 4b = Ablauf */
    const issueM = txt.match(/\b4a\.?\s*(?:[^\n]{0,20}\n)?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
    if (issueM) f.issued = issueM[1].replace(/[\s/-]/g, '.');
    const expiryM = txt.match(/\b4b\.?\s*(?:[^\n]{0,20}\n)?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
    if (expiryM) f.expiry = expiryM[1].replace(/[\s/-]/g, '.');

    /* DOB: „3." oder als erstes Datum */
    const dobM = txt.match(/\b3\.?\s*(?:[^\n]{0,20}\n)?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
    if (dobM) f.dob = dobM[1].replace(/[\s/-]/g, '.');

    const dates = findDates(txt);
    if (!f.dob && dates[0]) f.dob = dates[0];
    if (!f.issued && dates[1]) f.issued = dates[1];
    if (!f.expiry && dates[2]) f.expiry = dates[2];

    /* Kategorien: nur innerhalb des 9./Kategorien-Blocks suchen, sonst
       erzeugen kleine Tokens wie „DE"/„BE" aus Fließtext Phantom-Treffer. */
    const catBlock = txt.match(/(?:\b9\.|Kategorien?|Cat[eé]gories?|Categorie)[^\n]{0,4}\n?([^\n]{1,80})/i);
    if (catBlock) {
      const unique = [...new Set(
        [...catBlock[1].matchAll(CATEGORIES_RE)].map(m => m[1])
      )];
      if (unique.length) f.categories = unique.join(', ');
    }

    if (!f.nationality) f.nationality = 'CHE';
    if (!f.country) f.country = 'CHE';
    return f;
  }
};
