import type { ChronosDB } from '$lib/storage/db';
import { DexieStorageProvider } from './dexie-storage';
import { WebHttpProxyProvider } from './web-http';
import { PluginProxyHttpAdapter } from './plugin-proxy-http';
import { WebRuntimeProvider } from './web-runtime';
import { WebAnalyticsProvider } from './web-analytics';

export {
	DexieStorageProvider,
	WebHttpProxyProvider,
	PluginProxyHttpAdapter,
	WebRuntimeProvider,
	WebAnalyticsProvider
};

export interface WebProviderOptions {
	database?: ChronosDB;
	localStorage?: Storage | null;
	allowedDomains?: string[];
	enablePluginProxy?: boolean;
}

/**
 * Creates an instance of all Web standard providers.
 */
export function createWebProviders(options?: WebProviderOptions) {
	const baseHttp = new WebHttpProxyProvider(options?.allowedDomains);
	const http =
		options?.enablePluginProxy === true ? new PluginProxyHttpAdapter(baseHttp) : baseHttp;

	return {
		storage: new DexieStorageProvider(options?.database, options?.localStorage),
		http,
		runtime: new WebRuntimeProvider(),
		analytics: new WebAnalyticsProvider()
	};
}

/**
 * Creates a ChronosEnv facade populated with Web providers.
 */
export function createWebChronosEnv(options?: WebProviderOptions) {
	const providers = createWebProviders(options);
	return {
		platform: 'web' as const,
		http: providers.http,
		storage: providers.storage,
		runtime: providers.runtime,
		analytics: providers.analytics
	};
}
