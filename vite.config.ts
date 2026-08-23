import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			strategies: 'generateSW',
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /\/static\/content\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'content-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 365
							}
						}
					},
					{
						urlPattern: /\/premium\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'premium-cache',
							networkTimeoutSeconds: 3,
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60
							}
						}
					}
				]
			},
			manifest: {
				name: 'GrantApp AI',
				short_name: 'GrantApp AI',
				description: 'Premier UTME exam prep for Nigerian secondary school students',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				theme_color: '#0a0a0f',
				background_color: '#0a0a0f',
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					}
				]
			}
		})
	]
});
