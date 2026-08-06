import type { GithubRelease } from '$lib/models/auth';
import type { GithubReleaseRepository } from '../interfaces/github-release-repository';
import type { AppResult } from '../result/app-result';

const REPO_OWNER = 'UE-DND';
const REPO_NAME = 'Chronos';

export class GetGithubReleaseByTagUseCase {
	constructor(private readonly repository: GithubReleaseRepository) {}

	async invoke(appVersionName: string): Promise<AppResult<GithubRelease>> {
		return this.repository.fetchReleaseByTag(REPO_OWNER, REPO_NAME, normalizeTag(appVersionName));
	}
}

export function normalizeTag(appVersionName: string): string {
	const normalized = appVersionName.trim();
	if (!normalized) return 'v0.0.0';
	return normalized.toLowerCase().startsWith('v') ? `v${normalized.slice(1)}` : `v${normalized}`;
}
