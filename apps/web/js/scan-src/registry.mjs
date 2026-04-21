/**
 * Profil-Registry + Runner.
 *
 * Jedes Profil exportiert ein Objekt der Form:
 *
 *   {
 *     id: 'swiss-id',
 *     label: 'Swiss ID Card',
 *     docType: 'Identity Card',
 *     priority?: number,       // höher = wird früher ausgewertet, default 0
 *     detect(ctx): number      // 0..1 Zuversicht, dass das Profil greift
 *     extract(ctx): object     // extrahierte Felder (surname, givenNames, …)
 *   }
 *
 * Der Runner sortiert nach Score × Priority, wendet die Top-Profile an und
 * merged die gefundenen Felder. MRZ (wenn vorhanden) liefert den Grundstock.
 */

import { buildMrzContext } from './mrz.mjs';
import { COUNTRY_CODES } from './utils.mjs';

/** Minimal-Confidence, damit ein Profil überhaupt extract() ausführen darf. */
const DETECT_THRESHOLD = 0.15;

const profiles = [];

export function registerProfile (profile) {
  if (!profile || typeof profile.detect !== 'function' || typeof profile.extract !== 'function') {
    throw new Error('Profil benötigt detect() + extract()');
  }
  profiles.push(profile);
}

export function getProfiles () {
  return profiles.slice();
}

/** Plausibilitätsprüfung für ein MRZ-Parsing-Ergebnis. */
function isPlausibleMrz (parsed) {
  if (!parsed) return false;
  const country = String(parsed.country || '');
  const docNumber = String(parsed.docNumber || '');
  if (!/^[A-Z]{3}$/.test(country)) return false;
  if (docNumber.length < 5) return false;
  if (!/[A-Z0-9]/.test(docNumber)) return false;
  return true;
}

function buildContext (rawText) {
  const text = String(rawText || '');
  const upper = text.toUpperCase();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const linesUpper = upper.split('\n').map(l => l.trim()).filter(Boolean);
  const mrz = buildMrzContext(text);
  /* Falls MRZ zwar „irgendetwas" geparst hat, aber offensichtlich unplausibel
     ist, entfernen wir es aus dem Kontext. Das verhindert, dass generische
     Textzeilen als Dok-Nr/Land eingeführt werden. */
  if (mrz.parsed && !isPlausibleMrz(mrz.parsed)) {
    mrz.parsed = null;
    mrz.raw = null;
  }
  const re = new RegExp('\\b(' + COUNTRY_CODES.join('|') + ')\\b', 'g');
  const countries = [...new Set([...upper.matchAll(re)].map(m => m[1]))];
  return { text, upper, lines, linesUpper, mrz, countries };
}

/**
 * Führt die registrierten Profile aus und konsolidiert die Felder.
 * @param {string} rawText
 * @returns {object} Felder inkl. `_mrz`, `_profile`, `_profileScore`
 */
/** Felder, bei denen das höchstbewertete Profil den MRZ-Default überschreiben darf. */
const OVERRIDABLE = new Set(['docType']);

export function extractFields (rawText) {
  const ctx = buildContext(rawText);
  const result = {};

  /* MRZ-Basis (rohe Felder inkl. generischem docType = „Passport" o. ä.) */
  if (ctx.mrz.parsed) Object.assign(result, ctx.mrz.parsed);
  result._mrz = ctx.mrz.raw;

  /* Scoring */
  const scored = profiles
    .map(p => {
      let score = 0;
      try {
        score = Number(p.detect(ctx)) || 0;
      } catch (_) {
        score = 0;
      }
      const prio = typeof p.priority === 'number' ? p.priority : 0;
      return { p, score, prio, weighted: score + prio * 0.01 };
    })
    .filter(s => s.score >= DETECT_THRESHOLD)
    .sort((a, b) => b.weighted - a.weighted);

  /* Extraktion: primary darf OVERRIDABLE-Felder überschreiben, Nachfolger nur
     leere Felder füllen. */
  let primary = null;
  for (const s of scored) {
    let fields;
    try {
      fields = s.p.extract(ctx) || {};
    } catch (_) {
      fields = {};
    }
    const isPrimary = !primary;
    for (const k of Object.keys(fields)) {
      const v = fields[k];
      if (v == null || v === '') continue;
      const isEmpty = result[k] == null || result[k] === '';
      if (isEmpty || (isPrimary && OVERRIDABLE.has(k))) {
        result[k] = v;
      }
    }
    if (!primary) primary = s;
  }

  /* Profile-Meta + statischer DocType-Override:
     Ein primäres Profil überschreibt den generischen MRZ-Standardwert
     („Passport") durch sein freundliches Label. */
  if (primary) {
    result._profile = primary.p.id;
    result._profileScore = Math.round(primary.score * 100) / 100;
    if (primary.p.docType) result.docType = primary.p.docType;
  }

  return result;
}
