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

function mapLanguageTagToAppLocale(tag: string): AppLocale | null {
	const normalized = tag.trim().toLowerCase().replace('_', '-');
	if (!normalized) return null;
	if (normalized.startsWith('zh')) return 'zh-cn';
	if (normalized.startsWith('en')) return 'en';
	return null;
}

/** Resolve locale from system language tags; falls back to zh-cn when unavailable. */
export function detectSystemAppLocale(): AppLocale {
	if (typeof navigator === 'undefined') return 'zh-cn';

	const candidates = navigator.languages?.length
		? navigator.languages
		: navigator.language
			? [navigator.language]
			: [];

	for (const tag of candidates) {
		const locale = mapLanguageTagToAppLocale(tag);
		if (locale) return locale;
	}

	return 'zh-cn';
}

/** Startup locale resolution; currently always follows the system language. */
export function resolveAppLocale(_saved?: AppLocale | null): AppLocale {
	return detectSystemAppLocale();
}

/** Sync Paraglide cookie + document lang/dir without reloading the page. */
export function syncParaglideLocale(locale: AppLocale): void {
	void setParaglideLocale(locale as Locale, { reload: false });
	if (typeof document !== 'undefined') {
		document.documentElement.lang = locale;
		document.documentElement.dir = getTextDirection(locale as Locale);
	}
}

/** Apply locale for the current session only (does not persist to preferences). */
export function applySessionAppLocale(engine: ChronosEngine, locale: AppLocale): void {
	engine.setLocale(locale);
	syncParaglideLocale(locale);
}

export function syncAppLocaleOnStartup(engine: ChronosEngine): void {
	const locale = resolveAppLocale();
	if (engine.locale !== locale) {
		engine.setLocale(locale);
	}
	syncParaglideLocale(locale);
}
