import { SvelteDate } from 'svelte/reactivity';
import { APP_VERSION } from '$lib/config/app-meta';
import { trackEvent } from '$lib/client/analytics';
import type { AppResult } from '$lib/domain/result/app-result';
import type { ReleaseCatalog } from './catalog';
import { compareReleaseVersions, type Release } from './release';
import { createReleaseFeedAdapter, type ReleaseFeedAdapter } from './release-feed-adapter';
import {
	createDefaultServiceWorkerAdapter,
	type ServiceWorkerAdapter
} from './service-worker-adapter';

export type UpdateSource = 'none' | 'semver' | 'sw' | 'both';

interface SoftwareUpdateState {
	checking: boolean;
	updating: boolean;
	hasUpdate: boolean;
	hasNewerVersion: boolean;
	updateSource: UpdateSource;
	currentVersion: string;
	latestRelease: Release | null;
	errorMessage: string | null;
	lastChecked: SvelteDate | null;
}

export interface UpdateStateOptions {
	currentVersion?: string;
	releaseFeedAdapter?: ReleaseFeedAdapter;
	swAdapter?: ServiceWorkerAdapter;
	fetchLatestRelease?: () => Promise<AppResult<Release>>;
	localCatalog?: ReleaseCatalog;
	checkSwUpdate?: () => Promise<boolean>;
	applyUpdate?: () => Promise<void>;
}

export function createUpdateState(options: UpdateStateOptions = {}) {
	const currentVersion = options.currentVersion ?? APP_VERSION;
	const feedAdapter: ReleaseFeedAdapter =
		options.releaseFeedAdapter ??
		createReleaseFeedAdapter({
			fetchLatestRelease: options.fetchLatestRelease,
			localCatalog: options.localCatalog
		});

	const defaultSw = createDefaultServiceWorkerAdapter();
	const swAdapter: ServiceWorkerAdapter = options.swAdapter ?? {
		isSupported: () => defaultSw.isSupported(),
		isUpdatePending: () => defaultSw.isUpdatePending(),
		checkForUpdate: options.checkSwUpdate ?? (() => defaultSw.checkForUpdate()),
		applyUpdateAndReload: options.applyUpdate ?? (() => defaultSw.applyUpdateAndReload())
	};

	let checking = $state(false);
	let updating = $state(false);
	let hasUpdate = $state(false);
	let hasNewerVersion = $state(false);
	let updateSource = $state<UpdateSource>('none');
	let latestRelease = $state<Release | null>(null);
	let errorMessage = $state<string | null>(null);
	let lastChecked = $state<SvelteDate | null>(null);

	async function checkUpdate() {
		checking = true;
		errorMessage = null;
		trackEvent('update_check_attempt');

		const swHasUpdate = await swAdapter.checkForUpdate();

		function applyUpdateSignals(newerVersion: boolean) {
			hasNewerVersion = newerVersion;
			hasUpdate = newerVersion || swHasUpdate;
			updateSource =
				newerVersion && swHasUpdate
					? 'both'
					: newerVersion
						? 'semver'
						: swHasUpdate
							? 'sw'
							: 'none';
		}

		try {
			const result = await feedAdapter.fetchLatestRelease();
			if (result.ok) {
				const release = result.value;
				latestRelease = release;
				const newerVersion = compareReleaseVersions(release.tagName, currentVersion) > 0;
				applyUpdateSignals(newerVersion);
				trackEvent('update_check_success', {
					has_update: hasUpdate,
					latest_version: release.tagName,
					update_source: updateSource
				});
			} else if (swHasUpdate) {
				applyUpdateSignals(false);
				trackEvent('update_check_success', {
					has_update: true,
					update_source: updateSource
				});
			} else {
				errorMessage = result.error.message;
				applyUpdateSignals(false);
				trackEvent('update_check_fail', {
					error_message: errorMessage
				});
			}
		} catch (err) {
			if (swHasUpdate) {
				applyUpdateSignals(false);
				trackEvent('update_check_success', {
					has_update: true,
					update_source: updateSource
				});
			} else {
				errorMessage = err instanceof Error ? err.message : '检查更新失败';
				applyUpdateSignals(false);
				trackEvent('update_check_fail', {
					error_message: errorMessage
				});
			}
		} finally {
			lastChecked = new SvelteDate();
			checking = false;
		}
	}

	async function installUpdate() {
		if (updating) return;
		updating = true;
		trackEvent('pwa_update_apply');
		try {
			await swAdapter.applyUpdateAndReload();
			// Reload should unmount the page; reset if the browser did not navigate.
			updating = false;
		} catch (err) {
			updating = false;
			errorMessage = err instanceof Error ? err.message : '安装更新失败，请重试';
		}
	}

	const state = $derived({
		checking,
		updating,
		hasUpdate,
		hasNewerVersion,
		updateSource,
		currentVersion,
		latestRelease,
		errorMessage,
		lastChecked
	} satisfies SoftwareUpdateState);

	return {
		get state() {
			return state;
		},
		checkUpdate,
		installUpdate
	};
}

export type SoftwareUpdateStateController = ReturnType<typeof createUpdateState>;
