/**
 * Generisches MRZ-Profil.
 *
 * Wenn die MRZ-Normalisierung im Kontext bereits eine TD1/TD2/TD3-Struktur
 * erkannt hat, reicht dieses Profil die Felder durch und identifiziert den
 * Dokumenttyp. Fängt damit praktisch alle weltweit ausgestellten ICAO-9303-
 * konformen Pässe und ID-Karten ab — unabhängig vom Layout.
 *
 * Zusätzlich wird das freundliche Länder-Label gesetzt (z. B. „Deutscher
 * Reisepass" statt „Passport"), ohne dass ein eigenes Länderprofil nötig ist.
 */

import { friendlyDocLabel } from '../country-labels.mjs';

export default {
  id: 'generic-mrz',
  label: 'Machine-readable document',
  docType: null,
  priority: 10,

  detect (ctx) {
    const mrz = ctx.mrz.parsed;
    if (!mrz) return 0;
    /* Sanity: MRZ muss mindestens Ländercode + Dok-Nr liefern, sonst ist
       es wahrscheinlich eine falsch erkannte Textzeile. */
    const hasCountry = /^[A-Z]{3}$/.test(String(mrz.country || ''));
    const hasDocNo = /[A-Z0-9]/.test(String(mrz.docNumber || '')) && String(mrz.docNumber || '').length >= 5;
    if (!hasCountry || !hasDocNo) return 0.15;
    if (ctx.mrz.candidates.length >= 3) return 0.95;
    return 0.85;
  },

  extract (ctx) {
    const mrz = ctx.mrz.parsed;
    if (!mrz) return {};
    return {
      docType: friendlyDocLabel(mrz.country, mrz.docType)
    };
  }
};
