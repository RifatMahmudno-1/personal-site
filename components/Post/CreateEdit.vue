<template>
	<PostDisableScroll>
		<div class="fixed top-[var(--nav-height)] left-0 w-full h-[var(--main-con-height)] bg-black bg-opacity-20 z-20 grid items-center justify-items-center p-2">
			<PostCreateEditPreview v-if="previewing" @toggle-previewing="() => (previewing = !previewing)" :post-data="postData" />
			<PostUploadImage v-else-if="uploading_image" @toggle-uploading-image="uploading_image = !uploading_image" />
			<form class="w-full max-h-full overflow-auto max-w-[70%] p-4 bg-cyan-200 rounded shadow-md grid gap-4" @submit.prevent="submit" v-else>
				<div class="grid gap-2 grid-cols-[auto_1fr]">
					<label for="title">Title:</label>
					<input type="text" id="title" placeholder="Enter post title" class="rounded px-1 bg-white" required v-model="postData.title" :disabled="sending" />
					<label for="section">Section:</label>
					<input type="text" id="section" placeholder="Enter post section" class="rounded px-1 bg-white" required v-model="postData.section" :disabled="sending" list="list_section" />
					<datalist v-if="sidebarData?.length" id="list_section">
						<option :value="d" v-for="d in sidebarData.map(el => el.section)">{{ d }}</option>
					</datalist>
					<label for="post" class="col-[1/-1]">Content:</label>
					<textarea id="post" class="min-h-[10rem] rounded p-1 resize-y col-[1/-1] bg-white" placeholder="Post content here" required v-model="postData.content" :disabled="sending" @keydown="keydownHandler"></textarea>
				</div>
				<button class="w-fit mx-auto bg-cyan-300 px-2 py-1 rounded shadow hover:shadow-md transition-shadow" type="button" :disabled="sending" @click="uploading_image = !uploading_image">Upload image and get url</button>
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
	const sidebarData = inject<Ref<EachSectionType[]>>('sidebarData')

	const previewing = ref(false)
	const uploading_image = ref(false)
	const postData = ref<EachPostPreviewType>({
		title: props.type === 'edit' ? props.postData!.title : '',
		section: props.type === 'edit' ? props.postData!.section : '',
		content: props.type === 'edit' ? props.postData!.content : '',
		createdAt: props.type === 'edit' ? props.postData!.createdAt : Date.now(),
		modifiedAt: props.type === 'edit' ? Date.now() : undefined
	})

	const sending = ref(false)
	async function submit() {
		sending.value = true
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
		sending.value = false
	}

	async function keydownHandler(e: KeyboardEvent) {
		if (e.code === 'Tab') {
			e.preventDefault()

			const ele = e.target as HTMLTextAreaElement
			const start = ele.selectionStart
			const end = ele.selectionEnd
			postData.value.content = ele.value.substring(0, start) + '\t' + ele.value.substring(start, end).split('\n').join('\n\t') + ele.value.substring(end)
			// wait for dom update
			await nextTick()
			// move cursor
			ele.selectionStart = ele.selectionEnd = start + 1
		} else if (e.ctrlKey && e.code === 'KeyB') {
			e.preventDefault()

			const ele = e.target as HTMLTextAreaElement
			const start = ele.selectionStart
			const end = ele.selectionEnd
			postData.value.content = ele.value.substring(0, start) + '**' + ele.value.substring(start, end) + '**' + ele.value.substring(end)
			// wait for dom update
			await nextTick()
			// move cursor
			if (start === end) ele.selectionStart = ele.selectionEnd = start + 2
			else ele.selectionStart = ele.selectionEnd = end + 4
		} else if (e.ctrlKey && e.code === 'KeyI') {
			e.preventDefault()

			const ele = e.target as HTMLTextAreaElement
			const start = ele.selectionStart
			const end = ele.selectionEnd
			postData.value.content = ele.value.substring(0, start) + '*' + ele.value.substring(start, end) + '*' + ele.value.substring(end)
			// wait for dom update
			await nextTick()
			// move cursor
			if (start === end) ele.selectionStart = ele.selectionEnd = start + 1
			else ele.selectionStart = ele.selectionEnd = end + 2
		} else if (e.ctrlKey && e.code === 'KeyL') {
			e.preventDefault()

			const ele = e.target as HTMLTextAreaElement
			const start = ele.selectionStart
			const end = ele.selectionEnd

			const content = ele.value.substring(start, end)
			let isUrl = content.startsWith('/') || content.startsWith('#')
			if (!isUrl) {
				try {
					new URL(content)
					isUrl = true
				} catch {
					isUrl = false
				}
			}

			postData.value.content = ele.value.substring(0, start) + (isUrl ? `[](${content})` : `[${content}]()`) + ele.value.substring(end)
			// wait for dom update
			await nextTick()
			// move cursor
			if (!isUrl) ele.selectionStart = ele.selectionEnd = content.length + start + 3
			else ele.selectionStart = ele.selectionEnd = 1
		}
	}
</script>
