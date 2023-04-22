<script setup lang="ts">
import { promiseTimeout } from "@vueuse/core"
import {
  SearchAnimeByNameQuery,
  SearchMangaByNameQuery,
  useSearchAnimeByNameQuery,
  useSearchMangaByNameQuery,
  useSetAnimeToUserListMutation,
} from "~/gql/generated/schema"
import { convertShikiStatusToAnilist } from "~/helpers/status-converting"
import { SearchTitleByNameQuery } from "~/models/anilist.model"
import {
  RateType,
  UserAnimeRate,
  UserMangaRate,
} from "~/models/shikimori.model"
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

/* ==================== computeds START ==================== */
const anilistLoginStatus = computed(() => {
  if (anilistState.token) {
    return { text: "active", color: "text-green-500", status: true }
  }
  return { text: "not active", color: "text-red-500", status: false }
})

const shikiAnimeListStatus = computed(() => {
  if (shikiAnimeRateList.value.length) {
    return { text: "imported", color: "text-green-500", status: true }
  }
  return { text: "not imported", color: "text-red-500", status: false }
})
const shikiMangaListStatus = computed(() => {
  if (shikiMangaRateList.value.length) {
    return { text: "imported", color: "text-green-500", status: true }
  }
  return { text: "not imported", color: "text-red-500", status: false }
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

const searchAnimeByName = (name: string) => {
  const { onResult, onError } = useSearchAnimeByNameQuery({
    search: name,
  })

  return new Promise<SearchAnimeByNameQuery>((res, rej) => {
    onResult(result => {
      res(result.data)
    })
    onError(error => {
      rej(error)
    })
  })
}

const searchMangaByName = (name: string) => {
  const { onResult, onError } = useSearchMangaByNameQuery({
    search: name,
  })

  return new Promise<SearchMangaByNameQuery>((res, rej) => {
    onResult(result => {
      res(result.data)
    })
    onError(error => {
      rej(error)
    })
  })
}

const searchTitle = async (rate: UserAnimeRate | UserMangaRate) => {
  let anilistRes: SearchTitleByNameQuery | null = null
  let notFound = false

  try {
    if (rate.manga === null) {
      anilistRes = await searchAnimeByName(rate.anime.name)
    } else {
      anilistRes = await searchMangaByName(rate.manga.name)
    }
  } catch (error) {
    const err = JSON.parse(JSON.stringify(error))
    const statusCode = err.networkError?.statusCode
    const networkErrorMessage = (err.message as string)
      ?.toLocaleLowerCase()
      ?.includes("networkerror")

    if (statusCode === 429 || networkErrorMessage) {
      notFound = false
    } else {
      notFound = true
      console.info(
        t("anilist.title_not_found", {
          titleName: getTitleName(rate),
        }),
      )
    }
  }

  return {
    anilistRes,
    notFound,
  }
}

const getPreparedDataForMutation = (
  rate: UserAnimeRate | UserMangaRate,
  anilistRes: SearchTitleByNameQuery,
) => {
  const updatedAtDate = new Date(rate.updated_at)
  const createdAtDate = new Date(rate.created_at)

  const { mutate } = useSetAnimeToUserListMutation({
    variables: {
      mediaId: anilistRes.Media?.id,
      status: convertShikiStatusToAnilist(rate.status),
      score: rate.score,
      repeat: rate.rewatches,
      completedAt: {
        day: updatedAtDate.getDay(),
        month: updatedAtDate.getMonth(),
        year: updatedAtDate.getFullYear(),
      },
      startedAt: {
        day: createdAtDate.getDay(),
        month: createdAtDate.getMonth(),
        year: createdAtDate.getFullYear(),
      },
    },
  })

  return mutate
}

const exportRateListToAnilist = async (type: RateType) => {
  const failedRateList = []
  let rateList = []

  if (type === "anime") {
    rateList = shikiAnimeRateList.value
  } else {
    rateList = shikiMangaRateList.value
  }

  globalState.toggleLoadingState()

  for (let step = 0; step < rateList.length; step++) {
    const rate = rateList[step]

    const { anilistRes, notFound } = await searchTitle(rate)

    if (notFound) {
      failedRateList.push(rate)
      continue
    } else if (!anilistRes) {
      await pauseApplication()
      step = step - 1
      continue
    }

    globalState.loadingScreenTip = getTitleName(rate)

    const mutate = getPreparedDataForMutation(rate, anilistRes)

    try {
      await mutate()
    } catch {
      await pauseApplication()
      step = step - 1
    }
  }

  globalState.clearLoadingScreenTip()
  globalState.toggleLoadingState()

  if (failedRateList.length) {
    globalState.showToast(t("general.several_failed_imports"), "warn")
  } else {
    globalState.showToast(t("general.successful_import"), "success")
  }
}

const getTitleName = (rate: UserAnimeRate | UserMangaRate) => {
  return rate.anime ? rate.anime.name : rate.manga.name
}

const pauseApplication = async () => {
  let intervalTime = parseInt(timeoutSec.toString())
  const interval = setInterval(() => {
    globalState.loadingScreenTip = t("general.import_timeout", {
      sec: intervalTime - 2,
    })
    intervalTime = intervalTime - 1
  }, 1000)
  await promiseTimeout(timeoutSec * 1000)
  clearInterval(interval)
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
            <i-carbon-download />
          </ButtonComponent>
          <ButtonComponent
            @click="importMangaFromShiki"
            :disabled="globalState.loadingState"
          >
            <p class="mr-2">{{ t("shiki.import_manga_list") }}</p>
            <i-carbon-download />
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
        <i-carbon-export />
      </ButtonComponent>

      <ButtonComponent
        :disabled="!isMangaReadyToImport || globalState.loadingState"
        @click="exportRateListToAnilist('manga')"
      >
        <p class="mr-2">{{ t("anilist.export_manga_to_anilist") }}</p>
        <i-carbon-export />
      </ButtonComponent>
    </section>
  </div>
</template>
