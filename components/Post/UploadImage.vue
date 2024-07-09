<template>
	<form class="w-full max-h-full overflow-auto max-w-[70%] p-4 bg-cyan-200 rounded shadow-md grid gap-4" @submit.prevent="send">
		<h2 class="border-b-2 px-2 border-cyan-500 justify-self-center">Upload Image</h2>
		<input type="file" accept="image/jpeg,image/jpg,image/gif,image/png,image/apng,image/tiff" class="w-full" @change="handleImage" required :disabled="sending" v-if="!link" />
		<div class="grid gap-2 items-center" v-else>
			<p>Copy the link below and use it</p>
			<div class="grid gap-2 grid-cols-[1fr_auto] items-center">
				<p class="bg-white select-all px-1 rounded shadow flex-grow">{{ link }}</p>
				<button type="button" class="bg-cyan-300 px-2 rounded shadow hover:shadow-md transition-shadow" @click="copyLink">Copy</button>
			</div>
		</div>
		<div class="flex justify-evenly items-center">
			<button class="px-2 py-1 bg-cyan-300 rounded shadow hover:shadow-md transition-shadow" type="submit" :disabled="sending" v-if="!link">Upload</button>
			<button class="px-2 py-1 bg-red-500 rounded shadow hover:shadow-md transition-shadow" type="button" :disabled="sending" @click="() => emit('toggle-uploading-image')">Go Back</button>
		</div>
	</form>
</template>

<script setup lang="ts">
	const emit = defineEmits<{ 'toggle-uploading-image': [] }>()
	const imageTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/apng', 'image/tiff']
	const imageFile = ref<File | null>(null)
	const sending = ref(false)
	const link = ref('')

	function handleImage(e: Event) {
		imageFile.value = null

		const files = (e.target as HTMLInputElement)!.files
		if (!files?.length) return
		if (files.length > 1) {
			setNoti('You can only upload one file at a time.')
			;(e.target as HTMLInputElement).value = ''
			return
		}

		const file = files[0]
		if (!imageTypes.includes(file.type)) {
			setNoti('Unsupported file selected.')
			;(e.target as HTMLInputElement).value = ''
			return
		}
		if (file.size / 1_000_000 > 2) {
			setNoti('File is larger that 2MB')
			;(e.target as HTMLInputElement).value = ''
			return
		}

		imageFile.value = file
	}

	function copyLink() {
		try {
			globalThis.navigator.clipboard.writeText(link.value)
			setNoti('Link was copied to your clipboard.')
		} catch {
			setNoti('Failed to copy. Copy manually.')
		}
	}

	async function send() {
		if (!imageFile.value) {
			setNoti('Please select an image file')
			return
		}
		sending.value = true
		try {
			const got: { status: string; link?: string } | undefined = await $fetch('/api/imgur', {
				method: 'POST',
				body: (() => {
					const formData = new FormData()
					formData.append('image', imageFile.value)
					return formData
				})(),
				responseType: 'json'
			})
			switch (got?.status) {
				case 'imgur_secrets_error': {
					setNoti('Some errors have occured when getting secrets in imgur or db.')
					break
				}
				case 'imgur_refresh_error': {
					setNoti('Some errors have occured when refreshing token in imgur.')
					break
				}
				case 'imgur_upload_error': {
					setNoti('Some errors have occured when uploading image to imgur.')
					break
				}
				case 'success': {
					link.value = got.link!
					break
				}
				default: {
					setNoti('Some unknown errors have occured')
					break
				}
			}
		} catch (e: any) {
			setNoti('Some errors have occured. Try again.')
		}
		sending.value = false
	}
</script>
