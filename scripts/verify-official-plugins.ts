import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staticDir = resolve(root, 'apps/web/static/official-plugins');
/** Manifest/asset URLs are served from apps/web/static. */
const webPublicDir = resolve(root, 'apps/web/static');

const ASSET_FIELDS: ReadonlyArray<readonly [urlField: string, hashField: string]> = [
	['bundleUrl', 'sha256'],
	['cssUrl', 'cssSha256'],
	['colorsUrl', 'colorsSha256'],
	['iconThemeUrl', 'iconThemeSha256']
];

/**
 * Verifies that every official-plugin asset on disk matches the sha256 declared
 * in its manifest. Stale artifacts (rebuilt bundle without recomputed manifest,
 * or vice versa) fail loudly here instead of at user install time.
 */
export function verifyOfficialPlugins(): void {
	const catalogPath = resolve(staticDir, 'catalog.json');
	const catalog = JSON.parse(readFileSync(catalogPath, 'utf8')) as { manifests: string[] };
	let failures = 0;

	for (const manifestUrl of catalog.manifests) {
		const manifestPath = resolve(webPublicDir, ...manifestUrl.replace(/^\//, '').split('/'));
		if (!existsSync(manifestPath)) {
			console.error(`✗ missing manifest: ${manifestUrl}`);
			failures++;
			continue;
		}
		const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
		const pluginId = String(manifest.id ?? manifestUrl);

		for (const [urlField, hashField] of ASSET_FIELDS) {
			const url = manifest[urlField];
			const expected = manifest[hashField];
			if (url === undefined && expected === undefined) continue;
			if (typeof url !== 'string' || typeof expected !== 'string') {
				console.error(`✗ ${pluginId}: ${urlField}/${hashField} presence mismatch`);
				failures++;
				continue;
			}
			const assetPath = resolve(webPublicDir, ...url.replace(/^\//, '').split('/'));
			if (!existsSync(assetPath)) {
				console.error(`✗ ${pluginId}: missing asset ${url}`);
				failures++;
				continue;
			}
			const actual = createHash('sha256').update(readFileSync(assetPath)).digest('hex');
			if (actual !== expected) {
				console.error(
					`✗ ${pluginId}: ${url} sha256 ${actual.slice(0, 16)}… != declared ${expected.slice(0, 16)}…`
				);
				failures++;
			}
		}
	}

	if (failures > 0) {
		console.error(`verify-official-plugins: ${failures} failure(s)`);
		process.exitCode = 1;
	} else {
		console.log('verify-official-plugins: all assets match declared hashes');
	}
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
	verifyOfficialPlugins();
}
