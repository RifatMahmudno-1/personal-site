<template>
	<slot />
</template>

<script setup lang="ts">
	const scrollPos = ref({ x: 0, y: 0 })
	const stopScroll = () => globalThis.window.scroll(scrollPos.value.x, scrollPos.value.y)

	onMounted(() => {
		scrollPos.value.x = globalThis.window.scrollX
		scrollPos.value.y = globalThis.window.scrollY
		globalThis.window.addEventListener('scroll', stopScroll)
	})

	onBeforeUnmount(() => globalThis.window.removeEventListener('scroll', stopScroll))
</script>
