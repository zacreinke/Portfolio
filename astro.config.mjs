// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Deployed to GitHub Pages at https://zacreinke.github.io/Portfolio/
// If a custom domain is added later, set base to '/'.
export default defineConfig({
  site: 'https://zacreinke.github.io',
  base: '/Portfolio',
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
