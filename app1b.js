/* ---------- shell render ---------- */
function render() {
  const dark = document.documentElement.classList.contains('dark');
  const vis = visiblePhotos();
  const favN = state.favorites.length;
  const q = state.query.trim();

  $('#app').innerHTML = `
  <aside class="sidebar">
    <div>
      <p class="brand-kicker">Fan Archive</p>
      <h1 class="brand-title">آرشیو سلیون<span class="brand-sub">SEOLHYUN 설현</span></h1>
      <p class="brand-meta">${faNum(PHOTOS.length)} عکس دسته‌بندی‌شده · ${faNum(2013)} تا ${faNum(2024)}</p>
    </div>
    <div class="sb-search" id="sb-search"></div>
    <button class="sb-imgbtn" id="sb-imgsearch">
      <span style="display:flex;align-items:center;gap:8px">${ICONS.imgSearch} جستجو با عکس یا ویدیو</span>
      <span class="new">جدید</span>
    </button>
    <nav class="catnav">
      ${CATEGORIES.map(c => `
        <button class="catbtn ${state.category === c.id ? 'on' : ''}" data-cat="${c.id}">
          <span>${c.label}</span><span class="n">${faNum(counts[c.id] || 0)}</span>
        </button>`).join('')}
      <button class="catbtn ${state.category === 'favorites' ? 'on' : ''}" data-cat="favorites">
        <span style="display:flex;align-items:center;gap:8px;color:inherit">
          <span style="color:#dc2626;display:flex">${ICONS.heart(true)}</span> علاقه‌مندی‌های من
        </span><span class="n">${faNum(favN)}</span>
      </button>
    </nav>
    <div class="sb-foot">
      <button class="themebtn" id="sb-theme"><span>${dark ? 'حالت روشن' : 'حالت تیره'}</span>${dark ? ICONS.sun : ICONS.moon}</button>
      <p class="disclaimer">آرشیو غیررسمی هواداران — عکس‌ها از منابع عمومی وب</p>
    </div>
  </aside>

  <main>
    <div class="topbar">
      <div class="brand">${ICONS.images}<span>آرشیو سلیون</span><span class="kr">설현</span></div>
      <div style="display:flex;align-items:center;gap:4px">
        <button class="iconbtn" id="mb-imgsearch" aria-label="جستجو با عکس">${ICONS.imgSearch}</button>
        <button class="iconbtn" id="mb-fav" aria-label="علاقه‌مندی‌ها">${ICONS.heart(favN > 0)}
          ${favN ? `<span class="bdg">${faNum(favN)}</span>` : ''}</button>
        <button class="iconbtn" id="mb-theme" aria-label="تغییر تم">${dark ? ICONS.sun : ICONS.moon}</button>
      </div>
    </div>

    <header class="hero">
      <p class="hero-kicker">Kim Seolhyun · AOA · Actress</p>
      <h2 class="hero-title font-disp">SEOLHYUN</h2>
      <div class="hero-row">
        <p class="hero-desc">آرشیو تصویری کیم سلیون؛ از صحنه‌های AOA و فرش‌های قرمز تا فتوشوت‌ها، سریال‌ها و لحظه‌های روزمره — همه دسته‌بندی‌شده در یک جا.</p>
        <div class="hero-stats">
          <span><b>${faNum(PHOTOS.length)}</b> عکس</span>
          <span><b>${faNum(8)}</b> دسته</span>
          <span><b>${faNum(12)}</b> سال آرشیو</span>
        </div>
      </div>
    </header>

    <div class="toolbar"><div class="toolbar-in">
      <span id="mb-search" style="flex-shrink:0"></span>
      ${CATEGORIES.map(c => `<button class="chip ${state.category === c.id ? 'on' : ''}" data-cat="${c.id}">${c.label}</button>`).join('')}
      <button class="chip ${state.category === 'favorites' ? 'on' : ''}" data-cat="favorites">♥ علاقه‌مندی‌ها</button>
      <div class="tb-desktop">
        <p class="tb-crumb"><b>${catLabel(state.category)}</b>
          ${q ? `<span class="qtag">«${esc(q)}» <span id="clear-q" style="display:inline-flex">${ICONS.x}</span></span>` : ''}
          <span class="tb-count">${faNum(vis.length)} عکس</span>
        </p>
        <div class="sorts">${ICONS.sort}
          ${[['curated','منتخب'],['newest','جدیدترین'],['oldest','قدیمی‌ترین']].map(([id, l]) =>
            `<button class="srt ${state.sort === id ? 'on' : ''}" data-sort="${id}">${l}</button>`).join('')}
        </div>
      </div>
    </div></div>

    <div class="grid" id="grid"></div>

    <footer><p>آرشیو سلیون — یک پروژه هواداری غیررسمی. عکس‌ها از منابع عمومی وب (خبرگزاری‌ها، ویکی‌مدیا، پوسترهای رسمی) گردآوری و صرفاً برای نمایش آرشیوی استفاده شده‌اند.</p></footer>
  </main>

  <div id="overlay"></div>`;

  bindShell();
  renderGrid();
  mountSearch($('#sb-search'), false);
  mountSearch($('#mb-search'), true);
  if (state.openPhoto) showLightbox(state.openPhoto);
  if (state.imgSearchOpen) showImgSearch();
}

function bindShell() {
  document.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => {
    state.category = b.dataset.cat; render(); window.scrollTo({ top: 0 });
  });
  document.querySelectorAll('[data-sort]').forEach(b => b.onclick = () => { state.sort = b.dataset.sort; render(); });
  const cq = $('#clear-q'); if (cq) cq.onclick = () => { state.query = ''; render(); };
  const t1 = $('#sb-theme'); if (t1) t1.onclick = toggleTheme;
  const t2 = $('#mb-theme'); if (t2) t2.onclick = toggleTheme;
  const mf = $('#mb-fav'); if (mf) mf.onclick = () => { state.category = 'favorites'; render(); };
  const is1 = $('#sb-imgsearch'); if (is1) is1.onclick = () => { state.imgSearchOpen = true; showImgSearch(); };
  const is2 = $('#mb-imgsearch'); if (is2) is2.onclick = () => { state.imgSearchOpen = true; showImgSearch(); };
}

/* ---------- grid ---------- */
function renderGrid() {
  const vis = visiblePhotos();
  const el = $('#grid');
  if (!vis.length) {
    const isFav = state.category === 'favorites' && !state.query.trim();
    el.innerHTML = `<div class="empty">
      <span style="display:flex;opacity:.4;color:var(--muted-fg)">${isFav ? ICONS.heart(false) : ICONS.search}</span>
      <p class="h">${isFav ? 'هنوز عکسی به علاقه‌مندی‌ها اضافه نکردی' : 'چیزی پیدا نشد'}</p>
      <p class="d">${isFav ? 'روی آیکون قلب گوشه هر عکس بزن تا اینجا ذخیره‌ش کنه.' : 'عبارت دیگری را امتحان کن یا دسته را عوض کن.'}</p>
    </div>`;
    return;
  }
  el.innerHTML = `<div class="masonry">${vis.map(p => `
    <figure class="card">
      <div class="frame" data-open="${p.id}" role="button" tabindex="0" aria-label="${esc(p.title)}">
        <img src="${p.src}" alt="${esc(p.title)}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" />
        <span class="veil"><span class="t">${esc(p.title)}</span><span class="m">${faNum(p.year)} · ${esc(p.srclabel)}</span></span>
        <span class="like ${state.favorites.includes(p.id) ? 'on' : ''}" data-fav="${p.id}" role="button" aria-label="علاقه‌مندی">
          <span>${ICONS.heart(state.favorites.includes(p.id))}</span>
        </span>
      </div>
      <figcaption><span class="tt">${esc(p.title)}</span><span class="yy">${faNum(p.year)}</span></figcaption>
    </figure>`).join('')}</div>`;

  el.querySelectorAll('[data-open]').forEach(f => {
    f.onclick = e => { if (e.target.closest('[data-fav]')) return; openLb(+f.dataset.open); };
    f.onkeydown = e => { if (e.key === 'Enter') openLb(+f.dataset.open); };
  });
  el.querySelectorAll('[data-fav]').forEach(b => b.onclick = e => { e.stopPropagation(); toggleFav(+b.dataset.fav); });
}

function toggleFav(id) {
  const i = state.favorites.indexOf(id);
  if (i >= 0) state.favorites.splice(i, 1); else state.favorites.push(id);
  saveFavs(); render();
}

