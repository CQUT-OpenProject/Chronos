import { ChronosEngine } from '@chronos/core';
import { createWebChronosEnv, type WebChronosEnvOptions } from '$lib/services/env/web-env';
import { ReactiveChronosController, m3DefaultTheme } from '@chronos/ui-kit';
import { builtinPlugins } from '@chronos/plugins';
import { MarketplaceService } from '$lib/services/marketplace/marketplace-service';
import { baseLocale } from '$lib/paraglide/runtime.js';
import * as m from '$lib/paraglide/messages.js';
import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

let sharedEngine: ChronosEngine | null = null;
let sharedController: ReactiveChronosController | null = null;
let sharedMarketplace: MarketplaceService | null = null;

export function getAppEngine(options?: WebChronosEnvOptions): ChronosEngine {
	if (!sharedEngine) {
		const env = createWebChronosEnv(options);
		sharedEngine = new ChronosEngine({
			env,
			initialLocale: baseLocale ?? 'zh-cn',
			i18nHandler: (key, params) => {
				const messageFn = (m as Record<string, unknown>)[key];
				if (typeof messageFn === 'function') {
					return (messageFn as (p?: Record<string, unknown>) => string)(params);
				}
				if (params && typeof params.default === 'string') {
					return params.default;
				}
				return key;
			},
			onNotification: (message) => {
				if (typeof window !== 'undefined') {
					snackbar(message);
				}
			}
		});

		sharedEngine.themes.registerTheme(m3DefaultTheme);
		for (const plugin of builtinPlugins) {
			void sharedEngine.loadPlugin(plugin);
		}
	}
	return sharedEngine;
}

export function getAppController(options?: WebChronosEnvOptions): ReactiveChronosController {
	if (!sharedController) {
		const engine = getAppEngine(options);
		sharedController = new ReactiveChronosController(engine);
	}
	return sharedController;
}

export function getMarketplaceService(options?: WebChronosEnvOptions): MarketplaceService {
	if (!sharedMarketplace) {
		const engine = getAppEngine(options);
		sharedMarketplace = new MarketplaceService(engine);
	}
	return sharedMarketplace;
}

export function resetAppEngine(): void {
	sharedMarketplace?.dispose();
	sharedMarketplace = null;
	sharedController?.dispose();
	sharedController = null;
	sharedEngine?.dispose();
	sharedEngine = null;
}
