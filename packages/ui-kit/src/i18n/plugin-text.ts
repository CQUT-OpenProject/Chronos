import { interpolateMessage, type PluginMessageCatalog } from '@chronos/core';
import type { ChronosUiController } from '../reactivity/chronos-ui-controller';

export function pluginText<M extends PluginMessageCatalog>(
	controller: ChronosUiController | undefined,
	pluginId: string,
	messages: M,
	key: keyof M['zh-cn'] & string,
	params?: Record<string, unknown>
): string {
	const fallback =
		messages['zh-cn'][key] ?? messages.en?.[key as keyof M['en'] & string] ?? String(key);
	if (!controller) return interpolateMessage(fallback, params);
	if ('slotVersion' in controller) {
		void (controller as { slotVersion: number }).slotVersion;
	}
	const resolved = controller.translatePlugin(pluginId, key, params);
	return resolved === key ? interpolateMessage(fallback, params) : resolved;
}
