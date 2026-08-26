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
