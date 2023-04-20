import { UserAnimeRate } from "~/models/shikimori.model"
import axios from "~/tools/shikimori-axios"

export async function fetchAnimeList(userId: string) {
  let animeRates: UserAnimeRate[] = []

  try {
    const res = await axios.get<UserAnimeRate[]>(`/users/${userId}/anime_rates`)
    animeRates = res.data
  } catch (error) {
    console.error(error)
  }

  return animeRates
}
