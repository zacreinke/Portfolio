/**
 * Join a path in public/ onto the configured base.
 *
 * Astro rewrites imports from src/assets automatically, but anything hand-written
 * that points at public/ has to carry the base itself. That is a no-op at the
 * domain root and stays correct if the site ever moves under a subpath again.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
