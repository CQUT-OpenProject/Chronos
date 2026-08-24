import { hostT } from '$lib/i18n/host-i18n.svelte';

export const offlineCopy = {
	get snackbarOffline() {
		return hostT('offline.snackbar.offline');
	},
	get snackbarOnline() {
		return hostT('offline.snackbar.online');
	},
	get fetchError() {
		return hostT('offline.fetch.error');
	},
	get fetchTitle() {
		return hostT('offline.fetch.title');
	},
	get fetchDescription() {
		return hostT('offline.fetch.description');
	},
	get onlineImportBlocked() {
		return hostT('offline.import.blocked');
	}
} as const;
