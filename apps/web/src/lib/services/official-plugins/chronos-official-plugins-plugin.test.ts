import { describe, expect, it, vi } from 'vite-plus/test';
import { createOfficialPluginsPlugin } from './chronos-official-plugins-plugin';

describe('createOfficialPluginsPlugin', () => {
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
			catalogPath: process.cwd(),
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

	it('builds official plugins only during the SvelteKit server build', () => {
		const buildCommand = vi.fn();
		const plugin = createOfficialPluginsPlugin({
			catalogPath: process.cwd(),
			buildCommand,
			isBuild: true,
			isTest: false
		});

		(plugin.configResolved as unknown as (config: { build: { ssr: boolean } }) => void)({
			build: { ssr: true }
		});
		(plugin.buildStart as unknown as () => void)();
		expect(buildCommand).toHaveBeenCalledTimes(1);
		expect(buildCommand).toHaveBeenCalledWith('production build');
	});

	it('skips official plugin build during the client sub-build', () => {
		const buildCommand = vi.fn();
		const plugin = createOfficialPluginsPlugin({
			catalogPath: process.cwd(),
			buildCommand,
			isBuild: true,
			isTest: false
		});

		(plugin.configResolved as unknown as (config: { build: { ssr: boolean } }) => void)({
			build: { ssr: false }
		});
		(plugin.buildStart as unknown as () => void)();
		expect(buildCommand).not.toHaveBeenCalled();
	});

	it('runs official plugin build again when a new server build starts', () => {
		const buildCommand = vi.fn();
		const plugin = createOfficialPluginsPlugin({
			catalogPath: process.cwd(),
			buildCommand,
			isBuild: true,
			isTest: false
		});

		const resolveServer = () => {
			(plugin.configResolved as unknown as (config: { build: { ssr: boolean } }) => void)({
				build: { ssr: true }
			});
			(plugin.buildStart as unknown as () => void)();
		};

		resolveServer();
		resolveServer();
		expect(buildCommand).toHaveBeenCalledTimes(2);
	});
});
