export default defineEventHandler(async ev => {
	const authorized = await auth(ev)

	const { res } = modifyH3(ev)
	try {
		const got = await mongo
			.client!.db('Personal_Site')
			.collection('Posts')
			.aggregate([
				{
					$match: !authorized ? { private: { $ne: true } } : {}
				},
				{
					$group: {
						_id: '$section',
						posts: {
							$push: {
								_id: '$_id',
								title: '$title',
								pinned: '$pinned'
							}
						}
					}
				}
			])
			.toArray()

		// sort and format
		got
			.sort((a: any, b: any) => a._id.localeCompare(b._id))
			.map(el => {
				el.section = el._id
				delete el._id
				el.posts.sort((a: any, b: any) => {
					if (a.pinned && !b.pinned) return -1
					if (!a.pinned && b.pinned) return 1
					return a.title.localeCompare(b.title)
				})
				el.posts.sort()
				return el
			})

		return res.send(got)
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
