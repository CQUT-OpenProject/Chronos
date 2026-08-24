import { describe, expect, it, vi, beforeEach } from 'vitest';
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

import { applyAppLocale, syncParaglideLocale } from '$lib/i18n/locale-sync';

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

describe('locale-sync', () => {
	let engine: ChronosEngine;

	beforeEach(() => {
		setParaglideLocale.mockClear();
		engine = new ChronosEngine({ env: createTestEnv(), initialLocale: 'zh-cn' });
	});

	it('syncParaglideLocale updates cookie without reload', () => {
		syncParaglideLocale('en');
		expect(setParaglideLocale).toHaveBeenCalledWith('en', { reload: false });
	});

	it('applyAppLocale does not reload the page', async () => {
		await applyAppLocale(engine, 'en');
		expect(engine.locale).toBe('en');
		expect(setParaglideLocale).toHaveBeenCalledWith('en', { reload: false });
	});
});
