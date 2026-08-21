import { fileURLToPath } from 'node:url';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { functionsMixins } from 'vite-plugin-functions-mixins';
import { defineConfig, lazyPlugins, loadEnv } from 'vite-plus';
import adapter from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { writeGeneratedThemeCss } from './src/lib/m3/theme';
import { writeGeneratedVersionJson } from './src/lib/content/releases/version-generator';
import { chronosProfilePlugin } from './src/lib/profile-codegen/chronos-profile-plugin';

const webRoot = fileURLToPath(new URL('.', import.meta.url));

function chronosThemeTokensPlugin() {
	return {
		name: 'chronos-theme-tokens',
		configureServer() {
			writeGeneratedThemeCss();
			writeGeneratedVersionJson();
		},
		buildStart() {
			writeGeneratedThemeCss();
			writeGeneratedVersionJson();
		}
	};
}

const isPagesBuild = process.env.CHRONOS_DEPLOY_TARGET === 'pages';
const pagesBase = '/Chronos';
const basePath = isPagesBuild ? pagesBase : '';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), 'PUBLIC_');

	return {
		resolve: {
			alias: [
				{
					find: '@chronos/plugin-source-cqut/server',
					replacement: fileURLToPath(
						new URL('../../packages/plugins/source-cqut/server/index.ts', import.meta.url)
					)
				},
				{
					find: '@chronos/plugin-source-cqut/week-merge',
					replacement: fileURLToPath(
						new URL('../../packages/plugins/source-cqut/src/week-merge.ts', import.meta.url)
					)
				},
				{
					find: '@chronos/plugin-source-cqut/CqutOnlineImportTab',
					replacement: fileURLToPath(
						new URL(
							'../../packages/plugins/source-cqut/src/CqutOnlineImportTab.svelte',
							import.meta.url
						)
					)
				},
				{
					find: '@chronos/plugin-source-cqut/EduHtmlImportTab',
					replacement: fileURLToPath(
						new URL(
							'../../packages/plugins/source-cqut/src/EduHtmlImportTab.svelte',
							import.meta.url
						)
					)
				},
				{
					find: /^@chronos\/plugin-source-cqut$/,
					replacement: fileURLToPath(
						new URL('../../packages/plugins/source-cqut/src/index.ts', import.meta.url)
					)
				},
				{
					find: '@chronos/plugin-codec-share/share-link',
					replacement: fileURLToPath(
						new URL('../../packages/plugins/codec-share/src/share-link/index.ts', import.meta.url)
					)
				},
				{
					find: '@chronos/plugin-codec-share/ShareLinkImportTab',
					replacement: fileURLToPath(
						new URL(
							'../../packages/plugins/codec-share/src/ShareLinkImportTab.svelte',
							import.meta.url
						)
					)
				},
				{
					find: /^@chronos\/plugin-codec-share$/,
					replacement: fileURLToPath(
						new URL('../../packages/plugins/codec-share/src/index.ts', import.meta.url)
					)
				},
				{
					find: '@chronos/core',
					replacement: fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url))
				},
				{
					find: '@chronos/ui-kit',
					replacement: fileURLToPath(new URL('../../packages/ui-kit/src/index.ts', import.meta.url))
				},
				{
					find: '@chronos/plugin-theme-yumemita',
					replacement: fileURLToPath(
						new URL('../../packages/plugins/theme-yumemita/src/index.ts', import.meta.url)
					)
				},
				{
					find: '@chronos/plugin-wallpaper/wallpaper-theme',
					replacement: fileURLToPath(
						new URL('../../packages/plugins/wallpaper/src/wallpaper-theme.ts', import.meta.url)
					)
				},
				{
					find: '@chronos/plugin-wallpaper/WallpaperScreen',
					replacement: fileURLToPath(
						new URL('../../packages/plugins/wallpaper/src/WallpaperScreen.svelte', import.meta.url)
					)
				},
				{
					find: /^@chronos\/plugin-wallpaper$/,
					replacement: fileURLToPath(
						new URL('../../packages/plugins/wallpaper/src/index.ts', import.meta.url)
					)
				}
			]
		},
		define: {
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
			__CHRONOS_PROFILE__: JSON.stringify(
				process.env.CHRONOS_PROFILE ?? (isPagesBuild ? 'chronos-cqut-offline' : 'chronos-cqut')
			),
			__ANALYTICS_ENABLED__: JSON.stringify(
				mode === 'test' || Boolean(env.PUBLIC_POSTHOG_KEY?.trim())
			)
		},
		staged: {
			'*': 'vp check --fix'
		},
		fmt: {
			useTabs: true,
			singleQuote: true,
			trailingComma: 'none',
			printWidth: 100,
			sortPackageJson: false,
			sortTailwindcss: {
				stylesheet: './src/routes/layout.css'
			},
			svelte: {},
			ignorePatterns: [
				'package-lock.json',
				'pnpm-lock.yaml',
				'yarn.lock',
				'bun.lock',
				'bun.lockb',
				'static/',
				'.svelte-kit/'
			]
		},
		plugins: lazyPlugins(() => [
			chronosProfilePlugin(webRoot),
			chronosThemeTokensPlugin(),
			functionsMixins(),
			tailwindcss(),
			sveltekit({
				alias: {
					'@chronos/core': '../../packages/core/src/index.ts',
					'@chronos/ui-kit': '../../packages/ui-kit/src/index.ts',
					'@chronos/plugin-source-cqut/server':
						'../../packages/plugins/source-cqut/server/index.ts',
					'@chronos/plugin-source-cqut/week-merge':
						'../../packages/plugins/source-cqut/src/week-merge.ts',
					'@chronos/plugin-source-cqut/CqutOnlineImportTab':
						'../../packages/plugins/source-cqut/src/CqutOnlineImportTab.svelte',
					'@chronos/plugin-source-cqut/EduHtmlImportTab':
						'../../packages/plugins/source-cqut/src/EduHtmlImportTab.svelte',
					'@chronos/plugin-source-cqut': '../../packages/plugins/source-cqut/src/index.ts',
					'@chronos/plugin-codec-share/share-link':
						'../../packages/plugins/codec-share/src/share-link/index.ts',
					'@chronos/plugin-codec-share/ShareLinkImportTab':
						'../../packages/plugins/codec-share/src/ShareLinkImportTab.svelte',
					'@chronos/plugin-codec-share': '../../packages/plugins/codec-share/src/index.ts',
					'@chronos/plugin-theme-yumemita': '../../packages/plugins/theme-yumemita/src/index.ts',
					'@chronos/plugin-wallpaper/wallpaper-theme':
						'../../packages/plugins/wallpaper/src/wallpaper-theme.ts',
					'@chronos/plugin-wallpaper/WallpaperScreen':
						'../../packages/plugins/wallpaper/src/WallpaperScreen.svelte',
					'@chronos/plugin-wallpaper': '../../packages/plugins/wallpaper/src/index.ts'
				},
				compilerOptions: {
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				paths: {
					base: basePath
				},
				adapter: isPagesBuild
					? adapterStatic({ fallback: '404.html' })
					: adapter({ maxDuration: 60, regions: ['sin1'] })
			}),
			SvelteKitPWA({
				registerType: 'prompt',
				manifest: {
					name: 'Chronos',
					short_name: 'Chronos',
					description: '课程表应用',
					theme_color: '#0068B7',
					background_color: '#F7FAFC',
					display: 'standalone',
					start_url: `${basePath}/`,
					id: `${basePath}/`,
					scope: basePath ? `${basePath}/` : '/',
					launch_handler: {
						client_mode: 'auto'
					},
					icons: [
						{ src: `${basePath}/pwa-192.png`, sizes: '192x192', type: 'image/png' },
						{
							src: `${basePath}/pwa-512.png`,
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any maskable'
						}
					]
				},
				workbox: {
					globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
					navigateFallback: null,
					runtimeCaching: [
						{
							urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
							handler: 'CacheFirst',
							options: {
								cacheName: 'pages-cache',
								expiration: { maxEntries: 32, maxAgeSeconds: 2_592_000 }
							}
						},
						{
							urlPattern: /\/version\.json$/i,
							handler: 'NetworkOnly'
						},
						{
							urlPattern: /\/legal\/.*\.md$|\/licenses\/.*$/i,
							handler: 'CacheFirst',
							options: {
								cacheName: 'static-legal-licenses',
								expiration: { maxEntries: 16, maxAgeSeconds: 2_592_000 }
							}
						},
						{
							urlPattern: /\/manifest\.webmanifest$/i,
							handler: 'CacheFirst',
							options: {
								cacheName: 'pwa-manifest',
								expiration: { maxEntries: 1, maxAgeSeconds: 2_592_000 }
							}
						}
					]
				},
				devOptions: { enabled: false }
			}),
			paraglideVitePlugin({
				project: './project.inlang',
				outdir: './src/lib/paraglide',
				emitTsDeclarations: true
			})
		]),
		test: {
			expect: { requireAssertions: true },
			environment: 'node',
			include: ['src/**/*.{test,spec}.{js,ts}', '../../packages/**/*.{test,spec}.{js,ts}'],
			exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', '**/node_modules/**']
		}
	};
});
