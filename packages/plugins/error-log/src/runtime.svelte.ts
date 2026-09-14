/// <reference types="svelte" />
import type { ChronosContext } from '@chronos/core';
import { ERROR_LOG_PLUGIN_ID, ERROR_LOG_STORAGE_KEY } from './constants';
import { appendRingBuffer, parseStoredEntries, type ErrorLogEntry } from './error-log';

export interface ErrorLogRuntime {
	readonly entries: readonly ErrorLogEntry[];
	load(): Promise<void>;
	append(entry: ErrorLogEntry): Promise<void>;
	clear(): Promise<void>;
	dispose(): void;
}

const runtimeRegistry = new Map<string, ErrorLogRuntime>();

export function getErrorLogRuntime(pluginId: string = ERROR_LOG_PLUGIN_ID): ErrorLogRuntime {
	const runtime = runtimeRegistry.get(pluginId);
	if (!runtime) {
		throw new Error(`[ErrorLogRuntime] not initialized for plugin "${pluginId}"`);
	}
	return runtime;
}

export function createErrorLogRuntime(
	ctx: ChronosContext,
	pluginId: string = ERROR_LOG_PLUGIN_ID
): ErrorLogRuntime {
	let entries = $state.raw<ErrorLogEntry[]>([]);
	let persistChain = Promise.resolve();

	function schedulePersist(write: () => Promise<void>): Promise<void> {
		persistChain = persistChain.then(write, write);
		return persistChain;
	}

	const runtime: ErrorLogRuntime = {
		get entries() {
			return entries;
		},
		async load() {
			await persistChain;
			const stored = await ctx.storage.get<unknown>(ERROR_LOG_STORAGE_KEY);
			entries = parseStoredEntries(stored);
		},
		async append(entry: ErrorLogEntry) {
			entries = appendRingBuffer(entries, entry);
			await schedulePersist(() => ctx.storage.set(ERROR_LOG_STORAGE_KEY, entries));
		},
		async clear() {
			entries = [];
			await schedulePersist(() => ctx.storage.delete(ERROR_LOG_STORAGE_KEY));
		},
		dispose() {
			if (runtimeRegistry.get(pluginId) === runtime) {
				runtimeRegistry.delete(pluginId);
			}
		}
	};

	runtimeRegistry.set(pluginId, runtime);
	return runtime;
}
