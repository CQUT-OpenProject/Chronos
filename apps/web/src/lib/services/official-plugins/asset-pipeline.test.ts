import { describe, expect, it, vi, beforeEach, type Mock } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import type { ChronosEnv, HttpRequestOptions, HttpResponse, PluginManifest } from '@chronos/core';
import { DEFAULT_USER_PREFERENCES } from '@chronos/core';
import { OfficialPluginAssetPipeline } from './asset-pipeline';

type HttpMock = Mock<(url: string, options?: HttpRequestOptions) => Promise<HttpResponse>>;

const SAMPLE_BUNDLE = 'export default { id: "x", apply() {} };';

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

function createMockEnv(httpRequest: HttpMock) {
	const env: ChronosEnv = {
		platform: 'node',
		http: { request: httpRequest },
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
			sha256: async (data: string) => {
				const { createHash } = await import('node:crypto');
				return createHash('sha256').update(data).digest('hex');
			}
		}
	};
	return env;
}

describe('OfficialPluginAssetPipeline', () => {
	let engine: ChronosEngine;
	let httpRequest: HttpMock;
	let pipeline: OfficialPluginAssetPipeline;

	beforeEach(async () => {
		httpRequest = vi.fn();
		engine = new ChronosEngine({ env: createMockEnv(httpRequest), onNotification: vi.fn() });
		await engine.init();
		pipeline = new OfficialPluginAssetPipeline(engine);
	});

	it('rejects sha256 mismatch', async () => {
		const manifest: PluginManifest = {
			id: 'test',
			name: { 'zh-CN': 'T' },
			version: '1.0.0',
			description: { 'zh-CN': 'T' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			bundleUrl: '/bundle.js',
			sha256: 'deadbeef'
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));

		await expect(pipeline.download(manifest)).rejects.toThrow(/integrity check failed/);
	});

	it('skips optional assets when URLs absent', async () => {
		const manifest: PluginManifest = {
			id: 'theme-only',
			name: { 'zh-CN': 'T' },
			version: '1.0.0',
			description: { 'zh-CN': 'T' },
			author: 'Chronos',
			type: 'theme',
			bundleFormat: 'esm',
			colorsUrl: '/colors.json',
			colorsSha256: await engine.env.runtime.sha256('{}')
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => '{}' }));

		const assets = await pipeline.download(manifest);
		expect(assets.colorsJson).toBe('{}');
		expect(assets.code).toBeNull();
		expect(assets.cssCode).toBeNull();
	});
});
