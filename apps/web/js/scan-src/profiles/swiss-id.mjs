/**
 * Schweizer Identitätskarte (Carte d'identité / Carta d'identità).
 *
 * Layout: drei Sprachvarianten auf derselben Karte — wir suchen die typischen
 * Beschriftungen. Bei neueren Karten (ab 2023) gibt es eine TD1-MRZ mit IDCHE,
 * die das generische MRZ-Profil bereits einfängt; dieses Profil ergänzt die
 * sichtlich gedruckten Felder (Heimatort, Behörde, Grösse).
 */

import { valueAfterLabels, rawAfterLabels, cleanPersonName, countMatches } from '../utils.mjs';

/** Harter Marker: das Wort „Identitätskarte" (oder Übersetzungen). */
const STRONG = [
  /IDENTIT[ÄA]TSKARTE/i,
  /CARTE\s+D[''']IDENTIT[ÉE]/i,
  /CARTA\s+D[''']IDENTIT[ÀA]/i,
  /IDENTITY\s+CARD/i
];
const SUPPORTING = [
  /SCHWEIZERISCHE\s+EIDGENOSSENSCHAFT/i,
  /CONF[EÉ]D[EÉ]RATION\s+SUISSE/i,
  /CONFEDERAZIONE\s+SVIZZERA/i,
  /SWISS\s+CONFEDERATION/i
];

export default {
  id: 'swiss-id',
  label: 'Schweizer Identitätskarte',
  docType: 'Swiss Identity Card',
  priority: 30,

  detect (ctx) {
    const strong = countMatches(ctx.upper, STRONG) > 0;
    const hasCheMrzId =
      ctx.mrz.parsed && ctx.mrz.parsed.country === 'CHE' &&
      /^I/.test(ctx.mrz.candidates[0] || '');
    if (!strong && !hasCheMrzId) return 0;
    let score = strong ? 0.55 : 0;
    if (hasCheMrzId) score += 0.4;
    score += countMatches(ctx.upper, SUPPORTING) * 0.05;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};

    /* Heimatort / Lieu d'origine / Luogo d'attinenza */
    const heimat = valueAfterLabels(
      txt,
      'Heimatort|Lieu\\s*d[ae]?\\s*origine|Luogo\\s*d[aei]?\\s*attinenza|Place\\s*of\\s*origin'
    );
    if (heimat) f.placeOfOrigin = heimat;

    /* Behörde */
    const auth = valueAfterLabels(
      txt,
      'Beh[öo]rde|Autorit[eé]|Autorit[àa]|Authority|Autoritad'
    );
    if (auth) f.authority = auth;

    /* Grösse / Taille / Statura */
    const ht = txt.match(/(?:Gr[öo]sse|Taille|Statura|Height)[^\n]{0,20}\n?\s*(\d{3})\s*cm/i);
    if (ht) f.height = ht[1] + ' cm';

    /* Dokumentnummer: Schweizer ID-Karten haben 7-8 alphanumerische Zeichen */
    if (!f.docNumber) {
      const m = rawAfterLabels(txt, 'Dokument(?:en)?[-\\s]*Nr\\.?|Document\\s*No\\.?|N[oº]?\\s*document');
      if (m) {
        const cleaned = m.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (/[0-9]/.test(cleaned) && cleaned.length >= 6) f.docNumber = cleaned.slice(0, 12);
      }
    }

    /* Schweiz als Nationalität/Herkunftsland setzen, falls nicht via MRZ schon da */
    if (!f.nationality) f.nationality = 'CHE';
    if (!f.country) f.country = 'CHE';

    return f;
  }
};
