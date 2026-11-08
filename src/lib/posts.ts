/** Blog articles. The page for each lives at src/pages/blog/<slug>.astro. */
export type Post = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. "2026-11-06". */
  date: string;
  category: string;
};

export const posts: Post[] = [
  {
    slug: 'modern-defence-nd7-trap',
    title: 'Modern Defence: the 4...Nd7 trap',
    description:
      'A natural-looking knight move in the Modern Defence loses at once to 5.Bxf7+ and 6.Ng5+. ' +
      'See all three of Black’s king moves — two lose the queen, one is mate.',
    date: '2026-11-06',
    category: 'Opening traps',
  },
];

export function postBySlug(slug: string): Post {
  const post = posts.find((p) => p.slug === slug);
  if (!post) throw new Error(`Unknown post: ${slug}`);
  return post;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
