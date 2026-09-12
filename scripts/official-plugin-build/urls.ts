export function pluginAssetUrl(pluginId: string, fileName: string): string {
	return `/official-plugins/bundles/${pluginId}/${fileName}`;
}

export function pluginDevAssetUrl(pluginId: string, rev: string, fileName: string): string {
	return `/official-plugins/bundles/${pluginId}/${rev}/${fileName}`;
}
