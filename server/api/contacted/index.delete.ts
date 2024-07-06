type BodyType = {
	_id: string
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		_id: { type: 'string', minLength: 24, maxLength: 24 }
	},
	required: ['_id'],
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
			.collection('Messages')
			.deleteOne({ _id: new mongo.ObjectId(body._id) })

		return res.sendEmpty()
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
