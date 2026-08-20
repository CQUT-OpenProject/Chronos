import {
	IStorageService,
	IVaultService,
	IHttpService,
	IRuntimeService,
	IAnalyticsService,
	ServiceContainer
} from '@chronos/core';
import type { ChronosDB } from '$lib/storage/db';
import { DexieStorageProvider } from './dexie-storage';
import { MemoryVaultProvider } from './memory-vault';
import { WebAuthnVaultProvider } from './webauthn-vault';
import { WebHttpProxyProvider } from './web-http';
import { WebRuntimeProvider } from './web-runtime';
import { WebAnalyticsProvider } from './web-analytics';

export {
	DexieStorageProvider,
	WebAuthnVaultProvider,
	MemoryVaultProvider,
	WebHttpProxyProvider,
	WebRuntimeProvider,
	WebAnalyticsProvider
};

export interface WebProviderOptions {
	database?: ChronosDB;
	localStorage?: Storage | null;
	allowedDomains?: string[];
}

/**
 * Creates an instance of all Web standard providers.
 */
export function createWebProviders(options?: WebProviderOptions) {
	return {
		storage: new DexieStorageProvider(options?.database, options?.localStorage),
		vault: new WebAuthnVaultProvider(options?.localStorage),
		http: new WebHttpProxyProvider(options?.allowedDomains),
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
		vault: providers.vault,
		runtime: providers.runtime
	};
}

/**
 * Registers all Web standard service providers into a ServiceContainer.
 */
export function registerWebProviders(
	container: ServiceContainer,
	options?: WebProviderOptions
): ServiceContainer {
	const providers = createWebProviders(options);

	if (!container.has(IStorageService)) {
		container.register(IStorageService, providers.storage);
	}
	if (!container.has(IVaultService)) {
		container.register(IVaultService, providers.vault);
	}
	if (!container.has(IHttpService)) {
		container.register(IHttpService, providers.http);
	}
	if (!container.has(IRuntimeService)) {
		container.register(IRuntimeService, providers.runtime);
	}
	if (!container.has(IAnalyticsService)) {
		container.register(IAnalyticsService, providers.analytics);
	}

	return container;
}
