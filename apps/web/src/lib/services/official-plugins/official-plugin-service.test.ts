import { describe, expect, it, vi, beforeEach } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import type { ChronosEnv, StorageChangeEvent } from '@chronos/core';
import { DEFAULT_USER_PREFERENCES } from '@chronos/core';
import { OfficialPluginService } from './official-plugin-service';
import { parsePluginBundle } from './plugin-bundle';
import type { OfficialPluginCatalog, PluginManifest } from '@chronos/core';

const SAMPLE_BUNDLE = `
module.exports = {
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

function createMockEnv(httpRequest = vi.fn()) {
	const kv = new Map<string, unknown>();

	const env: ChronosEnv = {
		platform: 'node',
		http: {
			request: httpRequest,
			clearSession: vi.fn()
		},
		storage: {
			getTimetable: async () => null,
			listTimetables: async () => [],
			saveTimetable: async () => {},
			patchTimetable: async () => {},
			deleteTimetable: async () => {},
			getActiveTimetableId: async () => null,
			setActiveTimetableId: async () => {},
			getPreferences: async () => ({ ...DEFAULT_USER_PREFERENCES }),
			savePreferences: async () => {},
			getPluginData: async <T>(pluginId: string, key: string): Promise<T | null> =>
				(kv.get(`${pluginId}:${key}`) as T) ?? null,
			setPluginData: async <T>(pluginId: string, key: string, val: T): Promise<void> => {
				kv.set(`${pluginId}:${key}`, val);
			},
			deletePluginData: async (pluginId: string, key: string): Promise<void> => {
				kv.delete(`${pluginId}:${key}`);
			},
			onChanged: (_l: (e: StorageChangeEvent) => void) => ({ dispose: () => {} })
		},
		vault: {
			isSupported: async () => false,
			storeSecret: vi.fn(),
			getSecret: vi.fn(),
			removeSecret: vi.fn()
		},
		runtime: {
			setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) as unknown as number,
			clearTimeout: (h: number) => clearTimeout(h),
			sha256: async (data: string) => {
				const { createHash } = await import('node:crypto');
				return createHash('sha256').update(data).digest('hex');
			},
			encodeUtf8: (s: string) => new TextEncoder().encode(s),
			decodeUtf8: (b: Uint8Array) => new TextDecoder().decode(b)
		}
	};

	return { env, httpRequest };
}

describe('parsePluginBundle', () => {
	it('parses module.exports plugin objects', () => {
		const plugin = parsePluginBundle(SAMPLE_BUNDLE);
		expect(plugin.id).toBe('test-plugin');
		expect(typeof plugin.apply).toBe('function');
	});

	it('rejects bundles without apply()', () => {
		expect(() => parsePluginBundle('module.exports = { id: "x" };')).toThrow(
			/Invalid plugin bundle/
		);
	});
});

describe('OfficialPluginService', () => {
	let engine: ChronosEngine;
	let service: OfficialPluginService;
	let httpRequest: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		httpRequest = vi.fn();
		const mock = createMockEnv(httpRequest);
		engine = new ChronosEngine({ env: mock.env, onNotification: vi.fn() });
		await engine.init();
		service = new OfficialPluginService(engine);
	});

	it('fetches and parses official plugin catalog', async () => {
		const catalog: OfficialPluginCatalog = {
			version: 1,
			updatedAt: Date.now(),
			manifests: ['/official-plugins/manifests/test.manifest.json']
		};

		httpRequest.mockResolvedValueOnce({
			ok: true,
			json: async () => catalog
		});

		const result = await service.fetchCatalog('/official-plugins/catalog.json');
		expect(result.manifests.length).toBe(1);
	});

	it('installs plugin via loadPlugin after sha256 verification', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce({
			ok: true,
			text: async () => SAMPLE_BUNDLE
		});

		await service.install(manifest);
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(service.listInstalled().length).toBe(1);
	});

	it('rejects install when sha256 mismatch', async () => {
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: 'deadbeef'
		};

		httpRequest.mockResolvedValueOnce({
			ok: true,
			text: async () => SAMPLE_BUNDLE
		});

		await expect(service.install(manifest)).rejects.toThrow(/integrity check failed/);
	});

	it('uninstalls plugin and clears engine state', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce({
			ok: true,
			text: async () => SAMPLE_BUNDLE
		});
		await service.install(manifest);
		await service.uninstall('test-plugin');
		expect(engine.isPluginLoaded('test-plugin')).toBe(false);
	});
});
