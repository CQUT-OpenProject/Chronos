import { describe, expect, it, afterEach } from 'vite-plus/test';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { publishDevPluginBuild, readPublishedDevManifest } from './dev-publish.ts';
import { createOfficialPluginBuildPaths } from './paths.ts';

const pluginDef = {
	id: 'tool-test',
	type: 'tool' as const,
	sourceDir: 'test',
	name: { 'zh-CN': '测试', en: 'Test' },
	description: { 'zh-CN': 'd', en: 'd' }
};

describe('publishDevPluginBuild', () => {
	let tempRoot = '';

	afterEach(() => {
		if (tempRoot) {
			rmSync(tempRoot, { recursive: true, force: true });
			tempRoot = '';
		}
	});

	it('publishes immutable rev directories and manifest with rev-scoped URLs', () => {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'chronos-dev-plugin-'));
		const paths = createOfficialPluginBuildPaths(tempRoot);
		const published = publishDevPluginBuild({
			plugin: pluginDef,
			rev: 'rev1',
			files: {
				code: 'export default { id: "tool-test" };',
				cssCode: '.x { color: red; }',
				colorsJson: null,
				iconThemeJson: null
			},
			releaseVersion: '0.5.4',
			paths
		});

		expect(published.rev).toBe('rev1');
		expect(published.manifest.version).toBe('0.5.4');
		expect(published.manifest.bundleUrl).toBe('/official-plugins/bundles/tool-test/rev1/bundle.js');
		expect(existsSync(resolve(paths.devRevDir('tool-test', 'rev1'), 'bundle.js'))).toBe(true);
		expect(existsSync(resolve(paths.devRevDir('tool-test', 'rev1'), 'bundle.css'))).toBe(true);
		expect(existsSync(paths.devManifestPath('tool-test'))).toBe(true);
		expect(existsSync(paths.devTempDir('tool-test'))).toBe(false);
	});

	it('retains prior rev directories for cross-round downloads within a dev session', () => {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'chronos-dev-plugin-'));
		const paths = createOfficialPluginBuildPaths(tempRoot);
		publishDevPluginBuild({
			plugin: pluginDef,
			rev: 'rev-a',
			files: {
				code: 'export default { id: "tool-test", v: 1 };',
				cssCode: null,
				colorsJson: null,
				iconThemeJson: null
			},
			releaseVersion: '0.5.4',
			paths
		});

		publishDevPluginBuild({
			plugin: pluginDef,
			rev: 'rev-b',
			files: {
				code: 'export default { id: "tool-test", v: 2 };',
				cssCode: null,
				colorsJson: null,
				iconThemeJson: null
			},
			releaseVersion: '0.5.4',
			paths
		});

		expect(readFileSync(resolve(paths.devRevDir('tool-test', 'rev-a'), 'bundle.js'), 'utf8')).toBe(
			'export default { id: "tool-test", v: 1 };'
		);
		expect(readFileSync(resolve(paths.devRevDir('tool-test', 'rev-b'), 'bundle.js'), 'utf8')).toBe(
			'export default { id: "tool-test", v: 2 };'
		);
		expect(readPublishedDevManifest('tool-test', tempRoot)?.devRev).toBe('rev-b');
	});

	it('omits css asset when cssCode is null', () => {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'chronos-dev-plugin-'));
		const paths = createOfficialPluginBuildPaths(tempRoot);
		const oldRevDir = paths.devRevDir('tool-test', 'rev-old');
		mkdirSync(oldRevDir, { recursive: true });
		writeFileSync(resolve(oldRevDir, 'bundle.css'), '.old { color: blue; }', 'utf8');

		const published = publishDevPluginBuild({
			plugin: pluginDef,
			rev: 'rev-nocss',
			files: {
				code: 'export default { id: "tool-test" };',
				cssCode: null,
				colorsJson: null,
				iconThemeJson: null
			},
			releaseVersion: '0.5.4',
			paths
		});

		expect(published.manifest.cssUrl).toBeUndefined();
		expect(existsSync(resolve(paths.devRevDir('tool-test', 'rev-nocss'), 'bundle.css'))).toBe(
			false
		);
		expect(existsSync(resolve(oldRevDir, 'bundle.css'))).toBe(true);
	});
});
