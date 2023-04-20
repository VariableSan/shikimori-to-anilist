<script setup lang="ts">
import { UserAnimeRate } from "~/models/shikimori.model"
import { fetchAnimeList } from "~/services/shikimori.service"
import { useGlobalState } from "~/stores/global-state"

defineOptions({
  name: "IndexPage",
})

/* ==================== composables START ==================== */
const globalState = useGlobalState()
const { t } = useI18n()
/* ==================== composables END ==================== */

/* ==================== refs START ==================== */
const shikimoriId = $ref<string>()
let animeRateList = $ref<UserAnimeRate[]>([])
const anilistCode = $ref<string>()
/* ==================== refs END ==================== */

/* ==================== methods START ==================== */
const importAnimeFromShiki = async () => {
  if (shikimoriId?.length) {
    globalState.toggleLoadingState()
    animeRateList = await fetchAnimeList(shikimoriId)
    globalState.toggleLoadingState()
  } else {
    globalState.showToast(t("shiki.empty_shiki_id"), "warn")
  }
}

const getAnilistCode = () => {
  const anilistClientId = import.meta.env.VITE_ANILIST_CLIENT_ID
  window.open(
    `https://anilist.co/api/v2/oauth/authorize?client_id=${anilistClientId}&response_type=token`,
  )
}
/* ==================== methods END ==================== */
</script>

<template>
  <div class="py-10 ccontainer">
    <div class="mb-6 grid gap-6 items-center lg:grid-cols-2">
      <div class="flex items-end">
        <InputField
          v-model="shikimoriId"
          label="Shikimori ID"
          class="mr-8"
        ></InputField>

        <ButtonComponent
          @click="importAnimeFromShiki"
          :disabled="globalState.loadingState"
        >
          <p class="mr-2">import anime list</p>
          <i-carbon-download />
        </ButtonComponent>
      </div>

      <div class="grid gap-1 grid-cols-3">
        <p>
          Anilist code:
          <span> {{ anilistCode ? anilistCode : "empty" }}</span>
        </p>

        <ButtonComponent @click="getAnilistCode">
          {{ t("anilist.login") }}
        </ButtonComponent>
      </div>
    </div>

    <div>
      <div v-for="animeRate in animeRateList" :key="animeRate.id">
        <pre> {{ animeRate }} </pre>
      </div>
    </div>
  </div>
</template>
