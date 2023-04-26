import { MediaListStatus } from "~/gql/generated/schema"
import {
  AnimeStatus as ShikiAnimeStatus,
  UserRate,
} from "~/models/shikimori.model"

export const defaultTimeoutSec = 60

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

export function getRateName(rate: UserRate) {
  return rate.anime ? rate.anime.name : rate.manga.name
}

export function pauseApplication(sec = defaultTimeoutSec) {
  return new Promise(res => {
    setTimeout(res, sec * 1000)
  })
}
