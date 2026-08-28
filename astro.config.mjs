// @ts-check
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const CURATION = fileURLToPath(new URL('./src/data/curation.ts', import.meta.url));

/**
 * Serialise the picker's selection back into src/data/curation.ts.
 *
 * @param {string[]} highlights
 * @param {Record<string, string[] | undefined>} featured
 * @param {string[]} hidden
 * @param {{id:string,title:string,caption?:string,category?:string,members:string[]}[]} merges
 * @returns {string}
 */
function renderCuration(highlights, featured, hidden, merges) {
  const list = highlights.map((/** @type {string} */ id) => `  '${id}',`).join('\n');
  const pinned = Object.entries(featured)
    .filter(([, ids]) => ids?.length)
    .map(([cat, ids]) => `  '${cat}': [${(ids ?? []).map((/** @type {string} */ id) => `'${id}'`).join(', ')}],`)
    .join('\n');
  const hide = hidden.map((/** @type {string} */ id) => `  '${id}',`).join('\n');
  const q = (/** @type {string} */ v) => `'${String(v).replace(/'/g, "\\'")}'`;
  const combos = merges
    .map((m) => {
      const lines = [`    id: ${q(m.id)},`, `    title: ${q(m.title)},`];
      if (m.caption) lines.push(`    caption: ${q(m.caption)},`);
      if (m.category) lines.push(`    category: ${q(m.category)},`);
      lines.push(`    members: [${m.members.map(q).join(', ')}],`);
      return `  {\n${lines.join('\n')}\n  },`;
    })
    .join('\n');
  return `import type { Category } from './site';

/* ---------------------------------------------------------------------------
   What appears where. Everything else about a piece lives in work.ts; this
   file is only the editorial layer on top of it.

   Edit by hand, or run \`npm run dev\` and open /curate to pick from the actual
   covers — that page writes this file for you. The ids are validated against
   work.ts at build time, so a typo fails the build rather than quietly
   dropping a piece.
--------------------------------------------------------------------------- */

/**
 * The Highlights tab: membership and order in one list. First id renders
 * first. Anything not listed lives only under its category tab.
 */
export const highlights: string[] = [
${list}
];

/**
 * Pinned to the top of their own category tab, in this order. Everything else
 * in that category keeps its existing relative order underneath — so there is
 * no need to list all 180 pieces to promote three of them.
 */
export const featured: Partial<Record<Category, string[]>> = {${
    pinned ? `\n${pinned}\n` : ''
  }};

/**
 * Ids kept out of the site. The entry stays in work.ts and the files stay on
 * disk — this only stops it being rendered, so it is reversible from /curate.
 */
export const hidden: string[] = [${hide ? `\n${hide}\n` : ''}];

/** Several pieces shown as one carousel. */
export type Merge = {
  /** Id for the combined piece; must not clash with one in work.ts. */
  id: string;
  title: string;
  caption?: string;
  category?: Category;
  /**
   * Pieces to fold in, in order. Stills contribute one slide, carousels
   * contribute all of theirs. Videos and embeds cannot be members — a slide is
   * a still, a model or a document, and a player is none of those.
   */
  members: string[];
};

/**
 * Combined pieces. Each takes the grid position of its first member, so
 * merging does not reshuffle everything around it.
 */
export const merges: Merge[] = [${combos ? `\n${combos}\n` : ''}];
`;
}

/**
 * The picker's save endpoint. A Vite `configureServer` hook only ever runs
 * under `astro dev`, so this cannot reach the built site — which matters,
 * because it writes to the source tree.
 */
const curateSaver = {
  name: 'curate-saver',
  apply: 'serve',
  /** @param {import('vite').ViteDevServer} server */
  configureServer(server) {
    server.middlewares.use('/__curate', (/** @type {any} */ req, /** @type {any} */ res, /** @type {any} */ next) => {
      if (req.method !== 'POST') return next();
      let body = '';
      req.on('data', (/** @type {Buffer} */ chunk) => {
        body += chunk;
        if (body.length > 1e6) req.destroy();
      });
      req.on('end', async () => {
        try {
          const { highlights = [], featured = {}, hidden = [], merges = [] } = JSON.parse(body);
          const ok = (/** @type {unknown} */ v) =>
            Array.isArray(v) && v.every((s) => typeof s === 'string' && /^[a-z0-9-]+$/.test(s));
          if (!ok(highlights) || !ok(hidden) || !Object.values(featured).every(ok)) {
            throw new Error('ids must be lowercase slugs');
          }
          for (const m of merges) {
            if (!/^[a-z0-9-]+$/.test(m?.id ?? '') || !ok(m?.members) || !m.members.length) {
              throw new Error(`merge "${m?.id}" needs a slug id and at least one member`);
            }
            if (typeof m.title !== 'string' || !m.title.trim()) {
              throw new Error(`merge "${m.id}" needs a title`);
            }
          }
          await writeFile(CURATION, renderCuration(highlights, featured, hidden, merges), 'utf8');
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: true, count: highlights.length }));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
    });
  },
};

/**
 * /curate is a local tool, not part of the portfolio. The page lives outside
 * src/pages so it is never auto-routed, and the route only exists when the
 * command is `dev` — so `astro build` never emits it.
 */
const curateRoute = {
  name: 'curate-route',
  hooks: {
    'astro:config:setup': (/** @type {any} */ { command, injectRoute }) => {
      if (command !== 'dev') return;
      injectRoute({ pattern: '/curate', entrypoint: './src/curate/CuratePage.astro' });
    },
  },
};

// Served from the custom domain, so the site lives at the root. GitHub reads
// public/CNAME on deploy and redirects the apex to www automatically.
export default defineConfig({
  site: 'https://www.zacreinke.com',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/curate') }), curateRoute],
  image: {
    // Source art is 1600-5000px wide; nothing on the page needs more than 1600.
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss(), curateSaver],
  },
});
