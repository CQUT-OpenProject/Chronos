import type { ChronosEnv } from '@chronos/core';
import { WebHttpAdapter } from './web-http';
import { WebStorageAdapter } from './web-storage';
import { WebVaultAdapter } from './web-vault';
import { WebRuntimeAdapter } from './web-runtime';
import type { ChronosDB } from '$lib/storage/db';

export interface WebChronosEnvOptions {
	database?: ChronosDB;
	localStorage?: Storage | null;
}

export function createWebChronosEnv(options?: WebChronosEnvOptions): ChronosEnv {
	return {
		platform: 'web',
		http: new WebHttpAdapter(),
		storage: new WebStorageAdapter(options?.database, options?.localStorage),
		vault: new WebVaultAdapter(options?.localStorage),
		runtime: new WebRuntimeAdapter()
	};
}
