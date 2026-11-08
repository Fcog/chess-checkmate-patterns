import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { exercises } from '../src/lib/exercises';
import { motifById, motifPath, motifs } from '../src/lib/motifs';
import { posts } from '../src/lib/posts';
import { shareCode } from '../src/lib/share';
import { site } from '../src/lib/site';
import { practicePath, sharePath, topics } from '../src/lib/topics';

// Run with `npm run test:build`, which builds the site first.
const SITE = site.url;
const read = (file: string) => readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8');
const match = (html: string, re: RegExp) => html.match(re)?.[1];

const pages = [
  { path: '/', file: 'index.html' },
  { path: '/terms', file: 'terms/index.html' },
  { path: '/privacy', file: 'privacy/index.html' },
  { path: '/blog', file: 'blog/index.html' },
  ...posts.map((p) => ({ path: `/blog/${p.slug}`, file: `blog/${p.slug}/index.html` })),
  ...topics.map((t) => ({ path: t.path, file: `${t.path.slice(1)}/index.html` })),
  ...topics.map((t) => ({ path: practicePath(t.id), file: `${practicePath(t.id).slice(1)}/index.html` })),
  ...motifs.map((m) => ({ path: motifPath(m), file: `${motifPath(m).slice(1)}/index.html` })),
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

  it.each(motifs)('renders the text for $name into its page', (pattern) => {
    const html = read(`${motifPath(pattern).slice(1)}/index.html`);
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

  it.each(exercises)('has a spoiler-free share page for exercise $id', (exercise) => {
    const code = shareCode(exercise.id);
    const path = sharePath(exercise.topic, code);
    const html = read(`${path.slice(1)}/index.html`);
    const title = match(html, /<title>(.*?)<\/title>/) ?? '';
    const pattern = motifById(exercise.motifId);
    expect(title).toMatch(
      exercise.goal.kind === 'mate'
        ? /^Checkmate puzzle: (White|Black) to mate in \d+ \| /
        : exercise.goal.kind === 'quiz'
          ? /^Chess puzzle: does the sacrifice work\? \| /
          : /^Chess puzzle: (White|Black) to play and [a-z ]+ \| /,
    );
    expect(html).toContain(`<link rel="canonical" href="${SITE}${path}"`);
    expect(html).toContain('<meta name="robots" content="noindex"');
    // What a visitor or a link preview sees must not give the pattern away. (The filter
    // list on the page names every pattern, so only these parts are checked.)
    const visible = [
      title,
      match(html, /<meta name="description" content="(.*?)"/),
      match(html, /<meta property="og:title" content="(.*?)"/),
      match(html, /<meta property="og:description" content="(.*?)"/),
      match(html, /<h1>(.*?)<\/h1>/),
    ].join(' ');
    expect(visible).not.toMatch(new RegExp(exercise.motifId.replace('-', '.'), 'i'));
    expect(visible).not.toContain(pattern?.name.replaceAll("'", '&#39;'));
    expect(html).not.toContain(exercise.id);
  });

  it.each(posts)('publishes the post "$title" as a blog article', (post) => {
    const html = read(`blog/${post.slug}/index.html`);
    expect(html).toContain('"@type":"BlogPosting"');
    expect(read('blog/index.html')).toContain(`href="/blog/${post.slug}"`);
  });

  it('lists every page in the sitemap, and not the 404 page', () => {
    const sitemap = read('sitemap-0.xml');
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(
      pages.map((p) => (p.path === '/' ? `${SITE}/` : `${SITE}${p.path}`)).sort(),
    );
  });
});
