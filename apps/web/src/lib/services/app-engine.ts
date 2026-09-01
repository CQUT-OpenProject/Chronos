import { ChronosEngine, ProfileManager, DEFAULT_VISUAL_THEME_ID } from '@chronos/core';
import type { ChronosPlugin, ChronosProfile } from '@chronos/core';
import type { Disposable } from '@chronos/core';
import { createWebChronosEnv, type WebProviderOptions } from '$lib/providers';
import { ReactiveChronosController, m3DefaultTheme } from '@chronos/ui-kit';
import { getAvailablePluginsForProfile, resolveActiveProfile } from '$lib/boot/profile-registry';
import {
	loadProfilePlugins,
	PHASE1_PLUGIN_ID,
	resolveProfileBuiltinPlugins
} from '$lib/boot/profile-bootstrap';

import { OfficialPluginService } from '$lib/services/official-plugins/official-plugin-service';
import { baseLocale } from '$lib/paraglide/runtime.js';
import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

let sharedEngine: ChronosEngine | null = null;
let sharedController: ReactiveChronosController | null = null;
let sharedOfficialPlugins: OfficialPluginService | null = null;
let enginePhase1Promise: Promise<ChronosEngine> | null = null;
let enginePhase2Promise: Promise<void> | null = null;
let profileManager: ProfileManager | null = null;
let profileBootstrapHandles: Disposable[] = [];
let resolvedProfilePlugins: ChronosPlugin[] = [];

import { bindAnalyticsPort } from '$lib/client/analytics';
import { profileHasServerPlugins } from '$lib/boot/plugin-proxy-meta.generated';
import { syncEngineLocaleFromPreferences } from '$lib/i18n/locale-sync';
import { HOST_MESSAGES, HOST_UI_PLUGIN_ID } from '$lib/i18n/host-messages';

function createEngine(options?: WebProviderOptions): ChronosEngine {
	const env = createWebChronosEnv({
		...options,
		enablePluginProxy: profileHasServerPlugins(),
		navigation: {
			openCourseEditor(courseId: string) {
				void import('$app/navigation').then(({ goto }) => {
					void goto(`/timetable/course-editor?courseId=${encodeURIComponent(courseId)}`);
				});
			}
		}
	});
	bindAnalyticsPort(env.analytics);
	return new ChronosEngine({
		env,
		initialLocale: baseLocale ?? 'zh-cn',
		presetThemes: [m3DefaultTheme],
		presetI18nCatalogs: [{ pluginId: HOST_UI_PLUGIN_ID, messages: HOST_MESSAGES }],
		onNotification: (message) => {
			if (typeof window !== 'undefined') {
				snackbar(message);
			}
		}
	});
}

async function applyThemeFromPreferences(engine: ChronosEngine): Promise<void> {
	const prefs = await engine.storage.getPreferences();
	syncEngineLocaleFromPreferences(engine);
	const visualThemeId = prefs?.visualThemeId ?? DEFAULT_VISUAL_THEME_ID;
	if (engine.themes.getTheme(visualThemeId)) {
		engine.setTheme(visualThemeId);
	} else if (engine.themes.getTheme(DEFAULT_VISUAL_THEME_ID)) {
		engine.setTheme(DEFAULT_VISUAL_THEME_ID);
	}
}

async function bootstrapEnginePhase1(engine: ChronosEngine): Promise<void> {
	profileManager = new ProfileManager(engine);
	const profile = resolveActiveProfile();
	profileBootstrapHandles = await loadProfilePlugins(
		engine,
		profile,
		(pluginId) => pluginId === PHASE1_PLUGIN_ID
	);
	await applyThemeFromPreferences(engine);
}

async function bootstrapEnginePhase2(engine: ChronosEngine): Promise<void> {
	const profile = resolveActiveProfile();
	const deferredHandles = await loadProfilePlugins(
		engine,
		profile,
		(pluginId) => pluginId !== PHASE1_PLUGIN_ID
	);
	profileBootstrapHandles.push(...deferredHandles);
	resolvedProfilePlugins = await resolveProfileBuiltinPlugins(profile);

	if (!sharedOfficialPlugins) {
		sharedOfficialPlugins = new OfficialPluginService(engine);
	}
	await sharedOfficialPlugins.init();
}

function scheduleBootstrapPhase2(engine: ChronosEngine): void {
	if (enginePhase2Promise) return;
	const run = () => {
		enginePhase2Promise = bootstrapEnginePhase2(engine).catch((err) => {
			console.error('[app-engine] Phase 2 bootstrap failed:', err);
			enginePhase2Promise = null;
		});
	};
	if (typeof requestIdleCallback !== 'undefined') {
		requestIdleCallback(() => run());
	} else {
		queueMicrotask(() => run());
	}
}

export async function ensureEngineReady(options?: WebProviderOptions): Promise<ChronosEngine> {
	if (!sharedEngine) {
		sharedEngine = createEngine(options);
	}
	if (!enginePhase1Promise) {
		enginePhase1Promise = sharedEngine!
			.init()
			.then(() => bootstrapEnginePhase1(sharedEngine!))
			.then(() => {
				scheduleBootstrapPhase2(sharedEngine!);
				return sharedEngine!;
			});
	}
	return enginePhase1Promise;
}

/** Waits for deferred builtins and official plugins (import/share codecs, marketplace tabs). */
export async function ensureEngineFullyReady(options?: WebProviderOptions): Promise<ChronosEngine> {
	const engine = await ensureEngineReady(options);
	if (!enginePhase2Promise) {
		scheduleBootstrapPhase2(engine);
	}
	if (enginePhase2Promise) {
		await enginePhase2Promise;
	}
	return engine;
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

function getActiveProfile(): ChronosProfile {
	return profileManager?.getActiveProfile() ?? resolveActiveProfile();
}

export function getProfileBuiltinPlugins(): ChronosPlugin[] {
	const profile = getActiveProfile();
	if (resolvedProfilePlugins.length > 0) {
		const enabledIds = new Set(
			profile.plugins.filter((entry) => entry.enabled !== false).map((entry) => entry.id)
		);
		return resolvedProfilePlugins.filter((plugin) => enabledIds.has(plugin.id));
	}
	return getAvailablePluginsForProfile(profile);
}

export async function resetAppToInitialState(): Promise<void> {
	const engine = await ensureEngineFullyReady();
	await engine.clearAllData();
	await getOfficialPluginService().resetAfterFactoryClear();
	const profile = resolveActiveProfile();
	for (const handle of profileBootstrapHandles) {
		try {
			handle.dispose();
		} catch (err) {
			console.error('[app-engine] Error disposing profile plugin:', err);
		}
	}
	profileBootstrapHandles = [];
	resolvedProfilePlugins = [];
	if (profileManager) {
		await profileManager.applyProfile(profile, await resolveProfileBuiltinPlugins(profile));
	} else {
		profileBootstrapHandles = await loadProfilePlugins(engine, profile, () => true);
		resolvedProfilePlugins = await resolveProfileBuiltinPlugins(profile);
	}
	engine.setTheme(profile.defaultTheme ?? DEFAULT_VISUAL_THEME_ID);
	engine.events.emit('dynamicColor:hydrate', undefined);
}

export function resetAppEngine(): void {
	for (const handle of profileBootstrapHandles) {
		try {
			handle.dispose();
		} catch (err) {
			console.error('[app-engine] Error disposing profile plugin:', err);
		}
	}
	profileBootstrapHandles = [];
	resolvedProfilePlugins = [];
	profileManager?.dispose();
	profileManager = null;
	sharedOfficialPlugins?.dispose();
	sharedOfficialPlugins = null;
	sharedController?.dispose();
	sharedController = null;
	sharedEngine?.dispose();
	sharedEngine = null;
	enginePhase1Promise = null;
	enginePhase2Promise = null;
}
