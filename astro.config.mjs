import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { site } from './src/lib/site.ts';

export default defineConfig({
  site: site.url,
  trailingSlash: 'never',
  integrations: [
    react(),
    // Shared exercise pages (/practice/<code>) are for links, not search.
    sitemap({ filter: (page) => !/\/practice\/[a-z0-9]+$/.test(page) }),
  ],
});
