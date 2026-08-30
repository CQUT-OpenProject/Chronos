import { DEFAULT_VISUAL_THEME_ID } from '../theme/theme-defaults';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type PaletteMode = string;
export type AppLocale = 'zh-cn' | 'en';

/** 默认课程配色模式 */
export const PALETTE_MODE_VIBRANT = 'vibrant';
/** 遗留动态取色模式（壁纸），读取偏好时自动兼容 */
export const LEGACY_PALETTE_MODE_DYNAMIC = 'wallpaper';
export type TimetableLayoutMode = 'fixed' | 'compact';
export type CapsuleCornerStyle = 'rounded' | 'sharp' | 'pill';

export const CURRENT_PREFERENCES_SCHEMA_VERSION = 2;

export interface UserPreferences {
	schemaVersion: number;
	themeMode: ThemeMode;
	paletteMode: PaletteMode;
	timetableLayoutMode: TimetableLayoutMode;
	capsuleCornerStyle: CapsuleCornerStyle;
	hapticFeedbackEnabled: boolean;
	/** Active visual theme id (e.g. m3-default, yumemita). */
	visualThemeId?: string;
	/** UI locale (zh-cn | en). */
	locale?: AppLocale;
	customMetadata?: Record<string, unknown>;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
	schemaVersion: CURRENT_PREFERENCES_SCHEMA_VERSION,
	themeMode: 'auto',
	paletteMode: 'vibrant',
	timetableLayoutMode: 'fixed',
	capsuleCornerStyle: 'sharp',
	hapticFeedbackEnabled: true,
	visualThemeId: DEFAULT_VISUAL_THEME_ID
};
