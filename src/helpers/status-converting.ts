import { MediaListStatus } from "~/gql/generated/schema"
import { AnimeStatus as ShikiAnimeStatus } from "~/models/shikimori.model"

export function convertShikiStatusToAnilist(
  skikiAnimeStatus: ShikiAnimeStatus,
) {
  switch (skikiAnimeStatus) {
    case ShikiAnimeStatus.COMPLETED:
      return MediaListStatus.Completed
    case ShikiAnimeStatus.DROPPED:
      return MediaListStatus.Dropped
    case ShikiAnimeStatus.ON_HOLD:
      return MediaListStatus.Paused
    case ShikiAnimeStatus.PLANNED:
      return MediaListStatus.Planning
    case ShikiAnimeStatus.REWATCHING:
      return MediaListStatus.Repeating
    case ShikiAnimeStatus.WATCHING:
      return MediaListStatus.Current
  }
}
