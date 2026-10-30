import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { patterns } from '../src/lib/patterns';

// Run with `npm run test:build`, which builds the site first.
const SITE = 'https://www.checkmate-patterns.com';
const read = (file: string) => readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8');
const match = (html: string, re: RegExp) => html.match(re)?.[1];

const pages = [
  { path: '/', file: 'index.html' },
  { path: '/practice', file: 'practice/index.html' },
  { path: '/terms', file: 'terms/index.html' },
  { path: '/privacy', file: 'privacy/index.html' },
  ...patterns.map((p) => ({ path: `/patterns/${p.id}`, file: `patterns/${p.id}/index.html` })),
];

describe.skipIf(!existsSync(new URL('../dist', import.meta.url)))('built site', () => {
  const heads = pages.map(({ path, file }) => {
    const html = read(file);
    return {
      path,
      html,
      title: match(html, /<title>(.*?)<\/title>/),
      description: match(html, /<meta name="description" content="(.*?)"/),
      canonical: match(html, /<link rel="canonical" href="(.*?)"/),
      h1: match(html, /<h1>(.*?)<\/h1>/),
    };
  });

  it.each(heads)('$path has a title, description, canonical URL and h1', (page) => {
    expect(page.title).toBeTruthy();
    expect(page.description).toBeTruthy();
    expect(page.h1).toBeTruthy();
    expect(page.canonical).toBe(page.path === '/' ? `${SITE}/` : `${SITE}${page.path}`);
    expect(page.html).toContain(`<meta property="og:url" content="${page.canonical}"`);
  });

  it('uses a unique title and description on every page', () => {
    expect(new Set(heads.map((p) => p.title)).size).toBe(heads.length);
    expect(new Set(heads.map((p) => p.description)).size).toBe(heads.length);
  });

  it.each(patterns)('renders the text for $name into its page', (pattern) => {
    const html = read(`patterns/${pattern.id}/index.html`);
    const escape = (s: string) => s.replaceAll("'", '&#39;').replaceAll('"', '&quot;');
    expect(html).toContain(`<h1>${escape(pattern.name)}</h1>`);
    expect(html).toContain(escape(pattern.intro));
    expect(html).toContain('application/ld+json');
  });

  it.each(['terms', 'privacy'])('fills in the operator details on /%s', (page) => {
    // Placeholders live in src/lib/site.ts.
    expect(read(`${page}/index.html`)).not.toContain('[TODO');
  });

  it('links to the terms and privacy pages from the footer of every page', () => {
    for (const page of heads) {
      expect(page.html).toContain('href="/terms"');
      expect(page.html).toContain('href="/privacy"');
    }
  });

  it('lists every page in the sitemap, and not the 404 page', () => {
    const sitemap = read('sitemap-0.xml');
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(
      pages.map((p) => (p.path === '/' ? `${SITE}/` : `${SITE}${p.path}`)).sort(),
    );
  });
});
