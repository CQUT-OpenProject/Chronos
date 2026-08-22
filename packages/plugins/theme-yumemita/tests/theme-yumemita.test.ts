import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine, type ChronosEnv, type UserPreferences } from '@chronos/core';
import {
	yumemitaThemePlugin,
	YUMEMITA_PLUGIN_ID,
	YUMEMITA_THEME_ID,
	buildYumemitaThemeTokens,
	YUMEMITA_PALETTE_ENTRIES,
	YUMEMITA_PRIMARY,
	YUMEMITA_SECONDARY,
	yumemitaThemeContribution
} from '../src/index';

function createMockEnv(): ChronosEnv {
	return {
		platform: 'web',
		http: { request: vi.fn() },
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
			getPluginData: vi.fn(async () => null),
			setPluginData: vi.fn(async () => {}),
			deletePluginData: vi.fn(async () => {})
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
			sha256: vi.fn(async () => ''),
			encodeUtf8: vi.fn(),
			decodeUtf8: vi.fn()
		}
	};
}

describe('@chronos/plugin-theme-yumemita', () => {
	it('exports six YUMEMITA theme course palette entries', () => {
		expect(YUMEMITA_PALETTE_ENTRIES.length).toBe(6);
		expect(YUMEMITA_PALETTE_ENTRIES[0]?.background).toBe('#FFEE55');
	});

	it('buildYumemitaThemeTokens uses fixed primary and secondary colors', () => {
		const light = buildYumemitaThemeTokens('light');
		const dark = buildYumemitaThemeTokens('dark');
		expect(light.primary).toBe(YUMEMITA_PRIMARY);
		expect(light.secondary).toBe(YUMEMITA_SECONDARY);
		expect(dark.primary).toBe(YUMEMITA_PRIMARY);
		expect(dark.secondary).toBe(YUMEMITA_SECONDARY);
	});

	it('resolveCoursePaint returns theme palette colors for auto courses', () => {
		const paint = yumemitaThemeContribution.resolveCoursePaint!(
			{ id: 'c1', name: 'Math', dayOfWeek: 1, startPeriod: 1, endPeriod: 2, weeks: [1] },
			0,
			'light'
		);
		expect(paint.background).toBe(YUMEMITA_PALETTE_ENTRIES[0]!.background);
	});

	it('declares shell chrome CSS variables for bottom tab and leading icons', () => {
		const shellVars = yumemitaThemeContribution.shell?.customCssVars;
		expect(shellVars).toBeDefined();
		expect(shellVars!['--shell-bottom-tab-active-bg']).toBe('transparent');
		expect(shellVars!['--shell-bottom-tab-active-fg']).toBe(YUMEMITA_PRIMARY);
		expect(shellVars!['--leading-icon-bg']).toContain(YUMEMITA_SECONDARY);
		expect(shellVars!['--leading-icon-color']).toBe('#fff');
		expect(yumemitaThemeContribution.customCssVars?.['--leading-icon-bg']).toBeUndefined();
	});

	it('apply registers theme slot without auto-selecting theme', async () => {
		const engine = new ChronosEngine({ env: createMockEnv() });
		const ctx = engine.getPluginContext(YUMEMITA_PLUGIN_ID);
		await yumemitaThemePlugin.apply(ctx);
		expect(engine.slots.get('theme.definition').some((t) => t.id === YUMEMITA_THEME_ID)).toBe(true);
		expect(engine.state.activeThemeId).toBe('m3-default');
		engine.dispose();
	});
});
