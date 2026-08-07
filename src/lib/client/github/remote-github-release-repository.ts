import type { GithubRelease } from '$lib/models/auth';
import type { GithubReleaseRepository } from '$lib/domain/interfaces/github-release-repository';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';

const USER_AGENT = 'Chronos-PWA';

export function createRemoteGithubReleaseRepository(): GithubReleaseRepository {
	return {
		async fetchReleaseByTag(owner, repo, tag) {
			const requestUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;
			try {
				const response = await fetch(requestUrl, {
					headers: {
						Accept: 'application/vnd.github+json',
						'X-GitHub-Api-Version': '2022-11-28',
						'User-Agent': USER_AGENT
					}
				});
				const body = await response.text();
				if (!response.ok) {
					const message =
						parseErrorMessage(body) ?? `GitHub release 请求失败：HTTP ${response.status}`;
					return failure(AppError.network(message));
				}
				return parseRelease(body);
			} catch (error) {
				return failure(
					AppError.network(
						error instanceof Error
							? error.message
							: '无法获取 GitHub Release 信息，请检查网络后重试'
					)
				);
			}
		}
	};
}

function parseRelease(raw: string): AppResult<GithubRelease> {
	try {
		const element = JSON.parse(raw) as Record<string, unknown>;
		const message = stringValue(element, 'message');
		if (message) {
			return failure(AppError.network(message));
		}
		return success({
			tagName: stringValue(element, 'tag_name') ?? '',
			name: stringValue(element, 'name') ?? '',
			publishedAt: stringValue(element, 'published_at') ?? '',
			body: stringValue(element, 'body') ?? '',
			htmlUrl: stringValue(element, 'html_url') ?? ''
		});
	} catch {
		return failure(AppError.dataFormat('GitHub release 数据格式错误'));
	}
}

function stringValue(element: Record<string, unknown>, key: string): string | undefined {
	const value = element[key];
	return typeof value === 'string' ? value : undefined;
}

function parseErrorMessage(raw: string): string | undefined {
	try {
		const element = JSON.parse(raw) as Record<string, unknown>;
		return stringValue(element, 'message');
	} catch {
		return undefined;
	}
}
