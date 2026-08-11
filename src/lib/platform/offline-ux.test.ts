import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { applyOfflineUxTransition } from './offline-ux.svelte';

describe('applyOfflineUxTransition', () => {
	const snackbarFn = vi.fn();

	beforeEach(() => {
		snackbarFn.mockClear();
	});

	it('shows offline snackbar on first attach when already offline', () => {
		const next = applyOfflineUxTransition(false, undefined, snackbarFn);

		expect(next).toBe(false);
		expect(snackbarFn).toHaveBeenCalledWith('当前处于离线状态');
	});

	it('does not show snackbar on first attach when online', () => {
		const next = applyOfflineUxTransition(true, undefined, snackbarFn);

		expect(next).toBe(true);
		expect(snackbarFn).not.toHaveBeenCalled();
	});

	it('shows snackbar when going offline', () => {
		snackbarFn.mockClear();
		const next = applyOfflineUxTransition(false, true, snackbarFn);

		expect(next).toBe(false);
		expect(snackbarFn).toHaveBeenCalledWith('当前处于离线状态');
	});

	it('shows snackbar when going back online', () => {
		snackbarFn.mockClear();
		const next = applyOfflineUxTransition(true, false, snackbarFn);

		expect(next).toBe(true);
		expect(snackbarFn).toHaveBeenCalledWith('网络已恢复', undefined, 2000);
	});

	it('does not show snackbar when staying online', () => {
		snackbarFn.mockClear();
		const next = applyOfflineUxTransition(true, true, snackbarFn);

		expect(next).toBe(true);
		expect(snackbarFn).not.toHaveBeenCalled();
	});
});
