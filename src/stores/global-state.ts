import { defineStore } from "pinia"
import { Toast, ToastColor } from "~/models/common.model"

export const useGlobalState = defineStore("globalState", () => {
  /* ==================== refs START ==================== */
  const loadingState = ref(false)
  const scrollState = ref(true)
  const loadingScreenTip = ref("")
  const stopExport = ref(false)
  /* ==================== refs END ==================== */

  /* ==================== reactives START ==================== */
  const toast = reactive<Toast>({
    message: "",
    color: "success",
    show: false,
  })
  /* ==================== reactives END ==================== */

  /* ==================== methods START ==================== */
  const toggleLoadingState = () => {
    loadingState.value = !loadingState.value
  }

  const toggleScrollState = () => {
    scrollState.value = !scrollState.value
    document.documentElement.style.overflow = scrollState.value
      ? "auto"
      : "hidden"
  }

  const showToast = (msg: string, color: ToastColor) => {
    toast.color = color
    toast.message = msg
    toast.show = true
  }

  const hideToast = () => {
    toast.show = false
  }

  const clearLoadingScreenTip = () => {
    loadingScreenTip.value = ""
  }
  /* ==================== methods END ==================== */

  return {
    loadingState,
    toast,
    loadingScreenTip,
    stopExport,

    toggleLoadingState,
    toggleScrollState,
    showToast,
    hideToast,
    clearLoadingScreenTip,
  }
})
