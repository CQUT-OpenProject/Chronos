import { describe, expect, it, afterEach } from 'vite-plus/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildOfficialPluginAssets } from './build-plugin.ts';
import { createOfficialPluginBuildPaths } from './paths.ts';
import { OFFICIAL_PLUGINS } from '../official-plugins.config.ts';
import { createChronosAliasRecord } from '../resolve-chronos-aliases.ts';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');

describe('official-plugin-build compile', () => {
	let tempRoot = '';

	afterEach(() => {
		if (tempRoot) {
			rmSync(tempRoot, { recursive: true, force: true });
			tempRoot = '';
		}
	});

	function createDevBuildOptions() {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'chronos-official-plugin-compile-'));
		return {
			root,
			releaseVersion: '0.0.0-dev',
			createAliasRecord: createChronosAliasRecord,
			mode: 'dev' as const,
			paths: createOfficialPluginBuildPaths(root, {
				devPluginsRoot: resolve(tempRoot, 'dev-plugins')
			})
		};
	}

	it('builds theme plugin JSON assets without JS bundle', async () => {
		const themePlugin = OFFICIAL_PLUGINS.find((p) => p.id === 'theme-yumemita');
		expect(themePlugin).toBeDefined();

		const result = await buildOfficialPluginAssets(themePlugin!, createDevBuildOptions());

		expect(result.colorsJson).toBeTruthy();
		expect(result.iconThemeJson).toBeTruthy();
		expect(result.code).toBeNull();
	});

	it('compiles today plugin CSS with Chronos tokens and no preflight', async () => {
		const todayPlugin = OFFICIAL_PLUGINS.find((p) => p.id === 'tool-today');
		expect(todayPlugin).toBeDefined();

		const result = await buildOfficialPluginAssets(todayPlugin!, createDevBuildOptions());

		expect(result.code).toBeTruthy();
		expect(result.cssCode).toBeTruthy();
		expect(result.code).not.toMatch(/import\s*['"][^'"]+\.css['"]/);
		const css = result.cssCode ?? '';
		expect(css).toContain('bg-secondary-container');
		expect(css).toMatch(/corner-shape:\s*squircle/);
		expect(css).not.toMatch(/border:\s*0\s*solid/);
		expect(css).not.toMatch(/--color-surface:\s*#/);
	}, 60_000);
});
