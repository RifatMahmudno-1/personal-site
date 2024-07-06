declare module 'h3' {
	interface H3EventContext {
		modifyH3?: {
			parsedBody: any
			parsedForm: any
			parsedBodyStat: boolean
			parsedFormStat: boolean
		}
	}
}

type EachFileType = {
	buffer: Buffer
	type?: string
	filename?: string
}

type ParsedForm = {
	fields?: { [key: string]: string | string[] }
	files?: { [key: string]: EachFileType | EachFileType[] }
}

type req = {
	method: import('h3').H3Event['method']
	path: import('h3').H3Event['path']
	getUrl(opts?: Parameters<typeof getRequestURL>[1]): ReturnType<typeof getRequestURL>
	getHeaders(): ReturnType<typeof getRequestHeaders>
	getHeader: (name: Parameters<typeof getRequestHeader>[1]) => ReturnType<typeof getRequestHeader>
	getCookies(): ReturnType<typeof parseCookies>
	getQuery<T>(): ReturnType<typeof getQuery<T>>
	getParams(): ReturnType<typeof getRouterParams>
	getIP(): string | undefined
	getCookie: (name: Parameters<typeof getCookie>[1]) => ReturnType<typeof getCookie>
	parseBody(): Promise<any>
	parseForm(): Promise<ParsedForm>
}

type res = {
	setCookie: (name: Parameters<typeof setCookie>[1], value: Parameters<typeof setCookie>[2], opt?: Parameters<typeof setCookie>[3]) => res
	deleteCookie: (name: Parameters<typeof setCookie>[1], opt?: Parameters<typeof setCookie>[3]) => res
	setStatus: (code: Parameters<typeof setResponseStatus>[1]) => res
	setHeader: (name: Parameters<typeof setResponseHeader>[1], val: Parameters<typeof setResponseHeader>[2]) => res
	setHeaders: (headers: Parameters<typeof setResponseHeaders>[1]) => res
	appendHeader: (name: Parameters<typeof appendHeader>[1], val: Parameters<typeof appendHeader>[2]) => res
	appendHeaders: (headers: Parameters<typeof appendHeaders>[1]) => res
	redirect: (path: Parameters<typeof sendRedirect>[1], code?: Parameters<typeof sendRedirect>[2]) => Promise<void>
	stream: (data: Parameters<typeof sendStream>[1]) => Promise<void>
	send: (data: Parameters<typeof send>[1], type?: Parameters<typeof send>[2]) => Promise<void>
	sendEmpty: () => Promise<void>
	sendStatus: (code: Parameters<typeof setResponseStatus>[1]) => Promise<void>
}

class ModifyH3 {
	res: res
	req: req

	#addModifyH3(app: import('h3').H3Event) {
		app.context.modifyH3 = {
			parsedBody: undefined,
			parsedForm: undefined,
			parsedBodyStat: false,
			parsedFormStat: false
		}
	}

	constructor(app: import('h3').H3Event) {
		if (!app.context.modifyH3) this.#addModifyH3(app)
		this.req = {
			method: app.method,
			path: app.path,
			getUrl: opts => getRequestURL(app, opts),
			getHeaders: () => getRequestHeaders(app),
			getHeader: name => getRequestHeader(app, name),
			getCookies: () => parseCookies(app),
			getQuery: () => getQuery(app),
			getParams: () => getRouterParams(app),
			getIP: () => getRequestHeader(app, 'x-forwarded-for'),
			getCookie: name => getCookie(app, name),
			parseBody: async () => {
				if (!app.context.modifyH3!.parsedBodyStat) {
					const body = await readBody(app)
					app.context.modifyH3!.parsedBody = body
					app.context.modifyH3!.parsedBodyStat = true
					return body
				}
				return app.context.modifyH3!.parsedBody
			},
			parseForm: async () => {
				if (!app.context.modifyH3!.parsedFormStat) {
					const data = await readMultipartFormData(app)

					const obj: ParsedForm = {}

					if (data) {
						for (const each of data) {
							if (!each.hasOwnProperty('type')) {
								if (!each.name) continue

								if (!obj.fields) obj.fields = {}
								const data = each.data.toString('utf-8')

								if (!each.name.endsWith('[]')) obj.fields[each.name] = data
								else {
									if (!Array.isArray(obj.fields[each.name])) obj.fields[each.name] = [data]
									else (obj.fields[each.name] as string[]).push(data)
								}
							} else {
								if (!each.name) continue

								if (!obj.files) obj.files = {}
								const data = {
									buffer: each.data,
									type: each.type,
									filename: each.filename
								}

								if (!each.name.endsWith('[]')) obj.files[each.name] = data
								else {
									if (!Array.isArray(obj.files[each.name])) obj.files[each.name] = [data]
									else (obj.files[each.name] as EachFileType[]).push(data)
								}
							}
						}
					}
					app.context.modifyH3!.parsedForm = obj
					app.context.modifyH3!.parsedFormStat = true
					return obj
				}
				return app.context.modifyH3!.parsedForm
			}
		}
		this.res = {
			setCookie: (name, value, opt) => {
				setCookie(app, name, value, opt)
				return this.res
			},
			deleteCookie: (name, opt) => {
				deleteCookie(app, name, opt)
				return this.res
			},
			setStatus: code => {
				setResponseStatus(app, code)
				return this.res
			},
			setHeader: (name, val) => {
				setResponseHeader(app, name, val)
				return this.res
			},
			setHeaders: headers => {
				setResponseHeaders(app, headers)
				return this.res
			},
			appendHeader: (name, val) => {
				appendResponseHeader(app, name, val)
				return this.res
			},
			appendHeaders: headers => {
				appendResponseHeaders(app, headers)
				return this.res
			},
			redirect: (path, code) => {
				return sendRedirect(app, path, code)
			},
			stream: data => {
				return sendStream(app, data)
			},
			send: (data, type) => {
				if (typeof data === 'object') {
					return send(app, JSON.stringify(data), type || 'application/json')
				}
				return send(app, data, type)
			},
			sendEmpty: () => send(app),
			sendStatus: code => {
				setResponseStatus(app, code)
				return send(app)
			}
		}
	}
}

export default (app: import('h3').H3Event) => new ModifyH3(app)
