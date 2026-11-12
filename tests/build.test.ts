import { existsSync, readFileSync } from 'node:fs';
import { renderDailyEmail, type CataloguePuzzle } from '../supabase/functions/_shared/email';
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

  describe('newsletter', () => {
    const catalogue = JSON.parse(read('newsletter/puzzles.json')) as {
      version: number;
      puzzles: CataloguePuzzle[];
    };
    const byCode = new Map(catalogue.puzzles.map((p) => [p.code, p]));
    const groupNames = topics.flatMap((t) => t.groups);

    /** Text that must never show up in a puzzle's catalogue entry or email (FR-011). */
    function spoilers(exercise: (typeof exercises)[number]): RegExp[] {
      const motif = motifById(exercise.motifId);
      const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const list = [exercise.id, exercise.motifId, motif?.name ?? '', exercise.hint ?? '', ...groupNames]
        .filter(Boolean)
        .map((s) => new RegExp(escape(s), 'i'));
      // Solution moves as whole words, e.g. "Qxh7+". A bare pawn push ("e5") is just a square
      // name, which the board description lists anyway, so it can't be checked this way.
      for (const san of exercise.solution.filter((m) => !/^[a-h][1-8]$/.test(m))) {
        list.push(new RegExp(`(^|[^A-Za-z0-9])${escape(san)}(?![A-Za-z0-9])`));
      }
      return list;
    }

    it('lists every exercise once in the puzzle catalogue', () => {
      expect(catalogue.version).toBe(1);
      expect(catalogue.puzzles).toHaveLength(exercises.length);
      for (const exercise of exercises) expect(byCode.has(shareCode(exercise.id))).toBe(true);
    });

    it.each(exercises)('has a board picture and a share page for $id', (exercise) => {
      const entry = byCode.get(shareCode(exercise.id))!;
      const png = readFileSync(new URL(`../dist${new URL(entry.image).pathname}`, import.meta.url));
      expect([...png.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
      expect(entry.url).toBe(`${SITE}${sharePath(exercise.topic, entry.code)}`);
      expect(existsSync(new URL(`../dist${new URL(entry.url).pathname}/index.html`, import.meta.url))).toBe(true);
    });

    it.each(exercises)('keeps the catalogue entry and email for $id spoiler-free', (exercise) => {
      const entry = byCode.get(shareCode(exercise.id))!;
      expect(Object.keys(entry).sort()).toEqual(['alt', 'code', 'fen', 'image', 'side', 'task', 'topic', 'url']);
      const email = renderDailyEmail({
        puzzle: entry,
        unsubscribeUrl: `${SITE}/newsletter/unsubscribe?token=t`,
        oneClickUrl: 'https://ref.supabase.co/functions/v1/newsletter-unsubscribe?token=t',
        siteUrl: SITE,
        day: '2026-11-12',
      });
      const texts = [JSON.stringify(entry), email.subject, email.html, email.text];
      for (const pattern of spoilers(exercise)) {
        for (const text of texts) expect(text).not.toMatch(pattern);
      }
    });

    it('explains the newsletter on the privacy page', () => {
      const html = read('privacy/index.html');
      expect(html).toContain('newsletter');
      expect(html).toContain('Resend');
      expect(html).not.toContain('never ask for your name, email');
    });

    it('puts the sign-up form on the homepage', () => {
      expect(read('index.html')).toMatch(/<astro-island[^>]*component-url="[^"]*NewsletterSignup/);
    });
  });
});
