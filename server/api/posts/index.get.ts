type QueryType = {
	section?: string
	page: string
}

const schema: AJVSchema<QueryType> = {
	type: 'object',
	properties: {
		section: { type: 'string', nullable: true },
		page: {
			type: 'string',
			ValidateByFunction: (data: string) => {
				const n = Number(data)
				return n >= 1 && Number.isInteger(n)
			}
		}
	},
	required: ['page'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		const query: QueryType = req.getQuery()
		const validation = ajvValidate(schema, query)
		if (validation.error) return res.setStatus(400).send(validation)

		const perPage = Number(process.env.PerPage)
		const got = await mongo
			.client!.db('Personal_Site')
			.collection('Posts')
			.find(query.section ? { section: query.section } : {})
			.sort({ createdAt: -1 })
			.skip((Number(query.page) - 1) * perPage)
			.limit(perPage + 1)
			.toArray()

		if (query.section && !got.length) return res.setStatus(404)
		return res.send({ hasMore: got.length > perPage, result: got.slice(0, perPage) })
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
