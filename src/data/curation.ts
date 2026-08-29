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
  'graphic-design': ['business-cards', 'team-shirts', 'trade-show-banner', 'summer-of-automated-invoicing', 'amtec-web--4', 'staffing-world-2021-ticket', '75k', 'amtec-x-bilflo-announcement-banner', 'core-flyer-front-and-back', 'amtec-60-event--0', 'amtec-60-event--1', 'amtec-60-event--2', 'amtec-60-event--3', 'amtec-60-event--4', 'amtec-60-event--5', 'amtec-60-merch--0', 'amtec-60-merch--1', 'amtec-60-merch--2', 'amtec-60-merch--3', 'amtec-christmas-cards--0', 'amtec-christmas-cards--1', 'amtec-christmas-cards--2', 'amtec-christmas-cards--3', 'amtec-christmas-cards--4', 'amtec-christmas-cards--5', 'amtec-christmas-cards--6', 'amtec-christmas-cards--7', 'amtec-christmas-2022--0', 'amtec-christmas-2022--1', 'amtec-christmas-2025--0', 'amtec-christmas-2025--1', 'amtec-holiday-campaigns--0', 'amtec-holiday-campaigns--1', 'amtec-holiday-campaigns--2', 'amtec-holiday-campaigns--3', 'amtec-holiday-campaigns--4', 'amtec-holiday-campaigns--5', 'amtec-holiday-campaigns--6', 'amtec-bitz--0', 'amtec-bitz--1', 'amtec-bitz--2', 'amtec-bitz--3', 'amtec-bitz--4', 'amtec-bitz--5', 'amtec-conference-booths--0', 'amtec-conference-booths--1', 'amtec-conference-booths--2', 'amtec-conference-booths--3', 'amtec-conference-booths--4', 'amtec-conference-booths--5', 'amtec-conference-booths--6', 'az-shrm-2024', 'calshrm-2024', 'cahr-2024', 'cahr-2022-disneyland', 'nv-shrm-2021', 'shrm-2025', 'tristaff-zoo-day', 'pihra-celu-2021', 'al-madrigal-speaker-announcement', 'raffle-winner-announcement', 'amtec-signage--0', 'amtec-signage--1', 'amtec-signage--2', 'amtec-signage--3', 'amtec-signage--4', 'amtec-signage--5', 'amtec-signage--6', 'amtec-signage--7', 'amtec-merch--0', 'amtec-merch--1', 'amtec-merch--2', 'amtec-merch--3', 'amtec-merch--4', 'amtec-merch--5', 'amtec-merch--6', 'amtec-merch--7', 'amtec-merch--8', 'tristaff-services--0', 'tristaff-services--1', 'tristaff-services--2', 'tristaff-services--3', 'tristaff-services--4', 'economic-reports--0', 'economic-reports--1', 'economic-reports--2', 'economic-reports--3', 'economic-reports--4', 'economic-reports--5', 'job-post-ads--0', 'job-post-ads--1', 'job-post-ads--2', 'job-post-ads--3', 'amtec-benefits-campaign--0', 'amtec-benefits-campaign--1', 'amtec-benefits-campaign--2', 'amtec-benefits-campaign--3', 'amtec-benefits-campaign--4', 'amtec-benefits-campaign--5', 'attracting-retaining', 'ai-wont-save-your-hiring', 'improve-your-hiring-process', 'zoom-background', 'hire-better', 'remote-workers', 'indeed-banner', 'google-forms-banner', 'workiversary-seven-years', 'workiversary-twenty-years', 'core-values-2022', 'recruiter-spotlight', 'owners-retreat-2019', 'ruths-chris-dinner', 'nfuse-2026', 'amtec-brand-docs--0', 'amtec-brand-docs--1', 'amtec-brand-docs--2', 'amtec-brand-docs--3', 'amtec-social-guides--0', 'amtec-social-guides--1', 'amtec-social-guides--2', 'amtec-social-guides--3', 'amtec-social-guides--4', 'vacation-brochure-redesign-2023', 'construction-flyer-2023', 'tristaff-flyer-2024', 'halloween-networking', 'arizona-office-grand-opening', 'happy-boss-day', 'vaccinate-oc-flyer', 'win-a-day-at-disneyland', 'certificate-of-appreciation', 'peoples-care-case-study', 'yodump-sticker', 'sauce-posters--0', 'sauce-posters--1', 'sauce-posters--2', 'clearly-filtered--0', 'clearly-filtered--1', 'clearly-filtered--2', 'clearly-filtered--3', 'clearly-filtered--4', 'evergreen-social--0', 'evergreen-social--1', 'evergreen-social--2', 'evergreen-social--3', 'evergreen-social--4', 'ordinary-girl--0', 'ordinary-girl--1', 'ordinary-girl--2', 'ordinary-girl--3', 'ordinary-girl--4', 'ray-johnson-memorial--0', 'ray-johnson-memorial--1', 'bilflo-display-ads--0', 'bilflo-display-ads--1', 'bilflo-display-ads--2', 'bilflo-display-ads--3', 'bilflo-display-ads--4', 'bilflo-display-ads--5', 'bilflo-display-ads--6', 'bilflo-display-ads--7', 'bilflo-display-ads--8', 'bilflo-display-ads--9'],
};

/**
 * Ids kept out of the site. The entry stays in work.ts and the files stay on
 * disk — this only stops it being rendered, so it is reversible from /curate.
 */
export const hidden: string[] = [
  'bilflo-identity--1',
  'bilflo-identity--3',
  'bilflo-identity--6',
  'free-gift-ticket-3-month-trial',
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
  'amtec-60-web',
  'water-cooler',
  'purple-squirrel',
  'amtec-web--1',
  'amtec-web--2',
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
  '75k': 'graphic-design',
  'amtec-web--3': 'illustration',
  'amtec-web--4': 'graphic-design',
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
