import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

function createChronosAlias(): Array<{ find: string | RegExp; replacement: string }> {
	const root = fileURLToPath(new URL('../../', import.meta.url));
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
				if (!seen.has(pkg.name)) {
					seen.add(pkg.name);
					alias.push({
						find: new RegExp(`^${pkg.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
						replacement: resolve(pkgDir, pkg.main)
					});
				}
			}
		} catch {}
	}

	// 顶层 packages
	for (const entry of readdirSync(resolve(root, 'packages'))) {
		const pkgDir = resolve(root, `packages/${entry}`);
		if (existsSync(resolve(pkgDir, 'package.json'))) addPackage(pkgDir);
	}
	// plugins
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
			alias: createChronosAlias(),
			dedupe: ['svelte']
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
				// alias 统一由顶层 resolve.alias 提供，此处不再重复声明
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
