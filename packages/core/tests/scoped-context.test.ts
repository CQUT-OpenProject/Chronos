import { describe, it, expect, vi } from 'vite-plus/test';
import { ScopedContext } from '../src/runtime/scoped-context';
import { EventBus } from '../src/runtime/event-bus';
import { Pipeline } from '../src/runtime/pipeline';
import { SlotRegistry } from '../src/runtime/slot-registry';
import { ThemeRegistry } from '../src/runtime/theme-registry';
import { BadgeManager } from '../src/runtime/badge-manager';
import type { ChronosEnv } from '../src/types/env';
import { DEFAULT_USER_PREFERENCES } from '../src/domain/preferences';

function createMockHost() {
	const kvStore = new Map<string, unknown>();

	const env: ChronosEnv = {
		platform: 'node',
		http: {
			request: vi.fn()
		},
		storage: {
			getTimetable: vi.fn(),
			listTimetables: vi.fn(),
			saveTimetable: vi.fn(),
			patchTimetable: vi.fn(),
			deleteTimetable: vi.fn(),
			getActiveTimetableId: vi.fn(),
			setActiveTimetableId: vi.fn(),
			getPreferences: async () => DEFAULT_USER_PREFERENCES,
			savePreferences: vi.fn(),
			getPluginData: async <T>(pluginId: string, key: string): Promise<T | null> =>
				(kvStore.get(`${pluginId}:${key}`) as T) ?? null,
			setPluginData: async <T>(pluginId: string, key: string, value: T): Promise<void> => {
				kvStore.set(`${pluginId}:${key}`, value);
			},
			deletePluginData: async (pluginId: string, key: string): Promise<void> => {
				kvStore.delete(`${pluginId}:${key}`);
			}
		},
		vault: {
			isSupported: async () => false,
			storeSecret: vi.fn(),
			getSecret: vi.fn(),
			removeSecret: vi.fn()
		},
		runtime: {
			setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) as unknown as number,
			clearTimeout: (h: number) => clearTimeout(h),
			sha256: async () => 'hash',
			encodeUtf8: (s: string) => new TextEncoder().encode(s),
			decodeUtf8: (b: Uint8Array) => new TextDecoder().decode(b)
		}
	};

	const events = new EventBus();
	const pipeline = new Pipeline();
	const slots = new SlotRegistry();
	const themes = new ThemeRegistry();
	const badges = new BadgeManager();

	return {
		env,
		events,
		pipeline,
		slots,
		themes,
		badges,
		locale: 'zh-CN',
		t: (key: string) => key,
		state: {
			currentTimetable: null,
			activeWeek: 1,
			currentPeriodIndex: null,
			activeThemeId: 'default',
			userPreferences: DEFAULT_USER_PREFERENCES
		},
		actions: {
			createTimetable: vi.fn(),
			switchTimetable: vi.fn(),
			deleteTimetable: vi.fn(),
			saveCurrentTimetableDetails: vi.fn(),
			saveCourse: vi.fn(),
			updateCourse: vi.fn(),
			deleteCourse: vi.fn(),
			setTheme: vi.fn(),
			updatePreferences: vi.fn(),
			notify: vi.fn()
		}
	};
}

describe('ScopedContext in @chronos/core', () => {
	it('isolates storage namespace by pluginId', async () => {
		const host = createMockHost();
		const ctxA = new ScopedContext('plugin-a', host);
		const ctxB = new ScopedContext('plugin-b', host);

		await ctxA.storage.set('config', { enabled: true });
		await ctxB.storage.set('config', { enabled: false });

		expect(await ctxA.storage.get('config')).toEqual({ enabled: true });
		expect(await ctxB.storage.get('config')).toEqual({ enabled: false });

		await ctxA.storage.delete('config');
		expect(await ctxA.storage.get('config')).toBeNull();
		expect(await ctxB.storage.get('config')).toEqual({ enabled: false });
	});

	it('tracks subscriptions and disposes all upon ctx.dispose()', () => {
		const host = createMockHost();
		const ctx = new ScopedContext('plugin-a', host);

		ctx.on('theme:changed', vi.fn());
		ctx.registerSource({
			id: 'source-1',
			title: 'Source',
			authType: 'none',
			fetchSchedule: vi.fn()
		});
		ctx.registerTheme({
			id: 'theme-1',
			name: 'Theme',
			getTokens: () => ({
				surface: '#fff',
				onSurface: '#000',
				primary: '#123',
				onPrimary: '#fff',
				surfaceVariant: '#eee',
				outline: '#ccc'
			})
		});

		expect(ctx.subscriptions.length).toBe(3);
		expect(host.slots.getSources().length).toBe(1);
		expect(host.themes.getThemes().length).toBe(1);

		ctx.dispose();

		expect(ctx.subscriptions.length).toBe(0);
		expect(host.slots.getSources().length).toBe(0);
		expect(host.themes.getThemes().length).toBe(0);
	});
});
