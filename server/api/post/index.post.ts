type BodyType = {
	_id?: string
	title: string
	section: string
	content: string
	private?: boolean
	pinned?: boolean
}

const schema: AJVSchema<BodyType> = {
	type: 'object',
	properties: {
		_id: { type: 'string', minLength: 24, maxLength: 24, nullable: true },
		title: { type: 'string', minLength: 1 },
		section: { type: 'string', minLength: 1 },
		content: { type: 'string', minLength: 1 },
		private: { type: 'boolean', nullable: true },
		pinned: { type: 'boolean', nullable: true }
	},
	required: ['title', 'section', 'content'],
	additionalProperties: false
}

export default defineEventHandler(async ev => {
	if (!(await auth(ev))) return sendUnauthorized(ev)

	const { req, res } = modifyH3(ev)
	try {
		const body: BodyType = await req.parseBody()
		const validation = ajvValidate(schema, body)
		if (validation.error) return res.setStatus(400).send(validation)

		const got = await mongo
			.client!.db('Personal_Site')
			.collection('Posts')
			.findOneAndUpdate(
				{ _id: new mongo.ObjectId(body._id) },
				{
					$set: {
						title: body.title,
						section: body.section,
						content: body.content,
						...(body.private ? { private: true } : {}),
						...(body.pinned ? { pinned: true } : {}),
						...(!body._id ? { createdAt: Date.now(), likes: 0 } : { modifiedAt: Date.now() })
					},
					$unset: {
						...(!body.private ? { private: '' } : {}),
						...(!body.pinned ? { pinned: '' } : {})
					}
				},
				{ upsert: true, returnDocument: 'after' }
			)

		if (!got) throw Error('Update/Create post failed at [post:/api/post]')
		return res.send(got)
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
