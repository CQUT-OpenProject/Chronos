export const WALLPAPER_ANALYTICS = {
	pick: 'pick',
	cropConfirm: 'crop_confirm',
	cropCancel: 'crop_cancel',
	clear: 'clear'
} as const;

export type WallpaperAnalyticsAction =
	(typeof WALLPAPER_ANALYTICS)[keyof typeof WALLPAPER_ANALYTICS];
