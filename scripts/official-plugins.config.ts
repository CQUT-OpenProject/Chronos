import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

type OfficialPluginBase = {
	id: string;
	name: Record<string, string>;
	description: Record<string, string>;
	/** packages/plugins source directory */
	sourceDir: string;
	entry?: string;
	colorsJson?: string;
	iconsJson?: string;
	/** JSON-only assets skip self-contained bundle.css verification (default: has entry) */
	tailwindSource?: boolean;
};

export type OfficialPluginDef =
	| (OfficialPluginBase & { type: 'theme' })
	| (OfficialPluginBase & { type: 'tool'; toolGroup: 'utility' | 'dev' });

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
		id: 'theme-miami',
		type: 'theme',
		sourceDir: 'theme-miami',
		tailwindSource: false,
		name: { 'zh-CN': '迈阿密', en: 'Miami' },
		description: { 'zh-CN': '迈阿密热带日落主题', en: 'Miami tropical sunset theme' },
		colorsJson: resolve(root, 'packages/plugins/theme-miami/theme-miami.colors.json'),
		iconsJson: resolve(root, 'packages/plugins/theme-miami/theme-miami.icons.json')
	},
	{
		id: 'tool-wallpaper',
		type: 'tool',
		toolGroup: 'utility',
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
		toolGroup: 'utility',
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
		toolGroup: 'utility',
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
		toolGroup: 'utility',
		sourceDir: 'today',
		name: { 'zh-CN': '今日', en: 'Today' },
		description: {
			'zh-CN': '快速查看当天课程',
			en: "Bottom tab showing today's courses"
		},
		entry: resolve(root, 'packages/plugins/today/bundle/entry.ts')
	},
	{
		id: 'tool-error-log',
		type: 'tool',
		toolGroup: 'dev',
		sourceDir: 'error-log',
		name: { 'zh-CN': '错误日志', en: 'Error Log' },
		description: {
			'zh-CN': '记录未处理异常与 console.error',
			en: 'Capture unhandled errors and console.error'
		},
		entry: resolve(root, 'packages/plugins/error-log/bundle/entry.ts')
	},
	{
		id: 'tool-clock',
		type: 'tool',
		toolGroup: 'dev',
		sourceDir: 'clock',
		name: { 'zh-CN': '自定义时间', en: 'Custom Date & Time' },
		description: {
			'zh-CN': '冻结课表当前日期和时间，用于预览任意时刻的课程',
			en: 'Freeze the app clock to preview courses at any date and time'
		},
		entry: resolve(root, 'packages/plugins/clock/bundle/entry.ts')
	}
];

export const OFFICIAL_PLUGIN_SOURCE_DIRS = Object.fromEntries(
	OFFICIAL_PLUGINS.map((plugin) => [plugin.id, plugin.sourceDir])
) as Record<string, string>;
