import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
import type { ConnectivityController } from '$lib/client/network-status.svelte';

const OFFLINE_SNACKBAR_MESSAGE = '当前处于离线状态';
const ONLINE_SNACKBAR_MESSAGE = '网络已恢复';
const ONLINE_SNACKBAR_DURATION = 2000;

export type SnackbarFn = typeof snackbar;

export function applyOfflineUxTransition(
	online: boolean,
	previousOnline: boolean | undefined,
	snackbarFn: SnackbarFn
): boolean {
	if (previousOnline === undefined) {
		if (!online) {
			snackbarFn(OFFLINE_SNACKBAR_MESSAGE);
		}
		return online;
	}

	if (online === previousOnline) {
		return previousOnline;
	}

	if (online) {
		snackbarFn(ONLINE_SNACKBAR_MESSAGE, undefined, ONLINE_SNACKBAR_DURATION);
	} else {
		snackbarFn(OFFLINE_SNACKBAR_MESSAGE);
	}

	return online;
}

export function attachOfflineUx(
	connectivity: ConnectivityController,
	snackbarFn: SnackbarFn = snackbar
): () => void {
	let previousOnline: boolean | undefined;

	return $effect.root(() => {
		$effect(() => {
			previousOnline = applyOfflineUxTransition(connectivity.isOnline, previousOnline, snackbarFn);
		});
	});
}
