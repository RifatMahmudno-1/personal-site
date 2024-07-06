export default defineEventHandler(async ev => {
	const { res } = modifyH3(ev)
	return res.send('What are you looking for?')
})
