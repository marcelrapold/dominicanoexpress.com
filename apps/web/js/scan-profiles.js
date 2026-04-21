(() => {
  // apps/web/js/scan-src/mrz.mjs
  var FILLER_EQUIVALENTS = /[«»‹›()[\]{}]/;
  function normalizeMrzLine(line) {
    if (!line) return "";
    const up = String(line).toUpperCase();
    let out = "";
    for (const ch of up) {
      if (/[A-Z0-9<]/.test(ch)) {
        out += ch;
      } else if (FILLER_EQUIVALENTS.test(ch)) {
        out += "<";
      }
    }
    return out;
  }
  function findMrzCandidates(normalizedLines) {
    const raw = normalizedLines.filter(
      (l) => l.length >= 28 && (l.match(/</g) || []).length >= 2
    );
    const hasP = normalizedLines.find(
      (l) => l.length >= 30 && /^P[<K][A-Z]{3}/.test(l)
    );
    if (hasP && !raw.includes(hasP)) raw.unshift(hasP);
    return raw;
  }
  function parseMRZ(lines) {
    const cl = (l) => l.replace(/[^A-Z0-9<]/g, "");
    const L = lines.map(cl);
    const passIdx = L.findIndex((l) => l.length >= 30 && /^P[<K][A-Z]{3}/.test(l));
    if (passIdx !== -1) {
      const l1 = L[passIdx];
      const l2 = L.slice(passIdx + 1).find(
        (l) => l.length >= 30 && /^[A-Z0-9<]+$/.test(l) && /\d{6}/.test(l)
      );
      if (l1 && l2) return parseTD3(l1, l2);
    }
    const td3 = L.filter((l) => l.length >= 40);
    if (td3.length >= 2 && /^P/.test(td3[0])) return parseTD3(td3[0], td3[1]);
    const td2 = L.filter((l) => l.length >= 34 && l.length < 42);
    if (td2.length >= 2) {
      const id = td2[0];
      if (/^[IACP][A-Z<]/.test(id)) return parseTD2(td2[0], td2[1]);
    }
    const td1 = L.filter((l) => l.length >= 28);
    if (td1.length >= 3 && /^[IAC][A-Z<]/.test(td1[0])) {
      return parseTD1(td1[0], td1[1], td1[2]);
    }
    if (td1.length >= 3) return parseTD1(td1[0], td1[1], td1[2]);
    if (td1.length >= 2) return parseTD1(td1[0], td1[1], "");
    return null;
  }
  function parseTD1(l1, l2, l3) {
    return {
      docType: "National ID Card",
      country: l1.substring(2, 5).replace(/</g, ""),
      docNumber: l1.substring(5, 14).replace(/</g, ""),
      dob: mrzDate(l2.substring(0, 6)),
      sex: normalizeSex(l2[7]),
      expiry: mrzDate(l2.substring(8, 14)),
      nationality: l2.substring(15, 18).replace(/</g, ""),
      surname: splitName(l3)[0],
      givenNames: splitName(l3)[1]
    };
  }
  function parseTD2(l1, l2) {
    const nameStart = 5;
    const namePart = l1.substring(nameStart).replace(/<{2,}/g, "|").replace(/<+$/, "");
    const parts = namePart.split("|");
    return {
      docType: "Identity Card",
      country: l1.substring(2, 5).replace(/</g, ""),
      surname: (parts[0] || "").replace(/</g, " ").trim(),
      givenNames: (parts[1] || "").replace(/</g, " ").trim(),
      docNumber: l2.substring(0, 9).replace(/</g, ""),
      nationality: l2.substring(10, 13).replace(/</g, ""),
      dob: mrzDate(l2.substring(13, 19)),
      sex: normalizeSex(l2[20]),
      expiry: mrzDate(l2.substring(21, 27))
    };
  }
  function parseTD3(l1, l2) {
    const [surname, givenNames] = splitName(l1.substring(5));
    return {
      docType: "Passport",
      country: l1.substring(2, 5).replace(/</g, ""),
      surname,
      givenNames,
      docNumber: l2.substring(0, 9).replace(/</g, ""),
      nationality: l2.substring(10, 13).replace(/</g, ""),
      dob: mrzDate(l2.substring(13, 19)),
      sex: normalizeSex(l2[20]),
      expiry: mrzDate(l2.substring(21, 27))
    };
  }
  function splitName(s) {
    const parts = String(s || "").split("<<");
    return [
      (parts[0] || "").replace(/</g, " ").trim(),
      (parts[1] || "").replace(/</g, " ").trim()
    ];
  }
  function normalizeSex(c) {
    if (!c) return null;
    if (c === "M" || c === "F") return c;
    if (c === "<") return null;
    return c;
  }
  function mrzDate(s) {
    if (!s || s.length < 6 || s.includes("<")) return null;
    const yy = +s.slice(0, 2);
    const mm = +s.slice(2, 4);
    const dd = +s.slice(4, 6);
    if (isNaN(yy + mm + dd)) return null;
    const yr = yy > 30 ? 1900 + yy : 2e3 + yy;
    return `${String(dd).padStart(2, "0")}.${String(mm).padStart(2, "0")}.${yr}`;
  }
  function buildMrzContext(rawText) {
    const rawLines = String(rawText || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const normalized = rawLines.map(normalizeMrzLine);
    const candidates = findMrzCandidates(normalized);
    const parsed = candidates.length >= 2 ? parseMRZ(candidates) : null;
    return {
      candidates,
      parsed,
      raw: candidates.length >= 2 ? candidates.slice(0, 3) : null
    };
  }

  // apps/web/js/scan-src/utils.mjs
  var NOISE_GLYPHS = /[▲◄►▼▸◂•·|⟨⟩«»<>]/g;
  function cleanPersonName(s) {
    if (!s) return "";
    let t = String(s).replace(/\r/g, "").split("\n")[0].replace(NOISE_GLYPHS, " ");
    t = t.replace(/\b(?:M|F|X)\b\s*$/, "").replace(/\s*[0-9]{6,}.*$/g, "").replace(/\s{2,}/g, " ").trim();
    t = t.replace(/^[^A-Za-zÀ-ÿ]+/, "").replace(/[^A-Za-zÀ-ÿ\s'\-]+$/, "");
    return t.slice(0, 90);
  }
  var LABEL_TOKENS = /^(?:name|nom|cognome|apellidos?|surname|family|vorname|prénoms?|prenom|nombres?|nome|given|forename|nationality|nationalit|staatsangeh|sex|sexe|sesso|geschlecht|date|fecha|fecha|lugar|place|heimatort|lieu|origine|luogo|attinenza|gr[öo]sse|taille|statura|height|birth|naissance|nacimiento|passport|passeport|pasaporte|n[°º]|no\.?|nr\.?)\b/i;
  function valueAfterLabels(txt, labelRegex) {
    const block = (txt || "").replace(/\r\n/g, "\n");
    const sameLineSep = new RegExp(
      "(?:" + labelRegex + ")[^\\S\\n]{0,6}[:\xB7|][^\\S\\n]{0,4}([^\\n]+)",
      "im"
    );
    let m = block.match(sameLineSep);
    if (m && m[1]) {
      const v = cleanPersonName(m[1]);
      if (v && !LABEL_TOKENS.test(v)) return v;
    }
    const nextLine = new RegExp("(?:" + labelRegex + ")[^\\n]{0,72}\\n([^\\n]+)", "im");
    m = block.match(nextLine);
    if (m && m[1]) {
      const v = cleanPersonName(m[1]);
      if (v && !LABEL_TOKENS.test(v)) return v;
    }
    const sameLinePlain = new RegExp(
      "(?:" + labelRegex + ")[^\\S\\n]{1,6}([A-Z\xC0-\u0178][^\\n]{1,80})",
      "im"
    );
    m = block.match(sameLinePlain);
    if (m && m[1]) {
      const v = cleanPersonName(m[1]);
      if (v && !LABEL_TOKENS.test(v)) return v;
    }
    return "";
  }
  function rawAfterLabels(txt, labelRegex) {
    const block = (txt || "").replace(/\r\n/g, "\n");
    const sameLine = new RegExp(
      "(?:" + labelRegex + ")[^\\S\\n]{0,6}[:\xB7|]{0,2}[^\\S\\n]{0,4}([^\\n]+)",
      "im"
    );
    let m = block.match(sameLine);
    if (m && m[1]) return m[1].trim();
    const nextLine = new RegExp("(?:" + labelRegex + ")[^\\n]{0,72}\\n([^\\n]+)", "im");
    m = block.match(nextLine);
    return m && m[1] ? m[1].trim() : "";
  }
  function normalizeDate(s) {
    return String(s || "").trim().replace(/[\s/-]/g, ".").replace(/\.\.+/g, ".");
  }
  function findDates(txt) {
    return [...String(txt || "").matchAll(/\b(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})\b/g)].map(
      (m) => normalizeDate(m[1])
    );
  }
  function findDateAfterLabel(txt, labelRegex) {
    const re = new RegExp(
      "(?:" + labelRegex + ")[^\\n]{0,60}?\\b(\\d{1,2}[\\s./-]\\d{2}[\\s./-]\\d{4})\\b",
      "i"
    );
    const m = String(txt || "").match(re);
    return m ? normalizeDate(m[1]) : null;
  }
  var COUNTRY_CODES = [
    "CHE",
    "DEU",
    "AUT",
    "LIE",
    "USA",
    "GBR",
    "FRA",
    "ITA",
    "ESP",
    "NLD",
    "BEL",
    "POL",
    "TUR",
    "CAN",
    "AUS",
    "CHN",
    "JPN",
    "BRA",
    "MEX",
    "IND",
    "RUS",
    "DOM",
    "HTI",
    "VEN",
    "COL",
    "PRI",
    "CUB",
    "JAM",
    "ARG",
    "CHL",
    "PER",
    "ECU",
    "BOL",
    "URY",
    "PRY",
    "PAN",
    "CRI",
    "GTM",
    "HND",
    "NIC",
    "SLV"
  ];
  function countMatches(txt, patterns) {
    let n = 0;
    for (const p of patterns) {
      if (p instanceof RegExp) {
        if (p.test(txt)) n++;
      } else if (typeof p === "string") {
        if (txt.includes(p)) n++;
      }
    }
    return n;
  }

  // apps/web/js/scan-src/registry.mjs
  var DETECT_THRESHOLD = 0.15;
  var profiles = [];
  function registerProfile(profile) {
    if (!profile || typeof profile.detect !== "function" || typeof profile.extract !== "function") {
      throw new Error("Profil ben\xF6tigt detect() + extract()");
    }
    profiles.push(profile);
  }
  function getProfiles() {
    return profiles.slice();
  }
  function isPlausibleMrz(parsed) {
    if (!parsed) return false;
    const country = String(parsed.country || "");
    const docNumber = String(parsed.docNumber || "");
    if (!/^[A-Z]{3}$/.test(country)) return false;
    if (docNumber.length < 5) return false;
    if (!/[A-Z0-9]/.test(docNumber)) return false;
    return true;
  }
  function buildContext(rawText) {
    const text = String(rawText || "");
    const upper = text.toUpperCase();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const linesUpper = upper.split("\n").map((l) => l.trim()).filter(Boolean);
    const mrz = buildMrzContext(text);
    if (mrz.parsed && !isPlausibleMrz(mrz.parsed)) {
      mrz.parsed = null;
      mrz.raw = null;
    }
    const re = new RegExp("\\b(" + COUNTRY_CODES.join("|") + ")\\b", "g");
    const countries = [...new Set([...upper.matchAll(re)].map((m) => m[1]))];
    return { text, upper, lines, linesUpper, mrz, countries };
  }
  function extractFields(rawText) {
    const ctx = buildContext(rawText);
    const result = {};
    if (ctx.mrz.parsed) Object.assign(result, ctx.mrz.parsed);
    result._mrz = ctx.mrz.raw;
    const scored = profiles.map((p) => {
      let score = 0;
      try {
        score = Number(p.detect(ctx)) || 0;
      } catch (_) {
        score = 0;
      }
      const prio = typeof p.priority === "number" ? p.priority : 0;
      return { p, score, prio, weighted: score + prio * 0.01 };
    }).filter((s) => s.score >= DETECT_THRESHOLD).sort((a, b) => b.weighted - a.weighted);
    let primary = null;
    for (const s of scored) {
      let fields;
      try {
        fields = s.p.extract(ctx) || {};
      } catch (_) {
        fields = {};
      }
      for (const k of Object.keys(fields)) {
        if (fields[k] == null || fields[k] === "") continue;
        if (result[k] == null || result[k] === "") result[k] = fields[k];
      }
      if (!primary) primary = s;
    }
    if (primary) {
      result._profile = primary.p.id;
      result._profileScore = Math.round(primary.score * 100) / 100;
      if (!result.docType && primary.p.docType) result.docType = primary.p.docType;
    }
    return result;
  }

  // apps/web/js/scan-src/profiles/generic-mrz.mjs
  var generic_mrz_default = {
    id: "generic-mrz",
    label: "Machine-readable document",
    docType: null,
    priority: 10,
    detect(ctx) {
      const mrz = ctx.mrz.parsed;
      if (!mrz) return 0;
      const hasCountry = /^[A-Z]{3}$/.test(String(mrz.country || ""));
      const hasDocNo = /[A-Z0-9]/.test(String(mrz.docNumber || "")) && String(mrz.docNumber || "").length >= 5;
      if (!hasCountry || !hasDocNo) return 0.15;
      if (ctx.mrz.candidates.length >= 3) return 0.95;
      return 0.85;
    },
    extract(ctx) {
      if (!ctx.mrz.parsed) return {};
      return { docType: ctx.mrz.parsed.docType };
    }
  };

  // apps/web/js/scan-src/profiles/labels-generic.mjs
  var SUR_RE = "Surname|Nachname|Name(?=\\s*\\d|\\s*1\\.)|Nom(?![a-z])|Cognome|Apellidos?|Apellido|Family\\s*name";
  var GIV_RE = "Given\\s*names?|Vornamen?|Pr\xE9noms?|Prenom|Nombres?|Nome(?![a-z])|Forename|Other\\s*names?";
  var NAT_RE = "Nationality|Nationalit|Naziunalitad|Staatsangeh|Nacionalidad";
  var DOB_RE = "Date\\s*of\\s*birth|Geburtsdatum|Date\\s*de\\s*naissance|Data\\s*di\\s*nascita|Fecha\\s*de\\s*nacimiento";
  var ISSUE_RE = "Date\\s*of\\s*issue|Ausgestellt|Ausstellungsdatum|D[e\xE9]livr[e\xE9]|Rilasciato|Emess\\s*ils|Fecha\\s*de\\s*expedici[o\xF3]n|Fecha\\s*de\\s*emisi[o\xF3]n";
  var EXPIRY_RE = "Date\\s*of\\s*expiry|Ablaufdatum|G[\xFCu]ltig\\s*bis|Expiration|Scadenza|Data\\s*da\\s*scadenza|Fecha\\s*de\\s*(?:vencimiento|caducidad|expiraci[o\xF3]n)";
  var SEX_RE = "Sex|Geschlecht|Sexe|Sesso|Schlattaina|Sexo";
  var AUTH_RE = "Authority|Beh[\xF6o]rde|Autorit[e\xE9a]|Autoritad|Autoridad";
  var DOC_NR_RE = "Passport\\s*No\\.?|Passeport\\s*N|Passaporto\\s*N|Pass-?Nr\\.?|Dokument(?:en)?[-\\s]*Nr\\.?|No\\.?\\s*d[eu]\\s*(?:documento|passeport)|N[u\xFA]mero(?:\\s*de)?\\s*(?:documento|pasaporte)";
  var labels_generic_default = {
    id: "generic-labels",
    label: "Generic (labels)",
    docType: null,
    priority: -5,
    detect(ctx) {
      return 0.4;
    },
    extract(ctx) {
      const txt = ctx.text;
      const f = {};
      const sur = valueAfterLabels(txt, SUR_RE);
      if (sur && sur.length > 1 && sur.length < 50) f.surname = sur;
      const giv = valueAfterLabels(txt, GIV_RE);
      if (giv && giv.length > 1 && giv.length < 80) f.givenNames = giv;
      const nat = valueAfterLabels(txt, NAT_RE);
      if (nat && nat.length < 60) f.nationality = nat;
      const authM = txt.match(new RegExp("(?:" + AUTH_RE + ")[^\\n]{0,40}\\n([^\\n]{2,50})", "i"));
      if (authM) f.authority = authM[1].replace(/[▲◄►▼▸◂•]/g, "").trim();
      const dob = findDateAfterLabel(txt, DOB_RE);
      if (dob) f.dob = dob;
      const issued = findDateAfterLabel(txt, ISSUE_RE);
      if (issued) f.issued = issued;
      const expiry = findDateAfterLabel(txt, EXPIRY_RE);
      if (expiry) f.expiry = expiry;
      const sexM = txt.match(new RegExp("(?:" + SEX_RE + ")[^\\n]{0,30}\\n?\\s*([MFmf])\\b", "i"));
      if (sexM) f.sex = sexM[1].toUpperCase();
      const labeled = txt.match(new RegExp("(?:" + DOC_NR_RE + ")[^A-Z0-9]{0,6}([A-Z0-9]{6,12})", "i"));
      if (labeled) f.docNumber = labeled[1].toUpperCase();
      if (!f.dob) {
        const ds = findDates(txt);
        if (ds[0]) f.dob = ds[0];
      }
      const htM = txt.match(/(\d{3})\s*cm\b/i);
      if (htM) f.height = htM[1] + " cm";
      return f;
    }
  };

  // apps/web/js/scan-src/profiles/swiss-id.mjs
  var STRONG = [
    /IDENTIT[ÄA]TSKARTE/i,
    /CARTE\s+D[''']IDENTIT[ÉE]/i,
    /CARTA\s+D[''']IDENTIT[ÀA]/i,
    /IDENTITY\s+CARD/i
  ];
  var SUPPORTING = [
    /SCHWEIZERISCHE\s+EIDGENOSSENSCHAFT/i,
    /CONF[EÉ]D[EÉ]RATION\s+SUISSE/i,
    /CONFEDERAZIONE\s+SVIZZERA/i,
    /SWISS\s+CONFEDERATION/i
  ];
  var swiss_id_default = {
    id: "swiss-id",
    label: "Schweizer Identit\xE4tskarte",
    docType: "Swiss Identity Card",
    priority: 30,
    detect(ctx) {
      const strong = countMatches(ctx.upper, STRONG) > 0;
      const hasCheMrzId = ctx.mrz.parsed && ctx.mrz.parsed.country === "CHE" && /^I/.test(ctx.mrz.candidates[0] || "");
      if (!strong && !hasCheMrzId) return 0;
      let score = strong ? 0.55 : 0;
      if (hasCheMrzId) score += 0.4;
      score += countMatches(ctx.upper, SUPPORTING) * 0.05;
      return Math.min(1, score);
    },
    extract(ctx) {
      const txt = ctx.text;
      const f = {};
      const heimat = valueAfterLabels(
        txt,
        "Heimatort|Lieu\\s*d[ae]?\\s*origine|Luogo\\s*d[aei]?\\s*attinenza|Place\\s*of\\s*origin"
      );
      if (heimat) f.placeOfOrigin = heimat;
      const auth = valueAfterLabels(
        txt,
        "Beh[\xF6o]rde|Autorit[e\xE9]|Autorit[\xE0a]|Authority|Autoritad"
      );
      if (auth) f.authority = auth;
      const ht = txt.match(/(?:Gr[öo]sse|Taille|Statura|Height)[^\n]{0,20}\n?\s*(\d{3})\s*cm/i);
      if (ht) f.height = ht[1] + " cm";
      if (!f.docNumber) {
        const m = rawAfterLabels(txt, "Dokument(?:en)?[-\\s]*Nr\\.?|Document\\s*No\\.?|N[o\xBA]?\\s*document");
        if (m) {
          const cleaned = m.replace(/[^A-Z0-9]/gi, "").toUpperCase();
          if (/[0-9]/.test(cleaned) && cleaned.length >= 6) f.docNumber = cleaned.slice(0, 12);
        }
      }
      if (!f.nationality) f.nationality = "CHE";
      if (!f.country) f.country = "CHE";
      return f;
    }
  };

  // apps/web/js/scan-src/profiles/swiss-passport.mjs
  var STRONG2 = /REISEPASS|PASSEPORT|PASSAPORTO/i;
  var SUPPORTING2 = [
    /SCHWEIZERISCHE\s+EIDGENOSSENSCHAFT/i,
    /CONF[EÉ]D[EÉ]RATION\s+SUISSE/i
  ];
  var swiss_passport_default = {
    id: "swiss-passport",
    label: "Schweizer Reisepass",
    docType: "Swiss Passport",
    priority: 25,
    detect(ctx) {
      const mrz = ctx.mrz.parsed;
      const hasMrz = mrz && mrz.docType === "Passport" && mrz.country === "CHE";
      const labeled = STRONG2.test(ctx.upper);
      if (!hasMrz && !labeled) return 0;
      let score = hasMrz ? 0.55 : 0;
      if (labeled) score += 0.3;
      score += countMatches(ctx.upper, SUPPORTING2) * 0.05;
      return Math.min(1, score);
    },
    extract(ctx) {
      const txt = ctx.text;
      const f = {};
      const heimat = valueAfterLabels(
        txt,
        "Heimatort|Lieu\\s*d[ae]?\\s*origine|Luogo\\s*d[aei]?\\s*attinenza|Place\\s*of\\s*origin"
      );
      if (heimat) f.placeOfOrigin = heimat;
      const auth = valueAfterLabels(
        txt,
        "Beh[\xF6o]rde|Autorit[e\xE9]|Autorit[\xE0a]|Authority|Autoritad"
      );
      if (auth) f.authority = auth;
      if (!f.country) f.country = "CHE";
      if (!f.nationality) f.nationality = "CHE";
      return f;
    }
  };

  // apps/web/js/scan-src/profiles/swiss-drivers-license.mjs
  var MARKERS = [
    /F[ÜU]HRERAUSWEIS/i,
    /PERMIS\s+DE\s+CONDUIRE/i,
    /LICENZA\s+DI\s+CONDURRE/i,
    /LICENZA\s+DA\s+CUNDUCT[IA]R/i,
    /DRIVING\s+LICEN[CS]E/i
  ];
  var CATEGORIES_RE = /\b(A1|A35|A|B1|BE|B|C1E|CE|C1|C|D1E|DE|D1|D|F|G|M)\b/g;
  var swiss_drivers_license_default = {
    id: "swiss-drivers-license",
    label: "Schweizer F\xFChrerausweis",
    docType: "Swiss Driver\u2019s License",
    priority: 28,
    detect(ctx) {
      let score = countMatches(ctx.upper, MARKERS) * 0.35;
      if (/\bKategorien?\b|\bCat[eé]gories?\b|\bCategorie\b/i.test(ctx.text)) score += 0.15;
      if (ctx.countries.includes("CHE") && /F[ÜU]HRERAUSWEIS|PERMIS/i.test(ctx.text)) score += 0.12;
      if (ctx.mrz.parsed) score *= 0.15;
      return Math.min(1, score);
    },
    extract(ctx) {
      const txt = ctx.text;
      const f = {};
      const sur = valueAfterLabels(txt, "1\\.\\s*(?:Name|Nom|Cognome|Surname)");
      if (sur) f.surname = sur;
      const giv = valueAfterLabels(txt, "2\\.\\s*(?:Vorname|Pr[e\xE9]nom|Nome|Given\\s*names?)");
      if (giv) f.givenNames = giv;
      const nrM = txt.match(/\b5\.\s*(?:[^\n]{0,20}\n)?\s*([A-Z0-9]{6,12})\b/i);
      if (nrM) f.docNumber = nrM[1].toUpperCase();
      const issueM = txt.match(/\b4a\.?\s*(?:[^\n]{0,20}\n)?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
      if (issueM) f.issued = issueM[1].replace(/[\s/-]/g, ".");
      const expiryM = txt.match(/\b4b\.?\s*(?:[^\n]{0,20}\n)?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
      if (expiryM) f.expiry = expiryM[1].replace(/[\s/-]/g, ".");
      const dobM = txt.match(/\b3\.?\s*(?:[^\n]{0,20}\n)?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
      if (dobM) f.dob = dobM[1].replace(/[\s/-]/g, ".");
      const dates = findDates(txt);
      if (!f.dob && dates[0]) f.dob = dates[0];
      if (!f.issued && dates[1]) f.issued = dates[1];
      if (!f.expiry && dates[2]) f.expiry = dates[2];
      const catBlock = txt.match(/(?:\b9\.|Kategorien?|Cat[eé]gories?|Categorie)[^\n]{0,4}\n?([^\n]{1,80})/i);
      if (catBlock) {
        const unique = [...new Set(
          [...catBlock[1].matchAll(CATEGORIES_RE)].map((m) => m[1])
        )];
        if (unique.length) f.categories = unique.join(", ");
      }
      if (!f.nationality) f.nationality = "CHE";
      if (!f.country) f.country = "CHE";
      return f;
    }
  };

  // apps/web/js/scan-src/profiles/dominican-cedula.mjs
  var CEDULA_RE = /\b(\d{3}[-\s]?\d{7}[-\s]?\d)\b/;
  var MARKERS2 = [
    /REP[UÚ]BLICA\s+DOMINICANA/i,
    /JUNTA\s+CENTRAL\s+ELECTORAL/i,
    /C[EÉ]DULA\s+DE\s+IDENTIDAD\s+Y\s+ELECTORAL/i,
    /IDENTIFICACI[OÓ]N\s+PERSONAL/i
  ];
  var dominican_cedula_default = {
    id: "dominican-cedula",
    label: "C\xE9dula Dominicana",
    docType: "Dominican C\xE9dula",
    priority: 40,
    detect(ctx) {
      let score = countMatches(ctx.upper, MARKERS2) * 0.28;
      if (CEDULA_RE.test(ctx.text)) score += 0.6;
      if (ctx.countries.includes("DOM")) score += 0.1;
      if (ctx.mrz.parsed && ctx.mrz.parsed.docType === "Passport") score *= 0.3;
      return Math.min(1, score);
    },
    extract(ctx) {
      const txt = ctx.text;
      const f = {};
      const cedulaM = txt.match(CEDULA_RE);
      if (cedulaM) {
        const digits = cedulaM[1].replace(/\D/g, "");
        if (digits.length === 11) {
          f.docNumber = `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
        } else {
          f.docNumber = cedulaM[1].trim();
        }
      }
      const sur = valueAfterLabels(txt, "Apellidos?|APELLIDOS");
      if (sur) f.surname = sur;
      const giv = valueAfterLabels(txt, "Nombres?|NOMBRES");
      if (giv) f.givenNames = giv;
      const dob = findDateAfterLabel(txt, "Fecha\\s*de\\s*Nacimiento|NACIMIENTO");
      if (dob) f.dob = dob;
      const expiry = findDateAfterLabel(
        txt,
        "Fecha\\s*de\\s*(?:Expiraci[o\xF3]n|Vencimiento|Caducidad)"
      );
      if (expiry) f.expiry = expiry;
      const sexM = txt.match(/(?:Sexo|Sex)[^\n]{0,20}\n?\s*([MFmf])\b/i);
      if (sexM) f.sex = sexM[1].toUpperCase();
      const place = valueAfterLabels(txt, "Lugar\\s*de\\s*Nacimiento");
      if (place) f.placeOfOrigin = place;
      if (!f.nationality) f.nationality = "DOM";
      if (!f.country) f.country = "DOM";
      return f;
    }
  };

  // apps/web/js/scan-src/profiles/dominican-passport.mjs
  var STRONG3 = /PASAPORTE/i;
  var SUPPORTING3 = [
    /REP[UÚ]BLICA\s+DOMINICANA/i,
    /DIRECCI[OÓ]N\s+GENERAL\s+DE\s+PASAPORTES/i
  ];
  var dominican_passport_default = {
    id: "dominican-passport",
    label: "Pasaporte Dominicano",
    docType: "Dominican Passport",
    priority: 24,
    detect(ctx) {
      const mrz = ctx.mrz.parsed;
      const hasMrz = mrz && mrz.docType === "Passport" && mrz.country === "DOM";
      if (!hasMrz && !STRONG3.test(ctx.upper)) return 0;
      let score = hasMrz ? 0.6 : 0.35;
      score += countMatches(ctx.upper, SUPPORTING3) * 0.1;
      return Math.min(1, score);
    },
    extract(ctx) {
      const txt = ctx.text;
      const f = {};
      const place = valueAfterLabels(txt, "Lugar\\s*de\\s*Nacimiento|Place\\s*of\\s*birth");
      if (place) f.placeOfOrigin = place;
      const auth = valueAfterLabels(txt, "Autoridad|Authority|Direcci[o\xF3]n\\s*General");
      if (auth) f.authority = auth;
      if (!f.nationality) f.nationality = "DOM";
      if (!f.country) f.country = "DOM";
      return f;
    }
  };

  // apps/web/js/scan-src/profiles/dominican-drivers-license.mjs
  var STRONG4 = /LICENCIA\s+DE\s+CONDUCIR/i;
  var SUPPORTING4 = [
    /REP[UÚ]BLICA\s+DOMINICANA/i,
    /INTRANT/i,
    /AMET/i
  ];
  var dominican_drivers_license_default = {
    id: "dominican-drivers-license",
    label: "Licencia de Conducir RD",
    docType: "Dominican Driver\u2019s License",
    priority: 32,
    detect(ctx) {
      if (!STRONG4.test(ctx.upper)) return 0;
      let score = 0.5 + countMatches(ctx.upper, SUPPORTING4) * 0.1;
      if (/\bCategor[ií]a\b|\bTipo\b/i.test(ctx.text)) score += 0.1;
      if (ctx.mrz.parsed) score *= 0.3;
      return Math.min(1, score);
    },
    extract(ctx) {
      const txt = ctx.text;
      const f = {};
      const sur = valueAfterLabels(txt, "Apellidos?|APELLIDOS");
      if (sur) f.surname = sur;
      const giv = valueAfterLabels(txt, "Nombres?|NOMBRES");
      if (giv) f.givenNames = giv;
      const nrM = txt.match(/(?:Licencia|N[uú]mero|No\.?)[^\n]{0,20}\n?\s*(\b[A-Z0-9\-]{8,14}\b)/i) || txt.match(/\b(\d{3}-\d{7}-\d)\b/);
      if (nrM) f.docNumber = nrM[1].toUpperCase();
      const dob = findDateAfterLabel(txt, "Nacimiento|Fecha\\s*de\\s*Nac");
      if (dob) f.dob = dob;
      const expiry = findDateAfterLabel(
        txt,
        "Vencimiento|Expiraci[o\xF3]n|V[a\xE1]lida?\\s*hasta"
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
      if (!f.nationality) f.nationality = "DOM";
      if (!f.country) f.country = "DOM";
      return f;
    }
  };

  // apps/web/js/scan-src/index.mjs
  [
    generic_mrz_default,
    labels_generic_default,
    swiss_id_default,
    swiss_passport_default,
    swiss_drivers_license_default,
    dominican_cedula_default,
    dominican_passport_default,
    dominican_drivers_license_default
  ].forEach(registerProfile);
  var api = {
    extractFields,
    registerProfile,
    getProfiles,
    _debug: {
      buildMrzContext,
      parseMRZ,
      normalizeMrzLine
    }
  };
  if (typeof window !== "undefined") {
    window.ScanProfiles = api;
  }
  var index_default = api;
})();
