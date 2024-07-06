<template>
	<slot>
		<PostCreateEdit type="create" v-if="creating" @toggle-create-edit="() => (creating = !creating)" @update-data="d => emit('update-data', d)" />
		<PostCreateBtn v-if="!creating" @toggle-creating="() => (creating = !creating)" />
	</slot>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'update-data': [EachPostType] }>()
	const creating = ref(false)
</script>
