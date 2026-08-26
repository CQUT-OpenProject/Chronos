const SEEN_KEY = 'chronos:onboarding-seen';

/** First-launch onboarding: welcome → highlights → display style → import → install → CTA. */
class OnboardingController {
	open = $state(false);
	step = $state(0);

	readonly totalSteps = 6;

	private hasChecked = false;

	/** Called once app state has finished loading; shows onboarding for new users only. */
	maybeShow(hasTimetable: boolean) {
		if (this.hasChecked || typeof window === 'undefined') return;
		this.hasChecked = true;

		if (hasTimetable || localStorage.getItem(SEEN_KEY) === '1') return;

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
