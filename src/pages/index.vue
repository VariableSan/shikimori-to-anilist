<script setup lang="ts">
import {
  GetAnimeListQuery,
  MediaListStatus,
  useGetAnimeListQuery,
  useSetAnimeToUserListMutation,
} from "~/gql/generated/schema"
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
const res = ref<GetAnimeListQuery>()
/* ==================== refs END ==================== */

/* ==================== methods START ==================== */
const importAnimeFromShiki = async () => {
  if (shikimoriId?.length) {
    globalState.toggleLoadingState()

    const res = await fetchAnimeList(shikimoriId, {
      limit: 1,
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

const getAnilistCode = () => {
  const anilistClientId = import.meta.env.VITE_ANILIST_CLIENT_ID
  window.open(
    `https://anilist.co/api/v2/oauth/authorize?client_id=${anilistClientId}&response_type=token`,
    "_self",
  )
}

const testGraphql = () => {
  const { result, loading } = useGetAnimeListQuery({
    userName: "VariableSan",
  })
  globalState.toggleLoadingState()

  watch(loading, () => {
    globalState.toggleLoadingState()
    res.value = result.value
  })
}

const exportAnimeListToAnilist = async () => {
  const { mutate } = useSetAnimeToUserListMutation({
    variables: {
      mediaId: 127230,
      status: MediaListStatus.Completed,
    },
  })

  try {
    globalState.toggleLoadingState()
    await mutate()
    globalState.showToast(
      t("anilist.anime_set_successfully", {
        animeName: "haha",
      }),
      "success",
    )
  } catch (error) {
    console.error(`anime id:`)
    globalState.showToast(
      t("anilist.can_not_set_anime", {
        animeName: "haha",
      }),
      "danger",
    )
  } finally {
    globalState.toggleLoadingState()
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

        <ButtonComponent @click="getAnilistCode">
          {{ t("anilist.login") }}
        </ButtonComponent>

        <ButtonComponent @click="testGraphql"> testGraphql </ButtonComponent>
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
