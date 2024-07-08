type ImgurSecretsType = {
	type: 'imgur_secrets'
	client_id: string
	client_secret: string
	access_token: string
	refresh_token: string
	album_id?: string
	valid_till?: number
}

async function getAlbumID(access_token: string) {
	try {
		const all_albums = await $fetch<{
			data?: { title: string; id: string }[]
		}>('https://api.imgur.com/3/account/me/albums', {
			headers: { Authorization: `Bearer ${access_token}` },
			responseType: 'json'
		})
		const old_album = all_albums.data?.find(el => el.title === 'Personal Site')
		if (old_album) return old_album.id

		const got = await $fetch<{
			data?: { id: string; deletehash: string }
		}>('https://api.imgur.com/3/album', {
			method: 'POST',
			headers: { Authorization: `Bearer ${access_token}` },
			body: (() => {
				const formData = new FormData()
				formData.append('title', 'Personal Site')
				formData.append('privacy', 'hidden')
				return formData
			})(),
			responseType: 'json'
		})

		return got.data?.id || false
	} catch (e) {
		console.log(e)
		return false
	}
}

async function getSecrets() {
	const keyArr = ['client_id', 'client_secret', 'access_token', 'refresh_token']
	const got = await mongo.client!.db('Personal_Site').collection<ImgurSecretsType>('Imgur').findOne({ type: 'imgur_secrets' })
	if (!got) return false

	const gotKeys = Object.keys(got)
	if (keyArr.find(el => !gotKeys.includes(el))) return false

	if (!got.album_id) {
		const album_id = await getAlbumID(got.access_token)
		if (!album_id) return false
		await mongo.client!.db('Personal_Site').collection<ImgurSecretsType>('Imgur').updateOne({ type: 'imgur_secrets' }, { $set: { album_id } })
		got.album_id = album_id
	}

	return got
}

async function refreshToken(secrets: ImgurSecretsType) {
	const got = await $fetch<{
		access_token: string
		refresh_token: string
		expires_in: number
		token_type: 'Bearer'
		account_username: string
	}>('https://api.imgur.com/oauth2/token', {
		method: 'POST',
		body: (() => {
			const formData = new FormData()
			formData.append('refresh_token', secrets.refresh_token)
			formData.append('client_id', secrets.client_id)
			formData.append('client_secret', secrets.client_secret)
			formData.append('grant_type', 'refresh_token')
			return formData
		})(),
		responseType: 'json'
	}).catch(e => {
		console.log(e)
		return null
	})
	if (!got) return null

	const valid_till = Date.now() + (got.expires_in - 300) * 1000
	await mongo
		.client!.db('Personal_Site')
		.collection<ImgurSecretsType>('Imgur')
		.updateOne(
			{ type: 'imgur_secrets' },
			{
				$set: {
					access_token: got.access_token,
					refresh_token: got.refresh_token,
					valid_till: valid_till
				}
			}
		)

	return { access_token: got.access_token, refresh_token: got.refresh_token, valid_till: valid_till }
}

// must manually add these data to the database in Imgur for it to work.
// {
//   "type": "imgur_secrets",
//   "client_id": "secret client id",
//   "client_secret": "secret client secret",
//   "access_token": "secret access token",
//   "refresh_token": "secret refresh token",
// }

export default defineEventHandler(async ev => {
	const { req, res } = modifyH3(ev)
	try {
		const secrets = await getSecrets()
		if (!secrets) return res.send({ status: 'imgur_secrets_error' })
		if (secrets.valid_till && secrets.valid_till < Date.now()) {
			const refreshed = await refreshToken(secrets)
			if (!refreshed) return res.send({ status: 'imgur_refresh_error' })
			Object.assign(secrets, refreshed)
		}

		return res.send({ status: 'success' })
	} catch (e) {
		console.log(e)
		return res.sendStatus(500)
	}
})
