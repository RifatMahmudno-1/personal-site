import { MongoClient, ObjectId } from 'mongodb'

class mongo {
	static client: null | MongoClient = null
	static ObjectId = ObjectId
	static async init() {
		try {
			this.client = await new MongoClient(process.env.MongoUrl!).connect()
			console.log('Connected to MongoDB')
		} catch (e) {
			this.client = null
			console.error(e)
		}
	}
}

export default mongo
