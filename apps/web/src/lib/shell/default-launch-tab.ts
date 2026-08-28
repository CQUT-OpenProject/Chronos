import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { isHostShellTabRoute, resolveDefaultLaunchTab } from '@chronos/core';
import type { ReactiveChronosController } from '@chronos/ui-kit';
import { toAppPathname } from '$lib/navigation/app-pathname';

let applied = false;

/** @internal Resets the once-per-session guard for unit tests. */
export function resetDefaultLaunchTabSessionForTests(): void {
	applied = false;
}

export async function tryDefaultLaunchRedirect(
	pathname: string,
	controller: ReactiveChronosController
): Promise<boolean> {
	if (applied) return false;
	if (toAppPathname(pathname) !== '/') return false;

	const defaultTab = resolveDefaultLaunchTab(controller.getSlots('shell.bottom-bar.tab'));
	if (!defaultTab) return false;
	if (defaultTab.href === '/') return false;
	if (!isHostShellTabRoute(defaultTab.href)) return false;

	applied = true;
	await goto(resolve(defaultTab.href as '/today'), { replaceState: true });
	return true;
}
