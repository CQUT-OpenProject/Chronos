import { GetGithubReleaseByTagUseCase } from '$lib/domain/usecases/get-github-release-by-tag';
import { GetGithubContributorsUseCase } from '$lib/domain/usecases/get-github-contributors';
import { createRemoteGithubReleaseRepository } from './github/remote-github-release-repository';
import { createRemoteGithubContributorRepository } from './github/remote-github-contributor-repository';

export function createGithubServices(
	releaseRepository = createRemoteGithubReleaseRepository(),
	contributorRepository = createRemoteGithubContributorRepository()
) {
	return {
		getReleaseByTag: new GetGithubReleaseByTagUseCase(releaseRepository),
		getContributors: new GetGithubContributorsUseCase(contributorRepository)
	};
}

export type GithubServices = ReturnType<typeof createGithubServices>;
