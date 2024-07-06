async function validation(): Promise<boolean> {
	const tokenP = useCookie('TokenP').value
	const tokenS = useCookie('TokenS').value
	const stay = useCookie('Stay').value
	if (!tokenP || !tokenS || (stay !== 'Yes' && stay !== 'No')) return false

	try {
		const msg = await aesDecrypt(tokenP, import.meta.env.VITE_PublicKey)
		if (msg !== 'Personal_Site') return false
		return true
	} catch (e) {
		return false
	}
}

function removeCookie() {
	const tokenP = useCookie('TokenP')
	const tokenS = useCookie('TokenS')
	const stay = useCookie('Stay')

	if (tokenP.value) tokenP.value = undefined
	if (tokenS.value) tokenS.value = undefined
	if (stay.value) stay.value = undefined
}

const guardedRoutesExact = ['/contacted']
export default defineNuxtRouteMiddleware(async to => {
	if (to.path === '/login' || to.path === '/register') return removeCookie()

	const isValid = await validation()
	to.meta.admin = isValid

	if (guardedRoutesExact.includes(to.path) && !isValid) return abortNavigation({ statusCode: 401 })
})
