export default () => {
	const data = useState('showToggleBtn', () => false)
	const set = (val: boolean) => {
		data.value = val
	}
	return {
		showToggleBtn: data,
		setShowToggleBtn: set
	}
}
