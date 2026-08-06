import type { GithubContributor } from '$lib/models/auth';
import type { GithubContributorRepository } from '../interfaces/github-contributor-repository';
import type { AppResult } from '../result/app-result';

const REPO_OWNER = 'UE-DND';
const REPO_NAME = 'Chronos';
const DEFAULT_LIMIT = 5;

export class GetGithubContributorsUseCase {
	constructor(private readonly repository: GithubContributorRepository) {}

	async invoke(limit = DEFAULT_LIMIT): Promise<AppResult<GithubContributor[]>> {
		return this.repository.fetchContributors(REPO_OWNER, REPO_NAME, limit);
	}
}
