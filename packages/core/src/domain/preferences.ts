export type ThemeMode = 'light' | 'dark' | 'auto';
export type PaletteMode = 'monochrome' | 'vibrant' | 'wallpaper';
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
	customMetadata?: Record<string, unknown>;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
	schemaVersion: CURRENT_PREFERENCES_SCHEMA_VERSION,
	themeMode: 'auto',
	paletteMode: 'vibrant',
	timetableLayoutMode: 'fixed',
	capsuleCornerStyle: 'rounded',
	hapticFeedbackEnabled: true
};
