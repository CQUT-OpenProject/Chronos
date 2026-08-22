import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite-plus';
import { createChronosAlias } from './scripts/resolve-chronos-aliases.ts';

const chronosAlias = createChronosAlias();

export default defineConfig({
	defaultPackage: './apps/web',
	resolve: {
		alias: [
			{ find: '$lib', replacement: fileURLToPath(new URL('./apps/web/src/lib', import.meta.url)) },
			{
				find: '$app/environment',
				replacement: fileURLToPath(
					new URL(
						'./node_modules/@sveltejs/kit/src/runtime/app/environment/index.js',
						import.meta.url
					)
				)
			},
			{
				find: '$app/paths',
				replacement: fileURLToPath(
					new URL('./apps/web/src/lib/test-mocks/app-paths.ts', import.meta.url)
				)
			},
			{
				find: 'virtual:pwa-register',
				replacement: fileURLToPath(
					new URL('./apps/web/src/lib/test-mocks/pwa-register.ts', import.meta.url)
				)
			},
			{
				find: '$app/navigation',
				replacement: fileURLToPath(
					new URL('./node_modules/@sveltejs/kit/src/runtime/app/navigation.js', import.meta.url)
				)
			},
			{
				find: '$app/stores',
				replacement: fileURLToPath(
					new URL('./node_modules/@sveltejs/kit/src/runtime/app/stores.js', import.meta.url)
				)
			},
			{
				find: '$app/state',
				replacement: fileURLToPath(
					new URL('./node_modules/@sveltejs/kit/src/runtime/app/state/index.js', import.meta.url)
				)
			},
			{
				find: '$env/dynamic/public',
				replacement: fileURLToPath(
					new URL('./apps/web/src/lib/config/env-dynamic-public-mock.ts', import.meta.url)
				)
			},
			{
				find: '$env/static/public',
				replacement: fileURLToPath(
					new URL('./apps/web/src/lib/config/env-dynamic-public-mock.ts', import.meta.url)
				)
			},
			...chronosAlias
		],
		dedupe: ['svelte']
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
