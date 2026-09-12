import { describe, expect, it, vi } from 'vite-plus/test';
import type { ChronosDB, PluginBinaryRow, PluginDataRow } from '$lib/storage/db';
import { PluginKvRepository } from '$lib/storage/plugin-kv-repository';

function createMockDb() {
	const pluginDataMap = new Map<string, PluginDataRow>();
	const pluginBinaryMap = new Map<string, PluginBinaryRow>();

	const db = {
		pluginData: {
			clear: vi.fn(async () => pluginDataMap.clear()),
			get: vi.fn(async (id: string) => pluginDataMap.get(id)),
			put: vi.fn(async (row: PluginDataRow) => {
				pluginDataMap.set(row.id, row);
			}),
			delete: vi.fn(async (id: string) => {
				pluginDataMap.delete(id);
			}),
			where: vi.fn(() => ({
				equals: (pluginId: string) => ({
					delete: async () => {
						for (const [id, row] of pluginDataMap.entries()) {
							if (row.pluginId === pluginId) pluginDataMap.delete(id);
						}
					}
				})
			})),
			toArray: async () => Array.from(pluginDataMap.values())
		},
		pluginBinary: {
			clear: vi.fn(async () => pluginBinaryMap.clear()),
			get: vi.fn(async (id: string) => pluginBinaryMap.get(id)),
			put: vi.fn(async (row: PluginBinaryRow) => {
				pluginBinaryMap.set(row.id, row);
			}),
			delete: vi.fn(async (id: string) => {
				pluginBinaryMap.delete(id);
			}),
			where: vi.fn(() => ({
				equals: (pluginId: string) => ({
					delete: async () => {
						for (const [id, row] of pluginBinaryMap.entries()) {
							if (row.pluginId === pluginId) pluginBinaryMap.delete(id);
						}
					}
				})
			})),
			toArray: async () => Array.from(pluginBinaryMap.values())
		}
	} as unknown as ChronosDB;

	return { db, pluginDataMap, pluginBinaryMap };
}

describe('PluginKvRepository', () => {
	it('roundtrips Blob and Uint8Array values', async () => {
		const { db } = createMockDb();
		const repo = new PluginKvRepository(db);

		const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' });
		await repo.set('plugin-a', 'wallpaper', blob);
		const loadedBlob = await repo.get<Blob>('plugin-a', 'wallpaper');
		expect(loadedBlob).toBeInstanceOf(Blob);
		expect(new Uint8Array(await (loadedBlob as Blob).arrayBuffer())).toEqual(
			new Uint8Array([1, 2, 3])
		);

		await repo.set('plugin-a', 'bytes', new Uint8Array([9, 8, 7]));
		const loadedBytes = await repo.get<Blob>('plugin-a', 'bytes');
		expect(loadedBytes).toBeInstanceOf(Blob);
		expect((loadedBytes as Blob).type).toBe('application/octet-stream');
		expect(new Uint8Array(await (loadedBytes as Blob).arrayBuffer())).toEqual(
			new Uint8Array([9, 8, 7])
		);
	});

	it('replaces JSON with binary for the same key', async () => {
		const { db, pluginDataMap, pluginBinaryMap } = createMockDb();
		const repo = new PluginKvRepository(db);

		await repo.set('plugin-a', 'asset', { version: 1 });
		expect(pluginDataMap.has('plugin-a:asset')).toBe(true);
		expect(pluginBinaryMap.has('plugin-a:asset')).toBe(false);

		await repo.set('plugin-a', 'asset', new Uint8Array([1]));
		expect(pluginDataMap.has('plugin-a:asset')).toBe(false);
		expect(pluginBinaryMap.has('plugin-a:asset')).toBe(true);
		expect(await repo.get('plugin-a', 'asset')).toBeInstanceOf(Blob);
	});

	it('replaces binary with JSON for the same key', async () => {
		const { db, pluginDataMap, pluginBinaryMap } = createMockDb();
		const repo = new PluginKvRepository(db);

		await repo.set('plugin-a', 'asset', new Uint8Array([1]));
		await repo.set('plugin-a', 'asset', { version: 2 });

		expect(pluginBinaryMap.has('plugin-a:asset')).toBe(false);
		expect(pluginDataMap.has('plugin-a:asset')).toBe(true);
		expect(await repo.get<{ version: number }>('plugin-a', 'asset')).toEqual({ version: 2 });
	});
});
