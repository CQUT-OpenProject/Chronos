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
