// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: false },

	ssr: false,

	modules: [
		'@nuxt/ui',
		'@nuxt/eslint',
		'@nuxt/scripts',
		'@pinia/nuxt',
		'pinia-plugin-persistedstate/nuxt',
		'@vueuse/nuxt',
	],

	css: ['~/assets/css/main.css'],

	future: {
		compatibilityVersion: 4,
	},

	compatibilityDate: '2024-11-27',

	runtimeConfig: {
		public: {
			anilistApiUri: process.env.ANILIST_API_URI,
			anilistClientId: process.env.ANILIST_CLIENT_ID,
			anilistClientSecret: process.env.ANILIST_CLIENT_SECRET,

			shikimoriApiUri: process.env.SHIKIMORI_API_URI,
		},
	},
})
