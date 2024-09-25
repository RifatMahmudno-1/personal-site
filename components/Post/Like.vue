<template>
	<button class="flex items-center gap-1 bg-cyan-300 rounded px-2 py-1" @click="like">
		<IconLoading v-if="busy" />
		<IconHeart v-else-if="liked" />
		<IconHeartEmpty v-else />
		<span :class="$route.meta.admin ? 'max-[400px]:hidden' : ''">Like | </span>{{ likes }}
	</button>
</template>

<script setup lang="ts">
	const props = defineProps<{ likes: number; _id: string }>()
	const emit = defineEmits<{ liking: [boolean] }>()
	const likes = ref(props.likes)
	const liked = ref(false)
	const busy = ref(false)

	async function like() {
		try {
			busy.value = true

			const type: 'add' | 'rem' = liked.value ? 'rem' : 'add'
			await $fetch('/api/post/like', { method: 'POST', body: { _id: props._id, type } })
			liked.value = !liked.value
			liked.value ? likes.value++ : likes.value--

			busy.value = false
		} catch (e: any) {
			showError(e)
		}
	}

	watch(busy, () => emit('liking', busy.value))
</script>
