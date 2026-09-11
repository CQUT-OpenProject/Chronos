import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { build, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import type { OfficialPluginDef } from '../../../../../scripts/official-plugins.config.ts';

function pluginAssetUrl(pluginId: string, fileName: string): string {
	return `/official-plugins/bundles/${pluginId}/${fileName}`;
}

function stripCssImportsFromBundle(): Plugin {
	return {
		name: 'chronos-strip-plugin-css-imports',
		generateBundle(_options, bundle) {
			for (const output of Object.values(bundle)) {
				if (output.type !== 'chunk') continue;
				output.code = output.code.replace(/import\s*['"][^'"]+\.css['"];?/g, '');
			}
		}
	};
}

export async function compileOfficialPluginEntry(
	plugin: OfficialPluginDef,
	root: string,
	createAliasRecord: (root?: string) => Record<string, string>,
	outDir: string,
	releaseVersion: string
): Promise<{ code: string | null; cssCode: string | null }> {
	if (!plugin.entry || !existsSync(plugin.entry)) {
		return { code: null, cssCode: null };
	}

	mkdirSync(outDir, { recursive: true });

	await build({
		configFile: false,
		logLevel: 'warn',
		root: resolve(root, 'apps/web'),
		plugins: [
			tailwindcss(),
			svelte({ compilerOptions: { runes: true } }),
			stripCssImportsFromBundle()
		],
		define: {
			__CHRONOS_PLUGIN_VERSION__: JSON.stringify(releaseVersion)
		},
		resolve: { alias: createAliasRecord(root) },
		build: {
			emptyOutDir: true,
			cssCodeSplit: false,
			lib: {
				entry: plugin.entry,
				formats: ['es'],
				fileName: () => `${plugin.id}.bundle.js`
			},
			outDir,
			rollupOptions: { output: { codeSplitting: false } }
		}
	});

	let code: string | null = null;
	const builtPath = resolve(outDir, `${plugin.id}.bundle.js`);
	if (existsSync(builtPath)) {
		code = readFileSync(builtPath, 'utf8');
	}

	let cssCode: string | null = null;
	const distFiles = existsSync(outDir) ? readdirSync(outDir) : [];
	const emittedCss = distFiles.find((f) => f.endsWith('.css'));
	if (emittedCss && existsSync(resolve(outDir, emittedCss))) {
		const raw = readFileSync(resolve(outDir, emittedCss), 'utf8');
		if (raw.trim().length > 0) cssCode = raw;
	}

	return { code, cssCode };
}

export interface PluginHmrPayload {
	id: string;
	type: 'theme' | 'tool';
	code: string | null;
	cssCode: string | null;
	colorsJson: string | null;
	iconThemeJson: string | null;
}

export interface ChronosPluginHmrOptions {
	monorepoRoot: string;
	plugins: OfficialPluginDef[];
	createAliasRecord: (root?: string) => Record<string, string>;
}

export async function buildSingleOfficialPlugin(
	plugin: OfficialPluginDef,
	root: string,
	createAliasRecord: (root?: string) => Record<string, string>,
	releaseVersion = '0.0.0-dev'
): Promise<PluginHmrPayload> {
	let code: string | null = null;
	let cssCode: string | null = null;
	let colorsJson: string | null = null;
	let iconThemeJson: string | null = null;

	const staticBundleDir = resolve(root, 'apps/web/static/official-plugins/bundles', plugin.id);
	mkdirSync(staticBundleDir, { recursive: true });

	if (plugin.colorsJson && existsSync(plugin.colorsJson)) {
		colorsJson = readFileSync(plugin.colorsJson, 'utf8');
		writeFileSync(resolve(staticBundleDir, 'colors.json'), colorsJson, 'utf8');
	}

	if (plugin.iconsJson && existsSync(plugin.iconsJson)) {
		iconThemeJson = readFileSync(plugin.iconsJson, 'utf8');
		writeFileSync(resolve(staticBundleDir, 'icons.json'), iconThemeJson, 'utf8');
	}

	if (plugin.entry && existsSync(plugin.entry)) {
		const compiled = await compileOfficialPluginEntry(
			plugin,
			root,
			createAliasRecord,
			resolve(root, 'dist/dev-plugins', plugin.id),
			releaseVersion
		);
		code = compiled.code;
		cssCode = compiled.cssCode;
		if (code) {
			writeFileSync(resolve(staticBundleDir, 'bundle.js'), code, 'utf8');
		}
		if (cssCode) {
			writeFileSync(resolve(staticBundleDir, 'bundle.css'), cssCode, 'utf8');
		}
	}

	// Synchronize sha256 in manifest.json so full reloads also validate
	const manifestPath = resolve(
		root,
		'apps/web/static/official-plugins/manifests',
		`${plugin.id}.manifest.json`
	);
	if (existsSync(manifestPath)) {
		try {
			const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
			if (code) {
				manifest.sha256 = createHash('sha256').update(code).digest('hex');
			}
			if (cssCode) {
				manifest.cssUrl = pluginAssetUrl(plugin.id, 'bundle.css');
				manifest.cssSha256 = createHash('sha256').update(cssCode).digest('hex');
			} else {
				delete manifest.cssSha256;
				delete manifest.cssUrl;
			}
			if (colorsJson) {
				manifest.colorsSha256 = createHash('sha256').update(colorsJson).digest('hex');
			}
			if (iconThemeJson) {
				manifest.iconThemeSha256 = createHash('sha256').update(iconThemeJson).digest('hex');
			}
			writeFileSync(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`, 'utf8');
		} catch (err) {
			console.warn(`[Plugin HMR] Failed to update manifest for ${plugin.id}:`, err);
		}
	}

	return {
		id: plugin.id,
		type: plugin.type,
		code,
		cssCode,
		colorsJson,
		iconThemeJson
	};
}

export function chronosPluginHmrPlugin(options: ChronosPluginHmrOptions): Plugin {
	const { monorepoRoot, plugins, createAliasRecord } = options;

	return {
		name: 'chronos-plugin-hmr',
		apply: 'serve',
		configureServer(server) {
			const pluginsDir = resolve(monorepoRoot, 'packages/plugins');
			server.watcher.add(pluginsDir);

			const pendingTimers = new Map<string, NodeJS.Timeout>();
			const inFlightBuilds = new Set<string>();
			const queuedRebuilds = new Set<string>();

			const executeBuild = async (pluginDef: OfficialPluginDef) => {
				if (inFlightBuilds.has(pluginDef.id)) {
					queuedRebuilds.add(pluginDef.id);
					return;
				}

				inFlightBuilds.add(pluginDef.id);
				try {
					do {
						queuedRebuilds.delete(pluginDef.id);
						const startTime = performance.now();
						try {
							const payload = await buildSingleOfficialPlugin(
								pluginDef,
								monorepoRoot,
								createAliasRecord
							);
							const costMs = (performance.now() - startTime).toFixed(1);
							const rev = Date.now().toString(36);

							server.ws.send({
								type: 'custom',
								event: 'chronos:plugin-hmr',
								data: {
									...payload,
									rev,
									costMs
								}
							});
							console.log(`[Plugin HMR] ✓ ${pluginDef.id} rebuilt & pushed in ${costMs}ms`);
						} catch (err: unknown) {
							const error = err instanceof Error ? err : new Error(String(err));
							console.error(`[Plugin HMR] ✗ Build error in ${pluginDef.id}:`, error.message);
							server.ws.send({
								type: 'custom',
								event: 'chronos:plugin-hmr-error',
								data: {
									id: pluginDef.id,
									message: error.message,
									stack: error.stack
								}
							});
						}
					} while (queuedRebuilds.has(pluginDef.id));
				} finally {
					inFlightBuilds.delete(pluginDef.id);
				}
			};

			const handleFileEvent = (filePath: string) => {
				const normalized = filePath.replace(/\\/g, '/');
				if (!normalized.includes('/packages/plugins/')) return;
				if (
					normalized.includes('/node_modules/') ||
					normalized.includes('/tests/') ||
					normalized.includes('.test.') ||
					normalized.includes('.spec.')
				) {
					return;
				}

				const rel = relative(pluginsDir, filePath).replace(/\\/g, '/');
				const sourceDir = rel.split('/')[0];
				if (!sourceDir) return;

				const pluginDef = plugins.find((p) => p.sourceDir === sourceDir);
				if (!pluginDef) return;

				const existingTimer = pendingTimers.get(pluginDef.id);
				if (existingTimer) clearTimeout(existingTimer);

				const timer = setTimeout(() => {
					pendingTimers.delete(pluginDef.id);
					void executeBuild(pluginDef);
				}, 100);

				pendingTimers.set(pluginDef.id, timer);
			};

			server.watcher.on('change', handleFileEvent);
			server.watcher.on('add', handleFileEvent);
			server.watcher.on('unlink', handleFileEvent);
		}
	};
}
