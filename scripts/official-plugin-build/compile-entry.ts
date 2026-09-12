import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import type { OfficialPluginDef } from '../official-plugins.config.ts';

export const OFFICIAL_PLUGIN_BUNDLE_JS = 'bundle.js';
export const OFFICIAL_PLUGIN_BUNDLE_CSS = 'bundle.css';

/**
 * Vite lib mode extracts CSS to a sidecar file but leaves a runtime `import
 * './styles.css'` in the JS chunk. Strip those imports in Rollup renderChunk
 * (CSS is injected separately via activate / bundle.css).
 */
function removeLibModeCssImports(): Plugin {
	return {
		name: 'chronos-remove-lib-css-imports',
		apply: 'build',
		renderChunk(code) {
			return code.replace(/import\s*['"][^'"]+\.css['"];?\s*/g, '');
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
		plugins: [tailwindcss(), svelte({ compilerOptions: { runes: true } })],
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
				fileName: () => OFFICIAL_PLUGIN_BUNDLE_JS
			},
			outDir,
			rollupOptions: {
				output: { codeSplitting: false },
				plugins: [removeLibModeCssImports()]
			}
		}
	});

	let code: string | null = null;
	const builtPath = resolve(outDir, OFFICIAL_PLUGIN_BUNDLE_JS);
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
