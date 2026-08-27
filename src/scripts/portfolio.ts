// Marks this file as a module. Without it TS treats it as a global script and
// `frames` collides with `window.frames`.
export {};

type Frame = {
  itemId: string;
  category: string;
  categoryLabel: string;
  title: string;
  caption: string;
  kind: 'image' | 'video' | 'embed';
  src: string;
  width: number;
  height: number;
  slide: number;
  slides: number;
  html?: string;
};

const payload = document.getElementById('frames');
if (!payload?.textContent) throw new Error('[portfolio] missing frame payload');
const { frames, emptyCategories } = JSON.parse(payload.textContent) as {
  frames: Frame[];
  emptyCategories: string[];
};

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const tabsBar = $('tabs');
const tabs = [...tabsBar.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const tiles = [...document.querySelectorAll<HTMLElement>('[data-tile]')];
const empties = [...document.querySelectorAll<HTMLElement>('[data-empty]')];

const dialog = $<HTMLDialogElement>('lightbox');
const stage = $('lb-stage');
const elTitle = $('lb-title');
const elCaption = $('lb-caption');
const elCategory = $('lb-category');
const elCounter = $('lb-counter');
const elDots = $('lb-dots');
const btnPrev = $<HTMLButtonElement>('lb-prev');
const btnNext = $<HTMLButtonElement>('lb-next');
const btnClose = $<HTMLButtonElement>('lb-close');

/* ------------------------------- filtering -------------------------------- */

/** Indices into `frames`, narrowed to the active tab. The lightbox never
 *  navigates outside this sequence. */
let sequence: number[] = frames.map((_, i) => i);
let cursor = 0;

function applyFilter(next: string) {
  for (const tab of tabs) {
    const on = tab.dataset.filter === next;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
  }

  for (const tile of tiles) {
    tile.hidden = next !== 'all' && tile.dataset.category !== next;
  }

  for (const el of empties) {
    el.hidden = !(next === el.dataset.empty && emptyCategories.includes(next));
  }

  sequence = frames.reduce<number[]>((acc, f, i) => {
    if (next === 'all' || f.category === next) acc.push(i);
    return acc;
  }, []);

  history.replaceState(null, '', next === 'all' ? location.pathname : `#${next}`);
}

tabsBar.addEventListener('click', (e) => {
  const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
  if (tab) applyFilter(tab.dataset.filter!);
});

// Roving tabindex — arrow keys move along the tab bar, as a tablist should.
tabsBar.addEventListener('keydown', (e) => {
  const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (!dir) return;
  e.preventDefault();
  const at = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  const to = tabs[(at + dir + tabs.length) % tabs.length]!;
  applyFilter(to.dataset.filter!);
  to.focus();
});

/* ------------------------------- lightbox --------------------------------- */

function render() {
  const frame = frames[sequence[cursor]!]!;

  stage.replaceChildren();
  if (frame.kind === 'video') {
    const video = document.createElement('video');
    video.src = frame.src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    // A <video> has no intrinsic size until metadata loads, so give it the
    // poster's ratio up front — otherwise it lays out at 300x150 (or collapses)
    // and portrait footage gets squashed.
    video.style.aspectRatio = `${frame.width} / ${frame.height}`;
    video.className = 'max-h-full max-w-full rounded-card object-contain';
    stage.append(video);
  } else if (frame.kind === 'embed' && frame.html) {
    stage.innerHTML = frame.html;
  } else {
    const image = new Image();
    image.src = frame.src;
    image.alt = frame.title;
    image.width = frame.width;
    image.height = frame.height;
    image.decoding = 'async';
    image.className = 'max-h-full max-w-full rounded-card object-contain';
    stage.append(image);
  }

  elTitle.textContent = frame.title;
  elCaption.textContent = frame.caption;
  elCategory.textContent = frame.categoryLabel;
  elCounter.textContent = `${cursor + 1} / ${sequence.length}`;

  // Dots show position within a carousel only; a single image gets none.
  elDots.replaceChildren();
  if (frame.slides > 1) {
    for (let i = 1; i <= frame.slides; i++) {
      const dot = document.createElement('span');
      dot.className = `size-1.5 rounded-full ${i === frame.slide ? 'bg-card' : 'bg-card/35'}`;
      elDots.append(dot);
    }
  }

  // Arrows are hidden at the ends rather than disabled.
  btnPrev.hidden = cursor === 0;
  btnNext.hidden = cursor === sequence.length - 1;

  // Warm the neighbours so arrowing through feels instant.
  for (const i of [cursor - 1, cursor + 1]) {
    const near = frames[sequence[i]!];
    if (near?.kind === 'image') new Image().src = near.src;
  }
}

function open(frameIndex: number) {
  const at = sequence.indexOf(frameIndex);
  if (at === -1) return;
  cursor = at;
  render();
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}

function step(by: number) {
  const to = cursor + by;
  if (to < 0 || to >= sequence.length) return;
  cursor = to;
  render();
}

for (const tile of tiles) {
  tile.querySelector('[data-open]')?.addEventListener('click', () => {
    open(Number(tile.dataset.index));
  });
}

btnPrev.addEventListener('click', () => step(-1));
btnNext.addEventListener('click', () => step(1));
btnClose.addEventListener('click', () => dialog.close());

dialog.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
});

// Click the backdrop (i.e. the dialog itself, outside the content) to dismiss.
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

dialog.addEventListener('close', () => {
  stage.replaceChildren();
  document.body.style.overflow = '';
});

/* --------------------------- hover video previews -------------------------- */

for (const video of document.querySelectorAll<HTMLVideoElement>('[data-hover-video]')) {
  const tile = video.closest('figure')!;
  tile.addEventListener('pointerenter', () => void video.play().catch(() => {}));
  tile.addEventListener('pointerleave', () => {
    video.pause();
    video.currentTime = 0;
  });
}

/* --------------------------------- boot ----------------------------------- */

const fromHash = location.hash.slice(1);
applyFilter(tabs.some((t) => t.dataset.filter === fromHash) ? fromHash : 'all');
