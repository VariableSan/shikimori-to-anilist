<script lang="ts" setup>
	const globalStore = useGlobalStore()
</script>

<template>
	<div class="relative flex min-h-screen w-full flex-col">
		<Header />

		<main class="flex-1">
			<slot></slot>
		</main>

		<Loader :show="globalStore.loader.show" :message="globalStore.loader.message" />
	</div>
</template>
