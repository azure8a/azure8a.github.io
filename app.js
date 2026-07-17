/* Seolhyun Archive — vanilla JS */
'use strict';

/* ---------- helpers ---------- */
const FA_D = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const FA_MAP = {'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9','٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
const faNum = n => String(n).replace(/\d/g, d => FA_D[+d]);
const normFa = s => s.replace(/[۰-۹٠-٩]/g, d => FA_MAP[d] || d)
  .replace(/[أإآٱ]/g,'ا').replace(/[ىيئ]/g,'ی').replace(/ك/g,'ک').replace(/ة/g,'ه')
  .replace(/[ً-ْٰ]/g,'').replace(/ـ/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const $ = sel => document.querySelector(sel);

const ICONS = {
  search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  heart: f => `<svg width="18" height="18" viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  imgSearch: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.5"/><path d="m15.5 15.5 2.5 2.5"/></svg>',
  upload: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
  film: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4"/></svg>',
  imgPlus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.5-3.5a1 1 0 0 0-1.4 0L6 21"/></svg>',
  clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  spark: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3m0 12v3M5.6 5.6l2.2 2.2m8.4 8.4 2.2 2.2M3 12h3m12 0h3M5.6 18.4l2.2-2.2m8.4-8.4 2.2-2.2"/></svg>',
  trash: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  chevR: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  chevL: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  down: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  refresh: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/></svg>',
  loader: '<svg class="spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.56"/></svg>',
  sort: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4M7 4v16M21 16l-4 4-4-4M17 20V4"/></svg>',
  images: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.5-3.5a1 1 0 0 0-1.4 0L6 21"/></svg>'
};

/* ---------- state ---------- */
const state = {
  category: 'all',
  query: '',
  sort: 'curated',
  openPhoto: null,
  imgSearchOpen: false,
  favorites: JSON.parse(localStorage.getItem('sh-favs') || '[]'),
  history: JSON.parse(localStorage.getItem('sh-search-history') || '[]'),
};
const saveFavs = () => localStorage.setItem('sh-favs', JSON.stringify(state.favorites));
const saveHist = () => localStorage.setItem('sh-search-history', JSON.stringify(state.history));

/* theme */
const themeInit = () => {
  const saved = localStorage.getItem('sh-theme');
  const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', dark);
};
const toggleTheme = () => {
  const dark = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem('sh-theme', dark ? 'dark' : 'light');
  render();
};
themeInit();

/* ---------- derived ---------- */
const counts = (() => {
  const c = { all: PHOTOS.length };
  for (const p of PHOTOS) c[p.category] = (c[p.category] || 0) + 1;
  return c;
})();
const catLabel = id => id === 'favorites' ? 'علاقه‌مندی‌های من' : (CATEGORIES.find(c => c.id === id) || {}).label || '';

function visiblePhotos() {
  let list = PHOTOS;
  if (state.category === 'favorites') list = list.filter(p => state.favorites.includes(p.id));
  else if (state.category !== 'all') list = list.filter(p => p.category === state.category);
  const q = normFa(state.query.trim());
  if (q) list = list.filter(p => {
    const cat = CATEGORIES.find(c => c.id === p.category);
    return normFa(p.title).includes(q) || normFa(p.srclabel).includes(q) ||
      String(p.year).includes(q) || faNum(p.year).includes(state.query.trim()) ||
      (cat && (normFa(cat.label).includes(q) || normFa(cat.en).includes(q)));
  });
  if (state.sort === 'newest') list = [...list].sort((a, b) => b.year - a.year || a.id - b.id);
  if (state.sort === 'oldest') list = [...list].sort((a, b) => a.year - b.year || a.id - b.id);
  return list;
}

