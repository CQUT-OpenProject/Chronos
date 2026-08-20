import { ChronosEngine, ProfileManager } from '@chronos/core';
import { createWebChronosEnv, type WebProviderOptions } from '$lib/providers';
import { ReactiveChronosController, m3DefaultTheme } from '@chronos/ui-kit';
import { availablePlugins, resolveActiveProfile } from '$lib/boot/profile-registry';
import { registerCoreShellSlots } from '$lib/boot/core-shell';
import { MarketplaceService } from '$lib/services/marketplace/marketplace-service';
import { baseLocale } from '$lib/paraglide/runtime.js';
import * as m from '$lib/paraglide/messages.js';
import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

let sharedEngine: ChronosEngine | null = null;
let sharedController: ReactiveChronosController | null = null;
let sharedMarketplace: MarketplaceService | null = null;
let engineInitPromise: Promise<ChronosEngine> | null = null;
let profileManager: ProfileManager | null = null;

function createEngine(options?: WebProviderOptions): ChronosEngine {
	const env = createWebChronosEnv(options);
	return new ChronosEngine({
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
}

async function bootstrapEngine(engine: ChronosEngine): Promise<void> {
	engine.themes.registerTheme(m3DefaultTheme);
	registerCoreShellSlots(engine);

	profileManager = new ProfileManager(engine);
	const profile = resolveActiveProfile();
	await profileManager.applyProfile(profile, availablePlugins);

	if (!sharedMarketplace) {
		sharedMarketplace = new MarketplaceService(engine);
	}
	await sharedMarketplace.init();
}

export async function ensureEngineReady(options?: WebProviderOptions): Promise<ChronosEngine> {
	if (!sharedEngine) {
		sharedEngine = createEngine(options);
		engineInitPromise = bootstrapEngine(sharedEngine)
			.then(() => sharedEngine!.init())
			.then(() => sharedEngine!);
	}
	return engineInitPromise!;
}

export function getAppEngine(options?: WebProviderOptions): ChronosEngine {
	if (!sharedEngine) {
		sharedEngine = createEngine(options);
		void ensureEngineReady(options);
	}
	return sharedEngine;
}

export function getAppController(options?: WebProviderOptions): ReactiveChronosController {
	if (!sharedController) {
		const engine = getAppEngine(options);
		sharedController = new ReactiveChronosController(engine);
	}
	return sharedController;
}

export function getMarketplaceService(options?: WebProviderOptions): MarketplaceService {
	if (!sharedMarketplace) {
		const engine = getAppEngine(options);
		sharedMarketplace = new MarketplaceService(engine);
	}
	return sharedMarketplace;
}

export function resetAppEngine(): void {
	profileManager?.dispose();
	profileManager = null;
	sharedMarketplace?.dispose();
	sharedMarketplace = null;
	sharedController?.dispose();
	sharedController = null;
	sharedEngine?.dispose();
	sharedEngine = null;
	engineInitPromise = null;
}

export { availablePlugins as builtinPlugins };
