<template>
	<Navigation />
	<main class="flex flex-col p-2 relative min-h-[var(--main-con-height)]">
		<NuxtPage />
	</main>
</template>

<script setup lang="ts">
	const { setShowToggleBtn } = useShowToggleBtn()
	setShowToggleBtn(false)
</script>
