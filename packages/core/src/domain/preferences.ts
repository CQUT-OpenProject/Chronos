export type ThemeMode = 'light' | 'dark' | 'auto';
export type PaletteMode = string;

/** 默认课程配色模式 */
export const PALETTE_MODE_VIBRANT = 'vibrant';
/** 遗留动态取色模式（壁纸），读取偏好时自动兼容 */
export const LEGACY_PALETTE_MODE_DYNAMIC = 'wallpaper';
export type TimetableLayoutMode = 'fixed' | 'compact';
export type CapsuleCornerStyle = 'rounded' | 'sharp' | 'pill';

export const CURRENT_PREFERENCES_SCHEMA_VERSION = 1;

export interface UserPreferences {
	schemaVersion: number;
	themeMode: ThemeMode;
	paletteMode: PaletteMode;
	timetableLayoutMode: TimetableLayoutMode;
	capsuleCornerStyle: CapsuleCornerStyle;
	hapticFeedbackEnabled: boolean;
	/** Active visual theme id (e.g. m3-default, yumemita). */
	visualThemeId?: string;
	customMetadata?: Record<string, unknown>;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
	schemaVersion: CURRENT_PREFERENCES_SCHEMA_VERSION,
	themeMode: 'auto',
	paletteMode: 'vibrant',
	timetableLayoutMode: 'fixed',
	capsuleCornerStyle: 'rounded',
	hapticFeedbackEnabled: true,
	visualThemeId: 'm3-default'
};
