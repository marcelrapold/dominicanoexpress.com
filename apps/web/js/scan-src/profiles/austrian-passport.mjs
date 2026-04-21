/**
 * Österreichischer Reisepass.
 *
 * TD3-MRZ mit `P<AUT`.
 */

import { valueAfterLabels, countMatches } from '../utils.mjs';

/** Eindeutig österreichisch — nicht zu verwechseln mit DE-Reisepass. */
const AUSTRIA_MARKER = /REPUBLIK\s+[ÖO]STERREICH|REPUBLIC\s+OF\s+AUSTRIA/i;

export default {
  id: 'austrian-passport',
  label: 'Österreichischer Reisepass',
  docType: 'Österreichischer Reisepass',
  priority: 24,

  detect (ctx) {
    const mrz = ctx.mrz.parsed;
    const hasMrz = mrz && /passport/i.test(String(mrz.docType || '')) &&
      /^AUT$/.test(String(mrz.country || ''));
    const hasMarker = AUSTRIA_MARKER.test(ctx.upper);
    if (!hasMrz && !hasMarker) return 0;
    let score = hasMrz ? 0.55 : 0;
    if (hasMarker) score += 0.3;
    if (/REISEPASS/i.test(ctx.upper)) score += 0.1;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};
    const place = valueAfterLabels(txt, 'Geburtsort|Place\\s*of\\s*birth');
    if (place) f.placeOfOrigin = place;
    const auth = valueAfterLabels(txt, 'Ausstellende\\s*Beh[öo]rde|Issuing\\s*authority|Beh[öo]rde');
    if (auth) f.authority = auth;
    if (!f.nationality) f.nationality = 'AUT';
    if (!f.country) f.country = 'AUT';
    return f;
  }
};
