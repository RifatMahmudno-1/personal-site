export default defineEventHandler(async ev => {
	const { res } = modifyH3(ev)
	try {
		const got = await mongo
			.client!.db('Personal_Site')
			.collection('Posts')
			.aggregate([
				{
					$group: {
						_id: '$section',
						posts: {
							$push: {
								_id: '$_id',
								title: '$title'
							}
						}
					}
				},
				{
					$project: {
						_id: 0,
						section: '$_id',
						posts: 1
					}
				},
				{
					$sort: {
						section: 1
					}
				}
			])
			.toArray()

		return res.send(
			got.map(el => {
				el.posts = el.posts.toSorted((a: any, b: any) => a.title.localeCompare(b.title))
				return el
			})
		)
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
