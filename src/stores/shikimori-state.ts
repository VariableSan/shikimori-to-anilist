import { defineStore } from "pinia"
import { UserAnimeRate } from "~/models/shikimori.model"

export const useShikiState = defineStore("shikiState", () => {
  /* ==================== refs START ==================== */
  const animeList = ref<UserAnimeRate[]>([])
  const mangaList = ref<UserAnimeRate[]>([])
  /* ==================== refs END ==================== */

  /* ==================== methods START ==================== */
  const setAnimeList = (list: UserAnimeRate[]) => {
    animeList.value = list
    localStorage.setItem("shikiAnimeList", JSON.stringify(animeList.value))
  }

  const setMangaList = (list: UserAnimeRate[]) => {
    mangaList.value = list
    localStorage.setItem("shikiMangaList", JSON.stringify(animeList.value))
  }

  const setAnimeListFromStorage = () => {
    const shikiAnimeList = localStorage.getItem("shikiAnimeList")
    if (shikiAnimeList) {
      const list: UserAnimeRate[] = JSON.parse(shikiAnimeList)
      setAnimeList(list)
    }
  }

  const setMangaListFromStorage = () => {
    const shikiMangaList = localStorage.getItem("shikiMangaList")
    if (shikiMangaList) {
      const list: UserAnimeRate[] = JSON.parse(shikiMangaList)
      setMangaList(list)
    }
  }
  /* ==================== methods END ==================== */

  return {
    animeList,
    mangaList,

    setAnimeList,
    setAnimeListFromStorage,
    setMangaList,
    setMangaListFromStorage,
  }
})
