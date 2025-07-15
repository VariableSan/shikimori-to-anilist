// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: false },

	ssr: false,

	modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/scripts', '@pinia/nuxt', '@vueuse/nuxt'],

	css: ['~/assets/css/main.css'],

	future: {
		compatibilityVersion: 4,
	},

	compatibilityDate: '2024-11-27',
})
