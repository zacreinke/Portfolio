import type { Category } from './site';

/* ---------------------------------------------------------------------------
   What appears where. Everything else about a piece lives in work.ts; this
   file is only the editorial layer on top of it.

   Edit by hand, or run `npm run dev` and open /curate to pick from the actual
   covers — that page writes this file for you. The ids are validated against
   work.ts at build time, so a typo fails the build rather than quietly
   dropping a piece.
--------------------------------------------------------------------------- */

/**
 * The Highlights tab: membership and order in one list. First id renders
 * first. Anything not listed lives only under its category tab.
 */
export const highlights: string[] = [];

/**
 * Pinned to the top of their own category tab, in this order. Everything else
 * in that category keeps its existing relative order underneath — so there is
 * no need to list all 180 pieces to promote three of them.
 */
export const featured: Partial<Record<Category, string[]>> = {};

/**
 * Ids kept out of the site. The entry stays in work.ts and the files stay on
 * disk — this only stops it being rendered, so it is reversible from /curate.
 */
export const hidden: string[] = [];

/**
 * Pieces moved to a different category than work.ts gives them. The board
 * writes this when you drag a card from one column to another.
 */
export const moves: Record<string, Category> = {};

/**
 * Authored carousels broken back into one piece per slide, so their contents
 * can be rearranged like anything else. Each part gets a stable id of
 * `<id>--<n>`, which merges and moves can then refer to.
 */
export const splits: string[] = [
  'bilflo-identity',
  'johnnys-mobile-detail',
  'in-your-prime',
  'amtec-60-identity',
  'amtec-60-event',
  'amtec-60-merch',
  'blackmagic-collective',
  'mic-drop',
  'bad-badge',
  'zr-monogram',
  'the-shop',
  'guitar-print-jaguar',
  'guitar-print-les-paul',
  'guitar-print-les-paul-junior',
  'guitar-print-mustang',
  'be-my-quarantine',
  'bilflo-app',
  'amtec-christmas-cards',
  'amtec-christmas-2022',
  'amtec-christmas-2025',
  'desert-christmas',
  'amtec-holiday-campaigns',
  'amtec-bitz',
  'amtec-conference-booths',
  'amtec-signage',
  'amtec-merch',
  'tristaff-identity',
  'tristaff-services',
  'economic-reports',
  'job-post-ads',
  'amtec-benefits-campaign',
  'simplee-coffee',
  'tunable-tunes',
  'foothills',
  'amtec-brand-docs',
  'amtec-social-guides',
  'hiring-scott',
  'amtec-web',
  'algorri-trucks',
  'sauce-posters',
  'clearly-filtered',
  'evergreen-identity',
  'evergreen-lockups',
  'evergreen-social',
  'ordinary-girl',
  'ray-johnson-memorial',
  'eager-eyes-brand',
  'bilflo-display-ads',
];

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
export const merges: Merge[] = [];
