<script setup lang="ts">
const themeStore = useThemeStore()

useHead({
  title: "Shikimori to Anilist",
  meta: [
    { name: "description", content: "Opinionated Vite Starter Template" },
    {
      name: "theme-color",
      content: computed(() => (themeStore.isDark ? "#00aba9" : "#ffffff")),
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: computed(() =>
        themeStore.preferredDark ? "/favicon-dark.svg" : "/favicon.svg",
      ),
    },
  ],
})
</script>

<template>
  <RouterView />
</template>
