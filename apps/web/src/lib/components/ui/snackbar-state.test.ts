import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
	dismissSnackbar,
	SNACKBAR_LOCK_DURATION_MS,
	snackbar,
	snackbarKey,
	snackbarStore
} from './snackbar-state.svelte';

describe('snackbar-state', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		dismissSnackbar();
	});

	afterEach(() => {
		dismissSnackbar();
		vi.useRealTimers();
	});

	it('initializes in closed state', () => {
		expect(snackbarStore.open).toBe(false);
		expect(snackbarStore.canDismissOutside).toBe(false);
		expect(snackbarStore.message).toBe('');
		expect(snackbarStore.action).toBeNull();
	});

	it('locks outside dismissal for SNACKBAR_LOCK_DURATION_MS upon opening', () => {
		snackbar('Test Message');

		expect(snackbarStore.open).toBe(true);
		expect(snackbarStore.message).toBe('Test Message');
		expect(snackbarStore.canDismissOutside).toBe(false);

		// Advance time right before lock duration
		vi.advanceTimersByTime(SNACKBAR_LOCK_DURATION_MS - 1);
		expect(snackbarStore.open).toBe(true);
		expect(snackbarStore.canDismissOutside).toBe(false);

		// Advance to lock duration
		vi.advanceTimersByTime(1);
		expect(snackbarStore.open).toBe(true);
		expect(snackbarStore.canDismissOutside).toBe(true);
	});

	it('auto-dismisses after default duration', () => {
		snackbar('Auto Dismiss Test');

		expect(snackbarStore.open).toBe(true);

		vi.advanceTimersByTime(1000);
		expect(snackbarStore.canDismissOutside).toBe(true);

		// Default duration is 4000ms
		vi.advanceTimersByTime(3000);
		expect(snackbarStore.open).toBe(false);
		expect(snackbarStore.canDismissOutside).toBe(false);
	});

	it('handles custom duration shorter than lock duration', () => {
		snackbar('Short Duration', undefined, 500);

		expect(snackbarStore.open).toBe(true);
		expect(snackbarStore.canDismissOutside).toBe(false);

		vi.advanceTimersByTime(500);
		expect(snackbarStore.open).toBe(false);
		expect(snackbarStore.canDismissOutside).toBe(false);
	});

	it('clears lock and timers when dismissSnackbar is called explicitly', () => {
		snackbar('Manual Dismiss Test');

		expect(snackbarStore.open).toBe(true);
		expect(snackbarStore.canDismissOutside).toBe(false);

		dismissSnackbar();

		expect(snackbarStore.open).toBe(false);
		expect(snackbarStore.canDismissOutside).toBe(false);

		// Advancing time should have no unexpected effects
		vi.advanceTimersByTime(5000);
		expect(snackbarStore.open).toBe(false);
		expect(snackbarStore.canDismissOutside).toBe(false);
	});

	it('refreshes lock window when new snackbar is triggered while open', () => {
		snackbar('First Message');

		vi.advanceTimersByTime(SNACKBAR_LOCK_DURATION_MS);
		expect(snackbarStore.canDismissOutside).toBe(true);

		snackbar('Second Message');
		expect(snackbarStore.message).toBe('Second Message');
		expect(snackbarStore.canDismissOutside).toBe(false);

		vi.advanceTimersByTime(SNACKBAR_LOCK_DURATION_MS);
		expect(snackbarStore.canDismissOutside).toBe(true);
	});

	it('translates messages via snackbarKey', () => {
		snackbarKey('offline.snackbar.offline');

		expect(snackbarStore.open).toBe(true);
		expect(snackbarStore.message).toBeTruthy();
		expect(snackbarStore.canDismissOutside).toBe(false);
	});
});
