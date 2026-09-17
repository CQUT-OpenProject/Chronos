export interface OverlayHistoryPort {
	openOverlay(id: string, onDismiss: () => void): { close(): void; dispose(): void };
}
export interface HistoryOverlaySync {
	syncOpenState(isOpen: boolean): void;
	dispose(): void;
}
/** Component ancestry, independent of the browser's chronological record order. */
export const OVERLAY_LIFECYCLE_CONTEXT = Symbol('overlay-lifecycle');
const childrenByLifecycle = new WeakMap<HistoryOverlaySync, Set<() => void>>();

export function createHistoryOverlaySync(options: {
	overlayId: string;
	setOpen: (open: boolean) => void;
	port?: OverlayHistoryPort;
	parent?: HistoryOverlaySync;
}): HistoryOverlaySync {
	let handle: ReturnType<OverlayHistoryPort['openOverlay']> | undefined;
	let disposed = false;
	let open = false;
	const children = new Set<() => void>();
	const siblings = options.parent && childrenByLifecycle.get(options.parent);
	function cancelChildren() {
		for (const cancel of children) cancel();
	}
	function cancel() {
		if (!open) return;
		open = false;
		const closing = handle;
		handle = undefined;
		closing?.dispose();
		cancelChildren();
		options.setOpen(false);
	}
	const sync: HistoryOverlaySync = {
		syncOpenState(next) {
			if (disposed || next === open) return;
			open = next;
			if (next) {
				handle = options.port?.openOverlay(options.overlayId, () => {
					handle = undefined;
					cancel();
				});
			} else {
				const closing = handle;
				handle = undefined;
				closing?.close();
				cancelChildren();
			}
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			siblings?.delete(cancel);
			cancel();
			children.clear();
		}
	};
	childrenByLifecycle.set(sync, children);
	siblings?.add(cancel);
	return sync;
}
