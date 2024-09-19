export default async (secretKey: string, response: string, ip?: string): Promise<boolean> => {
	let formData = new FormData()
	formData.append('secret', secretKey)
	formData.append('response', response)
	if (ip) formData.append('remoteip', ip)

	try {
		const got = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: formData }).then(r => r.json())

		if (got.success) return true
		return false
	} catch (e) {
		console.log(e)
		return false
	}
}
