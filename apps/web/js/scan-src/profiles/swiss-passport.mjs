/**
 * Schweizer Reisepass.
 *
 * MRZ ist TD3 mit `P<CHE`; das generische MRZ-Profil trifft bereits. Dieses
 * Profil zieht zusätzlich den Heimatort und die ausstellende Behörde, die
 * nicht in der MRZ stehen.
 */

import { valueAfterLabels, countMatches } from '../utils.mjs';

const STRONG = /REISEPASS|PASSEPORT|PASSAPORTO/i;
const SUPPORTING = [
  /SCHWEIZERISCHE\s+EIDGENOSSENSCHAFT/i,
  /CONF[EÉ]D[EÉ]RATION\s+SUISSE/i
];

export default {
  id: 'swiss-passport',
  label: 'Schweizer Reisepass',
  docType: 'Swiss Passport',
  priority: 25,

  detect (ctx) {
    const mrz = ctx.mrz.parsed;
    const hasMrz = mrz && mrz.docType === 'Passport' && mrz.country === 'CHE';
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

    const heimat = valueAfterLabels(
      txt,
      'Heimatort|Lieu\\s*d[ae]?\\s*origine|Luogo\\s*d[aei]?\\s*attinenza|Place\\s*of\\s*origin'
    );
    if (heimat) f.placeOfOrigin = heimat;

    const auth = valueAfterLabels(
      txt,
      'Beh[öo]rde|Autorit[eé]|Autorit[àa]|Authority|Autoritad'
    );
    if (auth) f.authority = auth;

    if (!f.country) f.country = 'CHE';
    if (!f.nationality) f.nationality = 'CHE';
    return f;
  }
};
