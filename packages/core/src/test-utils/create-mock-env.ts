import { vi } from 'vite-plus/test';
import { DEFAULT_USER_PREFERENCES } from '../domain/preferences';
import type { Timetable } from '../domain/timetable';
import type { ChronosEnv, StorageChangeEvent } from '../types/env';

export interface MockEnvOptions {
	http?: Partial<ChronosEnv['http']>;
	storage?: Partial<ChronosEnv['storage']>;
	vault?: Partial<NonNullable<ChronosEnv['vault']>>;
	runtime?: Partial<ChronosEnv['runtime']>;
	platform?: ChronosEnv['platform'];
}

export function createMockEnv(options: MockEnvOptions = {}) {
	const timetables = new Map<string, Timetable>();
	let activeId: string | null = null;
	let prefs = { ...DEFAULT_USER_PREFERENCES };
	const kv = new Map<string, unknown>();
	const listeners = new Set<(e: StorageChangeEvent) => void>();

	const env: ChronosEnv = {
		platform: options.platform ?? 'web',
		http: {
			request: vi.fn(),
			...options.http
		},
		storage: {
			getTimetable: async (id: string) => timetables.get(id) ?? null,
			listTimetables: async () =>
				Array.from(timetables.values()).map((t) => ({
					id: t.id,
					name: t.name,
					updatedAt: t.updatedAt
				})),
			saveTimetable: async (t: Timetable) => {
				timetables.set(t.id, t);
			},
			deleteTimetable: async (id: string) => {
				timetables.delete(id);
			},
			getActiveTimetableId: async () => activeId,
			setActiveTimetableId: async (id: string) => {
				activeId = id || null;
			},
			queryCourses: async () => [],
			getPreferences: async () => prefs,
			savePreferences: async (patch) => {
				prefs = { ...prefs, ...patch };
			},
			getPluginData: async <T>(pluginId: string, key: string): Promise<T | null> =>
				(kv.get(`${pluginId}:${key}`) as T) ?? null,
			setPluginData: async <T>(pluginId: string, key: string, val: T): Promise<void> => {
				kv.set(`${pluginId}:${key}`, val);
			},
			deletePluginData: async (pluginId: string, key: string): Promise<void> => {
				kv.delete(`${pluginId}:${key}`);
			},
			onChanged: (l: (e: StorageChangeEvent) => void) => {
				listeners.add(l);
				return { dispose: () => listeners.delete(l) };
			},
			...options.storage
		},
		vault: {
			isSupported: async () => false,
			storeSecret: vi.fn(),
			getSecret: vi.fn(),
			removeSecret: vi.fn(),
			...options.vault
		},
		runtime: {
			sha256: async () => 'hash',
			...options.runtime
		}
	};

	return {
		env,
		timetables,
		triggerStorageChange: (e: StorageChangeEvent) => {
			for (const l of listeners) l(e);
		}
	};
}
