<template>
	<PostDisableScroll>
		<div class="fixed top-[var(--nav-height)] left-0 w-full h-[var(--main-con-height)] bg-black bg-opacity-20 z-20 grid items-center justify-items-center p-2">
			<PostCreateEditPreview v-if="previewing" @toggle-previewing="() => (previewing = !previewing)" :post-data="postData" />
			<form class="w-full max-h-full overflow-auto max-w-[40rem] p-4 bg-cyan-200 rounded shadow-md grid gap-4" @submit.prevent="submit" v-else>
				<div class="grid gap-2 grid-cols-[auto_1fr]">
					<label for="title">Title:</label>
					<input type="text" id="title" placeholder="Enter post title" class="rounded px-1 bg-white" required v-model="postData.title" :disabled="sending" />
					<label for="section">Section:</label>
					<input type="text" id="section" placeholder="Enter post section" class="rounded px-1 bg-white" required v-model="postData.section" :disabled="sending" />
					<label for="post" class="col-[1/-1]">Content:</label>
					<textarea id="post" class="min-h-[10rem] rounded p-1 resize-y col-[1/-1] bg-white" placeholder="Post content here" required v-model="postData.content" :disabled="sending"></textarea>
				</div>
				<div class="flex justify-evenly gap-2">
					<button type="button" class="bg-cyan-300 py-1 px-4 rounded shadow hover:shadow-md transition-shadow" :disabled="sending" @click="() => (previewing = !previewing)">Preview</button>
					<button type="submit" class="bg-blue-300 py-1 px-4 rounded shadow hover:shadow-md transition-shadow" :disabled="sending">{{ props.type === 'create' ? 'Post' : 'Save Edit' }}</button>
					<button type="button" class="bg-red-500 py-1 px-4 rounded shadow hover:shadow-md transition-shadow" :disabled="sending" @click="() => emit('toggle-create-edit')">Cancel</button>
				</div>
			</form>
		</div>
	</PostDisableScroll>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'toggle-create-edit': []; 'update-data': [EachPostType] }>()
	const props = defineProps<{ type: 'create' | 'edit'; postData?: EachPostType }>()

	const previewing = ref(false)
	const postData = ref<EachPostPreviewType>({
		title: props.type === 'edit' ? props.postData!.title : '',
		section: props.type === 'edit' ? props.postData!.section : '',
		content: props.type === 'edit' ? props.postData!.content : '',
		createdAt: props.type === 'edit' ? props.postData!.createdAt : Date.now(),
		modifiedAt: props.type === 'edit' ? Date.now() : undefined
	})

	const sending = ref(false)
	async function submit() {
		try {
			const got = await $fetch('/api/post', {
				method: 'POST',
				responseType: 'json',
				body: {
					title: postData.value.title,
					section: postData.value.section,
					content: postData.value.content,
					_id: props.postData?._id || undefined
				}
			})
			emit('update-data', got as EachPostType)
			setNoti(props.postData?._id ? 'Saved edits' : 'Posted successfully')
			emit('toggle-create-edit')
		} catch (e: any) {
			showError(e)
		}
	}
</script>
