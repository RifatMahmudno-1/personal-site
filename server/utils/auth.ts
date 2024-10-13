import { WithId, Document } from 'mongodb'

declare module 'h3' {
	interface H3EventContext {
		userData?: WithId<Document>
	}
}

export default async (ev: import('h3').H3Event) => {
	const { TokenS, TokenP, Stay } = parseCookies(ev)
	if (!Stay || (Stay !== 'Yes' && Stay !== 'No') || !TokenS || !TokenP) return false

	const decrypted = await aesDecrypt(TokenS, process.env.PrivateKey!)
	if (!decrypted?.includes('::')) return false

	const [_id, credentialsChangedAt] = decrypted.split('::')
	if (_id.length !== 24 || !credentialsChangedAt) return false

	const got = await mongo
		.client!.db('Personal_Site')
		.collection('Admins')
		.findOne({ _id: new mongo.ObjectId(_id) })
	if (!got || got.credentialsChangedAt.toString?.() !== credentialsChangedAt) return false

	ev.context.userData = got
	return true
}
