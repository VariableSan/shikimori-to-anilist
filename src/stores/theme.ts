import { defineStore } from "pinia"

export const useThemeStore = defineStore("user", () => {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  const preferredDark = usePreferredDark()

  return {
    isDark,
    preferredDark,

    toggleDark,
  }
})
