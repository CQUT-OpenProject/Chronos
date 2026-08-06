import type { GithubContributor } from '$lib/models/auth';
import type { AppResult } from '../result';

export interface GithubContributorRepository {
	fetchContributors(
		owner: string,
		repo: string,
		limit: number
	): Promise<AppResult<GithubContributor[]>>;
}
