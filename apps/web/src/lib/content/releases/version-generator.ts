import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareReleaseVersions, parseFrontmatter, type Release } from './release';

export function getLatestReleaseFromEntries(entriesDir: string): Release | null {
	if (!existsSync(entriesDir)) return null;
	const files = readdirSync(entriesDir).filter((f) => f.endsWith('.md'));
	if (files.length === 0) return null;

	const releases: Release[] = [];
	for (const file of files) {
		const tagName = file.replace(/\.md$/, '');
		const content = readFileSync(join(entriesDir, file), 'utf8');
		const { name, publishedAt, body } = parseFrontmatter(content);
		releases.push({
			tagName,
			name: name ?? tagName,
			publishedAt: publishedAt ?? '',
			body
		});
	}

	releases.sort((a, b) => compareReleaseVersions(b.tagName, a.tagName));
	return releases[0] ?? null;
}

export function writeGeneratedVersionJson(
	entriesDir?: string,
	outputJsonPath?: string
): string | null {
	const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../');
	const defaultEntriesDir = entriesDir ?? resolve(rootDir, 'src/lib/content/releases/entries');
	const defaultOutputPath = outputJsonPath ?? resolve(rootDir, 'static/version.json');

	const latest = getLatestReleaseFromEntries(defaultEntriesDir);
	if (!latest) return null;

	const json = JSON.stringify(latest, null, '\t') + '\n';
	try {
		if (existsSync(defaultOutputPath)) {
			const existing = readFileSync(defaultOutputPath, 'utf8');
			if (existing === json) {
				return defaultOutputPath;
			}
		}
	} catch {
		// File does not exist yet
	}

	writeFileSync(defaultOutputPath, json, 'utf8');
	return defaultOutputPath;
}
