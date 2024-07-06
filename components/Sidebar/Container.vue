<template>
	<nav class="h-[var(--main-con-height)] top-[var(--nav-height)] sticky max-md:fixed max-md:z-10 max-md:w-full max-md:bg-black max-md:bg-opacity-20" :class="!showSidebar ? 'max-md:hidden' : ''" @click="clicked" ref="nav">
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
