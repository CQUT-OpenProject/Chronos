import { hostText } from '$lib/i18n/host-text';

export function resolveFetchErrorMessage(offline: boolean, fallback?: string) {
	return offline ? hostText('offline.fetch.error') : (fallback ?? hostText('common.loadFailed'));
}
