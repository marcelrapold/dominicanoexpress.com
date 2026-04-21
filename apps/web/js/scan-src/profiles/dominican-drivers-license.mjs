/**
 * Licencia de Conducir (República Dominicana).
 *
 * Keine MRZ. Die Lizenznummer ist i. d. R. numerisch (9–11 Ziffern).
 * Das Layout hat „REPÚBLICA DOMINICANA" und „LICENCIA DE CONDUCIR" als
 * starke Marker.
 */

import { valueAfterLabels, findDates, findDateAfterLabel, countMatches } from '../utils.mjs';

const STRONG = /LICENCIA\s+DE\s+CONDUCIR/i;
const SUPPORTING = [
  /REP[UÚ]BLICA\s+DOMINICANA/i,
  /INTRANT/i,
  /AMET/i
];

export default {
  id: 'dominican-drivers-license',
  label: 'Licencia de Conducir RD',
  docType: 'Dominican Driver’s License',
  priority: 32,

  detect (ctx) {
    /* Harte Voraussetzung: „Licencia de Conducir" muss vorkommen. Sonst
       liefert das Profil nur Rauschen (alle dominikanischen Dokumente
       teilen „REPÚBLICA DOMINICANA"). */
    if (!STRONG.test(ctx.upper)) return 0;
    let score = 0.5 + countMatches(ctx.upper, SUPPORTING) * 0.1;
    if (/\bCategor[ií]a\b|\bTipo\b/i.test(ctx.text)) score += 0.1;
    if (ctx.mrz.parsed) score *= 0.3;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};

    const sur = valueAfterLabels(txt, 'Apellidos?|APELLIDOS');
    if (sur) f.surname = sur;
    const giv = valueAfterLabels(txt, 'Nombres?|NOMBRES');
    if (giv) f.givenNames = giv;

    /* Lizenznummer / Cédula-basierte Nummer */
    const nrM =
      txt.match(/(?:Licencia|N[uú]mero|No\.?)[^\n]{0,20}\n?\s*(\b[A-Z0-9\-]{8,14}\b)/i) ||
      txt.match(/\b(\d{3}-\d{7}-\d)\b/);
    if (nrM) f.docNumber = nrM[1].toUpperCase();

    const dob = findDateAfterLabel(txt, 'Nacimiento|Fecha\\s*de\\s*Nac');
    if (dob) f.dob = dob;
    const expiry = findDateAfterLabel(
      txt,
      'Vencimiento|Expiraci[oó]n|V[aá]lida?\\s*hasta'
    );
    if (expiry) f.expiry = expiry;

    const sexM = txt.match(/(?:Sexo|Sex)[^\n]{0,20}\n?\s*([MFmf])\b/i);
    if (sexM) f.sex = sexM[1].toUpperCase();

    const catM = txt.match(/(?:Categor[ií]a|Tipo)[^\n]{0,10}\n?\s*([A-Z0-9,\s]+)/i);
    if (catM) f.categories = catM[1].trim();

    const dates = findDates(txt);
    if (!f.dob && dates[0]) f.dob = dates[0];
    if (!f.issued && dates[1]) f.issued = dates[1];
    if (!f.expiry && dates[2]) f.expiry = dates[2];

    if (!f.nationality) f.nationality = 'DOM';
    if (!f.country) f.country = 'DOM';
    return f;
  }
};
