<template>
	<nav class="top-0 sticky bg-cyan-300 z-50 h-[var(--nav-height)] flex items-center justify-between px-2">
		<NavigationToggleBtn />
		<div class="flex gap-2 items-center">
			<NuxtLink href="/" class="bg-cyan-200 px-2 py-0.5 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md"><IconHome /> Home</NuxtLink>
			<NuxtLink href="/about" class="bg-cyan-200 px-2 py-0.5 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md"><IconAbout /> About</NuxtLink>

			<NuxtLink href="/contact" class="bg-cyan-200 px-2 py-0.5 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md" v-if="!$route.meta.admin"><IconContact /> Contact</NuxtLink>
			<NuxtLink href="/contacted" class="bg-cyan-200 px-2 py-0.5 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md" v-else><IconContact /> Contacted</NuxtLink>

			<NuxtLink href="/login" class="bg-cyan-200 px-2 py-0.5 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md" v-if="!$route.meta.admin"><IconLogin /> Login</NuxtLink>
			<button class="bg-cyan-200 px-2 py-0.5 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md" v-else @click="logout"><IconLogout /> Logout</button>
		</div>
	</nav>
</template>

<style scoped>
	.router-link-exact-active {
		@apply shadow-md;
	}
</style>

<script setup lang="ts">
	const router = useRouter()
	function logout() {
		setNoti('Logged out successfully')
		router.push('/login')
	}
</script>
