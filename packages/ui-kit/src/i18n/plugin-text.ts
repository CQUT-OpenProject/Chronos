import { interpolateMessage, type PluginMessageCatalog } from '@chronos/core';
import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';

export function pluginText<M extends PluginMessageCatalog>(
	controller: ReactiveChronosController | undefined,
	pluginId: string,
	messages: M,
	key: keyof M['zh-cn'] & string,
	params?: Record<string, unknown>
): string {
	const fallback =
		messages['zh-cn'][key] ?? messages.en?.[key as keyof M['en'] & string] ?? String(key);
	if (!controller) return interpolateMessage(fallback, params);
	void controller.slotVersion;
	const resolved = controller.translatePlugin(pluginId, key, params);
	return resolved === key ? interpolateMessage(fallback, params) : resolved;
}
