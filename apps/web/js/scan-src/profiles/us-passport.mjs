/**
 * US Passport.
 *
 * TD3-MRZ mit `P<USA`. Kein länderspezifisches Sonderfeld; das Profil setzt
 * primär das freundliche Label und liefert optional den Geburtsort.
 */

import { valueAfterLabels, countMatches } from '../utils.mjs';

const STRONG = [
  /UNITED\s+STATES\s+OF\s+AMERICA/i,
  /PASSPORT/i
];

export default {
  id: 'us-passport',
  label: 'US Passport',
  docType: 'US Passport',
  priority: 22,

  detect (ctx) {
    const mrz = ctx.mrz.parsed;
    const hasMrz = mrz && /passport/i.test(String(mrz.docType || '')) &&
      /^USA$/.test(String(mrz.country || ''));
    if (!hasMrz) return 0;
    let score = 0.55;
    score += countMatches(ctx.upper, STRONG) * 0.1;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};
    const place = valueAfterLabels(txt, 'Place\\s*of\\s*birth');
    if (place) f.placeOfOrigin = place;
    const auth = valueAfterLabels(txt, 'Authority|Issuing\\s*authority');
    if (auth) f.authority = auth;
    if (!f.nationality) f.nationality = 'USA';
    if (!f.country) f.country = 'USA';
    return f;
  }
};
