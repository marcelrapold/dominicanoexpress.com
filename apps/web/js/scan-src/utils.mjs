/**
 * Gemeinsame Helfer für Profil-Extraktoren.
 */

const NOISE_GLYPHS = /[▲◄►▼▸◂•·|⟨⟩«»<>]/g;

/**
 * Normalisiert Personen-/Ortsnamen: entfernt Rauschen, verdichtet Leerzeichen,
 * schneidet auf sinnvolle Länge.
 */
export function cleanPersonName (s) {
  if (!s) return '';
  let t = String(s).replace(/\r/g, '').split('\n')[0].replace(NOISE_GLYPHS, ' ');
  t = t
    .replace(/\b(?:M|F|X)\b\s*$/, '')
    .replace(/\s*[0-9]{6,}.*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  t = t.replace(/^[^A-Za-zÀ-ÿ]+/, '').replace(/[^A-Za-zÀ-ÿ\s'\-]+$/, '');
  return t.slice(0, 90);
}

/**
 * Bekannte Label-Wörter, die auf einer Ausweiszeile neben einem Label stehen
 * können — z. B. „Name / Nom / Cognome" — aber NIE der eigentliche Wert sind.
 */
const LABEL_TOKENS = /^(?:name|nom|cognome|apellidos?|surname|family|vorname|prénoms?|prenom|nombres?|nome|given|forename|nationality|nationalit|staatsangeh|sex|sexe|sesso|geschlecht|date|fecha|fecha|lugar|place|heimatort|lieu|origine|luogo|attinenza|gr[öo]sse|taille|statura|height|birth|naissance|nacimiento|passport|passeport|pasaporte|n[°º]|no\.?|nr\.?)\b/i;

/**
 * Wert hinter einem Label finden — bevorzugt auf derselben Zeile (mit Separator
 * wie `:`); bei Multi-Sprach-Labels ohne Trenner („Name / Nom / Cognome") fällt
 * die Methode automatisch auf die Fortsetzungszeile zurück.
 */
export function valueAfterLabels (txt, labelRegex) {
  const block = (txt || '').replace(/\r\n/g, '\n');

  /* Variante A: sameLine MIT Separator (:/·/|) — stark vertraut */
  const sameLineSep = new RegExp(
    '(?:' + labelRegex + ')[^\\S\\n]{0,6}[:·|][^\\S\\n]{0,4}([^\\n]+)',
    'im'
  );
  let m = block.match(sameLineSep);
  if (m && m[1]) {
    const v = cleanPersonName(m[1]);
    if (v && !LABEL_TOKENS.test(v)) return v;
  }

  /* Variante B: Fortsetzungszeile */
  const nextLine = new RegExp('(?:' + labelRegex + ')[^\\n]{0,72}\\n([^\\n]+)', 'im');
  m = block.match(nextLine);
  if (m && m[1]) {
    const v = cleanPersonName(m[1]);
    if (v && !LABEL_TOKENS.test(v)) return v;
  }

  /* Variante C: sameLine OHNE Separator — nur wenn Wert klar aussieht */
  const sameLinePlain = new RegExp(
    '(?:' + labelRegex + ')[^\\S\\n]{1,6}([A-ZÀ-Ÿ][^\\n]{1,80})',
    'im'
  );
  m = block.match(sameLinePlain);
  if (m && m[1]) {
    const v = cleanPersonName(m[1]);
    if (v && !LABEL_TOKENS.test(v)) return v;
  }

  return '';
}

/** Wert hinter einem Label, aber ohne Namen-Säuberung (für Nummern/Codes). */
export function rawAfterLabels (txt, labelRegex) {
  const block = (txt || '').replace(/\r\n/g, '\n');
  const sameLine = new RegExp(
    '(?:' + labelRegex + ')[^\\S\\n]{0,6}[:·|]{0,2}[^\\S\\n]{0,4}([^\\n]+)',
    'im'
  );
  let m = block.match(sameLine);
  if (m && m[1]) return m[1].trim();
  const nextLine = new RegExp('(?:' + labelRegex + ')[^\\n]{0,72}\\n([^\\n]+)', 'im');
  m = block.match(nextLine);
  return m && m[1] ? m[1].trim() : '';
}

/** `dd.MM.yyyy` / `dd/MM/yyyy` → `dd.MM.yyyy`. */
export function normalizeDate (s) {
  return String(s || '').trim().replace(/[\s/-]/g, '.').replace(/\.\.+/g, '.');
}

/** Alle Datumsvorkommen (dd.mm.yyyy) in Leserichtung. */
export function findDates (txt) {
  return [...String(txt || '').matchAll(/\b(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})\b/g)].map(m =>
    normalizeDate(m[1])
  );
}

/**
 * Sucht das erste Datum, das nach einem Label (als Regex-Quelltext) auftaucht.
 * Verwendet Wortgrenzen, damit „15.03.1985" nicht als „5.03.1985" gelesen wird.
 * @param {string} txt
 * @param {string} labelRegex  Quelltext ohne Flags (wird case-insensitive genutzt)
 * @returns {string|null}
 */
export function findDateAfterLabel (txt, labelRegex) {
  const re = new RegExp(
    '(?:' + labelRegex + ')[^\\n]{0,60}?\\b(\\d{1,2}[\\s./-]\\d{2}[\\s./-]\\d{4})\\b',
    'i'
  );
  const m = String(txt || '').match(re);
  return m ? normalizeDate(m[1]) : null;
}

/** ISO-3-Ländercodes, die das System kennt. */
export const COUNTRY_CODES = [
  'CHE', 'DEU', 'AUT', 'LIE', 'USA', 'GBR', 'FRA', 'ITA', 'ESP', 'NLD', 'BEL',
  'POL', 'TUR', 'CAN', 'AUS', 'CHN', 'JPN', 'BRA', 'MEX', 'IND', 'RUS', 'DOM',
  'HTI', 'VEN', 'COL', 'PRI', 'CUB', 'JAM', 'ARG', 'CHL', 'PER', 'ECU', 'BOL',
  'URY', 'PRY', 'PAN', 'CRI', 'GTM', 'HND', 'NIC', 'SLV'
];

/** Erkennt erste plausible ISO-Ländercodes im Freitext. */
export function findCountryCodes (txt) {
  const re = new RegExp('\\b(' + COUNTRY_CODES.join('|') + ')\\b', 'g');
  const hits = [...String(txt || '').toUpperCase().matchAll(re)].map(m => m[1]);
  return [...new Set(hits)];
}

/** Hält Scores zwischen 0 und 1. */
export function clamp01 (n) {
  return Math.max(0, Math.min(1, n));
}

/** Zählt wie viele Pattern in einem Text matchen (Regex- oder String-Pattern). */
export function countMatches (txt, patterns) {
  let n = 0;
  for (const p of patterns) {
    if (p instanceof RegExp) {
      if (p.test(txt)) n++;
    } else if (typeof p === 'string') {
      if (txt.includes(p)) n++;
    }
  }
  return n;
}
