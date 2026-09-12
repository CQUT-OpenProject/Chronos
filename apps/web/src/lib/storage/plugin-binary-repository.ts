import type { ChronosDB, PluginBinaryRow } from '$lib/storage/db';

const DEFAULT_MIME = 'application/octet-stream';

function pluginDataId(pluginId: string, key: string): string {
	return `${pluginId}:${key}`;
}

async function toArrayBuffer(value: Blob | Uint8Array): Promise<ArrayBuffer> {
	if (value instanceof Uint8Array) {
		return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
	}
	return value.arrayBuffer();
}

function resolveMimeType(value: Blob | Uint8Array): string {
	if (value instanceof Blob && value.type) return value.type;
	return DEFAULT_MIME;
}

/** Dexie-backed binary plugin key-value storage. */
export class PluginBinaryRepository {
	constructor(private database: ChronosDB) {}

	async get(pluginId: string, key: string): Promise<Blob | null> {
		const id = pluginDataId(pluginId, key);
		try {
			const row = await this.database.pluginBinary.get(id);
			if (!row?.bytes) return null;
			return new Blob([row.bytes], { type: row.mimeType || DEFAULT_MIME });
		} catch {
			return null;
		}
	}

	async set(pluginId: string, key: string, value: Blob | Uint8Array): Promise<void> {
		const id = pluginDataId(pluginId, key);
		const bytes = await toArrayBuffer(value);
		await this.database.pluginBinary.put({
			id,
			pluginId,
			key,
			mimeType: resolveMimeType(value),
			bytes,
			updatedAt: Date.now()
		} satisfies PluginBinaryRow);
	}

	async delete(pluginId: string, key: string): Promise<void> {
		await this.database.pluginBinary.delete(pluginDataId(pluginId, key));
	}

	async clear(pluginId: string): Promise<void> {
		await this.database.pluginBinary.where('pluginId').equals(pluginId).delete();
	}

	async clearAll(): Promise<void> {
		await this.database.pluginBinary.clear();
	}

	async estimateBytes(): Promise<number> {
		try {
			const rows = await this.database.pluginBinary.toArray();
			let total = 0;
			for (const row of rows) {
				total += row.bytes.byteLength;
				total += row.mimeType.length;
			}
			return total;
		} catch {
			return 0;
		}
	}
}
