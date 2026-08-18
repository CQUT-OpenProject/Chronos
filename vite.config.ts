import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { functionsMixins } from 'vite-plugin-functions-mixins';
import { defineConfig, lazyPlugins, loadEnv } from 'vite-plus';
import adapter from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { writeGeneratedThemeCss } from './src/lib/m3/theme';

function chronosThemeTokensPlugin() {
	return {
		name: 'chronos-theme-tokens',
		configureServer() {
			writeGeneratedThemeCss();
		},
		buildStart() {
			writeGeneratedThemeCss();
		}
	};
}

// GitHub Pages 静态版：无服务端，用 adapter-static 构建，屏蔽知行理工在线导入。
// vp build/dev 不支持自定义 --config，因此两套构建复用同一份 vite.config.ts，按环境变量分支。
const isPagesBuild = process.env.CHRONOS_DEPLOY_TARGET === 'pages';
const pagesBase = '/Chronos';
const basePath = isPagesBuild ? pagesBase : '';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), 'PUBLIC_');

	return {
		define: {
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
			__ONLINE_IMPORT_ENABLED__: JSON.stringify(!isPagesBuild),
			__ANALYTICS_ENABLED__: JSON.stringify(
				mode === 'test' || Boolean(env.PUBLIC_POSTHOG_KEY?.trim())
			)
		},
		staged: {
			'*': 'vp check --fix'
		},
		lint: {
			plugins: ['oxc', 'typescript', 'unicorn', 'react'],
			jsPlugins: [
				'eslint-plugin-svelte',
				{
					name: 'vite-plus',
					specifier: 'vite-plus/oxlint-plugin'
				}
			],
			categories: {
				correctness: 'warn'
			},
			env: {
				builtin: true,
				browser: true,
				node: true
			},
			ignorePatterns: [
				'**/node_modules',
				'**/.output',
				'**/.vercel',
				'**/.netlify',
				'**/.wrangler',
				'.svelte-kit',
				'build',
				'**/.DS_Store',
				'**/Thumbs.db',
				'**/.env',
				'**/.env.*',
				'!**/.env.example',
				'!**/.env.test',
				'**/vite.config.js.timestamp-*',
				'**/vite.config.ts.timestamp-*',
				'src/lib/paraglide',
				'project.inlang/cache/',
				'**/*.db',
				'!**/.vscode/',
				'!.vscode/settings.json',
				'!.vscode/extensions.json'
			],
			rules: {
				'constructor-super': 'error',
				'for-direction': 'error',
				'getter-return': 'error',
				'no-async-promise-executor': 'error',
				'no-case-declarations': 'error',
				'no-class-assign': 'error',
				'no-compare-neg-zero': 'error',
				'no-cond-assign': 'error',
				'no-const-assign': 'error',
				'no-constant-binary-expression': 'error',
				'no-constant-condition': 'error',
				'no-control-regex': 'error',
				'no-debugger': 'error',
				'no-delete-var': 'error',
				'no-dupe-class-members': 'error',
				'no-dupe-else-if': 'error',
				'no-dupe-keys': 'error',
				'no-duplicate-case': 'error',
				'no-empty': 'error',
				'no-empty-character-class': 'error',
				'no-empty-pattern': 'error',
				'no-empty-static-block': 'error',
				'no-ex-assign': 'error',
				'no-extra-boolean-cast': 'error',
				'no-fallthrough': 'error',
				'no-func-assign': 'error',
				'no-global-assign': 'error',
				'no-import-assign': 'error',
				'no-invalid-regexp': 'error',
				'no-irregular-whitespace': 'error',
				'no-loss-of-precision': 'error',
				'no-misleading-character-class': 'error',
				'no-new-native-nonconstructor': 'error',
				'no-nonoctal-decimal-escape': 'error',
				'no-obj-calls': 'error',
				'no-prototype-builtins': 'error',
				'no-redeclare': 'error',
				'no-regex-spaces': 'error',
				'no-self-assign': 'error',
				'no-setter-return': 'error',
				'no-shadow-restricted-names': 'error',
				'no-sparse-arrays': 'error',
				'no-this-before-super': 'error',
				'no-unassigned-vars': 'error',
				'no-undef': 'error',
				'no-unexpected-multiline': 'error',
				'no-unreachable': 'error',
				'no-unsafe-finally': 'error',
				'no-unsafe-negation': 'error',
				'no-unsafe-optional-chaining': 'error',
				'no-unused-labels': 'error',
				'no-unused-private-class-members': 'error',
				'no-unused-vars': 'error',
				'no-useless-assignment': 'error',
				'no-useless-backreference': 'error',
				'no-useless-catch': 'error',
				'no-useless-escape': 'error',
				'no-with': 'error',
				'preserve-caught-error': 'error',
				'require-yield': 'error',
				'use-isnan': 'error',
				'valid-typeof': 'error',
				'no-array-constructor': 'error',
				'no-unused-expressions': 'error',
				'svelte/comment-directive': 'error',
				'svelte/infinite-reactive-loop': 'error',
				'svelte/no-at-debug-tags': 'warn',
				'svelte/no-at-html-tags': 'error',
				'svelte/no-conflicting-module-names': 'error',
				'svelte/no-dom-manipulating': 'error',
				'svelte/no-dupe-else-if-blocks': 'error',
				'svelte/no-dupe-on-directives': 'error',
				'svelte/no-dupe-style-properties': 'error',
				'svelte/no-dupe-use-directives': 'error',
				'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
				'svelte/no-immutable-reactive-statements': 'error',
				'svelte/no-inner-declarations': 'error',
				'svelte/no-inspect': 'warn',
				'svelte/no-navigation-without-resolve': 'error',
				'svelte/no-not-function-handler': 'error',
				'svelte/no-object-in-text-mustaches': 'error',
				'svelte/no-raw-special-elements': 'error',
				'svelte/no-reactive-functions': 'error',
				'svelte/no-reactive-literals': 'error',
				'svelte/no-reactive-reassign': 'error',
				'svelte/no-shorthand-style-property-overrides': 'error',
				'svelte/no-store-async': 'error',
				'svelte/no-svelte-internal': 'error',
				'svelte/no-unknown-style-directive-property': 'error',
				'svelte/no-unnecessary-state-wrap': 'error',
				'svelte/no-unused-props': 'error',
				'svelte/no-unused-svelte-ignore': 'error',
				'svelte/no-useless-children-snippet': 'error',
				'svelte/no-useless-mustaches': 'error',
				'svelte/prefer-svelte-reactivity': 'error',
				'svelte/prefer-writable-derived': 'error',
				'svelte/require-each-key': 'error',
				'svelte/require-event-dispatcher-types': 'error',
				'svelte/require-store-reactive-access': 'error',
				'svelte/system': 'error',
				'svelte/valid-each-key': 'error',
				'svelte/valid-prop-names-in-kit-pages': 'error',
				'typescript/ban-ts-comment': 'error',
				'typescript/no-duplicate-enum-values': 'error',
				'typescript/no-empty-object-type': 'error',
				'typescript/no-explicit-any': 'error',
				'typescript/no-extra-non-null-assertion': 'error',
				'typescript/no-misused-new': 'error',
				'typescript/no-namespace': 'error',
				'typescript/no-non-null-asserted-optional-chain': 'error',
				'typescript/no-require-imports': 'error',
				'typescript/no-this-alias': 'error',
				'typescript/no-unnecessary-type-constraint': 'error',
				'typescript/no-unsafe-declaration-merging': 'error',
				'typescript/no-unsafe-function-type': 'error',
				'typescript/no-wrapper-object-types': 'error',
				'typescript/prefer-as-const': 'error',
				'typescript/prefer-namespace-keyword': 'error',
				'typescript/triple-slash-reference': 'error',
				'vite-plus/prefer-vite-plus-imports': 'error'
			},
			overrides: [
				{
					files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
					rules: {
						'constructor-super': 'off',
						'getter-return': 'off',
						'no-class-assign': 'off',
						'no-const-assign': 'off',
						'no-dupe-class-members': 'off',
						'no-dupe-keys': 'off',
						'no-func-assign': 'off',
						'no-import-assign': 'off',
						'no-new-native-nonconstructor': 'off',
						'no-obj-calls': 'off',
						'no-redeclare': 'off',
						'no-setter-return': 'off',
						'no-this-before-super': 'off',
						'no-undef': 'off',
						'no-unreachable': 'off',
						'no-unsafe-negation': 'off',
						'no-var': 'error',
						'no-with': 'off',
						'prefer-const': 'error',
						'prefer-rest-params': 'error',
						'prefer-spread': 'error'
					}
				},
				{
					files: ['*.svelte', '**/*.svelte'],
					rules: {
						'no-inner-declarations': 'off',
						'no-self-assign': 'off'
					},
					jsPlugins: ['eslint-plugin-svelte'],
					globals: {
						$state: 'readonly',
						$derived: 'readonly',
						$effect: 'readonly',
						$props: 'readonly',
						$bindable: 'readonly',
						$inspect: 'readonly',
						$host: 'readonly'
					}
				}
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
				stylesheet: './src/routes/layout.css'
			},
			svelte: {},
			ignorePatterns: [
				'package-lock.json',
				'pnpm-lock.yaml',
				'yarn.lock',
				'bun.lock',
				'bun.lockb',
				'/static/'
			]
		},
		plugins: lazyPlugins(() => [
			chronosThemeTokensPlugin(),
			functionsMixins(),
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				paths: {
					base: basePath
				},
				// GitHub Pages 没有服务端，fallback 用 404.html 才能让 GitHub Pages 的默认
				// 404 兜底把深层链接导航请求交回 SvelteKit 客户端路由处理（经典 SPA on Pages 方案）。
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
						// `focus-existing` refocuses the installing browser tab after install instead of opening standalone.
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
					// SSR（Vercel adapter）无预渲染 "/"，禁用 navigateFallback 避免自动注入的
					// NavigationRoute 抢在下方自定义 NetworkFirst 规则之前拦截所有导航请求
					navigateFallback: null,
					runtimeCaching: [
						{
							urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
							handler: 'NetworkFirst',
							options: {
								cacheName: 'pages-cache',
								expiration: { maxEntries: 32, maxAgeSeconds: 2_592_000 },
								networkTimeoutSeconds: 0.3
							}
						},
						{
							urlPattern: /^https:\/\/api\.github\.com\/.*/i,
							handler: 'NetworkFirst',
							options: {
								cacheName: 'github-api',
								expiration: { maxEntries: 32, maxAgeSeconds: 86_400 }
							}
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
			include: ['src/**/*.{test,spec}.{js,ts}'],
			exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
		}
	};
});
