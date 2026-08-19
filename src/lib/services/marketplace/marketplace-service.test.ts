import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
	ChronosEngine,
	type ChronosEnv,
	type HttpResponse,
	type MarketplaceRegistry,
	type PluginManifest,
	type UserPreferences
} from '@chronos/core';
import { MarketplaceService } from './marketplace-service';

function createMockEnv(): ChronosEnv {
	const storageMap = new Map<string, unknown>();

	return {
		platform: 'web',
		http: {
			request: vi.fn(async (url: string): Promise<HttpResponse> => {
				if (url.endsWith('registry.json')) {
					const registry: MarketplaceRegistry = {
						version: 1,
						updatedAt: Date.now(),
						plugins: [
							{
								id: 'test-plugin',
								name: { 'zh-CN': '测试插件' },
								version: '1.0.0',
								description: { 'zh-CN': '测试插件描述' },
								author: 'Community',
								type: 'theme',
								bundleFormat: 'iife',
								minEngineVersion: '1.0.0',
								bundleUrl: '/test-bundle.js',
								sha256: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // sha256 of "123"
								capabilities: []
							}
						]
					};
					return {
						status: 200,
						statusText: 'OK',
						headers: { 'Content-Type': 'application/json' },
						ok: true,
						text: async () => JSON.stringify(registry),
						json: async <T>() => registry as T,
						bytes: async () => new Uint8Array()
					};
				}

				if (url.endsWith('/test-bundle.js')) {
					return {
						status: 200,
						statusText: 'OK',
						headers: { 'Content-Type': 'application/javascript' },
						ok: true,
						text: async () => '123',
						json: async <T>() => ({}) as T,
						bytes: async () => new Uint8Array()
					};
				}

				return {
					status: 404,
					statusText: 'Not Found',
					headers: {},
					ok: false,
					text: async () => '',
					json: async <T>() => ({}) as T,
					bytes: async () => new Uint8Array()
				};
			})
		},
		storage: {
			getTimetable: vi.fn(async () => null),
			listTimetables: vi.fn(async () => []),
			saveTimetable: vi.fn(async () => {}),
			patchTimetable: vi.fn(async () => {}),
			deleteTimetable: vi.fn(async () => {}),
			getActiveTimetableId: vi.fn(async () => null),
			setActiveTimetableId: vi.fn(async () => {}),
			getPreferences: vi.fn(async (): Promise<UserPreferences> => ({
				schemaVersion: 1,
				themeMode: 'auto',
				paletteMode: 'vibrant',
				timetableLayoutMode: 'fixed',
				capsuleCornerStyle: 'rounded',
				hapticFeedbackEnabled: true
			})),
			savePreferences: vi.fn(async () => {}),
			getPluginData: async <T>(pluginId: string, key: string): Promise<T | null> => {
				return (storageMap.get(`${pluginId}:${key}`) as T) ?? null;
			},
			setPluginData: async <T>(pluginId: string, key: string, value: T): Promise<void> => {
				storageMap.set(`${pluginId}:${key}`, value);
			},
			deletePluginData: async (pluginId: string, key: string): Promise<void> => {
				storageMap.delete(`${pluginId}:${key}`);
			}
		},
		vault: {
			isSupported: vi.fn(async () => true),
			storeSecret: vi.fn(async () => {}),
			getSecret: vi.fn(async () => null),
			removeSecret: vi.fn(async () => {})
		},
		runtime: {
			setTimeout: vi.fn(),
			clearTimeout: vi.fn(),
			sha256: vi.fn(async (data: string | Uint8Array) => {
				if (data === '123') {
					return 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
				}
				return 'tampered-hash';
			}),
			encodeUtf8: vi.fn(),
			decodeUtf8: vi.fn()
		}
	};
}

describe('MarketplaceService', () => {
	let env: ChronosEnv;
	let engine: ChronosEngine;
	let service: MarketplaceService;

	beforeEach(async () => {
		env = createMockEnv();
		engine = new ChronosEngine({ env });
		await engine.init();
		service = new MarketplaceService(engine);
	});

	it('fetches and parses registry.json', async () => {
		const registry = await service.fetchRegistry('/marketplace/registry.json');
		expect(registry.plugins.length).toBe(1);
		expect(registry.plugins[0]?.id).toBe('test-plugin');
	});

	it('verifies SHA-256 integrity and throws on hash mismatch', async () => {
		const manifestWithWrongHash: PluginManifest = {
			id: 'tampered-plugin',
			name: { 'zh-CN': '篡改插件' },
			version: '1.0.0',
			description: { 'zh-CN': '测试' },
			author: 'Attacker',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '1.0.0',
			bundleUrl: '/test-bundle.js',
			sha256: 'expected-hash-that-does-not-match',
			capabilities: []
		};

		await expect(service.install(manifestWithWrongHash)).rejects.toThrow(
			'Plugin integrity check failed'
		);
	});

	it('installs, lists, disables, enables, and uninstalls plugins', async () => {
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': '测试插件' },
			version: '1.0.0',
			description: { 'zh-CN': '测试' },
			author: 'Community',
			type: 'theme',
			bundleFormat: 'iife',
			minEngineVersion: '1.0.0',
			bundleUrl: '/test-bundle.js',
			sha256: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
			capabilities: []
		};

		await service.install(manifest);
		expect(service.listInstalled().length).toBe(1);
		expect(service.getInstalled('test-plugin')?.enabled).toBe(true);

		await service.disable('test-plugin');
		expect(service.getInstalled('test-plugin')?.enabled).toBe(false);

		await service.enable('test-plugin');
		expect(service.getInstalled('test-plugin')?.enabled).toBe(true);

		await service.uninstall('test-plugin');
		expect(service.listInstalled().length).toBe(0);
		expect(service.getInstalled('test-plugin')).toBeUndefined();
	});
});
