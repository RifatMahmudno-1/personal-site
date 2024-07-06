type QueryType = {
	section?: string
}

const schema: AJVSchema<QueryType> = {
	type: 'object',
	properties: {
		section: { type: 'string', nullable: true }
	},
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
			.find(query.section ? { section: query.section } : {})
			.sort({ createdAt: -1 })
			.toArray()

		if (query.section && !got.length) return res.setStatus(404)
		return res.send(got)
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
