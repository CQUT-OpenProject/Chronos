import { registerSW } from 'virtual:pwa-register';
import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

let registered = false;

export let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined;

export function ensurePwaSwRegistered() {
	if (registered || typeof window === 'undefined') return;
	registered = true;

	updateServiceWorker = registerSW({
		immediate: true,
		onNeedRefresh() {
			snackbar('新版本可用，点击刷新即可更新', {
				label: '刷新',
				onClick: () => {
					void updateServiceWorker?.();
				}
			});
		}
	});
}
