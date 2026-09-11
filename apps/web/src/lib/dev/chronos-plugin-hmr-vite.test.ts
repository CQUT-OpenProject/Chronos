import { describe, expect, it } from 'vite-plus/test';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSingleOfficialPlugin } from './chronos-plugin-hmr-vite';
import { OFFICIAL_PLUGINS } from '../../../../../scripts/official-plugins.config.ts';
import { createChronosAliasRecord } from '../../../../../scripts/resolve-chronos-aliases.ts';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../..');

describe('chronos-plugin-hmr-vite', () => {
	it('builds a theme plugin with colorsJson and iconsJson', async () => {
		const themePlugin = OFFICIAL_PLUGINS.find((p) => p.id === 'theme-yumemita');
		expect(themePlugin).toBeDefined();

		const result = await buildSingleOfficialPlugin(themePlugin!, root, createChronosAliasRecord);

		expect(result.id).toBe('theme-yumemita');
		expect(result.colorsJson).toBeTruthy();
		expect(result.iconThemeJson).toBeTruthy();
		expect(result.code).toBeNull();
	});

	it('compiles today plugin CSS with Chronos tokens and no preflight', async () => {
		const todayPlugin = OFFICIAL_PLUGINS.find((p) => p.id === 'tool-today');
		expect(todayPlugin).toBeDefined();

		const result = await buildSingleOfficialPlugin(todayPlugin!, root, createChronosAliasRecord);

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
