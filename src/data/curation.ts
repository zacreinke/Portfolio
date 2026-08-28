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
export const highlights: string[] = [
  'bilflo-identity',
  'johnnys-mobile-detail',
  'in-your-prime',
  'amtec-60-event',
  'mic-drop',
  'fender-jaguar',
  'the-shop',
  'guitar-print-les-paul',
  'be-my-quarantine',
  'bilflo-site-walkthrough',
  'bilflo-app',
  'baby-artemis',
  'vw-thing',
  'catalina-planter',
  'amtec-60-film',
  'amtec-core-values',
  'bilflo-prismhr',
  'shine-ep',
  'amtec-christmas-2022',
  'desert-christmas',
  'lit-tree',
  'amtec-bitz',
  'tristaff-identity',
  'economic-reports',
  'tools-of-the-trade',
  'purple-squirrel',
  'amtec-web',
  'clearly-filtered',
  'evergreen-identity',
  'bilflo-display-ads',
];

/**
 * Pinned to the top of their own category tab, in this order. Everything else
 * in that category keeps its existing relative order underneath — so there is
 * no need to list all 180 pieces to promote three of them.
 */
export const featured: Partial<Record<Category, string[]>> = {};
