import { describe, expect, it } from 'vite-plus/test';
import { getLatestReleaseFromEntries } from './version-generator';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

describe('version-generator', () => {
	it('reads entries from folder and gets latest release', () => {
		const entriesDir = resolve(dirname(fileURLToPath(import.meta.url)), './entries');
		const latest = getLatestReleaseFromEntries(entriesDir);
		expect(latest).not.toBeNull();
		if (latest) {
			expect(latest.tagName).toBe('v0.2.2');
			expect(latest.name).toBe('Chronos 0.2.2');
			expect(latest.publishedAt).toBe('2026-08-20');
			expect(latest.body).toContain('优化了应用性能');
		}
	});
});
