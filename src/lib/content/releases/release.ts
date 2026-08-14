export interface Release {
	tagName: string;
	name: string;
	publishedAt: string;
	body: string;
}

export function normalizeReleaseTag(versionName: string): string {
	const normalized = versionName.trim();
	if (!normalized) return 'v0.0.0';
	return normalized.toLowerCase().startsWith('v') ? `v${normalized.slice(1)}` : `v${normalized}`;
}

/** Parses `x.y.z` from a tag like `v0.1.3`. Missing parts are treated as 0. */
export function parseReleaseVersion(tagName: string): [number, number, number] {
	const match = tagName.trim().match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
	if (!match) return [0, 0, 0];
	return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

/** Ascending `x.y.z` comparison for release tags. */
export function compareReleaseVersions(a: string, b: string): number {
	const av = parseReleaseVersion(a);
	const bv = parseReleaseVersion(b);
	for (let i = 0; i < 3; i++) {
		if (av[i] !== bv[i]) return av[i] - bv[i];
	}
	return 0;
}
