/**
 * Pasaporte de la República Dominicana.
 *
 * TD3-MRZ mit `P<DOM`. Generisches MRZ-Profil fängt die MRZ-Felder; dieses
 * Profil setzt nur den Dokumenttyp + ggf. Lugar de Nacimiento.
 */

import { valueAfterLabels, countMatches } from '../utils.mjs';

const STRONG = /PASAPORTE/i;
const SUPPORTING = [
  /REP[UÚ]BLICA\s+DOMINICANA/i,
  /DIRECCI[OÓ]N\s+GENERAL\s+DE\s+PASAPORTES/i
];

export default {
  id: 'dominican-passport',
  label: 'Pasaporte Dominicano',
  docType: 'Dominican Passport',
  priority: 24,

  detect (ctx) {
    const mrz = ctx.mrz.parsed;
    /* Entweder MRZ mit Land DOM ODER sichtbares „Pasaporte" — sonst raus. */
    const hasMrz = mrz && mrz.docType === 'Passport' && mrz.country === 'DOM';
    if (!hasMrz && !STRONG.test(ctx.upper)) return 0;
    let score = hasMrz ? 0.6 : 0.35;
    score += countMatches(ctx.upper, SUPPORTING) * 0.1;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};
    const place = valueAfterLabels(txt, 'Lugar\\s*de\\s*Nacimiento|Place\\s*of\\s*birth');
    if (place) f.placeOfOrigin = place;
    const auth = valueAfterLabels(txt, 'Autoridad|Authority|Direcci[oó]n\\s*General');
    if (auth) f.authority = auth;
    if (!f.nationality) f.nationality = 'DOM';
    if (!f.country) f.country = 'DOM';
    return f;
  }
};
