import { describe, expect, it } from 'vitest';
import { escapeAttr, escapeHtml } from './escape.ts';

describe('escapeHtml', () => {
  it('escapes all five special characters', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;',
    );
  });

  it('escapes & first, so entities are not double-escaped wrongly', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('escapes attribute values the same way', () => {
    expect(escapeAttr('https://x.test/?a=1&b="2"')).toBe('https://x.test/?a=1&amp;b=&quot;2&quot;');
  });
});
