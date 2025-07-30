import type { AccessToken } from '~/models/common.model'

export const useAnilistState = defineStore(
	'anilistState',
	() => {
		const token = ref<AccessToken | null>(null)

		const isTokenExpired = computed(() => {
			if (token.value) {
				return new Date(token.value.expiresIn).getMilliseconds() > Date.now()
			}
			return true
		})

		const setToken = (newToken: AccessToken) => {
			token.value = newToken
		}

		const clearToken = () => {
			token.value = null
		}

		return {
			token,
			isTokenExpired,

			setToken,
			clearToken,
		}
	},

	{
		persist: {
			storage: piniaPluginPersistedstate.localStorage(),
		},
	}
)
