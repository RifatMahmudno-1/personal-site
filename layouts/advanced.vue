<template>
	<Navigation />
	<div class="flex min-h-[var(--main-con-height)]">
		<Sidebar class="shrink-0" />
		<main class="grow p-2 relative">
			<NuxtPage />
		</main>
	</div>
</template>

<script setup lang="ts">
	const { setShowToggleBtn } = useShowToggleBtn()
	setShowToggleBtn(true)
	provide('refreshSidebar', ref(false))
	provide('datalistSections', ref<string[]>([]))
</script>
