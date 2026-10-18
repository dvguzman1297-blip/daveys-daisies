-- Bouquets: one row per shareable digital bouquet + letter.
-- The UUID primary key doubles as the unguessable share slug (/b/[id]).
-- Lives in its own schema so the app is isolated from anything else in `public`.

create schema if not exists daveys_daisies;

create table if not exists daveys_daisies.bouquets (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  sender_name    text not null check (char_length(sender_name) between 1 and 40),
  recipient_name text not null check (char_length(recipient_name) between 1 and 40),
  message        text not null check (char_length(message) between 1 and 500),
  theme          text not null default 'parchment'
                   check (theme in ('parchment', 'blush', 'midnight')),
  vase_style     text not null default 'glass'
                   check (vase_style in ('glass', 'ribbon', 'kraft')),
  -- [{ "id": "daisy", "name": "Daisy", "count": 3 }, ...]
  flowers        jsonb not null default '[]'::jsonb
                   check (jsonb_typeof(flowers) = 'array' and jsonb_array_length(flowers) between 1 and 6)
);

comment on table daveys_daisies.bouquets is 'Digital bouquets and letters shared via /b/[id].';

create index if not exists bouquets_created_at_idx on daveys_daisies.bouquets (created_at desc);

-- Access: only the server-side service_role may use this schema. Unlike
-- `public`, a new schema gets no default grants, so anon/authenticated have
-- no access at all. All access goes through the Next.js server, which
-- validates input and only ever fetches a single row by its id — nobody can
-- enumerate other people's letters.
grant usage on schema daveys_daisies to service_role;
grant select, insert on daveys_daisies.bouquets to service_role;

-- Defense in depth: RLS on with no policies, in case anon/authenticated are
-- ever granted access to this schema by mistake.
alter table daveys_daisies.bouquets enable row level security;

-- NOTE: Also add `daveys_daisies` to Project Settings → API (Data API) →
-- "Exposed schemas" in the Supabase dashboard; that setting can't be changed
-- from SQL on hosted projects.
