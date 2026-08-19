import { base } from '$app/paths';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';
import { createLocalReleaseCatalog } from './local-catalog';
import type { ReleaseCatalog } from './catalog';
import type { Release } from './release';

/**
 * Seam for fetching remote or local release changelog feed.
 */
export interface ReleaseFeedAdapter {
	fetchLatestRelease(): Promise<AppResult<Release>>;
}

export async function fetchLatestProjectRelease(
	fetchFn: typeof fetch = fetch,
	versionUrl = `${base}/version.json`
): Promise<AppResult<Release>> {
	try {
		const targetUrl = `${versionUrl}?t=${Date.now()}`;
		const response = await fetchFn(targetUrl, {
			cache: 'no-store',
			signal:
				typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
					? AbortSignal.timeout(8000)
					: undefined
		});

		if (response.status === 404) {
			return failure(AppError.notFound('未在服务器找到版本发布记录'));
		}
		if (!response.ok) {
			return failure(AppError.network(`检查更新失败 (HTTP ${response.status})`));
		}

		const data = (await response.json()) as {
			tagName?: string;
			name?: string;
			publishedAt?: string;
			body?: string;
		};

		if (!data?.tagName?.trim()) {
			return failure(AppError.dataFormat('版本发布数据格式无效'));
		}

		return success({
			tagName: data.tagName,
			name: data.name || data.tagName,
			publishedAt: data.publishedAt || '',
			body: data.body || ''
		});
	} catch (error) {
		const message =
			error instanceof Error && error.name === 'AbortError'
				? '检查更新超时，请检查网络连接'
				: error instanceof Error
					? error.message
					: '网络连接异常，无法获取更新信息';
		return failure(AppError.network(message));
	}
}

export function createReleaseFeedAdapter(
	options: {
		fetchFn?: typeof fetch;
		versionUrl?: string;
		fetchLatestRelease?: () => Promise<AppResult<Release>>;
		localCatalog?: ReleaseCatalog;
	} = {}
): ReleaseFeedAdapter {
	const {
		fetchFn = fetch,
		versionUrl,
		fetchLatestRelease: customFetchRelease,
		localCatalog = createLocalReleaseCatalog()
	} = options;

	return {
		async fetchLatestRelease(): Promise<AppResult<Release>> {
			const remoteResult = customFetchRelease
				? await customFetchRelease()
				: await fetchLatestProjectRelease(fetchFn, versionUrl);
			if (remoteResult.ok) {
				return remoteResult;
			}

			// Fallback to local catalog when offline or remote unavailable
			const localResult = await localCatalog.listReleases();
			if (localResult.ok && localResult.value.length > 0) {
				return success(localResult.value[0]!);
			}

			return remoteResult;
		}
	};
}
