-- Schedules the daily newsletter send for one Supabase project. Not a migration: the project
-- URL differs per environment, and the secret must never be written into a migration.
--
-- Usage (SQL editor, or psql against the project), once per environment:
--   1. Replace <PROJECT_REF> below with the project's ref (Settings → General).
--   2. Store the same CRON_SECRET the daily-newsletter function has (`supabase secrets set`)
--      in Vault, once:
--        select vault.create_secret('<CRON_SECRET>', 'newsletter_cron_secret');
--   3. Run this file. Re-running it replaces the jobs (cron.schedule upserts by name).
--
-- Jobs (research R5, R6):
--   daily-newsletter        07:00 UTC  the send (clarification Q3)
--   daily-newsletter-retry  07:30 UTC  finishes a send whose chain of self-calls broke and
--                                      retries failed batches; does nothing once the day is done

select cron.schedule(
  'daily-newsletter',
  '0 7 * * *',
  $$
    select net.http_post(
      url := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-newsletter',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets where name = 'newsletter_cron_secret'
        ),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

select cron.schedule(
  'daily-newsletter-retry',
  '30 7 * * *',
  $$
    select net.http_post(
      url := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-newsletter?retry=1',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets where name = 'newsletter_cron_secret'
        ),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);
