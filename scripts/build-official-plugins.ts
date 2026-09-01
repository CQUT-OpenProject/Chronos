import { createHash } from 'node:crypto';
import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChronosAliasRecord } from './resolve-chronos-aliases.ts';
import { verifyOfficialPlugins } from './verify-official-plugins.ts';
import { OFFICIAL_PLUGINS } from './official-plugins.config.ts';

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
		const perPluginDist = resolve(distDir, plugin.id);
		mkdirSync(perPluginDist, { recursive: true });
		const builtPath = resolve(perPluginDist, `${plugin.id}.bundle.js`);
		await build({
			configFile: false,
			plugins: [svelte({ compilerOptions: { runes: true } })],
			define: {
				__CHRONOS_PLUGIN_VERSION__: JSON.stringify(releaseVersion)
			},
			resolve: { alias: createChronosAliasRecord(root) },
			build: {
				emptyOutDir: true,
				cssCodeSplit: false,
				lib: {
					entry: plugin.entry,
					formats: ['es'],
					fileName: () => `${plugin.id}.bundle.js`
				},
				outDir: perPluginDist,
				rollupOptions: { output: { inlineDynamicImports: true } }
			}
		});

		const code = readFileSync(builtPath, 'utf8');
		writeFileSync(resolve(outDir, fileName), code, 'utf8');
		manifest.bundleUrl = pluginAssetUrl(plugin.id, fileName);
		manifest.sha256 = createHash('sha256').update(code).digest('hex');

		let cssFileName: string | null = null;
		let cssSha256: string | null = null;
		const staticCssPath = resolve(outDir, 'bundle.css');
		const distFiles = readdirSync(perPluginDist);
		const emittedCss = distFiles.find((f) => f.endsWith('.css'));
		let cssContent: string | null = null;
		if (emittedCss && existsSync(resolve(perPluginDist, emittedCss))) {
			const raw = readFileSync(resolve(perPluginDist, emittedCss), 'utf8');
			if (raw.trim().length > 0) cssContent = raw;
		}
		if (cssContent) {
			cssFileName = 'bundle.css';
			writeFileSync(staticCssPath, cssContent, 'utf8');
			cssSha256 = createHash('sha256').update(cssContent).digest('hex');
		} else if (existsSync(staticCssPath)) {
			rmSync(staticCssPath, { force: true });
		}
		if (cssFileName && cssSha256) {
			manifest.cssUrl = pluginAssetUrl(plugin.id, cssFileName);
			manifest.cssSha256 = cssSha256;
		}
	}

	writeFileSync(
		resolve(manifestDir, `${plugin.id}.manifest.json`),
		`${JSON.stringify(manifest, null, '\t')}\n`,
		'utf8'
	);
	console.log(`${plugin.id}: manifest updated`);
}

// Remove legacy flat bundle layout
const legacyFlatFiles = [
	'theme-yumemita.bundle.js',
	'theme-yumemita.colors.json',
	'theme-yumemita.icons.json',
	'tool-wallpaper.bundle.js',
	'tool-wallpaper.bundle.css'
];
for (const file of legacyFlatFiles) {
	const path = resolve(staticBundleDir, file);
	if (existsSync(path)) rmSync(path, { force: true });
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
