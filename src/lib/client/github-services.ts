import { GetGithubReleaseByTagUseCase } from '$lib/domain/usecases/get-github-release-by-tag';
import { GetGithubContributorsUseCase } from '$lib/domain/usecases/get-github-contributors';
import { createLocalReleaseRepository } from './github/local-release-repository';
import { createRemoteGithubContributorRepository } from './github/remote-github-contributor-repository';

export function createGithubServices(
	releaseRepository = createLocalReleaseRepository(),
	contributorRepository = createRemoteGithubContributorRepository()
) {
	return {
		getReleaseByTag: new GetGithubReleaseByTagUseCase(releaseRepository),
		getContributors: new GetGithubContributorsUseCase(contributorRepository)
	};
}

export type GithubServices = ReturnType<typeof createGithubServices>;
