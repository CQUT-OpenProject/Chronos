import { describe, expect, it, vi, beforeEach } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import type { ChronosEnv } from '@chronos/core';
import { DEFAULT_USER_PREFERENCES } from '@chronos/core';
import { loadEsmPluginFromCode } from './plugin-bundle';
import { OfficialPluginRuntimeActivator } from './runtime-activator';

const SAMPLE_BUNDLE = `
export default {
  id: 'test-plugin',
  name: function () { return 'Test'; },
  version: '1.0.0',
  apply: function (ctx) {
    ctx.registerSlot('mine.item', {
      id: 'test-item',
      sectionId: 'app-support',
      title: function () { return 'Test'; },
      href: '/test',
      order: 1
    });
  }
};
`;

const THEME_COLORS_JSON = JSON.stringify({
	id: 'theme-test',
	name: 'Test',
	variants: {
		light: { colors: { 'editor.background': '#ffffff' } },
		dark: { colors: { 'editor.background': '#000000' } }
	}
});

function createMockEnv() {
	const env: ChronosEnv = {
		platform: 'node',
		http: { request: vi.fn() },
		storage: {
			getTimetable: async () => null,
			listTimetables: async () => [],
			saveTimetable: async () => {},
			deleteTimetable: async () => {},
			getActiveTimetableId: async () => null,
			setActiveTimetableId: async () => {},
			queryCourses: async () => [],
			getPreferences: async () => ({ ...DEFAULT_USER_PREFERENCES }),
			savePreferences: async () => {},
			getPluginData: async () => null,
			setPluginData: async () => {},
			deletePluginData: async () => {},
			onChanged: () => ({ dispose: () => {} })
		},
		vault: {
			isSupported: async () => false,
			storeSecret: vi.fn(),
			getSecret: vi.fn(),
			removeSecret: vi.fn()
		},
		runtime: {
			sha256: async () => 'hash'
		}
	};
	return env;
}

describe('OfficialPluginRuntimeActivator', () => {
	let engine: ChronosEngine;
	let activator: OfficialPluginRuntimeActivator;
	let installed = new Set<string>();

	beforeEach(async () => {
		installed = new Set();
		engine = new ChronosEngine({ env: createMockEnv(), onNotification: vi.fn() });
		await engine.init();
		activator = new OfficialPluginRuntimeActivator(engine, (id) => installed.has(id));
	});

	it('registers JSON-only theme via ScopedContext', async () => {
		installed.add('theme-json');
		await activator.activate({
			manifest: {
				id: 'theme-json',
				name: { 'zh-CN': 'T' },
				version: '1',
				description: { 'zh-CN': 'T' },
				author: 'Chronos',
				type: 'theme',
				bundleFormat: 'esm',
				minEngineVersion: '0.3.0',
				colorsUrl: '/c.json',
				colorsSha256: 'x'
			},
			colorsJson: THEME_COLORS_JSON,
			enabled: true,
			installedAt: 1
		});

		expect(engine.themes.getTheme('theme-test')).toBeDefined();
	});

	it('rejects ESM bundle id mismatch', async () => {
		installed.add('wrong-id');
		await expect(
			activator.activate({
				manifest: {
					id: 'wrong-id',
					name: { 'zh-CN': 'T' },
					version: '1',
					description: { 'zh-CN': 'T' },
					author: 'Chronos',
					type: 'tool',
					bundleFormat: 'esm',
					minEngineVersion: '0.3.0',
					bundleUrl: '/b.js',
					sha256: 'x'
				},
				code: SAMPLE_BUNDLE,
				enabled: true,
				installedAt: 1
			})
		).rejects.toThrow(/id mismatch/);
	});

	it('unload disposes engine plugin handle', async () => {
		installed.add('test-plugin');
		await activator.activate({
			manifest: {
				id: 'test-plugin',
				name: { 'zh-CN': 'T' },
				version: '1',
				description: { 'zh-CN': 'T' },
				author: 'Chronos',
				type: 'tool',
				bundleFormat: 'esm',
				minEngineVersion: '0.3.0',
				bundleUrl: '/b.js',
				sha256: 'x'
			},
			code: SAMPLE_BUNDLE,
			enabled: true,
			installedAt: 1
		});
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);

		await activator.deactivate('test-plugin');
		expect(engine.isPluginLoaded('test-plugin')).toBe(false);
	});

	it('does not call revertToDefaultThemes when re-activating on boot', async () => {
		const revertSpy = vi.spyOn(engine, 'revertToDefaultThemes');
		installed.add('test-plugin');

		await activator.activate({
			manifest: {
				id: 'test-plugin',
				name: { 'zh-CN': 'T' },
				version: '1',
				description: { 'zh-CN': 'T' },
				author: 'Chronos',
				type: 'tool',
				bundleFormat: 'esm',
				minEngineVersion: '0.3.0',
				bundleUrl: '/b.js',
				sha256: 'x'
			},
			code: SAMPLE_BUNDLE,
			enabled: true,
			installedAt: 1
		});

		expect(revertSpy).not.toHaveBeenCalled();
	});

	it('calls revertToDefaultThemes when deactivating installed plugin with revertThemes', async () => {
		const revertSpy = vi.spyOn(engine, 'revertToDefaultThemes');
		installed.add('test-plugin');

		await activator.activate({
			manifest: {
				id: 'test-plugin',
				name: { 'zh-CN': 'T' },
				version: '1',
				description: { 'zh-CN': 'T' },
				author: 'Chronos',
				type: 'tool',
				bundleFormat: 'esm',
				minEngineVersion: '0.3.0',
				bundleUrl: '/b.js',
				sha256: 'x'
			},
			code: SAMPLE_BUNDLE,
			enabled: true,
			installedAt: 1
		});

		await activator.deactivate('test-plugin', { revertThemes: true });
		expect(revertSpy).toHaveBeenCalled();
	});
});
