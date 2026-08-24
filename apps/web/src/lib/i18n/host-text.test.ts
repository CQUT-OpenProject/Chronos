import { describe, expect, it, vi } from 'vitest';
import { ChronosEngine, interpolateMessage, type ChronosEnv } from '@chronos/core';
import { HOST_MESSAGES } from '$lib/i18n/host-messages';
import { HOST_UI_PLUGIN_ID } from '$lib/i18n/host-text';

function createTestEnv(): ChronosEnv {
	return {
		platform: 'web',
		http: { request: vi.fn() },
		storage: {
			getTimetable: vi.fn().mockResolvedValue(null),
			listTimetables: vi.fn().mockResolvedValue([]),
			saveTimetable: vi.fn().mockResolvedValue(undefined),
			patchTimetable: vi.fn().mockResolvedValue(undefined),
			deleteTimetable: vi.fn().mockResolvedValue(undefined),
			getActiveTimetableId: vi.fn().mockResolvedValue(null),
			setActiveTimetableId: vi.fn().mockResolvedValue(undefined),
			queryCourses: vi.fn().mockResolvedValue([]),
			getPreferences: vi.fn().mockResolvedValue({}),
			savePreferences: vi.fn().mockResolvedValue(undefined),
			getPluginData: vi.fn().mockResolvedValue(null),
			setPluginData: vi.fn().mockResolvedValue(undefined),
			deletePluginData: vi.fn().mockResolvedValue(undefined)
		},
		vault: {
			isSupported: async () => false,
			storeSecret: vi.fn(),
			getSecret: vi.fn(),
			removeSecret: vi.fn()
		},
		runtime: {
			setTimeout: (h: () => void, ms?: number) => setTimeout(h, ms) as unknown as number,
			clearTimeout: (h: number) => clearTimeout(h),
			sha256: async () => '',
			encodeUtf8: (s: string) => new TextEncoder().encode(s),
			decodeUtf8: (b: Uint8Array) => new TextDecoder().decode(b)
		}
	};
}

describe('HOST_MESSAGES', () => {
	it('has matching zh-cn and en keys', () => {
		expect(Object.keys(HOST_MESSAGES['zh-cn']).sort()).toEqual(
			Object.keys(HOST_MESSAGES.en).sort()
		);
	});

	it('resolves locale-specific plugin catalog entries', () => {
		const engine = new ChronosEngine({ env: createTestEnv(), initialLocale: 'en' });
		engine.i18nCatalog.register(HOST_UI_PLUGIN_ID, HOST_MESSAGES);

		expect(engine.translateForPlugin(HOST_UI_PLUGIN_ID, 'common.cancel')).toBe('Cancel');

		engine.setLocale('zh-cn');
		expect(engine.translateForPlugin(HOST_UI_PLUGIN_ID, 'common.cancel')).toBe('取消');
	});

	it('interpolates message params', () => {
		const template = HOST_MESSAGES.en['plugins.notify.installed'];
		expect(interpolateMessage(template, { pluginId: 'demo' })).toBe(
			'Plugin "demo" installed and enabled'
		);
	});
});
