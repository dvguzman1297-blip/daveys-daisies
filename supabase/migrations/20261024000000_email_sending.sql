-- Emailing a bouquet link to the recipient, optionally anonymously.

alter table daveys_daisies.bouquets
  -- Hide the sender's name from the email, the page header and link previews.
  add column if not exists anonymous boolean not null default false,
  -- Kept so the recipient can block/report from the email; never sent to browsers.
  add column if not exists recipient_email text
    check (recipient_email is null or char_length(recipient_email) between 3 and 254),
  add column if not exists email_sent_at timestamptz,
  -- Set when a recipient reports the letter; reported letters are no longer shown.
  add column if not exists reported_at timestamptz;

-- Addresses that asked not to receive our emails. Stored as a keyed hash, not the address itself.
create table if not exists daveys_daisies.email_blocks (
  email_hash text primary key,
  created_at timestamptz not null default now()
);

-- One row per email attempt, used for rate limiting and for tracing abuse reports.
-- Holds keyed hashes only (no raw IP addresses or email addresses).
create table if not exists daveys_daisies.email_sends (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  bouquet_id uuid references daveys_daisies.bouquets (id) on delete set null,
  ip_hash text not null,
  recipient_hash text not null
);

create index if not exists email_sends_ip_idx on daveys_daisies.email_sends (ip_hash, created_at desc);
create index if not exists email_sends_recipient_idx on daveys_daisies.email_sends (recipient_hash, created_at desc);

-- Same access model as `bouquets`: only the server-side service_role, nothing for anon/authenticated.
grant update on daveys_daisies.bouquets to service_role;
grant select, insert on daveys_daisies.email_blocks to service_role;
grant select, insert on daveys_daisies.email_sends to service_role;

alter table daveys_daisies.email_blocks enable row level security;
alter table daveys_daisies.email_sends enable row level security;
