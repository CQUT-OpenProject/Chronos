import type { Pathname } from '$app/types';
import {
	navigateBack as coordinatorNavigateBack,
	restoreShellTabFromHistory,
	stampShellTabOnHistory
} from './nav-coordinator';

export type BackFallback = { kind: 'shell'; tab?: string } | { kind: 'route'; href: Pathname };

export type { NavigationCoordinatorDeps as NavigateBackDeps } from './nav-coordinator';

export { configureNavigationCoordinator as configureNavigateBack } from './nav-coordinator';

export function navigateBack(fallback: BackFallback): void {
	coordinatorNavigateBack(fallback);
}

export { restoreShellTabFromHistory, stampShellTabOnHistory };
