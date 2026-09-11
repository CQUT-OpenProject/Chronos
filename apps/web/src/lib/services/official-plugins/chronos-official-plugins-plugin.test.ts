import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
	createOfficialPluginsPlugin,
	resetOfficialPluginsBuildStateForTesting
} from './chronos-official-plugins-plugin';

describe('createOfficialPluginsPlugin', () => {
	beforeEach(() => {
		resetOfficialPluginsBuildStateForTesting();
	});

	it('configures dev server to build plugins only if catalog.json is missing', () => {
		const buildCommand = vi.fn();
		const plugin = createOfficialPluginsPlugin({
			catalogPath: '/non-existent/catalog.json',
			buildCommand,
			isBuild: false,
			isTest: false
		});

		(plugin.configureServer as unknown as () => void)();
		expect(buildCommand).toHaveBeenCalledTimes(1);
		expect(buildCommand).toHaveBeenCalledWith('catalog.json missing');
	});

	it('skips building in dev server if catalog.json exists', () => {
		const buildCommand = vi.fn();
		const plugin = createOfficialPluginsPlugin({
			catalogPath: process.cwd(), // existing path
			buildCommand,
			isBuild: false,
			isTest: false
		});

		(plugin.configureServer as unknown as () => void)();
		expect(buildCommand).not.toHaveBeenCalled();
	});

	it('skips building in test mode on buildStart when catalog exists', () => {
		const buildCommand = vi.fn();
		const plugin = createOfficialPluginsPlugin({
			catalogPath: process.cwd(),
			buildCommand,
			isBuild: true,
			isTest: true
		});

		(plugin.buildStart as unknown as () => void)();
		expect(buildCommand).not.toHaveBeenCalled();
	});

	it('builds official plugins on buildStart during production build and avoids duplicate calls', () => {
		const buildCommand = vi.fn();
		const plugin = createOfficialPluginsPlugin({
			catalogPath: process.cwd(),
			buildCommand,
			isBuild: true,
			isTest: false
		});

		(plugin.buildStart as unknown as () => void)();
		expect(buildCommand).toHaveBeenCalledTimes(1);
		expect(buildCommand).toHaveBeenCalledWith('production build');

		// Second call (e.g. secondary client build in SvelteKit) should be skipped
		(plugin.buildStart as unknown as () => void)();
		expect(buildCommand).toHaveBeenCalledTimes(1);
	});
});
