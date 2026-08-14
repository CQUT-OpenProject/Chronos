import { describe, expect, it } from 'vite-plus/test';
import { createLocalReleaseCatalog } from './local-catalog';

describe('LocalReleaseCatalog', () => {
	it('returns the local release matching the tag', async () => {
		const catalog = createLocalReleaseCatalog();

		const listResult = await catalog.listReleases();
		expect(listResult.ok).toBe(true);
		if (!listResult.ok) return;

		const sample = listResult.value[0];
		const result = await catalog.getRelease(sample.tagName);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value).toEqual(sample);
		expect(result.value.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
		expect(result.value.body.startsWith('---')).toBe(false);
	});

	it('fails when the tag has no local release file', async () => {
		const catalog = createLocalReleaseCatalog();

		const result = await catalog.getRelease('v9.9.9');

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.error.message).toContain('v9.9.9');
	});

	it('returns all local releases sorted by publishedAt descending', async () => {
		const catalog = createLocalReleaseCatalog();

		const result = await catalog.listReleases();

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value.length).toBeGreaterThan(0);
		for (const release of result.value) {
			expect(release.tagName).toMatch(/^v\d+\.\d+\.\d+$/);
			expect(release.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
		}
		for (let i = 1; i < result.value.length; i++) {
			expect(
				result.value[i - 1].publishedAt.localeCompare(result.value[i].publishedAt)
			).toBeGreaterThanOrEqual(0);
		}
	});
});
