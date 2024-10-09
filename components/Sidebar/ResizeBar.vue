<template>
	<div class="h-full w-1 bg-cyan-300 cursor-w-resize" @mousedown.prevent="resizeStart" @touchstart.prevent="resizeStartTouch"></div>
</template>

<script setup lang="ts">
	const { setNewWidth } = defineProps<{ setNewWidth: (v: string) => string }>()

	// Handle mouse events
	function resizeStart() {
		globalThis.document.body.style.cursor = 'w-resize'
		globalThis.document.body.style.userSelect = 'none'
		globalThis.window.addEventListener('mousemove', resize)
		globalThis.window.addEventListener('mouseup', resizeEnd, { once: true })
	}
	function resizeEnd() {
		globalThis.document.body.style.cursor = ''
		globalThis.document.body.style.userSelect = ''
		globalThis.window.removeEventListener('mousemove', resize)
		globalThis.window.removeEventListener('mouseup', resizeEnd)
	}
	function resize(ev: MouseEvent) {
		setNewWidth(`${ev.clientX}px`)
	}

	// Handle touch events
	function resizeStartTouch() {
		globalThis.document.body.style.cursor = 'w-resize'
		globalThis.document.body.style.userSelect = 'none'
		globalThis.window.addEventListener('touchmove', resizeTouch)
		globalThis.window.addEventListener('touchend', resizeEndTouch, { once: true })
	}
	function resizeEndTouch() {
		globalThis.document.body.style.cursor = ''
		globalThis.document.body.style.userSelect = ''
		globalThis.window.removeEventListener('touchmove', resizeTouch)
		globalThis.window.removeEventListener('touchend', resizeEndTouch)
	}
	function resizeTouch(ev: TouchEvent) {
		if (!ev.touches.length) return
		const touch = ev.touches[0]
		setNewWidth(`${touch.clientX}px`)
	}

	onBeforeUnmount(() => {
		resizeEnd()
		resizeEndTouch()
	})
</script>
