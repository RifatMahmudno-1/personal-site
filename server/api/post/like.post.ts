type BodyType = {
	_id: string
	type: 'add' | 'rem'
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		_id: { type: 'string', minLength: 24, maxLength: 24 },
		type: { type: 'string', enum: ['add', 'rem'] }
	},
	required: ['_id', 'type'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		const body: BodyType = await req.parseBody()
		const validation = ajvValidate(schema, body)
		if (validation.error) return res.setStatus(400).send(validation)

		await mongo
			.client!.db('Personal_Site')
			.collection('Posts')
			.updateOne({ _id: new mongo.ObjectId(body._id) }, { $inc: { likes: body.type === 'add' ? 1 : -1 } })

		return res.sendEmpty()
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
