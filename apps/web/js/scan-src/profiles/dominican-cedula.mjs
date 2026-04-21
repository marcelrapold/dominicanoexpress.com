/**
 * Cédula de Identidad y Electoral (República Dominicana).
 *
 * Keine MRZ. Der eindeutige Marker ist die Cédula-Nummer im Format
 * `XXX-XXXXXXX-X` (3-7-1 Ziffern mit Bindestrich). Das Layout enthält
 * typischerweise:
 *   - REPÚBLICA DOMINICANA / JUNTA CENTRAL ELECTORAL
 *   - CÉDULA DE IDENTIDAD Y ELECTORAL
 *   - Nombres / Apellidos
 *   - Fecha de Nacimiento / Sexo
 *   - Lugar de Nacimiento
 *   - Fecha de Expiración
 */

import { valueAfterLabels, countMatches, findDateAfterLabel } from '../utils.mjs';

const CEDULA_RE = /\b(\d{3}[-\s]?\d{7}[-\s]?\d)\b/;

const MARKERS = [
  /REP[UÚ]BLICA\s+DOMINICANA/i,
  /JUNTA\s+CENTRAL\s+ELECTORAL/i,
  /C[EÉ]DULA\s+DE\s+IDENTIDAD\s+Y\s+ELECTORAL/i,
  /IDENTIFICACI[OÓ]N\s+PERSONAL/i
];

export default {
  id: 'dominican-cedula',
  label: 'Cédula Dominicana',
  docType: 'Dominican Cédula',
  priority: 40,

  detect (ctx) {
    let score = countMatches(ctx.upper, MARKERS) * 0.28;
    if (CEDULA_RE.test(ctx.text)) score += 0.6;
    if (ctx.countries.includes('DOM')) score += 0.1;
    /* Passport-MRZ sollte dieses Profil nicht triggern */
    if (ctx.mrz.parsed && ctx.mrz.parsed.docType === 'Passport') score *= 0.3;
    return Math.min(1, score);
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};

    const cedulaM = txt.match(CEDULA_RE);
    if (cedulaM) {
      /* Normalisieren: 001-1234567-8 */
      const digits = cedulaM[1].replace(/\D/g, '');
      if (digits.length === 11) {
        f.docNumber = `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
      } else {
        f.docNumber = cedulaM[1].trim();
      }
    }

    const sur = valueAfterLabels(txt, 'Apellidos?|APELLIDOS');
    if (sur) f.surname = sur;
    const giv = valueAfterLabels(txt, 'Nombres?|NOMBRES');
    if (giv) f.givenNames = giv;

    const dob = findDateAfterLabel(txt, 'Fecha\\s*de\\s*Nacimiento|NACIMIENTO');
    if (dob) f.dob = dob;
    const expiry = findDateAfterLabel(
      txt,
      'Fecha\\s*de\\s*(?:Expiraci[oó]n|Vencimiento|Caducidad)'
    );
    if (expiry) f.expiry = expiry;

    const sexM = txt.match(/(?:Sexo|Sex)[^\n]{0,20}\n?\s*([MFmf])\b/i);
    if (sexM) f.sex = sexM[1].toUpperCase();

    const place = valueAfterLabels(txt, 'Lugar\\s*de\\s*Nacimiento');
    if (place) f.placeOfOrigin = place;

    if (!f.nationality) f.nationality = 'DOM';
    if (!f.country) f.country = 'DOM';
    return f;
  }
};
