import type { AppLocale, ChronosEngine } from '@chronos/core';
import {
	getTextDirection,
	setLocale as setParaglideLocale,
	type Locale
} from '$lib/paraglide/runtime';

export const APP_LOCALES: ReadonlyArray<{ id: AppLocale; label: string }> = [
	{ id: 'zh-cn', label: '简体中文' },
	{ id: 'en', label: 'English' }
];

export function normalizeAppLocale(value: string | undefined | null): AppLocale {
	if (value?.toLowerCase() === 'en') return 'en';
	return 'zh-cn';
}

/** Sync Paraglide cookie + document lang/dir without reloading the page. */
export function syncParaglideLocale(locale: AppLocale): void {
	void setParaglideLocale(locale as Locale, { reload: false });
	if (typeof document !== 'undefined') {
		document.documentElement.lang = locale;
		document.documentElement.dir = getTextDirection(locale as Locale);
	}
}

export async function applyAppLocale(engine: ChronosEngine, locale: AppLocale): Promise<void> {
	engine.setLocale(locale);
	syncParaglideLocale(locale);
	await engine.updatePreferences({ locale });
}

export function syncEngineLocaleFromPreferences(engine: ChronosEngine): void {
	const locale = normalizeAppLocale(engine.state.userPreferences.locale);
	if (engine.locale !== locale) {
		engine.setLocale(locale);
	}
	syncParaglideLocale(locale);
}
