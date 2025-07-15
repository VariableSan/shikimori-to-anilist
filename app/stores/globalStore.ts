export const useGlobalStore = defineStore('global', () => {
	const colorMode = useColorMode()

	const loading = ref(false)

	const isDark = computed({
		get() {
			return colorMode.value === 'dark'
		},
		set() {
			colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
		},
	})

	const toggleDark = () => {
		isDark.value = !isDark.value
	}

	return {
		isDark,
		loading,

		toggleDark,
	}
})
