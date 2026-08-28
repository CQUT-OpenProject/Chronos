const HISTORY_OVERLAY_STATE_KEY = 'chronosOverlay';

export interface HistoryOverlaySync {
	syncOpenState(isOpen: boolean): void;
	dispose(): void;
}

export function createHistoryOverlaySync(options: {
	isOpen: () => boolean;
	setOpen: (open: boolean) => void;
}): HistoryOverlaySync {
	let historyPushed = false;
	let closingFromPopstate = false;

	function onPopState() {
		if (!options.isOpen()) return;
		closingFromPopstate = true;
		options.setOpen(false);
		historyPushed = false;
		closingFromPopstate = false;
	}

	window.addEventListener('popstate', onPopState);

	return {
		syncOpenState(isOpen: boolean) {
			if (isOpen) {
				if (!historyPushed) {
					history.pushState({ [HISTORY_OVERLAY_STATE_KEY]: 1 }, '');
					historyPushed = true;
				}
				return;
			}

			if (historyPushed && !closingFromPopstate) {
				history.back();
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
