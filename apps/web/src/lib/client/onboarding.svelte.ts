import { isShellRoute } from '$lib/navigation/routes';

const SEEN_KEY = 'chronos:onboarding-seen';

export const ONBOARDING_STEP = {
	welcome: 0,
	legal: 1,
	highlights: 2,
	layout: 3,
	install: 4,
	done: 5
} as const;

export function hasSeenOnboarding(): boolean {
	if (typeof window === 'undefined') return true;
	return localStorage.getItem(SEEN_KEY) === '1';
}

/** @internal Resets controller state between unit tests. */
export function resetOnboardingControllerForTests(): void {
	onboardingController.open = false;
	onboardingController.step = 0;
	(onboardingController as unknown as { hasChecked: boolean }).hasChecked = false;
}

/** First-launch onboarding: welcome → legal → highlights → display style → install → CTA. */
class OnboardingController {
	open = $state(false);
	step = $state(0);

	readonly totalSteps = 6;

	private hasChecked = false;

	isActive(pathname: string): boolean {
		if (!isShellRoute(pathname)) return false;
		if (this.open) return true;
		if (typeof window === 'undefined') return false;
		return !this.hasChecked && !hasSeenOnboarding();
	}

	shouldShow(pathname: string): boolean {
		return this.isActive(pathname);
	}

	shouldRender(pathname: string): boolean {
		return this.open || this.isActive(pathname);
	}

	/** Called once app state has finished loading; shows onboarding for new users only. */
	maybeShow(hasTimetable: boolean) {
		if (this.hasChecked || typeof window === 'undefined') return;
		this.hasChecked = true;

		if (hasTimetable || hasSeenOnboarding()) {
			this.open = false;
			return;
		}

		this.step = 0;
		this.open = true;
	}

	/** Reopens the flow at a specific step, e.g. from the empty state's "查看导入方式说明" link. */
	openAt(step: number) {
		this.step = Math.min(Math.max(step, 0), this.totalSteps - 1);
		this.open = true;
	}

	next() {
		if (this.step >= this.totalSteps - 1) return;
		this.step += 1;
	}

	back() {
		if (this.step <= 0) return;
		this.step -= 1;
	}

	finish() {
		this.open = false;
		if (typeof window !== 'undefined') {
			localStorage.setItem(SEEN_KEY, '1');
		}
	}
}

export const onboardingController = new OnboardingController();
