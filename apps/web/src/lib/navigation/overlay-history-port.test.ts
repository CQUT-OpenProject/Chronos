import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('$app/navigation', () => ({
	replaceState: vi.fn(),
	pushState: vi.fn()
}));

import { initNavStack } from './nav-stack';
import { configureNavigationCoordinator } from './nav-coordinator';
import { createOverlayHistoryPort, getOverlayHistoryPort } from './overlay-history-port';

describe('overlay-history-port', () => {
	beforeEach(() => {
		initNavStack('/');
		configureNavigationCoordinator({
			goto: vi.fn(),
			pushState: vi.fn(),
			replaceState: vi.fn(),
			setActiveTab: vi.fn(),
			historyBack: vi.fn()
		});
	});

	it('returns the same port instance from getOverlayHistoryPort and createOverlayHistoryPort', () => {
		expect(getOverlayHistoryPort()).toBe(createOverlayHistoryPort());
	});

	it('exposes bindCloser on the shared port', () => {
		const port = getOverlayHistoryPort();
		expect(typeof port.bindCloser).toBe('function');
	});
});
