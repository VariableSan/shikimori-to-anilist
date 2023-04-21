export interface UserAnimeRate {
  id: number
  score: number
  status: AnimeStatus
  text: string
  episodes: number
  chapters: number
  volumes: number
  text_html: string
  rewatches: number
  created_at: string
  updated_at: string
  user: User
  anime: Anime
  manga: null
}

export interface Anime {
  id: number
  name: string
  russian: string
  image: AnimeImage
  url: string
  kind: string
  score: string
  status: string
  episodes: number
  episodes_aired: number
  aired_on: string
  released_on: string
}

export interface AnimeImage {
  original: string
  preview: string
  x96: string
  x48: string
}

export interface User {
  id: number
  nickname: string
  avatar: string
  image: UserImage
  last_online_at: string
  url: string
}

export interface UserImage {
  x160: string
  x148: string
  x80: string
  x64: string
  x48: string
  x32: string
  x16: string
}

export interface DefaultQueryParams {
  limit: number
  page: number
}

export enum AnimeStatus {
  PLANNED = "planned",
  WATCHING = "watching",
  REWATCHING = "rewatching",
  COMPLETED = "completed",
  ON_HOLD = "on_hold",
  DROPPED = "dropped",
}

export interface UserMangaRate {
  id: number
  score: number
  status: AnimeStatus
  text: null
  episodes: null
  chapters: number
  volumes: number
  text_html: string
  rewatches: number
  created_at: string
  updated_at: string
  user: User
  anime: null
  manga: Manga
}

export interface Manga {
  id: number
  name: string
  russian: string
  image: MangaImage
  url: string
  kind: string
  score: string
  status: string
  volumes: number
  chapters: number
  aired_on: null
  released_on: null
}

export interface MangaImage {
  original: string
  preview: string
  x96: string
  x48: string
}
