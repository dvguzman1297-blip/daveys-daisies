-- Optional background music played when the recipient opens the letter.
alter table daveys_daisies.bouquets
  add column if not exists music text
    check (music is null or music in (
      'clair-de-lune', 'liebestraum', 'canon-in-d', 'gymnopedie', 'love-song', 'fairytale-waltz'
    ));
