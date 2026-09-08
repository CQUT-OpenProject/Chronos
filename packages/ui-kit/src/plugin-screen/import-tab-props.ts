import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';

export interface ImportTabTransferController {
	state: {
		errorMessage: string | null;
	};
	previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean>;
}

export interface ImportTabComponentProps {
	controller?: ReactiveChronosController;
	transfer: ImportTabTransferController;
	onContinue: () => void;
}

export async function previewAndNotify(
	transfer: ImportTabTransferController,
	tabId: string,
	inputs: Record<string, unknown>,
	controller?: ReactiveChronosController
): Promise<boolean> {
	const ok = await transfer.previewWithSlot(tabId, inputs);
	if (!ok && transfer.state.errorMessage) {
		controller?.notify(transfer.state.errorMessage, 'error');
	}
	return ok;
}
