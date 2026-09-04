import { resolve } from '$app/paths';
import { hostT } from '$lib/i18n/host-i18n.svelte';
import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
import { onSwUpdateAvailable } from '$lib/client/pwa-sw';

let initialized = false;

export function initPwaUpdateUx() {
	if (initialized || typeof window === 'undefined') return;
	initialized = true;

	onSwUpdateAvailable(() => {
		snackbarKey(
			'pwa.snackbar.updateAvailable',
			undefined,
			{
				label: hostT('pwa.snackbar.updateAction'),
				onClick: () => {
					window.location.assign(resolve('/about/update'));
				}
			},
			8000
		);
	});
}
