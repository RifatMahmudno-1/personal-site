export default defineNuxtRouteMiddleware(async to => {
	if (to.path !== '/' && to.path.endsWith('/')) {
		to.path = to.path.slice(0, -1)
		return navigateTo(to)
	}

	const cookies = ['TokenS', 'TokenP', 'Stay']
	for (let i = 0; i < cookies.length; i++) {
		const cookie = useCookie(cookies[i], { path: '/', maxAge: useCookie('Stay').value === 'Yes' ? 2592000 : undefined })
		const oldValue = cookie.value
		if (oldValue === undefined) continue
		cookie.value = ''
		await nextTick()
		cookie.value = oldValue
	}
	if (import.meta.client) {
		globalThis.document.cookie
			.split('; ')
			.map(el => el.split('=')[0])
			.forEach(el => {
				if (!el) return
				if (!cookies.includes(el)) useCookie(el).value = null
			})
	}
})
