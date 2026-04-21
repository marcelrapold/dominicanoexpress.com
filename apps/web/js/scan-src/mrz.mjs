/**
 * MRZ-Handling: Normalisierung, TD1/TD2/TD3-Parsing.
 *
 * OCR verwechselt Füllzeichen häufig (»«, ‹›, Klammern, Bindestriche etc.).
 * Wir klopfen das zu `<` zurück, bevor wir eine Zeile als MRZ akzeptieren.
 */

/**
 * Typische OCR-Verwechslungen mit dem MRZ-Füllzeichen `<`.
 * Bewusst KEINE Whitespace-Konvertierung — normale Textzeilen haben viele
 * Spaces und würden sonst fälschlich als MRZ erkannt.
 */
const FILLER_EQUIVALENTS = /[«»‹›()[\]{}]/;

export function normalizeMrzLine (line) {
  if (!line) return '';
  const up = String(line).toUpperCase();
  let out = '';
  for (const ch of up) {
    if (/[A-Z0-9<]/.test(ch)) {
      out += ch;
    } else if (FILLER_EQUIVALENTS.test(ch)) {
      out += '<';
    }
    /* Sonstige Zeichen (Leerzeichen, Interpunktion) fallen raus. */
  }
  return out;
}

/**
 * Findet in normalisierten Zeilen die MRZ-Kandidaten.
 * @returns {string[]}
 */
export function findMrzCandidates (normalizedLines) {
  const raw = normalizedLines.filter(
    l => l.length >= 28 && (l.match(/</g) || []).length >= 2
  );
  /* Pass-Startzeile „P<XXX..." explizit priorisieren, aber erst bei ausreichender
     Länge — sonst greift die Heuristik bei Überschriften wie „PASSPORT". */
  const hasP = normalizedLines.find(l =>
    l.length >= 30 && /^P[<K][A-Z]{3}/.test(l)
  );
  if (hasP && !raw.includes(hasP)) raw.unshift(hasP);
  return raw;
}

export function parseMRZ (lines) {
  const cl = l => l.replace(/[^A-Z0-9<]/g, '');
  const L = lines.map(cl);

  /* TD3 (Pass) — zwei Zeilen, erste startet mit P<XXX und ist ≥ 30 Zeichen */
  const passIdx = L.findIndex(l => l.length >= 30 && /^P[<K][A-Z]{3}/.test(l));
  if (passIdx !== -1) {
    const l1 = L[passIdx];
    const l2 = L.slice(passIdx + 1).find(
      l => l.length >= 30 && /^[A-Z0-9<]+$/.test(l) && /\d{6}/.test(l)
    );
    if (l1 && l2) return parseTD3(l1, l2);
  }

  /* TD3 fallback */
  const td3 = L.filter(l => l.length >= 40);
  if (td3.length >= 2 && /^P/.test(td3[0])) return parseTD3(td3[0], td3[1]);

  /* TD2 (2 × 36 Zeichen, z. B. alte ID-Karten) */
  const td2 = L.filter(l => l.length >= 34 && l.length < 42);
  if (td2.length >= 2) {
    const id = td2[0];
    if (/^[IACP][A-Z<]/.test(id)) return parseTD2(td2[0], td2[1]);
  }

  /* TD1 (3 × 30 Zeichen, ID-1 ID-Karten) */
  const td1 = L.filter(l => l.length >= 28);
  if (td1.length >= 3 && /^[IAC][A-Z<]/.test(td1[0])) {
    return parseTD1(td1[0], td1[1], td1[2]);
  }
  if (td1.length >= 3) return parseTD1(td1[0], td1[1], td1[2]);
  if (td1.length >= 2) return parseTD1(td1[0], td1[1], '');
  return null;
}

function parseTD1 (l1, l2, l3) {
  return {
    docType: 'National ID Card',
    country: normalizeCountryCode(l1.substring(2, 5)),
    docNumber: l1.substring(5, 14).replace(/</g, ''),
    dob: mrzDate(l2.substring(0, 6)),
    sex: normalizeSex(l2[7]),
    expiry: mrzDate(l2.substring(8, 14)),
    nationality: normalizeCountryCode(l2.substring(15, 18)),
    surname: splitName(l3)[0],
    givenNames: splitName(l3)[1]
  };
}

function parseTD2 (l1, l2) {
  const nameStart = 5;
  const namePart = l1.substring(nameStart).replace(/<{2,}/g, '|').replace(/<+$/, '');
  const parts = namePart.split('|');
  return {
    docType: 'Identity Card',
    country: normalizeCountryCode(l1.substring(2, 5)),
    surname: (parts[0] || '').replace(/</g, ' ').trim(),
    givenNames: (parts[1] || '').replace(/</g, ' ').trim(),
    docNumber: l2.substring(0, 9).replace(/</g, ''),
    nationality: normalizeCountryCode(l2.substring(10, 13)),
    dob: mrzDate(l2.substring(13, 19)),
    sex: normalizeSex(l2[20]),
    expiry: mrzDate(l2.substring(21, 27))
  };
}

/** Einzelbuchstaben-Ländercodes (z. B. `D<<` = Deutschland) auf ISO-3 mappen. */
const SINGLE_LETTER_COUNTRY = { D: 'DEU' };

function normalizeCountryCode (raw) {
  const code = String(raw || '').replace(/</g, '');
  if (code.length === 3) return code;
  if (code.length === 1 && SINGLE_LETTER_COUNTRY[code]) return SINGLE_LETTER_COUNTRY[code];
  return code;
}

function parseTD3 (l1, l2) {
  const [surname, givenNames] = splitName(l1.substring(5));
  return {
    docType: 'Passport',
    country: normalizeCountryCode(l1.substring(2, 5)),
    surname,
    givenNames,
    docNumber: l2.substring(0, 9).replace(/</g, ''),
    nationality: normalizeCountryCode(l2.substring(10, 13)),
    dob: mrzDate(l2.substring(13, 19)),
    sex: normalizeSex(l2[20]),
    expiry: mrzDate(l2.substring(21, 27))
  };
}

function splitName (s) {
  const parts = String(s || '').split('<<');
  return [
    (parts[0] || '').replace(/</g, ' ').trim(),
    (parts[1] || '').replace(/</g, ' ').trim()
  ];
}

function normalizeSex (c) {
  if (!c) return null;
  if (c === 'M' || c === 'F') return c;
  if (c === '<') return null;
  return c;
}

function mrzDate (s) {
  if (!s || s.length < 6 || s.includes('<')) return null;
  const yy = +s.slice(0, 2);
  const mm = +s.slice(2, 4);
  const dd = +s.slice(4, 6);
  if (isNaN(yy + mm + dd)) return null;
  const yr = yy > 30 ? 1900 + yy : 2000 + yy;
  return `${String(dd).padStart(2, '0')}.${String(mm).padStart(2, '0')}.${yr}`;
}

/**
 * Baut die MRZ-Sektion eines Kontexts: Rohtext → normalisierte Kandidaten →
 * geparste Felder (sofern erkennbar).
 */
export function buildMrzContext (rawText) {
  const rawLines = String(rawText || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const normalized = rawLines.map(normalizeMrzLine);
  const candidates = findMrzCandidates(normalized);
  const parsed = candidates.length >= 2 ? parseMRZ(candidates) : null;
  return {
    candidates,
    parsed,
    raw: candidates.length >= 2 ? candidates.slice(0, 3) : null
  };
}
