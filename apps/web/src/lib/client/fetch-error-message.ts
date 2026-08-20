import { offlineCopy } from '$lib/platform/offline-copy';

export function resolveFetchErrorMessage(offline: boolean, fallback = '加载失败，请重试') {
	return offline ? offlineCopy.fetchError : fallback;
}
