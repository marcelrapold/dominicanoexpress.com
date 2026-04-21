/**
 * Österreichischer Personalausweis.
 *
 * TD1/TD2-MRZ mit Land `AUT`. Labels typischerweise „Republik Österreich" +
 * „Personalausweis" / „Identitätsausweis".
 */

import { valueAfterLabels, countMatches } from '../utils.mjs';

const AUSTRIA_MARKER = /REPUBLIK\s+[ÖO]STERREICH|IDENTIT[ÄA]TSAUSWEIS/i;

export default {
  id: 'austrian-id',
  label: 'Österreichischer Personalausweis',
  docType: 'Österreichischer Personalausweis',
  priority: 29,

  detect (ctx) {
    const marker = AUSTRIA_MARKER.test(ctx.upper);
    const mrz = ctx.mrz.parsed;
    const isAut = mrz && /^AUT$/.test(String(mrz.country || '')) &&
      !/passport/i.test(String(mrz.docType || ''));
    if (!marker && !isAut) return 0;
    let score = marker ? 0.5 : 0;
    if (isAut) score += 0.4;
    if (/PERSONALAUSWEIS/i.test(ctx.upper)) score += 0.1;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};
    const place = valueAfterLabels(txt, 'Geburtsort|Place\\s*of\\s*birth');
    if (place) f.placeOfOrigin = place;
    const auth = valueAfterLabels(txt, 'Ausstellende\\s*Beh[öo]rde|Beh[öo]rde|Authority');
    if (auth) f.authority = auth;
    if (!f.nationality) f.nationality = 'AUT';
    if (!f.country) f.country = 'AUT';
    return f;
  }
};
