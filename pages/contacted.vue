<template>
	<div class="flex gap-2 flex-col">
		<div class="text-center bg-cyan-200 p-2 rounded text-lg" v-if="pending">Loading data. Please wait...</div>
		<div class="bg-cyan-300 grid grid-cols-[auto_1fr] gap-2 px-4 pt-4 pb-2 rounded items-center" v-else-if="data?.length" v-for="each in data" :key="each._id">
			<p>Name:</p>
			<p class="bg-white shadow-sm px-1 rounded">{{ each.name }}</p>
			<p>Email:</p>
			<p class="bg-white shadow-sm px-1 rounded">{{ each.email }}</p>
			<p class="self-start">Message:</p>
			<div class="bg-white shadow-sm px-1 rounded resize-y overflow-auto h-[5rem]">{{ each.message }}</div>
			<button type="button" class="col-[1/-1] bg-red-500 w-fit mx-auto rounded px-2 py-1" :disabled="deleting" @click="() => deleteMessage(each)">Delete</button>
		</div>
		<div class="text-center bg-cyan-200 p-2 rounded text-lg" v-else>Nothing Found</div>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: `Contacted`
	})

	const { data, pending, error } = await cLazyFetch<EachContactType[]>('/api/contacted', { responseType: 'json' })
	const deleting = ref(false)

	async function deleteMessage(each: EachContactType) {
		if (!globalThis.confirm(`Do you really want to delete this?`)) return
		deleting.value = true
		try {
			await $fetch('/api/contacted', { method: 'DELETE', body: { _id: each._id } })
			setNoti('Message deleted successfully')
			const ind = data.value!.findIndex(el => el._id === each._id)
			if (ind !== -1) data.value!.splice(ind, 1)
		} catch (e: any) {
			showError(e)
		}
		deleting.value = false
	}

	watchEffect(() => {
		if (error.value) showError(error.value)
	})
</script>
