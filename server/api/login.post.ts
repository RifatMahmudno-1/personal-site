import { compareSync } from 'bcrypt'

type BodyType = {
	email: string
	pass: string
	stay: boolean
	token: string
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		email: { type: 'string', minLength: 8, maxLength: 256 },
		pass: { type: 'string', minLength: 8, maxLength: 256 },
		stay: { type: 'boolean' },
		token: { type: 'string', minLength: 20, maxLength: 2048 }
	},
	required: ['email', 'pass', 'stay', 'token'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		res.deleteCookie('TokenS').deleteCookie('TokenP').deleteCookie('Stay')

		const body: BodyType = await req.parseBody()
		const validation = ajvValidate(schema, body)
		if (validation.error) return res.setStatus(400).send(validation)

		if (!(await validateTurnstile(process.env.TurnstileSecretKey!, body.token, req.getIP()))) return res.sendStatus(400)

		const got = await mongo.client!.db('Personal_Site').collection('Admins').findOne({ email: body.email })

		if (!got) return res.send({ status: 'invalid_email' })
		if (!got.approved) return res.send({ status: 'not_approved' })
		if (!compareSync(body.pass, got.pass)) return res.send({ status: 'invalid_pass' })

		return res
			.setCookie('TokenS', await aesEncrypt(got._id + '::' + got.credentialsChangedAt, process.env.PrivateKey!), {
				path: '/',
				maxAge: body.stay ? 2592000 : undefined
			})
			.setCookie('TokenP', await aesEncrypt(`Personal_Site`, process.env.VITE_PublicKey!), {
				path: '/',
				maxAge: body.stay ? 2592000 : undefined
			})
			.setCookie('Stay', body.stay ? 'Yes' : 'No', {
				path: '/',
				maxAge: body.stay ? 2592000 : undefined
			})
			.send({ status: 'success' })
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
