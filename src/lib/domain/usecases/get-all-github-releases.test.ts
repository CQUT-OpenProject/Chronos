import { describe, expect, it } from 'vite-plus/test';
import type { GithubReleaseRepository } from '$lib/domain/interfaces/github-release-repository';
import { success } from '$lib/domain/result/app-result';
import { GetAllGithubReleasesUseCase } from './get-all-github-releases';

describe('GetAllGithubReleasesUseCase', () => {
	it('invoke returns all releases from repository', async () => {
		const releases = [
			{
				tagName: 'v1.0.0',
				name: 'Chronos 1.0.0',
				publishedAt: '2026-03-21',
				body: 'Release notes',
				htmlUrl: ''
			}
		];
		const repository: GithubReleaseRepository = {
			fetchReleaseByTag: async () => success(releases[0]),
			fetchAllReleases: async () => success(releases)
		};
		const useCase = new GetAllGithubReleasesUseCase(repository);

		const result = await useCase.invoke();

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value).toEqual(releases);
	});
});
