<script setup lang="ts">
	const globalStore = useGlobalStore()
</script>

<template>
	<header class="flex min-h-[52px] w-full items-center shadow-2xl">
		<UContainer>
			<div class="flex flex-wrap items-center justify-between">
				<a class="cursor-pointer text-2xl transition-colors" @click.prevent>Shikimori to Anilist</a>

				<UButton
					:icon="globalStore.isDark ? 'lucide:moon' : 'lucide:sun'"
					variant="ghost"
					@click="globalStore.toggleDark()"
				/>
			</div>
		</UContainer>
	</header>
</template>
