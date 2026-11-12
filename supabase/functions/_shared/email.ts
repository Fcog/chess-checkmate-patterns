/**
 * The newsletter's two emails, as inline-styled HTML plus a plain-text part (FR-012).
 * contracts/email.md. Every value from data goes through escapeHtml/escapeAttr.
 */
import { escapeAttr, escapeHtml } from './escape.ts';

export type RenderedEmail = { subject: string; html: string; text: string };

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const BLUE = '#2563eb';

function wrap(inner: string, preheader = ''): string {
  const hidden = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>`
    : '';
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"></head>' +
    `<body style="margin:0;padding:0;background:#f5f5f4">${hidden}` +
    `<div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:${FONT};color:#1c1917;line-height:1.5">` +
    inner +
    '</div></body></html>'
  );
}

function button(href: string, label: string): string {
  return (
    `<a href="${escapeAttr(href)}" style="display:inline-block;background:${BLUE};color:#ffffff;` +
    'text-decoration:none;font-weight:600;padding:12px 24px;border-radius:6px">' +
    `${escapeHtml(label)}</a>`
  );
}

export function renderConfirmationEmail({ confirmUrl, siteUrl }: { confirmUrl: string; siteUrl: string }): RenderedEmail {
  const subject = 'Confirm your daily chess puzzle subscription';
  const host = siteUrl.replace(/^https?:\/\//, '');
  const html = wrap(
    `<h1 style="font-size:20px;margin:0 0 16px">Confirm your subscription</h1>` +
      `<p style="margin:0 0 16px">Someone (hopefully you) asked for a daily chess puzzle from ` +
      `<a href="${escapeAttr(siteUrl)}" style="color:${BLUE}">${escapeHtml(host)}</a> to be sent to this address. ` +
      'Click the button to start receiving it.</p>' +
      `<p style="margin:0 0 16px">${button(confirmUrl, 'Confirm subscription')}</p>` +
      '<p style="margin:0 0 8px;color:#57534e;font-size:14px">This link expires in 7 days.</p>' +
      `<p style="margin:0;color:#57534e;font-size:14px">If you didn't ask for this, ignore this email and you won't hear from us again.</p>`,
  );
  const text = [
    'Confirm your subscription',
    '',
    `Someone (hopefully you) asked for a daily chess puzzle from ${host} to be sent to this address.`,
    `Confirm here: ${confirmUrl}`,
    '',
    'This link expires in 7 days.',
    "If you didn't ask for this, ignore this email and you won't hear from us again.",
  ].join('\n');
  return { subject, html, text };
}

/** A puzzle as listed in /newsletter/puzzles.json. */
export type CataloguePuzzle = {
  code: string;
  topic: string;
  fen: string;
  side: 'white' | 'black';
  task: string;
  url: string;
  image: string;
  alt: string;
};

export type DailyEmail = RenderedEmail & { headers: Record<string, string> };

/** The newsletter tag on "Solve it" links (research R11): no redirect, no pixel. */
export const TRACKING_QUERY = 'utm_source=newsletter&utm_medium=email';

export function solveUrl(puzzle: CataloguePuzzle): string {
  return `${puzzle.url}${puzzle.url.includes('?') ? '&' : '?'}${TRACKING_QUERY}`;
}

function longDate(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function renderDailyEmail({
  puzzle,
  unsubscribeUrl,
  oneClickUrl,
  siteUrl,
  day,
}: {
  puzzle: CataloguePuzzle;
  unsubscribeUrl: string;
  oneClickUrl: string;
  siteUrl: string;
  /** YYYY-MM-DD (UTC). */
  day: string;
}): DailyEmail {
  const toMove = puzzle.side === 'white' ? 'White to move' : 'Black to move';
  const url = solveUrl(puzzle);
  const privacyUrl = `${siteUrl}/privacy`;
  const host = siteUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
  const subject = `Daily chess puzzle: ${puzzle.task}`;
  const muted = 'color:#78716c;font-size:13px';
  const html = wrap(
    `<p style="margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;${muted}">Daily puzzle · ${escapeHtml(longDate(day))}</p>` +
      '<div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:10px;padding:20px;text-align:center">' +
      `<img src="${escapeAttr(puzzle.image)}" width="320" height="320" alt="${escapeAttr(puzzle.alt)}" ` +
      'style="display:block;margin:0 auto 16px;max-width:100%;height:auto;border:0">' +
      `<p style="margin:0 0 4px;color:#57534e">${escapeHtml(toMove)}</p>` +
      `<p style="margin:0 0 20px;font-size:20px;font-weight:700">${escapeHtml(puzzle.task)}</p>` +
      `<p style="margin:0">${button(url, 'Solve it')}</p>` +
      '</div>' +
      `<p style="margin:20px 0 0;${muted}">You get this because you subscribed at ${escapeHtml(host)}. ` +
      `<a href="${escapeAttr(unsubscribeUrl)}" style="color:#78716c">Unsubscribe</a> · ` +
      `<a href="${escapeAttr(privacyUrl)}" style="color:#78716c">Privacy</a></p>` +
      `<p style="margin:4px 0 0;${muted}">Chess Patterns · The Netherlands</p>`,
    "Can you solve today's position?",
  );
  const text = [
    `Daily puzzle · ${longDate(day)}`,
    '',
    toMove,
    puzzle.task,
    '',
    `Solve it: ${url}`,
    '',
    `Board: ${puzzle.alt}`,
    '',
    `You get this because you subscribed at ${host}.`,
    `Unsubscribe: ${unsubscribeUrl}`,
    `Privacy: ${privacyUrl}`,
    'Chess Patterns · The Netherlands',
  ].join('\n');
  return {
    subject,
    html,
    text,
    headers: {
      'List-Unsubscribe': `<${oneClickUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}
