/* ---------- image search ---------- */
function fingerprintFromImage(source, w, h) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = 9; canvas.height = 8;
  ctx.drawImage(source, 0, 0, w, h, 0, 0, 9, 8);
  const g = ctx.getImageData(0, 0, 9, 8).data;
  let bits = 0n;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const i = (y * 9 + x) * 4, j = (y * 9 + x + 1) * 4;
    const la = .299 * g[i] + .587 * g[i + 1] + .114 * g[i + 2];
    const lb = .299 * g[j] + .587 * g[j + 1] + .114 * g[j + 2];
    bits = (bits << 1n) | (la > lb ? 1n : 0n);
  }
  canvas.width = 64; canvas.height = 64;
  ctx.drawImage(source, 0, 0, w, h, 0, 0, 64, 64);
  const d = ctx.getImageData(0, 0, 64, 64).data;
  const bins = new Array(64).fill(0);
  for (let i = 0; i < d.length; i += 4) bins[(d[i] >> 6) * 16 + (d[i + 1] >> 6) * 4 + (d[i + 2] >> 6)]++;
  return { hash: bits.toString(16).padStart(16, '0'), hist: bins.map(v => Math.round(v * 255 / 4096)) };
}
const hamming = (a, b) => { let v = BigInt('0x' + a) ^ BigInt('0x' + b), c = 0; while (v > 0n) { c += Number(v & 1n); v >>= 1n; } return c; };
const hinter = (a, b) => a.reduce((s, x, i) => s + Math.min(x, b[i]), 0) / 255;
function rankMatches(fp) {
  return FINGERPRINTS.map(f => ({
    id: f.id,
    score: Math.round((0.55 * (1 - hamming(fp.hash, f.hash) / 64) + 0.45 * hinter(fp.hist, f.hist)) * 100)
  })).sort((a, b) => b.score - a.score);
}
const loadImg = file => new Promise((res, rej) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => res(img);
  img.onerror = rej;
  img.src = url;
});
async function extractFrames(file, count = 10) {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.preload = 'auto'; video.src = url;
    await new Promise((res, rej) => { video.onloadedmetadata = res; video.onerror = rej; });
    const dur = video.duration;
    if (!isFinite(dur) || dur <= 0) throw new Error('bad video');
    const frames = [], step = dur / (count + 1);
    for (let i = 1; i <= count; i++) {
      const t = step * i;
      await new Promise(res => { video.onseeked = res; video.currentTime = t; });
      const c = document.createElement('canvas');
      const sc = Math.min(1, 480 / video.videoWidth);
      c.width = Math.round(video.videoWidth * sc); c.height = Math.round(video.videoHeight * sc);
      c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
      frames.push({ time: t, dataUrl: c.toDataURL('image/jpeg', .7), canvas: c });
    }
    return frames;
  } finally { URL.revokeObjectURL(url); }
}

function showImgSearch() {
  state.imgSearchOpen = true;
  const ov = $('#overlay');
  ov.innerHTML = `<div class="dlg" id="dlg">
    <div class="dlg-box">
      <div class="dlg-hd">
        <div><h3>جستجو با عکس</h3><p>اسکرین‌شات یا فریم ویدیو بده؛ مشابه‌ترین عکس‌های آرشیو پیدا می‌شن</p></div>
        <div class="acts">
          <button class="dlg-reset" id="dlg-reset" style="display:none">${ICONS.refresh} عکس جدید</button>
          <button class="dlg-x" id="dlg-x" aria-label="بستن">${ICONS.x}</button>
        </div>
      </div>
      <div class="dlg-bd" id="dlg-bd"></div>
      <input type="file" id="dlg-file" accept="image/*,video/*" style="display:none" />
    </div>
  </div>`;
  document.body.style.overflow = 'hidden';

  const close = () => {
    state.imgSearchOpen = false;
    ov.innerHTML = '';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('paste', onPaste);
  };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  $('#dlg').onclick = e => { if (e.target.id === 'dlg') close(); };
  $('#dlg-x').onclick = close;
  $('#dlg-reset').onclick = () => setStage('idle');
  $('#dlg-file').onchange = e => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; };
  const onPaste = e => { const f = [...(e.clipboardData?.files || [])][0]; if (f) handleFile(f); };
  document.addEventListener('paste', onPaste);

  function setStage(kind, data) {
    const bd = $('#dlg-bd');
    $('#dlg-reset').style.display = (kind === 'idle' || kind === 'busy') ? 'none' : 'flex';
    if (kind === 'idle') {
      bd.innerHTML = `<div class="drop" id="drop">
        <span class="ic">${ICONS.upload}</span>
        <span class="h">عکس یا ویدیو را اینجا بکش و رها کن</span>
        <span class="d">یا برای انتخاب فایل کلیک کن — Paste (Ctrl+V) هم کار می‌کنه</span>
        <span class="fmts"><span>${ICONS.imgPlus} JPG · PNG · WebP</span><span>${ICONS.film} MP4 · WebM · MOV</span></span>
      </div>`;
      const drop = $('#drop');
      drop.onclick = () => $('#dlg-file').click();
      drop.ondragover = e => { e.preventDefault(); drop.classList.add('drag'); };
      drop.ondragleave = () => drop.classList.remove('drag');
      drop.ondrop = e => {
        e.preventDefault(); drop.classList.remove('drag');
        const f = e.dataTransfer.files[0]; if (f) handleFile(f);
      };
    } else if (kind === 'busy') {
      bd.innerHTML = `<div class="busy">${ICONS.loader}<p>${data}</p></div>`;
    } else if (kind === 'error') {
      bd.innerHTML = `<div class="err"><p class="m">${data}</p><button id="err-retry">تلاش دوباره</button></div>`;
      $('#err-retry').onclick = () => setStage('idle');
    } else if (kind === 'frames') {
      bd.innerHTML = `<p class="mut" style="margin-bottom:12px;font-size:13px">${faNum(data.length)} فریم از ویدیو استخراج شد — روی فریم موردنظرت بزن:</p>
        <div class="frames">${data.map((f, i) => `
          <button class="fbtn" data-fr="${i}"><img src="${f.dataUrl}" alt="فریم ${faNum(i + 1)}" />
          <span class="ft">ثانیه ${faNum(Math.round(f.time))}</span></button>`).join('')}</div>`;
      bd.querySelectorAll('[data-fr]').forEach(b => b.onclick = () => {
        const f = data[+b.dataset.fr];
        runMatch(f.canvas, f.canvas.width, f.canvas.height, f.dataUrl);
      });
    } else if (kind === 'results') {
      const { preview, matches } = data;
      const top = matches.slice(0, 8);
      const best = top[0] ? top[0].score : 0;
      bd.innerHTML = `
        <div class="res-hd">
          <img src="${preview}" alt="تصویر جستجوشده" />
          <div><p class="t">${best >= 75 ? 'تطابق نزدیک پیدا شد' : best >= 55 ? 'نزدیک‌ترین موارد آرشیو' : 'تطابق دقیقی نبود؛ مشابه‌ترین‌ها'}</p>
          <p class="d">رتبه‌بندی بر اساس شباهت بصری (ترکیب رنگ و ساختار تصویر) با ${faNum(PHOTOS.length)} عکس آرشیو</p></div>
        </div>
        <div class="res">${top.map(m => {
          const p = PHOTOS.find(x => x.id === m.id);
          return `<button class="rbtn" data-rid="${p.id}">
            <img src="${p.src}" alt="${esc(p.title)}" loading="lazy" />
            <span class="sc ${m.score >= 75 ? 'hi' : ''}">٪${faNum(m.score)}</span>
            <span class="rt">${esc(p.title)}</span></button>`;
        }).join('')}</div>`;
      bd.querySelectorAll('[data-rid]').forEach(b => b.onclick = () => {
        close();
        openLb(+b.dataset.rid);
      });
    }
  }

  function runMatch(img, w, h, preview) {
    try {
      const fp = fingerprintFromImage(img, w, h);
      setStage('results', { preview, matches: rankMatches(fp) });
    } catch { setStage('error', 'پردازش تصویر ممکن نشد. فایل دیگری را امتحان کن.'); }
  }

  async function handleFile(file) {
    if (file.type.startsWith('video/')) {
      setStage('busy', 'در حال استخراج فریم‌ها از ویدیو…');
      try {
        const frames = await extractFrames(file);
        if (!frames.length) throw 0;
        setStage('frames', frames);
      } catch { setStage('error', 'خواندن ویدیو ممکن نشد. فرمت دیگری را امتحان کن.'); }
      return;
    }
    setStage('busy', 'در حال تحلیل تصویر…');
    try {
      const img = await loadImg(file);
      runMatch(img, img.naturalWidth, img.naturalHeight, img.src);
    } catch { setStage('error', 'فایل تصویری معتبر نیست.'); }
  }

  setStage('idle');
}

/* ---------- boot ---------- */
render();
