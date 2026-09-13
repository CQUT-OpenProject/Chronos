import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { PREFERENCE_STORAGE_KEYS } from '@chronos/core';
import {
	REDUCE_MOTION_CLASS,
	applyReduceMotionClass,
	isReduceMotionEnabled,
	isReducedMotionActive,
	systemPrefersReducedMotion
} from '../src/motion/motion';

const mockLocalStorage = new Map<string, string>();

describe('motion', () => {
	let matchMediaMatches = false;
	let reduceMotionClass = false;

	beforeEach(() => {
		matchMediaMatches = false;
		reduceMotionClass = false;
		mockLocalStorage.clear();

		if (typeof window === 'undefined') {
			vi.stubGlobal('window', globalThis);
		}
		if (typeof document === 'undefined') {
			vi.stubGlobal('document', {
				documentElement: {
					classList: {
						toggle: (_className: string, enabled: boolean) => {
							reduceMotionClass = enabled;
						},
						contains: (className: string) =>
							className === REDUCE_MOTION_CLASS ? reduceMotionClass : false,
						remove: (className: string) => {
							if (className === REDUCE_MOTION_CLASS) reduceMotionClass = false;
						}
					}
				}
			});
		} else {
			document.documentElement.classList.remove(REDUCE_MOTION_CLASS);
		}

		vi.stubGlobal('localStorage', {
			getItem: (key: string) => mockLocalStorage.get(key) ?? null,
			setItem: (key: string, value: string) => mockLocalStorage.set(key, value),
			removeItem: (key: string) => mockLocalStorage.delete(key),
			clear: () => mockLocalStorage.clear()
		});

		vi.stubGlobal(
			'matchMedia',
			vi.fn((query: string) => ({
				matches: query === '(prefers-reduced-motion: reduce)' && matchMediaMatches,
				media: query,
				onchange: null,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn()
			}))
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('reads reduce-motion preference from localStorage', () => {
		expect(isReduceMotionEnabled()).toBe(false);
		mockLocalStorage.set(PREFERENCE_STORAGE_KEYS.reduceMotionEnabled, '1');
		expect(isReduceMotionEnabled()).toBe(true);
	});

	it('detects system prefers-reduced-motion', () => {
		expect(systemPrefersReducedMotion()).toBe(false);
		matchMediaMatches = true;
		expect(systemPrefersReducedMotion()).toBe(true);
	});

	it('combines user preference and system setting', () => {
		expect(isReducedMotionActive()).toBe(false);
		mockLocalStorage.set(PREFERENCE_STORAGE_KEYS.reduceMotionEnabled, '1');
		expect(isReducedMotionActive()).toBe(true);
		mockLocalStorage.clear();
		matchMediaMatches = true;
		expect(isReducedMotionActive()).toBe(true);
	});

	it('toggles reduce-motion class on document root', () => {
		applyReduceMotionClass(true);
		expect(document.documentElement.classList.contains(REDUCE_MOTION_CLASS)).toBe(true);
		applyReduceMotionClass(false);
		expect(document.documentElement.classList.contains(REDUCE_MOTION_CLASS)).toBe(false);
	});
});
