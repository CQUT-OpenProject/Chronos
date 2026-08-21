import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createHash } from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
	readdirSync,
	copyFileSync
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(root, 'dist/official-plugins');
const staticBundleDir = resolve(root, 'apps/web/static/official-plugins/bundles');
const manifestDir = resolve(root, 'apps/web/static/official-plugins/manifests');

const plugins = [
	{
		id: 'theme-yumemita',
		entry: resolve(root, 'packages/plugins/theme-yumemita/bundle/entry.ts'),
		type: 'theme' as const,
		name: { 'zh-CN': 'YUMEMITA', en: 'YUMEMITA' },
		description: { 'zh-CN': 'YUMEMITA 主题', en: 'YUMEMITA theme' }
	},
	{
		id: 'tool-wallpaper',
		entry: resolve(root, 'packages/plugins/wallpaper/bundle/entry.ts'),
		type: 'tool' as const,
		name: { 'zh-CN': '课表壁纸', en: 'Wallpaper' },
		description: { 'zh-CN': '自定义课表背景壁纸与主题取色', en: 'Custom timetable wallpaper' }
	}
];

mkdirSync(distDir, { recursive: true });
mkdirSync(staticBundleDir, { recursive: true });
mkdirSync(manifestDir, { recursive: true });

for (const plugin of plugins) {
	if (!existsSync(plugin.entry)) {
		console.warn(`[skip] ${plugin.id}: entry not found ${plugin.entry}`);
		continue;
	}
	const fileName = `${plugin.id}.bundle.js`;
	// clear previous
	const builtPath = resolve(distDir, fileName);
	const builtCssPath = resolve(distDir, `${plugin.id}.bundle.css`);
	try {
		if (existsSync(builtPath)) writeFileSync(builtPath, '', 'utf8');
	} catch {}
	await build({
		configFile: false,
		plugins: [svelte({ compilerOptions: { runes: true } })],
		resolve: {
			alias: {
				'@chronos/core': resolve(root, 'packages/core/src/index.ts'),
				'@chronos/ui-kit': resolve(root, 'packages/ui-kit/src/index.ts'),
				'@chronos/plugin-wallpaper': resolve(root, 'packages/plugins/wallpaper/src/index.ts'),
				'@chronos/plugin-wallpaper/wallpaper-theme': resolve(
					root,
					'packages/plugins/wallpaper/src/wallpaper-theme.ts'
				),
				'@chronos/plugin-wallpaper/WallpaperScreen': resolve(
					root,
					'packages/plugins/wallpaper/src/WallpaperScreen.svelte'
				),
				'@chronos/plugin-theme-yumemita': resolve(
					root,
					'packages/plugins/theme-yumemita/src/index.ts'
				)
			}
		},
		build: {
			emptyOutDir: false,
			cssCodeSplit: false,
			lib: {
				entry: plugin.entry,
				formats: ['es'],
				fileName: () => fileName
			},
			outDir: distDir,
			rollupOptions: {
				output: {
					inlineDynamicImports: true
				}
			}
		}
	});

	const code = readFileSync(builtPath, 'utf8');
	// copy js
	writeFileSync(resolve(staticBundleDir, fileName), code, 'utf8');

	// handle css if emitted
	let cssFileName: string | null = null;
	let cssSha256: string | null = null;
	const staticCssPath = resolve(staticBundleDir, `${plugin.id}.bundle.css`);
	// Vite may emit style.css; check distDir for .css
	const distFiles = readdirSync(distDir);
	const emittedCss = distFiles.find((f) => f.endsWith('.css'));
	if (emittedCss && existsSync(resolve(distDir, emittedCss))) {
		const cssContent = readFileSync(resolve(distDir, emittedCss), 'utf8');
		if (cssContent.trim().length > 0) {
			cssFileName = `${plugin.id}.bundle.css`;
			writeFileSync(staticCssPath, cssContent, 'utf8');
			// also keep in dist
			if (emittedCss !== `${plugin.id}.bundle.css`) {
				copyFileSync(resolve(distDir, emittedCss), resolve(distDir, cssFileName));
			}
			cssSha256 = createHash('sha256').update(cssContent).digest('hex');
		}
	} else if (existsSync(builtCssPath)) {
		const cssContent = readFileSync(builtCssPath, 'utf8');
		if (cssContent.trim().length > 0) {
			cssFileName = `${plugin.id}.bundle.css`;
			writeFileSync(staticCssPath, cssContent, 'utf8');
			cssSha256 = createHash('sha256').update(cssContent).digest('hex');
		}
	}

	const sha256 = createHash('sha256').update(code).digest('hex');
	const manifest: Record<string, unknown> = {
		id: plugin.id,
		name: plugin.name,
		version: '1.0.0',
		description: plugin.description,
		author: 'Chronos',
		type: plugin.type,
		bundleFormat: 'esm',
		minEngineVersion: '0.4.0',
		bundleUrl: `/official-plugins/bundles/${fileName}`,
		sha256
	};
	if (cssFileName && cssSha256) {
		manifest.cssUrl = `/official-plugins/bundles/${cssFileName}`;
		manifest.cssSha256 = cssSha256;
	}

	writeFileSync(
		resolve(manifestDir, `${plugin.id}.manifest.json`),
		`${JSON.stringify(manifest, null, '\t')}\n`,
		'utf8'
	);
	console.log(`${plugin.id}: sha256=${sha256}${cssSha256 ? ` cssSha256=${cssSha256}` : ''}`);
}

const catalog = {
	version: 1,
	updatedAt: Date.now(),
	manifests: plugins
		.filter((p) => existsSync(p.entry))
		.map((p) => `/official-plugins/manifests/${p.id}.manifest.json`)
};

writeFileSync(
	resolve(root, 'apps/web/static/official-plugins/catalog.json'),
	`${JSON.stringify(catalog, null, '\t')}\n`,
	'utf8'
);

console.log('Official plugin bundles and manifests updated.');
