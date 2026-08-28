/**
 * Behaviour for the local /curate tool. Never bundled into the portfolio —
 * the page that loads it only exists under `astro dev`.
 *
 * Everything here is an override written to curation.ts. work.ts is never
 * touched, so removing or combining a piece is always reversible.
 */
export {};

type Item = {
  id: string;
  title: string;
  category: string;
  thumb: string;
  combinable: boolean;
  slides: number;
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
const bar = $('bar');
const mergeTitle = $<HTMLInputElement>('merge-title');
const mergeCat = $<HTMLSelectElement>('merge-cat');
const combineBtn = $<HTMLButtonElement>('combine');

/** Which merge, if any, has swallowed this piece. */
const ownerOf = (id: string) => merges.find((m) => m.members.includes(id));

/** A piece the site will not render: removed outright, or folded into a merge. */
const isConsumed = (id: string) => removed.has(id) || ownerOf(id) !== undefined;

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

/** Repaint everything from the working copy. Cheap at this size. */
function render() {
  // A removed or merged piece cannot also be a highlight or a pin.
  for (let i = chosen.length - 1; i >= 0; i--) {
    if (isConsumed(chosen[i]!)) chosen.splice(i, 1);
  }
  for (const [cat, ids] of pinned) {
    pinned.set(
      cat,
      ids.filter((id) => !isConsumed(id)),
    );
  }

  $('count').textContent = `${chosen.length} in highlights`;

  chosenList.replaceChildren(
    ...chosen.map((id, i) => {
      const item = byId.get(id)!;
      const li = document.createElement('li');
      li.draggable = true;
      li.dataset.id = id;
      li.className =
        'flex cursor-grab items-center gap-2 rounded-full border border-line bg-card py-1 pr-3 pl-1 text-[12px] active:cursor-grabbing';
      li.innerHTML =
        `<img src="${item.thumb}" alt="" class="size-7 rounded-full object-cover" />` +
        `<span class="font-semibold tabular-nums opacity-45">${i + 1}</span>` +
        `<span>${item.title}</span>`;
      return li;
    }),
  );

  const mergedBox = $('merged');
  mergedBox.replaceChildren(
    ...merges.map((m) =>
      chip(
        `${m.title} · ${m.members.length}`,
        () => {
          merges.splice(merges.indexOf(m), 1);
          render();
        },
        byId.get(m.members[0]!)?.thumb,
      ),
    ),
  );
  $('merged-wrap').hidden = merges.length === 0;

  const removedBox = $('removed');
  removedBox.replaceChildren(
    ...[...removed].map((id) =>
      chip(
        byId.get(id)?.title ?? id,
        () => {
          removed.delete(id);
          render();
        },
        byId.get(id)?.thumb,
      ),
    ),
  );
  $('removed-wrap').hidden = removed.size === 0;

  for (const card of cards) {
    const id = card.dataset.id!;
    const rank = chosen.indexOf(id);
    const owner = ownerOf(id);
    const gone = removed.has(id);
    const btn = card.querySelector<HTMLElement>('[data-pick]')!;
    const badge = card.querySelector<HTMLElement>('[data-badge]')!;
    const pin = card.querySelector<HTMLElement>('[data-pin]')!;
    const sel = card.querySelector<HTMLElement>('[data-select]')!;

    card.hidden = gone || owner !== undefined;

    btn.classList.toggle('border-ink', rank !== -1);
    btn.classList.toggle('border-line', rank === -1);
    card.style.opacity = rank === -1 ? '0.62' : '1';
    badge.classList.toggle('hidden', rank === -1);
    badge.classList.toggle('flex', rank !== -1);
    badge.textContent = String(rank + 1);

    const isPinned = (pinned.get(card.dataset.cat!) ?? []).includes(id);
    pin.classList.toggle('bg-ink', isPinned);
    pin.classList.toggle('text-card', isPinned);

    const isSel = selected.has(id);
    sel.textContent = isSel ? '✓' : '';
    sel.classList.toggle('border-ink', isSel);
    sel.classList.toggle('bg-ink', isSel);
    sel.classList.toggle('text-card', isSel);
  }

  renderBar();
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

for (const card of cards) {
  const id = card.dataset.id!;
  const cat = card.dataset.cat!;

  card.querySelector('[data-pick]')!.addEventListener('click', () => {
    const at = chosen.indexOf(id);
    if (at === -1) chosen.push(id);
    else chosen.splice(at, 1);
    render();
  });

  card.querySelector('[data-pin]')!.addEventListener('click', () => {
    const list = pinned.get(cat) ?? [];
    const at = list.indexOf(id);
    if (at === -1) list.push(id);
    else list.splice(at, 1);
    pinned.set(cat, list);
    render();
  });

  card.querySelector('[data-select]')!.addEventListener('click', () => {
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    render();
  });
}

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
  if (members.length < 2 || !title) {
    flash('give the combined piece a title', false);
    return;
  }
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 44);
  let id = base || 'combined';
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
    const res = await fetch('/__curate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload()),
    });
    const out = await res.json();
    if (!out.ok) throw new Error(out.error);
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

render();
