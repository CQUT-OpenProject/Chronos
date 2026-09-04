import { describe, expect, it, vi } from 'vite-plus/test';
import { createUpdateState } from './update-state.svelte';
import { fetchLatestProjectRelease } from './release-feed-adapter';
import { failure, success } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';

const mockTrackEvent = vi.fn();
vi.mock('$lib/client/analytics', () => ({
	trackEvent: (...args: unknown[]) => mockTrackEvent(...args)
}));

describe('fetchLatestProjectRelease', () => {
	it('successfully parses release from project version.json', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({
				tagName: 'v0.2.0',
				name: 'Chronos 0.2.0',
				publishedAt: '2026-08-18',
				body: '### 新增\n- 软件更新页面'
			})
		});

		const result = await fetchLatestProjectRelease(
			mockFetch as unknown as typeof fetch,
			'/version.json'
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.tagName).toBe('v0.2.0');
			expect(result.value.name).toBe('Chronos 0.2.0');
		}
	});

	it('handles 404 not found and network failure', async () => {
		const mock404 = vi.fn().mockResolvedValue({ ok: false, status: 404 });
		const notFoundResult = await fetchLatestProjectRelease(
			mock404 as unknown as typeof fetch,
			'/version.json'
		);
		expect(notFoundResult.ok).toBe(false);

		const mockError = vi.fn().mockRejectedValue(new Error('Network offline'));
		const errorResult = await fetchLatestProjectRelease(
			mockError as unknown as typeof fetch,
			'/version.json'
		);
		expect(errorResult.ok).toBe(false);
	});
});

describe('createUpdateState', () => {
	it('detects when a newer version is available from remote', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.1.4',
			fetchLatestRelease: async () =>
				success({
					tagName: 'v0.2.0',
					name: 'Chronos 0.2.0',
					publishedAt: '2026-08-18',
					body: '新功能发布'
				}),
			checkSwUpdate: async () => false,
			applyUpdate: async () => {}
		});

		expect(updateState.state.hasUpdate).toBe(false);
		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(true);
		expect(updateState.state.latestRelease?.tagName).toBe('v0.2.0');
		expect(updateState.state.errorMessage).toBeNull();
		expect(updateState.state.lastChecked).not.toBeNull();
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_attempt');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: true,
			latest_version: 'v0.2.0',
			update_source: 'semver'
		});
	});

	it('detects when already on latest version', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.2.0',
			fetchLatestRelease: async () =>
				success({
					tagName: 'v0.2.0',
					name: 'Chronos 0.2.0',
					publishedAt: '2026-08-18',
					body: '当前版本'
				}),
			checkSwUpdate: async () => false,
			applyUpdate: async () => {}
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(false);
		expect(updateState.state.latestRelease?.tagName).toBe('v0.2.0');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_attempt');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: false,
			latest_version: 'v0.2.0',
			update_source: 'none'
		});
	});

	it('does NOT trigger update when remote version is lower than current version', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.2.1',
			fetchLatestRelease: async () =>
				success({
					tagName: 'v0.2.0',
					name: 'Chronos 0.2.0',
					publishedAt: '2026-08-18',
					body: '旧版本'
				}),
			checkSwUpdate: async () => false,
			applyUpdate: async () => {}
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(false);
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_attempt');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: false,
			latest_version: 'v0.2.0',
			update_source: 'none'
		});
	});

	it('falls back to local catalog when remote fetch fails', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.2.0',
			fetchLatestRelease: async () => failure(AppError.network('Offline')),
			localCatalog: {
				getRelease: async () => failure(AppError.notFound('none')),
				listReleases: async () =>
					success([
						{
							tagName: 'v0.2.0',
							name: 'Chronos 0.2.0',
							publishedAt: '2026-08-18',
							body: '本地最新'
						}
					])
			},
			checkSwUpdate: async () => false
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(false);
		expect(updateState.state.latestRelease?.tagName).toBe('v0.2.0');
		expect(updateState.state.errorMessage).toBeNull();
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: false,
			latest_version: 'v0.2.0',
			update_source: 'none'
		});
	});

	it('detects update when catalog fallback matches current version but SW is waiting', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.2.0',
			fetchLatestRelease: async () => failure(AppError.network('Offline')),
			localCatalog: {
				getRelease: async () => failure(AppError.notFound('none')),
				listReleases: async () =>
					success([
						{
							tagName: 'v0.2.0',
							name: 'Chronos 0.2.0',
							publishedAt: '2026-08-18',
							body: '本地最新'
						}
					])
			},
			checkSwUpdate: async () => true,
			applyUpdate: async () => {}
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(true);
		expect(updateState.state.hasNewerVersion).toBe(false);
		expect(updateState.state.updateSource).toBe('sw');
		expect(updateState.state.latestRelease?.tagName).toBe('v0.2.0');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: true,
			latest_version: 'v0.2.0',
			update_source: 'sw'
		});
	});

	it('detects update when remote reports same version but SW is waiting', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.2.0',
			fetchLatestRelease: async () =>
				success({
					tagName: 'v0.2.0',
					name: 'Chronos 0.2.0',
					publishedAt: '2026-08-18',
					body: '当前版本'
				}),
			checkSwUpdate: async () => true,
			applyUpdate: async () => {}
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(true);
		expect(updateState.state.hasNewerVersion).toBe(false);
		expect(updateState.state.updateSource).toBe('sw');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: true,
			latest_version: 'v0.2.0',
			update_source: 'sw'
		});
	});

	it('detects update when service worker has a waiting update upon remote failure', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.2.0',
			fetchLatestRelease: async () => failure(AppError.network('Offline')),
			localCatalog: {
				getRelease: async () => failure(AppError.notFound('none')),
				listReleases: async () => success([])
			},
			checkSwUpdate: async () => true,
			applyUpdate: async () => {}
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(true);
		expect(updateState.state.errorMessage).toBeNull();
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_attempt');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: true,
			update_source: 'sw'
		});
	});

	it('reports failure event when check update fails completely', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.2.0',
			fetchLatestRelease: async () => failure(AppError.network('网络连接失败')),
			localCatalog: {
				getRelease: async () => failure(AppError.notFound('none')),
				listReleases: async () => failure(AppError.notFound('none'))
			},
			checkSwUpdate: async () => false
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(false);
		expect(updateState.state.errorMessage).toBe('网络连接失败');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_attempt');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_fail', {
			error_message: '网络连接失败'
		});
	});

	it('triggers applyUpdate and tracks event when installUpdate is called', async () => {
		mockTrackEvent.mockClear();
		const applyUpdateMock = vi.fn().mockResolvedValue(undefined);
		const updateState = createUpdateState({
			currentVersion: '0.2.0',
			applyUpdate: applyUpdateMock
		});

		await updateState.installUpdate();

		expect(applyUpdateMock).toHaveBeenCalled();
		expect(mockTrackEvent).toHaveBeenCalledWith('pwa_update_apply');
	});

	it('supports pluggable ServiceWorkerAdapter and ReleaseFeedAdapter', async () => {
		mockTrackEvent.mockClear();
		const mockSwAdapter = {
			isSupported: () => true,
			isUpdatePending: () => false,
			checkForUpdate: vi.fn().mockResolvedValue(false),
			applyUpdateAndReload: vi.fn().mockResolvedValue(undefined)
		};
		const mockFeedAdapter = {
			fetchLatestRelease: vi.fn().mockResolvedValue(
				success({
					tagName: 'v0.3.0',
					name: 'Chronos 0.3.0',
					publishedAt: '2026-08-19',
					body: 'Major upgrade'
				})
			)
		};

		const updateState = createUpdateState({
			currentVersion: '0.2.0',
			swAdapter: mockSwAdapter,
			releaseFeedAdapter: mockFeedAdapter
		});

		await updateState.checkUpdate();
		expect(updateState.state.hasUpdate).toBe(true);
		expect(updateState.state.latestRelease?.tagName).toBe('v0.3.0');
		expect(mockSwAdapter.checkForUpdate).toHaveBeenCalledOnce();
		expect(mockFeedAdapter.fetchLatestRelease).toHaveBeenCalledOnce();

		await updateState.installUpdate();
		expect(mockSwAdapter.applyUpdateAndReload).toHaveBeenCalledOnce();
	});
});
