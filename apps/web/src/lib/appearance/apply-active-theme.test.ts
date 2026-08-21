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
						json: async <T>() => ({}) as T,
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

	it('applies className and customCssVars from self-describing ThemeContribution', () => {
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
					patchTimetable: async () => {},
					deleteTimetable: async () => {},
					getActiveTimetableId: async () => null,
					setActiveTimetableId: async () => {},
					getPreferences: async () => ({
						schemaVersion: 1,
						themeMode: 'auto',
						paletteMode: 'vibrant',
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

		engine.themes.registerTheme({
			id: 'custom-theme',
			name: () => 'Custom Theme',
			className: 'theme-custom',
			customCssVars: {
				'--custom-primary': '#123456'
			},
			getTokens: () => ({
				surface: '#fff',
				onSurface: '#000',
				primary: '#123456',
				onPrimary: '#fff',
				surfaceVariant: '#eee',
				outline: '#ccc'
			})
		});

		const styleMap = new Map<string, string>();
		const classes = new Set<string>();
		const target = {
			classList: {
				add: (cls: string) => classes.add(cls),
				remove: (cls: string) => classes.delete(cls),
				toggle: (cls: string, force?: boolean) => {
					if (force ?? !classes.has(cls)) classes.add(cls);
					else classes.delete(cls);
				},
				contains: (cls: string) => classes.has(cls)
			},
			style: {
				setProperty: (name: string, value: string) => {
					styleMap.set(name, value);
				},
				removeProperty: (name: string) => {
					styleMap.delete(name);
				},
				[Symbol.iterator]: function* () {
					for (const key of styleMap.keys()) yield key;
				}
			}
		} as unknown as HTMLElement;

		applyActiveTheme(engine, 'custom-theme', false, {
			paletteMode: 'vibrant',
			target
		});

		expect(target.classList.contains('theme-custom')).toBe(true);
		expect(styleMap.get('--custom-primary')).toBe('#123456');
		engine.dispose();
	});
});
