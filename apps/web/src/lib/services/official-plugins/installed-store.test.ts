import { describe, expect, it, vi, beforeEach } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import type { ChronosEnv } from '@chronos/core';
import { DEFAULT_USER_PREFERENCES } from '@chronos/core';
import { loadEsmPluginFromCode } from './plugin-bundle';
import { OfficialPluginInstalledStore } from './installed-store';
import { INSTALLED_STORAGE_KEY, OFFICIAL_PLUGINS_PLUGIN_ID } from './official-plugin-types';

const SAMPLE_BUNDLE = `
export default {
  id: 'test-plugin',
  name: function () { return 'Test'; },
  version: '1.0.0',
  apply: function (ctx) {}
};
`;

function createMockEnv() {
	const kv = new Map<string, unknown>();
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
			getPluginData: async <T>(pluginId: string, key: string) =>
				(kv.get(`${pluginId}:${key}`) as T) ?? null,
			setPluginData: async <T>(pluginId: string, key: string, val: T) => {
				kv.set(`${pluginId}:${key}`, val);
			},
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
	return { env, kv };
}

describe('OfficialPluginInstalledStore', () => {
	let engine: ChronosEngine;
	let store: OfficialPluginInstalledStore;

	beforeEach(async () => {
		const mock = createMockEnv();
		engine = new ChronosEngine({ env: mock.env, onNotification: vi.fn() });
		await engine.init();
		store = new OfficialPluginInstalledStore(engine);
	});

	it('notifies change listeners on persist', async () => {
		const listener = vi.fn();
		store.onChanged(listener);
		await store.load();
		await store.upsert({
			manifest: {
				id: 'p1',
				name: { 'zh-CN': 'P' },
				version: '1',
				description: { 'zh-CN': 'P' },
				author: 'Chronos',
				type: 'tool',
				bundleFormat: 'esm',
				bundleUrl: '/b.js',
				sha256: 'abc'
			},
			enabled: true,
			installedAt: 1
		});
		expect(listener).toHaveBeenCalled();
	});

	it('dedupes records overlapping profile builtins', async () => {
		await engine.loadPlugin(await loadEsmPluginFromCode(SAMPLE_BUNDLE));
		await store.load();
		store['cache'] = [
			{
				manifest: {
					id: 'test-plugin',
					name: { 'zh-CN': 'P' },
					version: '1',
					description: { 'zh-CN': 'P' },
					author: 'Chronos',
					type: 'tool',
					bundleFormat: 'esm',
					bundleUrl: '/b.js',
					sha256: 'abc'
				},
				enabled: true,
				installedAt: 1
			}
		];

		const changed = await store.dedupeBuiltinOverlap();
		expect(changed).toBe(true);
		expect(store.getCache()).toHaveLength(0);

		const stored = await engine.storage.getPluginData<unknown[]>(
			OFFICIAL_PLUGINS_PLUGIN_ID,
			INSTALLED_STORAGE_KEY
		);
		expect(stored).toEqual([]);
	});
});
