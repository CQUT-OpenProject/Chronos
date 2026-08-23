import type { AppLocale, ChronosEngine } from '@chronos/core';
import { setLocale as setParaglideLocale, type Locale } from '$lib/paraglide/runtime';

export const APP_LOCALES: ReadonlyArray<{ id: AppLocale; label: string }> = [
	{ id: 'zh-cn', label: '简体中文' },
	{ id: 'en', label: 'English' }
];

export function normalizeAppLocale(value: string | undefined | null): AppLocale {
	if (value?.toLowerCase() === 'en') return 'en';
	return 'zh-cn';
}

export async function applyAppLocale(engine: ChronosEngine, locale: AppLocale): Promise<void> {
	engine.setLocale(locale);
	await engine.actions.updatePreferences({ locale });
	await setParaglideLocale(locale as Locale, { reload: true });
}

export function syncEngineLocaleFromPreferences(engine: ChronosEngine): void {
	const locale = normalizeAppLocale(engine.state.userPreferences.locale);
	if (engine.locale !== locale) {
		engine.setLocale(locale);
	}
}
