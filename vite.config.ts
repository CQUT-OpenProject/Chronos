import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite-plus';

function createChronosAlias(): Array<{ find: string | RegExp; replacement: string }> {
	const root = fileURLToPath(new URL('./', import.meta.url));
	const alias: Array<{ find: string | RegExp; replacement: string }> = [];
	const seen = new Set<string>();
	function addPackage(pkgDir: string) {
		const pkgJsonPath = resolve(pkgDir, 'package.json');
		if (!existsSync(pkgJsonPath)) return;
		try {
			const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
				name: string;
				exports?: Record<string, unknown>;
				main?: string;
			};
			const exportsMap = pkg.exports as
				| Record<string, { import?: string; default?: string } | string>
				| undefined;
			if (exportsMap) {
				for (const [key, value] of Object.entries(exportsMap)) {
					const importPath = key === '.' ? pkg.name : `${pkg.name}${key.slice(1)}`;
					if (seen.has(importPath)) continue;
					seen.add(importPath);
					const target =
						typeof value === 'string'
							? value
							: ((value as { import?: string; default?: string }).import ??
								(value as { import?: string; default?: string }).default);
					if (!target) continue;
					const replacement = fileURLToPath(new URL(target as string, `file://${pkgDir}/`));
					if (key === '.') {
						alias.push({
							find: new RegExp(`^${pkg.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
							replacement
						});
					} else {
						alias.push({ find: importPath, replacement });
					}
				}
			} else if (pkg.name && pkg.main) {
				const escaped = pkg.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				if (!seen.has(pkg.name)) {
					seen.add(pkg.name);
					alias.push({
						find: new RegExp(`^${escaped}$`),
						replacement: resolve(pkgDir, pkg.main)
					});
				}
			}
		} catch {}
	}
	for (const entry of readdirSync(resolve(root, 'packages'))) {
		const pkgDir = resolve(root, `packages/${entry}`);
		if (existsSync(resolve(pkgDir, 'package.json'))) addPackage(pkgDir);
	}
	const pluginsRoot = resolve(root, 'packages/plugins');
	if (existsSync(pluginsRoot)) {
		for (const entry of readdirSync(pluginsRoot)) {
			const pkgDir = resolve(pluginsRoot, entry);
			if (existsSync(resolve(pkgDir, 'package.json'))) addPackage(pkgDir);
		}
	}
	// 子路径优先于主包，确保 @chronos/plugin-source-cqut/server 不被主包前缀误匹配
	alias.sort((a, b) => {
		const aStr = a.find.toString();
		const bStr = b.find.toString();
		return bStr.length - aStr.length;
	});
	return alias;
}

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
