-- Optional voice message (up to 2 minutes) attached to a bouquet.

alter table daveys_daisies.bouquets
  -- Object path inside the private `voice-messages` bucket, e.g. voice/<uuid>.webm
  add column if not exists voice_path text
    check (voice_path is null or voice_path ~ '^voice/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webm|ogg|m4a|aac|mp3|wav)$'),
  add column if not exists voice_seconds integer
    check (voice_seconds is null or voice_seconds between 1 and 120);

alter table daveys_daisies.bouquets drop constraint if exists bouquets_voice_pair;
alter table daveys_daisies.bouquets
  add constraint bouquets_voice_pair check ((voice_path is null) = (voice_seconds is null));

-- Private bucket: nothing is public. The server hands the recipient a short-lived signed link,
-- and uploads go through signed upload URLs created by the server. 10 MB cap per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voice-messages',
  'voice-messages',
  false,
  10485760,
  array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/mpeg', 'audio/wav', 'audio/x-wav']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
