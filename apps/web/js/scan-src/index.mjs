/**
 * Bundle-Entry: registriert alle mitgelieferten Profile und exponiert eine
 * schlanke API auf `window.ScanProfiles`.
 *
 * Nutzer des Moduls:
 *   window.ScanProfiles.extractFields(rawText)       → Feld-Objekt
 *   window.ScanProfiles.registerProfile(profile)     → Drittprofil anhängen
 *   window.ScanProfiles.getProfiles()                → Diagnose
 *
 * Profile werden in `profiles/*.mjs` verwaltet — jeweils ein Default-Export
 * der Form `{ id, label, docType, priority, detect, extract }`.
 */

import { registerProfile, extractFields, getProfiles } from './registry.mjs';
import { buildMrzContext, parseMRZ, normalizeMrzLine } from './mrz.mjs';

import genericMrz from './profiles/generic-mrz.mjs';
import labelsGeneric from './profiles/labels-generic.mjs';
import swissId from './profiles/swiss-id.mjs';
import swissPassport from './profiles/swiss-passport.mjs';
import swissDriversLicense from './profiles/swiss-drivers-license.mjs';
import dominicanCedula from './profiles/dominican-cedula.mjs';
import dominicanPassport from './profiles/dominican-passport.mjs';
import dominicanDriversLicense from './profiles/dominican-drivers-license.mjs';

[
  genericMrz,
  labelsGeneric,
  swissId,
  swissPassport,
  swissDriversLicense,
  dominicanCedula,
  dominicanPassport,
  dominicanDriversLicense
].forEach(registerProfile);

const api = {
  extractFields,
  registerProfile,
  getProfiles,
  _debug: {
    buildMrzContext,
    parseMRZ,
    normalizeMrzLine
  }
};

if (typeof window !== 'undefined') {
  window.ScanProfiles = api;
}

export default api;
