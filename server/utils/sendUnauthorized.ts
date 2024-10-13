export default (ev: import('h3').H3Event) => {
	setResponseStatus(ev, 401)
	deleteCookie(ev, 'TokenS')
	deleteCookie(ev, 'TokenP')
	deleteCookie(ev, 'Stay')
	return send(ev)
}
