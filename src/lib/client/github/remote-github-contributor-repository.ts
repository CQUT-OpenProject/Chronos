import type { GithubContributor } from '$lib/models/auth';
import type { GithubContributorRepository } from '$lib/domain/interfaces/github-contributor-repository';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';

const USER_AGENT = 'Chronos-PWA';

export function createRemoteGithubContributorRepository(): GithubContributorRepository {
	return {
		async fetchContributors(owner, repo, limit) {
			const normalizedLimit = Math.max(1, limit);
			const requestUrl = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=${normalizedLimit}`;
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
						parseErrorMessage(body) ?? `GitHub contributors 请求失败：HTTP ${response.status}`;
					return failure(AppError.network(message));
				}
				return parseContributors(body);
			} catch (error) {
				return failure(
					AppError.network(
						error instanceof Error ? error.message : '无法获取 GitHub 贡献者信息，请检查网络后重试'
					)
				);
			}
		}
	};
}

function parseContributors(raw: string): AppResult<GithubContributor[]> {
	try {
		const element = JSON.parse(raw);
		if (!Array.isArray(element)) {
			if (element && typeof element === 'object' && 'message' in element) {
				const message = stringValue(element as Record<string, unknown>, 'message');
				return failure(AppError.network(message ?? 'GitHub contributors 接口返回异常'));
			}
			return failure(AppError.dataFormat('GitHub contributors 数据格式错误'));
		}

		const contributors = element
			.map((item) => {
				if (!item || typeof item !== 'object') return null;
				const record = item as Record<string, unknown>;
				const login = stringValue(record, 'login');
				const avatarUrl = stringValue(record, 'avatar_url');
				const htmlUrl = stringValue(record, 'html_url');
				if (!login || !avatarUrl || !htmlUrl) return null;
				return {
					login,
					avatarUrl,
					htmlUrl,
					contributions: numberValue(record, 'contributions') ?? 0
				};
			})
			.filter((entry): entry is GithubContributor => entry != null);

		return success(contributors);
	} catch {
		return failure(AppError.dataFormat('GitHub contributors 数据格式错误'));
	}
}

function stringValue(element: Record<string, unknown>, key: string): string | undefined {
	const value = element[key];
	return typeof value === 'string' ? value : undefined;
}

function numberValue(element: Record<string, unknown>, key: string): number | undefined {
	const value = element[key];
	return typeof value === 'number' ? value : undefined;
}

function parseErrorMessage(raw: string): string | undefined {
	try {
		const element = JSON.parse(raw) as Record<string, unknown>;
		return stringValue(element, 'message');
	} catch {
		return undefined;
	}
}
