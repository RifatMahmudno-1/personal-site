<template>
	<div class="flex-grow grid justify-items-center items-center">
		<form class="w-full max-w-[40rem] bg-cyan-300 shadow-md rounded p-4 flex flex-col gap-4" @submit.prevent="submit">
			<h1 class="self-center px-2 border-b-2 border-cyan-500 font-semibold text-xl">Contact</h1>
			<div class="grid items-center gap-y-2 gap-x-4 grid-cols-[auto_1fr]">
				<label for="name">Name:</label>
				<input type="text" name="name" id="name" required placeholder="Enter your name" minlength="3" maxlength="64" class="bg-white w-full rounded px-1 py-0.5 focus:shadow-md transition-shadow" v-model="body.name" :disabled="sending" />
				<label for="email">Email:</label>
				<input type="email" name="email" id="email" required placeholder="Enter your email" minlength="8" maxlength="256" class="bg-white w-full rounded px-1 py-0.5 focus:shadow-md transition-shadow" v-model="body.email" :disabled="sending" />
				<label for="message" class="self-start">Message:</label>
				<textarea name="message" id="message" required placeholder="Enter message here" maxlength="5000" class="bg-white rounded px-1 py-0.5 min-h-[5rem] resize-y focus:shadow-md transition-shadow" v-model="body.message" :disabled="sending"></textarea>
			</div>
			<div class="flex justify-center">
				<Turnstile :site-key="siteKey" @token="v => (token = v)" :refresh="refreshID" :size="turnstileSize" />
			</div>
			<button class="self-center bg-cyan-400 border-2 border-cyan-500 px-4 py-0.5 rounded shadow hover:shadow-lg transition-shadow" type="submit" :disabled="sending">Send</button>
		</form>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: `Contact`
	})

	const sending = ref(false)
	const body = ref({
		name: '',
		email: '',
		message: ''
	})

	// turnstile config
	const siteKey = import.meta.env.VITE_TurnstileSiteKey
	const token = ref<string | null>(null)
	const refreshID = ref(1)
	const turnstileSize = ref<'compact' | 'normal'>('normal')
	function resize() {
		if (globalThis.window.innerWidth <= 350) turnstileSize.value = 'compact'
		else turnstileSize.value = 'normal'
	}
	onMounted(() => {
		if (globalThis.window.innerWidth <= 350) turnstileSize.value = 'compact'
		globalThis.window.addEventListener('resize', resize)
	})
	onBeforeUnmount(() => globalThis.window.removeEventListener('resize', resize))

	async function submit() {
		sending.value = true
		try {
			await $fetch('/api/contact', { method: 'POST', body: { ...body.value, token: token.value } })
			setNoti('Message sent successfully.')
			body.value = { name: '', email: '', message: '' }
			refreshID.value++
		} catch (e: any) {
			showError(e)
		}
		sending.value = false
	}
</script>
