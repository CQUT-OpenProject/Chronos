import { resolve } from '$app/paths';
import { hostT } from '$lib/i18n/host-i18n.svelte';
import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
import { onSwUpdateAvailable } from '$lib/client/pwa-sw';

const UPDATE_PROMPT_SESSION_KEY = 'chronos:pwa-update-prompt-shown';

let initialized = false;

function hasShownUpdatePromptThisSession(): boolean {
	try {
		return sessionStorage.getItem(UPDATE_PROMPT_SESSION_KEY) === '1';
	} catch {
		return false;
	}
}

function markUpdatePromptShownThisSession(): void {
	try {
		sessionStorage.setItem(UPDATE_PROMPT_SESSION_KEY, '1');
	} catch {
		// ignore storage errors
	}
}

export function initPwaUpdateUx() {
	if (initialized || typeof window === 'undefined') return;
	initialized = true;

	onSwUpdateAvailable(() => {
		if (hasShownUpdatePromptThisSession()) return;
		markUpdatePromptShownThisSession();

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
