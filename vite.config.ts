import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		svelte(),
		SvelteKitPWA({
			strategies: 'generateSW',
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365
							}
						}
					},
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
				name: 'GrantApp',
				short_name: 'GrantApp',
				description: 'Premium exam preparation platform',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				theme_color: '#ffffff',
				background_color: '#ffffff',
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
