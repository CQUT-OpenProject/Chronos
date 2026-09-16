export interface OverlayHistoryPort {
	pushOverlay(id: string): void;
	closeOverlay(id: string): void;
	dismissWithoutPop(id: string): void;
	onPopOverlay(handler: () => void): () => void;
}

export interface HistoryOverlaySync {
	syncOpenState(isOpen: boolean): void;
	skipNextHistoryBack(): void;
	dispose(): void;
}

export function createHistoryOverlaySync(options: {
	overlayId: string;
	isOpen: () => boolean;
	setOpen: (open: boolean) => void;
	port?: OverlayHistoryPort;
}): HistoryOverlaySync {
	let historyPushed = false;
	let closingFromPopstate = false;
	let skipNextBack = false;

	const unsubscribePop = options.port?.onPopOverlay(() => {
		if (!options.isOpen()) return;
		closingFromPopstate = true;
		options.setOpen(false);
		historyPushed = false;
		closingFromPopstate = false;
	});

	return {
		skipNextHistoryBack() {
			skipNextBack = true;
		},
		syncOpenState(isOpen: boolean) {
			if (isOpen) {
				if (!historyPushed) {
					if (options.port) {
						options.port.pushOverlay(options.overlayId);
					} else {
						history.pushState({ chronosOverlay: options.overlayId }, '', window.location.href);
					}
					historyPushed = true;
				}
				return;
			}

			if (historyPushed && !closingFromPopstate) {
				if (skipNextBack) {
					skipNextBack = false;
					if (options.port) {
						options.port.dismissWithoutPop(options.overlayId);
					}
				} else if (options.port) {
					options.port.closeOverlay(options.overlayId);
				} else {
					history.back();
				}
			}
			historyPushed = false;
		},
		dispose() {
			unsubscribePop?.();
			if (historyPushed && options.isOpen()) {
				closingFromPopstate = true;
				options.setOpen(false);
				historyPushed = false;
				closingFromPopstate = false;
			}
		}
	};
}
