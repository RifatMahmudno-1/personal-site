<template>
	<div class="bg-cyan-200 p-2 rounded grid gap-2">
		<div class="grid gap-0.5">
			<h2 class="font-semibold text-xl">{{ props.postData.title }}</h2>
			<div class="flex gap-2 text-sm flex-wrap">
				<p class="bg-white bg-opacity-70 px-1 rounded"><span class="text-cyan-500 font-semibold">@</span> {{ props.postData.section }}</p>
				<p class="bg-white bg-opacity-70 px-1 rounded">{{ props.postData.private ? 'Private' : 'Public' }} Post</p>
				<p class="bg-white bg-opacity-70 px-1 rounded">{{ parseDate(props.postData.createdAt) }}</p>
				<p class="bg-white bg-opacity-70 px-1 rounded" v-if="props.postData.modifiedAt">Edited</p>
			</div>
		</div>
		<MarkdownRederer :md="props.postData.content" class="bg-white p-1 px-2 rounded overflow-auto" :class="!props.onlyOne ? 'max-h-[15rem]' : ''" />
		<div class="flex justify-evenly">
			<PostLike :disabled="busy" :likes="props.postData.likes" :_id="props.postData._id" @liking="v => (liking = v)" />
			<button v-if="!noView" class="flex items-center gap-1 bg-cyan-300 rounded px-2 py-1" @click="() => $router.push(`/posts/${props.postData.section}/${props.postData._id}`)" :disabled="busy">
				<IconEye />
				<span :class="route.meta.admin ? 'max-[400px]:hidden' : ''">View</span>
			</button>
			<button class="flex items-center gap-1 bg-cyan-300 rounded px-2 py-1" @click="() => (editing = true)" :disabled="busy" v-if="route.meta.admin">
				<IconEdit />
				<span :class="route.meta.admin ? 'max-[400px]:hidden' : ''">Edit</span>
			</button>
			<button class="flex items-center gap-1 bg-red-500 rounded px-2 py-1" @click="deletePost" :disabled="busy" v-if="route.meta.admin">
				<IconDelete />
				<span :class="route.meta.admin ? 'max-[400px]:hidden' : ''">Delete</span>
			</button>
			<button class="flex items-center gap-1 bg-cyan-300 rounded px-2 py-1" :disabled="busy" @click="copyLink">
				<IconShare />
				<span :class="route.meta.admin ? 'max-[400px]:hidden' : ''">Share</span>
			</button>
		</div>
	</div>
	<PostCreateEdit type="edit" v-if="editing" :post-data="props.postData" @toggle-create-edit="() => (editing = !editing)" @update-data="d => emit('update-data', d)" />
</template>

<script setup lang="ts">
	const props = defineProps<{ postData: EachPostType; onlyOne?: boolean; noView?: boolean }>()
	const emit = defineEmits<{ 'update-data': [EachPostType]; 'delete-data': [EachPostType['_id']] }>()

	const route = useRoute()
	const editing = ref(false)
	const deleting = ref(false)
	const liking = ref(false)
	const busy = computed(() => editing.value || deleting.value || liking.value)

	function parseDate(date?: number) {
		if (!date || typeof date !== 'number') return 'Unknown Time'
		try {
			let d = new Date(date)
			return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US')
		} catch (e) {
			return 'Unknown Time'
		}
	}

	async function deletePost() {
		if (!globalThis.confirm(`Do you really want to delete this post?`)) return
		deleting.value = true

		try {
			await $fetch('/api/post', { method: 'DELETE', body: { _id: props.postData._id } })
			setNoti('Post deleted successfully.')
			emit('delete-data', props.postData._id)
		} catch (e: any) {
			showError(e)
		}
	}

	function copyLink() {
		const url = useRequestURL()
		try {
			globalThis.navigator.clipboard.writeText(`${url.origin}/${props.postData.section}/${props.postData._id}`)
			setNoti('Shareable link was copied to your clipboard.')
		} catch {
			setNoti(`Share this link: ${url.origin}/${props.postData.section}/${props.postData._id}`)
		}
	}
</script>
