import { resolve } from 'node:path';

export interface OfficialPluginBuildPaths {
	root: string;
	compileDistDir: string;
	staticBundleDir: string;
	manifestDir: string;
	catalogPath: string;
	devOutDir: (pluginId: string) => string;
	pluginBundleDir: (pluginId: string) => string;
}

export function createOfficialPluginBuildPaths(root: string): OfficialPluginBuildPaths {
	const staticBundleDir = resolve(root, 'apps/web/static/official-plugins/bundles');
	const manifestDir = resolve(root, 'apps/web/static/official-plugins/manifests');

	return {
		root,
		compileDistDir: resolve(root, 'dist/official-plugins'),
		staticBundleDir,
		manifestDir,
		catalogPath: resolve(root, 'apps/web/static/official-plugins/catalog.json'),
		devOutDir: (pluginId) => resolve(root, 'dist/dev-plugins', pluginId),
		pluginBundleDir: (pluginId) => resolve(staticBundleDir, pluginId)
	};
}
