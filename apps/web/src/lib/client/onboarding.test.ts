import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
	hasSeenOnboarding,
	onboardingController,
	resetOnboardingControllerForTests
} from './onboarding.svelte';

describe('onboardingController', () => {
	let storage = new Map<string, string>();

	beforeEach(() => {
		storage = new Map<string, string>();
		vi.stubGlobal('window', {});
		vi.stubGlobal('localStorage', {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => {
				storage.set(key, value);
			},
			removeItem: (key: string) => {
				storage.delete(key);
			},
			clear: () => {
				storage.clear();
			}
		});
		resetOnboardingControllerForTests();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('isActive', () => {
		it('activates early on shell route before engine check when not seen', () => {
			onboardingController.open = false;
			expect(onboardingController.isActive('/')).toBe(true);
		});

		it('stays inactive when onboarding was seen', () => {
			storage.set('chronos:onboarding-seen', '1');
			onboardingController.open = false;
			expect(onboardingController.isActive('/')).toBe(false);
		});

		it('stays active on shell route when open', () => {
			onboardingController.open = true;
			expect(onboardingController.isActive('/')).toBe(true);
		});

		it('is inactive on legal routes even when open', () => {
			onboardingController.open = true;
			expect(onboardingController.isActive('/legal/terms')).toBe(false);
			expect(onboardingController.isActive('/legal/privacy')).toBe(false);
		});

		it('closes after maybeShow when user already has a timetable', () => {
			onboardingController.maybeShow(true);
			expect(onboardingController.isActive('/')).toBe(false);
			expect(onboardingController.open).toBe(false);
		});
	});

	describe('shouldRender', () => {
		it('renders overlay on legal routes while open', () => {
			onboardingController.open = true;
			expect(onboardingController.shouldRender('/legal/terms')).toBe(true);
		});

		it('does not render after maybeShow dismisses onboarding', () => {
			onboardingController.maybeShow(true);
			expect(onboardingController.shouldRender('/')).toBe(false);
		});
	});

	describe('maybeShow', () => {
		it('opens onboarding for new users without a timetable', () => {
			onboardingController.maybeShow(false);
			expect(onboardingController.open).toBe(true);
			expect(onboardingController.step).toBe(0);
		});

		it('keeps onboarding closed for returning users with a timetable', () => {
			onboardingController.maybeShow(true);
			expect(onboardingController.open).toBe(false);
		});
	});

	describe('hasSeenOnboarding', () => {
		it('reads the seen flag from localStorage', () => {
			expect(hasSeenOnboarding()).toBe(false);
			storage.set('chronos:onboarding-seen', '1');
			expect(hasSeenOnboarding()).toBe(true);
		});
	});
});
