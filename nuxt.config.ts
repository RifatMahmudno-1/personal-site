import { join } from 'node:path'
import { tmpdir } from 'node:os'

export default defineNuxtConfig({
	devtools: { enabled: false },
	telemetry: false,
	compatibilityDate: '2024-07-03',
	css: ['~/assets/css/global.css'],
	router: { options: { sensitive: true } },
	vite: { build: { assetsInlineLimit: 0 } },
	modules: ['@vite-pwa/nuxt'],

	nitro: {
		storage: {
			kvdb: {
				driver: 'fs',
				base: join(tmpdir(), 'Personal Site', 'kvdb')
			}
		}
	},

	postcss: {
		plugins: {
			tailwindcss: {}
		}
	},

	app: {
		head: {
			title: 'Rifat Mahmud',
			htmlAttrs: { lang: 'en' },
			noscript: [{ children: 'Javascript is required to run this website' }],
			meta: [
				{ name: 'referrer', content: 'no-referrer' },
				{ name: 'author', content: 'Rifat Mahmud' },
				{ name: 'creator', content: 'Rifat Mahmud' },
				// for web app
				{ name: 'application-name', content: 'Rifat Mahmud' },
				{ name: 'mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-title', content: 'Rifat Mahmud' },
				{ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
				// open graph
				{ property: 'og:site:name', content: 'Rifat Mahmud' },
				{ property: 'og:type', content: 'website' }
			],
			link: [
				{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/icon-16.png' },
				{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/icon-32.png' },
				{ rel: 'icon', type: 'image/png', sizes: '48x48', href: '/icons/icon-48.png' },
				{ rel: 'icon', type: 'image/png', sizes: '64x64', href: '/icons/icon-64.png' },
				{ rel: 'icon', type: 'image/png', sizes: '180x180', href: '/icons/icon-180.png' },
				{ rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180', href: '/icons/icon-180.png' }
			],
			script: [{ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit' }]
		}
	},

	pwa: {
		registerType: 'autoUpdate',
		workbox: {
			globPatterns: ['**/*.{js,css,html,png,svg,jpg,ttf}'],
			navigateFallback: '/?csr=1',
			additionalManifestEntries: [{ url: '/?csr=1', revision: new Date().getTime().toString() }],
			cleanupOutdatedCaches: true
		},
		manifest: {
			name: 'Rifat Mahmud',
			short_name: 'Rifat',
			theme_color: '#22d3ee',
			background_color: '#ffffff',
			display: 'standalone',
			id: '/',
			icons: [
				{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
				{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
			]
		}
	}
})
