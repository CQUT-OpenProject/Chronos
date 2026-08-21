import type { ChronosEngine } from '@chronos/core';
import { getAppEngine } from '$lib/services/app-engine';

export const CHRONOS_STORAGE_PREFIX = 'chronos';
const textEncoder = new TextEncoder();

function listStorageKeysWithPrefix(
	storage: Pick<Storage, 'length' | 'key'>,
	prefix: string
): string[] {
	const keys: string[] = [];
	for (let index = 0; index < storage.length; index += 1) {
		const key = storage.key(index);
		if (key?.startsWith(prefix)) {
			keys.push(key);
		}
	}
	return keys;
}

export function estimateStorageBytes(
	storage: Pick<Storage, 'length' | 'key' | 'getItem'>,
	prefix: string
): number {
	let total = 0;
	for (const key of listStorageKeysWithPrefix(storage, prefix)) {
		total += textEncoder.encode(key).length;
		const value = storage.getItem(key);
		if (value) {
			total += textEncoder.encode(value).length;
		}
	}
	return total;
}

export async function estimateAppDataBytes(engine?: ChronosEngine): Promise<number> {
	const resolvedEngine = engine ?? getAppEngine();
	let total = 0;
	if (resolvedEngine?.storage?.estimateStorageBytes) {
		total += await resolvedEngine.storage.estimateStorageBytes();
	}
	if (typeof localStorage !== 'undefined') {
		total += estimateStorageBytes(localStorage, CHRONOS_STORAGE_PREFIX);
	}
	if (typeof sessionStorage !== 'undefined') {
		total += estimateStorageBytes(sessionStorage, CHRONOS_STORAGE_PREFIX);
	}
	return total;
}

export function formatAppDataSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
