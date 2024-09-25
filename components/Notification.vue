<template>
	<div class="fixed right-8 z-50 top-[15%] grid gap-4">
		<div v-for="each in arr" :key="each.key" class="grid grid-cols-[1fr_auto] border-2 border-cyan-500 items-center gap-2 px-2 py-1 rounded shadow-md bg-cyan-300 w-[30rem] justify-between animate-[sideIn_8s_linear_forwards] max-[550px]:w-[25rem] max-[420px]:w-[20rem] max-[350px]:w-[17rem] max-[300px]:w-[14rem]">
			<p>{{ each.message }}</p>
			<button @click="() => remove(each)" class="bg-cyan-500 h-8 w-8 rounded text-lg grid items-center justify-items-center">
				<IconClose />
			</button>
		</div>
	</div>
</template>

<style scope>
	@keyframes sideIn {
		5%,
		95% {
			transform: translateX(0%);
		}
		0%,
		100% {
			transform: translateX(100%);
		}
	}
</style>

<script setup lang="ts">
	const arr = getNoti()
	function remove(each: EachNotificationType) {
		const ind = arr.value.findIndex(el => el.key === each.key)
		if (ind === -1) return
		clearTimeout(each.timeoutID)
		arr.value.splice(ind, 1)
	}
</script>
