export type EachNotificationType = { message: string; isError: boolean; key: string; timeoutID: any }

export function setNoti(message: string, isError: boolean = false) {
	const notifications = useState<EachNotificationType[]>('notifications', () => [])

	if (import.meta.server) return

	const key = globalThis.crypto.randomUUID()
	const timeoutID = setTimeout(() => {
		const ind = notifications.value.findIndex(el => el.key === key)
		if (ind === -1) return
		notifications.value.splice(ind, 1)
	}, 8 * 1000)

	notifications.value.push({
		message,
		isError,
		key,
		timeoutID
	})
}

export function getNoti() {
	return useState<EachNotificationType[]>('notifications', () => [])
}
