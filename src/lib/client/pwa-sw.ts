import { registerSW } from 'virtual:pwa-register';
import { trackEvent } from '$lib/client/analytics';
import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

let registered = false;

export let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined;

export function ensurePwaSwRegistered() {
	if (registered || typeof window === 'undefined') return;
	registered = true;

	updateServiceWorker = registerSW({
		immediate: true,
		onNeedRefresh() {
			trackEvent('pwa_update_available');
			snackbar('新版本可用，点击刷新即可更新', {
				label: '刷新',
				onClick: () => {
					trackEvent('pwa_update_apply');
					void updateServiceWorker?.();
				}
			});
		}
	});
}
