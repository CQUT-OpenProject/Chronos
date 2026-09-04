import { onNavigate } from '$app/navigation';
import type { OnNavigate } from '@sveltejs/kit';
import { flushSync } from 'svelte';
import { getTransitionDirection } from './navigation-direction';
import { isSecondaryRoute } from './routes';
import {
	beginNavDirectionTransition,
	endNavDirectionTransition,
	shouldUseViewTransition,
	type ViewTransitionNavigation
} from './secondary-page-view-transition';
import {
	secondaryTransitionGate,
	type SecondaryTransitionGate
} from './secondary-transition-gate.svelte';

function toViewTransitionNavigation(navigation: OnNavigate): ViewTransitionNavigation {
	return {
		type: navigation.type,
		event: navigation.type === 'popstate' ? navigation.event : undefined
	};
}

export function setupSecondaryPageViewTransition(
	gate: SecondaryTransitionGate = secondaryTransitionGate
): void {
	onNavigate((navigation) => {
		const toPath = navigation.to?.url.pathname ?? '';
		const fromPath = navigation.from?.url.pathname ?? '';
		const direction = getTransitionDirection();
		const toSecondary = isSecondaryRoute(toPath);
		const crossShell = isSecondaryRoute(fromPath) !== toSecondary;
		const viewNav = toViewTransitionNavigation(navigation);

		if (
			!shouldUseViewTransition(direction, viewNav) ||
			(direction !== 'forward' && direction !== 'back')
		) {
			void navigation.complete.then(() => {
				gate.syncRoute(toPath);
			});
			return;
		}

		gate.beginTransition(direction, toSecondary);

		return new Promise<void>((resolve) => {
			const generation = beginNavDirectionTransition(direction, crossShell);
			void document
				.startViewTransition(async () => {
					resolve();
					await navigation.complete;
					if (!toSecondary) flushSync();
				})
				.finished.finally(() => {
					endNavDirectionTransition(generation);
					gate.finishTransition(toSecondary);
				});
		});
	});
}
