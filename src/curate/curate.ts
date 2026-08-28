/**
 * The curation board. Never bundled into the portfolio — the page that loads
 * it only exists under `astro dev`.
 *
 * State is one flat model: which column each piece sits in, the order within
 * that column, which pieces are combined, and the Highlights list. Every drop
 * mutates that model and repaints; nothing is clever about diffing, because at
 * 180 cards it does not need to be.
 *
 * Everything written here is an override in curation.ts. work.ts is never
 * touched, so every move is reversible.
 */
export {};

type Slide = { src: string; caption: string };
type Card = {
  id: string;
  title: string;
  category: string;
  kind: string;
  thumb: string;
  slides: Slide[];
  count: number;
  splittable: boolean;
  combinable: boolean;
};
type Merge = { id: string; title: string; category?: string; members: string[] };
type State = {
  highlights: string[];
  featured: Record<string, string[] | undefined>;
  hidden: string[];
  merges: Merge[];
  moves: Record<string, string>;
  splits: string[];
  cards: Card[];
  columns: { id: string; label: string }[];
};

const ARCHIVE = '__archive';
const HIGHLIGHTS = '__highlights';

const state = (window as unknown as { __CURATE__: State }).__CURATE__;
const base = new Map(state.cards.map((c) => [c.id, c]));

/* ------------------------------- the model -------------------------------- */

/** A merged card, held as data rather than as an entry in `base`. */
type Combo = { id: string; title: string; column: string; members: string[] };

let combos: Combo[] = state.merges.map((m) => ({
  id: m.id,
  title: m.title,
  column: m.category ?? base.get(m.members[0]!)?.category ?? state.columns[0]!.id,
  members: [...m.members],
}));

/** Column each card sits in. A combo's members have no column of their own. */
const column = new Map<string, string>();
for (const card of state.cards) column.set(card.id, state.moves[card.id] ?? card.category);
for (const id of state.hidden) column.set(id, ARCHIVE);

/** Order within each column, holding card ids and combo ids alike. */
const order = new Map<string, string[]>();
let highlights: string[] = [...state.highlights];
const splits = new Set(state.splits);

const comboOf = (id: string) => combos.find((c) => c.members.includes(id));
const isCombo = (id: string) => combos.some((c) => c.id === id);
const titleOf = (id: string) =>
  combos.find((c) => c.id === id)?.title ?? base.get(id)?.title ?? id;
const thumbOf = (id: string) => {
  const combo = combos.find((c) => c.id === id);
  return base.get(combo ? combo.members[0]! : id)?.thumb ?? '';
};
const countOf = (id: string) => {
  const combo = combos.find((c) => c.id === id);
  if (!combo) return base.get(id)?.count ?? 1;
  return combo.members.reduce((n, m) => n + (base.get(m)?.count ?? 1), 0);
};

/** Everything the board should show in a column, combos standing in for members. */
function membersOf(col: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const card of state.cards) {
    const owner = comboOf(card.id);
    const id = owner ? owner.id : card.id;
    if (seen.has(id)) continue;
    const where = owner ? owner.column : column.get(card.id)!;
    if (where !== col) continue;
    seen.add(id);
    out.push(id);
  }
  const explicit = order.get(col) ?? [];
  const ranked = [...out].sort((a, b) => {
    const ia = explicit.indexOf(a);
    const ib = explicit.indexOf(b);
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
  });
  return ranked;
}

/* -------------------------------- history --------------------------------- */

type Snapshot = string;
const past: Snapshot[] = [];
const snapshot = (): Snapshot =>
  JSON.stringify({
    combos,
    column: [...column],
    order: [...order],
    highlights,
    splits: [...splits],
  });
function restore(s: Snapshot) {
  const v = JSON.parse(s);
  combos = v.combos;
  column.clear();
  for (const [k, val] of v.column) column.set(k, val);
  order.clear();
  for (const [k, val] of v.order) order.set(k, val);
  highlights = v.highlights;
  splits.clear();
  for (const id of v.splits) splits.add(id);
}
function commit(fn: () => void) {
  past.push(snapshot());
  if (past.length > 60) past.shift();
  fn();
  render();
}

/* -------------------------------- rendering -------------------------------- */

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const board = $('board');
const search = $<HTMLInputElement>('search');
let clean = JSON.stringify(payload());

const COLUMNS = () => [
  { id: HIGHLIGHTS, label: 'Highlights', note: 'also stays in its own column' },
  ...state.columns.map((c) => ({ id: c.id, label: c.label, note: '' })),
  { id: ARCHIVE, label: 'Archive', note: 'kept out of the site' },
];

function cardEl(id: string, col: string): HTMLElement {
  const combo = combos.find((c) => c.id === id);
  const el = document.createElement('article');
  el.className =
    'group relative cursor-grab rounded-[12px] border border-line bg-card p-1.5 active:cursor-grabbing';
  el.draggable = true;
  el.dataset.id = id;
  el.dataset.col = col;

  const n = countOf(id);
  el.innerHTML = `
    <div class="relative overflow-hidden rounded-[8px] bg-page">
      <span class="block w-full" style="aspect-ratio:1.3">
        <img src="${thumbOf(id)}" alt="" loading="lazy"
             class="absolute inset-0 size-full object-cover" />
      </span>
      ${
        n > 1
          ? `<span class="absolute right-1.5 bottom-1.5 rounded-full bg-ink/60 px-1.5 py-0.5 text-[10px] font-semibold text-card tabular-nums backdrop-blur-sm">${n}</span>`
          : ''
      }
      ${
        combo
          ? `<span class="absolute top-1.5 left-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.06em] text-card uppercase">set</span>`
          : ''
      }
    </div>
    <p class="mt-1 line-clamp-2 px-0.5 text-[11px] leading-tight opacity-75">${titleOf(id)}</p>`;

  if (combo || base.get(id)?.splittable) {
    const expand = document.createElement('button');
    expand.type = 'button';
    expand.title = 'Open';
    expand.textContent = '⤢';
    expand.className =
      'absolute top-2.5 right-2.5 hidden size-6 items-center justify-center rounded-full bg-ink/55 text-[11px] text-card backdrop-blur-sm group-hover:flex';
    expand.addEventListener('click', (e) => {
      e.stopPropagation();
      openInspect(id);
    });
    el.append(expand);
  }
  return el;
}

function render() {
  const q = search.value.trim().toLowerCase();
  const matches = (id: string) => {
    if (!q) return true;
    if (titleOf(id).toLowerCase().includes(q)) return true;
    const combo = combos.find((c) => c.id === id);
    return combo ? combo.members.some((m) => titleOf(m).toLowerCase().includes(q)) : false;
  };

  board.replaceChildren(
    ...COLUMNS().map((col) => {
      const ids = (col.id === HIGHLIGHTS ? highlights : membersOf(col.id)).filter(matches);
      const wrap = document.createElement('section');
      wrap.className =
        'flex w-[228px] shrink-0 flex-col rounded-[16px] border border-line bg-card/45';
      wrap.dataset.col = col.id;
      wrap.innerHTML = `
        <header class="shrink-0 px-3 pt-3 pb-2">
          <p class="label-caps flex items-center gap-2">
            ${col.label}<span class="tabular-nums opacity-45">${ids.length}</span>
          </p>
          ${col.note ? `<p class="mt-0.5 text-[10px] opacity-45">${col.note}</p>` : ''}
        </header>`;
      const body = document.createElement('div');
      body.className = 'col-body flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2';
      body.dataset.col = col.id;
      body.append(...ids.map((id) => cardEl(id, col.id)));
      wrap.append(body);
      return wrap;
    }),
  );

  $('dirty').hidden = JSON.stringify(payload()) === clean;
  $<HTMLButtonElement>('undo').disabled = past.length === 0;
  if (!$('inspect').hidden) paintInspect();
}

/* ------------------------------ drag and drop ------------------------------ */

let dragId: string | null = null;
let marker: HTMLElement | null = null;

function clearMarks() {
  marker?.remove();
  marker = null;
  for (const el of board.querySelectorAll('[data-id]')) {
    (el as HTMLElement).classList.remove('ring-2', 'ring-ink', 'ring-offset-2');
  }
}

board.addEventListener('dragstart', (e) => {
  const card = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
  if (!card) return;
  dragId = card.dataset.id!;
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.setData('text/plain', dragId);
});

board.addEventListener('dragend', () => {
  dragId = null;
  clearMarks();
});

board.addEventListener('dragover', (e) => {
  if (!dragId) return;
  e.preventDefault();
  const body = (e.target as HTMLElement).closest<HTMLElement>('.col-body');
  if (!body) return;
  clearMarks();

  const over = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
  // The middle of a card means "combine"; its edges mean "drop between".
  if (over && over.dataset.id !== dragId && body.dataset.col !== HIGHLIGHTS) {
    const r = over.getBoundingClientRect();
    const edge = (e.clientY - r.top) / r.height;
    if (edge > 0.25 && edge < 0.75 && canCombine(dragId, over.dataset.id!)) {
      over.classList.add('ring-2', 'ring-ink', 'ring-offset-2');
      return;
    }
  }
  marker = document.createElement('div');
  marker.className = 'drop-line';
  const target = insertBefore(body, e.clientY);
  body.insertBefore(marker, target);
});

board.addEventListener('drop', (e) => {
  if (!dragId) return;
  e.preventDefault();
  const body = (e.target as HTMLElement).closest<HTMLElement>('.col-body');
  if (!body) return;
  const col = body.dataset.col!;
  const over = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
  const id = dragId;

  if (over && over.dataset.id !== id && col !== HIGHLIGHTS) {
    const r = over.getBoundingClientRect();
    const edge = (e.clientY - r.top) / r.height;
    if (edge > 0.25 && edge < 0.75 && canCombine(id, over.dataset.id!)) {
      clearMarks();
      return commit(() => combine(over.dataset.id!, id));
    }
  }

  const beforeEl = insertBefore(body, e.clientY);
  const beforeId = beforeEl?.dataset.id ?? null;
  clearMarks();
  commit(() => moveTo(id, col, beforeId));
});

/** The card a drop at this height should land above, or null for the end. */
function insertBefore(body: HTMLElement, y: number): HTMLElement | null {
  for (const el of [...body.querySelectorAll<HTMLElement>('[data-id]')]) {
    const r = el.getBoundingClientRect();
    if (y < r.top + r.height / 2) return el;
  }
  return null;
}

function canCombine(a: string, b: string) {
  const parts = [a, b].flatMap((id) => combos.find((c) => c.id === id)?.members ?? [id]);
  return parts.every((id) => base.get(id)?.combinable);
}

/* ------------------------------- mutations -------------------------------- */

function moveTo(id: string, col: string, beforeId: string | null) {
  if (col === HIGHLIGHTS) {
    // Highlights does not own its cards, so this only adds and orders.
    highlights = highlights.filter((x) => x !== id);
    const at = beforeId ? highlights.indexOf(beforeId) : -1;
    highlights.splice(at === -1 ? highlights.length : at, 0, id);
    return;
  }
  // Dragging a highlighted card out of Highlights drops it from the list.
  if (highlights.includes(id) && column.get(id) === undefined && !isCombo(id)) {
    /* falls through — a combo has no column entry either */
  }

  const combo = combos.find((c) => c.id === id);
  if (combo) combo.column = col;
  else column.set(id, col);

  const list = membersOf(col).filter((x) => x !== id);
  const at = beforeId ? list.indexOf(beforeId) : -1;
  list.splice(at === -1 ? list.length : at, 0, id);
  order.set(col, list);
  if (col === ARCHIVE) highlights = highlights.filter((x) => x !== id);
}

/** Fold `dragged` into `target`, making a set if the target is not one yet. */
function combine(target: string, dragged: string) {
  const parts = (id: string) => combos.find((c) => c.id === id)?.members ?? [id];
  const members = [...parts(target), ...parts(dragged)];
  combos = combos.filter((c) => c.id !== target && c.id !== dragged);

  const col =
    combos.find((c) => c.id === target)?.column ??
    column.get(target) ??
    base.get(parts(target)[0]!)!.category;
  const title = titleOf(target);
  let id = `set-${slug(title)}`;
  let n = 2;
  while (base.has(id) || combos.some((c) => c.id === id)) id = `set-${slug(title)}-${n++}`;

  combos.push({ id, title, column: col, members });
  highlights = highlights.map((h) => (h === target ? id : h)).filter((h) => h !== dragged);
  highlights = [...new Set(highlights)];

  const list = membersOf(col);
  order.set(col, list);
}

const slug = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'set';

/* ------------------------------- inspect ---------------------------------- */

let inspecting: string | null = null;

function openInspect(id: string) {
  inspecting = id;
  $('inspect').hidden = false;
  paintInspect();
}

function paintInspect() {
  const id = inspecting;
  if (!id) return;
  const combo = combos.find((c) => c.id === id);
  const card = base.get(id);
  $('i-title').textContent = titleOf(id);
  $('i-split').hidden = !!combo || !card?.splittable;
  $('i-note').textContent = combo
    ? `${combo.members.length} pieces`
    : `${card?.count ?? 0} slides — split it apart to rearrange`;

  const box = $('i-box');
  const memberIds = combo ? combo.members : [];
  box.replaceChildren(
    ...(combo
      ? memberIds.map((m) => insCard(m))
      : (card?.slides ?? []).map((s) => {
          const el = document.createElement('figure');
          el.className = 'w-[150px] rounded-[10px] border border-card/25 p-1';
          el.innerHTML = `<img src="${s.src}" class="aspect-[1.3] w-full rounded-[7px] object-cover" alt="" />
            <figcaption class="mt-1 line-clamp-2 px-0.5 text-[10px] text-card/65">${s.caption}</figcaption>`;
          return el;
        })),
  );
  $('i-out').hidden = !combo;
}

function insCard(id: string) {
  const el = document.createElement('figure');
  el.className = 'w-[150px] cursor-grab rounded-[10px] border border-card/25 p-1';
  el.draggable = true;
  el.dataset.member = id;
  el.innerHTML = `<img src="${thumbOf(id)}" class="aspect-[1.3] w-full rounded-[7px] object-cover" alt="" />
    <figcaption class="mt-1 line-clamp-2 px-0.5 text-[10px] text-card/65">${titleOf(id)}</figcaption>`;
  return el;
}

let memberDrag: string | null = null;
$('inspect').addEventListener('dragstart', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-member]');
  if (!el) return;
  memberDrag = el.dataset.member!;
  e.dataTransfer!.effectAllowed = 'move';
});
$('inspect').addEventListener('dragover', (e) => e.preventDefault());
$('inspect').addEventListener('drop', (e) => {
  if (!memberDrag || !inspecting) return;
  e.preventDefault();
  const combo = combos.find((c) => c.id === inspecting);
  if (!combo) return;
  const id = memberDrag;
  memberDrag = null;

  if ((e.target as HTMLElement).closest('#i-out')) {
    commit(() => {
      combo.members = combo.members.filter((m) => m !== id);
      column.set(id, combo.column);
      if (combo.members.length < 2) dissolve(combo);
      const list = membersOf(combo.column);
      order.set(combo.column, list);
    });
    if (!combos.some((c) => c.id === inspecting)) closeInspect();
    return;
  }

  const over = (e.target as HTMLElement).closest<HTMLElement>('[data-member]');
  if (!over || over.dataset.member === id) return;
  commit(() => {
    const from = combo.members.indexOf(id);
    const to = combo.members.indexOf(over.dataset.member!);
    combo.members.splice(to, 0, ...combo.members.splice(from, 1));
  });
});

/** A set of one is just the piece again. */
function dissolve(combo: Combo) {
  for (const m of combo.members) column.set(m, combo.column);
  combos = combos.filter((c) => c !== combo);
  highlights = highlights.filter((h) => h !== combo.id);
}

/**
 * Splitting happens server-side — the parts come out of compose() — so the
 * board has to save and reload rather than fake it locally. Everything else
 * on the board is already in the payload, so nothing is lost.
 */
$('i-split').addEventListener('click', async () => {
  const id = inspecting;
  if (!id || !base.get(id)?.splittable) return;
  commit(() => {
    splits.add(id);
    highlights = highlights.filter((h) => h !== id);
  });
  closeInspect();
  flash('splitting…');
  if (await save()) location.reload();
});

$('i-close').addEventListener('click', closeInspect);
function closeInspect() {
  inspecting = null;
  $('inspect').hidden = true;
  render();
}

addEventListener('keydown', (e) => {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement).tagName)) return;
  if (e.key === 'Escape' && !$('inspect').hidden) closeInspect();
  if (e.key === '/') {
    e.preventDefault();
    search.focus();
  }
  if ((e.key === 'z' && (e.metaKey || e.ctrlKey)) || e.key === 'u') {
    e.preventDefault();
    undo();
  }
});

function undo() {
  const s = past.pop();
  if (!s) return;
  restore(s);
  render();
}
$('undo').addEventListener('click', undo);
search.addEventListener('input', render);

/* -------------------------------- saving ---------------------------------- */

function payload() {
  const hidden = [...column].filter(([, c]) => c === ARCHIVE).map(([id]) => id);
  const moves: Record<string, string> = {};
  for (const [id, col] of column) {
    const card = base.get(id);
    if (card && col !== ARCHIVE && col !== card.category) moves[id] = col;
  }
  const featured: Record<string, string[]> = {};
  for (const col of state.columns) {
    const list = order.get(col.id);
    if (list?.length) featured[col.id] = list.filter((id) => !isCombo(id));
  }
  return {
    highlights,
    featured,
    hidden,
    moves,
    splits: [...splits],
    merges: combos.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.column,
      members: c.members,
    })),
  };
}

function flash(msg: string, ok = true) {
  const el = $('status');
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.color = ok ? '' : '#b00';
  setTimeout(() => {
    el.style.opacity = '0';
  }, 2800);
}

async function save(): Promise<boolean> {
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
    return true;
  } catch (err) {
    flash(`save failed — ${err}`, false);
    return false;
  }
}

$('save').addEventListener('click', async () => {
  if (await save()) flash('saved to curation.ts');
});

addEventListener('beforeunload', (e) => {
  if (JSON.stringify(payload()) !== clean) e.preventDefault();
});

render();
