import { hash } from 'ohash'

function isRefOrGetter(val: any) {
	if (typeof val === 'function' || isRef(val)) return true
	return false
}

function getKey(optionKey: undefined | MaybeRefOrGetter<string>, deps: any[] | (() => any[])): string | false {
	if (optionKey) {
		let key = undefined
		if (typeof optionKey === 'string') key = optionKey
		else if (isRefOrGetter(optionKey) === true) key = toValue(optionKey)
		if (typeof key !== 'string' || key.length === 0) return false
		return key
	}
	return deps ? (typeof deps === 'function' ? hash(deps()) : hash(deps)) : false
}

function getUrl(url: MaybeRefOrGetter<Parameters<typeof $fetch>[0]>): string | false {
	let u = undefined
	if (typeof url === 'string') u = url
	else if (isRefOrGetter(url) === true) u = toValue(url)
	if (typeof u !== 'string' || u.length === 0) return false
	return u
}

const timeHistory = {
	get: (key: string) => {
		if (import.meta.server) return
		const state = useState<Record<string, number>>('_fetchTimeHistory_', () => ({}))
		return state.value[key]
	},
	set: (key: string) => {
		if (import.meta.server) return
		const state = useState<Record<string, number>>('_fetchTimeHistory_', () => ({}))
		state.value[key] = Date.now()
	},
	remove(key: string) {
		if (import.meta.server) return
		const state = useState<Record<string, number>>('_fetchTimeHistory_', () => ({}))
		delete state.value[key]
	},
	removeAll() {
		if (import.meta.server) return
		const state = useState<Record<string, number>>('_fetchTimeHistory_', () => ({}))
		state.value = {}
	}
}

function refObjToValue(obj: any) {
	const newObj: typeof obj = {}
	Object.keys(obj).forEach(el => {
		newObj[el] = unref(obj[el])
	})
	return newObj
}

function getFetchOptions(fetchOptions: Parameters<typeof $fetch>[1], parseBody = true) {
	const opts = { ...fetchOptions }
	if (parseBody === true && 'body' in opts) {
		if (isRef(opts.body)) opts.body = unref<any>(opts.body)
		else if (opts.body?.constructor === Object) opts.body = refObjToValue(opts.body)
	}
	if ('query' in opts) {
		if (isRef(opts.query)) opts.query = unref<any>(opts.query)
		else if (opts.query?.constructor === Object) opts.query = refObjToValue(opts.query)
	}
	if ('headers' in opts) {
		if (isRef(opts.headers)) opts.headers = unref<any>(opts.headers)
		else if (opts.headers?.constructor === Object) opts.headers = refObjToValue(opts.headers)
	}
	return opts
}

type cAsyncDataOptionsType = {
	key?: MaybeRefOrGetter<string>
	getCachedData?: (key: string) => Promise<any>
	transform?: (data: any) => any
	server?: boolean
	lazy?: boolean
	immediate?: boolean
	maxAge?: number
	watch?: MaybeRefOrGetter<unknown>[]
	default?: () => any
	getFromCache?: boolean
	postAction?: (key: string, data: any) => void
}
type cLazyAsyncDataOptionsType = Omit<cAsyncDataOptionsType, 'lazy'>
type cFetchOptionsType = cAsyncDataOptionsType & Parameters<typeof $fetch>[1]
type cLazyFetchOptionsType = Omit<cFetchOptionsType, 'lazy'>

async function cAsyncData<DataT>(handler: Function, options: cAsyncDataOptionsType = {}) {
	try {
		//validate handler and options
		if (typeof handler !== 'function') throw createError('[handler] must be function')
		if (options?.constructor !== Object) throw createError(`[options] must be object`)
		if ('key' in options) {
			// @ts-ignore
			const k = getKey(options.key)
			if (k === false) throw createError('[options.key] must be not empty string OR reactive value or getter that returns not empty string')
		}
		if ('getCachedData' in options && typeof options.getCachedData !== 'function') throw createError('[options.getCachedData] must be function')
		if ('transform' in options && typeof options.transform !== 'function') throw createError('[options.transform] must be function')
		if ('default' in options && typeof options.default !== 'function') throw createError('[options.default] must be function')
		if ('postAction' in options && typeof options.postAction !== 'function') throw createError('[options.postAction] must be function')
		if ('server' in options && typeof options.server !== 'boolean') throw createError('[options.server] must be boolean')
		if ('lazy' in options && typeof options.lazy !== 'boolean') throw createError('[options.lazy] must be boolean')
		if ('immediate' in options && typeof options.immediate !== 'boolean') throw createError('[options.immediate] must be boolean')
		if ('getFromCache' in options && typeof options.getFromCache !== 'boolean') throw createError('[options.getFromCache] must be boolean')
		if ('maxAge' in options && typeof options.maxAge !== 'number') throw createError('[options.maxAge] must be number (seconds).')
		if ('getFromCache' in options && 'maxAge' in options) throw createError("use either [options.getFromCache] or [options.maxAge]. Don't use both.")
		if ('watch' in options) {
			if (Array.isArray(options.watch) === false) throw createError('[options.watch] must be Array of reactive values or getters')
			if (options.watch.find(el => isRefOrGetter(el) === false)) throw createError('Elements of [options.watch] must be reactive values or getters.')
		}

		// @ts-ignore
		const keyArr: any[] | (() => any[]) = handler?.keyArr ? handler.keyArr : [handler]
		if (options.getFromCache === true) {
			options.maxAge = Infinity
		}
		delete options.getFromCache

		// define refs
		const data: Ref<DataT | null> = ref(null)
		const pending: Ref<boolean> = ref(true)
		const error: Ref<ReturnType<typeof createError> | null> = ref(null)
		const refresh = () => mainHandler(handler, options, keyArr, data, pending, error, true)
		const execute = () => mainHandler(handler, options, keyArr, data, pending, error)

		if (options.default) data.value = options.default()
		if (options.watch) watch([...options.watch], () => mainHandler(handler, options, keyArr, data, pending, error))

		if (import.meta.server && options.server === false) return { data, pending, error, execute, refresh }
		if (options.immediate === false) return { data, pending, error, execute, refresh }

		if (options.lazy === true && import.meta.client) mainHandler(handler, options, keyArr, data, pending, error)
		else await mainHandler(handler, options, keyArr, data, pending, error)
		return { data, pending, error, execute, refresh }
	} catch (e: any) {
		throw showError(e)
	}
}

async function mainHandler(handler: Function, options: Omit<cAsyncDataOptionsType, 'getFromCache'>, keyArr: any[] | (() => any[]), data: Ref<unknown>, pending: Ref<boolean>, error: Ref<ReturnType<typeof createError> | null>, forceUpdate: boolean = false) {
	try {
		const key = getKey(options.key, keyArr)
		if (key === false) throw createError('[options.key] must be not empty string OR reactive value or getter that returns not empty string')
		error.value = null
		pending.value = true

		const { payload, isHydrating } = useNuxtApp()
		if (import.meta.client && !isHydrating) await nextTick()
		if (!payload._errors) payload._errors = {}
		if (!payload.data) payload.data = {}

		if (options.getCachedData && forceUpdate === false) {
			try {
				const got = await options.getCachedData(key)
				if (getKey(options.key, keyArr) !== key) return
				if (got !== undefined && got !== null) {
					data.value = got
					pending.value = false
					return
				}
			} catch (e: any) {
				const err = createError(e)
				error.value = err
				// pending.value = false
				if (import.meta.server) payload._errors[key] = err
				return
			}
		}

		if (payload._errors[key] !== null && payload._errors[key] !== undefined) {
			error.value = payload._errors[key]
			// pending.value = false
			if (import.meta.client) delete payload._errors[key]
			return
		}

		if (payload.data[key] !== undefined && payload.data[key] !== null) {
			data.value = payload.data[key]
			if (isHydrating === true) {
				if (options.postAction) options.postAction(key, data.value)
				timeHistory.set(key)
				pending.value = false
				return
			}
			if (import.meta.client && forceUpdate === false && 'maxAge' in options) {
				if (options.maxAge === Infinity) {
					pending.value = false
					return
				}
				if (options.maxAge! * 1000 + (timeHistory.get(key) || 0) >= Date.now()) {
					pending.value = false
					return
				}
			}
		}

		try {
			const got = await handler()
			payload.data[key] = options.transform ? options.transform(got) : got
			timeHistory.set(key)
			if (options.postAction) options.postAction(key, got)
			if (getKey(options.key, keyArr) !== key) return
			data.value = got
			pending.value = false
		} catch (e: any) {
			if (getKey(options.key, keyArr) !== key) return
			const err = createError(e)
			error.value = err
			// pending.value = false
			if (import.meta.server) payload._errors[key] = err
		}
	} catch (e: any) {
		throw showError(e)
	}
}

function cLazyAsyncData<DataT>(handler: Function, options: cLazyAsyncDataOptionsType = {}) {
	// @ts-ignore
	options.lazy = true
	return cAsyncData<DataT>(handler, options)
}

function cFetch<DataT>(url: MaybeRefOrGetter<Parameters<typeof $fetch>[0]>, options: cFetchOptionsType = {}) {
	try {
		const fetch = import.meta.server ? useRequestFetch() : $fetch

		if (options?.constructor !== Object) throw createError(`[options] must be object`)
		if (getUrl(url) === false) throw createError('[url] must be a valid url. It can be string or reactive value or getter')
		const onlyAsync: string[] = ['key', 'getCachedData', 'transform', 'server', 'lazy', 'immediate', 'maxAge', 'watch', 'default', 'getFromCache', 'postAction']

		const asyncOptions: cAsyncDataOptionsType = {}
		const fetchOptions: Parameters<typeof $fetch>[1] = {}

		for (const k in options) {
			// @ts-ignore
			if (onlyAsync.includes(k)) asyncOptions[k] = options[k]
			// @ts-ignore
			else fetchOptions[k] = options[k]
		}

		const asyncFetcher = async () => {
			const opts = getFetchOptions(fetchOptions)
			const u = getUrl(url)
			if (u === false) throw createError('[url] must be a valid url. It can be string or reactive value or getter')
			return fetch(u, opts)
		}

		asyncFetcher.keyArr = () => {
			const opts = getFetchOptions(fetchOptions, false)
			const u = getUrl(url)
			if (u === false) throw createError('[url] must be a valid url. It can be string or reactive value or getter')
			return [u, opts.query, opts.method || 'GET']
		}

		return cAsyncData<DataT>(asyncFetcher, asyncOptions)
	} catch (e: any) {
		throw showError(e)
	}
}

function cLazyFetch<DataT>(url: MaybeRefOrGetter<Parameters<typeof $fetch>[0]>, options: cLazyFetchOptionsType = {}) {
	// @ts-ignore
	options.lazy = true
	return cFetch<DataT>(url, options)
}

function cClearData(key: MaybeRefOrGetter<string>) {
	// @ts-ignore
	const k = getKey(key)
	if (k === false) throw createError('[key] must be not empty string OR reactive value or getter that returns not empty string')

	const { payload } = useNuxtApp()
	if (!payload._errors) payload._errors = {}
	if (!payload.data) payload.data = {}

	delete payload.data[k]
	delete payload._errors[k]
}

function cClearAllData() {
	const { payload } = useNuxtApp()
	payload._errors = {}
	payload.data = {}
}

export { cAsyncData, cLazyAsyncData, cFetch, cLazyFetch, cClearData, cClearAllData }
