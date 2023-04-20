import { defineStore } from "pinia"
import { AccessToken } from "~/models/common.model"

export const useAnilistState = defineStore("anilistState", () => {
  /* ==================== refs START ==================== */
  const token = ref<AccessToken>()
  /* ==================== refs END ==================== */

  /* ==================== methods START ==================== */
  const setToken = (newToken: AccessToken) => {
    token.value = newToken
  }
  /* ==================== methods END ==================== */

  return {
    token,

    setToken,
  }
})
