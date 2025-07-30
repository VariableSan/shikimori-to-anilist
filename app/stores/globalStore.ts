export const useGlobalStore = defineStore('global', () => {
	const colorMode = useColorMode()

	const loader = reactive({
		show: false,
		message: '',
	})

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

	const toggleLoadingState = () => {
		loader.show = !loader.show
	}

	return {
		isDark,
		loader,

		toggleDark,
		toggleLoadingState,
	}
})
