// import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import type { AccessToken } from '~/models/common.model'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()

	const api = ofetch.create({
		baseURL: config.public.anilistApiUri,

		onRequest({ options }) {
			let token: AccessToken | null = null

			if (import.meta.client) {
				const anilistState = JSON.parse(localStorage.getItem('anilistState') as string)
				const anilistToken = anilistState.token as AccessToken

				if (anilistToken) {
					token = anilistToken
					if (token && new Date(token.expiresIn).getTime() < Date.now()) {
						token = null
						clearTokenFromStorage()
					}
				}
			}

			options.headers.set('Authorization', token ? `Bearer ${token.accessToken}` : '')
		},
	})

	return {
		provide: {
			anilistApi: api,
		},
	}
})

function clearTokenFromStorage() {
	if (import.meta.client) {
		localStorage.removeItem('anilistToken')
	}
}
