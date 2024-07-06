function addIndexes() {
	mongo.client!.db('Personal_Site').collection('Posts').createIndex({ section: 1 })
}

export default defineEventHandler(async ev => {
	if (ev.method === 'GET' && ev.path !== '/' && ev.path.endsWith('/')) return sendRedirect(ev, ev.path.slice(0, -1), 301)

	const url = getRequestURL(ev)

	// client side rendering, mainly for PWA
	if (ev.method === 'GET' && url.pathname === '/' && url.searchParams.get('csr') === '1') {
		if (ev.context.nuxt?.constructor === Object) ev.context.nuxt.noSSR = true
		else ev.context.nuxt = { noSSR: true }
	}

	/**
	 * try to connect to server on any request made to any route starting with /api
	 * if fails send 500 error
	 */
	if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
		if (mongo.client) return
		await mongo.init()
		if (mongo.client) addIndexes()
		if (!mongo.client) {
			setResponseStatus(ev, 500)
			return send(ev)
		}
	}
})
