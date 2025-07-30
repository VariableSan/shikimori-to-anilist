import type { DefaultQueryParams, UserAnimeRate, UserMangaRate } from '~/models/shikimori.model'

export function useShikimori() {
	const { $shikimoriApi } = useNuxtApp()

	const defaultParams: DefaultQueryParams = {
		limit: 10,
		page: 1,
	}

	async function fetchAnimeList(userId: string, params: DefaultQueryParams = defaultParams) {
		let animeRates: UserAnimeRate[] = []

		try {
			const res = await $shikimoriApi<UserAnimeRate[]>(`/users/${userId}/anime_rates`, {
				params,
				method: 'GET',
			})
			animeRates = res
		} catch (error) {
			console.error(error)
		}

		return animeRates
	}

	async function fetchMangaList(userId: string, params: DefaultQueryParams = defaultParams) {
		let mangaRates: UserMangaRate[] = []

		try {
			const res = await $shikimoriApi<UserMangaRate[]>(`/users/${userId}/manga_rates`, {
				params,
				method: 'GET',
			})
			mangaRates = res
		} catch (error) {
			console.error(error)
		}

		return mangaRates
	}

	return {
		fetchAnimeList,
		fetchMangaList,
	}
}
