import { describe, expect, it } from 'vitest';
import { renderConfirmationEmail, renderDailyEmail, type CataloguePuzzle } from './email.ts';

describe('renderConfirmationEmail', () => {
  const confirmUrl = 'https://www.chess-patterns.com/newsletter/confirm?token=abc&x="1"';
  const email = renderConfirmationEmail({ confirmUrl, siteUrl: 'https://www.chess-patterns.com' });

  it('has the agreed subject', () => {
    expect(email.subject).toBe('Confirm your daily chess puzzle subscription');
  });

  it('puts the link, the expiry and the ignore note in both parts', () => {
    for (const part of [email.html, email.text]) {
      expect(part).toContain('expires in 7 days');
      expect(part).toMatch(/ignore this email/);
    }
    expect(email.text).toContain(confirmUrl);
  });

  it('escapes the link in the HTML', () => {
    expect(email.html).toContain('href="https://www.chess-patterns.com/newsletter/confirm?token=abc&amp;x=&quot;1&quot;"');
    expect(email.html).not.toContain('x="1"');
  });
});

describe('renderDailyEmail', () => {
  const puzzle: CataloguePuzzle = {
    code: 'k3x9a',
    topic: 'tactics',
    fen: '6k1/8/8/8/8/8/8/6K1 b - - 0 1',
    side: 'black',
    task: 'Is the sacrifice sound or not?',
    url: 'https://www.chess-patterns.com/attacks/practice/k3x9a',
    image: 'https://www.chess-patterns.com/newsletter/board/k3x9a.png',
    alt: 'Chess position, Black to move. White: king g1. Black: king g8.',
  };
  const unsubscribeUrl = 'https://www.chess-patterns.com/newsletter/unsubscribe?token=t1';
  const oneClickUrl = 'https://ref.supabase.co/functions/v1/newsletter-unsubscribe?token=t1';
  const email = renderDailyEmail({
    puzzle,
    unsubscribeUrl,
    oneClickUrl,
    siteUrl: 'https://www.chess-patterns.com',
    day: '2026-11-12',
  });
  const solve = 'https://www.chess-patterns.com/attacks/practice/k3x9a?utm_source=newsletter&utm_medium=email';

  it('uses the task as the subject', () => {
    expect(email.subject).toBe('Daily chess puzzle: Is the sacrifice sound or not?');
  });

  it('shows the board, the side to move (even for a quiz), the task and Solve it', () => {
    expect(email.html).toContain(`src="${puzzle.image}" width="320" height="320" alt="${puzzle.alt}"`);
    expect(email.html).toContain('Black to move');
    expect(email.html).toContain(puzzle.task);
    expect(email.html).toContain(`href="${solve.replace('&', '&amp;')}"`);
    expect(email.html).toContain('12 November 2026');
  });

  it('has a usable text part', () => {
    expect(email.text).toContain('Black to move');
    expect(email.text).toContain(puzzle.task);
    expect(email.text).toContain(`Solve it: ${solve}`);
    expect(email.text).toContain(puzzle.alt);
    expect(email.text).toContain(unsubscribeUrl);
  });

  it('has no image besides the board (no tracking pixel)', () => {
    expect(email.html.match(/<img /g)).toHaveLength(1);
  });

  it('supports one-click unsubscribe', () => {
    expect(email.headers).toEqual({
      'List-Unsubscribe': `<${oneClickUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    });
  });

  it('escapes data values', () => {
    const evil = renderDailyEmail({
      puzzle: { ...puzzle, task: '<script>alert(1)</script>' },
      unsubscribeUrl,
      oneClickUrl,
      siteUrl: 'https://www.chess-patterns.com',
      day: '2026-11-12',
    });
    expect(evil.html).not.toContain('<script>');
    expect(evil.html).toContain('&lt;script&gt;');
  });
});
