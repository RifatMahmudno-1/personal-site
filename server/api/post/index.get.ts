type QueryType = {
	_id: string
	section: string
}

const schema: AJVSchema<QueryType> = {
	type: 'object',
	properties: {
		_id: { type: 'string', minLength: 24, maxLength: 24 },
		section: { type: 'string', minLength: 1 }
	},
	required: ['_id', 'section'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		const query: QueryType = req.getQuery()
		const validation = ajvValidate(schema, query)
		if (validation.error) return res.setStatus(400).send(validation)

		const got = await mongo
			.client!.db('Personal_Site')
			.collection('Posts')
			.findOne({ _id: new mongo.ObjectId(query._id), section: query.section })

		if (!got) return res.sendStatus(404)
		if (got.private && !(await auth(ev))) return sendUnauthorized(ev)
		return res.send(got)
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
