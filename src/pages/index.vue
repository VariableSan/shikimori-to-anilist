<script setup lang="ts">
import { getRateName, pauseApplication } from "~/helpers/general-tools"
import { IterationStatus } from "~/models/common.model"
import { RateType, UserRate } from "~/models/shikimori.model"
import anilistService from "~/services/anilist.service"
import { fetchAnimeList, fetchMangaList } from "~/services/shikimori.service"
import { useGlobalState } from "~/stores/global-state"
import { useShikiState } from "~/stores/shikimori-state"

defineOptions({
  name: "IndexPage",
})

/* ==================== composables START ==================== */
const globalState = useGlobalState()
const { t } = useI18n()
const anilistState = useAnilistState()
const shikiState = useShikiState()
/* ==================== composables END ==================== */

/* ==================== constants START ==================== */
const STATUSES = {
  enabled: (text = "active") => ({
    text,
    color: "text-green-500",
    status: true,
  }),
  disabled: (text = "not active") => ({
    text,
    color: "text-red-500",
    status: false,
  }),
}
/* ==================== constants END ==================== */

/* ==================== computeds START ==================== */
const anilistLoginStatus = computed(() => {
  if (anilistState.token) {
    return STATUSES.enabled()
  }
  return STATUSES.disabled()
})

const shikiAnimeListStatus = computed(() => {
  if (shikiAnimeRateList.value.length) {
    return STATUSES.enabled("imported")
  }
  return STATUSES.disabled("not imported")
})
const shikiMangaListStatus = computed(() => {
  if (shikiMangaRateList.value.length) {
    return STATUSES.enabled("imported")
  }
  return STATUSES.disabled("not imported")
})

const shikiAnimeRateList = computed(() => shikiState.animeList)
const shikiMangaRateList = computed(() => shikiState.mangaList)

const isAnimeReadyToImport = computed(
  () => shikiAnimeListStatus.value.status && anilistLoginStatus.value.status,
)
const isMangaReadyToImport = computed(
  () => shikiMangaListStatus.value.status && anilistLoginStatus.value.status,
)
/* ==================== computeds END ==================== */

/* ==================== refs START ==================== */
const shikimoriId = $ref<string>()
const fetchingLimit = $ref(10)
const timeoutSec = $ref(60)
const failedRateList = ref<UserRate[]>([])
/* ==================== refs END ==================== */

/* ==================== methods START ==================== */
const importAnimeFromShiki = async () => {
  if (shikimoriId?.length) {
    shikiState.setAnimeList([])
    globalState.toggleLoadingState()

    const res = await fetchAnimeList(shikimoriId, {
      limit: fetchingLimit,
      page: 1,
    })
    shikiState.setAnimeList(res)

    globalState.toggleLoadingState()

    globalState.showToast(
      t("shiki.anime_list_imported_successfully"),
      "success",
    )
  } else {
    globalState.showToast(t("shiki.empty_shiki_id"), "warn")
  }
}

const importMangaFromShiki = async () => {
  if (shikimoriId?.length) {
    shikiState.setMangaList([])
    globalState.toggleLoadingState()

    const res = await fetchMangaList(shikimoriId, {
      limit: fetchingLimit,
      page: 1,
    })
    shikiState.setMangaList(res)

    globalState.toggleLoadingState()

    globalState.showToast(
      t("shiki.manga_list_imported_successfully"),
      "success",
    )
  } else {
    globalState.showToast(t("shiki.empty_shiki_id"), "warn")
  }
}

const loginWithAnilist = () => {
  let isAgreedToRelogin = true

  if (!anilistState.isTokenExpired()) {
    isAgreedToRelogin = confirm(t("anilist.token_has_not_expired"))
  }

  if (isAgreedToRelogin) {
    anilistState.clearToken()
    const anilistClientId = import.meta.env.VITE_ANILIST_CLIENT_ID
    window.open(
      `https://anilist.co/api/v2/oauth/authorize?client_id=${anilistClientId}&response_type=token`,
      "_self",
    )
  }
}

const searchAndHandleTitle = async (rate: UserRate) => {
  const rateName = getRateName(rate)

  const { anilistRes, notFound } = await anilistService.searchTitle(rate)
  let iterationStatus: IterationStatus = null

  if (notFound) {
    console.error(`Not found: ${rateName}`)
    failedRateList.value.push(rate)
    iterationStatus = "skip"
  } else if (!anilistRes) {
    console.error(`Anilist response is undefined for ${getRateName(rate)}`)
    const interval = setApplicationTimeout()
    await pauseApplication(timeoutSec)
    clearInterval(interval)
    iterationStatus = "step-back"
  }

  return {
    anilistRes,
    iterationStatus,
  }
}

const handleExporting = async (rate: UserRate, anilistRes: any) => {
  let iterationStatus: IterationStatus = null
  const rateName = getRateName(rate)

  const { status: errorStatus, data: errorData } =
    await anilistService.exportRateToAnilist(rate, anilistRes)

  if (errorStatus === 403) {
    failedRateList.value.push(rate)

    console.error(
      `Error response for rate ${rateName}: ${JSON.stringify(
        errorData,
      )}. The iteration continues`,
    )
  } else if (errorData) {
    console.error(`Error response: ${JSON.stringify(errorData)}`)
    const interval = setApplicationTimeout()
    await pauseApplication(timeoutSec)
    clearInterval(interval)
    iterationStatus = "step-back"
  }

  return iterationStatus
}

const exportRateListToAnilist = async (type: RateType) => {
  let rateList: UserRate[] = []

  if (type === "anime") {
    rateList = shikiAnimeRateList.value
  } else {
    rateList = shikiMangaRateList.value
  }

  globalState.toggleLoadingState()

  for (let step = 0; step < rateList.length; step++) {
    if (globalState.stopExport) {
      break
    }

    const rate = rateList[step]

    globalState.loadingScreenTip = `Exporting: ${getRateName(rate)}`

    const { anilistRes, iterationStatus: searchIterationStatus } =
      await searchAndHandleTitle(rate)

    if (searchIterationStatus === "skip") {
      continue
    } else if (searchIterationStatus === "step-back") {
      step = step - 1
      continue
    }

    const exportIterationStatus = await handleExporting(rate, anilistRes)

    if (exportIterationStatus === "step-back") {
      step = step - 1
      continue
    }
  }

  globalState.toggleLoadingState()
  globalState.stopExport = false

  if (failedRateList.value.length) {
    globalState.showToast(t("general.several_failed_imports"), "warn")
    console.info("failedRateList", failedRateList.value)
  }
}

const setApplicationTimeout = (timeLeft = timeoutSec) => {
  const interval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(interval)
    }
    globalState.loadingScreenTip = `Timeout for: ${--timeLeft} sec`
  }, 1000)
  return interval
}
/* ==================== methods END ==================== */
</script>

<template>
  <div class="py-10 ccontainer">
    <section class="border rounded mb-8 p-4">
      <h3 class="text-lg mb-3">{{ t("general.export_import_settings") }}</h3>
      <div class="flex">
        <InputField
          v-model="fetchingLimit"
          label="Fetching limit"
          class="mr-4 w-[20%]"
        ></InputField>
        <InputField
          v-model="timeoutSec"
          label="Timeout sec"
          class="w-[20%]"
        ></InputField>
      </div>
    </section>

    <section class="border rounded mb-8 p-4">
      <div class="grid gap-x-4 grid-cols-2 items-end">
        <InputField
          v-model="shikimoriId"
          label="Shikimori ID"
          @enter="importAnimeFromShiki"
        ></InputField>
        <div class="grid grid-cols-3">
          <ButtonComponent
            @click="importAnimeFromShiki"
            :disabled="globalState.loadingState"
          >
            <p class="mr-2">{{ t("shiki.import_anime_list") }}</p>
            <ICarbonDownload />
          </ButtonComponent>
          <ButtonComponent
            @click="importMangaFromShiki"
            :disabled="globalState.loadingState"
          >
            <p class="mr-2">{{ t("shiki.import_manga_list") }}</p>
            <ICarbonDownload />
          </ButtonComponent>
        </div>

        <div class="border-b flex mt-2 mb-4 pb-4">
          <p class="mr-4">
            {{ t("shiki.anime_list_status") }}:
            <span :class="shikiAnimeListStatus.color">
              {{ shikiAnimeListStatus.text }}
            </span>
          </p>
          <p>
            {{ t("shiki.manga_list_status") }}:
            <span :class="shikiMangaListStatus.color">
              {{ shikiMangaListStatus.text }}
            </span>
          </p>
        </div>
      </div>

      <div class="flex items-center">
        <ButtonComponent
          @click="loginWithAnilist"
          class="mr-4"
          :disabled="globalState.loadingState"
        >
          {{ t("anilist.login") }}
        </ButtonComponent>
        <p>
          Anilist login status:
          <span :class="anilistLoginStatus.color">
            {{ anilistLoginStatus.text }}
          </span>
        </p>
      </div>
    </section>

    <section class="flex justify-center">
      <ButtonComponent
        class="mr-4"
        :disabled="!isAnimeReadyToImport || globalState.loadingState"
        @click="exportRateListToAnilist('anime')"
      >
        <p class="mr-2">{{ t("anilist.export_anime_to_anilist") }}</p>
        <ICarbonExport />
      </ButtonComponent>

      <ButtonComponent
        :disabled="!isMangaReadyToImport || globalState.loadingState"
        @click="exportRateListToAnilist('manga')"
      >
        <p class="mr-2">{{ t("anilist.export_manga_to_anilist") }}</p>
        <ICarbonExport />
      </ButtonComponent>
    </section>
  </div>
</template>
