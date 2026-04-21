/**
 * Deutscher Personalausweis (Bundesrepublik Deutschland).
 *
 * MRZ: TD1, erste Zeile „IDD<<" (Land-Feld zweistellig „D<" aus historischen
 * Gründen) oder „IDD" + Füllzeichen. Das generische MRZ-Profil extrahiert die
 * Basisfelder; dieses Profil setzt das Dokument-Label + Geburtsort + Anschrift.
 */

import { valueAfterLabels, countMatches } from '../utils.mjs';

const STRONG = /PERSONALAUSWEIS/i;
const SUPPORTING = [
  /BUNDESREPUBLIK\s+DEUTSCHLAND/i,
  /FEDERAL\s+REPUBLIC\s+OF\s+GERMANY/i
];

export default {
  id: 'german-id',
  label: 'Deutscher Personalausweis',
  docType: 'Deutscher Personalausweis',
  priority: 30,

  detect (ctx) {
    const strong = STRONG.test(ctx.upper);
    const mrz = ctx.mrz.parsed;
    const isGermanIdMrz =
      mrz && /^DEU$/.test(String(mrz.country || '')) &&
      !/passport/i.test(String(mrz.docType || ''));
    if (!strong && !isGermanIdMrz) return 0;
    let score = strong ? 0.55 : 0;
    if (isGermanIdMrz) score += 0.35;
    score += countMatches(ctx.upper, SUPPORTING) * 0.05;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};
    const place = valueAfterLabels(txt, 'Geburtsort|Place\\s*of\\s*birth');
    if (place) f.placeOfOrigin = place;
    const auth = valueAfterLabels(txt, 'Beh[öo]rde|Authority');
    if (auth) f.authority = auth;
    const religion = valueAfterLabels(txt, 'Ordens-?\\s*oder\\s*K[üu]nstlername|Religious\\s*name');
    if (religion) f.alias = religion;
    if (!f.nationality) f.nationality = 'DEU';
    if (!f.country) f.country = 'DEU';
    return f;
  }
};
