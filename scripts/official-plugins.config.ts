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
	/** JSON-only assets skip Tailwind @source dir verification (default: has entry) */
	tailwindSource?: boolean;
};

export const OFFICIAL_PLUGINS: OfficialPluginDef[] = [
	{
		id: 'theme-yumemita',
		type: 'theme',
		sourceDir: 'theme-yumemita',
		tailwindSource: false,
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
		name: { 'zh-CN': '二维码', en: 'QR Code' },
		description: {
			'zh-CN': '通过二维码导入/导出课表',
			en: 'Import and export timetables via QR codes'
		},
		entry: resolve(root, 'packages/plugins/codec-qrcode/bundle/entry.ts')
	},
	{
		id: 'tool-calendar-holidays',
		type: 'tool',
		sourceDir: 'calendar-holidays',
		name: { 'zh-CN': '法定节假日', en: 'Public Holidays' },
		description: {
			'zh-CN': '在课表中展示法定节假日',
			en: 'Show public holidays on the timetable'
		},
		entry: resolve(root, 'packages/plugins/calendar-holidays/bundle/entry.ts')
	},
	{
		id: 'tool-today',
		type: 'tool',
		sourceDir: 'today',
		name: { 'zh-CN': '今日', en: 'Today' },
		description: {
			'zh-CN': '快速查看当天课程',
			en: "Bottom tab showing today's courses"
		},
		entry: resolve(root, 'packages/plugins/today/bundle/entry.ts')
	}
];

export const OFFICIAL_PLUGIN_SOURCE_DIRS = Object.fromEntries(
	OFFICIAL_PLUGINS.map((plugin) => [plugin.id, plugin.sourceDir])
) as Record<string, string>;
