/**
 * Join a path in public/ onto the configured base.
 *
 * Astro rewrites imports from src/assets automatically, but anything hand-written
 * that points at public/ has to carry the base itself or it 404s on GitHub Pages,
 * where the site is served from /Portfolio/ rather than the domain root.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
