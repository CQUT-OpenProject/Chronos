import { describe, expect, it, vi } from 'vite-plus/test';
import { createUpdateState, fetchLatestGitHubRelease } from './update-state.svelte';
import { failure, success } from '$lib/domain/result/app-result';
import { AppError } from '$lib/domain/result/app-error';

const mockTrackEvent = vi.fn();
vi.mock('$lib/client/analytics', () => ({
	trackEvent: (...args: unknown[]) => mockTrackEvent(...args)
}));

describe('fetchLatestGitHubRelease', () => {
	it('successfully parses release from github api', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({
				tag_name: 'v0.1.5',
				name: 'Chronos 0.1.5',
				published_at: '2026-08-17T03:00:00Z',
				body: '### 新增\n- 软件更新页面'
			})
		});

		const result = await fetchLatestGitHubRelease(
			'test/repo',
			mockFetch as unknown as typeof fetch
		);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.tagName).toBe('v0.1.5');
			expect(result.value.name).toBe('Chronos 0.1.5');
		}
	});

	it('handles 404 not found and network failure', async () => {
		const mock404 = vi.fn().mockResolvedValue({ ok: false, status: 404 });
		const notFoundResult = await fetchLatestGitHubRelease(
			'test/repo',
			mock404 as unknown as typeof fetch
		);
		expect(notFoundResult.ok).toBe(false);

		const mockError = vi.fn().mockRejectedValue(new Error('Network offline'));
		const errorResult = await fetchLatestGitHubRelease(
			'test/repo',
			mockError as unknown as typeof fetch
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
					tagName: 'v0.1.5',
					name: 'Chronos 0.1.5',
					publishedAt: '2026-08-17',
					body: '新功能发布'
				}),
			checkSwUpdate: async () => true,
			applyUpdate: async () => {}
		});

		expect(updateState.state.hasUpdate).toBe(false);
		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(true);
		expect(updateState.state.latestRelease?.tagName).toBe('v0.1.5');
		expect(updateState.state.errorMessage).toBeNull();
		expect(updateState.state.lastChecked).not.toBeNull();
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_attempt');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: true,
			latest_version: 'v0.1.5'
		});
	});

	it('detects when already on latest version', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.1.4',
			fetchLatestRelease: async () =>
				success({
					tagName: 'v0.1.4',
					name: 'Chronos 0.1.4',
					publishedAt: '2026-08-16',
					body: '当前版本'
				}),
			checkSwUpdate: async () => false,
			applyUpdate: async () => {}
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(false);
		expect(updateState.state.latestRelease?.tagName).toBe('v0.1.4');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_attempt');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: false,
			latest_version: 'v0.1.4'
		});
	});

	it('falls back to local catalog when remote fetch fails', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.1.4',
			fetchLatestRelease: async () => failure(AppError.network('Offline')),
			localCatalog: {
				getRelease: async () => failure(AppError.notFound('none')),
				listReleases: async () =>
					success([
						{
							tagName: 'v0.1.4',
							name: 'Chronos 0.1.4',
							publishedAt: '2026-08-16',
							body: '本地最新'
						}
					])
			}
		});

		await updateState.checkUpdate();

		expect(updateState.state.checking).toBe(false);
		expect(updateState.state.hasUpdate).toBe(false);
		expect(updateState.state.latestRelease?.tagName).toBe('v0.1.4');
		expect(updateState.state.errorMessage).toBeNull();
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_attempt');
		expect(mockTrackEvent).toHaveBeenCalledWith('update_check_success', {
			has_update: false,
			latest_version: 'v0.1.4'
		});
	});

	it('detects update when service worker has a waiting update', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.1.4',
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
			has_update: true
		});
	});

	it('reports failure event when check update fails completely', async () => {
		mockTrackEvent.mockClear();
		const updateState = createUpdateState({
			currentVersion: '0.1.4',
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
			currentVersion: '0.1.4',
			applyUpdate: applyUpdateMock
		});

		await updateState.installUpdate();

		expect(applyUpdateMock).toHaveBeenCalled();
		expect(mockTrackEvent).toHaveBeenCalledWith('pwa_update_apply');
	});
});
