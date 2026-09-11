import { hostT } from '$lib/i18n/host-i18n.svelte';

import type { HostMessageKey } from '$lib/i18n/host-messages';

export type SnackbarAction = { label: string; onClick: () => void };
export type SnackbarPriority = 'polite' | 'assertive';

export const SNACKBAR_LOCK_DURATION_MS = 1000;

export const snackbarStore = $state<{
	open: boolean;
	message: string;
	action: SnackbarAction | null;
	priority: SnackbarPriority;
	canDismissOutside: boolean;
}>({
	open: false,
	message: '',
	action: null,
	priority: 'polite',
	canDismissOutside: false
});

let timer: ReturnType<typeof setTimeout> | null = null;
let lockTimer: ReturnType<typeof setTimeout> | null = null;

function showSnackbar(
	message: string,
	action?: SnackbarAction,
	duration = 4000,
	priority: SnackbarPriority = 'polite'
) {
	if (timer) clearTimeout(timer);
	if (lockTimer) clearTimeout(lockTimer);

	snackbarStore.message = message;
	snackbarStore.action = action ?? null;
	snackbarStore.priority = priority;
	snackbarStore.open = true;
	snackbarStore.canDismissOutside = false;

	const lockDuration = Math.min(SNACKBAR_LOCK_DURATION_MS, duration);
	lockTimer = setTimeout(() => {
		snackbarStore.canDismissOutside = true;
	}, lockDuration);

	timer = setTimeout(() => {
		dismissSnackbar();
	}, duration);
}

export function snackbar(
	message: string,
	action?: SnackbarAction,
	duration = 4000,
	priority: SnackbarPriority = 'polite'
) {
	showSnackbar(message, action, duration, priority);
}

export function snackbarKey(
	key: HostMessageKey,
	params?: Record<string, unknown>,
	action?: SnackbarAction,
	duration = 4000,
	priority: SnackbarPriority = 'polite'
) {
	showSnackbar(hostT(key, params), action, duration, priority);
}

export function dismissSnackbar() {
	if (timer) clearTimeout(timer);
	if (lockTimer) clearTimeout(lockTimer);
	snackbarStore.open = false;
	snackbarStore.canDismissOutside = false;
}
