import { onNavigate } from '$app/navigation';
import type { OnNavigate } from '@sveltejs/kit';
import { getTransitionDirection } from './navigation-direction';
import {
	beginNavDirectionTransition,
	endNavDirectionTransition,
	shouldUseViewTransition,
	type ViewTransitionNavigation
} from './secondary-page-view-transition';

function toViewTransitionNavigation(navigation: OnNavigate): ViewTransitionNavigation {
	return {
		type: navigation.type,
		event: navigation.type === 'popstate' ? navigation.event : undefined
	};
}

export function setupSecondaryPageViewTransition(): void {
	onNavigate((navigation) => {
		const direction = getTransitionDirection();
		if (!shouldUseViewTransition(direction, toViewTransitionNavigation(navigation))) return;
		if (direction !== 'forward' && direction !== 'back') return;

		return new Promise<void>((resolve) => {
			const generation = beginNavDirectionTransition(direction);
			void document
				.startViewTransition(async () => {
					resolve();
					await navigation.complete;
				})
				.finished.finally(() => {
					endNavDirectionTransition(generation);
				});
		});
	});
}
