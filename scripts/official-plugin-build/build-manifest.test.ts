import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vite-plus/test';
import { buildDevManifestForPlugin, buildManifestForPlugin } from './build-manifest.ts';

const releaseVersion = '0.0.0-test';

describe('buildManifestForPlugin', () => {
	it('includes bundle and css hashes when assets are present', () => {
		const code = 'export default { id: "tool-today" };';
		const cssCode = '.x { color: red; }';

		const manifest = buildManifestForPlugin(
			{
				id: 'tool-today',
				type: 'tool',
				toolGroup: 'utility',
				sourceDir: 'today',
				name: { 'zh-CN': '今日', en: 'Today' },
				description: { 'zh-CN': 'd', en: 'd' }
			},
			{ code, cssCode, colorsJson: null, iconThemeJson: null },
			releaseVersion
		);

		expect(manifest.version).toBe(releaseVersion);
		expect(manifest.bundleUrl).toBe('/official-plugins/bundles/tool-today/bundle.js');
		expect(manifest.sha256).toBe(createHash('sha256').update(code).digest('hex'));
		expect(manifest.cssUrl).toBe('/official-plugins/bundles/tool-today/bundle.css');
		expect(manifest.cssSha256).toBe(createHash('sha256').update(cssCode).digest('hex'));
	});

	it('includes toolGroup for utility and dev tool plugins', () => {
		const utilityManifest = buildManifestForPlugin(
			{
				id: 'tool-today',
				type: 'tool',
				toolGroup: 'utility',
				sourceDir: 'today',
				name: { 'zh-CN': '今日', en: 'Today' },
				description: { 'zh-CN': 'd', en: 'd' }
			},
			{ code: 'export default {}', cssCode: null, colorsJson: null, iconThemeJson: null },
			releaseVersion
		);
		const devManifest = buildManifestForPlugin(
			{
				id: 'tool-clock',
				type: 'tool',
				toolGroup: 'dev',
				sourceDir: 'clock',
				name: { 'zh-CN': '自定义时间', en: 'Custom Date & Time' },
				description: { 'zh-CN': 'd', en: 'd' }
			},
			{ code: 'export default {}', cssCode: null, colorsJson: null, iconThemeJson: null },
			releaseVersion
		);

		expect(utilityManifest.toolGroup).toBe('utility');
		expect(devManifest.toolGroup).toBe('dev');
	});

	it('includes rev-scoped URLs for dev manifests', () => {
		const code = 'export default { id: "tool-today" };';

		const manifest = buildManifestForPlugin(
			{
				id: 'tool-today',
				type: 'tool',
				toolGroup: 'utility',
				sourceDir: 'today',
				name: { 'zh-CN': '今日', en: 'Today' },
				description: { 'zh-CN': 'd', en: 'd' }
			},
			{ code, cssCode: null, colorsJson: null, iconThemeJson: null },
			releaseVersion
		);

		expect(manifest.bundleUrl).toBe('/official-plugins/bundles/tool-today/bundle.js');

		const devManifest = buildDevManifestForPlugin(
			{
				id: 'tool-today',
				type: 'tool',
				toolGroup: 'utility',
				sourceDir: 'today',
				name: { 'zh-CN': '今日', en: 'Today' },
				description: { 'zh-CN': 'd', en: 'd' }
			},
			{ code, cssCode: null, colorsJson: null, iconThemeJson: null },
			releaseVersion,
			'abc123'
		);

		expect(devManifest.devRev).toBe('abc123');
		expect(devManifest.bundleUrl).toBe('/official-plugins/bundles/tool-today/abc123/bundle.js');
	});
});
