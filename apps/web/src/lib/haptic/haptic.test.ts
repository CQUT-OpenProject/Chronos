import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
	CHRONOS_NATIVE_BRIDGE_KEY,
	getNativeHapticBridge,
	haptic,
	isHapticFeedbackEnabled,
	isVibrationSupported,
	triggerVibrate
} from './haptic';

vi.mock('$app/environment', () => ({
	browser: true
}));

const mockLocalStorage = new Map<string, string>();

function enableHaptic() {
	mockLocalStorage.set('chronos_preferences:haptic_feedback_enabled', '1');
}

function disableHaptic() {
	mockLocalStorage.set('chronos_preferences:haptic_feedback_enabled', '0');
}

function stubNavigatorVibrate(vibrate?: ReturnType<typeof vi.fn>) {
	Object.defineProperty(globalThis, 'navigator', {
		value: vibrate ? { vibrate } : {},
		writable: true,
		configurable: true
	});
	return vibrate;
}

function clearNativeBridge() {
	Reflect.deleteProperty(globalThis as object, CHRONOS_NATIVE_BRIDGE_KEY);
	if (typeof window !== 'undefined') {
		Reflect.deleteProperty(window as object, CHRONOS_NATIVE_BRIDGE_KEY);
	}
}

function installNativeBridge(callNative: ReturnType<typeof vi.fn>) {
	const bridge = { callNative };
	Object.defineProperty(globalThis, CHRONOS_NATIVE_BRIDGE_KEY, {
		value: bridge,
		writable: true,
		configurable: true
	});
	if (typeof window !== 'undefined') {
		Object.defineProperty(window, CHRONOS_NATIVE_BRIDGE_KEY, {
			value: bridge,
			writable: true,
			configurable: true
		});
	}
	return bridge;
}

describe('haptic feedback service', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		mockLocalStorage.clear();
		clearNativeBridge();
		vi.stubGlobal('localStorage', {
			getItem: (k: string) => mockLocalStorage.get(k) ?? null,
			setItem: (k: string, v: string) => mockLocalStorage.set(k, v),
			removeItem: (k: string) => mockLocalStorage.delete(k)
		});
		// Ensure window exists for bridge detection in node/vitest
		if (typeof window === 'undefined') {
			vi.stubGlobal('window', globalThis);
		}
	});

	it('detects vibration support correctly', () => {
		stubNavigatorVibrate(vi.fn());
		expect(isVibrationSupported()).toBe(true);

		stubNavigatorVibrate();
		expect(isVibrationSupported()).toBe(false);
	});

	it('treats injected native bridge as haptic support without vibrate', () => {
		stubNavigatorVibrate();
		expect(isVibrationSupported()).toBe(false);

		installNativeBridge(vi.fn(async () => undefined));
		expect(isVibrationSupported()).toBe(true);
		expect(getNativeHapticBridge()).not.toBeNull();
	});

	it('ignores non-bridge injections on __CHRONOS_NATIVE__', () => {
		stubNavigatorVibrate();
		Object.defineProperty(globalThis, CHRONOS_NATIVE_BRIDGE_KEY, {
			value: { notCallNative: true },
			writable: true,
			configurable: true
		});
		if (typeof window !== 'undefined') {
			Object.defineProperty(window, CHRONOS_NATIVE_BRIDGE_KEY, {
				value: { notCallNative: true },
				writable: true,
				configurable: true
			});
		}
		expect(getNativeHapticBridge()).toBeNull();
		expect(isVibrationSupported()).toBe(false);
	});

	it('returns enabled state from storage', () => {
		enableHaptic();
		expect(isHapticFeedbackEnabled()).toBe(true);

		disableHaptic();
		expect(isHapticFeedbackEnabled()).toBe(false);
	});

	it('triggers vibration when supported and enabled', () => {
		const mockVibrate = stubNavigatorVibrate(vi.fn(() => true))!;
		enableHaptic();

		const result = triggerVibrate(10);
		expect(result).toBe(true);
		expect(mockVibrate).toHaveBeenCalledWith(10);
	});

	it('does not trigger vibration when disabled by user', () => {
		const mockVibrate = stubNavigatorVibrate(vi.fn(() => true))!;
		disableHaptic();

		const result = triggerVibrate(10);
		expect(result).toBe(false);
		expect(mockVibrate).not.toHaveBeenCalled();
	});

	it('calls semantic vibration patterns correctly (restored + strengthened)', () => {
		const mockVibrate = stubNavigatorVibrate(vi.fn(() => true))!;
		enableHaptic();

		haptic.light();
		expect(mockVibrate).toHaveBeenLastCalledWith(25);

		haptic.medium();
		expect(mockVibrate).toHaveBeenLastCalledWith(50);

		haptic.heavy();
		expect(mockVibrate).toHaveBeenLastCalledWith(80);

		haptic.success();
		expect(mockVibrate).toHaveBeenLastCalledWith([30, 60, 40]);

		haptic.warning();
		expect(mockVibrate).toHaveBeenLastCalledWith([50, 60, 50]);

		haptic.cancel();
		expect(mockVibrate).toHaveBeenLastCalledWith(0);
	});

	it('prefers native bridge over vibrate for impact/notification', async () => {
		const mockVibrate = stubNavigatorVibrate(vi.fn(() => true))!;
		const callNative = vi.fn(async () => undefined);
		installNativeBridge(callNative);
		enableHaptic();

		expect(haptic.light()).toBe(true);
		expect(haptic.medium()).toBe(true);
		expect(haptic.heavy()).toBe(true);
		expect(haptic.success()).toBe(true);
		expect(haptic.warning()).toBe(true);

		await vi.waitFor(() => expect(callNative).toHaveBeenCalledTimes(5));

		expect(callNative).toHaveBeenCalledWith('haptic', 'impact', { style: 'light' });
		expect(callNative).toHaveBeenCalledWith('haptic', 'impact', { style: 'medium' });
		expect(callNative).toHaveBeenCalledWith('haptic', 'impact', { style: 'heavy' });
		expect(callNative).toHaveBeenCalledWith('haptic', 'notification', { type: 'success' });
		expect(callNative).toHaveBeenCalledWith('haptic', 'notification', { type: 'warning' });
		expect(mockVibrate).not.toHaveBeenCalled();
	});

	it('falls back to vibrate when native bridge rejects', async () => {
		const mockVibrate = stubNavigatorVibrate(vi.fn(() => true))!;
		const callNative = vi.fn(async () => {
			throw new Error('no haptic hardware');
		});
		installNativeBridge(callNative);
		enableHaptic();

		expect(haptic.light()).toBe(true);
		await vi.waitFor(() => expect(mockVibrate).toHaveBeenCalledWith(25));
		expect(callNative).toHaveBeenCalledWith('haptic', 'impact', { style: 'light' });
	});

	it('does not call native bridge when preference is off', () => {
		const mockVibrate = stubNavigatorVibrate(vi.fn(() => true))!;
		const callNative = vi.fn(async () => undefined);
		installNativeBridge(callNative);
		disableHaptic();

		expect(haptic.light()).toBe(false);
		expect(callNative).not.toHaveBeenCalled();
		expect(mockVibrate).not.toHaveBeenCalled();
	});

	it('maps triggerVibrate durations to impact styles when bridge is present', async () => {
		stubNavigatorVibrate(vi.fn(() => true));
		const callNative = vi.fn(async () => undefined);
		installNativeBridge(callNative);
		enableHaptic();

		triggerVibrate(25);
		triggerVibrate(50);
		triggerVibrate(80);
		await vi.waitFor(() => expect(callNative).toHaveBeenCalledTimes(3));
		expect(callNative).toHaveBeenNthCalledWith(1, 'haptic', 'impact', { style: 'light' });
		expect(callNative).toHaveBeenNthCalledWith(2, 'haptic', 'impact', { style: 'medium' });
		expect(callNative).toHaveBeenNthCalledWith(3, 'haptic', 'impact', { style: 'heavy' });
	});
});
