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

/** Maps to iOS UIImpactFeedbackStyle / Android CLOCK_TICK · KEYBOARD_TAP-style semantics. */
export type NativeHapticImpactStyle = 'light' | 'medium' | 'heavy';

/** Maps to iOS UINotificationFeedbackType / Android confirm · reject style semantics. */
export type NativeHapticNotificationType = 'success' | 'warning' | 'error';

export interface NativeHapticImpactParams {
	readonly style: NativeHapticImpactStyle;
}

export interface NativeHapticNotificationParams {
	readonly type: NativeHapticNotificationType;
}

/** Optional empty params for selection-changed ticks (iOS UISelectionFeedbackGenerator). */
export type NativeHapticSelectionParams = Record<string, never> | undefined;

/**
 * Haptic capability methods on a native host bridge.
 *
 * | method         | params                                      | result                          |
 * |----------------|---------------------------------------------|---------------------------------|
 * | `impact`       | `{ style: NativeHapticImpactStyle }`        | `void` on success; reject/error |
 * | `notification` | `{ type: NativeHapticNotificationType }`    | `void` on success; reject/error |
 * | `selection`    | `{}` / omitted (optional)                   | `void` on success; reject/error |
 *
 * Hosts should play feedback immediately and resolve with `undefined` (or omit `result`).
 * Reject / return `{ error }` when the platform cannot fire haptics.
 */
export type NativeHapticMethod = 'impact' | 'notification' | 'selection';

export type NativeHapticRequest =
	| { readonly method: 'impact'; readonly params: NativeHapticImpactParams }
	| { readonly method: 'notification'; readonly params: NativeHapticNotificationParams }
	| { readonly method: 'selection'; readonly params?: NativeHapticSelectionParams };

/**
 * Request a haptic from a {@link NativeHostBridge}.
 * Keeps {@link createNativeHostEnv} focused on ChronosEnv ports — haptic is a
 * bridge-level seam consumed by web shells / future native UI, not a ChronosEnv field.
 */
export async function requestNativeHaptic(
	bridge: NativeHostBridge,
	request: NativeHapticRequest
): Promise<void> {
	if (request.method === 'selection') {
		await bridge.callNative('haptic', 'selection', request.params ?? {});
		return;
	}
	await bridge.callNative('haptic', request.method, request.params);
}

/**
 * Creates a standard Headless ChronosEnv driven entirely by a NativeHostBridge
 * (suitable for iOS Swift JavaScriptCore and Android Kotlin QuickJS engines).
 *
 * BASELINE — no production ChronosEnv adapters exist yet for storage/http/vault.
 * The `haptic` capability is an intentionally defined, consumable seam: web may
 * probe a host-injected bridge (`window.__CHRONOS_NATIVE__`) and call
 * {@link requestNativeHaptic} / `callNative('haptic', …)` without waiting on a
 * full native ChronosEnv. Do not expand other frozen capabilities here until a
 * native host project actually consumes them.
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
				)
		},
		storage: {
			getTimetable: (id: string) => bridge.callNative('storage', 'getTimetable', { id }),
			listTimetables: () => bridge.callNative('storage', 'listTimetables'),
			saveTimetable: (tt) => bridge.callNative('storage', 'saveTimetable', tt),
			deleteTimetable: (id) => bridge.callNative('storage', 'deleteTimetable', { id }),
			getActiveTimetableId: () => bridge.callNative('storage', 'getActiveTimetableId'),
			setActiveTimetableId: (id) => bridge.callNative('storage', 'setActiveTimetableId', { id }),
			queryCourses: (filter) => bridge.callNative('storage', 'queryCourses', { filter }),
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
			sha256: async (data) => {
				return bridge.callNative('runtime', 'sha256', { data });
			}
		}
	};
}
