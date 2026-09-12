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

import { OFFICIAL_PLUGINS } from './official-plugins.config.ts';

function pluginRequiresTailwindSource(pluginId: string): boolean {
	const plugin = OFFICIAL_PLUGINS.find((entry) => entry.id === pluginId);
	if (!plugin) return false;
	return plugin.tailwindSource ?? Boolean(plugin.entry);
}

const CSS_FINGERPRINTS: Record<string, readonly string[]> = {
	'tool-today': ['bg-secondary-container', 'border-border'],
	'tool-wallpaper': ['bg-canvas'],
	'tool-calendar-holidays': ['text-error'],
	'tool-qrcode': ['border-dashed']
};

const PREFLIGHT_MARKERS = ['border: 0 solid', 'border:0 solid'] as const;

function verifySelfContainedPluginCss(
	catalog: { manifests: string[] },
	webPublicDir: string
): number {
	let failures = 0;
	const seen = new Set<string>();

	for (const manifestUrl of catalog.manifests) {
		const manifestPath = resolve(webPublicDir, ...manifestUrl.replace(/^\//, '').split('/'));
		if (!existsSync(manifestPath)) continue;
		const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
		const pluginId = typeof manifest.id === 'string' ? manifest.id : undefined;
		if (!pluginId || seen.has(pluginId)) continue;
		seen.add(pluginId);

		if (!pluginRequiresTailwindSource(pluginId)) continue;

		const cssUrl = manifest.cssUrl;
		if (typeof cssUrl !== 'string' || !cssUrl) {
			console.error(`✗ ${pluginId}: missing self-contained cssUrl`);
			failures++;
			continue;
		}

		const cssPath = resolve(webPublicDir, ...cssUrl.replace(/^\//, '').split('/'));
		if (!existsSync(cssPath)) {
			console.error(`✗ ${pluginId}: missing bundle.css at ${cssUrl}`);
			failures++;
			continue;
		}

		const cssContent = readFileSync(cssPath, 'utf8');
		if (PREFLIGHT_MARKERS.some((marker) => cssContent.includes(marker))) {
			console.error(`✗ ${pluginId}: bundle.css appears to include Tailwind Preflight`);
			failures++;
		}
		if (/--color-surface:\s*#/.test(cssContent)) {
			console.error(`✗ ${pluginId}: bundle.css must not emit :root token hex values`);
			failures++;
		}

		const fingerprints = CSS_FINGERPRINTS[pluginId] ?? [];
		for (const token of fingerprints) {
			if (!cssContent.includes(token)) {
				console.error(`✗ ${pluginId}: bundle.css missing fingerprint "${token}"`);
				failures++;
			}
		}

		if (cssContent.includes('.rounded-2xl') && !/corner-shape:\s*squircle/.test(cssContent)) {
			console.error(`✗ ${pluginId}: .rounded-2xl in bundle.css is missing squircle override`);
			failures++;
		}
	}

	return failures;
}

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
		const pluginId = typeof manifest.id === 'string' && manifest.id ? manifest.id : manifestUrl;

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

	failures += verifySelfContainedPluginCss(catalog, webPublicDir);

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
