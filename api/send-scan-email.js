import { Resend } from 'resend';

export const config = { runtime: 'nodejs', maxDuration: 30 };

/** Beide erhalten die Scan-Mail direkt im Feld „An“. */
const SCAN_EMAIL_TO = ['marcel@marcelrapold.com', 'rapold.ch@hotmail.com'];

const BRAND = {
  nav: '#00205B',
  nav2: '#0a2f7a',
  accent: '#CE1126',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  surface: '#f8fafc',
};

const MSG = {
  es: {
    preheader: 'Nuevo resultado del escáner de identificación',
    title: 'Escaneo de documento',
    subtitle: 'Dominicano Express GmbH',
    intro:
      'Ha recibido un <strong>nuevo documento</strong> procesado con el escáner ID de la web. Los datos extraídos aparecen a continuación; la imagen optimizada se adjunta.',
    section_image: 'Vista previa del documento',
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
    intro:
      'Sie haben ein <strong>neues Dokument</strong>, das mit dem ID-Scanner auf der Website erfasst wurde. Die extrahierten Daten finden Sie unten; das optimierte Bild ist angehängt.',
    section_image: 'Dokumentvorschau',
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
    intro:
      'You have received a <strong>new document</strong> captured with the on-site ID scanner. Structured data is shown below; the optimised image is attached.',
    section_image: 'Document preview',
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

function buildEmailHtml({ t, labels, rows, rawSnippet, preheader }) {
  const rowHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid ${BRAND.border};font-size:13px;font-weight:600;color:${BRAND.muted};width:38%;">${escapeHtml(r.label)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid ${BRAND.border};font-size:14px;font-weight:600;color:${BRAND.text};">${escapeHtml(r.value)}</td>
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
<body style="margin:0;padding:0;background:${BRAND.surface};-webkit-font-smoothing:antialiased;">
  <span style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;border-radius:14px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 12px 40px rgba(15,23,42,.08);background:#fff;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.nav} 0%,${BRAND.nav2} 100%);padding:28px 28px 24px;border-bottom:4px solid ${BRAND.accent};">
              <table role="presentation" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="font-size:11px;font-weight:800;letter-spacing:3px;color:rgba(255,255,255,.45);text-transform:uppercase;">${escapeHtml(t.subtitle)}</div>
                    <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.3px;margin-top:6px;line-height:1.2;">${escapeHtml(t.title)}</div>
                  </td>
                  <td align="right" style="vertical-align:middle;width:52px;">
                    <div style="display:inline-block;background:${BRAND.accent};color:#fff;font-weight:900;font-size:15px;padding:10px 11px;border-radius:8px;line-height:1;">DE</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead -->
          <tr>
            <td style="padding:24px 28px 8px;font-size:15px;line-height:1.65;color:${BRAND.text};">${t.intro}</td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;font-size:13px;line-height:1.6;color:${BRAND.muted};">${escapeHtml(t.fields_note)}</td>
          </tr>

          <!-- Data table -->
          <tr>
            <td style="padding:0 20px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:10px;overflow:hidden;background:#fff;">
                <tr>
                  <td colspan="2" style="padding:12px 16px;background:${BRAND.surface};font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(t.section_data)}</td>
                </tr>
                ${rowHtml}
              </table>
            </td>
          </tr>

          <!-- Raw -->
          <tr>
            <td style="padding:0 28px 24px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};margin-bottom:8px;">${escapeHtml(t.section_raw)}</div>
              <div style="font-family:Consolas,Monaco,monospace;font-size:12px;line-height:1.65;color:${BRAND.muted};background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:10px;padding:14px 16px;max-height:200px;overflow:auto;white-space:pre-wrap;word-break:break-word;">${escapeHtml(rawSnippet)}</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:22px 28px;">
              <div style="font-size:13px;font-weight:700;color:#fff;line-height:1.5;">${escapeHtml(t.footer_line1)}</div>
              <div style="margin-top:10px;font-size:11px;line-height:1.55;color:rgba(248,250,252,.62);">${escapeHtml(t.footer_line2)}</div>
              <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:10px;line-height:1.5;color:rgba(248,250,252,.45);">${escapeHtml(t.legal)}</div>
            </td>
          </tr>
        </table>
        <div style="font-size:11px;color:${BRAND.muted};margin-top:16px;max-width:640px;text-align:center;line-height:1.5;">
          ${escapeHtml(t.footer_privacy)} <a href="https://dominicanoexpress.rapold.io/datenschutz" style="color:${BRAND.nav};font-weight:600;">dominicanoexpress.rapold.io/datenschutz</a>
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

  const subjectByLang = {
    es: `[ID Scanner] Documento escaneado · ${fields.docType || 'Documento'}`,
    de: `[ID Scanner] Dokument gescannt · ${fields.docType || 'Dokument'}`,
    en: `[ID Scanner] Document scanned · ${fields.docType || 'Document'}`,
  };

  const html = buildEmailHtml({
    t,
    labels,
    rows,
    rawSnippet,
    preheader: t.preheader,
  });

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to: SCAN_EMAIL_TO,
    subject: subjectByLang[lang],
    html,
    attachments: [
      {
        filename: `scan-${Date.now()}.jpg`,
        content: imageBuffer,
        contentType: mime.includes('png') ? 'image/png' : 'image/jpeg',
      },
    ],
  });

  if (error) {
    console.error('Resend error:', error);
    return res.status(502).json({ ok: false, error: 'send_failed', detail: error.message || String(error) });
  }

  return res.status(200).json({ ok: true, id: data?.id });
}
