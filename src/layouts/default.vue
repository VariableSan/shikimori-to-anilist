<script setup lang="ts">
import { AccessToken } from "~/models/common.model"
import { useAnilistState } from "~/stores/anilist-state"
import { useGlobalState } from "~/stores/global-state"

/* ==================== composables START ==================== */
const globalState = useGlobalState()
const anilistState = useAnilistState()
/* ==================== composables END ==================== */

/* ==================== hooks START ==================== */
onMounted(() => {
  const storageAnilistToken = localStorage.getItem("anilistToken")
  if (storageAnilistToken) {
    const token: AccessToken = JSON.parse(storageAnilistToken)
    anilistState.setToken(token)
  }
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

    <GlobalLoader :show="globalState.loadingState"></GlobalLoader>
    <ToastComponent
      :show="globalState.toast.show"
      :color="globalState.toast.color"
      :text="globalState.toast.message"
      @click="globalState.hideToast"
    ></ToastComponent>
  </div>
</template>
