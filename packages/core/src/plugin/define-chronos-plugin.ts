import type { ChronosContext, ChronosPlugin, PluginCategory } from '../types/context';
import type { ConfigSchema } from '../schema/schema';
import type { PluginMessageCatalog } from '../i18n/i18n-catalog';

export type PluginTranslate = (key: string, params?: Record<string, unknown>) => string;

export interface DefineChronosPluginOptions<Config extends object = Record<string, unknown>> {
	readonly id: string;
	readonly messages: PluginMessageCatalog;
	readonly nameKey: string;
	readonly descriptionKey?: string;
	readonly version?: string;
	readonly category?: PluginCategory;
	readonly order?: number;
	readonly author?: string;
	readonly homepage?: string;
	readonly configSchema?: ConfigSchema<Config>;
	readonly defaultConfig?: Config;
	readonly allowedDomains?: string[];
	readonly apply: (ctx: ChronosContext<Config>, t: PluginTranslate) => void | Promise<void>;
	readonly dispose?: () => void | Promise<void>;
}

function resolveMessageFallback(
	messages: PluginMessageCatalog,
	key: string,
	locale = 'zh-cn'
): string {
	return messages[locale]?.[key] ?? messages.en?.[key] ?? key;
}

declare const __CHRONOS_PLUGIN_VERSION__: string | undefined;

function readBundledPluginVersion(): string {
	if (typeof __CHRONOS_PLUGIN_VERSION__ === 'string' && __CHRONOS_PLUGIN_VERSION__) {
		return __CHRONOS_PLUGIN_VERSION__;
	}
	return '1.0.0';
}

export function defineChronosPlugin<Config extends object = Record<string, unknown>>(
	options: DefineChronosPluginOptions<Config>
): ChronosPlugin<Config> {
	let translate: PluginTranslate | undefined;

	return {
		id: options.id,
		name: () =>
			translate?.(options.nameKey) ?? resolveMessageFallback(options.messages, options.nameKey),
		version: options.version ?? readBundledPluginVersion(),
		description: options.descriptionKey
			? () =>
					translate?.(options.descriptionKey!) ??
					resolveMessageFallback(options.messages, options.descriptionKey!)
			: undefined,
		category: options.category,
		order: options.order,
		author: options.author,
		homepage: options.homepage,
		configSchema: options.configSchema,
		defaultConfig: options.defaultConfig,
		allowedDomains: options.allowedDomains,
		async apply(ctx) {
			ctx.i18n.registerMessages(options.messages);
			const t: PluginTranslate = (key, params) => ctx.i18n.t(key, params);
			translate = t;
			await options.apply(ctx, t);
		},
		dispose: options.dispose
	};
}
