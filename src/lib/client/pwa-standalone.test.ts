import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { isPwaStandalone } from './pwa-standalone';

function mockDisplayMode(mode: string) {
	const listeners = new Map<string, Set<() => void>>();

	vi.stubGlobal('window', {
		matchMedia(query: string) {
			const matches = query === `(display-mode: ${mode})`;
			const listenerSet = listeners.get(query) ?? new Set();
			listeners.set(query, listenerSet);

			return {
				matches,
				addEventListener(_type: string, listener: () => void) {
					listenerSet.add(listener);
				},
				removeEventListener(_type: string, listener: () => void) {
					listenerSet.delete(listener);
				}
			};
		},
		navigator: { standalone: false }
	});

	return listeners;
}

describe('isPwaStandalone', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns true for standalone display mode', () => {
		mockDisplayMode('standalone');
		expect(isPwaStandalone()).toBe(true);
	});

	it('returns true for fullscreen display mode', () => {
		mockDisplayMode('fullscreen');
		expect(isPwaStandalone()).toBe(true);
	});

	it('returns false for browser display mode', () => {
		mockDisplayMode('browser');
		expect(isPwaStandalone()).toBe(false);
	});

	it('returns true for iOS Safari standalone flag', () => {
		vi.stubGlobal('window', {
			matchMedia() {
				return {
					matches: false,
					addEventListener: vi.fn(),
					removeEventListener: vi.fn()
				};
			},
			navigator: { standalone: true }
		});

		expect(isPwaStandalone()).toBe(true);
	});
});
