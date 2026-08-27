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

/** Re-fits the open embed when the viewport changes; null when none is open. */
let refit: (() => void) | null = null;

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
  } else if (frame.kind === 'embed') {
    // Wrap the iframe in a sized box: an iframe has no intrinsic size, so
    // without one it collapses the same way a metadata-less <video> does.
    const box = document.createElement('div');
    // Solid ground: a player that is slow or blocked would otherwise let the
    // blurred page show straight through the frame.
    box.className = 'overflow-hidden rounded-tile bg-ink';
    fitBox(box, frame.ratio ?? 16 / 9);
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
  // A closed <dialog> is display:none, so the stage measured 0x0 during
  // render(). Now that it is in the top layer, size the embed for real.
  refit?.();
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
  // Only tear down if the dialog really closed. A spurious `close` — Chrome
  // emits one when the top layer is disturbed, e.g. by a DevTools-protocol
  // screenshot — would otherwise blank a lightbox that is still on screen.
  if (dialog.open) return;
  refit = null;
  stage.replaceChildren();
  document.body.style.overflow = '';
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
    const pending = tiles.filter(
      (t) => !t.hidden && !t.classList.contains('is-visible') && t.getBoundingClientRect().top < innerHeight,
    );
    if (pending.length) revealBatch(pending);
  };

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
