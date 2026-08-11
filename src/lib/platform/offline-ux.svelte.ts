import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
import type { ConnectivityReader } from '$lib/platform/connectivity.svelte';
import { offlineCopy } from '$lib/platform/offline-copy';

const ONLINE_SNACKBAR_DURATION = 2000;

export type SnackbarFn = typeof snackbar;

export function applyOfflineUxTransition(
	online: boolean,
	previousOnline: boolean | undefined,
	snackbarFn: SnackbarFn
): boolean {
	if (previousOnline === undefined) {
		if (!online) {
			snackbarFn(offlineCopy.snackbarOffline);
		}
		return online;
	}

	if (online === previousOnline) {
		return previousOnline;
	}

	if (online) {
		snackbarFn(offlineCopy.snackbarOnline, undefined, ONLINE_SNACKBAR_DURATION);
	} else {
		snackbarFn(offlineCopy.snackbarOffline);
	}

	return online;
}

export function attachOfflineUx(
	connectivity: ConnectivityReader,
	snackbarFn: SnackbarFn = snackbar
): () => void {
	let previousOnline: boolean | undefined;

	return $effect.root(() => {
		$effect(() => {
			previousOnline = applyOfflineUxTransition(connectivity.isOnline, previousOnline, snackbarFn);
		});
	});
}
