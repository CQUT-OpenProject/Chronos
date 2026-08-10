export function resolveFetchErrorMessage(offline: boolean, fallback = '加载失败，请重试') {
	return offline ? '当前处于离线状态，无法加载内容。连接网络后重试。' : fallback;
}
