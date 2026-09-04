import { browser } from '$app/environment';

const HAPTIC_STORAGE_KEY = 'chronos_preferences:haptic_feedback_enabled';

/** Narrow injection point used by Chronos native shells (WKWebView / Android WebView). */
export const CHRONOS_NATIVE_BRIDGE_KEY = '__CHRONOS_NATIVE__' as const;

type NativeBridgeLike = {
	callNative(capability: string, method: string, params?: unknown): Promise<unknown>;
};

type ChronosWindow = Window & {
	[CHRONOS_NATIVE_BRIDGE_KEY]?: unknown;
};

/**
 * Detect a host-injected native bridge without touching other globals.
 * Accepts `window.__CHRONOS_NATIVE__` when it exposes `callNative` (NativeHostBridge shape).
 */
export function getNativeHapticBridge(): NativeBridgeLike | null {
	if (typeof window === 'undefined') return null;
	const candidate = (window as ChronosWindow)[CHRONOS_NATIVE_BRIDGE_KEY];
	if (
		candidate != null &&
		typeof candidate === 'object' &&
		typeof (candidate as NativeBridgeLike).callNative === 'function'
	) {
		return candidate as NativeBridgeLike;
	}
	return null;
}

function hasNavigatorVibrate(): boolean {
	return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/**
 * True when Vibration API is available, or a native haptic bridge is injected
 * (iOS WKWebView often has no navigator.vibrate but can still feel native).
 */
export function isVibrationSupported(): boolean {
	return hasNavigatorVibrate() || getNativeHapticBridge() !== null;
}

/**
 * Check if haptic feedback is currently enabled by user preference.
 */
export function isHapticFeedbackEnabled(): boolean {
	if (!browser) return false;
	try {
		if (typeof localStorage === 'undefined') return true;
		const raw = localStorage.getItem(HAPTIC_STORAGE_KEY);
		return raw !== '0' && raw !== 'false';
	} catch {
		return true;
	}
}

function vibrateFallback(pattern: number | number[]): boolean {
	if (!hasNavigatorVibrate()) return false;
	try {
		return navigator.vibrate(pattern);
	} catch {
		return false;
	}
}

type NativeHapticCall =
	| { method: 'impact'; params: { style: 'light' | 'medium' | 'heavy' } }
	| { method: 'notification'; params: { type: 'success' | 'warning' | 'error' } }
	| { method: 'selection'; params?: Record<string, never> };

/**
 * Try native bridge first; on missing bridge or rejected call, fall back to Vibration API.
 * Sync return: true if native dispatch was started or vibrate succeeded.
 */
function triggerNativeOrVibrate(
	call: NativeHapticCall,
	fallbackPattern: number | number[]
): boolean {
	if (!isHapticFeedbackEnabled()) return false;

	const bridge = getNativeHapticBridge();
	if (bridge) {
		void bridge.callNative('haptic', call.method, call.params ?? {}).catch(() => {
			vibrateFallback(fallbackPattern);
		});
		return true;
	}

	return vibrateFallback(fallbackPattern);
}

/**
 * Perform a vibration pattern if supported and enabled.
 * Prefer native bridge when present; otherwise Vibration API.
 * Returns true if haptic was dispatched (native or vibrate), false otherwise.
 */
export function triggerVibrate(pattern: number | number[]): boolean {
	if (!isHapticFeedbackEnabled()) return false;

	const bridge = getNativeHapticBridge();
	if (bridge) {
		const style =
			typeof pattern === 'number'
				? pattern <= 16
					? 'light'
					: pattern <= 28
						? 'medium'
						: 'heavy'
				: 'medium';
		void bridge.callNative('haptic', 'impact', { style }).catch(() => {
			vibrateFallback(pattern);
		});
		return true;
	}

	return vibrateFallback(pattern);
}

/** Button-click-tuned Vibration API fallbacks (short, sharp — not long buzzes). */
const FALLBACK = {
	light: 12,
	medium: 24,
	heavy: 40,
	success: [12, 40, 18] as number[],
	warning: [18, 40, 18] as number[]
};

export const haptic = {
	/** 轻微反馈：Tab 切换、按钮/开关点击、Radio 勾选 (~12ms fallback) */
	light(): boolean {
		return triggerNativeOrVibrate({ method: 'impact', params: { style: 'light' } }, FALLBACK.light);
	},

	/** 中度反馈：周数滑动吸附、分段切换 (~24ms fallback) */
	medium(): boolean {
		return triggerNativeOrVibrate(
			{ method: 'impact', params: { style: 'medium' } },
			FALLBACK.medium
		);
	},

	/** 重度/确认反馈：长按课程卡片触发、拖拽开始 (~40ms fallback) */
	heavy(): boolean {
		return triggerNativeOrVibrate({ method: 'impact', params: { style: 'heavy' } }, FALLBACK.heavy);
	},

	/** 成功反馈：保存成功、导入成功 (短双脉冲) */
	success(): boolean {
		return triggerNativeOrVibrate(
			{ method: 'notification', params: { type: 'success' } },
			FALLBACK.success
		);
	},

	/** 警告/危险反馈：删除课程、重置设置 (短双脉冲) */
	warning(): boolean {
		return triggerNativeOrVibrate(
			{ method: 'notification', params: { type: 'warning' } },
			FALLBACK.warning
		);
	},

	/** 取消当前正在进行的振动（vibrate only; native hosts clear themselves） */
	cancel(): boolean {
		if (hasNavigatorVibrate()) {
			try {
				return navigator.vibrate(0);
			} catch {
				return false;
			}
		}
		return false;
	}
};
