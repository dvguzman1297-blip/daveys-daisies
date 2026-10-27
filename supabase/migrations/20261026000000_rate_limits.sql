-- One row per rate-limited request (creating a bouquet, asking for a voice upload URL,
-- looking up a YouTube link). Holds keyed IP hashes only, never raw addresses.
create table if not exists daveys_daisies.action_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action text not null check (action in ('create_bouquet', 'voice_upload', 'youtube_lookup')),
  ip_hash text not null
);

create index if not exists action_log_lookup_idx on daveys_daisies.action_log (action, ip_hash, created_at desc);

-- Same access model as the other tables: service_role only.
grant select, insert, delete on daveys_daisies.action_log to service_role;
alter table daveys_daisies.action_log enable row level security;
