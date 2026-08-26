import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';

const ROOT = fileURLToPath(new URL('../../../../..', import.meta.url));
const SCAN_ROOTS = ['apps/web/src', 'packages'];
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', '.svelte-kit', 'paraglide']);
const SOURCE_EXTENSIONS = new Set(['.ts', '.svelte', '.js']);
const DEBUG_PROBE_PATTERN = /127\.0\.0\.1:\d+\/ingest/;

function collectSourceFiles(dir: string, files: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			if (IGNORED_DIRS.has(entry)) continue;
			collectSourceFiles(fullPath, files);
			continue;
		}
		const ext = entry.slice(entry.lastIndexOf('.'));
		if (SOURCE_EXTENSIONS.has(ext)) files.push(fullPath);
	}
	return files;
}

describe('debug probe guard', () => {
	it('does not ship localhost debug ingest fetch calls', () => {
		const offenders: string[] = [];
		for (const scanRoot of SCAN_ROOTS) {
			const absoluteRoot = join(ROOT, scanRoot);
			for (const file of collectSourceFiles(absoluteRoot)) {
				if (file.endsWith('.test.ts') || file.endsWith('.spec.ts')) continue;
				const content = readFileSync(file, 'utf8');
				if (DEBUG_PROBE_PATTERN.test(content)) {
					offenders.push(relative(ROOT, file));
				}
			}
		}
		expect(offenders).toEqual([]);
	});
});
