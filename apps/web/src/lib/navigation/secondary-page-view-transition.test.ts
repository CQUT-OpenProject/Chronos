import { describe, expect, it, beforeEach } from 'vite-plus/test';
import {
	hasUAVisualTransition,
	isActiveNavDirectionTransition,
	nextNavDirectionTransitionGeneration,
	resetNavDirectionTransitionGeneration,
	shouldUseViewTransitionWhenSupported,
	type ViewTransitionNavigation
} from './secondary-page-view-transition';

function nav(overrides: Partial<ViewTransitionNavigation> = {}): ViewTransitionNavigation {
	return { type: 'link', ...overrides };
}

describe('hasUAVisualTransition', () => {
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
});

describe('shouldUseViewTransitionWhenSupported', () => {
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

	it('returns true for popstate back without UA transition', () => {
		expect(
			shouldUseViewTransitionWhenSupported(
				'back',
				nav({
					type: 'popstate',
					event: { hasUAVisualTransition: false } as PopStateEvent
				})
			)
		).toBe(true);
	});
});

describe('nav direction transition lifecycle', () => {
	beforeEach(() => {
		resetNavDirectionTransitionGeneration();
	});

	it('only treats the latest transition generation as active', () => {
		const first = nextNavDirectionTransitionGeneration();
		const second = nextNavDirectionTransitionGeneration();

		expect(isActiveNavDirectionTransition(first)).toBe(false);
		expect(isActiveNavDirectionTransition(second)).toBe(true);
	});
});
