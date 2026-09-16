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
  'set-logo-presentation',
  'set-brand-style-guide-12-pages',
  'set-card-front',
  'mustang-floor',
  'bilflo-prismhr',
  'set-sunburst-on-green',
  'set-in-your-prime-primary-mark',
  'set-workstation-wallpaper',
  'starship-mini',
  'amtec-site-walkthrough',
  'me-without-you',
];

/**
 * Pinned to the top of their own category tab, in this order. Everything else
 * in that category keeps its existing relative order underneath — so there is
 * no need to list all 180 pieces to promote three of them.
 */
export const featured: Partial<Record<Category, string[]>> = {
  'branding': ['set-logo-presentation', 'set-brand-style-guide-12-pages', 'set-brand-presentation', 'set-in-your-prime-primary-mark', 'set-johnny-s-mobile-detail-full-lockup', 'set-anniversary-mark', 'hypersonic-staffing', 'inspire', 'zr-monogram--1', 'rooted-roots', 'csp-member', 'bee-podcast', 'revd-up', 'hiring-scott--0', 'set-blackmagic-collective-circular-badge', 'set-mic-drop-primary-mark', 'set-badge-lettering', 'set-alternate-lockup', 'set-mark-first-direction'],
  'graphic-design': ['business-cards', 'the-work-weekly', 'team-shirts', 'trade-show-banner', 'summer-of-automated-invoicing', 'staffing-world-2021-ticket', 'amtec-x-bilflo-announcement-banner', 'core-flyer-front-and-back', 'amtec-holiday-campaigns--3', 'amtec-holiday-campaigns--5', 'amtec-holiday-campaigns--6', 'amtec-conference-booths--0', 'amtec-conference-booths--1', 'amtec-conference-booths--2', 'amtec-conference-booths--3', 'amtec-conference-booths--4', 'amtec-conference-booths--5', 'amtec-conference-booths--6', 'az-shrm-2024', 'calshrm-2024', 'cahr-2024', 'cahr-2022-disneyland', 'nv-shrm-2021', 'shrm-2025', 'tristaff-zoo-day', 'pihra-celu-2021', 'al-madrigal-speaker-announcement', 'raffle-winner-announcement', 'amtec-signage--4', 'amtec-signage--7', 'amtec-merch--0', 'amtec-merch--1', 'amtec-merch--2', 'amtec-merch--3', 'tristaff-services--4', 'job-post-ads--0', 'job-post-ads--1', 'job-post-ads--2', 'job-post-ads--3', 'amtec-benefits-campaign--0', 'amtec-benefits-campaign--1', 'amtec-benefits-campaign--2', 'amtec-benefits-campaign--3', 'amtec-benefits-campaign--4', 'amtec-benefits-campaign--5', 'attracting-retaining', 'ai-wont-save-your-hiring', 'improve-your-hiring-process', 'zoom-background', 'indeed-banner', 'google-forms-banner', 'workiversary-seven-years', 'workiversary-twenty-years', 'core-values-2022', 'recruiter-spotlight', 'owners-retreat-2019', 'ruths-chris-dinner', 'nfuse-2026', 'amtec-brand-docs--0', 'amtec-brand-docs--1', 'amtec-brand-docs--2', 'amtec-brand-docs--3', 'amtec-social-guides--0', 'amtec-social-guides--1', 'amtec-social-guides--2', 'amtec-social-guides--3', 'amtec-social-guides--4', 'vacation-brochure-redesign-2023', 'construction-flyer-2023', 'tristaff-flyer-2024', 'halloween-networking', 'arizona-office-grand-opening', 'happy-boss-day', 'vaccinate-oc-flyer', 'win-a-day-at-disneyland', 'certificate-of-appreciation', 'peoples-care-case-study', '75k', 'amtec-web--4', 'tristaff-identity--0'],
  'illustration': ['fender-mustang', 'fender-jaguar', 'fender-telecaster', 'ryans-guitar', 'tylers-bass', 'gibson-les-paul-junior', 'mustang-floor', 'hire-better', 'amtec-merch--4', 'amtec-christmas-cards--2', 'remote-workers', 'yodump-sticker', 'ordinary-girl--0', 'ordinary-girl--2', 'ordinary-girl--3', 'ordinary-girl--4', 'cacti', 'airspeed-alive', 'bilflo-app--0', 'bilflo-app--1', 'bilflo-app--2', 'bilflo-app--3', 'bilflo-app--4', 'bilflo-app--5', 'bilflo-app--6', 'lit-tree', 'the-true-light-was-coming-into-the-world', 'tunable-tunes--1', 'ornament-badge', 'eager-eyes-brand--2', 'joy-to-the-world-gift-card', 'tools-of-the-trade', 'the-power-of-collaboration', 'behavioral-interview-questions-cover', 'how-to-retain-top-engineers-ebook', 'amtec-web--3', 'bug', 'bus-truck', 'porsche-911', 'jag-e-star-wars', 'hat-angel', 'hat-dodger', 'hat-pokemon', 'hat-top', 'gg-guitar', 'gibson-es-335', 'les-paul', 'twin-reverb', 'mxr-phase-90', 'adam-a7x-monitor', 'krk-rokit-monitor', 'airpods', 'chucks', 'drone', 'robot-arm', 'low-battery', 'yodump', 'vans', 'set-sunburst-on-green', 'set-black-on-gray', 'set-red-on-green', 'set-red-on-gray', 'set-card-artwork', 'set-card-artwork-2', 'set-2020-front', 'set-2021-front', 'set-printed-card', 'set-card-front', 'set-landscape', 'set-workstation-wallpaper', 'set-lighthouse-image', 'set-tone-sauce'],
};

/**
 * Ids kept out of the site. The entry stays in work.ts and the files stay on
 * disk — this only stops it being rendered, so it is reversible from /curate.
 */
export const hidden: string[] = [
  'bilflo-identity--1',
  'bilflo-identity--2',
  'bilflo-identity--3',
  'bilflo-identity--4',
  'bilflo-identity--6',
  'free-gift-ticket-3-month-trial',
  'johnnys-mobile-detail--0',
  'johnnys-mobile-detail--2',
  'amtec-60-identity--1',
  'amtec-60-identity--3',
  'amtec-60-event--1',
  'amtec-60-merch--1',
  'blackmagic-collective--0',
  'cali-type',
  'zr-monogram--0',
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
  'bilflo-marketing-site',
  'amtec-60-web',
  'tristaff-identity--1',
  'tristaff-identity--2',
  'tristaff-identity--3',
  'tristaff-identity--4',
  'keystone-recruiters',
  'tunable-tunes--0',
  'knockout',
  'amtec-logomark',
  'saviors-of-2020',
  'behavioral-interviewing',
  'water-cooler',
  'purple-squirrel',
  'amtec-web--1',
  'amtec-web--2',
  'algorri-trucks--0',
  'algorri-trucks--1',
  'algorri-trucks--2',
  'algorri-trucks--3',
  'algorri-trucks--4',
  'algorri-trucks--5',
  'clearly-filtered--0',
  'clearly-filtered--1',
  'clearly-filtered--2',
  'clearly-filtered--3',
  'clearly-filtered--4',
  'door-bubbles',
  'evergreen-lockups--2',
  'evergreen-lockups--5',
  'ordinary-girl--1',
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
  'amtec-christmas-cards--2': 'illustration',
  'amtec-merch--4': 'illustration',
  'tristaff-identity--0': 'graphic-design',
  'hire-better': 'illustration',
  'remote-workers': 'illustration',
  'tunable-tunes--1': 'illustration',
  'the-work-weekly': 'graphic-design',
  'yodump-sticker': 'illustration',
  '75k': 'graphic-design',
  'hiring-scott--0': 'branding',
  'amtec-web--3': 'illustration',
  'amtec-web--4': 'graphic-design',
  'ordinary-girl--0': 'illustration',
  'ordinary-girl--2': 'illustration',
  'ordinary-girl--3': 'illustration',
  'ordinary-girl--4': 'illustration',
  'eager-eyes-brand--2': 'illustration',
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
  {
    id: 'set-logo-presentation',
    title: 'Logo presentation',
    category: 'branding',
    members: ['bilflo-identity--8', 'bilflo-identity--7', 'bilflo-identity--5', 'bilflo-identity--0'],
  },
  {
    id: 'set-johnny-s-mobile-detail-full-lockup',
    title: 'Johnny\'s Mobile Detail — full lockup',
    category: 'branding',
    members: ['johnnys-mobile-detail--1', 'johnnys-mobile-detail--3'],
  },
  {
    id: 'set-alternate-lockup',
    title: 'Alternate lockup',
    category: 'branding',
    members: ['simplee-coffee--1', 'simplee-coffee--0'],
  },
  {
    id: 'set-mark-first-direction',
    title: 'Mark, first direction',
    category: 'branding',
    members: ['foothills--0', 'foothills--1'],
  },
  {
    id: 'set-brand-presentation',
    title: 'Brand presentation',
    category: 'branding',
    members: ['eager-eyes-brand--0', 'eager-eyes-brand--1'],
  },
  {
    id: 'set-blackmagic-collective-circular-badge',
    title: 'Blackmagic Collective — circular badge',
    category: 'branding',
    members: ['blackmagic-collective--1', 'blackmagic-collective--2', 'blackmagic-collective--3'],
  },
  {
    id: 'set-in-your-prime-primary-mark',
    title: 'In Your Prime — primary mark',
    category: 'branding',
    members: ['in-your-prime--0', 'in-your-prime--3', 'in-your-prime--1', 'in-your-prime--2', 'in-your-prime--4', 'in-your-prime--5', 'in-your-prime--6'],
  },
  {
    id: 'set-anniversary-mark',
    title: 'Anniversary mark',
    category: 'branding',
    members: ['amtec-60-identity--0', 'amtec-60-identity--2', 'amtec-60-event--5', 'amtec-60-event--4', 'amtec-60-merch--0', 'amtec-60-event--3', 'amtec-60-merch--2', 'amtec-60-merch--3', 'amtec-60-event--2', 'amtec-60-event--0'],
  },
  {
    id: 'set-2020-front',
    title: '2020 — front',
    category: 'illustration',
    members: ['amtec-christmas-cards--3', 'amtec-christmas-cards--4'],
  },
  {
    id: 'set-2021-front',
    title: '2021 — front',
    category: 'illustration',
    members: ['amtec-christmas-cards--6', 'amtec-christmas-cards--7'],
  },
  {
    id: 'set-printed-card',
    title: 'Printed card',
    category: 'illustration',
    members: ['amtec-christmas-2022--0', 'amtec-christmas-2022--1'],
  },
  {
    id: 'set-automate-your-staffing-agency',
    title: 'Automate Your Staffing Agency',
    category: 'graphic-design',
    members: ['bilflo-display-ads--0', 'bilflo-display-ads--1', 'bilflo-display-ads--2', 'bilflo-display-ads--3', 'bilflo-display-ads--4', 'bilflo-display-ads--5', 'bilflo-display-ads--6', 'bilflo-display-ads--7', 'bilflo-display-ads--8', 'bilflo-display-ads--9'],
  },
  {
    id: 'set-landscape',
    title: 'Landscape',
    category: 'illustration',
    members: ['desert-christmas--0', 'desert-christmas--1'],
  },
  {
    id: 'set-red-on-green',
    title: 'Red on green',
    category: 'illustration',
    members: ['guitar-print-les-paul-junior--1', 'guitar-print-les-paul-junior--0', 'guitar-print-les-paul-junior--2'],
  },
  {
    id: 'set-workstation-wallpaper',
    title: 'Workstation wallpaper',
    category: 'illustration',
    members: ['workstation-wallpaper', 'recording-studio'],
  },
  {
    id: 'set-red-on-gray',
    title: 'Red on gray',
    category: 'illustration',
    members: ['guitar-print-mustang--1', 'guitar-print-mustang--2', 'guitar-print-mustang--0'],
  },
  {
    id: 'set-black-on-gray',
    title: 'Black on gray',
    category: 'illustration',
    members: ['guitar-print-les-paul--0', 'guitar-print-les-paul--1', 'guitar-print-les-paul--2'],
  },
  {
    id: 'set-sunburst-on-green',
    title: 'Sunburst on green',
    category: 'illustration',
    members: ['guitar-print-jaguar--1', 'guitar-print-jaguar--0', 'guitar-print-jaguar--2'],
  },
  {
    id: 'set-card-artwork-2',
    title: 'Card artwork',
    category: 'illustration',
    members: ['amtec-christmas-cards--5', 'amtec-christmas-cards--0', 'amtec-christmas-cards--1'],
  },
  {
    id: 'set-newsletter-three-editions',
    title: 'Newsletter, three editions',
    category: 'graphic-design',
    members: ['amtec-bitz--0', 'amtec-bitz--1', 'amtec-bitz--2', 'amtec-bitz--3', 'amtec-bitz--4', 'amtec-bitz--5'],
  },
  {
    id: 'set-suite-sign-100',
    title: 'Suite Sign 100',
    category: 'graphic-design',
    members: ['amtec-signage--2', 'amtec-signage--3', 'amtec-signage--0', 'amtec-signage--1'],
  },
  {
    id: 'set-card-front',
    title: 'Card front',
    category: 'illustration',
    members: ['amtec-christmas-2025--0', 'amtec-christmas-2025--1', 'amtec-holiday-campaigns--0', 'amtec-holiday-campaigns--1', 'amtec-holiday-campaigns--2', 'amtec-holiday-campaigns--4'],
  },
  {
    id: 'set-memorial-program',
    title: 'Memorial program',
    category: 'graphic-design',
    members: ['ray-johnson-memorial--1', 'ray-johnson-memorial--0'],
  },
  {
    id: 'set-brand-style-guide-12-pages',
    title: 'Brand style guide, 12 pages',
    category: 'branding',
    members: ['evergreen-identity--4', 'evergreen-lockups--0', 'evergreen-identity--2', 'evergreen-identity--3', 'evergreen-identity--1', 'evergreen-identity--0', 'evergreen-lockups--1', 'evergreen-lockups--3', 'evergreen-lockups--4', 'evergreen-lockups--6', 'evergreen-social--0', 'evergreen-social--1', 'evergreen-social--2', 'evergreen-social--3', 'evergreen-social--4'],
  },
  {
    id: 'set-tone-sauce',
    title: 'Tone Sauce',
    category: 'illustration',
    members: ['sauce-posters--2', 'sauce-posters--0', 'sauce-posters--1'],
  },
  {
    id: 'set-direct-hire-recruiting',
    title: 'Direct hire recruiting',
    category: 'graphic-design',
    members: ['tristaff-services--0', 'tristaff-services--1', 'tristaff-services--2', 'tristaff-services--3'],
  },
  {
    id: 'set-mic-drop-primary-mark',
    title: 'Mic Drop — primary mark',
    category: 'branding',
    members: ['mic-drop--0', 'mic-drop--1', 'mic-drop--2', 'mic-drop--3'],
  },
  {
    id: 'set-badge-lettering',
    title: 'Badge lettering',
    category: 'branding',
    members: ['bad-badge--0', 'bad-badge--1', 'bad-badge--2'],
  },
  {
    id: 'set-construction-banner',
    title: 'Construction Banner',
    category: 'graphic-design',
    members: ['amtec-signage--5', 'amtec-signage--6'],
  },
  {
    id: 'set-mug-2022-alternate',
    title: 'Mug, 2022 — alternate',
    category: 'graphic-design',
    members: ['amtec-merch--6', 'amtec-merch--5'],
  },
  {
    id: 'set-core-values-badge-tumbler',
    title: 'Core values badge tumbler',
    category: 'graphic-design',
    members: ['amtec-merch--7', 'amtec-merch--8'],
  },
  {
    id: 'set-economic-report-dec-2018-desktop',
    title: 'Economic Report Dec 2018 Desktop',
    category: 'graphic-design',
    members: ['economic-reports--0', 'economic-reports--1', 'economic-reports--2', 'economic-reports--3', 'economic-reports--4', 'economic-reports--5'],
  },
];
