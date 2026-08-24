import { hostText } from '$lib/i18n/host-text';

export const offlineCopy = {
	get snackbarOffline() {
		return hostText('offline.snackbar.offline');
	},
	get snackbarOnline() {
		return hostText('offline.snackbar.online');
	},
	get fetchError() {
		return hostText('offline.fetch.error');
	},
	get fetchTitle() {
		return hostText('offline.fetch.title');
	},
	get fetchDescription() {
		return hostText('offline.fetch.description');
	},
	get onlineImportBlocked() {
		return hostText('offline.import.blocked');
	}
} as const;
