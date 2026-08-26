import { describe, it, expect, vi } from 'vite-plus/test';
import { ScopedContext } from '../src/runtime/scoped-context';
import { EventPipeline } from '../src/runtime/event-pipeline';
import { HierarchicalSlotRegistry } from '../src/runtime/hierarchical-slot-registry';
import { ServiceContainer } from '../src/runtime/service-container';
import { ThemeRegistry } from '../src/runtime/theme-registry';
import { BadgeManager } from '../src/runtime/badge-manager';
import { I18nCatalog } from '../src/i18n/i18n-catalog';
import { IStorageService, IHttpService, createServiceIdentifier } from '../src/types/services';
import type { ChronosEnv } from '../src/types/env';
import { DEFAULT_USER_PREFERENCES } from '../src/domain/preferences';

function createMockHost() {
	const kvStore = new Map<string, unknown>();

	const storageService: import('../src/types/services').IStorageService = {
		getTimetable: vi.fn(),
		listTimetables: vi.fn(),
		saveTimetable: vi.fn(),
		deleteTimetable: vi.fn(),
		getActiveTimetableId: vi.fn(),
		setActiveTimetableId: vi.fn(),
		queryCourses: vi.fn(async () => []),
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
	};

	const httpService: import('../src/types/services').IHttpService = {
		request: vi.fn()
	};

	const services = new ServiceContainer();
	services.register(IStorageService, storageService);
	services.register(IHttpService, httpService);

	const eventPipeline = new EventPipeline();
	const slots = new HierarchicalSlotRegistry();
	const themes = new ThemeRegistry();
	const badges = new BadgeManager();
	const i18nCatalog = new I18nCatalog();

	const env: ChronosEnv = {
		platform: 'node',
		http: httpService,
		storage: storageService,
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

	return {
		env,
		services,
		events: eventPipeline,
		slots,
		themes,
		badges,
		i18nCatalog,
		locale: 'zh-cn',
		t: (key: string) => key,
		translateForPlugin: (pluginId: string, key: string) =>
			i18nCatalog.t(pluginId, key, 'zh-cn') ?? key,
		state: {
			currentTimetable: null,
			activeWeek: 1,
			currentPeriodIndex: null,
			activeThemeId: 'default',
			activeIconThemeId: 'host-default',
			userPreferences: DEFAULT_USER_PREFERENCES
		},
		actions: {
			createTimetable: vi.fn(),
			importTimetable: vi.fn(),
			switchTimetable: vi.fn(),
			deleteTimetable: vi.fn(),
			saveCurrentTimetableDetails: vi.fn(),
			saveCourse: vi.fn(),
			updateCourse: vi.fn(),
			deleteCourse: vi.fn(),
			setTheme: vi.fn(),
			updatePreferences: vi.fn(),
			revertToDefaultThemes: vi.fn(),
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

	it('resolves capability services from ServiceContainer', () => {
		const host = createMockHost();
		const ctx = new ScopedContext('plugin-a', host);

		const http = ctx.service(IHttpService);
		expect(http).toBeDefined();
		expect(typeof http.request).toBe('function');

		const missingId = createServiceIdentifier<unknown>('nonExistent');
		expect(() => ctx.service(missingId)).toThrowError();
	});

	it('updates config, persists to storage and fires event', async () => {
		const host = createMockHost();
		const ctx = new ScopedContext<{ campus: string }>('plugin-a', host, {
			campus: 'huaxi'
		});

		const onConfigChanged = vi.fn();
		host.events.on('config:changed', onConfigChanged);

		expect(ctx.config.campus).toBe('huaxi');
		await ctx.updateConfig({ campus: 'liangjiang' });

		expect(ctx.config.campus).toBe('liangjiang');
		expect(onConfigChanged).toHaveBeenCalledWith({
			pluginId: 'plugin-a',
			config: { campus: 'liangjiang' }
		});
		expect(await ctx.storage.get('__config__')).toEqual({ campus: 'liangjiang' });
	});

	it('tracks subscriptions and disposes all in LIFO order upon ctx.dispose()', () => {
		const host = createMockHost();
		const ctx = new ScopedContext('plugin-a', host);
		const callOrder: string[] = [];

		ctx.addDisposable({
			dispose: () => {
				callOrder.push('first-registered');
			}
		});

		ctx.registerSlot('mine.item', {
			id: 'item-1',
			sectionId: 'sec',
			title: 'Item 1'
		});

		ctx.addDisposable({
			dispose: () => {
				callOrder.push('last-registered');
			}
		});

		expect(ctx.subscriptions.length).toBe(3);
		expect(host.slots.get('mine.item').length).toBe(1);

		ctx.dispose();

		expect(ctx.subscriptions.length).toBe(0);
		expect(host.slots.get('mine.item').length).toBe(0);
		expect(callOrder).toEqual(['last-registered', 'first-registered']);
	});

	it('routes timetable.cell.badge slot registration to BadgeManager and unregisters upon disposal', () => {
		const host = createMockHost();
		const ctx = new ScopedContext('plugin-a', host);

		const handle = ctx.registerSlot('timetable.cell.badge', {
			id: 'badge-test',
			getBadge: () => ({ id: 'b1', text: 'Badge 1' })
		});

		expect(host.slots.get('timetable.cell.badge').length).toBe(1);

		handle.dispose();

		expect(host.slots.get('timetable.cell.badge').length).toBe(0);
	});
});
