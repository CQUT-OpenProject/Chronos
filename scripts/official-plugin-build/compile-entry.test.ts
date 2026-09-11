import { describe, expect, it } from 'vite-plus/test';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOfficialPluginAssets } from './build-plugin.ts';
import { OFFICIAL_PLUGINS } from '../official-plugins.config.ts';
import { createChronosAliasRecord } from '../resolve-chronos-aliases.ts';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');

describe('official-plugin-build compile', () => {
	it('builds theme plugin JSON assets without JS bundle', async () => {
		const themePlugin = OFFICIAL_PLUGINS.find((p) => p.id === 'theme-yumemita');
		expect(themePlugin).toBeDefined();

		const result = await buildOfficialPluginAssets(themePlugin!, {
			root,
			releaseVersion: '0.0.0-dev',
			createAliasRecord: createChronosAliasRecord,
			mode: 'dev'
		});

		expect(result.colorsJson).toBeTruthy();
		expect(result.iconThemeJson).toBeTruthy();
		expect(result.code).toBeNull();
	});

	it('compiles today plugin CSS with Chronos tokens and no preflight', async () => {
		const todayPlugin = OFFICIAL_PLUGINS.find((p) => p.id === 'tool-today');
		expect(todayPlugin).toBeDefined();

		const result = await buildOfficialPluginAssets(todayPlugin!, {
			root,
			releaseVersion: '0.0.0-dev',
			createAliasRecord: createChronosAliasRecord,
			mode: 'dev'
		});

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
