-- Daily puzzle newsletter (specs/001-daily-puzzle-newsletter/data-model.md).
--
-- Every table has row-level security on and no policies: only the Edge Functions, using the
-- service role, can read or write. Nothing is reachable with the anon key.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Subscriber (spec: Key Entities). Stores only what FR-017 allows.
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique
    check (char_length(email) <= 320 and email = lower(btrim(email))),
  status text not null check (status in ('pending', 'active', 'unsubscribed')),
  confirm_token uuid not null unique default gen_random_uuid(),
  confirm_expires_at timestamptz,
  confirmation_sent_at timestamptz,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  subscribed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_reason text check (unsubscribe_reason in ('user', 'bounce', 'complaint'))
);
create index newsletter_subscribers_status_idx on public.newsletter_subscribers (status);

-- Daily puzzle: one row per UTC day, also the send history the owner checks (FR-020).
create table public.newsletter_days (
  day date primary key,
  cycle int not null,
  puzzle_code text not null,
  send_started_at timestamptz,
  send_finished_at timestamptz,
  recipients int,
  sent int,
  failed int,
  created_at timestamptz not null default now(),
  unique (cycle, puzzle_code)
);

-- One row per recipient per day: lets a send resume without emailing anyone twice (SC-005).
create table public.newsletter_deliveries (
  day date not null references public.newsletter_days (day),
  subscriber_id uuid not null references public.newsletter_subscribers (id) on delete cascade,
  batch_no int not null,
  status text not null check (status in ('claimed', 'sent', 'failed')),
  resend_id text,
  updated_at timestamptz not null default now(),
  primary key (day, subscriber_id)
);
create index newsletter_deliveries_batch_idx
  on public.newsletter_deliveries (day, status, batch_no);

-- Short-lived scrambled IP addresses for the sign-up rate limit (clarification Q2).
create table public.newsletter_signup_attempts (
  ip_hash text not null,
  at timestamptz not null default now()
);
create index newsletter_signup_attempts_idx
  on public.newsletter_signup_attempts (ip_hash, at);

alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_days enable row level security;
alter table public.newsletter_deliveries enable row level security;
alter table public.newsletter_signup_attempts enable row level security;

-- Claims the next batch of today's recipients in one statement (research R6): active
-- subscribers with no delivery row for the day, up to p_limit of them, under a new batch
-- number. `skip locked` and the primary key keep two overlapping runs from claiming the same
-- subscriber.
create or replace function public.newsletter_claim_batch(p_day date, p_limit int)
returns table (subscriber_id uuid, email text, unsubscribe_token uuid, batch_no int)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_batch int;
begin
  -- One claim at a time per day, so batch numbers never collide.
  perform pg_advisory_xact_lock(hashtext('newsletter_claim_batch'), (p_day - date '2000-01-01'));

  select coalesce(max(d.batch_no), 0) + 1 into v_batch
  from newsletter_deliveries d
  where d.day = p_day;

  return query
  with picked as (
    select s.id
    from newsletter_subscribers s
    where s.status = 'active'
      and not exists (
        select 1 from newsletter_deliveries d where d.day = p_day and d.subscriber_id = s.id
      )
    order by s.confirmed_at, s.id
    limit p_limit
    for update of s skip locked
  ),
  claimed as (
    insert into newsletter_deliveries (day, subscriber_id, batch_no, status)
    select p_day, picked.id, v_batch, 'claimed' from picked
    on conflict do nothing
    returning newsletter_deliveries.subscriber_id
  )
  select s.id, s.email, s.unsubscribe_token, v_batch
  from claimed c
  join newsletter_subscribers s on s.id = c.subscriber_id;
end;
$$;

revoke execute on function public.newsletter_claim_batch(date, int) from public, anon, authenticated;
grant execute on function public.newsletter_claim_batch(date, int) to service_role;

-- Nightly clean-up (data-model.md, Retention): expired pending addresses (FR-004a), IP hashes
-- older than 24 hours (Q2) and delivery rows older than 7 days.
select cron.schedule(
  'newsletter-cleanup',
  '30 3 * * *',
  $$
    delete from public.newsletter_subscribers
      where status = 'pending' and confirm_expires_at < now();
    delete from public.newsletter_signup_attempts
      where at < now() - interval '24 hours';
    delete from public.newsletter_deliveries
      where day < current_date - 7;
  $$
);
