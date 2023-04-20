import { defineStore } from "pinia"
import { Toast, ToastColor } from "~/models/common.model"

export const useGlobalState = defineStore("globalState", () => {
  const loadingState = ref(false)
  const scrollState = ref(true)

  const toast = reactive<Toast>({
    message: "",
    color: "success",
    show: false,
  })

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

  return {
    loadingState,
    toast,

    toggleLoadingState,
    toggleScrollState,
    showToast,
    hideToast,
  }
})
