import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';
import { createLocalReleaseCatalog } from './local-catalog';
import type { ReleaseCatalog } from './catalog';
import type { Release } from './release';

const GITHUB_REPO = 'CQUT-OpenProject/Chronos';

/**
 * Seam for fetching remote or local release changelog feed.
 */
export interface ReleaseFeedAdapter {
	fetchLatestRelease(): Promise<AppResult<Release>>;
}

export async function fetchLatestGitHubRelease(
	repo = GITHUB_REPO,
	fetchFn: typeof fetch = fetch
): Promise<AppResult<Release>> {
	try {
		const response = await fetchFn(`https://api.github.com/repos/${repo}/releases/latest`, {
			headers: { Accept: 'application/vnd.github+json' },
			signal:
				typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
					? AbortSignal.timeout(8000)
					: undefined
		});

		if (response.status === 404) {
			return failure(AppError.notFound('未在 GitHub 找到发布记录'));
		}
		if (!response.ok) {
			return failure(AppError.network(`检查更新失败 (HTTP ${response.status})`));
		}

		const data = (await response.json()) as {
			tag_name?: string;
			name?: string;
			published_at?: string;
			body?: string;
		};

		if (!data?.tag_name?.trim()) {
			return failure(AppError.dataFormat('GitHub Release 数据格式无效'));
		}

		return success({
			tagName: data.tag_name,
			name: data.name || data.tag_name,
			publishedAt: data.published_at || '',
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
		repo?: string;
		fetchFn?: typeof fetch;
		fetchLatestRelease?: () => Promise<AppResult<Release>>;
		localCatalog?: ReleaseCatalog;
	} = {}
): ReleaseFeedAdapter {
	const {
		repo = GITHUB_REPO,
		fetchFn = fetch,
		fetchLatestRelease: customFetchRelease,
		localCatalog = createLocalReleaseCatalog()
	} = options;

	return {
		async fetchLatestRelease(): Promise<AppResult<Release>> {
			const remoteResult = customFetchRelease
				? await customFetchRelease()
				: await fetchLatestGitHubRelease(repo, fetchFn);
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
