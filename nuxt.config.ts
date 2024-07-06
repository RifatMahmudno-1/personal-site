import { join } from 'node:path'
import { tmpdir } from 'node:os'

export default defineNuxtConfig({
	devtools: { enabled: true },
	telemetry: false,
	css: ['~/assets/css/global.css'],
	modules: ['@nuxtjs/tailwindcss'],
	router: { options: { sensitive: true } },
	vite: { build: { assetsInlineLimit: 0 } },

	nitro: {
		storage: {
			kvdb: {
				driver: 'fs',
				base: join(tmpdir(), 'Personal Site', 'kvdb')
			}
		}
	},

	app: {
		head: {
			title: 'Personal Site',
			htmlAttrs: { lang: 'en' },
			noscript: [{ children: 'Javascript is required to run this website' }],
			meta: [
				{ name: 'author', content: 'Rifat Mahmud' },
				{ name: 'creator', content: 'Rifat Mahmud' },
				{ property: 'og:type', content: 'website' }
			],
			link: [{ rel: 'icon', href: '/favicon.ico' }]
		}
	},

	compatibilityDate: '2024-07-03'
})
