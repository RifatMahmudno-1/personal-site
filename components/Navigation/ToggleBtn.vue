<template>
	<slot v-if="showToggleBtn">
		<button class="aspect-square text-3xl flex items-center justify-center bg-cyan-100 rounded shadow-sm hover:shadow-md transition-shadow md:hidden" @click="toggleShowSidebar">
			<IconMenu class="p-0.5" />
		</button>
		<button class="aspect-square w-[1.875rem] flex items-center justify-center bg-cyan-100 rounded shadow-sm max-md:hidden p-0.5">
			<img src="/favicon.ico" />
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
