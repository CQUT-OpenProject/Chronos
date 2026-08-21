import type { Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';

export interface Disposable {
	dispose(): void;
}

/** Service definition identifier (with phantom brand type contract) */
export interface ServiceIdentifier<T> {
	readonly key: string;
	readonly __brand?: T;
}

export function createServiceIdentifier<T>(key: string): ServiceIdentifier<T> {
	return { key };
}

// 1. Network and session service definition
export interface HttpRequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
	headers?: Record<string, string>;
	body?: string | Uint8Array;
	useSession?: boolean;
	sessionId?: string;
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

export interface IHttpService {
	request(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
	clearSession?(sessionId: string): Promise<void>;
}
export const IHttpService = createServiceIdentifier<IHttpService>('http');

// 2. Structured persistence storage service definition
export interface StorageChangeEvent {
	type: 'timetable' | 'preferences' | 'pluginData';
	key: string;
}

export interface IStorageService {
	// Timetable persistence
	getTimetable(id: string): Promise<Timetable | null>;
	listTimetables(): Promise<
		Array<{ id: string; name: string; courseCount?: number; updatedAt: number }>
	>;
	saveTimetable(timetable: Timetable): Promise<void>;
	patchTimetable(id: string, patch: Partial<Timetable>): Promise<void>;
	deleteTimetable(id: string): Promise<void>;
	getActiveTimetableId(): Promise<string | null>;
	setActiveTimetableId(id: string): Promise<void>;

	// User preferences
	getPreferences(): Promise<UserPreferences>;
	savePreferences(patch: Partial<UserPreferences>): Promise<void>;
	clearAllData?(): Promise<void>;
	estimateStorageBytes?(): Promise<number>;

	// Key-value store (namespaced automatically by pluginId)
	getPluginData<T>(pluginId: string, key: string): Promise<T | null>;
	setPluginData<T>(pluginId: string, key: string, value: T): Promise<void>;
	deletePluginData(pluginId: string, key: string): Promise<void>;

	onChanged?(listener: (event: StorageChangeEvent) => void): Disposable;
}
export const IStorageService = createServiceIdentifier<IStorageService>('storage');

// 3. Hardware credential vault service definition (WebAuthn PRF / Keychain / Keystore)
export interface VaultSecretOptions {
	requireBiometrics?: boolean;
}

export interface IVaultService {
	isSupported(): Promise<boolean>;
	storeSecret(key: string, secret: string, options?: VaultSecretOptions): Promise<void>;
	getSecret(key: string): Promise<string | null>;
	removeSecret(key: string): Promise<void>;
}
export const IVaultService = createServiceIdentifier<IVaultService>('vault');

// 4. Platform runtime baseline service definition (unifies Native / Web API differences)
export interface IRuntimeService {
	platform: 'web' | 'ios' | 'android' | 'node';
	setTimeout(handler: () => void, timeoutMs: number): number;
	clearTimeout(handle: number): void;
	sha256(data: string | Uint8Array): Promise<string>;
	encodeUtf8(str: string): Uint8Array;
	decodeUtf8(bytes: Uint8Array): string;
}
export const IRuntimeService = createServiceIdentifier<IRuntimeService>('runtime');

// 5. Analytics service definition (optional injection)
export interface IAnalyticsService {
	track(event: string, properties?: Record<string, unknown>): void;
}
export const IAnalyticsService = createServiceIdentifier<IAnalyticsService>('analytics');
