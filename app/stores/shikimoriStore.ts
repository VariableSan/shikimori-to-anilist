import type { UserAnimeRate, UserMangaRate } from '~/models/shikimori.model'

export const useShikiState = defineStore(
	'shikiState',
	() => {
		const animeList = ref<UserAnimeRate[]>([])
		const mangaList = ref<UserMangaRate[]>([])

		const setAnimeList = (list: UserAnimeRate[]) => {
			animeList.value = list
		}

		const setMangaList = (list: UserMangaRate[]) => {
			mangaList.value = list
		}

		return {
			animeList,
			mangaList,

			setAnimeList,
			setMangaList,
		}
	},

	{
		persist: {
			storage: piniaPluginPersistedstate.localStorage(),
		},
	}
)
