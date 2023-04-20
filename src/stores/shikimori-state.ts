import { defineStore } from "pinia"
import { UserAnimeRate } from "~/models/shikimori.model"

export const useShikiState = defineStore("shikiState", () => {
  /* ==================== refs START ==================== */
  const animeList = ref<UserAnimeRate[]>([])
  /* ==================== refs END ==================== */

  /* ==================== methods START ==================== */
  const setAnimeList = (list: UserAnimeRate[]) => {
    animeList.value = list
    localStorage.setItem("shikiAnimeList", JSON.stringify(animeList.value))
  }

  const setAnimeListFromStorage = () => {
    const shikiAnimeList = localStorage.getItem("shikiAnimeList")
    if (shikiAnimeList) {
      const list: UserAnimeRate[] = JSON.parse(shikiAnimeList)
      setAnimeList(list)
    }
  }
  /* ==================== methods END ==================== */

  return {
    animeList,

    setAnimeList,
    setAnimeListFromStorage,
  }
})
