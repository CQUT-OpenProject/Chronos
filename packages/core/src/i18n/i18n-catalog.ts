import type { Disposable } from '../types/services';

export type PluginMessageCatalog = Record<string, Record<string, string>>;

function normalizeLocale(locale: string): string {
	return locale.toLowerCase().replace('_', '-');
}

/**
 * Merged plugin message catalogs keyed by namespaced message id (`pluginId:key`).
 */
export class I18nCatalog {
	private catalogs = new Map<string, Record<string, string>>();

	register(pluginId: string, messages: PluginMessageCatalog): Disposable {
		const merged: Record<string, string> = { ...this.catalogs.get(pluginId) };
		for (const [locale, entries] of Object.entries(messages)) {
			const normalizedLocale = normalizeLocale(locale);
			for (const [key, value] of Object.entries(entries)) {
				merged[`${normalizedLocale}:${key}`] = value;
			}
		}
		this.catalogs.set(pluginId, merged);
		return {
			dispose: () => {
				this.catalogs.delete(pluginId);
			}
		};
	}

	t(pluginId: string, key: string, locale: string, fallback?: string): string | undefined {
		const catalog = this.catalogs.get(pluginId);
		if (!catalog) return fallback;
		const normalizedLocale = normalizeLocale(locale);
		return catalog[`${normalizedLocale}:${key}`] ?? fallback;
	}

	disposePlugin(pluginId: string): void {
		this.catalogs.delete(pluginId);
	}

	dispose(): void {
		this.catalogs.clear();
	}
}

export function interpolateMessage(template: string, params?: Record<string, unknown>): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (_, name: string) => {
		const value = params[name];
		return value === undefined || value === null
			? `{${name}}`
			: typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
				? String(value)
				: JSON.stringify(value);
	});
}

/** Resolve manifest-style locale maps (`zh-CN` / `zh-cn` / `en`) for a target locale. */
export function resolveLocaleMapText(
	map: Record<string, string> | undefined | null,
	locale: string,
	fallback = ''
): string {
	if (!map) return fallback;
	const normalized = normalizeLocale(locale);
	return (
		map[normalized] ??
		map['zh-CN'] ??
		map['zh-cn'] ??
		map['en'] ??
		Object.values(map)[0] ??
		fallback
	);
}
