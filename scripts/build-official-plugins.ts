import { build } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChronosAliasRecord } from './resolve-chronos-aliases.ts';

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
		name: { 'zh-CN': '自定义壁纸', en: 'Custom Wallpaper' },
		description: {
			'zh-CN': '自定义课表页壁纸，支持动态取色',
			en: 'Custom timetable wallpaper with dynamic color'
		}
	}
];

mkdirSync(distDir, { recursive: true });
mkdirSync(staticBundleDir, { recursive: true });
mkdirSync(manifestDir, { recursive: true });
// 清理旧版共享 dist 的遗留 flat 产物，避免误判
for (const f of readdirSync(distDir)) {
	if (f.endsWith('.bundle.js') || f.endsWith('.bundle.css') || f === 'style.css') {
		try {
			rmSync(resolve(distDir, f), { force: true });
		} catch {}
	}
}

for (const plugin of plugins) {
	if (!existsSync(plugin.entry)) {
		console.warn(`[skip] ${plugin.id}: entry not found ${plugin.entry}`);
		continue;
	}
	const fileName = `${plugin.id}.bundle.js`;
	const perPluginDist = resolve(distDir, plugin.id);
	// 隔离子目录：确保本插件 CSS 归属精确，避免共享 dist 污染
	mkdirSync(perPluginDist, { recursive: true });
	const builtPath = resolve(perPluginDist, fileName);
	await build({
		configFile: false,
		plugins: [svelte({ compilerOptions: { runes: true } })],
		resolve: {
			alias: createChronosAliasRecord(root)
		},
		build: {
			emptyOutDir: true,
			cssCodeSplit: false,
			lib: {
				entry: plugin.entry,
				formats: ['es'],
				fileName: () => fileName
			},
			outDir: perPluginDist,
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

	// handle css if emitted — 仅在隔离子目录内查找，杜绝跨插件污染
	let cssFileName: string | null = null;
	let cssSha256: string | null = null;
	const staticCssPath = resolve(staticBundleDir, `${plugin.id}.bundle.css`);
	const distFiles = readdirSync(perPluginDist);
	const emittedCss = distFiles.find((f) => f.endsWith('.css'));
	let cssContent: string | null = null;
	if (emittedCss && existsSync(resolve(perPluginDist, emittedCss))) {
		const raw = readFileSync(resolve(perPluginDist, emittedCss), 'utf8');
		if (raw.trim().length > 0) cssContent = raw;
	}
	// 兼容旧路径：若隔离目录未产出但 static 已有残留，不自动复用，避免污染
	if (cssContent) {
		cssFileName = `${plugin.id}.bundle.css`;
		writeFileSync(staticCssPath, cssContent, 'utf8');
		cssSha256 = createHash('sha256').update(cssContent).digest('hex');
	} else {
		// 无 CSS 时清理可能的上次残留 static 文件，保证 yumemita 等无样式插件不残留错误 cssUrl
		if (existsSync(staticCssPath)) rmSync(staticCssPath, { force: true });
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
	updatedAt: Number(process.env.SOURCE_DATE_EPOCH ?? Date.now()),
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
