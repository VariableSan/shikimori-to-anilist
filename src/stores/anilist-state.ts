import { defineStore } from "pinia"
import { AccessToken } from "~/models/common.model"

export const useAnilistState = defineStore("anilistState", () => {
  /* ==================== refs START ==================== */
  const token = ref<AccessToken>()
  /* ==================== refs END ==================== */

  /* ==================== methods START ==================== */
  const setToken = (newToken: AccessToken) => {
    const { expiresIn, accessToken, tokenType } = newToken

    token.value = {
      expiresIn: new Date(Date.now + expiresIn).toString(),
      accessToken,
      tokenType,
    }

    localStorage.setItem("anilistToken", JSON.stringify(token.value))
  }

  const isTokenExpired = () => {
    if (token.value) {
      return new Date(token.value.expiresIn).getMilliseconds() > Date.now()
    }
    return true
  }

  const setTokenFromStorage = () => {
    const storageAnilistToken = localStorage.getItem("anilistToken")
    if (storageAnilistToken) {
      const token: AccessToken = JSON.parse(storageAnilistToken)
      setToken(token)
    }
  }
  /* ==================== methods END ==================== */

  return {
    token,

    setToken,
    isTokenExpired,
    setTokenFromStorage,
  }
})
