export default () => {
	const data = useState('showSideBar', () => false)
	const toggle = () => {
		data.value = !data.value
	}
	return {
		showSidebar: data,
		toggleShowSidebar: toggle
	}
}
