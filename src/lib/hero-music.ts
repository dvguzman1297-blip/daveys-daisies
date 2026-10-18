/**
 * The song behind the homepage music chip. It plays through YouTube's embedded
 * player, so YouTube handles the licensing, and nothing is hosted here.
 * To change it, swap the video id (the part after `v=` in the link).
 */
export const HERO_MUSIC = {
  videoId: "JNCs0IZFN_0",
  title: "Can't Help Falling in Love",
  /** Shown while it plays, as a credit. */
  artist: "Matt Glossop",
} as const;
