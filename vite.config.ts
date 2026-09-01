import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite-plus';
import { createChronosAlias } from './scripts/resolve-chronos-aliases.ts';

const chronosAlias = createChronosAlias();
const appVersion = JSON.parse(
	readFileSync(
		resolve(fileURLToPath(new URL('.', import.meta.url)), 'apps/web/package.json'),
		'utf8'
	)
).version as string;

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
		__SVELTEKIT_APP_VERSION__: JSON.stringify(appVersion),
		__SVELTEKIT_DEV__: JSON.stringify(false),
		__SVELTEKIT_PAYLOAD_URL__: JSON.stringify(''),
		__SVELTEKIT_EXPERIMENTAL_EXPLICIT_ENVIRONMENT_VARIABLES__: JSON.stringify(false)
	},
	staged: {
		// Plain .js is excluded: the only tracked .js files are the generated
		// official-plugin bundles, which must never be reformatted after the
		// build computed their manifest sha256 (see scripts/verify-official-plugins.ts).
		'*.{ts,tsx,vue,svelte,json,css,html}': 'vp check --fix'
	},
	run: {
		tasks: {
			// dev/build stay in package.json; apps/web/vercel.json configures Vercel deploy.
			preview: {
				command: 'vp -C apps/web preview',
				cache: false
			},
			'build:cqut': {
				command: 'CHRONOS_PROFILE=chronos-cqut vp -C apps/web build',
				env: ['CHRONOS_PROFILE']
			},
			'build:cqut-offline': {
				command: 'CHRONOS_PROFILE=chronos-cqut-offline vp -C apps/web build',
				env: ['CHRONOS_PROFILE']
			},
			'build:default': {
				command: 'CHRONOS_PROFILE=chronos-default vp -C apps/web build',
				env: ['CHRONOS_PROFILE']
			},
			'build:pages': {
				command:
					'node --experimental-strip-types apps/web/scripts/emit-profile-artifacts.ts && (cd apps/web && svelte-kit sync) && vp -C apps/web build && cp apps/web/build/404.html apps/web/build/index.html',
				env: ['CHRONOS_DEPLOY_TARGET', 'CHRONOS_PROFILE']
			},
			check: '(cd apps/web && svelte-kit sync) && vp check',
			'check:watch': {
				command:
					'(cd apps/web && svelte-kit sync) && svelte-check --tsconfig ./apps/web/tsconfig.json --watch',
				cache: false
			},
			lint: 'vp fmt --check . && vp lint .',
			format: 'vp fmt .',
			test: {
				command: 'vp test -- --run',
				cwd: 'apps/web'
			},
			'theme:generate': 'node --experimental-strip-types scripts/generate-theme-tokens.ts',
			'icons:png': 'node --experimental-strip-types scripts/generate-icons.ts',
			'bench:share-link': {
				command: 'tsx scripts/share-link-compression-benchmark.ts',
				cache: false
			},
			'build:official-plugins': 'node --experimental-strip-types scripts/build-official-plugins.ts',
			'fetch:holiday-cn-fallback':
				'node --experimental-strip-types scripts/fetch-holiday-cn-fallback.ts',
			'verify:official-plugins':
				'node --experimental-strip-types scripts/verify-official-plugins.ts'
		}
	},
	lint: {
		ignorePatterns: [
			'apps/web/static/official-plugins/bundles/**',
			'**/*.bundle.js',
			'dist/**',
			'.svelte-kit/'
		],
		options: {
			typeAware: true,
			typeCheck: true
		}
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
			'**/node_modules/',
			'/drizzle/'
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
		exclude: [
			'apps/web/src/**/*.svelte.{test,spec}.{js,ts}',
			'**/node_modules/**',
			'packages/**/node_modules/**'
		],
		server: {
			deps: {
				inline: ['bits-ui']
			}
		}
	}
});
