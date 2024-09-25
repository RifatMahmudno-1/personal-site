<template>
	<nav class="top-0 sticky bg-cyan-300 z-50 h-[var(--nav-height)] flex items-center justify-between px-2">
		<NavigationToggleBtn />
		<div class="flex gap-2 items-center">
			<NuxtLink href="/" class="bg-cyan-200 px-2 py-0.5 max-[800px]:py-1 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md">
				<IconHome class="max-[350px]:hidden" />
				<span>Home</span>
			</NuxtLink>
			<NuxtLink href="/about" class="bg-cyan-200 px-2 py-0.5 max-[800px]:py-1 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md">
				<IconAbout class="max-[350px]:hidden" />
				<span>About</span>
			</NuxtLink>

			<NuxtLink href="/contact" class="bg-cyan-200 px-2 py-0.5 max-[800px]:py-1 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md" v-if="!$route.meta.admin">
				<IconContact class="max-[350px]:hidden" />
				<span>Contact</span>
			</NuxtLink>
			<NuxtLink href="/contacted" class="bg-cyan-200 px-2 py-0.5 max-[800px]:py-1 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md" v-else>
				<IconContact class="max-[350px]:hidden" />
				<span>Contacted</span>
			</NuxtLink>

			<NuxtLink href="/login" class="bg-cyan-200 px-2 py-0.5 max-[800px]:py-1 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md" v-if="!$route.meta.admin">
				<IconLogin />
				<span class="max-[500px]:hidden">Login</span>
			</NuxtLink>
			<button class="bg-cyan-200 px-2 py-0.5 max-[800px]:py-1 rounded shadow-sm transition-shadow flex items-center gap-1 hover:shadow-md" v-else @click="logout">
				<IconLogout />
				<span class="max-[500px]:hidden">Logout</span>
			</button>
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
