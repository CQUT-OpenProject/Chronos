import { afterEach, describe, expect, it } from 'vite-plus/test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { OFFICIAL_PLUGINS } from '../official-plugins.config.ts';
import { publishDevPluginBuild } from './dev-publish.ts';
import { loadDevPluginBuildPayload } from './load-dev-build-payload.ts';
import { createOfficialPluginBuildPaths } from './paths.ts';

describe('loadDevPluginBuildPayload', () => {
	let tempRoot = '';

	afterEach(() => {
		if (tempRoot) {
			rmSync(tempRoot, { recursive: true, force: true });
			tempRoot = '';
		}
	});

	it('reads the latest published dev revision from disk', () => {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'load-dev-build-payload-'));
		const plugin = OFFICIAL_PLUGINS.find((entry) => entry.id === 'tool-today');
		expect(plugin).toBeDefined();

		const paths = createOfficialPluginBuildPaths(tempRoot);
		publishDevPluginBuild({
			plugin: plugin!,
			rev: 'rev-test',
			releaseVersion: '0.0.0-dev',
			paths,
			files: {
				code: 'export default {};',
				cssCode: '.today { color: red; }',
				colorsJson: null,
				iconThemeJson: null
			}
		});

		const payload = loadDevPluginBuildPayload(plugin!, tempRoot);
		expect(payload).toMatchObject({
			id: 'tool-today',
			rev: 'rev-test',
			code: 'export default {};',
			cssCode: '.today { color: red; }'
		});
		expect(payload?.manifest?.devRev).toBe('rev-test');
	});

	it('returns null when no dev revision was published', () => {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'load-dev-build-payload-empty-'));
		const plugin = OFFICIAL_PLUGINS.find((entry) => entry.id === 'tool-clock');
		expect(plugin).toBeDefined();

		const paths = createOfficialPluginBuildPaths(tempRoot);
		mkdirSync(resolve(paths.devOutDir(plugin!.id)), { recursive: true });
		writeFileSync(
			paths.devManifestPath(plugin!.id),
			`${JSON.stringify({ id: plugin!.id })}\n`,
			'utf8'
		);

		expect(loadDevPluginBuildPayload(plugin!, tempRoot)).toBeNull();
	});
});
