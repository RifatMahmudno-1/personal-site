<template>
	<slot v-if="showToggleBtn">
		<button class="aspect-square w-[1.875rem] flex items-center justify-center bg-cyan-100 rounded shadow-sm p-0.5 max-[800px]:hidden">
			<img src="/favicon.ico" />
		</button>
		<button class="aspect-square text-3xl hidden items-center justify-center bg-cyan-100 rounded shadow-sm hover:shadow-md transition-shadow max-[800px]:flex" @click="toggleShowSidebar">
			<IconMenu class="p-0.5" />
		</button>
	</slot>

	<button class="aspect-square w-[1.875rem] flex items-center justify-center bg-cyan-100 rounded shadow-sm p-0.5" v-else>
		<img src="/favicon.ico" />
	</button>
</template>

<script setup lang="ts">
	const { toggleShowSidebar } = useShowSidebar()
	const { showToggleBtn } = useShowToggleBtn()
</script>
