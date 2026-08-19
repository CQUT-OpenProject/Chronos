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

export interface SoftwareUpdateState {
	checking: boolean;
	updating: boolean;
	hasUpdate: boolean;
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
	let latestRelease = $state<Release | null>(null);
	let errorMessage = $state<string | null>(null);
	let lastChecked = $state<SvelteDate | null>(null);

	async function checkUpdate() {
		checking = true;
		errorMessage = null;
		trackEvent('update_check_attempt');

		const swHasUpdate = await swAdapter.checkForUpdate();

		try {
			const result = await feedAdapter.fetchLatestRelease();
			if (result.ok) {
				const release = result.value;
				latestRelease = release;
				const hasNewerVersion = compareReleaseVersions(release.tagName, currentVersion) > 0;
				hasUpdate = hasNewerVersion;
				trackEvent('update_check_success', {
					has_update: hasUpdate,
					latest_version: release.tagName
				});
			} else if (swHasUpdate) {
				hasUpdate = true;
				trackEvent('update_check_success', {
					has_update: true
				});
			} else {
				errorMessage = result.error.message;
				hasUpdate = false;
				trackEvent('update_check_fail', {
					error_message: errorMessage
				});
			}
		} catch (err) {
			if (swHasUpdate) {
				hasUpdate = true;
				trackEvent('update_check_success', {
					has_update: true
				});
			} else {
				errorMessage = err instanceof Error ? err.message : '检查更新失败';
				hasUpdate = false;
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
		} catch (err) {
			updating = false;
			errorMessage = err instanceof Error ? err.message : '安装更新失败，请重试';
		}
	}

	const state = $derived({
		checking,
		updating,
		hasUpdate,
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
