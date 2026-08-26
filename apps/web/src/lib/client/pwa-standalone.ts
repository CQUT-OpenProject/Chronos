const INSTALLED_DISPLAY_MODES = [
	'standalone',
	'fullscreen',
	'minimal-ui',
	'window-controls-overlay'
] as const;

/** Whether the page is running as an installed PWA (not a browser tab). */
export function isPwaStandalone(): boolean {
	if (typeof window === 'undefined') return false;

	// @ts-expect-error iOS Safari
	if (window.navigator.standalone === true) return true;

	return INSTALLED_DISPLAY_MODES.some(
		(mode) => window.matchMedia(`(display-mode: ${mode})`).matches
	);
}

export const PWA_DISPLAY_MODE_MEDIA_QUERIES = [
	...INSTALLED_DISPLAY_MODES,
	'browser',
	'tabbed'
] as const;
