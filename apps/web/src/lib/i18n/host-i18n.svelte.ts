import type { HostMessageKey } from '$lib/i18n/host-messages';
import { HOST_UI_PLUGIN_ID } from '$lib/i18n/host-messages';
import { getAppEngine } from '$lib/services/app-engine';

let localeVersion = $state(0);
let configured = false;

export function configureHostI18n(options: {
	onLocaleChanged: (handler: () => void) => { dispose: () => void };
}): void {
	if (configured) return;
	configured = true;
	options.onLocaleChanged(() => {
		localeVersion++;
	});
}

export function hostT(key: HostMessageKey, params?: Record<string, unknown>): string {
	void localeVersion;
	const engine = getAppEngine();
	return engine.translateForPlugin(HOST_UI_PLUGIN_ID, key, params);
}
