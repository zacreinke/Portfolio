/**
 * Behaviour for the local /curate tool. Never bundled into the portfolio —
 * the page that loads it only exists under `astro dev`.
 */
export {};

type Item = { id: string; title: string; category: string; thumb: string };
type State = {
  highlights: string[];
  featured: Record<string, string[] | undefined>;
  items: Item[];
};

const state = (window as unknown as { __CURATE__: State }).__CURATE__;
const byId = new Map(state.items.map((i) => [i.id, i]));

/** Working copy; the page is the only writer. */
const chosen: string[] = [...state.highlights];
const pinned = new Map<string, string[]>(
  Object.entries(state.featured).map(([cat, ids]) => [cat, [...(ids ?? [])]]),
);

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const chosenList = $('chosen');
const countEl = $('count');
const statusEl = $('status');
const cards = [...document.querySelectorAll<HTMLElement>('[data-card]')];

/** Repaint everything from `chosen` / `pinned`. Cheap at this size. */
function render() {
  countEl.textContent = `${chosen.length} in highlights`;

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

  for (const card of cards) {
    const id = card.dataset.id!;
    const rank = chosen.indexOf(id);
    const btn = card.querySelector<HTMLElement>('[data-pick]')!;
    const badge = card.querySelector<HTMLElement>('[data-badge]')!;
    const pin = card.querySelector<HTMLElement>('[data-pin]')!;

    btn.classList.toggle('border-ink', rank !== -1);
    btn.classList.toggle('border-line', rank === -1);
    card.style.opacity = rank === -1 ? '0.62' : '1';
    badge.classList.toggle('hidden', rank === -1);
    badge.classList.toggle('flex', rank !== -1);
    badge.textContent = String(rank + 1);

    const list = pinned.get(card.dataset.cat!) ?? [];
    const isPinned = list.includes(id);
    pin.classList.toggle('bg-ink', isPinned);
    pin.classList.toggle('text-card', isPinned);
    pin.classList.toggle('bg-card/90', !isPinned);
  }
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
}

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
  return { highlights: chosen, featured };
}

function flash(msg: string, ok = true) {
  statusEl.textContent = msg;
  statusEl.style.opacity = '1';
  statusEl.style.color = ok ? '' : '#b00';
  setTimeout(() => {
    statusEl.style.opacity = '0';
  }, 2200);
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
  const { highlights, featured } = payload();
  const text =
    `highlights: [\n${highlights.map((id) => `  '${id}',`).join('\n')}\n]\n\n` +
    `featured: ${JSON.stringify(featured, null, 2)}`;
  try {
    await navigator.clipboard.writeText(text);
    flash('copied');
  } catch {
    flash('clipboard blocked — use Save', false);
  }
});

render();
