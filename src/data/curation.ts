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

];

/**
 * Pinned to the top of their own category tab, in this order. Everything else
 * in that category keeps its existing relative order underneath — so there is
 * no need to list all 180 pieces to promote three of them.
 */
export const featured: Partial<Record<Category, string[]>> = {
  'illustration': ['fender-mustang', 'fender-jaguar', 'fender-telecaster', 'ryans-guitar', 'tylers-bass', 'gibson-les-paul-junior', 'mustang-floor', 'guitar-print-jaguar--0', 'guitar-print-jaguar--1', 'guitar-print-jaguar--2', 'guitar-print-les-paul--0', 'guitar-print-les-paul--1', 'guitar-print-les-paul--2', 'guitar-print-les-paul-junior--0', 'guitar-print-les-paul-junior--1', 'guitar-print-les-paul-junior--2', 'guitar-print-mustang--0', 'guitar-print-mustang--1', 'guitar-print-mustang--2', 'cacti', 'airspeed-alive', 'bilflo-app--0', 'bilflo-app--1', 'bilflo-app--2', 'bilflo-app--3', 'bilflo-app--4', 'bilflo-app--5', 'bilflo-app--6', 'desert-christmas--0', 'desert-christmas--1', 'lit-tree', 'the-true-light-was-coming-into-the-world', 'ornament-badge', 'joy-to-the-world-gift-card', 'tools-of-the-trade', 'saviors-of-2020', 'behavioral-interviewing', 'the-power-of-collaboration', 'water-cooler', '75k', 'behavioral-interview-questions-cover', 'how-to-retain-top-engineers-ebook', 'purple-squirrel', 'amtec-web--1', 'amtec-web--2', 'amtec-web--3', 'bug', 'bus-truck', 'porsche-911', 'jag-e-star-wars', 'hat-angel', 'hat-dodger', 'hat-pokemon', 'hat-top', 'gg-guitar', 'gibson-es-335', 'les-paul', 'twin-reverb', 'mxr-phase-90', 'workstation-wallpaper', 'adam-a7x-monitor', 'krk-rokit-monitor', 'recording-studio', 'airpods', 'chucks', 'drone', 'robot-arm', 'low-battery', 'yodump', 'vans'],
};

/**
 * Ids kept out of the site. The entry stays in work.ts and the files stay on
 * disk — this only stops it being rendered, so it is reversible from /curate.
 */
export const hidden: string[] = [
  'bilflo-identity--1',
  'bilflo-identity--3',
  'bilflo-identity--6',
  'the-shop--0',
  'the-shop--1',
  'the-shop--2',
  'the-shop--3',
  'the-shop--4',
  'the-shop--5',
  'the-shop--6',
  'the-shop--7',
  'be-my-quarantine--0',
  'be-my-quarantine--3',
  'door-bubbles',
];

/**
 * Pieces moved to a different category than work.ts gives them. The board
 * writes this when you drag a card from one column to another.
 */
export const moves: Record<string, Category> = {
  'bilflo-app--0': 'illustration',
  'bilflo-app--1': 'illustration',
  'bilflo-app--2': 'illustration',
  'bilflo-app--3': 'illustration',
  'bilflo-app--4': 'illustration',
  'bilflo-app--5': 'illustration',
  'bilflo-app--6': 'illustration',
  'amtec-web--1': 'illustration',
  'amtec-web--2': 'illustration',
  'amtec-web--3': 'illustration',
};

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
export const merges: Merge[] = [
  {
    id: 'set-card-artwork',
    title: 'Card artwork',
    category: 'illustration',
    members: ['be-my-quarantine--1', 'be-my-quarantine--4', 'be-my-quarantine--2'],
  },
  {
    id: 'set-lighthouse-image',
    title: 'Lighthouse Image',
    category: 'illustration',
    members: ['lighthouse-image', 'tombstone-lighthouse', 'pauls-lighthouse'],
  },
];
