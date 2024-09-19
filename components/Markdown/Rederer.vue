<template>
	<div v-html="html" class="prose prose-headings:my-0 prose-ul:my-0 prose-hr:my-2 !max-w-[unset] text-black"></div>
</template>

<script setup lang="ts">
	import markdownit from 'markdown-it'
	const mdIt = markdownit({
		html: true,
		breaks: true,
		linkify: true,
		typographer: true
	})
	mdIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
		const hrefIndex = tokens[idx].attrIndex('href')
		if (hrefIndex >= 0) {
			const href = tokens[idx].attrs?.[hrefIndex][1]
			if (href && !href.startsWith('/') && !href.startsWith('#')) {
				const targetIndex = tokens[idx].attrIndex('target')
				if (targetIndex < 0) tokens[idx].attrPush(['target', '_blank']) // Add target attribute for external links if not added
			}
		}

		return self.renderToken(tokens, idx, options)
	}

	const props = defineProps<{ md: string }>()
	const { md } = toRefs(props)
	const html = computed(() => mdIt.render(md.value))
</script>
