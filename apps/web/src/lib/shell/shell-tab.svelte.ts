import { resolveDefaultLaunchTab } from '@chronos/core';
import type { ReactiveChronosController } from '@chronos/ui-kit';

const FALLBACK_TAB_ID = 'timetable';

function pickFallbackTabId(controller: ReactiveChronosController): string {
	const tabs = controller.getSlots('shell.bottom-bar.tab');
	if (tabs.length === 0) return FALLBACK_TAB_ID;
	return [...tabs].sort((left, right) => (left.order ?? 50) - (right.order ?? 50))[0]!.id;
}

export function createShellTabController(getController: () => ReactiveChronosController) {
	let activeTabId = $state(FALLBACK_TAB_ID);
	let initialized = false;

	function reconcileActiveTab(): void {
		if (!initialized) return;
		const controller = getController();
		const tabs = controller.getSlots('shell.bottom-bar.tab');
		if (tabs.some((tab) => tab.id === activeTabId)) return;
		activeTabId = pickFallbackTabId(controller);
	}

	function init(): void {
		if (initialized) return;
		const controller = getController();
		const tabs = controller.getSlots('shell.bottom-bar.tab');
		activeTabId = resolveDefaultLaunchTab(tabs)?.id ?? tabs[0]?.id ?? FALLBACK_TAB_ID;
		initialized = true;
		reconcileActiveTab();
	}

	function setActiveTab(id: string): void {
		activeTabId = id;
	}

	return {
		get activeTabId() {
			return activeTabId;
		},
		init,
		reconcileActiveTab,
		setActiveTab
	};
}

export type ShellTabController = ReturnType<typeof createShellTabController>;
