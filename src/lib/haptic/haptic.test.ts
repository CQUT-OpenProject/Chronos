import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { haptic, isHapticFeedbackEnabled, isVibrationSupported, triggerVibrate } from './haptic';

vi.mock('$app/environment', () => ({
	browser: true
}));

const mockGetSnapshot = vi.fn(() => ({
	hapticFeedbackEnabled: true
}));

vi.mock('$lib/client/repository', () => ({
	getSharedSettings: () => ({
		getSnapshot: mockGetSnapshot
	})
}));

describe('haptic feedback service', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		mockGetSnapshot.mockReturnValue({
			hapticFeedbackEnabled: true
		});
	});

	it('detects vibration support correctly', () => {
		Object.defineProperty(globalThis, 'navigator', {
			value: { vibrate: vi.fn() },
			writable: true,
			configurable: true
		});
		expect(isVibrationSupported()).toBe(true);

		Object.defineProperty(globalThis, 'navigator', {
			value: {},
			writable: true,
			configurable: true
		});
		expect(isVibrationSupported()).toBe(false);
	});

	it('returns enabled state from shared settings', () => {
		mockGetSnapshot.mockReturnValue({ hapticFeedbackEnabled: true });
		expect(isHapticFeedbackEnabled()).toBe(true);

		mockGetSnapshot.mockReturnValue({ hapticFeedbackEnabled: false });
		expect(isHapticFeedbackEnabled()).toBe(false);
	});

	it('triggers vibration when supported and enabled', () => {
		const mockVibrate = vi.fn(() => true);
		Object.defineProperty(globalThis, 'navigator', {
			value: { vibrate: mockVibrate },
			writable: true,
			configurable: true
		});
		mockGetSnapshot.mockReturnValue({ hapticFeedbackEnabled: true });

		const result = triggerVibrate(10);
		expect(result).toBe(true);
		expect(mockVibrate).toHaveBeenCalledWith(10);
	});

	it('does not trigger vibration when disabled by user', () => {
		const mockVibrate = vi.fn(() => true);
		Object.defineProperty(globalThis, 'navigator', {
			value: { vibrate: mockVibrate },
			writable: true,
			configurable: true
		});
		mockGetSnapshot.mockReturnValue({ hapticFeedbackEnabled: false });

		const result = triggerVibrate(10);
		expect(result).toBe(false);
		expect(mockVibrate).not.toHaveBeenCalled();
	});

	it('calls semantic vibration patterns correctly', () => {
		const mockVibrate = vi.fn(() => true);
		Object.defineProperty(globalThis, 'navigator', {
			value: { vibrate: mockVibrate },
			writable: true,
			configurable: true
		});
		mockGetSnapshot.mockReturnValue({ hapticFeedbackEnabled: true });

		haptic.light();
		expect(mockVibrate).toHaveBeenLastCalledWith(20);

		haptic.medium();
		expect(mockVibrate).toHaveBeenLastCalledWith(40);

		haptic.heavy();
		expect(mockVibrate).toHaveBeenLastCalledWith(70);

		haptic.success();
		expect(mockVibrate).toHaveBeenLastCalledWith([25, 60, 35]);

		haptic.warning();
		expect(mockVibrate).toHaveBeenLastCalledWith([40, 60, 40]);

		haptic.cancel();
		expect(mockVibrate).toHaveBeenLastCalledWith(0);
	});
});
