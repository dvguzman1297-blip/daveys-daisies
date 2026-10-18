-- YouTube clips may now run up to the whole video (was capped at 60 seconds).
alter table daveys_daisies.bouquets drop constraint if exists bouquets_youtube_check;
alter table daveys_daisies.bouquets
  add constraint bouquets_youtube_check check (
    youtube is null or (
      jsonb_typeof(youtube) = 'object'
      and youtube->>'videoId' ~ '^[A-Za-z0-9_-]{11}$'
      and char_length(youtube->>'title') between 1 and 200
      and (youtube->>'start')::numeric >= 0
      and (youtube->>'end')::numeric - (youtube->>'start')::numeric between 1 and 43200
    )
  );
