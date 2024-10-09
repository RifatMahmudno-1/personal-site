<template>
	<nav class="h-[var(--main-con-height)] top-[var(--nav-height)] sticky flex max-[800px]:fixed max-[800px]:z-10 max-[800px]:w-full max-[800px]:bg-black max-[800px]:bg-opacity-20" :class="!showSidebar ? 'max-[800px]:hidden' : ''" @click="clicked" ref="nav">
		<div class="min-w-[10rem] w-[12rem] max-w-[50dvw]" :style="resizedWidth ? `width:${resizedWidth}` : ''">
			<slot />
		</div>
		<SidebarResizeBar :set-new-width="(v:string)=>resizedWidth=v" />
	</nav>
</template>

<script setup lang="ts">
	const { showSidebar, toggleShowSidebar } = useShowSidebar()
	const nav = ref(null)
	const resizedWidth = ref('')

	function clicked(e: MouseEvent) {
		if (e.target === nav.value) toggleShowSidebar()
	}
</script>
