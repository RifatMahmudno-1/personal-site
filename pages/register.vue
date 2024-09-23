<template>
	<div class="flex-grow grid justify-items-center items-center">
		<form class="w-full max-w-[40rem] bg-cyan-300 shadow-md rounded p-4 flex flex-col gap-4" @submit.prevent="submit">
			<h1 class="self-center px-2 border-b-2 border-cyan-500 font-semibold text-xl">Register</h1>
			<div class="grid items-center gap-2 grid-cols-[auto_1fr]">
				<label for="name">Name:</label>
				<input type="text" name="name" id="name" required placeholder="Enter name" minlength="3" maxlength="64" class="bg-white w-full rounded px-1 focus:shadow-md transition-shadow" v-model="body.name" :disabled="sending" />
				<label for="email">Email:</label>
				<input type="email" name="email" id="email" required placeholder="Enter email" minLength="8" maxlength="256" class="bg-white w-full rounded px-1 focus:shadow-md transition-shadow" v-model="body.email" :disabled="sending" />
				<label for="pass">Password:</label>
				<input type="password" name="pass" id="pass" required placeholder="Enter password" minlength="8" maxlength="256" class="bg-white w-full rounded px-1 focus:shadow-md transition-shadow" v-model="body.pass" :disabled="sending" />
				<label for="re_pass">&nbsp;</label>
				<input type="password" name="re_pass" id="re_pass" required placeholder="Retype that password" minlength="8" maxlength="256" class="bg-white w-full rounded px-1 focus:shadow-md transition-shadow" v-model="body.re_pass" :disabled="sending" @input="comparePass" />
			</div>
			<button class="self-center bg-cyan-400 border-2 border-cyan-500 px-4 py-0.5 rounded shadow hover:shadow-lg transition-shadow" :disabled="sending">Register</button>
		</form>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: `Register`
	})

	const router = useRouter()
	const sending = ref(false)
	const body = ref({
		email: '',
		pass: '',
		name: '',
		re_pass: ''
	})

	async function submit() {
		sending.value = true
		try {
			const got: { status: string } | undefined = await $fetch('/api/register', { method: 'POST', body: { ...body.value, re_pass: undefined }, responseType: 'json' })
			switch (got?.status) {
				case 'approved':
					setNoti('Already registered. Please login')
					router.push('/login')
					break
				case 'not_approved':
					setNoti("Already registered but this account hasn't been approved yet. Please login later.")
					break
				case 'success':
					setNoti('Registration successful. Please wait until an admin approves your account.')
					break
				default:
					throw 'Invalid response.'
			}
		} catch (e: any) {
			showError(e)
		}
		sending.value = false
	}

	function comparePass(e: Event) {
		if (body.value.pass !== body.value.re_pass) (e.target as HTMLInputElement).setCustomValidity("Passwords didn't match")
		else (e.target as HTMLInputElement).setCustomValidity('')
	}
</script>
