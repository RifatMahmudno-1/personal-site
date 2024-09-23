<template>
	<div class="flex-grow grid justify-items-center items-center">
		<form class="w-full max-w-[40rem] bg-cyan-300 shadow-md rounded p-4 flex flex-col gap-4" @submit.prevent="submit">
			<h1 class="self-center px-2 border-b-2 border-cyan-500 font-semibold text-xl">Login</h1>
			<div class="grid items-center gap-2 grid-cols-[auto_1fr]">
				<label for="email">Email:</label>
				<input type="email" name="email" id="email" required placeholder="Enter email" minLength="8" maxlength="256" class="bg-white w-full rounded px-1 focus:shadow-md transition-shadow" v-model="body.email" :disabled="sending" />
				<label for="pass">Password:</label>
				<input type="password" name="pass" id="pass" required placeholder="Enter password" minlength="8" maxlength="256" class="bg-white w-full rounded px-1 focus:shadow-md transition-shadow" v-model="body.pass" :disabled="sending" />
				<input type="checkbox" name="stay" id="stay" class="justify-self-end" :disabled="sending" v-model="body.stay" />
				<label for="stay">Stay logged in?</label>
			</div>
			<div class="flex justify-center">
				<Turnstile :site-key="siteKey" @token="v => (token = v)" :refresh="refreshID" />
			</div>
			<button class="self-center bg-cyan-400 border-2 border-cyan-500 px-4 py-0.5 rounded shadow hover:shadow-lg transition-shadow" :disabled="sending">Login</button>
		</form>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: `Login`
	})

	const router = useRouter()
	const sending = ref(false)
	const body = ref({
		email: '',
		pass: '',
		stay: false
	})

	// turnstile config
	const siteKey = import.meta.env.VITE_TurnstileSiteKey
	const token = ref<string | null>(null)
	const refreshID = ref(1)

	async function submit() {
		sending.value = true
		try {
			const got: { status: string } | undefined = await $fetch('/api/login', { method: 'POST', body: { ...body.value, token: token.value }, responseType: 'json' })
			switch (got?.status) {
				case 'invalid_email':
					refreshID.value++
					setNoti('Invalid email was provided')
					break
				case 'not_approved':
					refreshID.value++
					setNoti("This email hasn't been approved yet. Please try later.")
					break
				case 'invalid_pass':
					refreshID.value++
					setNoti('Invalid password provided')
					break
				case 'success':
					setNoti('Login successful.')
					router.push('/')
					break
				default:
					throw 'Invalid response provided'
			}
		} catch (e: any) {
			showError(e)
		}
		sending.value = false
	}
</script>
