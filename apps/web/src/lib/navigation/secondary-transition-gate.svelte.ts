import { isSecondaryRoute } from './routes';

export type SecondaryTransitionDirection = 'forward' | 'back';

export function createSecondaryTransitionGate() {
	let frozen = $state(false);
	let receded = $state(false);
	let previewPaintReady = $state(true);
	let shellHostEnabled = $state(false);
	let transitioning = $state(false);
	let revealForSnapshot = $state(false);

	function enableShellHost(): void {
		shellHostEnabled = true;
	}

	function settleOnRoute(pathname: string): void {
		if (isSecondaryRoute(pathname)) {
			if (!shellHostEnabled) return;
			frozen = true;
			receded = true;
			return;
		}

		shellHostEnabled = true;
		frozen = false;
		receded = false;
	}

	function syncRoute(pathname: string): void {
		if (transitioning) {
			if (!isSecondaryRoute(pathname)) shellHostEnabled = true;
			return;
		}

		previewPaintReady = true;
		settleOnRoute(pathname);
	}

	function beginTransition(_direction: SecondaryTransitionDirection, toSecondary: boolean): void {
		transitioning = true;
		previewPaintReady = false;
		revealForSnapshot = !toSecondary;
	}

	function finishTransition(toSecondary: boolean): void {
		transitioning = false;
		previewPaintReady = true;
		revealForSnapshot = false;
		if (toSecondary) {
			if (shellHostEnabled) {
				frozen = true;
				receded = true;
			}
			return;
		}

		shellHostEnabled = true;
		frozen = false;
		receded = false;
	}

	return {
		get frozen() {
			return frozen;
		},
		get receded() {
			return receded;
		},
		get previewPaintReady() {
			return previewPaintReady;
		},
		get shellHostEnabled() {
			return shellHostEnabled;
		},
		get transitioning() {
			return transitioning;
		},
		get skipPaint() {
			return frozen && !revealForSnapshot;
		},
		enableShellHost,
		syncRoute,
		beginTransition,
		finishTransition
	};
}

export type SecondaryTransitionGate = ReturnType<typeof createSecondaryTransitionGate>;

export const secondaryTransitionGate = createSecondaryTransitionGate();
