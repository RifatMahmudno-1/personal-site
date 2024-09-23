<template>
	<div class="text-center bg-cyan-200 p-2 rounded text-lg" v-if="pending">Loading posts...</div>
	<PostView :post-data="data" v-else-if="data" @update-data="updatePostData" @delete-data="deletePostData" :only-one="true" :no-view="true" />
	<PostCreate @update-data="() => (refreshSidebar = true)" v-if="route.meta.admin" />
</template>

<script setup lang="ts">
	useHead({
		title: `Post`
	})

	definePageMeta({
		layout: 'advanced',
		middleware: [
			to => {
				if (to.params._id.length !== 24) return abortNavigation({ statusCode: 404 })
			}
		]
	})

	const refreshSidebar = inject<Ref<boolean>>('refreshSidebar')!
	const sidebarData = inject<Ref<EachSectionType[]>>('sidebarData')!
	const route = useRoute()
	const router = useRouter()

	const { data, pending, error, refresh } = await cLazyFetch<EachPostType>('/api/post', { responseType: 'json', query: { _id: route.params._id, section: route.params.section }, maxAge: 10 * 60 })

	watchEffect(() => {
		if (error.value) return showError(error.value)
	})

	function updatePostData(d: EachPostType) {
		if (d.section === route.params.section && d._id === route.params._id) {
			data.value = d
		} else {
			router.push(`/posts/${d.section}/${d._id}`)
		}
		refreshSidebar.value = true
	}

	function deletePostData() {
		refreshSidebar.value = true
		router.push('/')
	}

	watch([pending, sidebarData], () => {
		if (pending.value || !data.value || !sidebarData.value.length) return
		if (!sidebarData.value.find(el => el.section === data.value?.section && el.posts.find(e => e._id === data.value?._id))) refresh()
		useHead({
			title: `Post : ${data.value.title}`
		})
	})
</script>
