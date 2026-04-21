/**
 * Carte d’Identité Nationale (République d’Haïti).
 *
 * Layout: Französisch und Kreyòl, Marker „CARTE D'IDENTITÉ NATIONALE",
 * „RÉPUBLIQUE D'HAÏTI" oder „ONI" (Office National d'Identification).
 * Die Kartennummer „NIN" ist ein 10-stelliger numerischer Code.
 */

import { valueAfterLabels, findDateAfterLabel, countMatches } from '../utils.mjs';

const STRONG = [
  /CARTE\s+D[''']IDENTIT[EÉ]\s+NATIONALE/i,
  /R[EÉ]PUBLIQUE\s+D[''']HA[IÏ]TI/i,
  /OFFICE\s+NATIONAL\s+D[''']IDENTIFICATION/i
];

const NIN_RE = /\b(\d{2}[-\s]?\d{2}[-\s]?\d{2}[-\s]?\d{4})\b/;

export default {
  id: 'haitian-id',
  label: 'Carte d’Identité Haïtienne',
  docType: 'Carte d’Identité Haïtienne',
  priority: 35,

  detect (ctx) {
    const strong = countMatches(ctx.upper, STRONG) > 0;
    const hasNin = NIN_RE.test(ctx.text);
    if (!strong && !hasNin) return 0;
    let score = strong ? 0.55 : 0;
    if (hasNin) score += 0.25;
    if (ctx.countries.includes('HTI')) score += 0.1;
    if (ctx.mrz.parsed && ctx.mrz.parsed.docType === 'Passport') score *= 0.3;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};

    const nin = txt.match(NIN_RE);
    if (nin) {
      const d = nin[1].replace(/\D/g, '');
      f.docNumber = d.length === 10
        ? `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}-${d.slice(6)}`
        : nin[1].trim();
    }

    const sur = valueAfterLabels(txt, 'Nom|Surname|Apellido');
    if (sur) f.surname = sur;
    const giv = valueAfterLabels(txt, 'Pr[eé]noms?|Given\\s*names?|Nombres?');
    if (giv) f.givenNames = giv;

    const dob = findDateAfterLabel(txt, 'Date\\s*de\\s*naissance|DOB');
    if (dob) f.dob = dob;
    const expiry = findDateAfterLabel(txt, 'Date\\s*d[\'\\s]*expiration|Expire');
    if (expiry) f.expiry = expiry;

    const place = valueAfterLabels(txt, 'Lieu\\s*de\\s*naissance|Place\\s*of\\s*birth');
    if (place) f.placeOfOrigin = place;

    const sexM = txt.match(/(?:Sexe|Sex|Sesso)[^\n]{0,20}\n?\s*([MFmf])\b/i);
    if (sexM) f.sex = sexM[1].toUpperCase();

    if (!f.nationality) f.nationality = 'HTI';
    if (!f.country) f.country = 'HTI';
    return f;
  }
};
