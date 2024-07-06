export default defineEventHandler(async ev => {
	const { res } = modifyH3(ev)
	try {
		const got = await mongo.client!.db('Personal_Site').collection('Messages').find({}).toArray()

		return res.send(got)
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
