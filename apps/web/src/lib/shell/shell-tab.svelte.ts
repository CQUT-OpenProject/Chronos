import { resolveDefaultLaunchTab, resolveHostPanelTab } from '@chronos/core';
import type { ReactiveChronosController } from '@chronos/ui-kit';
import { SvelteSet } from 'svelte/reactivity';

function pickFallbackTabId(controller: ReactiveChronosController): string {
	const tabs = controller.getSlots('shell.bottom-bar.tab');
	return resolveHostPanelTab(tabs, 'timetable')?.id ?? tabs[0]?.id ?? '';
}

export function createShellTabController(getController: () => ReactiveChronosController) {
	let activeTabId = $state('');
	const mountedTabIds = new SvelteSet<string>();
	let initialized = false;
	let defaultLaunchPending = false;

	function mountTab(id: string): void {
		if (!id) return;
		mountedTabIds.add(id);
	}

	function activateTab(id: string): void {
		activeTabId = id;
		mountTab(id);
	}

	function reconcileActiveTab(): void {
		if (!initialized) return;
		const controller = getController();
		const tabs = controller.getSlots('shell.bottom-bar.tab');

		if (defaultLaunchPending) {
			const defaultTab = resolveDefaultLaunchTab(tabs);
			if (defaultTab) {
				activateTab(defaultTab.id);
				defaultLaunchPending = false;
				return;
			}
		}

		if (tabs.some((tab) => tab.id === activeTabId)) return;
		activateTab(pickFallbackTabId(controller));
	}

	function init(): void {
		if (initialized) return;
		const controller = getController();
		const tabs = controller.getSlots('shell.bottom-bar.tab');
		const defaultTab = resolveDefaultLaunchTab(tabs);
		if (defaultTab) {
			activateTab(defaultTab.id);
			defaultLaunchPending = false;
		} else {
			activateTab(pickFallbackTabId(controller));
			defaultLaunchPending = true;
		}
		initialized = true;
		reconcileActiveTab();
	}

	function setActiveTab(id: string): void {
		activateTab(id);
		defaultLaunchPending = false;
	}

	function warmup(id: string): void {
		mountTab(id);
	}

	return {
		get activeTabId() {
			return activeTabId;
		},
		get mountedTabIds() {
			return mountedTabIds;
		},
		init,
		reconcileActiveTab,
		setActiveTab,
		warmup
	};
}

export type ShellTabController = ReturnType<typeof createShellTabController>;
