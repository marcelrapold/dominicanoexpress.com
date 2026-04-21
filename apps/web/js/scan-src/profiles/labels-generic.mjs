/**
 * Generisches Label-Profil (multilingual).
 *
 * Greift als Rückfall, wenn kein spezifisches Profil stark matcht. Kennt
 * Beschriftungen in DE/EN/FR/IT/ES und extrahiert Name, Vorname, Geburtsdatum,
 * Ausstellungs-/Ablaufdatum, Geschlecht, Nationalität, Behörde.
 */
import {
  valueAfterLabels,
  findDates,
  findDateAfterLabel
} from '../utils.mjs';

const SUR_RE =
  'Surname|Nachname|Name(?=\\s*\\d|\\s*1\\.)|Nom(?![a-z])|Cognome|Apellidos?|Apellido|Family\\s*name';
const GIV_RE =
  'Given\\s*names?|Vornamen?|Prénoms?|Prenom|Nombres?|Nome(?![a-z])|Forename|Other\\s*names?';
const NAT_RE = 'Nationality|Nationalit|Naziunalitad|Staatsangeh|Nacionalidad';
const DOB_RE = 'Date\\s*of\\s*birth|Geburtsdatum|Date\\s*de\\s*naissance|Data\\s*di\\s*nascita|Fecha\\s*de\\s*nacimiento';
const ISSUE_RE = 'Date\\s*of\\s*issue|Ausgestellt|Ausstellungsdatum|D[eé]livr[eé]|Rilasciato|Emess\\s*ils|Fecha\\s*de\\s*expedici[oó]n|Fecha\\s*de\\s*emisi[oó]n';
const EXPIRY_RE = 'Date\\s*of\\s*expiry|Ablaufdatum|G[üu]ltig\\s*bis|Expiration|Scadenza|Data\\s*da\\s*scadenza|Fecha\\s*de\\s*(?:vencimiento|caducidad|expiraci[oó]n)';
const SEX_RE = 'Sex|Geschlecht|Sexe|Sesso|Schlattaina|Sexo';
const AUTH_RE = 'Authority|Beh[öo]rde|Autorit[eéa]|Autoritad|Autoridad';
const DOC_NR_RE =
  'Passport\\s*No\\.?|Passeport\\s*N|Passaporto\\s*N|Pass-?Nr\\.?|Dokument(?:en)?[-\\s]*Nr\\.?|No\\.?\\s*d[eu]\\s*(?:documento|passeport)|N[uú]mero(?:\\s*de)?\\s*(?:documento|pasaporte)';

export default {
  id: 'generic-labels',
  label: 'Generic (labels)',
  docType: null,
  priority: -5,

  detect (ctx) {
    /* Immer latent bereit, aber nur als leichte Ergänzung. */
    return 0.4;
  },

  extract (ctx) {
    const txt = ctx.text;
    const f = {};

    const sur = valueAfterLabels(txt, SUR_RE);
    if (sur && sur.length > 1 && sur.length < 50) f.surname = sur;

    const giv = valueAfterLabels(txt, GIV_RE);
    if (giv && giv.length > 1 && giv.length < 80) f.givenNames = giv;

    const nat = valueAfterLabels(txt, NAT_RE);
    if (nat && nat.length < 60) f.nationality = nat;

    const authM = txt.match(new RegExp('(?:' + AUTH_RE + ')[^\\n]{0,40}\\n([^\\n]{2,50})', 'i'));
    if (authM) f.authority = authM[1].replace(/[▲◄►▼▸◂•]/g, '').trim();

    const dob = findDateAfterLabel(txt, DOB_RE);
    if (dob) f.dob = dob;
    const issued = findDateAfterLabel(txt, ISSUE_RE);
    if (issued) f.issued = issued;
    const expiry = findDateAfterLabel(txt, EXPIRY_RE);
    if (expiry) f.expiry = expiry;

    const sexM = txt.match(new RegExp('(?:' + SEX_RE + ')[^\\n]{0,30}\\n?\\s*([MFmf])\\b', 'i'));
    if (sexM) f.sex = sexM[1].toUpperCase();

    /* Dok-Nr.: bevorzugt aus explizit beschriftetem Kontext; sonst ein
       kleiner Plausibilitätscheck (enthält Ziffer, kein Alltagswort). */
    const labeled = txt.match(new RegExp('(?:' + DOC_NR_RE + ')[^A-Z0-9]{0,6}([A-Z0-9]{6,12})', 'i'));
    if (labeled) f.docNumber = labeled[1].toUpperCase();

    /* Datumskette als letzter Ausweg — NUR für DOB (issue/expiry blind
       zuzuordnen produziert falsche Treffer, wenn es im Layout nicht ≥ 3
       Datumsfelder gibt). */
    if (!f.dob) {
      const ds = findDates(txt);
      if (ds[0]) f.dob = ds[0];
    }

    const htM = txt.match(/(\d{3})\s*cm\b/i);
    if (htM) f.height = htM[1] + ' cm';

    return f;
  }
};
