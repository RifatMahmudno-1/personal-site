import { JSONSchemaType } from 'ajv'
import Ajv from 'ajv'
const ajv = new Ajv()

ajv.addKeyword({
	keyword: 'ValidateByFunction',
	validate: (schema: object, data: any) => {
		if (typeof schema !== 'function') return false
		if (!schema(data)) return false
		return true
	},
	error: {
		message: 'ValidateByFunction error'
	}
})

function ajvValidate(schema: object, data: any): { error: true; message: string } | { error: false } {
	if (!schema) return { error: true, message: 'No schema proviled' }
	let validate = ajv.compile(schema)
	let valid = validate(data)

	if (validate.errors) {
		let path = validate.errors[0].instancePath
		path = path ? `'${path.replace('/', '')}' ` : ''
		return { error: true, message: path + validate.errors[0].message }
	} else if (valid === true) return { error: false }
	else return { error: true, message: 'Some undefined errors have occured' }
}

export { ajvValidate }
export type AJVSchema<T> = JSONSchemaType<T>
