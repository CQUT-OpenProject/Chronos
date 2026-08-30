import { describe, expect, it } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import { m3DefaultTheme } from '@chronos/ui-kit';
const YUMEMITA_THEME_ID = 'yumemita';
import { applyActiveTheme } from './apply-active-theme';

function createFakeElement() {
	const classes = new Set<string>();
	const style = new Map<string, string>();
	return {
		classList: {
			add: (cls: string) => classes.add(cls),
			remove: (cls: string) => classes.delete(cls),
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
		},
		getStyle: () => style
	} as unknown as HTMLElement & { getStyle: () => Map<string, string> };
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
						json: async <T>() => ({}) as T,
						bytes: async () => new Uint8Array()
					})
				},
				storage: {
					getTimetable: async () => null,
					listTimetables: async () => [],
					saveTimetable: async () => {},
					deleteTimetable: async () => {},
					getActiveTimetableId: async () => null,
					setActiveTimetableId: async () => {},
					queryCourses: async () => [],
					getPreferences: async () => ({
						schemaVersion: 2,
						themeMode: 'auto',
						paletteMode: 'wallpaper',
						timetableLayoutMode: 'fixed',
						capsuleCornerStyle: 'rounded',
						hapticFeedbackEnabled: true,
						visualThemeId: 'm3-default'
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
					sha256: async () => ''
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

	it('applies className and workbench colors from ThemeContribution', () => {
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
						json: async <T>() => ({}) as T,
						bytes: async () => new Uint8Array()
					})
				},
				storage: {
					getTimetable: async () => null,
					listTimetables: async () => [],
					saveTimetable: async () => {},
					deleteTimetable: async () => {},
					getActiveTimetableId: async () => null,
					setActiveTimetableId: async () => {},
					queryCourses: async () => [],
					getPreferences: async () => ({
						schemaVersion: 2,
						themeMode: 'auto',
						paletteMode: 'vibrant',
						timetableLayoutMode: 'fixed',
						capsuleCornerStyle: 'rounded',
						hapticFeedbackEnabled: true,
						visualThemeId: 'm3-default'
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
					sha256: async () => ''
				}
			}
		});

		engine.themes.registerTheme({
			id: 'custom-theme',
			name: () => 'Custom Theme',
			className: 'theme-custom',
			workbenchColors: {
				light: {
					'color.primary': '#123456',
					'shell.bottomTab.activeBackground': 'transparent'
				},
				dark: {
					'color.primary': '#abcdef'
				}
			}
		});

		const target = createFakeElement();
		const styleMap = (target as HTMLElement & { getStyle: () => Map<string, string> }).getStyle();

		applyActiveTheme(engine, 'custom-theme', false, {
			paletteMode: 'vibrant',
			target
		});

		expect(target.classList.contains('theme-custom')).toBe(true);
		expect(styleMap.get('--color-primary')).toBe('#123456');
		expect(styleMap.get('--shell-bottom-tab-active-bg')).toBe('transparent');
		engine.dispose();
	});
});
