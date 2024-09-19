<template>
	<SidebarContainer>
		<ul class="w-[12rem] h-full overflow-auto bg-cyan-100 p-2 flex flex-col gap-2 break-all">
			<li v-if="pending">
				<div class="bg-cyan-300 px-2 py-1 rounded text-center">Loading</div>
			</li>
			<slot v-else-if="data?.length">
				<li>
					<NuxtLink href="/" class="bg-cyan-300 px-2 py-1 rounded block">All Posts</NuxtLink>
				</li>
				<li v-for="el in data" :key="el.section">
					<div class="bg-cyan-300 rounded px-2 py-1 grid grid-cols-[auto_1fr] items-center cursor-pointer select-none gap-1" @click="() => toggleShowing(el.section)">
						<span class="line-clamp-1">{{ el.section }}</span>
						<IconArrowRight v-if="!showing.includes(el.section)" />
						<IconArrowDown v-else />
					</div>
					<ul class="ml-2 mt-1 pl-2 flex flex-col gap-1 border-l-2 border-cyan-400" v-if="showing.includes(el.section)">
						<NuxtLink :href="`/posts/${el.section}`" class="bg-cyan-200 rounded px-2 line-clamp-1">Show All</NuxtLink>
						<NuxtLink :href="`/posts/${el.section}/${e._id}`" class="bg-cyan-200 rounded px-2 line-clamp-1" v-for="e in el.posts" :key="e._id">{{ e.title }}</NuxtLink>
					</ul>
				</li>
			</slot>
			<li v-else>
				<div class="bg-cyan-300 px-2 py-1 rounded text-center">Empty List</div>
			</li>
		</ul>
	</SidebarContainer>
</template>

<style scoped>
	.router-link-exact-active {
		@apply border-cyan-500 border-l-4;
	}
</style>

<script setup lang="ts">
	const refreshSidebar = inject<Ref<boolean>>('refreshSidebar')
	const datalistSections = inject<Ref<string[]>>('datalistSections')
	const route = useRoute()

	const { data, pending, error, refresh } = await cLazyFetch<EachSectionType[]>('/api/posts/sections', { responseType: 'json' })

	watchEffect(() => {
		if (error.value) showError(error.value)
	})

	const showing: Ref<string[]> = ref([])
	function toggleShowing(section: string) {
		const ind = showing.value.findIndex(e => e === section)
		if (ind >= 0) showing.value.splice(ind, 1)
		else showing.value.push(section)
	}

	if (refreshSidebar) {
		watch(refreshSidebar, () => {
			if (!pending.value && refreshSidebar?.value) {
				refresh()
				refreshSidebar.value = false
			}
		})
	}

	watch(
		pending,
		() => {
			if (!pending.value) {
				const newArr: string[] = []
				// add current section
				if (route.params.section) newArr.push(route.params.section as string)
				// add other existing expanded sections
				showing.value.forEach(el => {
					if (data.value?.find(e => e.section === el)) {
						if (route.params?.section === el) return
						newArr.push(el)
					}
				})
				// add it to showing
				showing.value = newArr

				// add sections datalistSections
				if (datalistSections?.value) datalistSections.value = data.value?.map(el => el.section) || []
			}
		},
		{
			immediate: true
		}
	)
</script>
