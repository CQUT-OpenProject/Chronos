import type { ChronosEnv } from '../types/env';
import type { Disposable } from '../types/services';
import type { HttpRequestOptions, HttpResponse } from '../types/services';

export type NativeHostCapability =
	| 'storage'
	| 'http'
	| 'vault'
	| 'runtime'
	| 'notification'
	| 'haptic';

export interface NativeBridgeRequest<T = unknown> {
	readonly id: string;
	readonly method: string;
	readonly capability: NativeHostCapability;
	readonly params?: T;
}

export interface NativeBridgeResponse<T = unknown> {
	readonly id: string;
	readonly result?: T;
	readonly error?: {
		readonly code: string;
		readonly message: string;
	};
}

export interface NativeHostBridge {
	callNative<T = unknown, R = unknown>(
		capability: NativeHostCapability,
		method: string,
		params?: T
	): Promise<R>;
	onNativeNotification?(event: string, handler: (payload: unknown) => void): Disposable;
}

/**
 * Creates a standard Headless ChronosEnv driven entirely by a NativeHostBridge
 * (suitable for iOS Swift JavaScriptCore and Android Kotlin QuickJS engines).
 * Frozen experimental API — no production adapters yet; baseline tests only.
 */
export function createNativeHostEnv(
	bridge: NativeHostBridge,
	platform: 'ios' | 'android'
): ChronosEnv {
	return {
		platform,
		http: {
			request: (url: string, opts?: HttpRequestOptions): Promise<HttpResponse> =>
				bridge.callNative<[string, HttpRequestOptions | undefined], HttpResponse>(
					'http',
					'request',
					[url, opts]
				),
			clearSession: (sessionId: string): Promise<void> =>
				bridge.callNative<string, void>('http', 'clearSession', sessionId)
		},
		storage: {
			getTimetable: (id: string) => bridge.callNative('storage', 'getTimetable', { id }),
			listTimetables: () => bridge.callNative('storage', 'listTimetables'),
			saveTimetable: (tt) => bridge.callNative('storage', 'saveTimetable', tt),
			patchTimetable: (id, patch) => bridge.callNative('storage', 'patchTimetable', { id, patch }),
			deleteTimetable: (id) => bridge.callNative('storage', 'deleteTimetable', { id }),
			getActiveTimetableId: () => bridge.callNative('storage', 'getActiveTimetableId'),
			setActiveTimetableId: (id) => bridge.callNative('storage', 'setActiveTimetableId', { id }),
			getPreferences: () => bridge.callNative('storage', 'getPreferences'),
			savePreferences: (p) => bridge.callNative('storage', 'savePreferences', p),
			getPluginData: (pid, k) =>
				bridge.callNative('storage', 'getPluginData', { pluginId: pid, key: k }),
			setPluginData: (pid, k, v) =>
				bridge.callNative('storage', 'setPluginData', { pluginId: pid, key: k, value: v }),
			deletePluginData: (pid, k) =>
				bridge.callNative('storage', 'deletePluginData', { pluginId: pid, key: k })
		},
		vault: {
			isSupported: () => bridge.callNative('vault', 'isSupported'),
			storeSecret: (k, s, opts) =>
				bridge.callNative('vault', 'storeSecret', { key: k, secret: s, opts }),
			getSecret: (k) => bridge.callNative('vault', 'getSecret', { key: k }),
			removeSecret: (k) => bridge.callNative('vault', 'removeSecret', { key: k })
		},
		runtime: {
			setTimeout: (fn, ms) => {
				return setTimeout(fn, ms) as unknown as number;
			},
			clearTimeout: (h) => {
				clearTimeout(h);
			},
			sha256: async (data) => {
				return bridge.callNative('runtime', 'sha256', { data });
			},
			encodeUtf8: (str) => new TextEncoder().encode(str),
			decodeUtf8: (bytes) => new TextDecoder().decode(bytes)
		}
	};
}
