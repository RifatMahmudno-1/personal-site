import { hashSync } from 'bcrypt'

type BodyType = {
	name: string
	email: string
	pass: string
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		name: { type: 'string', minLength: 3, maxLength: 64 },
		email: { type: 'string', minLength: 8, maxLength: 256 },
		pass: { type: 'string', minLength: 8, maxLength: 256 }
	},
	required: ['email', 'pass', 'name'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		res.deleteCookie('TokenS').deleteCookie('TokenP').deleteCookie('Stay')

		const body: BodyType = await req.parseBody()
		const validation = ajvValidate(schema, body)
		if (validation.error) return res.setStatus(400).send(validation)

		const got = await mongo.client!.db('Personal_Site').collection('Admins').findOne({ email: body.email })

		if (got) {
			if (got.approved) return res.send({ status: 'approved' })
			return res.send({ status: 'not_approved' })
		}

		await mongo
			.client!.db('Personal_Site')
			.collection('Admins')
			.insertOne({
				name: body.name,
				email: body.email,
				pass: hashSync(body.pass, 10),
				approved: false,
				createdAt: Date.now(),
				credentialsChangedAt: Date.now() + Math.floor(Math.random() * 500)
			})

		return res.send({ status: 'success' })
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
