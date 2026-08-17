import { registerSW } from 'virtual:pwa-register';

let registered = false;
let needRefresh = false;

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined;

export function isSwUpdatePending(): boolean {
	return needRefresh;
}

export function ensurePwaSwRegistered() {
	if (registered || typeof window === 'undefined') return;
	registered = true;

	updateServiceWorker = registerSW({
		immediate: true,
		onNeedRefresh() {
			needRefresh = true;
		}
	});
}

export async function checkAndApplySwUpdate(): Promise<boolean> {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
	try {
		const registration = await navigator.serviceWorker.getRegistration();
		if (registration) {
			await registration.update();
			if (registration.waiting) {
				needRefresh = true;
				return true;
			}
		}
	} catch {
		// ignore
	}
	return needRefresh;
}

export async function applyUpdateAndReload(): Promise<void> {
	if (typeof window === 'undefined') return;
	try {
		if (updateServiceWorker) {
			await updateServiceWorker(true);
			return;
		}
	} catch {
		// fallback
	}
	window.location.reload();
}
