import { describe, it, expect, beforeEach, vi } from 'vite-plus/test';
import { getAppController, resetAppEngine, ensureEngineReady } from './app-engine';
import type { ChronosDB } from '$lib/storage/db';

class MockLocalStorage implements Storage {
	private map = new Map<string, string>();
	get length(): number {
		return this.map.size;
	}
	clear(): void {
		this.map.clear();
	}
	getItem(key: string): string | null {
		return this.map.get(key) ?? null;
	}
	key(index: number): string | null {
		return Array.from(this.map.keys())[index] ?? null;
	}
	removeItem(key: string): void {
		this.map.delete(key);
	}
	setItem(key: string, value: string): void {
		this.map.set(key, value);
	}
}

function createMockDb(): ChronosDB {
	return {
		timetables: {
			get: vi.fn(async () => undefined),
			put: vi.fn(async () => 'id'),
			delete: vi.fn(async () => {}),
			orderBy: vi.fn(() => ({ reverse: () => ({ toArray: async () => [] }) }))
		},
		courses: {
			where: vi.fn(() => ({
				equals: () => ({
					toArray: async () => [],
					primaryKeys: async () => [],
					delete: async () => {}
				})
			})),
			bulkPut: vi.fn(async () => {}),
			bulkDelete: vi.fn(async () => {})
		},
		wallpapers: {
			get: vi.fn(async () => undefined),
			put: vi.fn(async () => 'default'),
			delete: vi.fn(async () => {})
		},
		pluginData: {
			get: vi.fn(async () => undefined),
			put: vi.fn(async () => 'id'),
			delete: vi.fn(async () => {})
		},
		transaction: vi.fn(async (_mode: string, ...args: unknown[]) => {
			const fn = args[args.length - 1] as () => Promise<void>;
			return fn();
		})
	} as unknown as ChronosDB;
}

describe('app-engine bootstrap', () => {
	beforeEach(() => {
		resetAppEngine();
	});

	it('registers shell slots when getAppController is called before bootstrap completes', async () => {
		const mockDb = createMockDb();
		const mockStore = new MockLocalStorage();
		const opts = { database: mockDb, localStorage: mockStore };

		const controller = getAppController(opts);
		expect(controller.getSlots('shell.bottom-bar.tab').map((tab) => tab.id)).toEqual([
			'timetable',
			'mine'
		]);
		expect(controller.getSlots('mine.section').length).toBeGreaterThan(0);

		await ensureEngineReady(opts);
	});

	it('initializes shared ChronosEngine and ReactiveChronosController with builtin plugins and m3 theme', async () => {
		const mockDb = createMockDb();
		const mockStore = new MockLocalStorage();

		const engine = await ensureEngineReady({ database: mockDb, localStorage: mockStore });

		expect(engine).toBeDefined();
		expect(engine.themes.getTheme('m3-default')).toBeDefined();

		const controller = getAppController({ database: mockDb, localStorage: mockStore });
		expect(controller).toBeDefined();
		expect(controller.getSlots('import.source.tab').length).toBeGreaterThan(0);
		expect(controller.getSlots('export.action').length).toBeGreaterThan(0);
		expect(controller.getSlots('shell.bottom-bar.tab').map((tab) => tab.id)).toEqual([
			'timetable',
			'mine'
		]);
		expect(controller.getSlots('mine.section').length).toBeGreaterThan(0);
		expect(controller.getSlots('mine.item').length).toBeGreaterThan(0);
		expect(engine.themes.getThemes().length).toBeGreaterThan(0);
	});
});
