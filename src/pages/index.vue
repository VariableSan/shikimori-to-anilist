<script setup lang="ts">
import {
  SearchAnimeByNameQuery,
  useSearchAnimeByNameQuery,
  useSetAnimeToUserListMutation,
} from "~/gql/generated/schema"
import { convertShikiStatusToAnilist } from "~/helpers/status-converting"
import { fetchAnimeList } from "~/services/shikimori.service"
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

const shikiAnimeRateList = computed(() => shikiState.animeList)

const isReadyToImport = computed(
  () => shikiAnimeListStatus.value.status && anilistLoginStatus.value.status,
)
/* ==================== computeds END ==================== */

/* ==================== refs START ==================== */
const shikimoriId = $ref<string>()
/* ==================== refs END ==================== */

/* ==================== methods START ==================== */
const importAnimeFromShiki = async () => {
  if (shikimoriId?.length) {
    shikiState.setAnimeList([])
    globalState.toggleLoadingState()

    const res = await fetchAnimeList(shikimoriId, {
      limit: 20,
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

const exportAnimeListToAnilist = async () => {
  const failedAnimeNames: string[] = []

  globalState.toggleLoadingState()

  for (let i = 0; i < shikiAnimeRateList.value.length; i++) {
    const animeRate = shikiAnimeRateList.value[i]
    try {
      const res = await searchAnimeByName(animeRate.anime.name)
      const updatedAtDate = new Date(animeRate.updated_at)
      const createdAtDate = new Date(animeRate.created_at)

      const { mutate } = useSetAnimeToUserListMutation({
        variables: {
          mediaId: res.Media?.id,
          status: convertShikiStatusToAnilist(animeRate.status),
          score: animeRate.score,
          repeat: animeRate.rewatches,
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

      await mutate()
    } catch (error) {
      failedAnimeNames.push(animeRate.anime.name)
      console.error(error)
    }
  }

  globalState.toggleLoadingState()

  if (failedAnimeNames.length) {
    globalState.showToast(t("general.several_failed_imports"), "warn")
  } else {
    globalState.showToast(t("general.successful_import"), "success")
  }
}
/* ==================== methods END ==================== */
</script>

<template>
  <div class="py-10 ccontainer">
    <div class="mb-6 grid gap-6 items-center lg:grid-cols-2">
      <div class="grid grid-cols-2 items-center">
        <InputField
          v-model="shikimoriId"
          label="Shikimori ID"
          class="mr-8"
          @enter="importAnimeFromShiki"
        ></InputField>

        <ButtonComponent
          @click="importAnimeFromShiki"
          :disabled="globalState.loadingState"
        >
          <p class="mr-2">{{ t("shiki.import_anime_list") }}</p>
          <i-carbon-download />
        </ButtonComponent>

        <p>
          Anime list status:
          <span :class="shikiAnimeListStatus.color">
            {{ shikiAnimeListStatus.text }}
          </span>
        </p>
      </div>

      <div class="grid gap-1 grid-cols-3">
        <p>
          Anilist login status:
          <span :class="anilistLoginStatus.color">
            {{ anilistLoginStatus.text }}
          </span>
        </p>

        <ButtonComponent @click="loginWithAnilist">
          {{ t("anilist.login") }}
        </ButtonComponent>
      </div>
    </div>

    <div>
      <ButtonComponent
        :disabled="!isReadyToImport"
        @click="exportAnimeListToAnilist"
      >
        {{ t("anilist.export_anime_to_anilist") }}
      </ButtonComponent>
    </div>
  </div>
</template>
