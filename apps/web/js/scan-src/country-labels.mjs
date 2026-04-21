/**
 * Freundliche Dokumenttyp-Labels pro Land.
 *
 * Wird von `generic-mrz` benutzt, damit ein MRZ-erkannter Pass/ID automatisch
 * ein länderspezifisches, menschenlesbares Label bekommt — auch wenn kein
 * explizites Länderprofil registriert ist.
 *
 * Der Generic-Eintrag liefert „Passport / National ID Card" als Fallback.
 */

export const COUNTRY_NAMES = {
  CHE: 'Schweiz',    DEU: 'Deutschland', AUT: 'Österreich',    LIE: 'Liechtenstein',
  USA: 'USA',        GBR: 'Grossbritannien', FRA: 'Frankreich', ITA: 'Italien',
  ESP: 'Spanien',    NLD: 'Niederlande', BEL: 'Belgien',       POL: 'Polen',
  TUR: 'Türkei',     CAN: 'Kanada',      AUS: 'Australien',    CHN: 'China',
  JPN: 'Japan',      BRA: 'Brasilien',   MEX: 'Mexiko',        IND: 'Indien',
  RUS: 'Russland',   DOM: 'Dominikanische Republik', HTI: 'Haiti',
  VEN: 'Venezuela',  COL: 'Kolumbien',   PRI: 'Puerto Rico',   CUB: 'Kuba',
  JAM: 'Jamaika',    ARG: 'Argentinien', CHL: 'Chile',         PER: 'Peru',
  ECU: 'Ecuador',    BOL: 'Bolivien',    URY: 'Uruguay',       PRY: 'Paraguay',
  PAN: 'Panamá',     CRI: 'Costa Rica',  GTM: 'Guatemala',     HND: 'Honduras',
  NIC: 'Nicaragua',  SLV: 'El Salvador'
};

/**
 * Länderspezifische Labels.
 *   passport: Label für Reisepässe
 *   id:       Label für Personalausweise
 */
const PROFILES = {
  CHE: { passport: 'Schweizer Reisepass',     id: 'Schweizer Identitätskarte' },
  DEU: { passport: 'Deutscher Reisepass',     id: 'Deutscher Personalausweis' },
  AUT: { passport: 'Österreichischer Reisepass', id: 'Österreichischer Personalausweis' },
  LIE: { passport: 'Liechtensteiner Pass',    id: 'Liechtensteiner Identitätskarte' },
  USA: { passport: 'US Passport',             id: 'US ID' },
  GBR: { passport: 'British Passport',        id: 'UK ID Card' },
  FRA: { passport: 'Passeport Français',      id: 'Carte Nationale d’Identité' },
  ITA: { passport: 'Passaporto Italiano',     id: 'Carta d’Identità Italiana' },
  ESP: { passport: 'Pasaporte Español',       id: 'DNI Español' },
  NLD: { passport: 'Nederlands Paspoort',     id: 'Nederlandse ID-kaart' },
  BEL: { passport: 'Belgisch Paspoort',       id: 'Belgische eID' },
  POL: { passport: 'Paszport Polski',         id: 'Polski Dowód Osobisty' },
  TUR: { passport: 'Türk Pasaportu',          id: 'Türk Kimlik Kartı' },
  DOM: { passport: 'Pasaporte Dominicano',    id: 'Cédula Dominicana' },
  HTI: { passport: 'Passeport Haïtien',       id: 'Carte d’Identité Nationale' },
  VEN: { passport: 'Pasaporte Venezolano',    id: 'Cédula Venezolana' },
  COL: { passport: 'Pasaporte Colombiano',    id: 'Cédula Colombiana' },
  MEX: { passport: 'Pasaporte Mexicano',      id: 'INE / IFE' },
  ARG: { passport: 'Pasaporte Argentino',     id: 'DNI Argentino' },
  CHL: { passport: 'Pasaporte Chileno',       id: 'RUT / Cédula Chilena' },
  PER: { passport: 'Pasaporte Peruano',       id: 'DNI Peruano' },
  BRA: { passport: 'Passaporte Brasileiro',   id: 'RG Brasileiro' }
};

/**
 * Liefert ein sprechendes Label basierend auf Land + Dokumenttyp.
 * Fällt auf den generischen Dokumenttyp zurück, wenn keine Spezialisierung
 * vorhanden ist.
 *
 * @param {string} country    ISO-3 Ländercode, z. B. „DEU"
 * @param {string} docType    „Passport" | „National ID Card" | „Identity Card"
 * @returns {string}
 */
export function friendlyDocLabel (country, docType) {
  const entry = PROFILES[String(country || '').toUpperCase()];
  const isPass = /passport/i.test(String(docType || ''));
  const isId = /id|identity/i.test(String(docType || ''));
  if (entry) {
    if (isPass && entry.passport) return entry.passport;
    if (isId && entry.id) return entry.id;
  }
  const countryName = COUNTRY_NAMES[country] || country || '';
  if (isPass) return countryName ? `${countryName} Pass` : 'Passport';
  if (isId) return countryName ? `${countryName} ID` : 'National ID Card';
  return docType || 'Document';
}
