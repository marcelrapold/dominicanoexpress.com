/* Embedded ID Scanner — Dominicano Express */
function el(id) { return document.getElementById('s-' + id); }

function scanT(key, fallback) {
  const lang = document.documentElement.lang || 'es';
  const L = window.T && window.T[lang];
  return (L && L[key]) || fallback || key;
}

/**
 * Kantenerkennung (Sobel-ähnliche Energie auf reduzierter Auflösung) — schneidet
 * homogenen Hintergrund zu; kein OpenCV-WASM, aber deutlich besser als fester Inset.
 */
function grayMatrixFromImage (img, maxW) {
  const scale = Math.min(1, maxW / img.width);
  const w = Math.max(32, Math.round(img.width * scale));
  const h = Math.max(32, Math.round(img.height * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h);
  const g = new Float32Array(w * h);
  for (let i = 0, j = 0; i < id.data.length; i += 4, j++) {
    g[j] = (id.data[i] * 77 + id.data[i + 1] * 150 + id.data[i + 2] * 29) >> 8;
  }
  return { g, w, h, sw: img.width / w, sh: img.height / h };
}

function edgeEnergyBounds (gray, w, h) {
  const col = new Float32Array(w).fill(0);
  const row = new Float32Array(h).fill(0);
  const at = (x, y) => gray[y * w + x];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx = Math.abs(at(x + 1, y) - at(x - 1, y));
      const gy = Math.abs(at(x, y + 1) - at(x, y - 1));
      const m = gx + gy * 0.85;
      col[x] += m;
      row[y] += m;
    }
  }
  let cmax = 0;
  let rmax = 0;
  for (let x = 0; x < w; x++) if (col[x] > cmax) cmax = col[x];
  for (let y = 0; y < h; y++) if (row[y] > rmax) rmax = row[y];
  if (cmax < 1e-6 || rmax < 1e-6) return null;
  const cTh = cmax * 0.14;
  const rTh = rmax * 0.14;
  let xl = 0;
  while (xl < w - 8 && col[xl] < cTh) xl++;
  let xr = w - 1;
  while (xr > 8 && col[xr] < cTh) xr--;
  let yt = 0;
  while (yt < h - 8 && row[yt] < rTh) yt++;
  let yb = h - 1;
  while (yb > 8 && row[yb] < rTh) yb--;
  if (xr - xl < w * 0.35 || yb - yt < h * 0.35) return null;
  return { xl, xr, yt, yb };
}

function cropOptimal (dataURL) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { g, w, h, sw, sh } = grayMatrixFromImage(img, 560);
      let sx = 0;
      let sy = 0;
      let cw = img.width;
      let ch = img.height;
      const b = edgeEnergyBounds(g, w, h);
      if (b) {
        const padX = Math.round((b.xr - b.xl) * 0.02);
        const padY = Math.round((b.yb - b.yt) * 0.02);
        sx = Math.max(0, Math.floor(b.xl * sw) - padX);
        sy = Math.max(0, Math.floor(b.yt * sh) - padY);
        cw = Math.min(img.width - sx, Math.ceil((b.xr - b.xl + 1) * sw) + 2 * padX);
        ch = Math.min(img.height - sy, Math.ceil((b.yb - b.yt + 1) * sh) + 2 * padY);
      } else {
        const inset = 0.035;
        sx = Math.round(img.width * inset);
        sy = Math.round(img.height * inset);
        cw = Math.round(img.width * (1 - 2 * inset));
        ch = Math.round(img.height * (1 - 2 * inset));
      }
      const fine = 0.012;
      sx += Math.round(cw * fine);
      sy += Math.round(ch * fine);
      cw = Math.round(cw * (1 - 2 * fine));
      ch = Math.round(ch * (1 - 2 * fine));
      if (cw < 80 || ch < 80) {
        sx = 0; sy = 0; cw = img.width; ch = img.height;
      }
      const canvas = document.createElement('canvas');
      const maxLong = 1600;
      let tw = cw;
      let th = ch;
      if (Math.max(tw, th) > maxLong) {
        const s = maxLong / Math.max(tw, th);
        tw = Math.round(tw * s);
        th = Math.round(th * s);
      }
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, cw, ch, 0, 0, tw, th);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

function fieldsToPayload(f) {
  const o = {};
  const keys = ['surname','givenNames','dob','sex','nationality','country','docNumber','docType','issued','expiry','height','placeOfOrigin','authority'];
  for (const k of keys) { if (f[k] != null && f[k] !== '') o[k] = f[k]; }
  return o;
}

function sendScanEmailAsync (imageDataURL, f, rawText, onSuccess, onError) {
  const lang = document.documentElement.lang || 'es';
  const safeLang = ['es', 'de', 'en'].includes(lang) ? lang : 'es';
  fetch('/api/send-scan-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lang: safeLang,
      imageBase64: imageDataURL,
      fields: fieldsToPayload(f),
      rawText: rawText || '',
    }),
  })
    .then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (data && data.ok) {
        const msg = (window.T && window.T[safeLang] && window.T[safeLang].scan_email_sent) || 'Sent';
        scanToast(msg);
        if (typeof onSuccess === 'function') onSuccess();
        return;
      }
      const base =
        (window.T && window.T[safeLang] && window.T[safeLang].scan_email_fail) || 'Email failed';
      const hint =
        (!r.ok ? `HTTP ${r.status}` : null) ||
        (data && (data.detail || data.error)) ||
        '';
      const extra = hint ? ` · ${hint}` : '';
      scanToast(base + extra, true);
      if (typeof onError === 'function') onError();
    })
    .catch(() => {
      const msg =
        (window.T && window.T[safeLang] && window.T[safeLang].scan_email_fail) || 'Email failed';
      scanToast(msg + ' · network', true);
      if (typeof onError === 'function') onError();
    });
}

/** Nur nach manueller Bestätigung durch den Nutzer (Karte „OK“). */
let _pendingEmail = null;

function resetEmailConfirm () {
  _pendingEmail = null;
  try {
    const card = el('email-confirm-card');
    if (card) {
      card.style.display = 'none';
      card.classList.remove('is-sending');
    }
    const btn = el('email-confirm-btn');
    if (btn) {
      btn.disabled = false;
      const sp = btn.querySelector('[data-i18n="scan_email_ok"]');
      if (sp) sp.textContent = scanT('scan_email_ok', 'OK');
      else btn.textContent = scanT('scan_email_ok', 'OK');
    }
  } catch (_) {}
}

function confirmSendScanEmail () {
  if (!_pendingEmail) return;
  const { fields, rawText, dataURL } = _pendingEmail;
  const btn = el('email-confirm-btn');
  const card = el('email-confirm-card');
  if (btn) {
    btn.disabled = true;
    const sp = btn.querySelector('[data-i18n="scan_email_ok"]');
    if (sp) sp.textContent = scanT('scan_email_sending', '…');
  }
  if (card) card.classList.add('is-sending');
  const restoreBtn = () => {
    if (btn) btn.disabled = false;
    if (btn) {
      const sp = btn.querySelector('[data-i18n="scan_email_ok"]');
      if (sp) sp.textContent = scanT('scan_email_ok', 'OK');
    }
    if (card) card.classList.remove('is-sending');
  };
  const onOk = () => {
    _pendingEmail = null;
    if (card) {
      card.style.display = 'none';
      card.classList.remove('is-sending');
    }
  };
  cropOptimal(dataURL)
    .then((imgURL) => {
      sendScanEmailAsync(imgURL, fields, rawText, onOk, restoreBtn);
    })
    .catch(() => {
      sendScanEmailAsync(dataURL, fields, rawText, onOk, restoreBtn);
    });
}

window.confirmSendScanEmail = confirmSendScanEmail;

// ── Config —─────────────────────────────────────────────────────────────────
const OCR_KEY = 'helloworld'; // ocr.space free key — get your own at ocr.space/ocrapi
const OCR_URL = 'https://api.ocr.space/parse/image';

// ── State ───────────────────────────────────────────────────────────────────
let stream       = null;
let capturedURL  = null;
let cameraActive = false;

// Auto-detect
let autoMode        = true;
let analysisRaf     = null;
let lastAnalysisTs  = 0;
const ANALYSIS_MS   = 200;
const SHARP_THRESH  = 18;
const STABLE_COUNT  = 6;
const HOLD_MS       = 1400;
let sharpnessBuffer = [];
let countdownStart  = null;
const analysisCanvas = document.createElement('canvas');
const analysisCtx    = analysisCanvas.getContext('2d', { willReadFrequently: true });

// ── Haptics ──────────────────────────────────────────────────────────────────
function haptic(type = 'tap') {
  if (!('vibrate' in navigator)) return;
  const patterns = {
    tap:     [15],
    medium:  [25],
    success: [20, 60, 20],
    error:   [80, 40, 80],
    lock:    [10, 30, 10],
    capture: [30],
  };
  try { navigator.vibrate(patterns[type] || patterns.tap); } catch (_) {}
}

// ── Init ─────────────────────────────────────────────────────────────────────
function scanAppInit() {
  if (!el('file-gallery')) return;
  setStatus('ready', scanT('scan_status_ready', 'Ready'));
  el('file-gallery').addEventListener('change', e => { onFile(e.target.files[0]); e.target.value = ''; });
  el('file-camera').addEventListener('change', e => { onFile(e.target.files[0]); e.target.value = ''; });
}
function scanBoot() {
  scanAppInit();
  if (typeof window.refreshScanChrome === 'function') window.refreshScanChrome();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scanBoot);
else scanBoot();

// ── Camera ───────────────────────────────────────────────────────────────────
async function captureFromCamera() {
  haptic('medium');
  const video = el('camera-video');

  // Already streaming → capture frame
  if (cameraActive && video.readyState >= 2 && video.videoWidth > 0) {
    haptic('capture');
    const canvas = el('capture-canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    capturedURL = canvas.toDataURL('image/jpeg', 0.95);
    runOCR(capturedURL);
    return;
  }

  // Start camera
  if (!navigator.mediaDevices?.getUserMedia) {
    el('file-camera').click(); return;
  }

  const tries = [
    { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
    { video: { facingMode: 'environment' } },
    { video: true }
  ];
  for (const c of tries) {
    try {
      stream = await navigator.mediaDevices.getUserMedia(c);
      video.srcObject = stream;
      video.style.display = 'block';
      el('drop-overlay').style.display = 'none';
      el('scan-frame').style.display = 'block';
      el('scan-hint').textContent = scanT('scan_hint_camera');
      cameraActive = true;
      haptic('tap');
      if (autoMode) startAutoDetect();
      return;
    } catch (_) {}
  }
  el('file-camera').click();
}

function uploadGallery() { haptic('tap'); el('file-gallery').click(); }
function takePhoto()     { haptic('tap'); el('file-camera').click(); }

// ── Auto-detect ───────────────────────────────────────────────────────────────
function computeLaplacian(imageData, w, h) {
  const d = imageData.data;
  const x0 = Math.floor(w * 0.2), x1 = Math.floor(w * 0.8);
  const y0 = Math.floor(h * 0.2), y1 = Math.floor(h * 0.8);
  const step = 2;
  let sum = 0, count = 0;
  for (let y = y0 + 1; y < y1 - 1; y += step) {
    for (let x = x0 + 1; x < x1 - 1; x += step) {
      const gray = i => (d[i*4]*77 + d[i*4+1]*150 + d[i*4+2]*29) >> 8;
      const c  = gray(y*w + x);
      const t  = gray((y-1)*w + x);
      const b  = gray((y+1)*w + x);
      const l  = gray(y*w + (x-1));
      const r  = gray(y*w + (x+1));
      const lap = t + b + l + r - 4*c;
      sum += lap * lap;
      count++;
    }
  }
  return count > 0 ? Math.sqrt(sum / count) : 0;
}

function startAutoDetect() {
  if (analysisRaf) return;
  el('auto-hud').classList.add('visible');
  sharpnessBuffer = [];
  countdownStart  = null;
  analysisRaf = requestAnimationFrame(analyseLoop);
}

function stopAutoDetect() {
  if (analysisRaf) { cancelAnimationFrame(analysisRaf); analysisRaf = null; }
  el('auto-hud').classList.remove('visible');
  el('scan-frame').classList.remove('sharp');
  resetCountdownUI();
}

function analyseLoop(ts) {
  if (!cameraActive) return;
  analysisRaf = requestAnimationFrame(analyseLoop);
  if (ts - lastAnalysisTs < ANALYSIS_MS) return;
  lastAnalysisTs = ts;

  const video = el('camera-video');
  if (!video.videoWidth || video.readyState < 2) return;

  const AW = 160, AH = Math.round(160 * video.videoHeight / video.videoWidth);
  analysisCanvas.width  = AW;
  analysisCanvas.height = AH;
  analysisCtx.drawImage(video, 0, 0, AW, AH);
  const imgData = analysisCtx.getImageData(0, 0, AW, AH);
  const sharpness = computeLaplacian(imgData, AW, AH);

  sharpnessBuffer.push(sharpness);
  if (sharpnessBuffer.length > STABLE_COUNT + 2) sharpnessBuffer.shift();

  const recent  = sharpnessBuffer.slice(-STABLE_COUNT);
  const isSharp = recent.length >= STABLE_COUNT && recent.every(v => v >= SHARP_THRESH);
  const maxVal  = Math.max(1, SHARP_THRESH * 2.5);
  const pct     = Math.min(100, Math.round(sharpness / maxVal * 100));
  updateSharpUI(pct, isSharp);

  if (isSharp) {
    if (!countdownStart) { countdownStart = performance.now(); haptic('lock'); }
    const elapsed  = performance.now() - countdownStart;
    const progress = Math.min(1, elapsed / HOLD_MS);
    updateCountdownUI(progress);
    if (progress >= 1) triggerAutoCapture();
  } else {
    if (countdownStart) { countdownStart = null; resetCountdownUI(); }
  }
}

function updateSharpUI(pct, isSharp) {
  const bar    = el('sharp-bar');
  const status = el('auto-status');
  const frame  = el('scan-frame');
  bar.style.width = pct + '%';
  bar.className   = 'sharp-bar' + (pct > 70 ? ' great' : pct > 45 ? ' good' : '');
  if (isSharp) {
    status.textContent = scanT('scan_hold_sharp');
    status.className   = 'auto-status ready';
    frame.classList.add('sharp');
  } else {
    status.textContent = pct > 40 ? scanT('scan_hold_almost') : scanT('scan_hold_frame');
    status.className   = 'auto-status';
    frame.classList.remove('sharp');
  }
}

function updateCountdownUI(progress) {
  const ring = el('countdown-ring');
  const fill = el('ring-fill');
  ring.classList.add('active');
  fill.style.strokeDashoffset = (100 * (1 - progress)).toFixed(1);
}

function resetCountdownUI() {
  el('countdown-ring').classList.remove('active');
  el('ring-fill').style.strokeDashoffset = '100';
}

function triggerAutoCapture() {
  stopAutoDetect();
  haptic('capture');
  cameraActive = false;
  const video  = el('camera-video');
  const canvas = el('capture-canvas');
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  capturedURL = canvas.toDataURL('image/jpeg', 0.95);
  runOCR(capturedURL);
}

function toggleAutoMode() {
  haptic('tap');
  autoMode = !autoMode;
  const toggle = el('auto-toggle');
  toggle.className = 'auto-toggle' + (autoMode ? ' on' : '');
  toggle.innerHTML = `<div class="auto-toggle-dot"></div>${autoMode ? scanT('scan_auto') : scanT('scan_manual')}`;
  if (cameraActive) {
    if (autoMode) startAutoDetect();
    else          stopAutoDetect();
  }
}

// ── File / Drop ───────────────────────────────────────────────────────────────
function prepareForNewOCR () {
  try {
    el('results-section').style.display = 'none';
    el('mrz-card').style.display = 'none';
    el('proc-overlay').classList.remove('active');
    el('proc-bar').style.width = '0%';
    const raw = el('raw-body');
    if (raw) {
      raw.classList.remove('open');
      const chev = document.querySelector('.raw-header .raw-chevron');
      if (chev) chev.classList.remove('open');
    }
    const grid = el('fields-grid');
    if (grid) grid.innerHTML = '';
    el('export-textarea').value = '';
    el('raw-text').textContent = '';
    resetEmailConfirm();
  } catch (_) {}
}

function onFile (file) {
  if (!file?.type?.startsWith('image/')) { scanToast(scanT('scan_toast_image')); return; }
  const reader = new FileReader();
  reader.onload = ev => runOCR(ev.target.result);
  reader.readAsDataURL(file);
}

let _savedDropTitleHtml = null;
function handleDragOver(e) {
  e.preventDefault();
  const o = el('drop-overlay');
  const t = o.querySelector('.drop-overlay-title');
  if (t && !_savedDropTitleHtml) {
    _savedDropTitleHtml = t.innerHTML;
    t.textContent = scanT('scan_drop_drag');
  }
  o.classList.add('drag-active');
}
function handleDragLeave() {
  const o = el('drop-overlay');
  const t = o.querySelector('.drop-overlay-title');
  if (t && _savedDropTitleHtml) {
    t.innerHTML = _savedDropTitleHtml;
    _savedDropTitleHtml = null;
  }
  o.classList.remove('drag-active');
}
function handleDrop(e) {
  e.preventDefault();
  const o = el('drop-overlay');
  const t = o.querySelector('.drop-overlay-title');
  if (t && _savedDropTitleHtml) {
    t.innerHTML = _savedDropTitleHtml;
    _savedDropTitleHtml = null;
  }
  o.classList.remove('drag-active');
  onFile(e.dataTransfer?.files?.[0]);
}

// ── OCR pipeline ─────────────────────────────────────────────────────────────
async function runOCR (dataURL) {
  prepareForNewOCR();
  capturedURL = dataURL;

  const img = el('captured-img');
  img.src = dataURL;
  img.style.display = 'block';
  el('camera-video').style.display = 'none';
  el('drop-overlay').style.display = 'none';
  el('scan-frame').style.display = 'none';
  el('reset-btn').style.display = 'inline-flex';

  stopAutoDetect();
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; cameraActive = false; }

  const overlay = el('proc-overlay');
  overlay.classList.add('active');
  setProc(scanT('scan_proc_optimizing'), 10);
  setStatus('busy', scanT('scan_status_processing'));
  el('capture-btn').disabled = true;

  try {
    const compressed = await compressImage(dataURL, 900 * 1024);
    setProc(scanT('scan_proc_sending'), 35);

    const text = await callOCR(compressed);
    setProc(scanT('scan_proc_extracting'), 80);

    const fields = extractFields(text);
    setProc(scanT('scan_proc_done'), 100);

    await delay(300);
    overlay.classList.remove('active');
    renderResults(fields, text, dataURL);
    setStatus('ready', scanT('scan_status_complete'));
    haptic('success');

  } catch (e) {
    overlay.classList.remove('active');
    scanToast(scanT('scan_error_prefix') + ' ' + errStr(e), true);
    setStatus('ready', scanT('scan_status_error'));
    haptic('error');
    console.error(e);
  }

  el('capture-btn').disabled = false;
}

// ── OCR.space (Engine 2: language=auto für mehrsprachige Ausweise, sonst eng) ─
async function callOCR (dataURL) {
  const post = async (language) => {
    const body = new URLSearchParams({
      base64Image: dataURL,
      language,
      OCREngine: '2',
      scale: 'true',
      detectOrientation: 'true',
      isOverlayRequired: 'false'
    });
    const res = await fetch(OCR_URL, { method: 'POST', headers: { apikey: OCR_KEY }, body });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    if (json.IsErroredOnProcessing) throw new Error(json.ErrorMessage?.[0] || 'API error');
    if (!json.ParsedResults?.length) throw new Error('No text detected in image');
    return json.ParsedResults.map(r => r.ParsedText || '').join('\n');
  };
  try {
    return await post('auto');
  } catch (_) {
    return post('eng');
  }
}

// ── Image compression ─────────────────────────────────────────────────────────
function compressImage(dataURL, maxBytes) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const s = Math.min(1, 1400 / img.width);
      canvas.width  = Math.round(img.width  * s);
      canvas.height = Math.round(img.height * s);
      const ctx = canvas.getContext('2d');
      try { ctx.filter = 'grayscale(100%) contrast(150%) brightness(108%)'; } catch (_) {}
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let q = 0.88, out = canvas.toDataURL('image/jpeg', q);
      while (out.length * 0.75 > maxBytes && q > 0.3) { q -= 0.1; out = canvas.toDataURL('image/jpeg', q); }
      resolve(out);
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

// ── Field extraction ──────────────────────────────────────────────────────────
function cleanPersonName (s) {
  if (!s || typeof s !== 'string') return '';
  let t = s
    .replace(/[▲◄►▼▸◂•|]{1,3}/g, ' ')
    .replace(/\s*[0-9]{6,}.*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  t = t.replace(/^[^A-Za-zÀ-ÿ]+/, '').replace(/[^A-Za-zÀ-ÿ\s'-]+$/, '');
  return t.slice(0, 90);
}

/**
 * Label auf gleicher Zeile (häufig bei Ausweisen) oder nächster Zeile.
 */
function valueAfterLabels (txt, labelRegex) {
  const block = txt.replace(/\r\n/g, '\n');
  const sameLine = new RegExp(
    '(?:' + labelRegex + ')[^\\S\\n]{0,6}[:·|]{0,2}[^\\S\\n]{0,4}([^\\n]+)',
    'im'
  );
  let m = block.match(sameLine);
  if (m && m[1]) return cleanPersonName(m[1]);
  const nextLine = new RegExp('(?:' + labelRegex + ')[^\\n]{0,72}\\n([^\\n]+)', 'im');
  m = block.match(nextLine);
  return m && m[1] ? cleanPersonName(m[1]) : '';
}

function extractFields (raw) {
  const f = {};
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const txt = raw;

  const mrzCandidates = lines
    .map(l => l.toUpperCase().replace(/[^A-Z0-9<]/g, ''))
    .filter(l => l.length >= 28 && (l.match(/</g) || []).length >= 2);

  if (mrzCandidates.length >= 2) {
    const mrz = parseMRZ(mrzCandidates);
    if (mrz) Object.assign(f, mrz);
  }
  f._mrz = mrzCandidates.length >= 2 ? mrzCandidates.slice(0, 3) : null;

  const after = (label) => {
    const re = new RegExp(label + '[^\\n]{0,60}\\n([^\\n]+)', 'i');
    const m = txt.match(re);
    return m ? cleanPersonName(m[1].replace(/[▲◄►▼▸◂]/g, '')) : undefined;
  };

  const SUR_RE =
    'Surname|Nachname|Nom(?![a-z])|Cognome|Apellidos?|APELLIDOS|Family\\s*name';
  const GIV_RE =
    'Given\\s*names?|Vornamen?|Prénoms?|NOMBRES?|Nome(?![a-z])|Forename|Other\\s*names?';
  const NAT_RE = 'Nationality|Nationalit|Staatsangeh|Naziunalitad';

  if (!f.surname) {
    const s =
      valueAfterLabels(txt, SUR_RE) ||
      after('(?:Surname|Name\\s*·|Nom\\s*·|Cognome|Nachname|Apellido)');
    if (s && s.length < 50 && s.length > 1) f.surname = s;
  }
  if (!f.givenNames) {
    const g =
      valueAfterLabels(txt, GIV_RE) ||
      after('(?:Given name|Vorname|Prénom|Nome\\s*i|Prenum)');
    if (g && g.length < 80 && g.length > 1) f.givenNames = g;
  }
  if (!f.nationality) {
    const n = valueAfterLabels(txt, NAT_RE) || after('(?:Nationality|Nationalit|Naziunalitad|Staatsangeh)');
    if (n && n.length < 60) f.nationality = n;
  }

  if (!f.dob) {
    const m = txt.match(/(?:Date of birth|Geburtsdatum|Naissance|Data di nascita)[^\n]{0,60}\n?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
    if (m) f.dob = normalizeDate(m[1]);
  }

  const issueM = txt.match(/(?:Date of issue|Ausgestellt|D[eé]livr[eé]|Rilasciato|Emess ils)[^\n]{0,60}\n?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
  if (issueM) f.issued = normalizeDate(issueM[1]);

  if (!f.expiry) {
    const m = txt.match(/(?:Date of expiry|Gültig bis|Expiration|Scadenza|Data da scadenza)[^\n]{0,60}\n?\s*(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})/i);
    if (m) f.expiry = normalizeDate(m[1]);
  }

  if (!f.sex) {
    const m = txt.match(/(?:Sex|Geschlecht|Sexe|Sesso|Schlattaina)[^\n]{0,30}\n?\s*([MFmf])\b/i);
    if (m) f.sex = m[1].toUpperCase();
  }

  const htM = txt.match(/(\d{3})\s*cm/i);
  if (htM) f.height = htM[1] + ' cm';

  const heimatM = txt.match(/(?:Heimatort|Lieu d.origine|Place of origin|Luogo di attinenza)[^\n]{0,40}\n([^\n]{2,40})/i);
  if (heimatM) f.placeOfOrigin = heimatM[1].replace(/[▲◄►▼▸◂•]/g, '').trim();

  const authM = txt.match(/(?:Beh[öo]rde|Autorit[eéa]|Authority|Autoritad)[^\n]{0,40}\n([^\n]{2,50})/i);
  if (authM) f.authority = authM[1].replace(/[▲◄►▼▸◂•]/g, '').trim();

  if (!f.docNumber) {
    const m = txt.match(/\b([A-Z][A-Z0-9]{7,8})\b/);
    if (m) f.docNumber = m[1];
  }

  if (!f.dob) {
    const dates = [...txt.matchAll(/\b(\d{1,2}[\s./-]\d{2}[\s./-]\d{4})\b/g)].map(m => normalizeDate(m[1]));
    if (dates[0]) f.dob    = dates[0];
    if (dates[1] && !f.issued) f.issued = dates[1];
    if (dates[2] && !f.expiry) f.expiry = dates[2];
  }

  if (!f.country) {
    const m = txt.match(/\b(DEU|CHE|AUT|USA|GBR|FRA|ITA|ESP|NLD|BEL|POL|TUR|CAN|AUS|CHN|JPN|BRA|MEX|IND|DOM)\b/);
    if (m) f.country = m[1];
  }

  return f;
}

// ── MRZ parser ────────────────────────────────────────────────────────────────
function parseMRZ(lines) {
  const cl  = l => l.replace(/[^A-Z0-9<]/g, '');
  const L   = lines.map(cl);
  const td3 = L.filter(l => l.length >= 42);
  if (td3.length >= 2 && /^P/.test(td3[0])) return parseTD3(td3[0], td3[1]);
  const td1 = L.filter(l => l.length >= 28);
  if (td1.length >= 3) return parseTD1(td1[0], td1[1], td1[2]);
  if (td1.length >= 2) return parseTD1(td1[0], td1[1], '');
  return null;
}
function parseTD1(l1, l2, l3) {
  return {
    docType:     'National ID Card',
    country:     l1.substring(2,5).replace(/</g,''),
    docNumber:   l1.substring(5,14).replace(/</g,''),
    dob:         mrzDate(l2.substring(0,6)),
    sex:         l2[7] === 'M' ? 'M' : l2[7] === 'F' ? 'F' : l2[7],
    expiry:      mrzDate(l2.substring(8,14)),
    nationality: l2.substring(15,18).replace(/</g,''),
    surname:     (l3.split('<<')[0]||'').replace(/</g,' ').trim(),
    givenNames:  (l3.split('<<')[1]||'').replace(/</g,' ').trim()
  };
}
function parseTD3(l1, l2) {
  const ns = l1.substring(5).split('<<');
  return {
    docType:     'Passport',
    country:     l1.substring(2,5).replace(/</g,''),
    surname:     (ns[0]||'').replace(/</g,' ').trim(),
    givenNames:  (ns[1]||'').replace(/</g,' ').trim(),
    docNumber:   l2.substring(0,9).replace(/</g,''),
    nationality: l2.substring(10,13).replace(/</g,''),
    dob:         mrzDate(l2.substring(13,19)),
    sex:         l2[20] === 'M' ? 'M' : l2[20] === 'F' ? 'F' : l2[20],
    expiry:      mrzDate(l2.substring(21,27))
  };
}
function mrzDate(s) {
  if (!s || s.length < 6 || s.includes('<')) return null;
  const yy = +s.slice(0,2), mm = +s.slice(2,4), dd = +s.slice(4,6);
  if (isNaN(yy+mm+dd)) return null;
  const yr = yy > 30 ? 1900+yy : 2000+yy;
  return `${String(dd).padStart(2,'0')}.${String(mm).padStart(2,'0')}.${yr}`;
}
function normalizeDate(s) {
  return s.trim().replace(/[\s/-]/g, '.').replace(/\.\.+/g, '.');
}

// ── Render results ────────────────────────────────────────────────────────────
const COUNTRY_MAP = {
  DEU:'Germany',     CHE:'Switzerland', AUT:'Austria',     LIE:'Liechtenstein',
  USA:'United States', GBR:'United Kingdom', FRA:'France', ITA:'Italy',
  ESP:'Spain',       NLD:'Netherlands', BEL:'Belgium',    POL:'Poland',
  TUR:'Turkey',      CAN:'Canada',      AUS:'Australia',  CHN:'China',
  JPN:'Japan',       BRA:'Brazil',      MEX:'Mexico',     IND:'India',
  RUS:'Russia',      DOM:'Dominican Republic'
};

function renderResults(f, rawText, dataURL) {
  el('results-section').style.display = 'block';
  el('thumb-img').src = dataURL;

  el('doc-type-label').textContent = f.docType || scanT('scan_doc_unknown');
  const ctry = f.country ? (COUNTRY_MAP[f.country] || f.country) + ' · ' + f.country : '';
  const nat  = f.nationality && f.nationality !== f.country ? (COUNTRY_MAP[f.nationality] || f.nationality) : '';
  el('doc-country-label').textContent = [ctry, nat].filter(Boolean).join(' | ') || '—';

  const badges = el('doc-badges');
  badges.innerHTML = '';
  const addBadge = (txt, cls) => {
    const b = document.createElement('span');
    b.className = 'badge ' + cls; b.textContent = txt; badges.appendChild(b);
  };
  if (f.docNumber) addBadge(scanT('scan_badge_no') + ' ' + f.docNumber, 'badge-blue');
  if (f.expiry) {
    const exp   = parseLocalDate(f.expiry);
    const valid = exp && exp > new Date();
    addBadge(valid ? scanT('scan_badge_valid') + ' ' + f.expiry : scanT('scan_badge_expired') + ' ' + f.expiry, valid ? 'badge-green' : 'badge-red');
  }
  if (f.sex) addBadge(f.sex === 'M' ? scanT('scan_sex_m') : f.sex === 'F' ? scanT('scan_sex_f') : f.sex, 'badge-gray');

  const FIELD_DEFS = [
    { key:'surname',       label: () => scanT('scan_field_surname'),          mono:false },
    { key:'givenNames',    label: () => scanT('scan_field_given'),     mono:false },
    { key:'dob',           label: () => scanT('scan_field_dob'),     mono:false },
    { key:'sex',           label: () => scanT('scan_field_sex'),               mono:false, fmt: v => v==='M'?scanT('scan_sex_m'):v==='F'?scanT('scan_sex_f'):v },
    { key:'nationality',   label: () => scanT('scan_field_nationality'),       mono:false },
    { key:'country',       label: () => scanT('scan_field_country'),   mono:false, fmt: v => (COUNTRY_MAP[v]||v) + (COUNTRY_MAP[v]?' ('+v+')':'') },
    { key:'docNumber',     label: () => scanT('scan_field_docnum'),      mono:true  },
    { key:'docType',       label: () => scanT('scan_field_doctype'),     mono:false },
    { key:'issued',        label: () => scanT('scan_field_issued'),     mono:false },
    { key:'expiry',        label: () => scanT('scan_field_expiry'),       mono:false },
    { key:'height',        label: () => scanT('scan_field_height'),            mono:false },
    { key:'placeOfOrigin', label: () => scanT('scan_field_origin'),   mono:false },
    { key:'authority',     label: () => scanT('scan_field_authority'), mono:false },
  ];

  const grid = el('fields-grid');
  grid.innerHTML = '';
  FIELD_DEFS.forEach(def => {
    const raw = f[def.key];
    if (!raw) return;
    const val  = def.fmt ? def.fmt(raw) : raw;
    const cell = document.createElement('div');
    cell.className = 'field-cell';
    const lab = typeof def.label === 'function' ? def.label() : def.label;
    cell.innerHTML = `
      <div class="field-cell-label">${lab}</div>
      <div class="field-cell-value${def.mono?' mono':''}">${esc(val)}</div>
      <div class="copy-icon" onclick="copyField(this,'${esc(val)}')">
        <svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </div>`;
    grid.appendChild(cell);
  });

  if (!grid.children.length) {
    grid.innerHTML = `<div class="field-cell full"><div class="field-cell-label">${esc(scanT('scan_note'))}</div><div class="field-cell-value">${esc(scanT('scan_no_fields'))}</div></div>`;
  }

  if (f._mrz?.length >= 2) {
    el('mrz-card').style.display = 'block';
    el('mrz-lines').innerHTML = f._mrz.map(l => `<div class="mrz-line">${l}</div>`).join('');
  }

  el('export-textarea').value = buildExport(f, rawText);
  el('raw-text').textContent  = rawText;

  _pendingEmail = { fields: f, rawText, dataURL };
  const ec = el('email-confirm-card');
  const eb = el('email-confirm-btn');
  if (ec) {
    ec.style.display = 'block';
    ec.classList.remove('is-sending');
  }
  if (eb) {
    eb.disabled = false;
    const sp = eb.querySelector('[data-i18n="scan_email_ok"]');
    if (sp) sp.textContent = scanT('scan_email_ok', 'OK');
  }

  el('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (ec) {
    requestAnimationFrame(() => {
      try {
        ec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (_) {}
    });
  }
}

// ── Export builder ────────────────────────────────────────────────────────────
function buildExport(f, raw) {
  const pad = s => String(s).padEnd(22);
  const row = (k, v) => v ? pad(k + ':') + v + '\n' : '';
  return [
    '=== ID SCAN RESULT ===\n',
    row('Document Type',    f.docType),
    row('Issuing Country',  f.country ? (COUNTRY_MAP[f.country]||f.country) : null),
    row('Surname',          f.surname),
    row('Given Name(s)',    f.givenNames),
    row('Date of Birth',    f.dob),
    row('Sex',              f.sex === 'M' ? 'Male' : f.sex === 'F' ? 'Female' : f.sex),
    row('Nationality',      f.nationality),
    row('Document No.',     f.docNumber),
    row('Date of Issue',    f.issued),
    row('Expiry Date',      f.expiry),
    row('Height',           f.height),
    row('Place of Origin',  f.placeOfOrigin),
    row('Issuing Authority',f.authority),
    f._mrz ? '\n--- MRZ ---\n' + f._mrz.join('\n') + '\n' : ''
  ].join('');
}

// ── Copy helpers ──────────────────────────────────────────────────────────────
async function clip(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const t = document.createElement('textarea');
    t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(t); return ok;
  }
}
async function copyField(btn, text) {
  haptic('tap');
  if (await clip(text)) {
    btn.classList.add('done');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      btn.classList.remove('done');
      btn.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }, 2000);
    scanToast(scanT('scan_toast_copied'));
  }
}
async function copyAll () {
  haptic('medium');
  const text = el('export-textarea').value;
  if (await clip(text)) {
    const btn = el('copy-all-btn');
    const doneLbl = scanT('scan_toast_copied');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" stroke="currentColor" fill="none"><polyline points="20 6 9 17 4 12"/></svg><span>' +
      esc(doneLbl) +
      '</span>';
    setTimeout(() => {
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span data-i18n="scan_copy_all">' +
        esc(scanT('scan_copy_all')) +
        '</span>';
    }, 2200);
    scanToast(scanT('scan_toast_all'));
  }
}
async function copyExport() {
  haptic('tap');
  if (await clip(el('export-textarea').value)) scanToast(scanT('scan_toast_export'));
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetScan () {
  haptic('tap');
  prepareForNewOCR();
  el('captured-img').style.display = 'none';
  el('camera-video').style.display = 'none';
  el('drop-overlay').style.display = 'flex';
  el('scan-frame').style.display = 'none';
  el('reset-btn').style.display = 'none';
  el('scan-hint').textContent = scanT('scan_hint_default');
  stopAutoDetect();
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; cameraActive = false; }
  capturedURL = null;
  setStatus('ready', scanT('scan_status_ready'));
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function toggleRaw(header) {
  const body = el('raw-body');
  const open = body.classList.toggle('open');
  header.querySelector('.raw-chevron').classList.toggle('open', open);
  haptic('tap');
}
function setStatus(state, text) {
  el('status-dot').className = 'ocr-pill-dot ' + (state === 'busy' ? 'busy' : 'ready');
  el('status-text').textContent = text;
}
function setProc(text, pct) {
  el('proc-label').textContent = text;
  el('proc-bar').style.width   = pct + '%';
}
let _tt; function scanToast(msg, err) {
  const t = el('toast');
  t.textContent = msg; t.style.background = err ? '#7f1d1d' : '#1e293b';
  t.classList.add('show'); clearTimeout(_tt);
  _tt = setTimeout(() => t.classList.remove('show'), 2500);
}
function errStr(e) { return e?.message || (typeof e === 'string' ? e : JSON.stringify(e)) || 'Unknown error'; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function parseLocalDate(s) {
  const p = s.split('.'); if (p.length !== 3) return null;
  return new Date(+p[2], +p[1]-1, +p[0]);
}

window.refreshScanChrome = function () {
  try {
    const o = el('drop-overlay');
    if (o && !o.classList.contains('drag-active')) {
      const t = o.querySelector('.drop-overlay-title');
      const s = o.querySelector('.drop-overlay-sub');
      if (t) t.innerHTML = scanT('scan_drop_title');
      if (s) s.textContent = scanT('scan_drop_sub');
    }
    el('scan-hint').textContent =
      cameraActive ? scanT('scan_hint_camera') : scanT('scan_hint_default');
    const auto = el('auto-toggle');
    if (auto) {
      auto.className = 'auto-toggle' + (autoMode ? ' on' : '');
      auto.innerHTML = `<div class="auto-toggle-dot"></div>${autoMode ? scanT('scan_auto') : scanT('scan_manual')}`;
    }
  } catch (_) {}
};
