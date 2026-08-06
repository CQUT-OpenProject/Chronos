import type { GithubRelease } from '$lib/models/auth';
import type { AppResult } from '../result';

export interface GithubReleaseRepository {
	fetchReleaseByTag(owner: string, repo: string, tag: string): Promise<AppResult<GithubRelease>>;
}
