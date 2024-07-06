<template>
	<button class="fixed bottom-[10%] right-[6%] grid justify-items-center items-center bg-cyan-300 p-2 rounded shadow hover:shadow-lg transition-shadow" @click="() => emit('toggle-creating')">
		<IconCreatePost class="text-3xl" />
	</button>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'toggle-creating': [] }>()
</script>
