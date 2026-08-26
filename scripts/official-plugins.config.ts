import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const OFFICIAL_PLUGIN_VERSION = '1.0.0';

export type OfficialPluginDef = {
	id: string;
	type: 'theme' | 'tool';
	name: Record<string, string>;
	description: Record<string, string>;
	/** packages/plugins source directory for Tailwind @source coverage */
	sourceDir: string;
	entry?: string;
	colorsJson?: string;
	iconsJson?: string;
};

export const OFFICIAL_PLUGINS: OfficialPluginDef[] = [
	{
		id: 'theme-yumemita',
		type: 'theme',
		sourceDir: 'theme-yumemita',
		name: { 'zh-CN': 'YUMEMITA', en: 'YUMEMITA' },
		description: { 'zh-CN': 'YUMEMITA 主题', en: 'YUMEMITA theme' },
		colorsJson: resolve(root, 'packages/plugins/theme-yumemita/theme-yumemita.colors.json'),
		iconsJson: resolve(root, 'packages/plugins/theme-yumemita/theme-yumemita.icons.json')
	},
	{
		id: 'tool-wallpaper',
		type: 'tool',
		sourceDir: 'wallpaper',
		name: { 'zh-CN': '自定义壁纸', en: 'Custom Wallpaper' },
		description: {
			'zh-CN': '自定义课表页壁纸，支持动态取色',
			en: 'Custom timetable wallpaper with dynamic color'
		},
		entry: resolve(root, 'packages/plugins/wallpaper/bundle/entry.ts')
	},
	{
		id: 'tool-qrcode',
		type: 'tool',
		sourceDir: 'codec-qrcode',
		name: { 'zh-CN': '导出为二维码', en: 'Timetable QR Code' },
		description: {
			'zh-CN': '生成课表分享二维码矢量图与扫码/图片识别导入',
			en: 'Generate timetable QR codes and import via scan or image'
		},
		entry: resolve(root, 'packages/plugins/codec-qrcode/bundle/entry.ts')
	}
];

export const OFFICIAL_PLUGIN_SOURCE_DIRS = Object.fromEntries(
	OFFICIAL_PLUGINS.map((plugin) => [plugin.id, plugin.sourceDir])
) as Record<string, string>;
