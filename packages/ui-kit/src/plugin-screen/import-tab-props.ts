import type { ChronosUiController } from '../reactivity/chronos-ui-controller';

export interface ImportTabTransferController {
	state: {
		errorMessage: string | null;
	};
	previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean>;
}

export interface ImportTabComponentProps {
	controller?: ChronosUiController;
	transfer: ImportTabTransferController;
	onContinue: () => void;
}

export async function previewAndNotify(
	transfer: ImportTabTransferController,
	tabId: string,
	inputs: Record<string, unknown>,
	controller?: ChronosUiController
): Promise<boolean> {
	const ok = await transfer.previewWithSlot(tabId, inputs);
	if (!ok && transfer.state.errorMessage) {
		controller?.notify(transfer.state.errorMessage, 'error');
	}
	return ok;
}
