import { describe, expect, it } from 'vite-plus/test';
import {
	createSecondaryTransitionGate,
	getNavigationDirection,
	hasUAVisualTransition,
	isActiveNavDirectionTransition,
	nextNavDirectionTransitionGeneration,
	resolveNavigationDirection,
	shouldUseViewTransitionWhenSupported,
	type ViewTransitionNavigation
} from './page-view-transition.svelte';

function nav(overrides: Partial<ViewTransitionNavigation> = {}): ViewTransitionNavigation {
	return { type: 'link', ...overrides };
}

describe('getNavigationDirection', () => {
	it('returns forward when entering secondary routes from the shell', () => {
		expect(getNavigationDirection('/', '/about')).toBe('forward');
		expect(getNavigationDirection('/', '/plugins')).toBe('forward');
		expect(getNavigationDirection('/', '/timetable/details')).toBe('forward');
	});

	it('returns back when leaving secondary routes to the shell', () => {
		expect(getNavigationDirection('/about', '/')).toBe('back');
		expect(getNavigationDirection('/plugins', '/')).toBe('back');
		expect(getNavigationDirection('/timetable/details', '/')).toBe('back');
	});

	it('returns forward when going deeper in secondary routes', () => {
		expect(getNavigationDirection('/about', '/about/update')).toBe('forward');
		expect(getNavigationDirection('/about/update', '/about/releases')).toBe('forward');
		expect(getNavigationDirection('/about/releases', '/about/releases/v0.1.0')).toBe('forward');
		expect(getNavigationDirection('/transfer/import', '/transfer/import/confirm')).toBe('forward');
	});

	it('returns back when going shallower in secondary routes', () => {
		expect(getNavigationDirection('/about/releases/v0.1.0', '/about/releases')).toBe('back');
		expect(getNavigationDirection('/open-source-licenses/project', '/open-source-licenses')).toBe(
			'back'
		);
	});

	it('returns forward for lateral secondary navigation at same depth', () => {
		expect(getNavigationDirection('/about', '/display-settings')).toBe('forward');
	});
});

describe('resolveNavigationDirection', () => {
	it('uses path depth for link navigation', () => {
		expect(resolveNavigationDirection('/', '/about', 'link')).toBe('forward');
		expect(resolveNavigationDirection('/about', '/open-source-licenses', 'link')).toBe('forward');
		expect(resolveNavigationDirection('/open-source-licenses', '/about', 'link')).toBe('forward');
	});

	it('returns back when leaving a third-level license page via link', () => {
		expect(
			resolveNavigationDirection('/open-source-licenses/project', '/open-source-licenses', 'link')
		).toBe('back');
	});

	it('returns forward on popstate when browser goes forward', () => {
		expect(resolveNavigationDirection('/about', '/open-source-licenses', 'popstate', 1)).toBe(
			'forward'
		);
	});

	it('returns back on popstate when browser goes back', () => {
		expect(resolveNavigationDirection('/open-source-licenses', '/about', 'popstate', -1)).toBe(
			'back'
		);
	});
});

describe('view transition support and classification', () => {
	it('returns true for popstate with hasUAVisualTransition', () => {
		expect(
			hasUAVisualTransition({
				type: 'popstate',
				event: { hasUAVisualTransition: true } as PopStateEvent
			})
		).toBe(true);
	});

	it('returns false for popstate without UA transition', () => {
		expect(
			hasUAVisualTransition({
				type: 'popstate',
				event: { hasUAVisualTransition: false } as PopStateEvent
			})
		).toBe(false);
	});

	it('returns false for link navigation', () => {
		expect(hasUAVisualTransition(nav({ type: 'link' }))).toBe(false);
	});

	it('returns true for forward link navigation', () => {
		expect(shouldUseViewTransitionWhenSupported('forward', nav({ type: 'link' }))).toBe(true);
	});

	it('returns false when direction is none', () => {
		expect(shouldUseViewTransitionWhenSupported('none', nav({ type: 'link' }))).toBe(false);
	});

	it('returns false when browser already performed UA transition', () => {
		expect(
			shouldUseViewTransitionWhenSupported(
				'back',
				nav({
					type: 'popstate',
					event: { hasUAVisualTransition: true } as PopStateEvent
				})
			)
		).toBe(false);
	});

	it('tracks transition generations', () => {
		const gen1 = nextNavDirectionTransitionGeneration();
		const gen2 = nextNavDirectionTransitionGeneration();
		expect(gen2).toBeGreaterThan(gen1);
		expect(isActiveNavDirectionTransition(gen2)).toBe(true);
		expect(isActiveNavDirectionTransition(gen1)).toBe(false);
	});
});

describe('createSecondaryTransitionGate', () => {
	it('enables the shell host and stays live on the shell route', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/');

		expect(gate.shellHostEnabled).toBe(true);
		expect(gate.frozen).toBe(false);
		expect(gate.receded).toBe(false);
		expect(gate.previewPaintReady).toBe(true);
	});

	it('keeps the shell live during a forward view transition then freezes after it finishes', () => {
		const gate = createSecondaryTransitionGate();
		gate.syncRoute('/');
		gate.beginTransition('forward', true);

		expect(gate.transitioning).toBe(true);
		expect(gate.frozen).toBe(false);
		expect(gate.receded).toBe(false);
		expect(gate.previewPaintReady).toBe(false);

		gate.finishTransition(true);

		expect(gate.transitioning).toBe(false);
		expect(gate.frozen).toBe(true);
		expect(gate.receded).toBe(true);
		expect(gate.previewPaintReady).toBe(true);
	});
});
