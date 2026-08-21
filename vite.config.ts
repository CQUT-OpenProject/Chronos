import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite-plus';

export default defineConfig({
	defaultPackage: './apps/web',
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./apps/web/src/lib', import.meta.url)),
			'$app/environment': fileURLToPath(
				new URL(
					'./node_modules/@sveltejs/kit/src/runtime/app/environment/index.js',
					import.meta.url
				)
			),
			'$app/paths': fileURLToPath(
				new URL('./apps/web/src/lib/test-mocks/app-paths.ts', import.meta.url)
			),
			'virtual:pwa-register': fileURLToPath(
				new URL('./apps/web/src/lib/test-mocks/pwa-register.ts', import.meta.url)
			),
			'$app/navigation': fileURLToPath(
				new URL('./node_modules/@sveltejs/kit/src/runtime/app/navigation.js', import.meta.url)
			),
			'$app/stores': fileURLToPath(
				new URL('./node_modules/@sveltejs/kit/src/runtime/app/stores.js', import.meta.url)
			),
			'$app/state': fileURLToPath(
				new URL('./node_modules/@sveltejs/kit/src/runtime/app/state/index.js', import.meta.url)
			),
			'$env/dynamic/public': fileURLToPath(
				new URL('./apps/web/src/lib/config/env-dynamic-public-mock.ts', import.meta.url)
			),
			'$env/static/public': fileURLToPath(
				new URL('./apps/web/src/lib/config/env-dynamic-public-mock.ts', import.meta.url)
			),
			'@chronos/core': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
			'@chronos/ui-kit': fileURLToPath(new URL('./packages/ui-kit/src/index.ts', import.meta.url)),
			'@chronos/plugin-source-cqut/server': fileURLToPath(
				new URL('./packages/plugins/source-cqut/server/index.ts', import.meta.url)
			),
			'@chronos/plugin-source-cqut/week-merge': fileURLToPath(
				new URL('./packages/plugins/source-cqut/src/week-merge.ts', import.meta.url)
			),
			'@chronos/plugin-codec-share/share-link': fileURLToPath(
				new URL('./packages/plugins/codec-share/src/share-link/index.ts', import.meta.url)
			),
			'@chronos/plugin-codec-share': fileURLToPath(
				new URL('./packages/plugins/codec-share/src/index.ts', import.meta.url)
			),
			'@chronos/plugin-source-cqut': fileURLToPath(
				new URL('./packages/plugins/source-cqut/src/index.ts', import.meta.url)
			),
			'@chronos/plugin-theme-yumemita': fileURLToPath(
				new URL('./packages/plugins/theme-yumemita/src/index.ts', import.meta.url)
			),
			'@chronos/plugin-wallpaper/wallpaper-theme': fileURLToPath(
				new URL('./packages/plugins/wallpaper/src/wallpaper-theme.ts', import.meta.url)
			),
			'@chronos/plugin-wallpaper': fileURLToPath(
				new URL('./packages/plugins/wallpaper/src/index.ts', import.meta.url)
			)
		}
	},
	define: {
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		__CHRONOS_PROFILE__: JSON.stringify('chronos-cqut'),
		__ANALYTICS_ENABLED__: JSON.stringify(true),
		__SVELTEKIT_APP_VERSION__: JSON.stringify('0.3.0'),
		__SVELTEKIT_DEV__: JSON.stringify(false),
		__SVELTEKIT_PAYLOAD_URL__: JSON.stringify(''),
		__SVELTEKIT_EXPERIMENTAL_EXPLICIT_ENVIRONMENT_VARIABLES__: JSON.stringify(false)
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
			stylesheet: './apps/web/src/routes/layout.css'
		},
		svelte: {},
		ignorePatterns: [
			'package-lock.json',
			'pnpm-lock.yaml',
			'yarn.lock',
			'bun.lock',
			'bun.lockb',
			'**/static/',
			'**/.svelte-kit/',
			'**/node_modules/'
		]
	},
	plugins: [
		svelte({
			compilerOptions: {
				runes: true
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['apps/web/src/**/*.{test,spec}.{js,ts}', 'packages/**/*.{test,spec}.{js,ts}'],
		exclude: ['apps/web/src/**/*.svelte.{test,spec}.{js,ts}', '**/node_modules/**']
	}
});
