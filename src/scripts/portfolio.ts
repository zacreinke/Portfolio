// Marks this file as a module. Without it TS treats it as a global script and
// `frames` collides with `window.frames`.
export {};

type Frame = {
  itemId: string;
  category: string;
  categoryLabel: string;
  title: string;
  caption: string;
  kind: 'image' | 'video' | 'embed' | 'model' | 'doc';
  src: string;
  thumb?: string;
  width: number;
  height: number;
  slide: number;
  slides: number;
  chip: string;
  ratio?: number;
  parts?: { label: string; src: string }[];
  pages?: { src: string; width: number; height: number }[];
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
const elThumbs = $('lb-thumbs');
const btnPrev = $<HTMLButtonElement>('lb-prev');
const btnNext = $<HTMLButtonElement>('lb-next');
const btnClose = $<HTMLButtonElement>('lb-close');

/* ------------------------------- filtering -------------------------------- */

/** Assigned once the reveal observer is armed; a no-op before that. */
let revealInView: () => void = () => {};

/** Re-packs the masonry columns for the current filter and viewport. */
let layout: () => void = () => {};

/** Clears the revealed state so the fade-up can play again; null if disarmed. */
let resetReveal: (() => void) | null = null;

/** Indices into `frames`, narrowed to the active tab. The lightbox never
 *  navigates outside this sequence. */
let sequence: number[] = frames.map((_, i) => i);
let cursor = 0;

function applyFilter(next: string, animate = false) {
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

  // Switching tabs replays the fade-up: wind every tile back to hidden, re-pack,
  // then reveal. Reading offsetHeight in between forces the style change to
  // land, so the transition restarts instead of being coalesced away.
  if (animate) resetReveal?.();
  layout();
  if (animate) void document.body.offsetHeight;
  revealInView();
}

tabsBar.addEventListener('click', (e) => {
  const tab = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter]');
  if (tab) applyFilter(tab.dataset.filter!, true);
});

// Roving tabindex — arrow keys move along the tab bar, as a tablist should.
tabsBar.addEventListener('keydown', (e) => {
  const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  if (!dir) return;
  e.preventDefault();
  const at = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  const to = tabs[(at + dir + tabs.length) % tabs.length]!;
  applyFilter(to.dataset.filter!, true);
  to.focus();
});

/* --------------------------- tab overflow affordance ----------------------- */

// Seven tabs outrun a narrow viewport. Show the fade only while there is more
// row to reach, and drop it once you get to the end.
const tabsFade = document.getElementById('tabs-fade');
if (tabsFade) {
  const syncFade = () => {
    const max = tabsBar.scrollWidth - tabsBar.clientWidth;
    const more = max > 1 && tabsBar.scrollLeft < max - 1;
    tabsFade.style.opacity = more ? '1' : '0';
  };
  tabsBar.addEventListener('scroll', syncFade, { passive: true });
  addEventListener('resize', syncFade);
  addEventListener('load', syncFade);
  syncFade();
}

/* ------------------------------- lightbox --------------------------------- */

/**
 * Ask a hosted player to start on its own. The lightbox only ever opens from a
 * click, so the gesture that permits autoplay has already happened — the iframe
 * carries allow="autoplay" to inherit it.
 */
function autoplay(src: string): string {
  const url = new URL(src);
  if (url.hostname.endsWith('soundcloud.com')) url.searchParams.set('auto_play', 'true');
  else url.searchParams.set('autoplay', '1');
  return url.href;
}

/** Re-fits the open embed when the viewport changes; null when none is open. */
let refit: (() => void) | null = null;

/**
 * model-viewer is ~283KB gzipped, so it is only fetched the first time someone
 * actually opens a model. The element upgrades retroactively once the module
 * defines it, so it can be in the DOM before this resolves.
 */
let viewerLoaded: Promise<unknown> | null = null;
const loadViewer = () => (viewerLoaded ??= import('@google/model-viewer'));

/**
 * Size an embed to fit inside the stage.
 *
 * CSS can't do this on its own here: a div has no intrinsic size, so one axis
 * has to be definite — and the moment a max-* constraint binds against a
 * definite axis, `aspect-ratio` is dropped rather than preserved. That put a
 * 16:9 video in a 1024xfull-height box and let the player letterbox inside it.
 * Computing the fit is exact for landscape, portrait and square alike.
 */
function fitBox(box: HTMLElement, ratio: number) {
  const apply = () => {
    const stageBox = stage.getBoundingClientRect();
    let w = Math.min(stageBox.width, 1024);
    let h = w / ratio;
    if (h > stageBox.height) {
      h = stageBox.height;
      w = h * ratio;
    }
    box.style.width = `${Math.round(w)}px`;
    box.style.height = `${Math.round(h)}px`;
  };
  apply();
  refit = apply;
}

addEventListener('resize', () => refit?.());

function render() {
  refit = null;
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
    video.className = 'max-h-full max-w-full rounded-tile object-contain';
    stage.append(video);
  } else if (frame.kind === 'doc' && frame.pages) {
    // A document is read by scrolling, not by arrowing page to page. Pages stack
    // in one column; overscroll-contain keeps a flick at the end from chaining
    // out to whatever is behind the dialog.
    const doc = document.createElement('div');
    doc.className =
      'h-full w-full max-w-3xl overflow-y-auto overscroll-contain rounded-tile bg-card';
    doc.tabIndex = 0;
    doc.setAttribute('aria-label', `${frame.title}, ${frame.pages.length} pages`);
    frame.pages.forEach((page, i) => {
      const img = new Image();
      img.src = page.src;
      img.alt = `${frame.title} — page ${i + 1}`;
      img.width = page.width;
      img.height = page.height;
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.className = 'block h-auto w-full';
      doc.append(img);
    });
    stage.append(doc);
    doc.focus({ preventScroll: true });
  } else if (frame.kind === 'model') {
    const box = document.createElement('div');
    box.className = 'relative overflow-hidden rounded-tile bg-card';
    fitBox(box, 1);
    const viewer = document.createElement('model-viewer');
    viewer.setAttribute('src', frame.src);
    viewer.setAttribute('alt', frame.title);
    // The viewer only ever exists inside an already-open lightbox, so there is
    // nothing to defer for — and lazy loading stalls outright when the
    // element's intersection never gets reported.
    viewer.setAttribute('loading', 'eager');
    viewer.setAttribute('reveal', 'auto');
    viewer.setAttribute('camera-controls', '');
    viewer.setAttribute('auto-rotate', '');
    viewer.setAttribute('rotation-per-second', '18deg');
    viewer.setAttribute('interaction-prompt', 'none');
    viewer.setAttribute('environment-image', 'neutral');
    // The neutral environment is bright; pull exposure back so the grey resin
    // material keeps its form instead of blowing out to white.
    viewer.setAttribute('exposure', '0.75');
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('touch-action', 'none');
    viewer.style.width = '100%';
    viewer.style.height = '100%';
    viewer.style.setProperty('--poster-color', 'transparent');
    box.append(viewer);

    // Multi-part prints let you pick a body. A real <select> so phones get the
    // native picker and it stays keyboard-reachable.
    if (frame.parts && frame.parts.length > 1) {
      const picker = document.createElement('select');
      picker.className =
        'label-caps absolute top-3 left-3 z-10 cursor-pointer rounded-full border border-line ' +
        'bg-page/90 py-2 pr-8 pl-4 text-ink backdrop-blur-sm';
      picker.setAttribute('aria-label', `Part of ${frame.title}`);
      for (const part of frame.parts) {
        const option = document.createElement('option');
        option.value = part.src;
        option.textContent = part.label;
        picker.append(option);
      }
      picker.addEventListener('change', () => {
        viewer.setAttribute('src', picker.value);
      });
      box.append(picker);
    }

    stage.append(box);
    void loadViewer();
  } else if (frame.kind === 'embed') {
    // Wrap the iframe in a sized box: an iframe has no intrinsic size, so
    // without one it collapses the same way a metadata-less <video> does.
    const box = document.createElement('div');
    // Solid ground: a player that is slow or blocked would otherwise let the
    // blurred page show straight through the frame.
    box.className = 'overflow-hidden rounded-tile bg-ink';
    fitBox(box, frame.ratio ?? 16 / 9);
    const iframe = document.createElement('iframe');
    iframe.src = autoplay(frame.src);
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
    // w-auto/h-auto matter: the width/height attributes above would otherwise
    // give the box a definite size on both axes, so max-w/max-h would clamp
    // each independently and object-contain would letterbox — leaving the
    // artwork square-cornered inside a rounded box. Auto lets the intrinsic
    // ratio drive the box, so the radius lands on the image itself.
    image.className = 'h-auto w-auto max-h-full max-w-full rounded-tile object-contain';
    stage.append(image);
  }

  elTitle.textContent = frame.title;
  elCaption.textContent = frame.caption;
  elCategory.textContent = frame.categoryLabel;
  elCounter.textContent = `${cursor + 1} / ${sequence.length}`;

  // Thumbnail strip for the item being viewed; a single-slide item gets none.
  elThumbs.replaceChildren();
  if (frame.slides > 1) {
    let start = sequence[cursor]!;
    while (start > 0 && frames[start - 1]!.itemId === frame.itemId) start--;

    for (let i = start; i < frames.length && frames[i]!.itemId === frame.itemId; i++) {
      const at = sequence.indexOf(i);
      if (at === -1) continue;
      const current = i === sequence[cursor];
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className =
        'size-11 shrink-0 cursor-pointer overflow-hidden rounded-md transition-opacity ' +
        'duration-200 ' +
        (current ? 'opacity-100 ring-2 ring-card' : 'opacity-45 hover:opacity-80');
      chip.setAttribute('aria-label', frames[i]!.caption);
      if (current) chip.setAttribute('aria-current', 'true');
      const img = new Image();
      img.src = frames[i]!.chip;
      img.alt = '';
      // Eager: these are ~200px wide and the strip is already on screen, so
      // deferring them buys nothing and risks a row of blank squares wherever
      // the intersection never gets reported.
      img.loading = 'eager';
      img.decoding = 'async';
      img.className = 'size-full object-cover';
      chip.append(img);
      chip.addEventListener('click', () => {
        cursor = at;
        render();
      });
      elThumbs.append(chip);
      if (current) chip.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }

  // Arrows are hidden at the ends rather than disabled.
  btnPrev.hidden = cursor === 0;
  btnNext.hidden = cursor === sequence.length - 1;

  // Warm the neighbours so arrowing through feels instant.
  for (const i of [cursor - 1, cursor + 1]) {
    const near = frames[sequence[i]!];
    if (near?.kind === 'image') new Image().src = near.src;
    if (near?.kind === 'model') void loadViewer();
  }
}

function open(frameIndex: number) {
  const at = sequence.indexOf(frameIndex);
  if (at === -1) return;
  cursor = at;
  render();
  dialog.showModal();
  // A closed <dialog> is display:none, so the stage measured 0x0 during
  // render(). Now that it is in the top layer, size the embed for real.
  refit?.();
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
  // Only tear down if the dialog really closed. A spurious `close` — Chrome
  // emits one when the top layer is disturbed, e.g. by a DevTools-protocol
  // screenshot — would otherwise blank a lightbox that is still on screen.
  if (dialog.open) return;
  refit = null;
  stage.replaceChildren();
});

/* --------------------------------- masonry --------------------------------- */

// CSS multi-column balances by height, so a trailing column can come up empty
// (nine similar tiles across four columns render 3/3/3/0). Place tiles by hand
// instead: fixed column count, and each tile goes to the shortest column.
// Heights come from each cover's aspect ratio, so this never waits on images.
{
  const grid = document.querySelector<HTMLElement>('.masonry');
  if (grid) {
    // Never drop to one column — two keeps the grid reading as a grid on phones.
    const columnsFor = (w: number) => (w >= 1280 ? 4 : w >= 1024 ? 3 : 2);
    let columnCount = 0;

    layout = () => {
      const wanted = columnsFor(innerWidth);
      const visible = tiles.filter((t) => !t.hidden);

      if (wanted !== columnCount) {
        columnCount = wanted;
        grid.replaceChildren();
        for (let i = 0; i < wanted; i++) {
          const col = document.createElement('div');
          col.className = 'masonry-col';
          grid.append(col);
        }
      }

      const cols = [...grid.children] as HTMLElement[];
      for (const col of cols) col.replaceChildren();

      // Relative heights only — the unit cancels out, since every column is
      // the same width. A tile is 1/ratio tall plus a constant for the gap.
      const heights = new Array(cols.length).fill(0);
      for (const tile of visible) {
        let shortest = 0;
        for (let i = 1; i < heights.length; i++) {
          if (heights[i] < heights[shortest]) shortest = i;
        }
        cols[shortest]!.append(tile);
        heights[shortest] += 1 / (Number(tile.dataset.ratio) || 1) + 0.06;
      }
    };

    grid.classList.add('masonry--js');
    layout();
    addEventListener('resize', () => {
      layout();
      revealInView();
    });
  }
}

/* --------------------------- carousel auto-advance ------------------------- */

/**
 * Carousel tiles cycle their stills in the grid, sliding right to left inside a
 * frame that never changes size.
 *
 * Only one tile changes at a time. An earlier version gave every tile its own
 * phase and spaced those phases as widely as possible, which is exactly wrong:
 * perfectly spread phases guarantee that something is always moving, so the
 * grid never rests. Here a single scheduler grants one change every GAP ms to
 * the tile that has waited longest, preferring one away from the last change.
 * The grid is still, one tile turns over, the grid is still again.
 */
{
  const GAP = 2800; // ms between changes anywhere in the grid
  const MIN_HOLD = 14000; // ms a tile holds a slide before it may change again
  const MAX_ACTIVE = 2; // hard ceiling on tiles mid-swap at once
  const APART = 520; // px: prefer the next change away from the last one
  const SLIDE = 620; // ms the swap takes

  type Rotator = {
    tile: HTMLElement;
    frames: number[]; // indices into `frames`, image slides only
    slots: [HTMLImageElement, HTMLImageElement];
    showing: 0 | 1;
    at: number;
    last: number; // performance.now() of its last change
    busy: boolean;
    paused: boolean;
  };

  const rotators: Rotator[] = [];

  for (const tile of tiles) {
    const base = Number(tile.dataset.index);
    const total = Number(frames[base]?.slides ?? 1);
    if (total < 2) continue;

    // Only stills rotate — a model, document or player is not something to flip past.
    const own: number[] = [];
    for (let i = base; i < base + total && i < frames.length; i++) {
      if (frames[i]!.kind === 'image' && frames[i]!.thumb) own.push(i);
    }
    if (own.length < 2) continue;

    const media = tile.querySelector<HTMLElement>('[data-media]');
    const first = media?.querySelector('img');
    if (!media || !first) continue;

    const second = document.createElement('img');
    second.className = first.className;
    second.alt = '';
    second.setAttribute('aria-hidden', 'true');
    second.decoding = 'async';
    second.style.transform = 'translateX(100%)';
    media.append(second);

    const rot: Rotator = {
      tile, frames: own, slots: [first as HTMLImageElement, second],
      showing: 0, at: 0, last: 0, busy: false, paused: false,
    };
    // Hovering brings up the fan; rotating underneath it reads as noise.
    tile.addEventListener('pointerenter', () => { rot.paused = true; });
    tile.addEventListener('pointerleave', () => { rot.paused = false; });
    rotators.push(rot);
  }

  /** Centre of a tile in viewport coordinates. */
  const centreOf = (rot: Rotator) => {
    const b = rot.tile.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2, top: b.top, bottom: b.bottom };
  };

  const advance = (rot: Rotator) => {
    rot.busy = true;
    const next = (rot.at + 1) % rot.frames.length;
    const incoming = rot.slots[rot.showing === 0 ? 1 : 0];
    const outgoing = rot.slots[rot.showing];
    incoming.src = frames[rot.frames[next]!]!.thumb!;

    const run = () => {
      // Park the incoming slide off to the right with no transition, force the
      // style to land, then move both in the same frame.
      incoming.style.transition = 'none';
      incoming.style.transform = 'translateX(100%)';
      void incoming.offsetWidth;
      const ease = `transform ${SLIDE}ms cubic-bezier(0.65, 0, 0.35, 1)`;
      incoming.style.transition = ease;
      outgoing.style.transition = ease;
      incoming.style.transform = 'translateX(0)';
      outgoing.style.transform = 'translateX(-100%)';
      rot.showing = rot.showing === 0 ? 1 : 0;
      rot.at = next;
      // Opening the lightbox should land on whatever is showing.
      rot.tile.dataset.offset = String(rot.frames[next]! - Number(rot.tile.dataset.index));
      setTimeout(() => { rot.busy = false; }, SLIDE);
    };

    // Decode first so a slow image never slides in half-painted — but race it
    // against a deadline. decode() can hang indefinitely (a backgrounded tab
    // never resolves it), and waiting forever would stop the tile for good.
    const decoded = incoming.decode ? incoming.decode().catch(() => {}) : Promise.resolve();
    let ran = false;
    const once = () => { if (!ran) { ran = true; run(); } };
    decoded.then(once);
    setTimeout(once, 400);
  };

  let nextChange = 0;
  let lastCentre: { x: number; y: number } | null = null;

  const tick = () => {
    const now = performance.now();
    if (now < nextChange) return;
    if (rotators.reduce((n, r) => n + (r.busy ? 1 : 0), 0) >= MAX_ACTIVE) return;

    // A tile is a candidate only if it is on screen, settled, and not hovered —
    // the fan is up on hover and rotating underneath it reads as noise.
    const ready: { rot: Rotator; c: ReturnType<typeof centreOf> }[] = [];
    for (const rot of rotators) {
      if (rot.busy || rot.paused || rot.tile.hidden) continue;
      if (now - rot.last < MIN_HOLD) continue;
      const c = centreOf(rot);
      if (c.bottom < 0 || c.top > innerHeight) continue;
      ready.push({ rot, c });
    }
    if (!ready.length) {
      nextChange = now + GAP;
      return;
    }

    // Longest-waiting first, then step past any that sit on top of the last
    // change so two consecutive changes are not in the same corner.
    ready.sort((a, b) => a.rot.last - b.rot.last);
    let pick = ready[0]!;
    if (lastCentre) {
      const far = ready.find(
        (r) => Math.hypot(r.c.x - lastCentre!.x, r.c.y - lastCentre!.y) > APART,
      );
      if (far) pick = far;
    }

    advance(pick.rot);
    pick.rot.last = now;
    lastCentre = { x: pick.c.x, y: pick.c.y };
    nextChange = now + GAP;
  };

  if (rotators.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const start = performance.now();
    // Spread the initial waits a little so the first few changes do not simply
    // walk the grid in DOM order.
    rotators.forEach((r, i) => { r.last = start - MIN_HOLD + ((i * 2129) % 900); });
    nextChange = start + 3000; // let the page settle before anything moves
    setInterval(tick, 200);
  }
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
  resetReveal = () => {
    for (const tile of tiles) {
      tile.classList.remove('is-visible');
      tile.style.transitionDelay = '';
      // Re-observe: tiles are unobserved once revealed, and a tile that is
      // off-screen now may scroll into view under the new filter.
      observer.observe(tile);
    }
  };

  revealInView = () => {
    // Same trigger line as the observer's -8% bottom margin, so a tile reveals
    // at the same point whichever path gets to it first.
    const trigger = innerHeight * 0.92;
    const pending = tiles.filter(
      (t) => !t.hidden && !t.classList.contains('is-visible') && t.getBoundingClientRect().top < trigger,
    );
    if (pending.length) revealBatch(pending);
  };

  // Safety net. IntersectionObserver reports a position at one instant and can
  // miss entries under a throttled or backgrounded tab; a cheap throttled sweep
  // guarantees nothing is left stranded at opacity 0.
  let lastSweep = 0;
  window.addEventListener(
    'scroll',
    () => {
      const now = performance.now();
      if (now - lastSweep < 150) return;
      lastSweep = now;
      revealInView();
    },
    { passive: true },
  );

  // Wait for the intro to clear — otherwise the tiles above the fold finish
  // fading in while the red overlay is still covering them.
  const startReveal = () => {
    layout();
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
