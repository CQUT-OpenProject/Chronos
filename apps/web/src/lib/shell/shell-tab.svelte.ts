import { resolveDefaultLaunchTab, resolveHostPanelTab } from '@chronos/core';
import type { ReactiveChronosController } from '@chronos/ui-kit';

function pickFallbackTabId(controller: ReactiveChronosController): string {
	const tabs = controller.getSlots('shell.bottom-bar.tab');
	return resolveHostPanelTab(tabs, 'timetable')?.id ?? tabs[0]?.id ?? '';
}

export function createShellTabController(getController: () => ReactiveChronosController) {
	let activeTabId = $state('');
	let initialized = false;
	let defaultLaunchPending = false;

	function reconcileActiveTab(): void {
		if (!initialized) return;
		const controller = getController();
		const tabs = controller.getSlots('shell.bottom-bar.tab');

		if (defaultLaunchPending) {
			const defaultTab = resolveDefaultLaunchTab(tabs);
			if (defaultTab) {
				activeTabId = defaultTab.id;
				defaultLaunchPending = false;
				return;
			}
		}

		if (tabs.some((tab) => tab.id === activeTabId)) return;
		activeTabId = pickFallbackTabId(controller);
	}

	function init(): void {
		if (initialized) return;
		const controller = getController();
		const tabs = controller.getSlots('shell.bottom-bar.tab');
		const defaultTab = resolveDefaultLaunchTab(tabs);
		if (defaultTab) {
			activeTabId = defaultTab.id;
			defaultLaunchPending = false;
		} else {
			activeTabId = pickFallbackTabId(controller);
			defaultLaunchPending = true;
		}
		initialized = true;
		reconcileActiveTab();
	}

	function setActiveTab(id: string): void {
		activeTabId = id;
		defaultLaunchPending = false;
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
