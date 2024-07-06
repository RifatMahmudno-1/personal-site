import { WithId, Document } from 'mongodb'

declare module 'h3' {
	interface H3EventContext {
		userData?: WithId<Document>
	}
}

const errored = (res: ReturnType<typeof modifyH3>['res']) => res.deleteCookie('TokenS').deleteCookie('TokenP').deleteCookie('Stay').sendStatus(401)

const guardedRoutes = ['/api/post', '/api/contacted']
const guardedRoutesExactExceptions = [
	{ pathname: '/api/post', method: 'GET' },
	{ pathname: '/api/post/like', method: 'POST' }
]

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		const { pathname } = req.getUrl()

		if (guardedRoutesExactExceptions.find(el => el.method === req.method && el.pathname === pathname)) return
		if (!guardedRoutes.find(el => el === pathname || pathname.startsWith(el + '/'))) return

		// auth
		const { TokenS, TokenP, Stay } = req.getCookies()
		if (!Stay || (Stay !== 'Yes' && Stay !== 'No') || !TokenS || !TokenP) return errored(res)

		const decrypted = await aesDecrypt(TokenS, process.env.PrivateKey!)
		if (!decrypted?.includes('::')) return errored(res)

		const [_id, credentialsChangedAt] = decrypted.split('::')
		if (_id.length !== 24 || !credentialsChangedAt) return errored(res)

		const got = await mongo
			.client!.db('Personal_Site')
			.collection('Admins')
			.findOne({ _id: new mongo.ObjectId(_id) })
		if (!got || got.credentialsChangedAt.toString?.() !== credentialsChangedAt) return errored(res)

		ev.context.userData = got
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
