import { ChronosEngine, ProfileManager, DEFAULT_VISUAL_THEME_ID } from '@chronos/core';
import type { ChronosPlugin, ChronosProfile } from '@chronos/core';
import { createWebChronosEnv, type WebProviderOptions } from '$lib/providers';
import { ReactiveChronosController, m3DefaultTheme } from '@chronos/ui-kit';
import {
	availablePlugins,
	getAvailablePluginsForProfile,
	resolveActiveProfile
} from '$lib/boot/profile-registry';

import { OfficialPluginService } from '$lib/services/official-plugins/official-plugin-service';
import { baseLocale } from '$lib/paraglide/runtime.js';
import * as m from '$lib/paraglide/messages.js';
import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

let sharedEngine: ChronosEngine | null = null;
let sharedController: ReactiveChronosController | null = null;
let sharedOfficialPlugins: OfficialPluginService | null = null;
let engineInitPromise: Promise<ChronosEngine> | null = null;
let profileManager: ProfileManager | null = null;

import { bindAnalyticsPort } from '$lib/client/analytics';
import { profileHasServerPlugins } from '$lib/boot/plugin-proxy-meta.generated';
import { syncEngineLocaleFromPreferences } from '$lib/i18n/locale-sync';

function createEngine(options?: WebProviderOptions): ChronosEngine {
	const env = createWebChronosEnv({
		...options,
		enablePluginProxy: profileHasServerPlugins()
	});
	bindAnalyticsPort(env.analytics);
	const engine = new ChronosEngine({
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

	engine.themes.registerTheme(m3DefaultTheme);

	return engine;
}

async function bootstrapEngine(engine: ChronosEngine): Promise<void> {
	profileManager = new ProfileManager(engine);
	const profile = resolveActiveProfile();
	await profileManager.applyProfile(profile, availablePlugins);

	if (!sharedOfficialPlugins) {
		sharedOfficialPlugins = new OfficialPluginService(engine);
	}
	await sharedOfficialPlugins.init();

	const prefs = await engine.storage.getPreferences();
	syncEngineLocaleFromPreferences(engine);
	const visualThemeId = prefs?.visualThemeId ?? DEFAULT_VISUAL_THEME_ID;
	if (engine.themes.getTheme(visualThemeId)) {
		engine.actions.setTheme(visualThemeId);
	} else if (engine.themes.getTheme(DEFAULT_VISUAL_THEME_ID)) {
		engine.actions.setTheme(DEFAULT_VISUAL_THEME_ID);
	}
}

export async function ensureEngineReady(options?: WebProviderOptions): Promise<ChronosEngine> {
	if (!sharedEngine) {
		sharedEngine = createEngine(options);
	}
	if (!engineInitPromise) {
		engineInitPromise = sharedEngine!
			.init()
			.then(() => bootstrapEngine(sharedEngine!))
			.then(() => sharedEngine!);
	}
	return engineInitPromise;
}

export function getAppEngine(options?: WebProviderOptions): ChronosEngine {
	if (!sharedEngine) {
		sharedEngine = createEngine(options);
	}
	void ensureEngineReady(options);
	return sharedEngine;
}

export function getAppController(options?: WebProviderOptions): ReactiveChronosController {
	if (!sharedController) {
		const engine = getAppEngine(options);
		sharedController = new ReactiveChronosController(engine);
	}
	return sharedController;
}

export function getOfficialPluginService(options?: WebProviderOptions): OfficialPluginService {
	if (!sharedOfficialPlugins) {
		const engine = getAppEngine(options);
		sharedOfficialPlugins = new OfficialPluginService(engine);
	}
	return sharedOfficialPlugins;
}

export function getActiveProfile(): ChronosProfile {
	return profileManager?.getActiveProfile() ?? resolveActiveProfile();
}

export function getProfileBuiltinPlugins(): ChronosPlugin[] {
	return getAvailablePluginsForProfile(getActiveProfile());
}

export async function resetAppToInitialState(): Promise<void> {
	const engine = await ensureEngineReady();
	await engine.actions.clearAllData();
	await getOfficialPluginService().resetAfterFactoryClear();
	const profile = resolveActiveProfile();
	if (profileManager) {
		await profileManager.applyProfile(profile, availablePlugins);
	}
	engine.actions.setTheme(profile.defaultTheme ?? DEFAULT_VISUAL_THEME_ID);
	engine.events.emit('dynamicColor:hydrate', undefined);
}

export function resetAppEngine(): void {
	profileManager?.dispose();
	profileManager = null;
	sharedOfficialPlugins?.dispose();
	sharedOfficialPlugins = null;
	sharedController?.dispose();
	sharedController = null;
	sharedEngine?.dispose();
	sharedEngine = null;
	engineInitPromise = null;
}
