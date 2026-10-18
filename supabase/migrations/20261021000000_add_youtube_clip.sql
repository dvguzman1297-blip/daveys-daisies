-- Optional YouTube clip played instead of a built-in track.
-- { "videoId": "dQw4w9WgXcQ", "title": "...", "author": "...", "start": 43, "end": 73 }
alter table daveys_daisies.bouquets
  add column if not exists youtube jsonb
    check (
      youtube is null or (
        jsonb_typeof(youtube) = 'object'
        and youtube->>'videoId' ~ '^[A-Za-z0-9_-]{11}$'
        and char_length(youtube->>'title') between 1 and 200
        and (youtube->>'start')::numeric >= 0
        and (youtube->>'end')::numeric - (youtube->>'start')::numeric between 1 and 60
      )
    );

-- A letter plays either a built-in track or a YouTube clip, never both.
alter table daveys_daisies.bouquets
  add constraint bouquets_one_music_source check (music is null or youtube is null);
