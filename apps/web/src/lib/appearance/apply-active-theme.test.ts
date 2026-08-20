import { describe, expect, it } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import { m3DefaultTheme } from '@chronos/ui-kit';
import { YUMEMITA_THEME_ID } from '@chronos/plugin-theme-yumemita';
import { applyActiveTheme } from './apply-active-theme';

function createFakeElement() {
	const classes = new Set<string>();
	const style = new Map<string, string>();
	return {
		classList: {
			toggle: (cls: string, force?: boolean) => {
				if (force) classes.add(cls);
				else classes.delete(cls);
			},
			contains: (cls: string) => classes.has(cls)
		},
		style: {
			setProperty: (name: string, value: string) => {
				style.set(name, value);
			},
			removeProperty: (name: string) => {
				style.delete(name);
			},
			[Symbol.iterator]: function* () {
				for (const key of style.keys()) yield key;
			}
		}
	} as unknown as HTMLElement;
}

describe('applyActiveTheme', () => {
	it('clears plugin theme styling when wallpaper palette mode is active', () => {
		const engine = new ChronosEngine({
			env: {
				platform: 'web',
				http: {
					request: async () => ({
						ok: false,
						status: 500,
						statusText: '',
						headers: {},
						text: async () => '',
						json: async () => ({}),
						bytes: async () => new Uint8Array()
					})
				},
				storage: {
					getTimetable: async () => null,
					listTimetables: async () => [],
					saveTimetable: async () => {},
					patchTimetable: async () => {},
					deleteTimetable: async () => {},
					getActiveTimetableId: async () => null,
					setActiveTimetableId: async () => {},
					getPreferences: async () => ({
						schemaVersion: 1,
						themeMode: 'auto',
						paletteMode: 'wallpaper',
						timetableLayoutMode: 'fixed',
						capsuleCornerStyle: 'rounded',
						hapticFeedbackEnabled: true
					}),
					savePreferences: async () => {},
					getPluginData: async () => null,
					setPluginData: async () => {},
					deletePluginData: async () => {}
				},
				vault: {
					isSupported: async () => false,
					storeSecret: async () => {},
					getSecret: async () => null,
					removeSecret: async () => {}
				},
				runtime: {
					setTimeout: () => 0,
					clearTimeout: () => {},
					sha256: async () => '',
					encodeUtf8: () => new Uint8Array(),
					decodeUtf8: () => ''
				}
			}
		});
		engine.themes.registerTheme(m3DefaultTheme);
		const target = createFakeElement();

		applyActiveTheme(engine, YUMEMITA_THEME_ID, false, {
			paletteMode: 'wallpaper',
			target
		});

		expect(target.classList.contains('theme-yumemita')).toBe(false);
		engine.dispose();
	});
});
