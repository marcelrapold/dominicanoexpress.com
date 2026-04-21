/**
 * Passeport de la République d’Haïti.
 *
 * TD3-MRZ mit `P<HTI`.
 */

import { valueAfterLabels, countMatches } from '../utils.mjs';

const STRONG = [
  /PASSEPORT/i,
  /R[EÉ]PUBLIQUE\s+D[''']HA[IÏ]TI/i,
  /REPUBLIC\s+OF\s+HAITI/i
];

export default {
  id: 'haitian-passport',
  label: 'Passeport Haïtien',
  docType: 'Passeport Haïtien',
  priority: 23,

  detect (ctx) {
    const mrz = ctx.mrz.parsed;
    const hasMrz = mrz && /passport/i.test(String(mrz.docType || '')) &&
      /^HTI$/.test(String(mrz.country || ''));
    const labeled = countMatches(ctx.upper, STRONG) > 0;
    if (!hasMrz && !labeled) return 0;
    let score = hasMrz ? 0.55 : 0;
    if (labeled) score += 0.3;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};
    const place = valueAfterLabels(txt, 'Lieu\\s*de\\s*naissance|Place\\s*of\\s*birth');
    if (place) f.placeOfOrigin = place;
    const auth = valueAfterLabels(txt, 'Autorit[eé]|Authority');
    if (auth) f.authority = auth;
    if (!f.nationality) f.nationality = 'HTI';
    if (!f.country) f.country = 'HTI';
    return f;
  }
};
