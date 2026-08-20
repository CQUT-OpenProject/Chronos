import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine } from '../src/runtime/engine';
import { ProfileManager } from '../src/profile/profile-manager';
import { resolveLayeredPluginConfig, type ChronosProfile } from '../src/profile/profile';
import type { ChronosPlugin } from '../src/types/context';

describe('Profile System and Layered Config', () => {
	it('correctly resolves layered plugin configs across 4 priority levels', () => {
		const schemaDefault: Record<string, unknown> = {
			campusId: 'huaxi',
			autoSync: false,
			timeout: 3000
		};
		const manifestConfig: Record<string, unknown> = { timeout: 5000 };
		const profileConfig: Record<string, unknown> = { campusId: 'liangjiang' };
		const userPatch: Record<string, unknown> = { autoSync: true };

		const merged = resolveLayeredPluginConfig(
			schemaDefault,
			manifestConfig,
			profileConfig,
			userPatch
		);

		expect(merged).toEqual({
			campusId: 'liangjiang', // Overridden by Profile
			autoSync: true, // Overridden by User
			timeout: 5000 // Overridden by Manifest
		});
	});

	it('assembles and configures plugins according to profile declaration', async () => {
		const engine = new ChronosEngine({
			env: {
				platform: 'web',
				http: {
					request: vi.fn()
				},
				storage: {
					getTimetable: vi.fn().mockResolvedValue(null),
					listTimetables: vi.fn().mockResolvedValue([]),
					saveTimetable: vi.fn().mockResolvedValue(undefined),
					patchTimetable: vi.fn().mockResolvedValue(undefined),
					deleteTimetable: vi.fn().mockResolvedValue(undefined),
					getActiveTimetableId: vi.fn().mockResolvedValue(null),
					setActiveTimetableId: vi.fn().mockResolvedValue(undefined),
					getPreferences: vi.fn().mockResolvedValue({
						schemaVersion: 1,
						themeMode: 'auto',
						paletteMode: 'vibrant',
						timetableLayoutMode: 'fixed',
						capsuleCornerStyle: 'rounded',
						hapticFeedbackEnabled: true
					}),
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
					setTimeout: (h, ms) => setTimeout(h, ms) as unknown as number,
					clearTimeout: (h) => clearTimeout(h),
					sha256: async () => '',
					encodeUtf8: (s) => new TextEncoder().encode(s),
					decodeUtf8: (b) => new TextDecoder().decode(b)
				}
			}
		});

		const manager = new ProfileManager(engine);

		let appliedConfig: Record<string, unknown> | null = null;
		const pluginA: ChronosPlugin = {
			id: 'plugin-a',
			name: 'Plugin A',
			version: '1.0.0',
			defaultConfig: { mode: 'fast' },
			apply(ctx) {
				appliedConfig = ctx.config;
			}
		};

		const pluginB: ChronosPlugin = {
			id: 'plugin-b',
			name: 'Plugin B',
			version: '1.0.0',
			apply: vi.fn()
		};

		const profile: ChronosProfile = {
			profileId: 'test-profile',
			name: 'Test Profile',
			version: '1.0.0',
			defaultTheme: 'catppuccin-latte',
			plugins: [
				{
					id: 'plugin-a',
					enabled: true,
					config: { mode: 'thorough', customFlag: true }
				},
				{
					id: 'plugin-b',
					enabled: false // Disabled in profile
				}
			],
			preferences: {
				themeMode: 'dark',
				hapticFeedbackEnabled: false
			}
		};

		const handle = await manager.applyProfile(profile, [pluginA, pluginB]);

		expect(manager.getActiveProfile()?.profileId).toBe('test-profile');
		expect(engine.state.activeThemeId).toBe('catppuccin-latte');
		expect(engine.state.userPreferences.themeMode).toBe('dark');
		expect(engine.state.userPreferences.hapticFeedbackEnabled).toBe(false);

		expect(engine.isPluginLoaded('plugin-a')).toBe(true);
		expect(engine.isPluginLoaded('plugin-b')).toBe(false);
		expect(appliedConfig).toEqual({
			mode: 'thorough',
			customFlag: true
		});

		handle.dispose();
		expect(engine.isPluginLoaded('plugin-a')).toBe(false);

		engine.dispose();
	});
});
