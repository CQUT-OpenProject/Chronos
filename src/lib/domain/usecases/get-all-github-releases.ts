import type { GithubRelease } from '$lib/models/auth';
import type { GithubReleaseRepository } from '../interfaces/github-release-repository';
import type { AppResult } from '../result/app-result';

export class GetAllGithubReleasesUseCase {
	constructor(private readonly repository: GithubReleaseRepository) {}

	async invoke(): Promise<AppResult<GithubRelease[]>> {
		return this.repository.fetchAllReleases();
	}
}
