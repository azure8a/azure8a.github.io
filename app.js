'use strict';

const picks = [PHOTOS[0], PHOTOS[8], PHOTOS[18], PHOTOS[28], PHOTOS[30]];
const strip = document.querySelector('#gallery-strip');
const lightbox = document.querySelector('#lightbox');

strip.innerHTML = picks.map((photo, index) => `
  <button class="gallery-card" data-index="${index}" aria-label="نمایش ${photo.title}">
    <img src="${photo.src}" alt="${photo.title}" width="${photo.w}" height="${photo.h}" loading="lazy" decoding="async">
    <span><b>${photo.title}</b><small>${photo.year} · ${photo.srclabel}</small></span>
  </button>`).join('');

function openPhoto(index) {
  const photo = picks[index];
  lightbox.hidden = false;
  lightbox.innerHTML = `<button class="lightbox-close" aria-label="بستن">×</button><img src="${photo.src}" alt="${photo.title}"><p>${photo.title} · ${photo.year}</p>`;
  document.body.classList.add('locked');
  lightbox.querySelector('.lightbox-close').focus();
}

function closePhoto() {
  lightbox.hidden = true;
  lightbox.innerHTML = '';
  document.body.classList.remove('locked');
}

strip.addEventListener('click', event => {
  const card = event.target.closest('[data-index]');
  if (card) openPhoto(Number(card.dataset.index));
});
lightbox.addEventListener('click', event => { if (event.target === lightbox || event.target.closest('.lightbox-close')) closePhoto(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !lightbox.hidden) closePhoto(); });

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: .12 });
document.querySelectorAll('section, .project').forEach(element => observer.observe(element));

