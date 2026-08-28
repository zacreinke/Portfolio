/**
 * Behaviour for the local /curate tool. Never bundled into the portfolio —
 * the page that loads it only exists under `astro dev`.
 *
 * Everything here is an override written to curation.ts. work.ts is never
 * touched, so removing or combining a piece is always reversible.
 */
export {};

type Slide = { src: string; caption: string };
type Item = {
  id: string;
  title: string;
  caption: string;
  category: string;
  categoryLabel: string;
  thumb: string;
  slides: Slide[];
  count: number;
  combinable: boolean;
};
type Merge = {
  id: string;
  title: string;
  caption?: string;
  category?: string;
  members: string[];
};
type State = {
  highlights: string[];
  featured: Record<string, string[] | undefined>;
  hidden: string[];
  merges: Merge[];
  items: Item[];
  categories: { id: string; label: string }[];
};

const state = (window as unknown as { __CURATE__: State }).__CURATE__;
const byId = new Map(state.items.map((i) => [i.id, i]));

/** Working copy; the page is the only writer. */
const chosen: string[] = [...state.highlights];
const removed = new Set<string>(state.hidden);
const merges: Merge[] = state.merges.map((m) => ({ ...m, members: [...m.members] }));
const pinned = new Map<string, string[]>(
  Object.entries(state.featured).map(([cat, ids]) => [cat, [...(ids ?? [])]]),
);
const selected = new Set<string>();

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const chosenList = $('chosen');
const cards = [...document.querySelectorAll<HTMLElement>('[data-card]')];
const cardById = new Map(cards.map((c) => [c.dataset.id!, c]));
const bar = $('bar');
const viewer = $('viewer');
const search = $<HTMLInputElement>('search');
const mergeTitle = $<HTMLInputElement>('merge-title');
const mergeCat = $<HTMLSelectElement>('merge-cat');
const combineBtn = $<HTMLButtonElement>('combine');

/** Saved state, so the header can say when there is something to lose. */
let clean = JSON.stringify(payload());

const ownerOf = (id: string) => merges.find((m) => m.members.includes(id));
const isConsumed = (id: string) => removed.has(id) || ownerOf(id) !== undefined;
const isPinned = (id: string) =>
  (pinned.get(byId.get(id)!.category) ?? []).includes(id);

/* ----------------------------- mutations ---------------------------------- */

function toggleHighlight(id: string) {
  const at = chosen.indexOf(id);
  if (at === -1) chosen.push(id);
  else chosen.splice(at, 1);
  render();
}

function togglePin(id: string) {
  const cat = byId.get(id)!.category;
  const list = pinned.get(cat) ?? [];
  const at = list.indexOf(id);
  if (at === -1) list.push(id);
  else list.splice(at, 1);
  pinned.set(cat, list);
  render();
}

function toggleSelect(id: string) {
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  render();
}

function toggleRemove(id: string) {
  if (removed.has(id)) removed.delete(id);
  else removed.add(id);
  render();
}

/* ------------------------------- render ----------------------------------- */

function chip(label: string, onClick: () => void, thumb?: string) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className =
    'flex cursor-pointer items-center gap-2 rounded-full border border-line bg-card py-1 pr-3 pl-1 text-[12px] transition-colors hover:bg-pill';
  el.innerHTML =
    (thumb ? `<img src="${thumb}" alt="" class="size-7 rounded-full object-cover" />` : '') +
    `<span>${label}</span><span class="opacity-40">✕</span>`;
  el.addEventListener('click', onClick);
  return el;
}

function render() {
  // A removed or merged piece cannot also be a highlight or a pin.
  for (let i = chosen.length - 1; i >= 0; i--) if (isConsumed(chosen[i]!)) chosen.splice(i, 1);
  for (const [cat, ids] of pinned) pinned.set(cat, ids.filter((id) => !isConsumed(id)));

  $('count').textContent = `${chosen.length} in highlights`;
  $('dirty').hidden = JSON.stringify(payload()) === clean;

  chosenList.replaceChildren(
    ...chosen.map((id, i) => {
      const item = byId.get(id)!;
      const li = document.createElement('li');
      li.draggable = true;
      li.dataset.id = id;
      li.className =
        'flex cursor-grab items-center gap-2 rounded-full border border-line bg-card py-1 pr-2 pl-1 text-[12px] active:cursor-grabbing';
      li.innerHTML =
        `<img src="${item.thumb}" alt="" class="size-7 rounded-full object-cover" />` +
        `<span class="font-semibold tabular-nums opacity-45">${i + 1}</span>` +
        `<span>${item.title}</span>`;
      const x = document.createElement('button');
      x.type = 'button';
      x.textContent = '✕';
      x.className = 'cursor-pointer px-1 opacity-40 hover:opacity-100';
      x.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHighlight(id);
      });
      li.append(x);
      return li;
    }),
  );

  $('merged').replaceChildren(
    ...merges.map((m) =>
      chip(`${m.title} · ${m.members.length}`, () => {
        merges.splice(merges.indexOf(m), 1);
        render();
      }, byId.get(m.members[0]!)?.thumb),
    ),
  );
  $('merged-wrap').hidden = merges.length === 0;

  $('removed').replaceChildren(
    ...[...removed].map((id) =>
      chip(byId.get(id)?.title ?? id, () => toggleRemove(id), byId.get(id)?.thumb),
    ),
  );
  $('removed-wrap').hidden = removed.size === 0;

  const q = search.value.trim().toLowerCase();
  let shown = 0;
  for (const card of cards) {
    const id = card.dataset.id!;
    const gone = removed.has(id) || ownerOf(id) !== undefined;
    const matches = !q || card.dataset.title!.includes(q);
    card.hidden = gone || !matches;
    if (!card.hidden) shown++;

    const rank = chosen.indexOf(id);
    const open = card.querySelector<HTMLElement>('[data-open]')!;
    const badge = card.querySelector<HTMLElement>('[data-badge]')!;

    open.classList.toggle('border-ink', rank !== -1);
    open.classList.toggle('border-line', rank === -1);
    card.style.opacity = rank === -1 ? '0.68' : '1';
    badge.classList.toggle('hidden', rank === -1);
    badge.classList.toggle('flex', rank !== -1);
    badge.textContent = String(rank + 1);

    card.querySelector<HTMLElement>('[data-pinned]')!.hidden = !isPinned(id);
    mark(card.querySelector<HTMLElement>('[data-hl]')!, rank !== -1);
    mark(card.querySelector<HTMLElement>('[data-pin]')!, isPinned(id));

    const sel = card.querySelector<HTMLElement>('[data-select]')!;
    sel.textContent = selected.has(id) ? '✓' : '';
    mark(sel, selected.has(id));
  }
  for (const section of document.querySelectorAll<HTMLElement>('[data-section]')) {
    section.hidden = !section.querySelector('[data-card]:not([hidden])');
  }
  $('empty').hidden = shown > 0;

  renderBar();
  if (!viewer.hidden) paintViewer();
}

/** A control that reflects an on/off state. */
function mark(el: HTMLElement, on: boolean) {
  el.classList.toggle('bg-card', on);
  el.classList.toggle('text-ink', on);
  el.classList.toggle('bg-ink/45', !on);
  el.classList.toggle('text-card', !on);
}

function renderBar() {
  bar.hidden = selected.size === 0;
  if (!selected.size) return;
  const picked = [...selected].map((id) => byId.get(id)!);
  const blocked = picked.filter((i) => !i.combinable);
  $('selcount').textContent = `${selected.size} selected`;
  combineBtn.disabled = selected.size < 2 || blocked.length > 0;
  $('bar-note').textContent = blocked.length
    ? `${blocked.map((i) => i.title).join(', ')} — a video or embed can't be a carousel slide, so it can only be removed`
    : selected.size < 2
      ? 'select two or more to combine'
      : '';
  if (!mergeCat.dataset.touched) mergeCat.value = picked[0]!.category;
}

/* ------------------------------- viewer ----------------------------------- */

/** The pieces the viewer walks: whatever the grid is currently showing. */
let order: string[] = [];
let at = 0;
let slide = 0;

function openViewer(id: string) {
  order = cards.filter((c) => !c.hidden).map((c) => c.dataset.id!);
  at = Math.max(0, order.indexOf(id));
  slide = 0;
  viewer.hidden = false;
  document.body.style.overflow = 'hidden';
  paintViewer();
}

function closeViewer() {
  viewer.hidden = true;
  document.body.style.overflow = '';
  cardById.get(order[at]!)?.scrollIntoView({ block: 'center' });
}

function step(delta: number) {
  if (!order.length) return;
  at = (at + delta + order.length) % order.length;
  slide = 0;
  paintViewer();
}

function paintViewer() {
  const id = order[at];
  if (!id || !byId.has(id)) return closeViewer();
  const item = byId.get(id)!;
  slide = Math.min(slide, item.slides.length - 1);

  $<HTMLImageElement>('v-img').src = item.slides[slide]!.src;
  $('v-pos').textContent = `${at + 1} / ${order.length}`;
  $('v-cat').textContent = item.categoryLabel;
  $('v-title').textContent = item.title;
  $('v-cap').textContent = item.slides[slide]!.caption || item.caption;

  const rank = chosen.indexOf(id);
  vmark('hl', rank !== -1, rank !== -1 ? `★ Highlight ${rank + 1}` : '★ Highlight');
  vmark('pin', isPinned(id));
  vmark('sel', selected.has(id));
  vmark('rm', removed.has(id));

  const strip = $('v-thumbs');
  strip.replaceChildren(
    ...item.slides.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `size-11 shrink-0 overflow-hidden rounded-[7px] border-2 ${
        i === slide ? 'border-card' : 'border-transparent opacity-55'
      }`;
      b.innerHTML = `<img src="${s.src}" alt="" class="size-full object-cover" />`;
      b.addEventListener('click', () => {
        slide = i;
        paintViewer();
      });
      return b;
    }),
  );
  strip.hidden = item.slides.length < 2;
}

function vmark(key: string, on: boolean, label?: string) {
  const el = viewer.querySelector<HTMLElement>(`[data-v="${key}"]`)!;
  if (label) el.childNodes[0]!.nodeValue = `${label} `;
  el.classList.toggle('bg-card', on);
  el.classList.toggle('text-ink', on);
}

viewer.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-v]');
  if (!btn) return;
  const id = order[at]!;
  const act = btn.dataset.v!;
  if (act === 'close') closeViewer();
  else if (act === 'prev') step(-1);
  else if (act === 'next') step(1);
  else if (act === 'hl') toggleHighlight(id);
  else if (act === 'pin') togglePin(id);
  else if (act === 'sel') toggleSelect(id);
  else if (act === 'rm') {
    toggleRemove(id);
    // Removing drops it out of `order`, so land on the next piece rather than
    // a dead index.
    order = order.filter((x) => x !== id);
    at = Math.min(at, Math.max(0, order.length - 1));
    order.length ? paintViewer() : closeViewer();
  }
});

/* ------------------------------ keyboard ---------------------------------- */

addEventListener('keydown', (e) => {
  const typing = /^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement).tagName);
  if (typing) {
    if (e.key === 'Escape') (e.target as HTMLElement).blur();
    return;
  }
  if (e.key === '/') {
    e.preventDefault();
    search.focus();
    return;
  }
  if (viewer.hidden) return;
  const id = order[at];
  if (!id) return;
  const map: Record<string, () => void> = {
    Escape: closeViewer,
    ArrowLeft: () => step(-1),
    ArrowRight: () => step(1),
    ArrowUp: () => {
      slide = Math.max(0, slide - 1);
      paintViewer();
    },
    ArrowDown: () => {
      slide = Math.min(byId.get(id)!.slides.length - 1, slide + 1);
      paintViewer();
    },
    h: () => toggleHighlight(id),
    p: () => togglePin(id),
    s: () => toggleSelect(id),
    x: () => {
      toggleRemove(id);
      order = order.filter((v) => v !== id);
      at = Math.min(at, Math.max(0, order.length - 1));
      order.length ? paintViewer() : closeViewer();
    },
  };
  const fn = map[e.key] ?? map[e.key.toLowerCase()];
  if (fn) {
    e.preventDefault();
    fn();
  }
});

/* ------------------------------ card wiring -------------------------------- */

for (const card of cards) {
  const id = card.dataset.id!;
  card.querySelector('[data-open]')!.addEventListener('click', () => openViewer(id));
  card.querySelector('[data-hl]')!.addEventListener('click', () => toggleHighlight(id));
  card.querySelector('[data-pin]')!.addEventListener('click', () => togglePin(id));
  card.querySelector('[data-select]')!.addEventListener('click', () => toggleSelect(id));
  card.querySelector('[data-remove]')!.addEventListener('click', () => toggleRemove(id));
}

search.addEventListener('input', render);

mergeCat.addEventListener('change', () => {
  mergeCat.dataset.touched = '1';
});

$('clear').addEventListener('click', () => {
  selected.clear();
  render();
});

$('remove').addEventListener('click', () => {
  for (const id of selected) removed.add(id);
  selected.clear();
  render();
});

$('combine').addEventListener('click', () => {
  const members = cards.map((c) => c.dataset.id!).filter((id) => selected.has(id));
  const title = mergeTitle.value.trim();
  if (members.length < 2 || !title) return flash('give the combined piece a title', false);
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 44) || 'combined';
  let id = base;
  let n = 2;
  while (byId.has(id) || merges.some((m) => m.id === id)) id = `${base}-${n++}`;
  merges.push({ id, title, category: mergeCat.value, members });
  selected.clear();
  mergeTitle.value = '';
  delete mergeCat.dataset.touched;
  render();
  flash(`combined ${members.length} into "${title}"`);
});

/* Drag to reorder the chosen list. Plain HTML5 drag and drop — the list is
   short enough that reordering on dragover and repainting is smooth. */
let dragging: string | null = null;
chosenList.addEventListener('dragstart', (e) => {
  const li = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
  if (!li) return;
  dragging = li.dataset.id!;
  e.dataTransfer?.setData('text/plain', dragging);
});
chosenList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const over = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
  if (!over || !dragging || over.dataset.id === dragging) return;
  const from = chosen.indexOf(dragging);
  const to = chosen.indexOf(over.dataset.id!);
  if (from === -1 || to === -1) return;
  chosen.splice(to, 0, ...chosen.splice(from, 1));
  render();
});
chosenList.addEventListener('drop', (e) => e.preventDefault());
chosenList.addEventListener('dragend', () => {
  dragging = null;
});

/* -------------------------------- saving ---------------------------------- */

function payload() {
  const featured: Record<string, string[]> = {};
  for (const [cat, ids] of pinned) if (ids.length) featured[cat] = ids;
  return { highlights: chosen, featured, hidden: [...removed], merges };
}

function flash(msg: string, ok = true) {
  const el = $('status');
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.color = ok ? '' : '#b00';
  setTimeout(() => {
    el.style.opacity = '0';
  }, 2600);
}

$('save').addEventListener('click', async () => {
  try {
    const body = JSON.stringify(payload());
    const res = await fetch('/__curate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const out = await res.json();
    if (!out.ok) throw new Error(out.error);
    clean = body;
    render();
    flash('saved to curation.ts');
  } catch (err) {
    flash(`save failed — ${err}`, false);
  }
});

$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(payload(), null, 2));
    flash('copied');
  } catch {
    flash('clipboard blocked — use Save', false);
  }
});

addEventListener('beforeunload', (e) => {
  if (JSON.stringify(payload()) !== clean) e.preventDefault();
});

render();
