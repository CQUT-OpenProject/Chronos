import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import type { Plugin } from 'vite';

export interface OfficialPluginsPluginOptions {
	catalogPath?: string;
	buildCommand?: (reason: string) => void;
	isBuild: boolean;
	isTest?: boolean;
}

export function defaultBuildOfficialPlugins(
	monorepoRoot: string,
	scriptPath: string,
	reason: string
): void {
	console.log(`[chronos-official-plugins] ${reason}, building official plugins...`);
	const result = spawnSync(process.execPath, ['--experimental-strip-types', scriptPath], {
		cwd: monorepoRoot,
		stdio: 'inherit'
	});
	if (result.status !== 0) {
		throw new Error(`Failed to build official plugins: exit code ${result.status}`);
	}
}

declare global {
	var __CHRONOS_OFFICIAL_PLUGINS_BUILT__: boolean | undefined;
}

export function createOfficialPluginsPlugin(options: OfficialPluginsPluginOptions): Plugin {
	const { catalogPath, buildCommand, isBuild, isTest = Boolean(process.env.VITEST) } = options;

	const ensureBuilt = (reason: string) => {
		buildCommand?.(reason);
	};

	return {
		name: 'chronos-official-plugins',
		configureServer() {
			if (catalogPath && !existsSync(catalogPath)) {
				ensureBuilt('catalog.json missing');
			}
		},
		buildStart() {
			if (isTest) {
				if (catalogPath && !existsSync(catalogPath)) {
					ensureBuilt('catalog.json missing');
				}
				return;
			}
			if (!isBuild) {
				if (catalogPath && !existsSync(catalogPath)) {
					ensureBuilt('catalog.json missing');
				}
				return;
			}
			if (globalThis.__CHRONOS_OFFICIAL_PLUGINS_BUILT__) return;
			globalThis.__CHRONOS_OFFICIAL_PLUGINS_BUILT__ = true;
			ensureBuilt('production build');
		}
	};
}
