import { describe, expect, it } from 'vite-plus/test';
import type { GithubContributorRepository } from '$lib/domain/interfaces/github-contributor-repository';
import { success } from '$lib/domain/result/app-result';
import { GetGithubContributorsUseCase } from './get-github-contributors';

describe('GetGithubContributorsUseCase', () => {
	it('invoke passes repository owner repo and limit', async () => {
		const repository = new FakeGithubContributorRepository(
			success([
				{
					login: 'alice',
					avatarUrl: 'https://avatars.githubusercontent.com/u/1',
					htmlUrl: 'https://github.com/alice',
					contributions: 12
				}
			])
		);
		const useCase = new GetGithubContributorsUseCase(repository);

		const result = await useCase.invoke(3);

		expect(result.ok).toBe(true);
		expect(repository.lastOwner).toBe('UE-DND');
		expect(repository.lastRepo).toBe('Chronos');
		expect(repository.lastLimit).toBe(3);
	});
});

class FakeGithubContributorRepository implements GithubContributorRepository {
	lastOwner: string | null = null;
	lastRepo: string | null = null;
	lastLimit: number | null = null;

	constructor(
		private readonly result: Awaited<ReturnType<GithubContributorRepository['fetchContributors']>>
	) {}

	async fetchContributors(owner: string, repo: string, limit: number) {
		this.lastOwner = owner;
		this.lastRepo = repo;
		this.lastLimit = limit;
		return this.result;
	}
}
