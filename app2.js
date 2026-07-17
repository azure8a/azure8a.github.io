/* ---------- search box ---------- */
const SUGGESTIONS = (() => {
  const s = new Set();
  for (const c of CATEGORIES) if (c.id !== 'all') s.add(c.label);
  for (const p of PHOTOS) s.add(p.title);
  return [...s];
})();

function mountSearch(host, compact) {
  if (!host) return;
  host.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'sbox' + (compact ? ' compact' : '');
  host.appendChild(wrap);

  const input = document.createElement('input');
  input.placeholder = compact ? 'جستجو…' : 'جستجو در آرشیو…';
  input.value = state.query;
  input.setAttribute('aria-label', 'جستجو در آرشیو');
  wrap.appendChild(input);

  const ic = document.createElement('span'); ic.className = 'sic'; ic.innerHTML = ICONS.search;
  wrap.appendChild(ic);

  let hi = -1, drop = null;

  const close = () => { if (drop) { drop.remove(); drop = null; } hi = -1; };
  const pick = v => {
    state.query = v;
    if (v.trim()) addHistory(v);
    close(); render();
  };

  const buildRows = () => {
    const typing = input.value.trim().length > 0;
    const q = normFa(input.value);
    if (typing) return SUGGESTIONS.filter(s => normFa(s).includes(q)).slice(0, 7).map(v => ({ k: 's', v }));
    return state.history.slice(0, 6).map(v => ({ k: 'h', v }));
  };

  const open = () => {
    close();
    const rows = buildRows();
    if (!rows.length) return;
    drop = document.createElement('div'); drop.className = 'sdrop';
    if (!input.value.trim()) {
      drop.innerHTML = `<div class="sdrop-hd"><span>جستجوهای اخیر</span>
        <button type="button" class="clr">${ICONS.trash} پاک کردن</button></div>`;
      drop.querySelector('.clr').onclick = () => { state.history = []; saveHist(); close(); };
    }
    const ul = document.createElement('div');
    rows.forEach((r, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'sopt' + (i === hi ? ' hi' : '');
      b.innerHTML = `${r.k === 'h' ? ICONS.clock : ICONS.spark}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${highlight(r.v)}</span>` +
        (r.k === 'h' ? `<span class="del" data-del="${esc(r.v)}">${ICONS.x}</span>` : '');
      b.onmousedown = e => e.preventDefault();
      b.onclick = e => {
        const del = e.target.closest('[data-del]');
        if (del) {
          e.stopPropagation();
          state.history = state.history.filter(h => h !== del.dataset.del);
          saveHist(); open(); return;
        }
        pick(r.v);
      };
      b.onmouseenter = () => { hi = i; ul.querySelectorAll('.sopt').forEach((x, j) => x.classList.toggle('hi', j === hi)); };
      ul.appendChild(b);
    });
    drop.appendChild(ul);
    wrap.appendChild(drop);
  };

  const highlight = text => {
    const n = normFa(input.value);
    if (!n) return esc(text);
    const idx = normFa(text).indexOf(n);
    if (idx < 0) return esc(text);
    return esc(text.slice(0, idx)) + '<mark>' + esc(text.slice(idx, idx + input.value.length)) + '</mark>' + esc(text.slice(idx + input.value.length));
  };

  input.addEventListener('input', () => { state.query = input.value; liveFilter(); hi = -1; open(); });
  input.addEventListener('focus', open);
  input.addEventListener('keydown', e => {
    const rows = buildRows();
    if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hi + 1, rows.length - 1); open(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); hi = Math.max(hi - 1, -1); open(); }
    else if (e.key === 'Enter') {
      if (hi >= 0 && rows[hi]) pick(rows[hi].v);
      else { if (input.value.trim()) addHistory(input.value); close(); render(); }
    } else if (e.key === 'Escape') close();
  });
  document.addEventListener('mousedown', e => { if (!wrap.contains(e.target)) close(); });
}

function addHistory(q) {
  const v = q.trim(); if (!v) return;
  state.history = [v, ...state.history.filter(h => h !== v)].slice(0, 8);
  saveHist();
}

/* live filter without full re-render (keeps focus in input) */
function liveFilter() {
  renderGrid();
  const crumb = document.querySelector('.tb-crumb');
  if (crumb) {
    const vis = visiblePhotos();
    const q = state.query.trim();
    crumb.innerHTML = `<b>${catLabel(state.category)}</b>` +
      (q ? `<span class="qtag">«${esc(q)}»</span>` : '') +
      `<span class="tb-count">${faNum(vis.length)} عکس</span>`;
  }
}

/* ---------- lightbox ---------- */
function openLb(id) {
  state.openPhoto = id;
  showLightbox(id);
}

function showLightbox(id) {
  const vis = visiblePhotos();
  const p = PHOTOS.find(x => x.id === id);
  if (!p) return;
  const idx = Math.max(0, vis.findIndex(x => x.id === id));
  const prev = vis[(idx - 1 + vis.length) % vis.length] || p;
  const next = vis[(idx + 1) % vis.length] || p;
  const isFav = state.favorites.includes(p.id);
  const ov = $('#overlay');

  ov.innerHTML = `<div class="lb" id="lb">
    <button class="lb-close" id="lb-close" aria-label="بستن">${ICONS.x}</button>
    <div class="lb-count">${faNum(idx + 1)} / ${faNum(vis.length)}</div>
    <button class="lb-nav prev" id="lb-prev" aria-label="قبلی">${ICONS.chevR}</button>
    <button class="lb-nav next" id="lb-next" aria-label="بعدی">${ICONS.chevL}</button>
    <div class="lb-mid" id="lb-mid">
      <img class="lb-img" src="${p.src}" alt="${esc(p.title)}" />
      <div class="lb-meta">
        <div style="min-width:0">
          <p class="t">${esc(p.title)}</p>
          <p class="s">${catLabel(p.category)} · ${faNum(p.year)} · منبع: ${esc(p.srclabel)}</p>
        </div>
        <div class="lb-acts">
          <button class="lb-act ${isFav ? 'fav' : ''}" id="lb-fav" aria-label="علاقه‌مندی">${ICONS.heart(isFav)}</button>
          <a class="lb-act" href="${p.src}" download target="_blank" rel="noopener" aria-label="دانلود عکس">${ICONS.down}</a>
        </div>
      </div>
    </div>
  </div>`;
  document.body.style.overflow = 'hidden';

  const close = () => { state.openPhoto = null; ov.innerHTML = ''; document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  const onKey = e => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') { state.openPhoto = next.id; showLightbox(next.id); }
    if (e.key === 'ArrowRight') { state.openPhoto = prev.id; showLightbox(prev.id); }
  };
  document.addEventListener('keydown', onKey);
  $('#lb').onclick = e => { if (e.target.id === 'lb') close(); };
  $('#lb-close').onclick = close;
  $('#lb-prev').onclick = e => { e.stopPropagation(); state.openPhoto = prev.id; showLightbox(prev.id); };
  $('#lb-next').onclick = e => { e.stopPropagation(); state.openPhoto = next.id; showLightbox(next.id); };
  $('#lb-fav').onclick = e => { e.stopPropagation(); toggleFavKeep(p.id); };
  $('#lb-mid').onclick = e => e.stopPropagation();
}

function toggleFavKeep(id) {
  const i = state.favorites.indexOf(id);
  if (i >= 0) state.favorites.splice(i, 1); else state.favorites.push(id);
  saveFavs();
  renderGrid();
  showLightbox(id);
}

