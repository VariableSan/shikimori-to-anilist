<script setup lang="ts">
import { AccessToken } from "~/models/common.model"
import { useAnilistState } from "~/stores/anilist-state"

/* ==================== composables START ==================== */
const route = useRoute()
const router = useRouter()
const anilistState = useAnilistState()
/* ==================== composables END ==================== */

/* ==================== methods START ==================== */
const setToken = (tokenHash: string[]) => {
  const [accessToken, tokenType, expiresIn] = tokenHash.map(
    el => el.replace("#", "").split("=")[1],
  )

  const token: AccessToken = { accessToken, tokenType, expiresIn }
  anilistState.setToken(token)

  router.push("/")
}
/* ==================== methods END ==================== */

/* ==================== hooks START ==================== */
onMounted(() => {
  const tokenHash = route.hash.split("&")
  setToken(tokenHash)
})
/* ==================== hooks END ==================== */
</script>

<template>
  <div>token page</div>
</template>
