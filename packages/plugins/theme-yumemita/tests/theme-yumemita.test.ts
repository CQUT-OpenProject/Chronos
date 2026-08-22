import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine, type ChronosEnv, type UserPreferences } from '@chronos/core';
import {
	YUMEMITA_THEME_ID,
	yumemitaThemeContribution,
	yumemitaIconThemeContribution,
	YUMEMITA_PALETTE_ENTRIES
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
				schemaVersion: 2,
				themeMode: 'auto',
				paletteMode: 'vibrant',
				timetableLayoutMode: 'fixed',
				capsuleCornerStyle: 'rounded',
				hapticFeedbackEnabled: true,
				visualThemeId: 'm3-default',
				visualIconThemeId: 'host-default'
			})),
			savePreferences: vi.fn(async () => {}),
			getPluginData: vi.fn(async () => null),
			setPluginData: vi.fn(async () => {}),
			deletePluginData: vi.fn(async () => {})
		},
		vault: {
			isSupported: vi.fn(async () => false),
			storeSecret: vi.fn(async () => {}),
			getSecret: vi.fn(async () => null),
			removeSecret: vi.fn(async () => {})
		},
		runtime: {
			setTimeout: () => 0,
			clearTimeout: () => {},
			sha256: vi.fn(async () => ''),
			encodeUtf8: () => new Uint8Array(),
			decodeUtf8: () => ''
		}
	};
}

describe('@chronos/plugin-theme-yumemita', () => {
	it('builds light/dark workbench colors from JSON', () => {
		const light = yumemitaThemeContribution.workbenchColors.light;
		const dark = yumemitaThemeContribution.workbenchColors.dark;
		expect(light['color.primary']).toBe('#2288dd');
		expect(light['shell.bottomTab.activeForeground']).toBe('#2288dd');
		expect(light['timetable.period.activeBackgroundImage']).toContain('linear-gradient');
		expect(dark['color.surface']).toBe('#1e2026');
	});

	it('resolveCoursePaint uses palette entries', () => {
		const paint = yumemitaThemeContribution.resolveCoursePaint!(
			{ id: '1', name: 'Math', weekday: 1, startSlot: 1, endSlot: 2 },
			0,
			'light'
		);
		expect(paint.background).toBe(YUMEMITA_PALETTE_ENTRIES[0]!.background);
	});

	it('icon theme overrides mine tab with svg descriptor', () => {
		const mineIcons = yumemitaIconThemeContribution.bottomTabIcons?.mine;
		expect(mineIcons?.icon?.type).toBe('svg');
		expect(mineIcons?.icon?.size).toBe('large');
		expect(mineIcons?.icon?.rotation).toBe(25);
		expect(mineIcons?.iconFill?.opacity).toBe(1);
	});

	it('recommends matching icon theme', () => {
		expect(yumemitaThemeContribution.recommendedIconTheme).toBe(YUMEMITA_THEME_ID);
		expect(yumemitaIconThemeContribution.id).toBe(YUMEMITA_THEME_ID);
	});
});
