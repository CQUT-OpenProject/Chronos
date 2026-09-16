import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('$app/navigation', () => ({
	replaceState: vi.fn(),
	pushState: vi.fn()
}));

import { initNavStack } from './nav-stack';
import { configureNavigationCoordinator, registerPageBackFallback } from './nav-coordinator';

describe('nav-coordinator page back fallback', () => {
	beforeEach(() => {
		initNavStack('/');
		configureNavigationCoordinator({
			goto: vi.fn(),
			pushState: vi.fn(),
			replaceState: vi.fn(),
			setActiveTab: vi.fn(),
			historyBack: vi.fn()
		});
		registerPageBackFallback({ kind: 'shell' });
	});

	afterEach(() => {
		registerPageBackFallback({ kind: 'shell' });
	});

	it('clears page fallback on unregister', () => {
		const unregister = registerPageBackFallback({ kind: 'route', href: '/about' });
		unregister();
		const next = registerPageBackFallback({ kind: 'shell' });
		expect(next).toBeTypeOf('function');
	});
});
