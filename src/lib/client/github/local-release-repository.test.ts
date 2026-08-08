import { describe, expect, it } from 'vite-plus/test';
import { createLocalReleaseRepository } from './local-release-repository';

describe('LocalReleaseRepository', () => {
	it('returns the local release matching the tag', async () => {
		const repository = createLocalReleaseRepository();

		const result = await repository.fetchReleaseByTag('UE-DND', 'Chronos', 'v0.1.0');

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.tagName).toBe('v0.1.0');
		expect(result.value.name).toBe('Chronos 0.1.0');
		expect(result.value.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
		expect(result.value.body).toContain('## 更新内容');
		expect(result.value.body.startsWith('---')).toBe(false);
	});

	it('fails when the tag has no local release file', async () => {
		const repository = createLocalReleaseRepository();

		const result = await repository.fetchReleaseByTag('UE-DND', 'Chronos', 'v9.9.9');

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.message).toContain('v9.9.9');
	});
});
