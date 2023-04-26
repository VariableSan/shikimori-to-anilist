<script setup lang="ts">
import { useAnilistState } from "~/stores/anilist-state"
import { useGlobalState } from "~/stores/global-state"
import { useShikiState } from "~/stores/shikimori-state"

/* ==================== composables START ==================== */
const globalState = useGlobalState()
const anilistState = useAnilistState()
const shikiState = useShikiState()
/* ==================== composables END ==================== */

/* ==================== methods START ==================== */
const stopExporting = () => {
  globalState.stopExport = true
}
/* ==================== methods END ==================== */

/* ==================== hooks START ==================== */
onMounted(() => {
  anilistState.setTokenFromStorage()
  shikiState.setAnimeListFromStorage()
  shikiState.setMangaListFromStorage()
})
/* ==================== hooks END ==================== */

watch(
  () => globalState.loadingState,
  () => globalState.toggleScrollState(),
)
</script>

<template>
  <div class="h-full w-full relative">
    <HeaderComponent></HeaderComponent>

    <main>
      <RouterView />
    </main>

    <GlobalLoader
      :show="globalState.loadingState"
      :message="globalState.loadingScreenTip"
    >
      <template #action>
        <div class="mt-8">
          <ButtonComponent
            :label="$t('general.stop_export')"
            @click="stopExporting"
          ></ButtonComponent>
        </div>
      </template>
    </GlobalLoader>

    <ToastComponent
      :show="globalState.toast.show"
      :color="globalState.toast.color"
      :text="globalState.toast.message"
      @click="globalState.hideToast"
    ></ToastComponent>
  </div>
</template>
