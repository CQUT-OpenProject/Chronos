import { build } from 'vite';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
		name: { 'zh-CN': '课表壁纸', en: 'Timetable Wallpaper' },
		description: {
			'zh-CN': '自定义课表背景壁纸与主题取色',
			en: 'Customize timetable background wallpaper and theme palette'
		}
	}
];

mkdirSync(distDir, { recursive: true });
mkdirSync(staticBundleDir, { recursive: true });
mkdirSync(manifestDir, { recursive: true });

for (const plugin of plugins) {
	const fileName = `${plugin.id}.bundle.js`;
	await build({
		configFile: false,
		build: {
			emptyOutDir: false,
			lib: {
				entry: plugin.entry,
				formats: ['iife'],
				name: '__chronosOfficialPlugin',
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

	const builtPath = resolve(distDir, fileName);
	let code = readFileSync(builtPath, 'utf8');
	code = `${code}\nmodule.exports = __chronosOfficialPlugin.default || __chronosOfficialPlugin;\n`;
	writeFileSync(builtPath, code, 'utf8');
	writeFileSync(resolve(staticBundleDir, fileName), code, 'utf8');

	const sha256 = createHash('sha256').update(code).digest('hex');
	const manifest = {
		id: plugin.id,
		name: plugin.name,
		version: '1.0.0',
		description: plugin.description,
		author: 'Chronos',
		type: plugin.type,
		bundleFormat: 'iife',
		minEngineVersion: '0.3.0',
		bundleUrl: `/official-plugins/bundles/${fileName}`,
		sha256
	};

	writeFileSync(
		resolve(manifestDir, `${plugin.id}.manifest.json`),
		`${JSON.stringify(manifest, null, '\t')}\n`,
		'utf8'
	);
	console.log(`${plugin.id}: sha256=${sha256}`);
}

const catalog = {
	version: 1,
	updatedAt: Date.now(),
	manifests: plugins.map((p) => `/official-plugins/manifests/${p.id}.manifest.json`)
};

writeFileSync(
	resolve(root, 'apps/web/static/official-plugins/catalog.json'),
	`${JSON.stringify(catalog, null, '\t')}\n`,
	'utf8'
);

console.log('Official plugin bundles and manifests updated.');
