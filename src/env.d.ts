interface ImportMetaEnv {
  /** Base URL of the newsletter Edge Functions, e.g. https://<ref>.supabase.co/functions/v1. */
  readonly PUBLIC_NEWSLETTER_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
