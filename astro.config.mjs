// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Served from the custom domain, so the site lives at the root. GitHub reads
// public/CNAME on deploy and redirects the apex to www automatically.
export default defineConfig({
  site: 'https://www.zacreinke.com',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: {
    // Source art is 1600-5000px wide; nothing on the page needs more than 1600.
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
