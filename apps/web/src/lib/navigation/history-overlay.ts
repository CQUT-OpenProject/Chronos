import { pushState } from '$app/navigation';

export interface HistoryOverlaySync {
	syncOpenState(isOpen: boolean): void;
	skipNextHistoryBack(): void;
	dispose(): void;
}

export function createHistoryOverlaySync(options: {
	isOpen: () => boolean;
	setOpen: (open: boolean) => void;
}): HistoryOverlaySync {
	let historyPushed = false;
	let closingFromPopstate = false;
	let skipNextBack = false;

	function onPopState() {
		if (!options.isOpen()) return;
		closingFromPopstate = true;
		options.setOpen(false);
		historyPushed = false;
		closingFromPopstate = false;
	}

	window.addEventListener('popstate', onPopState);

	return {
		skipNextHistoryBack() {
			skipNextBack = true;
		},
		syncOpenState(isOpen: boolean) {
			if (isOpen) {
				if (!historyPushed) {
					pushState('', { chronosOverlay: 1 });
					historyPushed = true;
				}
				return;
			}

			if (historyPushed && !closingFromPopstate) {
				if (skipNextBack) {
					skipNextBack = false;
				} else {
					history.back();
				}
			}
			historyPushed = false;
		},
		dispose() {
			window.removeEventListener('popstate', onPopState);
			if (historyPushed && options.isOpen()) {
				closingFromPopstate = true;
				options.setOpen(false);
				historyPushed = false;
				closingFromPopstate = false;
			}
		}
	};
}
