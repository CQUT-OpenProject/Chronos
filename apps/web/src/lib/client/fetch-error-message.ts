import { hostT } from '$lib/i18n/host-i18n.svelte';

export function resolveFetchErrorMessage(offline: boolean, fallback?: string) {
	return offline ? hostT('offline.fetch.error') : (fallback ?? hostT('common.loadFailed'));
}
