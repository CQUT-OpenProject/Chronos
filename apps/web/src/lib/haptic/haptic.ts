import { browser } from '$app/environment';

const HAPTIC_STORAGE_KEY = 'chronos_preferences:haptic_feedback_enabled';

/**
 * Check if the current browser/runtime supports the Vibration API.
 */
export function isVibrationSupported(): boolean {
	return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
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

/**
 * Perform a vibration pattern if supported and enabled.
 * Returns true if vibration was successfully triggered, false otherwise.
 *
 * Future native-bridge swap point: when a Chronos native shell exposes haptics,
 * route through that bridge here without changing the public haptic API/call sites.
 */
export function triggerVibrate(pattern: number | number[]): boolean {
	if (!isVibrationSupported() || !isHapticFeedbackEnabled()) {
		return false;
	}
	try {
		return navigator.vibrate(pattern);
	} catch {
		return false;
	}
}

export const haptic = {
	/** 轻微反馈：Tab 切换、按钮/开关点击、Radio 勾选 (20ms) */
	light(): boolean {
		return triggerVibrate(20);
	},

	/** 中度反馈：周数滑动吸附、分段切换 (40ms) */
	medium(): boolean {
		return triggerVibrate(40);
	},

	/** 重度/确认反馈：长按课程卡片触发、拖拽开始 (70ms) */
	heavy(): boolean {
		return triggerVibrate(70);
	},

	/** 成功反馈：保存成功、导入成功 ([25, 60, 35]) */
	success(): boolean {
		return triggerVibrate([25, 60, 35]);
	},

	/** 警告/危险反馈：删除课程、重置设置 ([40, 60, 40]) */
	warning(): boolean {
		return triggerVibrate([40, 60, 40]);
	},

	/** 取消当前正在进行的振动 */
	cancel(): boolean {
		if (isVibrationSupported()) {
			try {
				return navigator.vibrate(0);
			} catch {
				return false;
			}
		}
		return false;
	}
};
