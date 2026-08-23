import { describe, expect, it, vi, beforeEach, type Mock } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import type {
	ChronosEnv,
	HttpRequestOptions,
	HttpResponse,
	StorageChangeEvent
} from '@chronos/core';
import { DEFAULT_USER_PREFERENCES } from '@chronos/core';
import { OfficialPluginService } from './official-plugin-service';
import { loadEsmPluginFromCode } from './plugin-bundle';
import type { OfficialPluginCatalog, PluginManifest } from '@chronos/core';

type HttpMock = Mock<(url: string, options?: HttpRequestOptions) => Promise<HttpResponse>>;

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

function httpResponse(overrides: Partial<HttpResponse> = {}): HttpResponse {
	return {
		status: 200,
		statusText: 'OK',
		headers: {},
		ok: true,
		text: async () => '',
		json: async <T>() => undefined as T,
		bytes: async () => new Uint8Array(),
		...overrides
	};
}

function createMockEnv(httpRequest: HttpMock = vi.fn()) {
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
			queryCourses: async () => [],
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
			clearPluginData: async (pluginId: string): Promise<void> => {
				for (const key of kv.keys()) {
					if (key.startsWith(`${pluginId}:`)) kv.delete(key);
				}
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

describe('loadEsmPluginFromCode', () => {
	it('parses export default ESM plugin objects', async () => {
		const plugin = await loadEsmPluginFromCode(SAMPLE_BUNDLE);
		expect(plugin.id).toBe('test-plugin');
		expect(typeof plugin.apply).toBe('function');
	});

	it('rejects bundles without apply()', async () => {
		await expect(loadEsmPluginFromCode('export default { id: "x" };')).rejects.toThrow(
			/Invalid plugin bundle/
		);
	});
});

describe('OfficialPluginService', () => {
	let engine: ChronosEngine;
	let service: OfficialPluginService;
	let httpRequest: HttpMock;

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

		httpRequest.mockResolvedValueOnce(
			httpResponse({
				json: async <T>() => catalog as T
			})
		);

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
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));

		await service.install(manifest);
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(service.listInstalled().length).toBe(1);
	});

	it('rejects install when minEngineVersion is newer than current engine', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '2.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '99.0.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		await expect(service.install(manifest)).rejects.toThrow(/requires engine >= 99\.0\.0/);
	});

	it('rejects install when sha256 mismatch', async () => {
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: 'deadbeef'
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));

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
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));
		await service.install(manifest);
		await service.uninstall('test-plugin');
		expect(engine.isPluginLoaded('test-plugin')).toBe(false);
	});

	it('uninstall wipes plugin-namespaced data', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));
		await service.install(manifest);

		await engine.storage.setPluginData('test-plugin', 'wallpaper_image', { base64: 'x' });
		expect(await engine.storage.getPluginData('test-plugin', 'wallpaper_image')).not.toBeNull();

		await service.uninstall('test-plugin');

		expect(await engine.storage.getPluginData('test-plugin', 'wallpaper_image')).toBeNull();
		expect(
			await engine.storage.getPluginData('core.official-plugins', 'installed_plugins')
		).not.toBeNull();
	});

	it('skips init reload for profile-builtin plugins already loaded', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		await engine.loadPlugin(await loadEsmPluginFromCode(SAMPLE_BUNDLE));
		expect(engine.slots.getSlotItem('mine.item', 'test-item')).toBeDefined();

		await engine.storage.setPluginData('core.official-plugins', 'installed_plugins', [
			{
				manifest,
				code: SAMPLE_BUNDLE,
				enabled: true,
				installedAt: Date.now()
			}
		]);

		const loadPluginSpy = vi.spyOn(engine, 'loadPlugin');
		await service.init();

		expect(loadPluginSpy).not.toHaveBeenCalled();
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(engine.slots.getSlotItem('mine.item', 'test-item')).toBeDefined();
		expect(service.listInstalled()).toHaveLength(0);

		const stored = await engine.storage.getPluginData<unknown[]>(
			'core.official-plugins',
			'installed_plugins'
		);
		expect(stored).toEqual([]);
	});

	it('resetAfterFactoryClear unloads plugins and clears installed cache', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));
		await service.install(manifest);
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(service.listInstalled()).toHaveLength(1);

		await service.resetAfterFactoryClear();

		expect(engine.isPluginLoaded('test-plugin')).toBe(false);
		expect(service.listInstalled()).toHaveLength(0);
		expect(service.isPluginActive('test-plugin')).toBe(false);
	});
});
