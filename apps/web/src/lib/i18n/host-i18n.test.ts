import { describe, expect, it, vi } from 'vitest';
import { ChronosEngine, interpolateMessage, type ChronosEnv } from '@chronos/core';
import { HOST_MESSAGES, HOST_UI_PLUGIN_ID } from '$lib/i18n/host-messages';

function createTestEnv(): ChronosEnv {
	return {
		platform: 'web',
		http: { request: vi.fn() },
		storage: {
			getTimetable: vi.fn().mockResolvedValue(null),
			listTimetables: vi.fn().mockResolvedValue([]),
			saveTimetable: vi.fn().mockResolvedValue(undefined),
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
		runtime: {
			sha256: async () => ''
		}
	};
}

const engine = new ChronosEngine({
	env: createTestEnv(),
	initialLocale: 'en',
	presetI18nCatalogs: [{ pluginId: HOST_UI_PLUGIN_ID, messages: HOST_MESSAGES }]
});

vi.mock('$lib/services/app-engine', () => ({
	getAppEngine: () => engine
}));

import { configureHostI18n, hostT } from '$lib/i18n/host-i18n.svelte';

configureHostI18n({
	onLocaleChanged: (handler) => engine.events.on('i18n:localeChanged', handler)
});

describe('host-i18n', () => {
	it('resolves locale-specific catalog entries', () => {
		engine.setLocale('en');
		expect(hostT('common.cancel')).toBe('Cancel');

		engine.setLocale('zh-cn');
		expect(hostT('common.cancel')).toBe('取消');
	});

	it('interpolates message params via catalog', () => {
		const template = HOST_MESSAGES.en['plugins.notify.installed'];
		expect(interpolateMessage(template, { pluginId: 'demo' })).toBe(
			'Plugin "demo" installed and enabled'
		);
	});
});
