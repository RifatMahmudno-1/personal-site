type BodyType = {
	name: string
	email: string
	message: string
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		name: { type: 'string', minLength: 3, maxLength: 64 },
		email: { type: 'string', minLength: 8, maxLength: 256 },
		message: { type: 'string', minLength: 1, maxLength: 5000 }
	},
	required: ['email', 'name', 'message'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		const body: BodyType = await req.parseBody()
		const validation = ajvValidate(schema, body)
		if (validation.error) return res.setStatus(400).send(validation)

		await mongo.client!.db('Personal_Site').collection('Messages').insertOne({
			name: body.name,
			email: body.email,
			message: body.message,
			time: Date.now()
		})

		return res.sendEmpty()
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
