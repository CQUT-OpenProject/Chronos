import { SvelteDate } from 'svelte/reactivity';
import { APP_VERSION } from '$lib/config/app-meta';
import { trackEvent } from '$lib/client/analytics';
import { checkAndApplySwUpdate, applyUpdateAndReload } from '$lib/client/pwa-sw';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';
import { createLocalReleaseCatalog } from './local-catalog';
import type { ReleaseCatalog } from './catalog';
import { compareReleaseVersions, type Release } from './release';

const GITHUB_REPO = 'CQUT-OpenProject/Chronos';

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
	fetchLatestRelease?: () => Promise<AppResult<Release>>;
	localCatalog?: ReleaseCatalog;
	checkSwUpdate?: () => Promise<boolean>;
	applyUpdate?: () => Promise<void>;
}

export async function fetchLatestGitHubRelease(
	repo = GITHUB_REPO,
	fetchFn: typeof fetch = fetch
): Promise<AppResult<Release>> {
	try {
		const response = await fetchFn(`https://api.github.com/repos/${repo}/releases/latest`, {
			headers: { Accept: 'application/vnd.github+json' },
			signal:
				typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
					? AbortSignal.timeout(8000)
					: undefined
		});

		if (response.status === 404) {
			return failure(AppError.notFound('未在 GitHub 找到发布记录'));
		}
		if (!response.ok) {
			return failure(AppError.network(`检查更新失败 (HTTP ${response.status})`));
		}

		const data = (await response.json()) as {
			tag_name?: string;
			name?: string;
			published_at?: string;
			body?: string;
		};

		if (!data?.tag_name?.trim()) {
			return failure(AppError.dataFormat('GitHub Release 数据格式无效'));
		}

		return success({
			tagName: data.tag_name,
			name: data.name || data.tag_name,
			publishedAt: data.published_at || '',
			body: data.body || ''
		});
	} catch (error) {
		const message =
			error instanceof Error && error.name === 'AbortError'
				? '检查更新超时，请检查网络连接'
				: error instanceof Error
					? error.message
					: '网络连接异常，无法获取更新信息';
		return failure(AppError.network(message));
	}
}

export function createUpdateState(options: UpdateStateOptions = {}) {
	const currentVersion = options.currentVersion ?? APP_VERSION;
	const fetchLatestRelease = options.fetchLatestRelease ?? (() => fetchLatestGitHubRelease());
	const localCatalog = options.localCatalog ?? createLocalReleaseCatalog();
	const checkSwUpdate = options.checkSwUpdate ?? checkAndApplySwUpdate;
	const applyUpdate = options.applyUpdate ?? applyUpdateAndReload;

	let checking = $state(false);
	let updating = $state(false);
	let hasUpdate = $state(false);
	let latestRelease = $state<Release | null>(null);
	let errorMessage = $state<string | null>(null);
	let lastChecked = $state<SvelteDate | null>(null);

	async function checkUpdate() {
		checking = true;
		errorMessage = null;

		void checkSwUpdate();

		try {
			const result = await fetchLatestRelease();
			if (result.ok) {
				const remote = result.value;
				latestRelease = remote;
				hasUpdate = compareReleaseVersions(remote.tagName, currentVersion) > 0;
			} else {
				const localListResult = await localCatalog.listReleases();
				if (localListResult.ok && localListResult.value.length > 0) {
					const localLatest = localListResult.value[0];
					latestRelease = localLatest;
					hasUpdate = compareReleaseVersions(localLatest.tagName, currentVersion) > 0;
				} else {
					errorMessage = result.error.message;
					hasUpdate = false;
				}
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '检查更新失败';
			hasUpdate = false;
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
			await applyUpdate();
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
