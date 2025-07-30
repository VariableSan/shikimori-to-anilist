<script setup lang="ts">
	import type { IterationStatus } from '~/models/common.model'
	import type { RateType, UserRate } from '~/models/shikimori.model'
	import { getRateName, pauseApplication } from '~/shared/helpers'

	defineOptions({
		name: 'IndexPage',
	})

	const runtimeConfig = useRuntimeConfig()

	const toast = useToast()
	const { fetchAnimeList, fetchMangaList } = useShikimori()
	const { exportRateToAnilist, searchTitle } = useAnilist()

	const globalState = useGlobalStore()
	const anilistStore = useAnilistState()
	const shikiStore = useShikiState()

	const STATUSES = {
		enabled: (text = 'active') => ({
			text,
			color: 'text-green-500',
			status: true,
		}),
		disabled: (text = 'not active') => ({
			text,
			color: 'text-red-500',
			status: false,
		}),
	}

	const anilistLoginStatus = computed(() => {
		if (anilistStore.token) {
			return STATUSES.enabled()
		}
		return STATUSES.disabled()
	})

	const shikiAnimeListStatus = computed(() => {
		if (shikiAnimeRateList.value.length) {
			return STATUSES.enabled('imported')
		}
		return STATUSES.disabled('not imported')
	})
	const shikiMangaListStatus = computed(() => {
		if (shikiMangaRateList.value.length) {
			return STATUSES.enabled('imported')
		}
		return STATUSES.disabled('not imported')
	})

	const shikiAnimeRateList = computed(() => shikiStore.animeList)
	const shikiMangaRateList = computed(() => shikiStore.mangaList)

	const isAnimeReadyToImport = computed(
		() => shikiAnimeListStatus.value.status && anilistLoginStatus.value.status
	)
	const isMangaReadyToImport = computed(
		() => shikiMangaListStatus.value.status && anilistLoginStatus.value.status
	)

	const shikimoriId = ref<string>()
	const fetchingLimit = ref(10)
	const timeoutSec = ref(60)
	const failedRateList = ref<UserRate[]>([])

	const importAnimeFromShiki = async () => {
		if (shikimoriId.value?.length) {
			shikiStore.setAnimeList([])
			globalState.toggleLoadingState()

			globalState.loader.message = 'Importing anime...'

			const res = await fetchAnimeList(shikimoriId.value, {
				limit: fetchingLimit.value,
				page: 1,
			})
			shikiStore.setAnimeList(res)

			globalState.toggleLoadingState()

			toast.add({ title: 'Anime list imported successfully', color: 'success' })
		} else {
			toast.add({ title: 'Empty Shikimori ID', color: 'warning' })
		}
	}

	const importMangaFromShiki = async () => {
		if (shikimoriId.value?.length) {
			shikiStore.setMangaList([])
			globalState.toggleLoadingState()

			globalState.loader.message = 'Importing manga...'

			const res = await fetchMangaList(shikimoriId.value, {
				limit: fetchingLimit.value,
				page: 1,
			})
			shikiStore.setMangaList(res)

			globalState.toggleLoadingState()

			toast.add({ title: 'Manga list imported successfully', color: 'success' })
		} else {
			toast.add({ title: 'Empty Shikimori ID', color: 'warning' })
		}
	}

	const loginWithAnilist = () => {
		let isAgreedToRelogin = true

		if (!anilistStore.isTokenExpired) {
			isAgreedToRelogin = confirm('Your Anilist token has not expired. Do you want to re-login?')
		}

		if (isAgreedToRelogin) {
			const { anilistClientId } = runtimeConfig.public
			anilistStore.clearToken()
			window.open(
				`https://anilist.co/api/v2/oauth/authorize?client_id=${anilistClientId}&response_type=token`,
				'_self'
			)
		}
	}

	const searchAndHandleTitle = async (rate: UserRate) => {
		const rateName = getRateName(rate)

		const { anilistRes, notFound } = await searchTitle(rate)
		let iterationStatus: IterationStatus = null

		if (notFound) {
			console.error(`Not found: ${rateName}`)
			failedRateList.value.push(rate)
			iterationStatus = 'skip'
		} else if (!anilistRes) {
			console.error(`Anilist response is undefined for ${getRateName(rate)}`)
			const interval = setApplicationTimeout()
			await pauseApplication(timeoutSec.value)
			clearInterval(interval)
			iterationStatus = 'step-back'
		}

		return {
			anilistRes,
			iterationStatus,
		}
	}

	const handleExporting = async (rate: UserRate, anilistRes: unknown) => {
		let iterationStatus: IterationStatus = null
		const rateName = getRateName(rate)

		const { status: errorStatus, data: errorData } = await exportRateToAnilist(rate, anilistRes)

		if (errorStatus === 403) {
			failedRateList.value.push(rate)

			console.error(
				`Error response for rate ${rateName}: ${JSON.stringify(errorData)}. The iteration continues`
			)
		} else if (errorData) {
			console.error(`Error response: ${JSON.stringify(errorData)}`)
			const interval = setApplicationTimeout()
			await pauseApplication(timeoutSec.value)
			clearInterval(interval)
			iterationStatus = 'step-back'
		}

		return iterationStatus
	}

	const exportRateListToAnilist = async (type: RateType) => {
		let rateList: UserRate[] = []
		failedRateList.value = []

		if (type === 'anime') {
			rateList = shikiAnimeRateList.value
		} else {
			rateList = shikiMangaRateList.value
		}

		globalState.toggleLoadingState()

		for (let step = 0; step < rateList.length; step++) {
			const rate = rateList[step]!

			globalState.loader.message = `Exporting: ${getRateName(rate)}`

			const { anilistRes, iterationStatus: searchIterationStatus } =
				await searchAndHandleTitle(rate)

			if (searchIterationStatus === 'skip') {
				continue
			} else if (searchIterationStatus === 'step-back') {
				step = step - 1
				continue
			}

			const exportIterationStatus = await handleExporting(rate, anilistRes)

			if (exportIterationStatus === 'step-back') {
				step = step - 1
				continue
			}
		}

		globalState.toggleLoadingState()

		if (failedRateList.value.length) {
			toast.add({ title: 'Several failed imports', color: 'warning' })
			console.info('failedRateList', failedRateList.value)
		}
	}

	const setApplicationTimeout = (timeLeft = timeoutSec.value) => {
		const interval = setInterval(() => {
			if (timeLeft <= 0) {
				clearInterval(interval)
			}
			globalState.loader.message = `Timeout: ${--timeLeft} sec`
		}, 1000)
		return interval
	}
</script>

<template>
	<UContainer class="py-10">
		<section class="mb-8 rounded border p-4">
			<h3 class="mb-3 text-lg">Export/Import Settings</h3>
			<div class="flex gap-1">
				<UFormField label="Fetching limit" class="w-1/4">
					<UInput v-model="fetchingLimit"></UInput>
				</UFormField>

				<UFormField label="Timeout (sec)" class="w-1/4">
					<UInput v-model="timeoutSec"></UInput>
				</UFormField>
			</div>
		</section>

		<section class="mb-8 rounded border p-4">
			<div class="grid grid-cols-2 items-end gap-x-4">
				<UInput v-model="shikimoriId" label="Shikimori ID" @enter="importAnimeFromShiki"></UInput>

				<div class="flex gap-4">
					<UButton
						icon="carbon:download"
						:disabled="globalState.loader.show"
						@click="importAnimeFromShiki"
					>
						<p class="mr-2">Import anime list</p>
					</UButton>

					<UButton
						icon="carbon:download"
						:disabled="globalState.loader.show"
						@click="importMangaFromShiki"
					>
						<p class="mr-2">Import manga list</p>
					</UButton>
				</div>

				<div class="mt-2 mb-4 flex border-b pb-4">
					<p class="mr-4">
						Anime list status:
						<span :class="shikiAnimeListStatus.color">
							{{ shikiAnimeListStatus.text }}
						</span>
					</p>
					<p>
						Manga list status:
						<span :class="shikiMangaListStatus.color">
							{{ shikiMangaListStatus.text }}
						</span>
					</p>
				</div>
			</div>

			<div class="flex items-center">
				<UButton class="mr-4" :disabled="globalState.loader.show" @click="loginWithAnilist">
					Login with Anilist
				</UButton>
				<p>
					Anilist login status:
					<span :class="anilistLoginStatus.color">
						{{ anilistLoginStatus.text }}
					</span>
				</p>
			</div>
		</section>

		<section class="flex justify-center">
			<UButton
				class="mr-4"
				icon="carbon:export"
				:disabled="!isAnimeReadyToImport || globalState.loader.show"
				@click="exportRateListToAnilist('anime')"
			>
				<p class="mr-2">Export anime to Anilist</p>
			</UButton>

			<UButton
				icon="carbon:export"
				:disabled="!isMangaReadyToImport || globalState.loader.show"
				@click="exportRateListToAnilist('manga')"
			>
				<p class="mr-2">Export manga to Anilist</p>
			</UButton>
		</section>
	</UContainer>
</template>
