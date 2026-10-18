-- Letters can now run up to 5000 characters (was 500).
alter table daveys_daisies.bouquets drop constraint if exists bouquets_message_check;
alter table daveys_daisies.bouquets
  add constraint bouquets_message_check check (char_length(message) between 1 and 5000);
