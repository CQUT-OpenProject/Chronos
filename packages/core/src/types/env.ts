import type {
	HttpRequestOptions,
	HttpResponse,
	IAnalyticsService,
	IStorageService,
	VaultSecretOptions
} from './services';

export type { Disposable, StorageChangeEvent } from './services';

export type PlatformType = 'web' | 'ios' | 'android' | 'node';

type ChronosEnvStorage = Pick<
	IStorageService,
	| 'getTimetable'
	| 'listTimetables'
	| 'saveTimetable'
	| 'deleteTimetable'
	| 'getActiveTimetableId'
	| 'setActiveTimetableId'
	| 'queryCourses'
	| 'getPreferences'
	| 'savePreferences'
	| 'getPluginData'
	| 'setPluginData'
	| 'deletePluginData'
	| 'clearPluginData'
	| 'onChanged'
>;

export interface ChronosEnv {
	readonly platform: PlatformType;

	/** Network request and multi-step session maintenance abstraction */
	http: {
		/** Send request to upstream URL. Host transparently proxies or connects natively based on bypassCors */
		request(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
		/** Route a plugin-scoped request through the host server proxy (browser hosts with server plugins) */
		proxy?(
			pluginId: string,
			action: string,
			payload: unknown,
			options?: { timeoutMs?: number; signal?: AbortSignal }
		): Promise<HttpResponse>;
	};

	/** Structured persistence repository */
	storage: ChronosEnvStorage;

	/** Optional product analytics port */
	analytics?: Pick<IAnalyticsService, 'track'>;

	/** Optional hardware security credential abstraction (native hosts: Keychain / Keystore) */
	vault?: {
		isSupported(): Promise<boolean>;
		storeSecret(key: string, secret: string, options?: VaultSecretOptions): Promise<void>;
		getSecret(key: string): Promise<string | null>;
		removeSecret(key: string): Promise<void>;
	};

	/** Host baseline runtime capabilities (Native hosts like JSCore/QuickJS must provide these) */
	runtime: {
		sha256(data: string | Uint8Array): Promise<string>;
	};
}
