import { describe, expect, it, vi } from 'vite-plus/test';
import { createRemoteGithubReleaseRepository } from './remote-github-release-repository';

describe('RemoteGithubReleaseRepository', () => {
	it('parses successful release payload', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: async () =>
				JSON.stringify({
					tag_name: 'v1.0.0',
					name: 'Chronos 1.0.0',
					published_at: '2026-03-21T00:00:00Z',
					body: 'Release notes',
					html_url: 'https://github.com/CQUT-OpenProject/Chronos/releases/tag/v1.0.0'
				})
		});
		vi.stubGlobal('fetch', fetchMock);

		const repository = createRemoteGithubReleaseRepository();
		const result = await repository.fetchReleaseByTag('UE-DND', 'Chronos', 'v1.0.0');

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.tagName).toBe('v1.0.0');
			expect(result.value.name).toBe('Chronos 1.0.0');
		}
	});

	it('maps HTTP errors to network failures', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			text: async () => JSON.stringify({ message: 'Not Found' })
		});
		vi.stubGlobal('fetch', fetchMock);

		const repository = createRemoteGithubReleaseRepository();
		const result = await repository.fetchReleaseByTag('UE-DND', 'Chronos', 'v0.0.0');

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.kind).toBe('Network');
		}
	});
});
