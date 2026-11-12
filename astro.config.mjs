import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { site } from './src/lib/site.ts';

export default defineConfig({
  site: site.url,
  trailingSlash: 'never',
  integrations: [
    react(),
    // Shared exercise pages (/practice/<code>) are for links, not search, and so are the
    // newsletter's confirm and unsubscribe pages.
    sitemap({
      filter: (page) => !/\/practice\/[a-z0-9]+$/.test(page) && !/\/newsletter\//.test(page),
    }),
  ],
});
