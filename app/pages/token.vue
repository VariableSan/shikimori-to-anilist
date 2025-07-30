<script setup lang="ts">
	import { useAnilistState } from '~/stores/anilistStore'

	const route = useRoute()
	const router = useRouter()
	const anilistState = useAnilistState()

	const initToken = () => {
		const tokenHash = route.hash

		const params = new URLSearchParams(tokenHash.replace(/^#/, ''))
		const accessToken = params.get('access_token') || ''
		const tokenType = params.get('token_type') || ''
		const expiresInSec = Number(params.get('expires_in') || '0')
		const expiresIn = new Date(Date.now() + expiresInSec * 1000)

		const token = { accessToken, tokenType, expiresIn }
		anilistState.setToken(token)

		router.push('/')
	}

	onMounted(() => {
		initToken()
	})
</script>

<template>
	<div>token page</div>
</template>
