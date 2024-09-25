<template>
	<div class="w-full max-h-full overflow-auto max-w-[50rem] p-4 bg-cyan-200 rounded shadow-md grid gap-4">
		<div class="grid gap-0.5">
			<h2 class="font-semibold text-lg">{{ props.postData.title || 'Title Not provided' }}</h2>
			<div class="flex gap-2 text-sm flex-wrap">
				<p class="bg-white bg-opacity-70 px-1 rounded"><span class="text-cyan-500 font-semibold">@</span> {{ props.postData.section || 'Section Not provided' }}</p>
				<p class="bg-white bg-opacity-70 px-1 rounded">{{ parseDate(props.postData.createdAt) }}</p>
				<p class="bg-white bg-opacity-70 px-1 rounded" v-if="props.postData.modifiedAt">Edited</p>
			</div>
		</div>
		<MarkdownRederer :md="props.postData.content || 'Content Not provided'" class="bg-white p-1 px-2 rounded min-h-[10rem] h-[10rem] overflow-auto resize-y" />
		<div class="flex justify-evenly">
			<button class="bg-cyan-300 py-1 px-4 rounded shadow hover:shadow-md transition-shadow" @click="emit('toggle-previewing')">Go Back</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'toggle-previewing': [] }>()
	const props = defineProps<{
		postData: EachPostPreviewType
	}>()

	function parseDate(date?: number) {
		if (!date || typeof date !== 'number') return 'Unknown Time'
		try {
			let d = new Date(date)
			return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US')
		} catch (e) {
			return 'Unknown Time'
		}
	}
</script>
