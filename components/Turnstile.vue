<template>
	<div class="_con" :class="size === 'compact' ? 'compact' : ''">
		<p class="_p" v-if="loading">
			Captcha loading. <br />
			Please wait.
		</p>
		<p class="_p" v-else-if="loading === null">
			Captcha Error. <br />
			Refresh this page.
		</p>
		<input class="_input" :class="size === 'compact' ? 'compact' : ''" type="checkbox" required :checked="checked" />
		<div class="_turnstile_container"></div>
	</div>
</template>

<style scoped>
	._con {
		position: relative;
		width: 300px;
		height: 65px;
	}
	._con.compact {
		width: 150px;
		height: 140px;
	}
	._input {
		position: absolute;
		top: 65%;
		transform: translateY(-50%);
		left: 9%;
		z-index: -1;
		opacity: 0;
	}
	._input.compact {
		top: 30%;
		left: 15%;
	}
	._p {
		text-align: center;
		position: absolute;
		inset: 0;
		display: grid;
		align-items: center;
	}
	._turnstile_container {
		position: absolute;
		inset: 0;
	}
</style>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			size?: 'compact' | 'normal'
			theme?: 'light' | 'dark'
			siteKey: string
			refresh?: number
		}>(),
		{ size: 'normal', theme: 'light', refresh: 1 }
	)
	const emit = defineEmits<{ token: [string | null] }>()

	const loading = ref<boolean | null>(true)
	const { size, theme, siteKey, refresh } = toRefs(props)
	const token = ref<null | string>(null)
	const checked = ref<boolean>(false)
	const turnstileID = ref<null | string>(null)

	function renderTurnstile() {
		if (!(globalThis as any).turnstile) {
			loading.value = null
			return
		}
		loading.value = true
		;(globalThis as any).turnstile.ready(() => {
			loading.value = false
			turnstileID.value = (globalThis as any).turnstile.render('._turnstile_container', {
				'sitekey': siteKey.value,
				'callback': (t: any) => {
					token.value = t
				},
				'expired-callback': () => {
					token.value = null
				},
				'theme': theme.value === 'dark' ? 'dark' : 'light',
				'size': size.value === 'compact' ? 'compact' : 'normal'
			})
		})
	}

	function removeTurnstile() {
		if (!(globalThis as any).turnstile) {
			loading.value = null
			return
		}
		if (!turnstileID.value) return
		;(globalThis as any).turnstile.remove(turnstileID.value)
		turnstileID.value = null
		token.value = null
	}

	function resetTurnstile() {
		if (!(globalThis as any).turnstile) {
			loading.value = null
			return
		}
		if (!turnstileID.value) return
		;(globalThis as any).turnstile.reset(turnstileID.value)
		token.value = null
	}

	onMounted(renderTurnstile)
	onBeforeUnmount(removeTurnstile)

	watch(token, () => {
		if (token.value) checked.value = true
		else checked.value = false
		emit('token', token.value)
	})

	watch([theme, siteKey, size], () => {
		removeTurnstile()
		renderTurnstile()
	})

	watch(refresh, resetTurnstile)
</script>
