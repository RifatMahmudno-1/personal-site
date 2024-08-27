<template>
	<div class="flex gap-2 flex-col">
		<div class="text-center bg-cyan-200 p-2 rounded text-lg" v-if="pending">Loading posts...</div>
		<slot v-else>
			<PostView v-for="d in data.result" :postData="d" @update-data="updateData" v-if="data?.result.length" @delete-data="deleteData" :key="d._id" />
			<div class="text-center bg-cyan-200 p-2 rounded text-lg" v-else>No posts found</div>
		</slot>
		<div class="flex justify-between gap-2" v-if="!pending">
			<button :disabled="page <= 1" @click="() => router.push({ query: { page: page - 1 === 1 ? undefined : page - 1 } })" class="bg-cyan-300 px-2 py-1 rounded shadow hover:shadow-lg transition-shadow">Previous Page</button>
			<button :disabled="!data?.hasMore" @click="() => router.push({ query: { page: page + 1 } })" class="bg-cyan-300 px-2 py-1 rounded shadow hover:shadow-lg transition-shadow">Next Page</button>
		</div>
	</div>
	<PostCreate @update-data="updateData" v-if="route.meta.admin" />
</template>

<script setup lang="ts">
	const route = useRoute()
	const router = useRouter()
	const refreshSidebar = inject<Ref<boolean>>('refreshSidebar')
	const page = computed<number>(() => {
		const p = Number(route.query.page)
		if (p <= 0 || !Number.isInteger(p)) return 1
		return p
	})

	definePageMeta({
		layout: 'advanced'
	})

	const { data, pending, error } = await cLazyFetch<{ hasMore: boolean; result: EachPostType[] }>('/api/posts', { query: { page }, responseType: 'json', watch: [page] })

	watchEffect(() => {
		if (error.value) showError(error.value)
	})

	function updateData(d: EachPostType) {
		if (pending.value || !data.value) return
		const ind = data.value.result.findIndex(el => el._id === d._id)
		if (ind === -1) data.value.result.unshift(d)
		else data.value.result[ind] = d
		refreshSidebar!.value = true
	}

	function deleteData(_id: EachPostType['_id']) {
		if (pending.value || !data.value) return
		const ind = data.value.result.findIndex(el => el._id === _id)
		if (ind !== -1) data.value.result.splice(ind, 1)
		refreshSidebar!.value = true
	}

	onMounted(() => {
		const p = Number(route.query.page)
		if (p <= 1 || !Number.isInteger(p)) {
			const q = { ...route.query }
			delete q.page
			router.replace({ path: route.path, query: q, hash: route.hash })
		}
	})
</script>
