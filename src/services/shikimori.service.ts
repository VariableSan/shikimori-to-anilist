import {
  DefaultQueryParams,
  UserAnimeRate,
  UserMangaRate,
} from "~/models/shikimori.model"
import axios from "~/tools/shikimori-axios"

const defaultParams: DefaultQueryParams = {
  limit: 10,
  page: 1,
}

export async function fetchAnimeList(
  userId: string,
  params: DefaultQueryParams = defaultParams,
) {
  let animeRates: UserAnimeRate[] = []

  try {
    const res = await axios.get<UserAnimeRate[]>(
      `/users/${userId}/anime_rates`,
      {
        params,
      },
    )
    animeRates = res.data
  } catch (error) {
    console.error(error)
  }

  return animeRates
}

export async function fetchMangaList(
  userId: string,
  params: DefaultQueryParams = defaultParams,
) {
  let mangaRates: UserMangaRate[] = []

  try {
    const res = await axios.get<UserMangaRate[]>(
      `/users/${userId}/manga_rates`,
      {
        params,
      },
    )
    mangaRates = res.data
  } catch (error) {
    console.error(error)
  }

  return mangaRates
}
