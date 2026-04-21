import { Resend } from 'resend';

export const config = { runtime: 'nodejs', maxDuration: 30 };

/** Beide erhalten die Scan-Mail direkt im Feld „An“. */
const SCAN_EMAIL_TO = ['marcel@marcelrapold.com', 'rapold.ch@hotmail.com'];

/** Logo für E-Mail-Header (PNG/SVG per HTTPS; SVG wird evtl. in wenigen Clients unterdrückt). */
const DEFAULT_PUBLIC_ORIGIN = 'https://dominicanoexpress.rapold.io';

const BRAND = {
  nav: '#00205B',
  nav2: '#0a2f7a',
  accent: '#CE1126',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  surface: '#f8fafc',
  paper: '#ffffff',
};

const INLINE_PREVIEW_CID = 'docpreview';
const INLINE_LOGO_CID = 'brandlogo';

const MSG = {
  es: {
    preheader: 'Nuevo resultado del escáner de identificación',
    title: 'Escaneo de documento',
    subtitle: 'Dominicano Express GmbH',
    badge_id_scanner: 'ID Scanner',
    intro:
      'Ha recibido un <strong>nuevo resultado de identificación</strong> generado desde la web. La <strong>vista previa del documento</strong> aparece debajo; el archivo de imagen va incluido como adjunto para su archivo.',
    section_image: 'Vista previa del documento (imagen del escaneo)',
    section_data: 'Datos extraídos (OCR)',
    section_raw: 'Texto OCR (referencia)',
    fields_note:
      'Esta tabla resume los campos reconocidos automáticamente. Verifique los datos frente al documento original.',
    footer_line1: 'Dominicano Express GmbH · Envíos marítimos Suiza ↔ República Dominicana',
    footer_line2: 'Este correo se ha generado de forma automática tras un escaneo en dominicanoexpress.com.',
    footer_privacy: 'Política de privacidad:',
    legal: 'Solo para uso interno / tramitación de envíos. No reenvíe datos personales sin consentimiento.',
  },
  de: {
    preheader: 'Neues Ausweis-Scan-Ergebnis',
    title: 'Dokumenten-Scan',
    subtitle: 'Dominicano Express GmbH',
    badge_id_scanner: 'ID Scanner',
    intro:
      'Sie erhalten ein <strong>neues Ausweis-/Dokumenten-Scan-Ergebnis</strong> von der Website. Die <strong>Vorschau des Dokumentfotos</strong> sehen Sie unten eingebettet; dasselbe Bild liegt zusätzlich als Datei im Anhang vor.',
    section_image: 'Dokumentvorschau (Scan)',
    section_data: 'Extrahierte Daten (OCR)',
    section_raw: 'Rohtext OCR (Referenz)',
    fields_note:
      'Diese Tabelle fasst die automatisch erkannten Felder zusammen. Bitte mit dem Originaldokument abgleichen.',
    footer_line1: 'Dominicano Express GmbH · Seefracht Schweiz ↔ Dominikanische Republik',
    footer_line2:
      'Diese E-Mail wurde automatisch nach einem Scan auf dominicanoexpress.com erstellt.',
    footer_privacy: 'Datenschutz:',
    legal: 'Nur für interne Abwicklung / Logistik. Keine Weitergabe personenbezogener Daten ohne Einwilligung.',
  },
  en: {
    preheader: 'New ID scan result',
    title: 'Document scan',
    subtitle: 'Dominicano Express GmbH',
    badge_id_scanner: 'ID Scanner',
    intro:
      'You have received a <strong>new identification capture</strong> from the website. A <strong>live preview</strong> of the document image is shown below; the same file is also attached for your records.',
    section_image: 'Document preview (scan image)',
    section_data: 'Extracted data (OCR)',
    section_raw: 'Raw OCR text (reference)',
    fields_note:
      'This table summarises automatically recognised fields. Please verify against the original document.',
    footer_line1: 'Dominicano Express GmbH · Ocean freight Switzerland ↔ Dominican Republic',
    footer_line2: 'This email was generated automatically after a scan on dominicanoexpress.com.',
    footer_privacy: 'Privacy:',
    legal: 'For internal processing / logistics only. Do not forward personal data without consent.',
  },
};

function fieldLabels(lang) {
  const L = {
    es: {
      surname: 'Apellido',
      givenNames: 'Nombre(s)',
      dob: 'Fecha de nacimiento',
      sex: 'Sexo',
      nationality: 'Nacionalidad',
      country: 'País emisor',
      docNumber: 'Nº de documento',
      docType: 'Tipo de documento',
      issued: 'Fecha de emisión',
      expiry: 'Validez / vencimiento',
      height: 'Altura',
      placeOfOrigin: 'Lugar de origen',
      authority: 'Autoridad',
    },
    de: {
      surname: 'Name',
      givenNames: 'Vorname(n)',
      dob: 'Geburtsdatum',
      sex: 'Geschlecht',
      nationality: 'Nationalität',
      country: 'Ausstellungsland',
      docNumber: 'Dokumentnr.',
      docType: 'Dokumenttyp',
      issued: 'Ausstellungsdatum',
      expiry: 'Gültig bis',
      height: 'Grösse',
      placeOfOrigin: 'Heimatort',
      authority: 'Behörde',
    },
    en: {
      surname: 'Surname',
      givenNames: 'Given name(s)',
      dob: 'Date of birth',
      sex: 'Sex',
      nationality: 'Nationality',
      country: 'Issuing country',
      docNumber: 'Document no.',
      docType: 'Document type',
      issued: 'Date of issue',
      expiry: 'Expiry date',
      height: 'Height',
      placeOfOrigin: 'Place of origin',
      authority: 'Issuing authority',
    },
  };
  return L[lang] || L.en;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(s, max) {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

/** Betreff: Kundenname (aus OCR) + Dokumenttyp + Markenzeile */
function formatCustomerName(fields, lang) {
  const g = String(fields.givenNames || '').trim();
  const s = String(fields.surname || '').trim();
  if (!g && !s) return '';
  if (lang === 'de') {
    if (s && g) return `${s}, ${g}`;
    return s || g;
  }
  return [g, s].filter(Boolean).join(' ').trim() || g || s;
}

function buildSubject(lang, fields) {
  const name = formatCustomerName(fields, lang);
  const docKind = truncate(fields.docType, 36);
  const fall = { es: 'Documento', de: 'Dokument', en: 'Document' }[lang] || 'Document';
  const doc = docKind || fall;
  const mid = name ? `${name} — ${doc}` : doc;
  return truncate(`[ID Scanner] ${mid} · Dominicano Express`, 240);
}

/** Absender-Anzeigename immer „ID Scanner“, E-Mail-Adresse aus RESEND_FROM */
function buildFromWithDisplayName(resendFrom) {
  const raw = String(resendFrom || '').trim();
  if (!raw) return raw;
  const m = raw.match(/<\s*([^>]+)\s*>/);
  const email = (m ? m[1] : raw).trim().replace(/^mailto:/i, '');
  if (!email.includes('@')) return raw;
  return `ID Scanner <${email}>`;
}

function buildEmailHtml({ t, rows, rawSnippet, preheader, logoImgSrc, inlineCid }) {
  const rowHtml = rows
    .map(
      (r, i) => `
      <tr>
        <td style="padding:13px 18px;border-bottom:1px solid ${BRAND.border};font-size:12px;font-weight:700;color:${BRAND.muted};width:38%;vertical-align:top;${i === rows.length - 1 ? 'border-bottom:none;' : ''}">${escapeHtml(r.label)}</td>
        <td style="padding:13px 18px;border-bottom:1px solid ${BRAND.border};font-size:14px;font-weight:600;color:${BRAND.text};line-height:1.45;vertical-align:top;${i === rows.length - 1 ? 'border-bottom:none;' : ''}">${escapeHtml(r.value)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="und">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<title>${escapeHtml(t.title)}</title>
</head>
<body style="margin:0;padding:0;background:#e8edf3;-webkit-font-smoothing:antialiased;font-family:Segoe UI,system-ui,-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none!important;font-size:1px;color:#f8fafc;line-height:1;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8edf3;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 16px 48px rgba(15,23,42,.12);background:${BRAND.paper};">

          <tr>
            <td style="height:4px;background:${BRAND.accent};line-height:4px;font-size:0;">&nbsp;</td>
          </tr>

          <!-- Kopfzeile: Logo + Corporate -->
          <tr>
            <td style="background:linear-gradient(145deg,${BRAND.nav} 0%,${BRAND.nav2} 100%);padding:22px 26px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${escapeHtml(logoImgSrc)}" width="168" height="30" alt="Dominicano Express" style="display:block;border:0;outline:none;height:auto;max-width:168px;"/>
                  </td>
                  <td align="right" style="vertical-align:middle;white-space:nowrap;">
                    <span style="display:inline-block;background:rgba(255,255,255,.12);color:#fff;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.2);">${escapeHtml(t.badge_id_scanner)}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px;">
                    <div style="font-size:10px;font-weight:700;letter-spacing:.28em;color:rgba(255,255,255,.45);text-transform:uppercase;">${escapeHtml(t.subtitle)}</div>
                    <div style="font-size:21px;font-weight:800;color:#fff;letter-spacing:-.02em;margin-top:4px;line-height:1.2;">${escapeHtml(t.title)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 26px 6px;font-size:15px;line-height:1.65;color:${BRAND.text};">${t.intro}</td>
          </tr>
          <tr>
            <td style="padding:0 26px 18px;font-size:13px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(t.fields_note)}</td>
          </tr>

          <!-- Dokumentvorschau (CID inline) -->
          <tr>
            <td style="padding:0 20px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;background:#fff;border-bottom:1px solid ${BRAND.border};">
                    <div style="font-size:10px;font-weight:800;letter-spacing:.14em;color:${BRAND.muted};text-transform:uppercase;">${escapeHtml(t.section_image)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 14px 18px;text-align:center;background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);">
                    <img src="cid:${escapeHtml(inlineCid)}" width="520" alt="" style="display:block;max-width:100%;height:auto;margin:0 auto;border-radius:10px;border:1px solid ${BRAND.border};box-shadow:0 4px 24px rgba(15,23,42,.08);"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Daten -->
          <tr>
            <td style="padding:0 20px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;background:${BRAND.paper};">
                <tr>
                  <td colspan="2" style="padding:14px 18px;background:linear-gradient(180deg,#f8fafc,#f1f5f9);font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${BRAND.muted};border-bottom:1px solid ${BRAND.border};">${escapeHtml(t.section_data)}</td>
                </tr>
                ${rowHtml || `<tr><td colspan="2" style="padding:18px;font-size:13px;color:${BRAND.muted};">—</td></tr>`}
              </table>
            </td>
          </tr>

          <!-- OCR Rohtext -->
          <tr>
            <td style="padding:0 26px 26px;">
              <div style="font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${BRAND.muted};margin-bottom:8px;">${escapeHtml(t.section_raw)}</div>
              <div style="font-family:Consolas,ui-monospace,monospace;font-size:11px;line-height:1.6;color:${BRAND.muted};background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:10px;padding:14px 16px;max-height:220px;overflow:auto;white-space:pre-wrap;word-break:break-word;">${escapeHtml(rawSnippet)}</div>
            </td>
          </tr>

          <tr>
            <td style="background:linear-gradient(180deg,#0f172a,#020617);padding:24px 26px;">
              <div style="font-size:13px;font-weight:700;color:#fff;line-height:1.55;">${escapeHtml(t.footer_line1)}</div>
              <div style="margin-top:10px;font-size:11px;line-height:1.55;color:rgba(248,250,252,.58);">${escapeHtml(t.footer_line2)}</div>
              <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1);font-size:10px;line-height:1.5;color:rgba(248,250,252,.42);">${escapeHtml(t.legal)}</div>
            </td>
          </tr>
        </table>
        <div style="font-size:11px;color:${BRAND.muted};margin-top:18px;max-width:600px;text-align:center;line-height:1.55;">
          ${escapeHtml(t.footer_privacy)} <a href="https://dominicanoexpress.rapold.io/datenschutz" style="color:${BRAND.nav};font-weight:600;text-decoration:none;">dominicanoexpress.rapold.io/datenschutz</a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function normalizeLang(l) {
  return ['es', 'de', 'en'].includes(l) ? l : 'es';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    console.error('send-scan-email: missing RESEND_API_KEY or RESEND_FROM');
    return res.status(503).json({ ok: false, error: 'email_not_configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_json' });
  }

  const lang = normalizeLang(body.lang);
  const t = MSG[lang];
  const labels = fieldLabels(lang);

  let imageBuffer;
  let mime = 'image/jpeg';
  const rawImage = body.imageBase64;
  if (typeof rawImage !== 'string' || rawImage.length < 100) {
    return res.status(400).json({ ok: false, error: 'missing_image' });
  }

  const m = rawImage.match(/^data:([^;]+);base64,(.+)$/);
  if (m) {
    mime = m[1] || mime;
    try {
      imageBuffer = Buffer.from(m[2], 'base64');
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid_base64' });
    }
  } else {
    try {
      imageBuffer = Buffer.from(rawImage, 'base64');
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid_base64' });
    }
  }

  if (imageBuffer.length > 2 * 1024 * 1024) {
    return res.status(413).json({ ok: false, error: 'image_too_large' });
  }

  const fields = body.fields && typeof body.fields === 'object' ? body.fields : {};
  const keys = [
    'surname',
    'givenNames',
    'dob',
    'sex',
    'nationality',
    'country',
    'docNumber',
    'docType',
    'issued',
    'expiry',
    'height',
    'placeOfOrigin',
    'authority',
  ];

  const rows = [];
  for (const k of keys) {
    const v = fields[k];
    if (v == null || v === '') continue;
    let display = String(v);
    if (k === 'sex') {
      if (display === 'M') display = lang === 'de' ? 'Männlich' : lang === 'es' ? 'Masculino' : 'Male';
      if (display === 'F') display = lang === 'de' ? 'Weiblich' : lang === 'es' ? 'Femenino' : 'Female';
    }
    rows.push({ label: labels[k] || k, value: display });
  }

  const rawText = typeof body.rawText === 'string' ? body.rawText : '';
  const rawSnippet = rawText.length > 4000 ? `${rawText.slice(0, 4000)}…` : rawText;

  const subject = buildSubject(lang, fields);
  const custName = formatCustomerName(fields, lang);
  const preheader = custName ? `${t.preheader} · ${custName}` : t.preheader;

  const siteOrigin = (process.env.PUBLIC_SITE_URL || DEFAULT_PUBLIC_ORIGIN).replace(/\/$/, '');
  const logoUrl = `${siteOrigin}/logo-white.svg`;

  let logoImgSrc = logoUrl;
  const logoAttachments = [];
  try {
    const lr = await fetch(logoUrl);
    if (lr.ok) {
      const buf = Buffer.from(await lr.arrayBuffer());
      if (buf.length > 0 && buf.length < 512000) {
        logoImgSrc = `cid:${INLINE_LOGO_CID}`;
        logoAttachments.push({
          filename: 'logo-white.svg',
          content: buf,
          contentType: 'image/svg+xml',
          inlineContentId: INLINE_LOGO_CID,
        });
      }
    }
  } catch (e) {
    console.warn('send-scan-email: logo fetch skipped:', e?.message || e);
  }

  const html = buildEmailHtml({
    t,
    rows,
    rawSnippet,
    preheader,
    logoImgSrc,
    inlineCid: INLINE_PREVIEW_CID,
  });

  const slugBase = custName || fields.docNumber || 'scan';
  const fileSlug = String(slugBase)
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 56) || 'scan';

  const resend = new Resend(apiKey);
  const fromWithName = buildFromWithDisplayName(from);

  const { data, error } = await resend.emails.send({
    from: fromWithName,
    to: SCAN_EMAIL_TO,
    subject,
    html,
    attachments: [
      ...logoAttachments,
      {
        filename: `ID-Scan_${fileSlug}_${Date.now()}.jpg`,
        content: imageBuffer,
        contentType: mime.includes('png') ? 'image/png' : 'image/jpeg',
        inlineContentId: INLINE_PREVIEW_CID,
      },
    ],
  });

  if (error) {
    console.error('Resend error:', error);
    return res.status(502).json({ ok: false, error: 'send_failed', detail: error.message || String(error) });
  }

  return res.status(200).json({ ok: true, id: data?.id });
}
