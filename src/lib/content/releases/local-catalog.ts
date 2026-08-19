import { failure, success } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';
import type { ReleaseCatalog } from './catalog';
import { compareReleaseVersions, parseFrontmatter, type Release } from './release';

const RELEASE_FILES = import.meta.glob('./entries/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export function createLocalReleaseCatalog(): ReleaseCatalog {
	const releases = buildReleaseIndex();
	return {
		async getRelease(tag) {
			const release = releases[tag];
			if (!release) {
				return failure(AppError.dataFormat(`未找到 ${tag} 的本地发布记录`));
			}
			return success(release);
		},
		async listReleases() {
			const list = Object.values(releases).sort((a, b) =>
				compareReleaseVersions(b.tagName, a.tagName)
			);
			return success(list);
		}
	};
}

function buildReleaseIndex(): Record<string, Release> {
	const index: Record<string, Release> = {};
	for (const [path, raw] of Object.entries(RELEASE_FILES)) {
		const tagName = tagNameFromPath(path);
		const { name, publishedAt, body } = parseFrontmatter(raw);
		index[tagName] = {
			tagName,
			name: name ?? '',
			publishedAt: publishedAt ?? '',
			body
		};
	}
	return index;
}

function tagNameFromPath(path: string): string {
	const fileName = path.slice(path.lastIndexOf('/') + 1);
	return fileName.replace(/\.md$/, '');
}
