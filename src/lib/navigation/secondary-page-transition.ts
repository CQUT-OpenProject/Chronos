import { linear } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import type { NavigationDirection } from './navigation-direction';

export const SECONDARY_PAGE_ENTER_MS = 190;
export const SECONDARY_PAGE_EXIT_MS = 150;

type SecondaryPageTransitionParams = {
	direction?: NavigationDirection;
	phase?: 'in' | 'out';
};

function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

export function secondaryPageTransition(
	node: Element,
	{ direction = 'none', phase = 'in' }: SecondaryPageTransitionParams = {}
): TransitionConfig {
	if (direction === 'none') {
		return { duration: 0 };
	}

	const width = node.getBoundingClientRect().width;
	const peek = width * 0.3;
	const duration =
		phase === 'in'
			? SECONDARY_PAGE_ENTER_MS
			: direction === 'forward'
				? SECONDARY_PAGE_EXIT_MS
				: SECONDARY_PAGE_ENTER_MS;

	return {
		duration: prefersReducedMotion() ? 1 : duration,
		easing: linear,
		css: (t) => {
			const x =
				direction === 'forward'
					? phase === 'in'
						? (1 - t) * width
						: -(1 - t) * peek
					: phase === 'in'
						? -(1 - t) * peek
						: (1 - t) * width;

			return `transform: translateX(${x}px); opacity: ${t}`;
		}
	};
}
