import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ChronosEngine } from '@chronos/core';
import type { ChronosEnv } from '@chronos/core';

const { setParaglideLocale, getTextDirection } = vi.hoisted(() => ({
	setParaglideLocale: vi.fn(),
	getTextDirection: vi.fn(() => 'ltr' as const)
}));

vi.mock('$lib/paraglide/runtime', () => ({
	setLocale: setParaglideLocale,
	getTextDirection
}));

import {
	applySessionAppLocale,
	detectSystemAppLocale,
	syncAppLocaleOnStartup,
	syncParaglideLocale
} from '$lib/i18n/locale-sync';

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
		vault: {
			isSupported: async () => false,
			storeSecret: vi.fn(),
			getSecret: vi.fn(),
			removeSecret: vi.fn()
		},
		runtime: {
			sha256: async () => ''
		}
	};
}

describe('locale-sync', () => {
	let engine: ChronosEngine;
	const originalNavigator = globalThis.navigator;

	beforeEach(() => {
		setParaglideLocale.mockClear();
		engine = new ChronosEngine({ env: createTestEnv(), initialLocale: 'zh-cn' });
	});

	afterEach(() => {
		Object.defineProperty(globalThis, 'navigator', {
			configurable: true,
			value: originalNavigator
		});
	});

	function mockNavigatorLanguages(languages: string[]) {
		Object.defineProperty(globalThis, 'navigator', {
			configurable: true,
			value: { languages, language: languages[0] }
		});
	}

	it('syncParaglideLocale updates cookie without reload', () => {
		syncParaglideLocale('en');
		expect(setParaglideLocale).toHaveBeenCalledWith('en', { reload: false });
	});

	it('detectSystemAppLocale maps Chinese system tags to zh-cn', () => {
		mockNavigatorLanguages(['zh-CN', 'en-US']);
		expect(detectSystemAppLocale()).toBe('zh-cn');
	});

	it('detectSystemAppLocale maps English system tags to en', () => {
		mockNavigatorLanguages(['en-US', 'zh-CN']);
		expect(detectSystemAppLocale()).toBe('en');
	});

	it('detectSystemAppLocale falls back to zh-cn for unsupported tags', () => {
		mockNavigatorLanguages(['fr-FR']);
		expect(detectSystemAppLocale()).toBe('zh-cn');
	});

	it('applySessionAppLocale updates engine without persisting preferences', async () => {
		applySessionAppLocale(engine, 'en');
		expect(engine.locale).toBe('en');
		expect(setParaglideLocale).toHaveBeenCalledWith('en', { reload: false });
		expect(engine.env.storage.savePreferences).not.toHaveBeenCalled();
	});

	it('syncAppLocaleOnStartup follows the system language', () => {
		mockNavigatorLanguages(['en-GB']);
		syncAppLocaleOnStartup(engine);
		expect(engine.locale).toBe('en');
		expect(setParaglideLocale).toHaveBeenCalledWith('en', { reload: false });
	});
});
