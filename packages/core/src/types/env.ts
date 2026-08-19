import type { Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';

export type PlatformType = 'web' | 'ios' | 'android' | 'node';

export interface Disposable {
	dispose(): void;
}

export interface HttpRequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
	headers?: Record<string, string>;
	body?: string | Uint8Array;
	/** Whether the host should maintain session cookies (via CookieJar on web proxy, or native network stack) */
	useSession?: boolean;
	/** Session identifier (requests sharing sessionId share the cookie context) */
	sessionId?: string;
	/** Whether the host should bypass CORS (transparent proxy on web, direct connection on native) */
	bypassCors?: boolean;
	timeoutMs?: number;
}

export interface HttpResponse {
	status: number;
	statusText: string;
	headers: Record<string, string>;
	ok: boolean;
	text(): Promise<string>;
	json<T = unknown>(): Promise<T>;
	bytes(): Promise<Uint8Array>;
}

export interface StorageChangeEvent {
	type: 'timetable' | 'preferences' | 'pluginData';
	key: string;
}

export interface VaultSecretOptions {
	/** Whether biometric authentication or explicit user gesture is required */
	requireBiometrics?: boolean;
}

export interface ChronosEnv {
	readonly platform: PlatformType;

	/** Network request and multi-step session maintenance abstraction */
	http: {
		/** Send request to upstream URL. Host transparently proxies or connects natively based on bypassCors */
		request(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
		/** Clear session cookies for the specified sessionId */
		clearSession?(sessionId: string): Promise<void>;
	};

	/** Structured persistence repository */
	storage: {
		// Timetable storage
		getTimetable(id: string): Promise<Timetable | null>;
		listTimetables(): Promise<Array<{ id: string; name: string; updatedAt: number }>>;
		saveTimetable(timetable: Timetable): Promise<void>;
		patchTimetable(id: string, patch: Partial<Timetable>): Promise<void>;
		deleteTimetable(id: string): Promise<void>;
		getActiveTimetableId(): Promise<string | null>;
		setActiveTimetableId(id: string): Promise<void>;

		// Global preferences & wallpaper
		getPreferences(): Promise<UserPreferences>;
		savePreferences(patch: Partial<UserPreferences>): Promise<void>;
		getWallpaper?(): Promise<Uint8Array | null>;
		setWallpaper?(wallpaper: Uint8Array | null): Promise<void>;

		// Key-value store (microkernel layer provides Scoped isolation on top)
		getPluginData<T>(pluginId: string, key: string): Promise<T | null>;
		setPluginData<T>(pluginId: string, key: string, value: T): Promise<void>;
		deletePluginData(pluginId: string, key: string): Promise<void>;

		// Cross-tab / background storage change subscription
		onChanged?(listener: (event: StorageChangeEvent) => void): Disposable;
	};

	/** Hardware security credential abstraction (Web: WebAuthn PRF; iOS: Keychain; Android: Keystore) */
	vault: {
		isSupported(): Promise<boolean>;
		storeSecret(key: string, secret: string, options?: VaultSecretOptions): Promise<void>;
		getSecret(key: string): Promise<string | null>;
		removeSecret(key: string): Promise<void>;
	};

	/** Host baseline runtime capabilities (Native hosts like JSCore/QuickJS must provide these) */
	runtime: {
		setTimeout(handler: () => void, timeoutMs: number): number;
		clearTimeout(handle: number): void;
		sha256(data: string | Uint8Array): Promise<string>;
		encodeUtf8(str: string): Uint8Array;
		decodeUtf8(bytes: Uint8Array): string;
	};
}
