import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vite-plus/test';
import { buildManifestForPlugin } from './build-manifest.ts';

describe('buildManifestForPlugin', () => {
	it('includes bundle and css hashes when assets are present', () => {
		const code = 'export default { id: "tool-today" };';
		const cssCode = '.x { color: red; }';

		const manifest = buildManifestForPlugin(
			{
				id: 'tool-today',
				type: 'tool',
				sourceDir: 'today',
				name: { 'zh-CN': '今日', en: 'Today' },
				description: { 'zh-CN': 'd', en: 'd' }
			},
			{ code, cssCode, colorsJson: null, iconThemeJson: null },
			'0.5.4'
		);

		expect(manifest.version).toBe('0.5.4');
		expect(manifest.bundleUrl).toBe('/official-plugins/bundles/tool-today/bundle.js');
		expect(manifest.sha256).toBe(createHash('sha256').update(code).digest('hex'));
		expect(manifest.cssUrl).toBe('/official-plugins/bundles/tool-today/bundle.css');
		expect(manifest.cssSha256).toBe(createHash('sha256').update(cssCode).digest('hex'));
	});
});
