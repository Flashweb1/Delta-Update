-- Idempotent DDL for the Delta Updates Next.js app.
-- The Supabase project already contains an externally managed schema (site_config,
-- admins, pending_users, media, native_auth migrations). drizzle-kit push cannot be
-- used against it because it compares against drizzle's snapshot and can prompt for
-- destructive fixes (e.g. truncating articles). All schema changes go through here:
--   npm run db:sync

-- 1. Article engagement counters (additive; DEFAULT fills existing rows).
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS likes integer NOT NULL DEFAULT 0;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS shares integer NOT NULL DEFAULT 0;

-- 2. Comment location shown under a reader's name (nullable; other app unaffected).
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS author_location text;

-- 3. Reader poll votes (this app's own feature).
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id              serial PRIMARY KEY,
  poll_question   text   NOT NULL,
  option_selected text   NOT NULL,
  voter_ip_hash   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS poll_votes_question_idx
  ON public.poll_votes (poll_question, option_selected);

-- 4. News tip inbox (this app's own feature).
CREATE TABLE IF NOT EXISTS public.news_tips (
  id               serial PRIMARY KEY,
  headline         text   NOT NULL,
  description      text   NOT NULL,
  location         text   NOT NULL,
  reporter_contact text,
  is_anonymous     boolean NOT NULL DEFAULT false,
  status           text   NOT NULL DEFAULT 'new',
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS news_tips_status_idx
  ON public.news_tips (status, created_at DESC);
