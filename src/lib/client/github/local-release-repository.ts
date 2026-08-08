import type { GithubRelease } from '$lib/models/auth';
import type { GithubReleaseRepository } from '$lib/domain/interfaces/github-release-repository';
import { failure, success } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';

const RELEASE_FILES = import.meta.glob('../../content/releases/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export function createLocalReleaseRepository(): GithubReleaseRepository {
	const releases = buildReleaseIndex();
	return {
		async fetchReleaseByTag(_owner, _repo, tag) {
			const release = releases[tag];
			if (!release) {
				return failure(AppError.dataFormat(`未找到 ${tag} 的本地发布记录`));
			}
			return success(release);
		},
		async fetchAllReleases() {
			const list = Object.values(releases).sort((a, b) =>
				b.publishedAt.localeCompare(a.publishedAt)
			);
			return success(list);
		}
	};
}

function buildReleaseIndex(): Record<string, GithubRelease> {
	const index: Record<string, GithubRelease> = {};
	for (const [path, raw] of Object.entries(RELEASE_FILES)) {
		const tagName = tagNameFromPath(path);
		const { name, publishedAt, body } = parseFrontmatter(raw);
		index[tagName] = {
			tagName,
			name: name ?? '',
			publishedAt: publishedAt ?? '',
			body,
			htmlUrl: ''
		};
	}
	return index;
}

function tagNameFromPath(path: string): string {
	const fileName = path.slice(path.lastIndexOf('/') + 1);
	return fileName.replace(/\.md$/, '');
}

function parseFrontmatter(raw: string): {
	name?: string;
	publishedAt?: string;
	body: string;
} {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) {
		return { body: raw };
	}
	const fields: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const head = line.match(/^([A-Za-z0-9]+)\s*:\s*(.*)$/);
		if (head) fields[head[1]] = head[2];
	}
	return {
		name: fields['name'],
		publishedAt: fields['publishedAt'],
		body: match[2]
	};
}
