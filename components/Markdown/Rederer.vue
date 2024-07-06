<template>
	<div v-html="html" class="prose prose-headings:my-0 prose-ul:my-0 prose-hr:my-2 !max-w-[unset]"></div>
</template>

<script setup lang="ts">
	import markdownit from 'markdown-it'
	const mdIt = markdownit({
		html: true,
		breaks: true,
		linkify: true,
		typographer: true
	})

	const props = defineProps<{ md: string }>()
	const { md } = toRefs(props)
	const html = computed(() => mdIt.render(md.value))
</script>
