<template>
	<NuxtRouteAnnouncer />
	<div>
		<Navigation />
		<main class="flex justify-center items-center p-2 relative min-h-[var(--main-con-height)]">
			<div class="flex items-center flex-col gap-2" v-if="netError">
				<h1 class="text-center text-2xl">No internet connection.</h1>
				<IconNoInternet class="w-[12rem] h-[12rem]" />
				<div class="flex gap-2">
					<NuxtLink href="/" class="border-2 border-cyan-400 rounded px-3 py-1 text-lg">Home</NuxtLink>
					<button @click="router.go(0)" class="bg-cyan-300 rounded px-3 py-1 text-lg">Refresh</button>
				</div>
			</div>

			<div class="flex items-center flex-col gap-2" v-else-if="error.statusCode === 401">
				<h1 class="text-center text-2xl">You aren't authorized. <br />Login now.</h1>
				<IconNoLog class="w-[12rem] h-[12rem]" />
				<div class="flex gap-2">
					<NuxtLink href="/login" class="border-2 border-cyan-400 rounded px-3 py-1 text-lg">Login</NuxtLink>
					<button @click="router.go(0)" class="bg-cyan-300 rounded px-3 py-1 text-lg">Refresh</button>
				</div>
			</div>

			<div class="flex items-center flex-col gap-2" v-else-if="error.statusCode === 404">
				<h1 class="text-center text-2xl">Page not found.</h1>
				<Icon404 class="w-[12rem] h-[12rem]" />
				<div class="flex gap-2">
					<NuxtLink href="/" class="border-2 border-cyan-400 rounded px-3 py-1 text-lg">Home</NuxtLink>
					<button @click="router.go(0)" class="bg-cyan-300 rounded px-3 py-1 text-lg">Refresh</button>
				</div>
			</div>

			<div class="flex items-center flex-col gap-2" v-else>
				<h1 class="text-center text-2xl">Some errors have occured.</h1>
				<IconError class="w-[12rem] h-[12rem]" />
				<div class="flex gap-2">
					<NuxtLink href="/" class="border-2 border-cyan-400 rounded px-3 py-1 text-lg">Home</NuxtLink>
					<button @click="router.go(0)" class="bg-cyan-300 rounded px-3 py-1 text-lg">Refresh</button>
				</div>
			</div>
		</main>
		<Footer />
	</div>
	<Notification />
</template>

<script setup lang="ts">
	import type { NuxtError } from '#app'

	const { setShowToggleBtn } = useShowToggleBtn()
	setShowToggleBtn(false)
	const { error } = defineProps<{ error: NuxtError }>()

	const router = useRouter()
	const netError = computed<boolean>(() => {
		if (import.meta.server || !globalThis.navigator) return false
		if (!globalThis.navigator.onLine) return true
		else return false
	})

	useHead({
		title: netError.value ? 'No Internet' : error.statusCode === 404 ? 'Not Found' : error.statusCode === 401 ? 'Unauthorized' : 'Error'
	})
</script>
