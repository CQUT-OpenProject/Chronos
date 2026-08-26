import type { PluginScreenSlotContribution } from '@chronos/core';

/** Match screen slot when route is `/plugins/[pluginId]` (view defaults to index) or `/plugins/[pluginId]/[view]`. */
export function resolvePluginScreenSlot(
	slots: PluginScreenSlotContribution[],
	pluginId: string,
	viewId: string
): PluginScreenSlotContribution | undefined {
	return slots.find(
		(s) => s.id === viewId || s.id === pluginId || s.id === `${pluginId}/${viewId}`
	);
}
