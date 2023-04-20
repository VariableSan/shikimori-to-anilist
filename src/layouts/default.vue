<script setup lang="ts">
import { useGlobalState } from "~/stores/global-state"

/* ==================== composables START ==================== */
const globalState = useGlobalState()
/* ==================== composables END ==================== */

watch(
  () => globalState.loadingState,
  () => globalState.toggleScrollState(),
)
</script>

<template>
  <div class="h-full w-full relative ">
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
