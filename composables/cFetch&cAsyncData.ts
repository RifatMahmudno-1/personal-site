import { hash } from 'ohash'

type cAsyncDataOptions = {
	key?: string | Ref<string>
	getCachedData?: Function
	transform?: Function
	server?: boolean
	lazy?: boolean
	immediate?: boolean
	maxAge?: number
	watch?: MaybeRefOrGetter<unknown>[]
	default?: Function
	getFromCache?: boolean
}

export async function cFetch<DataT>(url: MaybeRefOrGetter<Parameters<typeof $fetch>[0]>, options: Parameters<typeof $fetch>[1] & cAsyncDataOptions = {}) {
	if (typeof toValue(url) !== 'string') throw new Error('[url] must be string or ref or getter')

	const fetch = import.meta.server ? useRequestFetch() : $fetch
	if (isRef(url) || typeof url === 'function') {
		if ('watch' in options) {
			if (Array.isArray(options.watch)) options.watch.push(url)
			else options.watch = [url]
		} else options.watch = [url]
	}

	const onlyAsync: string[] = ['key', 'getCachedData', 'transform', 'server', 'lazy', 'immediate', 'maxAge', 'watch', 'default', 'getFromCache']
	const asyncOptions: cAsyncDataOptions = {}
	const fetchOptions: Parameters<typeof $fetch>[1] = {}
	for (const key in options) {
		//@ts-ignore
		if (onlyAsync.includes(key)) asyncOptions[key] = options[key]
		//@ts-ignore
		else fetchOptions[key] = options[key]
	}

	function getFetchOptions() {
		const opts = { ...fetchOptions }
		if ('body' in opts) {
			if (isRef(opts.body)) opts.body = unref<any>(opts.body)
			//@ts-ignore
			else if (opts.body?.constructor === Object) opts.body = objectToValue(opts.body)
		}
		if ('query' in opts) {
			if (isRef(opts.query)) opts.query = unref<any>(opts.query)
			else if (opts.query?.constructor === Object) opts.query = objectToValue(opts.query)
		}
		if ('headers' in opts) {
			if (isRef(opts.headers)) opts.headers = unref<any>(opts.headers)
			else if (opts.headers?.constructor === Object) opts.headers = objectToValue(opts.headers)
		}
		return opts
	}

	function asyncFetcher() {
		const opts = getFetchOptions()
		return fetch(toValue(url), opts)
	}

	asyncFetcher.keyArr = () => {
		const opts = getFetchOptions()
		return [toValue(url), opts.query, opts.method || 'GET']
	}

	return cAsyncData<DataT>(asyncFetcher, asyncOptions)
}

export async function cAsyncData<DataT>(handler: Function, options: cAsyncDataOptions = {}) {
	// handler valid
	if (typeof handler !== 'function') throw Error('[handler] must be function')
	// options valid
	if (options?.constructor !== Object) throw Error(`[options] must be object`)

	if ('getCachedData' in options && typeof options.getCachedData !== 'function') throw Error('[options.getCachedData] must be function')
	if ('transform' in options && typeof options.transform !== 'function') throw Error('[options.transform] must be function')
	if ('default' in options && typeof options.default !== 'function') throw Error('[options.default] must be function')
	if ('server' in options && typeof options.server !== 'boolean') throw Error('[options.server] must be boolean')
	if ('lazy' in options && typeof options.lazy !== 'boolean') throw Error('[options.lazy] must be boolean')
	if ('immediate' in options && typeof options.immediate !== 'boolean') throw Error('[options.immediate] must be boolean')
	if ('getFromCache' in options && typeof options.getFromCache !== 'boolean') throw Error('[options.getFromCache] must be boolean')
	if ('maxAge' in options && typeof options.maxAge !== 'number') throw Error('[options.maxAge] must be number (in seconds) or Infinity to always use cached data')
	if ('getFromCache' in options && 'maxAge' in options) throw Error("use either [options.getFromCache] or [options.maxAge]. Don't use both.")
	if ('watch' in options && !Array.isArray(options.watch)) throw Error('[options.watch] must be Array')

	/**
	 * handler function will only have keyArr function when that handler is from cFetch
	 */
	//@ts-ignore
	const keyArr: any = !handler.keyArr ? [handler /*, options.watch*/] : handler.keyArr

	const data: Ref<DataT | null> = ref(null)
	const pending: Ref<boolean> = ref(true)
	const error: Ref<Error | null> = ref(null)
	const refresh = () => mainHandler(handler, options, keyArr, data, pending, error)
	const execute = async () => {
		if (import.meta.server || options.lazy !== true) await mainHandler(handler, options, keyArr, data, pending, error)
		else refresh()
	}

	if (options.getFromCache === true) options.maxAge = Infinity
	if (options.watch) {
		options.watch.forEach(el => {
			if (!isRef(el) && typeof el !== 'function') throw Error('Elements of [options.watch] must be reactive value.')
		})
		watch([...options.watch], () => mainHandler(handler, options, keyArr, data, pending, error))
	}
	if (options.default) data.value = options.default()

	if (options.immediate === false) return { data, pending, error, refresh, execute }
	if (options.server === false && import.meta.server) return { data, pending, error, refresh, execute }

	if (options.lazy === true && import.meta.client) {
		mainHandler(handler, options, keyArr, data, pending, error)
	} else await mainHandler(handler, options, keyArr, data, pending, error)

	return { data, pending, error, refresh, execute }
}

async function mainHandler(handler: Function, options: cAsyncDataOptions, keyArr: any[], data: Ref<unknown>, pending: Ref<boolean>, error: Ref<Error | null>) {
	const key = getKey(options.key, keyArr)

	pending.value = true
	error.value = null

	const { payload, isHydrating } = useNuxtApp()
	if (import.meta.client && !isHydrating) await nextTick()
	if (!payload._errors) payload._errors = {}
	if (!payload.data) payload.data = {}

	if (options.getCachedData) {
		try {
			const got = await options.getCachedData(key)
			if (!isSameKey(key, options.key, keyArr)) return
			if (got !== undefined && got !== null) {
				pending.value = false
				data.value = options.transform ? options.transform(got) : got
				return
			}
		} catch (e: any) {
			pending.value = false
			error.value = createError(e)
			return
		}
	}

	if (payload._errors[key] !== null && payload._errors[key] !== undefined) {
		error.value = payload._errors[key]
		pending.value = false
		if (import.meta.client) delete payload._errors[key]
		return
	}
	if (payload.data[key] !== undefined && payload.data[key] !== null) {
		data.value = options.transform ? options.transform(payload.data[key]) : payload.data[key]
		if (isHydrating) {
			saveTimeHistory(key, payload)
			pending.value = false
			return
		}
		if (import.meta.client && 'maxAge' in options) {
			if (options.maxAge === Infinity) {
				pending.value = false
				return
			}
			if (options.maxAge! * 1000 + getTimeHistory(key, payload) >= Date.now()) {
				pending.value = false
				return
			}
		}
	}

	try {
		let got = await handler()
		payload.data[key] = got
		saveTimeHistory(key, payload)
		if (!isSameKey(key, options.key, keyArr)) return
		pending.value = false
		data.value = options.transform ? options.transform(got) : got
		return
	} catch (e: any) {
		if (!isSameKey(key, options.key, keyArr)) return
		const err = createError(e)
		pending.value = false
		error.value = err
		if (import.meta.server) payload._errors[key] = err
		return
	}
}

export async function cLazyFetch<DataT>(url: MaybeRefOrGetter<Parameters<typeof $fetch>[0]>, options: Parameters<typeof $fetch>[1] & Omit<cAsyncDataOptions, 'lazy'> = {}) {
	if ('lazy' in options) delete options.lazy
	//@ts-ignore
	options.lazy = true
	return cFetch<DataT>(url, options)
}

export async function cLazyAsyncData<DataT>(handler: Function, options: Omit<cAsyncDataOptions, 'lazy'> = {}) {
	if ('lazy' in options) delete options.lazy
	//@ts-ignore
	options.lazy = true
	return cAsyncData<DataT>(handler, options)
}

function getKey(key: string | Ref<string> | undefined, data: any): string {
	if (typeof key === 'string') {
		if (key.length === 0) throw Error(`[options.key] can't be empty string.`)
		return key
	}

	if (isRef(key)) {
		key = unref(key)
		if (typeof key !== 'string') throw Error(`Reactive [options.key] must be string.`)
		if (key.length === 0) throw Error(`Reactive [options.key] can't be empty string.`)
		return key
	}

	if (typeof data === 'function') {
		const newArr = data()
		return hash(newArr)
	}

	return hash(data)
}

function objectToValue(obj: { [key: string | number]: any }) {
	const newObj: typeof obj = {}
	Object.keys(obj).forEach(el => {
		newObj[el] = unref(obj[el])
	})
	return newObj
}

function isSameKey(key: string, objKey: string | Ref<string> | undefined, data: any) {
	try {
		const k = getKey(objKey, data)
		if (k === key) return true
	} catch {
		return false
	}
}

function saveTimeHistory(key: string, payload: any) {
	if (import.meta.server) return
	if (!payload._dataTimeHistory_) payload._dataTimeHistory_ = {}
	payload._dataTimeHistory_[key] = Date.now()
}

function getTimeHistory(key: string, payload: any) {
	if (import.meta.server) return
	if (!payload._dataTimeHistory_) payload._dataTimeHistory_ = {}
	return payload._dataTimeHistory_[key]
}
