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
  thumb: string;
  width: number;
  height: number;
  slide: number;
  slides: number;
  ratio?: number;
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

/** Assigned once the reveal observer is armed; a no-op before that. */
let revealInView: () => void = () => {};

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

  // Filtering reflows the columns, so tiles that were below the fold a moment
  // ago may now be on screen. Called synchronously rather than via rAF, which
  // never fires while the tab is in the background.
  revealInView();
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
  } else if (frame.kind === 'embed') {
    // Wrap the iframe in a ratio box: an iframe has no intrinsic size, so
    // without one it collapses the same way a metadata-less <video> does.
    const box = document.createElement('div');
    // Solid ground: a player that is slow or blocked would otherwise let the
    // blurred page show straight through the frame.
    box.className = 'w-full max-w-5xl overflow-hidden rounded-card bg-ink';
    box.style.aspectRatio = String(frame.ratio ?? 16 / 9);
    const iframe = document.createElement('iframe');
    iframe.src = frame.src;
    iframe.title = frame.title;
    iframe.className = 'size-full border-0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    box.append(iframe);
    stage.append(box);
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
    open(Number(tile.dataset.index) + Number(tile.dataset.offset ?? 0));
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

/* ------------------------ in-tile carousel paging -------------------------- */

// Page a carousel inside its tile, without opening the lightbox. Each tile
// tracks its own offset from the item's first frame.
for (const tile of tiles) {
  const total = Number(tile.dataset.slides ?? 1);
  if (total < 2) continue;

  const base = Number(tile.dataset.index);
  const cover = tile.querySelector<HTMLImageElement>('[data-cover]');
  if (!cover) continue;

  let at = 0;
  const page = (by: number) => {
    at = (at + by + total) % total;
    const frame = frames[base + at];
    if (!frame) return;
    // srcset would otherwise keep overriding the src we just set.
    cover.removeAttribute('srcset');
    cover.removeAttribute('sizes');
    cover.src = frame.thumb;
    cover.alt = frame.caption;
  };

  for (const [sel, dir] of [['[data-tile-prev]', -1], ['[data-tile-next]', 1]] as const) {
    tile.querySelector(sel)?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      page(dir);
    });
  }

  // Opening the lightbox should start on whatever slide is showing.
  tile.querySelector('[data-open]')?.addEventListener(
    'click',
    () => { tile.dataset.offset = String(at); },
    true,
  );
}

/* ------------------------------ scroll reveal ------------------------------ */

if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-reveal');

  /** Stagger a batch the way the masonry reads: down a column, then across. */
  const revealBatch = (els: HTMLElement[]) => {
    els
      .sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return ra.left - rb.left || ra.top - rb.top;
      })
      .forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i * 55, 420)}ms`;
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
  };

  const observer = new IntersectionObserver(
    (entries) => revealBatch(entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement)),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  // IntersectionObserver reports position at one instant. Images finishing and
  // filters reflowing both move tiles afterwards, and a tile that ends up on
  // screen without ever crossing the boundary would stay invisible forever.
  revealInView = () => {
    const pending = tiles.filter(
      (t) => !t.hidden && !t.classList.contains('is-visible') && t.getBoundingClientRect().top < innerHeight,
    );
    if (pending.length) revealBatch(pending);
  };

  // Wait for the intro to clear — otherwise the tiles above the fold finish
  // fading in while the red overlay is still covering them.
  const startReveal = () => {
    for (const tile of tiles) observer.observe(tile);
    revealInView();
  };
  if (document.getElementById('loader')) {
    document.addEventListener('loader:done', startReveal, { once: true });
  } else {
    startReveal();
  }

  addEventListener('load', revealInView);
  addEventListener('resize', revealInView);
  // A tab loaded in the background gets no rAF and no paint; catch up on return.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') revealInView();
  });
}

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
