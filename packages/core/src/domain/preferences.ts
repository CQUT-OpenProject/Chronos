import { DEFAULT_VISUAL_THEME_ID } from '../theme/theme-defaults';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type PaletteMode = string;
export type AppLocale = 'zh-cn' | 'en';

/** 默认课程配色模式 */
export const PALETTE_MODE_VIBRANT = 'vibrant';
/** 动态取色模式（壁纸） */
export const PALETTE_MODE_WALLPAPER = 'wallpaper';
export type TimetableLayoutMode = 'fixed' | 'compact';
export type CapsuleCornerStyle = 'rounded' | 'sharp' | 'pill';

export const CURRENT_PREFERENCES_SCHEMA_VERSION = 2;

export const PREFERENCE_STORAGE_KEYS = {
	currentTimetableId: 'chronos_preferences:current_timetable_id',
	themeMode: 'chronos_preferences:theme_mode',
	timetableLayoutMode: 'chronos_preferences:timetable_layout_mode',
	paletteMode: 'chronos_preferences:palette_mode',
	capsuleCornerStyle: 'chronos_preferences:capsule_corner_style',
	hapticFeedbackEnabled: 'chronos_preferences:haptic_feedback_enabled',
	visualThemeId: 'chronos_preferences:visual_theme_id',
	locale: 'chronos_preferences:locale'
} as const;

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
