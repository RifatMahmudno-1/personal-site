<template>
	<div class="flex gap-2 flex-col">
		<div class="text-center bg-cyan-200 p-2 rounded text-lg" v-if="pending">Loading posts...</div>
		<PostView v-for="d in data" :postData="d" @update-data="updateData" v-else-if="data?.length" @delete-data="deleteData" :key="d._id" />
		<div class="text-center bg-cyan-200 p-2 rounded text-lg" v-else>No posts found</div>
	</div>
	<PostCreate @update-data="updateData" v-if="$route.meta.admin" />
</template>

<script setup lang="ts">
	const refreshSidebar = inject<Ref<boolean>>('refreshSidebar')

	definePageMeta({
		layout: 'advanced'
	})

	const { data, pending, error } = await cLazyFetch<EachPostType[]>('/api/posts', { responseType: 'json' })

	watchEffect(() => {
		if (error.value) showError(error.value)
	})

	function updateData(d: EachPostType) {
		if (pending.value || !data.value) return
		const ind = data.value.findIndex(el => el._id === d._id)
		if (ind === -1) data.value.unshift(d)
		else data.value[ind] = d
		refreshSidebar!.value = true
	}

	function deleteData(_id: EachPostType['_id']) {
		if (pending.value || !data.value) return
		const ind = data.value.findIndex(el => el._id === _id)
		if (ind !== -1) data.value.splice(ind, 1)
		refreshSidebar!.value = true
	}
</script>
