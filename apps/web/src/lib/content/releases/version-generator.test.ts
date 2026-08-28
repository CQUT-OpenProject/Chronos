import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import { getLatestReleaseFromEntries } from './version-generator';

describe('version-generator', () => {
	let entriesDir: string;

	beforeEach(() => {
		entriesDir = mkdtempSync(join(tmpdir(), 'chronos-release-entries-'));
		writeFileSync(
			join(entriesDir, 'v1.0.0.md'),
			`---
name: Chronos 1.0.0
publishedAt: 2026-01-01
---

- first release`
		);
		writeFileSync(
			join(entriesDir, 'v2.0.0.md'),
			`---
name: Chronos 2.0.0
publishedAt: 2026-02-01
---

- latest release`
		);
		writeFileSync(
			join(entriesDir, 'v1.5.0.md'),
			`---
name: Chronos 1.5.0
publishedAt: 2026-01-15
---

- middle release`
		);
	});

	afterEach(() => {
		rmSync(entriesDir, { recursive: true, force: true });
	});

	it('returns the highest semver from entry files', () => {
		const latest = getLatestReleaseFromEntries(entriesDir);
		expect(latest).toEqual({
			tagName: 'v2.0.0',
			name: 'Chronos 2.0.0',
			publishedAt: '2026-02-01',
			body: '- latest release'
		});
	});

	it('returns null when the entries directory does not exist', () => {
		expect(getLatestReleaseFromEntries(join(entriesDir, 'missing'))).toBeNull();
	});

	it('returns null when the entries directory is empty', () => {
		const emptyDir = mkdtempSync(join(tmpdir(), 'chronos-release-empty-'));
		try {
			expect(getLatestReleaseFromEntries(emptyDir)).toBeNull();
		} finally {
			rmSync(emptyDir, { recursive: true, force: true });
		}
	});
});
