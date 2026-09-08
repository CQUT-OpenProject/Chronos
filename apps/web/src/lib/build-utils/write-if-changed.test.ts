import { describe, expect, it } from 'vite-plus/test';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeIfChanged } from './write-if-changed';

describe('writeIfChanged', () => {
	it('writes file if it does not exist', () => {
		const tempDir = mkdtempSync(join(tmpdir(), 'chronos-build-utils-test-'));
		const filePath = join(tempDir, 'test.txt');

		try {
			writeIfChanged(filePath, 'hello world');
			expect(readFileSync(filePath, 'utf8')).toBe('hello world');
		} finally {
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	it('skips writing if content is unchanged', async () => {
		const tempDir = mkdtempSync(join(tmpdir(), 'chronos-build-utils-test-'));
		const filePath = join(tempDir, 'test.txt');

		try {
			writeIfChanged(filePath, 'initial content');
			const initialStat = statSync(filePath);

			// Small sleep to ensure mtime would differ if written again
			await new Promise((resolve) => setTimeout(resolve, 50));

			writeIfChanged(filePath, 'initial content');
			const secondStat = statSync(filePath);

			expect(secondStat.mtimeMs).toBe(initialStat.mtimeMs);

			// Writing different content should update
			writeIfChanged(filePath, 'updated content');
			expect(readFileSync(filePath, 'utf8')).toBe('updated content');
		} finally {
			rmSync(tempDir, { recursive: true, force: true });
		}
	});
});
