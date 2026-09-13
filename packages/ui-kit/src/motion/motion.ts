import { PREFERENCE_STORAGE_KEYS } from '@chronos/core';

const REDUCE_MOTION_STORAGE_KEY = PREFERENCE_STORAGE_KEYS.reduceMotionEnabled;
export const REDUCE_MOTION_CLASS = 'reduce-motion';

/**
 * Check if reduce-motion is enabled by user preference.
 */
export function isReduceMotionEnabled(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		if (typeof localStorage === 'undefined') return false;
		const raw = localStorage.getItem(REDUCE_MOTION_STORAGE_KEY);
		return raw === '1' || raw === 'true';
	} catch {
		return false;
	}
}

/**
 * Check if the OS prefers reduced motion.
 */
export function systemPrefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	} catch {
		return false;
	}
}

/**
 * True when user preference or OS setting requests reduced motion.
 */
export function isReducedMotionActive(): boolean {
	return isReduceMotionEnabled() || systemPrefersReducedMotion();
}

/**
 * Toggle the reduce-motion class on the document root.
 */
export function applyReduceMotionClass(enabled: boolean, target?: HTMLElement): void {
	if (typeof document === 'undefined') return;
	const root = target ?? document.documentElement;
	root.classList.toggle(REDUCE_MOTION_CLASS, enabled);
}
