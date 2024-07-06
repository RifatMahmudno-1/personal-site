import typography from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'

export default {
	content: ['**/*.vue'],
	theme: {
		extend: {}
	},
	plugins: [typography]
} satisfies Config
