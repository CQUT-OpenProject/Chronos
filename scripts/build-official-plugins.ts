import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChronosAliasRecord } from './resolve-chronos-aliases.ts';
import { verifyOfficialPlugins } from './verify-official-plugins.ts';
import { OFFICIAL_PLUGINS } from './official-plugins.config.ts';
import { compileOfficialPluginEntry } from '../apps/web/src/lib/dev/chronos-plugin-hmr-vite.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releaseVersion = JSON.parse(readFileSync(resolve(root, 'apps/web/package.json'), 'utf8'))
	.version as string;
const distDir = resolve(root, 'dist/official-plugins');
const staticBundleDir = resolve(root, 'apps/web/static/official-plugins/bundles');
const manifestDir = resolve(root, 'apps/web/static/official-plugins/manifests');

type PluginDef = (typeof OFFICIAL_PLUGINS)[number];

const plugins: PluginDef[] = OFFICIAL_PLUGINS;

mkdirSync(distDir, { recursive: true });
mkdirSync(staticBundleDir, { recursive: true });
mkdirSync(manifestDir, { recursive: true });

for (const f of readdirSync(distDir)) {
	if (f.endsWith('.bundle.js') || f.endsWith('.bundle.css') || f === 'style.css') {
		try {
			rmSync(resolve(distDir, f), { force: true });
		} catch {}
	}
}

function pluginBundleDir(pluginId: string): string {
	const dir = resolve(staticBundleDir, pluginId);
	mkdirSync(dir, { recursive: true });
	return dir;
}

function pluginAssetUrl(pluginId: string, fileName: string): string {
	return `/official-plugins/bundles/${pluginId}/${fileName}`;
}

for (const plugin of plugins) {
	const manifest: Record<string, unknown> = {
		id: plugin.id,
		name: plugin.name,
		version: releaseVersion,
		description: plugin.description,
		author: 'Chronos',
		type: plugin.type,
		bundleFormat: 'esm'
	};

	const outDir = pluginBundleDir(plugin.id);

	if (plugin.colorsJson && existsSync(plugin.colorsJson)) {
		const colorsContent = readFileSync(plugin.colorsJson, 'utf8');
		const colorsFileName = 'colors.json';
		writeFileSync(resolve(outDir, colorsFileName), colorsContent, 'utf8');
		manifest.colorsUrl = pluginAssetUrl(plugin.id, colorsFileName);
		manifest.colorsSha256 = createHash('sha256').update(colorsContent).digest('hex');
		const declaredId = (JSON.parse(colorsContent) as { id?: unknown }).id;
		if (typeof declaredId === 'string' && declaredId) {
			manifest.themeId = declaredId;
		}
	}

	if (plugin.iconsJson && existsSync(plugin.iconsJson)) {
		const iconsContent = readFileSync(plugin.iconsJson, 'utf8');
		const iconsFileName = 'icons.json';
		writeFileSync(resolve(outDir, iconsFileName), iconsContent, 'utf8');
		manifest.iconThemeUrl = pluginAssetUrl(plugin.id, iconsFileName);
		manifest.iconThemeSha256 = createHash('sha256').update(iconsContent).digest('hex');
	}

	if (plugin.entry && existsSync(plugin.entry)) {
		const fileName = 'bundle.js';
		const compiled = await compileOfficialPluginEntry(
			plugin,
			root,
			createChronosAliasRecord,
			resolve(distDir, plugin.id),
			releaseVersion
		);
		if (!compiled.code) {
			throw new Error(`${plugin.id}: official plugin entry produced no bundle.js`);
		}
		writeFileSync(resolve(outDir, fileName), compiled.code, 'utf8');
		manifest.bundleUrl = pluginAssetUrl(plugin.id, fileName);
		manifest.sha256 = createHash('sha256').update(compiled.code).digest('hex');

		const staticCssPath = resolve(outDir, 'bundle.css');
		if (compiled.cssCode) {
			writeFileSync(staticCssPath, compiled.cssCode, 'utf8');
			manifest.cssUrl = pluginAssetUrl(plugin.id, 'bundle.css');
			manifest.cssSha256 = createHash('sha256').update(compiled.cssCode).digest('hex');
		} else if (existsSync(staticCssPath)) {
			rmSync(staticCssPath, { force: true });
		}
	}

	writeFileSync(
		resolve(manifestDir, `${plugin.id}.manifest.json`),
		`${JSON.stringify(manifest, null, '\t')}\n`,
		'utf8'
	);
	console.log(`${plugin.id}: manifest updated`);
}

const catalog = {
	version: 2,
	updatedAt: Number(process.env.SOURCE_DATE_EPOCH ?? Date.now()),
	manifests: plugins.map((p) => `/official-plugins/manifests/${p.id}.manifest.json`)
};

writeFileSync(
	resolve(root, 'apps/web/static/official-plugins/catalog.json'),
	`${JSON.stringify(catalog, null, '\t')}\n`,
	'utf8'
);

// Self-check: fail the build loudly if any written asset does not match its
// declared sha256, so stale artifacts can never ship.
verifyOfficialPlugins();

console.log('Official plugin bundles and manifests updated.');
