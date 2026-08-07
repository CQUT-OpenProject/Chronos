import { describe, expect, it } from 'vite-plus/test';
import type { GithubReleaseRepository } from '$lib/domain/interfaces/github-release-repository';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success } from '$lib/domain/result/app-result';
import { GetGithubReleaseByTagUseCase } from './get-github-release-by-tag';

describe('GetGithubReleaseByTagUseCase', () => {
	it('invoke passes repository and returns success result', async () => {
		const repository = new FakeGithubReleaseRepository(
			success({
				tagName: 'v1.0.0',
				name: 'Chronos 1.0.0',
				publishedAt: '2026-03-21T00:00:00Z',
				body: 'Release notes',
				htmlUrl: 'https://github.com/CQUT-OpenProject/Chronos/releases/tag/v1.0.0'
			})
		);
		const useCase = new GetGithubReleaseByTagUseCase(repository);

		const result = await useCase.invoke('1.0.0');

		expect(result.ok).toBe(true);
		expect(repository.lastOwner).toBe('UE-DND');
		expect(repository.lastRepo).toBe('Chronos');
		expect(repository.lastTag).toBe('v1.0.0');
	});

	it('invoke keeps v prefix when version already has it', async () => {
		const repository = new FakeGithubReleaseRepository(failure(AppError.network('network failed')));
		const useCase = new GetGithubReleaseByTagUseCase(repository);

		const result = await useCase.invoke('v1.0.0');

		expect(result.ok).toBe(false);
		expect(repository.lastTag).toBe('v1.0.0');
	});
});

class FakeGithubReleaseRepository implements GithubReleaseRepository {
	lastOwner: string | null = null;
	lastRepo: string | null = null;
	lastTag: string | null = null;

	constructor(
		private readonly result: Awaited<ReturnType<GithubReleaseRepository['fetchReleaseByTag']>>
	) {}

	async fetchReleaseByTag(owner: string, repo: string, tag: string) {
		this.lastOwner = owner;
		this.lastRepo = repo;
		this.lastTag = tag;
		return this.result;
	}
}
