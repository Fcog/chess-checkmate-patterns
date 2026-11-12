/** HTML-escapes a value for element text (all five special characters). */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Escapes a value for an attribute such as `href` or `src`. */
export function escapeAttr(value: string): string {
  return escapeHtml(value);
}
