import { interpolateMessage } from '@chronos/core';
import type { ReactiveChronosController } from '@chronos/ui-kit';
import { getAppController, getAppEngine } from '$lib/services/app-engine';
import { HOST_MESSAGES, type HostMessageKey } from '$lib/i18n/host-messages';

export const HOST_UI_PLUGIN_ID = 'host-ui';

export function hostText(key: HostMessageKey, params?: Record<string, unknown>): string {
	const engine = getAppEngine();
	const resolved = engine.translateForPlugin(HOST_UI_PLUGIN_ID, key, params);
	if (resolved !== key) return resolved;
	const fallback = HOST_MESSAGES['zh-cn'][key];
	return fallback ? interpolateMessage(fallback, params) : key;
}

/** Establish Svelte reactivity via controller locale / slotVersion. */
export function hostTextRead(
	controller: ReactiveChronosController | undefined,
	key: HostMessageKey,
	params?: Record<string, unknown>
): string {
	if (controller) {
		void controller.currentLocale;
		void controller.slotVersion;
	}
	return hostText(key, params);
}
