<template>
	<nav class="h-[var(--main-con-height)] top-[var(--nav-height)] sticky max-[800px]:fixed max-[800px]:z-10 max-[800px]:w-full max-[800px]:bg-black max-[800px]:bg-opacity-20" :class="!showSidebar ? 'max-[800px]:hidden' : ''" @click="clicked" ref="nav">
		<slot />
	</nav>
</template>

<script setup lang="ts">
	const { showSidebar, toggleShowSidebar } = useShowSidebar()
	const nav = ref(null)

	function clicked(e: MouseEvent) {
		if (e.target === nav.value) toggleShowSidebar()
	}
</script>
