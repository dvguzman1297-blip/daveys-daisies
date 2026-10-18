-- Allow the new wrap/vessel styles: newspaper, tissue, mason, pitcher, basket.
alter table daveys_daisies.bouquets
  drop constraint if exists bouquets_vase_style_check,
  add constraint bouquets_vase_style_check
    check (vase_style in ('glass', 'ribbon', 'kraft', 'newspaper', 'tissue', 'mason', 'pitcher', 'basket'));
