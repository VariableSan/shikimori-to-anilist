import { ofetch } from 'ofetch'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()

	const api = ofetch.create({
		baseURL: config.public.shikimoriApiUri,
	})

	return {
		provide: {
			shikimoriApi: api,
		},
	}
})
