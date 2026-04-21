/**
 * Deutscher Reisepass.
 *
 * TD3-MRZ mit `P<D<<` oder `P<DEU`. Generic-MRZ fängt die MRZ-Felder; dieses
 * Profil identifiziert das Dokument und ergänzt Geburtsort + ausstellende
 * Behörde (auf Deutsch gelabelt).
 */

import { valueAfterLabels, countMatches } from '../utils.mjs';

const STRONG = /REISEPASS/i;
const SUPPORTING = [
  /BUNDESREPUBLIK\s+DEUTSCHLAND/i,
  /FEDERAL\s+REPUBLIC\s+OF\s+GERMANY/i
];

export default {
  id: 'german-passport',
  label: 'Deutscher Reisepass',
  docType: 'Deutscher Reisepass',
  priority: 25,

  detect (ctx) {
    const mrz = ctx.mrz.parsed;
    const hasMrz =
      mrz && /passport/i.test(String(mrz.docType || '')) &&
      /^DEU$/.test(String(mrz.country || ''));
    const labeled = STRONG.test(ctx.upper);
    if (!hasMrz && !labeled) return 0;
    let score = hasMrz ? 0.55 : 0;
    if (labeled) score += 0.3;
    score += countMatches(ctx.upper, SUPPORTING) * 0.05;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};
    const place = valueAfterLabels(txt, 'Geburtsort|Place\\s*of\\s*birth');
    if (place) f.placeOfOrigin = place;
    const auth = valueAfterLabels(txt, 'Ausstellende\\s*Beh[öo]rde|Issuing\\s*authority|Beh[öo]rde');
    if (auth) f.authority = auth;
    if (!f.nationality) f.nationality = 'DEU';
    if (!f.country) f.country = 'DEU';
    return f;
  }
};
