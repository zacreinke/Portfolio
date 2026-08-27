export const site = {
  name: 'Zac Reinke',
  email: 'zacreinke1@gmail.com',
  tagline:
    'A lifelong creative problem-solver with a consistent desire to make beautiful things',
  description:
    'Portfolio of Zac Reinke — graphic design, illustration, web & UI design, 3D design, videography and music.',
} as const;

export type Category =
  | 'graphic-design'
  | 'illustration'
  | 'web-ui'
  | '3d'
  | 'videography'
  | 'music';

/**
 * Tab order, left to right. `all` is rendered first and is active by default.
 * Everything — the tab bar, the filtering and the empty states — derives from
 * this one array, so adding a category is a single edit here plus a folder
 * under src/assets/work/.
 */
export const categories: { id: Category; label: string }[] = [
  { id: 'graphic-design', label: 'Graphic Design' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'web-ui', label: 'Web/UI Design' },
  { id: '3d', label: '3D Design' },
  { id: 'videography', label: 'Videography' },
  { id: 'music', label: 'Music' },
];

export const categoryLabel = (id: Category): string =>
  categories.find((c) => c.id === id)?.label ?? id;
